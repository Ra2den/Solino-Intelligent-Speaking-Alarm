#!/bin/bash
# start-session.sh — xinit entry point
# Launched by kiosk.service (running as root) via xinit.
# X and openbox run as root; the browser, idle watcher, and IP overlay
# are dropped to the 'kiosk' user via runuser.

KIOSK_DIR="$(cd "$(dirname "$0")/.." && pwd)"
export DISPLAY="${DISPLAY:-:0}"

# Black root window — no desktop visible behind the browser
xsetroot -solid black

# Disable screen blanking and DPMS so the display stays on
xset s off
xset -dpms
xset s noblank

# Apply display rotation from config (default: normal)
ROTATION=$(jq -r '.rotation // "normal"' "$KIOSK_DIR/config/kiosk.json" 2>/dev/null || echo "normal")
if [ "$ROTATION" != "normal" ]; then
    OUTPUT=$(xrandr | awk '/ connected/{print $1; exit}')
    [ -n "$OUTPUT" ] && xrandr --output "$OUTPUT" --rotate "$ROTATION"
fi

# Hide cursor if configured
HIDE_CURSOR=$(jq -r '.hide_cursor // false' "$KIOSK_DIR/config/kiosk.json" 2>/dev/null || echo "false")
if [ "$HIDE_CURSOR" = "true" ]; then
    unclutter -idle 0 -root &
fi

# Start openbox (background, runs as root — only manages window layout)
openbox --sm-disable &

# Give WM a moment to settle
sleep 1

# Allow the kiosk user to connect to our X display
xhost +SI:localuser:kiosk

# Show IP overlay if the IP has changed since the last run (or first run)
runuser -u kiosk -- env DISPLAY="$DISPLAY" \
    python3 "$KIOSK_DIR/scripts/ip-overlay.py" "$KIOSK_DIR/config/.last-ip"

# Start idle watcher in background (runs as kiosk)
runuser -u kiosk -- env DISPLAY="$DISPLAY" \
    bash "$KIOSK_DIR/scripts/idle-watcher.sh" &

# Browser restart loop — if the browser exits for any reason it comes back
while true; do
    runuser -u kiosk -- env DISPLAY="$DISPLAY" \
        bash "$KIOSK_DIR/scripts/start-browser.sh"
    sleep 2
done
