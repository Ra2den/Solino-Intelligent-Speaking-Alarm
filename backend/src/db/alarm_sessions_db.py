from db.db import db


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
            message TEXT,
            FOREIGN KEY (alarm_id) REFERENCES alarms (id)
        )
        """
    )


def create_alarm_session(
    alarm_id,
    status,
    started_at,
    snoozed_until=None,
    label=None,
    ring_count=0,
    message=None,
):
    session_id = db.execute(
        """
        INSERT INTO alarm_sessions (
            alarm_id, status, started_at, snoozed_until, label, ring_count, message
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (alarm_id, status, started_at, snoozed_until, label, ring_count, message),
    )
    return get_alarm_session_by_id(session_id)


def get_alarm_session_by_id(session_id):
    return db.fetch_one("SELECT * FROM alarm_sessions WHERE id = ?", (session_id,))


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
        WHERE status IN ('RINGING', 'SNOOZED')
        ORDER BY started_at DESC, id DESC
        LIMIT 1
        """
    )


def update_alarm_session(
    session_id,
    status=None,
    snoozed_until=None,
    label=None,
    ring_count=None,
    message=None,
):
    fields = []
    params = []

    if status is not None:
        fields.append("status = ?")
        params.append(status)

    if snoozed_until is not None:
        fields.append("snoozed_until = ?")
        params.append(snoozed_until)

    if label is not None:
        fields.append("label = ?")
        params.append(label)

    if ring_count is not None:
        fields.append("ring_count = ?")
        params.append(ring_count)

    if message is not None:
        fields.append("message = ?")
        params.append(message)

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
