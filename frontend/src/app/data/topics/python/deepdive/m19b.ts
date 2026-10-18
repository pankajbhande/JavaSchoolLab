// Module 19 (Memory Management), part B: weakref, allocation, caching/interning, object reuse.
import { dd, r, type DeepDive } from './deepDive';

export const m19b: Record<string, DeepDive> = {
    'weakref': dd(
        [`A <b>weak reference</b> points to an object without increasing its reference count. When the last strong reference disappears the object is freed and the weak reference returns <code>None</code>.`,
            r`import weakref

class Img:
    pass

img = Img()
w = weakref.ref(img)           # weak: does not keep img alive
print(w() is img)              # call it to get the object (or None)

del img                        # last strong reference gone
print(w())                     # object was freed

# OUTPUT:
# True
# None`],
        [`Caches, registries and observer lists hold objects only to be helpful; if they hold them strongly they cause memory leaks. Weak references let those structures never extend an object's life.`,
            r`import weakref

class User:
    def __init__(self, n): self.n = n

cache = weakref.WeakValueDictionary()
u = User("abaji")
cache["abaji"] = u
print(len(cache))              # 1
del u
print(len(cache))              # entry vanished automatically

# OUTPUT:
# 1
# 0`],
        [`Used in: object caches (<code>WeakValueDictionary</code>), per-object metadata (<code>WeakKeyDictionary</code>), observer/event systems (<code>WeakSet</code>, <code>WeakMethod</code>), parent back-pointers in trees, and <code>weakref.finalize</code> for cleanup.`,
            r`import weakref

class Conn:
    pass

c = Conn()
weakref.finalize(c, print, "connection cleaned up")   # runs when c is freed
print("working")
del c

# OUTPUT:
# working
# connection cleaned up`],
        [`<b>Advantages:</b> breaks cycles without leaks, automatic self-cleaning caches, no explicit unregister calls, and <code>finalize</code> is more reliable than <code>__del__</code>.`,
            r`import weakref

class Parent:
    def __init__(self): self.kids = []
class Child:
    def __init__(self, p):
        self.parent = weakref.ref(p)    # weak back pointer: no cycle
        p.kids.append(self)

p = Parent(); c = Child(p)
print(c.parent() is p)

# OUTPUT:
# True`],
        [`<b>Disadvantages:</b> you must always check for <code>None</code> before use, behaviour depends on refcounting timing, and debugging "why did it vanish" can be confusing.`,
            r`import weakref

class A: pass
a = A()
w = weakref.ref(a)
a = None                        # rebinding also drops the object
obj = w()
print(obj)
# obj.attr   would raise AttributeError: 'NoneType' ...

# OUTPUT:
# None`],
        [`<b>Limitations:</b> not every type supports weak references: <code>int</code>, <code>str</code>, <code>list</code>, <code>dict</code>, tuples cannot be weakly referenced (subclasses can), and classes using <code>__slots__</code> need a <code>__weakref__</code> slot.`,
            r`import weakref

try:
    weakref.ref([1, 2])
except TypeError as e:
    print(e)

class Slotted:
    __slots__ = ("x",)                       # no __weakref__ -> not weak-referenceable
class SlottedOK:
    __slots__ = ("x", "__weakref__")
weakref.ref(SlottedOK())
print("slot with __weakref__ works")

# OUTPUT:
# cannot create weak reference to 'list' object
# slot with __weakref__ works`],
        `
   strong ref ──► ┌──────────┐ ◄·· weak ref (no count)
   refcount = 1   │  Object  │
                  └──────────┘
   del strong ──► refcount = 0 ──► freed ──► weak() returns None
`,
        `Prefer weak references for caches that must not pin memory and for child-to-parent links, but use bounded strong caches (functools.lru_cache) when you need predictable hit rates, since weak entries disappear as soon as callers drop them. Never rely on weakref callbacks for critical cleanup ordering; use context managers.`
    ),

    'Memory Allocation': dd(
        [`CPython allocates memory in layers: the OS gives big arenas, <b>pymalloc</b> splits them into pools and blocks for small objects (up to 512 bytes), and larger requests go to the C <code>malloc</code>. Python code itself never calls malloc.`,
            r`import sys

print(sys.getsizeof(0))        # int object
print(sys.getsizeof(""))       # empty str
print(sys.getsizeof([]))       # empty list
print(sys.getsizeof({}))       # empty dict

# OUTPUT (64-bit CPython 3.12):
# 28
# 41
# 56
# 64`],
        [`Every object carries a header (reference count and type pointer) and containers over-allocate to make appends cheap. Knowing this lets you estimate memory and avoid surprising out-of-memory failures.`,
            r`import sys

lst = []
last = sys.getsizeof(lst)
for i in range(20):
    lst.append(i)
    size = sys.getsizeof(lst)
    if size != last:
        print(f"len={len(lst):2d} size grew to {size}")   # over-allocation steps
        last = size

# OUTPUT (3.12):
# len= 1 size grew to 88
# len= 5 size grew to 120
# len= 9 size grew to 184
# len=17 size grew to 256`],
        [`Use <code>tracemalloc</code> to find which lines allocate the most, <code>sys.getsizeof</code> for one object, and <code>__slots__</code> / <code>array</code> / NumPy to shrink millions of objects.`,
            r`import tracemalloc

tracemalloc.start()
data = [str(i) * 10 for i in range(50_000)]        # allocation burst
snap = tracemalloc.take_snapshot()
top = snap.statistics("lineno")[0]
print("biggest allocator is line", top.traceback[0].lineno)
print("size over 1 MB:", top.size > 1_000_000)

# OUTPUT (example):
# biggest allocator is line 5
# size over 1 MB: True`],
        [`<b>Advantages:</b> pymalloc makes small allocations very fast and reduces fragmentation, memory is freed automatically, and the tooling (<code>tracemalloc</code>, <code>gc</code>, <code>sys</code>) is built in.`,
            r`class Plain:
    def __init__(self): self.a = 1; self.b = 2
class Slim:
    __slots__ = ("a", "b")                       # no per-instance dict
    def __init__(self): self.a = 1; self.b = 2

import sys
print(sys.getsizeof(Plain().__dict__) > 0, hasattr(Slim(), "__dict__"))

# OUTPUT:
# True False`],
        [`<b>Disadvantages:</b> higher per-object overhead than C or Java primitives, memory fragmentation can keep arenas allocated, and a big list of ints costs far more than raw numbers.`,
            r`import sys, array

nums = list(range(1000))
raw = array.array("i", range(1000))
list_cost = sys.getsizeof(nums) + sum(sys.getsizeof(n) for n in nums)
print("list of ints ~", list_cost, "bytes")
print("array('i')   ~", sys.getsizeof(raw), "bytes")

# OUTPUT (3.12, approx):
# list of ints ~ 36000 bytes
# array('i')   ~ 4064 bytes`],
        [`<b>Limitations:</b> <code>getsizeof</code> is shallow (excludes referenced objects), freed memory is often not returned to the OS, and a process footprint may not shrink after releasing data.`,
            r`import sys
inner = [bytearray(1000) for _ in range(10)]
outer = [inner]
print(sys.getsizeof(outer))            # only the outer list's own pointers
print(sys.getsizeof(inner[0]))         # each inner is separate

# Deep size needs recursion or pympler.asizeof.

# OUTPUT:
# 64
# 1057`],
        `
   OS memory
     │ mmap
     ▼
   ┌─ Arena (1 MiB) ───────────────────────────────┐
   │ ┌─ Pool (16 KiB, one size class) ─┐  ┌─ Pool ─┐│
   │ │ block │ block │ block │ ...     │  │  ...   ││
   │ └─────────────────────────────────┘  └────────┘│
   └────────────────────────────────────────────────┘
   objects > 512 bytes  ──►  C malloc directly
`,
        `For memory-heavy workloads choose the data layout first: arrays, NumPy, Arrow, __slots__ or dataclasses(slots=True), generators for streaming. Profile with tracemalloc in staging, recycle worker processes to cap fragmentation (max_requests), and use memory limits in containers so leaks fail fast.`
    ),

    'Object Caching & Interning': dd(
        [`<b>Interning</b> reuses a single object for equal immutable values. CPython caches small integers (-5 to 256), interns identifier-like strings, and shares empty tuples and the singletons <code>None</code>, <code>True</code>, <code>False</code>.`,
            r`a = 256; b = 256
print(a is b)              # True: cached small int

x = int("1000"); y = int("1000")
print(x is y)              # False: separate objects created at runtime

import sys
s1 = sys.intern("hello world!")
s2 = sys.intern("hello world!")
print(s1 is s2)            # explicit interning

# OUTPUT:
# True
# False
# True`],
        [`Programs create huge numbers of tiny values. Reusing one shared immutable object saves memory and makes identity comparison a fast pointer check.`,
            r`import sys

words = ["status_ok"] * 3
print(words[0] is words[1])               # same object three times

dyn1 = "".join(["sta", "tus ok"])         # built at runtime, not interned
dyn2 = "".join(["sta", "tus ok"])
print(dyn1 == dyn2, dyn1 is dyn2)

# OUTPUT:
# True
# True False`],
        [`Dictionary keys and attribute names are interned so lookups compare pointers first. Large parsers call <code>sys.intern</code> on repeated tokens to cut memory. Compiler constant folding also merges identical literals in one code object.`,
            r`import sys

rows = [f"user{i % 3}" for i in range(9)]            # 9 strings, 3 distinct
print(len({id(s) for s in rows}))                    # 9 separate objects

rows = [sys.intern(s) for s in rows]                 # collapse duplicates
print(len({id(s) for s in rows}))                    # 3 objects

# OUTPUT:
# 9
# 3`],
        [`<b>Advantages:</b> lower memory, faster equality and dict lookup (identity shortcut), and fewer allocations for small ints and singletons.`,
            r`import timeit
n1 = "a" * 50; n2 = "a" * 50
same = n1
print(timeit.timeit(lambda: same == n1, number=200_000) >= 0)
# == checks identity first: the same object compares without scanning characters

# OUTPUT:
# True`],
        [`<b>Disadvantages:</b> interning behaviour is inconsistent across contexts, so code that uses <code>is</code> on strings or ints works sometimes and fails other times; interned strings may live forever.`,
            r`a = "hello_world"
b = "hello_world"
print(a is b)            # True: both literals share one constant here

c = "hello world"
d = "hello world"
print(c == d)            # always compare with ==, never rely on identity

# OUTPUT (typical CPython):
# True
# True`],
        [`<b>Limitations:</b> the cache ranges and rules are implementation details that change between versions (3.12 immortalises many), only immutable types are safe to share, and <code>sys.intern</code> accepts only exact <code>str</code>.`,
            r`import sys
try:
    sys.intern(b"bytes")
except TypeError as e:
    print("only str:", e)

print(() is ())               # empty tuple singleton (CPython detail)

# OUTPUT:
# only str: intern() argument must be str, not bytes
# True`],
        `
   int cache:  -5 ... 256   ──► one object per value (preallocated)
   a = 100 ─┐
   b = 100 ─┴──► [ int 100 ]        a is b -> True
   c = 1000 ───► [ int 1000 ]       d = 1000 ───► [ int 1000 ]  (c is d may be False)
   interned strings:  "name" "id" "status"  ──► intern table (dict)
`,
        `Never use is for numeric or string equality; reserve it for None and sentinel objects. Use sys.intern deliberately for million-row string columns, but prefer categorical encodings (pandas category, enums) for large cardinality-bounded data. Do not depend on cache boundaries when writing portable code.`
    ),

    'Why Does Python Reuse the Same Object?': dd(
        [`Python reuses objects because immutable values can safely be shared: nothing can change them, so one copy serves every user. Reuse also comes from names pointing to one object (aliasing) and from caches such as small ints and interned strings.`,
            r`a = (1, 2)
b = a                       # no copy: just another name
print(a is b)

x = None; y = None
print(x is y)               # one None object in the whole interpreter

# OUTPUT:
# True
# True`],
        [`Creating a fresh object for every <code>5</code> or every <code>"id"</code> would waste memory and time. Sharing reduces allocation and makes comparisons fast; immutability is what makes it safe.`,
            r`import sys
base = sys.getrefcount(None)
items = [None] * 1000          # 1000 references to the SAME None
print(sys.getrefcount(None) - base >= 1000)

# OUTPUT:
# True`],
        [`Practical effects: <code>is</code> checks for None, singletons (loggers, config), flyweight patterns, and mutable-default bugs where one list is reused across calls.`,
            r`def get_logger(name, _cache={}):
    if name not in _cache:
        _cache[name] = object()          # create once
    return _cache[name]

print(get_logger("db") is get_logger("db"))      # same instance reused

import logging
print(logging.getLogger("x") is logging.getLogger("x"))   # stdlib does it too

# OUTPUT:
# True
# True`],
        [`<b>Advantages:</b> memory savings, speed, and cheap argument passing; the same idea powers the Singleton and Flyweight patterns.`,
            r`class Color:
    _pool = {}
    def __new__(cls, name):
        if name not in cls._pool:
            cls._pool[name] = super().__new__(cls)
            cls._pool[name].name = name
        return cls._pool[name]

print(Color("red") is Color("red"), len(Color._pool))

# OUTPUT:
# True 1`],
        [`<b>Disadvantages:</b> shared mutable objects cause spooky action at a distance: change it in one place and every holder sees it.`,
            r`def add_item(item, box=[]):          # same list reused by every call
    box.append(item)
    return box

print(add_item("a"))
print(add_item("b"))               # surprise: still contains "a"

# OUTPUT:
# ['a']
# ['a', 'b']`],
        [`<b>Limitations:</b> reuse guarantees are not part of the language spec except for None/True/False and documented singletons, so compare values with <code>==</code> and treat <code>is</code> as identity only.`,
            r`a = 10 ** 3
b = 10 ** 3
print(a == b)           # reliable
print(a is b)           # implementation-dependent; do not rely on it

# OUTPUT (varies):
# True
# True`],
        `
   immutable value  ──► safe to share ──► many names, ONE object
   a ──┐
   b ──┼──► [ (1, 2) ]       mutable list shared the same way:
   c ──┘                     change via a  ==>  visible via b and c
`,
        `Make sharing safe by default: immutable data, copy-on-write semantics, and defensive copies on API boundaries. Use None or a sentinel for default arguments, and rely on tooling (ruff B006, mypy) to catch accidental shared mutable defaults.`
    )
};
