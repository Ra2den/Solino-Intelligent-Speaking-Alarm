import {
  AlarmCreateSchema,
  AlarmSchema,
  type Alarm,
  type WeekdayArray,
} from "../../models/alarm/alarm.model";
import tagIcon from "../../assets/alarm-create/tag.svg";
import { Controller, useForm } from "react-hook-form";
import { useEffect } from "react";
import { SettingsRow } from "./SettingsRow";
import { WeekdayChips } from "./WeekdayChips";
import { ActionPill } from "./ActionPill";
import { Timepicker } from "timepicker-ui-react";
import { alarmsService } from "../../services/alarms.service";

type Inputs = {
  time: string;
  recurring_days: WeekdayArray;
  label: string;
};

type AlarmCreateProps = {
  alarm?: Partial<Alarm>;
};

export function AlarmCreate({ alarm }: AlarmCreateProps) {
  const { handleSubmit, control, reset } = useForm<Inputs>({
    defaultValues: {
      time: alarm?.time ?? "00:00",
      recurring_days: alarm?.recurring_days ?? null,
      label: alarm?.label ?? "Wecker 1",
    },
  });

  useEffect(() => {
    reset({
      time: alarm?.time ?? "00:00",
      recurring_days: alarm?.recurring_days ?? null,
      label: alarm?.label ?? "Wecker 1",
    });
  }, [alarm, reset]);

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
                <Timepicker
                  placeholder="Bearbeiten"
                  className={`rounded-full bg-white px-3.75 py-2.5 text-[20px] font-medium text-black transition-all duration-200 text-center`}
                  name="time"
                  required
                  value={field.value}
                  onUpdate={(data) =>
                    field.onChange(`${data.hour}:${data.minutes}`)
                  }
                  options={{
                    ui: {
                      enableSwitchIcon: false,
                    },
                  }}
                />
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
                  <SettingsRow icon={tagIcon} label={field.value} />
                )}
              />
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
      return;
    }
    const submittedAlarm = AlarmCreateSchema.parse({
      time: data.time,
      recurring_days: data.recurring_days,
      label: data.label,
    });

    // Logging
    const createdAlarm = await alarmsService.createAlarm(submittedAlarm);
    console.log("Alarm created:", createdAlarm);
  }
}

export default AlarmCreate;
