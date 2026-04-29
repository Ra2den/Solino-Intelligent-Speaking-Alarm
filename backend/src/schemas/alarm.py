from pydantic import BaseModel

class AlarmCreate(BaseModel):
    time: str
    label: str

class Alarm(BaseModel):
    id: int
    time: str
    label: str
    active: bool