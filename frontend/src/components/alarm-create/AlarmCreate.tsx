import type { Alarm, WeekdayArray } from "../../models/alarm/alarm.model";
import pauseIcon from "../../assets/alarm-create/pause.svg";
import tagIcon from "../../assets/alarm-create/tag.svg";
import bellIcon from "../../assets/alarm-create/bell.svg";
import plusIcon from "../../assets/alarm-create/plus.svg";
import { useForm, type SubmitHandler } from "react-hook-form";
import { SettingsRow } from "./SettingsRow";
import { WeekdayChips } from "./WeekdayChips";
import { ActionPill } from "./ActionPill";

type Inputs = {
  time: string;
  recurring_days: WeekdayArray;
  label: string;
};

type AlarmCreateProps = {
  alarm?: Partial<Alarm>;
};

export function AlarmCreate({ alarm }: AlarmCreateProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = (data) => console.log(data);

  return (
    // TODO recode layout without figma agent...
    <section
      className={
        "flex h-full w-full flex-col overflow-hidden rounded-[50px] bg-black px-6.25 pb-12.5 pt-6.25 text-white mix-blend-soft-light"
      }
    >
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-white/4 via-transparent to-[#ffb14d]/8" />

      <div className="relative z-10 flex items-center justify-between gap-4">
        <div className="text-[75px] leading-none font-medium tracking-[-0.04em] max-md:text-[60px]">
          {alarm?.time ?? "00:00"}
        </div>
        <ActionPill muted={true} align="left">
          Bearbeiten
        </ActionPill>
      </div>
      <WeekdayChips recurringDays={alarm?.recurring_days ?? null} />
      <div className="z-10 mt-6.25 flex flex-col gap-1.25">
        <form onSubmit={handleSubmit(onSubmit)}>
          <SettingsRow
            icon={pauseIcon}
            label="Schlummern"
            topRounded={true}
            trailing={plusIcon}
          />
          <SettingsRow icon={tagIcon} label="Name" />
          <SettingsRow icon={bellIcon} label="Ton" bottomRounded={true} />
        </form>
      </div>

      <div className="relative z-10 mt-auto flex justify-center pt-12.5">
        <ActionPill>Speichern</ActionPill>
      </div>
    </section>
  );
}

export default AlarmCreate;
