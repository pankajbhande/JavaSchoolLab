#!/bin/bash
# Deploys one already-built application image on THIS server, safely: backup first, health check after, automatic roll-back on failure.
# auto-deploy.sh (merge-triggered) and the Jenkinsfile call it; it works by hand too:
#
#   bash scripts/deploy.sh <image-tag>          e.g.  bash scripts/deploy.sh 202610211530-ab12cd3
#
# Needs: the image javaschoollab/app:<image-tag> to exist in the local Docker, and docker/.env to be filled in.
#
# Order of work
#   1. checks the image and .env exist
#   2. remembers the image that runs now (the roll-back target) and the database schema version
#   3. makes sure the shared stack (MySQL, Redis, OpenSearch) is up
#   4. takes a verified database backup now (the nightly one is not enough before a release)
#   5. starts the new image; waits until Docker reports it healthy, then until /actuator/health/readiness says UP
#   6. SUCCESS: tags the image "latest", records it as the last good version, removes old image versions
#      FAILURE: ROLL-BACK, see below.
#   Exit codes: 0 = deployed.  1 = stopped BEFORE touching the application (bad .env, missing image, shared stack down, backup failed): nothing changed.
#               3 = the new version failed and the previous version is running again.  2 = the new version failed AND the roll-back failed (act now).
#
# Roll-back (what "without breaking" means here)
#   - The previous application image is started again. It is kept on the server (the newest KEEP_IMAGES versions are never deleted). If it was
#     deleted anyway, it is loaded from the newest image archive made after every successful deploy (backups/images/deploy/, newest 3 versions): the "container backup".
#   - The DATABASE is not touched by default. Flyway migrations in this project only ADD (columns, indexes), which the previous version ignores, and
#     restoring a backup would throw away everything users saved after it. If a migration did run, the script says so loudly and prints the one command
#     that restores the pre-deploy backup. For a fully automatic restore set RESTORE_DB_ON_FAILURE=1: when the schema version changed during the failed
#     deploy, the app is stopped, the pre-deploy backup is restored (restore-db.sh keeps a safety copy of the current state first) and the old version starts.
#
# Audit log: whatever the outcome, one entry is written on exit (docker/scripts/deploy-history.sh: MySQL database jsl_ops + backups/deploy-history/history.jsonl):
# who, when, which commit and image, the result, the roll-back target, the schema versions, the backup file. The caller can pass DEPLOY_TRIGGER (auto-deploy | jenkins |
# manual), DEPLOY_ACTOR (who is deploying), DEPLOY_GIT_COMMIT / DEPLOY_GIT_BRANCH / DEPLOY_COMMIT_AUTHOR / DEPLOY_COMMIT_EMAIL / DEPLOY_COMMIT_MESSAGE and DEPLOY_BUILD_URL;
# without them the script uses the Linux user and the Git checkout it lives in.
#
# Settings (environment): SKIP_BACKUP=1 (no backup first; only for the very first deploy), KEEP_IMAGES=4, STACK_WAIT_SECONDS=300 (wait for healthy),
# READY_WAIT_SECONDS=120, RESTORE_DB_ON_FAILURE=0|1.
set -uo pipefail

TAG="${1:-}"
[ -n "$TAG" ] || { echo "usage: $0 <image-tag>" >&2; exit 1; }
case "$TAG" in *[!A-Za-z0-9_.-]*) echo "invalid image tag '$TAG'" >&2; exit 1;; esac

DOCKER_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUPS="$(cd "$DOCKER_DIR/.." && pwd)/backups"
STATE_DIR="$(cd "$DOCKER_DIR/.." && pwd)/.deploy"
IMAGE="javaschoollab/app"
KEEP_IMAGES="${KEEP_IMAGES:-4}"
READY_WAIT_SECONDS="${READY_WAIT_SECONDS:-120}"
RESTORE_DB_ON_FAILURE="${RESTORE_DB_ON_FAILURE:-0}"
DB_CONTAINER="${DB_CONTAINER:-javaschoollab-db}"
MGMT_PORT="${MANAGEMENT_PUBLISH_PORT:-9001}"
mkdir -p "$STATE_DIR"

