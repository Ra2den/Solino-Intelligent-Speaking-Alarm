from fastapi import APIRouter
from typing import List, Optional
from domain.alarms.schemas import Alarm, AlarmCreate
from domain.alarms import service as alarms_service

router = APIRouter(prefix="/alarms", tags=["Alarms"])

@router.get("/", response_model=List[Alarm])
def get_alarms():
    """
        Retrieves all alarms.

        :return: A list of all alarms
        :rtype: List[Alarm]
    """
    return alarms_service.get_all_alarms()

@router.get("/active", response_model=List[Alarm])
def get_active_alarms():
    """
        Retrieves all active alarms.

        :return: A list of active alarms
        :rtype: List[Alarm]
    """
    return alarms_service.get_active_alarms()

@router.get("/{alarm_id}", response_model=Optional[Alarm])
def get_alarm(alarm_id: int):
    """
        Retrieves an alarm by its ID.

        :param alarm_id: The ID of the alarm
        :type alarm_id: int
        :return: The matching alarm or None if it does not exist
        :rtype: Optional[Alarm]
    """
    return alarms_service.get_alarm_by_id(alarm_id)

@router.get("/{alarm_id}/toggle", response_model=Optional[Alarm])
def toggle_alarm(alarm_id: int):
    """
        Toggles the active status of an alarm.

        :param alarm_id: The ID of the alarm
        :type alarm_id: int
        :return: The updated alarm or None if it does not exist
        :rtype: Optional[Alarm]
    """
    return alarms_service.toggle_alarm(alarm_id)

@router.post("/", response_model=Alarm)
def create_alarm(alarm: AlarmCreate):
    """
        Creates a new alarm.

        :param alarm: The alarm data used to create the new alarm
        :type alarm: AlarmCreate
        :return: The created alarm
        :rtype: Alarm
    """
    return alarms_service.add_alarm(alarm.time, alarm.label, alarm.recurring_days)

@router.put("/{alarm_id}", response_model=Optional[Alarm])
def update_alarm(alarm_id: int, alarm: Alarm):
    """
        Updates an existing alarm.

        :param alarm_id: The ID of the alarm to update
        :type alarm_id: int
        :param alarm: The updated alarm data
        :type alarm: Alarm
        :return: The updated alarm or None if it does not exist
        :rtype: Optional[Alarm]
    """
    return alarms_service.update_alarm(
        alarm_id=alarm_id,
        time=alarm.time,
        label=alarm.label,
        recurring_days=alarm.recurring_days,
        active=alarm.active,
    )

@router.delete("/{alarm_id}", response_model=Optional[Alarm])
def delete_alarm(alarm_id: int):
    """
        Deletes an alarm by its ID.

        :param alarm_id: The ID of the alarm to delete
        :type alarm_id: int
        :return: The deleted alarm or None if it does not exist
        :rtype: Optional[Alarm]
    """
    return alarms_service.delete_alarm_by_id(alarm_id)
