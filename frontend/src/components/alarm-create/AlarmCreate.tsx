import {
  AlarmCreateSchema,
  AlarmSchema,
  type Alarm,
  type WeekdayArray,
} from "../../models/alarm/alarm.model";
import tagIcon from "../../assets/alarm-create/tag.svg";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useRef, useState } from "react";
import { SettingsRow } from "./SettingsRow";
import { WeekdayChips } from "./WeekdayChips";
import { ActionPill } from "./ActionPill";
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
      timeDigits: alarm?.time?.replace(":", "") ?? "",
      recurring_days: alarm?.recurring_days ?? null,
      label: alarm?.label ?? "Wecker 1",
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
      timeDigits: alarm?.time?.replace(":", "") ?? "",
      recurring_days: alarm?.recurring_days ?? null,
      label: alarm?.label ?? "Wecker 1",
    });

    // 3. Verbindung beim Schließen der Komponente sauber trennen
    return () => {
      if (recorderRef.current) {
        recorderRef.current.disconnect();
      }
    };
  }, [alarm, reset]);

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full h-[720px]"
      >
        <div className="flex-column items-center justify-center">
          <button
              onClick={onBack}
              className="flex justify-center items-center w-25 h-30 padding-16"
              aria-label="Zurück">
              <img src={backIcon} alt="" className="w-10 h-10" aria-hidden="true" />
          </button>

          <div className="flex flex-row h-[400px] items-center justify-around">
            {/* Time */}
            <div className="w-[640px]">
              <Controller
                control={control}
                name="timeDigits"
                render={({ field }) => {
                  const digits = normalizeDigits(field.value);
                  const { time } = parseTimeDigits(digits);
                  const validation = validateTimeDigits(digits);
                  const displayTime = time;

                  return (
                    <div className="flex height-full flex-col items-center justify-center gap-5">
                      {/* Uhrzeit */}
                      <div className="text-[75px] leading-none font-medium tracking-[-0.04em] max-md:text-[60px]">
                        {displayTime}
                      </div>
                      {(!validation.valid || formError) && (
                        <p className="px-1 text-sm font-medium text-red-600">
                          {validation.valid ? formError : validation.error}
                        </p>
                      )}
                      <div className="mt-auto flex justify-center">
                        <button 
                          className="rounded-full bg-white px-3.75 py-2.5 text-[20px] font-medium text-black"
                          onClick={() => {
                              setNumPadToggled(!numPadtoggled);
                            }}
                          type="button">{numPadtoggled ? "Routine wählen" : "Zeit wählen"}
                        </button>
                      </div>
                    </div>
                  );
                }}
              />
            </div>

            
            <div className="w-[640px]">
              
              {/* NUMPAD */}
              <div className={numPadtoggled ? "" : "hidden"}>
                <Controller
                    control={control}
                    name="timeDigits"
                    render={({ field }) => {
                      const digits = normalizeDigits(field.value);
                      return (
                        <NumPad
                          value={digits}
                          onChange={(nextDigits) => {
                            setFormError(""); //alten Fehler zurücksetzen, wenn sich die Eingabe ändert
                            field.onChange(nextDigits);
                          }}
                          onClear={() => {
                            setFormError("");
                            field.onChange("");
                          }}
                          onConfirm={() => undefined}
                        />
                      );
                    }}
                  />
                </div>
              
              {/* WEEKDAYS */}
              <div className={numPadtoggled ? "hidden" : "flex flex-col items-center justify-center gap-3"}>
                {/* Weekday */}
                <Controller
                  control={control}
                  name="recurring_days"
                  render={({ field }) => (
                    <div>
                      <WeekdayChips
                        recurringDays={field.value}
                        onChange={field.onChange}
                      />
                    </div>
                  )}
                />
                <div className="flex flex-col gap-1">
                  {/* <SettingsRow
                    icon={pauseIcon}
                    label="Schlummern"
                    topRounded={true}
                    trailing={plusIcon}
                  /> */}
                  <Controller
                    control={control}
                    name="label"
                    render={({ field }) => (
                      <div className="flex gap-3">
                        {isListening && (
                          <SettingsRow icon={tagIcon} label={"Hört zu..."} />
                        )}
                        {isProcessing && (
                          <SettingsRow icon={tagIcon} label={"Verarbeite..."} />
                        )}
                        {!isListening && !isProcessing && (
                          <SettingsRow icon={tagIcon} label={field.value} />
                        )}
                        <button
                          type="button"
                          className={`flex w-16 items-center justify-center bg-white/85 p-3.75 text-black rounded-[5px] ${isListening ? "mix-blend-normal" : "mix-blend-soft-light"} ${isProcessing ? "cursor-wait opacity-70" : ""}`}
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
                          {!isListening ? (
                            <img
                              src={micIcon}
                              alt=""
                              className="h-7.5 w-7.5 shrink-0"
                              aria-hidden="true"
                            />
                          ) : (
                            <img
                              src={micRedIcon}
                              alt=""
                              className="h-7.5 w-7.5 shrink-0"
                              aria-hidden="true"
                            />
                          )}
                        </button>
                      </div>
                    )}
                  />
                  {error && (
                    <p className="px-1 text-sm font-medium text-red-600">{error}</p>
                  )}
                  {/* <SettingsRow icon={bellIcon} label="Ton" bottomRounded={true} /> */}
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-auto flex justify-center pt-12.5">
                <ActionPill type="submit">Speichern</ActionPill>
            </div>
        </div>
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
