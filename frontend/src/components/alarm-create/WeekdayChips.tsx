import {
  type Weekday,
  type WeekdayArray,
} from "../../models/alarm/alarm.model";

const dayChips: Array<{ label: string; value: Weekday }> = [
  { label: "MO", value: "MON" },
  { label: "DI", value: "TUE" },
  { label: "MI", value: "WED" },
  { label: "DO", value: "THU" },
  { label: "FR", value: "FRI" },
  { label: "SA", value: "SAT" },
  { label: "SO", value: "SUN" },
];

type WeekdayChipsProps = {
  recurringDays: WeekdayArray;
  onChange?: (days: WeekdayArray) => void;
};

export function WeekdayChips({ recurringDays, onChange }: WeekdayChipsProps) {
  return (
    <div>
      <div className="grid grid-cols-4 gap-3.5 w-[550px]">
        {dayChips.map((day) => {
          const isActive = recurringDays?.includes(day.value) ?? false;

          return (
            <button
              key={day.value}
              className={`flex h-25 w-30 items-center justify-center bg-white px-3 py-1.25 text-[25px] leading-none font-medium transition-all duration-200 ${
                isActive
                  ? "rounded-[20px] text-black"
                  : "rounded-[15px] text-black opacity-50"
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
