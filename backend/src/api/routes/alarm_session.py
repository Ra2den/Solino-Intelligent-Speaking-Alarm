from fastapi import APIRouter
from domain.alarms.schemas import AlarmSession, AlarmSessionStatus
from typing import Optional
from domain.alarms import service as alarm_service
from db import alarm_sessions_repo


router = APIRouter(prefix="/alarm-session", tags=["Alarm Sessions"])

@router.get("/current", response_model=Optional[AlarmSession])
def get_current_alarm_session():
    return alarm_sessions_repo.get_active_alarm_session()

@router.post("/{session_id}/stop", response_model=Optional[AlarmSession])
def stop_current_alarm_session(session_id: int):
    return alarm_service.stop_ringing_session(session_id, status=AlarmSessionStatus.DISMISSED)

@router.post("/{session_id}/snooze", response_model=Optional[AlarmSession])
def snooze_current_alarm_session(session_id: int):
    return alarm_service.stop_ringing_session(session_id, status=AlarmSessionStatus.SNOOZED)
