// Module 19 (Memory Management), part A: stack/heap, references, refcount, GC, cycles.
import { dd, r, type DeepDive } from './deepDive';

export const m19a: Record<string, DeepDive> = {
    'Stack vs Heap in Python': dd(
        [`In CPython the <b>call stack</b> holds frames (one per active function call, with local variable names), while the <b>heap</b> holds every object (ints, lists, instances). Names on the stack are just references pointing to objects on the heap.`,
            r`import sys

def f():
    x = [1, 2, 3]              # list OBJECT lives on the heap
    frame = sys._getframe()    # current stack frame
    print(frame.f_code.co_name, "locals:", list(frame.f_locals))
    return id(x)

addr = f()
print("object address is an integer id:", isinstance(addr, int))

# OUTPUT:
# f locals: ['x']
# object address is an integer id: True`],
        [`Knowing where things live explains why assignment never copies, why mutation is visible through every alias, why deep recursion raises <code>RecursionError</code> (stack frames), and why objects can outlive the function that created them.`,
            r`def make():
    data = [10, 20]     # created on heap during the call
    return data         # frame is popped, object survives (reference returned)

kept = make()
print(kept)

# OUTPUT:
# [10, 20]`],
        [`Real impact: recursion limits in tree/graph code, closures keeping heap objects alive, memory leaks from long-lived containers (caches, globals), and sizing servers by heap use.`,
            r`import sys
print(sys.getrecursionlimit())      # stack depth guard (default 1000)

def depth(n):
    return depth(n + 1)

try:
    depth(0)
except RecursionError as e:
    print("stack exhausted:", type(e).__name__)

# OUTPUT:
# 1000
# stack exhausted: RecursionError`],
        [`<b>Advantages:</b> the model is uniform (everything is a heap object), the programmer never allocates or frees by hand, and frames are heap objects too so they can be inspected or kept alive (generators, tracebacks).`,
            r`def gen():
    n = 0
    while True:
        yield n           # frame survives between calls (lives on the heap)
        n += 1

g = gen()
print(next(g), next(g), next(g))

# OUTPUT:
# 0 1 2`],
        [`<b>Disadvantages:</b> every value is a boxed object with a header, so memory use is larger than in C, and there is no stack allocation of objects for speed.`,
            r`import sys
print(sys.getsizeof(1))            # a small int is a full object
print(sys.getsizeof([]))           # empty list overhead
print(sys.getsizeof([1] * 1000))   # array of pointers, not raw ints

# OUTPUT (64-bit CPython 3.12):
# 28
# 56
# 8056`],
        [`<b>Limitations:</b> you cannot choose stack vs heap; escape analysis does not exist in CPython, and the recursion limit is a safety net, not a real tuned stack size.`,
            r`import sys
sys.setrecursionlimit(50)          # lower guard to show behaviour
def f(n): return n if n == 0 else f(n - 1)
try:
    f(100)
except RecursionError:
    print("limit hit at 50")
sys.setrecursionlimit(1000)

# OUTPUT:
# limit hit at 50`],
        `
   STACK (frames)                    HEAP (objects)
   ┌──────────────────┐             ┌───────────────────┐
   │ f()              │             │ list  [1, 2, 3]   │
   │   x ─────────────┼───────────► │ refcount = 1      │
   ├──────────────────┤             ├───────────────────┤
   │ <module>         │             │ str   "hello"     │
   │   name ──────────┼───────────► │ refcount = 2      │
   └──────────────────┘             └───────────────────┘
`,
        `Design with the heap model in mind: prefer iterators and generators for large streams, __slots__ or arrays/NumPy for millions of small records, and iterative algorithms for deep structures. Memory-critical components belong in compiled extensions where layout is controlled.`
    ),

    'References & Objects': dd(
        [`Every Python value is an <b>object</b> with an identity (<code>id</code>), a type and a value. A variable is only a <b>name bound to a reference</b>. Assignment binds a name; it never copies the object.`,
            r`a = [1, 2, 3]
b = a                      # b is another name for the SAME object
print(a is b, id(a) == id(b))

b.append(4)                # mutate through one name...
print(a)                   # ...visible through the other

# OUTPUT:
# True True
# [1, 2, 3, 4]`],
        [`Confusing names with objects causes classic bugs: unexpected shared state, mutable default arguments, and accidental aliasing. Understanding references lets you predict behaviour and choose copy vs share deliberately.`,
            r`import copy

orig = {"tags": ["a"]}
alias = orig                       # same object
shallow = orig.copy()              # new dict, SAME inner list
deep = copy.deepcopy(orig)         # fully independent

orig["tags"].append("b")
print(alias["tags"], shallow["tags"], deep["tags"])

# OUTPUT:
# ['a', 'b'] ['a', 'b'] ['a']`],
        [`Real bugs: a mutable default argument shared by every call, a list-of-lists created by <code>[[0]*3]*3</code>, and functions that mutate caller data. Pass copies or immutable data when sharing is not intended.`,
            r`def add(x, bucket=[]):          # default evaluated ONCE, shared
    bucket.append(x)
    return bucket

print(add(1)); print(add(2))

grid = [[0] * 2] * 2               # two references to ONE row
grid[0][0] = 9
print(grid)

# OUTPUT:
# [1]
# [1, 2]
# [[9, 0], [9, 0]]`],
        [`<b>Advantages:</b> passing large objects costs one pointer (no copy), mutation through a reference lets functions update data in place, and immutable types (int, str, tuple) are safe to share.`,
            r`def grow(items):
    items.append("new")             # caller sees it - no return needed

data = ["x"]
grow(data)
print(data)

def rebind(s):
    s = s + "!"                     # str is immutable: creates a new object
    return s
word = "hi"; rebind(word)
print(word)

# OUTPUT:
# ['x', 'new']
# hi`],
        [`<b>Disadvantages:</b> hidden aliasing makes bugs hard to see, and <code>is</code> vs <code>==</code> is a trap for beginners.`,
            r`a = [1, 2]
b = [1, 2]
print(a == b, a is b)     # equal values, different objects

x = 1000; y = 1000
print(x == y)             # always use == for value comparison

# OUTPUT:
# True False
# True`],
        [`<b>Limitations:</b> there are no true pointers or by-value passing; <code>id()</code> is only unique while the object lives (addresses are reused), and shallow copy does not duplicate nested objects.`,
            r`def addr():
    return id([1, 2, 3])          # temporary list is freed immediately

print(addr() == addr())           # same address often reused (varies)

# OUTPUT (varies):
# True`],
        `
   names                     objects (heap)
   ┌───┐                     ┌─────────────────────┐
   │ a │ ──────┐             │ id=0x1A  type=list  │
   └───┘       ├───────────► │ value=[1, 2, 3]     │
   ┌───┐       │             └─────────────────────┘
   │ b │ ──────┘
   └───┘       a is b  ->  True (same object, two names)
`,
        `Prefer immutable value objects (tuples, frozen dataclasses) across module boundaries and copy defensively at trust boundaries. Document ownership: who may mutate an argument. Use is only for singletons (None, sentinels), never for value equality.`
    ),

    'Reference Counting': dd(
        [`CPython tracks for every object a <b>reference count</b>: how many references point to it. When it drops to 0 the object is destroyed immediately and its memory is reclaimed.`,
            r`import sys

x = []
print(sys.getrefcount(x))   # 2: the name x + the temporary argument

y = x
print(sys.getrefcount(x))   # 3

del y
print(sys.getrefcount(x))   # back to 2

# OUTPUT:
# 2
# 3
# 2`],
        [`Deterministic cleanup: resources are released the moment the last reference disappears, so memory is not held until some later collection pass. It is the main reason CPython needs no manual free.`,
            r`class Res:
    def __del__(self):
        print("freed immediately")

r1 = Res()
print("before")
del r1                 # count hits 0 -> __del__ runs right now
print("after")

# OUTPUT:
# before
# freed immediately
# after`],
        [`Counts rise on assignment, passing arguments, storing in containers, and closure capture; they fall on <code>del</code>, rebinding, scope exit and container removal. Long-lived globals and caches therefore keep objects alive.`,
            r`import sys

obj = object()
base = sys.getrefcount(obj)
holder = [obj, obj]                 # container holds 2 more references
print(sys.getrefcount(obj) - base)

holder.clear()
print(sys.getrefcount(obj) - base)

# OUTPUT:
# 2
# 0`],
        [`<b>Advantages:</b> immediate, predictable reclamation, simple implementation, low pauses, and it makes <code>with</code>-less file closing usually work on CPython.`,
            r`def work():
    class Conn:
        def __del__(self): print("connection closed")
    c = Conn()
    print("working")
    # no explicit close: leaving the function drops the last reference

work()

# OUTPUT:
# working
# connection closed`],
        [`<b>Disadvantages:</b> every reference change touches a counter (slows execution and hurts multi-thread scaling), and cycles never reach zero so they need a separate collector.`,
            r`import sys

a = []
a.append(a)                   # list contains itself
print(sys.getrefcount(a))     # >= 3, never reaches 0 by counting alone
del a                         # name gone, but the cycle keeps itself alive
print("still allocated until the cyclic GC runs")

# OUTPUT:
# 3
# still allocated until the cyclic GC runs`],
        [`<b>Limitations:</b> behaviour is a CPython implementation detail (PyPy and others use tracing GC), the counter itself costs memory per object, and <code>__del__</code> timing must not be relied on across implementations.`,
            r`import sys, platform
print(platform.python_implementation())
print(hasattr(sys, "getrefcount"))    # exists on CPython; absent on some VMs

# OUTPUT (CPython):
# CPython
# True`],
        `
   x = Obj()      ─►  Obj.refcount = 1
   y = x          ─►  Obj.refcount = 2
   del x          ─►  Obj.refcount = 1
   del y          ─►  Obj.refcount = 0 ──► __del__ ──► memory freed NOW
`,
        `Treat refcount-based cleanup as an optimisation, not a contract: use with-statements and context managers for files, locks and connections so code stays correct on PyPy and under cycles. Python 3.12 immortal objects and 3.13 free-threading change the counting internals, so never depend on exact counts.`
    ),

    'Garbage Collection & the gc Module': dd(
        [`Besides reference counting, CPython has a <b>generational cyclic garbage collector</b> that finds unreachable reference cycles. The <code>gc</code> module lets you inspect, tune, trigger or disable it.`,
            r`import gc

print(gc.isenabled())          # collector is on by default
print(gc.get_threshold())      # (gen0, gen1, gen2) allocation thresholds
print(len(gc.get_stats()))     # stats for 3 generations

# OUTPUT (3.12):
# True
# (700, 10, 10)
# 3`],
        [`Reference counting alone leaks objects that reference each other. The cyclic GC periodically scans container objects so such garbage is eventually reclaimed without programmer effort.`,
            r`import gc

class Node:
    def __init__(self): self.other = None

a, b = Node(), Node()
a.other, b.other = b, a          # cycle
del a, b                         # counts stay 1 each -> not freed by refcount
print("collected:", gc.collect() > 0)   # explicit full collection finds them

# OUTPUT:
# collected: True`],
        [`Servers tune GC: disable it during a latency-critical section, <code>gc.freeze()</code> before forking workers (copy-on-write friendly), and use <code>gc.get_objects()</code> / callbacks to hunt leaks.`,
            r`import gc

gc.disable()
try:
    data = [[i] for i in range(100_000)]   # allocation burst without GC pauses
finally:
    gc.enable()
gc.freeze()          # move survivors to a permanent generation (fork friendliness)
print("frozen objects:", gc.get_freeze_count() > 0)
gc.unfreeze()

# OUTPUT:
# frozen objects: True`],
        [`<b>Advantages:</b> automatic cycle cleanup, generational design makes young-object scans cheap, tunable thresholds, and callbacks for monitoring.`,
            r`import gc

events = []
gc.callbacks.append(lambda phase, info: events.append((phase, info["generation"])))
gc.collect(0)                      # collect youngest generation only
gc.callbacks.clear()
print(events)

# OUTPUT:
# [('start', 0), ('stop', 0)]`],
        [`<b>Disadvantages:</b> collection can cause pauses proportional to live container objects, only container types are tracked, and objects with <code>__del__</code> inside cycles complicated older versions.`,
            r`import gc, time

big = [[] for _ in range(300_000)]     # many tracked containers
t = time.perf_counter()
gc.collect()
print("full collection took ms:", round((time.perf_counter() - t) * 1000) >= 0)

# OUTPUT (varies):
# full collection took ms: True`],
        [`<b>Limitations:</b> it cannot free what is still referenced (leaks via globals or caches), cannot reclaim memory to the OS if the allocator keeps arenas, and results of <code>gc.collect()</code> are not a promise about timing.`,
            r`import gc

cache = {}
def handler(i):
    cache[i] = bytearray(1000)         # reachable forever: a leak GC cannot fix

for i in range(100): handler(i)
gc.collect()
print(len(cache))

# OUTPUT:
# 100`],
        `
   allocation count > threshold0 (700)
              │
              ▼
   ┌────────────┐ survive ┌────────────┐ survive ┌────────────┐
   │ Gen 0      │ ──────► │ Gen 1      │ ──────► │ Gen 2      │
   │ young      │         │ middle     │         │ old (rare) │
   └────────────┘         └────────────┘         └────────────┘
   find unreachable cycles ─► free them
`,
        `Leave the GC enabled by default; tune only with measurements (gc.set_threshold, gc.freeze before fork in pre-fork servers like gunicorn). A growing memory profile is usually a reference leak, not a GC fault, so use tracemalloc and objgraph before touching GC settings. Python 3.13 revises the collector, so avoid depending on thresholds.`
    ),

    'Cyclic References': dd(
        [`A <b>reference cycle</b> exists when objects refer to each other directly or indirectly (A to B to A). Their reference counts never reach zero, so only the cyclic GC can free them.`,
            r`import gc, weakref

class Node:
    def __init__(self, name): self.name = name; self.peer = None

a, b = Node("a"), Node("b")
a.peer, b.peer = b, a                 # A -> B -> A
probe = weakref.ref(a)                # observe without owning

del a, b
print("alive after del:", probe() is not None)   # refcount cannot free it
gc.collect()
print("alive after gc :", probe() is not None)

# OUTPUT:
# alive after del: True
# alive after gc : False`],
        [`Cycles appear naturally: parent/child trees with back pointers, observer registrations, doubly linked lists, graphs and closures that capture themselves. Without understanding them, memory grows silently.`,
            r`class Parent:
    def __init__(self): self.children = []
class Child:
    def __init__(self, parent):
        self.parent = parent              # back reference
        parent.children.append(self)      # forward reference -> cycle

p = Parent(); Child(p); Child(p)
print(len(p.children), p.children[0].parent is p)

# OUTPUT:
# 2 True`],
        [`Common in ORM models (<code>user.orders[0].user</code>), GUI widget trees, event systems, and exceptions that store tracebacks whose frames reference the exception (<code>except E as e</code> deletes <code>e</code> to avoid it).`,
            r`import gc

def leaky():
    try:
        1 / 0
    except ZeroDivisionError as e:
        saved = e                  # saved -> traceback -> frame -> saved (cycle)
    return None

gc.disable()
leaky()
unreachable = gc.collect()
gc.enable()
print("cycle found:", unreachable > 0)

# OUTPUT:
# cycle found: True`],
        [`<b>Advantages:</b> cycles make natural data structures possible (graphs, trees with parent links), and Python handles them for you through the GC.`,
            r`import gc
class G:
    def __init__(self): self.me = self    # self-cycle
for _ in range(1000):
    G()                                   # all become garbage immediately
print("freed:", gc.collect() >= 1000)

# OUTPUT:
# freed: True`],
        [`<b>Disadvantages:</b> cyclic garbage lingers until the next collection, raising peak memory, and <code>__del__</code> on cyclic objects makes finalisation order unpredictable.`,
            r`import gc
gc.disable()
class Big:
    def __init__(self): self.self = self; self.blob = bytearray(1_000_000)
for _ in range(5):
    Big()                       # 5 MB stays allocated until collection
print("pending garbage objects:", gc.collect() > 0)
gc.enable()

# OUTPUT:
# pending garbage objects: True`],
        [`<b>Limitations:</b> the GC only finds <i>unreachable</i> cycles; a cycle reachable from a global stays forever, and C extensions that do not support GC tracking can leak cycles.`,
            r`import gc
registry = []
class Node:
    def __init__(self): self.me = self; registry.append(self)

Node()
print(gc.collect())              # 0 collected: registry still reaches it
print(len(registry))

# OUTPUT:
# 0
# 1`],
        `
        ┌──────────┐   .peer    ┌──────────┐
        │  Node a  │ ─────────► │  Node b  │
        │ refs = 1 │ ◄───────── │ refs = 1 │
        └──────────┘   .peer    └──────────┘
   del a, del b  ->  refcounts stay 1  ->  only gc.collect() frees them
`,
        `Break cycles by design: use weakref (or a weak parent pointer) for back references, avoid __del__, and expose explicit close/dispose methods or context managers. Monitor with gc.set_debug(gc.DEBUG_SAVEALL) in tests to assert that important objects do not form uncollected cycles.`
    )
};
