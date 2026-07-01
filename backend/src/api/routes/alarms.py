from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List, Optional
from domain.alarms.schemas import Alarm, AlarmCreate, TranscriptionResponse
from domain.alarms import service as alarms_service
from domain.assistant.speech_to_text import STTService
import asyncio
from domain.assistant.state_manager import current_ai_status, active_status_connections
from pydantic import BaseModel
from domain.assistant.schemas import AiState, AiStateResponse

router = APIRouter(prefix="/alarms", tags=["Alarms"])


# --- Standard Alarm Endpoints ---

@router.get("/", response_model=List[Alarm])
def get_alarms():
    """
        Retrieves all alarms.

        :return: A list of all alarms
        :rtype: List[Alarm]
    """
    return alarms_service.get_all_alarms()

@router.get("/active", response_model=List[Alarm])
def get_active_alarms():
    """
        Retrieves all active alarms.

        :return: A list of active alarms
        :rtype: List[Alarm]
    """
    return alarms_service.get_active_alarms()

@router.get("/{alarm_id}", response_model=Optional[Alarm])
def get_alarm(alarm_id: int):
    """
        Retrieves an alarm by its ID.
    
        :param alarm_id: The ID of the alarm
        :type alarm_id: int
        :return: The matching alarm or None if it does not exist
        :rtype: Optional[Alarm]
    """
    return alarms_service.get_alarm_by_id(alarm_id)

@router.get("/{alarm_id}/toggle", response_model=Optional[Alarm])
def toggle_alarm(alarm_id: int):
    """
        Toggles the active status of an alarm.

        :param alarm_id: The ID of the alarm
        :type alarm_id: int
        :return: The updated alarm or None if it does not exist
        :rtype: Optional[Alarm]
    """
    return alarms_service.toggle_alarm(alarm_id)

@router.post("/", response_model=Alarm)
def create_alarm(alarm: AlarmCreate):
    """
        Creates a new alarm.


        :param alarm: The alarm data used to create the new alarm
        :type alarm: AlarmCreate
        :return: The created alarm
        :rtype: Alarm
    """
    return alarms_service.add_alarm(alarm.time, alarm.label, alarm.recurring_days)

@router.put("/{alarm_id}", response_model=Optional[Alarm])
def update_alarm(alarm_id: int, alarm: Alarm):
    """
        Updates an existing alarm.

        :param alarm_id: The ID of the alarm to update
        :type alarm_id: int
        :param alarm: The updated alarm data
        :type alarm: Alarm
        :return: The updated alarm or None if it does not exist
        :rtype: Optional[Alarm]
    """
    return alarms_service.update_alarm(
        alarm_id=alarm_id,
        time=alarm.time,
        label=alarm.label,
        recurring_days=alarm.recurring_days,
        active=alarm.active,
    )

@router.delete("/{alarm_id}", response_model=Optional[Alarm])
def delete_alarm(alarm_id: int):
    """
        Deletes an alarm by its ID.

        :param alarm_id: The ID of the alarm to delete
        :type alarm_id: int
        :return: The deleted alarm or None if it does not exist
        :rtype: Optional[Alarm]
    """
    from fastapi import HTTPException
    try:
        return alarms_service.delete_alarm_by_id(alarm_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# --- WebSocket für die Audio-Namensaufnahme ---

is_recording_globally = False

@router.websocket("/ws/record-name")
async def websocket_record_name(websocket: WebSocket):
    """
    WebSocket endpoint to record an alarm name via audio,
    transcribe it, and stream the status and result back to the frontend.
    """
    global is_recording_globally
    await websocket.accept()
    stt_service = None
    recording_task = None

    async def finalize_recording():
        nonlocal stt_service
        global is_recording_globally

        try:
            if stt_service is None:
                return

            loop = asyncio.get_running_loop()
            audio_file = await loop.run_in_executor(
                None,
                lambda: stt_service.record_audio(duration=5),
            )

            if audio_file is None:
                response = TranscriptionResponse(isListening=False)
            else:
                user_text = await loop.run_in_executor(
                    None, stt_service.transcribe, audio_file
                )

                if user_text and user_text.strip():
                    response = TranscriptionResponse(
                        isListening=False,
                        transcription=user_text.strip()
                    )
                else:
                    response = TranscriptionResponse(
                        isListening=False,
                        transcription="",
                        error="Ich habe leider nichts gehört."
                    )

        except Exception as e:
            response = TranscriptionResponse(
                isListening=False,
                error=f"Fehler bei der Verarbeitung: {str(e)}"
            )
        finally:
            is_recording_globally = False
            stt_service = None

        await websocket.send_text(response.model_dump_json())
    
    try:
        while True:
            data = await websocket.receive_json()
            action = data.get("action")

            if action == "start":
                if is_recording_globally:
                    response = TranscriptionResponse(
                        isListening=False, 
                        error="Es läuft bereits eine Aufnahme auf dem Server."
                    )
                    await websocket.send_text(response.model_dump_json())
                    continue
                
                is_recording_globally = True
                stt_service = STTService(model_size="base")
                
                response = TranscriptionResponse(isListening=True)
                await websocket.send_text(response.model_dump_json())
                recording_task = asyncio.create_task(finalize_recording())

            elif action == "stop":
                if stt_service is not None:
                    stt_service.stop_recording()

                is_recording_globally = False
                response = TranscriptionResponse(isListening=False)
                await websocket.send_text(response.model_dump_json())

    except WebSocketDisconnect:
        print("Frontend hat die Verbindung getrennt.")
    except Exception as e:
        print(f"Backend WebSocket Error: {e}")
        try:
            response = TranscriptionResponse(
                isListening=False,
                error=f"Server-Fehler: {str(e)}"
            )
            await websocket.send_text(response.model_dump_json())
        except Exception:
            pass
    finally:
        if stt_service is not None:
            stt_service.stop_recording()
        if recording_task is not None and not recording_task.done():
            await recording_task
        is_recording_globally = False


@router.websocket("/ws/ai-state")
async def websocket_ai_state(websocket: WebSocket):
    """
    WebSocket endpoint für den globalen Live-KI-Zustand.
    """
    await websocket.accept()
    
    active_status_connections.append(websocket)
    print(f"[WEBSOCKET] Neuer Client verbunden. Gesamt: {len(active_status_connections)}")
    
    initial_response = AiStateResponse(state=current_ai_status["state"])
    await websocket.send_text(initial_response.model_dump_json())
    
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        print("❌ [WEBSOCKET] Client hat die Verbindung getrennt.")
    finally:
        if websocket in active_status_connections:
            active_status_connections.remove(websocket)

class StateTrigger(BaseModel):
    state: AiState

@router.post("/set-ai-state-external")
async def set_ai_state_external(data: StateTrigger):
    """
    Erlaubt es externen Prozessen (wie dem CLI-Skript), 
    den Zustand der WebSockets zu ändern.
    """
    from domain.assistant.state_manager import update_ai_state
    await update_ai_state(data.state)
    return {"status": "success", "state_set": data.state.value}