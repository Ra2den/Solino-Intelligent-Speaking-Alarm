import { useQuery } from "@tanstack/react-query";
import { alarmSessionService } from "../services/alarm-session.service";

export function useCurrentAlarmSession() {
  return useQuery({
    queryKey: ["alarm-session", "current"],
    queryFn: () => alarmSessionService.getCurrentSession(),
    refetchInterval: 1000,
    staleTime: 0,
  });
}
