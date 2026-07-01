import pytest
import asyncio
from unittest.mock import AsyncMock, MagicMock
from domain.alarms.schemas import AlarmSessionStatus
import sys

def test_get_current_alarm_session_none(client):
    response = client.get("/alarm-session/current")
    assert response.status_code == 200
    assert response.json() is None

def test_alarm_session_flow(client, mocker):
    # Create an alarm
    create_resp = client.post("/alarms/", json={
        "time": "07:00",
        "label": "Morning",
        "recurring_days": []
    })
    alarm = create_resp.json()
    
    # Mock the audio player and Ollama so they don't actually run
    mocker.patch("domain.alarms.service.alarm_player.start_loop")
    mocker.patch("domain.alarms.service.alarm_player.stop")
    mock_assistant = mocker.MagicMock()
    sys.modules["domain.assistant.service"] = mock_assistant

    mock_utils = mocker.MagicMock()
    mock_utils.is_ollama_available.return_value = False
    sys.modules["domain.assistant.utils"] = mock_utils
    
    # Start a ringing session directly using service (simulate monitoring picking it up)
    from domain.alarms.service import start_ringing_sesssion
    start_ringing_sesssion(alarm)
    
    # 1. Check current session
    response = client.get("/alarm-session/current")
    assert response.status_code == 200
    session = response.json()
    assert session is not None
    assert session["status"] == AlarmSessionStatus.RINGING
    session_id = session["id"]

    # 2. Snooze the session
    snooze_resp = client.post(f"/alarm-session/{session_id}/snooze")
    assert snooze_resp.status_code == 200
    assert snooze_resp.json()["status"] == AlarmSessionStatus.SNOOZED
    
    # 3. Stop the session (goes to GUARD)
    stop_resp = client.post(f"/alarm-session/{session_id}/stop")
    assert stop_resp.status_code == 200
    assert stop_resp.json()["status"] == AlarmSessionStatus.GUARD

    # 4. Pressure sensor (user gets back in bed)
    pressure_resp = client.post(f"/alarm-session/{session_id}/pressure", json={"is_pressed": True})
    assert pressure_resp.status_code == 200
    # Tolerance timer should be set
    assert pressure_resp.json()["pressure_started_at"] is not None

def test_websocket_alarm_session(client, mocker):
    mocker.patch("domain.alarms.service.alarm_player.start_loop")
    from domain.alarms.service import start_ringing_sesssion
    
    # Connect to the websocket
    with client.websocket_connect("/alarm-session/ws") as websocket:
        # Initial state should be None if no session exists
        data = websocket.receive_json()
        assert data["type"] == "INITIAL_STATE"
        assert data["session"] is None
        
        # Create an alarm and start ringing
        create_resp = client.post("/alarms/", json={
            "time": "08:00",
            "label": "WS Test",
            "recurring_days": []
        })
        alarm = create_resp.json()
        start_ringing_sesssion(alarm)
        
        # We should receive an UPDATE event on the websocket
        data2 = websocket.receive_json()
        assert data2["type"] == "UPDATE"
        assert data2["session"]["status"] == AlarmSessionStatus.RINGING
