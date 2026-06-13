import json

from domain.alarms.schemas import Weekday
from domain.settings.schemas import SettingsCategory, SettingsKey, SETTING_TYPE_MAP


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


def serialize_setting_row(row):
    if not row:
        return None

    setting = dict(row)
    if "category" in setting and setting["category"]:
        setting["category"] = SettingsCategory(setting["category"])
    if "key" in setting and setting["key"]:
        setting["key"] = SettingsKey(setting["key"])
        
        # Cast the value string back to its proper type
        if "value" in setting:
            target_type = SETTING_TYPE_MAP.get(setting["key"], str)
            try:
                if target_type == bool:
                    setting["value"] = setting["value"].lower() in ("true", "1", "yes")
                else:
                    setting["value"] = target_type(setting["value"])
            except (ValueError, TypeError):
                pass # Fallback to original string if casting fails

    return setting

def serialize_setting_rows(rows):
    return _serialize_rows(rows, serialize_setting_row)
