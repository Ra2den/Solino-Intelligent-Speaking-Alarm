from ai import interact


print("Susonne CLI ist bereit.")
print("Der Alarm-Monitor läuft über FastAPI.")
print("Stoppen mit Strg+C")

try:
    while True:
        print("\n" + "=" * 30)
        print("Bereit für deine Frage.")
        user_input = input("Drücke ENTER zum Sprechen (oder 'exit' zum Beenden): ")

        if user_input.lower() == "exit":
            print("Susonne verabschiedet sich... Bis bald!")
            break

        interact()

except KeyboardInterrupt:
    print("\nCLI beendet.")
