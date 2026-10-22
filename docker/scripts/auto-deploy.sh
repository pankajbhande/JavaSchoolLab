#!/bin/bash
# Deploys by itself when the deployment branch of the Git repository changes. Meant to be run every few minutes by a systemd timer
# (install it with scripts/install-auto-deploy.sh). It is the stop-gap until Jenkins / Argo CD take over: the same safety, no extra server software.
#
#   bash scripts/auto-deploy.sh               check the branch; if there is a new commit, build it and deploy it
#   bash scripts/auto-deploy.sh --force       deploy the branch head even if it was deployed before or failed before
#   bash scripts/auto-deploy.sh --status      show what is deployed, what failed and the branch head
#
# How it works (pull model: the server asks Git, nothing connects INTO the server, so no SSH key of the server is exposed to a CI system)
#   1. flock: only one run at a time
#   2. git fetch of the deployment branch; nothing to do when its head equals the deployed commit
#   3. a commit that FAILED is not retried every few minutes; it waits for the next commit (or --force)
#   4. the working copy is reset to that commit (docker/.env and backups/ are git-ignored and never touched)
#   5. docker compose files are validated, the application image is built with the tag <yyyymmddHHMM>-<commit>
#      (RUN_TESTS=1 also runs the Maven tests first; normally the tests run in CI before the merge)
#   6. docker/scripts/deploy.sh does the deploy: backup, start, health checks, automatic roll-back (see that file)
#   7. the result is remembered (.deploy/), written as a Prometheus metric (backups/metrics/jsl_deploy.prom: the dashboards alert on a failed deploy)
#      and, if DEPLOY_NOTIFY_URL is set, posted there (Slack / Discord / Teams incoming webhook)
#
# Settings: /etc/javaschoollab/auto-deploy.env (written by install-auto-deploy.sh) or the environment:
#   DEPLOY_BRANCH=master   GIT_REMOTE=origin   GIT_SSH_COMMAND="ssh -i /home/deploy/.ssh/jsl_deploy -o IdentitiesOnly=yes"
#   RUN_TESTS=0   DEPLOY_NOTIFY_URL=   RESTORE_DB_ON_FAILURE=0   SKIP_BACKUP=0
# Not run on a real server yet (it was exercised end to end on a test machine with a stand-in application image): try it once by hand, with --status first.
#
# The whole script is one function followed by "exit": bash reads a script while it runs, and this script rewrites itself when the new commit changes it.
set -uo pipefail

