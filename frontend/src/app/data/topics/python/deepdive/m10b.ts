// Module 10 (Python Data Model), part B: comparison, operators, callables, object model, protocols.
import { dd, r, type DeepDive } from './deepDive';

export const m10b: Record<string, DeepDive> = {
    '__eq__ & __lt__': dd(
        [`<code>__eq__</code> defines <code>==</code> and <code>__lt__</code> defines <code>&lt;</code>. By default two objects are equal only if they are the <i>same</i> object; defining <code>__eq__</code> gives value-based equality, and <code>__lt__</code> makes objects sortable.`,
            r`class Version:
    def __init__(self, major, minor):
        self.major, self.minor = major, minor
    def __eq__(self, other):
        return (self.major, self.minor) == (other.major, other.minor)
    def __lt__(self, other):
        return (self.major, self.minor) < (other.major, other.minor)
    def __repr__(self): return f"v{self.major}.{self.minor}"

print(Version(1, 2) == Version(1, 2))
print(sorted([Version(2, 0), Version(1, 5), Version(1, 2)]))   # sorted only needs __lt__

# OUTPUT:
# True
# [v1.2, v1.5, v2.0]`],
        [`Without <code>__eq__</code>, two identical-looking objects are "different", and without <code>__lt__</code> you cannot sort or take <code>min</code>/<code>max</code>.`,
            r`class P:
    def __init__(self, x): self.x = x

print(P(1) == P(1))                      # default: identity comparison
try:
    sorted([P(2), P(1)])
except TypeError as e:
    print("TypeError:", e)

# OUTPUT:
# False
# TypeError: '<' not supported between instances of 'P' and 'P'`],
        [`Domain objects compared by value (money, versions, coordinates, IDs), tests that assert on objects, and sorting records by a natural key. <code>functools.total_ordering</code> fills in the other comparisons.`,
            r`from functools import total_ordering

@total_ordering                          # needs __eq__ and ONE of <, <=, >, >=
class Money:
    def __init__(self, c): self.c = c
    def __eq__(self, o): return self.c == o.c
    def __lt__(self, o): return self.c < o.c

a, b = Money(5), Money(9)
print(a < b, a <= b, a > b, a >= b, max(a, b).c)

# OUTPUT:
# True True False False 9`],
        [`<b>Advantages:</b> value semantics, usable in <code>sorted</code>, <code>min</code>, <code>max</code>, <code>bisect</code> and <code>list.index</code>; dataclasses generate them (<code>order=True</code>).`,
            r`from dataclasses import dataclass

@dataclass(order=True, frozen=True)
class Card:
    rank: int
    suit: str

print(Card(10, "h") < Card(11, "a"), Card(5, "s") == Card(5, "s"))
print(max([Card(3, "x"), Card(9, "y")]))

# OUTPUT:
# True True
# Card(rank=9, suit='y')`],
        [`<b>Disadvantages:</b> defining <code>__eq__</code> without <code>__hash__</code> makes the class unhashable, so it cannot go in sets or be a dict key. Also crashes when compared with other types.`,
            r`class P:
    def __init__(self, x): self.x = x
    def __eq__(self, o): return self.x == o.x

try:
    {P(1)}                               # needs __hash__
except TypeError as e:
    print("TypeError:", e)
try:
    P(1) == 5                            # 5 has no .x
except AttributeError:
    print("AttributeError: bad comparison with int")

# OUTPUT:
# TypeError: unhashable type: 'P'
# AttributeError: bad comparison with int`],
        [`<b>Limitations:</b> comparisons should return <code>NotImplemented</code> for unknown types so Python can try the reflected operation; equal objects must have equal hashes.`,
            r`class V:
    def __init__(self, n): self.n = n
    def __eq__(self, o):
        if not isinstance(o, V):
            return NotImplemented        # lets Python try the other side, then False
        return self.n == o.n
    def __hash__(self): return hash(self.n)   # keep hash consistent with __eq__

print(V(1) == V(1), V(1) == 5, len({V(1), V(1)}))

# OUTPUT:
# True False 1`],
        `
   a == b  ──► a.__eq__(b)
                 ├─ True / False ──► done
                 └─ NotImplemented ──► b.__eq__(a) ──► else identity (False)

   a < b   ──► a.__lt__(b) ──► NotImplemented ──► b.__gt__(a) ──► TypeError
`,
        `Model equality on the identity-defining fields only, keep <code>__hash__</code> consistent with it, and prefer immutable (frozen) value objects when hashing. Use dataclasses or <code>total_ordering</code> instead of hand-writing six comparisons; avoid cross-type equality that is not transitive.`
    ),

    'Operator Overloading & __add__': dd(
        [`Operators map to dunders: <code>+</code> to <code>__add__</code>, <code>-</code> to <code>__sub__</code>, <code>*</code> to <code>__mul__</code>, <code>@</code> to <code>__matmul__</code> and so on. Defining them lets your objects take part in expressions.`,
            r`class Vec:
    def __init__(self, x, y): self.x, self.y = x, y
    def __add__(self, o): return Vec(self.x + o.x, self.y + o.y)
    def __mul__(self, k): return Vec(self.x * k, self.y * k)
    def __repr__(self): return f"Vec({self.x}, {self.y})"

a, b = Vec(1, 2), Vec(3, 4)
print(a + b)
print(a * 3)

# OUTPUT:
# Vec(4, 6)
# Vec(3, 6)`],
        [`Domain math reads far better as <code>a + b</code> than <code>a.add(b)</code>. It also makes your type interoperate with <code>sum</code>, reflected operands and in-place operators.`,
            r`class Vec:
    def __init__(self, x, y): self.x, self.y = x, y
    def __add__(self, o): return Vec(self.x + o.x, self.y + o.y)
    def __radd__(self, o):               # called for 0 + Vec (sum starts at 0)
        return self if o == 0 else self + o
    def __repr__(self): return f"Vec({self.x}, {self.y})"

print(sum([Vec(1, 2), Vec(3, 4), Vec(5, 6)]))

# OUTPUT:
# Vec(9, 12)`],
        [`NumPy arrays, pandas Series, <code>Decimal</code>, <code>Fraction</code>, <code>pathlib</code> (<code>/</code>), <code>set</code> (<code>|</code> <code>&amp;</code>) and SQLAlchemy expressions (<code>User.age &gt; 18</code>) are all operator overloads.`,
            r`from fractions import Fraction
from decimal import Decimal

print(Fraction(1, 3) + Fraction(1, 6))
print(Decimal("0.1") + Decimal("0.2"))
print({1, 2} | {2, 3}, {1, 2} & {2, 3})

# OUTPUT:
# 1/2
# 0.3
# {1, 2, 3} {2}`],
        [`<b>Advantages:</b> expressive, math-like code and consistency with built-in types; in-place variants (<code>__iadd__</code>) can avoid copies.`,
            r`class Acc:
    def __init__(self): self.items = []
    def __iadd__(self, x):               # a += x mutates and returns self
        self.items.append(x)
        return self

a = Acc()
before = id(a)
a += 1; a += 2
print(a.items, id(a) == before)

# OUTPUT:
# [1, 2] True`],
        [`<b>Disadvantages:</b> operators with surprising meaning make code cryptic; unsupported operand types give runtime <code>TypeError</code>.`,
            r`class Vec:
    def __init__(self, x): self.x = x
    def __add__(self, o):
        if not isinstance(o, Vec):
            return NotImplemented        # correct way to refuse
        return Vec(self.x + o.x)

try:
    Vec(1) + 5
except TypeError as e:
    print("TypeError:", e)

# OUTPUT:
# TypeError: unsupported operand type(s) for +: 'Vec' and 'int'`],
        [`<b>Limitations:</b> you cannot create new operators or overload <code>and</code>, <code>or</code>, <code>not</code>, <code>is</code> or assignment. Only a fixed set of symbols is available.`,
            r`class Flag:
    def __init__(self, v): self.v = v
    def __bool__(self): return self.v
    def __and__(self, o): return Flag(self.v and o.v)   # & works, but "and" does not call it
    def __repr__(self): return f"Flag({self.v})"

a, b = Flag(True), Flag(False)
print(a & b)                             # overloaded
print(a and b)                           # uses __bool__, returns an operand

# OUTPUT:
# Flag(False)
# Flag(False)`],
        `
   a + b
    │
    ├─► a.__add__(b) ──► result
    │        └ NotImplemented
    └─► b.__radd__(a) ──► result   else TypeError

   a += b  ──► a.__iadd__(b)  (falls back to a = a + b)
`,
        `Overload operators only where the mathematical meaning is obvious (vectors, money, sets, paths) and keep them pure, returning new objects. For anything else prefer named methods. Support <code>NotImplemented</code>, reflected operands and numeric tower rules if your type should mix with others.`
    ),

    '__call__': dd(
        [`<code>__call__</code> makes an instance callable like a function: <code>obj(args)</code> runs <code>type(obj).__call__(obj, args)</code>. You get a function that remembers state.`,
            r`class Multiplier:
    def __init__(self, k):
        self.k = k                       # state kept between calls
    def __call__(self, x):
        return x * self.k

triple = Multiplier(3)
print(triple(5), callable(triple))

# OUTPUT:
# 15 True`],
        [`Plain functions are stateless and closures are awkward to inspect. A callable object keeps configuration and counters in attributes, can be subclassed and can have extra methods.`,
            r`class Counter:
    def __init__(self): self.calls = 0
    def __call__(self):
        self.calls += 1
        return self.calls

c = Counter()
c(); c()
print(c(), c.calls)

# OUTPUT:
# 3 3`],
        [`Stateful decorators, strategy objects, ML model objects (<code>model(x)</code> in PyTorch), parsers and <code>functools.partial</code> objects are callables; classes themselves are callable (calling a class creates an instance).`,
            r`from functools import partial

power = partial(pow, exp=2)              # a callable object holding an argument
print(power(6))
print(callable(int), callable(len), callable("text"))

# OUTPUT:
# 36
# True True False`],
        [`<b>Advantages:</b> state plus function-like syntax, usable anywhere a callable is expected (<code>map</code>, <code>sorted(key=...)</code>, callbacks).`,
            r`class Between:
    def __init__(self, lo, hi): self.lo, self.hi = lo, hi
    def __call__(self, x): return self.lo <= x <= self.hi

print(list(filter(Between(3, 6), range(10))))

# OUTPUT:
# [3, 4, 5, 6]`],
        [`<b>Disadvantages:</b> hides intent: <code>obj(x)</code> does not say what it does. A closure or plain function is often simpler.`,
            r`def make_multiplier(k):               # closure: same job, less ceremony
    return lambda x: x * k

print(make_multiplier(3)(5))

# OUTPUT:
# 15`],
        [`<b>Limitations:</b> like other dunders it is looked up on the type, and there is one <code>__call__</code> per class (no overloads).`,
            r`class A: pass
a = A()
a.__call__ = lambda: "hi"                # instance attribute is ignored by a()
try:
    a()
except TypeError as e:
    print("TypeError:", e)
print(a.__call__())                      # explicit access still works

# OUTPUT:
# TypeError: 'A' object is not callable
# hi`],
        `
   triple = Multiplier(3)        triple(5)
   ┌──────────────────┐             │
   │ k = 3            │ ◄───────────┘
   │ __call__(x)      │ ──► x * k ──► 15
   └──────────────────┘
   object state + function call syntax
`,
        `Use callable objects for stateful, configurable behaviour (strategies, middleware, decorators with arguments) and plain functions for stateless logic. Keep them thread-safe if shared, since their state is mutable.`
    ),

    'The Python Object Model': dd(
        [`In Python <b>everything is an object</b>: ints, functions, classes, modules. Every object has an <b>identity</b> (<code>id()</code>, never changes), a <b>type</b> and a <b>value</b>. Variables are just names bound to objects, not boxes holding values.`,
            r`x = 42
print(type(x).__name__, isinstance(x, object))
print(type(len).__name__, type(type).__name__, type(None).__name__)

def f(): pass
f.note = "functions are objects"         # even functions carry attributes
print(f.note)

# OUTPUT:
# int True
# builtin_function_or_method type NoneType
# functions are objects`],
        [`Understanding names versus objects explains aliasing, mutable-default bugs, copy versus reference and why <code>is</code> differs from <code>==</code>.`,
            r`a = [1, 2]
b = a                                    # a second NAME for the same list
c = [1, 2]                               # an equal but different list
print(a is b, a is c, a == c)
b.append(3)
print(a)

# OUTPUT:
# True False True
# [1, 2, 3]`],
        [`Knowing the model matters for: passing objects to functions (references are passed), copying configs (<code>copy.deepcopy</code>), caching by identity, weak references and debugging memory leaks.`,
            r`import copy

cfg = {"db": {"host": "a"}}
shallow = copy.copy(cfg)                 # inner dict shared
deep = copy.deepcopy(cfg)                # fully independent
cfg["db"]["host"] = "b"
print(shallow["db"]["host"], deep["db"]["host"])

# OUTPUT:
# b a`],
        [`<b>Advantages:</b> a uniform, simple model: first-class functions and classes, dynamic introspection (<code>dir</code>, <code>getattr</code>, <code>type</code>), and automatic memory management by reference counting.`,
            r`import weakref

class Thing: pass
t = Thing()
ref = weakref.ref(t)                     # does not keep the object alive
print(ref() is t)
del t                                    # refcount drops to 0 -> freed (CPython)
print(ref())

# OUTPUT:
# True
# None`],
        [`<b>Disadvantages:</b> aliasing bugs and per-object memory overhead (header, type pointer, refcount) make small objects heavy.`,
            r`import sys

def add_item(x, bucket=[]):              # the default list is ONE shared object
    bucket.append(x)
    return bucket

print(add_item(1), add_item(2))
print(sys.getsizeof(0), "bytes for the int 0")

# OUTPUT (example):
# [1, 2] [1, 2]
# 28 bytes for the int 0`],
        [`<b>Limitations:</b> immutable objects (int, str, tuple) can never change, so "modifying" them rebinds the name; and <code>is</code> on small values may look equal only because of caching (an implementation detail).`,
            r`s = "abc"
t = s
s += "d"                                 # builds a NEW string, rebinding s
print(s, t, s is t)

x = [1, 2]
y = x
x += [3]                                 # list += mutates in place
print(y)

# OUTPUT:
# abcd abc False
# [1, 2, 3]`],
        `
   names                objects (id, type, value)
   ─────                ─────────────────────────
   a ───────┐           ┌──────────────────────┐
   b ───────┴──────────►│ list  [1, 2, 3]      │ refcount = 2
                        └──────────────────────┘
   c ──────────────────►┌──────────────────────┐
                        │ list  [1, 2]         │ refcount = 1
                        └──────────────────────┘
   a is b -> same id      a == c -> same value
`,
        `Think in names and objects: pass immutable or frozen data between threads, copy deliberately at boundaries and never share mutable defaults. Use <code>is</code> only for singletons (None); use weakref or <code>__slots__</code> when millions of objects matter.`
    ),

    'Protocols': dd(
        [`In the data model a <b>protocol</b> is an informal interface: a set of dunder methods that a language feature expects. Iterator (<code>__iter__</code>, <code>__next__</code>), sequence (<code>__len__</code>, <code>__getitem__</code>), context manager (<code>__enter__</code>, <code>__exit__</code>) and callable (<code>__call__</code>) are the main ones.`,
            r`class Timer:                            # context-manager protocol
    def __enter__(self):
        print("start")
        return self
    def __exit__(self, exc_type, exc, tb):
        print("stop")
        return False                     # do not swallow exceptions

with Timer():
    print("working")

# OUTPUT:
# start
# working
# stop`],
        [`Language features (<code>with</code>, <code>for</code>, <code>len</code>, <code>sorted</code>, <code>in</code>) are not tied to specific classes; they work with anything implementing the right protocol. That is what makes duck typing safe and extensible.`,
            r`class Stack:                            # sequence-ish protocol
    def __init__(self, items): self.items = items
    def __len__(self): return len(self.items)
    def __getitem__(self, i): return self.items[i]

s = Stack([3, 1, 2])
print(sorted(s), max(s), list(reversed(s)), 2 in s)

# OUTPUT:
# [1, 2, 3] 3 [2, 1, 3] True`],
        [`Database connections and locks (context manager), files and generators (iterator), numeric types (number protocol), mappings and <code>dict(obj)</code> (keys + getitem), pickling (<code>__reduce__</code>) and copy (<code>__copy__</code>).`,
            r`class Pairs:
    def keys(self): return ["a", "b"]    # mapping protocol: keys() + __getitem__
    def __getitem__(self, k): return k.upper()

print(dict(Pairs()))                     # dict() accepts anything with keys()

# OUTPUT:
# {'a': 'A', 'b': 'B'}`],
        [`<b>Advantages:</b> no inheritance required, so third-party classes interoperate; one class implementation unlocks many functions.`,
            r`import contextlib

@contextlib.contextmanager
def tag(name):                           # a generator becomes a context manager
    print(f"<{name}>")
    yield
    print(f"</{name}>")

with tag("p"):
    print("text")

# OUTPUT:
# <p>
# text
# </p>`],
        [`<b>Disadvantages:</b> protocols are implicit and undocumented in code; you only learn the required method set from the docs, and mistakes appear at runtime.`,
            r`class Half:
    def __enter__(self): return self     # forgot __exit__

try:
    with Half():
        pass
except (TypeError, AttributeError) as e:
    print(type(e).__name__)

# OUTPUT:
# TypeError`],
        [`<b>Limitations:</b> no machinery verifies that you honoured the semantics (for example, an iterator that never raises <code>StopIteration</code> loops forever). Use ABCs or <code>typing.Protocol</code> to document and check them.`,
            r`from collections.abc import Iterable, Sized, Container

class Basket:
    def __len__(self): return 0
    def __iter__(self): return iter([])
    def __contains__(self, x): return False

b = Basket()
print(isinstance(b, Iterable), isinstance(b, Sized), isinstance(b, Container))

# OUTPUT:
# True True True`],
        `
   language feature      looks for (on the type)
   ────────────────      ───────────────────────
   with x:               __enter__, __exit__
   for i in x:           __iter__ -> __next__
   len(x), x[i]          __len__, __getitem__
   x(...)                __call__
   a + b                 __add__ / __radd__
   hash(x), {x}          __hash__, __eq__
`,
        `Design your classes to speak the standard protocols rather than inventing method names, and declare the contracts with <code>collections.abc</code> or <code>typing.Protocol</code>. Resist implementing protocols you cannot honour fully, for example a <code>__len__</code> that is O(n) on a lazy stream.`
    )
};
