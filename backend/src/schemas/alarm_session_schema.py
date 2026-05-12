from pydantic import BaseModel
from enum import Enum

class AlarmSessionStatus(str, Enum):
    RINGING = "RINGING"
    SNOOZED = "SNOOZED"
    DISMISSED = "DISMISSED"

class AlarmSession(BaseModel):
    id: int
    alarm_id: int
    status: AlarmSessionStatus
    started_at: str
    snoozed_until: str | None = None
    label: str | None = None
    ring_count: int = 0
    message: str | None = None
