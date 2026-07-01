import logging
import os
import threading
from contextlib import asynccontextmanager
from api.routes import alarm_session, alarms, weather, settings
from db import init_db

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

logger = logging.getLogger(__name__)


def _run_alarm_monitor():
    """
        Starts the background alarm monitoring loop.

        :raises Exception: Logs any unexpected exception raised by the monitor
    """
    try:
        from domain.alarms.service import monitor_alarms
        monitor_alarms()

    except Exception:
        logger.exception("Alarm monitor thread stopped unexpectedly")


def _preload_assistant():
    """Import assistant.service at startup so the TTS model loads before the first alarm dismissal."""
    try:
        import domain.assistant.service  # noqa: F401 — triggers OmniVoice + STT model load
        logger.info("Assistant model preloaded")
    except Exception:
        logger.exception("Failed to preload assistant model")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
        Manages the FastAPI application lifespan.

        Starts the background alarm monitor thread once when the application
        boots and keeps it available for the duration of the app lifecycle.

        :param app: The FastAPI application instance
        :type app: FastAPI
        :yield: Control back to FastAPI for normal application execution
        :rtype: AsyncIterator[None]
    """
    init_db()

    if not hasattr(app.state, "monitor_thread"):
        app.state.monitor_thread = threading.Thread(
            target=_run_alarm_monitor,
            name="alarm-monitor",
            daemon=True,
        )
        app.state.monitor_thread.start()
        logger.info("Alarm monitor thread started")

    threading.Thread(target=_preload_assistant, name="assistant-preload", daemon=True).start()

    yield


app = FastAPI(lifespan=lifespan)

# Origins are configurable via the BACKEND_CORS_ORIGINS env var (comma-separated,
# exact match). When it is not set we fall back to a regex that reflects any
# origin, so the app keeps working when opened from another device on the LAN
# (e.g. http://192.168.x.x:5173) instead of only from localhost.
_env_origins = os.environ.get("BACKEND_CORS_ORIGINS", "").strip()
origins = [o.strip() for o in _env_origins.split(",") if o.strip()]

cors_kwargs = (
    {"allow_origins": origins}
    if origins
    else {"allow_origin_regex": r"https?://.*"}
)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    **cors_kwargs,
)


app.include_router(alarms.router)
app.include_router(alarm_session.router)
app.include_router(weather.router)
app.include_router(settings.router)
