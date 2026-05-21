from domain.alarms.schemas import Weekday

def validate_weekdays(recurring_days: list) -> bool:
    if isinstance(recurring_days, list):
        return all(isinstance(day, Weekday) for day in recurring_days)
    if recurring_days is None:
        print("Wecker wiederholt sich nicht")
        return True
    return False
