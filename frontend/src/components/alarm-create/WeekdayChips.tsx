import { type WeekdayArray } from "../../models/alarm/alarm.model";
import { type Weekday } from "../../models/alarm/alarm.model";

const dayChips: Array<{ label: string; value: Weekday }> = [
  { label: "M", value: "MON" },
  { label: "D", value: "TUE" },
  { label: "M", value: "WED" },
  { label: "D", value: "THU" },
  { label: "F", value: "FRI" },
  { label: "S", value: "SAT" },
  { label: "S", value: "SUN" },
];

export function WeekdayChips({
  recurringDays,
}: {
  recurringDays: WeekdayArray;
}) {
  return (
    <div className="mt-6.25 flex items-center justify-between gap-2.5">
      {dayChips.map((day) => {
        const isActive = recurringDays?.includes(day.value) ?? false;

        return (
          <button
            key={day.value}
            className={`flex h-9.75 w-11.75 items-center justify-center bg-white px-3 py-1.25 text-[25px] leading-none font-medium transition-all duration-200 ${
              isActive
                ? "rounded-[20px] text-[#cf375f]"
                : "rounded-[10px] text-[#cf375f] opacity-50"
            }`}
            type="button"
          >
            {day.label}
          </button>
        );
      })}
    </div>
  );
}
