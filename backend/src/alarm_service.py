import logging
import time
from collections.abc import Callable
from datetime import datetime, timedelta

import db.alarms_db as alarms_db
from db_helper import validate_weekdays
from schemas.alarm_schema import Weekday

logger = logging.getLogger(__name__)

WEEKDAY_MAP = {
    0: Weekday.MON,
    1: Weekday.TUE,
    2: Weekday.WED,
    3: Weekday.THU,
    4: Weekday.FRI,
    5: Weekday.SAT,
    6: Weekday.SUN,
}

def add_alarm(time_value, label, recurring_days):
    """Create a new alarm if the recurring weekdays are valid."""
    if not validate_weekdays(recurring_days):
        return None

    return alarms_db.add_alarm(time_value, label, recurring_days)

def get_all_alarms():
    """Return all alarms, active and inactive."""
    return alarms_db.get_all_alarms()

def get_active_alarms():
    """Return only alarms that are currently active."""
    return alarms_db.get_active_alarms()

def get_alarm_by_time(time_value):
    """Return the alarm that matches the given HH:MM time."""
    return alarms_db.get_alarm_by_time(time_value)

def toggle_alarm(alarm_id):
    """Flip an alarm between active and inactive."""
    return alarms_db.toggle_alarm(alarm_id)

def set_alarm_active(alarm_id, active):
    """Explicitly set an alarm to active or inactive."""
    return alarms_db.set_alarm_active(alarm_id, active)

def set_last_triggered_at(alarm_id, last_triggered_at):
    """Persist the last trigger timestamp for an alarm."""
    return alarms_db.set_last_triggered_at(alarm_id, last_triggered_at)

def delete_alarm_by_time(time_value):
    """Delete an alarm by its HH:MM time value."""
    return alarms_db.delete_alarm_by_time(time_value)

# MONITORING LOGIC

def _matches_today(alarm, current_datetime):
    """Return True when the alarm is allowed to ring on the current weekday."""
    recurring_days = alarm.get("recurring_days")
    if not recurring_days:
        return True

    current_weekday = WEEKDAY_MAP[current_datetime.weekday()]
    return current_weekday in recurring_days

def _already_triggered_for_due_time(alarm, scheduled_alarm_datetime):
    """Return True if this scheduled alarm occurrence was already handled."""
    last_triggered_at = alarm.get("last_triggered_at")
    if not last_triggered_at:
        return False

    last_triggered_datetime = datetime.fromisoformat(last_triggered_at)
    return last_triggered_datetime >= scheduled_alarm_datetime

def _get_due_datetime(alarm, reference_datetime):
    """Build today's scheduled datetime for the alarm from its HH:MM value."""
    scheduled_alarm_time = datetime.strptime(alarm["time"], "%H:%M").time()
    return datetime.combine(reference_datetime.date(), scheduled_alarm_time)

def _is_due_in_window(alarm, previous_check_datetime, current_datetime):
    """Return True if the alarm became due between the last check and now."""
    scheduled_alarm_datetime = _get_due_datetime(alarm, current_datetime)

    if not previous_check_datetime <= scheduled_alarm_datetime <= current_datetime:
        return False

    if not _matches_today(alarm, current_datetime):
        return False

    if _already_triggered_for_due_time(alarm, scheduled_alarm_datetime):
        return False

    return True

def _mark_alarm_triggered(alarm, triggered_at_datetime):
    """Save trigger metadata and deactivate one-time alarms."""
    set_last_triggered_at(alarm["id"], triggered_at_datetime.isoformat())

    if not alarm.get("recurring_days"):
        set_alarm_active(alarm["id"], False)

def monitor_alarms(
    on_alarm_triggered: Callable[[dict], None],
    poll_interval=10,
    startup_grace_period=60,
):
    """Continuously check for due alarms and call the provided callback."""
    logger.info("Wecker-Monitor gestartet")
    previous_check_datetime = datetime.now() - timedelta(seconds=startup_grace_period)

    while True:
        current_datetime = datetime.now()
        active_alarms = get_active_alarms()

        for alarm in active_alarms:
            if _is_due_in_window(alarm, previous_check_datetime, current_datetime):
                try:
                    _mark_alarm_triggered(alarm, current_datetime)
                    on_alarm_triggered(alarm)
                except Exception:
                    logger.exception(
                        "Fehler beim Ausloesen des Alarms %s",
                        alarm["id"],
                    )

        previous_check_datetime = current_datetime

        time.sleep(poll_interval)
