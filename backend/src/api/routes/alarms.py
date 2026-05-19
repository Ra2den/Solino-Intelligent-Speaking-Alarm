from fastapi import APIRouter
from typing import List, Optional
from domain.alarms.schemas import Alarm, AlarmCreate
import db.alarms_repo as alarms_repo

router = APIRouter(prefix="/alarms", tags=["Alarms"])

# Fetch all alarms
@router.get("/", response_model=List[Alarm])
def get_alarms():
    return alarms_repo.get_all_alarms()

# Fetch all active alarms
@router.get("/active", response_model=List[Alarm])
def get_active_alarms():
    return alarms_repo.get_active_alarms()

# Fetch alarm by ID
@router.get("/{alarm_id}", response_model=Optional[Alarm])
def get_alarm(alarm_id: int):
    return alarms_repo.get_alarm_by_id(alarm_id)

# Toggle alarm status (activate/deactivate)
@router.get("/{alarm_id}/toggle", response_model=Optional[Alarm])
def toggle_alarm(alarm_id: int):
    return alarms_repo.toggle_alarm(alarm_id)

# Create a new alarm
@router.post("/", response_model=Alarm)
def create_alarm(alarm: AlarmCreate):
    return alarms_repo.add_alarm(alarm.time, alarm.label, alarm.recurring_days)

# Update an existing alarm
@router.put("/{alarm_id}", response_model=Optional[Alarm])
def update_alarm(alarm_id: int, alarm: Alarm):
    return alarms_repo.update_alarm(
        alarm_id=alarm_id,
        time=alarm.time,
        label=alarm.label,
        recurring_days=alarm.recurring_days,
        active=alarm.active,
    )

# Delete an alarm by ID
@router.delete("/{alarm_id}", response_model=Optional[Alarm])
def delete_alarm(alarm_id: int):
    return alarms_repo.delete_alarm_by_id(alarm_id)