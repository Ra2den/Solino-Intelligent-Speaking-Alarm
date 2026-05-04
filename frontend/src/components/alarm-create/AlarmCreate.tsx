import {
  AlarmCreateSchema,
  AlarmSchema,
  type Alarm,
  type WeekdayArray,
} from "../../models/alarm/alarm.model";
import pauseIcon from "../../assets/alarm-create/pause.svg";
import tagIcon from "../../assets/alarm-create/tag.svg";
import bellIcon from "../../assets/alarm-create/bell.svg";
import plusIcon from "../../assets/alarm-create/plus.svg";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { SettingsRow } from "./SettingsRow";
import { WeekdayChips } from "./WeekdayChips";
import { ActionPill } from "./ActionPill";
import { Timepicker } from "timepicker-ui-react";
import { useEffect, useState } from "react";
import { alarmsService } from "../../services/alarms.service";
import { AlarmCard } from "../alarm/AlarmCard";

type Inputs = {
  time: string;
  recurring_days: WeekdayArray;
  label: string;
};

type AlarmCreateProps = {
  alarm?: Partial<Alarm>;
};

export function AlarmCreate({ alarm }: AlarmCreateProps) {
  const { handleSubmit, control } = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = (data) => {
    const alarm = AlarmCreateSchema.parse({
      time: data.time,
      recurring_days: data.recurring_days,
      label: "test",
    });
    alarmsService.createAlarm(alarm);
  };
  const timepickerContainerId = "alarm-create-timepicker-inline";

  // Temp
  const [alarms, setAlarms] = useState<Alarm[]>();

  useEffect(() => {
    alarmsService.getAlarms().then((data) => {
      setAlarms(data);
      console.log(data);
    });
  }, []);

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="flex">
        <Controller
          control={control}
          defaultValue={alarm?.time}
          name="time"
          render={({ field }) => (
            <div className="space-y-4">
              <Timepicker
                className="sr-only"
                name="time"
                required
                value={field.value}
                onUpdate={(data) =>
                  field.onChange(`${data.hour}:${data.minutes}`)
                }
                options={{
                  ui: {
                    enableSwitchIcon: false,
                    inline: {
                      enabled: true,
                      containerId: timepickerContainerId,
                      autoUpdate: true,
                    },
                  },
                }}
              />
              <div
                className="min-h-[320px] rounded-[32px] bg-white/6 p-4"
                id={timepickerContainerId}
              />
              {/* Uhrzeit */}
              <div className="text-[75px] leading-none font-medium tracking-[-0.04em] max-md:text-[60px]">
                {field.value ?? "00:00"}
              </div>
            </div>
          )}
        />
        <div>
          <Controller
            control={control}
            defaultValue={alarm?.recurring_days ?? null}
            name="recurring_days"
            render={({ field }) => (
              <WeekdayChips
                recurringDays={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <SettingsRow
            icon={pauseIcon}
            label="Schlummern"
            topRounded={true}
            trailing={plusIcon}
          />
          <SettingsRow icon={tagIcon} label="Name" />
          <SettingsRow icon={bellIcon} label="Ton" bottomRounded={true} />
          <div className="relative z-10 mt-auto flex justify-center pt-12.5">
            <ActionPill type="submit">Speichern</ActionPill>
          </div>
        </div>
      </form>
      {alarms?.map((alarm) => {
        <AlarmCard alarm={alarm}></AlarmCard>;
      })}
    </>
  );
}

export default AlarmCreate;
