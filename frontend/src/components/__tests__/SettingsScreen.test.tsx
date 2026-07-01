import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SettingsScreen from '../SettingsScreen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { settingsService } from '../../services/settings.service';

vi.mock('../../services/settings.service', () => ({
  settingsService: {
    getAllSettings: vi.fn(),
    updateSetting: vi.fn(),
  },
}));

describe('SettingsScreen', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient();
    
    vi.mocked(settingsService.getAllSettings).mockResolvedValue([
      { key: 'LANGUAGE', value: 'ENGLISH' },
      { key: 'VOLUME_PERCENT', value: 50 },
      { key: 'SNOOZE_DURATION_MIN', value: 5 },
      { key: 'GUARD_MODE_TIMER_MIN', value: 10 },
      { key: 'GUARD_MODE_TOLERANCE_MIN', value: 1 },
      { key: 'OLLAMA_HEALTH_CHECK_TIMEOUT_SEC', value: 30 },
    ] as any);
  });

  it('renders general settings correctly', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <SettingsScreen onBack={vi.fn()} />
      </QueryClientProvider>
    );

    // Should render "Laden..." initially
    expect(screen.getByText('Laden...')).toBeInTheDocument();

    // Wait for the query to resolve
    await waitFor(() => {
      expect(screen.getByText('Einstellungen')).toBeInTheDocument();
    });

    // Language setting should be visible
    expect(screen.getByText('Sprache')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
  });

  it('switches to advanced tab when clicked', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <SettingsScreen onBack={vi.fn()} />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Einstellungen')).toBeInTheDocument();
    });

    // Click Advanced tab
    fireEvent.click(screen.getByText('Erweitert'));

    // Advanced settings should be visible
    expect(screen.getByText('Guard Modus Dauer')).toBeInTheDocument();
  });

  it('calls updateSetting when a setting is changed', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <SettingsScreen onBack={vi.fn()} />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Einstellungen')).toBeInTheDocument();
    });

    // Click on 75% volume
    fireEvent.click(screen.getByText('75%'));

    await waitFor(() => {
      expect(settingsService.updateSetting).toHaveBeenCalledWith('VOLUME_PERCENT', 75);
    });
  });
});
