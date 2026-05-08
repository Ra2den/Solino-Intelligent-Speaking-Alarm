import type { Phase } from "../models/simulator/phase.model.js";
import { weatherService } from "../services/weather.service.js";

//Auslagerung von fetchWeather in eine zentrale Component
async function getWeatherData() {
  const actualSunrise = new Date(await weatherService.getSunrise()).getTime();
  const actualSunset = new Date(await weatherService.getSunset()).getTime();
  const actualNow = Date.now();
  const actualTransition = 30 * 60 * 1000;
  // Sunrise and sunset each own a symmetric transition window. Outside those
  // windows, the day phase sits between them and the rest is night.
  return {
    sunrise: actualSunrise,
    sunset: actualSunset,
    now: actualNow,
    transition: actualTransition,
  };
}

export async function getPhase(): Promise<Phase> {
  const {
    sunrise: s,
    sunset: ss,
    now: n,
    transition: t,
  } = await getWeatherData();

  const isSunrise = n >= s - t && n <= s + t;
  const isSunset = n >= ss - t && n <= ss + t;
  const isDay = n > s + t && n < ss - t;

  if (isSunrise) return "Sunrise";
  if (isSunset) return "Sunset";
  if (isDay) return "Day";
  return "Night";
}

export async function getNextTransition(): Promise<number | undefined> {
  // These are the exact timestamps where the simulator should re-evaluate and
  // possibly switch to a different phase.

  const {
    sunrise: s,
    sunset: ss,
    now: n,
    transition: t,
  } = await getWeatherData();

  const times = [s - t, s + t, ss - t, ss + t];

  return times.find((time) => time > n);
}
