# Issues found and how each was resolved

Severity: **Critical** = attackable or legally required, fix before going public. **Moderate** = real weakness or data/operations risk.
**Low** = hygiene. Status: **Fixed** (in code, covered by a test where it can be), **Your action** (needs a decision, an account or a server I cannot touch),
**Accepted** (known, deliberate trade-off).

All fixes keep the existing API and screens working: the old tests still pass (only expectations that encoded the weaknesses were changed, listed at the end),
and the existing sign-in flow, OTP flow, token format (HS256, same claims) and database tables are unchanged. Migrations V10 and V11 only add one column and two indexes.

---

## Critical

| # | Issue | Status | Resolution |
|---|---|---|---|
| C1 | **Password guessing and OTP guessing were unlimited.** A 6-digit code lives 5 minutes; with no attempt limit it could be brute-forced, and passwords could be tried forever. | Fixed | `auth/AuthGuard.java` limits password sign-in/sign-up, OTP sending and OTP checking, each per account **and** per client address (address limit = 10x, so a classroom behind one IP is not locked out). Defaults 10 / 3 / 6 per minute per account (`LOGIN_RATE_LIMIT`, `OTP_SEND_RATE_LIMIT`, `OTP_VERIFY_RATE_LIMIT`). 429 + `Retry-After`. Redis-backed in Docker, so shared across instances. Test: `AuthHardeningTest`. |
| C2 | **OTP e-mail flooding.** Anyone could make the server send unlimited mails to any address. | Fixed | Same guard: 3 sends per minute per account, 30 per address. |
| C3 | **Account enumeration.** "User not found", "Invalid password" and the OTP-send 404 told an attacker which e-mails are registered. | Fixed | Sign-in answers one message ("Invalid email or password") for both cases and does the same bcrypt work for both (no timing difference). OTP-send for an unknown login account answers exactly like a real send. Sign-up still says an e-mail is taken (needed so people can tell they already have an account); it is rate limited. |
| C4 | **Login tokens (7 days) could not be revoked.** A stolen token, or an old device, stayed valid after a password change. | Fixed | New `users.tokens_valid_from` (migration V10). A password change, or the new "Sign out of all devices", refuses every older token (`security/TokenRevocation`, 15-second cache). The device that changed the password gets a fresh token, so nobody is logged out by surprise. Deleted accounts' tokens are refused too. Test: `changingThePasswordSignsOutEveryOtherDevice`, `signOutEverywhereRefusesEarlierTokens`. |
| C5 | **No privacy policy, terms, or way to delete / export data** (required by AdSense, GDPR, India's DPDP Act). | Fixed (text needs your review) | Pages `/privacy` and `/terms`, linked from the sign-up form and the Account page. `GET /api/account/export` (JSON download, never includes the password hash) and `DELETE /api/account` (the user types their own e-mail to confirm; removes the account and all rows by the existing cascade, anonymises analytics rows, deletes pending codes). Account page card "Your data and security". Tests in `AuthHardeningTest`. |
| C6 | **No browser security headers** (clickjacking, referrer leakage, injected scripts). | Fixed | `web/SecurityHeadersFilter.java`: `Referrer-Policy`, `Permissions-Policy`, and a `Content-Security-Policy` with an enforced safe part (`object-src 'none'`, `base-uri`, `form-action`, `frame-ancestors 'none'`) plus a script/connection allow-list for Google sign-in, AdSense, Google Fonts and JDoodle. The allow-list defaults to **report-only** (`CSP_MODE`) so ads and sign-in cannot break; see "Your action" Y1. |
| C7 | **No automated checks.** A broken change could be deployed. | Fixed | `.github/workflows/ci.yml`: backend tests, frontend typecheck/tests/build + `npm audit`, compose validation, image build, Trivy image scan. `.github/dependabot.yml` for weekly dependency updates. |

## Moderate

| # | Issue | Status | Resolution |
|---|---|---|---|
| M1 | **Weak password rule** (4 characters, change-password allowed 6). | Fixed | New passwords: at least 8 characters and not one of the most common passwords (`Validation.passwordError`, used by sign-up and change-password). **Sign-in does not check length, so people with older short passwords can still log in** (the form was changed to match). |
| M2 | **OTP table grew forever** (used/expired codes never deleted when Redis is off). | Fixed | Hourly clean-up in `OtpService.purgeExpired`, index `idx_otp_expires` (V11). |
| M3 | **nginx limit would have hit every page load** (`/api/auth/me` matched the pattern). | Fixed | `docker/nginx/javaschoollab.conf.example` now limits only sign-in/sign-up/OTP paths, 60 per minute per address, burst 30 (classroom-safe). |
| M4 | **Deleting an account scanned the whole analytics table.** | Fixed | Index `idx_events_user` (V11). |
| M5 | **No documentation of the security design / stale README.** | Fixed | README and `docs/backend.md` updated; this file. |
| M6 | **CORS "allow all" and auto-creating the database** looked risky. | Already safe | Verified: the `prod` profile has no default for `CORS_ORIGIN` (the app refuses to start without it) and its JDBC URL has no `createDatabaseIfNotExist`; both exist only in the local profile. |
| M7 | **Indexes / analytics retention** | Already fine | Verified: `topic_progress`, `quiz_attempts`, certificates, analytics all have the needed indexes, and analytics events older than 400 days are purged nightly (`AnalyticsService.purgeOld`). My earlier note about this was wrong. |
| M8 | **Secrets in plain text in `docker/.env`** | Your action (Y2) | Cannot be fixed in code. See Y2. |
| M9 | **Third-party code runner (JDoodle)** | Accepted | It runs in a sandboxed iframe, never inside this app. It is named in the privacy policy and allowed in the CSP. Replace with your own sandbox container later if needed. |
| M10 | **Single server, no failover** | Accepted | By design for the first launch; backups (nightly, off-site capable) and restore scripts are in place. |

## Low

| # | Issue | Status | Resolution |
|---|---|---|---|
| L1 | Login error handling leaked a stack of different messages | Fixed | See C3. |
| L2 | `JwtAuthFilter` did not know the token's issue time | Fixed | `AuthUser.issuedAt` (the `iat` claim). Tokens from the old Node server still work (they carry `iat`; tokens without it are not revoked). |
| L3 | No place for server-side limits to be tuned | Fixed | The three limits are environment settings (`docker/.env.example`). |
| L4 | `backend/` and `node-server/` folders | Your action (Y5) | They are **not empty**: `backend/` holds an old Eclipse `.project`, `node-server/` holds an old `.env`. I did not delete them. |
| L5 | No frontend lint step | Accepted | Adding ESLint to a code base this size reports thousands of unrelated findings; TypeScript strict checking and 347 tests already run in CI. Add ESLint gradually. |
| L6 | No browser error reporting | Accepted | A feature, not a defect. Grafana Faro or Sentry can be added later. |
| L7 | Mobile sign-in fields still present in the API | Accepted | Harmless: `Identifier.emailOnly` forces e-mail. Remove with a future API version. |

---

## Your action (cannot be done in code)

- **Y1. Turn on the script allow-list.** Open the site with the browser console open (sign in with Google, load a page with an ad). If there is no "[Report Only] ... violates" message, set `CSP_MODE=enforce` in `docker/.env` and restart the app.
- **Y2. Rotate and protect secrets.** Use new passwords and a new `JWT_SECRET` on the server (the ones used while developing were shared in chat), `chmod 600 docker/.env`, and set `BACKUP_ENCRYPT_PASSFILE` for encrypted backups.
- **Y3. Review the legal text.** `/privacy` and `/terms` describe what the code really does, but they are a template: add your legal contact address, and have them checked for your country. Add a cookie-consent banner if you show ads to EU/UK visitors (Google's consent tool, or a CMP).
- **Y4. Server-side items from `docker/help.txt`:** off-site backup target (`BACKUP_REMOTE`), an outside uptime monitor, alert e-mail (SMTP), SPF/DKIM/DMARC DNS for the mail domain, run `server-setup-ubuntu.sh` on a throw-away server first.
- **Y5. Decide about `backend/` and `node-server/`** (see L4). `node-server/.env` may contain an old secret: delete it if it is not needed, and never commit it (`.env` is git-ignored).

## What I changed in existing tests (they asserted the weaknesses)

- `AuthFlowTest`: wrong password and unknown account now both expect `Invalid email or password`; OTP-send for an unknown login account now expects 200; short-password message is "at least 8 characters".
- `ValidationTest`: password rule is 8 characters and rejects very common passwords.
- `CompatibilityTest`: token comparison ignores the new `issuedAt` field.
- `ArchitectureTest`: knows the new `account` package.
- New: `AuthHardeningTest` (rate limits, enumeration, revocation, export/delete, headers).

## How it was verified

- Backend: `mvn test` (all tests pass, including the architecture rules).
- Frontend: `npm run typecheck` and `npm test` (347 tests) pass.
- nginx example validated with `nginx -t`; compose files validated with `docker compose config`.
- **Not run:** the live site in a browser with ads and Google sign-in (hence report-only CSP), the CI workflow on GitHub, the Trivy scan, and anything on a real server.

---

# Second review: more issues found and resolved

Verified this time against a **real MySQL 8.4** (all 11 migrations applied from an empty database, then a full sign-up, quiz, bookmark, note, export, password-change,
revocation and delete run over HTTP: 20/20 checks passed), plus the full backend suite (181 tests, Spring Boot 3.4.13) and the frontend (typecheck, 347 tests, production build).

## Critical

| # | Issue | Resolution |
|---|---|---|
| C8 | **Vulnerable frontend dependencies: 11 advisories, 3 critical** (`doppiojvm` > `optimist` > `minimist`; `react-router` open redirect / XSS / DoS; `lodash`, `minimatch`, `brace-expansion`). My CI step would have failed on them. | `doppiojvm` was not used anywhere in the code and was removed; `npm audit fix` updated the rest within their allowed versions. `npm audit --omit=dev` now reports **0 vulnerabilities**; typecheck, 347 tests and the production build still pass. |
| C9 | **Known framework vulnerabilities fixed in later patch releases** (Spring Boot 3.4.5, April 2025). | Upgraded to Spring Boot **3.4.13** (same minor version, patch releases only, so Tomcat, Spring Security, Spring Framework get their security fixes without API changes). All 181 tests pass. Dependabot keeps this current. |
| C10 | **Self-reported quiz scores** (the browser says "5 of 5" and the server records it; certificates and the leaderboard are built on that). | **Mitigated, not eliminated.** Added: hard limits on every field, a maximum of 1000 questions (a huge number overflowed the INT column), and per-account write limits (C13), so the numbers cannot be mass-produced. The remaining weakness is architectural: the answer keys live in the front-end, so the server cannot grade. Real fix = server-side grading (move the answer keys to the server and accept answers, not scores). Until then the Terms say a certificate is a record of practice on this site. See "Your action" Y6. |

## Moderate

| # | Issue | Resolution |
|---|---|---|
| M11 | **Oversized or hand-made input reached the database and came back as HTTP 500** ("Data too long"): quiz ids/names, progress ids, bookmark/note ids, certificate names, sign-up gender/organisation, OTP purpose. A huge `totalQuestions` overflowed to a negative number. | `JsonInput.bounded` returns a clear **400** for any id/name over its column size (120 / 150 / 255); sign-up cuts gender and organisation like the profile page already did; OTP `purpose` must be `register` or `login`; search text is cut at 200 characters. Test: `InputGuardsTest`. |
| M12 | **No limit on how much one signed-in account could write** (notes, bookmarks, progress, quiz attempts), and no cap on request size. | New `ApiWriteGuardFilter`: 120 writes a minute per account (`WRITE_RATE_LIMIT`; reading is never limited) and bodies over 300 KB are refused with 413 before they are read. Anonymous routes keep their own per-address limits, so a classroom sharing one IP is not affected. nginx `client_max_body_size` lowered from 6 MB to 256 KB, with 15-second header/body timeouts against slow-request attacks, and `server_tokens off`. |
| M13 | **The visitor counter could be inflated with a script** (`POST /api/visitors/increment`, no login, no limit, one database write each). | Over 120 per minute from one address the count is simply not raised and nothing is written; the answer is still a normal 200, so nobody sees an error. |
| M14 | **Link previews were built from the `Host` header** (a spoofed Host could put a wrong address into a page that WhatsApp or a cache keeps). | `og:url` now uses the configured `SITE_URL` (new runtime setting, passed by compose); only without it (local development) does it fall back to the request. Test included. |
| M15 | **The app container ran with all default Linux capabilities.** | `cap_drop: [ALL]` and `no-new-privileges` on the application container (a non-root JVM on a high port needs neither). |

## Low

| # | Issue | Resolution |
|---|---|---|
| L8 | `docker/.env.example` lacked the new settings. | `CSP_MODE`, the four rate limits, `SITE_URL` documented. |
| L9 | README test counts stale. | 181. |

## Checked and found sound (no change needed)

SQL is parameterised everywhere (table names in the export are fixed constants); content and dataset files are served only by manifest name and verified against SHA-256 (no path traversal);
the share-page HTML escapes the topic names; OpenSearch queries are built with a JSON builder (no injection); Google sign-in checks signature, audience, issuer, expiry and `email_verified`;
avatar uploads are checked by type, size and magic bytes; the only `dangerouslySetInnerHTML` renders the course content itself (no user text); the `prod` profile has no default for secrets, CORS or the database URL;
the OTP code comes from `SecureRandom`; actuator metrics need credentials and live on a private port.

## Your action (new)

- **Y6. Server-side grading** (see C10): decide whether certificates need to be trustworthy. If yes, the quiz answer keys must move from the front-end bundle to the server, and `POST /api/quiz/attempts` must accept the learner's answers and score them. That is a feature-sized change that alters the quiz screens, so it was not done silently.
- **Y7. Hardening I did not apply because I could not test it here:** `read_only: true` + a `/tmp` tmpfs on the application container, and `no-new-privileges` on the third-party containers (MySQL, Redis, OpenSearch, Grafana ...). Try them on your staging server one at a time.
- **Y8. The local profile points at `localhost:3306`** (your Docker MySQL's port). While testing I saw it refuse a wrong password, which is what you want, but remember that running `mvn spring-boot:run` locally talks to that database unless you set `SPRING_DATASOURCE_URL`.

---

# Database in the tests (H2 stays, tests only)

H2 is used **only by the automated tests**, never by the running application or the Docker image (`scope test` in `pom.xml`); the application has always used MySQL.
I briefly switched the tests to a MySQL container (Testcontainers) and reverted it at your request: tests need no Docker and start nothing.

The trade-off, stated plainly: H2 is not MySQL, so the test schema is a hand-written copy and the Flyway migrations are not executed by `mvn test`.
That gap is covered by a manual check, which I have done: the app was started against a real MySQL 8.4, all 11 migrations applied from an empty database, and the
sign-up / quiz / export / password-change / delete flow passed 20 of 20 checks. Repeat it before a release that adds a migration (`docs/backend.md`, "Testing against a real MySQL"),
and add each new column to `src/test/resources/test-schema.sql`.

---

# Go-live items: what was done for each

| Item | Result |
|---|---|
| **1. Content-Security-Policy** | Checked in a real headless Chromium against the production-style build (same-origin API, ads configured), with the policy in report-only mode: **10 pages, 0 violations** (home, dashboard, a lesson, privacy, login, flashcards, interview practice, a profile, the HTML viewer and Java compiler pages), the **Google sign-in script loads with 0 violations**, and the **AdSense script loads** once the visitor agrees. That run found one real gap (`ep2.adtrafficquality.google` frames, which AdSense uses): added to `frame-src`, re-run, 0 violations. Default is now **`CSP_MODE=enforce`** (`.env.example`, your `docker/.env`, and the compose default). Not verifiable here: ads actually *rendering* (needs your approved AdSense account) and the JDoodle runner iframe. If either misbehaves, set `CSP_MODE=report-only`. |
| **2. Secrets** | `docker/scripts/generate-secrets.sh` writes 40-character random values for every secret into `docker/.env` (fills empty ones; `--rotate` replaces all, keeps the old root password as `DB_ROOT_PASSWORD_PREVIOUS` so the database login can be changed, backs the old file up, never prints a value). **Run it with `--rotate` on the server.** I did not rotate your real `docker/.env`: the running containers and the database must be restarted in order, which is your decision. |
| **3. Legal text and cookies** | New cookie banner (shown only when ads are configured): nothing from Google's ad network is requested until the visitor clicks *Allow ads*; *No thanks* is remembered; the choice can be changed on the Privacy Policy page. Verified in the browser: banner shown, **0 ad requests before the choice, 0 after "No thanks"**, ad script requested only after "Allow". A real bug found on the way: the first-visit tour overlay covered the banner so it could not be clicked; the banner now sits above it. Contact address: set `VITE_CONTACT_EMAIL`; it is printed on the Privacy and Terms pages. Still yours: have the text reviewed for your country. |
| **A bug found while doing this** | `VITE_ADSENSE_CLIENT`, the three ad slot ids and the contact address were read from `.env` but **never passed into the Docker image build**, so ads could never have been switched on in a Docker deployment. The Dockerfile and compose file now pass them as build arguments. |
| **4. Server items** | `docker/scripts/preflight.sh` checks all of it and prints PASS / WARN / FAIL / TODO without showing any secret: strong secrets, https addresses, CSP mode, SMTP, alert e-mail, off-site backup and encryption, contact address, and on a server: firewall, log rotation, swap, RAM, disk, `vm.max_map_count`, nginx / certbot / fail2ban; and with `dig`: the A records, **SPF and DMARC** of your mail domain, and DKIM with `--dkim-selector`. Run on your current `.env` it reports 0 failures and the open warnings: dev passwords shorter than 16 characters, an `http://` entry in `CORS_ORIGIN`, a non-https `GRAFANA_ROOT_URL`, no `ALERT_EMAIL_TO`, no `BACKUP_REMOTE`, no `BACKUP_ENCRYPT_PASSFILE`, no contact address. The things only a person can do (an outside uptime monitor, GitHub pull-request rules, the legal review, a restore drill) are listed as TODO. |
| **5. `backend/` and `node-server/`** | Looked at, **not deleted**: `backend/` is an old Eclipse `.project` plus `.settings`; `node-server/` holds the old Node server's `.env` (git-ignored, contains an old JWT secret and DB settings). Deleting them is safe if nothing uses the Node server any more; you decide. |

---

# First real deployment: what it taught and what changed

| Observation on the server | Change in the project |
|---|---|
| nginx and its certificates already existed; `server-setup-ubuntu.sh nginx` would have written a second site with the same `server_name` | The script now looks for an existing site for the names and stops without changing anything (`--force` to replace). Tested with four layouts. |
| A leftover database volume had an unknown root password: `db-setup` failed and the app crash-looped (502) | `help.txt` "Problems seen" explains the one-line fix (`DB_ROOT_PASSWORD_PREVIOUS`) and the volume-copy / reset path; the preflight lists the PREVIOUS line as a to-do |
| Grafana's name had no nginx site (nginx welcome page) and the browser warned "Not secure" | The Grafana block of the nginx example sends `upgrade-insecure-requests`; "Existing nginx" in `docs/auto-deploy.md` documents the separate-file way with `certbot --nginx` |
| MySQL port 3306 is taken by Windows' MySQL80 on the PC | `DB_PUBLISH_PORT` is 3307 in the PC's `.env` and 3306 in the server's; documented in `.env`, `help.txt` and the preflight |
| Certificate chain theory (Edge "Not secure") was wrong: both sites use the same Let's Encrypt chain | Nothing to change; do not re-issue certificates repeatedly |

