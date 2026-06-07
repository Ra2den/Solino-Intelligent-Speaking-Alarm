import logging
import time
from datetime import datetime, timedelta
from api.websocket_manager import manager

import db.alarm_sessions_repo as alarm_sessions_repo
import db.alarms_repo as alarms_repo
from domain.alarms.player import alarm_player
from domain.alarms.schemas import AlarmSession, AlarmSessionStatus, Weekday, AlarmSessionWsMessage, AlarmSessionWsType
from domain.alarms.helper.alarm_helper import validate_weekdays

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

    return alarms_repo.add_alarm(time_value, label, recurring_days)

def get_all_alarms():
    """Return all alarms, active and inactive."""
    return alarms_repo.get_all_alarms()

def get_active_alarms():
    """Return only alarms that are currently active."""
    return alarms_repo.get_active_alarms()

def get_alarm_by_time(time_value):
    """Return the alarm that matches the given HH:MM time."""
    return alarms_repo.get_alarm_by_time(time_value)


def get_alarm_by_id(alarm_id):
    """Return an alarm by its numeric ID."""
    return alarms_repo.get_alarm_by_id(alarm_id)


def update_alarm(alarm_id, time=None, label=None, recurring_days=None, active=None):
    """Update an alarm's properties."""
    return alarms_repo.update_alarm(
        alarm_id=alarm_id,
        time=time,
        label=label,
        recurring_days=recurring_days,
        active=active,
    )


def delete_alarm_by_id(alarm_id):
    """Delete an alarm by its numeric ID."""
    return alarms_repo.delete_alarm_by_id(alarm_id)


def toggle_alarm(alarm_id):
    """Flip an alarm between active and inactive."""
    return alarms_repo.toggle_alarm(alarm_id)

def set_alarm_active(alarm_id, active):
    """Explicitly set an alarm to active or inactive."""
    return alarms_repo.set_alarm_active(alarm_id, active)

def set_last_triggered_at(alarm_id, last_triggered_at):
    """Persist the last trigger timestamp for an alarm."""
    return alarms_repo.set_last_triggered_at(alarm_id, last_triggered_at)

def delete_alarm_by_time(time_value):
    """Delete an alarm by its HH:MM time value."""
    return alarms_repo.delete_alarm_by_time(time_value)


def get_current_alarm_session():
    """Return the currently active alarm session, if any."""
    return alarm_sessions_repo.get_active_alarm_session()


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


def _resume_snoozed_session_if_due(current_datetime):
    """Resume a snoozed session once its snooze window has elapsed."""
    current_session = alarm_sessions_repo.get_latest_snoozed_alarm_session()
    if not current_session:
        return False

    if current_session["status"] != AlarmSessionStatus.SNOOZED:
        return False

    snoozed_until = current_session.get("snoozed_until")
    if not snoozed_until:
        return False

    if datetime.fromisoformat(snoozed_until) > current_datetime:
        return False

    updated_session = alarm_sessions_repo.update_alarm_session(
        current_session["id"],
        status=AlarmSessionStatus.RINGING,
        ring_count=current_session["ring_count"] + 1,
        clear_snoozed_until=True,
    )
    alarm_player.start_loop(session_id=current_session["id"])
    logger.info("Snoozed alarm session %s resumed", current_session["id"])
    _broadcast_alarm_state(updated_session)
    return True

def monitor_alarms(
    poll_interval=10,
    startup_grace_period=60,
):
    """Continuously check for due alarms and call the provided callback."""
    logger.info("Wecker-Monitor gestartet")
    previous_check_datetime = datetime.now() - timedelta(seconds=startup_grace_period)

    while True:
        current_datetime = datetime.now()
        _resume_snoozed_session_if_due(current_datetime)
        active_alarms = get_active_alarms()

        for alarm in active_alarms:
            if _is_due_in_window(alarm, previous_check_datetime, current_datetime):
                try:
                    _mark_alarm_triggered(alarm, current_datetime)
                    start_ringing_sesssion(alarm)
                except Exception:
                    logger.exception(
                        "Fehler beim Ausloesen des Alarms %s",
                        alarm["id"],
                    )

        previous_check_datetime = current_datetime

        time.sleep(poll_interval)

def _broadcast_alarm_state(session, message_type=AlarmSessionWsType.UPDATE):
    """Broadcast alarm session state to all connected WebSocket clients."""

    message: AlarmSessionWsMessage = AlarmSessionWsMessage(
        type=message_type,
        session=session,
    )

    manager.broadcast_threadsafe(message)

def start_ringing_sesssion(alarm):
    existing_session = alarm_sessions_repo.get_unresolved_alarm_session_by_alarm_id(alarm["id"])
    if existing_session and existing_session.get("status") in (
        AlarmSessionStatus.RINGING,
        AlarmSessionStatus.SNOOZED,
    ):
        return

    current_session: AlarmSession = alarm_sessions_repo.create_alarm_session(
        alarm_id=alarm["id"], 
        status=AlarmSessionStatus.RINGING, 
        started_at=datetime.now().isoformat(),
        label=alarm["label"],
    )
    alarm_player.start_loop(session_id=current_session["id"])
    _broadcast_alarm_state(current_session)

def stop_ringing_session(session_id: int, status=AlarmSessionStatus.DISMISSED):
    existing_session = alarm_sessions_repo.get_alarm_session_by_id(session_id)
    if not existing_session:
        return None

    current_audio_session_id = alarm_player.current_session_id()
    should_stop_audio = current_audio_session_id in (None, session_id)

    if not should_stop_audio:
        logger.warning(
            "Resolving session %s without stopping audio for current session %s",
            session_id,
            current_audio_session_id,
        )

    session = alarm_sessions_repo.update_alarm_session(
        session_id,
        status=status,
        snoozed_until=(datetime.now() + timedelta(seconds=10)).isoformat() if status == AlarmSessionStatus.SNOOZED else None,
        clear_snoozed_until=status != AlarmSessionStatus.SNOOZED,
    )

    if should_stop_audio:
        alarm_player.stop()

    _broadcast_alarm_state(session)

    if status == AlarmSessionStatus.DISMISSED and session:
        alarm = alarms_repo.get_alarm_by_id(session["alarm_id"])
        if alarm:
            from domain.assistant.service import wake_up, is_ollama_available

            if is_ollama_available():
                try:
                    wake_up(alarm["time"], session.get("label") or alarm.get("label", ""))
                except Exception:
                    logger.exception(
                        "Wake-up assistant failed for dismissed session %s",
                        session_id,
                    )
            else:
                logger.warning(
                    "Ollama service is not available. Skipping wake-up assistant for dismissed session %s",
                    session_id,
                )
        else:
            logger.warning(
                "Could not find alarm %s for dismissed session %s",
                session["alarm_id"],
                session_id,
            )

    return session