main() {
  local ROOT; ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
  local STATE="$ROOT/.deploy" ENV_FILE="${AUTO_DEPLOY_ENV:-/etc/javaschoollab/auto-deploy.env}"
  mkdir -p "$STATE" "$ROOT/backups/metrics"
  # shellcheck disable=SC1090
  [ -f "$ENV_FILE" ] && . "$ENV_FILE"
  local BRANCH="${DEPLOY_BRANCH:-master}" REMOTE="${GIT_REMOTE:-origin}" FORCE=0 STATUS_ONLY=0 a
  for a in "$@"; do case "$a" in --force) FORCE=1;; --status) STATUS_ONLY=1;; esac; done
  log() { echo "[auto-deploy] $(date '+%F %T') $*"; }

  git -C "$ROOT" rev-parse --git-dir >/dev/null 2>&1 || { log "$ROOT is not a Git checkout (clone the repository there first: docs/jenkins.md or help.txt)"; return 1; }

  local deployed failed
  deployed="$(cat "$STATE/deployed-commit" 2>/dev/null || true)"; failed="$(cat "$STATE/failed-commit" 2>/dev/null || true)"

  if [ "$STATUS_ONLY" = "1" ]; then
    git -C "$ROOT" fetch --quiet --prune "$REMOTE" "$BRANCH" 2>/dev/null || echo "(could not reach the Git remote)"
    echo "branch            : $BRANCH"
    echo "branch head       : $(git -C "$ROOT" rev-parse --short "$REMOTE/$BRANCH" 2>/dev/null || echo unknown)"
    echo "deployed commit   : ${deployed:0:7}"
    echo "last failed commit: ${failed:0:7}"
    echo "last good image   : $(cat "$STATE/last-good-tag" 2>/dev/null || echo none)"
    echo "running image     : $(docker inspect -f '{{.Config.Image}}' javaschoollab-app 2>/dev/null || echo none)"
    return 0
  fi

  exec 9>"$STATE/lock"
  flock -n 9 || { log "another deploy is running; nothing to do"; return 0; }

  timeout 120 git -C "$ROOT" fetch --quiet --prune "$REMOTE" "$BRANCH" || { log "cannot reach the Git remote now; will try again at the next run"; return 0; }
  local head; head="$(git -C "$ROOT" rev-parse "$REMOTE/$BRANCH" 2>/dev/null)" || { log "branch $BRANCH does not exist on $REMOTE"; return 1; }

  if [ "$FORCE" != "1" ]; then
    [ "$head" = "$deployed" ] && return 0
    if [ "$head" = "$failed" ]; then log "commit ${head:0:7} failed before; waiting for a new commit (use --force to retry)"; return 0; fi
  fi

  local short="${head:0:7}" tag; tag="$(date +%Y%m%d%H%M)-$short"
  log "new commit on $BRANCH: ${deployed:0:7} -> $short. Deploying as $tag"
  local started; started="$(date +%s)"

  # ---- the audit trail (deploy-history.sh): who/what/when goes to deploy.sh through these variables
  local author email subject deploy_ran=0
  author="$(git -C "$ROOT" log -1 --format=%an "$head" 2>/dev/null)"; email="$(git -C "$ROOT" log -1 --format=%ae "$head" 2>/dev/null)"; subject="$(git -C "$ROOT" log -1 --format=%s "$head" 2>/dev/null)"
  export DEPLOY_TRIGGER=auto-deploy DEPLOY_ACTOR="auto-deploy (commit by ${author:-unknown})" DEPLOY_GIT_COMMIT="$head" DEPLOY_GIT_BRANCH="$BRANCH"          DEPLOY_COMMIT_AUTHOR="$author" DEPLOY_COMMIT_EMAIL="$email" DEPLOY_COMMIT_MESSAGE="$subject"

  fail_with() {   # fail_with <reason> <exit code of deploy.sh or 1>
    # failures BEFORE deploy.sh ran (checkout, compose files, tests, image build) are recorded here; deploy.sh records its own
    if [ "$deploy_ran" = "0" ]; then
      DH_STARTED_EPOCH="$started" DH_FINISHED_EPOCH="$(date +%s)" DH_RESULT=BUILD_FAILED DH_TRIGGER=auto-deploy DH_DEPLOYED_BY="$DEPLOY_ACTOR" DH_COMMIT="$head" DH_BRANCH="$BRANCH"       DH_COMMIT_AUTHOR="$author" DH_COMMIT_EMAIL="$email" DH_COMMIT_MESSAGE="$subject" DH_IMAGE_TAG="$tag" DH_DETAIL="$1"         bash "$ROOT/docker/scripts/deploy-history.sh" record || true
    fi
    echo "$head" > "$STATE/failed-commit"
    write_metrics 0 "$head"
    log "DEPLOY OF $short FAILED: $1"
    notify "FAILED" "$short" "$1"
    docker rmi "javaschoollab/app:$tag" >/dev/null 2>&1 || true     # the failed image is no use; the previous version runs
    return "${2:-1}"
  }
  write_metrics() {   # write_metrics <1|0> <commit>
    local f="$ROOT/backups/metrics/jsl_deploy.prom" last
    [ "$1" = "1" ] && date +%s > "$STATE/last-success-ts"
    last="$(cat "$STATE/last-success-ts" 2>/dev/null || echo 0)"
    {
      echo "# HELP jsl_deploy_last_run_success 1 if the most recent automatic deploy succeeded, 0 if it failed (and the previous version was kept)."
      echo "# TYPE jsl_deploy_last_run_success gauge"
      echo "jsl_deploy_last_run_success $1"
      echo "# HELP jsl_deploy_last_success_timestamp_seconds Unix time of the last successful automatic deploy."
      echo "# TYPE jsl_deploy_last_success_timestamp_seconds gauge"
      echo "jsl_deploy_last_success_timestamp_seconds $last"
      echo "# HELP jsl_deploy_info The commit of the last deploy attempt."
      echo "# TYPE jsl_deploy_info gauge"
      echo "jsl_deploy_info{commit=\"${2:0:7}\",branch=\"$BRANCH\"} 1"
    } > "$f.$$" && mv "$f.$$" "$f"
  }
  notify() {   # notify <RESULT> <commit> <detail>
    [ -n "${DEPLOY_NOTIFY_URL:-}" ] || return 0
    curl -fsS -m 10 -H 'Content-Type: application/json' \
      -d "{\"text\":\"JavaSchoolLab deploy $1: commit $2 on $BRANCH. $3\"}" "$DEPLOY_NOTIFY_URL" >/dev/null 2>&1 || true
  }

  # ---- check out exactly that commit (ignored files such as docker/.env and backups/ stay)
  git -C "$ROOT" checkout --quiet -B "$BRANCH" "$head" 2>/dev/null || git -C "$ROOT" reset --quiet --hard "$head" || { fail_with "could not check out $short" 1; return 1; }
  git -C "$ROOT" reset --quiet --hard "$head"

  [ -f "$ROOT/docker/.env" ] || { fail_with "docker/.env is missing in $ROOT/docker (copy it from your PC: it is the one settings file and is not in Git)" 1; return 1; }

  # ---- validate the compose files with the real settings
  local f
  local obs files="docker-compose.shared.yml docker-compose.yml"
  obs="$(grep -E '^OBSERVABILITY=' "$ROOT/docker/.env" 2>/dev/null | tail -1 | cut -d= -f2- | tr 'A-Z' 'a-z' | tr -d "\"' ")"
  case "$obs" in true|1|yes|on) files="$files docker-compose.monitoring.yml";; esac   # monitoring is only validated when it is switched on
  for f in $files; do
    ( cd "$ROOT/docker" && docker compose -f "$f" config -q ) >/dev/null 2>&1 || { fail_with "docker/$f is not valid with docker/.env" 1; return 1; }
  done

  # ---- optional tests, then the image
  if [ "${RUN_TESTS:-0}" = "1" ]; then
    log "running the backend tests"
    docker run --rm -v "$ROOT":/w -v jsl-m2-cache:/root/.m2 -w /w maven:3.9-eclipse-temurin-21 mvn -B -ntp -q test \
      || { fail_with "the backend tests failed" 1; return 1; }
  fi
  log "building the image javaschoollab/app:$tag (a few minutes)"
  docker build -f "$ROOT/docker/Dockerfile" -t "javaschoollab/app:$tag" "$ROOT" || { fail_with "the image build failed" 1; return 1; }

  # ---- deploy (backup, start, health check, roll-back)
  bash "$ROOT/docker/scripts/deploy.sh" "$tag"
  local rc=$?
  deploy_ran=1
  if [ "$rc" = "0" ]; then
    echo "$head" > "$STATE/deployed-commit"; rm -f "$STATE/failed-commit"
    write_metrics 1 "$head"
    log "DEPLOYED $short in $(( $(date +%s) - started ))s"
    notify "OK" "$short" "Running as $tag."
    return 0
  fi
  case "$rc" in
    2) fail_with "the new version failed AND the roll-back failed: the site may be down. See docker logs javaschoollab-app" 2; return 2 ;;
    3) fail_with "the new version failed its health check; the previous version was restored and is running" 1; return 1 ;;
    *) fail_with "the deploy stopped before the application was touched (see the lines above: .env, shared stack or backup); the running version is unchanged" 1; return 1 ;;
  esac
}

main "$@"
exit $?
