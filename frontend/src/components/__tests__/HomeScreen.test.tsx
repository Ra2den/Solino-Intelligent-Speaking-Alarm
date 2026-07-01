import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HomeScreen } from '../HomeScreen';
import { useAlarmSession } from '../../contexts/alarm-session/alarm-session.context';
import { useAiState } from '../../contexts/ai-state/ai-state.context';
import { usePhase } from '../../hooks/usePhase';
import { useWeatherNowcast } from '../../hooks/weather/useWeatherNowcast';
import { AiStateSchema } from '../../models/assistant/ai-state.model';

// Mock contexts and hooks
vi.mock('../../contexts/alarm-session/alarm-session.context', () => ({
  useAlarmSession: vi.fn(),
}));

vi.mock('../../contexts/ai-state/ai-state.context', () => ({
  useAiState: vi.fn(),
}));

vi.mock('../../hooks/usePhase', () => ({
  usePhase: vi.fn(),
}));

vi.mock('../../hooks/weather/useWeatherNowcast', () => ({
  useWeatherNowcast: vi.fn(),
}));

// Mock sub-components to isolate HomeScreen logic
vi.mock('../TimeWidget', () => ({
  default: () => <div data-testid="time-widget">TimeWidget</div>,
}));

vi.mock('../agent/Agent', () => ({
  Agent: () => <div data-testid="agent">Agent</div>,
}));

vi.mock('../alarm/AlarmWidget', () => ({
  default: () => <div data-testid="alarm-widget">AlarmWidget</div>,
}));

vi.mock('../alarm/AlarmList', () => ({
  AlarmList: ({ onBack }: any) => (
    <div data-testid="alarm-list">
      <button onClick={onBack}>Back</button>
    </div>
  ),
}));

vi.mock('../alarm-create/AlarmCreate', () => ({
  default: ({ onBack }: any) => (
    <div data-testid="alarm-create">
      <button onClick={onBack}>Back</button>
    </div>
  ),
}));

vi.mock('../SettingsScreen', () => ({
  default: ({ onBack }: any) => (
    <div data-testid="settings-screen">
      <button onClick={onBack}>Back</button>
    </div>
  ),
}));

vi.mock('../AlarmRingingScreen', () => ({
  AlarmRingingScreen: () => <div data-testid="alarm-ringing">AlarmRinging</div>,
}));

vi.mock('../AlarmGuardScreen', () => ({
  AlarmGuardScreen: () => <div data-testid="alarm-guard">AlarmGuard</div>,
}));

vi.mock('../LoadingScreen', () => ({
  LoadingScreen: ({ isPhaseLoading, isWeatherLoading, isSessionLoading }: any) => {
    if (isPhaseLoading || isWeatherLoading || isSessionLoading) {
      return <div data-testid="loading-screen">Loading</div>;
    }
    return null;
  }
}));

describe('HomeScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mock returns
    vi.mocked(useAlarmSession).mockReturnValue({
      isRinging: false,
      isGuard: false,
      currentAlarmSession: null,
      stopAlarm: vi.fn(),
      snoozeAlarm: vi.fn(),
      togglePressureSensor: vi.fn(),
      isLoading: false,
    } as any);

    vi.mocked(useAiState).mockReturnValue({
      aiState: AiStateSchema.enum.IDLE,
    } as any);

    vi.mocked(usePhase).mockReturnValue('morning' as any);

    vi.mocked(useWeatherNowcast).mockReturnValue({
      isLoading: false,
      isError: false,
    } as any);
  });

  it('renders loading screen when initializing', () => {
    vi.mocked(usePhase).mockReturnValue(undefined as any);
    render(<HomeScreen />);
    expect(screen.getByTestId('loading-screen')).toBeInTheDocument();
  });

  it('renders main widgets when idle', () => {
    render(<HomeScreen />);
    expect(screen.getByTestId('time-widget')).toBeInTheDocument();
    expect(screen.getByTestId('agent')).toBeInTheDocument();
    expect(screen.getByTestId('alarm-widget')).toBeInTheDocument();
    
    // Check buttons
    expect(screen.getByLabelText('Alle Wecker')).toBeInTheDocument();
    expect(screen.getByLabelText('Wecker hinzufügen')).toBeInTheDocument();
    expect(screen.getByLabelText('Einstellungen')).toBeInTheDocument();
  });

  it('opens AlarmList when "Alle Wecker" is clicked', () => {
    render(<HomeScreen />);
    fireEvent.click(screen.getByLabelText('Alle Wecker'));
    expect(screen.getByTestId('alarm-list')).toBeInTheDocument();
    
    // Back to widgets
    fireEvent.click(screen.getByText('Back'));
    expect(screen.getByTestId('time-widget')).toBeInTheDocument();
  });

  it('opens AlarmCreate when "Wecker hinzufügen" is clicked', () => {
    render(<HomeScreen />);
    fireEvent.click(screen.getByLabelText('Wecker hinzufügen'));
    expect(screen.getByTestId('alarm-create')).toBeInTheDocument();
  });

  it('opens SettingsScreen when "Einstellungen" is clicked', () => {
    render(<HomeScreen />);
    fireEvent.click(screen.getByLabelText('Einstellungen'));
    expect(screen.getByTestId('settings-screen')).toBeInTheDocument();
  });

  it('renders AlarmRingingScreen if alarm is ringing', () => {
    vi.mocked(useAlarmSession).mockReturnValue({
      isRinging: true,
      isGuard: false,
      currentAlarmSession: { id: 1 },
      isLoading: false,
    } as any);
    
    render(<HomeScreen />);
    expect(screen.getByTestId('alarm-ringing')).toBeInTheDocument();
  });
});
