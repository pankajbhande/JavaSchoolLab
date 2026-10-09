# JavaSchoolLab

An e-learning platform for Java and full-stack engineering, by DHIPAN Software Technologies
Private Limited. 31 courses, 324 modules, 3,588 topics.

Originally exported from Figma Make; the original design file is at
https://www.figma.com/design/gtngZSr87ttljv0gRx680l/JavaSchoolLab-Website-Development

## Running locally

Three tiers have to be up. MySQL is not installed as a Windows service here, so it has to
be started by hand before the API.

### 1. MySQL

Start your local MySQL server, then create the schema (once):

```sql
CREATE DATABASE IF NOT EXISTS javaschoollab;
```

Then apply the migrations (re-runnable, every statement is IF NOT EXISTS):

```bash
mysql -u root -p javaschoollab < server/migrations/001_learning_progress.sql
```

Tables: `users`, `certificates`, `otp_codes`, `visitor_count`, plus `topic_progress`,
`quiz_attempts` and `study_days` for learning progress.

### 2. API server

```bash
cd server
npm install
cp .env.example .env      # then set JWT_SECRET and your DB password
npm start                 # http://localhost:3001
```

`server/.env` is git-ignored and the server refuses to boot without `JWT_SECRET`.
Generate one with:

```bash
node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
```

### 3. Front end

```bash
npm install
npm run dev               # http://localhost:5173
```

No front-end `.env` is needed locally; the API base defaults to `http://localhost:3001/api`.
For a deployed build set `VITE_API_BASE_URL` (see `.env.example`).

## Scripts

| Command              | What it does                                        |
| -------------------- | --------------------------------------------------- |
| `npm run dev`        | Vite dev server with HMR                            |
| `npm run typecheck`  | `tsc --noEmit` — the type checker, no emit          |
| `npm run build`      | Typecheck, then production bundle                   |
| `npm run build:fast` | Bundle only, skipping the typecheck                 |
| `npm test`           | Run the unit suite once (Vitest)                    |
| `npm run test:watch` | Vitest in watch mode                                |
| `npm run verify`     | typecheck + tests + production build                |
| `npm run gen:course-stats` | Regenerate per-course topic counts (see below) |

## Tests

`npm test` — 69 tests across 5 files, about 13 seconds. The suite is deliberately narrow:
it covers the logic that is easy to break silently and expensive to get wrong, not the UI.

| File | Guards |
| --- | --- |
| `server/lib/progress.test.js` | XP and streak arithmetic, and the MySQL DATE timezone handling |
| `src/app/services/quizEngine.test.ts` | Answer-position fairness, shuffle integrity, bank resolution |
| `src/app/services/contentSearch.test.ts` | Multi-term matching, ranking, regex safety |
| `src/app/lib/slug.test.ts` | URL collisions and round-tripping across all 3,588 real topics |
| `src/app/data/courseStats.test.ts` | The generated stats file has not drifted from the tree |

Two regressions are pinned explicitly because both actually shipped:

- **Answer position.** The original generator hard-coded the correct answer to option 0
  and never shuffled, so a student could score 100% without reading anything. The suite
  asserts a uniform 22–28% distribution across 3,000 attempts.
- **Timezone.** `toISOString()` on a MySQL DATE rolls the day back for any timezone ahead
  of UTC, so "today" never matched and study time always read zero. The suite runs pinned
  to `Asia/Kolkata` (see `vitest.config.ts`) — in UTC the bug would pass unnoticed.

Both were mutation-checked: reintroducing each bug turns the suite red.

`server/lib/progress.js` exists so this arithmetic can be tested without booting Express
or connecting to MySQL; `server/index.js` imports it rather than keeping its own copy.

## Architecture

```
src/
  main.tsx              entry
  app/
    App.tsx             routing shell + providers + the /dashboard page
    CourseWorkspace.tsx the course UI, lazy-loaded (see "Bundle" below)
    components/         UI. ContentArea/Sidebar/RightSidebar are the workspace
    context/            AuthContext (JWT in localStorage, plus guest mode)
    data/
      types.ts          THE content model. One definition, used everywhere.
      coursesData.ts    aggregates all 31 courses
      topics/           topic content files (3,588 topics in total)
      quiz/             authored assessment banks (see docs/quiz-banks.md)
    services/
      api.ts            typed API client
      quizEngine.ts     assessment engine: selection, shuffling, scoring
server/
  index.js              Express + MySQL API
```

Routing is URL-driven: `/course/:courseId/:subTopicId/:topicId`, with `?level=expert`
selecting the harder content tier. `src/app/lib/slug.ts` maps ids containing spaces onto
URL-safe segments.

### Bundle

`CourseWorkspace` is lazy-loaded because it statically imports every topic. Visitors land
on `/dashboard`, which renders without any course content: about **152 kB gzip** of JS+CSS,
against roughly 1.35 MB before the split. Course content arrives on first course open.

### Learning progress

