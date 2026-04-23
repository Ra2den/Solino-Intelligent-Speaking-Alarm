import requests
import json
from datetime import datetime
import os
from dotenv import load_dotenv
from geopy.geocoders import Photon
load_dotenv()

API_KEY = os.getenv("API_KEY")

# --- get Location from IP ---

def get_public_ip():
    try:
        response = requests.get('https://api.ipify.org')
        return response.text
    except requests.RequestException:
        return "Fehler beim Abrufen der IP"

def get_city_from_ip():
    ip = get_public_ip()
    if not ip:
        return False
    response = requests.get(f"http://ip-api.com/json/{ip}").json()

    if response['status'] == 'success':
        print(response['country'])
        print(response['timezone'])
        print(response["city"])
        print(response["regionName"])
        print(response["region"])
        return response

def get_cords():

    res = get_city_from_ip()
    if not res:
        print("no City found, returning...")
    city = res["city"]
    region = res["region"]
    geolocator = Photon(user_agent="geoapiExercises")
    location = geolocator.geocode(f"{city}, {region}")

    return location

# --- weather forecast ---

def get_current_weather():
    cords = get_cords()
    lat = cords.latitude
    lon = cords.longitude
    curr_weather_request_url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API_KEY}"

    response = requests.get(curr_weather_request_url)

    if response.status_code == 200:
        data = response.json()
        place_name = data['name']
        current_time = datetime.now().strftime("%Y-%m-%dT%H:%M:%S")
    
        print(f"Wetter um {current_time} in {place_name}: {data}")
        return response.json

def get_weather_forecast():
    cords = get_cords()
    lat = cords.latitude
    lon = cords.longitude
    forecast_weather_request_url = f"https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={API_KEY}"

    response = requests.get(forecast_weather_request_url)

    if response.status_code == 200:
        data = response.json()
        place_name = data['city']['name']
        current_time = datetime.now().strftime("%Y-%m-%dT%H:%M:%S")
    
        print(f"Wetter um {current_time} in {place_name}: {data}")
        return response.json
