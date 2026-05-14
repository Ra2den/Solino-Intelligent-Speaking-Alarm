# 🚀 Setup-Anleitung
## 🔧 Einmaliges Setup
### 1. Miniconda installieren
https://www.anaconda.com/download/success
### 2. Conda Environment erstellen
```bash
conda create --name solino2 python=3.11
conda activate solino2
cd backend
pip install -r requirements.txt
pip install pyaudio
```
---

### 3. Environment-Variablen konfigurieren

Erstelle im Projektverzeichnis eine .env Datei:

API_KEY=your_openweathermap_api_key_here

---

### 4. Ollama installieren

Installiere Ollama gemäß der offiziellen Anleitung für dein Betriebssystem.

https://ollama.com/

---

### 5. Piper Voice Modelle herunterladen

```
mkdir -p backend/models
cd backend/models
# Thorsten (high quality)
curl -L "https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/de/de_DE/thorsten/high/de_DE-thorsten-high.onnx?download=true" -o de_DE-thorsten-high.onnx
curl -L "https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/de/de_DE/thorsten/high/de_DE-thorsten-high.onnx.json?download=true" -o de_DE-thorsten-high.onnx.json
# Kerstin (low quality)
curl -L "https://huggingface.co/rhasspy/piper-voices/resolve/main/de/de_DE/kerstin/low/de_DE-kerstin-low.onnx?download=true" -o de_DE-kerstin-low.onnx
curl -L "https://huggingface.co/rhasspy/piper-voices/resolve/main/de/de_DE/kerstin/low/de_DE-kerstin-low.onnx.json?download=true" -o de_DE-kerstin-low.onnx.json
```
---

## ▶️ Anwendung starten

Für den Betrieb werden mehrere Terminal-Tabs benötigt:

---

### 1. Frontend starten
```
cd frontend
npm run dev
```
---

### 2. Backend (KI / DB) starten
```
cd backend/src
conda activate solino
python main.py
```
---

### 3. API starten (FastAPI)
```
cd backend/src
conda activate solino
fastapi dev api.py
```
---

### 4. LLM starten (mit Ollama)
```
ollama run gemma4
```
---

💡 Hinweise

* Stelle sicher, dass dein Conda-Environment aktiviert ist, bevor du Backend oder API startest.
* Prüfe, ob alle Ports frei sind (Frontend, Backend, API).
* Falls Audio-Probleme auftreten, überprüfe die Installation von pyaudio.

