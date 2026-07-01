#!/usr/bin/env python3
"""Kiosk control server — Flask app on port 8080.

Endpoints:
  GET  /              Web UI
  GET  /api/state     JSON state (config + browser running status)
  POST /api/config    Update config fields
  POST /api/restart   Restart the kiosk systemd service
"""

import json
import os
import subprocess
from pathlib import Path

from flask import Flask, jsonify, render_template, request

app = Flask(__name__)

REPO_ROOT = Path(__file__).resolve().parent.parent
CONFIG_PATH = REPO_ROOT / "config" / "kiosk.json"

DEFAULT_CONFIG = {
    "url": "https://example.com",
    "idle_enabled": False,
    "idle_timeout": 300,
    "rotation": "normal",
    "hide_cursor": False,
}

VALID_ROTATIONS = {"normal", "left", "right", "inverted"}

# X display environment for subprocesses (Flask runs as kiosk user which has
# xhost access, but the systemd service doesn't inject DISPLAY automatically)
DISPLAY_ENV = {**os.environ, "DISPLAY": ":0"}


def read_config() -> dict:
    try:
        with open(CONFIG_PATH) as f:
            data = json.load(f)
        # Fill in any missing keys with defaults
        for k, v in DEFAULT_CONFIG.items():
            data.setdefault(k, v)
        return data
    except (FileNotFoundError, json.JSONDecodeError):
        return dict(DEFAULT_CONFIG)


def write_config(cfg: dict) -> None:
    CONFIG_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(CONFIG_PATH, "w") as f:
        json.dump(cfg, f, indent=2)
        f.write("\n")


def get_xrandr_output() -> str:
    """Return the name of the first connected display output (e.g. HDMI-1)."""
    result = subprocess.run(
        ["bash", "-c", "xrandr | awk '/ connected/{print $1; exit}'"],
        capture_output=True, text=True, env=DISPLAY_ENV,
    )
    return result.stdout.strip()


def apply_rotation(rotation: str) -> None:
    output = get_xrandr_output()
    if output:
        subprocess.run(
            ["xrandr", "--output", output, "--rotate", rotation],
            capture_output=True, env=DISPLAY_ENV,
        )


def apply_cursor_hide(hide: bool) -> None:
    subprocess.run(["pkill", "unclutter"], capture_output=True)
    if hide:
        subprocess.Popen(
            ["unclutter", "-idle", "0", "-root"],
            env=DISPLAY_ENV,
        )


def browser_running() -> bool:
    """Return True if a kiosk browser process is currently running."""
    for name in ("firefox-esr", "firefox", "chromium-browser", "chromium"):
        result = subprocess.run(
            ["pgrep", "-x", name], capture_output=True
        )
        if result.returncode == 0:
            return True
    return False


@app.get("/")
def index():
    cfg = read_config()
    return render_template("index.html", config=cfg)


@app.get("/api/state")
def api_state():
    cfg = read_config()
    cfg["browser_running"] = browser_running()
    return jsonify(cfg)


@app.post("/api/config")
def api_config():
    data = request.get_json(force=True, silent=True) or {}
    cfg = read_config()

    if "url" in data:
        url = str(data["url"]).strip()
        if not url:
            return jsonify({"error": "url must not be empty"}), 400
        cfg["url"] = url

    if "idle_enabled" in data:
        cfg["idle_enabled"] = bool(data["idle_enabled"])

    if "idle_timeout" in data:
        try:
            timeout = int(data["idle_timeout"])
            if timeout < 1:
                raise ValueError
        except (ValueError, TypeError):
            return jsonify({"error": "idle_timeout must be a positive integer"}), 400
        cfg["idle_timeout"] = timeout

    rotation_changed = False
    if "rotation" in data:
        rotation = str(data["rotation"]).strip().lower()
        if rotation not in VALID_ROTATIONS:
            return jsonify({"error": f"rotation must be one of: {', '.join(sorted(VALID_ROTATIONS))}"}), 400
        rotation_changed = rotation != cfg["rotation"]
        cfg["rotation"] = rotation

    cursor_changed = False
    if "hide_cursor" in data:
        hide = bool(data["hide_cursor"])
        cursor_changed = hide != cfg["hide_cursor"]
        cfg["hide_cursor"] = hide

    write_config(cfg)

    if rotation_changed:
        apply_rotation(cfg["rotation"])
    if cursor_changed:
        apply_cursor_hide(cfg["hide_cursor"])

    return jsonify({"ok": True, "config": cfg})


@app.post("/api/restart")
def api_restart():
    result = subprocess.run(
        ["sudo", "systemctl", "restart", "kiosk"],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        return jsonify({"error": result.stderr.strip() or "restart failed"}), 500
    return jsonify({"ok": True})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
