import logging
import threading
from contextlib import asynccontextmanager
from api.routes import alarm_session, alarms, weather

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

logger = logging.getLogger(__name__)


def _run_alarm_monitor():
    try:
        from domain.alarms.service import monitor_alarms
        monitor_alarms()

    except Exception:
        logger.exception("Alarm monitor thread stopped unexpectedly")


@asynccontextmanager
async def lifespan(app: FastAPI):
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


# --- Alarm Endpoints ---
app.include_router(alarms.router)

# --- Alarm Session Endpoints ---
app.include_router(alarm_session.router)

# --- Weather Endpoints ---
app.include_router(weather.router)

