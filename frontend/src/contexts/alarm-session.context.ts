import { createContext, useContext } from "react";
import { type AlarmSession } from "../models/alarm-session.model";

type AlarmSessionContextValue = {
  currentAlarmSession: AlarmSession | null;
  isRinging: boolean;
  stopAlarm: () => Promise<void>;
  snoozeAlarm: () => Promise<void>;
  isLoading: boolean;
};

export const AlarmSessionContext =
  createContext<AlarmSessionContextValue | null>(null);

export function useAlarmSession() {
  const context = useContext(AlarmSessionContext);

  if (!context) {
    throw new Error("useAlarmSession must be used within AlarmSessionProvider");
  }

  return context;
}
