#!/bin/bash
# Copies the backups folder OFF the server, and keeps the remote copy tidy. A backup that lives only on the machine it protects is lost with it.
#
#   bash scripts/sync-backups-offsite.sh
#
# Set BACKUP_REMOTE in docker/.env (or the environment) to where the copy should go:
#   /mnt/backup-disk/javaschoollab        a local folder: an attached volume, an NFS / SMB mount (also good for a USB disk)
#   backupuser@other-host:/srv/jsl        another server over SSH (rsync; needs a passwordless SSH key for the user that runs this)
#   b2:javaschoollab-backups              a cloud bucket through rclone (S3, Backblaze B2, Google Drive, OneDrive ...): run "rclone config" once
# Remote copies older than BACKUP_REMOTE_KEEP_DAYS (default 30) are deleted, so the remote keeps a longer history than the server's newest 3.
# backup-images.sh calls this automatically at the end when BACKUP_REMOTE is set (so the nightly schedule also copies off-server).
# The monitoring status (backups/metrics) is not copied. A failure exits non-zero and is visible in the backup-status metric.
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOCKER_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ROOT="${BACKUP_DIR:-$DOCKER_DIR/../backups}"; ROOT="$(cd "$ROOT" 2>/dev/null && pwd)" || { echo "[offsite] no backups folder yet"; exit 0; }

env_get() { [ -f "$DOCKER_DIR/.env" ] || return 0; local v; v="$(grep -E "^$1=" "$DOCKER_DIR/.env" | tail -1 | cut -d= -f2-)"; v="${v%\"}"; v="${v#\"}"; v="${v%\'}"; v="${v#\'}"; printf '%s' "$v"; }
: "${BACKUP_REMOTE:=$(env_get BACKUP_REMOTE)}"
: "${BACKUP_REMOTE_KEEP_DAYS:=$(env_get BACKUP_REMOTE_KEEP_DAYS)}"; : "${BACKUP_REMOTE_KEEP_DAYS:=30}"

log() { echo "[offsite] $(date '+%F %T %Z') $*"; }
[ -n "${BACKUP_REMOTE:-}" ] || { log "BACKUP_REMOTE is not set: nothing to do (set it in docker/.env to copy the backups off this server)"; exit 0; }
case "$BACKUP_REMOTE_KEEP_DAYS" in ''|*[!0-9]*) log "BACKUP_REMOTE_KEEP_DAYS must be a number"; exit 1;; esac

STATUS=0
case "$BACKUP_REMOTE" in
  /*|[A-Za-z]:/*|[A-Za-z]:\\*)          # a local / mounted folder (a Windows drive-letter path counts too)
    mkdir -p "$BACKUP_REMOTE" || { log "cannot create $BACKUP_REMOTE"; exit 1; }
    if command -v rsync >/dev/null 2>&1; then rsync -a --exclude 'metrics/' "$ROOT/" "$BACKUP_REMOTE/" || STATUS=1
    else ( cd "$ROOT" && find . -path ./metrics -prune -o -type f -print0 | xargs -0 -I{} cp --parents -p "{}" "$BACKUP_REMOTE/" ) || STATUS=1; fi
    find "$BACKUP_REMOTE" -type f -mtime "+$BACKUP_REMOTE_KEEP_DAYS" -delete 2>/dev/null
    find "$BACKUP_REMOTE" -mindepth 1 -type d -empty -delete 2>/dev/null ;;
  *@*:*)                                # another server over SSH
    command -v rsync >/dev/null 2>&1 || { log "rsync is not installed (sudo apt install rsync)"; exit 1; }
    HOST="${BACKUP_REMOTE%%:*}"; RPATH="${BACKUP_REMOTE#*:}"
    rsync -a --partial -e "ssh -o BatchMode=yes -o StrictHostKeyChecking=accept-new" --exclude 'metrics/' "$ROOT/" "$BACKUP_REMOTE/" || STATUS=1
    ssh -o BatchMode=yes "$HOST" "find '$RPATH' -type f -mtime +$BACKUP_REMOTE_KEEP_DAYS -delete; find '$RPATH' -mindepth 1 -type d -empty -delete" || STATUS=1 ;;
  *:*)                                  # an rclone remote
    command -v rclone >/dev/null 2>&1 || { log "rclone is not installed (https://rclone.org/install/) or the remote '$BACKUP_REMOTE' is unknown"; exit 1; }
    rclone copy "$ROOT" "$BACKUP_REMOTE" --exclude 'metrics/**' --transfers 2 --checkers 4 || STATUS=1
    rclone delete "$BACKUP_REMOTE" --min-age "${BACKUP_REMOTE_KEEP_DAYS}d" || STATUS=1
    rclone rmdirs "$BACKUP_REMOTE" --leave-root >/dev/null 2>&1 ;;
  *) log "BACKUP_REMOTE='$BACKUP_REMOTE' is not a folder, user@host:/path or an rclone remote:path"; exit 1 ;;
esac

# publish the status (backups/metrics/jsl_backup_offsite.prom) for the monitoring
mkdir -p "$ROOT/metrics"
[ "$STATUS" = "0" ] && date +%s > "$ROOT/metrics/.offsite_last_success"
LAST="$(cat "$ROOT/metrics/.offsite_last_success" 2>/dev/null || echo 0)"
cat > "$ROOT/metrics/jsl_backup_offsite.prom.$$" <<EOF
# HELP jsl_backup_last_success_timestamp_seconds Unix time of the last successful backup.
# TYPE jsl_backup_last_success_timestamp_seconds gauge
jsl_backup_last_success_timestamp_seconds{kind="offsite"} $LAST
# HELP jsl_backup_last_run_success 1 if the most recent backup run succeeded, 0 if it failed.
# TYPE jsl_backup_last_run_success gauge
jsl_backup_last_run_success{kind="offsite"} $([ "$STATUS" = "0" ] && echo 1 || echo 0)
EOF
mv "$ROOT/metrics/jsl_backup_offsite.prom.$$" "$ROOT/metrics/jsl_backup_offsite.prom"

if [ "$STATUS" = "0" ]; then log "OK: copied to $BACKUP_REMOTE (remote copies older than $BACKUP_REMOTE_KEEP_DAYS days are removed)"; else log "FAILED: the copy to $BACKUP_REMOTE did not complete"; fi
exit $STATUS
