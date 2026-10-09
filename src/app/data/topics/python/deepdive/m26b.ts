// Module 26 (API Development), part B: OpenAPI and Django topics.
import { dd, r, type DeepDive } from './deepDive';

export const m26b: Record<string, DeepDive> = {
    'FastAPI: OpenAPI Docs': dd(
        [`FastAPI generates an <b>OpenAPI</b> schema (a JSON description of every route, parameter and model) from your code. It serves it at <code>/openapi.json</code> and renders interactive Swagger UI at <code>/docs</code> and ReDoc at <code>/redoc</code>.`,
            r`from fastapi import FastAPI

app = FastAPI(title="Shop API", version="1.0.0")

@app.get("/items/{item_id}", summary="Fetch one item")
def read_item(item_id: int):
    return {"id": item_id}

schema = app.openapi()                      # the same dict served at /openapi.json
print(schema["info"]["title"], schema["info"]["version"])
print(list(schema["paths"]))
print(schema["paths"]["/items/{item_id}"]["get"]["summary"])

# OUTPUT:
# Shop API 1.0.0
# ['/items/{item_id}']
# Fetch one item`],
        [`Consumers of an API need an accurate, always-current contract. A schema generated from the code never drifts, and tools can generate client SDKs, mock servers and tests from it.`,
            r`from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.testclient import TestClient

app = FastAPI()

class Item(BaseModel):
    name: str
    price: float

@app.post("/items")
def add(item: Item): return item

c = TestClient(app)
spec = c.get("/openapi.json").json()
print(spec["openapi"][:1])                  # spec version starts with 3
print(sorted(spec["components"]["schemas"]["Item"]["properties"]))
print(c.get("/docs").status_code)           # Swagger UI page

# OUTPUT:
# 3
# ['name', 'price']
# 200`],
        [`Teams publish the schema to partners, generate typed TypeScript/Java clients with openapi-generator, and import it into Postman or API gateways. Tags, descriptions and examples make the docs useful.`,
            r`from fastapi import FastAPI
from pydantic import BaseModel, Field
from fastapi.testclient import TestClient

app = FastAPI(openapi_tags=[{"name": "orders", "description": "Order operations"}])

class Order(BaseModel):
    sku: str = Field(description="Product code", examples=["PEN-1"])
    qty: int = Field(1, ge=1)

@app.post("/orders", tags=["orders"], response_description="The created order")
def create(order: Order):
    """Create an order. The docstring becomes the endpoint description."""
    return order

op = TestClient(app).get("/openapi.json").json()["paths"]["/orders"]["post"]
print(op["tags"], op["description"])

# OUTPUT:
# ['orders'] Create an order. The docstring becomes the endpoint description.`],
        [`<b>Advantages:</b> zero-maintenance docs, interactive "Try it out", machine-readable contract, validation rules (min/max/regex) appear automatically as schema constraints.`,
            r`from fastapi import FastAPI, Query
from fastapi.testclient import TestClient

app = FastAPI()

@app.get("/search")
def search(q: str = Query(min_length=3, max_length=20, description="Search text")):
    return {"q": q}

param = TestClient(app).get("/openapi.json").json()["paths"]["/search"]["get"]["parameters"][0]
print(param["name"], param["required"], param["schema"]["minLength"])

# OUTPUT:
# q True 3`],
        [`<b>Disadvantages:</b> docs are only as good as your annotations; exposing /docs in production leaks the API surface; very large schemas make Swagger UI slow.`,
            r`from fastapi import FastAPI

# Typical hardening: disable the public docs in production
app = FastAPI(docs_url=None, redoc_url=None, openapi_url=None)

@app.get("/")
def root(): return {"ok": True}

from fastapi.testclient import TestClient
c = TestClient(app)
print(c.get("/docs").status_code, c.get("/openapi.json").status_code)

# OUTPUT:
# 404 404`],
        [`<b>Limitations:</b> it describes HTTP request/response only (no business rules or workflows), cannot express every Python type, and custom responses (streaming, raw Response) need manual <code>responses=</code> metadata.`,
            r`from fastapi import FastAPI
from fastapi.responses import PlainTextResponse
from fastapi.testclient import TestClient

app = FastAPI()

@app.get("/health", response_class=PlainTextResponse,
         responses={503: {"description": "Service degraded"}})   # documented by hand
def health(): return "ok"

op = TestClient(app).get("/openapi.json").json()["paths"]["/health"]["get"]
print(sorted(op["responses"]))

# OUTPUT:
# ['200', '503']`],
        `
   Python code (types, models, decorators)
        │ introspected at startup
        ▼
   OpenAPI 3 JSON  ──► /openapi.json
        │
        ├──► Swagger UI  (/docs)
        ├──► ReDoc       (/redoc)
        └──► client SDK generators, API gateways, contract tests
`,
        `Treat the generated schema as the API contract: commit it, diff it in CI to catch breaking changes, and generate client SDKs from it. Disable or protect the docs endpoints in production, set stable operation_ids for SDK method names, and document error responses explicitly.`
    ),

    'Django: Models, Views & Templates': dd(
        [`Django follows the <b>MTV</b> pattern: a <b>Model</b> defines data (and maps to a table), a <b>View</b> is a function/class that takes a request and returns a response, and a <b>Template</b> renders HTML with <code>{{ variables }}</code> and <code>{% tags %}</code>. URLs route requests to views.`,
            r`import django
from django.conf import settings

settings.configure(DATABASES={"default": {"ENGINE": "django.db.backends.sqlite3", "NAME": ":memory:"}},
                   INSTALLED_APPS=[], ALLOWED_HOSTS=["*"])
django.setup()

from django.db import models, connection

class Book(models.Model):                   # becomes table demo_book
    title = models.CharField(max_length=100)
    pages = models.IntegerField(default=100)
    class Meta: app_label = "demo"

with connection.schema_editor() as editor:  # normally done by "migrate"
    editor.create_model(Book)

Book.objects.create(title="Dune", pages=412)
print(Book.objects.get(title="Dune").pages)

# OUTPUT:
# 412`],
        [`Raw HTTP handling plus SQL plus string-built HTML is slow and insecure. Django splits responsibilities, auto-escapes template output (blocking XSS) and gives a consistent project layout every Django developer knows.`,
            r`import django
from django.conf import settings
settings.configure(ALLOWED_HOSTS=["*"]); django.setup()

from django.template import Engine, Context

tpl = Engine().from_string("<p>Hello {{ name }}!</p>")
print(tpl.render(Context({"name": "<script>alert(1)</script>"})))   # auto-escaped

# OUTPUT:
# <p>Hello &lt;script&gt;alert(1)&lt;/script&gt;!</p>`],
        [`Content sites, e-commerce, dashboards and admin-heavy internal tools. A view fetches data, passes a context to a template and returns an HttpResponse; the URLconf maps paths to views.`,
            r`import django
from django.conf import settings
settings.configure(ALLOWED_HOSTS=["*"]); django.setup()

from django.http import HttpResponse
from django.template import Engine, Context
from django.test import RequestFactory
from django.urls import path

TEMPLATE = Engine().from_string("{% for b in books %}- {{ b|upper }}\n{% endfor %}")

def book_list(request, genre):              # a function-based view
    books = ["dune", "emma"] if genre == "all" else []
    return HttpResponse(TEMPLATE.render(Context({"books": books})))

urlpatterns = [path("books/<str:genre>/", book_list)]     # URLconf entry

req = RequestFactory().get("/books/all/")                 # fake request, no server
resp = book_list(req, genre="all")
print(resp.status_code); print(resp.content.decode())

# OUTPUT:
# 200
# - DUNE
# - EMMA`],
        [`<b>Advantages:</b> batteries included (ORM, admin, auth, forms, migrations, security defaults), consistent structure, mature ecosystem and documentation, great for CRUD-heavy apps.`,
            r`import django
from django.conf import settings
settings.configure(ALLOWED_HOSTS=["*"]); django.setup()

from django import forms

class ContactForm(forms.Form):              # validation + HTML form from one class
    email = forms.EmailField()
    age = forms.IntegerField(min_value=18)

f = ContactForm({"email": "not-an-email", "age": "17"})
print(f.is_valid())
print(sorted(f.errors))

# OUTPUT:
# False
# ['age', 'email']`],
        [`<b>Disadvantages:</b> monolithic and opinionated, heavier than micro-frameworks, synchronous at its core (async support is partial), and the ORM can hide inefficient queries.`,
            r`import django
from django.conf import settings
settings.configure(DATABASES={"default": {"ENGINE": "django.db.backends.sqlite3", "NAME": ":memory:"}},
                   INSTALLED_APPS=[]); django.setup()
from django.db import models, connection

class Author(models.Model):
    name = models.CharField(max_length=50)
    class Meta: app_label = "demo"

# Hidden cost: the ORM happily runs one query per loop iteration unless you optimise.
print(str(Author.objects.filter(name="Ada").query))

# OUTPUT:
# SELECT "demo_author"."id", "demo_author"."name" FROM "demo_author" WHERE "demo_author"."name" = Ada`],
        [`<b>Limitations:</b> models need an app and migrations in a real project (shown here only for demo); templates deliberately limit logic; one request thread per worker unless you use ASGI.`,
            r`from django.template import Engine, Context

# Templates intentionally cannot run arbitrary Python
engine = Engine()
t = engine.from_string("{{ items|length }} items, first={{ items.0 }}")
print(t.render(Context({"items": ["a", "b"]})))     # filters and lookups only

# OUTPUT:
# 2 items, first=a`],
        `
   Browser ──► urls.py ──► View (function / class)
                              │        │
                         ┌────┘        └────┐
                         ▼                  ▼
                   Model (ORM)         Template (HTML)
                         │                  ▲
                         ▼                  │ context
                      Database ──► data ────┘
                              │
                              ▼
                        HttpResponse
`,
        `Django excels when you need admin, auth and relational CRUD quickly and want one well-trodden structure for a large team. Keep fat logic in services/model methods, not templates or views; use select_related/prefetch_related early. For pure JSON microservices, a lighter stack (FastAPI) avoids unused weight.`
    ),

    'Django ORM': dd(
        [`The <b>Django ORM</b> maps model classes to tables and lets you query with Python: <code>Model.objects.filter(...)</code> builds a lazy <b>QuerySet</b> that turns into SQL only when evaluated.`,
            r`import django
from django.conf import settings
settings.configure(DATABASES={"default": {"ENGINE": "django.db.backends.sqlite3", "NAME": ":memory:"}},
                   INSTALLED_APPS=[]); django.setup()
from django.db import models, connection

class Book(models.Model):
    title = models.CharField(max_length=100)
    pages = models.IntegerField()
    class Meta: app_label = "demo"

with connection.schema_editor() as e: e.create_model(Book)
Book.objects.bulk_create([Book(title="A", pages=100), Book(title="B", pages=300), Book(title="C", pages=500)])

qs = Book.objects.filter(pages__gt=200).order_by("-pages")   # lazy: no SQL yet
print([b.title for b in qs])                                 # evaluated here

# OUTPUT:
# ['C', 'B']`],
        [`Writing SQL strings by hand mixes languages, invites injection and ties you to one database. The ORM parameterises values, is portable across SQLite/PostgreSQL/MySQL and integrates with migrations.`,
            r`import django
from django.conf import settings
settings.configure(DATABASES={"default": {"ENGINE": "django.db.backends.sqlite3", "NAME": ":memory:"}},
                   INSTALLED_APPS=[]); django.setup()
from django.db import models, connection

class User(models.Model):
    name = models.CharField(max_length=50)
    class Meta: app_label = "demo"
with connection.schema_editor() as e: e.create_model(User)

User.objects.create(name="x'; DROP TABLE demo_user; --")      # hostile input
print(User.objects.filter(name="x'; DROP TABLE demo_user; --").count())  # still safe

# OUTPUT:
# 1`],
        [`Real code uses aggregates, F expressions for atomic updates, and Q objects for OR logic - all done in the database, not in Python loops.`,
            r`import django
from django.conf import settings
settings.configure(DATABASES={"default": {"ENGINE": "django.db.backends.sqlite3", "NAME": ":memory:"}},
                   INSTALLED_APPS=[]); django.setup()
from django.db import models, connection
from django.db.models import Avg, Count, F, Q

class Product(models.Model):
    name = models.CharField(max_length=50)
    stock = models.IntegerField()
    price = models.FloatField()
    class Meta: app_label = "demo"
with connection.schema_editor() as e: e.create_model(Product)
Product.objects.bulk_create([Product(name="pen", stock=5, price=2.0),
                             Product(name="book", stock=0, price=10.0),
                             Product(name="bag", stock=2, price=30.0)])

print(Product.objects.aggregate(avg=Avg("price"), n=Count("id")))
Product.objects.filter(stock__gt=0).update(stock=F("stock") - 1)   # atomic in SQL
print(list(Product.objects.filter(Q(stock=0) | Q(price__gt=20)).values_list("name", flat=True)))

# OUTPUT:
# {'avg': 14.0, 'n': 3}
# ['book', 'bag']`],
        [`<b>Advantages:</b> readable, composable and lazy (chain filters then run once), safe by default, automatic joins across relations (<code>author__name</code>), and a migration system built on the models.`,
            r`import django
from django.conf import settings
settings.configure(DATABASES={"default": {"ENGINE": "django.db.backends.sqlite3", "NAME": ":memory:"}},
                   INSTALLED_APPS=[]); django.setup()
from django.db import models, connection

class Item(models.Model):
    n = models.IntegerField()
    class Meta: app_label = "demo"

qs = Item.objects.filter(n__gte=5).exclude(n=7).order_by("n")   # composing builds SQL, no query
print(str(qs.query))

# OUTPUT:
# SELECT "demo_item"."id", "demo_item"."n" FROM "demo_item" WHERE ("demo_item"."n" >= 5 AND NOT ("demo_item"."n" = 7)) ORDER BY "demo_item"."n" ASC`],
        [`<b>Disadvantages:</b> the N+1 query trap, abstraction leaks for complex SQL, and ORM objects are heavier than raw rows.`,
            r`import django
from django.conf import settings
settings.configure(DATABASES={"default": {"ENGINE": "django.db.backends.sqlite3", "NAME": ":memory:"}},
                   INSTALLED_APPS=[]); django.setup()
from django.db import models, connection
from django.test.utils import CaptureQueriesContext

class Author(models.Model):
    name = models.CharField(max_length=20)
    class Meta: app_label = "demo"
class Post(models.Model):
    author = models.ForeignKey(Author, on_delete=models.CASCADE)
    class Meta: app_label = "demo"
with connection.schema_editor() as e:
    e.create_model(Author); e.create_model(Post)
for n in ("a", "b", "c"):
    Post.objects.create(author=Author.objects.create(name=n))

with CaptureQueriesContext(connection) as q1:
    [p.author.name for p in Post.objects.all()]                  # 1 + 3 queries
with CaptureQueriesContext(connection) as q2:
    [p.author.name for p in Post.objects.select_related("author")]  # 1 JOIN query
print(len(q1), len(q2))

# OUTPUT:
# 4 1`],
        [`<b>Limitations:</b> very complex reporting SQL (window functions, recursive CTEs) is awkward; QuerySets cache results after first evaluation; <code>.update()</code> and bulk operations skip model <code>save()</code> signals.`,
            r`import django
from django.conf import settings
settings.configure(DATABASES={"default": {"ENGINE": "django.db.backends.sqlite3", "NAME": ":memory:"}},
                   INSTALLED_APPS=[]); django.setup()
from django.db import models, connection

class Counter(models.Model):
    n = models.IntegerField(default=0)
    class Meta: app_label = "demo"
with connection.schema_editor() as e: e.create_model(Counter)
Counter.objects.create(n=1)

# Escape hatch for SQL the ORM cannot express: raw SQL, still parameterised
rows = Counter.objects.raw("SELECT id, n FROM demo_counter WHERE n >= %s", [1])
print([c.n for c in rows])

# OUTPUT:
# [1]`],
        `
   Model.objects.filter(...)  ──► QuerySet (lazy, chainable)
                                     │ evaluate: iterate / list / len / get
                                     ▼
                               SQL compiler ──► DB backend (SQLite/PG/MySQL)
                                     │
                                     ▼
                               rows ──► Model instances (cached on the QuerySet)
`,
        `Learn the SQL each QuerySet generates (str(qs.query), django-debug-toolbar) and enforce select_related/prefetch_related in code review. Put query logic in custom managers/QuerySet methods, use transactions and F() for concurrency safety, and fall back to raw SQL or database views for analytics rather than contorting the ORM.`
    ),

    'Django: Middleware & Authentication': dd(
        [`<b>Middleware</b> is a chain of hooks around every request/response, listed in <code>settings.MIDDLEWARE</code>. Django's <b>authentication</b> system (users, password hashing, sessions, permissions) is itself provided partly by middleware that sets <code>request.user</code>.`,
            r`import django
from django.conf import settings
settings.configure(ALLOWED_HOSTS=["*"]); django.setup()
from django.http import HttpResponse
from django.test import RequestFactory

def timing_middleware(get_response):        # function-style middleware factory
    def middleware(request):
        # code here runs BEFORE the view
        response = get_response(request)    # call the next layer / the view
        response["X-Seen"] = "yes"          # code here runs AFTER the view
        return response
    return middleware

view = lambda request: HttpResponse("ok")
wrapped = timing_middleware(view)
resp = wrapped(RequestFactory().get("/"))
print(resp.content, resp["X-Seen"])

# OUTPUT:
# b'ok' yes`],
        [`Cross-cutting needs (security headers, sessions, logging, rate limiting, CSRF) apply to every request; writing them in each view is duplicated and error-prone. Authentication needs safe password storage, which Django provides.`,
            r`import django
from django.conf import settings
settings.configure(); django.setup()
from django.contrib.auth.hashers import make_password, check_password

stored = make_password("s3cret")            # salted, slow PBKDF2 hash
print(stored.split("$")[0])                 # algorithm name
print(check_password("s3cret", stored), check_password("wrong", stored))

# OUTPUT:
# pbkdf2_sha256
# True False`],
        [`A typical stack: SecurityMiddleware, SessionMiddleware, CsrfViewMiddleware, AuthenticationMiddleware plus custom ones. Views are protected with decorators or mixins like <code>login_required</code>.`,
            r`import django
from django.conf import settings
settings.configure(ALLOWED_HOSTS=["*"]); django.setup()
from django.http import HttpResponse, HttpResponseForbidden
from django.test import RequestFactory

def api_key_middleware(get_response):
    def mw(request):
        if request.headers.get("X-Api-Key") != "k1":
            return HttpResponseForbidden("bad key")   # short-circuit: view never runs
        return get_response(request)
    return mw

app = api_key_middleware(lambda req: HttpResponse("secret data"))
rf = RequestFactory()
print(app(rf.get("/")).status_code)
print(app(rf.get("/", headers={"X-Api-Key": "k1"})).content)

# OUTPUT:
# 403
# b'secret data'`],
        [`<b>Advantages:</b> one place for global behaviour, composable layers, battle-tested auth with PBKDF2/Argon2 hashers, sessions, groups and per-object permissions.`,
            r`# MIDDLEWARE order is configuration, not code. Example settings.py fragment:
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",       # must precede auth
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",    # sets request.user
]
print(len(MIDDLEWARE), MIDDLEWARE[-1].rsplit(".", 1)[-1])

# OUTPUT:
# 4 AuthenticationMiddleware`],
        [`<b>Disadvantages:</b> order matters and mistakes are silent; every middleware adds latency to every request; deep chains are hard to debug.`,
            r`order = []

def make(name):
    def factory(get_response):
        def mw(request):
            order.append(name + " in")
            resp = get_response(request)
            order.append(name + " out")      # unwinds in REVERSE order
            return resp
        return mw
    return factory

chain = make("A")(make("B")(lambda req: order.append("view") or "resp"))
chain(None)
print(order)

# OUTPUT:
# ['A in', 'B in', 'view', 'B out', 'A out']`],
        [`<b>Limitations:</b> the default auth is session/cookie based and tied to Django's user model; token or OAuth auth for APIs needs extra packages; changing the user model after the first migration is painful.`,
            r`import django
from django.conf import settings
settings.configure(); django.setup()
from django.contrib.auth.hashers import check_password

# Hashes carry their own algorithm/iterations, enabling gradual upgrades,
# but passwords are never recoverable - only resettable.
legacy = "md5$salt$9a0364b9e99bb480dd25e1f0284c8555"
print(check_password("x", legacy))           # md5 hasher is not enabled by default

# OUTPUT:
# False`],
        `
   request ──► SecurityMiddleware
                 │
                 ▼
            SessionMiddleware ──► CsrfViewMiddleware
                 │
                 ▼
            AuthenticationMiddleware  (request.user)
                 │
                 ▼
               VIEW  (login_required / permissions)
                 │
   response ◄────┴── unwinds through the same layers in reverse
`,
        `Keep middleware thin and cheap, order it deliberately (sessions before auth), and avoid per-request DB hits. Use a custom user model from day one, strong hashers (Argon2), and prefer an external identity provider (OIDC/SAML) for SSO. For APIs, session auth plus CSRF suits browsers; tokens/JWT suit mobile and third parties.`
    ),

    'Django REST APIs': dd(
        [`<b>Django REST Framework (DRF)</b> adds API building blocks to Django: <b>Serializers</b> validate and convert data to/from JSON, <b>APIViews/ViewSets</b> handle HTTP, and <b>Routers</b> generate URLs. It also adds authentication, permissions, throttling and a browsable API.`,
            r`import django
from django.conf import settings
settings.configure(INSTALLED_APPS=["rest_framework"], REST_FRAMEWORK={"UNAUTHENTICATED_USER": None})
django.setup()
from rest_framework import serializers

class BookSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=50)
    pages = serializers.IntegerField(min_value=1)

s = BookSerializer(data={"title": "Dune", "pages": "412"})
print(s.is_valid(), s.validated_data)       # string converted to int

# OUTPUT:
# True {'title': 'Dune', 'pages': 412}`],
        [`Plain Django views return HTML; JSON APIs need parsing, validation, content negotiation, status codes and pagination. DRF supplies all of this in a standard shape instead of ad-hoc code.`,
            r`import django
from django.conf import settings
settings.configure(INSTALLED_APPS=["rest_framework"], REST_FRAMEWORK={"UNAUTHENTICATED_USER": None})
django.setup()
from rest_framework import serializers

class BookSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=5)
    pages = serializers.IntegerField(min_value=1)

s = BookSerializer(data={"title": "Too long title", "pages": 0})
s.is_valid()
print({k: [str(e) for e in v] for k, v in s.errors.items()})

# OUTPUT:
# {'title': ['Ensure this field has no more than 5 characters.'], 'pages': ['Ensure this value is greater than or equal to 1.']}`],
        [`Used for mobile-app backends, SPA backends and public APIs on top of Django models. Typically: ModelSerializer + ModelViewSet + router gives full CRUD in about 10 lines.`,
            r`import django
from django.conf import settings
settings.configure(INSTALLED_APPS=["rest_framework"],
                   REST_FRAMEWORK={"UNAUTHENTICATED_USER": None, "DEFAULT_AUTHENTICATION_CLASSES": []})
django.setup()
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.test import APIRequestFactory

class Hello(APIView):
    def get(self, request, name="world"):
        return Response({"hello": name})    # content negotiation done by DRF

req = APIRequestFactory().get("/hello/")
resp = Hello.as_view()(req, name="Ada")
print(resp.status_code, resp.data)

# OUTPUT:
# 200 {'hello': 'Ada'}`],
        [`<b>Advantages:</b> rapid CRUD APIs, declarative validation, pluggable auth/permissions/throttling/pagination, browsable API, large community.`,
            r`import django
from django.conf import settings
settings.configure(INSTALLED_APPS=["rest_framework"], REST_FRAMEWORK={"UNAUTHENTICATED_USER": None})
django.setup()
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.routers import SimpleRouter

class PingViewSet(viewsets.ViewSet):
    def list(self, request): return Response(["pong"])

router = SimpleRouter()
router.register("ping", PingViewSet, basename="ping")   # URLs generated for you
print([str(u.pattern) for u in router.urls])

# OUTPUT:
# ['^ping/$']`],
        [`<b>Disadvantages:</b> verbose compared with FastAPI, serializers duplicate model definitions, magic in generic views hides control flow, and performance is lower.`,
            r`import django
from django.conf import settings
settings.configure(INSTALLED_APPS=["rest_framework"], REST_FRAMEWORK={"UNAUTHENTICATED_USER": None})
django.setup()
from rest_framework import serializers

# Even simple data needs a separate serializer class (plus view plus route):
class PointSerializer(serializers.Serializer):
    x = serializers.IntegerField()
    y = serializers.IntegerField()

print(PointSerializer({"x": 1, "y": 2}).data)      # object -> plain dict for JSON

# OUTPUT:
# {'x': 1, 'y': 2}`],
        [`<b>Limitations:</b> synchronous by design (async views are limited), serialization is slow for very large lists, and the OpenAPI schema generation needs extra setup or third-party packages (drf-spectacular).`,
            r`import django
from django.conf import settings
settings.configure(INSTALLED_APPS=["rest_framework"], REST_FRAMEWORK={"UNAUTHENTICATED_USER": None})
django.setup()
from rest_framework import serializers

class Row(serializers.Serializer):
    a = serializers.IntegerField()
    b = serializers.CharField()

# Serializer performance is per-field Python work; measure before serialising 100k rows
rows = [{"a": i, "b": "x"} for i in range(3)]
print(Row(rows, many=True).data)

# OUTPUT:
# [{'a': 0, 'b': 'x'}, {'a': 1, 'b': 'x'}, {'a': 2, 'b': 'x'}]`],
        `
   HTTP request
       │
       ▼
   Router ──► ViewSet / APIView
                 │  authentication ► permissions ► throttling
                 ▼
             Serializer  (validate input)
                 │
                 ▼
             Model / ORM ──► DB
                 │
                 ▼
             Serializer (to JSON) ──► Response (negotiated renderer)
`,
        `DRF is the pragmatic choice when you already run Django and need admin + ORM + API together. Keep ViewSets thin, put rules in serializers/services, always paginate lists, add select_related to querysets, and generate OpenAPI with drf-spectacular. For greenfield async, typed microservices, FastAPI is usually leaner.`
    ),
};
