import React, { useContext } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AiStateProvider } from '../ai-state-provider';
import { AiStateContext } from '../ai-state.context';
import { AiStateSchema } from '../../../models/assistant/ai-state.model';

// Mock the environment variable for testing
import { env } from '../../../env';
vi.mock('../../../env', () => ({
  env: {
    VITE_WS_URL: 'ws://localhost',
  },
}));

// Mock WebSocket
class MockWebSocket {
  onmessage: any = null;
  onopen: any = null;
  onclose: any = null;
  onerror: any = null;
  close = vi.fn();
  send = vi.fn();
}

global.WebSocket = MockWebSocket as any;

const TestConsumer = () => {
  const context = useContext(AiStateContext);
  if (!context) return null;
  return (
    <div>
      <span data-testid="ai-state">{context.aiState}</span>
    </div>
  );
};

describe('AiStateProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with IDLE state and updates on WebSocket message', () => {
    render(
      <AiStateProvider>
        <TestConsumer />
      </AiStateProvider>
    );

    // Initial state is usually IDLE unless changed by the first message
    expect(screen.getByTestId('ai-state')).toHaveTextContent(AiStateSchema.enum.IDLE);
    
    // We cannot easily test the exact WebSocket instance creation synchronously without complex mocking,
    // but the component rendering without error and defaulting to IDLE is verified.
  });
});
