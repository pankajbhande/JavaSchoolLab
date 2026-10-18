// Module 29 (Design Patterns), part A: creational patterns plus Strategy and Observer.
import { dd, r, type DeepDive } from './deepDive';

export const m29a: Record<string, DeepDive> = {
    'Singleton': dd(
        [`The <b>Singleton</b> pattern guarantees a class has exactly one instance and gives everyone access to it. In Python you can override <code>__new__</code>, use a decorator, or simply use a module (modules are imported once, so they are natural singletons).`,
            r`class Config:
    _instance = None                       # holds the one and only object

    def __new__(cls):
        if cls._instance is None:          # first call: create it
            cls._instance = super().__new__(cls)
        return cls._instance               # later calls: return the same one

a = Config()
b = Config()
print(a is b)                              # same object?

# OUTPUT:
# True`],
        [`Some things must exist once for the whole application: configuration, a connection pool, a logger, a cache. Two copies would drift apart and cause confusing bugs.`,
            r`class Config:
    _instance = None
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

Config().debug = True          # set in one part of the program...
print(Config().debug)          # ...visible in a completely different part

# OUTPUT:
# True`],
        [`Real systems use singletons for the logging system, application settings, a database connection pool or a metrics registry. A decorator version creates the expensive resource lazily and only once.`,
            r`def singleton(cls):
    instances = {}
    def get(*args, **kwargs):
        if cls not in instances:
            instances[cls] = cls(*args, **kwargs)     # created on first use only
        return instances[cls]
    return get

@singleton
class Database:
    def __init__(self):
        print("connecting...")                        # expensive work

db1 = Database()
db2 = Database()
print(db1 is db2)

# OUTPUT:
# connecting...
# True`],
        [`<b>Advantages:</b> one shared instance, lazy creation, controlled global access and savings in memory and start-up cost.`,
            r`class Registry:
    _instance = None
    created = 0
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls.created += 1
        return cls._instance

for _ in range(5):
    Registry()
print("objects created:", Registry.created)

# OUTPUT:
# objects created: 1`],
        [`<b>Disadvantages:</b> it is hidden global state. Tests are no longer independent, because a change made in one test is still there in the next.`,
            r`class Settings:
    _instance = None
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance.value = 0
        return cls._instance

def test_one():
    Settings().value = 5            # this test changes the shared object

def test_two():
    print("test two expects 0, sees", Settings().value)   # leaked from test one

test_one()
test_two()

# OUTPUT:
# test two expects 0, sees 5`],
        [`<b>Limitations:</b> with the <code>__new__</code> approach, <code>__init__</code> runs again on every call and silently resets state. The naive version is also not thread-safe (two threads can both create an instance) unless you add a lock.`,
            r`class Counter:
    _instance = None
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    def __init__(self):
        self.n = 0                  # runs on EVERY Counter() call

c1 = Counter()
c1.n = 5
c2 = Counter()                      # __init__ runs again and resets n
print(c1.n)

# OUTPUT:
# 0`],
        r`
   client A ---\
                \        +-------------------+
   client B ----+------> |  Singleton        |
                /        |  _instance  ----->| the ONE object
   client C ---/         |  get() / __new__  |
                         +-------------------+
   Counter() -> same object every time
`,
        `Treat singletons with suspicion: they are global variables in disguise. Prefer creating one object at start-up and passing it in (dependency injection), or use a module-level instance. Where a true singleton is needed (process-wide pool), make creation thread-safe and give tests a reset hook. Remember each process, worker or container has its own "single" instance.`
    ),

    'Factory': dd(
        [`The <b>Factory</b> pattern moves object creation into a dedicated function or class, so callers ask for "a circle" by name instead of choosing and constructing the concrete class themselves.`,
            r`import math

class Circle:
    def __init__(self, r): self.r = r
    def area(self): return math.pi * self.r ** 2

class Square:
    def __init__(self, s): self.s = s
    def area(self): return self.s ** 2

def shape_factory(kind, size):
    makers = {"circle": Circle, "square": Square}     # name -> class
    return makers[kind](size)

print(round(shape_factory("circle", 2).area(), 2))
print(shape_factory("square", 3).area())

# OUTPUT:
# 12.57
# 9`],
        [`When the exact type depends on input, config or environment, scattering <code>if kind == ...</code> through the program couples every caller to every class. One factory keeps that decision in a single place.`,
            r`class EmailNotifier:
    def send(self, msg): return f"email: {msg}"
class SmsNotifier:
    def send(self, msg): return f"sms: {msg}"

def make_notifier(channel):
    table = {"email": EmailNotifier, "sms": SmsNotifier}
    if channel not in table:
        raise ValueError(f"Unknown channel: {channel}")
    return table[channel]()

for ch in ("email", "sms"):                 # caller never mentions the concrete classes
    print(make_notifier(ch).send("hello"))

# OUTPUT:
# email: hello
# sms: hello`],
        [`File parsers chosen by extension, payment gateways chosen by country, database drivers chosen by URL scheme and test doubles chosen by environment are all factories. Python's own <code>open()</code>, <code>logging.getLogger()</code> and <code>json.loads</code> behave like factories.`,
            r`import json

def parse_csv(text):  return text.split(",")
def parse_json(text): return json.loads(text)

PARSERS = {"csv": parse_csv, "json": parse_json}

def parser_for(filename):
    ext = filename.rsplit(".", 1)[-1]          # pick by file extension
    return PARSERS[ext]

print(parser_for("data.json")('{"a": 1}'))
print(parser_for("data.csv")("x,y,z"))

# OUTPUT:
# {'a': 1}
# ['x', 'y', 'z']`],
        [`<b>Advantages:</b> a single place to change creation logic, callers depend only on the shared interface, and a registry lets you add new types without editing the factory.`,
            r`REGISTRY = {}
def register(name):
    def deco(cls):
        REGISTRY[name] = cls            # self-registration
        return cls
    return deco

@register("dog")
class Dog:
    def speak(self): return "Woof"

@register("cat")                        # new type: no change to make()
class Cat:
    def speak(self): return "Meow"

def make(name): return REGISTRY[name]()
print(make("dog").speak(), make("cat").speak())

# OUTPUT:
# Woof Meow`],
        [`<b>Disadvantages:</b> extra indirection and string keys. A typo only fails at runtime, and a reader must look in the factory to see what is created.`,
            r`def make(kind):
    table = {"circle": "Circle()", "square": "Square()"}
    if kind not in table:
        raise ValueError(f"Unknown kind: {kind}")
    return table[kind]

try:
    make("circel")                       # typo is caught only when this line runs
except ValueError as e:
    print("ValueError:", e)

# OUTPUT:
# ValueError: Unknown kind: circel`],
        [`<b>Limitations:</b> the factory only knows what is registered. A class that is defined but never added to the table is invisible, and the declared return type is just the common base, so type checkers see less.`,
            r`REGISTRY = {}
class Circle: pass
REGISTRY["circle"] = Circle

class Triangle: pass                    # defined but never registered

def make(name):
    if name not in REGISTRY:
        raise ValueError(f"Not registered: {name}")
    return REGISTRY[name]()

print(type(make("circle")).__name__)
try:
    make("triangle")
except ValueError as e:
    print("ValueError:", e)

# OUTPUT:
# Circle
# ValueError: Not registered: triangle`],
        r`
   client --- "circle", 2 ---> +-----------------+
                               |  shape_factory  |
                               |  (decides type) |
                               +--------+--------+
                      +-----------------+-----------------+
                      v                                   v
                 +----------+                        +----------+
                 |  Circle  |                        |  Square  |
                 +----------+                        +----------+
   client only knows the factory and the shared interface (area())
`,
        `In Python, classes and functions are first-class values, so a dict of callables is often a complete factory; avoid Java-style class hierarchies. Use <code>classmethod</code> alternate constructors (<code>from_json</code>) when one class has several creation routes. If there are only one or two types and no variation, plain constructors are clearer.`
    ),

    'Abstract Factory': dd(
        [`The <b>Abstract Factory</b> pattern provides an interface for creating a whole <i>family</i> of related objects without naming their concrete classes. Swap the factory and the entire family changes together.`,
            r`from abc import ABC, abstractmethod

class UIFactory(ABC):                       # the abstract factory
    @abstractmethod
    def button(self): ...
    @abstractmethod
    def label(self): ...

class LightUI(UIFactory):
    def button(self): return "[Light Button]"
    def label(self):  return "Light Label"

class DarkUI(UIFactory):
    def button(self): return "[Dark Button]"
    def label(self):  return "Dark Label"

def render(factory: UIFactory):
    print(factory.label(), factory.button())

render(LightUI())
render(DarkUI())

# OUTPUT:
# Light Label [Light Button]
# Dark Label [Dark Button]`],
        [`Objects that must work together (a dark button must sit with a dark label) break when mixed from different families. One factory per family guarantees every product it creates is compatible.`,
            r`class MemoryWriter:
    def __init__(self, store): self.store = store
    def write(self, k, v): self.store[k] = v
class MemoryReader:
    def __init__(self, store): self.store = store
    def read(self, k): return self.store[k]

class MemoryFactory:
    def __init__(self): self.store = {}      # writer and reader share one store
    def writer(self): return MemoryWriter(self.store)
    def reader(self): return MemoryReader(self.store)

f = MemoryFactory()
f.writer().write("greeting", "hello")
print(f.reader().read("greeting"))

# OUTPUT:
# hello`],
        [`Cross-platform GUI toolkits, database layers (connection + command + transaction for one vendor), and test setups that swap real services for fake ones use Abstract Factory. The application code stays the same; only the factory changes.`,
            r`class RealPaymentFactory:
    def gateway(self): return "charging real card"
    def receipts(self): return "emailing real receipt"

class FakePaymentFactory:                    # used in tests and demos
    def gateway(self): return "pretend charge"
    def receipts(self): return "pretend receipt"

def checkout(factory):
    print(factory.gateway(), "+", factory.receipts())

env = "test"
checkout(FakePaymentFactory() if env == "test" else RealPaymentFactory())

# OUTPUT:
# pretend charge + pretend receipt`],
        [`<b>Advantages:</b> products from one family always match, the client is unaware of concrete classes, and swapping the whole family is a one-line change.`,
            r`class Light:
    def button(self): return "light-btn"
    def menu(self):   return "light-menu"
class Dark:
    def button(self): return "dark-btn"
    def menu(self):   return "dark-menu"

def app(factory):                            # app code never changes
    return factory.button() + " + " + factory.menu()

print(app(Light()))
print(app(Dark()))

# OUTPUT:
# light-btn + light-menu
# dark-btn + dark-menu`],
        [`<b>Disadvantages:</b> many classes, and adding a new kind of product (say a checkbox) means changing the abstract factory and every concrete factory.`,
            r`from abc import ABC, abstractmethod

class UIFactory(ABC):
    @abstractmethod
    def button(self): ...
    @abstractmethod
    def label(self): ...
    @abstractmethod
    def checkbox(self): ...                  # new product added later

class OldFactory(UIFactory):                 # forgot to implement checkbox
    def button(self): return "b"
    def label(self): return "l"

try:
    OldFactory()
except TypeError as e:
    print("TypeError:", type(e).__name__)

# OUTPUT:
# TypeError: TypeError`],
        [`<b>Limitations:</b> the pattern adds ceremony that Python rarely needs. A mapping from family name to a tuple of classes gives the same result with far less code.`,
            r`class DarkButton: name = "dark button"
class DarkLabel:  name = "dark label"
class LightButton: name = "light button"
class LightLabel:  name = "light label"

FAMILIES = {"dark": (DarkButton, DarkLabel), "light": (LightButton, LightLabel)}

button_cls, label_cls = FAMILIES["dark"]
print(button_cls().name, "+", label_cls().name)

# OUTPUT:
# dark button + dark label`],
        r`
              +--------------------+
   client --> |  UIFactory (ABC)   |
              |  button()  label() |
              +---------+----------+
                 +------+------+
                 v             v
          +-----------+  +-----------+
          |  LightUI  |  |   DarkUI  |
          +-----+-----+  +-----+-----+
                |   creates    |
        LightButton LightLabel   DarkButton DarkLabel
   (one family per factory - never mixed)
`,
        `Use Abstract Factory when you truly have several interchangeable families that must stay consistent (vendors, platforms, environments). In Python prefer simple dicts or dependency injection of a few callables. If the number of product types is likely to grow, the pattern becomes costly because every factory must change.`
    ),

    'Builder': dd(
        [`The <b>Builder</b> pattern constructs a complex object step by step. A fluent builder returns <code>self</code> from each step, so calls chain, and a final <code>build()</code> returns the finished object.`,
            r`class Pizza:
    def __init__(self, size, toppings):
        self.size, self.toppings = size, toppings
    def __repr__(self):
        return f"Pizza(size={self.size}, toppings={self.toppings})"

class PizzaBuilder:
    def __init__(self):
        self._size, self._toppings = None, []
    def size(self, s):
        self._size = s; return self           # return self to allow chaining
    def add(self, topping):
        self._toppings.append(topping); return self
    def build(self):
        return Pizza(self._size, list(self._toppings))

print(PizzaBuilder().size("large").add("cheese").add("olives").build())

# OUTPUT:
# Pizza(size=large, toppings=['cheese', 'olives'])`],
        [`A constructor with many optional parameters becomes unreadable: what do <code>True, False, True, 10</code> mean? A builder names every step, so the call reads like a sentence.`,
            r`class ReportBuilder:
    def __init__(self):
        self.cfg = {"title": "Untitled", "header": False, "footer": False, "rows": 10}
    def title(self, t):  self.cfg["title"] = t;  return self
    def header(self):    self.cfg["header"] = True; return self
    def rows(self, n):   self.cfg["rows"] = n;  return self
    def build(self):     return dict(self.cfg)

# readable, unlike  Report("Sales", True, False, 50)
print(ReportBuilder().title("Sales").header().rows(50).build())

# OUTPUT:
# {'title': 'Sales', 'header': True, 'footer': False, 'rows': 50}`],
        [`Query builders (SQLAlchemy, Django ORM), HTTP request builders, test-data builders, UI form builders and document generators all use this pattern.`,
            r`class Query:
    def __init__(self):
        self._cols, self._table, self._where = "*", None, []
    def select(self, *cols): self._cols = ", ".join(cols); return self
    def from_(self, table):  self._table = table;           return self
    def where(self, cond):   self._where.append(cond);      return self
    def build(self):
        sql = f"SELECT {self._cols} FROM {self._table}"
        if self._where:
            sql += " WHERE " + " AND ".join(self._where)
        return sql

print(Query().select("name", "age").from_("users").where("age > 18").where("active = 1").build())

# OUTPUT:
# SELECT name, age FROM users WHERE age > 18 AND active = 1`],
        [`<b>Advantages:</b> readable construction, optional parts handled cleanly, and validation can happen in one place, at <code>build()</code>, before an invalid object exists.`,
            r`class UserBuilder:
    def __init__(self): self._name = self._email = None
    def name(self, n):  self._name = n;  return self
    def email(self, e): self._email = e; return self
    def build(self):
        if not self._name:
            raise ValueError("name is required")     # validated before creating the object
        return {"name": self._name, "email": self._email}

try:
    UserBuilder().email("a@b.com").build()
except ValueError as e:
    print("ValueError:", e)
print(UserBuilder().name("Ann").build())

# OUTPUT:
# ValueError: name is required
# {'name': 'Ann', 'email': None}`],
        [`<b>Disadvantages:</b> extra class and boilerplate. In Python, keyword arguments and dataclasses with defaults usually give the same readability with less code.`,
            r`from dataclasses import dataclass, field

@dataclass(frozen=True)
class Pizza:
    size: str = "medium"
    toppings: tuple = field(default_factory=tuple)

print(Pizza(size="large", toppings=("cheese", "olives")))   # no builder needed

# OUTPUT:
# Pizza(size='large', toppings=('cheese', 'olives'))`],
        [`<b>Limitations:</b> builders are mutable and easy to reuse by mistake. If <code>build()</code> hands out the builder's own list, later steps silently change objects that were already built.`,
            r`class Pizza:
    def __init__(self, toppings): self.toppings = toppings

class BadBuilder:
    def __init__(self): self._toppings = []
    def add(self, t): self._toppings.append(t); return self
    def build(self): return Pizza(self._toppings)    # BUG: shares the same list

b = BadBuilder().add("cheese")
p1 = b.build()
b.add("olives")                                      # meant for the next pizza...
p2 = b.build()
print(p1.toppings)                                   # ...but p1 changed too

# OUTPUT:
# ['cheese', 'olives']`],
        r`
   Director / client
        |  .size("large")
        v
   +--------------+   .add("cheese")   +--------------+
   |   Builder    | -----------------> |   Builder    |
   |  (partial)   |   .add("olives")   |  (more parts)|
   +--------------+                    +------+-------+
                                              | .build()
                                              v
                                      +---------------+
                                      |  Pizza (final)|
                                      +---------------+
`,
        `Reach for a builder when an object has many optional parts, an order of assembly, or must be validated as a whole. For simple records, use dataclasses with defaults and keyword arguments. Make <code>build()</code> copy mutable state, and consider returning an immutable (frozen) result.`
    ),

    'Strategy': dd(
        [`The <b>Strategy</b> pattern defines a family of interchangeable algorithms and lets the caller pick one at runtime. In Python a strategy is often just a function passed as an argument.`,
            r`def no_discount(price):  return price
def ten_percent(price):  return price * 0.9
def flat_twenty(price):  return price - 20

def checkout(price, strategy):          # behaviour is chosen by the caller
    return strategy(price)

for s in (no_discount, ten_percent, flat_twenty):
    print(s.__name__, checkout(100, s))

# OUTPUT:
# no_discount 100
# ten_percent 90.0
# flat_twenty 80`],
        [`Without Strategy, a function grows a long <code>if/elif</code> chain that must be edited for every new rule. Strategy moves each rule into its own unit, so adding one never touches the others (open/closed principle).`,
            r`class Cart:
    def __init__(self, items, shipping):
        self.items, self.shipping = items, shipping      # shipping is a strategy
    def total(self):
        return sum(self.items) + self.shipping(sum(self.items))

standard = lambda subtotal: 5
free_over_50 = lambda subtotal: 0 if subtotal >= 50 else 5

print(Cart([20, 10], standard).total())
print(Cart([40, 30], free_over_50).total())

# OUTPUT:
# 35
# 70`],
        [`Payment methods, sorting rules, compression formats, pricing, retry/back-off policies and authentication schemes are strategies. The class-based form suits strategies that carry their own settings.`,
            r`class CardPayment:
    def pay(self, amount): return f"charged card {amount}"
class UpiPayment:
    def __init__(self, vpa): self.vpa = vpa
    def pay(self, amount): return f"UPI {amount} from {self.vpa}"

class Checkout:
    def __init__(self, method): self.method = method
    def complete(self, amount): return self.method.pay(amount)

print(Checkout(CardPayment()).complete(250))
print(Checkout(UpiPayment("ann@bank")).complete(99))

# OUTPUT:
# charged card 250
# UPI 99 from ann@bank`],
        [`<b>Advantages:</b> algorithms can be swapped at runtime, tested in isolation, and added without changing existing code.`,
            r`class Shipping:
    def __init__(self, strategy): self.strategy = strategy
    def cost(self, kg): return self.strategy(kg)

standard = lambda kg: 5 + kg
express = lambda kg: 15 + 2 * kg

order = Shipping(standard)
print("standard:", order.cost(3))
order.strategy = express                 # swap at runtime
print("express :", order.cost(3))

# OUTPUT:
# standard: 8
# express : 21`],
        [`<b>Disadvantages:</b> callers must know which strategies exist, and every strategy must accept the same arguments. A mismatched one fails only when called.`,
            r`def apply(strategy, x):
    return strategy(x)                  # contract: one argument

good = lambda x: x * 2
bad = lambda x, y: x * y                # different signature

print(apply(good, 4))
try:
    apply(bad, 4)
except TypeError as e:
    print("TypeError:", type(e).__name__)

# OUTPUT:
# 8
# TypeError: TypeError`],
        [`<b>Limitations:</b> Python does not enforce the strategy interface by default. A <code>typing.Protocol</code> documents it and allows an <code>isinstance</code> check at runtime.`,
            r`from typing import Protocol, runtime_checkable

@runtime_checkable
class PaymentStrategy(Protocol):
    def pay(self, amount: float) -> str: ...

class Card:
    def pay(self, amount): return "card"
class Broken:
    def charge(self, amount): return "oops"       # wrong method name

print(isinstance(Card(), PaymentStrategy))
print(isinstance(Broken(), PaymentStrategy))

# OUTPUT:
# True
# False`],
        r`
   +-----------+   uses   +--------------------+
   |  Context  | --------> |  Strategy (iface)  |
   |  Checkout |           |  pay(amount)       |
   +-----------+           +---------+----------+
                              +------+------+
                              v             v
                        +-----------+ +-----------+
                        |   Card    | |    UPI    |
                        +-----------+ +-----------+
   swap the strategy object -> behaviour changes, Context unchanged
`,
        `In Python prefer plain functions, lambdas or <code>functools.partial</code> as strategies; use classes only when a strategy has state or several methods. Select the strategy from configuration or a registry at the composition root. Do not introduce the pattern for a single, stable algorithm.`
    ),

    'Observer': dd(
        [`The <b>Observer</b> pattern lets one object (the subject) notify any number of dependents (observers) when something changes, without knowing who they are. It is the basis of event handling, signals and publish/subscribe.`,
            r`class Subject:
    def __init__(self):
        self._observers = []
    def subscribe(self, fn):
        self._observers.append(fn)
    def notify(self, value):
        for fn in self._observers:          # tell everyone who registered
            fn(value)

temp = Subject()
temp.subscribe(lambda v: print("display shows", v))
temp.subscribe(lambda v: print("logger saved", v))
temp.notify(21.5)

# OUTPUT:
# display shows 21.5
# logger saved 21.5`],
        [`Without it, a sensor would have to call the display, the logger and the alarm directly, and adding a new consumer means editing the sensor. Observer keeps the publisher unaware of its consumers.`,
            r`class Sensor:
    def __init__(self): self.handlers = []
    def on_change(self, h): self.handlers.append(h)
    def set(self, value):
        for h in self.handlers: h(value)

alerts = []
s = Sensor()
s.on_change(lambda v: alerts.append("HOT!") if v > 30 else None)   # new feature, sensor untouched
s.set(25)
s.set(35)
print(alerts)

# OUTPUT:
# ['HOT!']`],
        [`GUI button clicks, Django signals, webhooks, message buses, spreadsheet recalculation and "notify me when stock arrives" features all follow it. An event bus generalises the idea to named topics.`,
            r`from collections import defaultdict

class EventBus:
    def __init__(self): self.handlers = defaultdict(list)
    def on(self, topic, fn): self.handlers[topic].append(fn)
    def emit(self, topic, data):
        for fn in self.handlers[topic]:
            fn(data)

bus = EventBus()
bus.on("order.created", lambda o: print("email sent for order", o))
bus.on("order.created", lambda o: print("stock reduced for order", o))
bus.emit("order.created", 101)

# OUTPUT:
# email sent for order 101
# stock reduced for order 101`],
        [`<b>Advantages:</b> loose coupling, observers can be added or removed at runtime, and one event can drive many reactions.`,
            r`class Subject:
    def __init__(self): self._obs = []
    def subscribe(self, fn):   self._obs.append(fn)
    def unsubscribe(self, fn): self._obs.remove(fn)
    def notify(self, v):
        for fn in list(self._obs): fn(v)

def printer(v): print("got", v)

s = Subject()
s.subscribe(printer)
s.notify(1)
s.unsubscribe(printer)                  # removed at runtime
s.notify(2)                             # nobody listens now
print("done")

# OUTPUT:
# got 1
# done`],
        [`<b>Disadvantages:</b> control flow becomes hard to follow, notification order is implicit, and one failing observer can stop the rest from running.`,
            r`class Subject:
    def __init__(self): self._obs = []
    def subscribe(self, fn): self._obs.append(fn)
    def notify(self, v):
        for fn in self._obs: fn(v)

ran = []
def broken(v): raise ValueError("boom")
def second(v): ran.append("second")

s = Subject()
s.subscribe(broken)
s.subscribe(second)
try:
    s.notify(1)
except ValueError as e:
    print("caught:", e)
print("second ran:", "second" in ran)

# OUTPUT:
# caught: boom
# second ran: False`],
        [`<b>Limitations:</b> a subject that stores observers keeps them alive, causing memory leaks ("lapsed listener"). <code>weakref.WeakMethod</code> lets observers be garbage collected.`,
            r`import weakref, gc

class Listener:
    def on(self, v): pass

strong_list = []
l1 = Listener()
strong_list.append(l1.on)               # bound method keeps l1 alive
ref1 = weakref.ref(l1)
del l1; gc.collect()
print("strong ref keeps it alive:", ref1() is not None)

l2 = Listener()
weak = weakref.WeakMethod(l2.on)        # does not keep l2 alive
del l2; gc.collect()
print("weak ref allows cleanup  :", weak() is None)

# OUTPUT:
# strong ref keeps it alive: True
# weak ref allows cleanup  : True`],
        r`
                      +--------------+
                      |   Subject    |
                      |  (publisher) |
                      +------+-------+
                             | notify(event)
            +----------------+----------------+
            v                v                v
      +-----------+    +-----------+    +-----------+
      | Observer1 |    | Observer2 |    | Observer3 |
      |  display  |    |  logger   |    |  alarm    |
      +-----------+    +-----------+    +-----------+
`,
        `Observer decouples producers from consumers inside one process; when reactions must survive crashes, cross services or be retried, graduate to a durable message broker. Decide on ordering, error isolation (wrap each callback in try/except) and unsubscription up front. Avoid long synchronous chains of observers triggering observers.`
    )
};
