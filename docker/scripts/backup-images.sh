#!/bin/bash
# Backs up the CUSTOM Docker images (the ones built from this project's own code) and the deployment configuration, keeping the last 3 of each.
#
#   ./scripts/backup-images.sh                 (run from the docker/ folder, or from anywhere: it finds its own way)
#
# WHICH IMAGES  Only images YOU build:  javaschoollab/app  (the Spring Boot application + website, built from docker/Dockerfile).
#               mysql, redis, opensearch, prometheus, grafana, loki, tempo, alloy and the exporters are public images that are pulled
#               again from the registry; they hold no code of yours and no data (the database data is protected by the nightly dump
#               of docker/backup.sh). Add more of your own images with BACKUP_IMAGES="image1:tag image2:tag".
# WHAT          1. every custom image as a compressed `docker save` archive:
#                    ../backups/images/<YYYY-MM-DD>/<image>_<tag>_<imageid>_<date>_<time>.tar.gz  (+ .sha256 and .info.txt)
#               2. the deployment configuration (compose files, monitoring config, nginx example, scripts and docker/.env) as one archive:
#                    ../backups/config/javaschoollab-config_<date>_<time>.tar.gz[.enc]
# KEEP          the newest BACKUP_KEEP_COUNT (default 3) DIFFERENT versions of each image, and the newest 3 configuration archives. An image
#               that has not changed since the last backup is not saved again, so three nights without a deployment do not push your
#               previous versions out of the last 3 and you can still roll back.
# SAFETY        an archive counts only when verified (gzip intact, contains manifest.json). Old ones are deleted only after that.
# SECRETS       the configuration archive contains docker/.env (passwords). It is created readable by its owner only (chmod 600). Set
#               BACKUP_ENCRYPT_PASSFILE=/path/to/a/file/with/a/passphrase to encrypt it (AES-256, openssl); keep that file somewhere else.
# RESTORE       an image:   gunzip -c <file>.tar.gz | docker load
#               the config: tar -xzf <file>.tar.gz -C <where>      (encrypted: openssl enc -d -aes-256-cbc -pbkdf2 -pass file:<passfile> -in <file>.enc | tar -xz -C <where>)
# OFF-SERVER    when BACKUP_REMOTE is set (docker/.env), everything in ../backups is also copied off this machine afterwards: see
#               scripts/sync-backups-offsite.sh (a mounted disk, another server over SSH, or cloud storage through rclone).
# SCHEDULE      scripts/install-backup-schedule.sh installs a daily run at 00:30 (after the database dump at 00:00). Run it also right after a deploy.
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOCKER_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
# A scheduler (systemd / cron) starts this script with an almost empty environment, so the BACKUP_* settings are also read from docker/.env.
# A value given on the command line or in the environment always wins.
env_get() { [ -f "$DOCKER_DIR/.env" ] || return 0; local v; v="$(grep -E "^$1=" "$DOCKER_DIR/.env" | tail -1 | cut -d= -f2-)"; v="${v%\"}"; v="${v#\"}"; v="${v%\'}"; v="${v#\'}"; printf '%s' "$v"; }
: "${BACKUP_KEEP_COUNT:=$(env_get BACKUP_KEEP_COUNT)}"
: "${BACKUP_ENCRYPT_PASSFILE:=$(env_get BACKUP_ENCRYPT_PASSFILE)}"
: "${BACKUP_REMOTE:=$(env_get BACKUP_REMOTE)}"
: "${APP_IMAGE_TAG:=$(env_get APP_IMAGE_TAG)}"
export BACKUP_REMOTE BACKUP_ENCRYPT_PASSFILE
ROOT="${BACKUP_DIR:-$DOCKER_DIR/../backups}"
mkdir -p "$ROOT"; ROOT="$(cd "$ROOT" && pwd)"
KEEP="${BACKUP_KEEP_COUNT:-3}"
IMAGES="${BACKUP_IMAGES:-javaschoollab/app:${APP_IMAGE_TAG:-latest}}"
STATUS=0

log() { echo "[backup-images] $(date '+%F %T %Z') $*"; }
case "$KEEP" in ''|*[!0-9]*|0) log "BACKUP_KEEP_COUNT must be a number of 1 or more (got '$KEEP')"; exit 1;; esac
command -v docker >/dev/null || { log "docker is not installed or not on PATH"; exit 1; }
docker info >/dev/null 2>&1 || { log "the Docker engine is not running"; exit 1; }

