import pytest

def test_get_weather_nowcast(client, mocker):
    mock_nowcast = {
        "time": "2026-06-30T12:00:00Z",
        "temperature": 22.5,
        "feels_like": 23.0,
        "weather_condition": "Clear",
        "weather_description": "Sunny"
    }
    mocker.patch("domain.weather.service.get_current_weather_for_api", return_value=mock_nowcast)
    
    response = client.get("/weather/nowcast")
    assert response.status_code == 200
    data = response.json()
    assert data["temperature"] == 22.5
    assert data["weather_description"] == "Sunny"

def test_get_weather_nowcast_error(client, mocker):
    mocker.patch("domain.weather.service.get_current_weather_for_api", return_value=None)
    response = client.get("/weather/nowcast")
    assert response.status_code == 502
    assert response.json()["detail"] == "Weather service error"

def test_get_weather_forecast(client, mocker):
    mock_forecast = {
        "forecast": [
            {
                "time": "2026-06-30T12:00:00Z",
                "temperature": 24.0,
                "feels_like": 25.0,
                "weather_condition": "Clear",
                "weather_description": "Sunny"
            }
        ]
    }
    mocker.patch("domain.weather.service.get_weather_forecast_for_api", return_value=mock_forecast)
    
    response = client.get("/weather/forecast")
    assert response.status_code == 200
    data = response.json()
    assert "forecast" in data

def test_get_sunrise_time(client, mocker):
    mocker.patch("domain.weather.service.get_sunrise_time", return_value={"time": "2026-06-30T06:00:00Z"})
    response = client.get("/weather/sunrise")
    assert response.status_code == 200
    assert response.json()["time"] == "2026-06-30T06:00:00Z"

def test_get_sunset_time(client, mocker):
    mocker.patch("domain.weather.service.get_sunset_time", return_value={"time": "2026-06-30T20:00:00Z"})
    response = client.get("/weather/sunset")
    assert response.status_code == 200
    assert response.json()["time"] == "2026-06-30T20:00:00Z"
