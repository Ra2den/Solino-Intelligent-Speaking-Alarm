from pydantic import BaseModel
from enum import Enum
from typing import Union
    
class SettingsCategory(str, Enum):
    GENERAL = "general"
    
class SettingsKey(str, Enum):
    LANGUAGE = "LANGUAGE"
    VOICE = "VOICE"
    VOLUME_PERCENT = "VOLUME_PERCENT"
    SNOOZE_DURATION_MIN = "SNOOZE_DURATION_MIN"
    OLLAMA_HEALTH_CHECK_TIMEOUT_SEC = "OLLAMA_HEALTH_CHECK_TIMEOUT_SEC"
    GUARD_MODE_TIMER_MIN = "GUARD_MODE_TIMER_MIN"
    GUARD_MODE_TOLERANCE_MIN = "GUARD_MODE_TOLERANCE_MIN"
    
class SettingsItem(BaseModel):
    key: SettingsKey
    category: SettingsCategory
    value: Union[str, int, float, bool]
    
class VoiceOption(str, Enum):
    MALE = "MALE",
    FEMALE = "FEMALE",
    
class LanguageOption(str, Enum):
    GERMAN = "GERMAN",
    ENGLISH = "ENGLISH"


SETTING_TYPE_MAP = {
    SettingsKey.LANGUAGE: LanguageOption,
    SettingsKey.VOICE: VoiceOption,
    SettingsKey.SNOOZE_DURATION_MIN: int,
    SettingsKey.VOLUME_PERCENT: int,
    SettingsKey.OLLAMA_HEALTH_CHECK_TIMEOUT_SEC: int,
    SettingsKey.GUARD_MODE_TIMER_MIN: int,
    SettingsKey.GUARD_MODE_TOLERANCE_MIN: float,
}