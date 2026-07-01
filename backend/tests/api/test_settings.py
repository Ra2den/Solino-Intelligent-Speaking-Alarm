import pytest

def test_get_all_settings(client):
    response = client.get("/settings/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0 # Initialized settings

def test_get_settings_by_category(client):
    response = client.get("/settings/category/general")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    for item in data:
        assert item["category"] == "general"

def test_get_setting(client):
    response = client.get("/settings/VOLUME_PERCENT")
    assert response.status_code == 200
    # Should just return the value, e.g., 50
    assert isinstance(response.json(), (int, float, str, bool))

def test_update_setting(client):
    response = client.put("/settings/VOLUME_PERCENT", json=75)
    assert response.status_code == 200
    data = response.json()
    assert data["key"] == "VOLUME_PERCENT"
    assert data["value"] == 75
    
    get_response = client.get("/settings/VOLUME_PERCENT")
    assert get_response.json() == 75

def test_update_setting_invalid_value(client):
    response = client.put("/settings/VOLUME_PERCENT", json="invalid_string")
    assert response.status_code == 422
