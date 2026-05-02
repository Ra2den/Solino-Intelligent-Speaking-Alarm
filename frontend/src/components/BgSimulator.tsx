import { useEffect, useState, type ReactNode } from "react";
import { weatherService } from "../services/weather.service";
import type { Phase } from "../models/simulator/phase.model.js";
import { getNextTransition, getPhase } from "../utils/phase.util.js";

type BgSimulatorProps = {
  children: ReactNode;
};

export default function BgSimulator({ children }: BgSimulatorProps) {
  const [phase, setPhase] = useState<Phase>();

  useEffect(() => {
    let timeoutId: number | undefined;
    let isCancelled = false;

    const getStartOfNextDay = (now: number) => {
      const nextDay = new Date(now);
      nextDay.setHours(24, 0, 0, 0);
      return nextDay.getTime();
    };

    const scheduleNextRun = (delay: number) => {
      if (isCancelled || delay <= 0) return;

      timeoutId = window.setTimeout(() => {
        void setup();
      }, delay);
    };

    async function setup() {
      try {
        // Both timestamps are needed to compute the active phase and the next
        // boundary where the background should change again.
        const [sunriseTime, sunsetTime] = await Promise.all([
          weatherService.getSunrise(),
          weatherService.getSunset(),
        ]);

        if (isCancelled) return;

        const sunrise = new Date(sunriseTime).getTime();
        const sunset = new Date(sunsetTime).getTime();
        const now = Date.now();
        const transition = 30 * 60 * 1000;

        setPhase(getPhase(now, sunrise, sunset, transition));

        // Re-arm the timer for the next phase boundary. Once the final sunset
        // boundary has passed, wait until midnight and fetch the next day's
        // sunrise/sunset values.
        const next = getNextTransition(now, sunrise, sunset, transition);
        const delay =
          next !== undefined ? next - now : getStartOfNextDay(now) - now;

        scheduleNextRun(delay);
      } catch (error) {
        console.error("bgSimulator.setup error:", error);

        // Retry after a short delay so a transient API failure does not stop
        // the day/night cycle permanently.
        scheduleNextRun(60 * 1000);
      }
    }

    void setup();

    return () => {
      isCancelled = true;

      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  const getBgClass = () => {
    if (phase == "Sunrise")
      return "bg-gradient-to-b from-[#5C53A5] via-[#DC6F8E] to-[#F3E79B]";
    if (phase == "Day") return "bg-gradient-to-b from-[#78DDFA] to-[#C5F2FF]";
    if (phase == "Sunset")
      return "bg-gradient-to-t from-[#5C53A5] via-[#DC6F8E] to-[#F3E79B]";
    return "bg-gradient-to-b from-[#081449] to-[#4A468A]";
  };

  const bgClass = getBgClass();

  return <div className={`h-full w-full ${bgClass}`}>{children}</div>;
}
