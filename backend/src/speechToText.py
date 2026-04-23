import wave
import pyaudio
import os
from faster_whisper import WhisperModel

class STTService:
    def __init__(self, model_size="base"):
        print(f"Lade Whisper-Modell '{model_size}' auf CPU...")
        self.model = WhisperModel(
            model_size, 
            device="cpu", 
            compute_type="int8"
        )
        self.format = pyaudio.paInt16
        self.channels = 1
        self.rate = 16000
        self.chunk = 1024

    def record_audio(self, duration=6, filename="user_input.wav"):
        """Nimmt Audio mit PyAudio auf."""
        p = pyaudio.PyAudio()
        
        print(f"Höre zu für {duration} Sekunden...")
        
        stream = p.open(format=self.format,
                        channels=self.channels,
                        rate=self.rate,
                        input=True,
                        frames_per_buffer=self.chunk)

        frames = []

        # Aufnahme-Loop
        for _ in range(0, int(self.rate / self.chunk * duration)):
            data = stream.read(self.chunk)
            frames.append(data)

        print("Aufnahme beendet.")

        # Stream stoppen und schließen
        stream.stop_stream()
        stream.close()
        p.terminate()

        # Als WAV speichern
        wf = wave.open(filename, 'wb')
        wf.setnchannels(self.channels)
        wf.setsampwidth(p.get_sample_size(self.format))
        wf.setframerate(self.rate)
        wf.writeframes(b''.join(frames))
        wf.close()
        
        return filename

    def transcribe(self, audio_path):
        """Wandelt die WAV-Datei in Text um."""
        if not os.path.exists(audio_path):
            return ""
        segments, info = self.model.transcribe(audio_path, beam_size=5, language="de")
        text = "".join([segment.text for segment in segments])
        return text.strip()