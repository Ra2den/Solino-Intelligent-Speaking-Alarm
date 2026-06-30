#!/bin/bash
# idle-watcher.sh — return to the configured URL after a period of inactivity
# Requires: xprintidle
# Behaviour:
#   - When idle >= idle_timeout: kill the browser so the restart loop reopens the
#     configured URL (handles the case where a user has navigated away)
#   - When activity resumes (idle drops below ACTIVITY_THRESHOLD_MS): reset flag
#   - Only triggers once per idle period — won't loop if left overnight

KIOSK_DIR="$(cd "$(dirname "$0")/.." && pwd)"
CONFIG="$KIOSK_DIR/config/kiosk.json"
export DISPLAY="${DISPLAY:-:0}"

POLL_INTERVAL=5          # seconds between checks
ACTIVITY_THRESHOLD_MS=5000  # idle below this → user is active again

reloaded=false

read_config() {
    if command -v jq &>/dev/null && [ -f "$CONFIG" ]; then
        IDLE_ENABLED="$(jq -r '.idle_enabled' "$CONFIG")"
        IDLE_TIMEOUT_S="$(jq -r '.idle_timeout' "$CONFIG")"
    else
        IDLE_ENABLED="false"
        IDLE_TIMEOUT_S="300"
    fi
    IDLE_THRESHOLD_MS=$(( IDLE_TIMEOUT_S * 1000 ))
}

return_to_url() {
    # Kill the browser — the restart loop in start-session.sh will relaunch it
    # pointing at the configured URL, regardless of where the user navigated.
    pkill -x firefox-esr 2>/dev/null || \
    pkill -x firefox     2>/dev/null || \
    pkill -x chromium-browser 2>/dev/null || \
    pkill -x chromium    2>/dev/null || true
}

while true; do
    sleep "$POLL_INTERVAL"

    read_config

    if [ "$IDLE_ENABLED" != "true" ]; then
        reloaded=false
        continue
    fi

    if ! command -v xprintidle &>/dev/null; then
        continue
    fi

    idle_ms="$(xprintidle 2>/dev/null)" || continue

    if [ "$idle_ms" -lt "$ACTIVITY_THRESHOLD_MS" ]; then
        # User is active — reset the reloaded flag
        reloaded=false
    elif [ "$idle_ms" -ge "$IDLE_THRESHOLD_MS" ] && [ "$reloaded" = "false" ]; then
        # Idle threshold reached — return to the configured URL
        return_to_url
        reloaded=true
    fi
done
