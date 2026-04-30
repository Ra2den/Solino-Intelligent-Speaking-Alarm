import sqlite3

import sqlite3
from contextlib import contextmanager

class Database:
    def __init__(self, db_path="alarms.db"):
        self.db_path = db_path

    @contextmanager
    def _connect(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        try:
            yield conn
            conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()
    
    def init_db(self):
        self.execute('''
            CREATE TABLE IF NOT EXISTS alarms (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                time TEXT NOT NULL,
                label TEXT,
                active INTEGER DEFAULT 1
            )
        ''')

    def execute(self, query, params=()):
        with self._connect() as conn:
            cursor = conn.execute(query, params)
            return cursor.lastrowid

    def fetch_all(self, query, params=()):
        with self._connect() as conn:
            cursor = conn.execute(query, params)
            rows = cursor.fetchall()
            return [dict(row) for row in rows]

    def fetch_one(self, query, params=()):
        with self._connect() as conn:
            cursor = conn.execute(query, params)
            row = cursor.fetchone()
            return dict(row) if row else None

def db_add_alarm(time, label):
    alarm_id = db.execute(
        "INSERT INTO alarms (time, label, active) VALUES (?, ?, 1)",
        (time, label)
    )
    return db.fetch_one("SELECT * FROM alarms WHERE id = ?", (alarm_id,))
    
def db_get_all_alarms():
    return db.fetch_all("SELECT * FROM alarms")

def db_get_active_alarms():
    return db.fetch_all("SELECT * FROM alarms WHERE active = 1")

def db_get_alarm_by_time(time):
    return db.fetch_one("SELECT * FROM alarms WHERE time = ?", (time,))

def db_get_alarm_by_id(alarm_id):
    return db.fetch_one("SELECT * FROM alarms WHERE id = ?", (alarm_id,))

def db_delete_alarm_by_id(alarm_id):
    alarm = db.fetch_one("SELECT * FROM alarms WHERE id = ?", (alarm_id,))
    if not alarm:
        return None
    db.execute("DELETE FROM alarms WHERE id = ?", (alarm_id,))
    return alarm

def db_toggle_alarm(alarm_id):
    db.execute(
        "UPDATE alarms SET active = NOT active WHERE id = ?",
        (alarm_id,)
    )
    return db.fetch_one("SELECT * FROM alarms WHERE id = ?", (alarm_id,))

def db_delete_alarm_by_time(time):
    alarm = db.fetch_one("SELECT * FROM alarms WHERE time = ?", (time,))
    if not alarm:
        return None
    db.execute("DELETE FROM alarms WHERE id = ?", (alarm["id"],))
    return alarm

def db_update_alarm(alarm_id, time=None, label=None):
    fields = []
    params = []

    if time is not None:
        fields.append("time = ?")
        params.append(time)

    if label is not None:
        fields.append("label = ?")
        params.append(label)

    if not fields:
        return None

    params.append(alarm_id)

    query = f"UPDATE alarms SET {', '.join(fields)} WHERE id = ?"
    db.execute(query, tuple(params))

    row = db.fetch_one(
        "SELECT * FROM alarms WHERE id = ?",
        (alarm_id,)
    )

    return dict(row) if row else None

# Initialisiere die Datenbank und erstelle die Tabelle, falls sie nicht existiert
db = Database()
db.init_db()