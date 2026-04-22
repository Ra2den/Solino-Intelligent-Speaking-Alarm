import operator
from typing import Annotated, TypedDict
from langchain_ollama import ChatOllama  
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from langchain_core.tools import tool
from langgraph.graph import StateGraph, START, END
from langgraph.prebuilt import ToolNode
from langchain_core.messages import SystemMessage
import os

from speechToText import STTService

# System Prompt
system_message = SystemMessage(
    content="Du bist ein intelligenter Wecker. Wenn ein Tool-Ergebnis (z.B. vom Wecker stellen) vorliegt, "
            "fasse es kurz in einem Satz zusammen und beende deine Antwort. "
            "Rufe ein Tool niemals doppelt mit den gleichen Parametern auf."
)


# --- Tools ---
@tool
def set_alarm(uhrzeit: str):
    """Stellt einen Wecker für eine bestimmte Uhrzeit (Format HH:MM)."""
    return f"Wecker auf {uhrzeit} Uhr programmiert."

@tool
def get_weather(stadt: str):
    """Gibt das Wetter zurück."""
    return f"In {stadt} ist es gerade bewölkt."

tools = [set_alarm, get_weather]
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
    print(f"Generiere Audio für: {text}...")
    # 'aplay' ist der Standard-Player auf Linux, 'afplay' auf Mac
    command = f'echo "{text}" | piper --model models/de_DE-thorsten-high.onnx --output_file response.wav && afplay response.wav'
    os.system(command)

stt_service = STTService(model_size="base") 

if __name__ == "__main__":
    # Schritt 1: Aufnahme
    audio_file = stt_service.record_audio(duration=4)
    
    # Schritt 2: Sprache zu Text (STT)
    user_text = stt_service.transcribe(audio_file)
    print(f"🗣️ Erkannt: {user_text}")
    
    # Schritt 3: Nur weitermachen, wenn auch Text erkannt wurde
    if user_text:
        inputs = {"messages": [HumanMessage(content=user_text)]}
        final_response = ""
        
        print("Überlege...")
        # Wir lassen den LangGraph laufen
        for output in app.stream(inputs, stream_mode="values"):
            last_msg = output["messages"][-1]
            
            # Wir suchen die finale Antwort der KI
            if isinstance(last_msg, AIMessage) and last_msg.content:
                final_response = last_msg.content

        # Schritt 4: Antwort ausgeben
        if final_response:
            print(f"Ollama: {final_response}")
            speak(final_response)
    else:
        print("Empty input. Ich habe nichts gehört.")