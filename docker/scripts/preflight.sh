#!/bin/bash
# Go-live check: reads docker/.env (and, on a Linux server, the server itself) and tells you what is still missing before real users arrive.
#
#   bash scripts/preflight.sh                 check docker/.env and, on Linux, the server settings and the DNS names
#   bash scripts/preflight.sh --dkim-selector google     also look for the DKIM record  <selector>._domainkey.<your mail domain>
#   bash scripts/preflight.sh --file /path/.env           check another file
#
# Output per line:  PASS   fine
#                   WARN   works, but you should fix it
#                   FAIL   will not work correctly in production (exit code 1)
#                   TODO   a thing only a person can do or confirm (an outside account, a legal review)
# Secret values are NEVER printed, only whether they are present and strong enough.
set -uo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FILE="$DIR/.env"; DKIM=""
while [ $# -gt 0 ]; do
  case "$1" in
    --file) FILE="$2"; shift 2;;
    --dkim-selector) DKIM="$2"; shift 2;;
    *) echo "unknown option $1" >&2; exit 1;;
  esac
done

PASS=0; WARN=0; FAIL=0; TODO=0
pass() { PASS=$((PASS + 1)); printf '  PASS  %s\n' "$*"; }
warn() { WARN=$((WARN + 1)); printf '  WARN  %s\n' "$*"; }
fail() { FAIL=$((FAIL + 1)); printf '  FAIL  %s\n' "$*"; }
todo() { TODO=$((TODO + 1)); printf '  TODO  %s\n' "$*"; }
section() { printf '\n%s\n' "$*"; }

[ -f "$FILE" ] || { echo "FAIL  $FILE does not exist: copy your docker/.env to the server (it is not in Git)"; exit 1; }
val() { local v; v="$(grep -E "^$1=" "$FILE" | tail -1 | cut -d= -f2-)"; v="${v%\"}"; v="${v#\"}"; v="${v%\'}"; v="${v#\'}"; printf '%s' "$v"; }
lower() { printf '%s' "$1" | tr 'A-Z' 'a-z'; }
is_true() { case "$(lower "$1")" in true|1|yes|on) return 0;; *) return 1;; esac; }
host_of() { printf '%s' "$1" | sed -E 's#^[a-z]+://##; s#[/:].*$##'; }

section "1. Secrets (docker/.env)"
for k in DB_ROOT_PASSWORD DB_PASSWORD REDIS_PASSWORD ACTUATOR_PASSWORD; do
  v="$(val $k)"
  if [ -z "$v" ]; then fail "$k is empty (bash scripts/generate-secrets.sh fills it)"
  elif [ "${#v}" -lt 16 ]; then warn "$k is shorter than 16 characters"
  else pass "$k is set (${#v} characters)"; fi
done
v="$(val JWT_SECRET)"
if [ -z "$v" ]; then fail "JWT_SECRET is empty"; elif [ "${#v}" -lt 32 ]; then fail "JWT_SECRET is shorter than 32 characters (the application will not start)"; else pass "JWT_SECRET is set (${#v} characters)"; fi
if is_true "$(val OBSERVABILITY)"; then
  for k in GRAFANA_ADMIN_PASSWORD EXPORTER_PASSWORD; do
    v="$(val $k)"; if [ -z "$v" ]; then fail "$k is empty but OBSERVABILITY=true needs it"; elif [ "${#v}" -lt 16 ]; then warn "$k is shorter than 16 characters"; else pass "$k is set"; fi
  done
fi
if [ -n "$(val DB_ROOT_PASSWORD_PREVIOUS)" ]; then
  if [ "$(val DB_ROOT_PASSWORD_PREVIOUS)" = "$(val DB_ROOT_PASSWORD)" ]; then warn "DB_ROOT_PASSWORD_PREVIOUS equals DB_ROOT_PASSWORD: the root password was not actually changed"
  else todo "DB_ROOT_PASSWORD_PREVIOUS is set: after the next 'stack.sh up shared' has changed the root password, delete that line from .env"; fi
fi
mode="$(stat -c '%a' "$FILE" 2>/dev/null || echo '')"
if [ -n "$mode" ]; then if [ "$mode" = "600" ] || [ "$mode" = "400" ]; then pass ".env permissions are $mode"; else warn ".env permissions are $mode: chmod 600 $FILE"; fi; fi
todo "Passwords that were ever typed in a chat, ticket or screenshot must not be used in production: run  bash scripts/generate-secrets.sh --rotate  once on the server"

