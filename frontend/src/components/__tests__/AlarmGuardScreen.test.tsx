import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AlarmGuardScreen } from '../AlarmGuardScreen';
import { type AlarmSession, AlarmSessionStatusSchema } from '../../models/alarm-session.model';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { settingsService } from '../../services/settings.service';

vi.mock('../../services/settings.service', () => ({
  settingsService: {
    getSetting: vi.fn().mockResolvedValue(10), // Mock to return a valid setting value (e.g., 10 minutes)
  },
}));

describe('AlarmGuardScreen', () => {
  const queryClient = new QueryClient();

  const mockSession: AlarmSession = {
    id: 1,
    alarm_id: 10,
    status: AlarmSessionStatusSchema.enum.GUARD,
    started_at: '2026-07-01T07:00:00Z',
    ring_count: 1,
  };

  it('renders guard UI properly', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AlarmGuardScreen session={mockSession} onPressureStart={vi.fn()} />
      </QueryClientProvider>
    );
    expect(screen.getByText(/Guard Mode/i)).toBeInTheDocument();
  });

  it('handles pressure start correctly', () => {
    const onPressureMock = vi.fn();
    const { rerender } = render(
      <QueryClientProvider client={queryClient}>
        <AlarmGuardScreen session={{...mockSession, pressure_started_at: null}} onPressureStart={onPressureMock} />
      </QueryClientProvider>
    );
    
    fireEvent.click(screen.getByRole('button', { name: /Sensor betätigen/i }));
    expect(onPressureMock).toHaveBeenCalledWith(true);
    
    rerender(
      <QueryClientProvider client={queryClient}>
        <AlarmGuardScreen session={{...mockSession, pressure_started_at: '2026-07-01T07:05:00Z'}} onPressureStart={onPressureMock} />
      </QueryClientProvider>
    );
    
    fireEvent.click(screen.getByRole('button', { name: /Sensor loslassen/i }));
    expect(onPressureMock).toHaveBeenCalledWith(false);
  });
});
