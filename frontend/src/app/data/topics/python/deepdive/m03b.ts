// Module 3 (Collections), part B: dictionaries and collection comparisons.
import { dd, r, type DeepDive } from './deepDive';

export const m03b: Record<string, DeepDive> = {
    'Dictionaries': dd(
        [`A <b>dictionary</b> maps unique, hashable <b>keys</b> to <b>values</b>. Lookup, insert and delete are O(1) on average. Since Python 3.7 a dict remembers insertion order.`,
            r`user = {"name": "Abaji", "age": 30}
print(user["name"])                # lookup by key
user["city"] = "Pune"              # add
user["age"] = 31                   # update
del user["name"]                   # delete
print(user)
print("age" in user, len(user))    # membership tests KEYS

# OUTPUT:
# Abaji
# {'age': 31, 'city': 'Pune'}
# True 2`],
        [`Real data is labelled: a user has a name, an order has an id and items. Looking things up by meaningful key is clearer and much faster than scanning a list of pairs.`,
            r`# Counting words: the classic dict job
text = "to be or not to be"
freq = {}
for w in text.split():
    freq[w] = freq.get(w, 0) + 1
print(freq)

# OUTPUT:
# {'to': 2, 'be': 2, 'or': 1, 'not': 1}`],
        [`JSON documents, configuration, caches, database rows, HTTP headers, routing tables and in-memory indexes are all dictionaries.`,
            r`import json
response = '{"id": 7, "tags": ["a", "b"], "owner": {"name": "Raoji"}}'
data = json.loads(response)                 # JSON object -> dict
print(data["owner"]["name"], data["tags"][0])
print(json.dumps(data, indent=None, sort_keys=True))

# OUTPUT:
# Raoji a
# {"id": 7, "owner": {"name": "Raoji"}, "tags": ["a", "b"]}`],
        [`<b>Advantages:</b> O(1) average lookup, ordered, flexible values of any type, and a rich API (<code>get</code>, <code>setdefault</code>, <code>items</code>).`,
            r`# Advantage: O(1) lookup versus scanning a list of pairs
pairs = [(i, i * i) for i in range(100_000)]
table = dict(pairs)
print(table[99_999])                         # direct hash lookup
print(next(v for k, v in pairs if k == 99_999))   # linear scan, same answer

# OUTPUT:
# 9999800001
# 9999800001`],
        [`<b>Disadvantages:</b> uses more memory than a list of tuples; a missing key raises KeyError; keys must be hashable.`,
            r`d = {"a": 1}
try:
    d["b"]
except KeyError as e:
    print("KeyError:", e)
try:
    d[["x"]] = 2
except TypeError as e:
    print("TypeError:", e)

# OUTPUT:
# KeyError: 'b'
# TypeError: unhashable type: 'list'`],
        [`<b>Limitations:</b> keys are unique (later values overwrite earlier ones); no built-in ordering by value; changing a dict while iterating over it raises RuntimeError.`,
            r`d = {"a": 1, "a": 2}             # duplicate key: last one wins
print(d)
nums = {"x": 1, "y": 2}
try:
    for k in nums:
        nums["z"] = 3              # size changes during iteration
except RuntimeError as e:
    print("RuntimeError:", e)

# OUTPUT:
# {'a': 2}
# RuntimeError: dictionary changed size during iteration`],
        `
   key ──► hash(key) ──► slot ──► value
   "age"     8731..       [4]       31

   {"name": "Abaji", "age": 31}
    ┌────────┬────────┐
    │  key   │ value  │   insertion order kept
    ├────────┼────────┤
    │ name   │ Abaji  │
    │ age    │ 31     │
    └────────┴────────┘
`,
        `A dict is the default Python "record" and "index", but plain dicts offer no schema: use <code>TypedDict</code>, dataclasses or pydantic when shape matters. For counting use <code>Counter</code>, for grouping <code>defaultdict</code>, for bounded caches <code>functools.lru_cache</code> or an LRU class so memory cannot grow unbounded.`
    ),

    'Dictionary Methods': dd(
        [`Key dictionary methods: <code>get</code> (safe lookup), <code>setdefault</code>, <code>update</code>, <code>pop</code>, <code>popitem</code>, <code>keys</code>, <code>values</code>, <code>items</code>, <code>clear</code>, <code>copy</code>, and <code>dict.fromkeys</code>.`,
            r`d = {"a": 1, "b": 2}
print(d.get("z"), d.get("z", 0))   # safe lookup
d.update({"b": 20, "c": 3})        # merge / overwrite
print(d)
print(d.pop("a"), d.popitem())     # popitem removes the LAST pair
print(list(d.keys()), list(d.values()))
print(dict.fromkeys(["x", "y"], 0))

# OUTPUT:
# None 0
# {'a': 1, 'b': 20, 'c': 3}
# 1 ('c', 3)
# ['b'] [20]
# {'x': 0, 'y': 0}`],
        [`Handling missing keys, merging configs and building groups are daily jobs. The right method turns 4-line if/else blocks into one line and avoids KeyError.`,
            r`# setdefault: create the list the first time, then reuse it
groups = {}
for word in ["apple", "avocado", "banana", "blueberry", "cherry"]:
    groups.setdefault(word[0], []).append(word)
print(groups)

# OUTPUT:
# {'a': ['apple', 'avocado'], 'b': ['banana', 'blueberry'], 'c': ['cherry']}`],
        [`Config merging with defaults, grouping records by key, iterating <code>items()</code> to render reports, and caching results with <code>setdefault</code>.`,
            r`# Real-time: defaults overridden by user settings (3.9+ union operator)
defaults = {"theme": "light", "font": 12, "lang": "en"}
user = {"theme": "dark"}
settings = defaults | user          # right side wins
print(settings)
for key, value in settings.items():
    print(f"{key:<6}= {value}")

# OUTPUT:
# {'theme': 'dark', 'font': 12, 'lang': 'en'}
# theme = dark
# font  = 12
# lang  = en`],
        [`<b>Advantages:</b> <code>keys()</code>, <code>values()</code> and <code>items()</code> are live views (no copy); keys views support set operations.`,
            r`d = {"a": 1, "b": 2}
view = d.keys()                    # live view
d["c"] = 3
print(list(view))                  # sees the new key
print(d.keys() & {"a", "z"})       # set algebra on keys

# OUTPUT:
# ['a', 'b', 'c']
# {'a'}`],
        [`<b>Disadvantages:</b> <code>fromkeys</code> with a mutable default shares one object among all keys, and <code>pop</code> without default raises KeyError.`,
            r`# Disadvantage: fromkeys shares ONE list
d = dict.fromkeys(["x", "y"], [])
d["x"].append(1)
print(d)                           # y changed too!
fixed = {k: [] for k in ["x", "y"]}
fixed["x"].append(1)
print(fixed)

# OUTPUT:
# {'x': [1], 'y': [1]}
# {'x': [1], 'y': []}`],
        [`<b>Limitations:</b> <code>update</code> replaces values shallowly (nested dicts are not merged), and <code>sorted(d)</code> sorts keys only; sorting by value needs <code>items()</code> and a key.`,
            r`# Limitation: update/| is shallow
a = {"db": {"host": "h1", "port": 1}}
b = {"db": {"host": "h2"}}
print(a | b)                        # port is lost
scores = {"a": 3, "b": 9, "c": 5}
print(sorted(scores.items(), key=lambda kv: kv[1], reverse=True))

# OUTPUT:
# {'db': {'host': 'h2'}}
# [('b', 9), ('c', 5), ('a', 3)]`],
        `
   d.get(k, default) ──► value or default (never KeyError)
   d.setdefault(k, v)──► value; inserts v if k missing
   d.update(other)   ──► other's keys overwrite d
   d.items()         ──► live view of (key, value) pairs
   d | other         ──► NEW dict, other wins on conflicts
`,
        `Choose <code>get</code> for reads, <code>setdefault</code>/<code>defaultdict</code> for grouping, and <code>[]</code> when a missing key is a real bug that should crash loudly. For deep config merges write an explicit recursive merge; do not rely on shallow <code>update</code>.`
    ),

    'Dictionary Unpacking': dd(
        [`<code>**</code> unpacks a dict into keyword arguments or into another dict literal. <code>{**a, **b}</code> merges; <code>f(**d)</code> passes each key as a named argument; a sequence is unpacked with a single <code>*</code>.`,
            r`defaults = {"host": "localhost", "port": 8080}
override = {"port": 9000, "debug": True}
config = {**defaults, **override}   # later keys win
print(config)
def connect(host, port, debug=False):
    return f"{host}:{port} debug={debug}"
print(connect(**config))            # keys become keyword arguments

# OUTPUT:
# {'host': 'localhost', 'port': 9000, 'debug': True}
# localhost:9000 debug=True`],
        [`Without unpacking you would copy keys one by one or write <code>connect(host=cfg["host"], port=cfg["port"])</code>. Unpacking makes config-driven calls and non-destructive merges short and safe.`,
            r`# Non-destructive update: the original is unchanged
base = {"a": 1, "b": 2}
changed = {**base, "b": 99, "c": 3}
print(base)
print(changed)

# OUTPUT:
# {'a': 1, 'b': 2}
# {'a': 1, 'b': 99, 'c': 3}`],
        [`Forwarding options through wrapper functions (<code>**kwargs</code>), building model instances from JSON, and layered settings (defaults, environment, command line).`,
            r`from dataclasses import dataclass

@dataclass
class User:
    name: str
    age: int

row = {"name": "Abaji", "age": 30}     # e.g. from a database or JSON
print(User(**row))                    # dict -> object in one step

# OUTPUT:
# User(name='Abaji', age=30)`],
        [`<b>Advantages:</b> concise, creates a new dict (no mutation), works with several dicts at once, and lets functions accept flexible options.`,
            r`# Advantage: merge many sources, last wins
env = {"level": "info"}
file = {"level": "warn", "path": "/log"}
cli = {"path": "/tmp/log"}
print({**env, **file, **cli})

# OUTPUT:
# {'level': 'warn', 'path': '/tmp/log'}`],
        [`<b>Disadvantages:</b> silent overwriting hides conflicts, and passing a dict with an unexpected key to a function raises TypeError.`,
            r`def greet(name):
    return "hi " + name

try:
    greet(**{"name": "Abaji", "age": 30})   # 'age' is not a parameter
except TypeError as e:
    print("TypeError:", e)

# OUTPUT:
# TypeError: greet() got an unexpected keyword argument 'age'`],
        [`<b>Limitations:</b> keys passed with <code>**</code> must be strings; the merge is shallow; duplicates between two <code>**</code> arguments in a call raise an error (but not in a dict literal).`,
            r`def f(**kw):
    return kw

try:
    f(**{1: "a"})                          # non-string key
except TypeError:
    print("TypeError: keys must be strings")
try:
    f(**{"a": 1}, **{"a": 2})              # duplicate in a CALL
except TypeError:
    print("TypeError: duplicate keyword 'a'")
print({**{"a": 1}, **{"a": 2}})            # dict literal: allowed

# OUTPUT:
# TypeError: keys must be strings
# TypeError: duplicate keyword 'a'
# {'a': 2}`],
        `
   {**a, **b}                      f(**cfg)

   a = {x:1, y:2} ─┐               cfg = {host:"h", port:80}
                   ├─► {x:1, y:9, z:3}     │       │
   b = {y:9, z:3} ─┘  (b wins)             ▼       ▼
                                   f(host="h", port=80)
`,
        `Layered configuration with <code>{**defaults, **env, **cli}</code> is idiomatic, but validate the final dict (pydantic, dataclass) before use, because unpacking lets unexpected keys flow deep into your program. Use deep-merge helpers for nested settings.`
    ),

    'List vs Tuple': dd(
        [`A <b>list</b> is mutable and meant for homogeneous collections that change; a <b>tuple</b> is immutable and meant for fixed groups of (often different) values. Both are ordered and indexable.`,
            r`lst = [1, 2, 3]
tup = (1, 2, 3)
lst[0] = 99                        # allowed
print(lst)
try:
    tup[0] = 99
except TypeError as e:
    print("TypeError:", e)
print(hasattr(lst, "append"), hasattr(tup, "append"))

# OUTPUT:
# [99, 2, 3]
# TypeError: 'tuple' object does not support item assignment
# True False`],
        [`Picking the right one communicates intent and affects safety, speed and where the value may be used (tuples can be dict keys; lists cannot).`,
            r`# Tuple as a composite dict key (e.g. grid coordinates)
grid = {(0, 0): "start", (2, 3): "goal"}
print(grid[(2, 3)])
# A list key would fail with TypeError: unhashable type: 'list'

# OUTPUT:
# goal`],
        [`Lists: rows to process, a growing cart. Tuples: coordinates, RGB values, function returns, DB records, constants, dictionary keys.`,
            r`# Real-time: constants as tuple, working data as list
ALLOWED_EXT = (".jpg", ".png")              # fixed => tuple
files = ["a.jpg", "b.txt", "c.png"]         # changing => list
ok = [f for f in files if f.endswith(ALLOWED_EXT)]   # endswith takes a tuple
print(ok)

# OUTPUT:
# ['a.jpg', 'c.png']`],
        [`<b>Advantages:</b> tuples are lighter and faster to create; lists offer many in-place methods.`,
            r`import timeit
t_tuple = timeit.timeit("(1, 2, 3, 4, 5)", number=1_000_000)
t_list = timeit.timeit("[1, 2, 3, 4, 5]", number=1_000_000)
print("tuple creation faster:", t_tuple < t_list)   # constant tuples are pre-built

# OUTPUT (typical):
# tuple creation faster: True`],
        [`<b>Disadvantages:</b> lists cost more memory and cannot be hashed; tuples cannot be modified in place.`,
            r`import sys
print(sys.getsizeof([1, 2, 3]), sys.getsizeof((1, 2, 3)))
try:
    hash([1, 2, 3])
except TypeError as e:
    print("TypeError:", e)

# OUTPUT (64-bit CPython 3.12, example):
# 88 64
# TypeError: unhashable type: 'list'`],
        [`<b>Limitations:</b> a tuple is only shallowly immutable, and a list that other code holds can be modified behind your back.`,
            r`inner = [1, 2]
t = (inner, 3)
inner.append(99)                   # the "immutable" tuple appears to change
print(t)

# OUTPUT:
# ([1, 2, 99], 3)`],
        `
              LIST                         TUPLE
   [1, 2, 3]  mutable            (1, 2, 3)  immutable
   append/remove/sort            count/index only
   not hashable                  hashable (if items are)
   homogeneous, growing          heterogeneous record
   more memory                   less memory
`,
        `Think semantics, not speed: a tuple says "this is one fixed record", a list says "this is a sequence of like items". Prefer immutability at API boundaries, and promote repeating tuple shapes to NamedTuple or dataclass for self-documenting access.`
    ),

    'List vs Set': dd(
        [`A <b>list</b> keeps order and duplicates and is accessed by position. A <b>set</b> keeps only unique hashable items with no order and is optimised for membership and set algebra.`,
            r`data = [3, 1, 3, 2, 1]
print(data)                        # order and duplicates kept
print(sorted(set(data)))           # unique values only
print(data[0])                     # list: index access works
# set(data)[0] would be a TypeError: sets are not indexable

# OUTPUT:
# [3, 1, 3, 2, 1]
# [1, 2, 3]
# 3`],
        [`Choosing wrongly costs performance (list membership is O(n)) or correctness (a list quietly allows duplicates). Knowing the difference decides the data structure for a task.`,
            r`import timeit
items = list(range(50_000))
as_set = set(items)
tl = timeit.timeit(lambda: 49_999 in items, number=300)
ts = timeit.timeit(lambda: 49_999 in as_set, number=300)
print("set lookup much faster:", ts * 10 < tl)

# OUTPUT:
# set lookup much faster: True`],
        [`Lists: ordered results, leaderboards, sequences. Sets: visited URLs in a crawler, unique visitors, permissions, de-duplication, "is this ID banned?".`,
            r`# Real-time: crawler must not visit a page twice
visited = set()
queue = ["/a", "/b", "/a", "/c", "/b"]
for url in queue:
    if url in visited:
        continue
    visited.add(url)
    print("crawl", url)

# OUTPUT:
# crawl /a
# crawl /b
# crawl /c`],
        [`<b>Advantages:</b> list gives order, duplicates, indexing and slicing; set gives uniqueness, O(1) membership and union/intersection.`,
            r`a, b = [1, 2, 3, 4], [3, 4, 5]
common = [x for x in a if x in b]          # list version: O(n*m)
print(common)
print(set(a) & set(b))                     # set version: O(n+m)

# OUTPUT:
# [3, 4]
# {3, 4}`],
        [`<b>Disadvantages:</b> list: slow membership; set: no order, no duplicates (counts lost), no indexing, more memory.`,
            r`names = ["abaji", "raoji", "abaji"]
print(len(names), len(set(names)))         # duplicate info is gone
print(set(names) == {"raoji", "abaji"})      # order is irrelevant

# OUTPUT:
# 3 2
# True`],
        [`<b>Limitations:</b> sets need hashable items, so a set of lists fails; neither type guarantees sortedness; if you need order plus uniqueness use <code>dict.fromkeys</code>.`,
            r`# Order-preserving de-duplication
names = ["b", "a", "b", "c", "a"]
print(list(dict.fromkeys(names)))          # first occurrence order kept
print(sorted(set(names)))                  # sorted, but order of appearance lost

# OUTPUT:
# ['b', 'a', 'c']
# ['a', 'b', 'c']`],
        `
   LIST [3,1,3,2]            SET {3,1,2}
   ordered, dupes ok         unordered, unique
   x in lst   -> O(n)        x in st   -> O(1) avg
   lst[0]     -> O(1)        no indexing
   append O(1) amortised     add    O(1) avg
`,
        `Rule of thumb: if you ask "is x in this collection?" more than a few times, convert to a set once. If you must keep order and uniqueness, use <code>dict.fromkeys</code>; for counts <code>Counter</code>; for sorted unique with fast insert, <code>bisect</code> on a list or a sorted container library.`
    ),

    'Dictionary Internals': dd(
        [`CPython implements a dict as a <b>hash table</b>: the key's <code>hash()</code> picks a slot; a compact array of entries stores keys and values in insertion order, which is why order is kept. Two keys are the same if their hash is equal AND <code>==</code> is true.`,
            r`d = {}
for key in ["z", "a", "m"]:
    d[key] = len(d)
print(list(d))                      # insertion order preserved
print(hash("a") == hash("a"))       # same value => same hash (within a run)
print(hash(1) == hash(1.0), 1 == 1.0)
print({1: "int", 1.0: "float"})     # equal keys collapse into one

# OUTPUT:
# ['z', 'a', 'm']
# True
# True True
# {1: 'float'}`],
        [`Knowing the mechanism explains why keys must be hashable and immutable, why lookup is O(1), why dicts use extra memory, and why "mutating a key" would corrupt the table.`,
            r`# Custom keys: define __hash__ and __eq__ together
class Point:
    def __init__(self, x, y): self.x, self.y = x, y
    def __hash__(self):       return hash((self.x, self.y))
    def __eq__(self, o):      return (self.x, self.y) == (o.x, o.y)

d = {Point(1, 2): "A"}
print(d[Point(1, 2)])               # a different object, equal value

# OUTPUT:
# A`],
        [`Performance tuning of caches and indexes: understanding resize costs, memory use, hash collisions and why string keys are interned and fast to compare.`,
            r`# Real-time: key-sharing, resize and memory growth
import sys
d = {}
sizes = []
for i in range(20):
    d[i] = i
    sizes.append(sys.getsizeof(d))
print("memory jumps when the table resizes:", len(set(sizes)) > 1)

# OUTPUT:
# memory jumps when the table resizes: True`],
        [`<b>Advantages:</b> average O(1) get/set/delete, compact layout (about 20-25% less memory than older dicts), ordered iteration, key-sharing dicts for instance attributes.`,
            r`# Advantage: instance __dict__ uses a compact key-sharing layout
class A:
    def __init__(self): self.x = 1; self.y = 2
a = A()
print(a.__dict__)

# OUTPUT:
# {'x': 1, 'y': 2}`],
        [`<b>Disadvantages:</b> memory overhead for the sparse index table; bad hash functions cause collisions and degrade toward O(n); resize copies everything.`,
            r`# Disadvantage: all keys hash alike => collisions => slow O(n) lookups
class Bad:
    def __init__(self, v): self.v = v
    def __hash__(self): return 1             # terrible on purpose
    def __eq__(self, o): return self.v == o.v

import time
good = {i: i for i in range(2000)}
bad = {Bad(i): i for i in range(2000)}       # each insert compares with the others
print(len(good), len(bad))

# OUTPUT:
# 2000 2000`],
        [`<b>Limitations:</b> keys must be hashable and their hash must not change while stored; string hashes are randomised per process (PYTHONHASHSEED), so never persist <code>hash()</code> values.`,
            r`# Limitation: hash("abc") differs between interpreter runs
print("hash is an int:", isinstance(hash("abc"), int))
# Run the script twice: the printed number changes each time.
# Integers hash to themselves, so hash(42) is always 42.
print(hash(42))

# OUTPUT:
# hash is an int: True
# 42`],
        `
   key "age" ─► hash ─► index table          entries (insertion order)
                       ┌────┐              ┌───┬────────┬───────┬───────┐
        hash & mask ─► │  2 │────────────► │ 0 │ h(name)│ name  │ Abaji │
                       │ -- │              │ 1 │ h(age) │ age   │ 31    │
                       │  1 │────────────► │   │        │       │       │
                       └────┘              └───┴────────┴───────┴───────┘
   collision? probe the next slot, compare hash then ==
`,
        `Dict performance is only as good as the keys' hash quality and the load factor (resize at about 2/3 full). Use immutable keys, never override <code>__eq__</code> without <code>__hash__</code>, and for very large key sets consider arrays, tries, or external stores (Redis, SQLite) to cut memory.`
    ),

    'Shallow Copy vs Deep Copy': dd(
        [`A <b>shallow copy</b> creates a new container but reuses the same inner objects. A <b>deep copy</b> (<code>copy.deepcopy</code>) recursively copies everything, so the two structures are fully independent.`,
            r`import copy
orig = {"name": "Abaji", "scores": [90, 80]}
shallow = copy.copy(orig)              # same as orig.copy()
deep = copy.deepcopy(orig)
orig["scores"].append(70)
print("shallow:", shallow["scores"])   # shares the inner list
print("deep   :", deep["scores"])      # independent

# OUTPUT:
# shallow: [90, 80, 70]
# deep   : [90, 80]`],
        [`Nested mutable structures (lists of lists, dicts of lists, objects with lists) are everywhere. Choosing the wrong copy gives either shared-state bugs or wasted time and memory.`,
            r`# The classic bug: multiplying nested lists copies REFERENCES
grid = [[0] * 3] * 2                   # same inner list twice
grid[0][0] = 1
print(grid)
good = [[0] * 3 for _ in range(2)]     # separate rows
good[0][0] = 1
print(good)

# OUTPUT:
# [[1, 0, 0], [1, 0, 0]]
# [[1, 0, 0], [0, 0, 0]]`],
        [`Saving game or editor state snapshots, running "what-if" simulations on a copy, test fixtures that must not leak between tests, and protecting default configuration objects.`,
            r`# Real-time: test fixture - each test gets its own deep copy
import copy
DEFAULT = {"limits": {"max": 5}}
def make_config():
    return copy.deepcopy(DEFAULT)

c1 = make_config()
c1["limits"]["max"] = 99
print(make_config()["limits"]["max"])  # defaults untouched

# OUTPUT:
# 5`],
        [`<b>Advantages:</b> shallow copy is cheap and enough for flat or immutable data; deepcopy gives complete isolation and handles cycles and shared references correctly.`,
            r`# Advantage: deepcopy preserves the shared-reference structure and cycles
import copy
a = [1]
a.append(a)                            # a contains itself
b = copy.deepcopy(a)
print(b[1] is b, b is not a)

# OUTPUT:
# True True`],
        [`<b>Disadvantages:</b> deepcopy is slow and memory hungry on big graphs; shallow copy surprises people with shared inner objects.`,
            r`import copy, time
big = [[i] * 100 for i in range(2000)]
t0 = time.perf_counter(); big.copy();               shallow_t = time.perf_counter() - t0
t0 = time.perf_counter(); copy.deepcopy(big);       deep_t = time.perf_counter() - t0
print("deepcopy slower:", deep_t > shallow_t)

# OUTPUT:
# deepcopy slower: True`],
        [`<b>Limitations:</b> deepcopy fails or misbehaves for objects holding resources (locks, sockets, open files); custom classes may need <code>__deepcopy__</code>.`,
            r`import copy, threading
try:
    copy.deepcopy({"lock": threading.Lock()})
except TypeError as e:
    print("TypeError:", e)

# OUTPUT:
# TypeError: cannot pickle '_thread.lock' object`],
        `
   original         shallow copy         deep copy
   ┌──────┐         ┌──────┐             ┌──────┐
   │ list │         │ list │             │ list │
   └─┬──┬─┘         └─┬──┬─┘             └─┬──┬─┘
     │  │             │  │                 │  │
     ▼  ▼             ▼  ▼                 ▼  ▼
    [A][B]  ◄────────shared────          [A'][B']  (new objects)
`,
        `Default to immutable data (tuples, frozen dataclasses, <code>MappingProxyType</code>) and copy-on-write instead of deepcopy. When snapshots are really needed, serialise (JSON/pickle) or use persistent data structures; deepcopy in hot paths is a performance smell.`
    ),
};
