import {
  type Weekday,
  type WeekdayArray,
} from "../../models/alarm/alarm.model";

const dayChips: Array<{ label: string; value: Weekday }> = [
  { label: "M", value: "MON" },
  { label: "D", value: "TUE" },
  { label: "M", value: "WED" },
  { label: "D", value: "THU" },
  { label: "F", value: "FRI" },
  { label: "S", value: "SAT" },
  { label: "S", value: "SUN" },
];

type WeekdayChipsProps = {
  recurringDays: WeekdayArray;
  onChange?: (days: WeekdayArray) => void;
};

export function WeekdayChips({ recurringDays, onChange }: WeekdayChipsProps) {
  return (
    <div className="mt-6.25 flex items-center justify-between gap-2.5">
      {dayChips.map((day) => {
        const isActive = recurringDays?.includes(day.value) ?? false;

        return (
          <button
            key={day.value}
            className={`flex h-9.75 w-11.75 items-center justify-center bg-white px-3 py-1.25 text-[25px] leading-none font-medium transition-all duration-200 ${
              isActive
                ? "rounded-[20px] text-black"
                : "rounded-[10px] text-black opacity-50"
            }`}
            onClick={() => toggleDay(day.value)}
            type="button"
          >
            {day.label}
          </button>
        );
      })}
    </div>
  );

  function toggleDay(day: Weekday) {
    const currentDays = recurringDays ?? [];
    const nextDays = currentDays.includes(day)
      ? currentDays.filter((currentDay) => currentDay !== day)
      : [...currentDays, day];

    onChange?.(nextDays.length > 0 ? nextDays : null);
  }
}
