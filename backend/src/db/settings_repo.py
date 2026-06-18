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
         "value": 5,
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
         "value": 0.1,
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