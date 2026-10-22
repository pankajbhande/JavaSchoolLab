#!/bin/bash
# Start, stop and inspect the three stacks in the RIGHT ORDER with one command.
#
#   bash scripts/stack.sh up [shared|app|monitoring|all]        start (default: all). Order: shared -> app -> monitoring
#   bash scripts/stack.sh down [shared|app|monitoring|all]       remove the containers (data volumes stay). Order: monitoring -> app -> shared
#   bash scripts/stack.sh stop|start|restart [stack]             stop / start / restart without removing
#   bash scripts/stack.sh status                                 what is running and whether it is healthy
#   bash scripts/stack.sh logs <stack> [service]                 follow the logs
#   bash scripts/stack.sh up app --no-build                      start the application without rebuilding its image
#
#   OBSERVABILITY=true in docker/.env switches the monitoring stack ON (Prometheus, Grafana, Loki, Tempo ...). Anything else, or no line at all, means OFF:
#   "up all" then starts only shared + app, removes monitoring containers that are still running (their data volumes are kept) and the application stops
#   exporting traces. Change the value, run "bash scripts/stack.sh up all" again.
#
#   shared      docker-compose.shared.yml       MySQL + Redis + OpenSearch + nightly backup     (data lives here: stop it last, start it first)
#   app         docker-compose.yml              the website + API
#   monitoring  docker-compose.monitoring.yml   Prometheus, Grafana, Loki, Tempo, Alloy, Alertmanager, exporters
#
# "up all" waits until MySQL, Redis and OpenSearch are healthy and the accounts are created before it starts the application, so the
# application never starts against a database that is not ready.
set -uo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROJECT="${STACK_PROJECT:-javaschoollab}"                 # project names: <p>-shared, <p>, <p>-monitoring
APP_EXTRA="${STACK_APP_COMPOSE_EXTRA:-}"                   # an extra compose file for the application (used by tests)
WAIT_SECONDS="${STACK_WAIT_SECONDS:-300}"

CMD="${1:-}"; STACK="${2:-all}"; NOBUILD=0
for a in "$@"; do [ "$a" = "--no-build" ] && NOBUILD=1; done
[ "$STACK" = "--no-build" ] && STACK="all"

log() { echo "[stack] $*"; }

# OBSERVABILITY from the environment or docker/.env: true / 1 / yes / on (any case) = on, everything else = off
env_get() { [ -f "$DIR/.env" ] || return 0; local v; v="$(grep -E "^$1=" "$DIR/.env" | tail -1 | cut -d= -f2-)"; v="${v%\"}"; v="${v#\"}"; v="${v%\'}"; v="${v#\'}"; printf '%s' "$v"; }
observability_on() {
  local v="${OBSERVABILITY:-$(env_get OBSERVABILITY)}"
  case "$(printf '%s' "$v" | tr 'A-Z' 'a-z' | tr -d '[:space:]')" in true|1|yes|on) return 0;; *) return 1;; esac
}
# The application exports traces only when the tracing back end exists. Always derived from OBSERVABILITY, so the two can never disagree.
if observability_on; then export TRACING_EXPORT_ENABLED=true; else export TRACING_EXPORT_ENABLED=false; fi
dc()  { local name="$1" file="$2"; shift 2; docker compose --project-directory "$DIR" -p "$name" -f "$DIR/$file" "$@"; }

shared_dc()     { dc "$PROJECT-shared"     docker-compose.shared.yml "$@"; }
monitoring_dc() { dc "$PROJECT-monitoring" docker-compose.monitoring.yml "$@"; }
app_dc()        {
  if [ -n "$APP_EXTRA" ]; then docker compose --project-directory "$DIR" -p "$PROJECT" -f "$DIR/docker-compose.yml" -f "$DIR/$APP_EXTRA" "$@"
  else dc "$PROJECT" docker-compose.yml "$@"; fi
}

wait_healthy() {   # wait_healthy <container> ...
  local c waited
  for c in "$@"; do
    waited=0
    until [ "$(docker inspect -f '{{.State.Health.Status}}' "$c" 2>/dev/null)" = "healthy" ]; do
      if [ "$waited" -ge "$WAIT_SECONDS" ]; then log "TIMEOUT: $c is not healthy after ${WAIT_SECONDS}s. See: docker logs $c"; return 1; fi
      sleep 4; waited=$((waited + 4))
    done
    log "$c is healthy"
  done
}

