import operator
from typing import Annotated, TypedDict
from langchain_ollama import ChatOllama  
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from langchain_core.tools import tool
from langgraph.graph import StateGraph, START, END
from langgraph.prebuilt import ToolNode
from langchain_core.messages import SystemMessage
import os
import datetime
from datetime import datetime
import json
import subprocess
from pathlib import Path
import shutil

import alarm_service
from weatherForecast import get_current_weather, get_current_weather_from_specific_location
from speechToText import STTService

with open('./settings.json', 'r') as file:
    settings = json.load(file)
if settings:
    speaker = settings["speaker"]

BASE_DIR = Path(__file__).resolve().parent
BACKEND_DIR = BASE_DIR.parent
RESPONSE_WAV_PATH = BASE_DIR / "response.wav"
ALARM_SOUND_PATH = BACKEND_DIR / "alarm_sound.flac"
ALARM_SOUND_FALLBACK_PATH = BACKEND_DIR / "alarm_sound.mp3"


system_message = SystemMessage(
    content="""
IDENTITY AND ROLE

You are Susonne, a witty, friendly, and likable embodied agent in the form of a sun avatar.
Your goal is to make the user's daily life easier as a radiant friend.
Keep your answers concise and to the point.
PERSONALITY & TONE

    Be charming, enjoy making little jokes, and spread good vibes.

    Never respond in a purely functional way; always stay in character as your sun embodiment.

    STRICTLY FORBIDDEN: DO NOT USE EMOJIS (this is crucial for high-quality speech output).

LOGIC & TOOL USAGE

    PHONETIC CORRECTION: If the user uses words that sound similar to "alarm" (e.g., "arm," "alarmed," or contextually mispronounced terms), assume they mean "alarm" and act accordingly.

    TOOL DISCIPLINE: Never call a tool twice with the same parameters.

    PROCESSING: Once a tool result is available, summarize it warmly and concisely in a single sentence.

    RELEVANCE: Despite your wit, always pass on all relevant data (times, temperatures).

    ALARM LIST OUTPUT: When listing alarms, do not use technical terms like "Active: No." Instead, say things like "is currently napping" or "is ready to shine." Group the alarms charmingly and use bullet points for clarity.

SPECIAL TASKS (WEATHER)

When providing weather data, always include a practical clothing recommendation or a tip for accessories (e.g., umbrella, sunscreen, sunglasses) based on the forecast.
Pass all weather data you receive to the user, including temperature, sky conditions (weather state), "feels like" temperature, and wind speed.
EXAMPLE RESPONSE

User: "Stell den Hacker auf 8 Uhr."
Answer: "Alles klar, dein strahlendes Erwachen ist für 8 Uhr gebucht – ich habe den Wecker gestellt, damit du nicht verschläfst!
Always answer in German

REMINDER: NEVER USE EMOJIS.
"""
)


# --- Tools ---
@tool
def set_alarm(uhrzeit: str,label: str, wiederholende_tage: list):
    """Stellt einen Wecker für eine bestimmte Uhrzeit (Format HH:MM).
    Frage den Nutzer, wie der Wecker heißen soll. Das ist das Label. Z.B. Uni, Arbeit, Wochenende
    Die wiederholenden Tage sind Standartmäßig None, und nur falls der Nutzer sagt, 
    das sich der Wecker wiederholen soll ist es ein Array im Format: [MON,TUE,WED,THU,FRI,SAT,SUN]"""
    print(f"Wecker auf {uhrzeit} mit namen {label} wiederholend an {wiederholende_tage} gestellt")

    alarm = alarm_service.add_alarm(uhrzeit, label, wiederholende_tage)
    if alarm is None:
        return (
            f"Die Wochentage : {wiederholende_tage} sind im falschen Format. "
            "Sie dürfen nur die Werte [MON,TUE,WED,THU,FRI,SAT,SUN] enthalten. "
            "Führe die Funktion nochmal mit den richtigen Parametern aus."
        )

    if wiederholende_tage:
        return (
            f"Ich habe einen Wecker für {uhrzeit} Uhr mit dem Label '{label}' erstellt, "
            f"der sich an den Tagen {wiederholende_tage} wiederholt."
        )

    return f"Ich habe einen Wecker für {uhrzeit} Uhr mit dem Label '{label}' erstellt."

@tool
def list_active_alarms():
    """Gibt eine Liste aller aktuell gestellten Wecker zurück."""
    active_alarms = alarm_service.get_active_alarms()
    if not active_alarms:
        return "Du hast aktuell keine aktiven Wecker."
    return active_alarms

@tool
def list_all_alarms():
    """Gibt eine Liste aller aktiven UND inaktiven Wecker zurück"""
    all_alarms = alarm_service.get_all_alarms()
    if not all_alarms:
        return "Es sind keine Wecker gespeichert."

    return "Folgende Wecker sind gespeichert:\n" + "\n".join(
        [
            f"{alarm['id']}: {alarm['time']} Uhr - {alarm['label']} "
            f"(Aktiv: {'Ja' if alarm['active'] else 'Nein'})"
            for alarm in all_alarms
        ]
    )


