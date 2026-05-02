import { apiClient } from "./api-client";
import { type Alarm } from "../models/alarm/alarm.model";

class AlarmsService {
  private baseUrl = "/alarms";

  // Fetch all alarms
  async getAlarms(): Promise<Alarm[]> {
    try {
      return await apiClient.get(this.baseUrl);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("alarms.getAlarms error:", err.message);
      }
      throw err;
    }
  }

  // Fetch all active alarms
  async getActiveAlarms(): Promise<Array<Alarm>> {
    try {
      return await apiClient.get(`${this.baseUrl}/active`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("alarms.getActiveAlarms error:", err.message);
      }
      throw err;
    }
  }
  // Fetch alarm by ID
  async getAlarm(id: number): Promise<Alarm> {
    try {
      return await apiClient.get(`${this.baseUrl}/${id}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("alarms.getAlarm error:", err.message);
      }
      throw err;
    }
  }

  // Create a new alarm
  async createAlarm(alarm: Partial<Alarm>): Promise<Alarm> {
    try {
      return await apiClient.post(this.baseUrl, alarm);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("alarms.createAlarm error:", err.message);
      }
      throw err;
    }
  }

  // Toggle alarm status (activate/deactivate)
  async toggleAlarm(id: number): Promise<Alarm> {
    try {
      return await apiClient.get(`${this.baseUrl}/${id}/toggle`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("alarms.toggleAlarm error:", err.message);
      }
      throw err;
    }
  }

  // Update an existing alarm
  async updateAlarm(id: number, alarm: Partial<Alarm>): Promise<Alarm> {
    try {
      return await apiClient.put(`${this.baseUrl}/${id}`, alarm);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("alarms.updateAlarm error:", err.message);
      }
      throw err;
    }
  }

  // Delete an alarm by ID
  async deleteAlarm(id: number): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/${id}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("alarms.deleteAlarm error:", err.message);
      }
      throw err;
    }
  }
}

export const alarmsService = new AlarmsService();
