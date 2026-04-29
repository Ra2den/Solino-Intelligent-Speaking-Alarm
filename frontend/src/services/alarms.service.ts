import { apiClient } from "./api-client";
import { type Alarm } from "../models/alarm.model";

export class AlarmsService {
  private static baseUrl = "/alarms";

  // Fetch all alarms
  static async getAlarms(): Promise<Alarm[]> {
    try {
      return await apiClient.get(this.baseUrl);
    } catch (err: any) {
      console.error("alarms.getAlarms error:", err.message);
      throw err;
    }
  }

  // Fetch all active alarms
  static async getActiveAlarms(): Promise<Alarm[]> {
    try {
      return await apiClient.get(`${this.baseUrl}/active`);
    } catch (err: any) {
      console.error("alarms.getActiveAlarms error:", err.message);
      throw err;
    }
  }
  // Fetch alarm by ID
  static async getAlarm(id: number): Promise<Alarm> {
    try {
      return await apiClient.get(`${this.baseUrl}/${id}`);
    } catch (err: any) {
      console.error("alarms.getAlarm error:", err.message);
      throw err;
    }
  }

  // Create a new alarm
  static async createAlarm(alarm: Partial<Alarm>): Promise<Alarm> {
    try {
      return await apiClient.post(this.baseUrl, alarm);
    } catch (err: any) {
      console.error("alarms.createAlarm error:", err.message);
      throw err;
    }
  }

  // Toggle alarm status (activate/deactivate)
  static async toggleAlarm(id: number): Promise<Alarm> {
    try {
      return await apiClient.get(`${this.baseUrl}/${id}/toggle`);
    } catch (err: any) {
      console.error("alarms.toggleAlarm error:", err.message);
      throw err;
    }
  }

  // Update an existing alarm
  static async updateAlarm(id: number, alarm: Partial<Alarm>): Promise<Alarm> {
    try {
      return await apiClient.put(`${this.baseUrl}/${id}`, alarm);
    } catch (err: any) {
      console.error("alarms.updateAlarm error:", err.message);
      throw err;
    }
  }

  // Delete an alarm by ID
  static async deleteAlarm(id: number): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/${id}`);
    } catch (err: any) {
      console.error("alarms.deleteAlarm error:", err.message);
      throw err;
    }
  }
}
