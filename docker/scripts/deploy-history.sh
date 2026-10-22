#!/bin/bash
# The deployment audit log: WHO deployed WHAT, WHEN, from which commit, how it ended, and what it was rolled back to.
#
#   bash scripts/deploy-history.sh list [N]      the last N deployments (default 20) as a table
#   bash scripts/deploy-history.sh show <id>     everything recorded about one deployment
#   bash scripts/deploy-history.sh init          create the table (done automatically on the first record)
#   bash scripts/deploy-history.sh record        write one entry; reads DH_* variables (deploy.sh and auto-deploy.sh do this for you)
#
# Where it is stored
#   1. MySQL, database  jsl_ops  table  deployments  (in the shared MySQL, but a SEPARATE database from the application's: restoring an application backup
#      during a roll-back never erases the history, and the application's login has no access to it).
#   2. A JSON-lines file  backups/deploy-history/history.jsonl  written FIRST on every record. It is the fallback when MySQL is down, it is
#      copied off the server with the other backups (sync-backups-offsite.sh), and nothing can lose an entry between the two.
#
# What an entry holds: when (UTC) it started and finished, how long it took, the result (SUCCESS, ROLLED_BACK, ROLLBACK_FAILED, FAILED_BEFORE_START, BUILD_FAILED),
# how it was triggered (auto-deploy, jenkins, manual), WHO ("deployed_by": the Linux user, the Jenkins user, or the person whose commit was deployed),
# the Git commit, branch, author and message, the image tag and id, the previous version, the version it was rolled back to, the database schema version
# before and after, the pre-deploy backup file, the host, the Jenkins build address, and a short reason when it failed.
# Values are written through hex literals, so no text (quotes, backslashes ...) can break or inject into the SQL.
set -uo pipefail

DOCKER_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUPS="$(cd "$DOCKER_DIR/.." && pwd)/backups"
HISTORY_DIR="$BACKUPS/deploy-history"
DB_CONTAINER="${DB_CONTAINER:-javaschoollab-db}"
log() { echo "[deploy-history] $*" >&2; }

mysql_exec() {   # SQL on stdin; -t for a boxed table
  docker exec -i "$DB_CONTAINER" sh -c "mysql -uroot -p\"\$MYSQL_ROOT_PASSWORD\" $1 2>/dev/null"
}

DDL="CREATE DATABASE IF NOT EXISTS jsl_ops CHARACTER SET utf8mb4;
CREATE TABLE IF NOT EXISTS jsl_ops.deployments (
  id                    BIGINT AUTO_INCREMENT PRIMARY KEY,
  started_at            DATETIME     NOT NULL COMMENT 'UTC',
  finished_at           DATETIME     NOT NULL COMMENT 'UTC',
  duration_seconds      INT          NOT NULL,
  result                VARCHAR(24)  NOT NULL,
  trigger_source        VARCHAR(20)  NOT NULL,
  deployed_by           VARCHAR(190) NULL,
  commit_sha            VARCHAR(64)  NULL,
  branch                VARCHAR(120) NULL,
  commit_author         VARCHAR(190) NULL,
  commit_author_email   VARCHAR(254) NULL,
  commit_message        VARCHAR(500) NULL,
  image_tag             VARCHAR(100) NOT NULL,
  image_id              VARCHAR(80)  NULL,
  previous_tag          VARCHAR(100) NULL,
  rolled_back_to        VARCHAR(100) NULL,
  schema_version_before INT          NULL,
  schema_version_after  INT          NULL,
  pre_deploy_backup     VARCHAR(500) NULL,
  host_name             VARCHAR(120) NULL,
  build_url             VARCHAR(300) NULL,
  detail                VARCHAR(1000) NULL,
  KEY idx_deployments_started (started_at),
  KEY idx_deployments_result (result)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;"

hex() { printf '%s' "$1" | od -An -tx1 | tr -d ' \n'; }
# a SQL string literal built from hex (NULL for an empty value)
lit() { local h; h="$(hex "$1")"; if [ -z "$h" ]; then echo "NULL"; else echo "CONVERT(0x$h USING utf8mb4)"; fi; }
num() { case "${1:-}" in ''|*[!0-9]*) echo "NULL";; *) echo "$1";; esac; }
json_escape() { printf '%s' "$1" | tr '\n\r\t' '   ' | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g'; }

cmd="${1:-}"
case "$cmd" in
  init)
    printf '%s\n' "$DDL" | mysql_exec "" || { log "cannot reach MySQL ($DB_CONTAINER)"; exit 1; }
    echo "ready: jsl_ops.deployments" ;;

  record)
    started="${DH_STARTED_EPOCH:-$(date +%s)}"; finished="${DH_FINISHED_EPOCH:-$(date +%s)}"
    s_txt="$(date -u -d "@$started" '+%F %T' 2>/dev/null || date -u '+%F %T')"; f_txt="$(date -u -d "@$finished" '+%F %T' 2>/dev/null || date -u '+%F %T')"
    dur=$(( finished - started )); [ "$dur" -lt 0 ] && dur=0
    result="${DH_RESULT:-UNKNOWN}"; trig="${DH_TRIGGER:-manual}"; by="${DH_DEPLOYED_BY:-$(id -un 2>/dev/null)}"
    host="${DH_HOST:-$(hostname 2>/dev/null)}"
    msg="${DH_COMMIT_MESSAGE:-}"; detail="${DH_DETAIL:-}"

    # 1. the file first (always works)
    mkdir -p "$HISTORY_DIR"
    {
      printf '{"started_at":"%s","finished_at":"%s","duration_seconds":%s,"result":"%s","trigger":"%s","deployed_by":"%s",' \
        "$s_txt" "$f_txt" "$dur" "$(json_escape "$result")" "$(json_escape "$trig")" "$(json_escape "$by")"
      printf '"commit":"%s","branch":"%s","commit_author":"%s","commit_author_email":"%s","commit_message":"%s",' \
        "$(json_escape "${DH_COMMIT:-}")" "$(json_escape "${DH_BRANCH:-}")" "$(json_escape "${DH_COMMIT_AUTHOR:-}")" "$(json_escape "${DH_COMMIT_EMAIL:-}")" "$(json_escape "$msg")"
      printf '"image_tag":"%s","image_id":"%s","previous_tag":"%s","rolled_back_to":"%s","schema_before":"%s","schema_after":"%s",' \
        "$(json_escape "${DH_IMAGE_TAG:-}")" "$(json_escape "${DH_IMAGE_ID:-}")" "$(json_escape "${DH_PREVIOUS_TAG:-}")" "$(json_escape "${DH_ROLLED_BACK_TO:-}")" "${DH_SCHEMA_BEFORE:-}" "${DH_SCHEMA_AFTER:-}"
      printf '"pre_deploy_backup":"%s","host":"%s","build_url":"%s","detail":"%s"}\n' \
        "$(json_escape "${DH_BACKUP:-}")" "$(json_escape "$host")" "$(json_escape "${DH_BUILD_URL:-}")" "$(json_escape "$detail")"
    } >> "$HISTORY_DIR/history.jsonl"
    chmod 600 "$HISTORY_DIR/history.jsonl" 2>/dev/null || true

    # 2. MySQL (best effort: the file above is the safety net)
    sql="$DDL
