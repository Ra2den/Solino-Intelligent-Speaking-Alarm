#!/bin/bash
# install.sh — one-shot kiosk setup
# Run as root from the cloned repo directory:
#   sudo bash install.sh
#
# After installation, update the kiosk by pulling the repo and restarting:
#   git pull && sudo systemctl restart kiosk kiosk-control

set -euo pipefail

# ── Helpers ──────────────────────────────────────────────────────────────────

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'

info()    { echo -e "${GREEN}[kiosk]${NC} $*"; }
warn()    { echo -e "${YELLOW}[kiosk]${NC} $*"; }
error()   { echo -e "${RED}[kiosk]${NC} $*" >&2; exit 1; }

# ── Checks ───────────────────────────────────────────────────────────────────

[ "$(id -u)" -eq 0 ] || error "Run this script as root: sudo bash install.sh"

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
info "Repository: $REPO_DIR"

# ── Dependencies ──────────────────────────────────────────────────────────────

info "Installing system packages…"
apt-get update -qq

# Core kiosk packages
PACKAGES=(
    xorg
    openbox
    python3-venv
    python3-pip
    python3-tk
    x11-utils
    jq
    xprintidle
    unclutter
)

apt-get install -y "${PACKAGES[@]}"

# Try Firefox ESR first, then Chromium as fallback — at least one must succeed
if apt-get install -y firefox-esr 2>/dev/null; then
    info "Installed firefox-esr"
elif apt-get install -y firefox 2>/dev/null; then
    info "Installed firefox"
elif apt-get install -y chromium 2>/dev/null; then
    info "Installed chromium"
elif apt-get install -y chromium-browser 2>/dev/null; then
    info "Installed chromium-browser"
else
    error "No supported browser could be installed. Install firefox-esr or chromium manually."
fi

# ── Kiosk user ────────────────────────────────────────────────────────────────

if ! id kiosk &>/dev/null; then
    info "Creating 'kiosk' user…"
    useradd -m -s /bin/bash -c "Kiosk" kiosk
    passwd -l kiosk   # lock password — login is only via the systemd service
else
    info "'kiosk' user already exists"
fi

# ── /opt/kiosk symlink ────────────────────────────────────────────────────────

info "Linking /opt/kiosk → $REPO_DIR"
ln -sfn "$REPO_DIR" /opt/kiosk

# Make the repo and its parent directories world-traversable so the
# kiosk user can read files regardless of where the repo was cloned
chmod o+rX "$(dirname "$REPO_DIR")"
chmod -R o+rX "$REPO_DIR"

# Allow kiosk user to write the config directory
chown -R kiosk:kiosk "$REPO_DIR/config"
chmod -R u+rw "$REPO_DIR/config"

# Make scripts executable
chmod +x "$REPO_DIR/scripts/"*.sh

# ── Python venv ───────────────────────────────────────────────────────────────

info "Setting up Python venv…"
python3 -m venv /opt/kiosk/venv
/opt/kiosk/venv/bin/pip install --quiet -r /opt/kiosk/control/requirements.txt

# ── Default config ────────────────────────────────────────────────────────────

if [ ! -f "$REPO_DIR/config/kiosk.json" ]; then
    info "Writing default config…"
    cat > "$REPO_DIR/config/kiosk.json" <<'EOF'
{
  "url": "https://example.com",
  "idle_enabled": false,
  "idle_timeout": 300
}
EOF
    chown kiosk:kiosk "$REPO_DIR/config/kiosk.json"
fi

# ── Systemd services ──────────────────────────────────────────────────────────

info "Installing systemd services…"
cp "$REPO_DIR/systemd/kiosk.service"         /etc/systemd/system/kiosk.service
cp "$REPO_DIR/systemd/kiosk-control.service" /etc/systemd/system/kiosk-control.service
systemctl daemon-reload

# ── Sudoers ───────────────────────────────────────────────────────────────────

SUDOERS_FILE=/etc/sudoers.d/kiosk
if [ ! -f "$SUDOERS_FILE" ]; then
    info "Adding sudoers rule for kiosk service restart…"
    # Allow the kiosk user (running the control server) to restart the kiosk service
    echo "kiosk ALL=(ALL) NOPASSWD: /bin/systemctl restart kiosk" > "$SUDOERS_FILE"
    chmod 440 "$SUDOERS_FILE"
fi

# ── Disable conflicting getty on tty1 ─────────────────────────────────────────

info "Disabling getty@tty1 (kiosk.service takes over tty1)…"
systemctl disable getty@tty1.service 2>/dev/null || true
systemctl stop    getty@tty1.service 2>/dev/null || true

# ── Enable & start services ───────────────────────────────────────────────────

info "Enabling kiosk services…"
systemctl enable kiosk.service kiosk-control.service
systemctl restart kiosk-control.service

# Start kiosk session (restarts if already running)
systemctl restart kiosk.service

# ── Done ──────────────────────────────────────────────────────────────────────

HOSTNAME_VAL="$(hostname -I | awk '{print $1}')"
echo
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  Kiosk installed and started.${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo
echo "  Control UI : http://${HOSTNAME_VAL}:8080"
echo "  State JSON : http://${HOSTNAME_VAL}:8080/api/state"
echo
echo "  To update  : git pull && sudo systemctl restart kiosk kiosk-control"
echo "  To stop    : sudo systemctl stop kiosk kiosk-control"
echo "  Logs       : journalctl -u kiosk -f"
echo "               journalctl -u kiosk-control -f"
echo
warn "Keymapper: if you want to block keyboard input, install the keymapper"
warn "wrapper separately and start it from scripts/start-session.sh."
