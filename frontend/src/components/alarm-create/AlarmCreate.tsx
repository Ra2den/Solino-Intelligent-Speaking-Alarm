import {
  AlarmCreateSchema,
  AlarmSchema,
  type Alarm,
  type WeekdayArray,
} from "../../models/alarm/alarm.model";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useRef, useState } from "react";
import { WeekdayChips } from "./WeekdayChips";
import { NumPad } from "./NumPad";
import { alarmsService } from "../../services/alarms.service";
import AlarmNameRecorder from "../../services/alarm-name-recorder";
import micIcon from "../../assets/alarm-create/mic.svg";
import micRedIcon from "../../assets/alarm-create/mic-red.svg";
import backIcon from "/src/assets/alarm/icon-back.svg";

type Inputs = {
  timeDigits: string;
  recurring_days: WeekdayArray;
  label: string;
};

type AlarmCreateProps = {
  alarm?: Partial<Alarm>;
  onCreate?: () => void;
  onBack?: () => void;
};

const normalizeDigits = (value = "") => value.replace(/\D/g, "").slice(0, 4);

const padTimeDigits = (value = "") => normalizeDigits(value).padEnd(4, "0");

function parseTimeDigits(value = "") {
  const padded = padTimeDigits(value);
  const hours = Number(padded.slice(0, 2));
  const minutes = Number(padded.slice(2, 4));

  return {
    hours,
    minutes,
    time: `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`,
  };
}

function validateTimeDigits(value = "") {
  const { hours, minutes } = parseTimeDigits(value);

  if (hours < 0 || hours > 23) {
    return { valid: false, error: "Ungültige Stunde" };
  }

  if (minutes < 0 || minutes > 59) {
    return { valid: false, error: "Ungültige Minute" };
  }

  return { valid: true };
}

