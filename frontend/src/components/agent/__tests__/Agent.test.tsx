import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Agent } from '../Agent';
import { AiStateSchema } from '../../../models/assistant/ai-state.model';
import { useWeatherNowcast } from '../../../hooks/weather/useWeatherNowcast';
import { usePhase } from '../../../hooks/usePhase';

vi.mock('../../../hooks/weather/useWeatherNowcast', () => ({
  useWeatherNowcast: vi.fn(),
}));

vi.mock('../../../hooks/usePhase', () => ({
  usePhase: vi.fn(),
}));

// Mock GSAP to prevent animation issues in jsdom
vi.mock('gsap', () => ({
  default: {
    context: vi.fn((fn) => {
      fn();
      return { revert: vi.fn() };
    }),
    fromTo: vi.fn(() => ({ progress: vi.fn() })),
    set: vi.fn(),
    utils: {
      random: vi.fn(() => 1),
    },
  },
}));

describe('Agent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useWeatherNowcast).mockReturnValue({
      data: { temperature: 22, weather_condition: 'Clear' },
      isLoading: false,
      isError: false,
    } as any);
    vi.mocked(usePhase).mockReturnValue('Day' as any);
  });

  it('renders default state correctly', () => {
    render(<Agent />);
    expect(screen.getByAltText('Solino Base')).toBeInTheDocument();
    // Default phase is Day, so it should render eyes
    expect(screen.getByAltText('Eyes of Solino')).toBeInTheDocument();
  });

  it('renders thinking bubble when AiState is THINKING', () => {
    render(<Agent aiState={AiStateSchema.enum.THINKING} />);
    expect(screen.getByAltText('Thinking bubble')).toBeInTheDocument();
  });

  it('renders guard expression when isGuard is true', () => {
    render(<Agent isGuard={true} />);
    expect(screen.getByAltText('Expression of Solino with raised Eyebrows')).toBeInTheDocument();
  });

  it('renders rain elements when weather condition is Rain', () => {
    vi.mocked(useWeatherNowcast).mockReturnValue({
      data: { temperature: 15, weather_condition: 'Rain' },
      isLoading: false,
      isError: false,
    } as any);

    render(<Agent />);
    expect(screen.getAllByAltText('Raindrop').length).toBeGreaterThan(0);
    expect(screen.getAllByAltText('Medium-sized cloud').length).toBeGreaterThan(0);
  });
});
