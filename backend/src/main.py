import threading
from alarm import alarm_monitor, interact


monitor_thread = threading.Thread(target=alarm_monitor, daemon=True)
monitor_thread.start()

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