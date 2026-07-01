import React, { useContext } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AlarmSessionProvider } from '../alarm-session-provider';
import { AlarmSessionContext } from '../alarm-session.context';
import { useAlarmSessionWebSocket } from '../../../hooks/useAlarmSessionWebSocket';
import { alarmSessionService } from '../../../services/alarm-session.service';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AlarmSessionStatusSchema } from '../../../models/alarm-session.model';

vi.mock('../../../hooks/useAlarmSessionWebSocket', () => ({
  useAlarmSessionWebSocket: vi.fn(),
}));

vi.mock('../../../services/alarm-session.service', () => ({
  alarmSessionService: {
    stopSession: vi.fn(),
    snoozeSession: vi.fn(),
    triggerPressureSensor: vi.fn(),
  },
}));

const TestConsumer = () => {
  const context = useContext(AlarmSessionContext);
  if (!context) return null;
  return (
    <div>
      <span data-testid="is-ringing">{context.isRinging.toString()}</span>
      <span data-testid="is-guard">{context.isGuard.toString()}</span>
      <button onClick={() => context.stopAlarm()}>Stop</button>
      <button onClick={() => context.snoozeAlarm()}>Snooze</button>
      <button onClick={() => context.togglePressureSensor(true)}>Pressure</button>
    </div>
  );
};

describe('AlarmSessionProvider', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient();
  });

  it('provides alarm session data to consumers', () => {
    vi.mocked(useAlarmSessionWebSocket).mockReturnValue({
      data: { id: 1, status: AlarmSessionStatusSchema.enum.RINGING },
      setData: vi.fn(),
      isLoading: false,
    } as any);

    render(
      <QueryClientProvider client={queryClient}>
        <AlarmSessionProvider client={queryClient}>
          <TestConsumer />
        </AlarmSessionProvider>
      </QueryClientProvider>
    );

    expect(screen.getByTestId('is-ringing')).toHaveTextContent('true');
    expect(screen.getByTestId('is-guard')).toHaveTextContent('false');
  });

  it('handles mutations correctly', async () => {
    const mockSetData = vi.fn();
    vi.mocked(useAlarmSessionWebSocket).mockReturnValue({
      data: { id: 1, status: AlarmSessionStatusSchema.enum.RINGING },
      setData: mockSetData,
      isLoading: false,
    } as any);

    const mockUpdatedSession = { id: 1, status: AlarmSessionStatusSchema.enum.GUARD };
    vi.mocked(alarmSessionService.stopSession).mockResolvedValue(mockUpdatedSession as any);

    render(
      <QueryClientProvider client={queryClient}>
        <AlarmSessionProvider client={queryClient}>
          <TestConsumer />
        </AlarmSessionProvider>
      </QueryClientProvider>
    );

    fireEvent.click(screen.getByText('Stop'));
    
    await waitFor(() => {
      expect(alarmSessionService.stopSession).toHaveBeenCalledWith(1);
      expect(mockSetData).toHaveBeenCalledWith(mockUpdatedSession);
    });
  });
});
