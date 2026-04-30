import requests
import json
import math
from datetime import datetime, timezone
import os
from dotenv import load_dotenv
from geopy.geocoders import Photon
from schemas.weather import WeatherNowcast, WeatherForecast, Sunrise, Sunset
load_dotenv()

API_KEY = os.getenv("API_KEY")
BASE_URL = 'https://api.openweathermap.org/data/2.5/'
NO_WEATHER_ERROR_MSG = "Fehler beim Abrufen der aktuellen Wetterdaten"

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

def get_cords_from_location(city, region):
    geolocator = Photon(user_agent="geoapiExercises")
    location = geolocator.geocode(f"{city}, {region}")
    return location

def get_cords_from_ip_location():
    location_from_ip = get_city_from_ip()
    if not location_from_ip:
        print("City not found by ip, using data from default City (Karlsruhe)")
        return get_cords_from_location('Karlsruhe', 'Germany')

    return get_cords_from_location(location_from_ip["city"], location_from_ip["region"])

# --- weather nowcast operations ---

def fetch_weather_nowcast(cords):
    curr_weather_request_url = f"{BASE_URL}weather?lat={cords.latitude}&lon={cords.longitude}&appid={API_KEY}"

    response = requests.get(curr_weather_request_url)

    if response.status_code == 200:
        return response.json()
    else:
        return NO_WEATHER_ERROR_MSG

def fetch_and_parse_weather_nowcast(cords):
    data = fetch_weather_nowcast(cords)
    if data == NO_WEATHER_ERROR_MSG:
        return data

    curr_temp = convert_celvin_to_celcius(data['main']['temp'])
    fells_like = convert_celvin_to_celcius(data['main']['feels_like'])

    weather_cond_main = data['weather'][0]['main']
    weather_cond_description = data['weather'][0]['description']

    wind_speed = convert_ms_to_kmh(data['wind']['speed'])
    wind_direction = deg_to_compass(data['wind']['deg'])

    weather_nowcaset_string = (
        f"Das Wetter in {data['name']} ist aktuell bei {round_half_up(curr_temp)} °C "
        f"Bei gefühlten {round_half_up(fells_like)} °C. "
        f"Bei hauptsächlich {weather_cond_main} und {weather_cond_description} Wetter. "
        f"Mit Windgeschwindigkeiten von {wind_speed} km/h, aus {wind_direction} kommend."
    )

    print(weather_nowcaset_string)
    return weather_nowcaset_string

def get_current_weather_for_api():
    city_cords = get_cords_from_ip_location()
    data = fetch_weather_nowcast(city_cords)
    if data == NO_WEATHER_ERROR_MSG:
        return data

    weather_nowcast_data = WeatherNowcast(
        time = convert_timestamp_to_iso(data['dt']),
        temperature = round_half_up(convert_celvin_to_celcius(data['main']['temp'])),
        feels_like = round_half_up(convert_celvin_to_celcius(data['main']['feels_like'])),
        weather_condition = data['weather'][0]['main'],
        weather_description = data['weather'][0]['description']
    )

    return weather_nowcast_data

def get_current_weather():
    city_cords = get_cords_from_ip_location()
    return fetch_and_parse_weather_nowcast(city_cords)

def get_current_weather_from_specific_location(location_name, location_region):
    city_cords = get_cords_from_location(location_name, location_region)
    return fetch_and_parse_weather_nowcast(city_cords)

# --- weather forecast operations ---

def fetch_and_parse_weather_forecast(cords):
    forecast_weather_request_url = f"{BASE_URL}forecast?lat={cords.latitude}&lon={cords.longitude}&appid={API_KEY}"

    response = requests.get(forecast_weather_request_url)

    if response.status_code == 200:
        data = response.json()
        place_name = data['city']['name']
        current_time = datetime.now().strftime("%Y-%m-%dT%H:%M:%S")
    
        print(f"Wetter um {current_time} in {place_name}: {data}")
        return response.json

def get_weather_forecast():
    city_cords = get_cords_from_ip_location()
    return fetch_and_parse_weather_forecast(city_cords)
    
def get_weather_forecast_from_specific_location(location_name, location_region):
    city_cords = get_cords_from_location(location_name, location_region)
    return fetch_and_parse_weather_forecast(city_cords)

# --- get times for sunrise and sunset ---
def get_sunrise_time():
    city_cords = get_cords_from_ip_location()
    data = fetch_weather_nowcast(city_cords)
    if data == NO_WEATHER_ERROR_MSG:
        return data

    weather_nowcast_data = Sunrise(
        time = convert_timestamp_to_iso(data['sys']['sunrise'])
    )

    return weather_nowcast_data

def get_sunset_time():
    city_cords = get_cords_from_ip_location()
    data = fetch_weather_nowcast(city_cords)
    if data == NO_WEATHER_ERROR_MSG:
        return data

    weather_nowcast_data = Sunset(
        time = convert_timestamp_to_iso(data['sys']['sunset'])
    )

    return weather_nowcast_data

# --- convert data from openweathermap API to useful formatted data ---

def convert_celvin_to_celcius(deg_kelvin):
    return deg_kelvin - 273.15

def convert_ms_to_kmh(ms):
    return ms * 3.6

def convert_timestamp_to_iso(timestamp):
    return datetime.fromtimestamp(timestamp).isoformat()

def deg_to_compass(deg):
    directions = ['Norden', 'Nord-Nord-Ost', 'Nord-Ost', 'Ost-Nord-Ost', 
                  'Osten', 'Ost-Süd-Ost', 'Süd-Ost', 'Süd-Süd-Ost', 
                  'Süden', 'Süd-Süd-West', 'Süd-West', 'West-Süd-West', 
                  'Westen', 'West-Nord-West', 'Nord-West', 'Nord-Nord-West']
    index = round(deg / 22.5) % 16
    return directions[index]

def round_half_up(n):
    return math.floor(n * 10 + 0.5) / 10
