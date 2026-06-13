from .alarm_sessions_repo import create_alarm_sessions_table
from .alarms_repo import create_alarms_table
from .settings_repo import create_settings_table


def init_db():
    create_alarms_table()
    create_alarm_sessions_table()
    create_settings_table()
