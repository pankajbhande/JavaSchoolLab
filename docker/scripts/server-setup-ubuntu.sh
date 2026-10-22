#!/bin/bash
# Prepares a fresh Ubuntu 22.04 / 24.04 VPS to run JavaSchoolLab with Docker, in two steps.
#
#   sudo bash scripts/server-setup-ubuntu.sh base
#       The server itself: system updates, Docker Engine + Compose, Docker log rotation, the kernel setting OpenSearch needs, a firewall
#       that only lets SSH / HTTP / HTTPS in, fail2ban against SSH password guessing, automatic security updates, time zone + clock sync,
#       a swap file on small servers, nginx and certbot.
#
#   sudo bash scripts/server-setup-ubuntu.sh nginx --domain javaschoollab.dhipansoft.in --grafana-domain grafana.dhipansoft.in --email you@dhipansoft.in
#       The web front: installs the nginx site from docker/nginx/javaschoollab.conf.example for your two names, gets ONE free Let's Encrypt
#       certificate for both, and switches HTTPS on. Do this AFTER the DNS records for both names point to this server's IP address.
#
# Safe to run again (every step checks what is already done). It does NOT start the application: after "base" follow help.txt
# ("PUTTING IT ON A SERVER"): clone the project, create docker/.env, then  bash scripts/stack.sh up all.
#
# Environment you may set:  SSH_PORT (default 22)   TZ_NAME (default Asia/Kolkata)   SWAP_GB (default 2; 0 = no swap)
set -euo pipefail

[ "$(id -u)" = "0" ] || { echo "Run this with sudo." >&2; exit 1; }
. /etc/os-release
case "${ID:-}" in ubuntu) ;; *) echo "This script is for Ubuntu (found: ${PRETTY_NAME:-unknown})." >&2; exit 1;; esac

SSH_PORT="${SSH_PORT:-22}"
TZ_NAME="${TZ_NAME:-Asia/Kolkata}"
SWAP_GB="${SWAP_GB:-2}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOCKER_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
DEPLOY_USER="${SUDO_USER:-root}"
export DEBIAN_FRONTEND=noninteractive

say() { echo; echo "==> $*"; }

