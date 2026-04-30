from datetime import datetime
from pydantic import BaseModel

class WeatherNowcast(BaseModel):
    time: str
    temperature: float
    feels_like: float
    weather_condition: str
    weather_description: str

class WeatherForecast(BaseModel):
    time: str
    forecast: list[WeatherNowcast]

class Sunrise(BaseModel):
    time: str

class Sunset(BaseModel):
    time: str