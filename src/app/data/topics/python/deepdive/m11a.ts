// Module 11 (Iterators & Generators): deep dive entries.
import { dd, r, type DeepDive } from './deepDive';

export const m11a: Record<string, DeepDive> = {
    'Iterables vs Iterators': dd(
        [`An <b>iterable</b> is any object you can loop over (it has <code>__iter__</code>). An <b>iterator</b> is the object that actually produces values one at a time (it has <code>__next__</code>) and remembers its position. A <code>for</code> loop asks the iterable for a fresh iterator, then calls <code>next()</code> until <code>StopIteration</code>.`,
            r`nums = [10, 20, 30]          # a list is an ITERABLE (not an iterator)
it = iter(nums)               # ask the list for an ITERATOR

print(type(nums).__name__, type(it).__name__)
print(hasattr(nums, "__next__"), hasattr(it, "__next__"))   # only the iterator has __next__
print(next(it), next(it))     # the iterator remembers where it is

# OUTPUT:
# list list_iterator
# False True
# 10 20`],
        [`Separating "the data" from "the cursor over the data" lets many loops read the same collection independently, and lets a loop work on things that are not stored anywhere (files, sockets, infinite sequences).`,
            r`words = ["a", "b", "c"]
# Two independent cursors over ONE list - each loop gets its own iterator
for x in words:
    for y in words:
        if x < y:
            print(x + y, end=" ")
print()

# OUTPUT:
# ab ac bc`],
        [`Every <code>for</code> loop, <code>list()</code>, <code>sum()</code>, <code>in</code> test and unpacking uses this protocol. Files are iterators: reading a 50 GB log line by line works because only one line is in memory.`,
            r`import io
f = io.StringIO("line1\nline2\nline3\n")   # behaves like an open text file
print(iter(f) is f)                        # a file is its own iterator
for line in f:                             # reads lazily, one line per step
    print(line.strip().upper())

# OUTPUT:
# True
# LINE1
# LINE2
# LINE3`],
        [`<b>Advantages:</b> one uniform protocol for lists, dicts, files, DB cursors and generators; memory-light; any class can join in by defining two methods.`,
            r`class Countdown:
    """Custom iterable: works in for, list(), sum()."""
    def __init__(self, start):
        self.start = start
    def __iter__(self):                     # return a NEW iterator each time
        n = self.start
        while n > 0:
            yield n
            n -= 1

c = Countdown(3)
print(list(c), sum(c))     # reusable: each call gets a fresh iterator

# OUTPUT:
# [3, 2, 1] 6`],
        [`<b>Disadvantages:</b> an iterator is single-use. Once exhausted it stays empty, and the silent empty result is a classic bug.`,
            r`it = iter([1, 2, 3])
print(list(it))     # consumes everything
print(list(it))     # exhausted - silently empty, no error

# OUTPUT:
# [1, 2, 3]
# []`],
        [`<b>Limitations:</b> iterators cannot go backwards, have no <code>len()</code> or indexing, and cannot be copied cheaply (use <code>itertools.tee</code>).`,
            r`it = iter("abc")
try:
    len(it)
except TypeError as e:
    print("TypeError:", e)
try:
    it[0]
except TypeError as e:
    print("TypeError:", e)

# OUTPUT:
# TypeError: object of type 'str_iterator' has no len()
# TypeError: 'str_iterator' object is not subscriptable`],
        `
   Iterable (list)                 Iterator (cursor)
   ┌──────────────┐  iter()   ┌───────────────────┐
   │ 10  20  30   │ ────────► │ position = 0      │
   │ __iter__()   │           │ __next__() ─► 10  │
   └──────────────┘           │ __next__() ─► 20  │
                              │ __next__() ─► 30  │
                              │ __next__() ─► StopIteration
                              └───────────────────┘
   for x in obj:  =  it = iter(obj); loop { x = next(it) } until StopIteration
`,
        `Make containers iterables (a fresh iterator per <code>__iter__</code>) and keep iterators single-use. Do not return a bare iterator from an API that callers might loop twice; return a list/tuple or a re-iterable object. For streams, document that the result is one-shot.`
    ),

    'iter() & next()': dd(
        [`<code>iter(obj)</code> returns an iterator for an iterable. <code>next(it)</code> returns the next value, or raises <code>StopIteration</code> when finished. <code>next(it, default)</code> returns the default instead of raising. <code>iter(callable, sentinel)</code> calls a function repeatedly until it returns the sentinel.`,
            r`it = iter(["x", "y"])
print(next(it))             # x
print(next(it))             # y
print(next(it, "DONE"))     # default instead of StopIteration

# OUTPUT:
# x
# y
# DONE`],
        [`You need manual control when a plain <code>for</code> is not enough: peeking at the first item, pulling a header row then processing the rest, or pairing items.`,
            r`rows = iter(["id,name", "1,Ann", "2,Bob"])
header = next(rows).split(",")        # take the first row manually
for line in rows:                     # the loop continues with the REST
    print(dict(zip(header, line.split(","))))

# OUTPUT:
# {'id': '1', 'name': 'Ann'}
# {'id': '2', 'name': 'Bob'}`],
        [`Used in CSV/log readers (skip header), reading fixed-size blocks from a file or socket with the two-argument form, and writing parsers that look ahead.`,
            r`import io
stream = io.StringIO("abcdefg")
# iter(callable, sentinel): call read(3) until it returns "" (end of stream)
for chunk in iter(lambda: stream.read(3), ""):
    print(chunk)

# OUTPUT:
# abc
# def
# g`],
        [`<b>Advantages:</b> explicit control, a default value avoids exceptions, and the sentinel form turns "read until empty" loops into one clean for loop.`,
            r`def first_even(items):
    # next() over a generator expression = "find first match or default"
    return next((n for n in items if n % 2 == 0), None)

print(first_even([1, 3, 4, 6]), first_even([1, 3]))

# OUTPUT:
# 4 None`],
        [`<b>Disadvantages:</b> calling <code>next()</code> without a default on an empty/exhausted iterator raises <code>StopIteration</code>, which can leak out of generators.`,
            r`it = iter([])
try:
    next(it)
except StopIteration:
    print("StopIteration: nothing left")

# OUTPUT:
# StopIteration: nothing left`],
        [`<b>Limitations:</b> there is no "peek" or "previous"; reading with <code>next()</code> consumes the item, and a sentinel compare uses equality so a legitimate value equal to the sentinel ends the loop early.`,
            r`it = iter([1, 2, 3])
first = next(it)             # consumed - cannot be un-read
print(first, list(it))       # the loop would no longer see 1

# OUTPUT:
# 1 [2, 3]`],
        `
   it = iter(data)
        │
        ▼
   next(it) ──► value 1
   next(it) ──► value 2
   next(it) ──► StopIteration  ─── next(it, default) ──► default instead
   iter(f, sentinel):  call f() ─► value ─► ... until f() == sentinel
`,
        `Prefer <code>for</code> and <code>itertools</code> over hand-written <code>next()</code> loops; reserve manual <code>next()</code> for headers, lookahead and "first match" with a default. Never let <code>StopIteration</code> escape a generator body (PEP 479 turns it into RuntimeError).`
    ),

    'Generators & yield': dd(
        [`A <b>generator function</b> contains <code>yield</code>. Calling it does not run the body; it returns a generator object (an iterator). Each <code>next()</code> runs the body until the next <code>yield</code>, hands back the value and freezes the local state.`,
            r`def count_up(n):
    i = 1
    while i <= n:
        yield i          # pause here, hand i to the caller
        i += 1           # resume here on the next next()

g = count_up(3)
print(next(g), next(g), next(g))
print(list(count_up(4)))

# OUTPUT:
# 1 2 3
# [1, 2, 3, 4]`],
        [`Building a full list wastes memory and delays the first result. Generators produce values on demand and can represent infinite sequences with trivial code, without writing an iterator class by hand.`,
            r`def fib():
    a, b = 0, 1
    while True:          # infinite - fine, values are made on demand
        yield a
        a, b = b, a + b

from itertools import islice
print(list(islice(fib(), 10)))

# OUTPUT:
# [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]`],
        [`Streaming rows from a database, reading huge files, paginating API calls, tokenizers, and coroutine-style producers all use generators.`,
            r`def paginate(pages):
    """Pretend API: yield records page by page, never holding all pages."""
    for number, page in enumerate(pages, start=1):
        print(f"  [fetching page {number}]")
        yield from page

for record in paginate([["a", "b"], ["c"]]):
    print("got", record)

# OUTPUT:
#   [fetching page 1]
# got a
# got b
#   [fetching page 2]
# got c`],
        [`<b>Advantages:</b> tiny memory footprint, lazy start, readable sequential code instead of a state machine, and they can receive values via <code>send()</code>.`,
            r`import sys
big_list = [i for i in range(100_000)]
big_gen = (i for i in range(100_000))
print(sys.getsizeof(big_list) > 100_000, sys.getsizeof(big_gen) < 300)

# OUTPUT:
# True True`],
        [`<b>Disadvantages:</b> single pass only, harder to debug (state is hidden inside the frame), and exceptions surface late, at the consumer's <code>next()</code>, not where the generator was created.`,
            r`def gen():
    yield 1
    raise ValueError("bad data")     # not raised until consumed that far

g = gen()                            # no error yet
print(next(g))
try:
    next(g)
except ValueError as e:
    print("raised late:", e)

# OUTPUT:
# 1
# raised late: bad data`],
        [`<b>Limitations:</b> no <code>len()</code>, no indexing or rewinding, cannot be pickled, and a started generator cannot be restarted - you must create a new one.`,
            r`g = (n * n for n in range(3))
print(list(g))
print(list(g))          # already exhausted
try:
    len(g)
except TypeError as e:
    print("TypeError:", e)

# OUTPUT:
# [0, 1, 4]
# []
# TypeError: object of type 'generator' has no len()`],
        `
   caller                         generator frame
   ──────                         ───────────────
   g = gen()      ─────────────►  (created, not started)
   next(g)        ─────────────►  run ... yield 1   ┐ locals
                  ◄── 1 ────────  FROZEN             │ preserved
   next(g)        ─────────────►  resume ... yield 2 ┘
                  ◄── 2 ────────
   next(g)        ─────────────►  function ends ─► StopIteration
`,
        `Generators are the default tool for streaming and pipelines. Avoid them when the consumer needs random access, length, or multiple passes (materialise a list), or when resource lifetimes matter (an open file inside a generator stays open until it is exhausted or closed). Wrap with try/finally or a context manager.`
    ),

    'Generator Expressions': dd(
        [`A <b>generator expression</b> looks like a list comprehension but uses parentheses: <code>(x * x for x in data)</code>. It builds a lazy iterator instead of a list.`,
            r`squares = (n * n for n in range(5))      # nothing computed yet
print(type(squares).__name__)
print(list(squares))                      # values created now

# OUTPUT:
# generator
# [0, 1, 4, 9, 16]`],
        [`When you only need to feed values into <code>sum</code>, <code>max</code>, <code>any</code> or a loop, a list is wasted memory. A generator expression gives the same one-line clarity with constant memory.`,
            r`total = sum(n * n for n in range(1_000_000))   # no 1M-element list built
print(total)

# OUTPUT:
# 333332833333500000`],
        [`Common in aggregation and validation: <code>any()/all()</code> over rows, <code>max(key)</code> over records, joining strings, and file filtering.`,
            r`orders = [{"id": 1, "paid": True}, {"id": 2, "paid": False}]
print(all(o["paid"] for o in orders))                 # short-circuits
print(", ".join(str(o["id"]) for o in orders))        # join needs no list

# OUTPUT:
# False
# 1, 2`],
        [`<b>Advantages:</b> very concise, lazy, and <code>any</code>/<code>all</code> stop at the first decisive item.`,
            r`def check(n):
    print("checking", n)
    return n > 1

print(any(check(n) for n in [1, 2, 3]))   # stops after 2

# OUTPUT:
# checking 1
# checking 2
# True`],
        [`<b>Disadvantages:</b> single-use and invisible: printing one shows only an address; complex logic becomes unreadable compared with a normal generator function.`,
            r`g = (x for x in "ab")
print(g)                 # not the data
print(list(g), list(g))  # second use is empty

# OUTPUT (address varies):
# <generator object <genexpr> at 0x000001F2A3B4C5D0>
# ['a', 'b'] []`],
        [`<b>Limitations:</b> an expression only - no statements, no try/except, no multiple yields. Also the outermost iterable is evaluated immediately while the rest is lazy, so later changes to variables can surprise you.`,
            r`k = 10
g = (n + k for n in range(3))   # 'k' is looked up when consumed, not now
k = 100
print(list(g))

# OUTPUT:
# [100, 101, 102]`],
        `
   [ x*x for x in data ]   ──► builds whole list in memory ──► [..]
   ( x*x for x in data )   ──► generator object (tiny)
                                   │ next()
                                   ▼
                              one value at a time ──► sum / max / for
`,
        `Use a genexp as the sole argument of reducers (<code>sum(...)</code>) and prefer a list comprehension when you will iterate more than once or need <code>len</code>. If the body needs a comment or a try block, write a named generator function.`
    ),

    'Lazy Evaluation': dd(
        [`<b>Lazy evaluation</b> means a value is computed only when it is needed, not when it is described. Generators, <code>range</code>, <code>map</code>, <code>filter</code>, <code>zip</code> and file iterators are lazy. Lists and list comprehensions are eager.`,
            r`def noisy(n):
    print("computing", n)
    return n * 2

lazy = map(noisy, [1, 2, 3])      # nothing printed yet
print("map created")
print(next(lazy))                 # work happens now, for one item only

# OUTPUT:
# map created
# computing 1
# 2`],
        [`Eager code does all the work up front, even for results nobody uses, and can exhaust memory. Lazy code spends effort only on what is consumed and can stop early.`,
            r`import itertools
def source():
    for i in itertools.count(1):          # infinite
        yield i

evens = (n for n in source() if n % 2 == 0)
print(list(itertools.islice(evens, 3)))   # take only 3, then stop

# OUTPUT:
# [2, 4, 6]`],
        [`Searching a huge log for the first error, processing a stream of events, paging DB rows, and chaining transformations (ETL) without temp files.`,
            r`log = iter(["ok", "ok", "ERROR disk", "ok", "ERROR net"])
first_error = next((l for l in log if l.startswith("ERROR")), None)
print(first_error)
print(list(log))           # only the unread remainder is left

# OUTPUT:
# ERROR disk
# ['ok', 'ERROR net']`],
        [`<b>Advantages:</b> low memory, early exit, handles unbounded data, and the first result arrives immediately.`,
            r`import time
def slow():
    for i in range(3):
        time.sleep(0.1)
        yield i

t = time.perf_counter()
first = next(slow())                       # only 1 item paid for
print(first, round(time.perf_counter() - t, 1))

# OUTPUT (example):
# 0 0.1`],
        [`<b>Disadvantages:</b> side effects and errors are delayed, which makes order of execution and debugging confusing; results cannot be reused without caching.`,
            r`lazy = (10 // d for d in [1, 0])   # the ZeroDivisionError is hidden...
print("built fine")
try:
    list(lazy)                         # ...until consumed
except ZeroDivisionError:
    print("error appears only now")

# OUTPUT:
# built fine
# error appears only now`],
        [`<b>Limitations:</b> a lazy object depends on its source staying valid. If the underlying file is closed or the list changes, it fails or returns different data than at creation time.`,
            r`data = [1, 2, 3]
lazy = (x * 2 for x in data)   # outer iterable 'data' is captured by reference
data.append(4)                 # mutate before consuming
print(list(lazy))

# OUTPUT:
# [2, 4, 6, 8]`],
        `
   EAGER:  source ─► [ all items computed ] ─► consumer
                         memory = N
   LAZY :  source ─► item ─► consumer ─┐
              ▲                        │ asks for next
              └────────────────────────┘
                         memory = 1
`,
        `Be lazy at the pipeline edges (I/O, large data) and eager at boundaries where you need snapshots, retries or multiple passes. Materialise results before closing resources, and keep side effects out of lazy stages, otherwise ordering bugs appear.`
    ),

    'yield from': dd(
        [`<code>yield from sub</code> delegates to another iterable or generator: every value of <code>sub</code> is yielded to the caller, and the sub-generator's <code>return</code> value becomes the value of the <code>yield from</code> expression.`,
            r`def inner():
    yield 1
    yield 2

def outer():
    yield 0
    yield from inner()     # same as: for x in inner(): yield x
    yield 3

print(list(outer()))

# OUTPUT:
# [0, 1, 2, 3]`],
        [`Without it you write manual loops, and you lose <code>send()</code>/<code>throw()</code> forwarding and the sub-generator's return value. It makes composing and refactoring generators simple.`,
            r`def worker():
    yield "step"
    return "result"             # return value of a generator

def manager():
    value = yield from worker() # captures the return value
    print("worker returned:", value)

print(list(manager()))

# OUTPUT:
# worker returned: result
# ['step']`],
        [`Flattening nested structures, walking trees recursively (directory or AST traversal), and composing parsers.`,
            r`def walk(tree):
    for node in tree:
        if isinstance(node, list):
            yield from walk(node)     # recurse into sub-lists
        else:
            yield node

print(list(walk([1, [2, [3, 4]], 5])))

# OUTPUT:
# [1, 2, 3, 4, 5]`],
        [`<b>Advantages:</b> shorter and faster than a manual loop, forwards <code>send/throw/close</code> automatically, and returns a value from sub-generators.`,
            r`def acc():
    total = 0
    while True:
        x = yield total      # receives values via send()
        total += x

def wrapper():
    yield from acc()         # send() passes straight through

w = wrapper()
next(w)                      # prime
print(w.send(5), w.send(10))

# OUTPUT:
# 5 15`],
        [`<b>Disadvantages:</b> new readers may not know the semantics; deep recursion with <code>yield from</code> adds one delegation layer per level, costing time.`,
            r`def deep(n):
    if n == 0:
        yield "bottom"
    else:
        yield from deep(n - 1)    # each value passes through n layers

print(list(deep(500)))

# OUTPUT:
# ['bottom']`],
        [`<b>Limitations:</b> works only inside a generator function; recursion depth is still bounded by the interpreter limit (default about 1000).`,
            r`import sys
def deep(n):
    if n == 0:
        yield 0
    else:
        yield from deep(n - 1)

try:
    list(deep(sys.getrecursionlimit() + 10))
except RecursionError:
    print("RecursionError: too deep")

# OUTPUT:
# RecursionError: too deep`],
        `
   caller ◄──────────────── values ◄──────────── inner()
     │                                              ▲
     └─ outer():  yield from inner()  ──────────────┘
                  (send/throw forwarded, return value captured)
`,
        `Use <code>yield from</code> for composition and tree walks, but for very deep trees use an explicit stack to avoid recursion limits. Prefer <code>async</code>/<code>await</code> over generator-based coroutines for concurrency in modern code.`
    ),

    'Generator Pipelines': dd(
        [`A <b>generator pipeline</b> chains small generators so each stage pulls from the previous one: read, filter, transform, aggregate. Data flows one item at a time through all stages, like a Unix pipe.`,
            r`def read(lines):
    for l in lines:
        yield l.strip()

def only_errors(lines):
    for l in lines:
        if l.startswith("ERROR"):
            yield l

def upper(lines):
    for l in lines:
        yield l.upper()

raw = ["ok  ", "ERROR a", "ok", "ERROR b "]
print(list(upper(only_errors(read(raw)))))

# OUTPUT:
# ['ERROR A', 'ERROR B']`],
        [`Real data jobs are multi-step. Pipelines keep every step small and testable, use constant memory, and let you add, remove or reorder stages without touching the others.`,
            r`def numbers():
    for n in range(1, 8):
        yield n
def evens(it):
    return (n for n in it if n % 2 == 0)
def squared(it):
    return (n * n for n in it)

print(sum(squared(evens(numbers()))))   # 4 + 16 + 36

# OUTPUT:
# 56`],
        [`Log analysis, ETL jobs, CSV/JSON-lines processing, web-scraping crawlers and ML data loaders all stream records through stages.`,
            r`import io, csv
data = io.StringIO("name,age\nAnn,31\nBob,17\nCy,45\n")

def rows(f):
    yield from csv.DictReader(f)
def adults(rs):
    return (r for r in rs if int(r["age"]) >= 18)
def names(rs):
    return (r["name"] for r in rs)

print(list(names(adults(rows(data)))))

# OUTPUT:
# ['Ann', 'Cy']`],
        [`<b>Advantages:</b> constant memory, modular stages, early termination propagates backwards, and processing starts before input is fully read.`,
            r`from itertools import islice
def trace(name, it):
    for x in it:
        print(" ", name, x)
        yield x

pipe = trace("B", (x * 2 for x in trace("A", range(10))))
print(list(islice(pipe, 2)))     # only 2 items ever pulled from the source

# OUTPUT:
#   A 0
#   B 0
#   A 1
#   B 2
# [0, 2]`],
        [`<b>Disadvantages:</b> one pass only, stack traces are deep and confusing, and a bug in an early stage surfaces at the final consumer.`,
            r`def parse(items):
    for s in items:
        yield int(s)          # fails on bad input, but only when consumed

pipe = parse(["1", "x"])      # created OK
try:
    print(list(pipe))
except ValueError as e:
    print("ValueError:", e)

# OUTPUT:
# ValueError: invalid literal for int() with base 10: 'x'`],
        [`<b>Limitations:</b> stages are sequential and run in one thread, so a slow stage blocks everything. Stages that need all data (sorting, group-by) force the whole stream into memory.`,
            r`stream = (n for n in [3, 1, 2])
ordered = sorted(stream)      # sorting must consume EVERYTHING first
print(ordered)

# OUTPUT:
# [1, 2, 3]`],
        `
   source ──► read ──► filter ──► transform ──► sink
   (file)    gen 1     gen 2       gen 3        sum()/write
      ◄───── each next() pulls one item through every stage ─────
   memory held: one item per stage, not the whole dataset
`,
        `Pipelines suit streaming, I/O-bound transforms. When CPU is the limit use multiprocessing or a framework (Spark, Beam); when stages must run concurrently, use queues or asyncio. Always close resources deterministically, for example with <code>with</code> around the source generator.`
    ),
};
