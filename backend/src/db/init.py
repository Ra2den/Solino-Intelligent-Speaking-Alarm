from .alarm_sessions_repo import create_alarm_sessions_table
from .alarms_repo import create_alarms_table


def init_db():
    create_alarms_table()
    create_alarm_sessions_table()
