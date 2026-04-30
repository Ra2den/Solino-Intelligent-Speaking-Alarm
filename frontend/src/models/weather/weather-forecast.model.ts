import { WeatherNowcastSchema } from "./../weather/weather-nowcast.model";
import { z } from "zod";

export const WeatherForecastSchema = z.object({
  forecast: z.array(WeatherNowcastSchema),
});

export type WeatherForecast = z.infer<typeof WeatherForecastSchema>;
