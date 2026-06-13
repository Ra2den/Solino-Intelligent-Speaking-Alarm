import logging
from fastapi import APIRouter
from fastapi import WebSocket, WebSocketDisconnect
from typing import Optional
from api.websocket_manager import manager
from domain.alarms import service as alarm_service
from domain.alarms.schemas import AlarmSession, AlarmSessionStatus, AlarmSessionWsMessage, AlarmSessionWsType, PressureSensorEvent

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/alarm-session", tags=["Alarm Sessions"])

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time alarm state updates.
    
    Clients connecting to this endpoint will immediately receive the current 
    alarm session state (INITIAL_STATE) and subsequent updates (UPDATE) 
    whenever an alarm transitions (e.g., RINGING -> GUARD -> DISMISSED).
    """
    await manager.connect(websocket)
    try:
        # Send current session on connect
        current_session = alarm_service.get_current_alarm_session()
        message: AlarmSessionWsMessage = AlarmSessionWsMessage(
            type=AlarmSessionWsType.INITIAL_STATE,
            session=current_session,
        )
        await websocket.send_text(message.model_dump_json())

        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"Unexpected WebSocket error: {e}", exc_info=True)
        manager.disconnect(websocket)

@router.get("/current", response_model=Optional[AlarmSession])
def get_current_alarm_session():
    """
        Returns the currently active alarm session, if one exists.

        :return: The current alarm session
        :rtype: Optional[AlarmSession]
    """
    return alarm_service.get_current_alarm_session()

@router.post("/{session_id}/stop", response_model=Optional[AlarmSession])
def stop_current_alarm_session(session_id: int):
    """
        Stops the currently active alarm session and activates guard mode.
        
        :param session_id: The ID of the alarm session
        :type session_id: int
        :return: The updated alarm session
        :rtype: Optional[AlarmSession]
    """
    return alarm_service.stop_ringing_session(session_id, status=AlarmSessionStatus.GUARD)

@router.post("/{session_id}/pressure", response_model=Optional[AlarmSession])
def pressure_sensor_event(
    session_id: int,
    body: PressureSensorEvent,
):
    """
        Simulate a pressure sensor event while a guard session is active.
        If the user goes back to bed after tolerance expires, retriggers the alarm.

        :param session_id: The ID of the guard alarm session
        :type session_id: int
        :param body: Pressure sensor payload with pressed state
        :return: The guard session or updated alarm session on retrigger
        :rtype: Optional[AlarmSession]
    """
    return alarm_service.handle_guard_pressure_sensor(session_id, body.is_pressed)

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
