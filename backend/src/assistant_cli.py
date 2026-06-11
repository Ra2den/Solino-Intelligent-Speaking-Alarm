import sys
import os
import numpy as np
import pyaudio
import openwakeword
import requests
from openwakeword.model import Model

from domain.assistant.service import interact

FORMAT = pyaudio.paInt16
CHANNELS = 1
RATE = 16000
CHUNK = 1280

FASTAPI_URL = "http://localhost:8000/alarms/set-ai-state-external"

def trigger_backend_state(state: str):
    """Schießt den neuen State per HTTP direkt in den echten FastAPI-Prozess."""
    try:
        requests.post(
            FASTAPI_URL, 
            json={"state": state},
            timeout=0.5 
        )
    except Exception as e:
        print(f"[CLI] Konnte State '{state}' nicht an FastAPI übertragen (Server offline?)")

def main():
    print("= " * 15)
    print("Susonne CLI ist bereit.")
    print("Der Alarm-Monitor läuft über FastAPI.")
    print("= " * 15)

    print("Überprüfe und lade fehlende Wake-Word-Modelle herunter...")
    openwakeword.utils.download_models()
    print("Modelle erfolgreich überprüft/heruntergeladen.")

    oww_model = Model(inference_framework="onnx")
    
    wake_word = "hey_jarvis" 
    if wake_word not in oww_model.models:
        wake_word = list(oww_model.models.keys())[0]
        
    print(f"Aktivierungswort gesetzt auf: '{wake_word}'")

    p = pyaudio.PyAudio()
    audio_stream = p.open(
        format=FORMAT,
        channels=CHANNELS,
        rate=RATE,
        input=True,
        frames_per_buffer=CHUNK
    )

    try:
        print(f"\n[Lausche...] Sag \"{wake_word}\"")
        
        while True:
            audio_data = audio_stream.read(CHUNK, exception_on_overflow=False)
            n_array = np.frombuffer(audio_data, dtype=np.int16)
            prediction = oww_model.predict(n_array)
            score = oww_model.prediction_buffer[wake_word][-1]
            
            if score > 0.5:
                print(f"\nWake Word '{wake_word}' erkannt! (Score: {score:.2f})")
                print("Susonne wacht auf...")
                
                audio_stream.stop_stream()
                
                interact()
                
                print(f"\n[Lausche wieder...] Sag \"{wake_word}\"")
                audio_stream.start_stream()
                
                oww_model.reset()

    except KeyboardInterrupt:
        print("\nCLI manuell beendet.")
    finally:
        audio_stream.stop_stream()
        audio_stream.close()
        p.terminate()
        print("Audio-Ressourcen freigegeben. Tschüss!")

if __name__ == "__main__":
    main()