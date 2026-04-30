import wave
import pyaudio
import os
from faster_whisper import WhisperModel
import struct
import math

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
        p = pyaudio.PyAudio()
        stream = p.open(format=self.format,
                        channels=self.channels,
                        rate=self.rate,
                        input=True,
                        frames_per_buffer=self.chunk)

        frames = []
        print(f"Höre zu... ")

        audio_break = 0

        while(audio_break < 15):
            data = stream.read(self.chunk)
            frames.append(data)
            
            count = len(data) / 2
            format_string = "%dh" % count
            shorts = struct.unpack(format_string, data)
            
            sum_squares = sum(s**2 for s in shorts)
            rms = math.sqrt(sum_squares / count)
            
            
            level = int((rms / 32768.0) * 300) 
            print(f"LEVEL : {level}")
            if level <= 2:
                audio_break = audio_break + 1
            else:
                audio_break = 0
            print(f"BREAK : {audio_break}")

        print("\nAufnahme beendet.")
        
        stream.stop_stream()
        stream.close()
        p.terminate()

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