#!/usr/bin/env python3
"""ip-overlay.py — show the machine's IP address as a fullscreen overlay.

Opens immediately with a spinner while waiting for the network, then updates
in place once an IP is found. Closes automatically after DISPLAY_SECONDS
(counted from when the IP appears), or immediately on click/keypress.

Usage: python3 ip-overlay.py <state-file>
  state-file: path where the last-seen IP is persisted (e.g. config/.last-ip)
"""

import socket
import subprocess
import sys
import tkinter as tk
from pathlib import Path

DISPLAY_SECONDS  = 15
NETWORK_TIMEOUT  = 30    # seconds to wait for a valid IP before giving up
NETWORK_POLL_MS  = 1000  # ms between IP checks inside the tkinter loop

SPINNER_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]


def get_ip() -> str:
    """Return the primary non-loopback IPv4 address, or '' on failure."""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except OSError:
        pass
    try:
        out = subprocess.check_output(["ip", "route", "get", "1"], text=True)
        for part in out.split():
            if part not in ("via", "dev", "src", "uid", "1", "cache"):
                try:
                    socket.inet_aton(part)
                    if not part.startswith("127."):
                        return part
                except OSError:
                    pass
    except Exception:
        pass
    return ""


def ip_changed(ip: str, state_file: Path) -> bool:
    try:
        return state_file.read_text().strip() != ip
    except FileNotFoundError:
        return True


def save_ip(ip: str, state_file: Path) -> None:
    state_file.parent.mkdir(parents=True, exist_ok=True)
    state_file.write_text(ip)


def show_overlay(state_file: Path) -> str:
    """Open the overlay immediately, poll for the IP, update in place.
    Returns the resolved IP (or '?.?.?.?' on timeout)."""

    root = tk.Tk()
    root.title("Kiosk IP")
    root.attributes("-fullscreen", True)
    root.configure(bg="black")
    root.attributes("-topmost", True)

    dismiss = lambda _=None: root.destroy()
    root.bind("<Key>",    dismiss)
    root.bind("<Button>", dismiss)

    frame = tk.Frame(root, bg="black")
    frame.place(relx=0.5, rely=0.5, anchor="center")

    heading = tk.Label(
        frame,
        text="This device's IP address",
        font=("sans-serif", 22),
        fg="#888888",
        bg="black",
    )
    heading.pack(pady=(0, 12))

    ip_label = tk.Label(
        frame,
        text="",
        font=("monospace", 64, "bold"),
        fg="#ffffff",
        bg="black",
    )
    ip_label.pack()

    url_label = tk.Label(
        frame,
        text="",
        font=("sans-serif", 18),
        fg="#4f8ef7",
        bg="black",
    )
    url_label.pack(pady=(16, 0))

    hint_label = tk.Label(
        frame,
        text="",
        font=("sans-serif", 13),
        fg="#555555",
        bg="black",
    )
    hint_label.pack(pady=(24, 0))

    # ── State shared between callbacks ───────────────────────────────────────
    state = {
        "ip": "",
        "elapsed": 0,        # seconds since overlay opened
        "spinner_idx": 0,
        "resolved": False,
        "countdown": DISPLAY_SECONDS,
    }

    def tick_spinner():
        """Animate the spinner while waiting for the network."""
        idx = state["spinner_idx"] % len(SPINNER_FRAMES)
        frame_char = SPINNER_FRAMES[idx]
        state["spinner_idx"] += 1
        state["elapsed"] += 1

        ip_label.config(text=frame_char, fg="#555555")
        url_label.config(text="Waiting for network…")
        hint_label.config(text="")

        if state["elapsed"] >= NETWORK_TIMEOUT:
            # Give up — show fallback and start countdown
            on_ip_resolved("?.?.?.?")
            return

        ip = get_ip()
        if ip:
            on_ip_resolved(ip)
        else:
            root.after(NETWORK_POLL_MS, tick_spinner)

    def on_ip_resolved(ip: str):
        state["ip"] = ip
        state["resolved"] = True
        ip_label.config(text=ip, fg="#ffffff")
        url_label.config(text="Control UI → http://{}:8080".format(ip))
        hint_label.config(text="(click or press any key to dismiss)")
        tick_countdown()

    def tick_countdown():
        remaining = state["countdown"]
        hint_label.config(
            text="(click or press any key to dismiss — closes in {}s)".format(remaining)
        )
        if remaining <= 0:
            root.destroy()
            return
        state["countdown"] -= 1
        root.after(1000, tick_countdown)

    # Kick off the spinner immediately
    tick_spinner()
    root.mainloop()

    return state.get("ip", "?.?.?.?")


BOOT_FLAG = Path("/tmp/kiosk-booted")


def fresh_boot() -> bool:
    """/tmp is cleared on every boot — flag absence means we just booted."""
    if not BOOT_FLAG.exists():
        BOOT_FLAG.touch()
        return True
    return False


def main() -> None:
    state_file = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("/tmp/kiosk-last-ip")

    is_boot = fresh_boot()

    # Fast path: if not a boot and IP hasn't changed, skip entirely.
    # We do a quick non-blocking check first to avoid opening the window
    # unnecessarily on service restarts mid-session.
    if not is_boot:
        quick_ip = get_ip()
        if quick_ip and not ip_changed(quick_ip, state_file):
            return

    ip = show_overlay(state_file)
    save_ip(ip, state_file)


if __name__ == "__main__":
    main()
