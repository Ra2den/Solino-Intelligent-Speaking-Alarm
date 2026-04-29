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

text = """
Test text
"""

def speak(text):
    #print(f"Generiere Audio für: {text}...")
    # 'aplay' ist der Standard-Player auf Linux, 'afplay' auf Mac
    #command = f'echo "{text}" | piper --model models/de_DE-thorsten-high.onnx --output_file response.wav && afplay response.wav'
    tts.tts_to_file(text=text, speaker_wav="./audio.wav", language="de", file_path="response.wav")
    command = "afplay response.wav"
    os.system(command)


speak(text)