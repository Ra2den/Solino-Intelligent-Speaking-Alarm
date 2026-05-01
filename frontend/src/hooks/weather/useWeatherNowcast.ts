// hooks/useWeatherNowcast.ts

import { useQuery } from "@tanstack/react-query";
import { weatherService } from "../../services/weather.service";

export function useWeatherNowcast() {
  return useQuery({
    queryKey: ["weather", "nowcast"],
    queryFn: () => weatherService.getNowcast(),
    refetchInterval: 2 * 60 * 1000, // refresh every 2 minutes
    staleTime: 60 * 1000,
  });
}