# ======================================================================================================================================
base() {
  say "1/10 system update"
  apt-get update -y
  apt-get upgrade -y

  say "2/10 base packages"
  apt-get install -y ca-certificates curl gnupg ufw fail2ban nginx certbot unattended-upgrades rsync git openssl

  say "3/10 Docker Engine + Compose plugin (official Docker repository)"
  if ! command -v docker >/dev/null 2>&1 || ! docker compose version >/dev/null 2>&1; then
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
    chmod a+r /etc/apt/keyrings/docker.asc
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu ${VERSION_CODENAME} stable" \
      > /etc/apt/sources.list.d/docker.list
    apt-get update -y
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  else
    echo "   Docker is already installed: $(docker --version)"
  fi
  systemctl enable --now docker

  say "4/10 Docker: rotate container logs (10 MB x 3 per container) and keep containers running while Docker restarts"
  if [ ! -f /etc/docker/daemon.json ]; then
    mkdir -p /etc/docker
    cat > /etc/docker/daemon.json <<'JSON'
{
  "log-driver": "json-file",
  "log-opts": { "max-size": "10m", "max-file": "3" },
  "live-restore": true
}
JSON
    systemctl restart docker
    echo "   written /etc/docker/daemon.json"
  else
    echo "   /etc/docker/daemon.json already exists: left as it is. Make sure it has log-opts max-size / max-file (every compose file here also sets them per container)."
  fi
  if [ "$DEPLOY_USER" != "root" ]; then
    usermod -aG docker "$DEPLOY_USER" && echo "   user '$DEPLOY_USER' added to the docker group (log out and in again to use docker without sudo)"
  fi

  say "5/10 kernel setting for OpenSearch (vm.max_map_count)"
  echo "vm.max_map_count=262144" > /etc/sysctl.d/99-javaschoollab.conf
  sysctl --system >/dev/null
  echo "   vm.max_map_count = $(sysctl -n vm.max_map_count)"

  say "6/10 firewall: only SSH ($SSH_PORT), HTTP (80) and HTTPS (443) from outside"
  ufw default deny incoming
  ufw default allow outgoing
  ufw allow "$SSH_PORT/tcp" comment 'SSH'
  ufw allow 80/tcp  comment 'HTTP'
  ufw allow 443/tcp comment 'HTTPS'
  ufw --force enable
  echo "   NOTE: Docker publishes ports by itself, past ufw. That is why every port of this project is bound to 127.0.0.1 (only nginx is public)."
  echo "         Never change a published port to 0.0.0.0 in the compose files / .env."

  say "7/10 fail2ban: ban addresses that guess SSH passwords"
  cat > /etc/fail2ban/jail.d/javaschoollab.local <<EOF
[sshd]
enabled  = true
port     = $SSH_PORT
maxretry = 5
findtime = 10m
bantime  = 1h
EOF
  systemctl enable --now fail2ban
  systemctl restart fail2ban

  say "8/10 automatic security updates"
  cat > /etc/apt/apt.conf.d/20auto-upgrades <<'EOF'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
EOF
  systemctl enable --now unattended-upgrades 2>/dev/null || true

  say "9/10 time zone ($TZ_NAME) and clock synchronisation"
  timedatectl set-timezone "$TZ_NAME"
  timedatectl set-ntp true || true
  timedatectl | sed 's/^/   /'

  say "10/10 swap file (a safety net on small servers)"
  if [ "$SWAP_GB" != "0" ] && [ -z "$(swapon --show --noheadings)" ]; then
    fallocate -l "${SWAP_GB}G" /swapfile && chmod 600 /swapfile && mkswap /swapfile >/dev/null && swapon /swapfile
    grep -q '^/swapfile ' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
    echo "   created a ${SWAP_GB} GB swap file"
  else
    echo "   swap already present or disabled (SWAP_GB=$SWAP_GB)"
  fi

  say "Done. Memory: $(free -h | awk '/Mem:/ {print $2" total, "$7" available"}')   Disk: $(df -h / | awk 'NR==2 {print $2" total, "$4" free"}')"
  cat <<EOF

Next:
  1. Point the DNS records of your application name and your dashboards name to this server's IP address.
  2. As user '$DEPLOY_USER' (log in again first so the docker group applies):
       git clone <your repository> && cd <project>/app/docker
       (copy your docker/.env here with scp, then chmod 600 .env; edit SITE_URL, CORS_ORIGIN, GRAFANA_ROOT_URL ...)
       docker volume create javaschoollab_db_data
       bash scripts/stack.sh up all
  3. sudo bash scripts/install-backup-schedule.sh
  4. sudo bash scripts/server-setup-ubuntu.sh nginx --domain <app name> --grafana-domain <dashboards name> --email <you>
EOF
}

