import sys
import os
import numpy as np
import pyaudio
import openwakeword
from openwakeword.model import Model

from domain.assistant.service import interact

FORMAT = pyaudio.paInt16
CHANNELS = 1
RATE = 16000
CHUNK = 1280

def main():
    print("= " * 15)
    print("Susonne CLI ist bereit.")
    print("Der Alarm-Monitor läuft über FastAPI.")
    print("= " * 15)

    print("📦 Überprüfe und lade fehlende Wake-Word-Modelle herunter...")
    openwakeword.utils.download_models()
    print("✅ Modelle erfolgreich überprüft/heruntergeladen.")

    oww_model = Model(inference_framework="onnx")
    
    wake_word = "hey_jarvis" 
    if wake_word not in oww_model.models:
        wake_word = list(oww_model.models.keys())[0]
        
    print(f"✨ Aktivierungswort gesetzt auf: '{wake_word}'")

    p = pyaudio.PyAudio()
    audio_stream = p.open(
        format=FORMAT,
        channels=CHANNELS,
        rate=RATE,
        input=True,
        frames_per_buffer=CHUNK
    )

    try:
        print("\n[Lausche...] Sag einfach dein Wake Word.")
        
        while True:
            # Kontinuierlich Audio vom Mikrofon lesen
            # exception_on_overflow=False verhindert Abstürze, wenn der Mac kurz hängt
            audio_data = audio_stream.read(CHUNK, exception_on_overflow=False)
            
            # Rohdaten in ein Numpy-Array konvertieren (wichtig für das ML-Modell)
            n_array = np.frombuffer(audio_data, dtype=np.int16)
            
            # Vorhersage berechnen
            prediction = oww_model.predict(n_array)
            
            # Den Wahrscheinlichkeits-Score für unser gewähltes Wake-Word holen
            score = oww_model.prediction_buffer[wake_word][-1]
            
            # Wenn der Score > 0.5 ist, wurde das Wort mit hoher Sicherheit erkannt
            if score > 0.5:
                print(f"\nWake Word '{wake_word}' erkannt! (Score: {score:.2f})")
                print("Susonne wacht auf...")
                
                # Kurzes akustisches Feedback (Optional, falls du ein 'Pling'-Sound hast)
                # os.system("afplay path_to_ping.wav")
                
                # Stream kurz stoppen, damit 'interact()' ungestört aufnehmen kann
                audio_stream.stop_stream()
                
                # Deine bestehende Sprachverarbeitung ausführen
                interact()
                
                # Nach dem Gespräch den Stream wieder starten und weiterlauschen
                print(f"\n[Lausche wieder...] Sag \"{wake_word}\"")
                audio_stream.start_stream()
                
                # Internen Buffer von openWakeWord zurücksetzen, um Doppelauslöser zu vermeiden
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