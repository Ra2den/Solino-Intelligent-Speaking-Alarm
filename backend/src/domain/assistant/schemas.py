from pydantic import BaseModel
from enum import Enum

class AiState(str, Enum):
    IDLE = "idle"
    THINKING = "thinking"
    SPEAKING = "speaking"

class AiStateResponse(BaseModel):
    state: AiState