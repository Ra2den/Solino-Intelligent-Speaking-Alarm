import logging
import time
import os
from datetime import datetime, timedelta
from api.websocket_manager import manager

import db.alarm_sessions_repo as alarm_sessions_repo
import db.alarms_repo as alarms_repo
from domain.alarms.player import alarm_player
from domain.alarms.schemas import AlarmSession, AlarmSessionStatus, Weekday, AlarmSessionWsMessage, AlarmSessionWsType
from domain.alarms.helper.alarm_helper import validate_weekdays
from domain.settings import service as settings_service

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
    unresolved = alarm_sessions_repo.get_unresolved_alarm_session_by_alarm_id(alarm_id)
    if unresolved:
        raise ValueError("Cannot delete alarm with active or unresolved sessions.")
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
    alarm = alarms_repo.get_alarm_by_time(time_value)
    if alarm:
        unresolved = alarm_sessions_repo.get_unresolved_alarm_session_by_alarm_id(alarm["id"])
        if unresolved:
            raise ValueError("Cannot delete alarm with active or unresolved sessions.")
    return alarms_repo.delete_alarm_by_time(time_value)


def get_current_alarm_session():
    """Return the currently active alarm session, if any."""
    current_session = alarm_sessions_repo.get_active_alarm_session()
    if current_session:
        return current_session

    snoozed_session = alarm_sessions_repo.get_latest_snoozed_alarm_session()
    if snoozed_session:
        snoozed_until = snoozed_session.get("snoozed_until")
        if snoozed_until and datetime.fromisoformat(snoozed_until) > datetime.now():
            return snoozed_session

    guard_session = alarm_sessions_repo.get_latest_guard_alarm_session()
    if not guard_session:
        return None

    guard_expires_at = guard_session.get("guard_expires_at")
    if not guard_expires_at:
        return None

    if datetime.fromisoformat(guard_expires_at) > datetime.now():
        return guard_session

    return None


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

def _retrigger_guard_session_if_due(current_datetime):
    """
    Retrigger a guard session if pressure has been held past the tolerance period.
    This acts as a background check to catch scenarios where pressure is continuously 
    applied and the initial tolerance timer runs out without a new sensor event.
    """
    current_session = alarm_sessions_repo.get_latest_guard_alarm_session()
    if not current_session:
        return False

    if current_session["status"] != AlarmSessionStatus.GUARD:
        return False

    guard_expires_at = current_session.get("guard_expires_at")
    if guard_expires_at:
        if current_datetime >= datetime.fromisoformat(guard_expires_at):
            return False

    pressure_started_at = current_session.get("pressure_started_at")
    if not pressure_started_at:
        return False

    pressure_started_at_dt = datetime.fromisoformat(pressure_started_at)
    
    guard_tolerance_min = settings_service.get_guard_mode_tolerance_min()
    if current_datetime - pressure_started_at_dt < timedelta(minutes=guard_tolerance_min):
        return False

    updated_session = alarm_sessions_repo.update_alarm_session(
        current_session["id"],
        status=AlarmSessionStatus.RINGING,
        clear_guard_expires_at=True,
        clear_guard_tolerance_until=True,
        clear_pressure_started_at=True,
        clear_snoozed_until=True,
    )
    alarm_player.start_loop(session_id=current_session["id"])
    logger.info("Guard alarm session %s retriggered due to sustained pressure", current_session["id"])
    _broadcast_alarm_state(updated_session)
    return True

def _dismiss_expired_guard_session_if_due(current_datetime):
    """
    Dismiss a guard session if its overall expiration time has passed.
    Actively transitions the session status to DISMISSED, which triggers 
    the morning assistant and automatically hides the guard screen on the frontend.
    """
    current_session = alarm_sessions_repo.get_latest_guard_alarm_session()
    if not current_session:
        return False

    if current_session["status"] != AlarmSessionStatus.GUARD:
        return False

    guard_expires_at = current_session.get("guard_expires_at")
    if not guard_expires_at:
        return False

    if current_datetime >= datetime.fromisoformat(guard_expires_at):
        stop_ringing_session(current_session["id"], status=AlarmSessionStatus.DISMISSED)
        logger.info("Guard alarm session %s expired and was dismissed", current_session["id"])
        return True

    return False

def monitor_alarms(
    poll_interval=1,
    startup_grace_period=60,
):
    """
    Continuously check for due alarms and manage active alarm sessions.
    The poll_interval is kept low (e.g., 1 second) to ensure immediate responses 
    when guard tolerance or expiration timers finish.
    """
    logger.info("Wecker-Monitor gestartet")
    previous_check_datetime = datetime.now() - timedelta(seconds=startup_grace_period)

    while True:
        current_datetime = datetime.now()
        _resume_snoozed_session_if_due(current_datetime)
        _dismiss_expired_guard_session_if_due(current_datetime)
        _retrigger_guard_session_if_due(current_datetime)
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
    """
    Transition an active alarm to the RINGING state and start audio playback.
    If a session is already ringing or snoozed, it prevents duplicate sessions from being created.
    """
    existing_session = alarm_sessions_repo.get_unresolved_alarm_session_by_alarm_id(alarm["id"])
    if existing_session and existing_session.get("status") in (
        AlarmSessionStatus.RINGING,
        AlarmSessionStatus.SNOOZED,
    ):
        return

    started_at_time_value = str(datetime.now().isoformat())
    current_session: AlarmSession = alarm_sessions_repo.create_alarm_session(
        alarm_id=alarm["id"], 
        status=AlarmSessionStatus.RINGING, 
        started_at=datetime.fromisoformat(started_at_time_value),
        label=alarm["label"],
    )
    alarm_player.start_loop(session_id=current_session["id"])
    _broadcast_alarm_state(current_session)

