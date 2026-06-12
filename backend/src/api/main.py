import logging
import threading
from contextlib import asynccontextmanager
from api.routes import alarm_session, alarms, weather
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

    yield


app = FastAPI(lifespan=lifespan)

origins = [
    "http://localhost:5173", # TODO extract in .env
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(alarms.router)
app.include_router(alarm_session.router)
app.include_router(weather.router)
