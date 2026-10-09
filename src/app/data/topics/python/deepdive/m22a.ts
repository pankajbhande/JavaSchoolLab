// Module 22 (Multithreading): deep dive entries.
import { dd, r, type DeepDive } from './deepDive';

export const m22a: Record<string, DeepDive> = {
    'Creating Threads': dd(
        [`A <b>thread</b> runs a function concurrently with the rest of your program. Create one with <code>threading.Thread(target=func, args=...)</code>, call <code>start()</code> to launch it and <code>join()</code> to wait for it to finish.`,
            r`import threading

def greet(name):
    print(f"Hello from {name}")

t = threading.Thread(target=greet, args=("worker",))   # create (not running yet)
t.start()                                              # begin running
t.join()                                               # wait until it finishes
print("main done")

# OUTPUT:
# Hello from worker
# main done`],
        [`Programs often need to wait (network, disk) without freezing everything else. Threads let one task wait while another continues, so a UI stays responsive and many downloads overlap.`,
            r`import threading, time

def task(n):
    time.sleep(1)                   # pretend to wait on a server
    print("task", n, "done")

t0 = time.perf_counter()
ts = [threading.Thread(target=task, args=(i,)) for i in range(3)]
for t in ts: t.start()
for t in ts: t.join()
print(f"total {time.perf_counter() - t0:.1f}s instead of 3s")

# OUTPUT (example - order of the first 3 lines varies):
# task 0 done
# task 1 done
# task 2 done
# total 1.0s instead of 3s`],
        [`Real use: background log flushing, parallel API calls, a GUI worker that keeps the window alive, a heartbeat sender. Subclassing <code>Thread</code> and daemon threads are common patterns.`,
            r`import threading, time

class Heartbeat(threading.Thread):
    def __init__(self):
        super().__init__(daemon=True)        # daemon: dies with the main program
        self.beats = 0
    def run(self):                           # code executed by start()
        while True:
            self.beats += 1
            time.sleep(0.1)

hb = Heartbeat(); hb.start()
time.sleep(0.45)
print("beats so far:", hb.beats)

# OUTPUT (example):
# beats so far: 5`],
        [`<b>Advantages:</b> cheap to create, share memory directly, great for waiting-heavy work, and can return control to the caller immediately.`,
            r`import threading

results = {}                                  # shared dict: no copying needed
def square(n):
    results[n] = n * n

ts = [threading.Thread(target=square, args=(i,)) for i in range(5)]
for t in ts: t.start()
for t in ts: t.join()
print(sorted(results.items()))

# OUTPUT:
# [(0, 0), (1, 1), (2, 4), (3, 9), (4, 16)]`],
        [`<b>Disadvantages:</b> exceptions in a thread do not reach the caller, threads cannot be killed from outside, and shared state invites bugs.`,
            r`import threading

def boom():
    raise ValueError("oops")

t = threading.Thread(target=boom)
try:
    t.start(); t.join()
    print("main thinks everything is fine")   # the exception stayed in the thread
except ValueError:
    print("never caught here")

# OUTPUT (example - traceback goes to stderr):
# Exception in thread Thread-1 (boom):
# ValueError: oops
# main thinks everything is fine`],
        [`<b>Limitations:</b> a thread cannot return a value directly (use a queue, shared variable or Future), the GIL stops CPU parallelism, and each thread costs stack memory (about 8 MB virtual on Linux).`,
            r`import threading

t = threading.Thread(target=lambda: 42)
t.start(); t.join()
print("target return value is lost:", getattr(t, "result", None))

# Correct way to get a result: a Future from a pool
from concurrent.futures import ThreadPoolExecutor
with ThreadPoolExecutor(1) as ex:
    print("future result:", ex.submit(lambda: 42).result())

# OUTPUT:
# target return value is lost: None
# future result: 42`],
        `
   main thread ──► Thread(...) ──► start() ──► (runs concurrently) ──┐
        │                                                           │
        └──────────────────── join()  (wait) ◄──────────────────────┘
`,
        `Raw threads are a low-level tool. In production prefer ThreadPoolExecutor or asyncio for lifecycle, errors and results; name threads for debugging, set daemon deliberately, and never share mutable state without a clear owner. Do not use threads for CPU-bound Python work.`
    ),

    'Lock & RLock': dd(
        [`A <b>Lock</b> is a mutual-exclusion flag: only the thread that holds it may enter the guarded section. An <b>RLock</b> (re-entrant lock) can be acquired again by the SAME thread without blocking itself.`,
            r`import threading

lock = threading.Lock()
with lock:                                   # acquire ... release automatically
    print("inside critical section, locked:", lock.locked())
print("outside, locked:", lock.locked())

# OUTPUT:
# inside critical section, locked: True
# outside, locked: False`],
        [`Two threads updating shared data can interleave their steps and lose updates. A lock makes the read-modify-write sequence indivisible.`,
            r`import threading

count = 0
lock = threading.Lock()

def work():
    global count
    for _ in range(100_000):
        with lock:                           # only one thread at a time
            count += 1

ts = [threading.Thread(target=work) for _ in range(4)]
for t in ts: t.start()
for t in ts: t.join()
print(count)

# OUTPUT:
# 400000`],
        [`Used to guard counters, caches, connection pools, files being appended and any dict updated by many threads. RLock appears in classes whose public methods call each other.`,
            r`import threading

class Account:
    def __init__(self):
        self.balance = 0
        self._lock = threading.RLock()       # re-entrant: methods may call each other
    def deposit(self, n):
        with self._lock:
            self.balance += n
    def deposit_twice(self, n):
        with self._lock:                     # takes the lock ...
            self.deposit(n)                  # ... and deposit takes it again: OK with RLock
            self.deposit(n)

a = Account(); a.deposit_twice(50)
print(a.balance)

# OUTPUT:
# 100`],
        [`<b>Advantages:</b> simple, correct protection for shared state; <code>with</code> guarantees release even on exceptions; <code>acquire(timeout=...)</code> avoids waiting forever.`,
            r`import threading

lock = threading.Lock()
lock.acquire()                               # held by someone
got = lock.acquire(timeout=0.2)              # try, give up after 0.2 s
print("acquired within timeout:", got)
lock.release()

# OUTPUT:
# acquired within timeout: False`],
        [`<b>Disadvantages:</b> locks serialise code (less parallelism), forgotten release causes hangs, and a plain Lock deadlocks if the same thread takes it twice.`,
            r`import threading

lock = threading.Lock()
with lock:
    ok = lock.acquire(blocking=False)        # same thread, plain Lock: cannot re-enter
    print("second acquire by same thread:", ok)
# Without blocking=False this line would hang forever (self-deadlock)

# OUTPUT:
# second acquire by same thread: False`],
        [`<b>Limitations:</b> a Lock can be released by any thread, an RLock only by its owner; locks are not fair (no ordering) and are not shared across processes.`,
            r`import threading

lock = threading.Lock()
lock.acquire()
t = threading.Thread(target=lock.release)    # a different thread releases it: allowed
t.start(); t.join()
print("locked after foreign release:", lock.locked())

rl = threading.RLock()
try:
    rl.release()                             # never acquired by this thread
except RuntimeError as e:
    print("RLock:", e)

# OUTPUT:
# locked after foreign release: False
# RLock: cannot release un-acquired lock`],
        `
   Thread A ─► acquire ─► [ critical section ] ─► release
   Thread B ─► acquire ─► ....blocked.................─► [ critical section ]

   Lock : A holds it, A asks again  ─► DEADLOCK
   RLock: A holds it, A asks again  ─► OK (counter 1 -> 2, needs 2 releases)
`,
        `Keep critical sections tiny, never call unknown code or do I/O while holding a lock, and prefer higher-level designs (queues, immutable data, one owning thread) over shared locks. Use RLock only when re-entry is genuinely needed; frequent need often signals tangled class design.`
    ),

    'Semaphore': dd(
        [`A <b>Semaphore</b> is a lock with a counter: up to N threads may hold it at once. <code>acquire()</code> decreases the counter (blocking at 0), <code>release()</code> increases it.`,
            r`import threading

sem = threading.Semaphore(2)                 # 2 permits
sem.acquire(); sem.acquire()
print("third acquire possible:", sem.acquire(blocking=False))
sem.release()
print("after one release:", sem.acquire(blocking=False))

# OUTPUT:
# third acquire possible: False
# after one release: True`],
        [`Many resources are limited: DB connections, API rate quotas, open files. A semaphore caps how many threads use the resource at once without serialising them completely.`,
            r`import threading, time

sem = threading.Semaphore(3)                 # at most 3 downloads at once
active = 0; peak = 0; m = threading.Lock()

def download(i):
    global active, peak
    with sem:
        with m:
            active += 1; peak = max(peak, active)
        time.sleep(0.1)
        with m:
            active -= 1

ts = [threading.Thread(target=download, args=(i,)) for i in range(9)]
for t in ts: t.start()
for t in ts: t.join()
print("peak concurrent downloads:", peak)

# OUTPUT:
# peak concurrent downloads: 3`],
        [`Real use: connection-pool limits, throttling calls to a rate-limited API, limiting parallel disk-heavy jobs, a "parking lot" of N workers.`,
            r`import threading, time

api_slots = threading.BoundedSemaphore(2)    # 2 concurrent API calls allowed

def call_api(n):
    with api_slots:
        print(f"call {n} started")
        time.sleep(0.05)

ts = [threading.Thread(target=call_api, args=(i,)) for i in range(4)]
for t in ts: t.start()
for t in ts: t.join()
print("all calls finished")

# OUTPUT (example - start order varies):
# call 0 started
# call 1 started
# call 2 started
# call 3 started
# all calls finished`],
        [`<b>Advantages:</b> controls concurrency level precisely; <code>BoundedSemaphore</code> detects bugs where release is called too often.`,
            r`import threading

b = threading.BoundedSemaphore(1)
b.acquire(); b.release()
try:
    b.release()                              # more releases than acquires: bug caught
except ValueError as e:
    print("bug detected:", e)

# OUTPUT:
# bug detected: Semaphore released too many times`],
        [`<b>Disadvantages:</b> a plain Semaphore silently allows over-release, which grows the permit count, and nothing links permits to specific threads so leaks are hard to spot.`,
            r`import threading

s = threading.Semaphore(1)
s.release(); s.release()                     # bug: now 3 permits exist
print([s.acquire(blocking=False) for _ in range(4)])

# OUTPUT:
# [True, True, True, False]`],
        [`<b>Limitations:</b> works only inside one process, gives no fairness or priority, and does not protect data by itself - with N greater than 1 it does not stop races on shared data.`,
            r`import threading

sem = threading.Semaphore(4)                 # lets 4 threads in at once
total = 0
def add():
    global total
    with sem:
        for _ in range(100_000):
            total += 1                       # still a race: semaphore is not a mutex here

ts = [threading.Thread(target=add) for _ in range(4)]
for t in ts: t.start()
for t in ts: t.join()
print("expected 400000, got", total)

# OUTPUT (example - may be exact on some runs, but not guaranteed):
# expected 400000, got 398214`],
        `
   Semaphore(3)         permits: [■][■][■]
   T1 acquire ─► [■][■][ ]      T2 acquire ─► [■][ ][ ]
   T3 acquire ─► [ ][ ][ ]      T4 acquire ─► BLOCKED until someone releases
`,
        `Use semaphores for throttling, not for protecting data (use a Lock for that). Always release in a finally/with block. For distributed or cross-process limits you need Redis, a database or an API gateway; in async code use asyncio.Semaphore instead.`
    ),

    'Event & Condition': dd(
        [`An <b>Event</b> is a simple flag threads can wait on: <code>wait()</code> blocks until another thread calls <code>set()</code>. A <b>Condition</b> pairs a lock with wait/notify so threads sleep until some state becomes true.`,
            r`import threading, time

ready = threading.Event()

def waiter():
    print("waiting for signal...")
    ready.wait()                             # blocks until set()
    print("got the signal")

t = threading.Thread(target=waiter); t.start()
time.sleep(0.2)
ready.set()                                  # wake every waiter
t.join()

# OUTPUT:
# waiting for signal...
# got the signal`],
        [`Busy loops that poll a variable waste CPU and add latency. Events and conditions let threads sleep efficiently and wake exactly when something happens.`,
            r`import threading, time

stop = threading.Event()

def worker():
    n = 0
    while not stop.is_set():                 # clean shutdown flag
        n += 1
        stop.wait(0.05)                      # sleeps, but wakes at once if stop is set
    print("worker stopped after", n, "loops")

t = threading.Thread(target=worker); t.start()
time.sleep(0.3); stop.set(); t.join()

# OUTPUT (example):
# worker stopped after 7 loops`],
        [`Real use: graceful shutdown signals, "service is ready" gates at startup, and producer-consumer buffers built with a Condition.`,
            r`import threading
from collections import deque

buf = deque(); cond = threading.Condition()

def consumer():
    with cond:
        while not buf:                       # ALWAYS re-check in a loop
            cond.wait()                      # releases the lock while sleeping
        print("consumed:", buf.popleft())

def producer():
    with cond:
        buf.append("job-1")
        cond.notify()                        # wake one consumer

c = threading.Thread(target=consumer); c.start()
threading.Thread(target=producer).start()
c.join()

# OUTPUT:
# consumed: job-1`],
        [`<b>Advantages:</b> no polling, near-zero CPU while waiting, timeouts supported, one set() releases many threads.`,
            r`import threading

e = threading.Event()
print("set within 0.1s?", e.wait(timeout=0.1))   # returns False on timeout
e.set()
print("set within 0.1s?", e.wait(timeout=0.1))   # returns True immediately

# OUTPUT:
# set within 0.1s? False
# set within 0.1s? True`],
        [`<b>Disadvantages:</b> Conditions are easy to misuse: forgetting the while-loop causes lost or spurious wakeups, and notify before wait is simply lost.`,
            r`import threading

cond = threading.Condition()
with cond:
    cond.notify()                            # nobody is waiting: notification is lost
    got = cond.wait(timeout=0.2)             # waits and times out
print("woken by earlier notify:", got)

# OUTPUT:
# woken by earlier notify: False`],
        [`<b>Limitations:</b> an Event cannot carry data, a set Event stays set until clear() (races on reuse), and neither works across processes (use multiprocessing.Event).`,
            r`import threading

e = threading.Event()
e.set(); e.clear()                           # reset flag
print("is_set after clear:", e.is_set())
# If two waiters need separate signals, one shared Event cannot tell them apart:
# use a Queue (carries data) or one Event per waiter.

# OUTPUT:
# is_set after clear: False`],
        `
   Event:                               Condition:
   thread A ── wait() ──┐               consumer: with cond: while not ready: wait()
                        ├─► blocked                                  ▲
   thread B ── set()  ──┘─► A resumes   producer: with cond: ready=True; notify() ┘
`,
        `For data hand-off prefer queue.Queue, which is a tested Condition-based design. Use Event for state flags such as shutdown, and Condition only when you must wait on a compound predicate over shared state. Always document who sets, who clears, and how timeouts are handled.`
    ),

    'Race Conditions': dd(
        [`A <b>race condition</b> is a bug where the result depends on the unpredictable timing of threads. Typical case: two threads do read-modify-write on the same variable and one update is lost.`,
            r`import threading

counter = 0
def inc():
    global counter
    for _ in range(300_000):
        counter += 1                         # load, add, store: 3 steps, can interleave

ts = [threading.Thread(target=inc) for _ in range(2)]
for t in ts: t.start()
for t in ts: t.join()
print("expected 600000, got", counter)

# OUTPUT (example - varies by Python version and run):
# expected 600000, got 453281`],
        [`Races produce wrong results rarely and unpredictably: they pass tests, then fail in production. You must understand them to recognise unsafe code and know which tools fix them.`,
            r`import threading, time

x = 0
def slow_inc():
    global x
    tmp = x                                  # read
    time.sleep(0.01)                         # widen the window so the race is certain
    x = tmp + 1                              # write

ts = [threading.Thread(target=slow_inc) for _ in range(5)]
for t in ts: t.start()
for t in ts: t.join()
print("expected 5, got", x)

# OUTPUT (example):
# expected 5, got 1`],
        [`Real incidents: double-spending a balance, two requests creating the same unique ID, overselling the last ticket, cache stampedes. The fix is a lock, an atomic operation, or removing shared state.`,
            r`import threading

stock = 1; lock = threading.Lock(); sold = []

def buy(who):
    global stock
    with lock:                               # check + act become one atomic step
        if stock > 0:
            stock -= 1
            sold.append(who)

ts = [threading.Thread(target=buy, args=(f"user{i}",)) for i in range(10)]
for t in ts: t.start()
for t in ts: t.join()
print("sold to", len(sold), "user(s); stock", stock)

# OUTPUT:
# sold to 1 user(s); stock 0`],
        [`<b>Advantages of fixing them properly:</b> three toolbox options - Lock, thread-safe structures (queue.Queue, itertools.count), or confinement (each thread owns its data).`,
            r`import itertools, threading
from queue import Queue

ids = itertools.count(1)                     # next() on count is atomic in CPython
q = Queue()                                  # internally locked

def producer():
    for _ in range(3):
        q.put(next(ids))

ts = [threading.Thread(target=producer) for _ in range(3)]
for t in ts: t.start()
for t in ts: t.join()
print(sorted(q.queue))                       # no duplicates, nothing lost

# OUTPUT:
# [1, 2, 3, 4, 5, 6, 7, 8, 9]`],
        [`<b>Disadvantages:</b> races are hard to reproduce, hard to debug (print statements change timing) and can hide for years until load or a Python upgrade exposes them.`,
            r`import sys, threading
sys.setswitchinterval(1e-6)                  # force very frequent thread switches

n = 0
def f():
    global n
    for _ in range(50_000): n += 1

ts = [threading.Thread(target=f) for _ in range(4)]
for t in ts: t.start()
for t in ts: t.join()
print("expected 200000, got", n)             # stress setting makes the bug visible

# OUTPUT (example):
# expected 200000, got 143377`],
        [`<b>Limitations:</b> locks only help where you use them. One unguarded access path (a forgotten method) re-opens the race, and there is no built-in race detector in CPython.`,
            r`import threading

total = 0; lock = threading.Lock()

def safe_add():
    global total
    with lock:
        total += 1

def sloppy_add():                            # forgot the lock: the guard is useless
    global total
    total += 1

ts = ([threading.Thread(target=lambda: [safe_add() for _ in range(100000)])] +
      [threading.Thread(target=lambda: [sloppy_add() for _ in range(100000)])])
for t in ts: t.start()
for t in ts: t.join()
print("expected 200000, got", total)

# OUTPUT (example):
# expected 200000, got 187904`],
        `
   Thread A: read x(0) ───────────► write x(1)
   Thread B:          read x(0) ──► write x(1)       final x = 1, expected 2
                 ^^^ both read the old value before either wrote
`,
        `Design out sharing first: message passing via Queue, immutable snapshots, one owner thread per resource. When sharing is unavoidable, wrap the state in a class that owns its lock so callers cannot bypass it. Stress-test with a tiny switch interval and run tools such as ThreadSanitizer on native code.`
    ),

    'Deadlocks': dd(
        [`A <b>deadlock</b> happens when threads wait for each other forever: Thread A holds lock 1 and waits for lock 2 while thread B holds lock 2 and waits for lock 1. Nothing progresses and no error is raised.`,
            r`import threading, time

a, b = threading.Lock(), threading.Lock()

def t1():
    with a:
        time.sleep(0.1)
        got = b.acquire(timeout=0.5)         # timeout used so this demo ends
        print("t1 got b:", got)
        if got: b.release()

def t2():
    with b:
        time.sleep(0.1)
        got = a.acquire(timeout=0.5)
        print("t2 got a:", got)
        if got: a.release()

x = threading.Thread(target=t1); y = threading.Thread(target=t2)
x.start(); y.start(); x.join(); y.join()

# OUTPUT (both time out; without timeout the program would hang forever):
# t1 got b: False
# t2 got a: False`],
        [`Deadlocks freeze whole services (no crash, no log). Knowing the four conditions - mutual exclusion, hold-and-wait, no pre-emption, circular wait - tells you which one to break.`,
            r`# Break "circular wait": always take locks in one global order
import threading

a, b = threading.Lock(), threading.Lock()
order = {id(a): 1, id(b): 2}

def acquire_both(x, y):
    first, second = sorted((x, y), key=lambda l: order[id(l)])
    with first:
        with second:
            return "ok"

r1, r2 = [], []
t1 = threading.Thread(target=lambda: r1.append(acquire_both(a, b)))
t2 = threading.Thread(target=lambda: r2.append(acquire_both(b, a)))   # reversed args
t1.start(); t2.start(); t1.join(); t2.join()
print(r1, r2)

# OUTPUT:
# ['ok'] ['ok']`],
        [`Real cases: bank transfers locking two accounts in opposite order, a callback that takes a lock the caller already holds, and DB transactions waiting on each other's rows.`,
            r`import threading

accounts = {"A": 100, "B": 100}
locks = {"A": threading.Lock(), "B": threading.Lock()}

def transfer(src, dst, amt):
    first, second = sorted((src, dst))       # lock in alphabetical order always
    with locks[first], locks[second]:
        accounts[src] -= amt; accounts[dst] += amt

ts = [threading.Thread(target=transfer, args=("A", "B", 10)),
      threading.Thread(target=transfer, args=("B", "A", 30))]
for t in ts: t.start()
for t in ts: t.join()
print(accounts)

# OUTPUT:
# {'A': 120, 'B': 80}`],
        [`<b>Advantages of the prevention techniques:</b> lock ordering, timeouts and a single lock for the whole operation each remove one deadlock condition cheaply.`,
            r`import threading, time

lock = threading.Lock()
def try_work():
    if lock.acquire(timeout=0.1):            # give up instead of waiting forever
        try: return "done"
        finally: lock.release()
    return "backed off, will retry"

lock.acquire()                               # simulate a busy lock
print(try_work())
lock.release()
print(try_work())

# OUTPUT:
# backed off, will retry
# done`],
        [`<b>Disadvantages:</b> deadlocks are silent, timing dependent, and a detector is not built in. Timeouts only convert a hang into a retry problem (livelock risk).`,
            r`import threading, faulthandler, time

# Diagnose a hang: dump every thread's stack after N seconds
faulthandler.dump_traceback_later(0.3, exit=False)
lock = threading.Lock()
lock.acquire()
threading.Thread(target=lambda: lock.acquire(timeout=0.5)).start()
time.sleep(0.4)
faulthandler.cancel_dump_traceback_later()

# OUTPUT (example, to stderr):
# Timeout (0:00:00.300000)!
# Thread 0x... (most recent call first): File "...", line N in <lambda>`],
        [`<b>Limitations:</b> you cannot forcibly kill a blocked thread, and the standard library has no deadlock detector. Recovery usually means restarting the process.`,
            r`import threading
lock = threading.Lock()
lock.acquire()
t = threading.Thread(target=lock.acquire, daemon=True)   # blocks forever
t.start(); t.join(timeout=0.3)
print("thread still stuck:", t.is_alive())    # no API exists to kill it
# daemon=True only lets the program exit; it does not unblock the thread

# OUTPUT:
# thread still stuck: True`],
        `
   Thread A holds [L1] ──waits──► [L2]  held by Thread B
        ▲                                   │
        └────────── waits ◄── [L1] ◄────────┘     (circular wait)
`,
        `Prevent rather than detect: fixed lock ordering, one coarse lock, lock-free message passing, or timeouts with backoff. Keep lock scope small and never call external code under a lock. For databases, rely on the engine's deadlock detection and retry the transaction.`
    ),

    'Thread Pools': dd(
        [`A <b>thread pool</b> keeps a fixed set of worker threads alive and feeds them tasks, instead of creating a thread per task. In Python use <code>concurrent.futures.ThreadPoolExecutor</code>.`,
            r`from concurrent.futures import ThreadPoolExecutor

def square(n):
    return n * n

with ThreadPoolExecutor(max_workers=4) as pool:      # waits for tasks on exit
    results = list(pool.map(square, range(8)))       # results keep input order
print(results)

# OUTPUT:
# [0, 1, 4, 9, 16, 25, 36, 49]`],
        [`Creating thousands of threads is slow and exhausts memory. A pool reuses threads, limits concurrency, and gives you Futures for results and exceptions.`,
            r`from concurrent.futures import ThreadPoolExecutor
import time

def job(i):
    time.sleep(0.1)
    return i

t0 = time.perf_counter()
with ThreadPoolExecutor(max_workers=5) as pool:      # 20 jobs, 5 at a time
    list(pool.map(job, range(20)))
print(f"20 jobs on 5 threads: {time.perf_counter() - t0:.1f}s")   # 4 waves x 0.1

# OUTPUT (example):
# 20 jobs on 5 threads: 0.4s`],
        [`Real use: fetching many URLs, running many DB queries, resizing files, calling blocking SDKs. <code>as_completed</code> lets you handle results as soon as each finishes.`,
            r`from concurrent.futures import ThreadPoolExecutor, as_completed
import time

def fetch(url, delay):
    time.sleep(delay)
    return f"{url} ok"

with ThreadPoolExecutor(3) as pool:
    futs = [pool.submit(fetch, "slow.com", 0.3), pool.submit(fetch, "fast.com", 0.05),
            pool.submit(fetch, "mid.com", 0.15)]
    for f in as_completed(futs):                     # fastest first
        print(f.result())

# OUTPUT:
# fast.com ok
# mid.com ok
# slow.com ok`],
        [`<b>Advantages:</b> bounded resource use, thread reuse, clean exception propagation through <code>future.result()</code>, easy swap to ProcessPoolExecutor (same API).`,
            r`from concurrent.futures import ThreadPoolExecutor

def risky(n):
    if n == 2: raise ValueError("bad input 2")
    return n

with ThreadPoolExecutor(2) as pool:
    futs = [pool.submit(risky, i) for i in range(4)]
    for f in futs:
        try: print("ok", f.result())
        except ValueError as e: print("caught in caller:", e)

# OUTPUT:
# ok 0
# ok 1
# caught in caller: bad input 2
# ok 3`],
        [`<b>Disadvantages:</b> an unbounded work queue can eat memory, a task that blocks forever holds a worker forever, and nested submits to the same pool can deadlock.`,
            r`from concurrent.futures import ThreadPoolExecutor

pool = ThreadPoolExecutor(1)                 # only ONE worker

def outer():
    inner = pool.submit(lambda: 1)           # needs a worker, but outer occupies it
    return inner.result(timeout=0.5)         # would hang forever without timeout

f = pool.submit(outer)
try:
    f.result()
except Exception as e:
    print("pool deadlock detected:", type(e).__name__)
pool.shutdown()

# OUTPUT:
# pool deadlock detected: TimeoutError`],
        [`<b>Limitations:</b> still bound by the GIL for CPU work, workers are not cancellable once running, and the default size (min(32, cpu+4)) may be wrong for your workload.`,
            r`from concurrent.futures import ThreadPoolExecutor
import time

with ThreadPoolExecutor(1) as pool:
    f1 = pool.submit(time.sleep, 0.3)        # running
    f2 = pool.submit(time.sleep, 0.3)        # queued
    time.sleep(0.05)
    print("cancel queued:", f2.cancel())     # True: not started
    print("cancel running:", f1.cancel())    # False: too late

# OUTPUT:
# cancel queued: True
# cancel running: False`],
        `
   submit(task) ─► [ queue: t5 t4 t3 ] ─┬─► worker 1 ─┐
                                        ├─► worker 2 ─┼─► Future.result()
                                        └─► worker 3 ─┘
`,
        `Size pools to the downstream limit (DB connections, API quota), not to hope. Bound the queue, add timeouts to every task and keep separate pools per dependency (bulkheads) so one slow service cannot starve the rest. For huge fan-out of waits, asyncio scales further than threads.`
    )
};
