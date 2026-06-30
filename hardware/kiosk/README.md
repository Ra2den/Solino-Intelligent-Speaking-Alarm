# kiosk

A self-contained Linux kiosk for exhibition use. The system boots directly into a fullscreen browser with no visible desktop, terminal, or login prompt. A small web control server lets you change the displayed URL, configure idle reload, and restart the kiosk remotely.

## Features

- Fullscreen Firefox (or Chromium as fallback) with no browser chrome
- Automatic restart if the browser crashes
- Idle reload — reloads the page once after a configurable period of inactivity, then waits for activity before reloading again
- Web control UI and JSON API on port 8080
- IP overlay on every boot — shows the machine's IP address and control UI URL on startup, and again whenever the IP changes
- Everything is a plain script — updating means `git pull` + `systemctl restart`
- Compatible with [keymapper](https://github.com/houmain/keymapper) for blocking keyboard input

## Requirements

Tested on Debian 13. Should work on Ubuntu, Linux Mint, and other Debian-based systems. Requires systemd and X11.

## Installation

Clone the repo and run the install script as root:

```bash
git clone <repo-url> kiosk
cd kiosk
sudo bash install.sh
```

The script will:

1. Install system packages: `xorg`, `openbox`, `firefox-esr`, `xdotool`, `xprintidle`, `jq`, `python3-venv`, `python3-tk`
2. Create a locked `kiosk` system user
3. Symlink the repo to `/opt/kiosk` (so `git pull` takes effect immediately)
4. Set up a Python venv and install Flask
5. Install and enable the systemd services
6. Disable `getty@tty1` so no terminal is visible on the display

`kiosk.service` runs as root so Xorg can start without extra packages. The browser, idle watcher, and IP overlay are dropped to the `kiosk` user via `runuser` so the browser process itself never runs as root.

After installation the control UI is available at `http://<hostname>:8080`.

## Updating

```bash
git pull
sudo systemctl restart kiosk kiosk-control
```

## Control UI

Open `http://<kiosk-ip>:8080` in any browser on your network.

![Control UI](docs/screenshot.png)

- **Display URL** — the page shown in the kiosk browser
- **Idle reload** — toggle on/off and set the timeout in seconds
- **Save** — writes the config; takes effect on the next kiosk restart
- **Restart Kiosk** — restarts the browser session immediately

## JSON API

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/state` | Current config and browser running status |
| `POST` | `/api/config` | Update config fields (see below) |
| `POST` | `/api/restart` | Restart the kiosk service |

### `GET /api/state`

```json
{
  "url": "https://example.com",
  "idle_enabled": true,
  "idle_timeout": 300,
  "browser_running": true
}
```

### `POST /api/config`

All fields are optional. Send only the fields you want to change.

```json
{
  "url": "https://my-exhibition.example.com",
  "idle_enabled": true,
  "idle_timeout": 120
}
```

### `POST /api/restart`

No request body. Returns `{"ok": true}` before the service restarts.

## Configuration

Config is stored in [`config/kiosk.json`](config/kiosk.json) and can be edited directly or via the API.

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `url` | string | `https://example.com` | Page to display |
| `idle_enabled` | boolean | `false` | Enable idle reload |
| `idle_timeout` | integer | `300` | Seconds of inactivity before reload |

Changes to `url` take effect after a kiosk restart. Changes to idle settings take effect within the next poll cycle (≤ 5 seconds), no restart needed.

## Services

| Service | Description |
|---------|-------------|
| `kiosk.service` | X session, window manager, and browser |
| `kiosk-control.service` | Flask control server on port 8080 |

```bash
# Logs
journalctl -u kiosk -f
journalctl -u kiosk-control -f

# Status
systemctl status kiosk kiosk-control
```

## Keymapper

To block physical keyboard input, install [keymapper](https://github.com/houmain/keymapper) (or the wrapper you use) separately. Once installed, add it as a background process near the top of [`scripts/start-session.sh`](scripts/start-session.sh):

```bash
keymapperd &
keymapper --config /opt/kiosk/keymapper/keymapper.conf &
```

Openbox is X11-based and fully compatible with keymapper.

## Project structure

```
kiosk/
├── install.sh                    # run once as root
├── config/
│   └── kiosk.json               # runtime config
├── scripts/
│   ├── start-session.sh         # xinit entry point
│   ├── start-browser.sh         # browser launcher with auto-detection
│   ├── idle-watcher.sh          # idle reload logic
│   └── ip-overlay.py            # IP address overlay on boot / IP change
├── control/
│   ├── server.py                # Flask control server
│   ├── requirements.txt
│   └── templates/
│       └── index.html           # control UI
└── systemd/
    ├── kiosk.service
    └── kiosk-control.service
```
