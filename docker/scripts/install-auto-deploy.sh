#!/bin/bash
# Installs the "deploy when the branch changes" timer (systemd) on a Linux server. Run once, as root:
#
#   sudo bash scripts/install-auto-deploy.sh --branch master [--user deploy] [--interval 2min] [--key /home/deploy/.ssh/jsl_deploy] [--notify-url https://...] [--seed]
#
#   --branch     the deployment branch to watch (default master)
#   --user       the Linux user that runs it; must be in the "docker" group and own this checkout (default: the user who ran sudo)
#   --interval   how often to look at Git (default 2min)
#   --key        a private SSH key for read-only access to the repository (a Git "deploy key"); not needed for a public repository or an https URL with a token
#   --notify-url an incoming-webhook URL (Slack / Discord / Teams) that is told about every deploy result
#   --seed       record the commit that is checked out RIGHT NOW as "already deployed" (use this when the application already runs this version,
#                otherwise the first run deploys the branch head once)
#   --remove     stop and remove the timer
#
# Before you run it: this folder must be a clone of your repository (git clone <url> /opt/javaschoollab), docker/.env must exist in it, and the application
# should already have been started once by hand (help.txt, "PUTTING IT ON AN UBUNTU SERVER"). Then:  bash scripts/auto-deploy.sh --status
# Look at the timer:   systemctl list-timers javaschoollab-auto-deploy        Logs:   journalctl -u javaschoollab-auto-deploy -n 100
set -euo pipefail

[ "$(id -u)" = "0" ] || { echo "Run this with sudo." >&2; exit 1; }
command -v systemctl >/dev/null 2>&1 || { echo "systemd was not found: this installer is for Linux servers (Ubuntu)." >&2; exit 1; }

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
BRANCH="master"; RUN_USER="${SUDO_USER:-root}"; INTERVAL="2min"; KEY=""; NOTIFY=""; SEED=0; REMOVE=0
while [ $# -gt 0 ]; do
  case "$1" in
    --branch) BRANCH="$2"; shift 2;;
    --user) RUN_USER="$2"; shift 2;;
    --interval) INTERVAL="$2"; shift 2;;
    --key) KEY="$2"; shift 2;;
    --notify-url) NOTIFY="$2"; shift 2;;
    --seed) SEED=1; shift;;
    --remove) REMOVE=1; shift;;
    *) echo "unknown option $1" >&2; exit 1;;
  esac
done

if [ "$REMOVE" = "1" ]; then
  systemctl disable --now javaschoollab-auto-deploy.timer 2>/dev/null || true
  rm -f /etc/systemd/system/javaschoollab-auto-deploy.service /etc/systemd/system/javaschoollab-auto-deploy.timer
  systemctl daemon-reload; echo "removed."; exit 0
fi

git -C "$ROOT" rev-parse --git-dir >/dev/null 2>&1 || { echo "$ROOT is not a Git clone. Run:  git clone <your repository url> $ROOT" >&2; exit 1; }
[ -f "$ROOT/docker/.env" ] || { echo "$ROOT/docker/.env is missing: copy your docker/.env to the server first (it is not in Git)." >&2; exit 1; }
id "$RUN_USER" >/dev/null 2>&1 || { echo "user $RUN_USER does not exist" >&2; exit 1; }
id -nG "$RUN_USER" | tr ' ' '\n' | grep -qx docker || { echo "user $RUN_USER is not in the docker group:  sudo usermod -aG docker $RUN_USER  (then log in again)" >&2; exit 1; }
[ -z "$KEY" ] || [ -r "$KEY" ] || { echo "cannot read the key $KEY" >&2; exit 1; }
case "$INTERVAL" in *[!0-9a-z]*|'') echo "invalid interval '$INTERVAL' (example: 2min)" >&2; exit 1;; esac

# the checkout must belong to the deploy user (git refuses to work in a folder owned by someone else)
chown -R "$RUN_USER": "$ROOT" 2>/dev/null || true
sudo -u "$RUN_USER" git config --global --add safe.directory "$ROOT" 2>/dev/null || true

mkdir -p /etc/javaschoollab
umask 077
{
  echo "# Written by install-auto-deploy.sh. Read by scripts/auto-deploy.sh. Keep this file private (it may hold a webhook address)."
  echo "DEPLOY_BRANCH=$BRANCH"
  [ -n "$KEY" ] && echo "GIT_SSH_COMMAND=\"ssh -i $KEY -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new\""
  [ -n "$NOTIFY" ] && echo "DEPLOY_NOTIFY_URL=$NOTIFY"
  echo "# RUN_TESTS=0              1 = also run the Maven tests on the server before every deploy"
  echo "# RESTORE_DB_ON_FAILURE=0  1 = restore the pre-deploy backup automatically when a failed deploy changed the database schema"
} > /etc/javaschoollab/auto-deploy.env
chown "root:$RUN_USER" /etc/javaschoollab/auto-deploy.env; chmod 640 /etc/javaschoollab/auto-deploy.env

cat > /etc/systemd/system/javaschoollab-auto-deploy.service <<EOF
[Unit]
Description=JavaSchoolLab: deploy when the $BRANCH branch changes
After=network-online.target docker.service
Wants=network-online.target

[Service]
Type=oneshot
User=$RUN_USER
WorkingDirectory=$ROOT
ExecStart=/bin/bash $ROOT/docker/scripts/auto-deploy.sh
TimeoutStartSec=60min
Nice=10
EOF

cat > /etc/systemd/system/javaschoollab-auto-deploy.timer <<EOF
[Unit]
Description=Look for a new JavaSchoolLab release every $INTERVAL

[Timer]
OnBootSec=3min
OnUnitInactiveSec=$INTERVAL
AccuracySec=15s

[Install]
WantedBy=timers.target
EOF

if [ "$SEED" = "1" ]; then
  mkdir -p "$ROOT/.deploy"
  git -C "$ROOT" rev-parse HEAD > "$ROOT/.deploy/deployed-commit"
  chown -R "$RUN_USER": "$ROOT/.deploy"
  echo "seeded: commit $(git -C "$ROOT" rev-parse --short HEAD) counts as already deployed."
fi

systemctl daemon-reload
systemctl enable --now javaschoollab-auto-deploy.timer
echo "installed. The server now looks at '$BRANCH' every $INTERVAL and deploys a new commit by itself."
systemctl list-timers javaschoollab-auto-deploy --no-pager || true
echo "Try it:  sudo -u $RUN_USER bash $ROOT/docker/scripts/auto-deploy.sh --status"
