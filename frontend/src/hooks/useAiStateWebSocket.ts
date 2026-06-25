import { useEffect, useRef, useState } from "react";
import type { AiState } from "../models/assistant/ai-state.model";
import { AiStateSchema } from "../models/assistant/ai-state.model";
import { getWsBase } from "../utils/backend-url.util";

export function useAiStateWebSocket() {
  const [aiState, setAiState] = useState<AiState>(AiStateSchema.enum.IDLE);
  const [connectionStatus, setConnectionStatus] = useState<string>("Connecting to Ai State Socket...");
  const reconnectTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const wsUrl = `${getWsBase()}/alarms/ws/ai-state`;
    
    let ws: WebSocket | null = null;
    let shouldReconnect = true;

    function connect() {
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setConnectionStatus("Connected to Ai State Socket");
      };

      ws.onmessage = (event: MessageEvent) => {
        try {
          let rawData;
          try {
            rawData = JSON.parse(event.data);
          } catch {
            rawData = event.data;
          }

          const rawState = String((typeof rawData === "object" ? rawData?.state : rawData) || "").trim();
          const enumValues = Object.values(AiStateSchema.enum) as string[];
          const matchedState = enumValues.find(
            (val) => val.toLowerCase() === rawState.toLowerCase()
          );

          if (matchedState) {
            setAiState(matchedState as AiState);
          } else {
            setAiState(AiStateSchema.parse(rawState));
          }
        } catch (err) {
          console.error("Error when trying to parse updated ai state:", err);
        }
      };

      ws.onerror = (error: Event) => {
        setConnectionStatus("Connection error");
        console.error("WS State Error:", error);
      };

      ws.onclose = (event: CloseEvent) => {
        if (!event.wasClean || ws?.readyState === WebSocket.CLOSED) {
          setConnectionStatus("Connection closed");
        }
        if (shouldReconnect) {
          reconnectTimeoutRef.current = window.setTimeout(connect, 1000);
        }
      };
    }

    connect();

    return () => {
      shouldReconnect = false;
      if (reconnectTimeoutRef.current !== null) {
        window.clearTimeout(reconnectTimeoutRef.current);
      }
      ws?.close();
    };
  }, []);

  return {
    aiState,
    connectionStatus,
  };
}