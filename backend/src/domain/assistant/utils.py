import requests
from domain.assistant.schemas import AiState

FASTAPI_URL = "http://127.0.0.1:8000/alarms/set-ai-state-external"

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

def is_ollama_available():
    """Check if Ollama service is available and accessible."""
    try:
        import requests
        from domain.settings import service as settings_service
        timeout_sec = settings_service.get_ollama_health_check_timeout_sec()
        OLLAMA_BASE_URL = "http://localhost:11434"
        response = requests.get(
            f"{OLLAMA_BASE_URL}/api/tags",
            timeout=timeout_sec
        )
        return response.status_code == 200
    except (requests.ConnectionError, requests.Timeout, Exception):
        return False