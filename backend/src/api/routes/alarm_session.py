from fastapi import APIRouter
from fastapi import WebSocket, WebSocketDisconnect
from typing import Optional
from api.websocket_manager import manager
from domain.alarms import service as alarm_service
from domain.alarms.schemas import AlarmSession, AlarmSessionStatus, AlarmSessionWsMessage, AlarmSessionWsType

router = APIRouter(prefix="/alarm-session", tags=["Alarm Sessions"])

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        # Send current session on connect
        current_session = alarm_service.get_current_alarm_session()
        message: AlarmSessionWsMessage = AlarmSessionWsMessage(
            type=AlarmSessionWsType.INITIAL_STATE,
            session=current_session,
        )
        await websocket.send_json(message.model_dump())

        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
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
