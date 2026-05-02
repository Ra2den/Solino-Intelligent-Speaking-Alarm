import type { Weekday } from "../models/alarm.model";

type AlarmWidgetProps = {
  name: string;
  time: string;
  variant: "recurring" | "one-time";
  days?: Weekday[];
  active?: boolean;
  onToggle?: (active: boolean) => void;
};

const allDays: Weekday[] = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

export default function AlarmWidget({
  name,
  time,
  variant,
  days = [],
  active = true,
  onToggle,
}: AlarmWidgetProps) {
  return (
    <div
      className={`w-full h-full relative rounded-[50px] bg-black mix-blend-soft-light transition-opacity duration-300 ${!active ? "opacity-40" : ""
        }`}
    >
      <div className="flex flex-col justify-center w-full h-full pt-6.25 pb-6.25 ps-12.5 pe-12.5 rounded-[50px]">
        {/* Zeile 1: Name + Icon */}
        <div className="flex items-center justify-between w-full">
          <span className="text-white text-[40px] font-medium">{name}</span>
          <img
            src={
              variant === "recurring"
                ? "src/assets/icon-alarm.svg"
                : "src/assets/icon-alarm-once.svg"
            }
            alt=""
            className="w-7.5 h-7.5"
            aria-hidden="true"
          />
        </div>

        {/* Zeile 2: Time + Toggle */}
        <div className="flex items-center justify-between w-full mt-2">
          <div className="text-white text-[75px] font-medium leading-none">
            {time}
          </div>

          <button
            onClick={() => onToggle?.(!active)}
            className="relative w-20 h-11 rounded-full bg-white transition-all duration-300"
            aria-label={active ? "Wecker deaktivieren" : "Wecker aktivieren"}
          >
            <span
              className={`absolute top-1/2 -translate-y-1/2 left-1.5 w-8.5 h-8.5 rounded-full bg-black transition-transform duration-300 ${active ? "translate-x-8" : "translate-x-0"
                }`}
            />
          </button>
        </div>

        {/* Zeile 3: Wochentage (nur bei recurring) */}
        {variant === "recurring" && (
          <div className="flex gap-3 mt-4">
            {allDays.map((day) => {
              const isActive = days.includes(day);

              return (
                <div key={day} className="flex flex-col items-center gap-1">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-white" : "invisible"
                      }`}
                  />
                  <span
                    className={`text-[25px] font-medium ${isActive ? "text-white" : "text-white/50"
                      }`}
                  >
                    {day}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}