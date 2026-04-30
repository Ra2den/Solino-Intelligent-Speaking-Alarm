import { useQuery } from "@tanstack/react-query";
import { weatherService } from "../../services/weather.service";

export function useWeatherForecast() {
  return useQuery({
    queryKey: ["weather", "forecast"],
    queryFn: () => weatherService.getForecast(),
    refetchInterval: 10 * 60 * 1000, // less frequent
  });
}
