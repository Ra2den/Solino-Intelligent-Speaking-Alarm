from db.alarm_sessions_db import create_alarm_sessions_table
from db.alarms_db import create_alarms_table
from db.db import db


def init_db():
    create_alarms_table()
    create_alarm_sessions_table()


init_db()

__all__ = ["db", "init_db"]
