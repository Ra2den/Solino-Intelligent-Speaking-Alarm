import os
import sys
import tempfile
import sqlite3
import sys
from unittest.mock import MagicMock

# Mock heavy hardware and ML dependencies globally for tests
sys.modules['omnivoice'] = MagicMock()
sys.modules['pyaudio'] = MagicMock()
sys.modules['faster_whisper'] = MagicMock()
sys.modules['soundfile'] = MagicMock()

import pytest
from fastapi.testclient import TestClient

# Add src to sys.path to match how the app imports things
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "src")))

from db.connection import db
from db.init import init_db

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    fd, temp_db_path = tempfile.mkstemp(suffix=".db")
    os.close(fd)
    
    original_db_path = db.db_path
    db.db_path = temp_db_path
    
    init_db()
    
    yield
    
    db.db_path = original_db_path
    if os.path.exists(temp_db_path):
        os.unlink(temp_db_path)

@pytest.fixture(autouse=True)
def clear_db_data():
    with db.connect() as conn:
        conn.execute("DELETE FROM alarm_sessions")
        conn.execute("DELETE FROM alarms")
        conn.execute("DELETE FROM settings")
        conn.commit()

@pytest.fixture
def client():
    # Import app here to ensure DB is patched before it gets fully used
    from api.main import app
    with TestClient(app) as c:
        yield c
