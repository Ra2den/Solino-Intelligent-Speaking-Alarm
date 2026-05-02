import { useEffect, useState } from "react";
import { type Alarm } from "../../models/alarm/alarm.model";
import { AlarmCard } from "./AlarmCard";
import { alarmsService } from "../../services/alarms.service";
import { toMinutes } from "../../utils/time.util";

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

function getClosestAlarm(activeAlarms: Alarm[], now: Date): Alarm {
  const currentMinutesSinceMidnight = getMinutesSinceMidnight(now);

  return [...activeAlarms].sort((a, b) => {
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

export default function AlarmWidget() {
  const [closestAlarm, setClosestAlarm] = useState<Alarm>();

  useEffect(() => {
    alarmsService.getActiveAlarms().then((activeAlarms) => {
      setClosestAlarm(getClosestAlarm(activeAlarms, new Date()));
    });
  }, []);

  return <AlarmCard alarm={closestAlarm} isWidget={true}></AlarmCard>;
}
