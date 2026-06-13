from typing import List
from domain.assistant.schemas import AiState, AiStateResponse

current_ai_status = {"state": AiState.IDLE}
active_status_connections: List[any] = [] 

async def update_ai_state(new_state: AiState):
    """
    Ändert den globalen Status der KI und pusht ihn an alle 
    offenen WebSockets für das Frontend.
    """
    global current_ai_status, active_status_connections
    current_ai_status["state"] = new_state.value
    
    print(f"[STATE MANAGER] Umschalten auf: {new_state.value} (Clients verbunden: {len(active_status_connections)})")
    
    response = AiStateResponse(state=new_state)
    json_data = response.model_dump_json()
    
    for connection in list(active_status_connections):
        try:
            await connection.send_text(json_data)
        except Exception as e:
            print(f"[STATE MANAGER] Fehler beim Senden an Websocket: {e}")