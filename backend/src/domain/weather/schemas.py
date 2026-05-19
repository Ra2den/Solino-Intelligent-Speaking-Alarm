from datetime import datetime
from pydantic import BaseModel
from enum import Enum

class WeatherCondition(str,Enum):
    Thunderstorm = 'Thunderstorm'
    Drizzle = 'Drizzle'
    Rain = 'Rain'
    Clear = 'Clear'
    Clouds = 'Clouds'

class WeatherNowcast(BaseModel):
    time: str
    temperature: float
    feels_like: float
    weather_condition: WeatherCondition
    weather_description: str

class WeatherForecast(BaseModel):
    forecast: list[WeatherNowcast]

class Sunrise(BaseModel):
    time: str

class Sunset(BaseModel):
    time: str