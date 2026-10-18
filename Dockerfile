# syntax=docker/dockerfile:1.7
#
# One image that serves the API, the built React site and the course content (the jar contains
# the content, so the site is built with VITE_CONTENT_SOURCE=api and reads courses from its own API).
# Build from the repository root (the context needs the whole project):
#
#   docker build -f Dockerfile -t javaschoollab .
#   docker run -p 3001:3001 --env-file /srv/javaschoollab/.env javaschoollab
#
# The image holds no user data: users live in MySQL (DB_HOST...), which must be outside this container.

# ---- Stage 1: build the React site ---------------------------------------------------
FROM node:22-alpine AS web
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --ignore-scripts --no-audit --no-fund --prefer-offline
COPY frontend/ .
# The sitemap and course-stats scripts read the exported course index from the Spring resources (../src from /app).
COPY src/main/resources/content/index.json /src/main/resources/content/index.json
# The site is served by the same Spring Boot app, so the browser calls the API on its own origin.
ARG VITE_API_BASE_URL=/api
ARG VITE_CONTENT_SOURCE=api
ARG SITE_URL=https://javaschoollab.com
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL VITE_CONTENT_SOURCE=$VITE_CONTENT_SOURCE SITE_URL=$SITE_URL NODE_OPTIONS=--max-old-space-size=4096
RUN npm run build

# ---- Stage 2: build the jar with the site baked in -----------------------------------
FROM maven:3.9-eclipse-temurin-21 AS jar
WORKDIR /build
COPY pom.xml .
RUN --mount=type=cache,target=/root/.m2 mvn -B -q dependency:go-offline
COPY src src
# The site was already built in the web stage; this stage has no React project, so the Maven frontend step is skipped.
COPY --from=web /app/dist /site
RUN --mount=type=cache,target=/root/.m2 mvn -B -q -Pwith-site -Dfrontend.skip=true -Dfrontend.dist=/site -DskipTests package

# ---- Stage 3: run ---------------------------------------------------------------------
FROM eclipse-temurin:21-jre
ENV SPRING_PROFILES_ACTIVE=prod
WORKDIR /app
COPY --from=jar /build/target/javaschoollab-server-*.jar app.jar
RUN useradd --system --uid 10001 jsl
USER jsl
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD bash -c 'exec 3<>/dev/tcp/127.0.0.1/${PORT:-3001}' || exit 1
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-jar", "app.jar"]