section "2. Addresses and web security"
[ "$(val SPRING_PROFILES_ACTIVE)" = "prod" ] && pass "SPRING_PROFILES_ACTIVE=prod" || fail "SPRING_PROFILES_ACTIVE must be prod"
v="$(val CORS_ORIGIN)"
case "$v" in
  '') fail "CORS_ORIGIN is empty (the application refuses to start in production without it)";;
  *https://*) if printf '%s' "$v" | grep -q 'localhost'; then warn "CORS_ORIGIN contains localhost: not for a server"; else pass "CORS_ORIGIN lists the https address$(printf '%s' "$v" | grep -q 'http://' && echo ' (and its http twin, which nginx redirects to https)')"; fi;;
  *) warn "CORS_ORIGIN has no https:// address";;
esac
v="$(val SITE_URL)"
case "$v" in
  '') fail "SITE_URL is empty";;
  https://*localhost*|http://*) warn "SITE_URL=$v should be the public https:// address";;
  https://*) pass "SITE_URL is https";;
  *) warn "SITE_URL should start with https://";;
esac
[ "$(val WEB_BIND_ADDRESS)" = "127.0.0.1" ] || [ -z "$(val WEB_BIND_ADDRESS)" ] && pass "the website port is bound to 127.0.0.1 (only nginx can reach it)" || fail "WEB_BIND_ADDRESS=$(val WEB_BIND_ADDRESS): Docker bypasses the firewall, only 127.0.0.1 is safe behind nginx"
[ "$(val FORWARD_HEADERS_STRATEGY)" = "native" ] && pass "FORWARD_HEADERS_STRATEGY=native (real visitor addresses for the rate limits)" || warn "FORWARD_HEADERS_STRATEGY should be native behind nginx"
case "$(lower "$(val CSP_MODE)")" in
  enforce) pass "CSP_MODE=enforce";;
  *) warn "CSP_MODE=$(val CSP_MODE): open the site with the browser console open (ads, Google sign-in); if there is no \"[Report Only]\" message, set CSP_MODE=enforce";;
esac
if is_true "$(val OBSERVABILITY)"; then
  pass "OBSERVABILITY=true"
  case "$(val GRAFANA_ROOT_URL)" in https://*) pass "GRAFANA_ROOT_URL is https";; *) warn "GRAFANA_ROOT_URL should be the https address of Grafana";; esac
else
  pass "OBSERVABILITY is off (no monitoring stack, saves 1 to 2 GB RAM)"
fi

if [ "$(val DB_PUBLISH_PORT)" != "3306" ] && [ -n "$(val DB_PUBLISH_PORT)" ]; then
  warn "DB_PUBLISH_PORT=$(val DB_PUBLISH_PORT) is the setting for a PC; on the server the standard MySQL port is 3306"
else
  pass "MySQL is published on the standard port 3306 (127.0.0.1 only)"
fi

section "3. E-mail (sign-up codes and alerts)"
if [ -n "$(val SMTP_HOST)" ] && [ -n "$(val SMTP_USER)" ] && [ -n "$(val SMTP_PASS)" ]; then pass "SMTP is configured ($(val SMTP_HOST))"; else fail "SMTP_HOST / SMTP_USER / SMTP_PASS are not all set: in production nobody can sign up (the code cannot be e-mailed)"; fi
if is_true "$(val OBSERVABILITY)"; then
  if [ -n "$(val ALERT_EMAIL_TO)" ]; then pass "ALERT_EMAIL_TO is set: alerts reach a person"; else warn "ALERT_EMAIL_TO is empty: alerts fire in Alertmanager but nobody is told"; fi
fi

section "4. Backups"
if [ -n "$(val BACKUP_REMOTE)" ]; then pass "BACKUP_REMOTE is set: backups are copied off this server"; else warn "BACKUP_REMOTE is empty: the only backups are on this server and are lost with it (see scripts/sync-backups-offsite.sh)"; fi
if [ -n "$(val BACKUP_ENCRYPT_PASSFILE)" ]; then pass "configuration backups are encrypted"; else warn "BACKUP_ENCRYPT_PASSFILE is empty: the configuration backup contains .env in plain text"; fi
todo "Restore drill: once a month restore the newest database backup into a scratch database (bash scripts/restore-db.sh <file> restore_check) and look at the row counts"

section "5. Legal and ads"
if [ -n "$(val VITE_CONTACT_EMAIL)" ]; then pass "a contact address is printed on the Privacy Policy and Terms"; else warn "VITE_CONTACT_EMAIL is empty: add the address people can write to about privacy"; fi
if [ -n "$(val VITE_ADSENSE_CLIENT)" ]; then pass "ads are configured; visitors are asked first (cookie banner) and nothing loads before they say yes"; else pass "no ads configured: no advertising cookies, no banner"; fi
todo "Have the Privacy Policy and Terms (/privacy, /terms) read by someone who knows the law in your country"

