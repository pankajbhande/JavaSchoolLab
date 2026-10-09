// Module 40 (Advanced Python), part A: classes as objects, attribute machinery and runtime reshaping.
import { dd, r, type DeepDive } from './deepDive';

export const m40a: Record<string, DeepDive> = {
    'Metaclasses': dd(
        [`In Python a class is itself an object, and the thing that builds it is its <b>metaclass</b>. The default metaclass is <code>type</code>. Writing your own subclass of <code>type</code> lets you hook into <i>class creation</i> (not instance creation).`,
            r`# type(obj) is the class of obj; type(Class) is the metaclass of Class
class Meta(type):                              # a metaclass subclasses 'type'
    def __new__(mcls, name, bases, ns):        # runs when the 'class' statement executes
        print("building class", name)
        return super().__new__(mcls, name, bases, ns)

class A(metaclass=Meta):                       # opt in with metaclass=...
    pass

print(type(A), type(A) is Meta)
print(type(Meta))                              # metaclasses are classes whose class is 'type'

# OUTPUT:
# building class A
# <class '__main__.Meta'> True
# <class 'type'>`],
        [`Sometimes a rule must hold for <i>every</i> subclass of a framework base class (must define a method, must be registered, must have a certain attribute). Checking at class-definition time fails early, at import, instead of late at run time.`,
            r`class Interface(type):
    def __init__(cls, name, bases, ns):
        super().__init__(name, bases, ns)
        if bases and "run" not in ns:          # 'bases' is empty only for the root class
            raise TypeError(f"{name} must define run()")

class Base(metaclass=Interface):
    pass

class Good(Base):
    def run(self):
        return "ok"

print(Good().run())
try:
    class Bad(Base):                           # forgets run() -> fails when defined
        pass
except TypeError as e:
    print("TypeError:", e)

# OUTPUT:
# ok
# TypeError: Bad must define run()`],
        [`ORMs (Django models, SQLAlchemy declarative), serializers and plugin systems use metaclasses to turn a plain class body into a schema and to keep a registry of every subclass automatically.`,
            r`class PluginMeta(type):
    registry = {}                              # shared by all classes using this metaclass
    def __new__(mcls, name, bases, ns):
        cls = super().__new__(mcls, name, bases, ns)
        if bases:                              # skip the abstract root
            mcls.registry[name.lower()] = cls  # auto-register every subclass
        return cls

class Plugin(metaclass=PluginMeta): pass
class Csv(Plugin): pass
class Json(Plugin): pass

print(sorted(PluginMeta.registry))
print(PluginMeta.registry["csv"] is Csv)

# OUTPUT:
# ['csv', 'json']
# True`],
        [`<b>Advantages:</b> total control over class creation: validate, register, rewrite the namespace, wrap methods, add attributes. Declarative APIs ("just write fields in a class") become possible, and the rules cannot be forgotten by a subclass author.`,
            r`def trace(fn):
    def wrapper(*a, **k):
        print("call", fn.__name__)
        return fn(*a, **k)
    return wrapper

class Traced(type):
    def __new__(mcls, name, bases, ns):
        for key, val in list(ns.items()):
            if callable(val) and not key.startswith("__"):
                ns[key] = trace(val)           # wrap every public method automatically
        return super().__new__(mcls, name, bases, ns)

class Svc(metaclass=Traced):
    def save(self): return "saved"
    def load(self): return "loaded"

s = Svc()
print(s.save(), s.load())

# OUTPUT:
# call save
# call load
# saved loaded`],
        [`<b>Disadvantages:</b> hard to read and debug; surprises teammates; two classes with unrelated metaclasses cannot be combined (metaclass conflict), which breaks multiple inheritance.`,
            r`class M1(type): pass
class M2(type): pass
class A(metaclass=M1): pass
class B(metaclass=M2): pass

try:
    class C(A, B):                             # M1 and M2 are unrelated -> conflict
        pass
except TypeError as e:
    print("TypeError:", e)

# OUTPUT:
# TypeError: metaclass conflict: the metaclass of a derived class must be a (non-strict) subclass of the metaclasses of all its bases`],
        [`<b>Limitations:</b> a metaclass only runs when a class is <i>created</i>; it does not change how instances behave unless you also write methods on it. For most "run code when subclassed" needs, <code>__init_subclass__</code> (3.6+) or a class decorator is simpler and enough.`,
            r`class Hook:
    def __init_subclass__(cls, **kwargs):      # no metaclass needed
        super().__init_subclass__(**kwargs)
        print("subclass created:", cls.__name__)

class X(Hook): pass

print(type(X))                                 # still plain 'type': no conflict risk

# OUTPUT:
# subclass created: X
# <class 'type'>`],
        `
   class A(Base):  body          ──►  1. run body into a namespace dict
                                      2. Meta.__prepare__(name, bases)  (optional)
                                      3. Meta(name, bases, ns)
                                           ├─ Meta.__new__  → creates the class object
                                           └─ Meta.__init__ → initialises it
                                      4. name 'A' bound to the new class

   instance  ──is-a──►  class  ──is-a──►  metaclass (type)  ──is-a──►  type
   a = A()              A                 Meta                          (type's type is type)
`,
        `Default to simpler tools in this order: plain functions/decorators, <code>__init_subclass__</code>, class decorators, descriptors, and only then a metaclass. Use a metaclass when you must influence the namespace before the class exists (<code>__prepare__</code>) or intercept class-level operations; keep it tiny, documented, and isolated inside a framework so application code never sees it.`
    ),

    'Descriptors': dd(
        [`A <b>descriptor</b> is an object, stored as a class attribute, that defines <code>__get__</code>, <code>__set__</code> or <code>__delete__</code>. Python calls these when the attribute is read, assigned or deleted through an instance. It is the mechanism behind <code>property</code>, methods, <code>classmethod</code> and <code>staticmethod</code>.`,
            r`class Loud:
    def __get__(self, obj, owner):             # obj = instance (None if via the class)
        return "from descriptor"

class A:
    x = Loud()                                 # descriptor lives on the CLASS

print(A().x)                                   # instance access calls Loud.__get__
print(A.x)                                     # class access calls it too, with obj=None

# OUTPUT:
# from descriptor
# from descriptor`],
        [`Without descriptors, the same validation code (positive number, non-empty string, ...) is copied into every property. A descriptor is written once and reused for any attribute of any class.`,
            r`class Positive:
    def __set_name__(self, owner, name):       # called once when the class is created
        self.name = "_" + name                 # where this attribute's value is stored
    def __get__(self, obj, owner=None):
        if obj is None:
            return self
        return getattr(obj, self.name)
    def __set__(self, obj, value):
        if value <= 0:
            raise ValueError(f"{self.name[1:]} must be positive")
        setattr(obj, self.name, value)

class Item:
    price = Positive()                         # same validator, two attributes
    qty = Positive()
    def __init__(self, price, qty):
        self.price = price
        self.qty = qty

print(Item(10, 2).price * 2)
try:
    Item(-1, 1)
except ValueError as e:
    print("ValueError:", e)

# OUTPUT:
# 20
# ValueError: price must be positive`],
        [`Lazy computed attributes (like <code>functools.cached_property</code>), ORM fields, type-checked dataclass-like fields and unit-aware values are all descriptors in production code.`,
            r`class lazy:
    """Compute once, then cache in the instance (non-data descriptor)."""
    def __init__(self, fn):
        self.fn = fn
        self.name = fn.__name__
    def __get__(self, obj, owner=None):
        if obj is None:
            return self
        value = self.fn(obj)
        obj.__dict__[self.name] = value        # instance dict now wins; __get__ never runs again
        return value

class Report:
    @lazy
    def data(self):
        print("computing...")
        return [1, 2, 3]

rep = Report()
print(rep.data)
print(rep.data)                                # served from the instance dict

# OUTPUT:
# computing...
# [1, 2, 3]
# [1, 2, 3]`],
        [`<b>Advantages:</b> reusable attribute logic, validation and lazy loading in one place; the exact machinery Python itself uses, so ordinary functions are descriptors that produce bound methods.`,
            r`class A:
    def hi(self):
        return "hi"

a = A()
print(type(A.__dict__["hi"]).__name__)         # a plain function stored in the class dict
print(A.__dict__["hi"].__get__(a, A)())        # function.__get__ builds the bound method
print(a.hi.__self__ is a)                      # the bound method remembers the instance

# OUTPUT:
# function
# hi
# True`],
        [`<b>Disadvantages:</b> subtle lookup rules, and an easy beginner bug: the descriptor object is shared by <i>all</i> instances, so state must be stored on the instance, not on the descriptor.`,
            r`class Bad:
    def __init__(self):
        self.v = 0
    def __get__(self, obj, owner=None):
        return self.v
    def __set__(self, obj, value):
        self.v = value                         # BUG: stored on the shared descriptor

class P:
    n = Bad()

a, b = P(), P()
a.n = 5
print(b.n)                                     # b sees a's value

# OUTPUT:
# 5`],
        [`<b>Limitations:</b> descriptors only work as <i>class</i> attributes. Put one in an instance dict and Python treats it as an ordinary object.`,
            r`class D:
    def __get__(self, obj, owner=None):
        return "magic"

class A:
    d = D()                                    # on the class: __get__ is used

a = A()
print(a.d)
a.other = D()                                  # on the instance: just stored, never called
print(type(a.other).__name__)

# OUTPUT:
# magic
# D`],
        `
   a.attr  ──►  type(a).__mro__ lookup finds 'attr' ?
                  │
                  ├─ data descriptor (has __set__)?      ──► call its __get__        (wins over instance dict)
                  ├─ else instance __dict__ has 'attr'?  ──► return that value
                  ├─ else non-data descriptor (__get__)? ──► call its __get__        (functions, cached values)
                  └─ else plain class attribute / __getattr__ fallback / AttributeError
`,
        `Prefer <code>property</code> for one-off logic and a descriptor class when the same behaviour repeats across attributes or classes. Remember the precedence: data descriptors beat the instance dict, non-data descriptors lose to it, which is exactly what makes lazy caching work. Store per-instance state on the instance (via <code>__set_name__</code>), never on the descriptor.`
    ),

    '__slots__': dd(
        [`<code>__slots__</code> declares a fixed set of attribute names on a class. Instances then store values in compact slots instead of a per-instance <code>__dict__</code>, saving memory and blocking accidental new attributes.`,
            r`class P:
    __slots__ = ("x", "y")                     # only these two attributes exist
    def __init__(self, x, y):
        self.x = x
        self.y = y

p = P(1, 2)
print(p.x, p.y)
print(hasattr(p, "__dict__"))                  # no dict is created

# OUTPUT:
# 1 2
# False`],
        [`Every normal object carries a dict (hash table) for its attributes. With millions of small objects (points, ticks, tree nodes) that overhead dominates memory use.`,
            r`import sys

class A:                                       # normal class: has __dict__
    def __init__(self):
        self.x = 1
        self.y = 2

class B:                                       # slotted class: no __dict__
    __slots__ = ("x", "y")
    def __init__(self):
        self.x = 1
        self.y = 2

a, b = A(), B()
print(hasattr(a, "__dict__"), hasattr(b, "__dict__"))
print(sys.getsizeof(b) < sys.getsizeof(a) + sys.getsizeof(a.__dict__))   # slotted is smaller

# OUTPUT:
# True False
# True`],
        [`Market-data ticks, graph nodes, parsed log records and game entities are created in huge numbers. Since 3.10 a dataclass can do it for you with <code>slots=True</code>.`,
            r`from dataclasses import dataclass

@dataclass(slots=True)                         # Python 3.10+
class Tick:
    symbol: str
    price: float

ticks = [Tick("AAPL", 190.5 + i) for i in range(3)]
print(ticks[0])
print(Tick.__slots__)

# OUTPUT:
# Tick(symbol='AAPL', price=190.5)
# ('symbol', 'price')`],
        [`<b>Advantages:</b> lower memory, slightly faster attribute access, and typos such as <code>p.z = 1</code> raise an error instead of silently creating a new attribute.`,
            r`class P:
    __slots__ = ("x",)

p = P()
p.x = 1
try:
    p.y = 2                                    # not declared -> rejected
except AttributeError:
    print("blocked new attribute y")

# OUTPUT:
# blocked new attribute y`],
        [`<b>Disadvantages:</b> no weak references or dynamic attributes by default, and pickling or multiple inheritance need extra care. Add <code>"__weakref__"</code> (or <code>"__dict__"</code>) to the slots if you need them.`,
            r`import weakref

class A:
    __slots__ = ("x",)

try:
    weakref.ref(A())                           # slotted classes are not weak-referenceable
except TypeError as e:
    print("TypeError:", e)

class B:
    __slots__ = ("x", "__weakref__")           # opt back in
print(weakref.ref(B()) is not None)

# OUTPUT:
# TypeError: cannot create weak reference to 'A' object
# True`],
        [`<b>Limitations:</b> two parents that both define non-empty slots cannot be combined, and slots are not inherited as a dict-like fallback: a subclass without its own <code>__slots__</code> gets a <code>__dict__</code> again.`,
            r`class A:
    __slots__ = ("a",)
class B:
    __slots__ = ("b",)

try:
    class C(A, B):                             # both want their own memory layout
        pass
except TypeError as e:
    print("TypeError:", e)

class Sub(A):                                  # forgot __slots__ in the subclass
    pass
print(hasattr(Sub(), "__dict__"))              # the saving is lost

# OUTPUT:
# TypeError: multiple bases have instance lay-out conflict
# True`],
        `
   normal object                         slotted object
   ┌───────────┐                         ┌───────────┐
   │ header    │                         │ header    │
   │ __dict__ ─┼─► {'x': 1, 'y': 2}      │ slot x ───┼─► 1
   │ __weakref__                         │ slot y ───┼─► 2
   └───────────┘   (hash table / object) └───────────┘   (fixed array in the object)
`,
        `Use slots only where profiling shows memory pressure from very many small instances; it is a data-layout optimisation, not a style choice. Prefer <code>@dataclass(slots=True)</code>, keep slots on the whole hierarchy, and note that for large numeric data arrays (NumPy, array module) or <code>NamedTuple</code> are usually even better.`
    ),

    'Dynamic Class Creation': dd(
        [`Calling <code>type(name, bases, namespace)</code> with three arguments builds a new class at run time. The <code>class</code> statement is just convenient syntax for exactly this call.`,
            r`def hello(self):
    return "hello " + self.name

# class Greeter(object): name = "world"; hello = hello   <- the same thing
Greeter = type("Greeter", (object,), {"name": "world", "hello": hello})

g = Greeter()
print(g.hello())
print(Greeter.__name__, type(Greeter))

# OUTPUT:
# hello world
# Greeter <class 'type'>`],
        [`When the shape of data is only known at run time (a database table, a JSON schema, a config file), you cannot write the class by hand. Generating classes from a description avoids repetitive boilerplate.`,
            r`def make_model(name, fields):
    def __init__(self, **kw):
        for f in fields:
            setattr(self, f, kw.get(f))
    def __repr__(self):
        body = ", ".join(f"{f}={getattr(self, f)!r}" for f in fields)
        return f"{name}({body})"
    return type(name, (), {"__init__": __init__, "__repr__": __repr__})

User = make_model("User", ["id", "email"])     # fields could come from a DB table
print(User(id=1, email="a@b.c"))

# OUTPUT:
# User(id=1, email='a@b.c')`],
        [`ORMs build model classes from tables, API clients build classes from OpenAPI specs, and <code>dataclasses.make_dataclass</code> / <code>collections.namedtuple</code> are standard-library examples.`,
            r`from dataclasses import make_dataclass

columns = [("id", int), ("name", str)]         # e.g. read from a CSV header
Row = make_dataclass("Row", columns)           # real dataclass: __init__, __repr__, __eq__
print(Row(1, "ann"))
print(Row(1, "ann") == Row(1, "ann"))

# OUTPUT:
# Row(id=1, name='ann')
# True`],
        [`<b>Advantages:</b> classes become data you can assemble; mixins can be combined on demand, and the <code>types</code> module (<code>types.new_class</code>) supports metaclasses and keyword arguments properly.`,
            r`class Walk:
    def move(self): return "walk"
class Swim:
    def extra(self): return "swim"

def build(*mixins):                            # compose behaviour at run time
    return type("Animal", mixins, {})

Animal = build(Walk, Swim)
print([c.__name__ for c in Animal.__mro__])
print(Animal().move(), Animal().extra())

# OUTPUT:
# ['Animal', 'Walk', 'Swim', 'object']
# walk swim`],
        [`<b>Disadvantages:</b> invisible to IDEs and type checkers, harder to read, and awkward to pickle because pickle looks the class up again by its module and name.`,
            r`import pickle

Dyn = type("Other", (), {})                    # variable name differs from class name
try:
    pickle.dumps(Dyn())                        # pickle looks for __main__.Other
except Exception as e:
    print(type(e).__name__)

# OUTPUT:
# PicklingError`],
        [`<b>Limitations:</b> the usual inheritance rules still apply (layout conflicts, metaclass conflicts), and there is no class-body syntax, so complex logic must be written as functions first.`,
            r`try:
    type("Both", (int, str), {})               # two incompatible built-in layouts
except TypeError as e:
    print("TypeError:", e)

# OUTPUT:
# TypeError: multiple bases have instance lay-out conflict`],
        `
   data: name, bases, attrs
          │
          ▼
   type(name, bases, attrs)  ──►  new class object  ──►  instances
          ▲                                   │
   same call the 'class' statement makes      └─ visible in __mro__, isinstance, etc.

   types.new_class(name, bases, kwds, exec_body)  = same, but honours metaclass + __prepare__
`,
        `Generate classes only at well-defined boundaries (schema loading, plugin discovery), cache the result, and give them stable names and modules so pickling, logging and debugging work. If static typing matters, generate real source files (code generation) instead, because type checkers cannot see run-time classes.`
    ),

    'Reflection & Introspection': dd(
        [`<b>Introspection</b> means a program examines its own objects at run time (type, attributes, signature); <b>reflection</b> goes further and uses that to read or change behaviour. Core tools: <code>type</code>, <code>isinstance</code>, <code>dir</code>, <code>getattr</code>, <code>hasattr</code>, <code>setattr</code> and the <code>inspect</code> module.`,
            r`class Dog:
    sound = "woof"
    def bark(self):
        return self.sound

d = Dog()
print(type(d).__name__, isinstance(d, Dog))
print(hasattr(d, "bark"), getattr(d, "sound"))
print([n for n in dir(d) if not n.startswith("_")])   # public names only

# OUTPUT:
# Dog True
# True woof
# ['bark', 'sound']`],
        [`Generic code (serializers, test runners, CLIs, dependency injection) must work with types it has never seen. Introspection lets it discover what a function needs or what an object offers.`,
            r`import inspect

def connect(host, port=5432, *, ssl=True):
    ...

sig = inspect.signature(connect)
for name, p in sig.parameters.items():
    default = "required" if p.default is p.empty else p.default
    print(name, p.kind.name, default)

# OUTPUT:
# host POSITIONAL_OR_KEYWORD required
# port POSITIONAL_OR_KEYWORD 5432
# ssl KEYWORD_ONLY True`],
        [`pytest finds tests by name, web frameworks route to handlers, and command-line shells dispatch commands by looking up methods with <code>getattr</code>.`,
            r`class Shell:
    def cmd_hello(self): return "hi"
    def cmd_bye(self):   return "bye"

sh = Shell()
for word in ["hello", "bye", "nope"]:
    fn = getattr(sh, "cmd_" + word, None)      # look the method up by name
    print(word, "->", fn() if fn else "unknown command")

# OUTPUT:
# hello -> hi
# bye -> bye
# nope -> unknown command`],
        [`<b>Advantages:</b> flexible, framework-friendly code with no hard-coded type lists; debuggers, loggers and decorators can see who called them and what they wrap.`,
            r`import inspect

def who_called():
    return inspect.currentframe().f_back.f_code.co_name   # caller's function name

def outer():
    return who_called()

print(outer())
print(inspect.isfunction(outer), inspect.ismethod(outer))

# OUTPUT:
# outer
# True False`],
        [`<b>Disadvantages:</b> name-based access moves errors from import time to run time, bypasses static checks and refactoring tools, and a typo can fail silently when a default is supplied.`,
            r`class Cfg:
    timeout = 30

cfg = Cfg()
print(getattr(cfg, "timeout", None))
print(getattr(cfg, "timout", None))            # typo: silently None instead of an error

# OUTPUT:
# 30
# None`],
        [`<b>Limitations:</b> you only see what exists <i>now</i>: attributes created in <code>__init__</code> are not on the class, and <code>__getattr__</code> can make <code>hasattr</code> answer True for anything.`,
            r`class A:
    def __init__(self):
        self.late = 1
print(hasattr(A, "late"), hasattr(A(), "late"))

class Ghost:
    def __getattr__(self, name):               # answers every unknown name
        return name
print(hasattr(Ghost(), "anything"))

# OUTPUT:
# False True
# True`],
        `
   object ──► type()  isinstance()  id()
          ──► dir()   vars()  __dict__          (what names exist?)
          ──► getattr / setattr / delattr       (read or change by name string)
   callable ─► inspect.signature / getsource    (what does it accept?)
   frames  ──► inspect.currentframe / stack     (who called whom?)
`,
        `Keep reflection at framework edges (registration, serialization, DI) and keep core domain code explicitly typed. Cache signature and attribute lookups instead of repeating them per call, prefer <code>typing.get_type_hints</code> over raw annotations, and use protocols or ABCs when you can express the contract statically.`
    ),

    'Monkey Patching': dd(
        [`<b>Monkey patching</b> means changing a class, module or function at run time by assigning new attributes to it. Since classes are ordinary mutable objects, replacing a method is a single assignment.`,
            r`class Calc:
    def add(self, a, b):
        return a + b

c = Calc()
print(c.add(2, 3))

Calc.add = lambda self, a, b: a + b + 100      # replace the method on the class
print(c.add(2, 3))                             # existing instances see the change

# OUTPUT:
# 5
# 105`],
        [`A third-party library has a bug and the fix is not released yet, or you cannot edit its source. Patching lets you hot-fix it from your own code without forking.`,
            r`class VendorClient:                           # pretend this is from site-packages
    def fetch(self, n):
        return list(range(n + 1))              # bug: off by one

def fixed_fetch(self, n):
    return list(range(n))

VendorClient.fetch = fixed_fetch               # hot-fix applied at start-up
print(VendorClient().fetch(3))

# OUTPUT:
# [0, 1, 2]`],
        [`Its everyday, legitimate home is <b>testing</b>: replace network calls, clocks or file access with fakes. <code>unittest.mock.patch</code> does this safely and restores the original afterwards.`,
            r`from unittest import mock
import os

def home_name():
    return os.path.basename(os.path.expanduser("~"))

with mock.patch("os.path.expanduser", return_value="/home/zed"):
    print(home_name())                         # patched only inside the with-block

print(home_name() != "zed")                    # original restored

# OUTPUT:
# zed
# True`],
        [`<b>Advantages:</b> instant fixes and test doubles with no change to the original code; can also wrap behaviour (logging, metrics) around an existing method while keeping the original callable.`,
            r`import functools

class Svc:
    def run(self):
        return "run"

orig = Svc.run
@functools.wraps(orig)
def logged(self):
    print("before")
    result = orig(self)                        # call the saved original
    print("after")
    return result

Svc.run = logged
print(Svc().run())

# OUTPUT:
# before
# after
# run`],
        [`<b>Disadvantages:</b> global, invisible side effects. Patches can stack by accident (for example when a module is imported or reloaded twice) and the result depends on import order.`,
            r`class A:
    def f(self):
        return 1

def patch():
    old = A.f
    A.f = lambda self: old(self) + 1           # wraps whatever is there now

patch()
patch()                                        # applied twice by mistake
print(A().f())                                 # expected 2, got 3

# OUTPUT:
# 3`],
        [`<b>Limitations:</b> built-in and C-implemented types are immutable, so you cannot patch <code>str</code>, <code>int</code>, <code>list</code> and friends. Code that already copied a reference (<code>from mod import fn</code>) keeps the old function.`,
            r`try:
    str.shout = lambda s: s.upper()
except TypeError as e:
    print("TypeError:", e)

# OUTPUT:
# TypeError: cannot set 'shout' attribute of immutable type 'str'`],
        `
   before:   Client.fetch ──► original function
   patch:    Client.fetch = fixed
   after:    Client.fetch ──► fixed function      (original still alive if you saved it)
                 ▲
   every caller, every instance, every module that looks the name up now gets 'fixed'
   mock.patch:  patch ─► run test ─► automatic restore
`,
        `Treat monkey patching as a last resort in production: isolate it in one start-up module, guard it (version check, apply-once flag), log it, and add a removal ticket. In tests, patch where the name is <i>looked up</i> (the importing module), prefer dependency injection, and use <code>mock.patch</code> so cleanup is automatic.`
    ),
};
