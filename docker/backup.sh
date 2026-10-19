#!/bin/sh
# Database backup loop, run by the "backup" service in docker-compose.yml.
# Every BACKUP_EVERY_HOURS it writes /backups/<db>-<date>-<time>.sql.gz (a full mysqldump, consistent without locking the
# site) and deletes backups older than BACKUP_KEEP_DAYS. A failed dump never replaces or removes a good backup.
# Set BACKUP_ONCE=1 to take one backup and exit (used for testing and for a manual backup).
set -u

HOST="${DB_HOST:-db}"
PORT="${DB_PORT:-3306}"
NAME="${DB_NAME:-javaschoollab}"
EVERY="${BACKUP_EVERY_HOURS:-24}"
KEEP="${BACKUP_KEEP_DAYS:-14}"
DIR="${BACKUP_DIR:-/backups}"
# The password comes from MYSQL_PWD (set in the compose file), so it never appears on a command line.

mkdir -p "$DIR"

while true; do
  stamp="$(date +%Y%m%d-%H%M%S)"
  file="$DIR/$NAME-$stamp.sql"
  if mysqldump -h"$HOST" -P"$PORT" -u"${DB_USER:-root}" --single-transaction --routines --triggers --no-tablespaces \
       --default-character-set=utf8mb4 "$NAME" > "$file.part" 2> "$file.err"; then
    mv "$file.part" "$file" && gzip -f "$file" && gzip -t "$file.gz" \
      && echo "[backup] $(date '+%F %T') wrote $file.gz ($(wc -c < "$file.gz") bytes)" \
      || echo "[backup] $(date '+%F %T') FAILED while compressing $file"
  else
    echo "[backup] $(date '+%F %T') FAILED: $(head -c 300 "$file.err")"
    rm -f "$file.part"
  fi
  rm -f "$file.err"

  # Retention: only complete backups of this database are ever deleted.
  find "$DIR" -maxdepth 1 -name "$NAME-*.sql.gz" -mtime +"$KEEP" -print -delete 2>/dev/null | sed 's/^/[backup] removed old /'

  [ "${BACKUP_ONCE:-0}" = "1" ] && exit 0
  sleep $((EVERY * 3600))
done
