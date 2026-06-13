import type { AlarmSession } from "../models/alarm-session.model";
import alarmIcon from "/src/assets/alarm/icon-alarm.svg";
import { formatDay, formatTime, toDate } from "../utils/time.util";
import { useQuery } from "@tanstack/react-query";
import { settingsService } from "../services/settings.service";
import { SettingsKeySchema } from "../models/settings/settings.model";

type AlarmRingingScreenProps = {
  session: AlarmSession;
  onStop: () => Promise<void>;
  onSnooze: () => Promise<void>;
};

export function AlarmRingingScreen({
  session,
  onStop,
  onSnooze,
}: AlarmRingingScreenProps) {
  const { data: snoozeDuration } = useQuery({
    queryKey: ["setting", SettingsKeySchema.enum.SNOOZE_DURATION_MIN],
    queryFn: () =>
      settingsService.getSetting(SettingsKeySchema.enum.SNOOZE_DURATION_MIN),
  });

  return (
    <div className="w-full h-full rounded-[50px] bg-black mix-blend-soft-light">
      <div className="flex flex-col w-full h-full pt-6.25 pb-6.25 ps-12.5 pe-12.5 rounded-[50px] justify-between">
        {/* Datum + Uhrzeit – zentriert */}
        <div className="flex flex-col items-center">
          // TODO get date from
          <p className="text-white text-[40px] font-medium">
            {formatDay(toDate(session.started_at))}
          </p>
          <p className="text-white text-[100px] font-medium leading-none mt-2">
            {formatTime(toDate(session.started_at))}
          </p>
        </div>

        {/* Alarm-Label */}
        <div className="flex-1 flex flex-col items-center justify-center gap-2">
          <img
            src={alarmIcon}
            alt=""
            className="w-10 h-10"
            aria-hidden="true"
          />
          <p className="text-white text-[40px] font-medium">{session.label}</p>
        </div>

        {/* Snooze + Stop */}
        <div className="flex flex-col gap-1">
          <div className="flex gap-4 w-full">
            <span className="flex-1" />
          </div>
          <div className="flex flex-col gap-4 w-full">
            <button
              onClick={onSnooze}
              className="flex items-center justify-center gap-2 h-20 rounded-full bg-white text-black text-[40px] font-medium transition-opacity duration-300 hover:opacity-80"
            >
              Snooze
              <span className="text-[30px] text-center">+{snoozeDuration}</span>
            </button>
            <button
              onClick={onStop}
              className="h-20 rounded-full bg-white text-black text-[40px] font-medium transition-opacity duration-300 hover:opacity-80"
            >
              Stop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
