#!/bin/bash
# Database backup, run by the "backup" service of docker-compose.shared.yml.
#
#   WHEN      every day at BACKUP_AT (default 00:00, midnight) in the time zone TZ (default Asia/Kolkata).
#   WHAT      a full, consistent mysqldump of the shared database (no locking: the site keeps running), compressed.
#   WHERE     /backups/database/<YYYY-MM-DD>/<db>_<YYYY-MM-DD>_<HH-MM-SS>.sql.gz  (+ a .sha256 checksum next to it)
#             On the host that is  <project>/backups/database/...  (the folder that sits next to docker/).
#   KEEP      the newest BACKUP_KEEP_COUNT backups (default 3). Older ones, and their empty date folders, are deleted.
#   SAFETY    a backup only counts once it is verified: the dump finished ("Dump completed" footer), the gzip file is intact, and it is not
#             tiny. Old backups are deleted ONLY after a new verified one exists, so a failed night never costs you a good backup.
#   START     if there is no backup at all yet, one is taken immediately when the container starts (so a new server is never unprotected
#             until the first midnight). Set BACKUP_ON_START=false to switch that off.
#   ONCE      BACKUP_ONCE=1 takes one backup now and exits (manual backup, and what the tests use).
#
# The password comes from MYSQL_PWD (set in the compose file), so it never appears on a command line.
set -u

HOST="${DB_HOST:-db}"
PORT="${DB_PORT:-3306}"
NAME="${DB_NAME:-javaschoollab}"
USER_NAME="${DB_USER:-root}"
AT="${BACKUP_AT:-00:00}"
KEEP="${BACKUP_KEEP_COUNT:-3}"
ROOT="${BACKUP_DIR:-/backups}/database"
MIN_BYTES="${BACKUP_MIN_BYTES:-1024}"

log() { echo "[backup] $(date '+%F %T %Z') $*"; }

# ---- the status as a metric file for node-exporter's textfile collector (backups/metrics/jsl_backup_database.prom) --------------------
METRICS="${BACKUP_DIR:-/backups}/metrics"
write_metrics() {   # write_metrics <1 = the run succeeded, 0 = it failed>
  mkdir -p "$METRICS"
  [ "$1" = "1" ] && date +%s > "$METRICS/.database_last_success"
  local last newest size count tmp
  last="$(cat "$METRICS/.database_last_success" 2>/dev/null || echo 0)"
  newest="$(find "$ROOT" -type f -name '*.sql.gz' 2>/dev/null | sort | tail -1)"
  size=0; [ -n "$newest" ] && size="$(wc -c < "$newest")"
  count="$(find "$ROOT" -type f -name '*.sql.gz' 2>/dev/null | wc -l)"
  tmp="$METRICS/jsl_backup_database.prom.$$"
  cat > "$tmp" <<EOF
# HELP jsl_backup_last_success_timestamp_seconds Unix time of the last successful backup.
# TYPE jsl_backup_last_success_timestamp_seconds gauge
jsl_backup_last_success_timestamp_seconds{kind="database"} $last
# HELP jsl_backup_last_run_success 1 if the most recent backup run succeeded, 0 if it failed.
# TYPE jsl_backup_last_run_success gauge
jsl_backup_last_run_success{kind="database"} $1
# HELP jsl_backup_last_size_bytes Size of the newest backup file.
# TYPE jsl_backup_last_size_bytes gauge
jsl_backup_last_size_bytes{kind="database"} $size
# HELP jsl_backup_files Number of backup files kept.
# TYPE jsl_backup_files gauge
jsl_backup_files{kind="database"} $count
EOF
  mv "$tmp" "$METRICS/jsl_backup_database.prom"
}

case "$KEEP" in ''|*[!0-9]*|0) log "BACKUP_KEEP_COUNT must be a number of 1 or more (got '$KEEP')"; exit 1;; esac
case "$AT" in [0-2][0-9]:[0-5][0-9]) ;; *) log "BACKUP_AT must look like HH:MM (got '$AT')"; exit 1;; esac

mkdir -p "$ROOT"

