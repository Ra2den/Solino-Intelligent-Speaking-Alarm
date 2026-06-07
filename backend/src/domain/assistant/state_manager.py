import asyncio
from typing import List
from pydantic import BaseModel
from enum import Enum

class AIState(str, Enum):
    IDLE = "idle"
    THINKING = "thinking"
    SPEAKING = "speaking"

class AIStateResponse(BaseModel):
    state: AIState

current_ai_status = {"state": AIState.IDLE}
active_status_connections: List[any] = [] 
def update_ai_state(new_state: str):
    """
    Ändert den globalen Status der KI und pusht ihn an alle 
    offenen WebSockets für das Frontend.
    """
    global current_ai_status, active_status_connections
    current_ai_status["state"] = new_state
    
    print(f"[STATE MANAGER] Umschalten auf: {new_state} (Clients verbunden: {len(active_status_connections)})")
    
    response = AIStateResponse(state=AIState(new_state))
    json_data = response.model_dump_json()
    
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            print("[STATE MANAGER] Kein aktiver Event-Loop gefunden.")
            return

    for connection in list(active_status_connections):
        asyncio.run_coroutine_threadsafe(
            connection.send_text(json_data), 
            loop
        )