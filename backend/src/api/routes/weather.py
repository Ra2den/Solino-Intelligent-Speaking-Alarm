from fastapi import APIRouter, HTTPException
from domain.weather.schemas import WeatherForecast, WeatherNowcast, Sunrise, Sunset
import domain.weather.service as weather_service

router = APIRouter(prefix="/weather", tags=["Weather"])

@router.get("/nowcast", response_model=WeatherNowcast)
def get_weather_nowcast():
    """
        Retrieves the current weather nowcast.

        :return: The current weather nowcast
        :rtype: WeatherNowcast
        :raises HTTPException: If the weather service returns no result
    """
    result = weather_service.get_current_weather_for_api()
    if result is None:
        raise HTTPException(status_code=502, detail="Weather service error")

    return result

@router.get("/forecast", response_model=WeatherForecast)
def get_weather_forecast():
    """
        Retrieves the weather forecast for the next 5 days in 3-hour intervals.

        :return: The weather forecast data
        :rtype: WeatherForecast
        :raises HTTPException: If the weather service returns no result
    """
    result = weather_service.get_weather_forecast_for_api()
    if result is None:
        raise HTTPException(status_code=502, detail="Weather service error")

    return result

@router.get("/sunrise", response_model=Sunrise)
def get_sunrise_time():
    """
        Retrieves today's sunrise time.

        :return: The sunrise time for today
        :rtype: Sunrise
        :raises HTTPException: If the weather service returns no result
    """
    result = weather_service.get_sunrise_time()
    if result is None:
        raise HTTPException(status_code=502, detail="Weather service error")

    return result

@router.get("/sunset", response_model=Sunset)
def get_sunset_time():
    """
        Retrieves today's sunset time.

        :return: The sunset time for today
        :rtype: Sunset
        :raises HTTPException: If the weather service returns no result
    """
    result = weather_service.get_sunset_time()
    if result is None:
        raise HTTPException(status_code=502, detail="Weather service error")

    return result