# ---- one verified backup ------------------------------------------------------------------------------------------------
take_backup() {
  local day stamp dir file
  day="$(date +%F)"
  stamp="$(date +%F_%H-%M-%S)"
  dir="$ROOT/$day"
  file="$dir/${NAME}_${stamp}.sql.gz"
  mkdir -p "$dir"

  if ! mysqldump -h"$HOST" -P"$PORT" -u"$USER_NAME" --single-transaction --routines --triggers --events --no-tablespaces \
         --default-character-set=utf8mb4 "$NAME" 2> "$file.err" | gzip -c > "$file.part"; then
    log "FAILED: mysqldump or gzip returned an error:"; cat "$file.err"; rm -f "$file.part" "$file.err"; return 1
  fi
  # gzip's status hides a mysqldump failure inside the pipe, so the error file and the dump footer are checked too
  if [ -s "$file.err" ] && grep -qi "error" "$file.err"; then
    log "FAILED: mysqldump reported an error:"; cat "$file.err"; rm -f "$file.part" "$file.err"; return 1
  fi
  if ! gzip -t "$file.part" 2>/dev/null; then log "FAILED: the compressed file is damaged"; rm -f "$file.part" "$file.err"; return 1; fi
  if [ "$(wc -c < "$file.part")" -lt "$MIN_BYTES" ]; then log "FAILED: the dump is suspiciously small"; rm -f "$file.part" "$file.err"; return 1; fi
  if ! gzip -dc "$file.part" | tail -n 5 | grep "Dump completed" >/dev/null; then
    log "FAILED: the dump has no 'Dump completed' footer (it was cut short)"; rm -f "$file.part" "$file.err"; return 1
  fi

  mv "$file.part" "$file" && rm -f "$file.err"
  ( cd "$dir" && sha256sum "$(basename "$file")" > "$(basename "$file").sha256" )
  log "OK: $file ($(wc -c < "$file") bytes)"
  return 0
}

# ---- keep only the newest $KEEP verified backups; remove the rest and any empty date folders -----------------------------------
prune() {
  local i=0 f
  # file names start with the date and time, so a reverse sort of the names is newest first
  while IFS= read -r f; do
    i=$((i + 1))
    if [ "$i" -gt "$KEEP" ]; then
      rm -f "$f" "$f.sha256"
      log "deleted old backup $f"
    fi
  done < <(find "$ROOT" -type f -name '*.sql.gz' -printf '%f\t%p\n' | sort -r | cut -f2)
  find "$ROOT" -mindepth 1 -type d -empty -delete 2>/dev/null
  log "kept $(find "$ROOT" -type f -name '*.sql.gz' | wc -l) backup(s) (newest $KEEP are retained)"
}

run_once() { if take_backup; then prune; write_metrics 1; return 0; fi; write_metrics 0; return 1; }

# After a server reboot Docker starts this container at the same moment as MySQL (a restart policy ignores "depends_on"), and a dump can fail for a
# short while for other reasons too (MySQL restarting, a full disk being cleaned). So: wait until MySQL answers, and when a run fails try again after
# 1, 5 and 15 minutes (BACKUP_RETRY_DELAYS, seconds) before giving up until the next scheduled time. A failed run never touches a good backup.
RETRY_DELAYS="${BACKUP_RETRY_DELAYS:-60 300 900}"
wait_for_db() {   # up to ~5 minutes; "mysqladmin ping" succeeds as soon as the server is up, whatever the password
  local i
  for i in $(seq 1 60); do mysqladmin ping -h"$HOST" -P"$PORT" --silent >/dev/null 2>&1 && return 0; sleep 5; done
  return 1
}
run_with_retries() {
  local d
  run_once && return 0
  for d in $RETRY_DELAYS; do
    log "trying again in ${d}s"; sleep "$d"; wait_for_db || log "MySQL is still not answering"
    run_once && return 0
  done
  return 1
}

# ---- seconds until the next BACKUP_AT ---------------------------------------------------------------------------------------
seconds_until_next() {
  local now target
  now="$(date +%s)"
  target="$(date -d "today $AT" +%s)"
  if [ "$target" -le "$now" ]; then target="$(date -d "tomorrow $AT" +%s)"; fi
  echo $((target - now))
}

if [ "${BACKUP_ONCE:-0}" = "1" ]; then run_once; exit $?; fi

log "daily backup at $AT ($(date +%Z)), keeping the newest $KEEP, in $ROOT"
if [ -n "$(find "$ROOT" -type f -name '*.sql.gz' -print -quit)" ]; then write_metrics 1 2>/dev/null; fi
if [ "${BACKUP_ON_START:-true}" = "true" ] && [ -z "$(find "$ROOT" -type f -name '*.sql.gz' -print -quit)" ]; then
  log "no backup exists yet: taking one now (after MySQL answers)"
  wait_for_db || log "MySQL does not answer yet; the dump will be retried"
  run_with_retries || log "the first backup failed after the retries; will try again at $AT"
fi

while true; do
  wait_s="$(seconds_until_next)"
  log "next backup in ${wait_s}s (at $AT)"
  sleep "$wait_s"
  run_with_retries || log "backup failed after the retries; the previous verified backups are untouched. Next try tomorrow at $AT."
  sleep 5   # never run twice in the same minute
done
