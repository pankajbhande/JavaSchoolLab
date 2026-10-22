#!/bin/bash
# Restores a database backup made by docker/backup.sh into the shared MySQL (container javaschoollab-db).
#
#   ./scripts/restore-db.sh <backup-file.sql.gz> [target-database] [--yes]
#
#   backup-file      for example  ../backups/database/2026-10-21/javaschoollab_2026-10-21_00-00-00.sql.gz
#   target-database  the database to load the backup into. Default: the application's database (MYSQL_DATABASE of the container).
#                    Use another name (for example  restore_check) to try a backup out WITHOUT touching the live data.
#   --yes            do not ask for confirmation (only for scripts)
#
# What it does, in order:
#   1. checks the file: gzip is intact, the SHA-256 matches the .sha256 next to it, the dump is complete
#   2. takes a safety copy of the CURRENT state of the target database into ../backups/pre-restore/ (never rotated away)
#   3. asks you to type the database name (a restore REPLACES the tables of that database)
#   4. loads the backup
#   5. counts the tables so you can see that something arrived
# Stop the application first for a clean restore of the live database:   docker compose stop app      (start it again afterwards)
set -euo pipefail

CONTAINER="${DB_CONTAINER:-javaschoollab-db}"
FILE="${1:-}"
TARGET="${2:-}"
YES=0
for a in "$@"; do [ "$a" = "--yes" ] && YES=1; done
[ "$TARGET" = "--yes" ] && TARGET=""

if [ -z "$FILE" ] || [ ! -f "$FILE" ]; then
  echo "Usage: $0 <backup-file.sql.gz> [target-database] [--yes]" >&2
  echo "Backups available:" >&2
  ls -1 "$(dirname "$0")/../../backups/database"/*/*.sql.gz 2>/dev/null | sed 's/^/  /' >&2 || true
  exit 1
fi
docker inspect "$CONTAINER" >/dev/null 2>&1 || { echo "Container $CONTAINER is not running. Start the shared stack first." >&2; exit 1; }

APP_DB="$(docker exec "$CONTAINER" printenv MYSQL_DATABASE)"
TARGET="${TARGET:-$APP_DB}"
SAFETY_DIR="$(cd "$(dirname "$FILE")" && pwd)/../../pre-restore"
mkdir -p "$SAFETY_DIR"

echo "== 1. checking the backup file"
gzip -t "$FILE"
if [ -f "$FILE.sha256" ]; then
  ( cd "$(dirname "$FILE")" && sha256sum -c "$(basename "$FILE").sha256" )
else
  echo "   (no .sha256 file next to it: checksum not verified)"
fi
gzip -dc "$FILE" | tail -n 5 | grep "Dump completed" >/dev/null || { echo "The dump has no 'Dump completed' footer: it is incomplete. Not restoring." >&2; exit 1; }
echo "   OK"

echo "== 2. safety copy of the current '$TARGET' database"
if docker exec "$CONTAINER" sh -c "mysql -uroot -p\"\$MYSQL_ROOT_PASSWORD\" -N -e \"SELECT 1 FROM information_schema.schemata WHERE schema_name='$TARGET'\"" 2>/dev/null | grep 1 >/dev/null; then
  SAFETY="$SAFETY_DIR/${TARGET}_before-restore_$(date +%F_%H-%M-%S).sql.gz"
  docker exec "$CONTAINER" sh -c "mysqldump -uroot -p\"\$MYSQL_ROOT_PASSWORD\" --single-transaction --routines --triggers --events --no-tablespaces --default-character-set=utf8mb4 '$TARGET' 2>/dev/null" | gzip -c > "$SAFETY"
  echo "   saved: $SAFETY"
else
  echo "   the database '$TARGET' does not exist yet: nothing to save"
fi

echo "== 3. confirmation"
echo "   This will REPLACE the tables of database '$TARGET' with the contents of:"
echo "   $FILE"
if [ "$YES" != "1" ]; then
  read -r -p "   Type the database name ($TARGET) to continue: " ANSWER
  [ "$ANSWER" = "$TARGET" ] || { echo "Not confirmed. Nothing was changed."; exit 1; }
fi

echo "== 4. restoring"
docker exec "$CONTAINER" sh -c "mysql -uroot -p\"\$MYSQL_ROOT_PASSWORD\" -e 'CREATE DATABASE IF NOT EXISTS \`$TARGET\` CHARACTER SET utf8mb4'" 2>/dev/null
gzip -dc "$FILE" | docker exec -i "$CONTAINER" sh -c "mysql -uroot -p\"\$MYSQL_ROOT_PASSWORD\" --default-character-set=utf8mb4 '$TARGET'" 2>/dev/null

echo "== 5. result"
N="$(docker exec "$CONTAINER" sh -c "mysql -uroot -p\"\$MYSQL_ROOT_PASSWORD\" -N -e \"SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='$TARGET'\"" 2>/dev/null)"
echo "   database '$TARGET' now has $N table(s)."
echo "Done. If the application was stopped, start it again:  docker compose up -d"
