#!/bin/bash
# Creates strong, random secrets in docker/.env so that no password you typed in a chat, a ticket or a test ever reaches production.
#
#   bash scripts/generate-secrets.sh                  fill every EMPTY secret in docker/.env (the file must exist: it is the one settings file)
#   bash scripts/generate-secrets.sh --rotate         REPLACE the secrets that exist, too (read "What rotating does" first)
#   bash scripts/generate-secrets.sh --file /path/.env   work on another file
#
# Secrets handled: DB_ROOT_PASSWORD, DB_PASSWORD, REDIS_PASSWORD, JWT_SECRET, ACTUATOR_PASSWORD, EXPORTER_PASSWORD, GRAFANA_ADMIN_PASSWORD.
# SMTP_PASS (your mail provider's password) is never generated: it comes from the provider.
# Each value is 40 random letters and digits (about 238 bits) from the operating system's random source; letters and digits only, so
# nothing needs quoting in .env, in a URL or in a shell. The values are NEVER printed. The file is written with mode 600 and the previous
# version is kept next to it as .env.bak-<date> (also mode 600; delete it once you are sure).
#
# What rotating does
#   DB_ROOT_PASSWORD  the old value is saved as DB_ROOT_PASSWORD_PREVIOUS; the next "stack.sh up shared" (db-setup) logs in with the old one and sets the new one.
#                     Rotate, then run stack.sh once, BEFORE rotating again (only one previous value is remembered).
#   DB_PASSWORD, REDIS_PASSWORD, EXPORTER_PASSWORD  re-applied by db-setup / the containers when the stacks are restarted.
#   JWT_SECRET        every signed-in user is signed out once (tokens signed with the old secret stop working).
#   GRAFANA_ADMIN_PASSWORD  changes only when Grafana's data volume is new; for an existing Grafana set it in Grafana (Profile > Change password) too.
# Restart in order afterwards:  bash scripts/stack.sh up all
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FILE="$DIR/.env"; ROTATE=0
while [ $# -gt 0 ]; do
  case "$1" in
    --rotate) ROTATE=1; shift;;
    --file) FILE="$2"; shift 2;;
    *) echo "unknown option $1" >&2; exit 1;;
  esac
done

rand() {   # rand <length>
  local n="$1" out=""
  while [ "${#out}" -lt "$n" ]; do out="$out$(head -c 256 /dev/urandom | tr -dc 'A-Za-z0-9')"; done
  printf '%s' "${out:0:$n}"
}

umask 077
if [ ! -f "$FILE" ]; then echo "$FILE does not exist: it is the one settings file (not in Git). Copy it from your PC first." >&2; exit 1; fi
if [ "$ROTATE" = "1" ]; then
  cp "$FILE" "$FILE.bak-$(date +%Y%m%d-%H%M%S)"
  echo "the previous file is kept as $FILE.bak-* (mode 600): delete it when you are sure"
fi

get() { grep -E "^$1=" "$FILE" | tail -1 | cut -d= -f2- || true; }
put() {   # put <key> <value>: replace the line, or append it
  local key="$1" val="$2" tmp; tmp="$(mktemp)"
  if grep -qE "^$key=" "$FILE"; then awk -v k="$key" -v v="$val" 'BEGIN{FS=OFS="="} $1==k && !done {print k "=" v; done=1; next} {print}' "$FILE" > "$tmp"
  else { cat "$FILE"; printf '\n%s=%s\n' "$key" "$val"; } > "$tmp"; fi
  cat "$tmp" > "$FILE"; rm -f "$tmp"
}

changed=0
for key in DB_ROOT_PASSWORD DB_PASSWORD REDIS_PASSWORD JWT_SECRET ACTUATOR_PASSWORD EXPORTER_PASSWORD GRAFANA_ADMIN_PASSWORD; do
  current="$(get "$key")"; current="${current%\"}"; current="${current#\"}"; current="${current%\'}"; current="${current#\'}"
  if [ -z "$current" ] || [ "$ROTATE" = "1" ]; then
    if [ "$key" = "DB_ROOT_PASSWORD" ] && [ -n "$current" ]; then
      case "$current" in *[!A-Za-z0-9]*) put DB_ROOT_PASSWORD_PREVIOUS "'$current'";; *) put DB_ROOT_PASSWORD_PREVIOUS "$current";; esac   # quoted when it holds special characters
    fi
    put "$key" "$(rand 40)"
    echo "  set $key"; changed=$((changed + 1))
  fi
done
chmod 600 "$FILE"
if [ "$changed" = "0" ]; then echo "every secret already has a value: nothing changed (use --rotate to replace them)"; else echo "done: $changed secret(s) written to $FILE (mode 600). They were not printed anywhere."; fi
