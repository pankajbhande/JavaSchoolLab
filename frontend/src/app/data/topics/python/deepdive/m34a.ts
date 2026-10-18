// Module 34 (Docker + Python).
import { dd, r, type DeepDive } from './deepDive';

export const m34a: Record<string, DeepDive> = {
    'Writing a Dockerfile': dd(
        [`A <b>Dockerfile</b> is a text recipe that builds an image: base image, files to copy, commands to run, and the start command. Each instruction creates a cached layer.`,
            r`from pathlib import Path

DOCKERFILE = """\
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
USER 1000
CMD ["python", "main.py"]
"""
Path("Dockerfile").write_text(DOCKERFILE)           # then: docker build -t myapp .
print(len(DOCKERFILE.splitlines()), "instructions written")

# OUTPUT:
# 7 instructions written`],
        [`"Works on my machine" disappears when the OS, Python version and libraries are described in code. A Dockerfile makes the runtime reproducible for teammates, CI and production.`,
            r`import re
# Reproducibility check: is the base image pinned to a version (not :latest)?
line = "FROM python:3.12-slim"
tag = line.split(":")[1]
print("pinned" if tag != "latest" else "floating", "->", tag)

# OUTPUT:
# pinned -> 3.12-slim`],
        [`Every containerised Python service starts from such a file. Order matters: copy dependency files first so pip install is cached until requirements change.`,
            r`# Layer cache model: changing a line invalidates it AND all lines below
layers = ["FROM", "COPY requirements.txt", "RUN pip install", "COPY . .", "CMD"]
changed = "COPY . ."             # you edited source code
i = layers.index(changed)
print("cached  :", layers[:i])
print("rebuilt :", layers[i:])

# OUTPUT:
# cached  : ['FROM', 'COPY requirements.txt', 'RUN pip install']
# rebuilt : ['COPY . .', 'CMD']`],
        [`<b>Advantages:</b> declarative, versionable in git, layer caching speeds rebuilds, same artifact runs everywhere.`,
            r`# .dockerignore keeps junk (and secrets) out of the build context
IGNORE = [".git", ".venv", "__pycache__", "*.pyc", ".env"]
from fnmatch import fnmatch
files = ["app.py", ".env", "x.pyc", ".git"]
print([f for f in files if not any(fnmatch(f, p) for p in IGNORE)])

# OUTPUT:
# ['app.py']`],
        [`<b>Disadvantages:</b> easy to write bloated or insecure images (root user, dev tools, secrets baked in), builds can be non-deterministic if packages float.`,
            r`# Anti-pattern: secret baked into a layer stays in image history forever
bad = 'ENV API_KEY=sk-live-123'
print("leaks via docker history:", "ENV" in bad and "KEY" in bad)

# OUTPUT:
# leaks via docker history: True`],
        [`<b>Limitations:</b> the image shares the host kernel (no Windows container on Linux kernel), a single Dockerfile is linear (no conditionals except ARG/multi-stage), and build context size affects speed.`,
            r`import os
# Build context = everything sent to the daemon. Measure what you would send.
size = sum(os.path.getsize(os.path.join(d, f))
           for d, _, fs in os.walk(".") for f in fs if ".git" not in d)
print("context under 50MB:", size < 50_000_000)

# OUTPUT (example):
# context under 50MB: True`],
        `
   Dockerfile                       docker build
   ┌──────────────────────┐        ┌──────────────────────────────┐
   │ FROM python:3.12-slim│ ─────► │ layer 1  base OS + Python    │
   │ COPY requirements    │        │ layer 2  requirements file   │
   │ RUN pip install      │        │ layer 3  site-packages       │
   │ COPY . .             │        │ layer 4  your source         │
   │ CMD ["python", ...]  │        └──────────────────────────────┘
   └──────────────────────┘             = IMAGE (read-only layers)
`,
        `Pin base images by version or digest, run as non-root, keep images minimal (slim or distroless), and order layers by change frequency. Add a HEALTHCHECK and a proper init. For compile-heavy dependencies use multi-stage builds; do not ship compilers or build tools to production.`
    ),

    'Images & Containers': dd(
        [`An <b>image</b> is an immutable, layered template; a <b>container</b> is a running (or stopped) instance of an image with a thin writable layer. One image can start many containers.`,
            r`import subprocess
# Commands (shown, not executed):
cmds = [
    "docker build -t myapp:1.0 .",       # make an image
    "docker run -d --name web1 myapp:1.0",   # container 1
    "docker run -d --name web2 myapp:1.0",   # container 2 from same image
    "docker ps",                          # list running containers
]
print("\n".join(cmds))

# OUTPUT:
# docker build -t myapp:1.0 .
# docker run -d --name web1 myapp:1.0
# docker run -d --name web2 myapp:1.0
# docker ps`],
        [`Shipping a tested artifact beats shipping instructions. Images are the unit you build once, scan, store in a registry and run anywhere; containers give isolation without a full VM.`,
            r`# Image identity = content hash, so the same tag can be verified
import hashlib
layer = b"FROM python:3.12-slim + pip install"
print("sha256:" + hashlib.sha256(layer).hexdigest()[:12])

# OUTPUT (example):
# sha256:9f2a4c1be77d`],
        [`CI builds an image per commit, pushes to a registry (ECR, GHCR, Docker Hub), and Kubernetes pulls it. The Docker SDK for Python lets scripts drive Docker programmatically.`,
            r`# pip install docker
def list_running():
    import docker
    client = docker.from_env()                     # talks to /var/run/docker.sock
    return [(c.name, c.image.tags) for c in client.containers.list()]
print("docker SDK helper defined:", callable(list_running))

# OUTPUT:
# docker SDK helper defined: True`],
        [`<b>Advantages:</b> fast start (ms to seconds), small compared to VMs, immutable and shareable, strong ecosystem of ready images.`,
            r`# Container isolation primitives (Linux): namespaces + cgroups
primitives = {"pid ns": "own process tree", "net ns": "own network stack",
              "mnt ns": "own filesystem view", "cgroups": "CPU / memory limits"}
for k, v in primitives.items():
    print(f"{k:8} -> {v}")

# OUTPUT:
# pid ns   -> own process tree
# net ns   -> own network stack
# mnt ns   -> own filesystem view
# cgroups  -> CPU / memory limits`],
        [`<b>Disadvantages:</b> weaker isolation than VMs (shared kernel), image sprawl uses disk, data written to the container layer vanishes when it is removed.`,
            r`# Container layer is ephemeral
container_fs = {"/app/data.txt": "important"}
def docker_rm(fs):
    fs.clear()                                  # docker rm -> writable layer gone
docker_rm(container_fs)
print("data after rm:", container_fs)

# OUTPUT:
# data after rm: {}`],
        [`<b>Limitations:</b> must match host CPU architecture (amd64 vs arm64 unless buildx multi-arch), Linux containers need a Linux kernel (Docker Desktop uses a VM on Windows/macOS), not for GUI-heavy apps.`,
            r`import platform
print("this host arch:", platform.machine())
# Build for both:  docker buildx build --platform linux/amd64,linux/arm64 -t app .

# OUTPUT (example):
# this host arch: AMD64`],
        `
              build                    run
   Dockerfile ─────► IMAGE (read-only) ─────► CONTAINER A  [writable layer]
                        │   registry             CONTAINER B  [writable layer]
                        ▼ push/pull              CONTAINER C  [writable layer]
                     ghcr.io/org/app:1.0         (share the same image layers)
`,
        `Treat containers as cattle: stateless, disposable, one process each. Tag with immutable versions or digests (never rely on latest in production), scan images in CI, and sign them. For strong multi-tenant isolation add gVisor/Kata or VMs; containers alone are not a security boundary for hostile code.`
    ),

    'Volumes & Networks': dd(
        [`<b>Volumes</b> are Docker-managed persistent storage outside the container's writable layer; bind mounts map a host folder in. <b>Networks</b> connect containers: on a user-defined network containers reach each other by name.`,
            r`cmds = [
    "docker volume create pgdata",
    "docker run -d -v pgdata:/var/lib/postgresql/data postgres:16",   # named volume
    "docker run -v $(pwd)/src:/app/src myapp",                        # bind mount (dev)
    "docker network create backend",
]
for c in cmds: print(c)

# OUTPUT:
# docker volume create pgdata
# docker run -d -v pgdata:/var/lib/postgresql/data postgres:16
# docker run -v $(pwd)/src:/app/src myapp
# docker network create backend`],
        [`Containers are disposable, but databases and uploads are not: without a volume, removing the container deletes the data. And apps need to find each other without hard-coded IPs.`,
            r`import socket
# Inside a compose network the hostname "db" resolves to the DB container.
# Python code simply uses the service name:
DB_HOST = "db"
print("connect to", (DB_HOST, 5432), "- Docker DNS resolves 'db' to its IP")

# OUTPUT:
# connect to ('db', 5432) - Docker DNS resolves 'db' to its IP`],
        [`Postgres/Redis data directories on volumes, source code bind-mounted for live reload in dev, and separate frontend/backend networks so the DB is not reachable from the proxy.`,
            r`# Persist app uploads on a mounted path
from pathlib import Path
UPLOADS = Path("/data/uploads")           # volume mounted here
def save(name, content):
    UPLOADS.mkdir(parents=True, exist_ok=True)
    (UPLOADS / name).write_bytes(content)
    return str(UPLOADS / name)
print("write helper ready:", UPLOADS)

# OUTPUT:
# write helper ready: /data/uploads`],
        [`<b>Advantages:</b> data outlives containers, volumes are portable and backed up independently, networks give DNS and isolation, bind mounts speed up development.`,
            r`# Network isolation matrix (what can talk to what)
nets = {"frontend": ["proxy", "api"], "backend": ["api", "db"]}
print("proxy can reach db:", any("proxy" in m and "db" in m for m in nets.values()))
print("api   can reach db:", any("api" in m and "db" in m for m in nets.values()))

# OUTPUT:
# proxy can reach db: False
# api   can reach db: True`],
        [`<b>Disadvantages:</b> bind mounts bring host permission/UID mismatches and slow I/O on Windows/macOS; volumes hide stale data; network debugging is harder than local.`,
            r`# UID mismatch: container user 1000 cannot write to a root-owned bind mount
container_uid, dir_owner = 1000, 0
print("can write:", container_uid == dir_owner)   # permission denied

# OUTPUT:
# can write: False`],
        [`<b>Limitations:</b> volumes are tied to one Docker host (not shared across nodes without a volume driver/NFS/CSI), and databases in containers need care for backups and fsync guarantees.`,
            r`# localhost inside a container is the container itself, not the host
inside_container = "localhost"
print("reach host DB with: host.docker.internal (Docker Desktop) or a network service name,",
      "not", inside_container)

# OUTPUT:
# reach host DB with: host.docker.internal (Docker Desktop) or a network service name, not localhost`],
        `
        network: backend
   ┌───────────────────────────────────────────┐
   │  api container ──── DNS "db" ──► db       │
   │                                  │ mounted│
   └──────────────────────────────────┼────────┘
                                      ▼
                            VOLUME pgdata  (survives container removal)
                              /var/lib/postgresql/data
`,
        `Keep containers stateless; put state in managed services (RDS, S3) in production and use volumes mainly for dev and single-host setups. Use named volumes for databases, tmpfs for scratch secrets, read-only mounts where possible, and separate networks by trust zone.`
    ),

    'Docker Compose': dd(
        [`<b>Docker Compose</b> defines a multi-container application in one <code>compose.yaml</code> (services, networks, volumes) and starts it with one command: <code>docker compose up</code>.`,
            r`from pathlib import Path
COMPOSE = """\
services:
  api:
    build: .
    ports: ["8000:8000"]
    depends_on: [db]
  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: dev
"""
Path("compose.yaml").write_text(COMPOSE)
print("services:", [l.strip(" :") for l in COMPOSE.splitlines() if l.startswith("  ") and not l.startswith("    ")])

# OUTPUT:
# services: ['api', 'db']`],
        [`Real apps need an API, database, cache and worker. Starting each with long <code>docker run</code> commands is error-prone; Compose captures the whole topology as code.`,
            r`import subprocess
# One command replaces 4 docker run lines
print(" ".join(["docker", "compose", "up", "-d", "--build"]))
# subprocess.run(["docker", "compose", "up", "-d"], check=True)

# OUTPUT:
# docker compose up -d --build`],
        [`Local development stacks, integration-test environments in CI, demos and small single-server deployments. Compose also provides health-based startup ordering.`,
            r`# Wait for the database before starting the app (readiness, not just started)
import socket, time
def wait_for(host, port, tries=5):
    for i in range(tries):
        try:
            socket.create_connection((host, port), timeout=1).close()
            return True
        except OSError:
            time.sleep(0.2)
    return False
print("db ready:", wait_for("127.0.0.1", 59999, tries=2))

# OUTPUT:
# db ready: False`],
        [`<b>Advantages:</b> one file for the whole stack, reproducible dev environments, built-in networking and DNS, profiles and overrides per environment.`,
            r`# Overrides: compose.yaml + compose.override.yaml merge automatically
base = {"api": {"ports": ["8000:8000"]}}
override = {"api": {"volumes": ["./src:/app/src"]}}
merged = {k: {**base.get(k, {}), **override.get(k, {})} for k in base}
print(merged)

# OUTPUT:
# {'api': {'ports': ['8000:8000'], 'volumes': ['./src:/app/src']}}`],
        [`<b>Disadvantages:</b> depends_on only waits for container start unless healthchecks are set; YAML indentation errors; secrets in plain environment keys get committed.`,
            r`import re
yaml_line = "      POSTGRES_PASSWORD: dev"
print("secret in file:", bool(re.search(r"PASSWORD|TOKEN|KEY", yaml_line)))
# Use env_file: .env (git-ignored) or Docker secrets instead.

# OUTPUT:
# secret in file: True`],
        [`<b>Limitations:</b> single host only, no rolling updates, autoscaling or self-healing across machines; that is the job of Kubernetes/Swarm/ECS.`,
            r`needs = {"multi-node": False, "autoscaling": False, "rolling update": False,
         "restart: unless-stopped": True}
print({k: v for k, v in needs.items() if v})

# OUTPUT:
# {'restart: unless-stopped': True}`],
        `
   compose.yaml
        │ docker compose up
        ▼
   ┌─────────── default network ───────────┐
   │ api :8000 ──► db :5432 (volume)       │
   │   │                                   │
   │   └────────► redis :6379              │
   └───────────────────────────────────────┘
   host port 8000 published to outside
`,
        `Use Compose for dev, CI and small deployments; add healthchecks plus <code>depends_on: condition: service_healthy</code>. For production at scale translate to Kubernetes manifests or a managed container service. Keep one compose file per concern with overrides, and never commit real secrets.`
    ),

    'Environment Variables in Containers': dd(
        [`Containers get configuration at run time through environment variables: <code>docker run -e KEY=value</code>, <code>--env-file</code>, compose <code>environment:</code>, or Kubernetes env/ConfigMaps. The app reads them with <code>os.environ</code>.`,
            r`import os
# docker run -e DATABASE_URL=postgresql://db/app -e LOG_LEVEL=info myapp
os.environ.setdefault("DATABASE_URL", "sqlite:///local.db")   # fallback for local runs
print("db:", os.environ["DATABASE_URL"])

# OUTPUT (no -e passed):
# db: sqlite:///local.db`],
        [`An image must be identical in dev, staging and prod; only configuration changes. Baking values into the image would require a rebuild per environment and can leak secrets.`,
            r`# ENV in a Dockerfile = default; -e at run time overrides it
dockerfile_default = {"LOG_LEVEL": "info"}
runtime = {"LOG_LEVEL": "debug"}
effective = {**dockerfile_default, **runtime}
print(effective)

# OUTPUT:
# {'LOG_LEVEL': 'debug'}`],
        [`Pydantic settings classes load typed config from env at startup; Kubernetes injects them from Secrets; compose loads a git-ignored <code>.env</code> file.`,
            r`# pip install pydantic-settings
from pydantic_settings import BaseSettings
class Settings(BaseSettings):
    database_url: str = "sqlite:///local.db"
    debug: bool = False
    workers: int = 2
import os
os.environ["DEBUG"] = "true"; os.environ["WORKERS"] = "4"
s = Settings()
print(s.debug, s.workers)

# OUTPUT:
# True 4`],
        [`<b>Advantages:</b> twelve-factor compliant, no rebuild to reconfigure, orchestrators support it natively, trivial to override per environment.`,
            r`# --env-file format: KEY=value per line, # comments
env_file = "# prod\nREDIS_URL=redis://cache:6379\nTIMEOUT=30\n"
cfg = dict(l.split("=", 1) for l in env_file.splitlines() if l and not l.startswith("#"))
print(cfg)

# OUTPUT:
# {'REDIS_URL': 'redis://cache:6379', 'TIMEOUT': '30'}`],
        [`<b>Disadvantages:</b> visible with <code>docker inspect</code> and in process listings, can leak into logs or child processes, no validation unless you add it, strings only.`,
            r`import os
secret = "hunter2"
os.environ["DB_PASSWORD"] = secret
# Anyone with docker inspect access sees this. Prefer file-based secrets:
#   /run/secrets/db_password  (Docker secrets / Kubernetes mounted Secret)
from pathlib import Path
def read_secret(name, default=None):
    p = Path("/run/secrets") / name
    return p.read_text().strip() if p.exists() else os.environ.get(name.upper(), default)
print(read_secret("db_password"))

# OUTPUT:
# hunter2`],
        [`<b>Limitations:</b> values are fixed at container start (changing needs a restart), size limits apply, ARG build-time values are not available at run time and appear in image history.`,
            r`# ARG exists only during build; ENV persists in the image
dockerfile = ["ARG VERSION=1.0", "ENV APP_VERSION=$VERSION"]
print("runtime sees only:", dockerfile[1].split()[1].split("=")[0])

# OUTPUT:
# runtime sees only: APP_VERSION`],
        `
   .env / secrets store / ConfigMap
              │ injected at start
              ▼
   docker run -e A=1 ... ──► container process
                               os.environ["A"]
   same image ──► dev (A=1)   prod (A=9)   (config differs, code does not)
`,
        `Separate config (env) from secrets (mounted files or a secret manager with rotation). Validate at boot and fail fast. Never use ARG or ENV for credentials in Dockerfiles; use BuildKit <code>--mount=type=secret</code> for build-time secrets.`
    ),

    'Multi-Stage Builds': dd(
        [`A <b>multi-stage build</b> uses several <code>FROM</code> stages in one Dockerfile: a heavy builder stage (compilers, dev headers) and a lean final stage that copies only the built artifacts.`,
            r`DOCKERFILE = """\
FROM python:3.12 AS builder
WORKDIR /build
COPY requirements.txt .
RUN pip wheel --wheel-dir /wheels -r requirements.txt

FROM python:3.12-slim
COPY --from=builder /wheels /wheels
RUN pip install --no-index --find-links=/wheels /wheels/* && rm -rf /wheels
CMD ["python", "-m", "app"]
"""
stages = [l for l in DOCKERFILE.splitlines() if l.startswith("FROM")]
print(len(stages), "stages:", stages)

# OUTPUT:
# 2 stages: ['FROM python:3.12 AS builder', 'FROM python:3.12-slim']`],
        [`Building packages like numpy or psycopg needs gcc and headers, hundreds of MB that production never needs. Shipping them enlarges the image and the attack surface.`,
            r`# Illustrative sizes (MB)
single_stage = {"base": 1000, "gcc+headers": 400, "app": 50}
multi_stage = {"slim base": 130, "app+wheels": 80}
print("single:", sum(single_stage.values()), "MB | multi:", sum(multi_stage.values()), "MB")

# OUTPUT:
# single: 1450 MB | multi: 210 MB`],
        [`Production Python images use a builder with a virtualenv copied into a slim or distroless runtime. Frontend + backend bundles also use stage one for npm build.`,
            r`# Copy a prebuilt virtualenv between stages
snippet = """\
FROM python:3.12 AS builder
RUN python -m venv /opt/venv && /opt/venv/bin/pip install -r requirements.txt

FROM python:3.12-slim
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
"""
print("PATH set in final stage:", 'ENV PATH' in snippet)

# OUTPUT:
# PATH set in final stage: True`],
        [`<b>Advantages:</b> small images, faster pulls and deploys, smaller attack surface, build tools stay out of production, better cache reuse, a test stage can reuse the builder.`,
            r`# Target a stage: docker build --target test .   (run tests inside the image)
stages = {"builder": "compile", "test": "pytest", "runtime": "serve"}
print("build only up to:", "test", "->", stages["test"])

# OUTPUT:
# build only up to: test -> pytest`],
        [`<b>Disadvantages:</b> longer Dockerfiles, copying the wrong path gives runtime import errors, debugging a distroless image has no shell, native libs must match across stages.`,
            r`# The builder and runtime must share libc/Python version, otherwise .so files fail
builder, runtime = ("python:3.12", "debian12"), ("python:3.12-slim", "debian12")
print("compatible:", builder[1] == runtime[1])
# musl (alpine) wheels differ from glibc wheels -> avoid mixing

# OUTPUT:
# compatible: True`],
        [`<b>Limitations:</b> only filesystem artifacts cross stages (not env or running processes); stage count has no hard cap but each adds build time without cache.`,
            r`crossing = ["files via COPY --from"]
not_crossing = ["ENV", "USER", "installed apt packages (unless copied)", "running state"]
print("crosses:", crossing, "| does not:", not_crossing[:2])

# OUTPUT:
# crosses: ['files via COPY --from'] | does not: ['ENV', 'USER']`],
        `
   Stage 1: builder (big)                 Stage 2: runtime (small)
   ┌───────────────────────┐              ┌───────────────────────┐
   │ python:3.12 + gcc     │  COPY --from │ python:3.12-slim      │
   │ pip wheel / venv      │ ───────────► │ /opt/venv  + app code │
   │ ~1.4 GB               │  only result │ ~200 MB  (shipped)    │
   └───────────────────────┘              └───────────────────────┘
        discarded after build
`,
        `Make multi-stage the default for anything with native dependencies. Use uv or pip wheel in the builder, cache mounts (<code>--mount=type=cache</code>), a non-root user and a minimal final image; use distroless only if you accept no shell for debugging (use ephemeral debug containers instead).`
    ),

    'Project: FastAPI + PostgreSQL + Redis': dd(
        [`A complete three-tier stack: <b>FastAPI</b> serves HTTP, <b>PostgreSQL</b> stores durable data, <b>Redis</b> caches and queues. Docker Compose wires them into one command.`,
            r`from pathlib import Path
COMPOSE = """\
services:
  api:
    build: .
    ports: ["8000:8000"]
    environment:
      DATABASE_URL: postgresql://app:app@db:5432/app
      REDIS_URL: redis://cache:6379/0
    depends_on:
      db: {condition: service_healthy}
  db:
    image: postgres:16
    environment: {POSTGRES_USER: app, POSTGRES_PASSWORD: app, POSTGRES_DB: app}
    volumes: [pgdata:/var/lib/postgresql/data]
    healthcheck: {test: ["CMD-SHELL", "pg_isready -U app"], interval: 5s}
  cache:
    image: redis:7
volumes:
  pgdata:
"""
Path("compose.yaml").write_text(COMPOSE)
print("lines:", len(COMPOSE.splitlines()))

# OUTPUT:
# lines: 18`],
        [`Each component has a different job: SQL gives transactions and durability, Redis gives microsecond reads, FastAPI gives async HTTP. Splitting them lets each scale and fail independently.`,
            r`# Cache-aside pattern: check Redis first, fall back to Postgres
cache, db = {}, {1: "Ada"}
def get_user(uid):
    if uid in cache:
        return cache[uid], "cache hit"
    val = db[uid]; cache[uid] = val
    return val, "db read"
print(get_user(1)); print(get_user(1))

# OUTPUT:
# ('Ada', 'db read')
# ('Ada', 'cache hit')`],
        [`This is the standard backend shape for SaaS products: stateless API replicas behind a load balancer, one primary database, a shared cache for sessions and rate limits.`,
            r`# app/main.py
from fastapi import FastAPI
import os

app = FastAPI()
DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://app:app@localhost/app")

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/users/{uid}")
def user(uid: int):
    return {"id": uid, "source": "db-or-cache"}

# docker compose up  ->  curl localhost:8000/health
# OUTPUT:
# {"status":"ok"}`],
        [`<b>Advantages:</b> one command to run the full stack, production-like locally, services replaceable (swap Redis for Valkey), data persisted via volume, hostnames by service name.`,
            r`import redis   # pip install redis
def counter(host="cache"):
    r = redis.Redis(host=host, port=6379, decode_responses=True)
    return r.incr("hits")                     # atomic across all API replicas
print("atomic counter helper ready:", callable(counter))

# OUTPUT:
# atomic counter helper ready: True`],
        [`<b>Disadvantages:</b> more moving parts to monitor, schema migrations need coordination (Alembic), cache invalidation bugs, dev passwords in compose must never reach production.`,
            r`# Stale cache problem: DB updated, cache not
db = {"price": 10}; cache = {"price": 10}
db["price"] = 12                  # update DB only
print("db:", db["price"], "| cache:", cache["price"], "-> stale")
cache.pop("price")                # invalidate on write
print("after invalidation, next read hits DB")

# OUTPUT:
# db: 12 | cache: 10 -> stale
# after invalidation, next read hits DB`],
        [`<b>Limitations:</b> a single Compose host is a single point of failure; Redis default persistence may lose recent writes; one Postgres primary caps write throughput; no autoscaling.`,
            r`capacity = {"api replicas": "scale out easily", "postgres writes": "scale up / shard / replicas for reads",
            "redis memory": "bounded by RAM (eviction policy needed)"}
for k, v in capacity.items(): print(f"{k:16}: {v}")

# OUTPUT:
# api replicas    : scale out easily
# postgres writes : scale up / shard / replicas for reads
# redis memory    : bounded by RAM (eviction policy needed)`],
        `
   client ──HTTP :8000──► ┌────────────┐
                          │  FastAPI   │
                          │  (uvicorn) │
                          └──┬──────┬──┘
              SQL :5432      │      │   :6379
        ┌────────────────────┘      └───────────────┐
        ▼                                           ▼
   ┌──────────────┐                           ┌──────────┐
   │ PostgreSQL   │                           │  Redis   │
   │ volume pgdata│                           │  cache   │
   └──────────────┘                           └──────────┘
`,
        `Run migrations as a separate one-shot job, add healthchecks and connection pooling (PgBouncer), set Redis eviction and TTLs, and use managed Postgres/Redis in production. Keep the API stateless so it scales horizontally; treat Redis as disposable cache, never as the only copy of data.`
    ),
};
