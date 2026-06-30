#!/bin/bash
# start-browser.sh — detect and launch the kiosk browser
# Called in a loop from start-session.sh. Reads the URL from config each time
# so a URL change + kiosk restart picks up the new value immediately.

KIOSK_DIR="$(cd "$(dirname "$0")/.." && pwd)"
CONFIG="$KIOSK_DIR/config/kiosk.json"
export DISPLAY="${DISPLAY:-:0}"

# Read URL from config (fall back to example.com if jq or config missing)
if command -v jq &>/dev/null && [ -f "$CONFIG" ]; then
    URL="$(jq -r '.url' "$CONFIG")"
else
    URL="https://zkm.de"
fi

# Detect browser — prefer Firefox
if command -v firefox-esr &>/dev/null; then
    BROWSER="firefox-esr"
elif command -v firefox &>/dev/null; then
    BROWSER="firefox"
elif command -v chromium-browser &>/dev/null; then
    BROWSER="chromium-browser"
elif command -v chromium &>/dev/null; then
    BROWSER="chromium"
else
    echo "ERROR: No supported browser found (firefox-esr, firefox, chromium-browser, chromium)" >&2
    exit 1
fi

echo "Starting $BROWSER → $URL"

case "$BROWSER" in
    firefox-esr|firefox)
        # --kiosk: fullscreen, no chrome
        # --no-remote: don't attach to an existing instance
        # --profile: use a throwaway profile so no session-restore popups
        PROFILE_DIR="${HOME:-/home/kiosk}/.kiosk-firefox-profile"
        mkdir -p "$PROFILE_DIR"
        # Remove stale lock and crash/session files so Firefox doesn't prompt
        # for troubleshoot mode after being killed (idle reload, restart, etc.)
        rm -f "$PROFILE_DIR/lock" "$PROFILE_DIR/.parentlock"
        rm -f "$PROFILE_DIR/sessionstore.jsonlz4"
        rm -rf "$PROFILE_DIR/sessionstore-backups"
        rm -rf "$PROFILE_DIR/crashes"
        exec "$BROWSER" \
            --kiosk \
            --no-remote \
            --profile "$PROFILE_DIR" \
            "$URL"
        ;;
    chromium-browser|chromium)
        exec "$BROWSER" \
            --kiosk \
            --no-first-run \
            --disable-infobars \
            --disable-session-crashed-bubble \
            --disable-restore-session-state \
            --no-default-browser-check \
            --app="$URL"
        ;;
esac
