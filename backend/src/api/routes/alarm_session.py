from fastapi import APIRouter
from domain.alarms.schemas import AlarmSession, AlarmSessionStatus
from typing import Optional
from domain.alarms import service as alarm_service

router = APIRouter(prefix="/alarm-session", tags=["Alarm Sessions"])

@router.get("/current", response_model=Optional[AlarmSession])
def get_current_alarm_session():
    """
        Retrieves the currently active alarm session, if any.

        :return: The currently active alarm session or None if there is no active session
        :rtype: Optional[AlarmSession]
    """
    return alarm_service.get_current_alarm_session()

@router.post("/{session_id}/stop", response_model=Optional[AlarmSession])
def stop_current_alarm_session(session_id: int):
    """
        Stops the currently active alarm session.
        
        :param session_id: The ID of the alarm session
        :type session_id: int
        :return: The updated alarm session
        :rtype: Optional[AlarmSession]
    """
    return alarm_service.stop_ringing_session(session_id, status=AlarmSessionStatus.DISMISSED)

@router.post("/{session_id}/snooze", response_model=Optional[AlarmSession])
def snooze_current_alarm_session(session_id: int):
    """
        Snoozes the currently active alarm session.

        :param session_id: The ID of the alarm session
        :type session_id: int
        :return: The updated alarm session
        :rtype: Optional[AlarmSession]
    """
    return alarm_service.stop_ringing_session(session_id, status=AlarmSessionStatus.SNOOZED)
