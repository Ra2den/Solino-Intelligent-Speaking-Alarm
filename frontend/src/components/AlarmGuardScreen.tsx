import { useEffect, useState } from "react";
import { type AlarmSession } from "../models/alarm-session.model";
import { toDate } from "../utils/time.util";
import guardShield from "/src/assets/agent/guardshield.png";
import { useGuardModeDuration } from "../hooks/settings/useGuardModeDuration";

type AlarmGuardScreenProps = {
  session: AlarmSession;
  onPressureStart: (isPressed: boolean) => Promise<void>;
};

export function AlarmGuardScreen({
  session,
  onPressureStart,
}: AlarmGuardScreenProps) {
  const [now, setNow] = useState(new Date());

  // Live-Ticking jede Sekunde
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
  const totalRemainingSeconds = Math.max(0, Math.ceil(remainingMillis / 1000));
  const formattedRemaining = `${Math.floor(totalRemainingSeconds / 60)}:${(
    totalRemainingSeconds % 60
  )
    .toString()
    .padStart(2, "0")}`;

  // Gesamtdauer aus Settings (DB)
  const { data: guardDurationMinutes } = useGuardModeDuration();
  const totalDurationMillis =
    typeof guardDurationMinutes === "number"
      ? guardDurationMinutes * 60 * 1000
      : 60 * 1000; // Fallback: 1 Min falls Settings noch laden

  // Fortschritt (1 = voll, 0 = leer)
  const progress = Math.min(
    1,
    Math.max(0, remainingMillis / totalDurationMillis),
  );

  // SVG Circle Konfiguration
  const radius = 60;
  const stroke = 6;
  const circumference = 2 * Math.PI * radius;
  const dashoffset = -circumference * (1 - progress);

  // Datum + aktuelle Uhrzeit
  const dateLabel = now.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const timeLabel = now.toLocaleTimeString("de-DE", {
    hour: "numeric",
    minute: "2-digit",
  });

  // Toleranz-Hinweis
  const toleranceRemainingMillis = toleranceUntil
    ? Math.max(0, toleranceUntil.getTime() - now.getTime())
    : 0;
  const toleranceActive = toleranceRemainingMillis > 0;
  const toleranceSeconds = Math.ceil(toleranceRemainingMillis / 1000);

  return (
    <div className="w-full h-full rounded-[50px] bg-black mix-blend-soft-light">
      <div className="flex flex-col w-full h-full pt-6.25 pb-6.25 ps-12.5 pe-12.5 rounded-[50px]">
        {/* Datum + Uhrzeit – zentriert oben */}
        <div className="flex flex-col items-center">
          <p className="text-white text-[28px] font-medium">{dateLabel}</p>
          <p className="text-white text-[75px] font-medium leading-none mt-2">
            {timeLabel}
          </p>
        </div>

        {/* Kreis-Timer mit Schild */}
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <div className="relative w-[300px] h-[300px]">
            {/* Schild im Hintergrund */}
            <img
              src={guardShield}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-contain opacity-30"
            />
            {/* Kreis-Timer */}
            <svg
              className="relative w-full h-full -rotate-90"
              viewBox="0 0 200 200"
            >
              {/* Hintergrund-Kreis */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                stroke="white"
                strokeOpacity="0.2"
                strokeWidth={stroke}
                fill="none"
              />
              {/* Fortschritts-Kreis */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                stroke="white"
                strokeWidth={stroke}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashoffset}
                style={{ transition: "stroke-dashoffset 1s linear" }}
              />
            </svg>
            {/* Text in der Mitte */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-white text-[20px] font-medium opacity-90">
                Guard Mode
              </p>
              <p className="text-white text-[40px] font-medium leading-none mt-1">
                {formattedRemaining}
              </p>
            </div>
          </div>

          {/* Toleranz-Hinweis */}
          {toleranceActive ? (
            <p className="text-white text-[16px] opacity-70 text-center max-w-[20rem]">
              Toleranz aktiv: {toleranceSeconds}s bis Sensor wieder auslöst
            </p>
          ) : (
            <p className="text-white text-[16px] opacity-70 text-center max-w-[20rem]">
              Sensor bereit
            </p>
          )}
        </div>

        {/* Sensor-Button */}
        {!import.meta.env.VITE_HIDE_SIMULATE_PRESSURE && (
          <div className="flex flex-col gap-1">
            <div className="flex gap-4 w-full">
              <button
                onClick={() =>
                  onPressureStart(
                    session.pressure_started_at === null ? true : false,
                  )
                }
                className="flex-1 h-20 rounded-full bg-white text-black text-[32px] font-medium transition-opacity duration-300 hover:opacity-80"
              >
                {session.pressure_started_at === null
                  ? "Sensor betätigen"
                  : "Sensor loslassen"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}