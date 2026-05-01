import json
from typing import List
from schemas.alarm_schema import Weekday

def parse_weekdays(db_value: str) -> List[Weekday]:
    raw_list = json.loads(db_value)  # ["MON", "WED", ...]

    return [Weekday(day) for day in raw_list]
