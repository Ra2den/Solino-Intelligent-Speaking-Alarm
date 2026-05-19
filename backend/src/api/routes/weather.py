from fastapi import APIRouter, HTTPException
from domain.weather.schemas import WeatherForecast, WeatherNowcast, Sunrise, Sunset
import domain.weather.service as weather_service

router = APIRouter(prefix="/weather", tags=["Weather"])

# Fetch current weather as a WeatherNowcast object
@router.get("/nowcast", response_model=WeatherNowcast)
def get_weather_nowcast():
    result = weather_service.get_current_weather_for_api()
    if result == None:
        raise HTTPException(status_code=502, detail="Weather service error")

    return result

# Fetch weather forecast for the next 5 days in 3 hour intervalls
@router.get("/forecast", response_model=WeatherForecast)
def get_weather_forecast():
    result = weather_service.get_weather_forecast_for_api()
    if result == None:
        raise HTTPException(status_code=502, detail="Weather service error")

    return result

# Fetch time of todays sunrise
@router.get("/sunrise", response_model=Sunrise)
def get_sunrise_time():
    result = weather_service.get_sunrise_time()
    if result == None:
        raise HTTPException(status_code=502, detail="Weather service error")

    return result

# Fetch time of todays sunset
@router.get("/sunset", response_model=Sunset)
def get_sunset_time():
    result = weather_service.get_sunset_time()
    if result == None:
        raise HTTPException(status_code=502, detail="Weather service error")

    return result