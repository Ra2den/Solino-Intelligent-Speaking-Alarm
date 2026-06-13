import React, { useState, useEffect } from "react";
import type { AiState as AiState } from "./models/assistant/ai-state.model";
import { AiStateSchema } from "./models/assistant/ai-state.model";

interface AiStateResponse {
  state: AiState;
}

export const AiStateTest: React.FC = () => {
  const [aiState, setAiState] = useState<AiState>(AiStateSchema.enum.IDLE);
  const [connectionStatus, setConnectionStatus] =
    useState<string>("Verbinden...");

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/alarms/ws/ai-state");

    ws.onopen = () => {
      setConnectionStatus("🟢 Verbunden mit dem KI-Zustands-Socket");
    };

    ws.onmessage = (event: MessageEvent) => {
      try {
        const data: AiStateResponse = JSON.parse(event.data);
        console.log("Neuer KI-Zustand vom Server:", data.state);
        setAiState(data.state);
      } catch (err) {
        console.error("Fehler beim Parsen des KI-Status:", err);
      }
    };

    ws.onerror = (error: Event) => {
      setConnectionStatus("🔴 Verbindungsfehler");
      console.error("WS State Error:", error);
    };

    ws.onclose = (event: CloseEvent) => {
      // WICHTIG: Nur wenn es KEIN normaler Cleanup-Wechsel durch React ist,
      // zeigen wir "Verbindung geschlossen" an.
      if (!event.wasClean || ws.readyState === WebSocket.CLOSED) {
        setConnectionStatus("⚪ Verbindung geschlossen");
      }
    };

    // Sauberes Trennen beim Verlassen der Komponente
    return () => {
      // Wir überschreiben den Onclose-Handler vor dem Schließen,
      // damit der React-Strict-Mode-Cleanup die UI nicht fälschlicherweise auf "geschlossen" setzt
      ws.onclose = null;
      ws.close();
    };
  }, []);

  const getStateStyles = () => {
    switch (aiState) {
      case AiStateSchema.enum.THINKING:
        return {
          color: "#d97706",
          bgColor: "#fef3c7",
          text: "✨ Susonne überlegt & rechnet...",
        };
      case AiStateSchema.enum.SPEAKING:
        return {
          color: "#dc2626",
          bgColor: "#fee2e2",
          text: "🗣️ Susonne spricht gerade (TTS)!",
        };
      case AiStateSchema.enum.IDLE:
      default:
        return {
          color: "#16a34a",
          bgColor: "#dcfce7",
          text: "😴 Susonne schläft oder wartet (Idle)",
        };
    }
  };

  const styles = getStateStyles();

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "sans-serif",
        maxWidth: "450px",
        margin: "20px auto",
        border: "1px solid #ddd",
        borderRadius: "8px",
      }}
    >
      <h3>🤖 Susonne Live-Status Monitor</h3>
      <p style={{ fontSize: "14px", color: "#666" }}>{connectionStatus}</p>
      <hr
        style={{ border: "0", borderTop: "1px solid #eee", margin: "15px 0" }}
      />

      <div
        style={{
          padding: "25px",
          borderRadius: "6px",
          backgroundColor: styles.bgColor,
          color: styles.color,
          textAlign: "center",
          transition: "all 0.3s ease",
          border: `1px solid ${styles.color}`,
        }}
      >
        <div
          style={{
            fontSize: "12px",
            letterSpacing: "1px",
            marginBottom: "5px",
          }}
        >
          AKTUELLER STATE
        </div>
        <div style={{ fontSize: "28px", fontWeight: "bold" }}>
          {aiState.toUpperCase()}
        </div>
        <div
          style={{ fontSize: "14px", marginTop: "10px", fontStyle: "italic" }}
        >
          {styles.text}
        </div>
      </div>
    </div>
  );
};

export default AiStateTest;
