# syntax=docker/dockerfile:1.7
#
# One image that serves the API, the built React site and the course content (the jar contains
# the content, so the site is built with VITE_CONTENT_SOURCE=api and reads courses from its own API).
# This file lives in docker/, but the build CONTEXT is the project root (the folder that holds frontend/, src/ and pom.xml),
# because the build copies from there. docker/docker-compose.yml does exactly that (context: .., dockerfile: docker/Dockerfile).
# By hand, from the project root:
#
#   docker build -f docker/Dockerfile -t javaschoollab .
#   docker run -p 3001:3001 --env-file /srv/javaschoollab/.env javaschoollab
#
# The image holds no user data: users live in MySQL (DB_HOST...), which must be outside this container (the shared database
# stack in docker/docker-compose.shared.yml).

# ---- Stage 1: build the React site ---------------------------------------------------
FROM node:25-alpine AS web
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --ignore-scripts --no-audit --no-fund --prefer-offline
COPY frontend/ .
# The sitemap and course-stats scripts read the exported course index from the Spring resources (../src from /app).
COPY src/main/resources/content/index.json /src/main/resources/content/index.json
# The site is served by the same Spring Boot app, so the browser calls the API on its own origin.
ARG VITE_API_BASE_URL=/api
ARG VITE_CONTENT_SOURCE=api
ARG SITE_URL=https://javaschoollab.dhipansoft.in
ARG VITE_ADSENSE_CLIENT=
ARG VITE_AD_SLOT_RAIL_TOP=
ARG VITE_AD_SLOT_RAIL_BOTTOM=
ARG VITE_AD_SLOT_CORNER=
ARG VITE_CONTACT_EMAIL=
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL VITE_CONTENT_SOURCE=$VITE_CONTENT_SOURCE SITE_URL=$SITE_URL \
    VITE_ADSENSE_CLIENT=$VITE_ADSENSE_CLIENT VITE_AD_SLOT_RAIL_TOP=$VITE_AD_SLOT_RAIL_TOP VITE_AD_SLOT_RAIL_BOTTOM=$VITE_AD_SLOT_RAIL_BOTTOM \
    VITE_AD_SLOT_CORNER=$VITE_AD_SLOT_CORNER VITE_CONTACT_EMAIL=$VITE_CONTACT_EMAIL NODE_OPTIONS=--max-old-space-size=4096
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
# Fonts for the share-preview pictures (the slim JRE image has none).
RUN apt-get update && apt-get install -y --no-install-recommends fontconfig fonts-dejavu-core && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=jar /build/target/javaschoollab-server-*.jar app.jar
RUN useradd --system --uid 10001 jsl
USER jsl
EXPOSE 3001 9001
# Readiness probe on the private management port (Spring Boot Actuator): HTTP 200 on /actuator/health/readiness.
HEALTHCHECK --interval=30s --timeout=5s --start-period=90s --retries=3 \
  CMD bash -c 'exec 3<>/dev/tcp/127.0.0.1/${MANAGEMENT_PORT:-9001} && printf "GET /actuator/health/readiness HTTP/1.0\r\n\r\n" >&3 && head -n1 <&3 | grep -q " 200 "' || exit 1
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-jar", "app.jar"]
