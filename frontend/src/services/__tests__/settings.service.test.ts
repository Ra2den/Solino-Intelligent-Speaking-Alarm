import { describe, it, expect, vi, beforeEach } from 'vitest';
import { settingsService } from '../settings.service';
import { apiClient } from '../api-client';

vi.mock('../api-client', () => ({
  apiClient: {
    get: vi.fn(),
    put: vi.fn(),
  },
}));

describe('SettingsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches all settings', async () => {
    const mockSettings = [{ key: 'VOLUME_PERCENT', value: 50, category: 'general' }];
    vi.mocked(apiClient.get).mockResolvedValue(mockSettings);

    const result = await settingsService.getAllSettings();

    expect(apiClient.get).toHaveBeenCalledWith('/settings');
    expect(result).toEqual(mockSettings);
  });

  it('updates a setting', async () => {
    const updatedSetting = { key: 'VOLUME_PERCENT', value: 75, category: 'general' };
    vi.mocked(apiClient.put).mockResolvedValue(updatedSetting);

    const result = await settingsService.updateSetting('VOLUME_PERCENT', 75);

    expect(apiClient.put).toHaveBeenCalledWith('/settings/VOLUME_PERCENT', 75);
    expect(result).toEqual(updatedSetting);
  });
});