# ---- audit trail: facts are collected as the script goes; the EXIT trap writes the entry whatever happens
STARTED_EPOCH="$(date +%s)"; DETAIL=""; ROLLED_BACK_TO=""; SCHEMA_BEFORE=""; PRE_BACKUP=""; PREVIOUS=""
REPO_ROOT="$(cd "$DOCKER_DIR/.." && pwd)"
git_info() { git -C "$REPO_ROOT" "$@" 2>/dev/null; }
record_exit() {
  local code=$? result commit
  trap - EXIT
  case "$code" in 0) result=SUCCESS;; 2) result=ROLLBACK_FAILED;; 3) result=ROLLED_BACK;; *) result=FAILED_BEFORE_START;; esac
  commit="${DEPLOY_GIT_COMMIT:-$(git_info rev-parse HEAD)}"
  DH_STARTED_EPOCH="$STARTED_EPOCH" DH_FINISHED_EPOCH="$(date +%s)" DH_RESULT="$result" DH_TRIGGER="${DEPLOY_TRIGGER:-manual}" \
  DH_DEPLOYED_BY="${DEPLOY_ACTOR:-${SUDO_USER:-$(id -un 2>/dev/null)}}" DH_COMMIT="$commit" \
  DH_BRANCH="${DEPLOY_GIT_BRANCH:-$(git_info rev-parse --abbrev-ref HEAD)}" \
  DH_COMMIT_AUTHOR="${DEPLOY_COMMIT_AUTHOR:-$(git_info log -1 --format=%an "$commit")}" DH_COMMIT_EMAIL="${DEPLOY_COMMIT_EMAIL:-$(git_info log -1 --format=%ae "$commit")}" \
  DH_COMMIT_MESSAGE="${DEPLOY_COMMIT_MESSAGE:-$(git_info log -1 --format=%s "$commit")}" DH_BUILD_URL="${DEPLOY_BUILD_URL:-}" \
  DH_IMAGE_TAG="$TAG" DH_IMAGE_ID="$(docker image inspect -f '{{.Id}}' "$IMAGE:$TAG" 2>/dev/null | sed 's/^sha256://' | cut -c1-12)" \
  DH_PREVIOUS_TAG="$PREVIOUS" DH_ROLLED_BACK_TO="$ROLLED_BACK_TO" DH_SCHEMA_BEFORE="$SCHEMA_BEFORE" DH_SCHEMA_AFTER="$(schema_version 2>/dev/null)" \
  DH_BACKUP="$PRE_BACKUP" DH_DETAIL="$DETAIL" bash "$DOCKER_DIR/scripts/deploy-history.sh" record || true
  exit "$code"
}

log(){ echo "[deploy] $(date '+%F %T') $*"; }
die() { DETAIL="$*"; log "FAILED: $*"; exit 1; }
env_get() { [ -f "$DOCKER_DIR/.env" ] || return 0; local v; v="$(grep -E "^$1=" "$DOCKER_DIR/.env" | tail -1 | cut -d= -f2-)"; v="${v%\"}"; v="${v#\"}"; v="${v%\'}"; v="${v#\'}"; printf '%s' "$v"; }
MGMT_PORT="${MANAGEMENT_PUBLISH_PORT:-$(env_get MANAGEMENT_PUBLISH_PORT)}"; MGMT_PORT="${MGMT_PORT:-9001}"

# the database schema version (number of applied Flyway migrations); empty when unknown
schema_version() {
  docker exec "$DB_CONTAINER" sh -c 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" -N -B "$MYSQL_DATABASE" -e "SELECT COUNT(*) FROM flyway_schema_history" 2>/dev/null' 2>/dev/null | tr -d '[:space:]'
}

# number of tables in the application database (0 on a brand-new server before the first start)
table_count() {
  docker exec "$DB_CONTAINER" sh -c 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" -N -B -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = \"$MYSQL_DATABASE\"" 2>/dev/null' 2>/dev/null | tr -d '[:space:]'
}

trap record_exit EXIT

