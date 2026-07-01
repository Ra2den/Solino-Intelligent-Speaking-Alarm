# Wecker — Hardware Setup

This directory contains everything that runs on the Raspberry Pi and the Seeed XIAO nRF52840 sensor node. The Pi runs a Node.js control server that drives the LED strip, screen, and audio, and receives bed-presence data from the XIAO over BLE. The PC runs the main Solino alarm backend and delegates hardware control to the Pi.

---

## Hardware

| Component | Details |
|-----------|---------|
| Raspberry Pi 3b+ (any model with GPIO) | Web server, LED strip, display, audio output |
| Official Raspberry Pi 7 inch DSI touchscreen | Backlight controlled via sysfs (`/sys/class/backlight/`) |
| WS2812B LED strip | 15 pixels, GRBW, data line on GPIO D21 |
| 3.5mm speakers / USB audio | Audio output for alarm sound |
| Seeed XIAO nRF52840 | Reads the pressure sensor, sends data to Pi over BLE |
| SEN-09673 | Force-sensitive resistor for demo purposes |

---

## Wiring

### FSR → XIAO

```
3.3V ── FSR ── A2 (ADC)
```

### LED strip → Pi

Connect the WS2812B data line to GPIO pin 21. A few pixel can be powered directly by the pi, but no guarantees are made. An external power supply is recommended.

---

## Raspberry Pi Setup

### 1. System requirements

```bash
sudo apt update
sudo apt install nodejs npm ffmpeg bluetooth bluez python3 python3-pip
```

Check Node.js version — requires v18 or later:

```bash
node --version
```

### 2. Python dependencies

LED control (neopixel via CircuitPython):

```bash
pip install adafruit-blinka adafruit-circuitpython-neopixel rpi_ws281x --break-system-packages
```

BLE scanner:

```bash
sudo pip install bleak requests --break-system-packages
```

### 3. Clone the repo

```bash
git clone https://github.com/Ra2den/Solino-Intelligent-Speaking-Alarm.git ~/wecker
cd ~/wecker/hardware/src
npm install
```

### 4. Configuration

Edit `hardware/src/config.js`:

| Key | Default | Description |
|-----|---------|-------------|
| `NUM_PIXELS` | `15` | Number of LEDs on the strip |
| `LED_PIN` | `D21` | GPIO pin for the LED data line |
| `ALARM_SOUND_PATH` | `/home/alarm/alarm_sound.flac` | Absolute path to the alarm audio file on the Pi |
| `ALSA_CONTROL` | `PCM` | ALSA mixer control name (verify with `amixer`) |
| `PORT` | `5000` | HTTP port for the control server |
| `PC_BACKEND_URL` | `""` | URL of the PC running the Solino backend — set this to push bed-sensor events to the alarm service (e.g. `http://192.168.1.42:8000`) |

`PC_BACKEND_URL` can also be set at runtime from the control dashboard under **Settings** — it persists to `hardware/settings.json` across restarts.

The backlight sysfs path is auto-discovered from `/sys/class/backlight/`. Verify the right path exists:

```bash
ls /sys/class/backlight/
```

### 5. Bluetooth

Enable and start Bluetooth:

```bash
sudo systemctl enable --now bluetooth
```

If `bluetoothctl show` shows `Powered: no`:

```bash
sudo rfkill unblock bluetooth
sudo bluetoothctl power on
```

### 6. Alarm audio file

Copy your alarm audio to the path set in `ALARM_SOUND_PATH` (default `/home/alarm/alarm_sound.flac`). FLAC, MP3, WAV, and OGG are all supported.

### 7. Run manually (testing)

In one terminal:

```bash
cd ~/wecker/hardware/src
sudo node app.js
```

In a second terminal:

```bash
cd ~/wecker/hardware
sudo python3 ble_scanner.py
```

Dashboard: `http://<pi-ip>:5000`
API docs: `http://<pi-ip>:5000/api-docs`

---

## Systemd Services (permanent deployment)

Two service files are included: `wecker-control.service` and `wecker-ble.service`.

### 1. Update paths

Edit both files and update `WorkingDirectory` to match where the repo lives on the Pi:

```bash
# Find the actual path:
find /home -name "app.js" 2>/dev/null
```

### 2. Install

```bash
sudo cp ~/wecker/hardware/wecker-control.service /etc/systemd/system/
sudo cp ~/wecker/hardware/wecker-ble.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable wecker-control wecker-ble
sudo systemctl start wecker-control wecker-ble
```

### 3. Check status

```bash
sudo systemctl status wecker-control
sudo systemctl status wecker-ble
journalctl -fu wecker-control   # live logs
journalctl -fu wecker-ble
```

---

## XIAO nRF52840 Firmware

The firmware lives in `hardware/src-ble/`. It reads the FSR sensor over ADC and sends bed-presence data to the Pi over BLE.

### Prerequisites (run on your development machine, not the Pi)

```bash
# Install arduino-cli (macOS/Linux)
brew install arduino-cli   # or see https://arduino.github.io/arduino-cli/

# Add Seeed board index and install the nRF52 platform
arduino-cli config add board_manager.additional_urls \
  https://files.seeedstudio.com/arduino/package_seeeduino_boards_index.json
arduino-cli core update-index
arduino-cli core install Seeeduino:nrf52
```

### Step 1 — Calibration

With `#define CALIBRATION_MODE` uncommented (the default), the firmware prints raw ADC values over USB serial so you can choose the right threshold for your sensor and mounting setup.

Flash to the XIAO (replace the port with yours — find it with `ls /dev/cu.usbmodem*` on macOS):

