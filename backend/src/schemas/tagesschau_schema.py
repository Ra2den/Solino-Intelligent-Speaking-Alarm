from datetime import datetime
from pydantic import BaseModel

class NewsHeadline(BaseModel):
    time: str
    headline: str