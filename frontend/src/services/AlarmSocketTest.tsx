import React, { useState, useEffect, useRef } from 'react';
import AlarmNameRecorder from './alarm-name-recorder'; // Pfad ggf. anpassen

export const AlarmSocketTest: React.FC = () => {
  const [transcription, setTranscription] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Ref hält die Instanz des Recorders über Renders hinweg stabil
  const recorderRef = useRef<AlarmNameRecorder | null>(null);

  useEffect(() => {
    // 1. Recorder-Instanz mit den drei Callbacks erstellen
    recorderRef.current = new AlarmNameRecorder(
      (listening: boolean) => setIsListening(listening),
      (text: string) => setTranscription(text),
      (errMsg: string) => setError(errMsg)
    );

    // 2. WebSocket-Verbindung aufbauen
    recorderRef.current.connect();

    // 3. Verbindung beim Schließen der Komponente sauber trennen
    return () => {
      if (recorderRef.current) {
        recorderRef.current.disconnect();
      }
    };
  }, []);

  const handleButtonClick = () => {
    if (!recorderRef.current) return;

    setError(''); // Alten Fehler zurücksetzen

    if (isListening) {
      recorderRef.current.stopRecording();
    } else {
      recorderRef.current.startRecording();
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '400px' }}>
      <h2>🎙️ Susonne Socket Test</h2>

      {/* Fehleranzeige */}
      {error && (
        <div style={{ color: 'red', marginBottom: '10px', fontWeight: 'bold' }}>
          ⚠️ Fehler: {error}
        </div>
      )}

      {/* Status-Anzeige */}
      <div style={{ marginBottom: '15px' }}>
        Status: {isListening ? (
          <span style={{ color: 'red', fontWeight: 'bold' }}>🔴 Aufnahme läuft...</span>
        ) : (
          <span style={{ color: 'green' }}>🟢 Bereit</span>
        )}
      </div>

      {/* Aktions-Button */}
      <button
        onClick={handleButtonClick}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          cursor: 'pointer',
          backgroundColor: isListening ? '#ff4d4d' : '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          marginBottom: '20px',
          display: 'block',
          width: '100%'
        }}
      >
        {isListening ? 'Aufnahme stoppen' : 'Name einsprechen'}
      </button>

      {/* Ausgabe-Textfeld */}
      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
        Erkannter Weckername:
      </label>
      <input
        type="text"
        value={transcription}
        readOnly // Nur zur Anzeige der API-Ausgabe
        placeholder="Hier erscheint dein gesprochener Text..."
        style={{
          width: '100%',
          padding: '10px',
          fontSize: '16px',
          boxSizing: 'border-box',
          backgroundColor: '#f9f9f9',
          border: '1px solid #ccc',
          borderRadius: '4px'
        }}
      />
    </div>
  );
};

export default AlarmSocketTest;