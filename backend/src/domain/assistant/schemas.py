from pydantic import BaseModel
from enum import Enum

class AiState(str, Enum):
    IDLE = "IDLE"
    LISTENING = "LISTENING"
    THINKING = "THINKING"
    SPEAKING = "SPEAKING"

class AiStateResponse(BaseModel):
    state: AiState