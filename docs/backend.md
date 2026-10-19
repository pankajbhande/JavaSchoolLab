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

Build the React app with `VITE_API_BASE_URL=/api` (the Dockerfile does) so the browser calls its own origin.

## Docker

```
# from the repository root
docker build -f backend/Dockerfile -t javaschoollab .
docker run -p 3001:3001 --env-file /srv/javaschoollab/.env javaschoollab
```

The image contains no user data. Keep MySQL outside it (managed MySQL, or the `db_data` volume in `../docker`) and the
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

`mvn test` runs 126 tests (including the 7 architecture rules): validation rules, Node-token and bcrypt compatibility, the streak/XP/review maths
(the same cases as the original Node server's `progress.test.js`), and the whole flow against the real Spring context: sign-in
(OTP, register, password and OTP login, change password, 401/403 rules), progress (topics, import, study time clamps,
summary, weekly goal, quiz grading, review queue), profile and avatar checks, bookmarks and notes, certificate issuing and public verification, public profiles (opt-in, privacy, handle rules and ownership), the leaderboard, the 429 limits, the visitor counter, the course content API (every course checked against its manifest hash and counts), and site hosting with the React-route fallback. The tests use H2 in MySQL mode; the
MySQL-only Flyway scripts have **not** been run in CI yet, so run the app once against a real MySQL before relying on them.

## Testing against a real MySQL

The script in `scripts/` (Node 18+, no install) checks a running server over real HTTP:

- `node scripts/smoke.mjs http://localhost:3001` walks the whole API (sign-up by OTP, progress, quizzes, certificates, notes,
  profile, leaderboard, visitors, the React site) with 54 checks. Needs `OTP_DEV_ECHO=true` on the server.

A throwaway MySQL is enough: `docker run -d --rm -e MYSQL_ROOT_PASSWORD=... -p 3307:3306 mysql:8.4`, then start the app with
`DB_PORT=3307`. Last run: fresh database migrated by Flyway (6 migrations), a database built by the old Node `migrate.js` adopted by
Flyway without touching its data, and 54/54 smoke checks.

## Deploying

1. Run `mvn test`, then `node scripts/smoke.mjs` against **your own** MySQL.
2. Keep the same `JWT_SECRET` the site already uses, so nobody is logged out.
3. `cd docker && docker compose up -d --build` runs the app and MySQL. It reuses the `db_data` volume, so users and progress stay
   (Flyway adopts the existing tables without changing data). Never run `docker compose down -v`: that deletes the volume.
