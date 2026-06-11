import { useEffect, useState } from "react";
import { type AlarmSession } from "../models/alarm-session.model";
import { toDate } from "../utils/time.util";

type AlarmGuardScreenProps = {
  session: AlarmSession;
  onPressureStart: (isPressed: boolean) => Promise<void>;
};

export function AlarmGuardScreen({
  session,
  onPressureStart,
}: AlarmGuardScreenProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const expiresAt = session.guard_expires_at
    ? toDate(session.guard_expires_at)
    : null;
  const toleranceUntil = session.guard_tolerance_until
    ? toDate(session.guard_tolerance_until)
    : null;

  const remainingMillis = expiresAt ? expiresAt.getTime() - now.getTime() : 0;
  const remainingMinutes = Math.max(0, Math.ceil(remainingMillis / 60000));
  const totalRemainingSeconds = Math.max(0, Math.ceil(remainingMillis / 1000));
  const formattedRemaining = `${Math.floor(totalRemainingSeconds / 60)}:${(totalRemainingSeconds % 60).toString().padStart(2, "0")}`;

  const toleranceRemainingMillis = toleranceUntil
    ? Math.max(0, toleranceUntil.getTime() - now.getTime())
    : 0;
  const toleranceActive = toleranceRemainingMillis > 0;
  const toleranceSeconds = Math.ceil(toleranceRemainingMillis / 1000);

  return (
    <div className="w-full h-full rounded-[50px] bg-black mix-blend-soft-light">
      <div className="flex flex-col w-full h-full pt-6.25 pb-6.25 ps-12.5 pe-12.5 rounded-[50px] justify-between">
        <div className="flex flex-col items-center gap-3">
          <p className="text-white text-[28px] font-semibold">
            Guard Mode aktiv
          </p>
          <p className="text-white text-[20px] text-center max-w-[25rem]">
            Der Alarm wurde gestoppt. Für die nächsten {remainingMinutes}{" "}
            Minuten bleibt der Schutz aktiv.
          </p>
          <p className="text-white text-[18px] opacity-70">
            {session.label ?? "Wecker"}
          </p>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="rounded-3xl border border-white/20 bg-white/10 p-6 text-center">
            <p className="text-white text-[50px] font-semibold">
              {formattedRemaining}
            </p>
            <p className="text-white text-[18px] opacity-70">
              Zeit verbleibend
            </p>
          </div>
          {toleranceActive ? (
            <p className="text-white text-[18px] opacity-75">
              Toleranz aktiv: {toleranceSeconds} Sekunden, bevor der Sensor
              wieder auslöst.
            </p>
          ) : (
            <p className="text-white text-[18px] opacity-75">
              Sensor bereit: Bei neuem Betreten des Bettes wird der Alarm erneut
              ausgelöst.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-4 w-full">
          <button
            onClick={() =>
              onPressureStart(
                session.pressure_started_at === null ? true : false,
              )
            }
            className="h-20 rounded-full bg-white text-black text-[32px] font-medium transition-opacity duration-300 hover:opacity-80"
          >
            {session.pressure_started_at === null
              ? "Sensor betätigen"
              : "Sensor loslassen"}
          </button>
        </div>
      </div>
    </div>
  );
}
