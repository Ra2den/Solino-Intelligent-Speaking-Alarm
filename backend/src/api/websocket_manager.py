import asyncio
import logging
from typing import Set, Any
from fastapi import WebSocket
from pydantic import BaseModel

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()
        self.loop: asyncio.AbstractEventLoop | None = None

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.loop = asyncio.get_running_loop()
        self.active_connections.add(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.discard(websocket)

    async def broadcast(self, message: Any):
        payload = message.model_dump() if isinstance(message, BaseModel) else message
        stale_connections = []

        for connection in list(self.active_connections):
            try:
                await connection.send_json(payload)
            except Exception:
                stale_connections.append(connection)

        for connection in stale_connections:
            self.disconnect(connection)

    def broadcast_threadsafe(self, message: Any):
        if self.loop is None or not self.loop.is_running():
            logger.warning("No websocket event loop available for alarm session broadcast")
            return

        future = asyncio.run_coroutine_threadsafe(self.broadcast(message), self.loop)
        future.add_done_callback(self._log_broadcast_error)

    @staticmethod
    def _log_broadcast_error(future):
        try:
            future.result()
        except Exception:
            logger.exception("Alarm session websocket broadcast failed")

manager = ConnectionManager()
