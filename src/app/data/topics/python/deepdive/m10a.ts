// Module 10 (Python Data Model), part A: dunder basics, representation, containers, iteration.
import { dd, r, type DeepDive } from './deepDive';

export const m10a: Record<string, DeepDive> = {
    'Dunder Methods': dd(
        [`<b>Dunder</b> ("double underscore") methods like <code>__init__</code>, <code>__len__</code> and <code>__add__</code> are hooks the interpreter calls for you. Syntax such as <code>len(x)</code>, <code>x + y</code> or <code>x[0]</code> is just sugar for them.`,
            r`class Bag:
    def __init__(self, items):
        self.items = items
    def __len__(self):                   # called by len(bag)
        return len(self.items)

b = Bag([1, 2, 3])
print(len(b))                            # same as b.__len__()
print(b.__len__())

# OUTPUT:
# 3
# 3`],
        [`Without dunders your classes would feel foreign (<code>b.get_length()</code>, <code>a.add(b)</code>). With them, your objects behave like built-ins and work with every function that expects those protocols.`,
            r`class Money:
    def __init__(self, amt): self.amt = amt
    def __add__(self, other): return Money(self.amt + other.amt)
    def __repr__(self): return f"Money({self.amt})"

print(Money(5) + Money(7))               # reads like math

# OUTPUT:
# Money(12)`],
        [`NumPy arrays, pandas DataFrames, Decimal, pathlib.Path (<code>p / "file"</code>), datetime arithmetic and ORMs (<code>Model.age > 18</code>) all work through dunders.`,
            r`from pathlib import PurePosixPath
from datetime import datetime, timedelta

print(PurePosixPath("/usr") / "bin")     # Path.__truediv__
print(datetime(2024, 1, 31) + timedelta(days=1))   # datetime.__add__

# OUTPUT:
# /usr/bin
# 2024-02-01 00:00:00`],
        [`<b>Advantages:</b> natural syntax, integration with built-ins, and consistency across the whole language.`,
            r`class Deck:
    def __init__(self): self.cards = list(range(5))
    def __len__(self): return len(self.cards)
    def __getitem__(self, i): return self.cards[i]

d = Deck()
print(len(d), d[0], d[-1], list(d)[:2], 3 in d)   # iteration and "in" come for free

# OUTPUT:
# 5 0 4 [0, 1] True`],
        [`<b>Disadvantages:</b> magic that surprises readers when overused; a dunder can hide cost or side effects behind innocent-looking syntax.`,
            r`class Weird:
    def __add__(self, other):
        print("side effect inside +")
        return 0

print(Weird() + Weird())

# OUTPUT:
# side effect inside +
# 0`],
        [`<b>Limitations:</b> dunders are looked up on the <b>type</b>, not the instance, so assigning one to an object does nothing for implicit calls. Never invent your own <code>__names__</code>; they are reserved.`,
            r`class A: pass
a = A()
a.__len__ = lambda: 99                   # set on the instance only
try:
    len(a)                               # len() looks at type(a), not a
except TypeError as e:
    print("TypeError:", e)

# OUTPUT:
# TypeError: object of type 'A' has no len()`],
        `
   your code        interpreter              your class
   ─────────        ───────────              ──────────
   len(obj)    ──►  type(obj).__len__(obj) ──► def __len__
   a + b       ──►  type(a).__add__(a, b)  ──► def __add__
   obj[0]      ──►  type(obj).__getitem__  ──► def __getitem__
   for x in o  ──►  type(o).__iter__       ──► def __iter__
`,
        `Implement only the dunders that give your type a real built-in meaning, keep them cheap and unsurprising, and follow the semantics of the built-ins they mimic (return NotImplemented rather than raising for unsupported operands). Otherwise expose explicit named methods.`
    ),

    '__init__, __str__ & __repr__': dd(
        [`<code>__init__</code> sets up a new object. <code>__str__</code> returns a friendly string for users (<code>print</code>, <code>str()</code>). <code>__repr__</code> returns an unambiguous developer string (REPL, debugging, <code>repr()</code>), ideally looking like the code that recreates the object.`,
            r`class Point:
    def __init__(self, x, y):
        self.x, self.y = x, y
    def __str__(self):                   # for end users
        return f"({self.x}, {self.y})"
    def __repr__(self):                  # for developers
        return f"Point({self.x!r}, {self.y!r})"

p = Point(1, 2)
print(p)                                 # uses __str__
print(repr(p))                           # uses __repr__

# OUTPUT:
# (1, 2)
# Point(1, 2)`],
        [`Default object text is useless (<code>&lt;__main__.Point object at 0x...&gt;</code>). Good representations make logs and debugging readable.`,
            r`class Raw:
    pass

s = repr(Raw())
print(s[:24])                            # address differs each run

class Nice:
    def __repr__(self): return "Nice()"

print([Nice(), Nice()])                  # containers show items with repr

# OUTPUT (example):
# <__main__.Raw object at
# [Nice(), Nice()]`],
        [`Logging, exceptions, notebooks and test failures all show <code>repr</code>. Frameworks (Django models, dataclasses) generate one for you.`,
            r`from dataclasses import dataclass

@dataclass
class User:
    name: str
    age: int

u = User("Ann", 30)
print(u)                                 # auto-generated __repr__

# OUTPUT:
# User(name='Ann', age=30)`],
        [`<b>Advantages:</b> if only <code>__repr__</code> is defined, <code>str()</code> falls back to it, so one method is enough to start; f-strings can pick with <code>!r</code> and <code>!s</code>.`,
            r`class T:
    def __repr__(self): return "T<repr>"

t = T()
print(str(t), f"{t!r}", f"{t!s}")

# OUTPUT:
# T<repr> T<repr> T<repr>`],
        [`<b>Disadvantages:</b> the reverse does not hold: defining only <code>__str__</code> leaves <code>repr</code> as the ugly default, and repr strings can leak secrets into logs.`,
            r`class OnlyStr:
    def __str__(self): return "friendly"

o = OnlyStr()
print(str(o))
print(repr(o)[:20])                      # still the default form

# OUTPUT:
# friendly
# <__main__.OnlyStr ob`],
        [`<b>Limitations:</b> both must return a <code>str</code>; returning anything else raises <code>TypeError</code>, and a <code>__repr__</code> that fails makes debugging itself fail.`,
            r`class Bad:
    def __repr__(self): return 42        # not a string

try:
    repr(Bad())
except TypeError as e:
    print("TypeError:", e)

# OUTPUT:
# TypeError: __repr__ returned non-string (type int)`],
        `
   print(obj) ──► __str__  ──(missing)──► __repr__ ──(missing)──► default
   repr(obj)  ──► __repr__ ──(missing)──► default <Class at 0x..>

   __str__  : readable, for users      "(1, 2)"
   __repr__ : exact, for developers    Point(1, 2)
`,
        `Always define <code>__repr__</code> (or use a dataclass); add <code>__str__</code> only when a user-facing form differs. Exclude passwords, tokens and PII from reprs because they end up in logs and error trackers. Make repr cheap: it can be called on huge object graphs.`
    ),

    '__len__, __getitem__ & __setitem__': dd(
        [`These three make an object behave like a container: <code>len(x)</code> calls <code>__len__</code>, <code>x[i]</code> calls <code>__getitem__</code> and <code>x[i] = v</code> calls <code>__setitem__</code>. Slices arrive as <code>slice</code> objects.`,
            r`class Playlist:
    def __init__(self): self._songs = []
    def __len__(self): return len(self._songs)
    def __getitem__(self, i): return self._songs[i]
    def __setitem__(self, i, v): self._songs[i] = v

p = Playlist()
p._songs = ["a", "b", "c"]
p[1] = "B"                               # __setitem__
print(len(p), p[1], p[0:2])              # __len__, __getitem__ (index and slice)

# OUTPUT:
# 3 B ['a', 'B']`],
        [`You want your own collection to support indexing, slicing, <code>for</code> loops, <code>reversed</code> and <code>in</code> without writing each by hand. <code>__len__</code> plus <code>__getitem__</code> already gives you iteration.`,
            r`class Countdown:
    def __len__(self): return 3
    def __getitem__(self, i):
        if i >= 3: raise IndexError         # ends the old-style iteration
        return 3 - i

c = Countdown()
print(list(c), list(reversed(c)), 2 in c)

# OUTPUT:
# [3, 2, 1] [1, 2, 3] True`],
        [`pandas (<code>df["col"]</code>), NumPy (<code>a[1:3, 0]</code>), configuration objects and lazy collections implement them, often with dict-like keys.`,
            r`class Config:
    def __init__(self): self._d = {}
    def __getitem__(self, k): return self._d[k.lower()]     # case-insensitive
    def __setitem__(self, k, v): self._d[k.lower()] = v

c = Config()
c["Host"] = "localhost"
print(c["HOST"])

# OUTPUT:
# localhost`],
        [`<b>Advantages:</b> natural bracket syntax and the whole sequence toolbox (<code>sorted</code>, <code>reversed</code>, <code>random.choice</code>) for free.`,
            r`import random
class Deck:
    def __init__(self): self.c = ["A", "K", "Q"]
    def __len__(self): return len(self.c)
    def __getitem__(self, i): return self.c[i]

d = Deck()
print(sorted(d), random.choice(d) in d.c)

# OUTPUT:
# ['A', 'K', 'Q'] True`],
        [`<b>Disadvantages:</b> you must handle negative indexes, slices and bad keys yourself, and delegating to a list blindly can leak its behaviour.`,
            r`class Wrapper:
    def __init__(self): self.d = [10, 20, 30]
    def __getitem__(self, i): return self.d[i]

w = Wrapper()
print(w[-1])                             # negative index works only because list does
print(type(w[0:2]).__name__)             # slice yields a list, not a Wrapper

# OUTPUT:
# 30
# list`],
        [`<b>Limitations:</b> <code>__getitem__</code> alone does not make <code>del x[i]</code> work (needs <code>__delitem__</code>) nor assignment (<code>__setitem__</code>); a missing method raises <code>TypeError</code>.`,
            r`class ReadOnly:
    def __getitem__(self, i): return i

r = ReadOnly()
print(r[5])
try:
    r[5] = 1
except TypeError as e:
    print("TypeError:", e)

# OUTPUT:
# 5
# TypeError: 'ReadOnly' object does not support item assignment`],
        `
   obj[2]        ──► type(obj).__getitem__(obj, 2)
   obj[2] = "x"  ──► type(obj).__setitem__(obj, 2, "x")
   del obj[2]    ──► type(obj).__delitem__(obj, 2)
   obj[1:3]      ──► __getitem__(obj, slice(1, 3, None))
   len(obj)      ──► __len__(obj)
`,
        `If you want a full sequence or mapping, subclass <code>collections.abc.MutableSequence</code> or <code>MutableMapping</code>: implement the few abstract methods and inherit dozens of correct helpers. Support slices deliberately or reject them with a clear error.`
    ),

    '__contains__': dd(
        [`<code>__contains__</code> implements the <code>in</code> operator: <code>x in obj</code> calls <code>type(obj).__contains__(obj, x)</code> and converts the result to a bool.`,
            r`class Team:
    def __init__(self, names): self.names = set(names)
    def __contains__(self, name):
        return name in self.names

t = Team(["ann", "bob"])
print("ann" in t, "zed" in t, "zed" not in t)

# OUTPUT:
# True False True`],
        [`Without it Python falls back to iterating the object and comparing each item, which is slow (O(n)) and requires iteration support. A custom <code>__contains__</code> can answer in O(1) or with domain logic.`,
            r`class Evens:
    def __contains__(self, n):           # infinite "collection", no iteration needed
        return isinstance(n, int) and n % 2 == 0

print(4 in Evens(), 7 in Evens(), 10**12 in Evens())

# OUTPUT:
# True False True`],
        [`<code>range</code>, <code>set</code> and <code>dict</code> have O(1)-ish membership; IP allow-lists, permission sets and bloom filters implement it with their own logic.`,
            r`import ipaddress

class AllowList:
    def __init__(self, cidr): self.net = ipaddress.ip_network(cidr)
    def __contains__(self, ip): return ipaddress.ip_address(ip) in self.net

office = AllowList("10.0.0.0/24")
print("10.0.0.5" in office, "8.8.8.8" in office)

# OUTPUT:
# True False`],
        [`<b>Advantages:</b> readable <code>if user in admins</code> checks, with fast custom lookups.`,
            r`import time
big = range(10**9)
t = time.perf_counter()
print(999_999_999 in big)                # range.__contains__ is arithmetic, not a loop
print(time.perf_counter() - t < 0.01)

# OUTPUT:
# True
# True`],
        [`<b>Disadvantages:</b> if inconsistent with <code>__iter__</code>, the same object tells two stories.`,
            r`class Odd:
    def __iter__(self): return iter([1, 2, 3])
    def __contains__(self, x): return False      # disagrees with __iter__

o = Odd()
print(2 in o, 2 in list(o))

# OUTPUT:
# False True`],
        [`<b>Limitations:</b> the result is coerced to <code>bool</code>, so you cannot return rich values; and without <code>__contains__</code>, <code>__iter__</code> or <code>__getitem__</code> you get <code>TypeError</code>.`,
            r`class Nothing: pass

try:
    1 in Nothing()
except TypeError as e:
    print("TypeError:", e)

# OUTPUT:
# TypeError: argument of type 'Nothing' is not iterable`],
        `
   x in obj
     │
     ├─ type(obj) has __contains__ ? ──yes──► bool(obj.__contains__(x))
     │ no
     ├─ has __iter__ ? ──yes──► scan items with ==
     │ no
     ├─ has __getitem__ ? ──yes──► try 0,1,2... until IndexError
     │ no
     └─► TypeError
`,
        `Back <code>in</code> with a hash set or tree when lookups are hot; a scan hidden behind <code>in</code> is a classic performance trap. Keep <code>__contains__</code> consistent with iteration and equality, or document why not.`
    ),

    '__iter__ & __next__': dd(
        [`An <b>iterable</b> has <code>__iter__</code> returning an <b>iterator</b>; an iterator has <code>__next__</code> that returns the next item and raises <code>StopIteration</code> when done. A <code>for</code> loop is built on exactly this.`,
            r`class CountUp:
    def __init__(self, stop):
        self.n, self.stop = 0, stop
    def __iter__(self):                  # make the object its own iterator
        return self
    def __next__(self):
        if self.n >= self.stop:
            raise StopIteration          # signals "no more items"
        self.n += 1
        return self.n

for x in CountUp(3):
    print(x)

# OUTPUT:
# 1
# 2
# 3`],
        [`Custom data sources (files, DB cursors, trees) need to plug into <code>for</code>, <code>list()</code>, <code>sum()</code>, unpacking and comprehensions. Implementing the protocol gives all of them at once, one item at a time.`,
            r`it = iter([1, 2])                  # any iterable gives an iterator
print(next(it), next(it))
try:
    next(it)
except StopIteration:
    print("exhausted")

# OUTPUT:
# 1 2
# exhausted`],
        [`File objects, <code>range</code>, dict views, database cursors and generators are iterators; a paginated API client can yield pages lazily.`,
            r`class Pages:
    def __init__(self, data, size): self.data, self.size = data, size
    def __iter__(self):                  # iterable: returns a FRESH iterator each time
        for i in range(0, len(self.data), self.size):
            yield self.data[i:i + self.size]

p = Pages(list(range(7)), 3)
print(list(p))
print(list(p))                           # reusable

# OUTPUT:
# [[0, 1, 2], [3, 4, 5], [6]]
# [[0, 1, 2], [3, 4, 5], [6]]`],
        [`<b>Advantages:</b> lazy and memory-efficient: process millions of items one at a time; infinite sequences are possible.`,
            r`from itertools import islice

class Naturals:
    def __iter__(self):
        n = 0
        while True:                      # infinite, but costs no memory
            n += 1
            yield n

print(list(islice(Naturals(), 5)))

# OUTPUT:
# [1, 2, 3, 4, 5]`],
        [`<b>Disadvantages:</b> an iterator that is its own iterable is single-use; a second loop sees nothing.`,
            r`it = iter([1, 2])                  # an iterator is its own iterable
print(list(it))
print(list(it))                          # already exhausted

# OUTPUT:
# [1, 2]
# []`],
        [`<b>Limitations:</b> iteration is forward-only: no rewinding, <code>len()</code> or indexing on a plain iterator, and mutating a collection while iterating it is unsafe.`,
            r`d = {"a": 1, "b": 2}
try:
    for k in d:
        d["c"] = 3                       # size changes during iteration
except RuntimeError as e:
    print("RuntimeError:", e)

# OUTPUT:
# RuntimeError: dictionary changed size during iteration`],
        `
   for x in obj:
        │
        ▼
   it = iter(obj)        ── obj.__iter__()
        │
        ▼
   ┌──► next(it) ── it.__next__() ──► value ──► loop body
   │        │
   └────────┘ repeat      raises StopIteration ──► loop ends
`,
        `Return a new iterator from <code>__iter__</code> (usually via a generator method) so collections can be traversed repeatedly and concurrently; make the iterator itself single-use. Prefer generators over hand-written <code>__next__</code> classes unless you need extra state or methods on the iterator.`
    )
};
