# Backend

## Overview

The backend contains the core Python logic for Solino:

- `backend/src/poc.py` orchestrates voice recording, speech-to-text, AI intent handling, alarm monitoring, and TTS output
- `backend/src/speechToText.py` records audio and transcribes German speech using `faster-whisper`
- `backend/src/alarmDB.py` stores alarms in `alarms.db`
- `backend/src/weatherForecast.py` retrieves weather data from OpenWeatherMap

## Prerequisites

- Python 3.11 or 3.12
- `venv` and `pip`
- `ollama` installed and `gemma4` available
- `piper` installed for TTS
- `afplay` on macOS or `aplay` on Linux for audio playback
- OpenWeatherMap API key for weather requests

## Setup

1. Open a terminal in `backend/`
2. Create and activate the virtual environment:

   macOS/Linux:

   ```bash
   python -m venv venv
   source venv/bin/activate
   ```

   Windows PowerShell:

   ```powershell
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   ```

   Windows Command Prompt:

   ```bat
   python -m venv venv
   .\venv\Scripts\activate.bat
   ```

3. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file in `backend/` with your OpenWeatherMap API key:

   ```env
   API_KEY=your_openweathermap_api_key_here
   ```

5. Ensure Ollama is running with `gemma4`:

   ```bash
   ollama run gemma4
   ```

6. Download the Piper voice model into `backend/models/`:
   ```bash
   mkdir -p backend/models
   cd backend/models
   curl -L "https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/de/de_DE/thorsten/high/de_DE-thorsten-high.onnx?download=true" -o de_DE-thorsten-high.onnx
   curl -L "https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/de/de_DE/thorsten/high/de_DE-thorsten-high.onnx.json?download=true" -o de_DE-thorsten-high.onnx.json
   curl -L "https://huggingface.co/rhasspy/piper-voices/resolve/main/de/de_DE/kerstin/low/de_DE-kerstin-low.onnx?download=true" -o de_DE-kerstin-low.onnx
   curl -L "https://huggingface.co/rhasspy/piper-voices/resolve/main/de/de_DE/kerstin/low/de_DE-kerstin-low.onnx.json?download=true" -o de_DE-kerstin-low.onnx.json
   ```

7. If macOS: Install Portaudio: 
    ```
    export CFLAGS="-I$(brew --prefix portaudio)/include"
    export LDFLAGS="-L$(brew --prefix portaudio)/lib"
    pip install pyaudio
    ```

## Run the backend

From the `backend/` directory with the virtual environment active:

```bash
python src/main.py
```

The script will:

- record a short voice sample
- transcribe speech to text
- send your command to the Ollama agent
- speak the AI response aloud
- keep monitoring alarms in the background

## Notes

- The alarm database file `alarms.db` is created automatically.
- On Linux, if audio playback fails, replace `afplay` with `aplay` in `backend/src/poc.py`.
- The system expects German audio input and weather data.

## Troubleshooting

- If weather requests fail, verify `API_KEY` in `backend/.env`
- If voice recording fails, confirm your microphone is available and PyAudio can access it
- If TTS fails, confirm `backend/models/de_DE-thorsten-high.onnx` exists