```bash
cd hardware/src-ble
./compile-upload.sh /dev/cu.usbmodem101
```

Read the serial output:

```bash
screen /dev/cu.usbmodem101 115200
# or: python3 -c "import serial,time; s=serial.Serial('/dev/cu.usbmodem101',115200); [print(s.readline().decode().strip()) for _ in range(60)]"
```

Press the FSR firmly and watch the `adc` value rise (from ~0 at rest toward 1023 under load). Pick a threshold roughly halfway between the resting value and the pressed value. Edit `BED_THRESHOLD` in `src-ble.ino` accordingly.

### Step 2 — Production BLE build

Comment out `#define CALIBRATION_MODE` in `src-ble.ino`, then reflash:

```bash
./compile-upload.sh /dev/cu.usbmodem101
```

The XIAO will now advertise as `Wecker-Sensor` over BLE and only needs power (any USB-C supply). It does **not** need to be plugged into the Pi.

### BLE details

| | Value |
|-|-------|
| Device name | `Wecker-Sensor` (may appear truncated as `Wecke` in scans) |
| Service UUID | `12345678-1234-1234-1234-123456789abc` |
| Characteristic UUID | `12345678-1234-1234-1234-123456789abd` |
| Characteristic format | 1 byte: `1` = bed occupied, `0` = empty |
| Updates | On state change + 1 s heartbeat |

---

## PC Backend Integration

### On the PC (Solino backend)

Set `PI_CONTROL_URL` in `backend/.env` to the Pi's address:

```
PI_CONTROL_URL=http://192.168.1.x:5000
```

With this set, the PC backend will:
- Play the alarm sound on the Pi (looped) instead of locally
- Control Pi LED strip and screen brightness based on alarm state
- Forward volume changes to the Pi's ALSA mixer

Leave it empty to keep everything playing locally (useful for development without a Pi).

### On the Pi (control dashboard)

Set **PC Backend URL** in the Settings card of the control dashboard (`http://<pi-ip>:5000`). This lets the Pi push bed-sensor events back to the PC's alarm service so guard mode works with the real physical sensor. The value persists to `hardware/settings.json`.

---

## API Reference

Full interactive docs at `http://<pi-ip>:5000/api-docs`.

### Endpoints added for PC integration

| Method | Path | Body | Description |
|--------|------|------|-------------|
| `POST` | `/api/audio/alarm/play` | — | Play the configured alarm file in a loop |
| `POST` | `/api/audio/alarm/stop` | — | Stop alarm playback |
| `POST` | `/api/alarm/state` | `{status}` | Set alarm state: `IDLE`, `RINGING`, `GUARD`, `SNOOZED` — drives LED and screen automatically |
| `POST` | `/api/sensor/data` | `{bed: 0\|1}` | Update bed occupancy from BLE scanner |
| `GET` | `/api/settings` | — | Read current settings (e.g. `pc_backend_url`) |
| `POST` | `/api/settings` | `{pc_backend_url}` | Update and persist settings |

### Alarm state effects

| State | Screen | LEDs |
|-------|--------|------|
| `RINGING` | Full brightness (instant) | Warm red/orange, full brightness |
| `GUARD` | Dim (60/255) | Dim amber |
| `SNOOZED` / `IDLE` | Fades to 160/255 after 30 s | Fades to off after 30 s |

---

## Project Structure

```
hardware/
├── src/                        # Pi control server (Node.js)
│   ├── app.js                  # Entry point
│   ├── config.js               # All tuneable settings
│   ├── state.js                # Shared runtime state
│   ├── ledController.js        # LED strip control with smooth fades
│   ├── screenController.js     # Sysfs backlight control with smooth fades
│   ├── audioPlayer.js          # Audio playback (single + looped)
│   ├── led_helper.py           # Python subprocess for neopixel DMA
│   ├── routes/
│   │   └── api.js              # All REST + Socket.IO endpoints
│   └── public/                 # Control dashboard (Vue 3, offline)
│       ├── index.html
│       ├── app.js
│       ├── style.css
│       ├── api-docs.html       # Swagger UI
│       └── vendor/             # Vendored JS/CSS (no CDN required)
├── src-ble/                    # XIAO nRF52840 firmware
│   ├── src-ble.ino             # Firmware source
│   └── compile-upload.sh       # Build + flash script
├── ble_scanner.py              # Pi-side BLE → HTTP bridge
├── wecker-control.service      # systemd unit for the Node server
├── wecker-ble.service          # systemd unit for the BLE scanner
└── README.md                   # This file
```

---

## Troubleshooting

Note: the backlight value range is `0–<max_brightness>` (check `cat /sys/class/backlight/*/max_brightness`), not 0–255.

**BLE scanner finds sensor but can't connect**
Clear any stale BlueZ bonding state:
```bash
bluetoothctl
remove <XIAO_ADDRESS>
quit
```
Then restart the scanner.

**Alarm sound not playing on Pi**
- Check `ALARM_SOUND_PATH` in `config.js` matches the actual file location on the Pi
- Verify the file exists: `ls -lh /home/alarm/alarm_sound.flac`
- Check ALSA volume: `amixer get PCM`
- Test manually: `aplay /home/alarm/alarm_sound.flac` (or `ffplay` for non-WAV)

**Bed sensor events not reaching the PC alarm service**
Check the Pi's Node server logs for `[Sensor]` and `[PC push]` lines. Common causes:
- `PC_BACKEND_URL` not set in the dashboard Settings
- PC firewall blocking port 8000
- Wrong IP (Pi and PC must be on the same network)
