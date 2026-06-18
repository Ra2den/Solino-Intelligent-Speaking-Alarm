from domain.alarms.schemas import Weekday

STRING_TO_WEEKDAY = {
    'MON': Weekday.MON,
    'TUE': Weekday.TUE,
    'WED': Weekday.WED,
    'THU': Weekday.THU,
    'FRI': Weekday.FRI,
    'SAT': Weekday.SAT,
    'SUN': Weekday.SUN,
}

def validate_weekdays(recurring_days: list) -> bool:
    if recurring_days is None:
        print("Wecker wiederholt sich nicht")
        return True
    if not isinstance(recurring_days, list):
        return False

    valid_strings = set(STRING_TO_WEEKDAY.keys())
    for day in recurring_days:
        if isinstance(day, Weekday):
            continue
        if isinstance(day, str) and day in valid_strings:
            continue
        return False
    return True