# ======================================================================================================================================
web() {
  local domain="" gdomain="" jdomain="" email="" force=0
  while [ $# -gt 0 ]; do
    case "$1" in
      --domain) domain="$2"; shift 2;;
      --grafana-domain) gdomain="$2"; shift 2;;
      --jenkins-domain) jdomain="$2"; shift 2;;
      --email) email="$2"; shift 2;;
      --force) force=1; shift;;
      *) echo "unknown option $1" >&2; exit 1;;
    esac
  done
  [ -n "$domain" ] && [ -n "$gdomain" ] && [ -n "$email" ] || { echo "usage: $0 nginx --domain <app name> --grafana-domain <dashboards name> [--jenkins-domain <jenkins name>] --email <address> [--force]" >&2; exit 1; }
  case "$domain$gdomain$jdomain" in *[!A-Za-z0-9.-]*) echo "domain names may only contain letters, digits, dots and hyphens" >&2; exit 1;; esac
  local example="$DOCKER_DIR/nginx/javaschoollab.conf.example"
  [ -f "$example" ] || { echo "missing $example" >&2; exit 1; }

  # A server that already has nginx sites for these names (for example from an earlier install, or made by certbot --nginx) keeps them:
  # a second site with the same server_name would make nginx ignore one of them. Add only the missing names by hand instead (docs/auto-deploy.md,
  # "Existing nginx"), or run again with --force to replace those files.
  if [ "$force" != "1" ]; then
    local name file clash="" ngx="${NGINX_DIR:-/etc/nginx}"
    for file in $(grep -rlF "server_name" "$ngx/sites-enabled" "$ngx/conf.d" 2>/dev/null); do
      case "$file" in "$ngx/conf.d/javaschoollab.conf"|"$ngx/conf.d/jenkins.conf") continue;; esac      # the two files this script writes itself
      for name in $domain $gdomain $jdomain; do
        if grep -E "^[[:space:]]*server_name[^;]*[[:space:]]${name//./\\.}[[:space:];]" "$file" >/dev/null 2>&1; then clash="$clash $file"; break; fi
      done
    done
    if [ -n "${clash// /}" ]; then
      echo "nginx already has a site for one of these names in:$clash" >&2
      echo "Nothing was changed. Keep that file and add the missing names to it (see docs/auto-deploy.md, 'Existing nginx'), or add --force to replace it." >&2
      exit 1
    fi
  fi

  say "1/4 nginx: HTTP-only site first (it answers the certificate challenge)"
  mkdir -p /var/www/certbot
  cat > /etc/nginx/conf.d/javaschoollab.conf <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name $domain $gdomain $jdomain;
    location /.well-known/acme-challenge/ { root /var/www/certbot; }
    location / { return 404; }
}
EOF
  rm -f /etc/nginx/sites-enabled/default
  nginx -t
  systemctl enable --now nginx
  systemctl reload nginx

  say "2/4 one Let's Encrypt certificate for $domain, $gdomain ${jdomain:+and $jdomain}"
  local names=(-d "$domain" -d "$gdomain"); [ -n "$jdomain" ] && names+=(-d "$jdomain")
  certbot certonly --webroot -w /var/www/certbot --cert-name "$domain" "${names[@]}" --expand \
    --email "$email" --agree-tos --no-eff-email --non-interactive

  say "3/4 the full nginx site (HTTPS, reverse proxy, rate limit on sign-in)"
  sed -e "s/grafana\.example\.com/$gdomain/g" -e "s/example\.com/$domain/g" "$example" > /etc/nginx/conf.d/javaschoollab.conf
  if [ -n "$jdomain" ]; then
    sed -e "s/jenkins\.dhipansoft\.in/$jdomain/g" -e "s#/live/javaschoollab\.dhipansoft\.in/#/live/$domain/#g" "$DOCKER_DIR/nginx/jenkins.conf.example" > /etc/nginx/conf.d/jenkins.conf
  else
    rm -f /etc/nginx/conf.d/jenkins.conf
  fi
  nginx -t
  systemctl reload nginx

  say "4/4 certificate renewal"
  systemctl list-timers --no-pager 2>/dev/null | grep -i certbot || echo "   (certbot's renewal timer is installed by the package; test it with: sudo certbot renew --dry-run)"
  cat <<EOF

Done. Check:   curl -I https://$domain          curl -I https://$gdomain${jdomain:+          curl -I https://$jdomain}
Make sure docker/.env says:
   CORS_ORIGIN=http://$domain,https://$domain
   SITE_URL=https://$domain
   GRAFANA_ROOT_URL=https://$gdomain
then:  bash scripts/stack.sh up app     and     bash scripts/stack.sh up monitoring
EOF
}

case "${1:-}" in
  base)  base ;;
  nginx) shift; web "$@" ;;
  *) sed -n '2,19p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'; exit 1 ;;
esac