section "6. The server (only checked on Linux)"
if [ "$(uname -s)" = "Linux" ]; then
  m="$(sysctl -n vm.max_map_count 2>/dev/null || echo 0)"; [ "${m:-0}" -ge 262144 ] && pass "vm.max_map_count=$m (OpenSearch)" || fail "vm.max_map_count=$m, OpenSearch needs 262144: sudo bash scripts/server-setup-ubuntu.sh base"
  if command -v ufw >/dev/null 2>&1; then ufw status 2>/dev/null | grep -q "Status: active" && pass "firewall (ufw) is active" || warn "ufw is not active (run server-setup-ubuntu.sh base)"; fi
  [ -f /etc/docker/daemon.json ] && grep -q max-size /etc/docker/daemon.json && pass "Docker log rotation is configured" || warn "no log rotation in /etc/docker/daemon.json (container logs can fill the disk)"
  if [ -n "$(swapon --show --noheadings 2>/dev/null)" ]; then pass "swap is on"; else warn "no swap: an image build on a small server can run out of memory"; fi
  free_gb="$(df -BG / 2>/dev/null | awk 'NR==2 {gsub("G","",$4); print $4}')"; [ "${free_gb:-0}" -ge 20 ] && pass "free disk space: ${free_gb} GB" || warn "free disk space is only ${free_gb:-?} GB"
  total_mb="$(awk '/MemTotal/ {print int($2/1024)}' /proc/meminfo 2>/dev/null)"; [ "${total_mb:-0}" -ge 7000 ] && pass "RAM: ${total_mb} MB" || warn "RAM is ${total_mb:-?} MB: 8 GB is comfortable with monitoring and builds"
  for t in "fail2ban-client:fail2ban" "nginx:nginx" "certbot:certbot"; do command -v "${t%%:*}" >/dev/null 2>&1 && pass "${t##*:} is installed" || warn "${t##*:} is not installed (server-setup-ubuntu.sh base)"; done
else
  echo "  (skipped: this is not a Linux server)"
fi

section "7. DNS (needs the 'dig' tool)"
if command -v dig >/dev/null 2>&1; then
  site="$(host_of "$(val SITE_URL)")"
  if [ -n "$site" ]; then
    ip="$(dig +short A "$site" 2>/dev/null | head -1)"; [ -n "$ip" ] && pass "$site resolves to $ip" || fail "$site has no A record yet"
  fi
  if is_true "$(val OBSERVABILITY)"; then
    g="$(host_of "$(val GRAFANA_ROOT_URL)")"; if [ -n "$g" ]; then [ -n "$(dig +short A "$g" 2>/dev/null | head -1)" ] && pass "$g resolves" || warn "$g has no A record"; fi
  fi
  from="$(val SMTP_FROM)"; maildom="$(printf '%s' "$from" | sed -nE 's/.*@([A-Za-z0-9.-]+).*/\1/p')"; [ -n "$maildom" ] || maildom="$(printf '%s' "$(val SMTP_USER)" | sed -nE 's/.*@([A-Za-z0-9.-]+).*/\1/p')"
  if [ -n "$maildom" ]; then
    dig +short TXT "$maildom" 2>/dev/null | grep -qi "v=spf1" && pass "SPF record found for $maildom" || warn "no SPF record (a TXT record starting v=spf1) for $maildom: sign-up e-mails may land in spam"
    dig +short TXT "_dmarc.$maildom" 2>/dev/null | grep -qi "v=DMARC1" && pass "DMARC record found for $maildom" || warn "no DMARC record (_dmarc.$maildom) for $maildom"
    if [ -n "$DKIM" ]; then dig +short TXT "$DKIM._domainkey.$maildom" 2>/dev/null | grep -q . && pass "DKIM record found ($DKIM)" || warn "no DKIM record at $DKIM._domainkey.$maildom"
    else todo "DKIM: ask your mail provider for the selector, then re-run with  --dkim-selector <name>"; fi
  else
    warn "no e-mail domain found in SMTP_FROM / SMTP_USER, so SPF / DKIM / DMARC were not checked"
  fi
else
  echo "  (skipped: install dig, e.g.  sudo apt install dnsutils)"
fi

section "8. Things only a person can set up"
todo "An outside uptime monitor (UptimeRobot, Better Stack ...) on the website address: the monitoring on this server cannot report its own server being down"
todo "Pull-request rules in GitHub: require the CI checks before merging into the deployment branch"
todo "node-server/.env and backend/.project in the project folder are old leftovers: delete them if you no longer need them (see docs/issues-and-resolutions.md)"

printf '\nResult: %s passed, %s warnings, %s failures, %s to-do items\n' "$PASS" "$WARN" "$FAIL" "$TODO"
[ "$FAIL" = "0" ]
