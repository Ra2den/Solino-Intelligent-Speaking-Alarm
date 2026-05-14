import db
from db_helper import validate_weekdays

def add_alarm(time, label, recurring_days):
    db.db_add_alarm(time, label, recurring_days)
    if validate_weekdays(recurring_days):
        return f"Ich habe einen Wecker für {time} Uhr mit dem Label '{label}' erstellt, der sich an den Tagen{recurring_days} wiederholt ."
    else:
        return f"Die Wochentage : {recurring_days} sind im falschen Format. Sie dürfen nur die Werte [MON,TUE,WED,THU,FRI,SAT,SUN] enthalten. Führe die Funktion nochmal mit den richtigen Parametern aus."

def get_all_alarms():
    alarms = db.db_get_all_alarms()
    if not alarms:
        return "Es sind keine Wecker gespeichert."
    return "Folgende Wecker sind gespeichert:\n" + "\n".join([f"{alarm['id']}: {alarm['time']} Uhr - {alarm['label']} (Aktiv: {'Ja' if alarm['active'] else 'Nein'})" for alarm in alarms])

def get_active_alarms():
    alarms = db.db_get_active_alarms()
    return alarms

def get_alarm_by_time(time):
    alarm = db.db_get_alarm_by_time(time)
    if not alarm:
        return f"Kein Wecker für {time} Uhr gefunden."
    return f"Wecker für {time} Uhr gefunden: {alarm['label']}"

def toggle_alarm(alarm_id):
    db.db_toggle_alarm(alarm_id)
    return "Status des Weckers aktualisiert."

def delete_alarm_by_time(time):
    success = db.db_delete_alarm_by_time(time)
    if success:
        return f"Ich habe den Wecker für {time} Uhr gelöscht."
    else:
        return f"Ich konnte keinen Wecker für {time} Uhr finden."