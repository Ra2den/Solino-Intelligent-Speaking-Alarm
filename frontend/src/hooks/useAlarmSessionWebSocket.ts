import { useCallback, useEffect, useRef, useState } from "react";
import { type AlarmSession } from "../models/alarm-session.model";
import {
  type AlarmSessionWsMessage,
  AlarmSessionWsMessageSchema,
} from "../models/alarm-session-ws-message.model";
import { alarmSessionService } from "../services/alarm-session.service";

const API_BASE =
  import.meta.env.VITE_BACKEND_IP?.trim() || "http://localhost:8000";

export function useAlarmSessionWebSocket() {
  const [session, setSession] = useState<AlarmSession | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const reconnectTimeoutRef = useRef<number | null>(null);

  const loadCurrentSession = useCallback(async () => {
    try {
      const current = await alarmSessionService.getCurrentSession();
      setSession(current);
    } catch (error) {
      console.warn("Failed to load current alarm session", error);
    }
  }, []);

  useEffect(() => {
    const rawApiBase = API_BASE.trim();
    const normalizedBase = rawApiBase.match(/^https?:\/\//)
      ? rawApiBase
      : `http://${rawApiBase}`;

    const backendUrl = new URL(normalizedBase);
    const wsProtocol = backendUrl.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${wsProtocol}//${backendUrl.host}/alarm-session/ws`;
    let ws: WebSocket | null = null;
    let shouldReconnect = true;

    function connect() {
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setIsConnected(true);
        setIsLoading(false);
        void loadCurrentSession();
        console.log("WebSocket connected to", wsUrl);
      };

      ws.onmessage = (event) => {
        let data: AlarmSessionWsMessage;

        try {
          data = AlarmSessionWsMessageSchema.parse(JSON.parse(event.data));
        } catch (error) {
          console.error("Invalid alarm session WS message", error);
          return;
        }

        if (data.type === "INITIAL_STATE" || data.type === "UPDATE") {
          setSession(data.session);
        } else {
          console.warn("Unhandled alarm session WS message type", data.type);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setIsLoading(false);
      };

      ws.onclose = () => {
        setIsConnected(false);
        console.log("WebSocket disconnected");

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
  }, [loadCurrentSession]);

  return {
    data: session,
    setData: setSession,
    isLoading,
    isConnected,
  };
}
