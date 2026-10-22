#!/bin/bash
# Installs the nightly host-side backup on a Linux server: every day at 00:30 (BACKUP_TIMEZONE, default Asia/Kolkata) it runs
# scripts/backup-images.sh (custom Docker images + deployment configuration, newest 3 kept).
#
#   sudo bash scripts/install-backup-schedule.sh              install (re-running it just refreshes the schedule)
#   sudo bash scripts/install-backup-schedule.sh --remove     uninstall
#
# The DATABASE backup needs no installation: the "backup" container of docker-compose.shared.yml dumps it every day at 00:00 by itself,
# and restarts with Docker. This script covers what a container cannot do for itself: saving the Docker images (it needs the Docker engine).
#
# Uses a systemd timer when systemd is available (it understands time zones and catches up after a reboot: Persistent=true), otherwise a
# /etc/cron.d entry in the server's own time zone.
set -euo pipefail

[ "$(id -u)" = "0" ] || { echo "Run this with sudo (it writes to /etc)." >&2; exit 1; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOCKER_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
TZ_NAME="${BACKUP_TIMEZONE:-Asia/Kolkata}"
RUN_AS="${SUDO_USER:-root}"
LOG="$DOCKER_DIR/../backups/backup-images.log"
UNIT=javaschoollab-backup
mkdir -p "$(dirname "$LOG")"; chown "$RUN_AS" "$(dirname "$LOG")" 2>/dev/null || true

if [ "${1:-}" = "--remove" ]; then
  systemctl disable --now "$UNIT.timer" 2>/dev/null || true
  rm -f "/etc/systemd/system/$UNIT.service" "/etc/systemd/system/$UNIT.timer" "/etc/cron.d/$UNIT"
  systemctl daemon-reload 2>/dev/null || true
  echo "Removed the scheduled backup."; exit 0
fi

if command -v systemctl >/dev/null 2>&1 && [ -d /run/systemd/system ]; then
  cat > "/etc/systemd/system/$UNIT.service" <<EOF
[Unit]
Description=JavaSchoolLab: back up the custom Docker images and the deployment configuration
After=docker.service
Wants=docker.service

[Service]
Type=oneshot
User=$RUN_AS
WorkingDirectory=$DOCKER_DIR
ExecStart=/bin/bash $DOCKER_DIR/scripts/backup-images.sh
StandardOutput=append:$LOG
StandardError=append:$LOG
EOF
  cat > "/etc/systemd/system/$UNIT.timer" <<EOF
[Unit]
Description=JavaSchoolLab nightly image + configuration backup (00:30 $TZ_NAME)

[Timer]
OnCalendar=*-*-* 00:30:00 $TZ_NAME
Persistent=true
RandomizedDelaySec=0

[Install]
WantedBy=timers.target
EOF
  systemctl daemon-reload
  systemctl enable --now "$UNIT.timer"
  echo "Installed a systemd timer. Next runs:"; systemctl list-timers "$UNIT.timer" --no-pager | head -3
else
  cat > "/etc/cron.d/$UNIT" <<EOF
# JavaSchoolLab: back up the custom Docker images and the deployment configuration every night at 00:30 (server time zone).
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin
30 0 * * * $RUN_AS cd "$DOCKER_DIR" && /bin/bash scripts/backup-images.sh >> "$LOG" 2>&1
EOF
  chmod 644 "/etc/cron.d/$UNIT"
  echo "Installed /etc/cron.d/$UNIT (runs at 00:30 in the server's time zone: $(date +%Z))."
fi
echo "Log file: $LOG"
echo "Run it once now to check:  cd $DOCKER_DIR && bash scripts/backup-images.sh"
