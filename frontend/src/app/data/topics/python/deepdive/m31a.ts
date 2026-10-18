// Module 31 (Software Architecture), part A: layered, MVC, clean, hexagonal, DDD.
import { dd, r, type DeepDive } from './deepDive';

export const m31a: Record<string, DeepDive> = {
    'Layered Architecture': dd(
        [`<b>Layered architecture</b> organises code into horizontal layers, typically presentation, business (service) and data access. Each layer talks only to the layer directly below it.`,
            r`class PriceRepo:                           # data layer
    PRICES = {"pen": 10, "book": 50}
    def price(self, item): return self.PRICES[item]

class OrderService:                         # business layer
    def __init__(self, repo): self.repo = repo
    def total(self, basket):
        return sum(self.repo.price(i) * q for i, q in basket.items())

class Controller:                           # presentation layer
    def __init__(self, service): self.service = service
    def handle(self, request):
        return f"Total: {self.service.total(request)}"

app = Controller(OrderService(PriceRepo()))
print(app.handle({"pen": 2, "book": 2}))

# OUTPUT:
# Total: 120`],
        [`Putting HTTP, rules and SQL in one place makes every change risky. Layers give each concern a home and a simple dependency rule (top to bottom only).`,
            r`ALLOWED = {                                # who may call whom
    "controller": {"service"},
    "service": {"repo"},
    "repo": set(),
}

def violations(edges):
    return [(a, b) for a, b in edges if b not in ALLOWED[a]]

edges = [("controller", "service"), ("service", "repo"), ("controller", "repo")]
print(violations(edges))                    # controller must not skip the service

# OUTPUT:
# [('controller', 'repo')]`],
        [`Django, Spring and most enterprise apps are layered: views or controllers, services, repositories or models. Validation of business rules sits in the service; the controller only translates results into HTTP codes.`,
            r`def service(req):
    if req["qty"] <= 0:
        raise ValueError("qty must be positive")     # business rule
    return f"ordered {req['qty']}"

def controller(req):                        # maps outcomes to HTTP status
    try:
        return 200, service(req)
    except ValueError as e:
        return 400, str(e)

print(controller({"qty": 2}))
print(controller({"qty": 0}))

# OUTPUT:
# (200, 'ordered 2')
# (400, 'qty must be positive')`],
        [`<b>Advantages:</b> easy to understand, familiar to every developer, each layer testable in isolation (fake the layer below).`,
            r`class FakeRepo:
    def price(self, item): return 10        # no database needed

class OrderService:
    def __init__(self, repo): self.repo = repo
    def total(self, basket):
        return sum(self.repo.price(i) * q for i, q in basket.items())

assert OrderService(FakeRepo()).total({"a": 3}) == 30
print("ok: 30")

# OUTPUT:
# ok: 30`],
        [`<b>Disadvantages:</b> the "sinkhole anti-pattern": many requests just pass through layers that add nothing, costing code and call overhead.`,
            r`calls = 0
def repo_get(i):
    global calls; calls += 1; return i
def service_get(i):
    global calls; calls += 1; return repo_get(i)
def controller_get(i):
    global calls; calls += 1; return service_get(i)

print(controller_get(5), "after", calls, "calls")   # three layers, zero logic

# OUTPUT:
# 5 after 3 calls`],
        [`<b>Limitations:</b> the lowest layer tends to shape everything above it: database models leak into the UI and business code ends up coupled to storage details. Whole-application scaling is also all-or-nothing.`,
            r`class UserRow:                             # data-layer object
    def __init__(self): self.id, self.pwd_hash = 1, "x9f"

def view(row):                              # presentation uses the DB shape directly
    return vars(row)

print(view(UserRow()))                      # password hash leaked to the UI layer

# OUTPUT:
# {'id': 1, 'pwd_hash': 'x9f'}`],
        `
   +-----------------------------+
   |  Presentation (controller)  |   HTTP, CLI, UI
   +--------------+--------------+
                  | calls down only
   +--------------v--------------+
   |  Business (service)         |   rules, workflows
   +--------------+--------------+
   +--------------v--------------+
   |  Data access (repository)   |   SQL, ORM, files
   +-----------------------------+
`,
        `Layered is the right default for CRUD-style systems and small teams. Keep entities and DTOs separate so storage shapes do not leak, and when business rules grow, invert the dependency (domain at the centre) to move towards clean or hexagonal architecture.`
    ),

    'MVC': dd(
        [`<b>MVC</b> splits a UI application into <b>Model</b> (data and rules), <b>View</b> (what the user sees) and <b>Controller</b> (handles input and coordinates). Django calls it MTV (Model, Template, View).`,
            r`class Model:
    def __init__(self): self.count = 0
    def increment(self): self.count += 1

class View:
    def show(self, count): return f"Count = {count}"

class Controller:
    def __init__(self, model, view): self.model, self.view = model, view
    def click(self):                        # user action arrives here
        self.model.increment()
        return self.view.show(self.model.count)

c = Controller(Model(), View())
print(c.click())
print(c.click())

# OUTPUT:
# Count = 1
# Count = 2`],
        [`Mixing screen code with data logic means a design change risks the rules, and two screens cannot share the same logic. MVC lets you replace the view without touching the model.`,
            r`import json

class Model:
    count = 2

class TextView:
    def show(self, m): return f"Count = {m.count}"
class JsonView:
    def show(self, m): return json.dumps({"count": m.count})

for view in (TextView(), JsonView()):       # same model, two presentations
    print(view.show(Model()))

# OUTPUT:
# Count = 2
# {"count": 2}`],
        [`Web frameworks route a URL to a controller, which asks the model for data and renders a template.`,
            r`USERS = {1: "Abaji"}                       # model data

def get_user(uid):                          # model access
    return USERS.get(uid)

def render(name):                           # view (template)
    return f"<h1>{name}</h1>"

def user_controller(path):                  # controller: route -> model -> view
    uid = int(path.split("/")[-1])
    name = get_user(uid)
    return render(name) if name else "404"

print(user_controller("/user/1"))
print(user_controller("/user/9"))

# OUTPUT:
# <h1>Abaji</h1>
# 404`],
        [`<b>Advantages:</b> parallel work (designer on views, developer on models), multiple views of the same data, clear place for each piece of code. Models can notify views when they change.`,
            r`class Model:
    def __init__(self): self.views, self.value = [], 0
    def set(self, v):
        self.value = v
        for view in self.views:             # observer: push the change to every view
            view(v)

m = Model()
m.views.append(lambda v: print("view A:", v))
m.views.append(lambda v: print("view B:", v))
m.set(5)

# OUTPUT:
# view A: 5
# view B: 5`],
        [`<b>Disadvantages:</b> the "fat controller": business rules drift into the controller, where they cannot be reused by other entry points.`,
            r`class OrderController:
    def checkout(self, total):
        if total > 100:                     # business rule trapped in the controller
            total = total * 0.9
        return round(total, 2)

print(OrderController().checkout(200))      # a CLI or batch job would have to copy the rule

# OUTPUT:
# 180.0`],
        [`<b>Limitations:</b> MVC says nothing about where services, transactions or integrations live, and for JSON APIs the "view" is only a serializer. Large apps need extra layers on top.`,
            r`import json
from dataclasses import dataclass, asdict

@dataclass
class User:                                 # model
    id: int
    name: str

def user_view(u):                           # API "view" = serializer
    return json.dumps(asdict(u))

print(user_view(User(1, "Abaji")))

# OUTPUT:
# {"id": 1, "name": "Abaji"}`],
        `
                 user action
      +------+ ----------------> +------------+
      | View |                   | Controller |
      +--^---+                   +-----+------+
         | reads / notified            | updates
         |        +-------+            |
         +--------| Model |<-----------+
                  +-------+
`,
        `Use MVC (or MTV/MVVM) for the delivery mechanism only: keep controllers thin, push rules into services or the domain model, and treat the view as replaceable. Beyond a modest size, combine it with a service layer or clean architecture rather than growing models and controllers.`
    ),

    'Clean Architecture': dd(
        [`<b>Clean Architecture</b> (Robert C. Martin) puts business rules at the centre and frameworks, database and UI at the edge. The <b>dependency rule</b>: source code dependencies point inward only. Inner layers define interfaces; outer layers implement them.`,
            r`from abc import ABC, abstractmethod
from dataclasses import dataclass

@dataclass
class Order:                                # entity (innermost)
    id: int
    total: float

class OrderRepo(ABC):                       # port defined by the use case layer
    @abstractmethod
    def save(self, order): ...

class PlaceOrder:                           # use case: application rule
    def __init__(self, repo): self.repo = repo
    def execute(self, order_id, total):
        if total <= 0:
            raise ValueError("total must be positive")
        order = Order(order_id, total)
        self.repo.save(order)
        return order

class MemoryRepo(OrderRepo):                # outer layer: detail
    def __init__(self): self.rows = []
    def save(self, order): self.rows.append(order)

print(PlaceOrder(MemoryRepo()).execute(1, 99.5))

# OUTPUT:
# Order(id=1, total=99.5)`],
        [`Frameworks and databases change every few years; business rules last decades. If rules import Django or SQLAlchemy, every upgrade or switch rewrites the core. Here one use case is driven by two delivery mechanisms.`,
            r`import json

def register_user(name):                    # use case: knows nothing about HTTP or CLI
    return {"user": name, "status": "created"}

def cli(argv):                              # delivery 1
    return f"{register_user(argv[1])['user']} created"

def web(body):                              # delivery 2
    return json.dumps(register_user(body["name"]))

print(cli(["prog", "abaji"]))
print(web({"name": "raoji"}))

# OUTPUT:
# abaji created
# {"user": "raoji", "status": "created"}`],
        [`Teams test use cases in milliseconds with fake repositories and no web server, then plug real adapters in the main module.`,
            r`from dataclasses import dataclass

@dataclass
class Order:
    id: int
    total: float

class FakeRepo:
    def __init__(self): self.saved = []
    def save(self, o): self.saved.append(o)

class PlaceOrder:
    def __init__(self, repo): self.repo = repo
    def execute(self, i, total):
        if total <= 0: raise ValueError("total must be positive")
        self.repo.save(Order(i, total))

repo = FakeRepo()
PlaceOrder(repo).execute(7, 20.0)
assert repo.saved == [Order(7, 20.0)]
try:
    PlaceOrder(repo).execute(8, 0)
except ValueError as e:
    print("rejected:", e)
print("tests pass")

# OUTPUT:
# rejected: total must be positive
# tests pass`],
        [`<b>Advantages:</b> framework and database independence, testable business logic, deferred decisions, long-lived core. Swapping storage does not touch the use case.`,
            r`import io, json
from dataclasses import dataclass, asdict

@dataclass
class Order:
    id: int
    total: float

class JsonLinesRepo:                        # a different outer adapter: writes to a stream
    def __init__(self, stream): self.stream = stream
    def save(self, order):
        self.stream.write(json.dumps(asdict(order)) + "\n")

buffer = io.StringIO()
JsonLinesRepo(buffer).save(Order(2, 10.0))  # the use case would call this unchanged
print(buffer.getvalue().strip())

# OUTPUT:
# {"id": 2, "total": 10.0}`],
        [`<b>Disadvantages:</b> more files, interfaces and mapping code (entity to DTO to row). The ceremony is heavy for simple apps.`,
            r`from dataclasses import dataclass

@dataclass
class Order:                                # entity
    id: int
    total: float

def to_row(o):    return (o.id, o.total)            # mapping 1: entity -> DB row
def to_dto(o):    return {"id": o.id, "total": o.total}   # mapping 2: entity -> API dict

o = Order(1, 5.0)
print(to_row(o), to_dto(o))                 # same data, three shapes to maintain

# OUTPUT:
# (1, 5.0) {'id': 1, 'total': 5.0}`],
        [`<b>Limitations:</b> Python cannot enforce the dependency rule; any inner module can import an outer one. Use an import checker in CI (import-linter, a custom test).`,
            r`RANK = {"entities": 0, "usecases": 1, "adapters": 2, "frameworks": 3}

def broken_imports(imports):
    # an import is illegal when it points to a more outer (higher rank) layer
    return [(a, b) for a, b in imports if RANK[b] > RANK[a]]

imports = [("usecases", "entities"), ("adapters", "usecases"), ("usecases", "frameworks")]
print(broken_imports(imports))

# OUTPUT:
# [('usecases', 'frameworks')]`],
        `
   +-----------------------------------------------+
   | Frameworks & drivers (Django, SQL, HTTP, UI)  |
   |   +---------------------------------------+   |
   |   | Interface adapters (repos, presenters)|   |
   |   |   +-------------------------------+   |   |
   |   |   | Use cases (PlaceOrder)        |   |   |
   |   |   |   +-----------------------+   |   |   |
   |   |   |   | Entities (Order)      |   |   |   |
   |   |   |   +-----------------------+   |   |   |
   |   |   +-------------------------------+   |   |
   |   +---------------------------------------+   |
   +-----------------------------------------------+
        dependencies point INWARD only  ( -> centre )
`,
        `Adopt clean architecture where business rules are valuable and long-lived, not for thin CRUD. Keep the use-case layer free of framework imports, return plain data from it, put wiring in one composition root, and enforce the rule with automated import checks. Pragmatic variant: keep ORM models in the outer layer and map only where it hurts.`
    ),

    'Hexagonal Architecture': dd(
        [`<b>Hexagonal architecture</b> (Ports and Adapters, Alistair Cockburn) puts the application core in the middle. <b>Ports</b> are interfaces the core exposes or needs; <b>adapters</b> connect real technology (HTTP, CLI, database, mail) to those ports.`,
            r`class Core:                                # application core
    def __init__(self, storage_port):
        self.storage = storage_port         # outbound port: "something that can save"
    def register(self, name):
        self.storage.save(name)
        return f"registered {name}"

class ListStorage:                          # outbound adapter
    def __init__(self): self.items = []
    def save(self, name): self.items.append(name)

store = ListStorage()
core = Core(store)
print(core.register("abaji"))
print(store.items)

# OUTPUT:
# registered abaji
# ['abaji']`],
        [`The core should be drivable and observable without a network or database. Inbound adapters (CLI, HTTP, tests) call the same port; outbound adapters can be swapped.`,
            r`class Core:
    def __init__(self, storage): self.storage = storage
    def register(self, name):
        self.storage.append(name)
        return f"registered {name}"

def cli_adapter(core, argv):                # inbound adapter 1
    return core.register(argv[1])

def http_adapter(core, body):               # inbound adapter 2
    return {"status": 201, "body": core.register(body["name"])}

core = Core([])
print(cli_adapter(core, ["prog", "raoji"]))
print(http_adapter(core, {"name": "zed"}))

# OUTPUT:
# registered raoji
# {'status': 201, 'body': 'registered zed'}`],
        [`In production the outbound port is backed by a real database; in tests by memory. The core code is identical in both cases.`,
            r`import sqlite3

class Core:
    def __init__(self, storage): self.storage = storage
    def register(self, name):
        self.storage.save(name)
        return f"registered {name}"

class SqliteStorage:                        # outbound adapter for a real DB
    def __init__(self):
        self.db = sqlite3.connect(":memory:")
        self.db.execute("CREATE TABLE users(name TEXT)")
    def save(self, name):
        self.db.execute("INSERT INTO users VALUES (?)", (name,))
    def names(self):
        return [row[0] for row in self.db.execute("SELECT name FROM users")]

storage = SqliteStorage()
print(Core(storage).register("abaji"))
print(storage.names())

# OUTPUT:
# registered abaji
# ['abaji']`],
        [`<b>Advantages:</b> technology-neutral core, drivers and infrastructure replaceable on both sides, easy to test with fake adapters, delays infrastructure decisions.`,
            r`class FakeMail:                            # fake outbound adapter records messages
    def __init__(self): self.sent = []
    def send(self, to, text): self.sent.append((to, text))

class SignUp:
    def __init__(self, mail): self.mail = mail
    def execute(self, email):
        self.mail.send(email, "Welcome")
        return True

mail = FakeMail()
SignUp(mail).execute("a@x.com")
assert mail.sent == [("a@x.com", "Welcome")]
print("fake mail captured:", mail.sent)

# OUTPUT:
# fake mail captured: [('a@x.com', 'Welcome')]`],
        [`<b>Disadvantages:</b> many small interfaces and adapters to write and keep in sync; a simple feature touches port, adapter and wiring.`,
            r`ports = {
    "UserRepo": ["SqlUserRepo", "MemoryUserRepo"],
    "Mailer":   ["SmtpMailer", "FakeMailer"],
    "Clock":    ["SystemClock", "FixedClock"],
}
count = sum(len(v) for v in ports.values())
print(count, "adapters for", len(ports), "ports")

# OUTPUT:
# 6 adapters for 3 ports`],
        [`<b>Limitations:</b> Python Protocols are structural and unchecked at runtime by default, so a wrong adapter fails late. <code>runtime_checkable</code> verifies method names at wiring time but not signatures.`,
            r`from typing import Protocol, runtime_checkable

@runtime_checkable
class StoragePort(Protocol):
    def save(self, name): ...

class Good:
    def save(self, name): pass
class Bad:
    pass

print(isinstance(Good(), StoragePort))
print(isinstance(Bad(), StoragePort))      # catch it at startup, not in production

# OUTPUT:
# True
# False`],
        `
      Inbound adapters                        Outbound adapters
   +-----------+                                 +-------------+
   |  HTTP API |--+                           +--| SQL / ORM   |
   +-----------+  |   +-----------------+     |  +-------------+
   +-----------+  +-->|  [port]         |     |  +-------------+
   |  CLI      |----->|   APPLICATION   |-[port]->| Mail / SMTP |
   +-----------+  +-->|      CORE       |     |  +-------------+
   +-----------+  |   +-----------------+     |  +-------------+
   |  Tests    |--+                           +--| Message bus |
   +-----------+                                 +-------------+
`,
        `Hexagonal is clean architecture's sibling: the key idea is the symmetric view (driving and driven sides). Define ports in the language of the domain, keep adapters dumb, wire in one composition root, and add contract tests that run against every adapter of a port.`
    ),

    'Domain-Driven Design': dd(
        [`<b>Domain-Driven Design</b> (Eric Evans) models complex business domains in code using the language of the business (<i>ubiquitous language</i>). Building blocks: <b>entities</b> (identity), <b>value objects</b> (defined by values), <b>aggregates</b> (consistency boundary), repositories, domain services and events.`,
            r`from dataclasses import dataclass

@dataclass(frozen=True)                     # value object: immutable, compared by value
class Money:
    amount: int
    currency: str
    def add(self, other):
        if self.currency != other.currency:
            raise ValueError("currency mismatch")
        return Money(self.amount + other.amount, self.currency)

print(Money(100, "INR").add(Money(50, "INR")))
print(Money(1, "INR") == Money(1, "INR"))

# OUTPUT:
# Money(amount=150, currency='INR')
# True`],
        [`When rules are complex, scattering them across services makes them inconsistent. DDD puts invariants inside the model so it is impossible to create an invalid state.`,
            r`class Order:                               # aggregate root guards its invariant
    MAX_LINES = 3
    def __init__(self): self.lines = []
    def add(self, sku):
        if len(self.lines) >= self.MAX_LINES:
            raise ValueError("order full")
        self.lines.append(sku)

o = Order()
try:
    for sku in ["a", "b", "c", "d"]:
        o.add(sku)
except ValueError as e:
    print(o.lines)
    print(e)

# OUTPUT:
# ['a', 'b', 'c']
# order full`],
        [`Large systems have <b>bounded contexts</b>: the word "Customer" means different things in Sales and in Support, so each context has its own model instead of one giant shared class.`,
            r`from dataclasses import dataclass

@dataclass
class SalesCustomer:                        # Sales context: money matters
    id: int
    credit_limit: int

@dataclass
class SupportCustomer:                      # Support context: tickets matter
    id: int
    open_tickets: int

print(SalesCustomer(1, 500))
print(SupportCustomer(1, 2))                # same id links them, models stay separate

# OUTPUT:
# SalesCustomer(id=1, credit_limit=500)
# SupportCustomer(id=1, open_tickets=2)`],
        [`<b>Advantages:</b> code speaks the business language, invariants live in one place, contexts reduce coupling between teams. Entities are equal by identity, not by attribute values.`,
            r`class User:                                # entity: identity = id
    def __init__(self, id, name): self.id, self.name = id, name
    def __eq__(self, other): return isinstance(other, User) and self.id == other.id
    def __hash__(self): return hash(self.id)

u1 = User(1, "Abaji")
u2 = User(1, "Abaji Rao")                    # same person, name changed
print(u1 == u2)

# OUTPUT:
# True`],
        [`<b>Disadvantages:</b> heavy up-front modelling with domain experts, a steep learning curve and a lot of ceremony. For plain CRUD it is overkill.`,
            r`# A simple admin screen needs none of: aggregates, factories, domain events.
users = {}
users[1] = {"name": "Abaji"}                 # CRUD: a dict / table row is enough
print(users[1])

# OUTPUT:
# {'name': 'Abaji'}`],
        [`<b>Limitations:</b> DDD gives no technology advice, aggregate boundaries are hard to get right, and consistency <i>between</i> aggregates is eventual (via domain events), not transactional.`,
            r`events = []

class Order:                                # aggregate 1
    def __init__(self, id): self.id = id
    def place(self):
        events.append(("OrderPlaced", self.id))   # announce, do not touch Inventory

Order(5).place()
print("pending:", events)

def inventory_handler(event):               # aggregate 2 reacts later
    name, order_id = event
    return f"stock reserved for order {order_id}"

print(inventory_handler(events.pop()))

# OUTPUT:
# pending: [('OrderPlaced', 5)]
# stock reserved for order 5`],
        `
   +---------------- Sales context ----------------+    +--- Support context ---+
   |  Order (aggregate root)                       |    |  Ticket (aggregate)   |
   |    +-- OrderLine (entity)                     |    |  Customer (own model) |
   |    +-- Money (value object)                   |    +-----------------------+
   |  OrderRepository                              |            ^
   +-----------------------+-----------------------+            |
                           | domain event: OrderPlaced -----------+ (anti-corruption / events)
`,
        `Use DDD strategically (bounded contexts, ubiquitous language) even if you skip tactical patterns, and apply tactical patterns only in the core domain where the business rules are the competitive advantage. Keep aggregates small, reference other aggregates by id, and align context boundaries with team boundaries.`
    ),
};
