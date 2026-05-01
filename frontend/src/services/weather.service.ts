import {
  WeatherNowcastSchema,
  type WeatherNowcast,
} from "../models/weather/weather-nowcast.model";
import {
  WeatherForecastSchema,
  type WeatherForecast,
} from "../models/weather/weather-forecast.model";
import { apiClient } from "./api-client";

class WeatherService {
  private baseUrl = "/weather";

  // Fetch current weather (nowcast)
  getNowcast = async (): Promise<WeatherNowcast> => {
    try {
      const data = await apiClient.get(`${this.baseUrl}/nowcast`);
      return WeatherNowcastSchema.parse(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("weather.getNowcast error:", err.message);
      }
      throw err;
    }
  };

  // Fetch 5-day forecast (3-hour intervals)
  getForecast = async (): Promise<WeatherForecast> => {
    try {
      const data = await apiClient.get(`${this.baseUrl}/forecast`);
      return WeatherForecastSchema.parse(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("weather.getForecast error:", err.message);
      }
      throw err;
    }
  };

  // Fetch today's sunrise time
  getSunrise = async (): Promise<string> => {
    try {
      const data: { time: string } = await apiClient.get(
        `${this.baseUrl}/sunrise`,
      );
      return data.time;
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("weather.getSunrise error:", err.message);
      }
      throw err;
    }
  };

  // Fetch today's sunset time
  getSunset = async (): Promise<string> => {
    try {
      const data: { time: string } = await apiClient.get(
        `${this.baseUrl}/sunset`,
      );
      return data.time;
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("weather.getSunset error:", err.message);
      }
      throw err;
    }
  };
}

export const weatherService = new WeatherService();
