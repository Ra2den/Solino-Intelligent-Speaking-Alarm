import json

from db.db import db
from db_helper import parse_weekdays


def create_alarms_table():
    db.execute(
        """
        CREATE TABLE IF NOT EXISTS alarms (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            time TEXT NOT NULL,
            label TEXT,
            recurring_days JSON,
            active INTEGER DEFAULT 1,
            last_triggered_at TEXT,
            last_triggered_date TEXT
        )
        """
    )

    with db.connect() as conn:
        columns = {
            row["name"]
            for row in conn.execute("PRAGMA table_info(alarms)").fetchall()
        }
        if "last_triggered_date" not in columns:
            conn.execute("ALTER TABLE alarms ADD COLUMN last_triggered_date TEXT")
        if "last_triggered_at" not in columns:
            conn.execute("ALTER TABLE alarms ADD COLUMN last_triggered_at TEXT")


def _serialize_alarm_row(row):
    if not row:
        return None

    alarm = dict(row)
    if alarm.get("recurring_days"):
        alarm["recurring_days"] = parse_weekdays(alarm["recurring_days"])

    return alarm


def _serialize_alarm_rows(rows):
    return [_serialize_alarm_row(row) for row in rows]


def add_alarm(time_value, label, recurring_days):
    recurring_days_json = json.dumps(recurring_days)
    alarm_id = db.execute(
        "INSERT INTO alarms (time, label, recurring_days, active) VALUES (?, ?, ?, 1)",
        (time_value, label, recurring_days_json),
    )
    return get_alarm_by_id(alarm_id)


def get_all_alarms():
    return _serialize_alarm_rows(db.fetch_all("SELECT * FROM alarms"))


def get_active_alarms():
    return _serialize_alarm_rows(db.fetch_all("SELECT * FROM alarms WHERE active = 1"))


def get_alarm_by_time(time_value):
    return _serialize_alarm_row(
        db.fetch_one("SELECT * FROM alarms WHERE time = ?", (time_value,))
    )


def get_alarm_by_id(alarm_id):
    return _serialize_alarm_row(
        db.fetch_one("SELECT * FROM alarms WHERE id = ?", (alarm_id,))
    )


def delete_alarm_by_id(alarm_id):
    alarm = get_alarm_by_id(alarm_id)
    if not alarm:
        return None

    db.execute("DELETE FROM alarms WHERE id = ?", (alarm_id,))
    return alarm


def toggle_alarm(alarm_id):
    db.execute(
        "UPDATE alarms SET active = NOT active WHERE id = ?",
        (alarm_id,),
    )
    return get_alarm_by_id(alarm_id)


def set_alarm_active(alarm_id, active):
    db.execute(
        "UPDATE alarms SET active = ? WHERE id = ?",
        (1 if active else 0, alarm_id),
    )
    return get_alarm_by_id(alarm_id)


def set_last_triggered_date(alarm_id, last_triggered_date):
    db.execute(
        "UPDATE alarms SET last_triggered_date = ? WHERE id = ?",
        (last_triggered_date, alarm_id),
    )
    return get_alarm_by_id(alarm_id)


def set_last_triggered_at(alarm_id, last_triggered_at):
    db.execute(
        "UPDATE alarms SET last_triggered_at = ? WHERE id = ?",
        (last_triggered_at, alarm_id),
    )
    return get_alarm_by_id(alarm_id)


def delete_alarm_by_time(time_value):
    alarm = get_alarm_by_time(time_value)
    if not alarm:
        return None

    db.execute("DELETE FROM alarms WHERE id = ?", (alarm["id"],))
    return alarm


def update_alarm(alarm_id, time=None, label=None, recurring_days=None, active=None):
    fields = []
    params = []

    if time is not None:
        fields.append("time = ?")
        params.append(time)

    if label is not None:
        fields.append("label = ?")
        params.append(label)

    fields.append("recurring_days = ?")
    params.append(json.dumps(recurring_days))

    if active is not None:
        fields.append("active = ?")
        params.append(active)

    if not fields:
        return None

    params.append(alarm_id)
    query = f"UPDATE alarms SET {', '.join(fields)} WHERE id = ?"
    db.execute(query, tuple(params))
    return get_alarm_by_id(alarm_id)
