// Module 26 (API Development), part A: Flask and FastAPI topics.
import { dd, r, type DeepDive } from './deepDive';

export const m26a: Record<string, DeepDive> = {
    'Flask: Routes, Request & Response': dd(
        [`<b>Flask</b> is a micro web framework: you map URL patterns to Python functions with <code>@app.route</code>, read input from the global <code>request</code> object and return a string, dict or Response. It brings routing and templating but leaves database, auth and validation to you.`,
            r`from flask import Flask, request, jsonify

app = Flask(__name__)                      # the WSGI application object

@app.get("/hello/<name>")                  # <name> is a URL variable
def hello(name):
    shout = request.args.get("shout") == "1"        # query string ?shout=1
    return jsonify(msg=f"Hello {name}", shout=shout)  # dict -> JSON response

client = app.test_client()                 # call the app without starting a server
resp = client.get("/hello/Ada?shout=1")
print(resp.status_code, resp.get_json())

# OUTPUT:
# 200 {'msg': 'Hello Ada', 'shout': True}`],
        [`Browsers, mobile apps and other services talk HTTP. A web framework parses the raw request, picks the right function, and builds a correct response (status, headers, body) so you only write business logic.`,
            r`from flask import Flask, request

app = Flask(__name__)

@app.post("/echo")
def echo():
    data = request.get_json()              # parsed JSON request body
    return {"you_sent": data}, 201         # (body, status code) tuple

c = app.test_client()
resp = c.post("/echo", json={"x": 1})
print(resp.status_code, resp.get_json())

# OUTPUT:
# 201 {'you_sent': {'x': 1}}`],
        [`Typical uses: small REST microservices, internal admin tools, webhooks receivers (Stripe/GitHub), ML model serving endpoints, and prototypes that later grow with blueprints and extensions.`,
            r`from flask import Flask, jsonify, abort

app = Flask(__name__)
PRODUCTS = {1: {"name": "Pen", "price": 2.5}, 2: {"name": "Book", "price": 9.0}}

@app.get("/products/<int:pid>")            # int converter rejects non-numbers
def product(pid):
    item = PRODUCTS.get(pid)
    if item is None:
        abort(404)                         # raises an HTTP 404 error
    return jsonify(item)

c = app.test_client()
print(c.get("/products/2").get_json())
print(c.get("/products/9").status_code)
print(c.get("/products/abc").status_code)  # converter fails -> no route matches

# OUTPUT:
# {'name': 'Book', 'price': 9.0}
# 404
# 404`],
        [`<b>Advantages:</b> tiny learning curve, explicit and flexible, huge extension ecosystem (Flask-SQLAlchemy, Flask-Login), easy testing via the test client, decorators keep routes next to handlers.`,
            r`from flask import Flask

app = Flask(__name__)

@app.get("/a")
def a(): return "A"

@app.get("/b")
def b(): return "B"

# the URL map is introspectable - handy for debugging and docs
for rule in sorted(app.url_map.iter_rules(), key=lambda x: x.rule):
    if rule.endpoint != "static":
        print(rule.rule, sorted(rule.methods - {"HEAD", "OPTIONS"}))

# OUTPUT:
# /a ['GET']
# /b ['GET']`],
        [`<b>Disadvantages:</b> no built-in validation or serialization, so every handler repeats manual checks; no automatic API docs; global <code>request</code> proxies can confuse newcomers.`,
            r`from flask import Flask, request, jsonify

app = Flask(__name__)

@app.post("/age")
def age():
    body = request.get_json(silent=True)           # None if the JSON is invalid
    # manual validation - you write this for EVERY endpoint
    if not body or not isinstance(body.get("age"), int):
        return jsonify(error="age must be an int"), 400
    return jsonify(next_year=body["age"] + 1)

c = app.test_client()
print(c.post("/age", json={"age": "x"}).status_code)
print(c.post("/age", json={"age": 30}).get_json())

# OUTPUT:
# 400
# {'next_year': 31}`],
        [`<b>Limitations:</b> <code>app.run()</code> is a development server only; Flask is synchronous (WSGI) so one worker handles one request at a time; <code>request</code> only works inside a request context.`,
            r`from flask import Flask, request

app = Flask(__name__)

try:
    print(request.args)                    # no request is active here
except RuntimeError as e:
    print(str(e).splitlines()[0])

# Production: run with a WSGI server and several workers, e.g.
#   gunicorn -w 4 module:app

# OUTPUT:
# Working outside of request context.`],
        `
   Client ──HTTP──► WSGI server ──► Flask app
                    (gunicorn)       │
                                     ▼
                              URL map (routing)
                                     │  /hello/<name>
                                     ▼
                         view function(request ctx)
                                     │
                                     ▼
                         Response (status+headers+body)
`,
        `Flask suits small to medium services where you want to choose each component. For larger teams or contract-first APIs, prefer FastAPI (typed validation, OpenAPI) or Django (batteries). Always deploy behind gunicorn/uwsgi with multiple workers, keep handlers thin, and move logic into plain service functions that are easy to unit test.`
    ),

    'Flask: Middleware & Blueprints': dd(
        [`Flask has no "middleware" class; instead it offers hooks (<code>before_request</code>, <code>after_request</code>, <code>errorhandler</code>) and raw WSGI wrapping. <b>Blueprints</b> group related routes and hooks into a reusable module that is registered on the app under a URL prefix.`,
            r`from flask import Flask, Blueprint

users = Blueprint("users", __name__, url_prefix="/users")   # a route bundle

@users.get("/")
def list_users():
    return {"users": ["ada", "bob"]}

app = Flask(__name__)
app.register_blueprint(users)              # plug the bundle into the app

print(app.test_client().get("/users/").get_json())

# OUTPUT:
# {'users': ['ada', 'bob']}`],
        [`One file with 80 routes becomes unmaintainable. Blueprints split the API by feature (auth, billing, admin), and hooks give a single place for cross-cutting concerns such as logging, CORS headers and authentication.`,
            r`from flask import Flask, request, g

app = Flask(__name__)

@app.before_request                         # runs before EVERY request
def load_user():
    g.user = request.headers.get("X-User", "anonymous")   # g = per-request store

@app.get("/me")
def me():
    return {"user": g.user}

c = app.test_client()
print(c.get("/me").get_json())
print(c.get("/me", headers={"X-User": "ada"}).get_json())

# OUTPUT:
# {'user': 'anonymous'}
# {'user': 'ada'}`],
        [`Real apps use an <i>application factory</i> plus one blueprint per domain, with after_request adding security or CORS headers, and error handlers returning consistent JSON errors.`,
            r`from flask import Flask, Blueprint, jsonify

def create_app():                           # application factory pattern
    app = Flask(__name__)
    api = Blueprint("api", __name__, url_prefix="/api/v1")

    @api.get("/ping")
    def ping(): return {"pong": True}

    @app.after_request                      # add a header to every response
    def add_headers(resp):
        resp.headers["X-Content-Type-Options"] = "nosniff"
        return resp

    @app.errorhandler(404)                  # uniform JSON errors
    def not_found(e): return jsonify(error="not found"), 404

    app.register_blueprint(api)
    return app

c = create_app().test_client()
r1 = c.get("/api/v1/ping")
print(r1.get_json(), r1.headers["X-Content-Type-Options"])
print(c.get("/nope").get_json())

# OUTPUT:
# {'pong': True} nosniff
# {'error': 'not found'}`],
        [`<b>Advantages:</b> clean modular layout, blueprints can be reused/tested in isolation, hooks avoid repeating code, and a short-circuit from before_request (returning a response) skips the view.`,
            r`from flask import Flask, request

app = Flask(__name__)

@app.before_request
def require_key():
    if request.headers.get("X-Key") != "secret":
        return {"error": "forbidden"}, 403   # returning a value stops the chain

@app.get("/data")
def data(): return {"ok": True}

c = app.test_client()
print(c.get("/data").status_code)
print(c.get("/data", headers={"X-Key": "secret"}).status_code)

# OUTPUT:
# 403
# 200`],
        [`<b>Disadvantages:</b> hooks are app-global and implicit, so execution order is hard to see; blueprint-level and app-level hooks mix; circular imports are common in big projects.`,
            r`from flask import Flask

app = Flask(__name__)
order = []

@app.before_request
def first(): order.append("first")

@app.before_request
def second(): order.append("second")        # runs in registration order

@app.get("/")
def index():
    order.append("view"); return "ok"

app.test_client().get("/")
print(order)        # you must remember the registration order yourself

# OUTPUT:
# ['first', 'second', 'view']`],
        [`<b>Limitations:</b> Flask hooks work at the Flask level, not for other WSGI apps. For true middleware (wrap the whole WSGI callable) you must wrap <code>app.wsgi_app</code>.`,
            r`from flask import Flask

app = Flask(__name__)

@app.get("/")
def index(): return "hi"

class Timer:                                # classic WSGI middleware
    def __init__(self, wsgi): self.wsgi = wsgi
    def __call__(self, environ, start_response):
        environ["x.seen"] = True            # can touch the raw environ
        return self.wsgi(environ, start_response)

app.wsgi_app = Timer(app.wsgi_app)          # wrap, do not replace app itself
print(app.test_client().get("/").text)

# OUTPUT:
# hi`],
        `
   request ──► WSGI middleware (wsgi_app wrapper)
                    │
                    ▼
            before_request hooks ──(response?)──► short-circuit
                    │
                    ▼
        Blueprint route  /users/<id>   (url_prefix applied)
                    │
                    ▼
            after_request hooks ──► response
`,
        `Use one blueprint per bounded context and an app factory so tests can build isolated apps. Keep hooks for truly cross-cutting logic only; business rules belong in services. When you need async or per-route dependencies, the hook model becomes limiting - that is a signal to move to FastAPI dependencies.`
    ),

    'FastAPI: Routes & Pydantic': dd(
        [`<b>FastAPI</b> builds APIs from Python type hints. Path/query parameters and request bodies are declared as function arguments; <b>Pydantic</b> models validate and convert the data automatically and generate JSON schema.`,
            r`from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.testclient import TestClient

app = FastAPI()

class Item(BaseModel):                      # request body schema
    name: str
    price: float

@app.post("/items/{item_id}")
def create(item_id: int, item: Item, q: str = "none"):   # path, body, query
    return {"id": item_id, "item": item, "q": q}

c = TestClient(app)
print(c.post("/items/7?q=hot", json={"name": "Pen", "price": "2.5"}).json())

# OUTPUT:
# {'id': 7, 'item': {'name': 'Pen', 'price': 2.5}, 'q': 'hot'}`],
        [`Hand-written validation is repetitive and error-prone. Declaring types gives automatic parsing ("2.5" becomes float), clear 422 error messages, editor auto-complete and free documentation.`,
            r`from fastapi import FastAPI
from pydantic import BaseModel, Field
from fastapi.testclient import TestClient

app = FastAPI()

class Item(BaseModel):
    name: str = Field(min_length=1)
    price: float = Field(gt=0)              # constraint lives in the model

@app.post("/items")
def add(item: Item): return item

c = TestClient(app)
bad = c.post("/items", json={"name": "Pen", "price": -1})
print(bad.status_code, bad.json()["detail"][0]["loc"], bad.json()["detail"][0]["msg"])

# OUTPUT:
# 422 ['body', 'price'] Input should be greater than 0`],
        [`Used for high-throughput JSON APIs, ML inference services, backends-for-frontends and microservices where typed contracts between teams matter. Response models filter fields (e.g. hide passwords).`,
            r`from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.testclient import TestClient

app = FastAPI()

class UserIn(BaseModel):
    name: str
    password: str

class UserOut(BaseModel):                   # what the client is allowed to see
    name: str

@app.post("/users", response_model=UserOut, status_code=201)
def register(u: UserIn):
    return u                                # password is filtered out

r1 = TestClient(app).post("/users", json={"name": "ada", "password": "pw"})
print(r1.status_code, r1.json())

# OUTPUT:
# 201 {'name': 'ada'}`],
        [`<b>Advantages:</b> validation + serialization + docs from one declaration, async support, very fast (Starlette + Pydantic core), great editor support and testability.`,
            r`from fastapi import FastAPI
from fastapi.testclient import TestClient

app = FastAPI()

@app.get("/square/{n}")
def square(n: int):                         # n is converted to int automatically
    return {"n": n, "square": n * n}

c = TestClient(app)
print(c.get("/square/12").json())
print(c.get("/square/abc").status_code)     # invalid path param -> 422, no code needed

# OUTPUT:
# {'n': 12, 'square': 144}
# 422`],
        [`<b>Disadvantages:</b> Pydantic coercion can surprise (e.g. "1" becomes 1 in lax mode), the dependency/type machinery has a learning curve, and it is younger than Django/Flask with faster-moving APIs.`,
            r`from pydantic import BaseModel, ConfigDict

class Lax(BaseModel):
    n: int

class Strict(BaseModel):
    model_config = ConfigDict(strict=True)  # opt in to no coercion
    n: int

print(Lax(n="5"))                           # string silently converted
try:
    Strict(n="5")
except Exception as e:
    print(type(e).__name__)

# OUTPUT:
# n=5
# ValidationError`],
        [`<b>Limitations:</b> validation costs CPU per request for huge payloads; a sync <code>def</code> endpoint runs in a thread pool; there is no built-in ORM, admin or auth UI.`,
            r`from fastapi import FastAPI
from fastapi.testclient import TestClient
import threading

app = FastAPI()

@app.get("/who")
def who():                                  # plain def -> executed in a worker thread
    return {"threaded": threading.current_thread() is not threading.main_thread()}

print(TestClient(app).get("/who").json())

# OUTPUT:
# {'threaded': True}`],
        `
   JSON body ──► Starlette routing ──► Pydantic validate ──► endpoint(args)
                                              │ invalid
                                              ▼
                                       422 + error detail
   endpoint return ──► response_model filter ──► JSON response
`,
        `Treat Pydantic models as your API contract: separate input, output and database models so internals never leak. Use strict mode for money/ID fields, version the API by path, and run behind uvicorn/gunicorn workers. Avoid FastAPI when you need server-rendered pages with admin tooling - Django is more economical there.`
    ),

    'FastAPI: Dependency Injection': dd(
        [`FastAPI's <b>dependency injection</b> lets an endpoint declare what it needs with <code>Depends(func)</code>. The framework calls the dependency first, passes its result in, and caches it per request. Dependencies may themselves have dependencies.`,
            r`from fastapi import FastAPI, Depends
from fastapi.testclient import TestClient

app = FastAPI()

def pagination(skip: int = 0, limit: int = 10):   # reusable query params
    return {"skip": skip, "limit": limit}

@app.get("/items")
def items(page: dict = Depends(pagination)):      # injected
    return page

print(TestClient(app).get("/items?limit=5").json())

# OUTPUT:
# {'skip': 0, 'limit': 5}`],
        [`Without DI, each endpoint repeats DB-session handling, auth checks and common parameters, and tests cannot swap real services for fakes. DI centralises this and makes override trivial.`,
            r`from fastapi import FastAPI, Depends
from fastapi.testclient import TestClient

app = FastAPI()

class Repo:                                 # a "database" we want to swap in tests
    def users(self): return ["real-db-user"]

def get_repo(): return Repo()

@app.get("/users")
def users(repo: Repo = Depends(get_repo)):
    return repo.users()

class FakeRepo:
    def users(self): return ["test-user"]

app.dependency_overrides[get_repo] = lambda: FakeRepo()   # swap for tests
print(TestClient(app).get("/users").json())

# OUTPUT:
# ['test-user']`],
        [`The classic production use: a database session per request that is always closed, via a dependency with <code>yield</code> (setup before, cleanup after the response).`,
            r`from fastapi import FastAPI, Depends
from fastapi.testclient import TestClient
import sqlite3

app = FastAPI()
events = []

def get_db():
    con = sqlite3.connect(":memory:")       # open per request
    events.append("open")
    try:
        yield con                           # endpoint runs here
    finally:
        con.close(); events.append("close")  # always executed

@app.get("/one")
def one(db: sqlite3.Connection = Depends(get_db)):
    return db.execute("SELECT 1").fetchone()[0]

print(TestClient(app).get("/one").json(), events)

# OUTPUT:
# 1 ['open', 'close']`],
        [`<b>Advantages:</b> declarative, testable (overrides), composable (sub-dependencies), cached per request, integrates with OpenAPI (security schemes and parameters appear in docs).`,
            r`from fastapi import FastAPI, Depends
from fastapi.testclient import TestClient

app = FastAPI()
calls = []

def settings():
    calls.append("settings"); return {"env": "prod"}

def service(cfg: dict = Depends(settings)): return cfg["env"]
def audit(cfg: dict = Depends(settings)): return cfg["env"]

@app.get("/x")
def x(a: str = Depends(service), b: str = Depends(audit)):
    return [a, b]

print(TestClient(app).get("/x").json(), calls)   # settings ran once (cached)

# OUTPUT:
# ['prod', 'prod'] ['settings']`],
        [`<b>Disadvantages:</b> hidden control flow (values appear "from nowhere"), long dependency chains are hard to trace, and the default-argument syntax looks unusual.`,
            r`from fastapi import FastAPI, Depends
from fastapi.testclient import TestClient

app = FastAPI()

def a(): return 1
def b(x: int = Depends(a)): return x + 1
def c(y: int = Depends(b)): return y + 1

@app.get("/")
def root(z: int = Depends(c)):              # a -> b -> c -> root
    return z

print(TestClient(app).get("/").json())      # 3, but who produced it? follow the chain

# OUTPUT:
# 3`],
        [`<b>Limitations:</b> dependencies are resolved only for path operations/routers (not arbitrary functions); there is no scoping beyond per-request (no singleton scope built in), so singletons use module globals or lru_cache.`,
            r`from functools import lru_cache
from fastapi import Depends, FastAPI
from fastapi.testclient import TestClient

app = FastAPI()
created = []

@lru_cache                                  # app-wide singleton, not per request
def get_config():
    created.append(1); return {"debug": False}

@app.get("/cfg")
def cfg(c: dict = Depends(get_config)): return c

t = TestClient(app)
t.get("/cfg"); t.get("/cfg"); t.get("/cfg")
print(len(created))                         # created only once across 3 requests

# OUTPUT:
# 1`],
        `
   request
      │
      ▼
   endpoint(user=Depends(current_user))
      │                      │
      │            Depends(get_db) ──► yield session
      │                      │             │
      ▼                      ▼             ▼
   resolve graph  ──►  run deps (cache per request) ──► call endpoint
                                                            │
                                      cleanup (code after yield)
`,
        `Use DI for infrastructure seams (DB, clock, HTTP clients, current user) and keep domain logic as plain functions that take parameters. Use dependency_overrides in tests instead of monkeypatching. For large systems, a dedicated container library or explicit constructor wiring avoids the implicit magic of nested Depends.`
    ),

    'FastAPI: Authentication': dd(
        [`<b>Authentication</b> answers "who are you?". FastAPI ships security helpers (<code>OAuth2PasswordBearer</code>, <code>HTTPBearer</code>, API keys) that read credentials from headers and document them in OpenAPI. You write a dependency that turns a token into a user.`,
            r`from fastapi import FastAPI, Depends
from fastapi.security import OAuth2PasswordBearer
from fastapi.testclient import TestClient

app = FastAPI()
oauth2 = OAuth2PasswordBearer(tokenUrl="token")      # reads "Authorization: Bearer ..."

@app.get("/me")
def me(token: str = Depends(oauth2)):
    return {"token": token}

c = TestClient(app)
print(c.get("/me").status_code, c.get("/me").json())
print(c.get("/me", headers={"Authorization": "Bearer abc"}).json())

# OUTPUT:
# 401 {'detail': 'Not authenticated'}
# {'token': 'abc'}`],
        [`APIs are public on the internet. Without authentication anyone can read or change data. Tokens let a stateless server identify the caller on every request without sessions.`,
            r`from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from fastapi.testclient import TestClient

app = FastAPI()
oauth2 = OAuth2PasswordBearer(tokenUrl="token")
TOKENS = {"tok-ada": "ada"}                          # token -> user (demo store)

def current_user(token: str = Depends(oauth2)):
    user = TOKENS.get(token)
    if not user:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid token",
                            headers={"WWW-Authenticate": "Bearer"})
    return user

@app.get("/profile")
def profile(user: str = Depends(current_user)): return {"user": user}

c = TestClient(app)
print(c.get("/profile", headers={"Authorization": "Bearer nope"}).status_code)
print(c.get("/profile", headers={"Authorization": "Bearer tok-ada"}).json())

# OUTPUT:
# 401
# {'user': 'ada'}`],
        [`Real systems store only salted password hashes, issue short-lived signed tokens (JWT) and check them on every call. Below: hashing with the standard library and a signed, expiring token.`,
            r`import hashlib, hmac, os, time, base64, json

def hash_password(pw: str) -> str:
    salt = os.urandom(16)
    dk = hashlib.scrypt(pw.encode(), salt=salt, n=2**14, r=8, p=1)
    return salt.hex() + ":" + dk.hex()

def verify(pw: str, stored: str) -> bool:
    salt_hex, dk_hex = stored.split(":")
    dk = hashlib.scrypt(pw.encode(), salt=bytes.fromhex(salt_hex), n=2**14, r=8, p=1)
    return hmac.compare_digest(dk.hex(), dk_hex)     # constant-time compare

SECRET = b"change-me"
def make_token(user, ttl=60):
    body = base64.urlsafe_b64encode(json.dumps({"sub": user, "exp": time.time() + ttl}).encode())
    sig = hmac.new(SECRET, body, "sha256").hexdigest()
    return body.decode() + "." + sig

stored = hash_password("s3cret")
print(verify("s3cret", stored), verify("wrong", stored))
print(make_token("ada").count("."))

# OUTPUT:
# True False
# 1`],
        [`<b>Advantages:</b> stateless scaling (any server can verify a token), standard schemes show up in Swagger UI's "Authorize" button, and dependencies can enforce roles/scopes per route or whole router.`,
            r`from fastapi import FastAPI, Depends, HTTPException
from fastapi.testclient import TestClient

app = FastAPI()

def require_role(role: str):                         # dependency factory
    def check(x_role: str = "guest"):                # header-like demo via query param
        if x_role != role:
            raise HTTPException(403, "Insufficient role")
        return x_role
    return check

@app.get("/admin", dependencies=[Depends(require_role("admin"))])
def admin(): return {"secret": 42}

c = TestClient(app)
print(c.get("/admin").status_code, c.get("/admin?x_role=admin").json())

# OUTPUT:
# 403 {'secret': 42}`],
        [`<b>Disadvantages:</b> bearer tokens cannot be revoked until they expire, you must implement refresh and rotation yourself, and getting crypto details wrong creates real vulnerabilities.`,
            r`import time

# A stateless token stays valid until "exp" - logout cannot kill it.
token = {"sub": "ada", "exp": time.time() + 3600}
revoked = set()                                       # revocation needs STATE again

def is_valid(t):
    return t["exp"] > time.time() and t["sub"] not in revoked

print(is_valid(token))
revoked.add("ada")                                    # the denylist reintroduces a store
print(is_valid(token))

# OUTPUT:
# True
# False`],
        [`<b>Limitations:</b> FastAPI provides parsing helpers only - no user model, password reset, MFA or sessions. Use a vetted library (PyJWT, Authlib) or an identity provider rather than rolling your own.`,
            r`# Never compare secrets with == (timing attack); use hmac.compare_digest.
import hmac

expected = "a1b2c3"
print(hmac.compare_digest("a1b2c3", expected))
print(hmac.compare_digest("a1b2c4", expected))

# Real JWT usage (needs: pip install pyjwt)
#   import jwt
#   token = jwt.encode({"sub": "ada"}, "key", algorithm="HS256")
#   jwt.decode(token, "key", algorithms=["HS256"])

# OUTPUT:
# True
# False`],
        `
   POST /token (user+password)
        │ verify hash
        ▼
   issue signed token (exp, sub)
        │
        ▼
   client stores ──► Authorization: Bearer <token>
                           │
                           ▼
   API ──► Depends(oauth2) ──► verify signature/exp ──► current_user ──► endpoint
                           └─ invalid ──► 401
`,
        `Prefer delegating identity to an OIDC provider (Auth0, Keycloak, Cognito) and only validating tokens in the API. Keep access tokens short (5-15 min) with refresh tokens, always use HTTPS, hash with scrypt/argon2, and put authorization (roles/permissions) in dependencies applied at router level so no route is forgotten.`
    ),

    'FastAPI: Async Endpoints & Background Tasks': dd(
        [`An <code>async def</code> endpoint runs on the event loop and can <code>await</code> I/O without blocking other requests. <b>BackgroundTasks</b> run a function after the response has been sent, so the client does not wait for slow follow-up work.`,
            r`import asyncio
from fastapi import FastAPI
from fastapi.testclient import TestClient

app = FastAPI()

@app.get("/slow")
async def slow():
    await asyncio.sleep(0.01)               # yields to the loop while "waiting"
    return {"done": True}

print(TestClient(app).get("/slow").json())

# OUTPUT:
# {'done': True}`],
        [`APIs mostly wait on databases, HTTP calls and files. With async, one process serves thousands of waiting connections; background tasks let you reply fast and send emails or write audit logs afterwards.`,
            r`import asyncio, time

async def fetch(i):
    await asyncio.sleep(0.1)                # simulated network call
    return i

async def main():
    t = time.perf_counter()
    out = await asyncio.gather(fetch(1), fetch(2), fetch(3))   # concurrent
    print(out, round(time.perf_counter() - t, 1))

asyncio.run(main())

# OUTPUT (time varies slightly):
# [1, 2, 3] 0.1`],
        [`Typical: sign-up endpoint saves the user, returns 201 immediately and sends the welcome email in the background.`,
            r`from fastapi import FastAPI, BackgroundTasks
from fastapi.testclient import TestClient

app = FastAPI()
outbox = []

def send_email(to: str):                    # slow job, runs after the response
    outbox.append(f"welcome sent to {to}")

@app.post("/signup", status_code=201)
async def signup(email: str, bg: BackgroundTasks):
    bg.add_task(send_email, email)          # queued, not executed yet
    return {"status": "created"}

resp = TestClient(app).post("/signup?email=ada@x.com")
print(resp.status_code, outbox)             # TestClient waits for background tasks

# OUTPUT:
# 201 ['welcome sent to ada@x.com']`],
        [`<b>Advantages:</b> high concurrency per process, lower memory than thread-per-request, natural fit for WebSockets/streaming, and zero extra infrastructure for light background work.`,
            r`import asyncio

async def worker(name, delay, log):
    await asyncio.sleep(delay)
    log.append(name)

async def main():
    log = []
    await asyncio.gather(worker("slow", 0.03, log), worker("fast", 0.01, log))
    print(log)                              # finishes in completion order, not call order

asyncio.run(main())

# OUTPUT:
# ['fast', 'slow']`],
        [`<b>Disadvantages:</b> the whole call chain must be async-aware; one forgotten blocking call stalls every request; debugging and tracebacks are harder; background tasks are lost if the process dies.`,
            r`import asyncio, time

async def bad():
    time.sleep(0.1)                         # BLOCKS the whole event loop

async def good():
    await asyncio.sleep(0.1)                # cooperative

async def run(fn):
    t = time.perf_counter()
    await asyncio.gather(fn(), fn(), fn())
    return round(time.perf_counter() - t, 1)

print("blocking:", asyncio.run(run(bad)))
print("async   :", asyncio.run(run(good)))

# OUTPUT (approx):
# blocking: 0.3
# async   : 0.1`],
        [`<b>Limitations:</b> BackgroundTasks run in the same process with no retry, persistence or scheduling. Heavy or critical jobs need a real queue (Celery, RQ, Arq). CPU-bound work still blocks the loop.`,
            r`import asyncio

def cpu_heavy(n):                           # CPU-bound: do NOT run on the event loop
    return sum(i * i for i in range(n))

async def main():
    # push the work to a thread (or better a process pool / task queue)
    result = await asyncio.to_thread(cpu_heavy, 100_000)
    print(result)

asyncio.run(main())

# OUTPUT:
# 333328333350000`],
        `
   client ──► uvicorn (1 event loop)
                 │
       ┌─────────┼──────────┐
       ▼         ▼          ▼
    async ep   async ep   def ep ──► thread pool
    await db   await http
       │
       └──► response sent ──► BackgroundTasks run after
`,
        `Choose async when the workload is I/O-bound and your drivers (asyncpg, httpx, motor) are async; otherwise sync endpoints in a thread pool are simpler and fine. For durable background work use a broker-backed queue with retries and idempotent jobs; keep BackgroundTasks for best-effort, fast side effects.`
    ),
};
