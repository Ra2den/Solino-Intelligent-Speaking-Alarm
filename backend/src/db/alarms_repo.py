import json

from .connection import db
from .mappers import serialize_alarm_row, serialize_alarm_rows


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

def add_alarm(time_value, label, recurring_days):
    recurring_days_json = json.dumps(recurring_days)
    alarm_id = db.execute(
        "INSERT INTO alarms (time, label, recurring_days, active) VALUES (?, ?, ?, 1)",
        (time_value, label, recurring_days_json),
    )
    return get_alarm_by_id(alarm_id)


def get_all_alarms():
    return serialize_alarm_rows(db.fetch_all("SELECT * FROM alarms ORDER BY time"))


def get_active_alarms():
    return serialize_alarm_rows(
        db.fetch_all("SELECT * FROM alarms WHERE active = 1 ORDER BY time")
    )


def get_alarm_by_time(time_value):
    return serialize_alarm_row(
        db.fetch_one("SELECT * FROM alarms WHERE time = ?", (time_value,))
    )


def get_alarm_by_id(alarm_id):
    return serialize_alarm_row(
        db.fetch_one("SELECT * FROM alarms WHERE id = ?", (alarm_id,))
    )


def delete_alarm_by_id(alarm_id):
    alarm = get_alarm_by_id(alarm_id)
    if not alarm:
        return None

    db.execute("DELETE FROM alarms WHERE id = ?", (alarm_id,))
    return alarm


def toggle_alarm(alarm_id):
    alarm = get_alarm_by_id(alarm_id)
    if not alarm:
        return None

    next_active = not alarm["active"]
    fields = ["active = ?"]
    params = [1 if next_active else 0]

    if next_active:
        fields.append("last_triggered_at = ?")
        params.append(None)

    params.append(alarm_id)
    db.execute(
        f"UPDATE alarms SET {', '.join(fields)} WHERE id = ?",
        tuple(params),
    )
    return get_alarm_by_id(alarm_id)


def set_alarm_active(alarm_id, active):
    fields = ["active = ?"]
    params = [1 if active else 0]

    if active:
        fields.append("last_triggered_at = ?")
        params.append(None)

    params.append(alarm_id)
    db.execute(
        f"UPDATE alarms SET {', '.join(fields)} WHERE id = ?",
        tuple(params),
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
    existing_alarm = get_alarm_by_id(alarm_id)
    if not existing_alarm:
        return None

    fields = []
    params = []
    should_clear_last_triggered_at = False

    if time is not None:
        fields.append("time = ?")
        params.append(time)
        should_clear_last_triggered_at = time != existing_alarm["time"]

    if label is not None:
        fields.append("label = ?")
        params.append(label)

    fields.append("recurring_days = ?")
    params.append(json.dumps(recurring_days))

    if active is not None:
        fields.append("active = ?")
        params.append(1 if active else 0)
        should_clear_last_triggered_at = should_clear_last_triggered_at or (
            active and not existing_alarm["active"]
        )

    if should_clear_last_triggered_at:
        fields.append("last_triggered_at = ?")
        params.append(None)

    if not fields:
        return None

    params.append(alarm_id)
    query = f"UPDATE alarms SET {', '.join(fields)} WHERE id = ?"
    db.execute(query, tuple(params))
    return get_alarm_by_id(alarm_id)
