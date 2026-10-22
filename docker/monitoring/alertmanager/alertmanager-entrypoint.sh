#!/bin/sh
# Starts Alertmanager: writes its configuration from docker/.env, then runs it.
#
# Always: alerts are grouped, de-duplicated, and a "critical" alert silences the "warning" of the same name. They appear in
# Alertmanager (http://127.0.0.1:9093) and in the Grafana "Alerts and SLO" dashboard.
#
# Optional e-mail: set ALERT_EMAIL_TO (and SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS) in .env and every alert is also mailed.
# Port 465 uses SSL from the first byte (Hostinger); port 587 uses STARTTLS. Leave ALERT_EMAIL_TO empty to turn mail off.
set -eu

CFG=/tmp/alertmanager.yml
printf '%s' "${SMTP_PASS:-}" > /tmp/smtp_password

cat > "$CFG" <<'EOF'
route:
  receiver: default
  group_by: [alertname, severity]
  group_wait: 30s          # collect related alerts for 30 s before the first notification
  group_interval: 5m       # then send updates about the group at most every 5 minutes
  repeat_interval: 4h      # remind about a still-firing alert every 4 hours
  routes:
    - matchers: [severity="critical"]
      receiver: default
      repeat_interval: 1h
inhibit_rules:
  # While the critical version of an alert fires, hide the warning of the same alert on the same target.
  - source_matchers: [severity="critical"]
    target_matchers: [severity="warning"]
    equal: [alertname, instance]
EOF

if [ -n "${ALERT_EMAIL_TO:-}" ]; then
  SMTP_USER_NAME="${SMTP_USER:?SMTP_USER is required when ALERT_EMAIL_TO is set}"
  SMTP_HOST_NAME="${SMTP_HOST:?SMTP_HOST is required when ALERT_EMAIL_TO is set}"
  SMTP_PORT_NUMBER="${SMTP_PORT:-465}"
  cat >> "$CFG" <<EOF
receivers:
  - name: default
    email_configs:
      - to: "${ALERT_EMAIL_TO}"
        from: "${SMTP_USER_NAME}"
        smarthost: "${SMTP_HOST_NAME}:${SMTP_PORT_NUMBER}"
        auth_username: "${SMTP_USER_NAME}"
        auth_password_file: /tmp/smtp_password
        send_resolved: true
EOF
  echo "[alertmanager] e-mail notifications to ${ALERT_EMAIL_TO} via ${SMTP_HOST_NAME}:${SMTP_PORT_NUMBER}"
else
  cat >> "$CFG" <<'EOF'
receivers:
  - name: default
EOF
  echo "[alertmanager] no ALERT_EMAIL_TO set: alerts are only shown in Alertmanager and Grafana"
fi

exec /bin/alertmanager \
  --config.file="$CFG" \
  --storage.path=/alertmanager \
  --web.external-url="${ALERTMANAGER_EXTERNAL_URL:-http://localhost:9093}"
