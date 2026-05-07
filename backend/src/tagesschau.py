import requests
import json
from schemas.tagesschau_schema import NewsHeadline

BASE_URL = "https://www.tagesschau.de/api2u"
NO_TAGESSCHAU_ERROR_MSG = "Fehler beim Abrufen der aktuellen Tagesschau Daten"

def fetch_news_from_tagesschau():
    response = requests.get(f"{BASE_URL}/news")

    if response.status_code == 200:
        data = response.json()
        return data
    else:
        return NO_TAGESSCHAU_ERROR_MSG

def get_news():
    news_data = fetch_news_from_tagesschau()
    headlines_short = []

    for headline in news_data['news']:
        current_headline = NewsHeadline(
            time = headline['date'],
            headline = headline['title'],
        )

        headlines_short.append(current_headline)

    print(headlines_short)
    return headlines_short
