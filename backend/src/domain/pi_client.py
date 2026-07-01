"""Thin HTTP client for the Pi control server (hardware/src, port 5000).

All calls are fire-and-forget: if PI_CONTROL_URL is not set, or the Pi is
unreachable, the call is silently skipped so the PC backend keeps running.
"""
import logging
import os

import requests

logger = logging.getLogger(__name__)

_BASE = os.getenv("PI_CONTROL_URL", "").rstrip("/")
_TIMEOUT = 3  # seconds


def _post(path: str, json: dict | None = None) -> bool:
    if not _BASE:
        return False
    try:
        requests.post(f"{_BASE}{path}", json=json or {}, timeout=_TIMEOUT)
        return True
    except Exception as exc:
        logger.debug("Pi API call failed (%s): %s", path, exc)
        return False


def play_alarm() -> bool:
    return _post("/api/audio/alarm/play")


def stop_alarm() -> bool:
    return _post("/api/audio/alarm/stop")


def set_alarm_state(status: str) -> bool:
    """status: 'IDLE' | 'RINGING' | 'GUARD' | 'SNOOZED'"""
    return _post("/api/alarm/state", {"status": status})


def set_volume(volume_percent: int) -> bool:
    return _post("/api/volume", {"volume": volume_percent})
