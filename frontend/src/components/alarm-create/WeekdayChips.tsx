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
    <div>
      <div className="flex flex-row justify-center gap-3 w-full max-w-[700px]">
        {dayChips.map((day) => {
          const isActive = recurringDays?.includes(day.value) ?? false;

          return (
            <button
              key={day.value}
              className={`flex h-[90px] w-[90px] items-center justify-center bg-white px-2 py-1 text-[38px] leading-none font-bold transition-all duration-200 ${
                isActive
                  ? "rounded-full text-black"
                  : "rounded-full text-black opacity-50"
              }`}
              onClick={() => toggleDay(day.value)}
              type="button"
            >
              {day.label}
            </button>
          );
        })}
      </div>
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
