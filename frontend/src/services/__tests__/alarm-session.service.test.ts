import { describe, it, expect, vi, beforeEach } from 'vitest';
import { alarmSessionService } from '../alarm-session.service';
import { apiClient } from '../api-client';

vi.mock('../api-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('AlarmSessionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches current session', async () => {
    const mockSession = { id: 1, status: 'RINGING' };
    vi.mocked(apiClient.get).mockResolvedValue(mockSession);

    const result = await alarmSessionService.getCurrentSession();
    expect(apiClient.get).toHaveBeenCalledWith('/alarm-session/current');
    expect(result).toEqual(mockSession);
  });

  it('stops a session', async () => {
    const mockSession = { id: 1, status: 'GUARD' };
    vi.mocked(apiClient.post).mockResolvedValue(mockSession);

    const result = await alarmSessionService.stopSession(1);
    expect(apiClient.post).toHaveBeenCalledWith('/alarm-session/1/stop', null);
    expect(result).toEqual(mockSession);
  });

  it('snoozes a session', async () => {
    const mockSession = { id: 1, status: 'SNOOZED' };
    vi.mocked(apiClient.post).mockResolvedValue(mockSession);

    const result = await alarmSessionService.snoozeSession(1);
    expect(apiClient.post).toHaveBeenCalledWith('/alarm-session/1/snooze', null);
    expect(result).toEqual(mockSession);
  });

  it('sends pressure event', async () => {
    const mockSession = { id: 1, status: 'GUARD' };
    vi.mocked(apiClient.post).mockResolvedValue(mockSession);

    const result = await alarmSessionService.triggerPressureSensor(1, true);
    expect(apiClient.post).toHaveBeenCalledWith('/alarm-session/1/pressure', { is_pressed: true });
    expect(result).toEqual(mockSession);
  });
});
