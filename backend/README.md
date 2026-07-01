# Backend

## Architecture & Overview

Solino's backend is built using FastAPI and structured around a clean domain-driven design, utilizing advanced local AI orchestration libraries.

### Key Technologies
*   **LangGraph & LangChain**: Drives the core agentic reasoning loops, tool routing, and memory savers (using memory checkpointers).
*   **Ollama (Gemma 4)**: Serves as the local LLM engine for intent classification and witty assistant dialogs.
*   **OmniVoice**: Performs high-fidelity voice cloning using a custom reference audio file (`backend/assets/audio/user_input.wav`).
*   **Piper TTS (Fallback)**: Fast, local speech synthesis using ONNX models (Thorsten and Kerstin voices) if no voice clone file is present.
*   **Faster-Whisper**: Provides fast, offline Speech-To-Text transcription for German voice input.
*   **OpenWakeWord**: Detects wake words (e.g., "Hey Jarvis") locally via real-time microphone stream.
*   **SQLite & aiosqlite**: Manages alarm databases and tracks agent session checkpoints.

### Directory Structure

All core backend logic is situated inside `backend/src/`:
*   `backend/src/assistant_cli.py`: Entry point to start the interactive terminal microphone assistant.
*   `backend/src/play_audio.py`: Cross-platform audio playback runner.
*   `backend/src/api/`: FastAPI routes serving HTTP endpoints for the React dashboard.
*   `backend/src/db/`: Database configuration, entity mapping, and repository layers.
*   `backend/src/domain/`: Domain-driven service implementations:
    *   `alarms/`: Alarm tracking, scheduling, triggering, and playback player.
    *   `assistant/`: Wake-word monitoring, faster-whisper transcribing, LangGraph agent workflows, and TTS (OmniVoice / Piper).
    *   `weather/`: Weather service integration with OpenWeatherMap API.
    *   `news/`: Local news scraping and full-article fetching from the Tagesschau API.
    *   `settings/`: Persistence for custom voice preferences.

## Prerequisites

- Python 3.11 (exactly)
- `venv` and `pip`
- `ollama` installed and `gemma4` running
- A working microphone (for interactive voice CLI)
- System audio library (e.g., `portaudio` on macOS/Linux)

## Setup

### Option A: Conda (Recommended)

1. Open a terminal in `backend/`.
2. Create the Conda environment and activate it:
   ```bash
   conda create --name solino python=3.11
   conda activate solino
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

### Option B: Standard `venv`

1. Open a terminal in `backend/`.
2. Create and activate the virtual environment:

   *   **macOS/Linux**:
       ```bash
       python -m venv venv
       source venv/bin/activate
       ```
   *   **Windows PowerShell**:
       ```powershell
       python -m venv venv
       .\venv\Scripts\Activate.ps1
       ```
   *   **Windows Command Prompt**:
       ```bat
       python -m venv venv
       .\venv\Scripts\activate.bat
       ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

---

### Configuration & Model Download

4. Create a `.env` file in `backend/` with your OpenWeatherMap API key:
   ```env
   API_KEY=your_openweathermap_api_key_here
   ```
   *(If left blank or unset, Solino will automatically activate mock weather data so you can test local functionality without an API key).*

5. Ensure Ollama is running with the `gemma4` model:
   ```bash
   ollama run gemma4
   ```

6. Download the Piper voice models into `backend/assets/models/`:
   ```bash
   mkdir -p backend/assets/models
   cd backend/assets/models
   
   # Thorsten Voice (high quality)
   curl -L "https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/de/de_DE/thorsten/high/de_DE-thorsten-high.onnx?download=true" -o de_DE-thorsten-high.onnx
   curl -L "https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/de/de_DE/thorsten/high/de_DE-thorsten-high.onnx.json?download=true" -o de_DE-thorsten-high.onnx.json
   
   # Kerstin Voice (low quality)
   curl -L "https://huggingface.co/rhasspy/piper-voices/resolve/main/de/de_DE/kerstin/low/de_DE-kerstin-low.onnx?download=true" -o de_DE-kerstin-low.onnx
   curl -L "https://huggingface.co/rhasspy/piper-voices/resolve/main/de/de_DE/kerstin/low/de_DE-kerstin-low.onnx.json?download=true" -o de_DE-kerstin-low.onnx.json
   ```

7. **macOS PyAudio Installation Note**:
   If `pip install -r requirements.txt` fails to build PyAudio on macOS, you may need to install `portaudio` via Homebrew first:
   ```bash
   brew install portaudio
   export CFLAGS="-I$(brew --prefix portaudio)/include"
   export LDFLAGS="-L$(brew --prefix portaudio)/lib"
   pip install pyaudio
   ```

## Run the backend manually

Ensure your virtual environment is active, then navigate to the `backend/src/` directory (commands must be run from inside `src` so that Python imports resolve correctly):

```bash
cd src
```

### 1. Start the FastAPI Server (for Frontend dashboard)

To start the API web server to connect to the React frontend:
```bash
fastapi dev api/main.py
```
By default, this binds to `127.0.0.1:8000`. To reach it from another device on the network, bind to all interfaces:
```bash
fastapi dev api/main.py --host 0.0.0.0
```

### 2. Start the Interactive CLI Assistant (Optional - Voice Client)

*(This step is optional. Run this if you want to enable microphone voice control. The CLI assistant handles local wake-word detection and microphone recording, and sends state updates to the FastAPI backend to synchronize the sun avatar animations and visual indicators on the React frontend dashboard).*

To start the CLI assistant:
```bash
python assistant_cli.py
```
This starts wake-word monitoring. Speak the wake word (e.g., "Hey Jarvis") to activate transcription and receive verbal responses.

## Notes

- The alarm database file `alarms.db` is created automatically.
- Audio playback is cross-platform, handled locally via `backend/src/play_audio.py` (which directly interfaces with **PyAudio / PortAudio**).
- The system expects German audio input and weather queries.

## Troubleshooting

- If weather requests fail, verify `API_KEY` in `backend/.env`
- If voice recording fails, confirm your microphone is available and PyAudio can access it.
- If TTS fails, confirm `backend/assets/models/de_DE-thorsten-high.onnx` exists.
