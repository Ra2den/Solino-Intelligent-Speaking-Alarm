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

1. Open a terminal in `backend/`
2. Follow the backend setup in `backend/README.md`
3. Open a separate terminal in `frontend/`
4. Follow the frontend setup in `frontend/README.md`

## Notes

- The backend depends on an OpenWeatherMap API key stored in `backend/.env`
- The backend requires Ollama and a local `gemma4` model
- The backend downloads a Piper TTS voice model into `backend/models/`
- On macOS the audio playback command uses `afplay`; on Linux use `aplay`

## More information

- [Frontend README](frontend/README.md)
- [Backend README](backend/README.md)
