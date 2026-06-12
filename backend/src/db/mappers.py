import json

from domain.alarms.schemas import Weekday


def parse_weekdays(db_value):
    if db_value is None:
        return None

    raw_list = json.loads(db_value)
    if raw_list is None:
        return None

    return [Weekday(day) for day in raw_list]


def _serialize_rows(rows, serializer):
    return [serializer(row) for row in rows]


def serialize_alarm_row(row):
    if not row:
        return None

    alarm = dict(row)
    if alarm.get("recurring_days"):
        alarm["recurring_days"] = parse_weekdays(alarm["recurring_days"])

    return alarm


def serialize_alarm_rows(rows):
    return _serialize_rows(rows, serialize_alarm_row)


def serialize_alarm_session_row(row):
    if not row:
        return None

    return dict(row)


def serialize_alarm_session_rows(rows):
    return _serialize_rows(rows, serialize_alarm_session_row)
