# Jenkins CI/CD for JavaSchoolLab (to set up later on jenkins.dhipansoft.in)

The pipeline is already in the code. Installing Jenkins is the only thing left, and you can do it whenever you like.

| File | What it is |
|---|---|
| `Jenkinsfile` (project root) | The pipeline Jenkins runs: test, build, scan, (approve), deploy |
| `docker/scripts/deploy.sh` | Does the actual deploy on the server: backup, start the new image, health check, automatic roll-back (verified on a test machine, see `docs/auto-deploy.md`). Works by hand too |
| `docker/nginx/jenkins.conf.example` | The nginx site for `jenkins.dhipansoft.in` |

> **Status:** written and checked for syntax only. It has **not** been run on a Jenkins server. Do the first run with **DEPLOY unticked**, then deploy once by hand with `deploy.sh` before trusting the automatic path.

## What each build does

1. **Prepare** - tag = `<build number>-<git commit>`, for example `42-ab12cd3`.
2. **Backend tests** - `mvn test` inside a `maven:3.9-eclipse-temurin-21` container (the tests use in-memory H2, no database container). Results appear in Jenkins.
3. **Frontend checks** - typecheck, unit tests, production build, `npm audit` (fails on high or critical) inside a `node:22` container.
4. **Docker files and image** - the three compose files are validated, then `javaschoollab/app:<tag>` is built.
5. **Image scan** - Trivy fails the build on a CRITICAL vulnerability that has a fix (untick `RUN_IMAGE_SCAN` to skip).
6. **Approve deploy** and **Deploy** - only on `main` / `master`, only if you tick `DEPLOY`, and only after someone clicks *Deploy* on the approval prompt. The project files are copied to `DEPLOY_DIR` (without touching `docker/.env` or the backups) and `deploy.sh` runs:
   back up the database, start the new image, wait until Docker reports it healthy and `/actuator/health/readiness` says UP, then tag it `latest` and delete old image versions.
   **If anything fails it starts the previous image again and the build turns red.**

## One-time set-up on the server (Ubuntu)

Assumption: Jenkins runs on the **same server** as the application (the simplest set-up).

1. **DNS:** an A record `jenkins.dhipansoft.in` -> the server's IP address.
2. **Prepare the server first:** `sudo bash docker/scripts/server-setup-ubuntu.sh base` (Docker, firewall, nginx, rsync ...), and have the application running once (`docker/help.txt`, "PUTTING IT ON AN UBUNTU SERVER").
3. **Create the deploy folder** holding the real settings, once:
   ```
   sudo mkdir -p /opt/javaschoollab/docker && sudo chown -R $USER /opt/javaschoollab
   cp docker/.env /opt/javaschoollab/docker/.env      # the production .env you already use (chmod 600)
   ```
4. **Install Jenkins** (needs Java 21):
   ```
   sudo apt-get install -y fontconfig openjdk-21-jre
   sudo wget -O /etc/apt/keyrings/jenkins-keyring.asc https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key
   echo "deb [signed-by=/etc/apt/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian-stable binary/" | sudo tee /etc/apt/sources.list.d/jenkins.list
   sudo apt-get update && sudo apt-get install -y jenkins
   ```
5. **Port 8081, local only** (8080 belongs to the application): `sudo systemctl edit jenkins` and add
   ```
   [Service]
   Environment="JENKINS_PORT=8081"
   Environment="JENKINS_LISTEN_ADDRESS=127.0.0.1"
   ```
   then `sudo systemctl restart jenkins`. Jenkins now answers only on `127.0.0.1:8081`; nginx is the only way in.
6. **Let Jenkins use Docker and the deploy folder:**
   ```
   sudo usermod -aG docker jenkins
   sudo chown -R jenkins: /opt/javaschoollab        # or: sudo setfacl -R -m u:jenkins:rwx /opt/javaschoollab
   sudo systemctl restart jenkins
   ```
   Note: a user in the `docker` group is effectively root on that server. That is why Jenkins must be protected (step 8).
7. **nginx and HTTPS:** follow the header of `docker/nginx/jenkins.conf.example` (copy it, widen the certificate with `--expand`, `nginx -t`, reload).
8. **First login and security** at `https://jenkins.dhipansoft.in`:
   - unlock with `sudo cat /var/lib/jenkins/secrets/initialAdminPassword`, install the suggested plugins, create the admin user;
   - *Manage Jenkins > Security*: "Jenkins' own user database", **disable "Allow users to sign up"**, "Logged-in users can do anything" or better *Matrix-based*; keep CSRF protection on;
   - set *Manage Jenkins > System > Jenkins URL* to `https://jenkins.dhipansoft.in/`;
   - optionally restrict nginx to your own IP (the `allow` lines in the example).
9. **Plugins** (Manage Jenkins > Plugins): *Pipeline*, *Git*, *Workspace Cleanup*, *JUnit*, *Timestamper* (all in the suggested set), plus *GitHub* / *GitLab* / *Bitbucket Branch Source* for your Git host.
10. **Create the job:** *New Item > Pipeline* (or *Multibranch Pipeline*) > *Pipeline script from SCM* > Git > your repository URL (add a credential: a deploy key or token with read access) > branch `main` > *Script Path* `Jenkinsfile`.
    The repository root must be the `app` folder (the one containing `Jenkinsfile`, `pom.xml`, `frontend/`, `docker/`).
11. **Trigger:** easiest is a webhook from your Git host to `https://jenkins.dhipansoft.in/github-webhook/` (GitHub) or the equivalent; otherwise *Build Triggers > Poll SCM* with `H/5 * * * *`.

## Using it

- **Every push:** Jenkins runs tests, builds and scans. Nothing is deployed.
- **To release:** open the job > *Build with Parameters* > tick **DEPLOY** > *Build* > click **Deploy** on the approval step. Watch the console output; a green build means the new version is healthy.
- **If a deploy fails:** the previous version is running again; read the red stage's log. Manual roll-back to any kept version: `APP_IMAGE_TAG=<tag> bash docker/scripts/stack.sh up app --no-build` (see `docker images javaschoollab/app`).
- **Manual deploy without Jenkins:** build with `docker build -f docker/Dockerfile -t javaschoollab/app:manual-1 .` then `bash docker/scripts/deploy.sh manual-1`.

## Things to know

- The deploy folder's `docker/.env` is the only place with production passwords. The pipeline never reads, prints, or overwrites it. Do not put passwords into Jenkins job settings; if you later need some, use Jenkins *Credentials* and `withCredentials`.
- A deploy restarts the application container, so there are a few seconds of downtime (one server, one instance). For zero downtime you would need two app instances behind nginx; not set up.
- Database migrations (Flyway) run automatically when the new version starts. A failed health check rolls the **container** back, but not the database: the backup taken just before the deploy is your safety net (`docker/scripts/restore-db.sh`). Keep migrations backward compatible when you can.
- Jenkins needs memory (about 1 GB) on top of the application and the monitoring stack. The server should have at least 8 GB RAM, or run Jenkins on a separate small server (then the `Deploy` stage must be changed to copy the image with `docker save | ssh ... docker load` and run `deploy.sh` over SSH).
- Every deploy, from Jenkins or not, is written to the deployment history with the Jenkins user, build number and build address: `bash docker/scripts/deploy-history.sh list`. Install the "Build User Vars" plugin if you want the real person's login name there (otherwise it shows `jenkins`).
- Back up `/var/lib/jenkins` (jobs and credentials) now and then.
- The GitHub Actions workflow in `.github/workflows/ci.yml` does the same checks. Use one or both; if you only want Jenkins, delete that file.
