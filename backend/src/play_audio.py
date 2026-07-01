import sys
import os
import argparse
import soundfile as sf
import pyaudio
import numpy as np

def play(audio_path, volume_percent):
    if not os.path.exists(audio_path):
        print(f"File not found: {audio_path}", file=sys.stderr)
        sys.exit(1)
        
    try:
        data, fs = sf.read(audio_path)
    except Exception as e:
        print(f"Error reading audio file: {e}", file=sys.stderr)
        sys.exit(1)
    
    # Apply volume adjustment (0 to 100 percent)
    volume_decimal = max(0, min(100, volume_percent)) / 100.0
    data = data * volume_decimal
    
    # Ensure float precision is compatible with PyAudio
    if data.dtype == np.float64:
        data = data.astype(np.float32)
        
    channels = 1 if len(data.shape) == 1 else data.shape[1]
    
    if data.dtype == np.float32:
        pa_format = pyaudio.paFloat32
    elif data.dtype == np.int16:
        pa_format = pyaudio.paInt16
    elif data.dtype == np.int8:
        pa_format = pyaudio.paInt8
    elif data.dtype == np.uint8:
        pa_format = pyaudio.paUInt8
    else:
        data = data.astype(np.float32)
        pa_format = pyaudio.paFloat32
        
    p = pyaudio.PyAudio()
    try:
        stream = p.open(
            format=pa_format,
            channels=channels,
            rate=int(fs),
            output=True
        )
        
        # Write the audio data to the PyAudio stream
        stream.write(data.tobytes())
        
        stream.stop_stream()
        stream.close()
    except Exception as e:
        print(f"PyAudio playback error: {e}", file=sys.stderr)
        sys.exit(1)
    finally:
        p.terminate()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Play an audio file using PyAudio and SoundFile.")
    parser.add_argument("audio_path", help="Path to the audio file.")
    parser.add_argument("--volume", type=int, default=100, help="Volume percentage (0-100).")
    args = parser.parse_args()
    play(args.audio_path, args.volume)
