from datetime import datetime
from pydantic import BaseModel

class NewsHeadline(BaseModel):
    id: str
    time: datetime
    headline: str

class DetailedNews(BaseModel):
    id: str
    time: datetime
    headline: str
    content: str