from .db import db
from domain.alarms.schemas import AlarmSessionStatus

def create_alarm_sessions_table():
    db.execute(
        """
        CREATE TABLE IF NOT EXISTS alarm_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            alarm_id INTEGER NOT NULL,
            status TEXT NOT NULL,
            started_at TEXT NOT NULL,
            snoozed_until TEXT,
            label TEXT,
            ring_count INTEGER DEFAULT 0,
            FOREIGN KEY (alarm_id) REFERENCES alarms (id)
        )
        """
    )

def create_alarm_session(
    alarm_id: int,
    status: AlarmSessionStatus,
    started_at,
    snoozed_until=None,
    label=None,
    ring_count=0,
):
    session_id = db.execute(
        """
        INSERT INTO alarm_sessions (
            alarm_id, status, started_at, snoozed_until, label, ring_count
        ) VALUES (?, ?, ?, ?, ?, ?)
        """,
        (alarm_id, status, started_at, snoozed_until, label, ring_count),
    )
    return get_alarm_session_by_id(session_id)


def get_alarm_session_by_id(session_id):
    return db.fetch_one("SELECT * FROM alarm_sessions WHERE id = ?", (session_id,))

def get_unresolved_alarm_session_by_alarm_id(alarm_id):
    return db.fetch_one(
        """
        SELECT * FROM alarm_sessions
        WHERE alarm_id = ? AND status IN (?, ?)
        ORDER BY started_at DESC, id DESC
        LIMIT 1
        """,
        (alarm_id, AlarmSessionStatus.RINGING, AlarmSessionStatus.SNOOZED),
    )

def get_all_alarm_sessions():
    return db.fetch_all("SELECT * FROM alarm_sessions ORDER BY started_at DESC")


def get_latest_alarm_session():
    return db.fetch_one(
        "SELECT * FROM alarm_sessions ORDER BY started_at DESC, id DESC LIMIT 1"
    )


def get_active_alarm_session():
    return db.fetch_one(
        """
        SELECT * FROM alarm_sessions
        WHERE status IN (?)
        ORDER BY started_at DESC, id DESC
        LIMIT 1
        """, (AlarmSessionStatus.RINGING,)
    )
    
def get_latest_snoozed_alarm_session():
    return db.fetch_one(
        """
        SELECT * FROM alarm_sessions
        WHERE status = ?
        ORDER BY snoozed_until DESC, id DESC
        LIMIT 1
        """, (AlarmSessionStatus.SNOOZED,)
    )


def update_alarm_session(
    session_id,
    status=None,
    snoozed_until=None,
    label=None,
    ring_count=None,
    clear_snoozed_until=False,
):
    fields = []
    params = []

    if status is not None:
        fields.append("status = ?")
        params.append(status)

    if snoozed_until is not None:
        fields.append("snoozed_until = ?")
        params.append(snoozed_until)
    elif clear_snoozed_until:
        fields.append("snoozed_until = ?")
        params.append(None)

    if label is not None:
        fields.append("label = ?")
        params.append(label)

    if ring_count is not None:
        fields.append("ring_count = ?")
        params.append(ring_count)

    if not fields:
        return get_alarm_session_by_id(session_id)

    params.append(session_id)
    query = f"UPDATE alarm_sessions SET {', '.join(fields)} WHERE id = ?"
    db.execute(query, tuple(params))
    return get_alarm_session_by_id(session_id)


def delete_alarm_session(session_id):
    session = get_alarm_session_by_id(session_id)
    if not session:
        return None

    db.execute("DELETE FROM alarm_sessions WHERE id = ?", (session_id,))
    return session
