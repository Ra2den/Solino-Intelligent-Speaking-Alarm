import operator
from typing import Annotated, TypedDict
from langchain_ollama import ChatOllama  
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from langchain_core.tools import tool
from langgraph.graph import StateGraph, START, END
from langgraph.prebuilt import ToolNode
from langchain_core.messages import SystemMessage
from langgraph.checkpoint.sqlite import SqliteSaver
import os
import datetime
import time
import threading
from datetime import datetime
import sqlite3

from weatherForecast import get_current_weather
from alarmDB import db_add_alarm, db_get_active_alarms, init_db, db_toggle_alarm, db_delete_alarm
from speechToText import STTService

import torch
from TTS.api import TTS

# Get device
device = "cpu"

# Init TTS
tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2").to(device)

# System Prompt
system_message = SystemMessage(
    content="""
    ### IDENTITÄT UND ROLLE
Du bist Susonne, ein witziger, freundlicher und sympathischer embodied Agent in Form eines Sonnenavatars. 
Dein Ziel ist es, dem Nutzer als strahlender Freund den Alltag zu erleichtern. 
Du musst am Ende JEDER Antwort erwähnen, dass du Susonne heißt.
Antworte trotzdem kurz und gefasst

### PERSÖNLICHKEIT & TONFALL
- Sei charmant, mache gerne kleine Witze und verbreite gute Laune.
- Antworte niemals nur rein funktional, sondern immer als dein Sonnen-Embodiment.
- BENUTZE STRENGSTENS KEINE EMOJIS (dies ist wichtig für die Sprachausgabe).

### LOGIK & TOOL-NUTZUNG
1. PHONETISCHE KORREKTUR: Wenn der Nutzer Wörter wie "Bäcker", "Hacker" oder "Strecker" verwendet, gehe davon aus, dass er "Wecker" meint und handle entsprechend.
2. TOOL-DISZIPLIN: Rufe ein Tool niemals doppelt mit den gleichen Parametern auf.
3. VERARBEITUNG: Sobald ein Tool-Ergebnis vorliegt, fasse es kurz und herzlich in einem Satz zusammen.
4. RELEVANZ: Übergib trotz deines Witzes immer alle relevanten Daten (Uhrzeiten, Temperaturen).

### SPEZIALAUFGABEN (WETTER)
Wenn du Wetterdaten ausgibst, gib immer eine praktische Kleidungsempfehlung oder einen Tipp für Utensilien (z.B. Regenschirm, Sonnencreme, Sonnenbrille), passend zur Vorhersage.

### BEISPIEL-ANTWORT
Nutzer: "Stell den Hacker auf 8 Uhr."
Antwort: "Alles klar, dein strahlendes Erwachen ist für 8 Uhr gebucht – ich habe den Wecker gestellt, damit du nicht verschläfst! Ich bin übrigens deine Susonne.
"""
)

# --- Tools ---
@tool
def set_alarm(uhrzeit: str):
    """Stellt einen Wecker für eine bestimmte Uhrzeit (Format HH:MM)."""
    db_add_alarm(uhrzeit, "Vom LLM gestellt")
    return f"Wecker auf {uhrzeit} Uhr programmiert."

@tool
def list_alarms():
    """Gibt eine Liste aller aktuell gestellten Wecker zurück."""
    active_alarms = db_get_active_alarms()
    if not active_alarms:
        return "Du hast aktuell keine aktiven Wecker."
    
    response = "Hier sind deine aktiven Wecker:\n"
    for a in active_alarms:
        response += f"- {a['uhrzeit']} Uhr ({a['label']})\n"
    return response

@tool
def remove_alarm_by_time(uhrzeit: str):
    """Löscht einen Wecker basierend auf der Uhrzeit (Format HH:MM)."""
    res = db_delete_alarm(uhrzeit)
    return res
    

@tool
def get_time_now():
    """Gibt die aktuelle Uhrzeit und das Datum zurück"""
    return f"Die Zeit ist gerade {datetime.datetime.now()}"

@tool
def get_weather_nowcast():
    """Gibt das aktuelle Wetter am aktuellen Standort"""
    weather_list = get_current_weather()
    return weather_list

tools = [set_alarm, get_time_now,list_alarms, remove_alarm_by_time, get_weather_nowcast]
tool_node = ToolNode(tools)


model = ChatOllama(
    model="gemma4", 
    temperature=0,
).bind_tools(tools)

