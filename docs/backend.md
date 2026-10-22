# JavaSchoolLab Spring Boot backend: details

The Maven project is the repository root (import it into STS: **File > Import > Maven > Existing Maven Projects**, root = the repository folder).


The whole backend: the API, the course content and the hosting of the built React site. It replaced the original Node/Express server, which has been removed (it is in git history). All 35 of its endpoints were ported with the same URLs, JSON and messages.

Java 21, Spring Boot 3.4, Spring Security, JdbcTemplate, Flyway, MySQL, JJWT.

## What is ported

| Endpoint | Status |
|---|---|
| `POST /api/otp/send`, `POST /api/otp/verify` | ported |
| `POST /api/auth/register`, `/register-otp`, `/login`, `/login-otp` | ported |
| `GET /api/auth/me`, `POST /api/auth/change-password` | ported |
| `GET /api/visitors/count`, `POST /api/visitors/increment` | ported |
| `PATCH /api/auth/profile`, `PUT`/`DELETE /api/profile/avatar` | ported |
| `POST /api/progress/topic`, `/import`, `/study`; `GET /api/progress/summary`, `/topics`, `/review`; `PUT /api/progress/goal` | ported |
| `POST`/`GET /api/quiz/attempts` | ported (the summary and review queue are built from them) |
| `GET`/`POST`/`DELETE /api/bookmarks`, `GET`/`PUT /api/notes` | ported |
| `POST`/`GET /api/certificates`, public `GET /api/certificates/verify/{id}` (rate limited) | ported |
| `GET /api/leaderboard` | ported |
| `GET /api/content/datasets/{name}` and `/api/content/datasets/manifest` (public) | new: quiz banks, predict-output, study packs, learning paths, served from JSON |
| `GET /api/content/courses`, `/api/content/courses/{id}`, `/api/content/manifest` (public) | new: the course content, served from JSON (see "Course content") |
| `GET /api/profiles/{handle}` (public), `GET`/`PUT /api/profile/settings`, `GET /api/profile/handle-available` | ported (opt-in, rate limited) |

Nothing is left on the Node side: Spring Boot is the only backend.

## Same users, same logins

- **Same MySQL database.** No data moves: `users`, `otp_codes`, `visitor_count`... are read in place.
- **Passwords:** bcrypt cost 10, the same as bcryptjs, so existing hashes verify. Nobody resets a password.
- **Tokens:** HS256 with `JWT_SECRET`, same claims as Node. Use the **same `JWT_SECRET`** and logged-in users stay logged in.
  (`CompatibilityTest` proves both directions with a token and a hash made by the Node code.)
- **Same URLs, JSON and messages**, so the React app needs no change.

## Run it

Needs JDK 21 and Maven (or use Docker below). Configuration is by environment variables, the same names the Node server used:

| Variable | Meaning |
|---|---|
| `JWT_SECRET` | **Required**, 32+ characters. The app refuses to start without it. |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | MySQL (defaults: localhost, 3306, root, empty, javaschoollab) |
| `PORT` | default 3001, the same as Node |
| `CORS_ORIGIN` | comma-separated front-end origins; empty = allow any (development only) |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `SMTP_SECURE` | email OTP. Unset in development = the code is printed in the log |
| `VERIFY_RATE_LIMIT`, `PROFILE_RATE_LIMIT`, `HANDLE_RATE_LIMIT` | per-minute limits per visitor address for certificate checks (60), public profile pages (60) and handle checks (40) |
| `FORWARD_HEADERS_STRATEGY=native` | set it behind nginx or a load balancer so the rate limit sees real visitor addresses (the Node server used `TRUST_PROXY`) |
| `OTP_DEV_ECHO=true` | returns the OTP in the response (development only; ignored in production) |
| `SPRING_PROFILES_ACTIVE=prod` | production mode: no OTP in logs or responses, mobile OTP refused until an SMS provider exists |

