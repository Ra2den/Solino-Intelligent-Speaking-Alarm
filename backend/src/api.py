from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import db
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
    return db.db_get_all_alarms()

# Fetch all active alarms
@app.get("/alarms/active")
def get_active_alarms():
    return db.db_get_active_alarms()

# Fetch alarm by ID
@app.get("/alarms/{alarm_id}")
def get_alarm(alarm_id: int):
    return db.db_get_alarm_by_id(alarm_id)

# Toggle alarm status (activate/deactivate)
@app.get("/alarms/{alarm_id}/toggle")
def toggle_alarm(alarm_id: int):
    return db.db_toggle_alarm(alarm_id)

# Create a new alarm
@app.post("/alarms")
def create_alarm(alarm: AlarmCreate):
    return db.db_add_alarm(alarm.time, alarm.label)

# Update an existing alarm
@app.put("/alarms/{alarm_id}", response_model=Alarm)
def update_alarm(alarm_id: int, alarm: Alarm):
    return db.db_update_alarm(
        alarm_id=alarm_id,
        time=alarm.time,
        label=alarm.label
    )

# Delete an alarm by ID
@app.delete("/alarms/{alarm_id}")
def delete_alarm(alarm_id: int):
    db.db_delete_alarm_by_id(alarm_id)
# --- Weather Endpoint ---
# TODO Weather Endpoints