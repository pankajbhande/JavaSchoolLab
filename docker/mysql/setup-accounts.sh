#!/bin/bash
# Makes the MySQL accounts match docker/.env. Run by the one-shot "db-setup" container of docker-compose.shared.yml after MySQL is healthy,
# on every "up", so .env stays the single source of truth. Every statement is safe to repeat.
#
#   root                     password = DB_ROOT_PASSWORD   (full administrator, used by backups and for maintenance)
#   DB_USER (supervisor)     password = DB_PASSWORD        (the application account: full rights on DB_NAME only, nothing else)
#   EXPORTER_USER            password = EXPORTER_PASSWORD  (monitoring: may only read server status, no access to your data tables' contents)
#   DB_USER_PREVIOUS         dropped if it is set and different from DB_USER (for example the old "jsl" account)
#
# Changing a password in .env after the database exists is exactly what this script is for: MySQL only reads MYSQL_ROOT_PASSWORD /
# MYSQL_PASSWORD the very first time it creates an empty data directory.
#
# If the root password in .env is NOT the one the database currently has (you just changed it), set DB_ROOT_PASSWORD_PREVIOUS=<the old
# root password> in .env once. The script then logs in with the old one and sets the new one.
set -u

HOST="${DB_HOST:-db}"
NAME="${DB_NAME:?DB_NAME is required}"
ROOT_PW="${DB_ROOT_PASSWORD:?DB_ROOT_PASSWORD is required}"
ROOT_PW_OLD="${DB_ROOT_PASSWORD_PREVIOUS:-}"
APP_USER="${DB_USER:?DB_USER is required}"
APP_PW="${DB_PASSWORD:?DB_PASSWORD is required}"
APP_USER_OLD="${DB_USER_PREVIOUS:-}"
EXP_USER="${EXPORTER_USER:-exporter}"
EXP_PW="${EXPORTER_PASSWORD:?EXPORTER_PASSWORD is required}"

# Escapes a value for use inside a single-quoted SQL string: backslash and single quote.
q() { printf '%s' "$1" | sed -e 's/\\/\\\\/g' -e "s/'/\\\\'/g"; }

can_login() { MYSQL_PWD="$1" mysql -h"$HOST" -uroot -e 'SELECT 1' >/dev/null 2>&1; }

if can_login "$ROOT_PW"; then
  CURRENT_PW="$ROOT_PW"
elif [ -n "$ROOT_PW_OLD" ] && can_login "$ROOT_PW_OLD"; then
  CURRENT_PW="$ROOT_PW_OLD"
  echo "[db-setup] logged in with DB_ROOT_PASSWORD_PREVIOUS; the new root password will be set"
else
  echo "[db-setup] ERROR: cannot log in to MySQL as root with DB_ROOT_PASSWORD (or DB_ROOT_PASSWORD_PREVIOUS)." >&2
  echo "[db-setup]        The database already exists with a different root password. Put that old password in .env as" >&2
  echo "[db-setup]        DB_ROOT_PASSWORD_PREVIOUS and start again (see help.txt, 'Changing the database passwords')." >&2
  exit 1
fi

R="$(q "$ROOT_PW")"; A="$(q "$APP_PW")"; X="$(q "$EXP_PW")"

SQL="
ALTER USER IF EXISTS 'root'@'localhost' IDENTIFIED BY '${R}';
ALTER USER IF EXISTS 'root'@'%' IDENTIFIED BY '${R}';

CREATE DATABASE IF NOT EXISTS \`${NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

CREATE USER IF NOT EXISTS '${APP_USER}'@'%' IDENTIFIED BY '${A}';
ALTER USER '${APP_USER}'@'%' IDENTIFIED BY '${A}';
GRANT ALL PRIVILEGES ON \`${NAME}\`.* TO '${APP_USER}'@'%';

CREATE USER IF NOT EXISTS '${EXP_USER}'@'%' IDENTIFIED BY '${X}' WITH MAX_USER_CONNECTIONS 3;
ALTER USER '${EXP_USER}'@'%' IDENTIFIED BY '${X}' WITH MAX_USER_CONNECTIONS 3;
GRANT PROCESS, REPLICATION CLIENT, SELECT ON *.* TO '${EXP_USER}'@'%';
"
if [ -n "$APP_USER_OLD" ] && [ "$APP_USER_OLD" != "$APP_USER" ]; then
  SQL="${SQL}
DROP USER IF EXISTS '${APP_USER_OLD}'@'%';
"
fi
SQL="${SQL}
FLUSH PRIVILEGES;
"

if ! printf '%s' "$SQL" | MYSQL_PWD="$CURRENT_PW" mysql -h"$HOST" -uroot; then
  echo "[db-setup] ERROR: the account statements failed (see the message above)." >&2
  exit 1
fi

# Prove the three accounts really work with the passwords from .env.
MYSQL_PWD="$ROOT_PW" mysql -h"$HOST" -uroot -e 'SELECT 1' >/dev/null 2>&1        || { echo "[db-setup] ERROR: root login check failed" >&2; exit 1; }
MYSQL_PWD="$APP_PW"  mysql -h"$HOST" -u"$APP_USER" "$NAME" -e 'SELECT 1' >/dev/null 2>&1 || { echo "[db-setup] ERROR: ${APP_USER} login check failed" >&2; exit 1; }
MYSQL_PWD="$EXP_PW"  mysql -h"$HOST" -u"$EXP_USER" -e 'SHOW GLOBAL STATUS LIKE "Uptime"' >/dev/null 2>&1 || { echo "[db-setup] ERROR: ${EXP_USER} login check failed" >&2; exit 1; }

echo "[db-setup] accounts ready: root, ${APP_USER} (database ${NAME}), ${EXP_USER} (monitoring)"
