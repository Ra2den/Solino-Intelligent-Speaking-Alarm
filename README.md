# Solino - An Intelligent AI-powered Speaking Alarm

Solino is a hybrid voice alarm system that combines speech recognition, AI intent handling, weather awareness, and text-to-speech output.

## What it does

- Listens for spoken user commands via microphone
- Uses Whisper-based STT to transcribe German speech
- Routes commands through an Ollama AI agent (`gemma4`)
- Sets, lists, and removes alarms in a local SQLite database
- Provides current time and weather information
- Reads responses aloud using a downloaded Piper voice model

## Repository structure

- `backend/` - Python backend logic, AI orchestration, alarm database, speech-to-text, and weather tools
- `frontend/` - React + TypeScript + Vite user interface

## Quick start

1. Perform the one-time setup steps in [`setup.md`](setup.md).
2. Run the cross-platform startup script in the root directory:
   ```bash
   python start.py
   ```
   This will automatically start Ollama, the frontend dev server, and the FastAPI backend server, and run them concurrently.
   
   To start the interactive voice CLI assistant directly in your current terminal (while running the background services silently in the background), run:
   ```bash
   python start.py --assistant
   ```

## Notes

- The backend depends on an OpenWeatherMap API key stored in `backend/.env`
- The backend requires Ollama and a local `gemma4` model
- The backend loads Piper TTS voice models from `backend/assets/models/`
- The backend stores generated audio in `backend/assets/audio/`
- The backend stores the SQLite database in `backend/data/alarms.db`
- On macOS the audio playback command uses `afplay`; on Linux use `aplay`

## More information

- [Setup Guide](setup.md)