wait_db_setup() {
  local waited=0 state
  until state="$(docker inspect -f '{{.State.Status}} {{.State.ExitCode}}' javaschoollab-db-setup 2>/dev/null)" && [ "${state%% *}" = "exited" ]; do
    if [ "$waited" -ge "$WAIT_SECONDS" ]; then log "TIMEOUT: db-setup did not finish. See: docker logs javaschoollab-db-setup"; return 1; fi
    sleep 3; waited=$((waited + 3))
  done
  if [ "${state##* }" != "0" ]; then log "db-setup FAILED: docker logs javaschoollab-db-setup"; return 1; fi
  log "database accounts are ready"
}

up_shared()     { log "starting the shared stack (MySQL, Redis, OpenSearch, backup)"; shared_dc up -d || return 1
                  wait_healthy javaschoollab-db javaschoollab-redis javaschoollab-opensearch && wait_db_setup; }
up_app()        { log "starting the application"; if [ "$NOBUILD" = "1" ]; then app_dc up -d; else app_dc up -d --build; fi || return 1
                  wait_healthy javaschoollab-app; }
up_monitoring() {
                  if ! observability_on; then log "OBSERVABILITY is not true in docker/.env: the monitoring stack is switched off (set OBSERVABILITY=true to use it)"; return 1; fi
                  log "starting the monitoring (Prometheus, Grafana, Loki, Tempo, ...)"; monitoring_dc up -d || return 1; wait_healthy javaschoollab-prometheus javaschoollab-grafana; }

# OBSERVABILITY is off: make sure no monitoring container is left running from the time it was on (volumes with the history stay).
remove_monitoring() {
  if [ -n "$(docker ps -aq --filter "label=com.docker.compose.project=$PROJECT-monitoring" 2>/dev/null)" ]; then
    log "OBSERVABILITY is off: removing the monitoring containers (Prometheus, Grafana ... their data volumes are kept)"
    docker compose -p "$PROJECT-monitoring" down --remove-orphans
  else
    log "OBSERVABILITY is off: the monitoring stack is not started (set OBSERVABILITY=true in docker/.env to use it)"
  fi
}

case "$CMD" in
  up)
    case "$STACK" in
      shared) up_shared ;; app) up_app ;; monitoring) up_monitoring ;;
      all) up_shared && up_app && { if observability_on; then up_monitoring; else remove_monitoring; fi; } ;;
      *) echo "unknown stack '$STACK'" >&2; exit 1 ;;
    esac ;;
  down|stop|start|restart)
    verb="$CMD"
    case "$STACK" in
      shared) shared_dc "$verb" ;; app) app_dc "$verb" ;;
      monitoring)
        if [ "$verb" = "start" ] || [ "$verb" = "restart" ]; then
          observability_on || { log "OBSERVABILITY is not true in docker/.env: the monitoring stack is switched off"; exit 1; }
        fi
        monitoring_dc "$verb" ;;
      all)
        if [ "$verb" = "start" ]; then up_shared && { app_dc start; observability_on && monitoring_dc start; }
        elif [ "$verb" = "restart" ]; then monitoring_dc stop; app_dc stop; shared_dc restart && wait_healthy javaschoollab-db javaschoollab-redis && app_dc start && { observability_on && monitoring_dc start || true; }
        else log "$verb: monitoring, then application, then the shared stack"; monitoring_dc "$verb"; app_dc "$verb"; shared_dc "$verb"; fi ;;
      *) echo "unknown stack '$STACK'" >&2; exit 1 ;;
    esac ;;
  status)
    docker ps -a --filter "label=com.docker.compose.project" --format '{{.Label "com.docker.compose.project"}}\t{{.Names}}\t{{.Status}}' \
      | grep -E "^($PROJECT|$PROJECT-shared|$PROJECT-monitoring)	" | sort | awk -F'\t' '{printf "%-26s %-34s %s\n", $1, $2, $3}'
    echo; echo "volumes:"; docker volume ls --format '  {{.Name}}' | grep -E 'javaschoollab_|jsltest_' | sort ;;
  logs)
    case "$STACK" in
      shared) shared_dc logs -f "${3:-}" ;; app) app_dc logs -f "${3:-}" ;; monitoring) monitoring_dc logs -f "${3:-}" ;;
      *) echo "usage: stack.sh logs <shared|app|monitoring> [service]" >&2; exit 1 ;;
    esac ;;
  *)
    sed -n '2,17p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'; exit 1 ;;
esac
