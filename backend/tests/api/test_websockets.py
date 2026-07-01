import pytest
from domain.assistant.schemas import AiState

def test_websocket_ai_state(client):
    with client.websocket_connect("/alarms/ws/ai-state") as websocket:
        data = websocket.receive_json()
        assert "state" in data
        assert data["state"] == AiState.IDLE.value

def test_websocket_record_name(client, mocker):
    # Mock STT Service to avoid PyAudio / model loading
    mock_stt_service = mocker.patch("api.routes.alarms.STTService")
    mock_instance = mock_stt_service.return_value
    mock_instance.record_audio.return_value = "dummy.wav"
    mock_instance.transcribe.return_value = "Test Alarm Name"

    with client.websocket_connect("/alarms/ws/record-name") as websocket:
        # Start recording
        websocket.send_json({"action": "start"})
        
        # Should get an immediate response indicating it's listening
        data_listening = websocket.receive_json()
        assert data_listening["isListening"] is True
        
        # Then, the finalize_recording task will finish and send the transcription
        data_result = websocket.receive_json()
        assert data_result["isListening"] is False
        assert data_result["transcription"] == "Test Alarm Name"
