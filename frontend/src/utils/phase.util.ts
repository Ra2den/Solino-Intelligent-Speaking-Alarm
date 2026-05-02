import type { Phase } from "../models/simulator/phase.model.js";

export function getPhase(
  now: number,
  sunrise: number,
  sunset: number,
  transition: number,
): Phase {
  // Sunrise and sunset each own a symmetric transition window. Outside those
  // windows, the day phase sits between them and the rest is night.
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
  // These are the exact timestamps where the simulator should re-evaluate and
  // possibly switch to a different phase.
  const times = [
    sunrise - transition,
    sunrise + transition,
    sunset - transition,
    sunset + transition,
  ];

  return times.find((time) => time > now);
}
