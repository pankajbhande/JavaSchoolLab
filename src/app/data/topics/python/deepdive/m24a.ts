// Module 24 (Async Python), part A: async/await, event loop, coroutines, tasks, gather.
import { dd, r, type DeepDive } from './deepDive';

export const m24a: Record<string, DeepDive> = {
    'async & await': dd(
        [`<code>async def</code> defines a <b>coroutine function</b>; calling it returns a coroutine object without running it. <code>await</code> pauses the coroutine until the awaited thing finishes, letting other coroutines run meanwhile. <code>asyncio.run()</code> starts everything.`,
            r`import asyncio

async def greet(name):                       # coroutine function
    await asyncio.sleep(0.1)                 # pause here, let others run
    return f"hello {name}"

async def main():
    msg = await greet("async")               # run it and get the result
    print(msg)

asyncio.run(main())                          # create loop, run main, close loop

# OUTPUT:
# hello async`],
        [`Waiting for the network with a thread per connection does not scale to tens of thousands of connections. async/await gives cooperative concurrency on ONE thread with very low per-task cost.`,
            r`import asyncio, time

async def fetch(i):
    await asyncio.sleep(1)                   # pretend network call
    return i

async def main():
    t0 = time.perf_counter()
    results = await asyncio.gather(*(fetch(i) for i in range(1000)))   # 1000 waits at once
    print(len(results), f"results in {time.perf_counter() - t0:.1f}s")

asyncio.run(main())

# OUTPUT (example):
# 1000 results in 1.0s`],
        [`Real use: web servers (FastAPI, aiohttp), API gateways, chat servers, web crawlers, bots, and microservices that call many other services per request.`,
            r`import asyncio

async def get_user(uid):
    await asyncio.sleep(0.1); return {"id": uid, "name": "Asha"}
async def get_orders(uid):
    await asyncio.sleep(0.2); return [101, 102]

async def handler(uid):                      # one request fans out to two backends
    user, orders = await asyncio.gather(get_user(uid), get_orders(uid))
    return {**user, "orders": orders}

print(asyncio.run(handler(7)))               # takes 0.2s, not 0.3s

# OUTPUT:
# {'id': 7, 'name': 'Asha', 'orders': [101, 102]}`],
        [`<b>Advantages:</b> huge concurrency on one thread, no locks needed for most shared state (switches happen only at <code>await</code>), explicit suspension points make code easier to reason about.`,
            r`import asyncio

counter = 0
async def inc():
    global counter
    for _ in range(1000):
        counter += 1                         # no await inside: cannot be interrupted
        await asyncio.sleep(0)               # switch points are explicit

async def main():
    await asyncio.gather(*(inc() for _ in range(10)))
    print(counter)

asyncio.run(main())

# OUTPUT:
# 10000`],
        [`<b>Disadvantages:</b> "colour" problem (async functions can only be awaited from async code), needs async-aware libraries, and one blocking call stalls every task.`,
            r`import asyncio, time

async def ticker():
    for _ in range(3):
        print("tick"); await asyncio.sleep(0.1)

async def bad():
    time.sleep(0.5)                          # BLOCKING call freezes the whole loop

async def main():
    await asyncio.gather(bad(), ticker())    # ticks are delayed until bad() ends

t0 = time.perf_counter(); asyncio.run(main())
print(f"total {time.perf_counter() - t0:.1f}s, ticks started only after the block")

# OUTPUT (example):
# tick
# tick
# tick
# total 0.8s, ticks started only after the block`],
        [`<b>Limitations:</b> does not use multiple cores, does not help CPU-bound code, and forgetting <code>await</code> silently skips the work (you get a coroutine object).`,
            r`import asyncio, warnings

async def work():
    print("working")

async def main():
    work()                                   # BUG: coroutine created, never awaited
    print("main done")

asyncio.run(main())

# OUTPUT:
# main done
# RuntimeWarning: coroutine 'work' was never awaited`],
        `
   async def f():                 caller
       x = await g()   ──────►  pauses f, loop runs other tasks
       return x                  ◄────── resumes f when g() is done
   asyncio.run(main())  =  create loop ─► run until main finishes ─► close
`,
        `async/await is a concurrency tool for I/O fan-out, not a speed-up for compute. Adopt it end-to-end (async DB driver, HTTP client) or isolate blocking libraries with asyncio.to_thread; mixing styles half-way gives the complexity without the scale. For simple low-traffic apps, threads are often simpler and enough.`
    ),

    'The Event Loop': dd(
        [`The <b>event loop</b> is the scheduler at the heart of asyncio. It keeps a queue of ready callbacks and a set of waiting I/O, runs one ready task until it hits <code>await</code>, then picks the next. One thread, many tasks.`,
            r`import asyncio

async def main():
    loop = asyncio.get_running_loop()        # the loop executing this coroutine
    print(type(loop).__name__)
    print("running:", loop.is_running())

asyncio.run(main())

# OUTPUT (example, Linux; Windows prints ProactorEventLoop):
# _UnixSelectorEventLoop
# running: True`],
        [`Without a loop, nothing would resume paused coroutines when their I/O completes. The loop uses the OS selector (epoll/kqueue/IOCP) to sleep efficiently until some socket is ready.`,
            r`import asyncio

async def a():
    print("a1"); await asyncio.sleep(0); print("a2")   # sleep(0) = just yield
async def b():
    print("b1"); await asyncio.sleep(0); print("b2")

async def main():
    await asyncio.gather(a(), b())

asyncio.run(main())                          # shows interleaving at await points

# OUTPUT:
# a1
# b1
# a2
# b2`],
        [`Real use: it drives every async server. You can schedule plain callbacks with <code>call_later</code>, and run blocking functions in a thread with <code>run_in_executor</code>.`,
            r`import asyncio, time

def blocking_job():
    time.sleep(0.2); return "blocking result"

async def main():
    loop = asyncio.get_running_loop()
    loop.call_later(0.1, print, "timer callback fired")     # schedule a callback
    res = await loop.run_in_executor(None, blocking_job)    # off-load to a thread
    print(res)

asyncio.run(main())

# OUTPUT:
# timer callback fired
# blocking result`],
        [`<b>Advantages:</b> single-threaded scheduling means no data races between tasks, tiny per-task cost, and pluggable (uvloop is a drop-in 2-4x faster loop).`,
            r`import asyncio, sys
# Optional drop-in speed-up on Linux/macOS: pip install uvloop
try:
    import uvloop
    uvloop.install()
    print("using uvloop")
except ImportError:
    print("using the default asyncio loop")

async def main(): return sys.version_info[:2] >= (3, 8)
print(asyncio.run(main()))

# OUTPUT (example, without uvloop):
# using the default asyncio loop
# True`],
        [`<b>Disadvantages:</b> a slow callback delays EVERY task (latency spikes), and debugging scheduling issues is harder than reading sequential code.`,
            r`import asyncio, time

async def main():
    loop = asyncio.get_running_loop()
    loop.slow_callback_duration = 0.05       # debug mode warns above this
    async def hog():
        time.sleep(0.2)                      # blocks the loop for 200 ms
    await hog()

asyncio.run(main(), debug=True)              # debug mode reports slow callbacks

# OUTPUT (example, on stderr):
# Executing <Task ... coro=<main()...>> took 0.200 seconds`],
        [`<b>Limitations:</b> one loop per thread, one thread runs it, <code>asyncio.run()</code> cannot be called when a loop is already running (Jupyter, nested calls), and loops are not process-safe.`,
            r`import asyncio

async def inner():
    return 1

async def main():
    try:
        asyncio.run(inner())                 # nested run: not allowed
    except RuntimeError as e:
        print("RuntimeError:", e)

asyncio.run(main())

# OUTPUT:
# RuntimeError: asyncio.run() cannot be called from a running event loop`],
        `
        ┌───────────────────────── Event Loop (1 thread) ─────────────────────────┐
        │  ready queue ─► run task until await ─► register I/O wait ─► next task   │
        │       ▲                                         │                        │
        │       └──── I/O ready (epoll/kqueue/IOCP) ◄─────┘   timers: call_later   │
        └─────────────────────────────────────────────────────────────────────────┘
`,
        `Keep every callback short and non-blocking; budget the loop like a latency-critical thread. Off-load CPU and blocking work to to_thread or a process pool, enable debug mode in staging to catch slow callbacks, and run one loop per process (scale out with several workers).`
    ),

    'Coroutines': dd(
        [`A <b>coroutine</b> is a function that can suspend and resume. Calling an <code>async def</code> function returns a coroutine object; nothing runs until it is awaited or wrapped in a Task.`,
            r`import asyncio, inspect

async def hello():
    return "hi"

co = hello()                                 # creates the object, does NOT run the body
print(type(co).__name__, inspect.iscoroutine(co))
print(asyncio.run(co))                       # now it runs

# OUTPUT:
# coroutine True
# hi`],
        [`Coroutines let one function wait without holding a thread. A thousand suspended coroutines cost kilobytes, a thousand suspended threads cost gigabytes of stack.`,
            r`import asyncio, sys

async def idle():
    await asyncio.sleep(10)

async def main():
    tasks = [asyncio.create_task(idle()) for _ in range(10_000)]   # 10,000 waiting
    await asyncio.sleep(0.1)
    print("pending coroutines:", sum(not t.done() for t in tasks))
    for t in tasks: t.cancel()

asyncio.run(main())

# OUTPUT:
# pending coroutines: 10000`],
        [`Real use: each incoming request in an async web framework runs as a coroutine; pipelines chain coroutines with <code>await</code>; <code>async for</code> and <code>async with</code> build on them.`,
            r`import asyncio

async def validate(x):
    await asyncio.sleep(0.01); return x > 0
async def save(x):
    await asyncio.sleep(0.01); return f"saved {x}"

async def pipeline(x):                       # coroutines calling coroutines
    if not await validate(x):
        return "rejected"
    return await save(x)

async def main():
    print(await pipeline(5)); print(await pipeline(-1))

asyncio.run(main())

# OUTPUT:
# saved 5
# rejected`],
        [`<b>Advantages:</b> sequential-looking code, cheap, composable, with exceptions flowing naturally through <code>await</code>.`,
            r`import asyncio

async def fail():
    await asyncio.sleep(0.01)
    raise ValueError("backend down")

async def main():
    try:
        await fail()                         # normal try/except works across await
    except ValueError as e:
        print("handled:", e)

asyncio.run(main())

# OUTPUT:
# handled: backend down`],
        [`<b>Disadvantages:</b> must be awaited to run, awaiting several one after another is sequential (a common performance bug), and stack traces are longer.`,
            r`import asyncio, time

async def job():
    await asyncio.sleep(0.3)

async def main():
    t0 = time.perf_counter()
    await job(); await job(); await job()    # SEQUENTIAL: 0.9 s, not concurrent
    print(f"three awaits in a row: {time.perf_counter() - t0:.1f}s")

asyncio.run(main())

# OUTPUT (example):
# three awaits in a row: 0.9s`],
        [`<b>Limitations:</b> a coroutine object can be awaited only once, and cannot be run from sync code without a loop.`,
            r`import asyncio

async def once(): return 1

async def main():
    co = once()
    print(await co)
    try:
        await co                             # already consumed
    except RuntimeError as e:
        print("RuntimeError:", e)

asyncio.run(main())

# OUTPUT:
# 1
# RuntimeError: cannot reuse already awaited coroutine`],
        `
   hello()  ──►  [coroutine object: suspended at start]
                      │ await / Task
                      ▼
                 running ──await──► suspended ──resume──► running ──► done(result)
`,
        `Think of coroutines as units of waiting, not units of parallelism. Return awaitables from library functions explicitly, avoid creating coroutines that are never awaited (lint with -W error), and keep a clear boundary between sync and async layers so call chains do not need to be rewritten.`
    ),

    'Tasks & Futures': dd(
        [`A <b>Task</b> wraps a coroutine and schedules it to run on the loop right away, concurrently with the code that created it. A <b>Future</b> is a placeholder for a result that will arrive later; Task is a Future subclass.`,
            r`import asyncio

async def compute():
    await asyncio.sleep(0.1)
    return 42

async def main():
    task = asyncio.create_task(compute())    # starts running in the background
    print("task created, doing other work")
    result = await task                      # collect result when needed
    print("result:", result)

asyncio.run(main())

# OUTPUT:
# task created, doing other work
# result: 42`],
        [`Awaiting a coroutine directly runs it to completion before moving on. Tasks let several coroutines progress at the same time and let you inspect, cancel or attach callbacks to work in flight.`,
            r`import asyncio, time

async def job(n):
    await asyncio.sleep(0.3); return n

async def main():
    t0 = time.perf_counter()
    t1 = asyncio.create_task(job(1))         # both start immediately
    t2 = asyncio.create_task(job(2))
    print(await t1, await t2, f"{time.perf_counter() - t0:.1f}s")   # 0.3, not 0.6

asyncio.run(main())

# OUTPUT (example):
# 1 2 0.3s`],
        [`Real use: fire-and-forget background work (sending emails, metrics), request time-outs, and bridging callback APIs to await using <code>loop.create_future()</code>.`,
            r`import asyncio

async def main():
    loop = asyncio.get_running_loop()
    fut = loop.create_future()               # manual Future for callback-style code

    def on_data():                           # e.g. a legacy callback API
        fut.set_result("data from callback")
    loop.call_later(0.1, on_data)

    print(await fut)                         # await turns the callback into a result

asyncio.run(main())

# OUTPUT:
# data from callback`],
        [`<b>Advantages:</b> real concurrency from simple code, status checks (<code>done()</code>, <code>cancelled()</code>), done-callbacks, names for debugging, and <code>TaskGroup</code> (3.11+) for structured concurrency.`,
            r`import asyncio

async def job(n):
    await asyncio.sleep(0.05 * n); return n * 10

async def main():
    async with asyncio.TaskGroup() as tg:    # leaves the block when ALL tasks finish
        a = tg.create_task(job(1), name="first")
        b = tg.create_task(job(2), name="second")
    print(a.get_name(), a.result(), b.get_name(), b.result())

asyncio.run(main())

# OUTPUT:
# first 10 second 20`],
        [`<b>Disadvantages:</b> a task whose reference is dropped can be garbage-collected mid-run, and exceptions in unawaited tasks only surface as log messages ("Task exception was never retrieved").`,
            r`import asyncio

async def boom():
    raise RuntimeError("lost error")

async def main():
    t = asyncio.create_task(boom())          # nobody awaits or checks it
    await asyncio.sleep(0.1)                 # the error appears only as a log line
    del t

asyncio.run(main())

# OUTPUT (example, stderr, printed when the task is freed):
# Task exception was never retrieved
# RuntimeError: lost error`],
        [`<b>Limitations:</b> you cannot create a Task without a running loop, and a Future/Task belongs to ONE loop and cannot be awaited from another thread's loop.`,
            r`import asyncio

async def noop(): pass

try:
    asyncio.create_task(noop())              # no running loop here
except RuntimeError as e:
    print("RuntimeError:", e)

# OUTPUT:
# RuntimeError: no running event loop`],
        `
   coro ──create_task()──► Task (scheduled) ──► loop runs it ──► result stored
                              │
   caller continues...        └── await task / task.result() / task.cancel()
   Future = empty box,  set_result() fills it,  awaiters wake up
`,
        `Prefer TaskGroup (or gather with care) over loose create_task calls so that lifetimes and errors are structured. If you must fire and forget, keep a strong reference in a set and add a done-callback that logs exceptions. Design each task to be cancellable at its awaits.`
    ),

    'asyncio.gather()': dd(
        [`<code>asyncio.gather(*aws)</code> runs several awaitables concurrently and returns their results as a list in the SAME order as the inputs, regardless of which finishes first.`,
            r`import asyncio

async def job(name, delay):
    await asyncio.sleep(delay)
    return f"{name} done"

async def main():
    results = await asyncio.gather(job("A", 0.3), job("B", 0.1), job("C", 0.2))
    print(results)                           # input order, not finish order

asyncio.run(main())

# OUTPUT:
# ['A done', 'B done', 'C done']`],
        [`Awaiting independent calls one by one adds their delays. gather makes total time equal to the slowest call, which is the core performance win of async.`,
            r`import asyncio, time

async def call(i):
    await asyncio.sleep(0.5); return i

async def main():
    t0 = time.perf_counter()
    for i in range(4): await call(i)
    print(f"sequential: {time.perf_counter() - t0:.1f}s")
    t0 = time.perf_counter()
    await asyncio.gather(*(call(i) for i in range(4)))
    print(f"gather    : {time.perf_counter() - t0:.1f}s")

asyncio.run(main())

# OUTPUT (example):
# sequential: 2.0s
# gather    : 0.5s`],
        [`Real use: loading a dashboard (profile + orders + notifications in parallel), calling many APIs in a batch, health-checking a list of services.`,
            r`import asyncio

async def check(svc):
    await asyncio.sleep(0.05)
    if svc == "cache": raise ConnectionError("cache down")
    return "up"

async def main():
    services = ["db", "cache", "queue"]
    results = await asyncio.gather(*(check(s) for s in services), return_exceptions=True)
    for s, r_ in zip(services, results):     # failures come back as values
        print(s, "->", r_ if not isinstance(r_, Exception) else f"FAILED ({r_})")

asyncio.run(main())

# OUTPUT:
# db -> up
# cache -> FAILED (cache down)
# queue -> up`],
        [`<b>Advantages:</b> one line gives concurrency, ordered results, optional per-item error capture with <code>return_exceptions=True</code>.`,
            r`import asyncio

async def sq(n):
    await asyncio.sleep(0.01 * (5 - n)); return n * n   # later items finish first

async def main():
    print(await asyncio.gather(*(sq(n) for n in range(5))))

asyncio.run(main())

# OUTPUT:
# [0, 1, 4, 9, 16]`],
        [`<b>Disadvantages:</b> by default the first exception propagates immediately while the other tasks keep running in the background (not cancelled), which can leak work.`,
            r`import asyncio

async def slow():
    await asyncio.sleep(0.3); print("slow finished anyway")
async def bad():
    raise ValueError("fast failure")

async def main():
    try:
        await asyncio.gather(slow(), bad())
    except ValueError as e:
        print("gather raised:", e)
    await asyncio.sleep(0.5)                 # slow() is still running meanwhile

asyncio.run(main())

# OUTPUT:
# gather raised: fast failure
# slow finished anyway`],
        [`<b>Limitations:</b> no built-in concurrency cap (10,000 inputs start 10,000 tasks at once), no per-item timeout, and only the first exception is visible without return_exceptions.`,
            r`import asyncio

async def limited(sem, i):
    async with sem:                          # cap concurrency yourself
        await asyncio.sleep(0.01); return i

async def main():
    sem = asyncio.Semaphore(100)             # at most 100 running at once
    res = await asyncio.gather(*(limited(sem, i) for i in range(1000)))
    print(len(res))

asyncio.run(main())

# OUTPUT:
# 1000`],
        `
   gather(A, B, C)
      ├─► A ───────────────┐   total time = slowest
      ├─► B ──────┐        │
      └─► C ────────┐      │
                    ▼      ▼
              [resA, resB, resC]   (input order)
`,
        `Prefer asyncio.TaskGroup when one failure should cancel the siblings; use gather with return_exceptions=True for best-effort batches. Always bound fan-out with a Semaphore and wrap calls with timeouts, otherwise a large batch can overwhelm downstream services or exhaust file descriptors.`
    )
};
