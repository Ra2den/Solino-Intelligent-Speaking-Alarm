import { WeekdayLabelWrapperArraySchema } from "../../models/alarm/weekday-label-wrapper.model";
import { type WeekdayArray } from "../../models/alarm/alarm.model";

const allDays = WeekdayLabelWrapperArraySchema.parse([
  { label: "Mo", value: "MON" },
  { label: "Di", value: "TUE" },
  { label: "Mi", value: "WED" },
  { label: "Do", value: "THU" },
  { label: "Fr", value: "FRI" },
  { label: "Sa", value: "SAT" },
  { label: "So", value: "SUN" },
]);

export function RecurringDays({
  recurring_days,
}: {
  recurring_days?: WeekdayArray;
}) {
  return (
    <div className="flex gap-3 mt-4">
      {allDays.map((day) => {
        const isActive = recurring_days?.includes(day.value);

        return (
          <div key={day.value} className="flex flex-col items-center gap-1">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isActive ? "bg-white" : "invisible"
              }`}
            />
            <span
              className={`text-[25px] font-medium ${
                isActive ? "text-white" : "text-white/50"
              }`}
            >
              {day.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
