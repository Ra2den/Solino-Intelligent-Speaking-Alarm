import { describe, it, expect, vi, beforeEach } from 'vitest';
import { weatherService } from '../weather.service';
import { apiClient } from '../api-client';

vi.mock('../api-client', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

describe('WeatherService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches weather nowcast', async () => {
    const mockNowcast = { time: '12:00', temperature: 20, feels_like: 21, weather_condition: 'Clear', weather_description: 'clear sky' };
    vi.mocked(apiClient.get).mockResolvedValue(mockNowcast);

    const result = await weatherService.getNowcast();
    expect(apiClient.get).toHaveBeenCalledWith('/weather/nowcast');
    expect(result).toEqual(mockNowcast);
  });

  it('fetches sunset time', async () => {
    const mockSunset = { time: '18:00' };
    vi.mocked(apiClient.get).mockResolvedValue(mockSunset);

    const result = await weatherService.getSunset();
    expect(apiClient.get).toHaveBeenCalledWith('/weather/sunset');
    expect(result).toEqual('18:00');
  });

  it('fetches sunrise time', async () => {
    const mockSunrise = { time: '06:00' };
    vi.mocked(apiClient.get).mockResolvedValue(mockSunrise);

    const result = await weatherService.getSunrise();
    expect(apiClient.get).toHaveBeenCalledWith('/weather/sunrise');
    expect(result).toEqual('06:00');
  });
});
