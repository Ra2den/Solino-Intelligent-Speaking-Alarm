import { z } from "zod";

export const WeatherConditionSchema = z.enum([
  "Thunderstorm",
  "Drizzle",
  "Rain",
  "Clear",
  "Clouds",
]);

export const WeatherNowcastSchema = z.object({
  time: z.string(),
  temperature: z.number(),
  feels_like: z.number(),
  weather_condition: WeatherConditionSchema,
  weather_description: z.string(),
});

export type WeatherNowcast = z.infer<typeof WeatherNowcastSchema>;
export type WeatherCondition = z.infer<typeof WeatherConditionSchema>;