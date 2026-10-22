#!/bin/sh
# Starts Prometheus: builds the real configuration from the template and docker/.env, then runs it.
#   ACTUATOR_USER      account of /actuator/prometheus (default: actuator)
#   ACTUATOR_PASSWORD  its password, written to a file (never into the config); empty = the app's metrics stay closed
#   MANAGEMENT_PORT    the application's management port (default: 9001)
#   PROMETHEUS_RETENTION       how long metrics are kept (default: 15d)
#   PROMETHEUS_RETENTION_SIZE  upper limit of the metrics database (default: 5GB): the oldest data goes first, so it can never fill the disk
set -eu

USER_NAME="${ACTUATOR_USER:-actuator}"
PORT="${MANAGEMENT_PORT:-9001}"

# The user name and port go into the config text, so only simple values are accepted.
case "$USER_NAME" in *[!A-Za-z0-9._-]*) echo "ACTUATOR_USER may only contain letters, digits, . _ -" >&2; exit 1;; esac
case "$PORT" in ''|*[!0-9]*) echo "MANAGEMENT_PORT must be a number" >&2; exit 1;; esac

printf '%s' "${ACTUATOR_PASSWORD:-}" > /tmp/actuator_password
sed -e "s/__ACTUATOR_USER__/${USER_NAME}/g" -e "s/__MANAGEMENT_PORT__/${PORT}/g" \
    /etc/prometheus/prometheus.tmpl.yml > /tmp/prometheus.yml

exec /bin/prometheus \
  --config.file=/tmp/prometheus.yml \
  --storage.tsdb.path=/prometheus \
  --storage.tsdb.retention.time="${PROMETHEUS_RETENTION:-15d}" \
  --storage.tsdb.retention.size="${PROMETHEUS_RETENTION_SIZE:-5GB}" \
  --web.enable-lifecycle \
  --web.enable-remote-write-receiver \
  --enable-feature=exemplar-storage