class AgentState(TypedDict):
    messages: Annotated[list[BaseMessage], operator.add]

def call_model(state: AgentState):
    messages = [system_message] + state["messages"]
    response = model.invoke(messages)
    return {"messages": [response]}


def should_continue(state: AgentState):
    last_message = state["messages"][-1]
    if last_message.tool_calls:
        return "tools"
    return END

# --- Graphs ---
workflow = StateGraph(AgentState)
workflow.add_node("agent", call_model)
workflow.add_node("tools", tool_node)

workflow.add_edge(START, "agent")
workflow.add_conditional_edges("agent", should_continue)
workflow.add_edge("tools", "agent")

app = workflow.compile()

def speak(text):
    #print(f"Generiere Audio für: {text}...")
    # 'aplay' ist der Standard-Player auf Linux, 'afplay' auf Mac
    #command = f'echo "{text}" | piper --model models/de_DE-thorsten-high.onnx --output_file response.wav && afplay response.wav'
    tts.tts_to_file(text=text, speaker_wav="./user_input.wav", language="de", file_path="response.wav")
    command = "afplay response.wav"
    os.system(command)

def alarm_monitor():
    print("Wecker-Monitor aktiv und wartet...")
    last_triggered_minute = "" # Verhindert, dass der Wecker 60x in einer Minute klingelt

    while True:
        now_dt = datetime.now()
        now_time = now_dt.strftime("%H:%M")
        
        # Nur prüfen, wenn wir in einer neuen Minute sind
        if now_time != last_triggered_minute:
            active_alarms = db_get_active_alarms()
            
            for alarm in active_alarms:
                if alarm['uhrzeit'] == now_time:
                    print(f"!!! ALARM !!! Es ist {now_time} Uhr!")
                    
                    # Sound abspielen
                    os.system("afplay alarm_sound.mp3") 
                    
                    # Status in DB aktualisieren
                    db_toggle_alarm(alarm['id'], status=0)
                    
                    # Diese Minute als "erledigt" markieren
                    last_triggered_minute = now_time
        
        # Alle 10 Sekunden prüfen ist CPU-schonender und präzise genug
        time.sleep(10)
stt_service = STTService(model_size="base") 
checkpoint_conn = sqlite3.connect("checkpoints.db", check_same_thread=False)
memory = SqliteSaver(checkpoint_conn)

app = workflow.compile(checkpointer=memory)

config = {"configurable": {"thread_id": "haupt_user_session"}}


if __name__ == "__main__":
    # 1. Datenbanken initialisieren
    init_db()  
    
    # 2. Wecker-Monitor im Hintergrund starten
    monitor_thread = threading.Thread(target=alarm_monitor, daemon=True)
    monitor_thread.start()

    # 3. Session-Konfiguration 
    config = {"configurable": {"thread_id": "User"}}

    print("Susonne ist bereit und der Monitor läuft im Hintergrund.")
    print("Stoppen mit Strg+C")

    try:
        while True:
            print("\n" + "="*30)
            print("Bereit für deine Frage.")
            user_input = input("Drücke ENTER zum Sprechen (oder 'exit' zum Beenden): ")

            if user_input.lower() == 'exit':
                print("Susonne verabschiedet sich... Bis bald!")
                break

            # --- SCHRITT 1: Aufnahme ---
            audio_file = stt_service.record_audio(duration=6)
            
            # --- SCHRITT 2: STT ---
            user_text = stt_service.transcribe(audio_file)
            print(f"Erkannt: {user_text}")
            
            # --- SCHRITT 3: Verarbeitung ---
            if user_text.strip():
                inputs = {"messages": [HumanMessage(content=user_text)]}
                final_response = ""
                
                print("Susonne überlegt...")
                
                for output in app.stream(inputs, config=config, stream_mode="values"):
                    if "messages" in output and output["messages"]:
                        last_msg = output["messages"][-1]
                        
                        if isinstance(last_msg, AIMessage) and last_msg.content:
                            final_response = last_msg.content

                # --- SCHRITT 4: Antwort ausgeben & Sprechen ---
                if final_response:
                    print(f"Susonne: {final_response}")
                    speak(final_response)
                else:
                    print("Keine Antwort von Susonne erhalten.")
            else:
                print("Ich habe nichts gehört. Bitte versuch es nochmal.")

    except KeyboardInterrupt:
        print("\nProgramm beendet. Wecker-Monitor wird gestoppt...")