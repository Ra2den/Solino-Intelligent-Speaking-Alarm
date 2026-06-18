import { type ReactNode, useMemo } from "react";
import { useAlarmSessionWebSocket } from "../hooks/useAlarmSessionWebSocket";
import { alarmSessionService } from "../services/alarm-session.service";
import { AlarmSessionContext } from "./alarm-session.context";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlarmSessionStatusSchema } from "../models/alarm-session.model";

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

  const pressureSensorMutation = useMutation({
    mutationFn: async (isPressed: boolean) => {
      if (!data) return null;
      return alarmSessionService.triggerPressureSensor(data.id, isPressed);
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
      isRinging: data?.status === AlarmSessionStatusSchema.enum.RINGING,
      isGuard: data?.status === AlarmSessionStatusSchema.enum.GUARD,
      isLoading,
      stopAlarm: async () => {
        await stopMutation.mutateAsync();
      },
      snoozeAlarm: async () => {
        await snoozeMutation.mutateAsync();
      },
      togglePressureSensor: async (isPressed: boolean) => {
        await pressureSensorMutation.mutateAsync(isPressed);
      },
    }),
    [data, isLoading, stopMutation, snoozeMutation, pressureSensorMutation],
  );
  return (
    <AlarmSessionContext.Provider value={value}>
      {children}
    </AlarmSessionContext.Provider>
  );
}