export function AlarmCreate({ alarm, onCreate, onBack }: AlarmCreateProps) {
  const { handleSubmit, control, reset, setValue } = useForm<Inputs>({
    defaultValues: {
      timeDigits: alarm?.time?.replace(":", "") ?? "0700",
      recurring_days: alarm?.recurring_days ?? null,
      label: alarm?.label ?? "Wecker",
    },
  });
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [formError, setFormError] = useState<string>("");
  const recorderRef = useRef<AlarmNameRecorder | null>(null);
  const [numPadtoggled, setNumPadToggled] = useState<boolean>(false);

  useEffect(() => {
    // 1. Recorder-Instanz mit den drei Callbacks erstellen
    recorderRef.current = new AlarmNameRecorder(
      (listening: boolean) => setIsListening(listening),
      (processing: boolean) => setIsProcessing(processing),
      (text: string) => setValue("label", text, { shouldDirty: true }),
      (errMsg: string) => setError(errMsg),
    );

    // 2. WebSocket-Verbindung aufbauen
    recorderRef.current.connect();

    reset({
      timeDigits: alarm?.time?.replace(":", "") ?? "0700",
      recurring_days: alarm?.recurring_days ?? null,
      label: alarm?.label ?? "Wecker",
    });

    // 3. Verbindung beim Schließen der Komponente sauber trennen
    return () => {
      if (recorderRef.current) {
        recorderRef.current.disconnect();
      }
    };
  }, [alarm, reset, setValue]);

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="relative w-full h-180 flex flex-col"
      >
        {/* Top Action Bar */}
        <div className="relative flex justify-between items-center w-full px-6 py-8">
          <button
              type="button"
              onClick={onBack}
              className="flex justify-center items-center h-12 w-12"
              aria-label="Zurück">
              <img src={backIcon} alt="" className="w-10 h-10" aria-hidden="true" />
          </button>
          <div className="absolute left-1/2 -translate-x-1/2 text-2xl font-medium text-white mix-blend-soft-light pointer-events-none">
            {typeof alarm?.id === "number" ? "Wecker bearbeiten" : "Neuer Wecker"}
          </div>
          {numPadtoggled ? (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setNumPadToggled(false);
              }}
              className="flex justify-center items-center bg-white text-black px-10 py-5 rounded-[30px] font-bold text-2xl shadow-lg hover:bg-gray-100 transition-colors"
            >
              Fertig
            </button>
          ) : (
            <button
              type="submit"
              className="flex justify-center items-center bg-white text-black px-10 py-5 rounded-[30px] font-bold text-2xl shadow-lg hover:bg-gray-100 transition-colors"
            >
              Speichern
            </button>
          )}
        </div>

        {!numPadtoggled ? (
          <div className="flex flex-col items-center justify-center flex-1 gap-12 -mt-10">
            {/* Hero Element (Time) */}
            <Controller
              control={control}
              name="timeDigits"
              render={({ field }) => {
                const digits = normalizeDigits(field.value);
                const { time } = parseTimeDigits(digits);
                const validation = validateTimeDigits(digits);
                const displayTime = time;

                return (
                  <div className="flex flex-col items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setNumPadToggled(true)}
                      className="text-[120px] leading-none font-medium tracking-[-0.04em] hover:opacity-80 transition-opacity"
                      aria-label="Zeit ändern"
                    >
                      {displayTime}
                    </button>
                    <div className="h-6">
                      {(!validation.valid || formError) && (
                        <p className="px-1 text-[16px] font-medium text-red-500">
                          {validation.valid ? formError : validation.error}
                        </p>
                      )}
                    </div>
                  </div>
                );
              }}
            />

            {/* Secondary Settings */}
            <div className="flex flex-col items-center gap-8">
              <div className="flex flex-col items-center gap-2">
                <Controller
                  control={control}
                  name="label"
                  render={({ field }) => (
                    <button
                      type="button"
                      className={`flex items-center justify-center gap-4 bg-white/85 px-6 py-4 rounded-[20px] w-[450px] shadow-sm transition-all ${isListening ? "bg-white scale-105" : "mix-blend-soft-light"} ${isProcessing ? "cursor-wait opacity-70" : ""}`}
                      onClick={() => {
                        handleButtonClick();
                      }}
                      disabled={isProcessing}
                      aria-label={
                        isListening
                          ? "Aufnahme des Alarmnamens stoppen"
                          : isProcessing
                            ? "Alarmname wird verarbeitet"
                            : "Aufnahme des Alarmnamens starten"
                      }
                    >
                      <span className="text-[24px] font-medium text-black flex-1 text-center truncate">
                        {isListening
                          ? "Hört zu..."
                          : isProcessing
                            ? "Verarbeite..."
                            : field.value}
                      </span>
                      {!isListening ? (
                        <img
                          src={micIcon}
                          alt=""
                          className="h-8 w-8 shrink-0 opacity-80"
                          aria-hidden="true"
                        />
                      ) : (
                        <img
                          src={micRedIcon}
                          alt=""
                          className="h-8 w-8 shrink-0 animate-pulse"
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  )}
                />
                <div className="h-6 w-full flex justify-center">
                  {error && (
                    <p className="px-1 text-[16px] font-medium text-red-500">{error}</p>
                  )}
                </div>
              </div>

              <Controller
                control={control}
                name="recurring_days"
                render={({ field }) => (
                  <WeekdayChips
                    recurringDays={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-row items-center justify-center flex-1 gap-20 px-10 pb-20">
            {/* Left Side: Time */}
            <div className="flex-1 flex flex-col items-center justify-center">
              <Controller
                control={control}
                name="timeDigits"
                render={({ field }) => {
                  const digits = normalizeDigits(field.value);
                  const { time } = parseTimeDigits(digits);
                  const validation = validateTimeDigits(digits);
                  return (
                    <>
                      <div className="text-[140px] leading-none font-medium tracking-[-0.04em]">
                        {time}
                      </div>
                      <div className="h-6 mt-4">
                        {(!validation.valid || formError) && (
                          <p className="px-1 text-[20px] font-medium text-red-500">
                            {validation.valid ? formError : validation.error}
                          </p>
                        )}
                      </div>
                    </>
                  );
                }}
              />
            </div>

            {/* Right Side: NumPad */}
            <div className="flex-1 flex items-center justify-center">
              <Controller
                control={control}
                name="timeDigits"
                render={({ field }) => {
                  const digits = normalizeDigits(field.value);
                  return (
                    <NumPad
                      value={digits}
                      onChange={(nextDigits) => {
                        setFormError("");
                        field.onChange(nextDigits);
                      }}
                      onClear={() => {
                        setFormError("");
                        field.onChange("");
                      }}
                    />
                  );
                }}
              />
            </div>
          </div>
        )}
      </form>
    </>
  );

  function handleButtonClick() {
    if (!recorderRef.current) return;
    if (isProcessing) return;

    setError(""); // Alten Fehler zurücksetzen

    if (isListening) {
      recorderRef.current.stopRecording();
    } else {
      recorderRef.current.startRecording();
    }
  }

  async function onSubmit(data: Inputs): Promise<void> {
    const digits = normalizeDigits(data.timeDigits);
    const validation = validateTimeDigits(digits);

    if (!validation.valid) {
      setFormError(validation.error ?? "Ungültige Uhrzeit");
      return;
    }

    const { time } = parseTimeDigits(digits);
    setFormError("");

    if (typeof alarm?.id === "number") {
      // Update existing alarm
      const submittedAlarm = AlarmSchema.parse({
        id: alarm.id,
        time,
        recurring_days: data.recurring_days,
        label: data.label,
        active: alarm.active ?? true,
      });
      const updatedAlarm = await alarmsService.updateAlarm(
        alarm.id,
        submittedAlarm,
      );
      console.log("Alarm updated:", updatedAlarm);
    } else {
      const submittedAlarm = AlarmCreateSchema.parse({
        time,
        recurring_days: data.recurring_days,
        label: data.label,
      });

      // Logging
      const createdAlarm = await alarmsService.createAlarm(submittedAlarm);
      console.log("Alarm created:", createdAlarm);
    }
    onCreate?.();
  }
}

export default AlarmCreate;
