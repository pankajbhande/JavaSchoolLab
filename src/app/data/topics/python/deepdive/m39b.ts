// Module 39 (Performance Optimization), part B: caching, laziness, databases, concurrency, diagnosis.
import { dd, r, type DeepDive } from './deepDive';

export const m39b: Record<string, DeepDive> = {
    'Caching & Memoization': dd(
        [`<b>Memoization</b> stores the result of a pure function for given arguments, so repeated calls return instantly. <code>functools.lru_cache</code> and <code>functools.cache</code> do it with one decorator.`,
            r`from functools import lru_cache

@lru_cache(maxsize=None)            # same as functools.cache
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)

print(fib(30))
print(fib.cache_info())             # hits, misses, size

# OUTPUT:
# 832040
# CacheInfo(hits=28, misses=31, maxsize=None, currsize=31)`],
        [`Naive recursion and repeated expensive calls (API requests, database reads, parsing) redo identical work. Caching turns exponential or repeated cost into a single computation.`,
            r`calls = 0
def fib_slow(n):
    global calls
    calls += 1
    return n if n < 2 else fib_slow(n - 1) + fib_slow(n - 2)

fib_slow(25)
print("calls without cache:", calls)    # grows exponentially

# OUTPUT:
# calls without cache: 242785`],
        [`Caching config lookups, DNS or exchange-rate calls with an expiry, rendered templates, ORM query results, and expensive ML feature computations. Web layers use Redis or Memcached for shared caches.`,
            r`import time

_cache = {}
def get_rate(cur, ttl=60):
    """Tiny TTL cache: reuse a value for ttl seconds."""
    now = time.monotonic()
    hit = _cache.get(cur)
    if hit and now - hit[1] < ttl:
        return hit[0]                         # fresh: skip the slow call
    value = 83.1                              # stands in for a slow HTTP request
    _cache[cur] = (value, now)
    return value

print(get_rate("USD"), get_rate("USD"), len(_cache))

# OUTPUT:
# 83.1 83.1 1`],
        [`<b>Advantages:</b> dramatic speedups for repeated work, trivial to add, and thread-safe in the standard library implementation.`,
            r`from functools import cache
import time

@cache
def slow_square(x):
    time.sleep(0.2)                  # pretend this is expensive
    return x * x

t0 = time.perf_counter(); slow_square(9); first = time.perf_counter() - t0
t0 = time.perf_counter(); slow_square(9); second = time.perf_counter() - t0
print(first > 0.15, second < 0.001)

# OUTPUT:
# True True`],
        [`<b>Disadvantages:</b> uses memory, stale data if the source changes, and unbounded caches leak. It only suits pure functions with hashable arguments.`,
            r`from functools import lru_cache

@lru_cache(maxsize=2)                # bounded: evicts least recently used
def f(x): return x * 10

f(1); f(2); f(3)                     # inserting 3 evicts key 1
print(f.cache_info().currsize)
try:
    f([1, 2])                        # lists are unhashable
except TypeError as e:
    print("TypeError:", e)

# OUTPUT:
# 2
# TypeError: unhashable type: 'list'`],
        [`<b>Limitations:</b> per-process only (each worker has its own copy), the cache is cleared on restart, and caching methods keeps instances alive. Cache invalidation is the hard problem.`,
            r`from functools import lru_cache

class Report:
    @lru_cache(maxsize=None)         # PROBLEM: cache holds a strong reference to self
    def total(self): return 42

r1 = Report(); r1.total()
print(Report.total.cache_info().currsize)    # r1 can never be garbage collected
Report.total.cache_clear()
print(Report.total.cache_info().currsize)

# OUTPUT:
# 1
# 0`],
        `
   call f(x) --> [ cache lookup ]
                    |hit ---------------------------> return stored value (fast)
                    |miss
                    v
                 compute f(x) --> store (evict LRU if full) --> return
   shared cache:  worker A \
                  worker B  >--> Redis / Memcached (TTL, invalidation)
                  worker C /
`,
        `Cache only what is pure, expensive and read-heavy, and always bound the size and set a TTL. Decide the invalidation strategy up front (TTL, event-based, versioned keys), watch hit ratio as a metric, and use an external cache when many processes must share results. Do not cache to hide an inefficient algorithm that should simply be fixed.`
    ),

    'Lazy Evaluation for Performance': dd(
        [`<b>Lazy evaluation</b> computes values only when needed. Generators, iterators, <code>range</code>, <code>map</code>, <code>filter</code> and <code>itertools</code> produce items one at a time instead of building full lists.`,
            r`def squares(n):
    for i in range(n):
        yield i * i               # produced on demand, one at a time

g = squares(5)
print(next(g), next(g), next(g))  # only 3 values were computed
print(list(g))                    # the remaining ones

# OUTPUT:
# 0 1 4
# [9, 16]`],
        [`Building a big list allocates all memory up front and does all the work even if you need only the first few items. Lazy pipelines use constant memory and can stop early.`,
            r`import sys

eager = [i * i for i in range(1_000_000)]
lazy  = (i * i for i in range(1_000_000))
print(sys.getsizeof(eager) > 8_000_000)     # megabytes of pointers (plus int objects)
print(sys.getsizeof(lazy) < 300)            # a generator is a few hundred bytes

# OUTPUT:
# True
# True`],
        [`Reading multi-gigabyte log files line by line, streaming database rows, early exit on the first match, infinite sequences and pipelines of transformations.`,
            r`from itertools import islice

def read_lines():                    # imagine a 50 GB file: only needed lines are read
    n = 0
    while True:                      # infinite stream
        n += 1
        yield f"line {n}: " + ("ERROR" if n % 4 == 0 else "ok")

errors = (l for l in read_lines() if "ERROR" in l)    # lazy filter
print(list(islice(errors, 2)))                        # stop after 2 matches

# OUTPUT:
# ['line 4: ERROR', 'line 8: ERROR']`],
        [`<b>Advantages:</b> constant memory, early termination, faster time to first result, and composable pipelines.`,
            r`def is_prime(n): return n > 1 and all(n % d for d in range(2, int(n ** 0.5) + 1))

# any() stops at the first True: it never tests the rest
nums = range(10, 10_000_000)
print(any(is_prime(n) for n in nums))     # returns after checking 10, 11

# OUTPUT:
# True`],
        [`<b>Disadvantages:</b> generators are one-shot (cannot rewind or index), debugging is harder because work happens later, and exceptions surface at consumption time.`,
            r`g = (x * 2 for x in range(3))
print(list(g))
print(list(g))              # exhausted: silently empty
try:
    g[0]
except TypeError as e:
    print("TypeError:", e)

# OUTPUT:
# [0, 2, 4]
# []
# TypeError: 'generator' object is not subscriptable`],
        [`<b>Limitations:</b> no <code>len()</code>, no random access, per-item generator overhead is slower than a list comprehension when you need every element anyway, and sorting or grouping forces full materialization.`,
            r`import timeit
data = range(1000)

lst = timeit.timeit("sum([x for x in data])", globals={"data": data}, number=2000)
gen = timeit.timeit("sum(x for x in data)",   globals={"data": data}, number=2000)
print("list comp usually faster for full consumption:", lst < gen * 1.5)

# OUTPUT (varies):
# list comp usually faster for full consumption: True`],
        `
   EAGER:  source --> [ list of ALL items ] --> consume       memory = O(n)

   LAZY:   source --> item --> filter --> map --> consumer    memory = O(1)
                      one item flows through the whole pipeline at a time
                      consumer stops early  ==>  producer stops too
`,
        `Prefer lazy pipelines for streams and data larger than memory, and materialize deliberately (list, sorted) when you need reuse, length or random access. Use itertools and generator functions to keep pipelines declarative, and remember that lazy code defers errors and side effects, so close resources with context managers around the consumption.`
    ),

    'Database Optimization': dd(
        [`Most application slowness is in the database. Key tools: <b>indexes</b>, selecting only needed columns, <b>batching</b> writes, avoiding N+1 queries, connection pooling and reading query plans with <code>EXPLAIN</code>.`,
            r`import sqlite3

con = sqlite3.connect(":memory:")
con.execute("CREATE TABLE users (id INTEGER PRIMARY KEY, email TEXT, age INTEGER)")
con.executemany("INSERT INTO users (email, age) VALUES (?, ?)",
                [(f"user{i}@x.com", 20 + i % 40) for i in range(10_000)])   # batch insert
con.commit()
print(con.execute("SELECT COUNT(*) FROM users").fetchone()[0])

# OUTPUT:
# 10000`],
        [`Without an index the database scans every row for each lookup (O(n)). With an index it uses a B-tree (O(log n)). The difference grows with table size.`,
            r`import sqlite3
con = sqlite3.connect(":memory:")
con.execute("CREATE TABLE users (id INTEGER PRIMARY KEY, email TEXT)")
con.executemany("INSERT INTO users (email) VALUES (?)", [(f"u{i}@x.com",) for i in range(1000)])

q = "EXPLAIN QUERY PLAN SELECT * FROM users WHERE email = 'u5@x.com'"
print(con.execute(q).fetchone()[3])                 # before the index
con.execute("CREATE INDEX idx_email ON users(email)")
print(con.execute(q).fetchone()[3])                 # after the index

# OUTPUT (wording varies slightly by SQLite version):
# SCAN users
# SEARCH users USING COVERING INDEX idx_email (email=?)`],
        [`Fixing slow list pages, reports and APIs: add the right index, fetch related rows with a JOIN instead of N+1 queries, paginate, and cache hot reads.`,
            r`import sqlite3
con = sqlite3.connect(":memory:")
con.executescript("""
CREATE TABLE authors (id INTEGER PRIMARY KEY, name TEXT);
CREATE TABLE books (id INTEGER PRIMARY KEY, author_id INTEGER, title TEXT);
INSERT INTO authors VALUES (1,'Ann'),(2,'Raj');
INSERT INTO books VALUES (1,1,'A1'),(2,1,'A2'),(3,2,'R1');
""")
# N+1 pattern: 1 query for authors + 1 per author (3 round trips here)
# Fix: one JOIN query
rows = con.execute("""SELECT a.name, COUNT(b.id) FROM authors a
                      JOIN books b ON b.author_id = a.id GROUP BY a.id""").fetchall()
print(rows)

# OUTPUT:
# [('Ann', 2), ('Raj', 1)]`],
        [`<b>Advantages:</b> orders-of-magnitude speedups, lower load on the whole system, and improvements that every service using the database benefits from.`,
            r`import sqlite3, time
con = sqlite3.connect(":memory:")
con.execute("CREATE TABLE t (id INTEGER PRIMARY KEY, v INTEGER)")
rows = [(i,) for i in range(20_000)]

t0 = time.perf_counter()
for row in rows:                                     # one statement per row
    con.execute("INSERT INTO t (v) VALUES (?)", row)
one_by_one = time.perf_counter() - t0
con.execute("DELETE FROM t")
t0 = time.perf_counter()
con.executemany("INSERT INTO t (v) VALUES (?)", rows)   # batched
batched = time.perf_counter() - t0
print("executemany is faster:", batched < one_by_one)

# OUTPUT (varies):
# executemany is faster: True`],
        [`<b>Disadvantages:</b> every index slows writes and uses disk, over-indexing hurts, and optimizer behaviour changes as data grows, so a good plan today can regress.`,
            r`import sqlite3
con = sqlite3.connect(":memory:")
con.execute("CREATE TABLE t (a INT, b INT, c INT)")
for col in "abc":
    con.execute(f"CREATE INDEX i_{col} ON t({col})")     # 3 indexes: every INSERT updates 3 B-trees
n = con.execute("SELECT COUNT(*) FROM sqlite_master WHERE type='index'").fetchone()[0]
print(n, "indexes to maintain on every write")

# OUTPUT:
# 3 indexes to maintain on every write`],
        [`<b>Limitations:</b> an index is ignored when the query wraps the column in a function or uses a leading wildcard, and Python-side filtering cannot use database indexes.`,
            r`import sqlite3
con = sqlite3.connect(":memory:")
con.execute("CREATE TABLE u (email TEXT)")
con.execute("CREATE INDEX i ON u(email)")
plan = lambda sql: con.execute("EXPLAIN QUERY PLAN " + sql).fetchone()[3]
print(plan("SELECT * FROM u WHERE email = 'a'"))
print(plan("SELECT * FROM u WHERE lower(email) = 'a'"))     # function defeats the index

# OUTPUT (wording varies by SQLite version):
# SEARCH u USING COVERING INDEX i (email=?)
# SCAN u`],
        `
   query --> parse --> OPTIMIZER --> plan --+-- index lookup  O(log n)   fast
                          ^                 '-- full scan     O(n)       slow
                          |
        statistics, indexes, EXPLAIN shows the chosen plan
   app side: pool connections | batch writes | JOIN not N+1 | paginate | cache
`,
        `Read EXPLAIN (ANALYZE) before and after every change, index for your real WHERE, JOIN and ORDER BY patterns (composite indexes: equality columns first), and keep transactions short. Fix N+1 with eager loading in the ORM. When one database is the bottleneck, add read replicas, caching, partitioning or CQRS before reaching for a different technology.`
    ),

    'Async I/O for Performance': dd(
        [`<code>asyncio</code> runs many I/O-bound tasks concurrently on one thread. While one task waits for the network or disk, the event loop runs another, so waits overlap.`,
            r`import asyncio, time

async def fetch(name, delay):
    await asyncio.sleep(delay)          # stands in for a network call
    return f"{name} done"

async def main():
    t0 = time.perf_counter()
    results = await asyncio.gather(fetch("A", 1), fetch("B", 1), fetch("C", 1))
    print(results, round(time.perf_counter() - t0, 1), "s")

asyncio.run(main())

# OUTPUT:
# ['A done', 'B done', 'C done'] 1.0 s`],
        [`Sequential I/O wastes time waiting: three 1-second requests take 3 seconds one after another but about 1 second together.`,
            r`import asyncio, time

async def call(): await asyncio.sleep(0.5)

async def sequential():
    for _ in range(3): await call()          # waits add up

async def concurrent():
    await asyncio.gather(*(call() for _ in range(3)))   # waits overlap

for fn in (sequential, concurrent):
    t0 = time.perf_counter(); asyncio.run(fn())
    print(fn.__name__, round(time.perf_counter() - t0, 1), "s")

# OUTPUT:
# sequential 1.5 s
# concurrent 0.5 s`],
        [`Web scrapers, API gateways, chat servers, microservice clients and anything calling many external services (FastAPI, aiohttp, httpx, asyncpg).`,
            r`import asyncio, httpx                       # pip install httpx

async def get(client, url):
    r = await client.get(url, timeout=10)
    return r.status_code

async def main():
    urls = ["https://example.com"] * 5
    async with httpx.AsyncClient() as client:        # one pooled connection set
        codes = await asyncio.gather(*(get(client, u) for u in urls))
    print(codes)

asyncio.run(main())

# OUTPUT (example, needs network):
# [200, 200, 200, 200, 200]`],
        [`<b>Advantages:</b> thousands of concurrent connections with tiny memory per task, no thread locking issues, and explicit await points make switching visible.`,
            r`import asyncio

async def worker(i, sem):
    async with sem:                       # limit concurrency (e.g. 3 at once)
        await asyncio.sleep(0.1)
        return i

async def main():
    sem = asyncio.Semaphore(3)
    out = await asyncio.gather(*(worker(i, sem) for i in range(10)))
    print(out)

asyncio.run(main())

# OUTPUT:
# [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]`],
        [`<b>Disadvantages:</b> "async all the way" spreads through the codebase, you need async-compatible libraries, and one blocking call freezes every task.`,
            r`import asyncio, time

async def bad():
    time.sleep(1)                    # BLOCKS the whole event loop
async def good():
    await asyncio.sleep(1)           # yields control

async def main():
    t0 = time.perf_counter()
    await asyncio.gather(bad(), bad())
    print("with time.sleep:", round(time.perf_counter() - t0), "s")   # serial, 2 s
    t0 = time.perf_counter()
    await asyncio.gather(good(), good())
    print("with asyncio.sleep:", round(time.perf_counter() - t0), "s")

asyncio.run(main())

# OUTPUT:
# with time.sleep: 2 s
# with asyncio.sleep: 1 s`],
        [`<b>Limitations:</b> no speedup for CPU-bound work (single thread), and blocking libraries must be pushed to a thread with <code>asyncio.to_thread</code>.`,
            r`import asyncio, time

def blocking_io():
    time.sleep(1)                    # a legacy blocking function
    return "done"

async def main():
    t0 = time.perf_counter()
    r = await asyncio.gather(asyncio.to_thread(blocking_io), asyncio.to_thread(blocking_io))
    print(r, round(time.perf_counter() - t0), "s")   # threads let the loop stay free

asyncio.run(main())

# OUTPUT:
# ['done', 'done'] 1 s`],
        `
   one thread, one event loop
        task A: send req -----(waiting)-----------------> resume
        task B:       send req -----(waiting)------------> resume
        task C:            send req ----(waiting)-------> resume
   loop:   |A| |B| |C| ........ idle ........ |A||B||C|
   total time ~= the longest wait, not the sum   (I/O-bound only)
`,
        `Use asyncio when you juggle many slow I/O waits; use threads for blocking libraries, processes for CPU work. Bound concurrency with semaphores, set timeouts everywhere, handle cancellation, and never call blocking code in a coroutine. Do not rewrite a small synchronous service to async unless profiling shows connection-wait is the bottleneck.`
    ),

    'Multiprocessing for Performance': dd(
        [`<code>multiprocessing</code> and <code>concurrent.futures.ProcessPoolExecutor</code> run Python code in separate processes, each with its own interpreter and GIL, so CPU-bound work uses multiple cores.`,
            r`from concurrent.futures import ProcessPoolExecutor

def heavy(n):
    return sum(i * i for i in range(n))

if __name__ == "__main__":            # REQUIRED on Windows/macOS (spawn start method)
    with ProcessPoolExecutor() as pool:
        results = list(pool.map(heavy, [10, 100, 1000]))
    print(results)

# OUTPUT:
# [285, 328350, 332833500]`],
        [`The GIL lets only one thread run Python bytecode at a time, so threads cannot speed up CPU-bound loops. Processes sidestep it.`,
            r`import time
from concurrent.futures import ProcessPoolExecutor, ThreadPoolExecutor

def cpu(n): return sum(i * i for i in range(n))

def timed(Executor):
    t0 = time.perf_counter()
    with Executor(max_workers=4) as ex:
        list(ex.map(cpu, [3_000_000] * 4))
    return time.perf_counter() - t0

if __name__ == "__main__":
    t_thr, t_proc = timed(ThreadPoolExecutor), timed(ProcessPoolExecutor)
    print("processes faster than threads on 4+ cores:", t_proc < t_thr)

# OUTPUT (needs 2+ cores; times vary):
# processes faster than threads on 4+ cores: True`],
        [`Image and video processing, simulations, parsing many files, feature extraction, batch scoring and data pipelines that crunch numbers.`,
            r`from multiprocessing import Pool
import os

def square(x): return x * x

if __name__ == "__main__":
    with Pool(processes=4) as pool:
        out = pool.map(square, range(8), chunksize=2)   # chunksize cuts IPC overhead
    print(out)

# OUTPUT:
# [0, 1, 4, 9, 16, 25, 36, 49]`],
        [`<b>Advantages:</b> true parallelism on all cores, isolation (a crash in a worker does not kill the parent), and a simple map-style API.`,
            r`from concurrent.futures import ProcessPoolExecutor, as_completed

def risky(n):
    if n == 3: raise ValueError("bad input")
    return n * 10

if __name__ == "__main__":
    with ProcessPoolExecutor(2) as ex:
        futs = {ex.submit(risky, n): n for n in range(5)}
        for f in as_completed(futs):
            try: f.result()
            except ValueError as e: print("task", futs[f], "failed:", e)

# OUTPUT:
# task 3 failed: bad input`],
        [`<b>Disadvantages:</b> start-up cost, high memory (one interpreter per process), and arguments and results must be pickled and copied between processes.`,
            r`import pickle

big = list(range(1_000_000))
payload = pickle.dumps(big)               # what gets copied to a worker
print(len(payload) > 3_000_000, "bytes serialized per task")

# OUTPUT:
# True bytes serialized per task`],
        [`<b>Limitations:</b> only picklable objects can be sent (no lambdas or open files), shared mutable state needs <code>shared_memory</code> or queues, and tiny tasks run slower than serial code.`,
            r`import pickle

try:
    pickle.dumps(lambda x: x)             # a ProcessPool would fail the same way
except Exception as e:
    print(type(e).__name__)

# OUTPUT:
# PicklingError`],
        `
   parent process
     |-- pickle task --> [ worker 1 | own GIL | core 1 ] --result--+
     |-- pickle task --> [ worker 2 | own GIL | core 2 ] --result--+--> parent
     '-- pickle task --> [ worker 3 | own GIL | core 3 ] --result--+
   cost: spawn + serialize in/out;   win: N cores in parallel
`,
        `Use processes for coarse-grained CPU-bound tasks and make the unit of work large enough to amortize pickling. Prefer NumPy, Numba or Rust extensions that release the GIL when possible, and use shared_memory or memory-mapped files for big arrays. For distribution beyond one machine, use Celery, Dask or Ray. Free-threaded Python (3.13+) is evolving but check library support before relying on it.`
    ),

    'Why Is This Python Code Slow?': dd(
        [`A diagnostic checklist for slow Python: wrong algorithm or data structure, work repeated inside loops, I/O waiting, Python-level loops over numeric data, excessive object creation, and hidden quadratic behaviour.`,
            r`import timeit

# Classic: string concatenation in a loop vs join
def concat(n):
    s = ""
    for i in range(n): s += str(i)
    return s
def joined(n):
    return "".join(str(i) for i in range(n))

print(concat(10) == joined(10))
print("join is the idiomatic, scalable choice")

# OUTPUT:
# True
# join is the idiomatic, scalable choice`],
        [`Guessing leads to wasted effort. A structured approach (measure, classify as CPU, memory, I/O or algorithm, then fix the dominant cause) finds problems faster.`,
            r`# Step 1: is it CPU-bound or waiting? Compare CPU time with wall time.
import time
t_wall, t_cpu = time.perf_counter(), time.process_time()
time.sleep(0.5)                                  # I/O-like wait
wall = time.perf_counter() - t_wall
cpu  = time.process_time() - t_cpu
print("waiting, not computing:", wall > 0.4 and cpu < 0.1)

# OUTPUT:
# waiting, not computing: True`],
        [`Typical real culprits: list membership in a loop, repeated regex compilation, building DataFrames row by row, N+1 queries, reading a file character by character, and accidental copies of large objects.`,
            r`import re

lines = ["id=%d" % i for i in range(5)]

# Slow: compiles/looks up pattern each time via re.match with a string pattern
# (re caches, but explicit compile is clearer and skips cache lookups)
pat = re.compile(r"id=(\d+)")
print([int(pat.match(l).group(1)) for l in lines])

# OUTPUT:
# [0, 1, 2, 3, 4]`],
        [`<b>Advantages of the method:</b> each cause has a known fix, and most fixes are small edits (set instead of list, join, comprehension, caching, a batch call).`,
            r`# Hidden quadratic: "x in list" inside a loop
import timeit
big = list(range(5000)); lookups = list(range(0, 5000, 5))

def slow(): return [x for x in lookups if x in big]          # O(n*m)
bigset = set(big)
def fast(): return [x for x in lookups if x in bigset]       # O(n+m)

print(slow() == fast(), timeit.timeit(slow, number=5) > timeit.timeit(fast, number=5))

# OUTPUT (varies):
# True True`],
        [`<b>Disadvantages:</b> several causes can overlap, fixing the biggest one reveals the next, and micro-fixes may reduce clarity.`,
            r`# Optimizing the wrong thing: both lines are fast, the loop around them is the cost
import time
def f():
    total = 0
    for i in range(2_000_000):
        total += i              # a Python-level loop: ~1/50th the speed of sum(range())
    return total

t0 = time.perf_counter(); f(); loop = time.perf_counter() - t0
t0 = time.perf_counter(); sum(range(2_000_000)); builtin = time.perf_counter() - t0
print("builtin much faster:", builtin * 3 < loop)

# OUTPUT (varies):
# builtin much faster: True`],
        [`<b>Limitations:</b> pure Python has a performance ceiling (interpreter overhead, GIL, boxed objects). Past it you need NumPy, Numba, Cython, PyPy, Rust or a different architecture.`,
            r`import numpy as np, time

N = 2_000_000
t0 = time.perf_counter(); s1 = sum(i * i for i in range(N)); py = time.perf_counter() - t0
a = np.arange(N, dtype=np.int64)
t0 = time.perf_counter(); s2 = int((a * a).sum()); npy = time.perf_counter() - t0
print(s1 == s2, "numpy faster:", npy < py)

# OUTPUT (varies):
# True numpy faster: True`],
        `
   slow?
     |-- measure (cProfile / py-spy) ------------------------------+
     |                                                             v
     |   CPU-bound?  --> better algorithm -> vectorize -> C / Numba / multiprocessing
     |   I/O-bound?  --> batch, cache, async, indexes, pooling
     |   memory?     --> generators, slots, compact dtypes, chunking
     '-- fix biggest cost, re-measure, repeat until target met
`,
        `Make the diagnosis order a team habit: define the target (p95 latency, throughput, cost), profile on realistic data, fix the dominant cost, re-measure and stop. Architectural levers (caching layers, queues, batching, moving hot paths to compiled code or a database) usually outweigh syntax tricks. Keep performance tests in CI so regressions are caught before release.`
    )
};
