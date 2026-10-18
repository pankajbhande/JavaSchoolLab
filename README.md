# JavaSchoolLab

A learning site for Java, Spring, SQL, web and more: 31 courses, quizzes, certificates, progress tracking and public learner profiles.

```
pom.xml, src/   Spring Boot (Maven) project: the API, the course content and the web hosting.  <- import THIS folder into STS
frontend/        React + TypeScript site (Vite). Built and served by the Spring Boot app, or run on its own while developing
node-server/     the original Node/Express API, kept until the Spring Boot backend replaces it everywhere
docker/          docker compose files (Spring + MySQL; or nginx + Express) and the nginx config
docs/            authoring notes and backend details (docs/backend.md)
```

## Open it in STS (Spring Tools Suite)

1. **File > Import > Maven > Existing Maven Projects**.
2. Set **Root Directory** to this repository folder (the one containing `pom.xml`) and finish. Java 21 is required.
3. Before running, set the database and secret: copy `application.properties.example` to `application.properties`
   and fill in `spring.datasource.password` and `app.jwt.secret` (that file is git-ignored).
4. Run `JavaSchoolLabApplication` (**Run As > Spring Boot App**). It starts on http://localhost:3001; Flyway creates the tables.

The React app lives in `frontend/`. After `npm install` it has a large `node_modules`; if STS feels slow, right-click `frontend` > Properties > Resource > Resource Filters and exclude it, or leave `npm install` to the Maven build (`-Pwith-site`), which keeps its own copy under `target/`.

## Everyday commands

| What | Where | Command |
|---|---|---|
| Run the API | repository root | `mvn spring-boot:run` |
| Backend tests (126, H2) | repository root | `mvn test` |
| One jar with the site inside | repository root | `mvn -Pwith-site -DskipTests package`, then `java -jar target/javaschoollab-server-0.1.0.jar` |
| React dev server | `frontend/` | `npm install`, then `npm run dev` (needs the backend on :3001) |
| Front-end tests and type check | `frontend/` | `npm test`, `npm run typecheck` |
| Re-export the course content | `frontend/` | `npm run export:content` (writes into `src/main/resources`) |
| Spring + MySQL in Docker | repository root | `cd docker && docker compose -f docker-compose.spring.yml up -d --build` |

More detail: `docs/backend.md` (API, architecture, deployment) and `frontend/README.md` (the React app).
