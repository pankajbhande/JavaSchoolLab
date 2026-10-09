// Module 21 (The GIL): deep dive entries.
import { dd, r, type DeepDive } from './deepDive';

export const m21a: Record<string, DeepDive> = {
    'What is the Global Interpreter Lock?': dd(
        [`The <b>GIL</b> is a mutex inside CPython: only ONE thread may execute Python bytecode at any instant. Threads still exist and interleave, but they take turns. The interpreter forces a switch request every "switch interval".`,
            r`import sys, threading

# How often the interpreter asks the running thread to give up the GIL
print("switch interval (s):", sys.getswitchinterval())

# Threads are real OS threads, but they take turns on the interpreter
def show():
    print("running in", threading.current_thread().name)

t = threading.Thread(target=show, name="worker-1")
t.start(); t.join()

# OUTPUT:
# switch interval (s): 0.005
# running in worker-1`],
        [`CPython manages memory with reference counts. Every object has a counter that is changed on nearly every operation. Without protection, two threads could corrupt a counter and free live memory, so a single global lock keeps the interpreter simple and safe.`,
            r`import sys

a = []                              # one reference: the name a
print(sys.getrefcount(a))           # +1 because the argument itself is a reference
b = a                               # second name, counter goes up
print(sys.getrefcount(a))
del b                               # counter goes down again
print(sys.getrefcount(a))

# OUTPUT:
# 2
# 3
# 2`],
        [`Every CPython web server, scraper and script you run lives under the GIL. Practical effect: threads are great for waiting (network, disk) because the GIL is released during blocking calls, but do not speed up pure-Python number crunching.`,
            r`import threading, time

def fetch(i):
    time.sleep(0.5)                 # blocking call RELEASES the GIL

t0 = time.perf_counter()
ts = [threading.Thread(target=fetch, args=(i,)) for i in range(5)]
for t in ts: t.start()
for t in ts: t.join()
print(f"5 x 0.5s sleeps took {time.perf_counter() - t0:.1f}s")

# OUTPUT (example):
# 5 x 0.5s sleeps took 0.5s`],
        [`<b>Advantages:</b> very fast single-threaded code (no per-object locks), simple C-extension writing, many built-in operations such as <code>list.append</code> are effectively atomic, no data-structure corruption at interpreter level.`,
            r`import threading

data = []
def add():
    for _ in range(100_000):
        data.append(1)              # one bytecode-level call: safe under the GIL

ts = [threading.Thread(target=add) for _ in range(4)]
for t in ts: t.start()
for t in ts: t.join()
print(len(data))                    # nothing lost, list never corrupted

# OUTPUT:
# 400000`],
        [`<b>Disadvantages:</b> CPU-bound threads do not run in parallel, so extra cores sit idle; multi-threaded CPU code can even be slower than single-threaded due to lock hand-off.`,
            r`import threading, time

def burn():
    n = 0
    for i in range(5_000_000):
        n += i * i

t0 = time.perf_counter(); burn(); burn()
serial = time.perf_counter() - t0

t0 = time.perf_counter()
ts = [threading.Thread(target=burn) for _ in range(2)]
for t in ts: t.start()
for t in ts: t.join()
threaded = time.perf_counter() - t0
print(f"serial {serial:.2f}s  threaded {threaded:.2f}s")

# OUTPUT (example - threaded is NOT ~2x faster):
# serial 0.85s  threaded 0.88s`],
        [`<b>Limitations:</b> the GIL does not make your code thread-safe: <code>x += 1</code> is several bytecodes and can interleave. It is a CPython detail, not part of the Python language (PyPy has one, Jython does not, free-threaded 3.13 can disable it).`,
            r`import sys, dis

# The GIL is an implementation detail; ask the interpreter about it (3.13+)
print("GIL enabled:", getattr(sys, "_is_gil_enabled", lambda: True)())

# x += 1 is NOT atomic: load, add, store are separate bytecodes
def inc():
    global x
    x += 1
dis.dis(inc)

# OUTPUT (example, 3.12, abridged):
# GIL enabled: True
#  LOAD_GLOBAL  x
#  LOAD_CONST   1
#  BINARY_OP    13 (+=)
#  STORE_GLOBAL x`],
        `
   Thread A ──┐                 ┌──────────────┐
   Thread B ──┼──► wait for ──► │  GIL (mutex) │ ──► runs bytecode
   Thread C ──┘     the lock    └──────────────┘     (one at a time)
                                      ▲
        released on: I/O, sleep, every 5 ms (switch interval)
`,
        `Treat the GIL as a scheduling fact: design I/O concurrency with threads or asyncio, CPU parallelism with processes, native extensions (NumPy, Rust) or free-threaded builds. Do not rely on "the GIL makes it safe" - it protects the interpreter, not your invariants. Avoid it as an excuse to skip locks.`
    ),

    'Why the GIL Exists': dd(
        [`The GIL exists because CPython's memory manager (reference counting) is not thread-safe. One coarse lock was the cheapest way to protect the counters, the allocator and all C extensions at once.`,
            r`import sys

x = object()
print(sys.getrefcount(x))           # counter value (includes the call argument)
y = x; z = x
print(sys.getrefcount(x))           # every new name increments the counter
# Two threads doing y = x at the same time would race on this counter
# unless something (the GIL) serialises the increments.

# OUTPUT:
# 2
# 4`],
        [`Without a global lock, CPython would need a fine-grained lock per object (slow, deadlock-prone) or atomic counters on every incref/decref (slow on every operation). Early Python (1990s) targeted single-core machines, and the GIL made C extensions trivially easy to write.`,
            r`# Illustrates the problem: a non-atomic read-modify-write.
# Simulated "refcount" shared by 2 workers, with an explicit pause to show the race.
import threading, time

count = 0
def incref():
    global count
    tmp = count                     # read
    time.sleep(0.001)               # another thread runs here
    count = tmp + 1                 # write back stale value

ts = [threading.Thread(target=incref) for _ in range(10)]
for t in ts: t.start()
for t in ts: t.join()
print("expected 10, got", count)

# OUTPUT (example):
# expected 10, got 1`],
        [`Because of this design, thousands of C libraries (NumPy, lxml, database drivers) assume the GIL protects their state. That huge ecosystem is the main reason it was not removed for decades.`,
            r`# Real code relying on the GIL: C-implemented containers mutate atomically
import threading
from collections import deque

q = deque()
def producer():
    for i in range(50_000):
        q.append(i)                 # deque.append is a single C call

ts = [threading.Thread(target=producer) for _ in range(3)]
for t in ts: t.start()
for t in ts: t.join()
print(len(q))

# OUTPUT:
# 150000`],
        [`<b>Advantages:</b> fast single-thread performance, simple implementation, easy C-API, deterministic memory release via refcounting (objects freed immediately when unreferenced).`,
            r`class Res:
    def __del__(self):
        print("freed immediately")

r1 = Res()
r1 = None                           # refcount hits 0 -> freed right now
print("after reassignment")

# OUTPUT:
# freed immediately
# after reassignment`],
        [`<b>Disadvantages:</b> parallel speedup on multi-core hardware is blocked for threads, and the lock adds latency when threads fight for it (the "convoy effect").`,
            r`import threading, time

# One CPU-heavy thread starves the I/O thread of GIL time slices
def cpu():
    end = time.perf_counter() + 1.0
    while time.perf_counter() < end: pass

lat = []
def ticker():
    for _ in range(5):
        t = time.perf_counter(); time.sleep(0.01)
        lat.append(time.perf_counter() - t - 0.01)

c = threading.Thread(target=cpu); k = threading.Thread(target=ticker)
c.start(); k.start(); c.join(); k.join()
print(f"max extra delay: {max(lat)*1000:.1f} ms")

# OUTPUT (example):
# max extra delay: 5.2 ms`],
        [`<b>Limitations:</b> only bytecode-level safety. Compound operations (check-then-act) still race, and the lock cannot be removed without breaking C extensions or slowing single-thread code (the reason PEP 703 is opt-in).`,
            r`import threading

balance = 100
def withdraw(n):
    global balance
    if balance >= n:                # check ...
        # a thread switch here lets another thread pass the same check
        balance -= n                # ... then act: not atomic as a pair

ts = [threading.Thread(target=withdraw, args=(80,)) for _ in range(2)]
for t in ts: t.start()
for t in ts: t.join()
print("balance:", balance)          # usually 20, but -60 is possible

# OUTPUT (example):
# balance: 20`],
        `
   Without GIL                         With GIL
   Thread A: refcnt = 5 -> 6           Thread A: [lock] 5 -> 6 [unlock]
   Thread B: refcnt = 5 -> 6   (lost)  Thread B:        [lock] 6 -> 7
   Result 6 (should be 7) -> crash     Result 7  (correct, one at a time)
`,
        `The GIL traded parallelism for simplicity and single-thread speed, and that bargain made sense for its era. Today the trade is revisited: PEP 703 free-threaded builds use biased reference counting and per-object locks. Choose the GIL build for compatibility, and free-threaded only after verifying every native dependency.`
    ),

    'CPU-bound vs I/O-bound Tasks': dd(
        [`A <b>CPU-bound</b> task spends its time computing (loops, math, compression). An <b>I/O-bound</b> task spends its time waiting (network, disk, database). The category decides which concurrency tool works.`,
            r`import time

def cpu_task():                     # CPU-bound: the CPU is busy the whole time
    return sum(i * i for i in range(2_000_000))

def io_task():                      # I/O-bound: mostly waiting, CPU idle
    time.sleep(0.2)

for f in (cpu_task, io_task):
    t0 = time.perf_counter(); f()
    print(f.__name__, f"{time.perf_counter() - t0:.2f}s")

# OUTPUT (example):
# cpu_task 0.14s
# io_task 0.20s`],
        [`Picking the wrong tool wastes effort: threads help only while waiting, processes help only when computing, and each has overhead. Measuring first tells you where the time goes.`,
            r`import time

before = time.process_time()
time.sleep(0.3)                     # waiting: wall time grows, CPU time does not
print("sleep burned CPU:", round(time.process_time() - before, 2), "s")
before = time.process_time()
sum(i for i in range(3_000_000))    # computing: CPU time grows with wall time
print("loop burned CPU > 0.05:", time.process_time() - before > 0.05)

# OUTPUT:
# sleep burned CPU: 0.0 s
# loop burned CPU > 0.05: True`],
        [`Web scraping, API calls, DB queries and file downloads are I/O-bound (use threads or asyncio). Image resizing, ML training, video encoding, hashing and simulations are CPU-bound (use processes or native code).`,
            r`import concurrent.futures as cf, time

def download(url):                  # I/O-bound stand-in
    time.sleep(0.3)
    return url

urls = [f"site{i}.com" for i in range(6)]
t0 = time.perf_counter()
with cf.ThreadPoolExecutor(max_workers=6) as pool:
    done = list(pool.map(download, urls))
print(len(done), f"pages in {time.perf_counter() - t0:.1f}s")

# OUTPUT (example):
# 6 pages in 0.3s`],
        [`<b>Advantages of classifying:</b> a one-line profile tells you the right model, so I/O work scales to thousands of waits on one core and CPU work scales to the core count.`,
            r`import os
print("cores available:", os.cpu_count())
# Rule of thumb for worker counts:
#   CPU-bound -> os.cpu_count()          (more just adds contention)
#   I/O-bound -> many (10s-1000s)        (they spend time idle)
cpu_workers = os.cpu_count()
io_workers = min(32, (os.cpu_count() or 1) + 4)   # default used by ThreadPoolExecutor
print(cpu_workers, io_workers)

# OUTPUT (example, 8-core machine):
# cores available: 8
# 8 12`],
        [`<b>Disadvantages:</b> real tasks are mixed (download then parse), so the boundary blurs, and wrong guesses give no speedup or even a slowdown.`,
            r`import concurrent.futures as cf, time

def crunch(n):                      # CPU-bound given to THREADS: wrong choice
    return sum(i * i for i in range(n))

t0 = time.perf_counter()
with cf.ThreadPoolExecutor(4) as pool:
    list(pool.map(crunch, [2_000_000] * 4))
print(f"4 CPU jobs in threads: {time.perf_counter() - t0:.2f}s (no better than serial)")

# OUTPUT (example):
# 4 CPU jobs in threads: 0.62s (no better than serial)`],
        [`<b>Limitations:</b> libraries like NumPy and hashlib release the GIL during heavy C work, so some "CPU-bound" tasks DO scale with threads - you must measure, not assume.`,
            r`import hashlib, threading, time

blob = b"x" * 50_000_000            # 50 MB

def digest():
    hashlib.sha256(blob).hexdigest()  # releases the GIL for large buffers

t0 = time.perf_counter()
ts = [threading.Thread(target=digest) for _ in range(4)]
for t in ts: t.start()
for t in ts: t.join()
print(f"4 hashes in threads: {time.perf_counter() - t0:.2f}s (parallel in C)")

# OUTPUT (example):
# 4 hashes in threads: 0.14s (parallel in C)`],
        `
              ┌─────────────── What is the task waiting on? ───────────────┐
              │                                                            │
        the network / disk / DB                              the CPU itself
              │                                                            │
        I/O-bound ──► threads / asyncio              CPU-bound ──► multiprocessing /
                      (GIL released while waiting)                 NumPy / Rust / free-threaded
`,
        `Profile before choosing (cProfile, py-spy, wall vs process_time). Mixed pipelines are best split: async or threads for the I/O stage, a process pool for the compute stage, linked by queues. Prefer vectorised or native libraries over parallelising pure-Python loops.`
    ),

    'Threads vs Processes': dd(
        [`A <b>thread</b> is a lightweight execution path inside one process and shares its memory. A <b>process</b> is an independent program instance with its own memory and its own interpreter (so its own GIL).`,
            r`import os, threading, multiprocessing as mp

def who(tag):
    print(tag, "pid", os.getpid() == MAIN_PID and "same as parent" or "different")

MAIN_PID = os.getpid()
if __name__ == "__main__":
    t = threading.Thread(target=who, args=("thread:",)); t.start(); t.join()
    p = mp.Process(target=who, args=("process:",)); p.start(); p.join()

# OUTPUT (on Linux/fork; Windows re-imports the module and differs slightly):
# thread: pid same as parent
# process: pid different`],
        [`Threads give cheap concurrency and easy data sharing but are limited by the GIL for CPU work. Processes give true parallelism and fault isolation but cost more memory/startup and need explicit data passing.`,
            r`import threading, multiprocessing as mp

counter = 0
def bump():
    global counter
    counter += 1

if __name__ == "__main__":
    t = threading.Thread(target=bump); t.start(); t.join()
    print("after thread :", counter)      # memory shared -> change visible
    p = mp.Process(target=bump); p.start(); p.join()
    print("after process:", counter)      # child changed ITS OWN copy only

# OUTPUT:
# after thread : 1
# after process: 1`],
        [`Use threads for web request handlers waiting on databases, GUI background work and polling. Use processes for batch image/video jobs, data crunching, and isolating untrusted or crash-prone code (a segfault kills only that worker).`,
            r`import multiprocessing as mp

def crash():
    import os; os._exit(1)          # simulate a hard crash of a worker

if __name__ == "__main__":
    p = mp.Process(target=crash); p.start(); p.join()
    print("parent still alive, child exit code:", p.exitcode)
    # a crashing THREAD (e.g. in C code) would take the whole process down

# OUTPUT:
# parent still alive, child exit code: 1`],
        [`<b>Advantages:</b> threads - low overhead, shared state, millisecond startup. Processes - real multi-core speedup, memory isolation, no GIL contention between workers.`,
            r`import multiprocessing as mp, time

def burn(n): return sum(i * i for i in range(n))

if __name__ == "__main__":
    t0 = time.perf_counter()
    with mp.Pool(4) as pool:
        pool.map(burn, [3_000_000] * 4)           # 4 jobs on 4 cores
    print(f"4 CPU jobs in processes: {time.perf_counter() - t0:.2f}s")

# OUTPUT (example, 4+ cores - roughly 1 job's time, not 4x):
# 4 CPU jobs in processes: 0.31s`],
        [`<b>Disadvantages:</b> threads - races, deadlocks and no CPU parallelism. Processes - memory per worker, slow startup (especially "spawn"), arguments and results must be pickled.`,
            r`import pickle

# Everything sent to another process is pickled; some objects cannot be
data = {"ok": [1, 2, 3]}
print(len(pickle.dumps(data)), "bytes serialised")
try:
    pickle.dumps(lambda x: x)       # lambdas / open files / locks cannot cross
except Exception as e:
    print(type(e).__name__, "-", str(e)[:48])

# OUTPUT (example):
# 33 bytes serialised
# PicklingError - Can't pickle <function <lambda> at 0x000001>`],
        [`<b>Limitations:</b> processes cannot share ordinary objects, and there is an OS cap on both (thousands of threads, hundreds of processes before memory hurts). Start method differs by OS.`,
            r`import multiprocessing as mp

if __name__ == "__main__":
    # fork: Linux default (fast, copies memory); spawn: Windows/macOS default
    # (fresh interpreter, re-imports the main module - hence the __main__ guard)
    print("default start method:", mp.get_start_method())
    print("available:", mp.get_all_start_methods())

# OUTPUT (example, Windows):
# default start method: spawn
# available: ['spawn']`],
        `
   THREADS (1 process)                 PROCESSES
  ┌──────────────────────┐      ┌─────────────┐  ┌─────────────┐
  │ shared memory + GIL  │      │ memory + GIL│  │ memory + GIL│
  │  T1   T2   T3        │      │   main      │  │   worker    │
  └──────────────────────┘      └──────┬──────┘  └──────▲──────┘
   share objects directly              └── pickle / pipe ┘
`,
        `Default to threads/asyncio for I/O and processes for CPU, but in production prefer a managed pool (ProcessPoolExecutor, Celery, task queues) over hand-rolled workers. Keep payloads small, avoid shared mutable state, and consider whether horizontal scaling (more containers) beats in-process parallelism.`
    ),

    'GIL Limitations': dd(
        [`GIL limitations are the situations where the lock hurts or fails to help: CPU-bound threads, lock contention, and misunderstanding that it makes your code thread-safe. It limits parallelism, not correctness.`,
            r`import threading, time

def count(n):
    while n: n -= 1

N = 10_000_000
t0 = time.perf_counter(); count(N); count(N)
print(f"sequential: {time.perf_counter() - t0:.2f}s")

t0 = time.perf_counter()
a = threading.Thread(target=count, args=(N,)); b = threading.Thread(target=count, args=(N,))
a.start(); b.start(); a.join(); b.join()
print(f"2 threads : {time.perf_counter() - t0:.2f}s")

# OUTPUT (example):
# sequential: 0.62s
# 2 threads : 0.65s`],
        [`You need to know these limits to avoid designing a "multi-threaded speedup" that never arrives, and to avoid shipping races that the GIL merely hides most of the time.`,
            r`import threading

total = 0
def work():
    global total
    for _ in range(200_000):
        total += 1                  # read, add, write: interleavable

ts = [threading.Thread(target=work) for _ in range(4)]
for t in ts: t.start()
for t in ts: t.join()
print("expected 800000, got", total)

# OUTPUT (example - varies by version/run; 3.12 often loses updates):
# expected 800000, got 412733`],
        [`Real symptoms: a Flask/Django worker pool using threads maxes out ONE core while others idle; a data-processing script shows 100 percent on one CPU only. Fix by running several worker processes (gunicorn -w N).`,
            r`import os, time

# Quick check you can run: measure CPU use vs wall time of the process
t0, c0 = time.perf_counter(), time.process_time()
sum(i * i for i in range(3_000_000))
wall = time.perf_counter() - t0
cpu = time.process_time() - c0
print(f"cpu/wall ratio: {cpu / wall:.2f}  (max 1.0 for threaded pure Python)")

# OUTPUT (example):
# cpu/wall ratio: 1.00  (max 1.0 for threaded pure Python)`],
        [`<b>Advantages of knowing the limits:</b> you can choose the right escape hatch: processes, native extensions that release the GIL, subinterpreters or free-threaded builds.`,
            r`# Escape hatch 1: processes (own GIL each)
from concurrent.futures import ProcessPoolExecutor

def sq(n): return sum(i * i for i in range(n))

if __name__ == "__main__":
    with ProcessPoolExecutor(2) as ex:
        print(list(ex.map(sq, [10, 100, 1000])))

# OUTPUT:
# [285, 328350, 332833500]`],
        [`<b>Disadvantages:</b> the workarounds cost something: process pools add pickling and memory, native code adds a build chain, and thread-based speedups are unpredictable.`,
            r`import time, pickle
from concurrent.futures import ProcessPoolExecutor

def passthrough(x): return len(x)

if __name__ == "__main__":
    big = list(range(2_000_000))
    t0 = time.perf_counter()
    with ProcessPoolExecutor(2) as ex:
        ex.submit(passthrough, big).result()
    print(f"sending 2M ints to a worker cost {time.perf_counter() - t0:.2f}s of mostly pickling")

# OUTPUT (example):
# sending 2M ints to a worker cost 0.45s of mostly pickling`],
        [`<b>Limitations:</b> even with the GIL, race conditions on compound operations remain, and the GIL gives no ordering guarantees between threads or fairness.`,
            r`import threading, time

order = []
def w(name):
    for _ in range(3):
        order.append(name); time.sleep(0)   # yield to the scheduler

ts = [threading.Thread(target=w, args=(n,)) for n in "ABC"]
for t in ts: t.start()
for t in ts: t.join()
print("".join(order))                       # order is not guaranteed

# OUTPUT (example - varies):
# ABCABCABC`],
        `
   4 threads, 4 cores, pure Python
   core1 ██░░██░░██░░      only one thread holds the GIL at a time,
   core2 ░░██░░██░░██      so total CPU use is ~1 core even though
   core3 ░░░░░░░░░░░░      threads exist on all cores' schedulers
   core4 ░░░░░░░░░░░░
`,
        `Treat "uses one core" as a capacity-planning input: scale out with processes per core. If a service is CPU-bound and latency-sensitive, move the hot loop to native code rather than adding threads. Test any thread-based design under free-threaded Python before relying on accidental GIL protection.`
    ),

    'Free-Threaded Python': dd(
        [`<b>Free-threaded Python</b> (PEP 703, experimental in 3.13, "python3.13t") is a CPython build without the GIL. Threads then truly run Python bytecode in parallel on several cores.`,
            r`import sys, sysconfig

# Is this a free-threaded build, and is the GIL actually off right now?
print("Py_GIL_DISABLED build flag:", sysconfig.get_config_var("Py_GIL_DISABLED"))
print("GIL enabled now:", getattr(sys, "_is_gil_enabled", lambda: True)())

# OUTPUT (example, standard 3.13 build):
# Py_GIL_DISABLED build flag: 0
# GIL enabled now: True`],
        [`Multi-core CPUs are the norm, but the GIL makes pure-Python threads use one core. Removing it lets CPU-bound threaded code scale without the pickling and memory cost of processes.`,
            r`import threading, time

def burn(n=3_000_000):
    s = 0
    for i in range(n): s += i
    return s

t0 = time.perf_counter()
ts = [threading.Thread(target=burn) for _ in range(4)]
for t in ts: t.start()
for t in ts: t.join()
print(f"4 CPU threads: {time.perf_counter() - t0:.2f}s")

# OUTPUT (example):
# GIL build : 4 CPU threads: 0.90s   (serialised)
# python3.13t: 4 CPU threads: 0.26s  (parallel on 4 cores)`],
        [`Early adopters: data pipelines, in-memory servers and ML preprocessing that want shared in-process state across cores. You can also pick the mode at run time with <code>PYTHON_GIL=0</code> or <code>-X gil=0</code> on a free-threaded build.`,
            r`# Shell usage (not Python code) - run a script with the GIL forced on/off:
#   python3.13t -X gil=0 app.py
#   PYTHON_GIL=1 python3.13t app.py
# Inside the script, branch on what you got:
import sys
if getattr(sys, "_is_gil_enabled", lambda: True)():
    print("GIL on: use multiprocessing for CPU work")
else:
    print("GIL off: threads can use all cores")

# OUTPUT (example, standard build):
# GIL on: use multiprocessing for CPU work`],
        [`<b>Advantages:</b> real thread parallelism, shared memory without pickling, simpler architecture for CPU work that must share large state.`,
            r`import threading

big_table = list(range(1_000_000))          # shared read-only data: no copy per worker
results = [0] * 4

def part(i):
    chunk = big_table[i::4]
    results[i] = sum(chunk)                 # each thread writes its own slot

ts = [threading.Thread(target=part, args=(i,)) for i in range(4)]
for t in ts: t.start()
for t in ts: t.join()
print(sum(results))

# OUTPUT:
# 499999500000`],
        [`<b>Disadvantages:</b> single-thread code is slower (about 5-10 percent in 3.13), memory use is higher, and previously "accidentally safe" code now races for real.`,
            r`import threading

stats = {"hits": 0}
lock = threading.Lock()

def hit():
    for _ in range(100_000):
        # Without the GIL this unguarded += would lose updates far more often.
        with lock:
            stats["hits"] += 1

ts = [threading.Thread(target=hit) for _ in range(4)]
for t in ts: t.start()
for t in ts: t.join()
print(stats["hits"])                         # correct only because of the lock

# OUTPUT:
# 400000`],
        [`<b>Limitations:</b> still experimental; C extensions must declare support (otherwise the GIL is re-enabled at import), and some wheels are missing for the "t" ABI.`,
            r`import sys, importlib

# On a free-threaded build, importing an extension that is not marked safe
# re-enables the GIL and warns. You can check afterwards:
import json                                   # pure stdlib: safe
print("GIL enabled after import:", getattr(sys, "_is_gil_enabled", lambda: True)())

# OUTPUT (example, 3.13t with only safe modules):
# GIL enabled after import: False
# (with an unsupported extension: RuntimeWarning, then True)`],
        `
   Standard build                         Free-threaded build (3.13t)
   T1 T2 T3 T4                            T1 T2 T3 T4
    \ | | /                                |  |  |  |
   [  GIL  ]  -> 1 core busy             per-object locks + biased refcounts
       |                                  |  |  |  |
     bytecode                           core1 core2 core3 core4 busy
`,
        `Adopt free-threading selectively: benchmark single-thread regressions, audit native dependencies, and add explicit locks or immutable data around shared state. Until the ecosystem is fully ready, process pools remain the safer default for production CPU parallelism, and subinterpreters (3.12+) are another middle path.`
    )
};
