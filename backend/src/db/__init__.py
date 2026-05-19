from .alarm_sessions_repo import create_alarm_sessions_table
from .alarms_repo import create_alarms_table
from .db import db


def init_db():
    create_alarms_table()
    create_alarm_sessions_table()


init_db()

__all__ = ["db", "init_db"]