# ---- 1. images ---------------------------------------------------------------------------------------------------------------------
backup_image() {
  local ref="$1" id short safe day stamp dir file
  if ! id="$(docker image inspect --format '{{.Id}}' "$ref" 2>/dev/null)"; then
    log "SKIPPED: image '$ref' does not exist on this machine (build it first: docker compose up -d --build)"; STATUS=1; return
  fi
  short="${id#sha256:}"; short="${short:0:12}"
  safe="$(echo "$ref" | tr '/:' '__')"
  if [ -n "$(find "$ROOT/images" -type f -name "*__${safe}_${short}.tar.gz" 2>/dev/null)" ]; then
    log "unchanged: $ref (image $short) is already backed up"; return
  fi
  day="$(date +%F)"; stamp="$(date +%F_%H-%M-%S)"
  dir="$ROOT/images/$day"; mkdir -p "$dir"
  file="$dir/${stamp}__${safe}_${short}.tar.gz"
  # the date comes first so that a reverse sort of the names is newest-first; the image name is part of the name for matching below
  if ! docker save "$ref" | gzip -c > "$file.part"; then log "FAILED: docker save of $ref"; rm -f "$file.part"; STATUS=1; return; fi
  # (grep without -q on purpose: under pipefail a grep that quits early would make tar die of SIGPIPE and look like a failure)
  if ! gzip -t "$file.part" 2>/dev/null || ! gzip -dc "$file.part" | tar -t 2>/dev/null | grep '^manifest.json$' >/dev/null; then
    log "FAILED: the archive of $ref is damaged or incomplete"; rm -f "$file.part"; STATUS=1; return
  fi
  mv "$file.part" "$file"
  ( cd "$dir" && sha256sum "$(basename "$file")" > "$(basename "$file").sha256" )
  docker image inspect --format 'image:    {{index .RepoTags 0}}
id:       {{.Id}}
created:  {{.Created}}
size:     {{.Size}} bytes
os/arch:  {{.Os}}/{{.Architecture}}
revision: {{with index .Config "Labels"}}{{index . "org.opencontainers.image.revision"}}{{end}}' "$ref" > "${file%.tar.gz}.info.txt" 2>/dev/null || true
  log "OK: $file ($(wc -c < "$file") bytes)"
  # keep the newest $KEEP archives of THIS image
  local i=0 f
  while IFS= read -r f; do
    i=$((i + 1))
    if [ "$i" -gt "$KEEP" ]; then rm -f "$f" "$f.sha256" "${f%.tar.gz}.info.txt"; log "deleted old version of $ref: $f"; fi
  done < <(find "$ROOT/images" -type f -name "*__${safe}_*.tar.gz" -printf '%f\t%p\n' | sort -r | cut -f2)
  find "$ROOT/images" -mindepth 1 -type d -empty -delete 2>/dev/null || true
}

for ref in $IMAGES; do backup_image "$ref"; done

# ---- 2. deployment configuration ---------------------------------------------------------------------------------------------------
backup_config() {
  local stamp dir file
  stamp="$(date +%F_%H-%M-%S)"; dir="$ROOT/config"; mkdir -p "$dir"
  file="$dir/${stamp}__javaschoollab-config.tar.gz"
  # docker/ itself (compose files, scripts, monitoring, nginx example, .env) without anything bulky or generated
  ( umask 077; tar -czf "$file.part" -C "$(dirname "$DOCKER_DIR")" --exclude='docker/monitoring/tools/__pycache__' "$(basename "$DOCKER_DIR")" ) \
    || { log "FAILED: could not archive the configuration"; rm -f "$file.part"; STATUS=1; return; }
  if ! gzip -t "$file.part" 2>/dev/null || ! tar -tzf "$file.part" | grep 'docker-compose' >/dev/null; then
    log "FAILED: the configuration archive is damaged"; rm -f "$file.part"; STATUS=1; return
  fi
  if [ -n "${BACKUP_ENCRYPT_PASSFILE:-}" ]; then
    if openssl enc -aes-256-cbc -pbkdf2 -salt -pass "file:$BACKUP_ENCRYPT_PASSFILE" -in "$file.part" -out "$file.enc"; then
      rm -f "$file.part"; file="$file.enc"; chmod 600 "$file"
    else
      log "FAILED: encryption of the configuration archive"; rm -f "$file.part" "$file.enc"; STATUS=1; return
    fi
  else
    mv "$file.part" "$file"; chmod 600 "$file"
  fi
  ( cd "$dir" && sha256sum "$(basename "$file")" > "$(basename "$file").sha256" )
  log "OK: $file ($(wc -c < "$file") bytes)$( [ -n "${BACKUP_ENCRYPT_PASSFILE:-}" ] && echo ', encrypted')"
  local i=0 f
  while IFS= read -r f; do
    i=$((i + 1))
    if [ "$i" -gt "$KEEP" ]; then rm -f "$f" "$f.sha256"; log "deleted old configuration archive: $f"; fi
  done < <(find "$dir" -type f \( -name '*javaschoollab-config.tar.gz' -o -name '*javaschoollab-config.tar.gz.enc' \) -printf '%f\t%p\n' | sort -r | cut -f2)
}
backup_config

# ---- 3. copy everything off this server (only when BACKUP_REMOTE is set) ----------------------------------------------------------
if [ -n "${BACKUP_REMOTE:-}" ]; then
  BACKUP_DIR="$ROOT" bash "$SCRIPT_DIR/sync-backups-offsite.sh" || STATUS=1
fi

# ---- publish the status as a metric file (backups/metrics/jsl_backup_images.prom) for node-exporter's textfile collector -------------
mkdir -p "$ROOT/metrics"
if [ "$STATUS" = "0" ]; then date +%s > "$ROOT/metrics/.images_last_success"; fi
LAST="$(cat "$ROOT/metrics/.images_last_success" 2>/dev/null || echo 0)"
OK=$([ "$STATUS" = "0" ] && echo 1 || echo 0)
cat > "$ROOT/metrics/jsl_backup_images.prom.$$" <<EOF
# HELP jsl_backup_last_success_timestamp_seconds Unix time of the last successful backup.
# TYPE jsl_backup_last_success_timestamp_seconds gauge
jsl_backup_last_success_timestamp_seconds{kind="images"} $LAST
# HELP jsl_backup_last_run_success 1 if the most recent backup run succeeded, 0 if it failed.
# TYPE jsl_backup_last_run_success gauge
jsl_backup_last_run_success{kind="images"} $OK
# HELP jsl_backup_files Number of backup files kept.
# TYPE jsl_backup_files gauge
jsl_backup_files{kind="images"} $(find "$ROOT/images" -type f -name '*.tar.gz' 2>/dev/null | wc -l)
EOF
mv "$ROOT/metrics/jsl_backup_images.prom.$$" "$ROOT/metrics/jsl_backup_images.prom"

log "done. Kept at most $KEEP version(s) of each image and $KEEP configuration archive(s) in $ROOT"
exit $STATUS