def stop_ringing_session(session_id: int, status=AlarmSessionStatus.DISMISSED):
    """
    Stop an active alarm session and transition it to a new state (e.g., SNOOZED, GUARD, or DISMISSED).
    
    - Stops the audio player if the session is currently playing.
    - Sets expiration/tolerance timers based on the target status (e.g., 5 min for SNOOZED, GUARD_EXPIRES_SECONDS for GUARD).
    - Triggers the Ollama morning assistant (`wake_up`) when the session first enters GUARD.
    - Broadcasts the updated state to connected WebSocket clients.
    """
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
        
    snooze_duration = settings_service.get_snooze_duration_min()

    snoozed_until_time = (datetime.now() + timedelta(minutes=snooze_duration)).isoformat() if status == AlarmSessionStatus.SNOOZED else None
    if snoozed_until_time is not None:
        snoozed_until_time = datetime.fromisoformat(str(snoozed_until_time))

    guard_expires_at_time = None
    if status == AlarmSessionStatus.GUARD:
        guard_expires_min = settings_service.get_guard_mode_timer_min()
        guard_expires_at_time = datetime.now() + timedelta(minutes=guard_expires_min)

    session = alarm_sessions_repo.update_alarm_session(
        session_id,
        status=status,
        snoozed_until=snoozed_until_time,
        guard_expires_at=guard_expires_at_time,
        clear_snoozed_until=status != AlarmSessionStatus.SNOOZED,
        clear_guard_expires_at=status != AlarmSessionStatus.GUARD,
            clear_guard_tolerance_until=True,
            clear_pressure_started_at=True,
    )

    if should_stop_audio:
        alarm_player.stop()

    _broadcast_alarm_state(session)

    if (
        status == AlarmSessionStatus.GUARD
        and existing_session.get("status") != AlarmSessionStatus.GUARD
        and session
    ):
        # Trigger the morning assistant only when the user first dismisses the
        # ringing alarm into guard mode. Guard expiration must not replay it.
        alarm = alarms_repo.get_alarm_by_id(session["alarm_id"])
        if alarm:
            from domain.assistant.service import wake_up, is_ollama_available

            if is_ollama_available():
                try:
                    import threading
                    threading.Thread(
                        target=wake_up, 
                        args=(alarm["time"], session.get("label") or alarm.get("label", ""))
                    ).start()
                except Exception:
                    logger.exception(
                        "Wake-up assistant failed for guard session %s",
                        session_id,
                    )
            else:
                logger.warning(
                    "Ollama service is not available. Skipping wake-up assistant for guard session %s",
                    session_id,
                )
        else:
            logger.warning(
                "Could not find alarm %s for dismissed session %s",
                session["alarm_id"],
                session_id,
            )

    return session


def handle_guard_pressure_sensor(session_id: int, pressed: bool = True):
    """
    Handle pressure sensor events while a guard session is active.
    
    - If the user gets into bed (pressed=True): starts the tolerance timer.
      If the tolerance timer has already been running and is expired, it retriggers the alarm.
      
    - If the user gets out of bed (pressed=False): clears the tolerance timer and pressure start time,
      resetting the sensor state back to ready.
    """
    existing_session = alarm_sessions_repo.get_alarm_session_by_id(session_id)
    if not existing_session:
        return None

    if existing_session.get("status") != AlarmSessionStatus.GUARD:
        return existing_session

    guard_expires_at = existing_session.get("guard_expires_at")
    if not guard_expires_at:
        return existing_session

    now = datetime.now()
    guard_expires_at_dt = datetime.fromisoformat(guard_expires_at)
    if guard_expires_at_dt <= now:
        return existing_session

    if not pressed:
        # User left the bed, clear the ongoing tolerance timers
        if existing_session.get("pressure_started_at") is not None:
            updated_session = alarm_sessions_repo.update_alarm_session(
                session_id,
                clear_pressure_started_at=True,
                clear_guard_tolerance_until=True,
            )
            _broadcast_alarm_state(updated_session)
            return updated_session
        return existing_session
    
    guard_tolerance_min = settings_service.get_guard_mode_tolerance_min()
    pressure_started_at = existing_session.get("pressure_started_at")
    if pressure_started_at:
        pressure_started_at_dt = datetime.fromisoformat(pressure_started_at)
    else:
        # First time pressure is applied, start the tolerance timer
        pressure_started_at_dt = now
        
        guard_tolerance_until_time = now + timedelta(minutes=guard_tolerance_min)
        updated_session = alarm_sessions_repo.update_alarm_session(
            session_id,
            pressure_started_at=pressure_started_at_dt,
            guard_tolerance_until=guard_tolerance_until_time,
        )
        _broadcast_alarm_state(updated_session)
        return updated_session

    # Pressure has been held, check if tolerance period has passed
    if now - pressure_started_at_dt < timedelta(minutes=guard_tolerance_min):
        return existing_session
    updated_session = alarm_sessions_repo.update_alarm_session(
        session_id,
        status=AlarmSessionStatus.RINGING,
        clear_guard_expires_at=True,
        clear_guard_tolerance_until=True,
        clear_pressure_started_at=True,
        clear_snoozed_until=True,
    )

    alarm_player.start_loop(session_id=session_id)
    _broadcast_alarm_state(updated_session)
    return updated_session
