from fastapi import APIRouter, Body, HTTPException
from typing import Optional, List, Union
from domain.settings import service as settings_service
from domain.settings.schemas import SettingsKey, SettingsCategory, SettingsItem
import domain.pi_client as pi_client

router = APIRouter(prefix="/settings", tags=["Settings"])

@router.get("/", response_model=List[SettingsItem])
def get_all_settings():
    """Fetch all settings."""
    return settings_service.get_all_settings()

@router.get("/category/{category}", response_model=List[SettingsItem])
def get_settings_by_category(category: SettingsCategory):
    """Fetch all settings for a specific category."""
    return settings_service.get_settings_by_category(category)

@router.get("/{key}", response_model=Optional[Union[str, int, float, bool]])
def get_setting(key: SettingsKey):
    """Fetch the value of a specific setting by key."""
    return settings_service.get_setting_value(key)

@router.put("/{key}", response_model=Optional[SettingsItem])
def update_setting(key: SettingsKey, value: Union[str, int, float, bool] = Body(...)):
    """Update a setting's value dynamically based on its existing category."""
    try:
        result = settings_service.update_setting_value(key, value)
        if key == SettingsKey.VOLUME_PERCENT:
            pi_client.set_volume(int(value))
        return result
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
