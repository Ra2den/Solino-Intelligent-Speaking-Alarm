import "./AlarmWidget.css";
import alarmIcon from "../assets/icon-alarm.svg";

export type Weekday = "Mo" | "Di" | "Mi" | "Do" | "Fr" | "Sa" | "So";

interface AlarmWidgetProps {
  name: string;
  time: string;
  days?: Weekday[];
  active?: boolean;
}

const allDays: Weekday[] = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

export function AlarmWidget({
  name,
  time,
  days = [],
  active = true,
}: AlarmWidgetProps) {
  return (
    <div className={`alarm-widget ${!active ? "alarm-widget--inactive" : ""}`}>
      <div className="alarm-widget__header">
        <span className="alarm-widget__name">{name}</span>
        <span className="alarm-widget__icon" aria-hidden="true">
            <img src={alarmIcon} alt="" width={20} height={20} />
        </span>
      </div>

      <div className="alarm-widget__time">{time}</div>

      <div className="alarm-widget__days">
        {allDays.map((day) => {
          const isActive = days.includes(day);

          return (
            <div
              key={day}
              className={`alarm-widget__day ${
                isActive
                  ? "alarm-widget__day--active"
                  : "alarm-widget__day--inactive"
              }`}
            >
              <span
                className={`alarm-widget__dot ${
                  isActive
                    ? "alarm-widget__dot--visible"
                    : "alarm-widget__dot--hidden"
                }`}
              />
              <span className="alarm-widget__day-label">{day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}