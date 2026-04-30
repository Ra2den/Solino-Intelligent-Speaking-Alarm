import threading
from alarmDB import init_db
from alarm import alarm_monitor, interact

# 1. Datenbanken initialisieren
init_db()  

# 2. Wecker-Monitor im Hintergrund starten
monitor_thread = threading.Thread(target=alarm_monitor, daemon=True)
monitor_thread.start()

# 3. Session-Konfiguration 
print("Susonne ist bereit und der Monitor läuft im Hintergrund.")
print("Stoppen mit Strg+C")

try:
    while True:
        print("\n" + "="*30)
        print("Bereit für deine Frage.")
        user_input = input("Drücke ENTER zum Sprechen (oder 'exit' zum Beenden): ")

        if user_input.lower() == 'exit':
            print("Susonne verabschiedet sich... Bis bald!")
            break

        interact()

except KeyboardInterrupt:
    print("\nProgramm beendet. Wecker-Monitor wird gestoppt...")