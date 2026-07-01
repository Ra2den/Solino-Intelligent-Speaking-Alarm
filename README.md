# Solino — Intelligent AI-Powered Speaking Alarm

Solino is a hybrid smart voice alarm system that blends offline speech recognition, local LLM-powered intent processing, real-time weather integration, Tagesschau news scraping, and text-to-speech feedback. 

With both a modern React web dashboard and a Raspberry Pi-driven physical alarm dock, Solino is designed to be interactive, contextual, and run entirely locally.

---

## Key Features

*   **Offline Voice Interaction**: Detects local wake words (e.g., "Hey Jarvis") via OpenWakeWord and transcribes German voice commands using Faster-Whisper.
*   **Local Agentic AI**: Orchestrated with LangGraph and LangChain (via local Ollama `gemma4`) to support complex multi-turn reasoning, tool calling, and SQLite session memory checkpoints.
*   **Voice Cloning & Speech Synthesis**: Generates cloned voice responses using OmniVoice (referenced from a custom `user_input.wav`), with local Piper TTS (Thorsten and Kerstin voices) as a robust offline fallback.
*   **Weather & News Integration**: Real-time integration with OpenWeatherMap APIs (with custom German clothing recommendations) and the Tagesschau news feed to read headlines and detailed articles.
*   **Web Dashboard**: A premium, responsive control dashboard built with React 19, TypeScript, Vite, featuring fluid GSAP animations and TailwindCSS v4.
*   **Hardware Dock**: Supports Raspberry Pi with custom WS2812B LED strip animations, automatic DSI touchscreen dimming, and BLE sensors reading XIAO nRF52840 pressure plates to track bed presence.

---

## Repository Structure

The project is structured into three self-contained domains:

*   **[`backend/`](backend/README.md)** — FastAPI server, LangGraph AI orchestration, Faster-Whisper speech-to-text, OmniVoice cloning, Piper TTS models, and SQLite database.
*   **[`frontend/`](frontend/README.md)** — React, TypeScript, Vite, TailwindCSS v4, and GSAP single-page dashboard.
*   **[`hardware/`](hardware/README.md)** — Raspberry Pi control server, CircuitPython Neopixel drivers, and Seeed XIAO nRF52840 BLE bed sensor firmware.

---

## Quick Start (Preview & Demonstration)

For professors, reviewers, and users wanting to run and preview the entire system quickly, the root directory provides a cross-platform launcher script: **`start.py`**.

### Prerequisites

Before running the preview, ensure you have the following installed on your machine:
1.  **Python 3.11 (exactly)**
2.  **Node.js (v18 or later) & npm**
3.  **Ollama**: Install from [ollama.com](https://ollama.com/) and make sure the desktop app is running.
4.  **Microphone**: A working input microphone is required for the voice assistant.

### Launching the Preview

1.  **Configure a virtual environment** (if not already set up):
    *   **Option A: Conda (Recommended)**:
        ```bash
        conda create --name solino python=3.11
        conda activate solino
        cd backend
        pip install -r requirements.txt
        cd ..
        ```
    *   **Option B: Virtualenv**:
        ```bash
        cd backend
        python -m venv venv
        # Windows Powershell: .\venv\Scripts\Activate.ps1
        # macOS / Linux: source venv/bin/activate
        pip install -r requirements.txt
        cd ..
        ```
2.  **Install Frontend dependencies**:
    ```bash
    cd frontend
    npm install
    cd ..
    ```
3.  **Run the Solino Launcher**:
    ```bash
    python start.py
    ```
    This script will automatically:
    *   Detect your active virtualenv or Conda environment.
    *   Start Ollama (if not already running).
    *   Verify and download the local **`gemma4`** LLM model (9.6 GB, first-time only).
    *   Verify and download missing **Piper TTS** voice models into `backend/assets/models/`.
    *   Launch the FastAPI backend server (port 8000) and the Vite frontend dev server (port 5173).

4.  **Try the Interactive Voice CLI**:
    To speak with the AI assistant using your microphone, restart the launcher script with the `--assistant` flag:
    ```bash
    python start.py --assistant
    ```
    This launches the voice client in your terminal. It handles microphone audio capture and sends state updates to the FastAPI backend, which synchronizes the animated sun avatar and status indicators on the React dashboard in real-time.
    
    Say **"Hey Jarvis"** (or the detected wake word shown in the terminal) to activate the assistant, and ask commands like:
    *   *"Wie wird das Wetter heute in München?"* (How is the weather today in Munich?)
    *   *"Gibt es Neuigkeiten von heute?"* (Is there any news today?)
    *   *"Stelle einen Wecker für morgen früh um 7 Uhr."* (Set an alarm for tomorrow morning at 7 AM.)
    *   *"Welche Wecker sind aktiv?"* (Which alarms are active?)

---

## Development Setup & Technical Details

For detailed development instructions, API endpoints, hardware diagrams, and testing guides, please refer to the domain-specific documentation:

*   **[Backend Developer Guide](backend/README.md)** — Detailed steps on Piper configurations, SQLite database migrations, testing, and mock environment configurations.
*   **[Frontend Developer Guide](frontend/README.md)** — Detailed instructions on React structure, testing, and building the web dashboard for production.
*   **[Hardware & Deployment Guide](hardware/README.md)** — Raspberry Pi pin mappings, systemd service deployment, and Seeed XIAO BLE pressure sensor setup.

---

## Configuration (Optional)

By default, Solino will run with mock weather data and does not require internet connection once the models are downloaded. If you want real-time weather details:
1. Create a `.env` file inside `backend/`:
   ```env
   API_KEY=your_openweathermap_api_key_here
   ```
2. Retrieve an API Key from [OpenWeatherMap](https://openweathermap.org/).
