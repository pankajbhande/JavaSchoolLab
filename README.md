# JavaSchoolLab

A learning site for Java, Spring, SQL, web and more: 31 courses, quizzes, certificates, progress tracking and public learner profiles.

```
pom.xml, src/   Spring Boot (Maven) project: the API, the course content and the web hosting.  <- import THIS folder into STS
frontend/        React + TypeScript site (Vite). Built and served by the Spring Boot app, or run on its own while developing
docker/          Dockerfile, three compose stacks (docker-compose.shared.yml: MySQL/Redis/OpenSearch/backup; docker-compose.yml: the app; docker-compose.monitoring.yml: Prometheus/Grafana/Loki/Tempo/Alertmanager), scripts/ (stack.sh, backups, Ubuntu server setup), nginx/ and the one settings file `.env` (git-ignored, copied to the server)
docs/            authoring notes and backend details (docs/backend.md)
```

## Open it in STS (Spring Tools Suite)

1. **File > Import > Maven > Existing Maven Projects**.
2. Set **Root Directory** to this repository folder (the one containing `pom.xml`) and finish. Java 21 is required.
3. Before running, set the database and secret: copy `application.properties.example` to `application.properties`
   and fill in `spring.datasource.password` and `app.jwt.secret` (that file is git-ignored).
4. Run `JavaSchoolLabApplication` (**Run As > Spring Boot App**). It starts on http://localhost:3001; Flyway creates the tables.

The React app lives in `frontend/`. After `npm install` it has a large `node_modules`; if STS feels slow, right-click `frontend` > Properties > Resource > Resource Filters and exclude it, or leave `npm install` to the Maven build (`-Pwith-site`), which keeps its own copy under `target/`.

## Environments: local and production

| | Local (default) | Production |
|---|---|---|
| Profile | `local`, active automatically in STS and `mvn spring-boot:run` | `prod`, set `SPRING_PROFILES_ACTIVE=prod` (the Docker compose file does this) |
| Config file | `application-local.yml` plus your git-ignored `application.properties` | `application-prod.yml`, values come from environment variables |
| Database | MySQL on localhost:3306, user root | `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` (required) |
| Sign-up code | printed in the console and returned in the response (`dev-echo`) | emailed through SMTP only, never returned |
| Secrets | `app.jwt.secret` in `application.properties` | `JWT_SECRET` (required, 32+ characters) |
| CORS | Vite and local ports | `CORS_ORIGIN` (required): your public site address |
| Errors / logs | detailed, DEBUG for the app | no messages or stack traces to clients, WARN/INFO logs |

In production a missing required value stops the app at start-up instead of running half-configured.
Sign-up, sign-in and one-time codes are **email only**; mobile numbers are rejected by the API.
**Continue with Google** is optional: set `app.google.client-id` (local) or `GOOGLE_CLIENT_ID` (production) to an OAuth "Web application"
client id from Google Cloud Console and the button appears on the login form. Leave it empty and the button stays hidden.

**Redis and OpenSearch** are optional. `docker/docker-compose.yml` (the application stack) starts both (shared rate limits, expiring sign-up codes, leaderboard cache, and
server-side topic search at `/api/search`). In STS they are off by default; see `docs/backend.md` ("Redis and OpenSearch") to switch them on.

**Levels and badges:** learners climb six fort-named levels (Torna to Raigad) and earn 15 badges, celebrated with a pop-up and a share button; see `/achievements`.

**Sharing:** every topic has a Share button (WhatsApp, Telegram, LinkedIn, X, Facebook, email, copy link) and shared links preview as the topic.

**Analytics:** sign in with an admin email (`ADMIN_EMAILS` / `app.admin.emails`) and open `/admin` for visits, sign-ups, searches and a funnel; see `docs/backend.md`.

## Everyday commands

| What | Where | Command |
|---|---|---|
| Run the API | repository root | `mvn spring-boot:run` |
| Backend tests (181, in-memory H2, no Docker needed) | repository root | `mvn test` |
| One jar with the site inside | repository root | `mvn -Pwith-site -DskipTests package`, then `java -jar target/javaschoollab-server-0.1.0.jar` |
| React dev server | `frontend/` | `npm install`, then `npm run dev` (needs the backend on :3001) |
| Front-end tests and type check | `frontend/` | `npm test`, `npm run typecheck` |
| Re-export the course content | `frontend/` | `npm run export:content` (writes into `src/main/resources`) |
| Whole platform in Docker (shared infra, app, monitoring) | `docker/` | `docker volume create javaschoollab_db_data` (once), then `bash scripts/stack.sh up all` (`status`, `down`, `up shared|app|monitoring`) |
| Fresh Ubuntu VPS | `docker/` | `sudo bash scripts/server-setup-ubuntu.sh base`, then see `docker/help.txt` ("PUTTING IT ON AN UBUNTU SERVER") |

**Monitoring:** Spring Boot Actuator serves `/actuator/health` (with `/liveness` and `/readiness` probes), `/actuator/info` and `/actuator/prometheus`. In Docker they are on a private management port (127.0.0.1:9001); see `docs/backend.md` ("Monitoring").

Security fixes and what still needs your action: `docs/issues-and-resolutions.md`.

Go-live check: `bash docker/scripts/preflight.sh`; fresh secrets: `bash docker/scripts/generate-secrets.sh`. Monitoring is optional: `OBSERVABILITY=true|false` in `docker/.env` (see `docker/help.txt`). Deploy on merge with automatic roll-back (no Jenkins needed): `docs/auto-deploy.md`. CI/CD with Jenkins (pipeline ready, install later): `docs/jenkins.md`.

More detail: `docs/backend.md` (API, architecture, deployment) and `frontend/README.md` (the React app).
