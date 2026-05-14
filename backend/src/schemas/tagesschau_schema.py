from datetime import datetime
from pydantic import BaseModel

class NewsHeadline(BaseModel):
    id: str
    time: str
    headline: str

class DetailedNews(BaseModel):
    id: str
    time: str
    headline: str
    content: str