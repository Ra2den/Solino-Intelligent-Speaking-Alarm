from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List
import db
from schemas.alarm_schema import Alarm, AlarmCreate
from schemas.weather_schema import WeatherNowcast, WeatherForecast, Sunrise, Sunset
import weatherForecast

app = FastAPI()

origins = [
    "http://localhost:5173", # TODO extract in .env
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Alarm Endpoints ---

# Fetch all alarms
@app.get("/alarms", response_model=List[Alarm])
def get_alarms():
    return db.db_get_all_alarms()

# Fetch all active alarms
@app.get("/alarms/active", response_model=List[Alarm])
def get_active_alarms():
    return db.db_get_active_alarms()

# Fetch alarm by ID
@app.get("/alarms/{alarm_id}", response_model=Optional[Alarm])
def get_alarm(alarm_id: int):
    return db.db_get_alarm_by_id(alarm_id)

# Toggle alarm status (activate/deactivate)
@app.get("/alarms/{alarm_id}/toggle", response_model=Optional[Alarm])
def toggle_alarm(alarm_id: int):
    return db.db_toggle_alarm(alarm_id)

# Create a new alarm
@app.post("/alarms", response_model=Alarm)
def create_alarm(alarm: AlarmCreate):
    return db.db_add_alarm(alarm.time, alarm.label, alarm.recurring_days)

# Update an existing alarm
@app.put("/alarms/{alarm_id}", response_model=Optional[Alarm])
def update_alarm(alarm_id: int, alarm: Alarm):
    return db.db_update_alarm(
        alarm_id=alarm_id,
        time=alarm.time,
        label=alarm.label
    )

# Delete an alarm by ID
@app.delete("/alarms/{alarm_id}", response_model=Optional[Alarm])
def delete_alarm(alarm_id: int):
    return db.db_delete_alarm_by_id(alarm_id)
# --- Weather Endpoint ---

# Fetch current weather as a WeatherNowcast object
@app.get("/weather/nowcast")
def get_weather_nowcast():
    return weatherForecast.get_current_weather_for_api()

# Fetch weather forecast for the next 5 days in 3 hour intervalls
@app.get("/weather/forecast")
def get_weather_forecast():
    return weatherForecast.get_weather_forecast_for_api()

# Fetch time of todays sunrise
@app.get("/weather/sunrise")
def get_sunrise_time():
    return weatherForecast.get_sunrise_time()

# Fetch time of todays sunfall
@app.get("/weather/sunset")
def get_sunset_time():
    return weatherForecast.get_sunset_time()
