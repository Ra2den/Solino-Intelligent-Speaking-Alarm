import type { Phase } from "../models/simulator/phase.model.js";

export function getPhase(
  now: number,
  sunrise: number,
  sunset: number,
  transition: number,
): Phase {
  const isSunrise =
    now >= sunrise - transition && now <= sunrise + transition;
  const isSunset = now >= sunset - transition && now <= sunset + transition;
  const isDay = now > sunrise + transition && now < sunset - transition;

  if (isSunrise) return "Sunrise";
  if (isSunset) return "Sunset";
  if (isDay) return "Day";
  return "Night";
}

export function getNextTransition(
  now: number,
  sunrise: number,
  sunset: number,
  transition: number,
) {
  const times = [
    sunrise - transition,
    sunrise + transition,
    sunset - transition,
    sunset + transition,
  ];

  return times.find((time) => time > now);
}
