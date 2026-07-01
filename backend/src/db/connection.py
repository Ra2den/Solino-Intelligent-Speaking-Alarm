import sqlite3
import datetime
from contextlib import contextmanager
from pathlib import Path

# Register adapter for datetime objects to silence Python 3.12 deprecation warning
def adapt_datetime_iso(val):
    return val.isoformat()

sqlite3.register_adapter(datetime.datetime, adapt_datetime_iso)

def convert_datetime(val):
    return datetime.datetime.fromisoformat(val.decode())

sqlite3.register_converter("timestamp", convert_datetime)

BACKEND_ROOT = Path(__file__).resolve().parents[2]
DB_PATH = BACKEND_ROOT / "data" / "alarms.db"


class Database:
    def __init__(self, db_path=DB_PATH):
        db_path = Path(db_path)
        db_path.parent.mkdir(parents=True, exist_ok=True)
        self.db_path = str(db_path)

    @contextmanager
    def connect(self):
        conn = sqlite3.connect(self.db_path, detect_types=sqlite3.PARSE_DECLTYPES | sqlite3.PARSE_COLNAMES)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON")
        try:
            yield conn
            conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()

    def execute(self, query, params=()):
        with self.connect() as conn:
            cursor = conn.execute(query, params)
            return cursor.lastrowid

    def fetch_all(self, query, params=()):
        with self.connect() as conn:
            cursor = conn.execute(query, params)
            return [dict(row) for row in cursor.fetchall()]

    def fetch_one(self, query, params=()):
        with self.connect() as conn:
            cursor = conn.execute(query, params)
            row = cursor.fetchone()
            return dict(row) if row else None


db = Database()
