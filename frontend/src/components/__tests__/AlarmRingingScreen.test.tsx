import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AlarmRingingScreen } from '../AlarmRingingScreen';
import { type AlarmSession, AlarmSessionStatusSchema } from '../../models/alarm-session.model';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { settingsService } from '../../services/settings.service';

vi.mock('../../services/settings.service', () => ({
  settingsService: {
    getSetting: vi.fn().mockResolvedValue(10), // Mock to return a valid setting value (e.g., 10 minutes)
  },
}));

describe('AlarmRingingScreen', () => {
  const queryClient = new QueryClient();

  const mockSession: AlarmSession = {
    id: 1,
    alarm_id: 10,
    status: AlarmSessionStatusSchema.enum.RINGING,
    label: 'Morning Wake Up',
    started_at: '2026-07-01T07:00:00Z',
    ring_count: 1,
  };

  it('renders alarm session data correctly', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AlarmRingingScreen session={mockSession} onStop={vi.fn()} onSnooze={vi.fn()} />
      </QueryClientProvider>
    );
    
    expect(screen.getByText('Morning Wake Up')).toBeInTheDocument();
  });

  it('calls onStop when Stop button is clicked', () => {
    const onStopMock = vi.fn();
    render(
      <QueryClientProvider client={queryClient}>
        <AlarmRingingScreen session={mockSession} onStop={onStopMock} onSnooze={vi.fn()} />
      </QueryClientProvider>
    );
    
    // There are 2 buttons, Snooze and Stop. Check using regex or specific text
    fireEvent.click(screen.getByText(/Stop/i));
    expect(onStopMock).toHaveBeenCalledTimes(1);
  });

  it('calls onSnooze when Snooze button is clicked', () => {
    const onSnoozeMock = vi.fn();
    render(
      <QueryClientProvider client={queryClient}>
        <AlarmRingingScreen session={mockSession} onStop={vi.fn()} onSnooze={onSnoozeMock} />
      </QueryClientProvider>
    );
    
    fireEvent.click(screen.getByText(/Snooze/i));
    expect(onSnoozeMock).toHaveBeenCalledTimes(1);
  });
});
