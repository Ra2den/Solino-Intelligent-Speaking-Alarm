import json
from typing import List, Optional
from schemas.alarm_schema import Weekday

def parse_weekdays(db_value: Optional[str]) -> Optional[List[Weekday]]:
    if db_value is None:
        return None

    raw_list = json.loads(db_value)  # ["MON", "WED", ...] or null
    if raw_list is None:
        return None

    return [Weekday(day) for day in raw_list]

def validate_weekdays(recurring_days: list) -> bool:
    if isinstance(recurring_days, list):
        return all(isinstance(day, Weekday) for day in recurring_days)
    if recurring_days is None:
        print("Wecker wiederholt sich nicht")
        return True
    return False