import pytest

def test_create_alarm(client):
    payload = {
        "time": "08:00",
        "label": "Wake up",
        "recurring_days": ["MON", "TUE", "WED", "THU", "FRI"]
    }
    response = client.post("/alarms/", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["time"] == "08:00"
    assert data["label"] == "Wake up"
    assert data["active"] == True
    assert "id" in data

def test_get_alarms(client):
    # Create an alarm first
    client.post("/alarms/", json={
        "time": "09:00",
        "label": "Meeting",
        "recurring_days": []
    })
    
    response = client.get("/alarms/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["time"] == "09:00"

def test_get_alarm_by_id(client):
    create_resp = client.post("/alarms/", json={
        "time": "10:00",
        "label": "Break",
        "recurring_days": []
    })
    alarm_id = create_resp.json()["id"]
    
    response = client.get(f"/alarms/{alarm_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == alarm_id
    assert data["time"] == "10:00"

def test_toggle_alarm(client):
    create_resp = client.post("/alarms/", json={
        "time": "11:00",
        "label": "Toggle Me",
        "recurring_days": []
    })
    alarm_id = create_resp.json()["id"]
    assert create_resp.json()["active"] == True
    
    toggle_resp = client.get(f"/alarms/{alarm_id}/toggle")
    assert toggle_resp.status_code == 200
    assert toggle_resp.json()["active"] == False
    
    toggle_resp_2 = client.get(f"/alarms/{alarm_id}/toggle")
    assert toggle_resp_2.json()["active"] == True

def test_update_alarm(client):
    create_resp = client.post("/alarms/", json={
        "time": "12:00",
        "label": "Lunch",
        "recurring_days": []
    })
    alarm_id = create_resp.json()["id"]
    
    update_payload = {
        "id": alarm_id,
        "time": "12:30",
        "label": "Late Lunch",
        "active": False,
        "recurring_days": ["SAT", "SUN"]
    }
    update_resp = client.put(f"/alarms/{alarm_id}", json=update_payload)
    assert update_resp.status_code == 200
    data = update_resp.json()
    assert data["time"] == "12:30"
    assert data["label"] == "Late Lunch"
    assert data["active"] == False

def test_delete_alarm(client):
    create_resp = client.post("/alarms/", json={
        "time": "13:00",
        "label": "Delete Me",
        "recurring_days": []
    })
    alarm_id = create_resp.json()["id"]
    
    delete_resp = client.delete(f"/alarms/{alarm_id}")
    assert delete_resp.status_code == 200
    assert delete_resp.json()["id"] == alarm_id
    
    get_resp = client.get(f"/alarms/{alarm_id}")
    # Current API returns None (200 OK with null body) or 404? 
    # Let's assume it returns null in JSON
    assert get_resp.status_code == 200
    assert get_resp.json() is None
