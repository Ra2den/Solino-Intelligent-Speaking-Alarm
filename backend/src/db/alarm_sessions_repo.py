from .connection import db
from .mappers import serialize_alarm_session_row, serialize_alarm_session_rows
from domain.alarms.schemas import AlarmSessionStatus
from datetime import datetime

def create_alarm_sessions_table():
    db.execute(
        """
        CREATE TABLE IF NOT EXISTS alarm_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            alarm_id INTEGER NOT NULL,
            status TEXT NOT NULL,
            started_at TEXT NOT NULL,
            snoozed_until TEXT,
            guard_expires_at TEXT,
            guard_tolerance_until TEXT,
            pressure_started_at TEXT,
            label TEXT,
            ring_count INTEGER DEFAULT 0,
            FOREIGN KEY (alarm_id) REFERENCES alarms (id)
        )
        """
    )
    _ensure_alarm_sessions_columns()


def _ensure_alarm_sessions_columns():
    existing_columns = [
        column["name"]
        for column in db.fetch_all("PRAGMA table_info(alarm_sessions)")
    ]

    if "guard_expires_at" not in existing_columns:
        db.execute("ALTER TABLE alarm_sessions ADD COLUMN guard_expires_at TEXT")

    if "guard_tolerance_until" not in existing_columns:
        db.execute("ALTER TABLE alarm_sessions ADD COLUMN guard_tolerance_until TEXT")

    if "pressure_started_at" not in existing_columns:
        db.execute("ALTER TABLE alarm_sessions ADD COLUMN pressure_started_at TEXT")
def create_alarm_session(
    alarm_id: int,
    status: AlarmSessionStatus,
    started_at: datetime,
    snoozed_until: datetime=None,
    guard_expires_at: datetime=None,
    guard_tolerance_until: datetime=None,
    pressure_started_at: datetime=None,
    label: str=None,
    ring_count: int=0,
):
    session_id: int = db.execute(
        """
        INSERT INTO alarm_sessions (
            alarm_id, status, started_at, snoozed_until, guard_expires_at, guard_tolerance_until, pressure_started_at, label, ring_count
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            alarm_id,
            status,
            started_at,
            snoozed_until,
            guard_expires_at,
            guard_tolerance_until,
            pressure_started_at,
            label,
            ring_count,
        ),
    )
    return get_alarm_session_by_id(session_id)


def get_alarm_session_by_id(session_id: int):
    return serialize_alarm_session_row(
        db.fetch_one("SELECT * FROM alarm_sessions WHERE id = ?", (session_id,))
    )

def get_unresolved_alarm_session_by_alarm_id(alarm_id: int):
    return serialize_alarm_session_row(
        db.fetch_one(
            """
            SELECT * FROM alarm_sessions
            WHERE alarm_id = ? AND status IN (?, ?, ?)
            ORDER BY started_at DESC, id DESC
            LIMIT 1
            """,
            (
                alarm_id,
                AlarmSessionStatus.RINGING,
                AlarmSessionStatus.SNOOZED,
                AlarmSessionStatus.GUARD,
            ),
        )
    )

def get_all_alarm_sessions():
    return serialize_alarm_session_rows(
        db.fetch_all("SELECT * FROM alarm_sessions ORDER BY started_at DESC")
    )


def get_latest_alarm_session():
    return serialize_alarm_session_row(
        db.fetch_one(
            "SELECT * FROM alarm_sessions ORDER BY started_at DESC, id DESC LIMIT 1"
        )
    )


def get_active_alarm_session():
    return serialize_alarm_session_row(
        db.fetch_one(
            """
            SELECT * FROM alarm_sessions
            WHERE status IN (?)
            ORDER BY started_at DESC, id DESC
            LIMIT 1
            """,
            (AlarmSessionStatus.RINGING,),
        )
    )

def get_latest_guard_alarm_session():
    return serialize_alarm_session_row(
        db.fetch_one(
            """
            SELECT * FROM alarm_sessions
            WHERE status = ?
            ORDER BY guard_expires_at DESC, id DESC
            LIMIT 1
            """,
            (AlarmSessionStatus.GUARD,),
        )
    )

def get_latest_snoozed_alarm_session():
    return serialize_alarm_session_row(
        db.fetch_one(
            """
            SELECT * FROM alarm_sessions
            WHERE status = ?
            ORDER BY snoozed_until DESC, id DESC
            LIMIT 1
            """,
            (AlarmSessionStatus.SNOOZED,),
        )
    )


def update_alarm_session(
    session_id: int,
    status: AlarmSessionStatus=None,
    snoozed_until: datetime=None,
    guard_expires_at: datetime=None,
    guard_tolerance_until: datetime=None,
    pressure_started_at: datetime=None,
    label: str=None,
    ring_count: int=None,
    clear_snoozed_until=False,
    clear_guard_expires_at=False,
    clear_guard_tolerance_until=False,
    clear_pressure_started_at=False,
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

    if guard_expires_at is not None:
        fields.append("guard_expires_at = ?")
        params.append(guard_expires_at)
    elif clear_guard_expires_at:
        fields.append("guard_expires_at = ?")
        params.append(None)

    if guard_tolerance_until is not None:
        fields.append("guard_tolerance_until = ?")
        params.append(guard_tolerance_until)
    elif clear_guard_tolerance_until:
        fields.append("guard_tolerance_until = ?")
        params.append(None)

    if pressure_started_at is not None:
        fields.append("pressure_started_at = ?")
        params.append(pressure_started_at)
    elif clear_pressure_started_at:
        fields.append("pressure_started_at = ?")
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


def delete_alarm_session(session_id: int):
    session = get_alarm_session_by_id(session_id)
    if not session:
        return None

    db.execute("DELETE FROM alarm_sessions WHERE id = ?", (session_id,))
    return session