INSERT INTO jsl_ops.deployments (started_at, finished_at, duration_seconds, result, trigger_source, deployed_by, commit_sha, branch, commit_author,
  commit_author_email, commit_message, image_tag, image_id, previous_tag, rolled_back_to, schema_version_before, schema_version_after,
  pre_deploy_backup, host_name, build_url, detail)
VALUES ('$s_txt', '$f_txt', $dur, $(lit "$result"), $(lit "$trig"), $(lit "$by"), $(lit "${DH_COMMIT:-}"), $(lit "${DH_BRANCH:-}"), $(lit "${DH_COMMIT_AUTHOR:-}"),
  $(lit "${DH_COMMIT_EMAIL:-}"), $(lit "${msg:0:500}"), $(lit "${DH_IMAGE_TAG:-unknown}"), $(lit "${DH_IMAGE_ID:-}"), $(lit "${DH_PREVIOUS_TAG:-}"), $(lit "${DH_ROLLED_BACK_TO:-}"),
  $(num "${DH_SCHEMA_BEFORE:-}"), $(num "${DH_SCHEMA_AFTER:-}"), $(lit "${DH_BACKUP:-}"), $(lit "$host"), $(lit "${DH_BUILD_URL:-}"), $(lit "${detail:0:1000}"));"
    if printf '%s\n' "$sql" | mysql_exec ""; then
      echo "[deploy-history] recorded: $result by $by ($trig), image ${DH_IMAGE_TAG:-?}" >&2
    else
      log "MySQL was not reachable: the entry is only in $HISTORY_DIR/history.jsonl"
    fi ;;

  list)
    n="${2:-20}"; case "$n" in ''|*[!0-9]*) n=20;; esac
    echo "SELECT id, started_at AS started_utc_, SEC_TO_TIME(duration_seconds) AS took, result, trigger_source AS trigger_, deployed_by, LEFT(commit_sha,7) AS commit_,
      image_tag, rolled_back_to AS back_to, LEFT(commit_message,40) AS message FROM jsl_ops.deployments ORDER BY id DESC LIMIT $n;" | mysql_exec "-t" \
      || { log "cannot read MySQL; the plain file is $HISTORY_DIR/history.jsonl"; exit 1; } ;;

  show)
    id="${2:-}"; case "$id" in ''|*[!0-9]*) echo "usage: $0 show <id>" >&2; exit 1;; esac
    echo "SELECT * FROM jsl_ops.deployments WHERE id = $id\\G" | mysql_exec "" || exit 1 ;;

  *)
    sed -n '2,10p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'; exit 1 ;;
esac
