import requests
from domain.assistant.schemas import AiState

FASTAPI_URL = "http://localhost:8000/alarms/set-ai-state-external"

def trigger_backend_state(state: AiState):
    """Schießt den neuen State per HTTP direkt in den echten FastAPI-Prozess."""
    try:
        requests.post(
            FASTAPI_URL, 
            json={"state": state.value},
            timeout=0.5
        )
    except Exception as e:
        print(f"Konnte State '{state}' nicht an FastAPI übertragen: {e}")