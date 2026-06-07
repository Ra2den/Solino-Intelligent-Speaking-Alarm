import type { AlarmSession } from "../models/alarm-session.model";
import alarmIcon from "/src/assets/alarm/icon-alarm.svg";

type AlarmRingingScreenProps = {
  session: AlarmSession;
  onStop: () => Promise<void>;
  onSnooze: () => Promise<void>;
};

export function AlarmRingingScreen({
  onStop,
  onSnooze,
}: AlarmRingingScreenProps) {
  // TODO: Werte aus session ableiten, sobald UI final ist
  const dateLabel = "Sonntag, 07. Juni";
  const timeLabel = "7:30";
  const alarmLabel = "Hochschule";
  const snoozeMinutes = 5;

  return (
    <div className="w-full h-full rounded-[50px] bg-black mix-blend-soft-light">
      <div className="flex flex-col w-full h-full pt-6.25 pb-6.25 ps-12.5 pe-12.5 rounded-[50px]">
        {/* Datum + Uhrzeit – zentriert */}
        <div className="flex flex-col items-center">
          <p className="text-white text-[40px] font-medium">{dateLabel}</p>
          <p className="text-white text-[100px] font-medium leading-none mt-2">
            {timeLabel}
          </p>
        </div>

        {/* Alarm-Label */}
        <div className="flex-1 flex flex-col items-center justify-center gap-2">
          <img src={alarmIcon} alt="" className="w-10 h-10" aria-hidden="true" />
          <p className="text-white text-[40px] font-medium">{alarmLabel}</p>
        </div>

        {/* Snooze + Stop */}
        <div className="flex flex-col gap-1">
          <div className="flex gap-4 w-full">
            <span className="flex-1 text-white text-[30px] text-center">
              +{snoozeMinutes}
            </span>
            <span className="flex-1" />
          </div>
          <div className="flex gap-4 w-full">
            <button
              onClick={onSnooze}
              className="flex-1 h-20 rounded-full bg-white text-black text-[40px] font-medium transition-opacity duration-300 hover:opacity-80"
            >
              Snooze
            </button>
            <button
              onClick={onStop}
              className="flex-1 h-20 rounded-full bg-white text-black text-[40px] font-medium transition-opacity duration-300 hover:opacity-80"
            >
              Stop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}