# ---- 1. checks ---------------------------------------------------------------------------------------------------------------------
[ -f "$DOCKER_DIR/.env" ] || die "$DOCKER_DIR/.env is missing. Copy your docker/.env to the server first (it is the one settings file and is not in Git)."
docker image inspect "$IMAGE:$TAG" >/dev/null 2>&1 || die "image $IMAGE:$TAG does not exist on this server (build it first)."

# ---- 2. what runs now --------------------------------------------------------------------------------------------------------------
PREVIOUS="$(docker inspect -f '{{.Config.Image}}' javaschoollab-app 2>/dev/null | sed 's/^.*://')"
[ "$PREVIOUS" = "$TAG" ] && PREVIOUS="$(cat "$STATE_DIR/last-good-tag" 2>/dev/null || true)"
if [ -n "$PREVIOUS" ]; then log "currently running / last good: $IMAGE:$PREVIOUS"; else log "no previous version (first deploy): there is nothing to roll back to"; fi

# ---- 3. shared infrastructure ------------------------------------------------------------------------------------------------------
log "making sure the shared stack (MySQL, Redis, OpenSearch) is running"
bash "$DOCKER_DIR/scripts/stack.sh" up shared || die "the shared stack did not become healthy"
SCHEMA_BEFORE="$(schema_version)"

# ---- 4. backup ---------------------------------------------------------------------------------------------------------------------
if [ "${SKIP_BACKUP:-0}" = "1" ]; then
  log "SKIP_BACKUP=1: no backup before this deploy"
elif [ "$(table_count)" = "0" ]; then
  log "the database has no tables yet (first start of a new server): nothing to back up"
else
  log "taking a database backup before the deploy"
  docker exec -e BACKUP_ONCE=1 javaschoollab-db-backup /bin/bash /backup.sh || die "the pre-deploy backup failed; nothing was changed"
  PRE_BACKUP="$(find "$BACKUPS/database" -type f -name '*.sql.gz' -printf '%T@ %p\n' 2>/dev/null | sort -n | tail -1 | cut -d' ' -f2-)"
  [ -n "$PRE_BACKUP" ] && log "pre-deploy backup: $PRE_BACKUP"
fi

# ---- roll-back ---------------------------------------------------------------------------------------------------------------------
ensure_previous_image() {
  [ -n "$PREVIOUS" ] || return 1
  docker image inspect "$IMAGE:$PREVIOUS" >/dev/null 2>&1 && return 0
  log "image $IMAGE:$PREVIOUS is gone from this server; looking for its backup archive"
  local archive
  archive="$(find "$BACKUPS/images/deploy" -type f -name "*__javaschoollab_app_${PREVIOUS}_*.tar.gz" -printf '%T@ %p\n' 2>/dev/null | sort -n | tail -1 | cut -d' ' -f2-)"
  [ -n "$archive" ] || { log "no archive for $IMAGE:$PREVIOUS in $BACKUPS/images/deploy"; return 1; }
  log "loading $archive"
  gunzip -c "$archive" | docker load >/dev/null && docker image inspect "$IMAGE:$PREVIOUS" >/dev/null 2>&1
}

rollback() {
  log "ROLLING BACK: $1"
  if ! ensure_previous_image; then
    log "CANNOT ROLL BACK: there is no previous image. The new version keeps failing; check:  docker logs javaschoollab-app"
    return 2
  fi
  local after; after="$(schema_version)"
  if [ -n "$SCHEMA_BEFORE" ] && [ -n "$after" ] && [ "$after" != "$SCHEMA_BEFORE" ]; then
    if [ "$RESTORE_DB_ON_FAILURE" = "1" ] && [ -n "$PRE_BACKUP" ]; then
      log "the failed deploy changed the database schema ($SCHEMA_BEFORE -> $after): restoring the pre-deploy backup"
      bash "$DOCKER_DIR/scripts/stack.sh" stop app
      bash "$DOCKER_DIR/scripts/restore-db.sh" "$PRE_BACKUP" --yes || { log "THE DATABASE RESTORE FAILED. Do not start the application. Restore by hand: restore-db.sh $PRE_BACKUP"; return 2; }
    else
      log "WARNING: the failed deploy applied database migrations ($SCHEMA_BEFORE -> $after). The previous version normally works with them (they only add)."
      log "         If it does not, restore the pre-deploy backup:  bash docker/scripts/restore-db.sh ${PRE_BACKUP:-<backup file>} --yes"
    fi
  fi
  APP_IMAGE_TAG="$PREVIOUS" bash "$DOCKER_DIR/scripts/stack.sh" up app --no-build \
    && { ROLLED_BACK_TO="$PREVIOUS"; log "ROLLED BACK: $IMAGE:$PREVIOUS is running again"; } \
    || { log "THE ROLL-BACK ALSO FAILED: check  docker logs javaschoollab-app"; return 2; }
  return 0
}

