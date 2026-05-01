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
