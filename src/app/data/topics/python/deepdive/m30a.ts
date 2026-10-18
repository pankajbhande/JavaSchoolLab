// Module 30 (Clean Code): SOLID, DRY/KISS/YAGNI, separation of concerns, composition, smells, refactoring.
import { dd, r, type DeepDive } from './deepDive';

export const m30a: Record<string, DeepDive> = {
    'SOLID Principles': dd(
        [`<b>SOLID</b> is five object-oriented design guidelines: <b>S</b>ingle responsibility, <b>O</b>pen/closed, <b>L</b>iskov substitution, <b>I</b>nterface segregation, <b>D</b>ependency inversion. They keep classes small, replaceable and easy to change. Start with SRP: a class should have one reason to change.`,
            r`class Report:                              # responsibility 1: hold the data
    def __init__(self, title, rows):
        self.title, self.rows = title, rows

class ReportPrinter:                        # responsibility 2: presentation
    def render(self, report):
        return f"{report.title}: {len(report.rows)} rows"

report = Report("Sales", [1, 2, 3])
print(ReportPrinter().render(report))       # changing the format never touches Report

# OUTPUT:
# Sales: 3 rows`],
        [`Software changes constantly. Classes that do many jobs break in many ways; code that must be edited for every new feature causes regressions. SOLID reduces the blast radius of change. Open/closed example: add a shape without editing existing code.`,
            r`class Square:
    def __init__(self, s): self.s = s
    def area(self): return self.s ** 2

class Rect:
    def __init__(self, w, h): self.w, self.h = w, h
    def area(self): return self.w * self.h

def total_area(shapes):                     # closed for modification
    return sum(s.area() for s in shapes)

class Triangle:                             # open for extension: new class only
    def __init__(self, b, h): self.b, self.h = b, h
    def area(self): return self.b * self.h / 2

print(total_area([Square(2), Rect(2, 3)]))
print(total_area([Square(2), Rect(2, 3), Triangle(4, 3)]))

# OUTPUT:
# 10
# 16.0`],
        [`Real services apply Dependency Inversion: business code depends on an abstraction (a payment port), and concrete gateways plug in from outside, so you can change provider or test with a fake.`,
            r`from abc import ABC, abstractmethod

class PaymentGateway(ABC):                  # abstraction owned by the business layer
    @abstractmethod
    def pay(self, amount): ...

class CardGateway(PaymentGateway):          # detail depends on the abstraction
    def pay(self, amount): return f"paid {amount} via card"

class OrderService:
    def __init__(self, gateway: PaymentGateway):
        self.gateway = gateway
    def checkout(self, amount):
        return self.gateway.pay(amount)

print(OrderService(CardGateway()).checkout(50))

# OUTPUT:
# paid 50 via card`],
        [`<b>Advantages:</b> easier testing, safer change, replaceable parts, readable responsibilities. Interface Segregation keeps contracts small so implementers are not forced to provide methods they cannot support.`,
            r`from abc import ABC, abstractmethod

class Printer(ABC):                         # small, focused interfaces
    @abstractmethod
    def print_doc(self, d): ...
class Scanner(ABC):
    @abstractmethod
    def scan(self): ...

class SimplePrinter(Printer):               # is not forced to implement scan()
    def print_doc(self, d): return f"printing {d}"

class AllInOne(Printer, Scanner):
    def print_doc(self, d): return f"printing {d}"
    def scan(self): return "scanned"

print(SimplePrinter().print_doc("a"))
m = AllInOne()
print(m.print_doc("b"), "|", m.scan())

# OUTPUT:
# printing a
# printing b | scanned`],
        [`<b>Disadvantages:</b> followed dogmatically, SOLID creates many tiny classes and abstractions that nobody needs; the cost is indirection and slower reading.`,
            r`from abc import ABC, abstractmethod

class GreetingFormatter(ABC):               # an interface for one f-string...
    @abstractmethod
    def fmt(self, name): ...
class DefaultGreetingFormatter(GreetingFormatter):
    def fmt(self, name): return f"Hello {name}"
class GreetingService:
    def __init__(self, f: GreetingFormatter): self.f = f
    def greet(self, name): return self.f.fmt(name)

print(GreetingService(DefaultGreetingFormatter()).greet("Ana"))   # 3 classes
print(f"Hello {'Ana'}")                                           # often enough

# OUTPUT:
# Hello Ana
# Hello Ana`],
        [`<b>Limitations:</b> they are guidelines, not rules Python can enforce. The classic Liskov violation (Square as a Rectangle) compiles and runs fine; only careful design or tests reveal that a subclass breaks callers' expectations.`,
            r`class Rectangle:
    def __init__(self, w, h): self.width, self.height = w, h
    def area(self): return self.width * self.height

class Square(Rectangle):                    # "is-a" in maths, not in behaviour
    def __init__(self, s): super().__init__(s, s)
    def __setattr__(self, name, value):     # keeps both sides equal
        object.__setattr__(self, "width", value)
        object.__setattr__(self, "height", value)

def stretch(rect):                          # caller assumes height stays unchanged
    rect.width = 10
    return rect.area()

print(stretch(Rectangle(5, 2)))
print(stretch(Square(2)))                   # substitution broke the contract

# OUTPUT:
# 20
# 100`],
        `
   S  one class  -> one reason to change
   O  add code   -> not edit code          shapes: [Square][Rect][+Triangle]
   L  Child  must behave like Parent       stretch(Rectangle) == stretch(Square)?
   I  small interfaces                     Printer | Scanner  (not one fat one)
   D  Service ---> Abstraction <--- Detail

        OrderService --> PaymentGateway (ABC) <-- CardGateway
`,
        `Apply SOLID where change actually happens: DIP at system boundaries (database, network, clock), OCP where variants multiply, SRP when a class changes for two different reasons. In Python, prefer Protocols and plain functions over deep class hierarchies, and do not abstract until there is a second implementation or a real testing need.`
    ),

    'DRY, KISS & YAGNI': dd(
        [`<b>DRY</b> (Don't Repeat Yourself): each piece of knowledge lives in one place. <b>KISS</b> (Keep It Simple): choose the simplest design that works. <b>YAGNI</b> (You Aren't Gonna Need It): do not build features until they are needed.`,
            r`TAX_PERCENT = 18                           # the single source of truth

def with_tax(amount):
    return amount + amount * TAX_PERCENT // 100

print(with_tax(100), with_tax(250))         # change the rate once, everywhere updates

# OUTPUT:
# 118 295`],
        [`Duplicated logic means a bug fixed in one copy survives in the others. Complex code hides bugs; speculative code costs time to write, read and maintain, and is usually wrong when the real need arrives.`,
            r`def is_valid_email(s):                     # one validation, reused by sign-up, login, import
    return "@" in s and "." in s.split("@")[-1]

for e in ["a@b.com", "bad", "x@y"]:
    print(e, is_valid_email(e))

# OUTPUT:
# a@b.com True
# bad False
# x@y False`],
        [`KISS in daily work: write the obvious, readable version first. Optimise only after measuring.`,
            r`def is_leap(year):                         # one clear expression, no clever tricks
    return year % 4 == 0 and (year % 100 != 0 or year % 400 == 0)

print([y for y in (1900, 2000, 2023, 2024) if is_leap(y)])

# OUTPUT:
# [2000, 2024]`],
        [`<b>Advantages:</b> less code to read and test, fewer places for bugs, faster delivery. YAGNI keeps the design driven by real requirements.`,
            r`# YAGNI: requirement today = "sum the numbers".
# Do NOT add: plugin system, config file, abstract base class, caching, async variant.
def total(items):
    return sum(items)

print(total([1, 2, 3]))

# OUTPUT:
# 6`],
        [`<b>Disadvantages:</b> DRY applied too eagerly merges things that only look alike. The shared function grows flags and branches, and every change to one case risks the others.`,
            r`def fmt(value, kind):                      # three unrelated needs glued together
    if kind == "money":
        return f"Rs {value:.2f}"
    if kind == "name":
        return value.title()
    if kind == "id":
        return f"#{value:05d}"              # every new case edits this function

print(fmt(5, "money"))
print(fmt("ann lee", "name"))
print(fmt(42, "id"))

# OUTPUT:
# Rs 5.00
# Ann Lee
# #00042`],
        [`<b>Limitations:</b> DRY is about duplicated <i>knowledge</i>, not duplicated text. Two similar snippets with different reasons to change should stay separate ("duplication is cheaper than the wrong abstraction").`,
            r`def valid_username(s):                     # today the same rule as product codes...
    return 3 <= len(s) <= 10 and s.isalnum()

def valid_product_code(s):                  # ...but they evolve separately
    return len(s) == 6 and s[:2].isalpha() and s[2:].isdigit()

print(valid_username("ana99"), valid_username("a"))
print(valid_product_code("AB1234"), valid_product_code("ana99"))

# OUTPUT:
# True False
# True False`],
        `
   DRY     copy-paste x3  --->  one function / one constant
   KISS    clever one-liner --> clear 3-line version
   YAGNI   "maybe later"  --->  build it when the need is real

   Balance:   too little DRY  <----- sweet spot -----> wrong abstraction
`,
        `Apply the rule of three: tolerate duplication twice, extract on the third occurrence when the shared reason to change is clear. Prefer simple code that deletes easily over flexible code that anticipates. Use YAGNI on features, not on safety: tests, logging and clear boundaries are always needed.`
    ),

    'Separation of Concerns': dd(
        [`<b>Separation of Concerns</b> means each part of a program handles one distinct concern: parsing, business rules, storage, presentation. Parts talk through small interfaces so each can change independently.`,
            r`def parse(text):                          # concern 1: input format
    return [int(x) for x in text.split(",")]

def average(numbers):                       # concern 2: calculation
    return sum(numbers) / len(numbers)

def present(avg):                           # concern 3: output format
    return f"Average: {avg:.1f}"

print(present(average(parse("3,4,5"))))

# OUTPUT:
# Average: 4.0`],
        [`A function that reads input, calculates and prints is impossible to test or reuse. Separated functions return values, so tests, CLI, web and batch jobs can all use them.`,
            r`def average(numbers):                       # pure: no input(), no print()
    return sum(numbers) / len(numbers)

assert average([2, 4]) == 3                 # trivial to test
assert average([10]) == 10
print("tests pass")

# OUTPUT:
# tests pass`],
        [`Web applications split into handler (HTTP), service/rule (business) and data access. A change to the database does not touch the rules.`,
            r`DB = {1: {"name": "Abaji", "age": 17}}

def find_user(uid):                         # data concern
    return DB.get(uid)

def is_adult(user):                         # business rule
    return user["age"] >= 18

def handler(uid):                           # delivery concern
    user = find_user(uid)
    if not user:
        return "404"
    return "adult" if is_adult(user) else "minor"

print(handler(1))
print(handler(2))

# OUTPUT:
# minor
# 404`],
        [`<b>Advantages:</b> localised changes, reuse, independent testing, parallel team work, replaceable presentation or storage.`,
            r`import json

def render(data, fmt):                      # presentation is swappable
    if fmt == "json":
        return json.dumps(data)
    return ", ".join(f"{k}={v}" for k, v in data.items())

result = {"total": 3}                       # computed once by the business layer
print(render(result, "text"))
print(render(result, "json"))

# OUTPUT:
# total=3
# {"total": 3}`],
        [`<b>Disadvantages:</b> more files and call hops; slicing too finely makes a simple feature travel through many layers just to return a value.`,
            r`calls = []
def repository():  calls.append("repository"); return 42
def service():     calls.append("service"); return repository()
def controller():  calls.append("controller"); return service()

result = controller()
print(" -> ".join(calls), "=>", result)     # three hops, no logic added on the way

# OUTPUT:
# controller -> service -> repository => 42`],
        [`<b>Limitations:</b> some concerns (logging, security, transactions) cut across all layers and cannot be isolated in one place; they need decorators, middleware or aspect-style tools.`,
            r`def logged(fn):                            # cross-cutting concern as a decorator
    def wrapper(*args):
        print("LOG", fn.__name__)
        return fn(*args)
    return wrapper

@logged
def service():
    return repo()

@logged
def repo():
    return 1

print(service())

# OUTPUT:
# LOG service
# LOG repo
# 1`],
        `
   +-------------------+   Presentation : formats / HTTP
   |  handler()        |
   +---------+---------+
             v
   +-------------------+   Business rules : is_adult()
   |  rules / service  |
   +---------+---------+
             v
   +-------------------+   Data : find_user()
   |  repository / DB  |
   +-------------------+
     logging, auth, tx  ===> cut through all three (cross-cutting)
`,
        `Separate by reason to change and by rate of change: volatile UI and integrations on the outside, stable rules inside. Keep the separation as modules with explicit imports, enforce with import-linter, and handle cross-cutting concerns with middleware or decorators rather than copying them.`
    ),

    'Composition over Inheritance': dd(
        [`<b>Composition</b> builds objects by combining other objects ("has-a"); <b>inheritance</b> extends a class ("is-a"). The guideline: prefer assembling behaviour from small parts over deep class hierarchies.`,
            r`class Engine:
    def start(self): return "vroom"

class Car:
    def __init__(self, engine):             # Car HAS an Engine
        self.engine = engine
    def start(self):
        return f"Car says {self.engine.start()}"

print(Car(Engine()).start())

# OUTPUT:
# Car says vroom`],
        [`Inheritance couples child to parent and explodes combinatorially (FlyingDuck, SwimmingDuck, FlyingSwimmingDuck...). Composition lets you pick abilities freely.`,
            r`class Fly:
    def move(self): return "flies"
class Swim:
    def move(self): return "swims"

class Duck:
    def __init__(self, *abilities):         # any combination, no new subclass
        self.abilities = abilities
    def moves(self):
        return [a.move() for a in self.abilities]

print(Duck(Fly(), Swim()).moves())
print(Duck(Swim()).moves())

# OUTPUT:
# ['flies', 'swims']
# ['swims']`],
        [`Services receive collaborators (logger, repository, clock) and use them. Behaviour comes from the parts, not from a base class such as <code>BaseServiceWithLogging</code>.`,
            r`class Logger:
    def log(self, msg): print("LOG:", msg)

class OrderService:
    def __init__(self, logger):             # composed, not inherited
        self.logger = logger
    def place(self, item):
        self.logger.log(f"placed {item}")
        return "ok"

print(OrderService(Logger()).place("pen"))

# OUTPUT:
# LOG: placed pen
# ok`],
        [`<b>Advantages:</b> parts can be swapped at runtime, easier to test with fakes, no fragile base class, narrower public API.`,
            r`class PetrolEngine:
    def start(self): return "vroom"
class ElectricEngine:
    def start(self): return "whirr"

class Car:
    def __init__(self, engine): self.engine = engine
    def start(self): return self.engine.start()

car = Car(PetrolEngine())
print(car.start())
car.engine = ElectricEngine()               # behaviour changed at runtime
print(car.start())

# OUTPUT:
# vroom
# whirr`],
        [`<b>Disadvantages:</b> you write forwarding (delegation) methods by hand, and there are more small objects to wire together.`,
            r`class Stack:                               # composition: wraps a list, exposes only 3 operations
    def __init__(self): self._items = []
    def push(self, x): self._items.append(x)       # forwarding boilerplate
    def pop(self): return self._items.pop()
    def __len__(self): return len(self._items)

s = Stack()
s.push(1)
s.push(2)
print(s.pop(), len(s))                      # a list subclass would also leak insert(), sort()...

# OUTPUT:
# 2 1`],
        [`<b>Limitations:</b> inheritance is still right for a true is-a relationship and for framework extension points. Generic <code>__getattr__</code> delegation does not cover special methods such as <code>len()</code> or <code>+</code>, which Python looks up on the type.`,
            r`class Wrap:
    def __init__(self, obj): self._obj = obj
    def __getattr__(self, name):            # forwards normal attributes only
        return getattr(self._obj, name)

w = Wrap([1, 2, 3])
print(w.count(1))                           # works: normal method
try:
    len(w)                                  # dunder lookup skips __getattr__
except TypeError as e:
    print("TypeError:", e)

# OUTPUT:
# 1
# TypeError: object of type 'Wrap' has no len()`],
        `
   Inheritance (is-a)              Composition (has-a)
        Animal                       +-------+
          |                          |  Duck |---> Fly()
       FlyingDuck                    |       |---> Swim()
          |                          +-------+
     FlyingSwimmingDuck              new behaviour = new part, not new subclass
`,
        `Default to composition and small Protocols; inherit only for genuine is-a with stable base classes you control (or framework hooks), and keep hierarchies two levels deep at most. Use mixins sparingly because they hide dependencies on attributes of the final class.`
    ),

    'Code Smells': dd(
        [`A <b>code smell</b> is a surface symptom in code that often points to a deeper design problem (not a bug). Examples: magic numbers, long functions, long parameter lists, duplicated code, deep nesting, god classes.`,
            r`def final_price_smelly(p):
    return p * 1.18                         # smell: what is 1.18?

TAX_RATE = 0.18                             # named constant explains itself
def final_price(p):
    return p * (1 + TAX_RATE)

print(round(final_price_smelly(100), 2), round(final_price(100), 2))

# OUTPUT:
# 118.0 118.0`],
        [`Smells make code harder to understand and change; spotting them early tells you where refactoring pays. A long parameter list, for example, usually hides a missing concept.`,
            r`from dataclasses import dataclass

@dataclass
class UserData:                             # the missing concept: a parameter object
    name: str
    email: str
    city: str = "Pune"

def create_user(data: UserData):            # instead of create_user(name, email, city, ...)
    return data

print(create_user(UserData("Ann", "a@x.com")))

# OUTPUT:
# UserData(name='Ann', email='a@x.com', city='Pune')`],
        [`Reviewers constantly look for deep nesting ("arrow code"). Guard clauses flatten it and make the happy path obvious.`,
            r`def can_ship_nested(order):                # smell: arrow code
    if order["paid"]:
        if order["items"] > 0:
            if order["address"]:
                return True
    return False

def can_ship(order):                        # guard clauses: fail fast
    if not order["paid"]:    return False
    if order["items"] <= 0:  return False
    if not order["address"]: return False
    return True

good = {"paid": True, "items": 2, "address": "X"}
empty = {"paid": True, "items": 0, "address": "X"}
print(can_ship_nested(good), can_ship(good))
print(can_ship_nested(empty), can_ship(empty))

# OUTPUT:
# True True
# False False`],
        [`<b>Advantages of knowing smells:</b> shared language in reviews and tools that detect them automatically (Ruff, pylint, SonarQube) so problems are found before they hurt.`,
            r`import ast

source = "def f(a, b, c, d, e, g): pass"      # a function with too many parameters
tree = ast.parse(source)
for node in ast.walk(tree):
    if isinstance(node, ast.FunctionDef) and len(node.args.args) > 4:
        print(f"smell: {node.name} has {len(node.args.args)} params")

# OUTPUT:
# smell: f has 6 params`],
        [`<b>Disadvantages:</b> smells are heuristics. A rule can flag perfectly good code (false positive), and chasing every warning wastes effort.`,
            r`import ast

source = "def mix(r, g, b, a, gamma): return (r, g, b, a, gamma)"
for node in ast.walk(ast.parse(source)):
    if isinstance(node, ast.FunctionDef) and len(node.args.args) > 4:
        print(f"flagged: {node.name} ({len(node.args.args)} params) - but each one is natural here")

# OUTPUT:
# flagged: mix (5 params) - but each one is natural here`],
        [`<b>Limitations:</b> a smell says <i>where</i> to look, not <i>what</i> to do. Primitive obsession (money as <code>float</code>) is a smell whose fix needs a domain decision, here a value type.`,
            r`from decimal import Decimal

print(0.1 + 0.2)                            # float money: smell and real bug
print(Decimal("0.1") + Decimal("0.2"))      # a value type fixes the root cause

# OUTPUT:
# 0.30000000000000004
# 0.3`],
        `
   Symptom (smell)              Likely cause               Typical refactoring
   magic number 1.18      -->   missing name        -->    named constant
   7 parameters           -->   missing concept     -->    parameter object / class
   if inside if inside if -->   missing early exit  -->    guard clauses
   copy-pasted blocks     -->   missing function    -->    extract function
`,
        `Treat smells as prompts for judgement, not as errors. Automate the objective ones (complexity, length, unused code) in CI with a baseline so new code stays clean, and fix smells when you touch the code anyway rather than in big risky clean-up projects.`
    ),

    'Refactoring': dd(
        [`<b>Refactoring</b> is improving the internal structure of code without changing its observable behaviour. Typical steps are renaming, extracting functions and removing duplication, done in small, safe moves.`,
            r`def f(l):                                  # before: unclear names, manual loop
    t = 0
    for x in l:
        if x > 0:
            t += x
    return t

def sum_positive(numbers):                  # after: same behaviour, clearer intent
    return sum(n for n in numbers if n > 0)

data = [3, -1, 4, -5]
print(f(data), sum_positive(data))

# OUTPUT:
# 7 7`],
        [`Code rots as features are added. Without regular refactoring, every change gets slower and riskier. Tests make it safe: if outputs stay the same, behaviour is preserved.`,
            r`def old(n):  return n * 2 if n % 2 == 0 else n * 2    # original (redundant branch)
def new(n):  return n * 2                                # refactored

for n in range(-3, 4):                      # characterization test: old == new on many inputs
    assert old(n) == new(n)
print("behaviour preserved for", len(range(-3, 4)), "inputs")

# OUTPUT:
# behaviour preserved for 7 inputs`],
        [`A frequent refactoring: replace a growing if/elif chain by a lookup table or polymorphism, so a new case is data, not another branch.`,
            r`def area_old(shape, a, b):
    if shape == "rect":
        return a * b
    elif shape == "tri":
        return a * b / 2

AREA = {                                    # refactored: add a case = add a row
    "rect": lambda a, b: a * b,
    "tri":  lambda a, b: a * b / 2,
}
def area(shape, a, b):
    return AREA[shape](a, b)

print(area_old("rect", 3, 4), area("rect", 3, 4))
print(area_old("tri", 3, 4), area("tri", 3, 4))

# OUTPUT:
# 12 12
# 6.0 6.0`],
        [`<b>Advantages:</b> readable, flexible code, fewer bugs, faster future change. "Extract variable" gives a complex condition a name.`,
            r`def eligible_old(age, income):
    return age >= 18 and age < 65 and income > 25000 and income < 100000

def eligible(age, income):                  # refactored: named conditions
    working_age = 18 <= age < 65
    target_income = 25000 < income < 100000
    return working_age and target_income

print(eligible_old(30, 50000), eligible(30, 50000))
print(eligible_old(70, 50000), eligible(70, 50000))

# OUTPUT:
# True True
# False False`],
        [`<b>Disadvantages:</b> time without visible features, and risk of accidentally changing behaviour. Even a "harmless" simplification can differ on edge cases.`,
            r`def label_old(name):
    if not name:                            # treats "" and None the same
        name = "anon"
    return name

def label_new(name):
    if name is None:                        # "cleaner" but behaviour changed for ""
        name = "anon"
    return name

print(repr(label_old("")), repr(label_new("")))

# OUTPUT:
# 'anon' ''`],
        [`<b>Limitations:</b> without tests you cannot prove behaviour is unchanged, and public APIs used by other teams cannot simply be renamed. Keep a deprecated alias for a transition period.`,
            r`import warnings

def new_name(items):
    return sum(items)

def old_name(*a, **k):                      # public API kept alive during migration
    warnings.warn("old_name is deprecated, use new_name", DeprecationWarning, stacklevel=2)
    return new_name(*a, **k)

with warnings.catch_warnings(record=True) as caught:
    warnings.simplefilter("always")
    print(old_name([1, 2, 3]))
    print(len(caught), caught[0].category.__name__)

# OUTPUT:
# 6
# 1 DeprecationWarning`],
        `
   green tests --> small change --> run tests --> green? --> commit
        ^                                             |
        +------------- repeat <-----------------------+
   (never change behaviour and add features in the same step)
`,
        `Refactor continuously in small commits protected by tests (the boy-scout rule), and separate refactoring commits from feature commits so reviews stay readable. For large legacy areas use the strangler approach: wrap, characterise with tests, then replace piece by piece.`
    ),
};
