from typing import Any, List

from domain.settings.schemas import SettingsKey, SettingsCategory, SettingsItem, VoiceOption, LanguageOption, SETTING_TYPE_MAP
from db import settings_repo

def get_all_settings() -> List[SettingsItem]:
    """Fetch all settings."""
    return settings_repo.get_all_settings()

def get_settings_by_category(category: SettingsCategory) -> List[SettingsItem]:
    """Fetch all settings for a specific category."""
    return settings_repo.get_settings_by_category(category)

def get_setting_value(key: SettingsKey, default_value: Any = None) -> Any:
    """Fetch the value of a specific setting by key."""
    setting = settings_repo.get_setting_by_key(key)
    if setting and "value" in setting:
        return setting["value"]
    return default_value

def get_language() -> str:
    return get_setting_value(SettingsKey.LANGUAGE, LanguageOption.GERMAN.value)

def get_voice() -> VoiceOption:
    return get_setting_value(SettingsKey.VOICE, VoiceOption.MALE.value)

def get_volume_percent() -> int:
    return get_setting_value(SettingsKey.VOLUME_PERCENT, 100)

def get_snooze_duration_min() -> int:
    return get_setting_value(SettingsKey.SNOOZE_DURATION_MIN, 5)

def get_ollama_health_check_timeout_sec() -> int:
    return get_setting_value(SettingsKey.OLLAMA_HEALTH_CHECK_TIMEOUT_SEC, 2)

def get_guard_mode_timer_min() -> int:
    return get_setting_value(SettingsKey.GUARD_MODE_TIMER_MIN, 1)

def get_guard_mode_tolerance_min() -> float:
    return get_setting_value(SettingsKey.GUARD_MODE_TOLERANCE_MIN, 0.1)

def get_wake_up_message_enabled() -> bool:
    return get_setting_value(SettingsKey.WAKE_UP_MESSAGE_ENABLED, False)

def validate_setting_value(key: SettingsKey, value: Any) -> Any:
    """Validates and coerces the value to the correct type based on the settings schema."""
    expected_type = SETTING_TYPE_MAP.get(key)
    if not expected_type:
        return value
    
    try:
        if expected_type == bool and isinstance(value, str):
            return value.lower() in ("true", "1", "yes")
        return expected_type(value)
    except (ValueError, TypeError):
        raise ValueError(f"Invalid value '{value}' for setting '{key.value}'. Expected {expected_type.__name__}.")

def update_setting_value(key: SettingsKey, value: Any):
    """Update a setting's value dynamically based on its existing category."""
    validated_value = validate_setting_value(key, value)
    
    existing = settings_repo.get_setting_by_key(key)
    if existing:
        if hasattr(validated_value, "value"):
            validated_value = validated_value.value
        return settings_repo.update_setting(key, existing["category"], validated_value)
    return None