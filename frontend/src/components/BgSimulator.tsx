import { useEffect, useState, type ReactNode } from "react";
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
        // Weather fetching is handled in phase.util.ts
        setPhase(await getPhase());
        const next = await getNextTransition();
        const delay =
          next !== undefined ? next - Date.now() : getStartOfNextDay(Date.now()) - Date.now();

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
