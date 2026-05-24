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
import { Timepicker } from "timepicker-ui-react";
import { alarmsService } from "../../services/alarms.service";
import AlarmNameRecorder from "../../services/alarm-name-recorder";
import micIcon from "../../assets/mic.svg";
import micRedIcon from "../../assets/mic-red.svg";

type Inputs = {
  time: string;
  recurring_days: WeekdayArray;
  label: string;
};

type AlarmCreateProps = {
  alarm?: Partial<Alarm>;
  onCreate?: () => void;
};

export function AlarmCreate({ alarm, onCreate }: AlarmCreateProps) {
  const { handleSubmit, control, reset, setValue } = useForm<Inputs>({
    defaultValues: {
      time: alarm?.time ?? "00:00",
      recurring_days: alarm?.recurring_days ?? null,
      label: alarm?.label ?? "Wecker 1",
    },
  });
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const recorderRef = useRef<AlarmNameRecorder | null>(null);

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
      time: alarm?.time ?? "00:00",
      recurring_days: alarm?.recurring_days ?? null,
      label: alarm?.label ?? "Wecker 1",
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
        className="w-full h-full flex items-center justify-center"
      >
        <div className="flex gap-52">
          {/* Time */}
          <Controller
            control={control}
            name="time"
            render={({ field }) => (
              <div className="flex flex-col items-center justify-center gap-5">
                {/* Uhrzeit */}
                <div className="text-[75px] leading-none font-medium tracking-[-0.04em] max-md:text-[60px]">
                  {field.value ?? "00:00"}
                </div>
                <div className="relative">
                  <Timepicker
                    placeholder="Bearbeiten"
                    className={`rounded-full bg-white px-3.75 py-2.5 text-[20px] font-medium text-transparent caret-transparent transition-all duration-200 text-center placeholder:text-transparent`}
                    name="time"
                    value={field.value}
                    required
                    onUpdate={(data) =>
                      field.onChange(`${data.hour}:${data.minutes}`)
                    }
                    options={{
                      clock: { type: "24h" },
                      ui: {
                        enableSwitchIcon: false,
                      },
                    }}
                  />
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[20px] font-medium text-black">
                    Bearbeiten
                  </span>
                </div>
              </div>
            )}
          />
          <div className="flex flex-col gap-3">
            {/* Weekday */}
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
            <div className="relative z-10 mt-auto flex justify-center pt-12.5">
              <ActionPill type="submit">Speichern</ActionPill>
            </div>
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
    if (typeof alarm?.id === "number") {
      // Update existing alarm
      const submittedAlarm = AlarmSchema.parse({
        id: alarm.id,
        time: data.time,
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
        time: data.time,
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
