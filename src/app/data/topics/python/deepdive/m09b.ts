// Module 9 (Object-Oriented Programming), part B: methods, MRO, abstraction tools.
import { dd, r, type DeepDive } from './deepDive';

export const m09b: Record<string, DeepDive> = {
    'Instance, Class & Static Methods': dd(
        [`Python has three method kinds. An <b>instance method</b> gets <code>self</code> (the object), a <b>class method</b> (<code>@classmethod</code>) gets <code>cls</code> (the class), and a <b>static method</b> (<code>@staticmethod</code>) gets neither - it is a plain function namespaced inside the class.`,
            r`class Pizza:
    base = "dough"

    def __init__(self, toppings):
        self.toppings = toppings

    def describe(self):                  # instance method: needs the object
        return f"{self.base} + {self.toppings}"

    @classmethod
    def margherita(cls):                 # class method: gets the class
        return cls(["tomato", "mozzarella"])

    @staticmethod
    def is_valid(topping):               # static method: no self, no cls
        return topping != "pineapple"

p = Pizza.margherita()
print(p.describe())
print(Pizza.is_valid("pineapple"))

# OUTPUT:
# dough + ['tomato', 'mozzarella']
# False`],
        [`Different jobs need different access: per-object data, class-wide data/factories, or just a related helper. Choosing the right kind keeps intent obvious and makes subclassing work.`,
            r`class Temp:
    unit = "C"
    def __init__(self, deg): self.deg = deg

    @classmethod
    def from_f(cls, f):                  # alternative constructor
        return cls(round((f - 32) * 5 / 9, 1))

print(Temp.from_f(212).deg, Temp.unit)

# OUTPUT:
# 100.0 C`],
        [`Class methods as factories (<code>dict.fromkeys</code>, <code>datetime.fromtimestamp</code>), static methods for validators/utilities grouped with the class.`,
            r`from datetime import date

print(date.fromisoformat("2024-03-05"))   # classmethod factory in the stdlib
print(dict.fromkeys(["a", "b"], 0))       # another one

# OUTPUT:
# 2024-03-05
# {'a': 0, 'b': 0}`],
        [`<b>Advantages:</b> class methods respect inheritance: <code>cls</code> is the subclass that was called, so factories build the right type.`,
            r`class Base:
    @classmethod
    def create(cls): return cls()

class Child(Base): pass

print(type(Base.create()).__name__, type(Child.create()).__name__)

# OUTPUT:
# Base Child`],
        [`<b>Disadvantages:</b> confusing for beginners, and a static method is just a function: many are better placed at module level.`,
            r`class MathUtil:
    @staticmethod
    def double(x): return x * 2         # needs nothing from the class

def double(x): return x * 2             # simpler, same result

print(MathUtil.double(4), double(4))

# OUTPUT:
# 8 8`],
        [`<b>Limitations:</b> a class method cannot see instance data, and a static method cannot see anything of the class unless you name it explicitly.`,
            r`class A:
    def __init__(self): self.x = 1
    @classmethod
    def peek(cls):
        return self.x                   # NameError: no self here

try:
    A.peek()
except NameError as e:
    print("NameError:", e)

# OUTPUT:
# NameError: name 'self' is not defined`],
        `
   obj.method()      ──► method(obj, ...)       self = the instance
   Class.cmethod()   ──► cmethod(Class, ...)    cls  = the class
   Class.smethod()   ──► smethod(...)           nothing injected

           instance data │ class data │ no data
   instance    yes       │    yes     │
   class        -        │    yes     │
   static       -        │     -      │  utility
`,
        `Use classmethods for alternative constructors and for state shared by the class, instance methods for behaviour on data, and avoid staticmethods when a module-level function is clearer. Classmethod factories scale better than constructors with many optional flags.`
    ),

    '@property, Getters & Setters': dd(
        [`<code>@property</code> turns a method into an attribute-style accessor. Callers write <code>obj.age</code> while your code can run validation or computation behind it. <code>@x.setter</code> defines how assignment works.`,
            r`class Person:
    def __init__(self, age):
        self._age = age

    @property
    def age(self):                       # getter: p.age
        return self._age

    @age.setter
    def age(self, value):                # setter: p.age = 5
        if value < 0:
            raise ValueError("age must be >= 0")
        self._age = value

p = Person(20)
p.age = 21
print(p.age)
try:
    p.age = -1
except ValueError as e:
    print("error:", e)

# OUTPUT:
# 21
# error: age must be >= 0`],
        [`You start with a plain public attribute. Later you need validation. A property lets you add it without changing a single caller, unlike Java where getters would have been needed from day one.`,
            r`class Circle:
    def __init__(self, r):
        self.r = r

    @property
    def area(self):                      # computed on access, no parentheses
        return round(3.14159 * self.r ** 2, 2)

c = Circle(2)
print(c.area)
c.r = 3                                  # area follows automatically
print(c.area)

# OUTPUT:
# 12.57
# 28.27`],
        [`ORMs and validators use properties for derived fields (full_name), read-only ids and lazy loading.`,
            r`class User:
    def __init__(self, first, last):
        self.first, self.last = first, last

    @property
    def full_name(self):                 # read-only: no setter defined
        return f"{self.first} {self.last}"

u = User("Ann", "Lee")
print(u.full_name)
try:
    u.full_name = "X"
except AttributeError:
    print("read-only attribute")

# OUTPUT:
# Ann Lee
# read-only attribute`],
        [`<b>Advantages:</b> a stable public API, validation, derived values, and cached computation via <code>functools.cached_property</code>.`,
            r`from functools import cached_property

class Report:
    @cached_property
    def data(self):
        print("computing once...")
        return [1, 2, 3]

r1 = Report()
print(r1.data)
print(r1.data)                           # cached: no recomputation

# OUTPUT:
# computing once...
# [1, 2, 3]
# [1, 2, 3]`],
        [`<b>Disadvantages:</b> a property looks like cheap attribute access but can hide slow or failing code; debugging surprises follow.`,
            r`import time

class Slow:
    @property
    def value(self):
        time.sleep(0.2)                  # looks innocent: obj.value
        return 42

s = Slow()
t = time.perf_counter()
s.value
print("took >0.1s:", time.perf_counter() - t > 0.1)

# OUTPUT:
# took >0.1s: True`],
        [`<b>Limitations:</b> properties are defined per class, not per instance, and are not visible in <code>vars(obj)</code>; they need the underscore backing field.`,
            r`class P:
    def __init__(self): self._x = 1
    @property
    def x(self): return self._x

p = P()
print(vars(p))                           # shows _x, not x
print(type(P.x).__name__)                # property lives on the class

# OUTPUT:
# {'_x': 1}
# property`],
        `
   p.age = 5                          print(p.age)
      │                                    │
      ▼                                    ▼
   ┌───────────────┐                ┌───────────────┐
   │ age.setter    │ validate       │ age getter    │
   └──────┬────────┘                └──────┬────────┘
          ▼                                ▼
       self._age  (stored)  ◄────────── self._age
`,
        `Start with plain attributes and introduce properties only when you need validation, computation or to deprecate an old name. Keep getters fast and side-effect free; if an operation is expensive or can fail in unexpected ways, make it an explicit method.`
    ),

    'Method Overriding': dd(
        [`<b>Overriding</b> means a subclass defines a method with the same name as one in its parent, replacing it for objects of the subclass.`,
            r`class Animal:
    def speak(self):
        return "..."

class Dog(Animal):
    def speak(self):                     # overrides Animal.speak
        return "Woof"

class Fish(Animal):
    pass                                 # inherits the default

print(Dog().speak(), Fish().speak())

# OUTPUT:
# Woof ...`],
        [`A parent provides a sensible default; children need their own behaviour. Overriding lets them specialise without changing the parent or the calling code.`,
            r`class Report:
    def render(self): return "plain report"

class PdfReport(Report):
    def render(self): return "pdf report"

for rep in (Report(), PdfReport()):
    print(rep.render())

# OUTPUT:
# plain report
# pdf report`],
        [`Frameworks are built on it: you subclass and override hooks like <code>setUp</code> in unittest, <code>get</code> in a Django view, or <code>run</code> in <code>threading.Thread</code>.`,
            r`import threading

class Worker(threading.Thread):
    def run(self):                       # override the hook Thread calls
        print("working in", self.name)

w = Worker(name="T1")
w.start(); w.join()

# OUTPUT:
# working in T1`],
        [`<b>Advantages:</b> customise behaviour while reusing the rest; combined with <code>super()</code> you extend rather than replace.`,
            r`class Base:
    def greet(self): return "Hello"
class Polite(Base):
    def greet(self): return super().greet() + ", sir"   # extend parent result

print(Polite().greet())

# OUTPUT:
# Hello, sir`],
        [`<b>Disadvantages:</b> Python does not check signatures, so an override with different parameters compiles fine and fails at the call.`,
            r`class Base:
    def area(self, scale): return 1 * scale
class Child(Base):
    def area(self): return 2             # signature changed silently

def use(obj): return obj.area(10)
print(use(Base()))
try:
    use(Child())
except TypeError:
    print("TypeError: override broke the contract")

# OUTPUT:
# 10
# TypeError: override broke the contract`],
        [`<b>Limitations:</b> there is no <code>@Override</code>/<code>final</code> check in the language; typos create new methods instead of overriding. Type checkers offer <code>typing.override</code> (3.12+).`,
            r`class Base:
    def save(self): return "base save"
class Child(Base):
    def sav(self): return "child save"   # typo: not an override!

print(Child().save())                    # still the parent's

# OUTPUT:
# base save`],
        `
   obj = Dog()
   obj.speak()
       │
       ▼
   Dog     defines speak()?  yes ──► run Dog.speak
       │ no
       ▼
   Animal  defines speak()?  yes ──► run Animal.speak
`,
        `Obey the Liskov substitution principle: an override must accept what the parent accepts and honour its promises. Prefer the template-method pattern (parent calls small overridable hooks) over overriding big methods, and use typing.override plus a type checker to catch typos.`
    ),

    'Multiple Inheritance & MRO': dd(
        [`Python lets a class inherit from several parents. The <b>MRO</b> (Method Resolution Order, computed by the C3 algorithm) is the single linear order in which Python searches the classes for an attribute.`,
            r`class A:
    def who(self): return "A"
class B(A):
    def who(self): return "B"
class C(A):
    def who(self): return "C"
class D(B, C):                           # diamond: D -> B -> C -> A
    pass

print(D().who())
print([k.__name__ for k in D.__mro__])

# OUTPUT:
# B
# ['D', 'B', 'C', 'A', 'object']`],
        [`Sometimes behaviour is orthogonal (logging, JSON serialisation, timestamps). Mixins combine such capabilities without a deep tree.`,
            r`import json

class JsonMixin:
    def to_json(self): return json.dumps(vars(self))

class ReprMixin:
    def __repr__(self): return f"{type(self).__name__}({vars(self)})"

class User(JsonMixin, ReprMixin):
    def __init__(self, name): self.name = name

u = User("Ann")
print(u.to_json())
print(u)

# OUTPUT:
# {"name": "Ann"}
# User({'name': 'Ann'})`],
        [`Django class-based views (<code>LoginRequiredMixin, ListView</code>), socketserver (<code>ThreadingMixIn</code>) and DRF all use mixins.`,
            r`import socketserver
print([c.__name__ for c in socketserver.ThreadingTCPServer.__mro__][:3])

# OUTPUT:
# ['ThreadingTCPServer', 'ThreadingMixIn', 'TCPServer']`],
        [`<b>Advantages:</b> combine independent capabilities, avoid code duplication, and the C3 order is deterministic (and calling each parent once with <code>super()</code> is possible).`,
            r`class Walk:
    def move(self): return "walk"
class Swim:
    def swim(self): return "swim"
class Duck(Walk, Swim): pass

d = Duck()
print(d.move(), d.swim())

# OUTPUT:
# walk swim`],
        [`<b>Disadvantages:</b> hard to reason about; the winning method depends on parent order, so changing the order changes behaviour.`,
            r`class A:
    def hi(self): return "A"
class B:
    def hi(self): return "B"
class X(A, B): pass
class Y(B, A): pass

print(X().hi(), Y().hi())               # parent order matters

# OUTPUT:
# A B`],
        [`<b>Limitations:</b> some orders are impossible; C3 refuses to build an inconsistent hierarchy.`,
            r`class A: pass
class B(A): pass
try:
    class C(A, B):                       # A before its own child B: impossible
        pass
except TypeError as e:
    print("TypeError:", str(e)[:40])

# OUTPUT:
# TypeError: Cannot create a consistent method resolu`],
        `
         A
        / \
       B   C        D.__mro__ = [D, B, C, A, object]
        \ /          search left to right, each class once
         D(B, C)
`,
        `Keep multiple inheritance to small, stateless mixins that cooperate through <code>super()</code>. If you need diamonds with state, prefer composition. Always print <code>Class.__mro__</code> when debugging surprising method selection.`
    ),

    'super()': dd(
        [`<code>super()</code> returns a proxy that finds the <b>next class in the MRO</b> after the current one, so you can call the parent's version of a method (most often <code>__init__</code>).`,
            r`class Person:
    def __init__(self, name):
        self.name = name

class Student(Person):
    def __init__(self, name, school):
        super().__init__(name)           # let Person set up its part
        self.school = school

s = Student("Ann", "MIT")
print(s.name, s.school)

# OUTPUT:
# Ann MIT`],
        [`If a child overrides <code>__init__</code> and forgets the parent's, the parent's attributes never get created.`,
            r`class Base:
    def __init__(self): self.ready = True
class Broken(Base):
    def __init__(self): pass             # forgot super().__init__()

b = Broken()
print(hasattr(b, "ready"))

# OUTPUT:
# False`],
        [`Extending a built-in or framework class while keeping its behaviour: log then delegate.`,
            r`class LoggedDict(dict):
    def __setitem__(self, k, v):
        print(f"set {k}={v}")
        super().__setitem__(k, v)        # delegate to dict's real implementation

d = LoggedDict()
d["a"] = 1
print(d)

# OUTPUT:
# set a=1
# {'a': 1}`],
        [`<b>Advantages:</b> no hard-coded parent name (rename-safe) and it makes cooperative multiple inheritance work: every class in the MRO runs once.`,
            r`class A:
    def run(self): print("A")
class B(A):
    def run(self): print("B"); super().run()
class C(A):
    def run(self): print("C"); super().run()
class D(B, C):
    def run(self): print("D"); super().run()

D().run()

# OUTPUT:
# D
# B
# C
# A`],
        [`<b>Disadvantages:</b> in multiple inheritance <code>super()</code> may not call the class you expect (it follows the MRO, not "the parent"), and all classes must accept compatible arguments.`,
            r`class A:
    def __init__(self, **kw): print("A", kw)
class B(A):
    def __init__(self, x, **kw):
        super().__init__(**kw)           # pass the remaining args along
class C(A):
    def __init__(self, y, **kw):
        super().__init__(**kw)
class D(B, C): pass

D(x=1, y=2)                              # needs **kw plumbing everywhere

# OUTPUT:
# A {}`],
        [`<b>Limitations:</b> zero-argument <code>super()</code> only works inside a method defined in a class body (it relies on <code>__class__</code> and the first argument).`,
            r`def helper():
    return super().__init__()            # not inside a class

try:
    helper()
except RuntimeError as e:
    print("RuntimeError:", e)

# OUTPUT:
# RuntimeError: super(): no arguments`],
        `
   D.__mro__ = D -> B -> C -> A -> object

   D.run() ──super()──► B.run() ──super()──► C.run() ──super()──► A.run()
   "next in line", not "my parent"
`,
        `Always call <code>super().__init__(...)</code> in cooperative hierarchies and accept <code>**kwargs</code> in mixins so the chain can pass unknown arguments along. If the plumbing gets ugly, that is a signal to use composition instead of deep inheritance.`
    ),

    'Abstract Classes & ABC': dd(
        [`An <b>abstract base class</b> (from the <code>abc</code> module) declares methods that subclasses <i>must</i> implement. Python refuses to instantiate a class that still has unimplemented <code>@abstractmethod</code>s.`,
            r`from abc import ABC, abstractmethod

class Shape(ABC):
    @abstractmethod
    def area(self): ...                  # contract: subclasses must provide

class Square(Shape):
    def __init__(self, s): self.s = s
    def area(self): return self.s ** 2

print(Square(4).area())
try:
    Shape()                              # cannot instantiate abstract class
except TypeError as e:
    print("TypeError:", e)

# OUTPUT:
# 16
# TypeError: Can't instantiate abstract class Shape without an implementation for abstract method 'area'`],
        [`A plain base class with <code>NotImplementedError</code> fails late (when the method is called). ABC fails early (when the object is created), so the bug is found at startup.`,
            r`from abc import ABC, abstractmethod

class Plugin(ABC):
    @abstractmethod
    def run(self): ...

class Incomplete(Plugin):
    pass                                 # forgot run()

try:
    Incomplete()
except TypeError:
    print("caught at creation time")

# OUTPUT:
# caught at creation time`],
        [`Frameworks define ABCs for plugin systems; the standard library uses them in <code>collections.abc</code> (<code>Mapping</code>, <code>Sequence</code>, <code>Iterable</code>).`,
            r`from collections.abc import Sequence, Iterable

print(isinstance([1, 2], Sequence), isinstance("ab", Sequence))
print(isinstance(5, Iterable))

# OUTPUT:
# True True
# False`],
        [`<b>Advantages:</b> an enforced contract, mixin methods that build on abstract ones, and <code>isinstance</code> checks against the interface.`,
            r`from abc import ABC, abstractmethod

class Exporter(ABC):
    @abstractmethod
    def body(self): ...
    def export(self):                    # concrete method built on the abstract one
        return "<<" + self.body() + ">>"

class Csv(Exporter):
    def body(self): return "a,b"

print(Csv().export())

# OUTPUT:
# <<a,b>>`],
        [`<b>Disadvantages:</b> more ceremony and stronger inheritance coupling; every implementer must subclass explicitly.`,
            r`from abc import ABC, abstractmethod

class Speaker(ABC):
    @abstractmethod
    def speak(self): ...

class Robot:                             # has speak() but is NOT a Speaker
    def speak(self): return "beep"

print(isinstance(Robot(), Speaker))      # False, even though it quacks

# OUTPUT:
# False`],
        [`<b>Limitations:</b> enforcement happens only at instantiation, never on the class itself, and only for the abstract names (not their signatures).`,
            r`from abc import ABC, abstractmethod

class Base(ABC):
    @abstractmethod
    def f(self, x): ...

class Child(Base):
    def f(self): return "wrong signature accepted"   # no signature check

print(Child().f())

# OUTPUT:
# wrong signature accepted`],
        `
   ┌──────────────────────────┐
   │ Shape (ABC)              │
   │  @abstractmethod area()  │   cannot be instantiated
   └────────────┬─────────────┘
         ┌──────┴───────┐
   ┌─────┴─────┐  ┌─────┴─────┐
   │ Square    │  │ Circle    │   must implement area()
   │ area() ok │  │ area() ok │
   └───────────┘  └───────────┘
`,
        `Use an ABC when you control the implementers and want shared concrete code plus early failure. When you only need a structural contract for third-party or duck-typed objects, prefer a Protocol; ABCs create a nominal hierarchy that is harder to evolve.`
    ),

    'Interfaces with Protocols': dd(
        [`A <b>Protocol</b> (<code>typing.Protocol</code>, Python 3.8+) describes an interface by its shape: any class with the right methods satisfies it, with no inheritance. This is <b>structural typing</b>, "static duck typing".`,
            r`from typing import Protocol

class Speaker(Protocol):
    def speak(self) -> str: ...

class Dog:                               # does NOT inherit from Speaker
    def speak(self) -> str: return "Woof"

def talk(s: Speaker) -> str:             # type checkers accept any object with speak()
    return s.speak()

print(talk(Dog()))

# OUTPUT:
# Woof`],
        [`ABCs force classes to inherit; you cannot make a third-party class implement your ABC. Protocols let you describe what you need and accept existing types as they are.`,
            r`from typing import Protocol

class SupportsClose(Protocol):
    def close(self) -> None: ...

def shutdown(res: SupportsClose) -> str:
    res.close()
    return "closed"

import io
print(shutdown(io.StringIO()))           # stdlib class, never heard of our Protocol

# OUTPUT:
# closed`],
        [`Used in typed libraries to declare "anything file-like", "anything with a <code>.read()</code>", repository/storage interfaces for dependency injection and easy mocking.`,
            r`from typing import Protocol

class Repo(Protocol):
    def get(self, id: int) -> str: ...

class MemoryRepo:
    def get(self, id: int) -> str: return f"item-{id}"

def service(repo: Repo, id: int) -> str:
    return repo.get(id).upper()

print(service(MemoryRepo(), 7))

# OUTPUT:
# ITEM-7`],
        [`<b>Advantages:</b> decoupled design, no shared base class, perfect for tests and plugins. With <code>@runtime_checkable</code> you can also use <code>isinstance</code>.`,
            r`from typing import Protocol, runtime_checkable

@runtime_checkable
class Closable(Protocol):
    def close(self): ...

import io
print(isinstance(io.StringIO(), Closable), isinstance(5, Closable))

# OUTPUT:
# True False`],
        [`<b>Disadvantages:</b> checked only by static tools (mypy, pyright) - at runtime nothing is enforced and a wrong object fails when the method is called.`,
            r`from typing import Protocol

class Speaker(Protocol):
    def speak(self) -> str: ...

class Rock: pass

def talk(s: Speaker): return s.speak()

try:
    talk(Rock())                         # runs; mypy would have flagged this
except AttributeError as e:
    print("runtime failure:", e)

# OUTPUT:
# runtime failure: 'Rock' object has no attribute 'speak'`],
        [`<b>Limitations:</b> <code>runtime_checkable</code> only checks that method names exist, not signatures or return types; and you cannot instantiate a Protocol class.`,
            r`from typing import Protocol, runtime_checkable

@runtime_checkable
class P(Protocol):
    def f(self, a, b): ...

class Wrong:
    def f(self): return 1                # different signature, still passes

print(isinstance(Wrong(), P))
try:
    P()
except TypeError as e:
    print("TypeError:", e)

# OUTPUT:
# True
# TypeError: Protocols cannot be instantiated`],
        `
   Protocol Speaker { speak() }
        ▲  matched by shape only (no inheritance line)
   ┌────┴────┐   ┌─────────┐   ┌──────────┐
   │ Dog     │   │ Robot   │   │ 3rd-party│
   │ speak() │   │ speak() │   │ speak()  │
   └─────────┘   └─────────┘   └──────────┘
   static checker verifies; runtime is plain duck typing
`,
        `Prefer Protocols at module boundaries (accept what you need, not a concrete class) and ABCs when you ship shared base behaviour. Run mypy or pyright in CI, since Protocols give no runtime guarantee; keep each Protocol small (interface segregation).`
    )
};
