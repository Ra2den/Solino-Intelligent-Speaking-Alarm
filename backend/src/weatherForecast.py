import requests
import json
import math
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
    
        curr_temp = convert_celvin_to_celcius(data['main']['temp'])
        fells_like = convert_celvin_to_celcius(data['main']['feels_like'])

        weather_cond_main = data['weather'][0]['main']
        weather_cond_description = data['weather'][0]['description']

        wind_speed = data['wind']['speed']
        wind_direction = deg_to_compass(data['wind']['deg'])

        weather_nowcaset_string = (
            f"Das Wetter in {place_name} ist aktuell bei {round_half_up(curr_temp)} °C; Gefühlt sind {round_half_up(fells_like)} °C. "
            f"Bei hauptsächlich {weather_cond_main} und {weather_cond_description} Wetter. "
            f"Mit Windgeschwindigkeiten von {wind_speed} km/h aus {wind_direction} kommend."
        )

        print(weather_nowcaset_string)
        return weather_nowcaset_string

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

def convert_celvin_to_celcius(deg_kelvin):
    return deg_kelvin - 273.15

def deg_to_compass(deg):
    directions = ['Norden', 'Nord-Nord-Ost', 'Nord-Ost', 'Ost-Nord-Ost', 
                  'Osten', 'Ost-Süd-Ost', 'Süd-Ost', 'Süd-Süd-Ost', 
                  'Süden', 'Süd-Süd-West', 'Süd-West', 'West-Süd-West', 
                  'Westen', 'West-Nord-West', 'Nord-West', 'Nord-Nord-West']
    index = round(deg / 22.5) % 16
    return directions[index]

def round_half_up(n):
    return math.floor(n * 10 + 0.5) / 10