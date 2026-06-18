import { apiClient } from "./api-client";
import {
  type SettingsItem,
  type SettingsCategory,
  type SettingsKey,
} from "../models/settings/settings.model.ts";

class SettingsService {
  private baseUrl = "/settings";

  // Fetch all settings
  async getAllSettings(): Promise<SettingsItem[]> {
    try {
      return await apiClient.get(this.baseUrl);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("settings.getAllSettings error:", err.message);
      }
      throw err;
    }
  }

  // Fetch all settings for a specific category
  async getSettingsByCategory(
    category: SettingsCategory,
  ): Promise<SettingsItem[]> {
    try {
      return await apiClient.get(`${this.baseUrl}/category/${category}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("settings.getSettingsByCategory error:", err.message);
      }
      throw err;
    }
  }

  // Fetch the value of a specific setting by key
  async getSetting(
    key: SettingsKey,
  ): Promise<string | number | boolean | null> {
    try {
      return await apiClient.get(`${this.baseUrl}/${key}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("settings.getSetting error:", err.message);
      }
      throw err;
    }
  }

  // Update a setting's value
  async updateSetting(
    key: SettingsKey,
    value: string | number | boolean,
  ): Promise<SettingsItem> {
    try {
      return await apiClient.put(`${this.baseUrl}/${key}`, value);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("settings.updateSetting error:", err.message);
      }
      throw err;
    }
  }
}

export const settingsService = new SettingsService();
