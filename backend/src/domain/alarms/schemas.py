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
    DISMISSED = "DISMISSED"

class AlarmSession(BaseModel):
    id: int
    alarm_id: int
    status: AlarmSessionStatus
    started_at: datetime
    snoozed_until: datetime | None = None
    label: str | None = None
    ring_count: int = 0
    message: str | None = None
