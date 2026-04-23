import sqlite3

def init_db():
    conn = sqlite3.connect("alarms.db")
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS alarms (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uhrzeit TEXT NOT NULL,
            label TEXT,
            active BOOLEAN DEFAULT 1
        )
    ''')
    conn.commit()
    conn.close()

def db_add_alarm(uhrzeit, label):
    conn = sqlite3.connect("alarms.db")
    cursor = conn.cursor()
    cursor.execute("INSERT INTO alarms (uhrzeit, label) VALUES (?, ?)", (uhrzeit, label))
    conn.commit()
    conn.close()

def db_get_all_alarms():
    """Gibt eine Liste aller gespeicherten Wecker zurück."""
    conn = sqlite3.connect("alarms.db")
    conn.row_factory = sqlite3.Row 
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM alarms")
    rows = cursor.fetchall()
    
    alarms = [dict(row) for row in rows]
    
    conn.close()
    return alarms

def db_get_active_alarms():
    """Gibt nur die Wecker zurück, die auf 'active = 1' stehen."""
    conn = sqlite3.connect("alarms.db")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM alarms WHERE active = 1")
    rows = cursor.fetchall()
    
    alarms = [dict(row) for row in rows]
    conn.close()
    return alarms

def db_delete_alarm(alarm_id):
    """Löscht einen Wecker endgültig aus der Datenbank."""
    conn = sqlite3.connect("alarms.db")
    cursor = conn.cursor()
    cursor.execute("DELETE FROM alarms WHERE id = ?", (alarm_id,))
    conn.commit()
    conn.close()
    return f"Wecker mit ID {alarm_id} gelöscht."

def db_toggle_alarm(alarm_id, status=0):
    """Deaktiviert (status=0) oder aktiviert (status=1) einen Wecker."""
    conn = sqlite3.connect("alarms.db")
    cursor = conn.cursor()
    cursor.execute("UPDATE alarms SET active = ? WHERE id = ?", (status, alarm_id))
    conn.commit()
    conn.close()
    return "Status aktualisiert."