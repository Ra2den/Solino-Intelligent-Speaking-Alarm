import { type ReactNode, useMemo } from "react";
import { useAlarmSessionWebSocket } from "../hooks/useAlarmSessionWebSocket";
import { alarmSessionService } from "../services/alarm-session.service";
import { AlarmSessionContext } from "./alarm-session.context";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type AlarmSessionProviderProps = {
  client: ReturnType<typeof useQueryClient>;
  children: ReactNode;
};

export function AlarmSessionProvider({
  children,
  client,
}: AlarmSessionProviderProps) {
  const queryClient = client;
  const { data, setData, isLoading } = useAlarmSessionWebSocket();

  const stopMutation = useMutation({
    mutationFn: async () => {
      if (!data) return null;
      return alarmSessionService.stopSession(data.id);
    },
    onSuccess: (updatedSession) => {
      setData(updatedSession);
      void queryClient.invalidateQueries({
        queryKey: ["alarm-session", "current"],
      });
    },
  });

  const snoozeMutation = useMutation({
    mutationFn: async () => {
      if (!data) return null;
      return alarmSessionService.snoozeSession(data.id);
    },
    onSuccess: (updatedSession) => {
      setData(updatedSession);
      void queryClient.invalidateQueries({
        queryKey: ["alarm-session", "current"],
      });
    },
  });

  const value = useMemo(
    () => ({
      currentAlarmSession: data ?? null,
      isRinging: data?.status === "RINGING",
      isLoading,
      stopAlarm: async () => {
        await stopMutation.mutateAsync();
      },
      snoozeAlarm: async () => {
        await snoozeMutation.mutateAsync();
      },
    }),
    [data, isLoading, stopMutation, snoozeMutation],
  );
  return (
    <AlarmSessionContext.Provider value={value}>
      {children}
    </AlarmSessionContext.Provider>
  );
}
