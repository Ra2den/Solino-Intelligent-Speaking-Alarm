# Setup Guide

## One-Time Setup

### 1. Install Miniconda

Download and install Miniconda:

https://www.anaconda.com/download/success

### 2. Create the Conda environment

```bash
conda create --name solino python=3.11
conda activate solino
cd backend
pip install -r requirements.txt
```

Note:
- `PyAudio` is already included in `backend/requirements.txt`.
- If `PyAudio` fails to build on your machine, install the required system audio libraries first and then rerun `pip install -r requirements.txt`.

### 3. Configure environment variables

Create the file `backend/.env`:

```env
API_KEY=your_openweathermap_api_key_here
```

To test without an OpenWeatherMap API key, enable mock weather data instead.
This returns forged weather data (in the OpenWeatherMap format) for all
`/weather/*` endpoints, with no network calls or API key required:

```env
MOCK_WEATHER=true
```

Mock weather is also enabled automatically whenever `API_KEY` is unset.

### 4. Install Ollama

Install Ollama for your operating system:

https://ollama.com/

### 5. Download the Piper voice models

```bash
mkdir -p backend/assets/models
cd backend/assets/models

# Thorsten (high quality)
curl -L "https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/de/de_DE/thorsten/high/de_DE-thorsten-high.onnx?download=true" -o de_DE-thorsten-high.onnx
curl -L "https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/de/de_DE/thorsten/high/de_DE-thorsten-high.onnx.json?download=true" -o de_DE-thorsten-high.onnx.json

# Kerstin (low quality)
curl -L "https://huggingface.co/rhasspy/piper-voices/resolve/main/de/de_DE/kerstin/low/de_DE-kerstin-low.onnx?download=true" -o de_DE-kerstin-low.onnx
curl -L "https://huggingface.co/rhasspy/piper-voices/resolve/main/de/de_DE/kerstin/low/de_DE-kerstin-low.onnx.json?download=true" -o de_DE-kerstin-low.onnx.json
```

## Start the Project

The project has two different backend entrypoints:

- `backend/src/api/main.py`: FastAPI server for the frontend
- `backend/src/main.py`: optional voice CLI for talking to the assistant directly

For normal frontend development, the FastAPI server is the important one.

### 1. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

### 2. Start the FastAPI server

Run this from `backend/src` because the backend imports are rooted there.

```bash
cd backend/src
conda activate solino
fastapi dev api/main.py
```

By default this binds to `127.0.0.1` (localhost only). To reach it from another
device on the network, bind to all interfaces:

```bash
fastapi dev api/main.py --host 0.0.0.0
```

The frontend dev server needs the same treatment (`npm run dev -- --host`), and
make sure port `8000` is open in your firewall.

### 3. Optional: start the CLI assistant

This is only needed if you want to use the microphone/voice CLI directly.

```bash
cd backend/src
conda activate solino
python assistant_cli.py
```

### 4. Start Ollama

```bash
ollama serve
```

### 5. Start the local model in Ollama

```bash
ollama run gemma4
```

### 6. Start Communication with Assistant
Return to the Terminal Tab of Step 3 and press ENTER to speak with the assistant.

## Notes

- Activate the `solino` Conda environment before starting backend commands.
- The FastAPI server and the CLI are separate processes.
- The backend stores the SQLite database in `backend/data/alarms.db`.
- Piper models are loaded from `backend/assets/models`.
- Generated assistant audio is written to `backend/assets/audio`.
- Alarm sounds are loaded from `backend/assets/sounds`.
- On macOS audio playback uses `afplay`; on Linux use `aplay`.
