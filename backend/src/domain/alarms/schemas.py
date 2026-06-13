from datetime import datetime
from pydantic import BaseModel
from enum import Enum
from typing import Optional
    
class Weekday(str, Enum):
    MON = "MON"
    TUE = "TUE"
    WED = "WED"
    THU = "THU"
    FRI = "FRI"
    SAT = "SAT"
    SUN = "SUN"

class AlarmCreate(BaseModel):
    time: str
    label: str
    recurring_days: Optional[list[Weekday]] = None

class Alarm(BaseModel):
    id: int
    time: str
    label: str
    recurring_days: Optional[list[Weekday]] = None
    active: bool

class AlarmSessionStatus(str, Enum):
    RINGING = "RINGING"
    SNOOZED = "SNOOZED"
    GUARD = "GUARD"
    DISMISSED = "DISMISSED"

class AlarmSession(BaseModel):
    id: int
    alarm_id: int
    status: AlarmSessionStatus
    started_at: datetime
    snoozed_until: datetime | None = None
    guard_expires_at: datetime | None = None
    guard_tolerance_until: datetime | None = None
    pressure_started_at: datetime | None = None
    label: str | None = None
    ring_count: int = 0
    message: str | None = None

class TranscriptionResponse(BaseModel):
    transcription: Optional[str] = None
    isListening: bool
    error: Optional[str] = None

class AlarmSessionWsType(str, Enum):
    INITIAL_STATE = "INITIAL_STATE"
    UPDATE = "UPDATE"

class AlarmSessionWsMessage(BaseModel):
    type: str
    session: Optional[AlarmSession] = None
    
class PressureSensorEvent(BaseModel):
    is_pressed: bool = True