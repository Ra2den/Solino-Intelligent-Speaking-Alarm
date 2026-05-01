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
    async function setup() {
      const sunrise = new Date(await weatherService.getSunrise()).getTime();
      const sunset = new Date(await weatherService.getSunset()).getTime();

      const now = Date.now();

      const TRANSITION = 30 * 60 * 1000;

      setPhase(getPhase(now, sunrise, sunset, TRANSITION));

      const next = getNextTransition(now, sunrise, sunset, TRANSITION);

      if (next) {
        const delay = next - now;
        setTimeout(() => {
          setup(); // neu berechnen
        }, delay);
      }
    }

    setup();
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
