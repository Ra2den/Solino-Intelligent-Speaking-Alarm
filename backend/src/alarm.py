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
from datetime import datetime
import sqlite3
import json

from weatherForecast import get_current_weather, get_current_weather_from_specific_location
from ai_db_service import add_alarm, get_active_alarms, toggle_alarm, delete_alarm_by_time
from speechToText import STTService

with open('settings.json', 'r') as file:
    settings = json.load(file)
if settings:
    speaker = settings["speaker"]


system_message = SystemMessage(
    content="""
    ### IDENTITÄT UND ROLLE
Du bist Susonne, ein witziger, freundlicher und sympathischer embodied Agent in Form eines Sonnenavatars. 
Dein Ziel ist es, dem Nutzer als strahlender Freund den Alltag zu erleichtern. 
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
Gebe ALLE Wetterdaten die du bekommst an den Nutzer Weiter, also Temperatur, Himmel(Wetterlage), Gefühlte Temperatur, Wind

### BEISPIEL-ANTWORT
Nutzer: "Stell den Hacker auf 8 Uhr."
Antwort: "Alles klar, dein strahlendes Erwachen ist für 8 Uhr gebucht – ich habe den Wecker gestellt, damit du nicht verschläfst!
"""
)



# --- Tools ---
@tool
def set_alarm(uhrzeit: str):
    """Stellt einen Wecker für eine bestimmte Uhrzeit (Format HH:MM)."""
    add_alarm(uhrzeit, "Vom LLM gestellt")
    return f"Wecker auf {uhrzeit} Uhr programmiert."

@tool
def list_alarms():
    """Gibt eine Liste aller aktuell gestellten Wecker zurück."""
    active_alarms = get_active_alarms()
    if not active_alarms:
        return "Du hast aktuell keine aktiven Wecker."
    
    response = "Hier sind deine aktiven Wecker:\n"
    for a in active_alarms:
        response += f"- {a['uhrzeit']} Uhr ({a['label']})\n"
    return response

@tool
def remove_alarm_by_time(uhrzeit: str):
    """Löscht einen Wecker basierend auf der Uhrzeit (Format HH:MM)."""
    res = delete_alarm_by_time(uhrzeit)
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

@tool
def get_weather_nowcast_at_location(stadt: str, region:str):
    """"Gibt das aktuelle Wetter in einer bestimmten Stadt zurück. Hier muss unbedingt Stadt, und Region übergeben werden"""
    weather_list = get_current_weather_from_specific_location(stadt, region)
    return weather_list

tools = [set_alarm, get_time_now,list_alarms, remove_alarm_by_time, get_weather_nowcast, get_weather_nowcast_at_location]
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

#checkpoint_conn = sqlite3.connect("checkpoints.db", check_same_thread=False)
#memory = SqliteSaver(checkpoint_conn)

app = workflow.compile(checkpointer=memory)

config = {"configurable": {"thread_id": "haupt_user_session"}}

def speak(text):
    #print(f"Generiere Audio für: {text}...")
    # 'aplay' ist der Standard-Player auf Linux, 'afplay' auf Mac
    if speaker == "male":
        model = "--model models/de_DE-thorsten-high.onnx"
    else:
        model = "--model models/de_DE-kerstin-low.onnx"
        
    command = f'echo "{text}" | piper {model} --output_file response.wav && afplay response.wav'
    os.system(command)

def alarm_monitor():
    print("Wecker-Monitor aktiv und wartet...")
    last_triggered_minute = ""

    while True:
        now_dt = datetime.now()
        now_time = now_dt.strftime("%H:%M")
        
        if now_time != last_triggered_minute:
            active_alarms = get_active_alarms()
            
            for alarm in active_alarms:
                if alarm['time'] == now_time:
                    wake_up(now_time)
                    
                    # Status in DB aktualisieren
                    toggle_alarm(alarm['id'])
                    
                    last_triggered_minute = now_time
        
        time.sleep(10)

def wake_up(time, alarm_label=""):
    print(f"!!! ALARM !!! Es ist {time} Uhr!")

    #os.system("afplay alarm_sound.mp3") 

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
    
if __name__ == '__main__':
   pass
   #wake_up("8:20","Uni")