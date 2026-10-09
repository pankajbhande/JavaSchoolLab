// Module 24 (Async Python), part B: async generators, context managers, cancellation, semaphores.
import { dd, r, type DeepDive } from './deepDive';

export const m24b: Record<string, DeepDive> = {
    'Async Generators': dd(
        [`An <b>async generator</b> is an <code>async def</code> function that uses <code>yield</code>. You consume it with <code>async for</code>; between items it may <code>await</code>, so values can arrive over time (pages, messages, stream chunks).`,
            r`import asyncio

async def countdown(n):
    while n > 0:
        await asyncio.sleep(0.05)            # may wait between items
        yield n
        n -= 1

async def main():
    async for x in countdown(3):             # async for, not plain for
        print(x)

asyncio.run(main())

# OUTPUT:
# 3
# 2
# 1`],
        [`Loading a whole result into memory is wasteful or impossible for big or endless streams. An async generator hands out one item at a time while the loop stays free to do other work.`,
            r`import asyncio

async def pages():                           # simulated paginated API
    for p in range(1, 4):
        await asyncio.sleep(0.05)
        yield [f"item{p}a", f"item{p}b"]

async def main():
    total = 0
    async for page in pages():               # process each page as it arrives
        total += len(page)
    print("items:", total)

asyncio.run(main())

# OUTPUT:
# items: 6`],
        [`Real use: streaming HTTP responses, reading lines from a socket, consuming message queues (Kafka, Redis streams), server-sent events, large DB cursors.`,
            r`import asyncio

async def read_lines():
    reader = asyncio.StreamReader()
    for chunk in (b"alpha\n", b"beta\n", b"gamma\n"):
        reader.feed_data(chunk)              # simulate network bytes arriving
    reader.feed_eof()
    async for line in reader:                # StreamReader is an async iterator
        yield line.decode().strip()

async def main():
    print([line async for line in read_lines()])   # async comprehension

asyncio.run(main())

# OUTPUT:
# ['alpha', 'beta', 'gamma']`],
        [`<b>Advantages:</b> constant memory, natural back-pressure (the producer only runs when the consumer asks), clean syntax, and async comprehensions.`,
            r`import asyncio

async def numbers():
    for i in range(1_000_000):               # a million items, never all in memory
        yield i

async def main():
    async for n in numbers():
        if n == 3: break                     # stops early: producer never computes the rest
    print("stopped at", n)

asyncio.run(main())

# OUTPUT:
# stopped at 3`],
        [`<b>Disadvantages:</b> cannot use plain <code>for</code>, cleanup on early exit is subtle (<code>finally</code> runs only when closed), and generator-based pipelines are harder to debug.`,
            r`import asyncio

async def source():
    try:
        for i in range(5): yield i
    finally:
        print("cleanup ran")

async def main():
    gen = source()
    async for x in gen:
        if x == 1: break                     # abandoned, not yet closed
    await gen.aclose()                       # explicit close triggers the finally
    print("closed")

asyncio.run(main())

# OUTPUT:
# cleanup ran
# closed`],
        [`<b>Limitations:</b> no <code>return value</code> in an async generator, and you cannot use <code>yield from</code>; each item is produced sequentially, with no built-in concurrency.`,
            r`# async generators cannot return a value: this is a SyntaxError at compile time
try:
    compile("async def g():\n    yield 1\n    return 5\n", "<demo>", "exec")
except SyntaxError as e:
    print("SyntaxError:", e.msg)

# OUTPUT:
# SyntaxError: 'return' with value in async generator`],
        `
   consumer: async for x in gen         producer: async def gen(): ... yield v
        │  asks for next item  ───────►  runs until yield (may await)
        │  ◄───────────── value ─────── pauses here
        └─ loop is free to run other tasks while waiting
`,
        `Use async generators for streaming boundaries (protocol readers, paginated clients), but keep them thin and always close them (contextlib.aclosing). When producers and consumers need to run at the same speed independently, an asyncio.Queue with a bounded size decouples them better.`
    ),

    'Async Context Managers': dd(
        [`An <b>async context manager</b> defines <code>__aenter__</code> and <code>__aexit__</code> as coroutines, so setup and teardown may await. You use it with <code>async with</code>.`,
            r`import asyncio

class Connection:
    async def __aenter__(self):
        await asyncio.sleep(0.05); print("connected"); return self
    async def __aexit__(self, exc_type, exc, tb):
        await asyncio.sleep(0.05); print("closed")      # may await during cleanup

async def main():
    async with Connection() as conn:
        print("using", type(conn).__name__)

asyncio.run(main())

# OUTPUT:
# connected
# using Connection
# closed`],
        [`Opening a connection or releasing a lock often needs network I/O. A normal <code>with</code> cannot await, so cleanup would either block the loop or be forgotten.`,
            r`import asyncio

lock = asyncio.Lock()

async def critical(name):
    async with lock:                         # acquire is awaitable, release is automatic
        print(name, "enter"); await asyncio.sleep(0.05); print(name, "leave")

async def main():
    await asyncio.gather(critical("A"), critical("B"))

asyncio.run(main())

# OUTPUT:
# A enter
# A leave
# B enter
# B leave`],
        [`Real use: database sessions and transactions (SQLAlchemy async, asyncpg), HTTP client sessions (aiohttp, httpx), file access (aiofiles), timeouts (<code>asyncio.timeout</code>).`,
            r`import asyncio
from contextlib import asynccontextmanager

@asynccontextmanager
async def transaction(name):                 # generator style, less boilerplate
    print(name, "BEGIN")
    try:
        yield
        print(name, "COMMIT")
    except Exception:
        print(name, "ROLLBACK"); raise

async def main():
    async with transaction("tx1"): pass
    try:
        async with transaction("tx2"): raise ValueError("fail")
    except ValueError: pass

asyncio.run(main())

# OUTPUT:
# tx1 BEGIN
# tx1 COMMIT
# tx2 BEGIN
# tx2 ROLLBACK`],
        [`<b>Advantages:</b> guaranteed cleanup even on exceptions and cancellation, awaitable setup/teardown, composes with multiple managers in one statement.`,
            r`import asyncio
from contextlib import asynccontextmanager

@asynccontextmanager
async def res(name):
    print("open", name)
    try: yield name
    finally: print("close", name)

async def main():
    async with res("db") as a, res("cache") as b:   # closed in reverse order
        print("using", a, b)

asyncio.run(main())

# OUTPUT:
# open db
# open cache
# using db cache
# close cache
# close db`],
        [`<b>Disadvantages:</b> cleanup code can itself be cancelled, and errors raised inside <code>__aexit__</code> can mask the original exception.`,
            r`import asyncio

class Bad:
    async def __aenter__(self): return self
    async def __aexit__(self, *exc):
        raise RuntimeError("cleanup failed")  # replaces the original error

async def main():
    try:
        async with Bad():
            raise ValueError("original")
    except Exception as e:
        print(type(e).__name__, "| context:", repr(e.__context__))

asyncio.run(main())

# OUTPUT:
# RuntimeError | context: ValueError('original')`],
        [`<b>Limitations:</b> only usable inside <code>async def</code>; a sync <code>with</code> cannot use it, and objects having only <code>__enter__</code> will not work with <code>async with</code>.`,
            r`import asyncio

class OnlySync:
    def __enter__(self): return self
    def __exit__(self, *a): pass

async def main():
    try:
        async with OnlySync(): pass
    except (TypeError, AttributeError) as e:
        print(type(e).__name__)

asyncio.run(main())

# OUTPUT:
# TypeError`],
        `
   async with A() as x:
        │
        ├─► await A.__aenter__()   (setup may await)
        ├─► body runs
        └─► await A.__aexit__()    (always runs: success, error or cancel)
`,
        `Wrap every external resource (connection, session, lock, transaction) in an async context manager so lifetime is tied to a scope. Shield critical cleanup from cancellation with asyncio.shield or short timeouts, and keep __aexit__ idempotent and exception-safe.`
    ),

    'Cancellation & Timeouts': dd(
        [`<code>task.cancel()</code> asks a task to stop by raising <code>asyncio.CancelledError</code> at its current <code>await</code>. Timeouts (<code>asyncio.timeout()</code>, <code>asyncio.wait_for()</code>) cancel work that takes too long.`,
            r`import asyncio

async def worker():
    try:
        await asyncio.sleep(10)
    except asyncio.CancelledError:
        print("worker: cancelled, cleaning up")
        raise                                # always re-raise

async def main():
    t = asyncio.create_task(worker())
    await asyncio.sleep(0.1)
    t.cancel()
    try: await t
    except asyncio.CancelledError: print("main: task was cancelled", t.cancelled())

asyncio.run(main())

# OUTPUT:
# worker: cancelled, cleaning up
# main: task was cancelled True`],
        [`Without timeouts, one hung network call keeps a request, a connection and memory forever. Every call to the outside world needs a deadline and a way to be stopped.`,
            r`import asyncio

async def slow_api():
    await asyncio.sleep(5)
    return "data"

async def main():
    try:
        async with asyncio.timeout(0.2):     # Python 3.11+
            await slow_api()
    except TimeoutError:
        print("gave up after 0.2s")

asyncio.run(main())

# OUTPUT:
# gave up after 0.2s`],
        [`Real use: HTTP request deadlines, client disconnects cancelling the server task, graceful shutdown that cancels background tasks, and "first result wins" races.`,
            r`import asyncio

async def mirror(name, delay):
    await asyncio.sleep(delay); return name

async def main():
    tasks = [asyncio.create_task(mirror("fast", 0.1)), asyncio.create_task(mirror("slow", 1))]
    done, pending = await asyncio.wait(tasks, return_when=asyncio.FIRST_COMPLETED)
    for p in pending: p.cancel()             # stop the loser
    print("winner:", done.pop().result(), "| cancelled:", len(pending))

asyncio.run(main())

# OUTPUT:
# winner: fast | cancelled: 1`],
        [`<b>Advantages:</b> cooperative, orderly stop: <code>finally</code> blocks and context managers run, so resources are released; <code>wait_for</code> gives one-line deadlines.`,
            r`import asyncio

async def job():
    try:
        await asyncio.sleep(5)
    finally:
        print("finally ran: file closed, lock released")

async def main():
    try:
        await asyncio.wait_for(job(), timeout=0.1)
    except asyncio.TimeoutError:
        print("timed out")

asyncio.run(main())

# OUTPUT:
# finally ran: file closed, lock released
# timed out`],
        [`<b>Disadvantages:</b> swallowing CancelledError (a bare <code>except Exception</code> in old versions, or no re-raise) makes tasks uncancellable, and cancellation can interrupt work half-way.`,
            r`import asyncio

async def stubborn():
    while True:
        try:
            await asyncio.sleep(0.05)
        except asyncio.CancelledError:
            print("ignoring cancel")        # BUG: not re-raised
            return "refused"                # returning also ends it, but hides intent

async def main():
    t = asyncio.create_task(stubborn())
    await asyncio.sleep(0.1)
    t.cancel()
    print("result:", await t, "| cancelled flag:", t.cancelled())

asyncio.run(main())

# OUTPUT:
# ignoring cancel
# result: refused | cancelled flag: False`],
        [`<b>Limitations:</b> cancellation only takes effect at an <code>await</code>; CPU loops and blocking calls ignore it, and threads started with to_thread keep running after cancel.`,
            r`import asyncio, time

async def busy():
    t0 = time.perf_counter()
    while time.perf_counter() - t0 < 0.5: pass   # no await: cannot be interrupted
    return "finished anyway"

async def main():
    t = asyncio.create_task(busy())
    await asyncio.sleep(0)                   # let it start
    t.cancel()
    try: print(await t)
    except asyncio.CancelledError: print("cancelled")

asyncio.run(main())

# OUTPUT (example - the loop is blocked, cancel lands only after the first await):
# finished anyway`],
        `
   task.cancel() ──► CancelledError raised at the next await
                          │
              except/finally runs (cleanup) ──► re-raise ──► task ends "cancelled"

   async with timeout(2): ... ──► deadline passes ──► cancel ──► TimeoutError
`,
        `Make deadlines part of every API: propagate an absolute deadline down call chains instead of stacking independent timeouts. Always re-raise CancelledError, keep cleanup short, use asyncio.shield for must-finish work such as commits, and test shutdown paths because they are rarely exercised.`
    ),

    'asyncio Semaphores': dd(
        [`<code>asyncio.Semaphore(n)</code> limits how many coroutines may be inside a section at once. Others wait asynchronously (no thread blocked) until a permit is free.`,
            r`import asyncio

sem = asyncio.Semaphore(2)                   # 2 permits

async def worker(i):
    async with sem:
        print(f"worker {i} in")
        await asyncio.sleep(0.1)
        print(f"worker {i} out")

async def main():
    await asyncio.gather(*(worker(i) for i in range(4)))

asyncio.run(main())

# OUTPUT:
# worker 0 in
# worker 1 in
# worker 0 out
# worker 1 out
# worker 2 in
# worker 3 in
# worker 2 out
# worker 3 out`],
        [`gather over 10,000 URLs would open 10,000 sockets at once and hit rate limits or file-descriptor limits. A semaphore keeps concurrency at a safe, steady level.`,
            r`import asyncio

active = peak = 0

async def fetch(sem, i):
    global active, peak
    async with sem:
        active += 1; peak = max(peak, active)
        await asyncio.sleep(0.01)
        active -= 1

async def main():
    sem = asyncio.Semaphore(10)
    await asyncio.gather(*(fetch(sem, i) for i in range(200)))
    print("peak concurrency:", peak)

asyncio.run(main())

# OUTPUT:
# peak concurrency: 10`],
        [`Real use: crawlers limiting parallel requests per host, API clients obeying rate limits, DB pool guards, bounded parallel file or image processing.`,
            r`import asyncio, time

async def call_api(sem, i, stamps):
    async with sem:
        stamps.append(time.perf_counter())
        await asyncio.sleep(0.1)

async def main():
    sem, stamps = asyncio.Semaphore(5), []
    t0 = time.perf_counter()
    await asyncio.gather(*(call_api(sem, i, stamps) for i in range(15)))
    print(f"15 calls at 5-concurrency took {time.perf_counter() - t0:.1f}s")   # 3 waves

asyncio.run(main())

# OUTPUT (example):
# 15 calls at 5-concurrency took 0.3s`],
        [`<b>Advantages:</b> tiny, no thread blocked while waiting, FIFO fairness for waiters, works with <code>async with</code> so permits cannot leak.`,
            r`import asyncio

async def main():
    sem = asyncio.BoundedSemaphore(1)        # also guards against over-release
    async with sem: print("locked:", sem.locked())
    print("locked after:", sem.locked())
    try: sem.release()
    except ValueError as e: print("bug caught:", e)

asyncio.run(main())

# OUTPUT:
# locked: True
# locked after: False
# bug caught: BoundedSemaphore released too many times`],
        [`<b>Disadvantages:</b> limits concurrency but not rate (calls per second), a leaked permit (manual acquire without release) slowly starves everything, and it adds a waiting queue that can hide overload.`,
            r`import asyncio

async def main():
    sem = asyncio.Semaphore(1)
    await sem.acquire()                      # manual acquire, then an error occurs...
    try:
        raise RuntimeError("boom")           # ...and release() is never reached
    except RuntimeError: pass
    try:
        await asyncio.wait_for(sem.acquire(), 0.2)
    except TimeoutError:
        print("starved: the permit leaked")

asyncio.run(main())

# OUTPUT:
# starved: the permit leaked`],
        [`<b>Limitations:</b> works within one event loop in one process only, is not thread-safe (do not share with threads), and cannot be created at import time on old Python versions where it binds to a loop.`,
            r`import asyncio, threading

sem = asyncio.Semaphore(1)
# Using it from another thread's code is unsafe: asyncio primitives are not thread-safe.
def other_thread():
    print("do NOT touch asyncio.Semaphore here; use loop.call_soon_threadsafe")

t = threading.Thread(target=other_thread); t.start(); t.join()

# OUTPUT:
# do NOT touch asyncio.Semaphore here; use loop.call_soon_threadsafe`],
        `
   many coroutines ─► [ Semaphore(3): permits ■ ■ ■ ] ─► only 3 run inside
                         waiting line: c4, c5, c6 ...    others await (loop stays free)
`,
        `Prefer a semaphore plus a rate limiter (token bucket) for external APIs, and size permits from the downstream capacity rather than guessing. For per-host or per-tenant limits use a dict of semaphores. In distributed systems, enforce global limits at a gateway or with Redis.`
    )
};
