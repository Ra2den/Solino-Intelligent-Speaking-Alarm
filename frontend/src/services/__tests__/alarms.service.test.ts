import { describe, it, expect, vi, beforeEach } from 'vitest';
import { alarmsService } from '../alarms.service';
import { apiClient } from '../api-client';

// Mock the apiClient
vi.mock('../api-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('AlarmsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches all alarms', async () => {
    const mockAlarms = [{ id: 1, time: '07:00' }];
    vi.mocked(apiClient.get).mockResolvedValue(mockAlarms);

    const result = await alarmsService.getAlarms();
    
    expect(apiClient.get).toHaveBeenCalledWith('/alarms');
    expect(result).toEqual(mockAlarms);
  });

  it('creates an alarm', async () => {
    const newAlarmPayload = { time: '08:00', label: 'Wake up' };
    const createdAlarm = { id: 2, ...newAlarmPayload };
    vi.mocked(apiClient.post).mockResolvedValue(createdAlarm);

    const result = await alarmsService.createAlarm(newAlarmPayload);

    expect(apiClient.post).toHaveBeenCalledWith('/alarms', newAlarmPayload);
    expect(result).toEqual(createdAlarm);
  });

  it('toggles an alarm', async () => {
    const toggledAlarm = { id: 1, time: '07:00', active: false };
    vi.mocked(apiClient.get).mockResolvedValue(toggledAlarm);

    const result = await alarmsService.toggleAlarm(1);

    expect(apiClient.get).toHaveBeenCalledWith('/alarms/1/toggle');
    expect(result).toEqual(toggledAlarm);
  });

  it('deletes an alarm', async () => {
    vi.mocked(apiClient.delete).mockResolvedValue(undefined);

    await alarmsService.deleteAlarm(1);

    expect(apiClient.delete).toHaveBeenCalledWith('/alarms/1');
  });
});
