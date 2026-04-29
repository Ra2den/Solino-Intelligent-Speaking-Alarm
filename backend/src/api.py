from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import alarmDB
from schemas.alarm import Alarm, AlarmCreate

app = FastAPI()

origins = [
    "http://localhost:5173", # TODO extract in .env
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Alarm Endpoints ---

# Fetch all alarms
@app.get("/alarms")
def get_alarms():
    return alarmDB.db_get_all_alarms()

# Fetch all active alarms
@app.get("/alarms/active")
def get_active_alarms():
    return alarmDB.db_get_active_alarms()

# Fetch alarm by ID
@app.get("/alarms/{alarm_id}")
def get_alarm(alarm_id: int):
    return {"get /alarms/{alarm_id}": "Implement this endpoint"}

# Toggle alarm status (activate/deactivate)
@app.get("/alarms/{alarm_id}/toggle")
def toggle_alarm(alarm_id: int):
    return {"get /alarms/{alarm_id}/toggle": "Implement this endpoint"}

# Create a new alarm
@app.post("/alarms", response_model=AlarmCreate)
def create_alarm(alarm: AlarmCreate):
    return alarmDB.db_add_alarm(alarm.time, alarm.label)

# Update an existing alarm
@app.put("/alarms/{alarm_id}")
def update_alarm(alarm_id: int, time: str, label: str):
     return {"put /alarms/{alarm_id}": "Implement this endpoint"}

# Delete an alarm by ID
@app.delete("/alarms/{alarm_id}")
def delete_alarm(alarm_id: int):
    return {"delete /alarms/{alarm_id}": "Implement this endpoint"}

# --- Weather Endpoint ---
# TODO Weather Endpoints