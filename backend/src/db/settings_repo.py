from .connection import db
from .mappers import serialize_setting_row, serialize_setting_rows
from typing import Any
from domain.settings.schemas import SettingsCategory, SettingsKey, VoiceOption, LanguageOption

def create_settings_table():
    db.execute(
        """
        CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key TEXT NOT NULL,
            value TEXT NOT NULL,
            category TEXT NOT NULL,
            UNIQUE(key, category)
        )
        """
    )
    init_default_settings()

def init_default_settings():
    default_settings = [
        {"key": SettingsKey.LANGUAGE, 
         "value": LanguageOption.GERMAN.value,
         "category": SettingsCategory.GENERAL
         },
        {"key": SettingsKey.VOICE, 
         "value": VoiceOption.MALE.value,
         "category": SettingsCategory.GENERAL
         },
        {"key": SettingsKey.SNOOZE_DURATION_MIN, 
         "value": 1,
         "category": SettingsCategory.GENERAL
         },
        {"key": SettingsKey.VOLUME_PERCENT, 
         "value": 100,
         "category": SettingsCategory.GENERAL
         },
        {"key": SettingsKey.OLLAMA_HEALTH_CHECK_TIMEOUT_SEC,  
         "value": 2,
         "category": SettingsCategory.GENERAL
         },
        {"key": SettingsKey.GUARD_MODE_TIMER_MIN, 
         "value": 1,
         "category": SettingsCategory.GENERAL
         },
        {"key": SettingsKey.GUARD_MODE_TOLERANCE_MIN, 
          "value": 0.16666666666666666,
          "category": SettingsCategory.GENERAL
         },
        {"key": SettingsKey.WAKE_UP_MESSAGE_ENABLED, 
          "value": False,
          "category": SettingsCategory.GENERAL
         },
    ]
    
    for setting in default_settings:
        existing = get_setting_by_key(setting["key"])
        if not existing:
            db.execute(
                """
                INSERT INTO settings (key, category, value) VALUES (?, ?, ?)
                """,
                (setting["key"].value, setting["category"].value, str(setting["value"])),
            )
        elif setting["key"] == SettingsKey.GUARD_MODE_TOLERANCE_MIN and existing["value"] == 0.1:
            # Migrate old 0.1 default to new 10s default
            db.execute(
                """
                UPDATE settings SET value = ? WHERE key = ?
                """,
                (str(setting["value"]), SettingsKey.GUARD_MODE_TOLERANCE_MIN.value),
            )
        elif setting["key"] == SettingsKey.SNOOZE_DURATION_MIN and existing["value"] == 5:
            # Migrate old 5 min default to new 1 min default
            db.execute(
                """
                UPDATE settings SET value = ? WHERE key = ?
                """,
                (str(setting["value"]), SettingsKey.SNOOZE_DURATION_MIN.value),
            )

def get_setting(key: SettingsKey):
    return serialize_setting_row(db.fetch_one("SELECT * FROM settings WHERE key = ?", (key.value,)))

def get_all_settings():
    return serialize_setting_rows(db.fetch_all("SELECT * FROM settings"))

def get_settings_by_category(category: SettingsCategory):
    return serialize_setting_rows(db.fetch_all("SELECT * FROM settings WHERE category = ?", (category.value,)))

def get_setting_by_key(key: SettingsKey):
    return serialize_setting_row(db.fetch_one("SELECT * FROM settings WHERE key = ?", (key.value,)))

def update_setting(key: SettingsKey, category: SettingsCategory, value: Any):
    existing = get_setting(key)
    if existing:
        db_value = str(value)
        db.execute(
            "UPDATE settings SET value = ?, category = ? WHERE key = ?",
            (db_value, category.value, key.value),
        )
    return get_setting(key)