Progress used to live only in `localStorage`, so it was per-browser and invisible to the
platform. It is now server-backed per account:

- `ProgressContext` owns visited topics, XP, streak and study time. Guests still record
  progress locally, and it is imported to their account on first sign-in.
- XP and streaks are **derived server-side** from `topic_progress`, `quiz_attempts` and
  `study_days` on every request, so they cannot be inflated by a client.
- Every quiz attempt is stored, pass or fail. Failures drive the review queue, which
  schedules a module to come back sooner the weaker the best score was
  (<70% next day, <85% 3 days, <95% a week, otherwise 3 weeks).
- `src/app/data/courseStats.ts` is **generated** (`npm run gen:course-stats`). The
  dashboard needs per-course topic totals for its completion bars but must not import
  `coursesData`, which would undo the code split. `CourseWorkspace` asserts the two agree
  in dev builds, so a stale count shows up in the console.

### Responsive layout

The three-pane workspace only fits from `lg` up. Below that, `useMediaQuery` switches to a
single-column shell and both sidebars become overlay drawers reached from a mobile toolbar.
This is a structural switch rather than a CSS one, because the drawers need their own
open/closed state, a backdrop, Escape handling, and to close when a topic is picked.

Verified in headless Chrome at 390 / 430 / 768 / 1024 / 1440 px:

| Width | Header | Horizontal overflow | Visible sidebars |
| ---: | ---: | --- | ---: |
| 390 | 124px | none | 0 (drawers) |
| 430 | 124px | none | 0 (drawers) |
| 768 | 136px | none | 0 (drawers) |
| 1024 | 84px | none | 2 |
| 1440 | 84px | none | 2 |

That pass found and fixed a real bug: the header row and its widget cluster were both
non-wrapping flex rows, so the cluster measured 467px against a 390px viewport and Chrome
zoomed the whole page out to 685px. Both now wrap, the logo and wordmark scale down, and
the informational widgets (clock, study timer, voice picker) move up a breakpoint each so
the header stays a single 84px row from `lg` up instead of wrapping to 141px.

The mobile toolbar carries three controls: **Contents**, **Search** and **Notes & Q&A**.
Tapping Search expands it to fill the bar (a 44px field on a phone is unusable) and focuses
the input; results render in the main pane through the same full-text index as desktop.
Escape or the close button clears the query, and picking a result closes search and lands
on the topic. This exists because the header search box is `hidden md:flex`, so before it
there was no way to reach search on a phone at all.

### SEO

Every route sets its own title, description, canonical URL, Open Graph/Twitter tags and
JSON-LD (`useDocumentMeta`) — previously all topics shared one title, so search
results, history entries and shared links were indistinguishable.

`npm run gen:sitemap` writes `public/sitemap.xml` (3,381 URLs) and `public/robots.txt` from
the real course tree, and it runs as part of `npm run build` so it cannot go stale. The
generator uses the same `slugify` as the router; an earlier verification pass (503 URLs at
the time) confirmed every URL resolved to a real route. Set `SITE_URL` to your production origin.

**Known limit:** this is a client-rendered SPA, so metadata is only visible to crawlers
that execute JavaScript. The sitemap makes the URLs discoverable, but a prerender or SSR
step is what would make each of the 3,588 topics reliably indexable.

### Favicons

`public/favicon.ico`, `favicon-32.png` and `apple-touch-icon.png` are generated from the
brand logo by `npm run gen:favicon` (decodes and re-encodes through headless Chrome, so
there is no image-processing dependency). Re-run it only when the logo changes.

The source is `src/assets/logo1.jpg`. It was previously named `logo1.png` while actually
being a JPEG, alongside a `logo.png` that was a 12-byte text file reading "placeholder";
both have been corrected. The generator re-encodes rather than copying, because JPEG is
not a usable favicon format.

### Accessibility

- A skip link (first tab stop) jumps past the header, course strip and sidebar.
- One `<main id="main-content">` per route, plus named landmarks: `<nav aria-label="Courses">`
  and both sidebars labelled so they are distinguishable.
- Every icon-only button carries an `aria-label`. `title` was the only text before, which
  screen readers treat inconsistently and touch users never see.
- The mobile drawer is a real dialog: focus moves in on open, Tab is trapped inside it,
  Escape and a backdrop click close it, and focus returns to the button that opened it.
- A visible `:focus-visible` ring, and `prefers-reduced-motion` disables content animation.

### Search

Search covers full lesson text, not just titles. The index is built lazily in the browser
from data the workspace already downloaded (3,588 topics, now far more than the original ~3 MB of text, about 50 ms), and
matches on all query terms rather than the exact phrase, so "hashmap collision" finds the
topic that explains both.

### Assessments

Tests are built only from reviewed question banks in `src/app/data/quiz/banks/`. Modules
with no bank say so and offer no certificate, rather than serving a generated quiz.
See `docs/quiz-banks.md` to add one.
