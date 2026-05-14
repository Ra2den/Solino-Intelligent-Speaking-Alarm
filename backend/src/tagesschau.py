import requests
import json
from schemas.tagesschau_schema import NewsHeadline, DetailedNews

BASE_URL = "https://www.tagesschau.de/api2u"
NO_TAGESSCHAU_ERROR_MSG = "Fehler beim Abrufen der aktuellen Tagesschau Daten"
NO_DETAILED_NEWS_MSG = "Keine Infos zur Schlagzeile gefunden"
BANNED_NEWS_TAGS = ["Wetter"]

# Constants for json fetching

TAGS = "tags"
TAG = "tag"
EXTERNAL_ID = "externalId"
DATE = "date"
TITLE = "title"
NEWS = "news"
CONTENT = "content"
VALUE = "value"
TYPE = "type"
TEXT = "text"

def fetch_homepage_from_tagesschau():
    response = requests.get(f"{BASE_URL}/homepage")

    if response.status_code == 200:
        data = response.json()
        return data
    else:
        return NO_TAGESSCHAU_ERROR_MSG

def fetch_news_from_tagesschau():
    # TODO: refine with parameters
    response = requests.get(f"{BASE_URL}/news")

    if response.status_code == 200:
        data = response.json()
        return data
    else:
        return NO_TAGESSCHAU_ERROR_MSG

# TODO: SEARCH

def extract_news_headlines_from_json(news):
    news_headlines = []

    for headline in news:
        if any(tag[TAG] in BANNED_NEWS_TAGS for tag in headline[TAGS]):
            continue

        current_headline = NewsHeadline(
            id=headline[EXTERNAL_ID],
            time=headline[DATE],
            headline=headline[TITLE],
        )

        news_headlines.append(current_headline)

    return news_headlines

def get_headlines(get_homepage=True):
    news_data = {}

    if get_homepage:
        news_data = fetch_homepage_from_tagesschau()
    else:
        news_data = fetch_news_from_tagesschau()

    headlines = extract_news_headlines_from_json(news_data[NEWS])
    print(headlines)
    return headlines

def get_tagesschau_homepage():
    headlines = get_headlines(True)
    return headlines

def get_news():
    headlines = get_headlines(False)
    return headlines

def get_full_news_from_headline_id(id):
    print(f"ID der angefragten Schlagzeile: {id}")
    news_data = fetch_homepage_from_tagesschau()

    for headline in news_data[NEWS]:
        if (headline[EXTERNAL_ID] == id):
            content = ""

            for line in headline[CONTENT]:
                if (line[TYPE] == TEXT):
                    content += line[VALUE]

            current_headline = DetailedNews(
                id = headline[EXTERNAL_ID],
                time = headline[DATE],
                headline = headline[TITLE],
                content = content
            )
            
            print(current_headline)
            return current_headline

    return NO_DETAILED_NEWS_MSG
