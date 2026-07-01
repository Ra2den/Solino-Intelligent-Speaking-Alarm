import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import TimeWidget from '../TimeWidget';

describe('TimeWidget Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-30T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the current time', () => {
    render(<TimeWidget locale="en-US" />);
    // The formatter format will depend on the locale, but we know it should have parts of the time
    expect(screen.getByText(/12:00|02:00/)).toBeInTheDocument();
  });

  it('updates the time periodically', () => {
    render(<TimeWidget locale="en-US" intervalMs={1000} />);
    
    // Initially 12:00:00
    expect(screen.getByText(/12:00|02:00/)).toBeInTheDocument();
    
    // Advance time by 1 minute (60 seconds)
    act(() => {
      vi.advanceTimersByTime(60000);
    });
    
    // Should now be 12:01
    expect(screen.getByText(/12:01|02:01/)).toBeInTheDocument();
  });
});
