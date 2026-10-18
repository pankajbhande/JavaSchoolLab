// Module 29 (Design Patterns), part B: structural patterns, Repository, DI and when to use patterns.
import { dd, r, type DeepDive } from './deepDive';

export const m29b: Record<string, DeepDive> = {
    'Adapter': dd(
        [`The <b>Adapter</b> pattern wraps an object whose interface does not match what the client expects, translating calls so the two can work together without changing either. Think of a travel plug adapter.`,
            r`class LegacyPrinter:                       # existing class we cannot change
    def print_text(self, s):
        return f"[legacy] {s}"

class PrinterAdapter:                       # exposes the interface the client wants
    def __init__(self, legacy):
        self._legacy = legacy               # wrap (composition)
    def write(self, text):                  # new name -> old name
        return self._legacy.print_text(text)

printer = PrinterAdapter(LegacyPrinter())
print(printer.write("hi"))

# OUTPUT:
# [legacy] hi`],
        [`Real systems are glued from third-party SDKs, legacy code and generated clients whose shapes you do not control. Rewriting them is impossible or risky; an adapter keeps your core code clean and in your own vocabulary.`,
            r`class WeatherApi:                          # vendor returns Celsius in a dict
    def fetch(self):
        return {"temp_c": 25}

class FahrenheitAdapter:                    # our app expects Fahrenheit
    def __init__(self, api):
        self._api = api
    def temperature(self):
        return self._api.fetch()["temp_c"] * 9 / 5 + 32

print(FahrenheitAdapter(WeatherApi()).temperature())

# OUTPUT:
# 77.0`],
        [`Payment gateways (Stripe, PayPal), cloud storage SDKs (S3, Azure Blob), and logging backends are classic adapter targets: the business code calls one <code>pay()</code> method, an adapter per vendor does the translation.`,
            r`class StripeSdk:
    def charge_cents(self, cents):          # vendor A: integer cents
        return f"stripe charged {cents}c"

class PaypalSdk:
    def send_payment(self, dollars):        # vendor B: decimal dollars
        return f"paypal sent USD {dollars}"

class StripeAdapter:
    def __init__(self, sdk): self._sdk = sdk
    def pay(self, amount): return self._sdk.charge_cents(int(amount * 100))

class PaypalAdapter:
    def __init__(self, sdk): self._sdk = sdk
    def pay(self, amount): return self._sdk.send_payment(amount)

for gateway in (StripeAdapter(StripeSdk()), PaypalAdapter(PaypalSdk())):
    print(gateway.pay(12.5))                # same call, different vendors

# OUTPUT:
# stripe charged 1250c
# paypal sent USD 12.5`],
        [`<b>Advantages:</b> reuse existing code unchanged, isolates third-party details in one place (single point to fix when a vendor changes), supports open/closed principle. Python's duck typing and <code>__getattr__</code> delegation make adapters tiny.`,
            r`class Dog:
    def bark(self): return "Woof"
class Cat:
    def meow(self): return "Meow"

class Adapter:                              # generic object adapter
    def __init__(self, obj, **adapted):
        self.obj = obj
        self.__dict__.update(adapted)       # add the unified method names
    def __getattr__(self, name):            # everything else is delegated
        return getattr(self.obj, name)

d, c = Dog(), Cat()
animals = [Adapter(d, speak=d.bark), Adapter(c, speak=c.meow)]
for a in animals:
    print(a.speak())                        # uniform interface
print(animals[0].bark())                    # original API still reachable

# OUTPUT:
# Woof
# Meow
# Woof`],
        [`<b>Disadvantages:</b> an extra layer of indirection and more classes; the two interfaces rarely match perfectly, so the adapter also has to translate error conventions and data shapes, which is where bugs hide.`,
            r`class LegacyDb:
    def find(self, key):
        return {"a": 1}.get(key, -1)        # legacy convention: -1 means "missing"

class DbAdapter:
    def __init__(self, db): self._db = db
    def get(self, key):
        value = self._db.find(key)
        if value == -1:                     # translate the error convention
            raise KeyError(key)
        return value

db = DbAdapter(LegacyDb())
print(db.get("a"))
try:
    db.get("z")
except KeyError as e:
    print("KeyError", e)

# OUTPUT:
# 1
# KeyError 'z'`],
        [`<b>Limitations:</b> an adapter can only translate what the adaptee can actually do. Missing capabilities (transactions, streaming, delete) cannot be invented; the adapter must refuse or degrade.`,
            r`class ReadOnlyStore:
    def read(self, key): return "v" + key   # legacy store: no delete at all

class StoreAdapter:
    def __init__(self, store): self._s = store
    def read(self, key): return self._s.read(key)
    def delete(self, key):                  # target interface wants delete...
        raise NotImplementedError("legacy store cannot delete")

s = StoreAdapter(ReadOnlyStore())
print(s.read("a"))
try:
    s.delete("a")
except NotImplementedError as e:
    print("NotImplementedError:", e)

# OUTPUT:
# va
# NotImplementedError: legacy store cannot delete`],
        `
   Client                Adapter                  Adaptee (legacy / vendor)
  +--------+  write()  +-----------------+  print_text()  +----------------+
  | calls  |---------->| PrinterAdapter  |--------------->| LegacyPrinter  |
  | write()|           | translates call |                | print_text()   |
  +--------+           +-----------------+                +----------------+
   knows only the       holds a reference                   never modified
   target interface     to the adaptee
`,
        `Put adapters at the boundary of your system (anti-corruption layer) so vendor types never leak into the domain. Define the target interface from your needs, not the vendor's, and cover each adapter with contract tests. If you control both sides, change the interface instead of adding a layer.`
    ),

    'Decorator Pattern': dd(
        [`The <b>Decorator</b> pattern adds behaviour to an object by wrapping it in another object with the same interface, instead of subclassing. Wrappers can be stacked. Python also has the <code>@decorator</code> syntax for functions, which applies the same idea to callables.`,
            r`class Coffee:
    def cost(self): return 2.0
    def desc(self): return "Coffee"

class Milk:                                 # decorator: same interface as Coffee
    def __init__(self, base): self._base = base
    def cost(self): return self._base.cost() + 0.5
    def desc(self): return self._base.desc() + " + Milk"

class Sugar:
    def __init__(self, base): self._base = base
    def cost(self): return self._base.cost() + 0.2
    def desc(self): return self._base.desc() + " + Sugar"

drink = Sugar(Milk(Coffee()))               # wrap, then wrap again
print(drink.desc(), round(drink.cost(), 2))

# OUTPUT:
# Coffee + Milk + Sugar 2.7`],
        [`Cross-cutting concerns (logging, timing, caching, auth, retries) would otherwise be copied into every function. A decorator adds them once, without touching the original code.`,
            r`import functools

def shout(fn):
    @functools.wraps(fn)                    # keep the original name and docstring
    def wrapper(*args, **kwargs):
        return fn(*args, **kwargs).upper()  # extra behaviour around the call
    return wrapper

@shout                                      # same as: greet = shout(greet)
def greet(name):
    return f"hello {name}"

print(greet("ann"))
print(greet.__name__)

# OUTPUT:
# HELLO ANN
# greet`],
        [`Web frameworks use decorators for routes and permissions (<code>@app.route</code>, <code>@login_required</code>); data code uses <code>@lru_cache</code>; API clients use retry decorators for flaky networks.`,
            r`import functools

def retry(times):                           # decorator with arguments
    def deco(fn):
        @functools.wraps(fn)
        def wrapper(*a, **k):
            for attempt in range(1, times + 1):
                try:
                    return fn(*a, **k)
                except ConnectionError as e:
                    print(f"attempt {attempt} failed: {e}")
                    if attempt == times:
                        raise               # out of retries: surface the error
        return wrapper
    return deco

calls = {"n": 0}

@retry(3)
def fetch():
    calls["n"] += 1
    if calls["n"] < 3:
        raise ConnectionError("timeout")    # fails twice, then succeeds
    return "data"

print(fetch())

# OUTPUT:
# attempt 1 failed: timeout
# attempt 2 failed: timeout
# data`],
        [`<b>Advantages:</b> follows open/closed (extend without modifying), more flexible than inheritance because wrappers combine freely at runtime, keeps each class focused on one responsibility.`,
            r`def bold(f):   return lambda: "<b>" + f() + "</b>"
def italic(f): return lambda: "<i>" + f() + "</i>"

def text():
    return "hi"

a = bold(italic(text))                      # combine in any order
b = italic(bold(text))
print(a())
print(b())

# OUTPUT:
# <b><i>hi</i></b>
# <i><b>hi</b></i>`],
        [`<b>Disadvantages:</b> many small wrapper layers are hard to debug (long stack traces), order of stacking changes results, and a careless decorator hides the wrapped function's name, docstring and signature.`,
            r`def plain(fn):                             # forgot functools.wraps
    def wrapper(*args):
        return fn(*args)
    return wrapper

@plain
def add(a, b):
    """Add two numbers."""
    return a + b

print(add.__name__, add.__doc__)            # metadata lost: breaks help(), tools

# OUTPUT:
# wrapper None`],
        [`<b>Limitations:</b> an object wrapper is not the same type as the wrapped object (isinstance fails), and calls the inner object makes to its own methods bypass the wrapper entirely.`,
            r`class Service:
    def a(self): return self.b()            # internal call to b
    def b(self): return "b"

class Logged:                               # logging wrapper
    def __init__(self, inner): self._inner = inner
    def __getattr__(self, name):
        attr = getattr(self._inner, name)
        if callable(attr):
            def wrapped(*args):
                print("call", name)
                return attr(*args)
            return wrapped
        return attr

s = Logged(Service())
print(s.a())                                # only 'a' is logged, not the inner b
print(isinstance(s, Service))               # the wrapper is not a Service

# OUTPUT:
# call a
# b
# False`],
        `
   client --> [ Sugar ] --> [ Milk ] --> [ Coffee ]
               +0.2          +0.5          2.0
                |              |             |
   cost() <-----+--------------+-------------+   each layer calls inward,
   = 2.7                                         then adds its own part

   @shout over greet():   call -> wrapper -> greet() -> .upper() -> result
`,
        `Use object decorators when behaviours must combine at runtime; use function decorators for cross-cutting concerns. Always use functools.wraps, keep decorators side-effect free at import time, and be explicit about ordering (auth before cache, retry outside timeout). For heavy cross-cutting needs consider middleware pipelines instead of deep stacks.`
    ),

    'Facade': dd(
        [`A <b>Facade</b> is a simple class that offers one easy interface to a complex group of subsystems. Clients call the facade; the facade coordinates the details in the correct order.`,
            r`class Cpu:
    def start(self): return "CPU started"
class Memory:
    def load(self): return "RAM loaded"
class Disk:
    def read(self): return "boot sector read"

class Computer:                             # the facade
    def __init__(self):
        self._cpu, self._mem, self._disk = Cpu(), Memory(), Disk()
    def boot(self):                         # one call hides 3 subsystems and the order
        return [self._disk.read(), self._mem.load(), self._cpu.start()]

for step in Computer().boot():
    print(step)

# OUTPUT:
# boot sector read
# RAM loaded
# CPU started`],
        [`Subsystems grow complicated: many classes, strict call order, many options. Every client repeating that choreography is error-prone and couples everyone to internals.`,
            r`class Parser:
    @staticmethod
    def parse(text): return dict(p.split("=") for p in text.split(";"))
class Validator:
    @staticmethod
    def check(d): return all(v.isdigit() for v in d.values())
class Formatter:
    @staticmethod
    def pretty(d): return ", ".join(f"{k}:{v}" for k, v in sorted(d.items()))

# Without a facade every caller must know all three steps and their order:
d = Parser.parse("b=2;a=1")
print(Formatter.pretty(d) if Validator.check(d) else "invalid")

def load_config(text):                      # facade: one function
    d = Parser.parse(text)
    return Formatter.pretty(d) if Validator.check(d) else "invalid"

print(load_config("x=9;y=8"))
print(load_config("x=9;y=oops"))

# OUTPUT:
# a:1, b:2
# x:9, y:8
# invalid`],
        [`E-commerce checkout, video converters, cloud SDK "client" objects and library entry points (for example <code>requests.get()</code> hides sockets, TLS, redirects and pooling) are facades.`,
            r`class Inventory:
    def reserve(self, sku):
        print(f"reserved {sku}"); return True
class Payment:
    def charge(self, amount):
        print(f"charged {amount}"); return True
class Shipping:
    def ship(self, sku):
        print(f"shipped {sku}"); return "TRK-1"

class CheckoutFacade:
    def __init__(self):
        self.inv, self.pay, self.ship = Inventory(), Payment(), Shipping()
    def buy(self, sku, amount):
        if not self.inv.reserve(sku):
            return "out of stock"
        self.pay.charge(amount)
        return self.ship.ship(sku)

print(CheckoutFacade().buy("book", 20))

# OUTPUT:
# reserved book
# charged 20
# shipped book
# TRK-1`],
        [`<b>Advantages:</b> simpler API, fewer dependencies for clients, and freedom to change or replace the subsystem internals without breaking callers.`,
            r`class TaxV1:
    def tax(self, amount): return round(amount * 0.10, 2)
class TaxV2:
    def tax(self, amount): return round(amount * 0.18, 2)

class Billing:                              # facade: public API stays the same
    def __init__(self, calculator): self._calc = calculator
    def total(self, amount):
        return round(amount + self._calc.tax(amount), 2)

print(Billing(TaxV1()).total(100))          # old internals
print(Billing(TaxV2()).total(100))          # new internals, same client code

# OUTPUT:
# 110.0
# 118.0`],
        [`<b>Disadvantages:</b> a facade can become a "god object" that knows everything and keeps growing; it also adds one more layer to maintain and test.`,
            r`class AppFacade:                            # warning sign: everything in one place
    def register(self): ...
    def login(self): ...
    def buy(self): ...
    def refund(self): ...
    def report(self): ...

public = [m for m in dir(AppFacade) if not m.startswith("_")]
print(len(public), "public methods and growing")

# OUTPUT:
# 5 public methods and growing`],
        [`<b>Limitations:</b> a facade simplifies access but does not enforce it. Python has no real private members, so callers can still reach the subsystems directly and bypass rules.`,
            r`class Engine:
    def start(self): return "engine started"

class Car:                                  # facade over Engine
    def __init__(self): self._engine = Engine()
    def drive(self): return self._engine.start() + ", driving"

car = Car()
print(car.drive())
print(car._engine.start())                  # nothing stops this bypass

# OUTPUT:
# engine started, driving
# engine started`],
        `
   Client
     |  buy("book", 20)
     v
  +-------------------------------+
  |        CheckoutFacade         |   simple API
  +--------+---------+------------+
           |         |            |
           v         v            v
     +-----------+ +---------+ +----------+
     | Inventory | | Payment | | Shipping |    complex subsystems
     +-----------+ +---------+ +----------+
`,
        `Use facades to define module boundaries (one public entry per package, details underscore-prefixed or in an internal package). Keep them thin: orchestration only, no business rules, otherwise split by use case. In services, an application-service layer is effectively a facade over the domain.`
    ),

    'Repository': dd(
        [`The <b>Repository</b> pattern hides how data is stored behind a collection-like interface (<code>add</code>, <code>get</code>, <code>all</code>). The rest of the application asks for objects and never sees SQL, files or HTTP.`,
            r`from dataclasses import dataclass

@dataclass
class User:
    id: int
    name: str

class UserRepository:                       # in-memory implementation
    def __init__(self):
        self._data = {}
    def add(self, user):
        self._data[user.id] = user
    def get(self, user_id):
        return self._data.get(user_id)      # None if missing
    def all(self):
        return list(self._data.values())

repo = UserRepository()
repo.add(User(1, "Abaji"))
repo.add(User(2, "Raoji"))
print(repo.get(1))
print(len(repo.all()))

# OUTPUT:
# User(id=1, name='Abaji')
# 2`],
        [`If business code contains SQL, switching database, testing without a database, or caching all mean editing business logic. A repository isolates persistence so the domain stays pure.`,
            r`from dataclasses import dataclass

@dataclass
class User:
    id: int
    name: str

class InMemoryRepo:
    def __init__(self): self._d = {1: User(1, "Abaji")}
    def get(self, i): return self._d.get(i)

class UserService:                          # knows only "something with get()"
    def __init__(self, repo): self.repo = repo
    def greet(self, user_id):
        user = self.repo.get(user_id)
        return f"Hello {user.name}" if user else "unknown user"

service = UserService(InMemoryRepo())
print(service.greet(1))
print(service.greet(9))

# OUTPUT:
# Hello Abaji
# unknown user`],
        [`Typical apps have one repository per aggregate (UserRepository, OrderRepository) with SQL, ORM or REST implementations behind the same interface. Here the same service runs unchanged on SQLite.`,
            r`import sqlite3
from dataclasses import dataclass

@dataclass
class User:
    id: int
    name: str

class SqliteUserRepo:
    def __init__(self):
        self.db = sqlite3.connect(":memory:")
        self.db.execute("CREATE TABLE users(id INTEGER PRIMARY KEY, name TEXT)")
    def add(self, u):
        self.db.execute("INSERT INTO users VALUES (?, ?)", (u.id, u.name))
        self.db.commit()
    def get(self, user_id):
        row = self.db.execute("SELECT id, name FROM users WHERE id = ?", (user_id,)).fetchone()
        return User(*row) if row else None

class UserService:
    def __init__(self, repo): self.repo = repo
    def greet(self, i):
        u = self.repo.get(i)
        return f"Hello {u.name}" if u else "unknown user"

repo = SqliteUserRepo()
repo.add(User(1, "Abaji"))
print(UserService(repo).greet(1))           # same service code as with the in-memory repo

# OUTPUT:
# Hello Abaji`],
        [`<b>Advantages:</b> persistence-agnostic domain, trivial fakes for unit tests, one place for queries and caching, easier migration between storage technologies.`,
            r`class FakeRepo:                             # test double: a plain dict
    def __init__(self): self.saved = {}
    def add(self, key, value): self.saved[key] = value

def register(repo, name):                   # business logic under test
    repo.add(name.lower(), name)

repo = FakeRepo()
register(repo, "ABAJI")
assert repo.saved == {"abaji": "ABAJI"}       # no database, runs in microseconds
print("test passed:", repo.saved)

# OUTPUT:
# test passed: {'abaji': 'ABAJI'}`],
        [`<b>Disadvantages:</b> extra layer and boilerplate, leaky abstractions (generic <code>all()</code> forces clients to filter in memory), and a growing zoo of <code>find_by_x</code> methods.`,
            r`ROWS = [{"id": i} for i in range(1000)]

class Repo:
    def __init__(self): self.transferred = 0
    def all(self):
        self.transferred += len(ROWS); return ROWS
    def get(self, i):
        self.transferred += 1; return ROWS[i]

slow = Repo()
hit = [row for row in slow.all() if row["id"] == 7]   # filter on the client side
print("generic all():", slow.transferred, "rows moved")

fast = Repo()
fast.get(7)                                           # query-specific method
print("get(7):", fast.transferred, "row moved")

# OUTPUT:
# generic all(): 1000 rows moved
# get(7): 1 row moved`],
        [`<b>Limitations:</b> a repository per aggregate does not give you transactions across repositories. Without a Unit of Work, a failure between two repository calls leaves data half-updated.`,
            r`accounts = {"a": 100, "b": 0}

def withdraw():  accounts["a"] -= 50        # first repository call
def deposit():   raise RuntimeError("deposit failed")   # second one fails

try:
    withdraw()
    deposit()
except RuntimeError as e:
    print("error:", e)
print(accounts)                             # money vanished: needs a Unit of Work

# OUTPUT:
# error: deposit failed
# {'a': 50, 'b': 0}`],
        `
   +-----------------+      get(1)       +-----------------------+
   |  UserService    |------------------>|  UserRepository (API) |
   |  (business)     |<------------------|  add / get / all      |
   +-----------------+      User         +----------+------------+
                                                    |
                         +--------------------------+------------------+
                         |                          |                  |
                  +--------------+          +--------------+    +-------------+
                  | InMemoryRepo |          | SqliteRepo   |    | RestApiRepo |
                  +--------------+          +--------------+    +-------------+
`,
        `Define repository interfaces in the domain layer (typing.Protocol or ABC) and implement them in infrastructure. Pair with a Unit of Work for transactions and keep queries intention-revealing. For read-heavy reporting skip repositories and query directly (CQRS read side); do not wrap an ORM session in another full abstraction without a reason.`
    ),

    'Dependency Injection': dd(
        [`<b>Dependency Injection</b> means an object receives the collaborators it needs (from outside, usually via the constructor) instead of creating them itself. It makes the code flexible and testable.`,
            r`class EmailSender:
    def send(self, to, msg):
        return f"email to {to}: {msg}"

class Notifier:
    def __init__(self, sender):             # dependency injected here
        self.sender = sender
    def welcome(self, user):
        return self.sender.send(user, "Welcome!")

print(Notifier(EmailSender()).welcome("abaji"))

# OUTPUT:
# email to abaji: Welcome!`],
        [`When a class builds its own dependencies it is welded to them: you cannot switch to SMS, and you cannot test without sending real emails.`,
            r`class EmailSender:
    def send(self, to, msg): return f"email to {to}: {msg}"
class SmsSender:
    def send(self, to, msg): return f"sms to {to}: {msg}"

class BadNotifier:
    def __init__(self):
        self.sender = EmailSender()         # hard-wired: cannot be changed
    def welcome(self, user): return self.sender.send(user, "Welcome!")

class Notifier:
    def __init__(self, sender): self.sender = sender
    def welcome(self, user): return self.sender.send(user, "Welcome!")

print(BadNotifier().welcome("raoji"))        # always email
print(Notifier(SmsSender()).welcome("raoji"))  # caller chooses

# OUTPUT:
# email to raoji: Welcome!
# sms to raoji: Welcome!`],
        [`In production you inject real clients (database, mail, HTTP); in unit tests you inject fakes that record calls. FastAPI's <code>Depends()</code> is dependency injection built into the framework.`,
            r`class FakeSender:                           # test double
    def __init__(self): self.sent = []
    def send(self, to, msg):
        self.sent.append((to, msg)); return "ok"

class Notifier:
    def __init__(self, sender): self.sender = sender
    def welcome(self, user): return self.sender.send(user, "Welcome!")

fake = FakeSender()
Notifier(fake).welcome("zed")
assert fake.sent == [("zed", "Welcome!")]   # verified without any real email
print("test passed:", fake.sent)

# OUTPUT:
# test passed: [('zed', 'Welcome!')]`],
        [`<b>Advantages:</b> loose coupling, easy mocking, swappable implementations, explicit dependencies visible in the constructor. Python's <code>typing.Protocol</code> documents the required interface without inheritance.`,
            r`from typing import Protocol

class Clock(Protocol):                      # the contract, no inheritance needed
    def now(self) -> int: ...

class Greeter:
    def __init__(self, clock: Clock): self.clock = clock
    def greet(self):
        return "Good morning" if self.clock.now() < 12 else "Good afternoon"

class FixedClock:                           # deterministic time for tests
    def __init__(self, hour): self.hour = hour
    def now(self): return self.hour

print(Greeter(FixedClock(9)).greet())
print(Greeter(FixedClock(15)).greet())

# OUTPUT:
# Good morning
# Good afternoon`],
        [`<b>Disadvantages:</b> object graphs must be assembled somewhere, which adds wiring boilerplate; deep chains of constructors are harder to read than direct creation; containers can hide where things come from.`,
            r`class Repo: ...
class Service:
    def __init__(self, repo): self.repo = repo
class Controller:
    def __init__(self, service): self.service = service

app = Controller(Service(Repo()))           # the "composition root" wires everything
chain = [type(app).__name__, type(app.service).__name__, type(app.service.repo).__name__]
print(" -> ".join(chain))

# OUTPUT:
# Controller -> Service -> Repo`],
        [`<b>Limitations:</b> Python does not check injected objects at construction time. A wrong object fails later, at the first call, unless you add type hints and run a type checker such as mypy.`,
            r`class Notifier:
    def __init__(self, sender): self.sender = sender
    def welcome(self, user): return self.sender.send(user, "Welcome!")

n = Notifier(object())                      # accepted silently: no error here
try:
    n.welcome("x")                          # fails only when used
except AttributeError as e:
    print("AttributeError:", e)

# OUTPUT:
# AttributeError: 'object' object has no attribute 'send'`],
        `
   Without DI                              With DI
   +------------+   creates   +--------+   +------------+  receives  +--------+
   |  Notifier  |------------>| Email  |   |  Notifier  |<-----------| Sender |
   +------------+             +--------+   +------------+            +--------+
   hard-wired                                 ^
                                              |  injected by composition root
                          main():  Notifier(EmailSender())  or  Notifier(FakeSender())
`,
        `Prefer plain constructor injection with one composition root near main(); add a container (dependency-injector, FastAPI Depends) only when wiring becomes large. Depend on small Protocols owned by the consumer, keep constructors to a few collaborators (more is a design smell), and avoid service-locator or global lookups that hide dependencies.`
    ),

    'When & Why to Use Patterns': dd(
        [`<b>Design patterns</b> are named, proven solutions to recurring design problems. They are a shared vocabulary ("use a Strategy here") more than code to copy. The skill is recognising the problem first, then choosing the pattern.`,
            r`# Pattern -> the problem it solves
patterns = {
    "Singleton": "one shared instance",
    "Strategy": "swap an algorithm",
    "Adapter": "make interfaces fit",
    "Facade": "simplify a subsystem",
    "Observer": "notify on change",
}
for name, problem in patterns.items():
    print(f"{name:<10} -> {problem}")

# OUTPUT:
# Singleton  -> one shared instance
# Strategy   -> swap an algorithm
# Adapter    -> make interfaces fit
# Facade     -> simplify a subsystem
# Observer   -> notify on change`],
        [`Without a vocabulary, teams reinvent solutions and describe them differently. Patterns also point at designs that survive change. But Python already has built-in tools that make several classic patterns disappear.`,
            r`# Strategy in Java needs an interface + classes; in Python a function is the strategy.
def apply(strategy, text):
    return strategy(text)

print(apply(str.upper, "abc"))              # built-in function as strategy
print(apply(lambda s: s[::-1], "abc"))      # lambda as strategy

# OUTPUT:
# ABC
# cba`],
        [`In real work you choose by the force acting on the code: many algorithm variants (Strategy), many vendor APIs (Adapter), many steps to hide (Facade), swappable storage (Repository). If no force exists, no pattern is needed.`,
            r`def suggest(problem):
    table = {
        "many ways to compute price": "Strategy",
        "vendor api does not match ours": "Adapter",
        "callers repeat a 5-step setup": "Facade",
    }
    return table.get(problem, "no pattern - keep it simple")

print(suggest("many ways to compute price"))
print(suggest("add a print statement"))

# OUTPUT:
# Strategy
# no pattern - keep it simple`],
        [`<b>Advantages:</b> shared language for design talks, tested solutions, easier onboarding, and code that is easier to extend. Python often supplies the pattern in the language itself, for example generators for Iterator.`,
            r`def countdown(n):                          # Iterator pattern, built into the language
    while n > 0:
        yield n
        n -= 1

print(list(countdown(3)))

# OUTPUT:
# [3, 2, 1]`],
        [`<b>Disadvantages:</b> over-engineering. Forcing patterns on simple problems adds classes, indirection and reading cost for no benefit (the "golden hammer").`,
            r`class AddStrategy:                          # pattern version: 2 classes for one plus sign
    def execute(self, a, b): return a + b

class Calculator:
    def __init__(self, strategy): self.strategy = strategy
    def run(self, a, b): return self.strategy.execute(a, b)

print(Calculator(AddStrategy()).run(2, 3))  # heavy
print(2 + 3)                                # simple, same result

# OUTPUT:
# 5
# 5`],
        [`<b>Limitations:</b> a pattern does not repair a bad design, and patterns that rely on language limits (Java singletons) are often unnecessary in Python. Misused patterns such as Singleton introduce hidden global state.`,
            r`cache = {}                                 # a "singleton" by module: global state

def test_a():
    cache["x"] = 1
    return len(cache)

def test_b():
    return len(cache)                       # expected an empty cache, but state leaked

print(test_a(), test_b())

# OUTPUT:
# 1 1`],
        `
   Problem / force ---> recognise ---> choose pattern ---> adapt to Python
        |                                    |
        |   no real force?                   +--> maybe a function, module,
        +--------> do NOT use a pattern           generator or dataclass is enough
`,
        `Treat patterns as a vocabulary for review and design discussion, not a checklist. Start with the simplest Python (functions, modules, dataclasses), introduce a pattern when a second variation or a testing pain appears, and name it in the code so intent is clear. Remove patterns whose reason for existing has gone.`
    ),
};
