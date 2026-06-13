export interface TranscriptionResponse {
  transcription: string | null;
  isListening: boolean;
  error: string | null;
}

export type StatusChangeCallback = (isListening: boolean) => void;
export type ProcessingChangeCallback = (isProcessing: boolean) => void;
export type ResultCallback = (text: string) => void;
export type ErrorCallback = (error: string) => void;

class AlarmNameRecorder {
  private ws: WebSocket | null = null;
  private onStatusChange: StatusChangeCallback;
  private onProcessingChange: ProcessingChangeCallback;
  private onResult: ResultCallback;
  private onError: ErrorCallback;

  constructor(
    onStatusChange: StatusChangeCallback,
    onProcessingChange: ProcessingChangeCallback,
    onResult: ResultCallback,
    onError: ErrorCallback,
  ) {
    this.onStatusChange = onStatusChange;
    this.onProcessingChange = onProcessingChange;
    this.onResult = onResult;
    this.onError = onError;
  }

  public connect(autoStart: boolean = false): void {
    // Prevent duplicate connections if the user clicks rapidly
    if (
      this.ws &&
      (this.ws.readyState === WebSocket.OPEN ||
        this.ws.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    // Dynamically get the base URL like in api-client.ts
    let apiBase =
      import.meta.env.VITE_BACKEND_IP?.trim() || "http://127.0.0.1:8000";
    apiBase = apiBase.replace("localhost", "127.0.0.1"); // Force IPv4 to prevent resolution errors
    const normalizedBase = apiBase.endsWith("/")
      ? apiBase.slice(0, -1)
      : apiBase;
    const wsBase = normalizedBase.replace(/^http/, "ws");
    this.ws = new WebSocket(`${wsBase}/alarms/ws/record-name`);

    this.ws.onopen = () => {
      console.log("✨ Verbunden mit Susonnes Audio-Socket");
      this.onError("");
      if (autoStart && this.ws) {
        this.ws.send(JSON.stringify({ action: "start" }));
      }
    };

    this.ws.onmessage = (event: MessageEvent) => {
      try {
        // Typisierte Antwort vom Server parsen
        const data: TranscriptionResponse = JSON.parse(event.data);
        console.log("Daten vom Server erhalten:", data);

        // 1. Status updaten
        this.onStatusChange(data.isListening);

        if (data.isListening) {
          this.onProcessingChange(false);
        }

        // 2. Fehler abfangen
        if (data.error) {
          this.onProcessingChange(false);
          this.onError(data.error);
          return;
        }

        // 3. Transkription empfangen
        if (data.transcription !== null && data.transcription !== undefined) {
          this.onProcessingChange(false);
          this.onResult(data.transcription);
        }
      } catch (err) {
        this.onProcessingChange(false);
        this.onStatusChange(false);
        this.onError("Fehler beim Verarbeiten der Server-Daten.");
      }
    };

    this.ws.onerror = (error: Event) => {
      this.onProcessingChange(false);
      this.onStatusChange(false);
      this.onError("WebSocket-Verbindungsfehler");
      console.error("WS Error:", error);
    };

    this.ws.onclose = () => {
      this.ws = null;
      this.onProcessingChange(false);
      this.onStatusChange(false);
      console.log("WebSocket-Verbindung geschlossen.");
    };
  }

  public startRecording(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.onProcessingChange(false);
      this.ws.send(JSON.stringify({ action: "start" }));
    } else if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
      this.onProcessingChange(true);
      // Connection is already establishing; autoStart will trigger on open
    } else {
      // If not connected, indicate processing and auto-start once connected
      this.onProcessingChange(true);
      this.connect(true);
    }
  }

  public stopRecording(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.onProcessingChange(true);
      this.ws.send(JSON.stringify({ action: "stop" }));
    }
  }

  public disconnect(): void {
    if (this.ws) {
      this.onProcessingChange(false);
      this.ws.close();
      this.ws = null;
    }
  }
}

export default AlarmNameRecorder;
