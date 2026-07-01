#!/bin/bash

# Farben für bessere Terminal-Ausgabe
GREEN='\033[032m'
YELLOW='\033[033m'
RED='\033[031m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Solino Intelligent Speaking Alarm Control Hub (venv Edition) ===${NC}"
echo "1) Erstmaliges Setup ausführen (Installation & Downloads)"
echo "2) Projekt starten (FastAPI, Frontend, Ollama & CLI)"
read -p "Wähle eine Option (1-2): " OPTION

# Ermittle das absolute Verzeichnis dieses Skripts
PROJECT_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$PROJECT_ROOT"

if [ "$OPTION" == "1" ]; then
    echo -e "\n${YELLOW}[1/5] Erstelle Python venv...${NC}"
    cd "$PROJECT_ROOT/backend"
    # Erstellt ein natives venv namens 'venv'
    python3 -m venv venv
    
    echo -e "\n${YELLOW}[2/5] Installiere Python-Requirements im venv...${NC}"
    source venv/bin/activate
    pip install --upgrade pip
    pip install -r requirements.txt

    echo -e "\n${YELLOW}[3/5] Erstelle .env Datei...${NC}"
    if [ ! -f ".env" ]; then
        echo "API_KEY=your_openweathermap_api_key_here" > .env
        echo -e "${GREEN}✅ .env wurde erstellt. Bitte passe deinen OpenWeatherMap API_KEY darin an!${NC}"
    else
        echo "ℹ️ .env existiert bereits. Übersprungen."
    fi

    echo -e "\n${YELLOW}[4/5] Installiere Frontend-Abhängigkeiten...${NC}"
    cd "$PROJECT_ROOT/frontend"
    npm install

    echo -e "\n${YELLOW}[5/5] Bereite Ollama vor...${NC}"
    echo -e "${RED}⚠️ Bitte stelle sicher, dass Ollama installiert ist und läuft! (https://ollama.com)${NC}"
    echo "Versuche, das Modell gemma4 in Ollama zu laden..."
    ollama run gemma4 "Hallo"

    echo -e "\n${GREEN}🎉 Setup abgeschlossen! Starte das Skript erneut und wähle Option 2, um loszulegen.${NC}"

elif [ "$OPTION" == "2" ]; then
    echo -e "\n${GREEN}🚀 Starte alle Projektkomponenten...${NC}"
    
    # 1. Starte Ollama im Hintergrund, falls es noch nicht läuft
    if ! pgrep -x "ollama" > /dev/null; then
        echo -e "${YELLOW}🤖 Starte Ollama Server im Hintergrund...${NC}"
        ollama serve &
        sleep 2
    fi

    # 2. Frontend in einem neuen Terminal-Fenster starten
    echo -e "${YELLOW}💻 Starte Vite Frontend...${NC}"
    osascript -e "tell application \"Terminal\" to do script \"cd '$PROJECT_ROOT/frontend' && npm run dev\""

    # 3. FastAPI Server in einem neuen Terminal-Fenster starten (mit venv-Aktivierung)
    echo -e "${YELLOW}⚡ Starte FastAPI Server...${NC}"
    osascript -e "tell application \"Terminal\" to do script \"cd '$PROJECT_ROOT/backend' && source venv/bin/activate && cd src && fastapi dev api/main.py\""

    # 4. Das CLI-Skript direkt im aktuellen Hauptfenster ausführen
    echo -e "${GREEN}🎙️ Starte Sprach-CLI im aktuellen Fenster...${NC}"
    cd "$PROJECT_ROOT/backend"
    source venv/bin/activate
    cd src
    python assistant_cli.py
    
    # Nach dem Beenden der CLI das venv deaktivieren
    deactivate

else
    echo -e "${RED}Ungültige Auswahl. Abbruch.${NC}"
fi