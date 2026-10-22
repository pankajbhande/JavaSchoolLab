# Deploy on merge, without Jenkins (until Jenkins / Argo CD take over)

When a commit lands on the **deployment branch** of your Git repository (a merged pull request), the server builds it, runs it as Docker, checks it is healthy, and
**rolls back by itself** if it is not. No CI server is needed: a systemd timer on the VPS looks at Git every 2 minutes.

```
you merge a PR into master
        |   (within ~2 minutes)
        v
systemd timer -> docker/scripts/auto-deploy.sh      git fetch; new commit? -> build the image
        |
        v
docker/scripts/deploy.sh <tag>      backup the database -> start the new image -> health checks
        |                                          |
        | healthy                                  | not healthy
        v                                          v
 tagged "latest", image backup saved        ROLL BACK to the previous image (from Docker, or from the image backup)
 metric jsl_deploy_last_run_success=1       metric = 0 -> alert AutoDeployFailed, webhook message, the failed commit is not retried
```

## Why a pull timer and not a push (webhook / SSH from GitHub)

The server only makes an outgoing, read-only connection to Git. Nothing from the internet connects into the server and no server SSH key is stored at GitHub.
It works with any Git host, and it is the same "pull" idea that Argo CD uses, so moving to Argo CD later changes little in how you think about it.

## Your repository

The project is already a Git repository (`app/` is the root; `origin` = `github.com/pankajbhande/javaschoollab`, branch `master`). What goes where:

- Work on feature branches, open a pull request, merge into the **deployment branch** (`master` today; `main` or `production` if you rename it).
- In GitHub: *Settings > Branches > Branch protection*: require a pull request and the status checks of `.github/workflows/ci.yml` (tests, build) before merging. This is what keeps broken code from being merged, so the server's health check is the **second** line of defence, not the first.
- Never commit `docker/.env` (it is git-ignored). The server keeps its own copy.

## One-time set-up on the server (Ubuntu)

1. Prepare the server: `sudo bash docker/scripts/server-setup-ubuntu.sh base` (Docker, firewall, nginx ...), see `docker/help.txt`.
2. Give the server **read-only** access to the repository (a deploy key):
   ```
   ssh-keygen -t ed25519 -N "" -f ~/.ssh/jsl_deploy          # as the user that will run the deploys (in the docker group)
   cat ~/.ssh/jsl_deploy.pub                                 # GitHub: repository > Settings > Deploy keys > Add (leave "Allow write access" OFF)
   ```
3. Clone the repository and create the private settings:
   ```
   sudo mkdir -p /opt/javaschoollab && sudo chown $USER /opt/javaschoollab
   GIT_SSH_COMMAND="ssh -i ~/.ssh/jsl_deploy -o IdentitiesOnly=yes" git clone git@github.com:pankajbhande/javaschoollab.git /opt/javaschoollab
   # copy the ONE settings file from your PC (it is not in Git):  scp docker/.env user@server:/opt/javaschoollab/docker/.env   then   chmod 600 docker/.env
   docker volume create javaschoollab_db_data
   ```
4. Start the application once by hand, so you see it work: `bash scripts/stack.sh up all` (from `docker/`).
5. Switch on the automatic deploys:
   ```
   cd /opt/javaschoollab
   sudo bash docker/scripts/install-auto-deploy.sh --branch master --key /home/$USER/.ssh/jsl_deploy --seed
   ```
   `--seed` says "the version that is checked out now is already running", so nothing is rebuilt until the next real merge. Optional: `--notify-url <Slack/Discord/Teams webhook>`, `--interval 5min`, `--user deploy`.
6. Check: `bash docker/scripts/auto-deploy.sh --status` and `systemctl list-timers javaschoollab-auto-deploy`. Logs: `journalctl -u javaschoollab-auto-deploy -n 100`.

## Existing nginx (the server already serves other sites)

`server-setup-ubuntu.sh nginx ...` is for a server with no site for these names. If nginx already has one (for example a site made earlier with `certbot --nginx`),
the script stops and changes nothing; use `--force` only if you want it to replace those files. The working way on a server like yours:

- **The application name** already proxies to `127.0.0.1:8080`: keep it. It needs `proxy_set_header Host $host;`, `X-Forwarded-For` and `X-Forwarded-Proto $scheme;`.
- **Grafana** (`grafana.dhipansoft.in` -> `127.0.0.1:3000`): make a separate file `/etc/nginx/sites-available/grafana.conf`, link it into `sites-enabled`, run `nginx -t`,
  then `certbot --nginx -d grafana.dhipansoft.in --redirect`. The block `docker/nginx/javaschoollab.conf.example` (Grafana part) shows the proxy lines, the WebSocket location
  and `add_header Content-Security-Policy "upgrade-insecure-requests"`. The WebSocket helper `map $http_upgrade $connection_upgrade {...}` lives in
  `/etc/nginx/conf.d/websocket-map.conf`.
- Never run `certbot ... --force-renewal` repeatedly: Let's Encrypt limits repeated issuance for the same name.
- A name with no site in nginx shows the nginx "Welcome" page: it falls through to the default site. Add the site and the certificate for that name.
- Edit nginx files in `nano` and always run `nginx -t` before `systemctl reload nginx`; if `nginx -t` fails, nothing is reloaded and the sites keep running.

