# syntax=docker/dockerfile:1.7

# ---- Stage 1: build the static site -------------------------------------------------
FROM node:22-alpine AS build
WORKDIR /app

# Install first so this layer is cached until the lockfile changes.
# --ignore-scripts: the unused "doppiojvm" dependency downloads a JDK in its install script, which fails/hangs in Docker.
COPY frontend/package.json frontend/package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --ignore-scripts --no-audit --no-fund --prefer-offline

COPY frontend/ .
# The sitemap and course-stats scripts read the exported course index from the Spring resources (../src from /app).
COPY src/main/resources/content/index.json /src/main/resources/content/index.json

# VITE_* values are inlined into the bundle at build time, not read at runtime.
# "/api" makes the browser call the same origin, where nginx proxies to the API container.
ARG VITE_API_BASE_URL=/api
ARG VITE_ADSENSE_CLIENT=
ARG VITE_AD_SLOT_RAIL_TOP=
ARG VITE_AD_SLOT_RAIL_BOTTOM=
ARG VITE_AD_SLOT_CORNER=
ARG SITE_URL=https://javaschoollab.com
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_ADSENSE_CLIENT=$VITE_ADSENSE_CLIENT \
    VITE_AD_SLOT_RAIL_TOP=$VITE_AD_SLOT_RAIL_TOP \
    VITE_AD_SLOT_RAIL_BOTTOM=$VITE_AD_SLOT_RAIL_BOTTOM \
    VITE_AD_SLOT_CORNER=$VITE_AD_SLOT_CORNER \
    SITE_URL=$SITE_URL \
    NODE_OPTIONS=--max-old-space-size=4096

# Sitemap + typecheck + production build (same as `npm run build`).
RUN npm run build

# ---- Stage 2: serve with nginx ------------------------------------------------------
FROM nginx:1.27-alpine AS runtime

RUN rm /etc/nginx/conf.d/default.conf
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO /dev/null http://127.0.0.1/healthz || exit 1
