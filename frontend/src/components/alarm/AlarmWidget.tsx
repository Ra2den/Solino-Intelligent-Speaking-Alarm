import { useEffect, useState, useCallback } from "react";
import { type Alarm } from "../../models/alarm/alarm.model";
import { AlarmCard } from "./AlarmCard";
import { alarmsService } from "../../services/alarms.service";
import { toMinutes } from "../../utils/time.util";
import { useAlarmSession } from "../../contexts/alarm-session/alarm-session.context";
import { AlarmSessionStatusSchema } from "../../models/alarm-session.model";

const MINUTES_PER_DAY = 24 * 60;

function getMinutesSinceMidnight(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

function getMinutesUntilAlarm(
  alarmTime: string,
  currentMinutesSinceMidnight: number,
): number {
  // If the alarm time has already passed today, we treat it as tomorrow's next alarm.
  return (
    (toMinutes(alarmTime) - currentMinutesSinceMidnight + MINUTES_PER_DAY) %
    MINUTES_PER_DAY
  );
}

// Helper to determine if an alarm is scheduled for 'today'.
// WeekdaySchema is an enum of "MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"
//now starts with 0 for Sunday and ends with 6 for Saturday
function isAlarmForToday(alarm: Alarm, now: Date): boolean {
  //get days of alarm as String
  const alarmDays = Array.isArray(alarm.recurring_days)
    ? alarm.recurring_days
    : [];

  //map String to index (0-6) where 0 is Sunday and 6 is Saturday
  const alarmIndex: number[] = alarmDays.map((value) =>
    value === "SUN"
      ? 0
      : value === "MON"
        ? 1
        : value === "TUE"
          ? 2
          : value === "WED"
            ? 3
            : value === "THU"
              ? 4
              : value === "FRI"
                ? 5
                : value === "SAT"
                  ? 6
                  : -1,
  );

  if (alarmIndex.length > 0) {
    const todayIndex = now.getDay(); // 0 (Sun) - 6 (Sat)
    return alarmIndex.includes(todayIndex);
  }
  return true;
}

function getClosestAlarm(activeAlarms: Alarm[], now: Date): Alarm {
  const currentMinutesSinceMidnight = getMinutesSinceMidnight(now);

  return [...activeAlarms].sort((a, b) => {
    // Alarms for today should come before alarms for the next day
    const aIsToday = isAlarmForToday(a, now) ? 0 : 1;
    const bIsToday = isAlarmForToday(b, now) ? 0 : 1;
    if (aIsToday !== bIsToday) return aIsToday - bIsToday;

    const minutesUntilA = getMinutesUntilAlarm(
      a.time,
      currentMinutesSinceMidnight,
    );
    const minutesUntilB = getMinutesUntilAlarm(
      b.time,
      currentMinutesSinceMidnight,
    );

    return minutesUntilA - minutesUntilB;
  })[0];
}

type AlarmWidgetProps = {
  onEdit?: (alarm: Alarm) => void;
  onDelete?: (alarmId: number) => void;
};

export default function AlarmWidget({ onEdit, onDelete }: AlarmWidgetProps) {
  const [closestAlarm, setClosestAlarm] = useState<Alarm>();
  const { currentAlarmSession } = useAlarmSession();

  const refreshClosestAlarm = useCallback(async (): Promise<void> => {
    const activeAlarms = await alarmsService.getActiveAlarms();
    const now = new Date();

    let closest =
      activeAlarms.length > 0 ? getClosestAlarm(activeAlarms, now) : undefined;

    if (
      currentAlarmSession?.status === AlarmSessionStatusSchema.enum.SNOOZED &&
      currentAlarmSession.snoozed_until
    ) {
      const snoozedUntilDate = new Date(currentAlarmSession.snoozed_until);
      const snoozedTimeStr = `${String(snoozedUntilDate.getHours()).padStart(2, "0")}:${String(
        snoozedUntilDate.getMinutes(),
      ).padStart(2, "0")}`;

      const snoozedAlarm: Alarm = {
        id: currentAlarmSession.alarm_id,
        time: snoozedTimeStr,
        label: currentAlarmSession.label
          ? `${currentAlarmSession.label}`
          : "Snoozed",
        active: true,
        recurring_days: null,
      };

      if (!closest) {
        closest = snoozedAlarm;
      } else {
        const currentMinutesSinceMidnight = getMinutesSinceMidnight(now);
        const closestMinutes = getMinutesUntilAlarm(
          closest.time,
          currentMinutesSinceMidnight,
        );
        const snoozedMinutes = getMinutesUntilAlarm(
          snoozedAlarm.time,
          currentMinutesSinceMidnight,
        );

        // If the closest alarm is not today, the snoozed alarm (which is today) takes precedence.
        // Otherwise, pick the one with the smaller minutes until alarm.
        if (
          !isAlarmForToday(closest, now) ||
          snoozedMinutes <= closestMinutes
        ) {
          closest = snoozedAlarm;
        }
      }
    }

    setClosestAlarm(closest);
  }, [currentAlarmSession]);

  useEffect(() => {
    void refreshClosestAlarm();
  }, [refreshClosestAlarm]);

  async function handleDeleteAlarm(): Promise<void> {
    if (!closestAlarm) return;

    try {
      await alarmsService.deleteAlarm(closestAlarm.id);
      onDelete?.(closestAlarm.id);
      await refreshClosestAlarm();
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("AlarmWidget delete error:", err.message);
      }
    }
  }

  function handleEditAlarm(): void {
    if (!closestAlarm) return;
    onEdit?.(closestAlarm);
  }

  return (
    <AlarmCard
      alarm={closestAlarm}
      isSnoozed={
        currentAlarmSession?.status === AlarmSessionStatusSchema.enum.SNOOZED
      }
      isWidget={true}
      onEdit={handleEditAlarm}
      onDelete={handleDeleteAlarm}
    ></AlarmCard>
  );
}