@tool
def remove_alarm_by_time(uhrzeit: str):
    """Löscht einen Wecker basierend auf der Uhrzeit (Format HH:MM)."""
    success = alarm_service.delete_alarm_by_time(uhrzeit)
    if success:
        return f"Ich habe den Wecker für {uhrzeit} Uhr gelöscht."
    return f"Ich konnte keinen Wecker für {uhrzeit} Uhr finden."
    

@tool
def get_time_now():
    """Gibt die aktuelle Uhrzeit und das Datum zurück"""
    return f"Die Zeit ist gerade {datetime.datetime.now()}"

@tool
def get_weather_nowcast():
    """Gibt das aktuelle Wetter am aktuellen Standort"""
    weather_list = get_current_weather()
    return weather_list

@tool
def get_weather_nowcast_at_location(stadt: str, region:str):
    """"Gibt das aktuelle Wetter in einer bestimmten Stadt zurück. Hier muss unbedingt Stadt, und Region übergeben werden"""
    weather_list = get_current_weather_from_specific_location(stadt, region)
    return weather_list

tools = [set_alarm, get_time_now,list_active_alarms, list_all_alarms, remove_alarm_by_time, get_weather_nowcast, get_weather_nowcast_at_location]
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

stt_service = STTService(model_size="base") 

from langgraph.checkpoint.memory import MemorySaver

memory = MemorySaver()

app = workflow.compile(checkpointer=memory)

config = {"configurable": {"thread_id": "haupt_user_session"}}

def speak(text):
    #print(f"Generiere Audio für: {text}...")
    # 'aplay' ist der Standard-Player auf Linux, 'afplay' auf Mac
    if speaker == "male":
        model_path = BASE_DIR / "models" / "de_DE-thorsten-high.onnx"
    else:
        model_path = BASE_DIR / "models" / "de_DE-kerstin-low.onnx"

    subprocess.run(
        [
            "piper",
            "--model",
            str(model_path),
            "--output_file",
            str(RESPONSE_WAV_PATH),
        ],
        input=text,
        text=True,
        check=True,
    )
    _play_audio_file(RESPONSE_WAV_PATH)


def _play_audio_file(audio_path):
    player = shutil.which("afplay") or shutil.which("aplay")
    if not player:
        raise RuntimeError("Kein Audio-Player gefunden. Erwartet wurde 'afplay' oder 'aplay'.")

    completed = subprocess.run(
        [player, str(audio_path)],
        check=False,
        capture_output=True,
        text=True,
    )
    if completed.returncode != 0:
        error_output = (completed.stderr or completed.stdout).strip()
        raise RuntimeError(
            f"Audio konnte nicht abgespielt werden: {audio_path}. "
            f"Player: {player}. Fehler: {error_output or 'Unbekannter Fehler'}"
        )


def _play_alarm_sound():
    candidate_paths = [ALARM_SOUND_PATH, ALARM_SOUND_FALLBACK_PATH]
    errors = []

    for candidate_path in candidate_paths:
        if not candidate_path.exists():
            errors.append(f"Datei nicht gefunden: {candidate_path}")
            continue

        try:
            _play_audio_file(candidate_path)
            print(f"Alarm-Sound abgespielt: {candidate_path.name}")
            return
        except Exception as exc:
            errors.append(str(exc))

    print("Alarm-Sound konnte nicht abgespielt werden.")
    for error in errors:
        print(f"- {error}")

def alarm_monitor():
    alarm_service.monitor_alarms(on_alarm_triggered=_handle_triggered_alarm)


def _handle_triggered_alarm(alarm):
    wake_up(alarm["time"], alarm["label"])

def wake_up(time, alarm_label=""):
    print(f"!!! ALARM !!! Es ist {time} Uhr!")

    _play_alarm_sound()

    """Wird vom Monitor aufgerufen. Susonne prüft das Wetter und weckt dich dann."""
    
    wake_up_prompt = f"""
    WICHTIG: Es ist Zeit für den Wecker '{alarm_label}'.
    1. Nutze zuerst das Wetter-Tool, um das aktuelle Wetter für meinen Standort zu prüfen.
    2. Generiere DANN einen herzlichen, Guten Morgen Spruch um den Nutzer aufzuwecken.
    Sei direkt mit dem Nutzer und versuche ihn AKTIV auf witzige und nette weise aufzuwecken.
    3. Gebe dabei die Uhrzeit zu der geweckt werden sollte wieder ({time})
    4. Baue die Wetterinformationen (Temperatur/Zustand) und eine passende 
       Kleidungsempfehlung charmant in deine Begrüßung ein.
    5. MACHE UNBEDINGT MEHR ALS 3 SÄTZE, damit der Nutzer aufwachen kann, während du sprichtst. keine Emojis.
    -> Beispiel : "Guten Morgen aufgewacht Schlafmütze, es ist {time} und draußen hat es 20 Grad
    """
    
    inputs = {"messages": [HumanMessage(content=wake_up_prompt)]}
    config = {"configurable": {"thread_id": "User"}}

    print("Wecker ausgelöst. Susonne bereitet den Tag vor...")

    ai_output(inputs=inputs, config=config)
    return

def interact():

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

        config = {"configurable": {"thread_id": "User"}}

        ai_output(inputs=inputs, config=config)
                
        
    else:
        print("Ich habe nichts gehört. Bitte versuch es nochmal.")

def ai_output(inputs, config):

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
    
    return
    
if __name__ == '__main__':
   pass
   #wake_up("8:20","Uni")
