# backend/src/alarm_player.py
import shutil
import subprocess
import threading
import time
from pathlib import Path
import domain.settings.service as settings_service
import domain.pi_client as pi_client


BACKEND_ROOT = Path(__file__).resolve().parents[3]
SOUNDS_DIR = BACKEND_ROOT / "assets" / "sounds"
ALARM_SOUND_PATH = SOUNDS_DIR / "alarm_sound.flac"
ALARM_SOUND_FALLBACK_PATH = SOUNDS_DIR / "alarm_sound.mp3"


def _find_audio_file() -> Path:
    for path in (ALARM_SOUND_PATH, ALARM_SOUND_FALLBACK_PATH):
        if path.exists():
            return path
    raise FileNotFoundError("No alarm sound file found.")


def _find_player() -> str:
    for candidate in ("afplay", "pw-play", "aplay"):
        if shutil.which(candidate):
            return candidate
    raise RuntimeError("No supported audio player found. Expected 'afplay', 'pw-play' or 'aplay'.")


class AlarmPlayer:
    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._stop_event = threading.Event()
        self._thread: threading.Thread | None = None
        self._process: subprocess.Popen | None = None
        self._session_id: int | None = None

    def is_playing(self) -> bool:
        with self._lock:
            return self._thread is not None and self._thread.is_alive()

    def current_session_id(self) -> int | None:
        with self._lock:
            return self._session_id

    def start_loop(self, session_id: int | None = None) -> bool:
        with self._lock:
            if self._thread and self._thread.is_alive():
                return False
            self._session_id = session_id

        # Delegate to Pi if configured (outside lock — call can block up to 3 s on timeout)
        if pi_client.play_alarm():
            return True

        with self._lock:
            self._stop_event.clear()
            self._thread = threading.Thread(target=self._loop_playback, daemon=True)
            self._thread.start()
        return True

    def stop(self) -> None:
        pi_client.stop_alarm()  # no-op if PI_CONTROL_URL not set

        with self._lock:
            thread = self._thread
            process = self._process
            self._stop_event.set()

        if process and process.poll() is None:
            process.terminate()
            try:
                process.wait(timeout=2)
            except subprocess.TimeoutExpired:
                process.kill()
                process.wait(timeout=2)

        if thread and thread.is_alive():
            thread.join(timeout=3)

        with self._lock:
            self._process = None
            self._thread = None
            self._session_id = None
            self._stop_event.clear()

    def _loop_playback(self) -> None:
        audio_path = _find_audio_file()
        player = _find_player()
        volume_percent = settings_service.get_volume_percent()
        
         # Construct the base command
        command = [player]
        
        # Append player-specific volume flags
        self.set_volume(command, volume_percent, audio_path, player)
        
        try:
            while not self._stop_event.is_set():
                process = subprocess.Popen(command)
                with self._lock:
                    self._process = process

                while process.poll() is None and not self._stop_event.is_set():
                    time.sleep(0.1)

                if self._stop_event.is_set() and process.poll() is None:
                    process.terminate()
                    try:
                        process.wait(timeout=2)
                    except subprocess.TimeoutExpired:
                        process.kill()
        finally:
            with self._lock:
                if self._thread is threading.current_thread():
                    self._process = None
                    self._thread = None
                    self._session_id = None

    def set_volume(self, command, volume_percent: int, audio_path, player):
        # Convert 0-100 to 0.0-1.0
        volume_decimal = max(0, min(100, volume_percent)) / 100.0
        
        # Append player-specific volume flags
        if player == "afplay":
            command.extend(["-v", str(volume_decimal)])
        elif player == "pw-play":
            # Note: pw-play might require a comma instead of a period depending on locale, 
            # but usually str() with period works fine.
            command.extend(["--volume", str(volume_decimal)])
        # Note: 'aplay' does not have a direct volume flag. It will just ignore this logic 
        # and play at the system volume.

        command.append(str(audio_path))  
        
alarm_player = AlarmPlayer()