```
# PowerShell
$env:JWT_SECRET = '<32+ random characters>'
$env:DB_PASSWORD = '<your mysql password>'
mvn spring-boot:run
```

Flyway creates and updates the tables on startup (`src/main/resources/db/migration`).
On a database the old Node migrations already built, it adopts it without changing any data.

## Architecture: one package per service

One application, one jar, one database, but the code is organised as **services, each in its own package**. To change a feature
you work in one package; to see what a feature depends on you read its `package-info.java`.

```
com.javaschoollab
  common        shared kernel: ApiException(+Handler), RateLimiter, JsonInput, @PublicApi (depends on nothing)
  config        AppProperties          security   JwtService, JwtAuthFilter, SecurityConfig       web   SpaWebConfig
  user          users                     Identifier, Validation, UserService, UserRepository
  auth          sign-up, sign-in, OTP     AuthController, OtpController, AuthService, OtpService, MailService, OtpRepository
  progress      topics, study time, goal  ProgressController, ProgressService, ProgressMath, ProgressRepository
  quiz          quiz attempts, review     QuizController, ReviewController, QuizService, ReviewSchedule, QuizRepository
  leaderboard   ranking                   LeaderboardController, LeaderboardService, LeaderboardRepository (read-only, several tables)
  notes         bookmarks, notes          BookmarksController, NotesController, BookmarkService, NoteService, two repositories
  certificate   certificates              CertificateController, CertificateService, CertificateUid, CertificateRepository
  profile       own details + public page ProfileController, ProfileService, PublicProfileController, PublicProfileService, ProfileSettingsRepository
  content       course content as JSON    ContentController, ContentService, DatasetController, DatasetService
  visitor       page-load counter         VisitorController, VisitorService, VisitorRepository
```

