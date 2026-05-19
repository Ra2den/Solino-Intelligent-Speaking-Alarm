import { apiClient } from "./api-client";
import { type AlarmSession } from "../models/alarm-session.model";
class AlarmSessionService {
  private baseUrl = "/alarm-session";

  async getCurrentSession(): Promise<AlarmSession> {
    try {
      return await apiClient.get(this.baseUrl + "/current");
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("alarmSession.getCurrentSession error:", err.message);
      }
      throw err;
    }
  }

  async stopSession(sessionId: number): Promise<AlarmSession> {
    try {
      return await apiClient.post(`${this.baseUrl}/${sessionId}/stop`, null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("alarmSession.stopSession error:", err.message);
      }
      throw err;
    }
  }

  async snoozeSession(sessionId: number): Promise<AlarmSession> {
    try {
      return await apiClient.post(`${this.baseUrl}/${sessionId}/snooze`, null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("alarmSession.snoozeSession error:", err.message);
      }
      throw err;
    }
  }
}

export const alarmSessionService = new AlarmSessionService();
