import type { Alarm } from "../../models/alarm/alarm.model";
import { RecurringDays } from "./RecurringDays";
import singleAlarmIcon from "/src/assets/alarm/icon-alarm-once.svg";
import recurringAlarmIcon from "/src/assets/alarm/icon-alarm.svg";

type AlarmCardProps = {
  alarm: Alarm;
  isWidget?: boolean;
};
export function AlarmCard({ alarm, isWidget }: AlarmCardProps) {
  const isRecurring = alarm.recurring_days !== null;
  return (
    <div
      className={`w-full h-full relative rounded-[50px] bg-black mix-blend-soft-light transition-opacity duration-300 ${
        !alarm.active ? "opacity-40" : ""
      }`}
    >
      <div className="flex flex-col justify-center w-full h-full pt-6.25 pb-6.25 ps-12.5 pe-12.5 rounded-[50px]">
        {/* Zeile 1: Name + Icon */}
        <div className="flex items-center justify-between w-full">
          <span className="text-white text-[40px] font-medium">
            {alarm.label}
          </span>
          <img
            src={isRecurring ? recurringAlarmIcon : singleAlarmIcon}
            alt=""
            className="w-7.5 h-7.5"
            aria-hidden="true"
          />
        </div>

        {/* Zeile 2: Time + Toggle */}
        <div className="flex items-center justify-between w-full mt-2">
          <div className="text-white text-[75px] font-medium leading-none">
            {alarm.time}
          </div>

          {!isWidget && (
            <button
              onClick={() => toggleAlarm}
              className="relative w-20 h-11 rounded-full bg-white transition-all duration-300"
              aria-label={
                alarm.active ? "Wecker deaktivieren" : "Wecker aktivieren"
              }
            >
              <span
                className={`absolute top-1/2 -translate-y-1/2 left-1.5 w-8.5 h-8.5 rounded-full bg-black transition-transform duration-300 ${
                  alarm.active ? "translate-x-8" : "translate-x-0"
                }`}
              />
            </button>
          )}
        </div>

        {/* Zeile 3: Wochentage (nur bei recurring) */}
        {isRecurring && (
          <RecurringDays recurring_days={alarm.recurring_days}></RecurringDays>
        )}
      </div>
    </div>
  );

  function toggleAlarm() {}
}
