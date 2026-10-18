// Module 9 (Object-Oriented Programming), part A: core OOP ideas.
import { dd, r, type DeepDive } from './deepDive';

export const m09a: Record<string, DeepDive> = {
    'Object-Oriented Programming in Python': dd(
        [`<b>OOP</b> models a program as <b>objects</b>: bundles of data (attributes) and behaviour (methods) created from a blueprint called a <b>class</b>. In Python everything is already an object - ints, strings, functions - and <code>class</code> lets you define your own types.`,
            r`# A class is a blueprint; each call creates a new object (instance)
class Dog:
    def __init__(self, name):         # runs when Dog("...") is called
        self.name = name              # data stored on the object

    def speak(self):                  # behaviour that uses the object's data
        return f"{self.name} says Woof"

d = Dog("Rex")                        # create an instance
print(d.speak())
print(type(d).__name__)               # the class this object came from

# OUTPUT:
# Rex says Woof
# Dog`],
        [`Without classes, data and the functions that work on it drift apart (a dict here, ten loose functions there). A class keeps state and the rules that protect it in one place, so large programs stay understandable.`,
            r`# Procedural: data and logic are separate; nothing stops bad usage
acct = {"balance": 100}
def deposit(a, amt): a["balance"] += amt

# OOP: state + behaviour travel together
class Account:
    def __init__(self, balance):
        self.balance = balance
    def deposit(self, amt):
        self.balance += amt

a = Account(100)
a.deposit(50)
print(a.balance)

# OUTPUT:
# 150`],
        [`Real systems: Django/SQLAlchemy models (one class per table), GUI widgets, game entities, HTTP clients and every framework you plug into by subclassing.`,
            r`# A tiny domain model like an e-commerce backend would have
class Order:
    def __init__(self, items):
        self.items = items                    # list of (name, qty, unit_price)

    def total(self):
        return sum(q * p for _, q, p in self.items)

o = Order([("pen", 2, 10), ("book", 1, 50)])
print("Order total:", o.total())

# OUTPUT:
# Order total: 70`],
        [`<b>Advantages:</b> reuse through inheritance, clear modelling of real-world things, state kept next to its rules, easy extension (add a new class, leave old code alone).`,
            r`# Reuse: Cat gets describe() for free from Animal
class Animal:
    def __init__(self, name):
        self.name = name
    def describe(self):
        return f"I am {self.name}"

class Cat(Animal):          # inherits everything from Animal
    pass

print(Cat("Tom").describe())

# OUTPUT:
# I am Tom`],
        [`<b>Disadvantages:</b> easy to over-engineer. A class with one method and no state is just a function with extra ceremony; deep hierarchies are hard to follow.`,
            r`# Over-engineered: a class used as a function
class Adder:
    def __init__(self, a, b):
        self.a, self.b = a, b
    def run(self):
        return self.a + self.b

def add(a, b):              # the simple version does the same job
    return a + b

print(Adder(2, 3).run(), add(2, 3))

# OUTPUT:
# 5 5`],
        [`<b>Limitations:</b> Python has no truly private members; encapsulation is by convention. Anyone can read or overwrite an object's attributes.`,
            r`class Account:
    def __init__(self):
        self._balance = 100          # "protected" by convention only

a = Account()
a._balance = -999                    # nothing stops this
print(a.__dict__)                    # all state is a plain dict

# OUTPUT:
# {'_balance': -999}`],
        `
   class Dog  (blueprint)
   ┌──────────────────────────┐
   │ attrs:   name            │
   │ methods: speak()         │
   └────────────┬─────────────┘
                │ Dog("Rex")      Dog("Fido")
        ┌───────┴────────┐     ┌──────┴─────────┐
        │ obj 1          │     │ obj 2          │
        │ name = "Rex"   │     │ name = "Fido"  │
        └────────────────┘     └────────────────┘
`,
        `Use classes when you have state that must obey invariants or several interchangeable behaviours. Prefer plain functions, dataclasses and composition for simple data and one-off logic; Python is multi-paradigm, so do not force everything into a hierarchy.`
    ),

    'Attributes & Methods': dd(
        [`<b>Attributes</b> are variables attached to a class or an object; <b>methods</b> are functions defined in a class that receive the instance as the first argument (<code>self</code>).`,
            r`class Car:
    wheels = 4                         # class attribute: shared by all cars

    def __init__(self, color):
        self.color = color             # instance attribute: one per car

    def describe(self):                # method
        return f"{self.color} car with {self.wheels} wheels"

c = Car("red")
print(c.describe())

# OUTPUT:
# red car with 4 wheels`],
        [`Objects must hold state and expose operations. Python also lets you read and write attributes by name at runtime, which frameworks use for configuration and serialization.`,
            r`class Settings:
    pass

s = Settings()
setattr(s, "debug", True)              # same as s.debug = True, name is a string
print(getattr(s, "debug"))             # read by name
print(getattr(s, "port", 8080))        # default when missing
print(hasattr(s, "host"))

# OUTPUT:
# True
# 8080
# False`],
        [`Serializers, ORMs and form libraries loop over an object's attributes. <code>vars(obj)</code> exposes them as a dict, ready for JSON.`,
            r`import json

class User:
    def __init__(self, name, age):
        self.name = name
        self.age = age

u = User("Ann", 30)
print(json.dumps(vars(u)))             # vars() -> {'name': 'Ann', 'age': 30}

# OUTPUT:
# {"name": "Ann", "age": 30}`],
        [`<b>Advantages:</b> attributes can be added, inspected and removed dynamically; methods are bound to the object automatically.`,
            r`class Box: pass
b = Box()
b.size = 10                            # add an attribute on the fly
print(b.size)
del b.size                             # remove it again
print(hasattr(b, "size"))

# OUTPUT:
# 10
# False`],
        [`<b>Disadvantages:</b> a typo silently creates a brand new attribute instead of raising an error.`,
            r`class Person:
    def __init__(self, name):
        self.name = name

p = Person("Ann")
p.nmae = "Baji"                         # typo: creates a NEW attribute
print(p.name)                          # unchanged!
print(vars(p))

# OUTPUT:
# Ann
# {'name': 'Ann', 'nmae': 'Baji'}`],
        [`<b>Limitations:</b> every instance carries a <code>__dict__</code> (memory cost). <code>__slots__</code> removes it and blocks unknown attributes, but gives up flexibility.`,
            r`class Point:
    __slots__ = ("x", "y")             # only these attributes are allowed
    def __init__(self, x, y):
        self.x, self.y = x, y

p = Point(1, 2)
try:
    p.z = 3                            # not in __slots__
except AttributeError as e:
    print("blocked:", type(e).__name__)
print(hasattr(p, "__dict__"))

# OUTPUT:
# blocked: AttributeError
# False`],
        `
   obj.color ──► look in obj.__dict__ ──found──► value
                       │ not found
                       ▼
                 look in Class.__dict__ ──found──► value / bound method
                       │ not found
                       ▼
                 look in parent classes (MRO) ──► else AttributeError
`,
        `Attribute lookup (instance, then class, then bases) is the engine behind everything in Python OOP. Use <code>__slots__</code> for millions of small objects, dataclasses for plain data, and properties when an attribute needs validation; do not scatter dynamic setattr through business code.`
    ),

    'Constructors & self': dd(
        [`The <b>constructor</b> hook is <code>__init__</code>: Python calls it on a freshly created object to set its initial state. <code>self</code> is that object, passed automatically as the first argument; the name is a convention, not a keyword.`,
            r`class Student:
    def __init__(self, name, grade):
        self.name = name               # self = the new object
        self.grade = grade

    def whoami(self):
        return self                    # self is just the object itself

s = Student("Ann", 10)
print(s.name, s.grade)
print(s.whoami() is s)

# OUTPUT:
# Ann 10
# True`],
        [`Without a constructor every object starts empty and callers must remember to fill each field. <code>__init__</code> guarantees a valid starting state, with defaults.`,
            r`class Server:
    def __init__(self, host="localhost", port=8000, tags=None):
        self.host = host
        self.port = port
        self.tags = tags if tags is not None else []   # never use [] as default!

a, b = Server(), Server("example.com", 443)
a.tags.append("dev")
print(a.host, a.port, a.tags)
print(b.host, b.port, b.tags)

# OUTPUT:
# localhost 8000 ['dev']
# example.com 443 []`],
        [`Alternative constructors via <code>@classmethod</code> build objects from other formats (CSV rows, JSON, environment).`,
            r`class User:
    def __init__(self, name, age):
        self.name, self.age = name, age

    @classmethod
    def from_string(cls, text):        # cls is the class (works for subclasses too)
        name, age = text.split(",")
        return cls(name, int(age))

u = User.from_string("Ann,30")
print(u.name, u.age)

# OUTPUT:
# Ann 30`],
        [`<b>Advantages:</b> a single place to validate input and enforce invariants so no invalid object can exist.`,
            r`class Age:
    def __init__(self, value):
        if value < 0:
            raise ValueError("age cannot be negative")
        self.value = value

try:
    Age(-5)
except ValueError as e:
    print("rejected:", e)
print(Age(20).value)

# OUTPUT:
# rejected: age cannot be negative
# 20`],
        [`<b>Disadvantages:</b> there is only one <code>__init__</code> per class; defining it twice silently replaces the first (no overloading).`,
            r`class A:
    def __init__(self):
        self.x = 0
    def __init__(self, x):             # replaces the previous __init__
        self.x = x

try:
    A()
except TypeError:
    print("TypeError: A() now requires x")
print(A(5).x)

# OUTPUT:
# TypeError: A() now requires x
# 5`],
        [`<b>Limitations:</b> <code>__init__</code> initialises, it does not create: the object already exists (made by <code>__new__</code>), and <code>__init__</code> must return <code>None</code>.`,
            r`class Bad:
    def __init__(self):
        return 42                      # not allowed

try:
    Bad()
except TypeError as e:
    print(type(e).__name__)

class Singleton:
    _inst = None
    def __new__(cls):                  # __new__ controls creation itself
        if cls._inst is None:
            cls._inst = super().__new__(cls)
        return cls._inst

print(Singleton() is Singleton())

# OUTPUT:
# TypeError
# True`],
        `
   Student("Ann", 10)
        │
        ▼
   ┌───────────────────┐   1. __new__(cls)        -> allocate empty object
   │ type.__call__     │   2. __init__(self, ...) -> fill it with state
   └───────────────────┘   3. return the object
        │
        ▼
   s ──► { name: "Ann", grade: 10 }
`,
        `Keep <code>__init__</code> cheap and side-effect free (no network or file work) so objects are easy to test; inject dependencies through parameters. Prefer classmethod factories over many optional arguments, and use <code>__new__</code> only for immutable subclasses or singletons.`
    ),

    'Encapsulation': dd(
        [`<b>Encapsulation</b> means bundling data with the methods that operate on it and controlling outside access. Python relies on conventions: <code>_name</code> means "internal", <code>__name</code> triggers name mangling.`,
            r`class Account:
    def __init__(self):
        self.owner = "Ann"             # public
        self._balance = 100            # protected by convention
        self.__pin = 1234              # name-mangled to _Account__pin

a = Account()
print(a.owner, a._balance)
try:
    print(a.__pin)
except AttributeError:
    print("no attribute __pin")
print(a._Account__pin)                 # still reachable, just renamed

# OUTPUT:
# Ann 100
# no attribute __pin
# 1234`],
        [`If anyone can write <code>balance = -500</code>, invariants break. Routing changes through methods lets the class refuse invalid states.`,
            r`class Wallet:
    def __init__(self, money):
        self._money = money

    def spend(self, amount):
        if amount > self._money:
            raise ValueError("insufficient funds")
        self._money -= amount

    @property
    def money(self):                   # read-only view
        return self._money

w = Wallet(100)
w.spend(30)
print(w.money)
try:
    w.spend(500)
except ValueError as e:
    print("error:", e)

# OUTPUT:
# 70
# error: insufficient funds`],
        [`Libraries expose a small public API and hide internals so they can change them later. Anything starting with an underscore is "do not depend on this".`,
            r`class Cache:
    def __init__(self):
        self._data = {}                # internal storage, free to change later

    def put(self, k, v):
        self._data[k] = v

    def get(self, k):
        return self._data.get(k)

c = Cache()
c.put("a", 1)
print(c.get("a"), c.get("zzz"))

# OUTPUT:
# 1 None`],
        [`<b>Advantages:</b> you can change the internal representation without breaking users of the class.`,
            r`class Price:
    def __init__(self, dollars):
        self._cents = int(dollars * 100)   # stored as cents internally

    @property
    def dollars(self):                     # public API stays the same
        return self._cents / 100

print(Price(12.5).dollars)

# OUTPUT:
# 12.5`],
        [`<b>Disadvantages:</b> writing Java-style getters/setters for every field is verbose; in Python a plain public attribute is usually better until you need logic (then use a property).`,
            r`class Verbose:                      # un-Pythonic
    def __init__(self): self._x = 0
    def get_x(self): return self._x
    def set_x(self, v): self._x = v

class Simple:                       # Pythonic
    def __init__(self): self.x = 0

v, s = Verbose(), Simple()
v.set_x(5); s.x = 5
print(v.get_x(), s.x)

# OUTPUT:
# 5 5`],
        [`<b>Limitations:</b> nothing is truly private. Name mangling only renames; a determined caller can still change the value.`,
            r`class Account:
    def __init__(self):
        self.__pin = 1234

a = Account()
a._Account__pin = 0                    # bypasses the "private" attribute
print(a._Account__pin)
print([k for k in vars(a)])

# OUTPUT:
# 0
# ['_Account__pin']`],
        `
   outside code
        │  only the public door
        ▼
   ┌─────────────────────────────┐
   │ Wallet                      │
   │  public:  spend() money     │
   │  ┌───────────────────────┐  │
   │  │ _money  (internal)    │  │
   │  └───────────────────────┘  │
   └─────────────────────────────┘
`,
        `Python's philosophy is "we are all consenting adults": document the public API, prefix internals with an underscore and validate in methods or properties. Reserve <code>__mangling</code> for avoiding name clashes in subclasses, not for security; real security needs process or service boundaries.`
    ),

    'Inheritance': dd(
        [`<b>Inheritance</b> lets a child class reuse and extend a parent class, forming an "is-a" relationship: a Dog is an Animal.`,
            r`class Animal:
    def __init__(self, name):
        self.name = name
    def eat(self):
        return f"{self.name} eats"

class Dog(Animal):                     # Dog inherits from Animal
    def bark(self):
        return f"{self.name} barks"

d = Dog("Rex")
print(d.eat())
print(d.bark())
print(isinstance(d, Animal), issubclass(Dog, Animal))

# OUTPUT:
# Rex eats
# Rex barks
# True True`],
        [`Copy-pasting shared code into many classes means fixing each bug many times. Inheritance puts shared behaviour in one place.`,
            r`class Employee:
    def __init__(self, name, salary):
        self.name, self.salary = name, salary
    def pay(self):
        return self.salary

class Manager(Employee):
    def __init__(self, name, salary, bonus):
        super().__init__(name, salary)     # reuse the parent's setup
        self.bonus = bonus
    def pay(self):
        return self.salary + self.bonus    # extend behaviour

print(Employee("Baji", 1000).pay(), Manager("Ann", 2000, 500).pay())

# OUTPUT:
# 1000 2500`],
        [`Exception hierarchies are the most common real use: catch one base class to handle a whole family of errors.`,
            r`class AppError(Exception): pass
class NotFound(AppError): pass
class Forbidden(AppError): pass

def handler(kind):
    if kind == "nf": raise NotFound("page missing")
    raise Forbidden("no access")

for k in ("nf", "fb"):
    try:
        handler(k)
    except AppError as e:                  # one except catches both children
        print(type(e).__name__, "->", e)

# OUTPUT:
# NotFound -> page missing
# Forbidden -> no access`],
        [`<b>Advantages:</b> code reuse, a natural type hierarchy and polymorphism (a child can be used wherever a parent is expected).`,
            r`class Shape:
    def area(self): return 0
class Square(Shape):
    def __init__(self, s): self.s = s
    def area(self): return self.s ** 2

shapes = [Shape(), Square(3)]
print([s.area() for s in shapes])

# OUTPUT:
# [0, 9]`],
        [`<b>Disadvantages:</b> tight coupling. A child inherits <i>everything</i>, including methods that break its rules (the fragile base class problem).`,
            r`class Stack(list):                    # "is-a list" - but too much exposed
    def push(self, x): self.append(x)

s = Stack()
s.push(1); s.push(2)
s.insert(0, 9)                         # list method breaks stack discipline
print(s)
print(s.pop())

# OUTPUT:
# [9, 1, 2]
# 2`],
        [`<b>Limitations:</b> some built-in types cannot be subclassed, and a class can only extend what is designed to be extended.`,
            r`try:
    class MyBool(bool):                # bool is final
        pass
except TypeError as e:
    print("TypeError:", e)

# OUTPUT:
# TypeError: type 'bool' is not an acceptable base type`],
        `
          ┌──────────┐
          │ Animal   │  eat()
          └────┬─────┘
        ┌──────┴───────┐
   ┌────┴─────┐   ┌────┴─────┐
   │ Dog      │   │ Cat      │
   │ bark()   │   │ meow()   │
   └──────────┘   └──────────┘
   child ──is-a──► parent
`,
        `Favour composition ("has-a") over inheritance when you only want to reuse code; inherit only for a genuine is-a relationship and keep hierarchies shallow (2-3 levels). Wrapping a list inside a Stack class is safer than subclassing list.`
    ),

    'Polymorphism': dd(
        [`<b>Polymorphism</b> ("many forms") means different classes respond to the same method call in their own way. Python uses <b>duck typing</b>: if it has the method, it works; no common parent required.`,
            r`class Circle:
    def __init__(self, r): self.r = r
    def area(self): return 3.14 * self.r * self.r

class Rect:
    def __init__(self, w, h): self.w, self.h = w, h
    def area(self): return self.w * self.h

for shape in (Circle(2), Rect(2, 3)):      # same call, different behaviour
    print(type(shape).__name__, shape.area())

# OUTPUT:
# Circle 12.56
# Rect 6`],
        [`Without polymorphism, code fills up with <code>if type == ...</code> chains that must be edited for every new type.`,
            r`class Email:
    def send(self, msg): return f"email: {msg}"
class Sms:
    def send(self, msg): return f"sms: {msg}"

def notify(channel, msg):                  # knows nothing about concrete types
    return channel.send(msg)

print(notify(Email(), "hi"))
print(notify(Sms(), "hi"))

# OUTPUT:
# email: hi
# sms: hi`],
        [`Built-ins are polymorphic: <code>len</code>, <code>+</code> and <code>for</code> work on many types. Payment, storage and logging backends are swapped the same way.`,
            r`print(len("abc"), len([1, 2]), len({"a": 1}))   # len works on many types
print(1 + 2, "a" + "b", [1] + [2])             # + means different things

# OUTPUT:
# 3 2 1
# 3 ab [1, 2]`],
        [`<b>Advantages:</b> add a new type without touching existing code (open/closed principle); simpler call sites.`,
            r`class Pdf:
    def export(self): return "PDF bytes"
class Csv:
    def export(self): return "a,b,c"
class Json:                                # new type added later, loop unchanged
    def export(self): return "{}"

for fmt in (Pdf(), Csv(), Json()):
    print(fmt.export())

# OUTPUT:
# PDF bytes
# a,b,c
# {}`],
        [`<b>Disadvantages:</b> duck typing is checked only at runtime; a missing method fails when that line runs.`,
            r`class Fish:
    pass                                   # forgot to define speak()

def talk(animal):
    return animal.speak()

try:
    talk(Fish())
except AttributeError as e:
    print("AttributeError:", e)

# OUTPUT:
# AttributeError: 'Fish' object has no attribute 'speak'`],
        [`<b>Limitations:</b> Python has no method overloading by argument type. Use <code>functools.singledispatch</code> for type-based dispatch.`,
            r`from functools import singledispatch

@singledispatch
def describe(x):
    return f"other {x}"

@describe.register(int)
def _(x): return f"int {x}"

@describe.register(str)
def _(x): return f"str {x}"

print(describe(5), "|", describe("a"), "|", describe(2.5))

# OUTPUT:
# int 5 | str a | other 2.5`],
        `
   shape.area()
        │
        ├──► Circle.area()  -> pi*r*r
        ├──► Rect.area()    -> w*h
        └──► Tri.area()     -> b*h/2
   one call site, many implementations
`,
        `Depend on behaviour (a method contract), not on concrete classes. Document the contract with a Protocol or ABC so static checkers catch mismatches that duck typing would only reveal at runtime.`
    ),

    'Abstraction': dd(
        [`<b>Abstraction</b> exposes what an object does and hides how. Callers use a simple interface while complicated steps stay inside.`,
            r`class Coffee:
    def make(self):                        # one simple public method
        self._boil(); self._brew()
        return "coffee ready"
    def _boil(self): pass                  # hidden detail
    def _brew(self): pass                  # hidden detail

print(Coffee().make())

# OUTPUT:
# coffee ready`],
        [`Complexity overwhelms. If every caller had to know the ten steps of charging a card, any change would ripple everywhere.`,
            r`class PaymentGateway:
    def charge(self, amount):              # callers see only this
        token = self._tokenize()
        self._call_bank(token, amount)
        return f"charged {amount}"
    def _tokenize(self): return "tok_123"
    def _call_bank(self, token, amount): pass

print(PaymentGateway().charge(25))

# OUTPUT:
# charged 25`],
        [`Database drivers, file objects and HTTP clients all present one small interface (<code>read</code>, <code>write</code>, <code>get</code>) over very different internals.`,
            r`import io
for f in (io.StringIO("hello"), io.BytesIO(b"hello")):
    print(f.read())                        # same call, different internals

# OUTPUT:
# hello
# b'hello'`],
        [`<b>Advantages:</b> less coupling, implementations can be replaced, easier testing with fakes.`,
            r`class RealDb:
    def get(self, k): return "from database"
class FakeDb:
    def get(self, k): return "test value"

def service(db): return db.get("x").upper()
print(service(RealDb()))
print(service(FakeDb()))

# OUTPUT:
# FROM DATABASE
# TEST VALUE`],
        [`<b>Disadvantages:</b> abstractions can leak or add needless indirection (layers that only forward calls).`,
            r`class Wrapper:                           # adds nothing, only forwards
    def __init__(self, inner): self.inner = inner
    def run(self): return self.inner.run()

class Real:
    def run(self): return "done"

print(Wrapper(Real()).run())               # one extra hop for no benefit

# OUTPUT:
# done`],
        [`<b>Limitations:</b> without <code>abc</code>, Python does not force subclasses to implement the abstract part; the error appears only when the method is called.`,
            r`class Base:
    def run(self):
        raise NotImplementedError("subclass must implement run")

class Child(Base):
    pass                                   # forgot run()

c = Child()                                # creating it works
try:
    c.run()
except NotImplementedError as e:
    print("late failure:", e)

# OUTPUT:
# late failure: subclass must implement run`],
        `
   caller ──► ┌──────────────────────┐
              │ public interface     │  charge(amount)
              ├──────────────────────┤
              │ hidden: tokenize()   │
              │         call_bank()  │
              │         log()        │
              └──────────────────────┘
`,
        `Good abstractions are small and stable; create one only when you have two real implementations or a real need to isolate change. Enforce them with ABCs or Protocols, and avoid speculative layers that make the code harder to follow.`
    ),

    'Instance vs Class Variables': dd(
        [`<b>Class variables</b> live on the class and are shared by every instance. <b>Instance variables</b> live on each object (set via <code>self</code>) and belong to it alone.`,
            r`class Dog:
    species = "Canis"                  # class variable (shared)
    def __init__(self, name):
        self.name = name               # instance variable (per object)

a, b = Dog("Rex"), Dog("Fido")
print(a.species, b.species, a.name, b.name)
Dog.species = "Canis lupus"            # change once, all see it
print(a.species, b.species)

# OUTPUT:
# Canis Canis Rex Fido
# Canis lupus Canis lupus`],
        [`Some data is naturally per-object (a name), other data is naturally global to the type (a counter, a constant, a registry). Each needs a home.`,
            r`class User:
    count = 0                          # how many users exist
    def __init__(self, name):
        self.name = name
        User.count += 1                # update the CLASS variable explicitly

User("a"); User("b"); User("c")
print(User.count)

# OUTPUT:
# 3`],
        [`Class variables hold constants, default config, counters and plugin registries.`,
            r`class Plugin:
    registry = []                      # shared list of all plugins
    def __init__(self, name):
        self.name = name
        Plugin.registry.append(name)

Plugin("csv"); Plugin("json")
print(Plugin.registry)

# OUTPUT:
# ['csv', 'json']`],
        [`<b>Advantages:</b> shared data is stored once, saving memory, and constants are changed in one place.`,
            r`class Config:
    TAX = 0.2                          # one copy for millions of objects

class Item(Config):
    def __init__(self, price): self.price = price
    def total(self): return self.price * (1 + self.TAX)

print(Item(100).total())

# OUTPUT:
# 120.0`],
        [`<b>Disadvantages:</b> a mutable class variable is shared by all instances, a classic bug.`,
            r`class Cart:
    items = []                         # BUG: one list for every cart
    def add(self, x): self.items.append(x)

a, b = Cart(), Cart()
a.add("apple")
print(b.items)                         # b sees a's apple!

# OUTPUT:
# ['apple']`],
        [`<b>Limitations:</b> assigning through an instance does not change the class variable; it creates a new instance attribute that shadows it.`,
            r`class Counter:
    n = 0

a = Counter()
a.n = 5                                # creates instance attribute, class untouched
print(a.n, Counter.n)
print("n" in vars(a))

# OUTPUT:
# 5 0
# True`],
        `
   Dog class  ─────────────  species = "Canis"   (shared)
      ▲            ▲
      │            │
   ┌──┴────┐   ┌───┴───┐
   │ a     │   │ b     │
   │ name  │   │ name  │   (separate copies)
   └───────┘   └───────┘
   lookup: instance first, then class
`,
        `Treat class variables as constants or explicitly managed shared state. Never use mutable class-level defaults; create them in <code>__init__</code> or use <code>dataclasses.field(default_factory=...)</code>. Shared mutable state also makes concurrent code and tests harder.`
    )
};
