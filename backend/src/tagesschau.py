import requests
import json
import re
from schemas.tagesschau_schema import NewsHeadline, DetailedNews

BASE_URL = "https://www.tagesschau.de/api2u"
NO_TAGESSCHAU_ERROR_MSG = "Fehler beim Abrufen der aktuellen Tagesschau Daten"
NO_DETAILED_NEWS_MSG = "Keine Infos zur Schlagzeile gefunden"
BANNED_NEWS_TAGS = ["Wetter"]

# --- Constants for json fetching ---

NEWS = "news"
NEWS_TAGS = "tags"
NEWS_TAG = "tag"
EXTERNAL_ID = "externalId"
DATE_TIME = "date"
TITLE = "title"
CONTENT = "content"
VALUE = "value"
TYPE = "type"
TEXT = "text"

news_map = {}

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

def insert_detailed_news_from_json_into_news_map(news_json):
    for headline in news_json:
        if any(tag[NEWS_TAG] in BANNED_NEWS_TAGS for tag in headline[NEWS_TAGS]):
            continue

        news_id = headline[EXTERNAL_ID]
        content = ''

        for line in headline.get(CONTENT, ''):
            if (line.get(TYPE, '') == TEXT):
                content += remove_html(line[VALUE])

        current_headline = DetailedNews(
            id = headline[EXTERNAL_ID],
            time = headline[DATE_TIME],
            headline = headline[TITLE],
            content = content
        )

        news_map[news_id] = current_headline

def extract_news_headlines_from_json(news_json):
    insert_detailed_news_from_json_into_news_map(news_json)
    news_headlines = []

    for headline in news_json:
        if any(tag[NEWS_TAG] in BANNED_NEWS_TAGS for tag in headline[NEWS_TAGS]):
            continue

        headline_cache = news_map.get(headline[EXTERNAL_ID])
        current_headline = NewsHeadline(
            id=getattr(headline_cache, 'id', headline[EXTERNAL_ID]),
            time=getattr(headline_cache, 'time', headline[DATE_TIME]),
            headline=getattr(headline_cache, 'headline', headline[TITLE]),
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
    news_data = news_map.get(id)

    if news_data:
        print(news_data)
        return news_data

    return NO_DETAILED_NEWS_MSG

def remove_html(text):
    text = re.sub(r'<[^>]+>', '', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def test_tagesschau():
    get_news()
    get_tagesschau_homepage()
    print(news_map)