Inside a service the layers are flat classes named by suffix: **Controller** (HTTP only), **Service** (all the rules), **Repository**
(SQL only). Which service may use which (always through the other's `*Service`):

```
auth -> user      progress -> quiz      certificate -> quiz      leaderboard -> progress
profile -> user, certificate, progress, quiz            everything -> common, security, config
```

The rules are enforced by `ArchitectureTest` (it fails the build): controllers never touch repositories or SQL; services never touch
SQL; a repository is only used inside its own package; a package uses another only through its `*Service`, records, enums and
`@PublicApi` helpers, and only the allowed ones above; no cycles; the shared kernel and infrastructure never depend on a service;
every service package has a `package-info.java`.

**Adding a feature as a new service:** create `com.javaschoollab.<name>` with `<Name>Controller`, `<Name>Service`,
`<Name>Repository` and a `package-info.java`; add the package to `ALLOWED` in `ArchitectureTest` with the services it uses; if it needs a
table, add a Flyway migration (`src/main/resources/db/migration`). To use another service, inject its `*Service`; if you need something it
does not offer yet, add a method to that service, never reach into its repository.

## Serve the website from the same app

One command builds the React site and the API into a single jar:

```
cd backend
mvn -Pwith-site -DskipTests package
java -jar target/javaschoollab-server-0.1.0.jar
```

The `with-site` profile downloads its own Node (into `target/`, nothing to install), runs `npm install` and `npm run build`
(sitemap, type-check, production build) in the React project, then copies `dist/` into the jar. The first run takes about four minutes;
use `-Dfrontend.skip=true` to reuse the existing `dist/` and package in seconds. Without `-Pwith-site` you get the API only.
Stop any running copy of the jar first: Windows will not let Maven replace a jar that is in use.

Then `http://localhost:3001/` is the site and `http://localhost:3001/api/...` is the API. Refreshing or sharing a
React route such as `/course/java/basics/Constructor_in_java` loads the app (any path that is not `/api` and has no
file extension gets `index.html`); a missing `.js`/`.png` is a real 404. Hashed files under `/assets` are cached for
a year, everything else is revalidated so a new deploy shows up immediately.

Build the React app with `VITE_API_BASE_URL=/api` (`docker/Dockerfile` does) so the browser calls its own origin.

## Docker

```
# from the repository root (the Dockerfile lives in docker/, the build context is the root)
docker build -f docker/Dockerfile -t javaschoollab .
docker run -p 3001:3001 --env-file /srv/javaschoollab/.env javaschoollab
```

The image contains no user data. Keep MySQL outside it (managed MySQL, or the shared stack `docker/docker-compose.shared.yml`) and the
`.env` outside the code folder, so replacing the code never touches users, visitor count or secrets.

## Course content

The courses live as JSON in `src/main/resources/content` (`index.json` names only, `manifest.json`, `courses/<id>.json`) with their images in `static/content-assets`.
They are generated from the TypeScript sources: run `npm run export:content` from the `frontend/` folder, and `npm run verify:content` to check the written files against the source.
`manifest.json` holds a SHA-256 and counts for every course.

The API serves the raw files (never re-written), reading each course on first request, checking its SHA-256 (a mismatch is a logged 500) and caching it in memory:
`GET /api/content/courses` (index), `GET /api/content/courses/{id}` (404 `{"error":"Course not found"}` for an unknown id; ids may contain spaces), `GET /api/content/manifest`.
The four small data sets (quiz banks, predict-the-output challenges, study packs, learning paths) live in `src/main/resources/datasets` with their own `manifest.json` and are served the same way at `GET /api/content/datasets/{quiz-banks|predict-output|study-packs|learning-paths|manifest}` (unknown name: 404 `{"error":"Dataset not found"}`).
They are public, send a strong `ETag` and `Cache-Control: no-cache`, so a client revalidates and gets a cheap `304`, and are gzip-compressed.

## Tests

`mvn test` runs 153 tests (including the 7 architecture rules): validation rules, Node-token and bcrypt compatibility, the streak/XP/review maths
(the same cases as the original Node server's `progress.test.js`), and the whole flow against the real Spring context: sign-in
(OTP, register, password and OTP login, change password, 401/403 rules), progress (topics, import, study time clamps,
summary, weekly goal, quiz grading, review queue), profile and avatar checks, bookmarks and notes, certificate issuing and public verification, public profiles (opt-in, privacy, handle rules and ownership), the leaderboard, the 429 limits, the visitor counter, the course content API (every course checked against its manifest hash and counts), and site hosting with the React-route fallback. The tests use H2 in MySQL mode (tests only); the MySQL-only Flyway scripts are checked by starting the app against a real MySQL (see "Testing against a real MySQL").

**H2 is used by the automated tests only** (scope `test` in `pom.xml`): an in-memory database in MySQL mode, with a hand-written schema in
`src/test/resources/test-schema.sql`, so `mvn test` needs no Docker and starts nothing. The running application and the Docker image always use MySQL and contain no H2.
Because H2 is not MySQL, the real Flyway migrations are checked separately: before a release start the app once against a throw-away MySQL (see the next section).
When you add a column in a migration, add it to `test-schema.sql` too.

## Testing against a real MySQL

The script in `scripts/` (Node 18+, no install) checks a running server over real HTTP:

- `node scripts/smoke.mjs http://localhost:3001` walks the whole API (sign-up by OTP, progress, quizzes, certificates, notes,
  profile, leaderboard, visitors, the React site) with 54 checks. Needs `OTP_DEV_ECHO=true` on the server.

A throwaway MySQL is enough: `docker run -d --rm -e MYSQL_ROOT_PASSWORD=... -p 3307:3306 mysql:8.4`, then start the app with
`DB_PORT=3307`. Last run: fresh database migrated by Flyway (6 migrations), a database built by the old Node `migrate.js` adopted by
Flyway without touching its data, and 54/54 smoke checks.

## Levels and badges

Learners level up and earn badges as they study. Levels are named after the forts of the Maratha empire: **Torna** (start), Sinhagad (100 XP), Purandar (300),
Pratapgad (700), Rajgad (1500) and **Raigad** (3000 XP). There are 15 badges (First Step, Curious Mind, Explorer, Scholar, three streak badges,
Test Taker, Module Master, Fort Builder, Perfectionist, Certified, two study-time badges and All-Rounder). The page is `/achievements`.

- **Worked out from real activity** (topics, streaks, quizzes, certificates, study time) on every request, so it cannot be inflated. `user_badges` only remembers
  when each was earned, so the site can celebrate it **once**: a pop-up with a warm message, confetti (not for people who prefer reduced motion) and "Share my win".
- **No flood for existing learners:** the first time anyone is looked at, what they already had is recorded quietly, not announced.
- API: `GET /api/achievements` (signed in). The server reports a new badge once, so the browser asks through one shared store (`services/achievements.ts`).
- To add a badge: one line in `AchievementsService.DEFS`, plus an icon name in `BadgeIcon.tsx`.

## Sharing a topic

Every topic page has a **Share** button. On a phone it opens the system share sheet; on a computer a menu offers WhatsApp, Telegram, LinkedIn, X, Facebook,
email and Copy link. The link is the topic's own address (no query string), so a friend lands on the same lesson.

- **Link previews:** WhatsApp, Telegram and LinkedIn read the HTML and do not run React, so `/course/{course}/{module}/{topic}` (and the two-part form)
  is answered by the `share` package with the real `index.html` carrying that topic's title and description in the page title and the Open Graph / Twitter
  tags. An unknown topic gets the normal page. The preview picture is still the site picture (`/og-image.png`).
- **Tracking:** each share is recorded as an anonymous `share` event (topic path and channel only); the dashboard shows total shares, the most shared topics
  and which channels people use.

## Analytics dashboard (/admin)

Open `/admin` while signed in with an **admin email** to see how the site is doing: visits, sessions, sign-ups, searches, quiz attempts, certificates and
topics studied, a visitor-to-certificate funnel, daily charts, the most visited pages, the most studied courses, what people search for, and
**searches that found nothing** (lessons your visitors want and do not find: your next content to write).

- **Who is admin:** the emails in `ADMIN_EMAILS` (Docker, `docker/.env`) or `app.admin.emails` (`application.properties`), comma-separated. Empty means nobody.
  The check is on the server (`GET /api/admin/analytics` answers 403 to anyone else), not just in the page.
- **What is recorded:** the browser reports a page view (path only, query string and fragment cut off) and a search (the words, lowercased, and how many
  topics matched) to `POST /api/analytics/event`, into the `analytics_events` table. A search is recorded once the query stops changing, not on every keystroke.
  Sign-ups, quizzes, certificates and topic progress are read from the tables that already hold them.
- **Privacy:** no cookies, no IP address, no user agent. The session id is a random value kept in the browser tab (`sessionStorage`). The signed-in user id is
  attached only when the learner is signed in. Browsers that send "Do Not Track" are not tracked. Events older than 400 days are deleted every night.
- **Not counted:** the admin page itself, and any event with an unknown type (the server only accepts page views and searches).

## Security

- **Brute-force limits** (`auth/AuthGuard`): password sign-in / sign-up, sending a one-time code and checking one are limited per account and per client address
  (`LOGIN_RATE_LIMIT`, `OTP_SEND_RATE_LIMIT`, `OTP_VERIFY_RATE_LIMIT`, per minute per account; the address limit is 10x). Answer: 429 with `Retry-After`.
- **No account enumeration:** a wrong password and an unknown account give the same answer (`Invalid email or password`) in the same time; sending a login code
  for an unknown account looks like a normal send.
- **Passwords:** new passwords need 8+ characters and must not be a very common one. Sign-in never checks the length, so older accounts keep working.
- **Token revocation:** `users.tokens_valid_from` (migration V10). Changing the password or `POST /api/auth/logout-all` refuses every token issued before that moment
  (`security/TokenRevocation`, cached 15 seconds). `POST /api/auth/change-password` returns `{ok, token}`: the fresh token for the device that changed it.
- **Your data:** `GET /api/account/export` (JSON download) and `DELETE /api/account` with `{"confirm": "<your e-mail>"}` (package `account`).
- **Browser headers** (`web/SecurityHeadersFilter`): Referrer-Policy, Permissions-Policy and a Content-Security-Policy. Its script allow-list is `report-only` by default
  (`CSP_MODE`); set `CSP_MODE=enforce` once the browser console shows no "[Report Only]" messages for ads and Google sign-in.
- **Housekeeping:** expired one-time codes are deleted hourly, analytics events older than 400 days nightly.

> **Optional observability.** The Prometheus / Grafana / Loki / Tempo stack only runs when `OBSERVABILITY=true` in `docker/.env`; `stack.sh up all` honours it (and removes the monitoring containers when it is not true, keeping their volumes). The application's health endpoints and `/actuator/prometheus` stay on either way.

## Monitoring (Spring Boot Actuator)

The server exposes the standard operations endpoints, and only those. Everything else Actuator can do (`env`, `beans`, `heapdump`, `loggers`,
`shutdown`...) is switched off and answers 404.

| Endpoint | Who may call it | What it answers |
|---|---|---|
| `/actuator/health/liveness` | anyone | "Is the process alive?" Only the JVM state, never the database, so an outage cannot cause a restart loop. Restart the container when it fails. |
| `/actuator/health/readiness` | anyone | "Can it take traffic?" Start-up finished (Flyway included) and MySQL answers. The Docker health check uses it. Stop sending traffic when it fails. |
| `/actuator/health` | anyone (status only); the ACTUATOR account sees every component | Overall status: `db`, `diskSpace`, `redis` (only when `REDIS_ENABLED=true`) and `search` (UP / DEGRADED / UNKNOWN, never DOWN). |
| `/actuator/info` | anyone | Application name, description, version and build time (from `build-info`), Java version, and the commit (`APP_COMMIT`). |
| `/actuator/metrics`, `/actuator/prometheus` | the ACTUATOR account (HTTP Basic) | JVM, Tomcat, HikariCP (database pool), HTTP request counts and latency histograms (p95 / p99), cache and Redis metrics, plus `jsl_search_ready` and `jsl_search_topics_indexed`. Every metric carries the tag `application="javaschoollab"`. |

**Production setup (`application-prod.yml`, `docker/docker-compose.yml`)**
- The endpoints run on a **separate management port** (`MANAGEMENT_PORT`, default 9001), not on the website port, and Docker publishes it on
  `127.0.0.1` only (`MANAGEMENT_PUBLISH_PORT`). The internet only ever reaches the website port, so `/actuator/**` is not reachable there.
  Locally (no `MANAGEMENT_PORT`) the endpoints share port 3001 and the health details are shown without signing in.
- Metrics need the account `ACTUATOR_USER` / `ACTUATOR_PASSWORD` (HTTP Basic). With an empty password the account does not exist and those
  two endpoints stay closed; health and info still answer.
- **Graceful shutdown** is on (`server.shutdown: graceful`, 30 s): when the container is stopped or redeployed, requests in flight finish first.
  Compose gives it 40 s (`stop_grace_period`).
- Readiness deliberately leaves Redis and search out: the application keeps working without them (it counts rate limits in memory and the browser
  searches by itself), so their outage must not pull the application out of rotation. They still show in `/actuator/health` for the operator.

**Checks from the machine that runs Docker**
```
curl http://127.0.0.1:9001/actuator/health/readiness
curl http://127.0.0.1:9001/actuator/info
curl -u actuator:<ACTUATOR_PASSWORD> http://127.0.0.1:9001/actuator/health
curl -u actuator:<ACTUATOR_PASSWORD> http://127.0.0.1:9001/actuator/prometheus
docker compose ps        # the "app" container shows (healthy) once readiness is UP
```

**Prometheus** (scrape the management port from inside the same Docker network, or from the host):
```
scrape_configs:
  - job_name: javaschoollab
    metrics_path: /actuator/prometheus
    basic_auth:
      username: actuator
      password_file: /etc/prometheus/actuator_password
    static_configs:
      - targets: ["127.0.0.1:9001"]
```
Useful alerts: `up == 0` (cannot scrape), `jsl_search_ready == 0` for 15 minutes, HikariCP `hikaricp_connections_pending > 0` for 5 minutes,
`histogram_quantile(0.95, sum(rate(http_server_requests_seconds_bucket[5m])) by (le)) > 1`, JVM heap above 85 %, `disk_free_bytes` low.

**Kubernetes** (if you move there later): `livenessProbe` on `/actuator/health/liveness`, `readinessProbe` and `startupProbe` on
`/actuator/health/readiness`, all against the management port.

## Redis and OpenSearch (both optional)

The site works with neither. In Docker both are started by `docker/docker-compose.yml` (the application stack); from STS they are off until you start them.

**Redis** (`app.redis.enabled` / `REDIS_ENABLED=true`, `REDIS_HOST`, `REDIS_PORT`)
- *Rate limits* for the public routes (certificate verification, public profiles, handle check, search) are counted in Redis, so they are shared by every
  app server and survive a restart. If Redis cannot be reached the app counts in its own memory instead and keeps working.
- *One-time codes* (sign-up and login) live in Redis with an expiry instead of the `otp_codes` table. If Redis is down while it is on, sending a code answers
  503 "try again" rather than failing silently.
- *Leaderboard cache*: everyone's XP is worked out once a minute (`CACHE_TYPE=redis`; in memory with the same 60-second limit when Redis is off).
- Not cached on purpose: course JSON (already held in memory with an ETag, 22 MB would only add a network hop) and public profiles (a learner who
  un-publishes must disappear at once). Redis holds nothing that cannot be lost: no persistence, and user data stays in MySQL.
- Local: `docker run -d --name jsl-redis -p 6379:6379 redis:7-alpine`, then `app.redis.enabled=true` in `application.properties`.

**OpenSearch** (`app.search.url` / `SEARCH_URL`, for example `http://localhost:9200`)
- `GET /api/search?q=hashmap%20collision&course=java&limit=30` searches every topic's title, module and lesson text (all words must match, titles rank first)
  and returns the topic with a snippet. `GET /api/search/status` says whether it is ready.
- The index is built **in the background** after start-up from the course content and rebuilt only when the content changes (it stores the content hash),
  so the site is never held up. Until it is ready, and whenever OpenSearch is off, the API answers 503 and the browser searches by itself as before.
- On a Linux server run once `sudo sysctl -w vm.max_map_count=262144` (OpenSearch requires it) and allow about 1 GB of memory for the container.
- Neither Redis nor OpenSearch publishes a port to the host in Docker: only the app can reach them.

## The database is separate from the code

Users, progress, certificates and notes live in MySQL, never in the application files. A new version of the code replaces only the app
container (or the jar); the database is untouched:

- **Separate stack:** MySQL, Redis, OpenSearch and the nightly backup run from `docker/docker-compose.shared.yml` (project `javaschoollab-shared`) and are
  started and stopped on their own. The application (`docker/docker-compose.yml`, project `javaschoollab`) has no database service, so `docker compose down`
  there stops only the app. They meet on the network `javaschoollab_shared`; the app reaches MySQL at the host name `javaschoollab-db`.
  `bash docker/scripts/stack.sh up all` starts the stacks in the right order and waits until each is healthy.
- **Data location:** the Docker volume `javaschoollab_db_data`, declared `external`, so it belongs to Docker and not to a compose project: rebuilding the app,
  `down` and even `down -v` leave it alone. On a brand-new machine create it once with `docker volume create javaschoollab_db_data`.
  Only `docker volume rm javaschoollab_db_data` deletes the data.
- **Reaching the database from this machine** (MySQL Workbench, the `mysql` CLI): `127.0.0.1:3306` (`DB_PUBLISH_PORT` in `docker/.env`; on a PC that already runs MySQL use `DB_PUBLISH_PORT=3307`), bound to 127.0.0.1 only.
- **Schema changes** come only from new Flyway files in `src/main/resources/db/migration` (currently up to `V11__...`). They run once at start-up, in order,
  and keep existing rows. **Never edit a migration that has already run**: Flyway stops the app if its checksum changes. Add a new file instead, and add
  the new column or table to `src/test/resources/test-schema.sql` (the H2 copy the tests use).
- **Secrets and connection settings** come from `docker/.env` or `application.properties`, both git-ignored, so a code update never overwrites them.
  `bash docker/scripts/generate-secrets.sh` creates strong values.
- **Backups** (next section) are the safety net if the server or the volume itself is lost.

## Backups

Users, progress and certificates live only in MySQL, so back it up. Everything is described in `docker/help.txt`; in short:

- **Database:** the `backup` service in the shared stack writes a verified, checksummed `mysqldump` every night at midnight (`BACKUP_AT`, time zone `TZ`) to
  `backups/database/<date>/` and keeps the newest 3 (`BACKUP_KEEP_COUNT`). A failed dump never replaces or removes a good backup, and a missed or failed backup raises an alert.
  `deploy.sh` takes an extra one before every deploy.
- **Images and configuration:** `bash docker/scripts/backup-images.sh` (scheduled by `install-backup-schedule.sh`) keeps the newest 3 versions of the application image and
  the configuration; `deploy.sh` also keeps an image archive of every deployed version in `backups/images/deploy/`.
- **Off the server:** set `BACKUP_REMOTE` in `docker/.env` (a mounted disk, `user@host:/path` over SSH, or an rclone remote) and `scripts/sync-backups-offsite.sh` copies `backups/` there.
  A backup on the same machine does not survive losing it.
- **Restore:** `bash docker/scripts/restore-db.sh <backup.sql.gz> [target-database] [--yes]` verifies the file, saves a safety copy of the current state, then loads the backup.
  Try a backup out first with a scratch database name (`restore_check`).
- **Local MySQL (STS):** `powershell -ExecutionPolicy Bypass -File scriptsackup-local.ps1` backs up the database named in `application.properties`; `-Restore` loads the newest backup.
- `backups/` is git-ignored: the files contain user data and password hashes, so never commit or share them.

## Deploying

1. Run `mvn test`, and the frontend checks (`npm run verify` in `frontend/`).
2. Keep the same `JWT_SECRET` the site already uses if you want nobody logged out (a changed secret signs everyone out once).
3. On a server, follow `docker/help.txt` ("PUTTING IT ON AN UBUNTU SERVER"): `server-setup-ubuntu.sh base`, clone the repository, `generate-secrets.sh`, fill in `docker/.env`,
   `docker volume create javaschoollab_db_data`, `bash scripts/stack.sh up all`, `install-backup-schedule.sh`, then `server-setup-ubuntu.sh nginx ...`. Run `bash scripts/preflight.sh` before real users arrive.
4. Later releases: merge into the deployment branch and `auto-deploy.sh` (see `docs/auto-deploy.md`) builds, backs up, deploys and rolls back by itself, or use the `Jenkinsfile` (`docs/jenkins.md`).
   By hand: `bash docker/scripts/stack.sh up app` rebuilds and restarts only the application; the database is never restarted by it.