fail() {   # fail <reason>
  DETAIL="$1"
  rollback "$1"; local rc=$?
  [ "$rc" = "0" ] && exit 3 || exit 2
}

# ---- 5. start the new version ------------------------------------------------------------------------------------------------------
log "starting $IMAGE:$TAG"
export APP_COMMIT="${TAG#*-}"      # the tag is <stamp>-<git commit>; the commit is shown in /actuator/info
APP_IMAGE_TAG="$TAG" bash "$DOCKER_DIR/scripts/stack.sh" up app --no-build || fail "the new version did not become healthy"

# Docker says "healthy"; confirm the application itself answers "ready" (database and the other dependencies reachable).
ready=0; waited=0
while [ "$waited" -lt "$READY_WAIT_SECONDS" ]; do
  if curl -fsS -m 5 "http://127.0.0.1:${MGMT_PORT}/actuator/health/readiness" 2>/dev/null | grep -q '"UP"'; then ready=1; break; fi
  sleep 4; waited=$((waited + 4))
done
[ "$ready" = "1" ] || fail "the readiness endpoint did not report UP within ${READY_WAIT_SECONDS}s"

# ---- 6. success --------------------------------------------------------------------------------------------------------------------
docker tag "$IMAGE:$TAG" "$IMAGE:latest"
echo "$TAG" > "$STATE_DIR/last-good-tag"
log "DEPLOYED $IMAGE:$TAG (also tagged latest)"

# The "container backup": this version as a compressed image archive, kept for the newest KEEP_ARCHIVES versions. If the image is ever deleted from
# Docker, the roll-back loads it from here. A failure here does not undo the deploy; it is only reported.
ARCHIVE_DIR="$BACKUPS/images/deploy"; KEEP_ARCHIVES="${KEEP_ARCHIVES:-3}"
mkdir -p "$ARCHIVE_DIR"
ARCHIVE="$ARCHIVE_DIR/$(date +%Y-%m-%d_%H-%M-%S)__javaschoollab_app_${TAG}_$(docker image inspect -f '{{.Id}}' "$IMAGE:$TAG" | sed 's/^sha256://' | cut -c1-12).tar.gz"
if docker save "$IMAGE:$TAG" | gzip > "$ARCHIVE.part" && gzip -t "$ARCHIVE.part"; then
  mv "$ARCHIVE.part" "$ARCHIVE"; chmod 600 "$ARCHIVE"; log "image backup: $ARCHIVE"
  ls -1t "$ARCHIVE_DIR"/*__javaschoollab_app_*.tar.gz 2>/dev/null | tail -n +"$((KEEP_ARCHIVES + 1))" | while read -r old; do rm -f "$old" && log "removed old image backup $old"; done
else
  rm -f "$ARCHIVE.part"; log "WARNING: the image backup failed (the deploy itself succeeded)"
fi

# keep the newest KEEP_IMAGES versions (docker lists newest first; never the running one or the previous one), remove the rest
docker images "$IMAGE" --format '{{.Tag}}' | grep -v '^latest$' | grep -v '^<none>$' | tail -n +"$((KEEP_IMAGES + 1))" | while read -r old; do
  if [ "$old" = "$TAG" ] || [ "$old" = "$PREVIOUS" ]; then continue; fi
  docker rmi "$IMAGE:$old" >/dev/null 2>&1 && log "removed old image $IMAGE:$old"
done
exit 0