## What "rolled back successfully without breaking" means

| Failure | What happens |
|---|---|
| The image does not build (broken code) | Nothing is started; the running version is untouched; the commit is marked failed; alert. |
| The pre-deploy backup fails | The deploy stops before touching anything. |
| The new container never becomes healthy, crashes, or its readiness endpoint is not UP | The previous image is started again (from Docker; if it was deleted, from `backups/images/deploy/`, the newest 3 versions). |
| A database migration ran during the failed deploy | By default the database is **kept** (your users' new data is not thrown away; this project's migrations only add columns and indexes, which the previous version ignores) and the log prints the exact restore command. With `RESTORE_DB_ON_FAILURE=1` in `/etc/javaschoollab/auto-deploy.env` the pre-deploy backup is restored automatically, after a safety copy of the current state. |
| The roll-back itself fails | Exit code 2, a clear message, the metric and the webhook say so. This is the only case that needs a person at once. |

A commit that failed is **not retried every 2 minutes**; the next commit (or `auto-deploy.sh --force`) tries again.
The old containers keep serving while the new image is being built, so the only downtime is the few seconds of the container swap.

## Deployment history (who deployed what, and when)

Every deploy attempt writes one entry, whether it succeeded, was rolled back, or never started (`docker/scripts/deploy-history.sh`). It is stored in the shared MySQL, in a **separate**
database `jsl_ops` (table `deployments`) so that restoring an application backup during a roll-back never erases it and the application's own login cannot touch it, and also as a line in
`backups/deploy-history/history.jsonl`, which is written first, works when MySQL is down, and is copied off the server with the other backups.

Recorded: start and finish time (UTC) and duration, **result** (`SUCCESS`, `ROLLED_BACK`, `ROLLBACK_FAILED`, `FAILED_BEFORE_START`, `BUILD_FAILED`), how it was triggered (`auto-deploy`, `jenkins`, `manual`),
**who** (the Linux user for a manual deploy, the Jenkins user and build number for Jenkins, the commit's author for an automatic deploy), Git commit, branch, author, e-mail and message, image tag and id,
the previous version, the version it was rolled back to, database schema version before and after, the pre-deploy backup file, the host, the Jenkins build address, and the reason for a failure.

```
bash docker/scripts/deploy-history.sh list 20       the last 20 deployments as a table
bash docker/scripts/deploy-history.sh show 42       everything about deployment 42
```
Or in SQL: `SELECT * FROM jsl_ops.deployments ORDER BY id DESC;` (connect as root, or add a read-only account for a Grafana panel). Entries are never deleted by the scripts.

## Commands

```
bash docker/scripts/auto-deploy.sh --status        what is deployed / failed / running
bash docker/scripts/deploy-history.sh list         who deployed what and when
bash docker/scripts/auto-deploy.sh                 check Git now and deploy if there is a new commit
bash docker/scripts/auto-deploy.sh --force         deploy the branch head even if it was deployed or failed before
bash docker/scripts/deploy.sh <image-tag>          deploy an image you built yourself (same backup / health check / roll-back)
APP_IMAGE_TAG=<old-tag> bash docker/scripts/stack.sh up app --no-build      go back to any version still on the server  (docker images javaschoollab/app)
sudo bash docker/scripts/install-auto-deploy.sh --remove                   switch the automatic deploys off
```

## Settings (`/etc/javaschoollab/auto-deploy.env`, written by the installer)

`DEPLOY_BRANCH`, `GIT_SSH_COMMAND`, `DEPLOY_NOTIFY_URL`, and (commented, off by default) `RUN_TESTS=1` (run the Maven tests on the server before each deploy; normally CI does it before the merge),
`RESTORE_DB_ON_FAILURE=1`, `SKIP_BACKUP=1` (never in normal use), `KEEP_IMAGES`, `KEEP_ARCHIVES`.

## What was tested, and what was not

Tested end to end on a test machine (Docker, a local Git "origin", the real scripts and the real MySQL / Redis / OpenSearch stack, with a small stand-in web server instead of the Java image
so that each version could be made good or bad on purpose): first deploy on an empty server; a good deploy; no action when nothing changed; a bad version whose readiness returns 503; one that is
"healthy" for Docker but not ready; one that crashes at start; no retry of a failed commit; a good version after failures; roll-back when the previous image had been deleted (loaded from its backup archive);
and a failed deploy that changed the database (the pre-deploy backup was restored and the previous version came back).

**Not tested:** the systemd timer and `install-auto-deploy.sh` (they need a Linux server with systemd), the real Java image build on the server (several minutes and about 3 GB RAM),
a GitHub deploy key, and the webhook notification. Do the first run by hand (`--status`, then `auto-deploy.sh`) before relying on the timer. The server needs at least 8 GB RAM for the build.

## Later: Jenkins / Argo CD

The same `deploy.sh` is what `Jenkinsfile` calls (`docs/jenkins.md`), so the backup, health check and roll-back behave identically. When Jenkins takes over, run
`sudo bash docker/scripts/install-auto-deploy.sh --remove` so two systems never deploy at once.
