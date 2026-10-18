// Module 23 (Multiprocessing): deep dive entries.
import { dd, r, type DeepDive } from './deepDive';

export const m23a: Record<string, DeepDive> = {
    'Creating Processes': dd(
        [`<code>multiprocessing.Process</code> starts a separate Python interpreter running your function. The API mirrors <code>threading.Thread</code>: <code>start()</code>, <code>join()</code>, plus <code>pid</code> and <code>exitcode</code>.`,
            r`import multiprocessing as mp, os

def hello(name):
    print(f"hello {name} from child, different pid: {os.getpid() != PARENT}")

PARENT = os.getpid()

if __name__ == "__main__":                   # REQUIRED on Windows/macOS (spawn)
    p = mp.Process(target=hello, args=("world",))
    p.start(); p.join()
    print("child exit code:", p.exitcode)

# OUTPUT:
# hello world from child, different pid: True
# child exit code: 0`],
        [`Each process has its own GIL and memory, so CPU-bound work runs on several cores at once and a crash in one worker does not kill the others.`,
            r`import multiprocessing as mp, time

def burn(n):
    sum(i * i for i in range(n))

if __name__ == "__main__":
    t0 = time.perf_counter()
    ps = [mp.Process(target=burn, args=(4_000_000,)) for _ in range(4)]
    for p in ps: p.start()
    for p in ps: p.join()
    print(f"4 processes: {time.perf_counter() - t0:.2f}s (about one job's time on 4 cores)")

# OUTPUT (example):
# 4 processes: 0.42s (about one job's time on 4 cores)`],
        [`Real use: parallel image or video conversion, running untrusted plugins in isolation, per-core web workers (gunicorn, uvicorn), long batch jobs.`,
            r`import multiprocessing as mp

def worker(i, out):
    out.put(f"result-{i}")                   # send data back through a Queue

if __name__ == "__main__":
    q = mp.Queue()
    ps = [mp.Process(target=worker, args=(i, q)) for i in range(3)]
    for p in ps: p.start()
    got = sorted(q.get() for _ in ps)        # read BEFORE join to avoid blocking
    for p in ps: p.join()
    print(got)

# OUTPUT:
# ['result-0', 'result-1', 'result-2']`],
        [`<b>Advantages:</b> true parallelism, isolation (own memory and crashes), works with unmodified pure-Python code, can be terminated from outside.`,
            r`import multiprocessing as mp, time

def forever():
    while True: time.sleep(1)

if __name__ == "__main__":
    p = mp.Process(target=forever); p.start()
    time.sleep(0.2)
    p.terminate(); p.join()                  # threads cannot be killed this way
    print("alive:", p.is_alive(), "exitcode:", p.exitcode)

# OUTPUT (example, Linux; Windows shows 1):
# alive: False exitcode: -15`],
        [`<b>Disadvantages:</b> heavy start-up (a fresh interpreter), higher memory, data must be pickled, and debugging across processes is harder.`,
            r`import multiprocessing as mp, time

def noop(): pass

if __name__ == "__main__":
    t0 = time.perf_counter()
    for _ in range(10):
        p = mp.Process(target=noop); p.start(); p.join()
    print(f"10 process starts: {(time.perf_counter() - t0) * 1000:.0f} ms")
    # threads would take under 5 ms for the same job

# OUTPUT (example, Windows spawn):
# 10 process starts: 650 ms`],
        [`<b>Limitations:</b> child changes to globals are not visible to the parent, the target must be importable (no lambdas under spawn), and forgetting the <code>__main__</code> guard causes endless recursive spawning.`,
            r`import multiprocessing as mp

state = {"n": 0}

def change():
    state["n"] = 99                          # modifies the CHILD's copy only

if __name__ == "__main__":
    p = mp.Process(target=change); p.start(); p.join()
    print("parent sees:", state["n"])
    # mp.Process(target=lambda: 1).start() fails under spawn: cannot pickle lambda

# OUTPUT:
# parent sees: 0`],
        `
   parent (pid 100)
      │ Process(target=f).start()
      ├────────────────► child (pid 101)  own memory, own GIL, runs f()
      │                       │
      │◄── join() / exitcode ─┘     data back only via Queue / Pipe / return files
`,
        `Use plain Process objects for long-lived specialised workers (a supervisor model); use pools or ProcessPoolExecutor for many short tasks. Pin the start method explicitly (spawn is the safest, fork can break with threads or CUDA), keep arguments small, and make workers idempotent so a crash can be retried.`
    ),

    'Process Pools': dd(
        [`A <b>process pool</b> keeps N worker processes alive and distributes calls over them. <code>multiprocessing.Pool</code> and <code>concurrent.futures.ProcessPoolExecutor</code> avoid paying process start-up for every task.`,
            r`from multiprocessing import Pool

def square(n):
    return n * n

if __name__ == "__main__":
    with Pool(processes=4) as pool:
        print(pool.map(square, range(10)))   # splits the list across workers

# OUTPUT:
# [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]`],
        [`Starting a process per task is far too slow for thousands of tasks. A pool amortises start-up and automatically balances the work over cores.`,
            r`from concurrent.futures import ProcessPoolExecutor
import time

def heavy(n):
    return sum(i * i for i in range(n))

if __name__ == "__main__":
    jobs = [2_000_000] * 8
    t0 = time.perf_counter(); [heavy(n) for n in jobs]
    serial = time.perf_counter() - t0
    t0 = time.perf_counter()
    with ProcessPoolExecutor() as ex:        # default workers = os.cpu_count()
        list(ex.map(heavy, jobs))
    print(f"serial {serial:.2f}s  pool {time.perf_counter() - t0:.2f}s")

# OUTPUT (example, 4 cores):
# serial 1.10s  pool 0.38s`],
        [`Real use: batch image resize, data-frame chunk processing, Monte Carlo simulation, parsing large log files in chunks, test-suite parallelism (pytest-xdist).`,
            r`from multiprocessing import Pool
import re

def count_errors(chunk):
    return sum(1 for line in chunk if re.search(r"ERROR", line))

if __name__ == "__main__":
    lines = ["ERROR a", "INFO b", "ERROR c", "INFO d", "ERROR e", "INFO f"]
    chunks = [lines[i:i + 2] for i in range(0, len(lines), 2)]   # 3 chunks
    with Pool(3) as pool:
        print("total errors:", sum(pool.map(count_errors, chunks)))

# OUTPUT:
# total errors: 3`],
        [`<b>Advantages:</b> simple <code>map</code>/<code>imap_unordered</code>/<code>apply_async</code> API, automatic chunking, errors re-raised in the parent, easy cleanup with <code>with</code>.`,
            r`from concurrent.futures import ProcessPoolExecutor

def risky(n):
    if n == 3: raise ValueError("bad 3")
    return n * 10

if __name__ == "__main__":
    with ProcessPoolExecutor(2) as ex:
        futs = [ex.submit(risky, i) for i in range(5)]
        for f in futs:
            try: print(f.result())
            except ValueError as e: print("worker error ->", e)

# OUTPUT:
# 0
# 10
# 20
# worker error -> bad 3
# 40`],
        [`<b>Disadvantages:</b> every argument and result is pickled and copied; tiny tasks cost more in overhead than they save.`,
            r`from multiprocessing import Pool
import time

def tiny(x): return x + 1

if __name__ == "__main__":
    data = list(range(200_000))
    t0 = time.perf_counter(); [tiny(x) for x in data]
    serial = time.perf_counter() - t0
    t0 = time.perf_counter()
    with Pool(4) as p: p.map(tiny, data)
    print(f"serial {serial:.3f}s  pool {time.perf_counter() - t0:.3f}s (pool slower)")

# OUTPUT (example):
# serial 0.012s  pool 0.210s (pool slower)`],
        [`<b>Limitations:</b> a worker killed by the OS can hang <code>Pool</code> (ProcessPoolExecutor raises BrokenProcessPool), tasks must be picklable top-level functions, and workers keep module-level state between tasks.`,
            r`from concurrent.futures import ProcessPoolExecutor
import os

def die(_):
    os._exit(1)                              # worker dies abruptly

if __name__ == "__main__":
    with ProcessPoolExecutor(1) as ex:
        try:
            ex.submit(die, 0).result()
        except Exception as e:
            print(type(e).__name__)

# OUTPUT:
# BrokenProcessPool`],
        `
   main ─► submit/map ─► [ task queue ] ─┬─► worker P1 ─┐
                                         ├─► worker P2 ─┼─► results queue ─► main
                                         └─► worker P3 ─┘
           args pickled ──►                         ◄── results pickled
`,
        `Choose chunksize deliberately (larger chunks cut IPC overhead), use initializer functions to load heavy read-only resources once per worker, and set max_tasks_per_child to recycle leaking workers. If tasks are tiny or data is huge, vectorise with NumPy or use shared memory instead.`
    ),

    'IPC: Queue & Pipe': dd(
        [`<b>Inter-process communication (IPC)</b>: since processes do not share memory, they exchange data via a <code>Queue</code> (many producers and consumers, thread/process safe) or a <code>Pipe</code> (a fast two-ended connection between two processes).`,
            r`import multiprocessing as mp

def child(conn):
    conn.send({"msg": "hi parent"})          # any picklable object
    print("child got:", conn.recv())
    conn.close()

if __name__ == "__main__":
    parent_end, child_end = mp.Pipe()        # two connected ends
    p = mp.Process(target=child, args=(child_end,)); p.start()
    print("parent got:", parent_end.recv())
    parent_end.send("hi child")
    p.join()

# OUTPUT:
# parent got: {'msg': 'hi parent'}
# child got: hi child`],
        [`Workers need to receive jobs and return results. Queues give a safe, ordered hand-off without locks you write yourself.`,
            r`import multiprocessing as mp

def worker(jobs, results):
    for n in iter(jobs.get, None):           # None is the stop sentinel
        results.put((n, n * n))

if __name__ == "__main__":
    jobs, results = mp.Queue(), mp.Queue()
    p = mp.Process(target=worker, args=(jobs, results)); p.start()
    for n in range(4): jobs.put(n)
    jobs.put(None)
    out = [results.get() for _ in range(4)]
    p.join()
    print(out)

# OUTPUT:
# [(0, 0), (1, 1), (2, 4), (3, 9)]`],
        [`Real use: work-queue architectures (one producer feeding many workers), a logging process receiving records from workers, a pipeline of stages connected by queues.`,
            r`import multiprocessing as mp

def log_listener(q):
    while True:
        rec = q.get()
        if rec is None: break
        print("LOG:", rec)                   # one process owns the output

def work(i, q):
    q.put(f"worker {i} finished")

if __name__ == "__main__":
    q = mp.Queue()
    lg = mp.Process(target=log_listener, args=(q,)); lg.start()
    ws = [mp.Process(target=work, args=(i, q)) for i in range(2)]
    for w in ws: w.start()
    for w in ws: w.join()
    q.put(None); lg.join()

# OUTPUT (example - order of the two lines varies):
# LOG: worker 0 finished
# LOG: worker 1 finished`],
        [`<b>Advantages:</b> safe without explicit locks, decouples producers from consumers, works across any number of processes; Pipe is faster for exactly two endpoints.`,
            r`import multiprocessing as mp

if __name__ == "__main__":
    q = mp.Queue(maxsize=2)                  # bounded: gives back-pressure
    q.put(1); q.put(2)
    try:
        q.put(3, timeout=0.2)                # full: producer is slowed down
    except Exception as e:
        print("queue full ->", type(e).__name__)

# OUTPUT:
# queue full -> Full`],
        [`<b>Disadvantages:</b> every item is pickled and copied, large objects are slow, and the classic deadlock is joining a process before draining the queue it fills.`,
            r`import multiprocessing as mp

def producer(q):
    for i in range(100_000):
        q.put("x" * 100)                     # pipe buffer fills, process blocks in exit

if __name__ == "__main__":
    q = mp.Queue()
    p = mp.Process(target=producer, args=(q,)); p.start()
    p.join(timeout=1)                        # WRONG order: would hang without timeout
    print("producer finished before draining?", p.exitcode is not None)
    for _ in range(100_000): q.get()         # drain first, then join
    p.join()

# OUTPUT (example):
# producer finished before draining? False`],
        [`<b>Limitations:</b> a Pipe has only two endpoints and is not safe with several readers on one end, <code>Queue.qsize()</code> is unreliable (and missing on macOS), and objects must be picklable.`,
            r`import multiprocessing as mp, threading

if __name__ == "__main__":
    q = mp.Queue()
    try:
        q.put(threading.Lock())              # locks cannot be pickled
        q.close(); q.join_thread()
    except Exception as e:
        print(type(e).__name__)

# OUTPUT (the error is raised in the feeder thread; shown on stderr):
# TypeError: cannot pickle '_thread.lock' object`],
        `
   producer ─put()─► [ pickle ► pipe ► unpickle ] ─get()─► consumer
   proc A   <═══════ Pipe: duplex, 2 ends only ═══════> proc B
   procs A,B,C ─► one Queue ─► procs X,Y   (many-to-many, built on Pipe + locks)
`,
        `Use sentinels or a stop Event for shutdown, bound queues for back-pressure, and keep messages small (send file paths or ids, not payloads). For cross-machine or durable messaging step up to Redis, RabbitMQ or Kafka; in-memory queues vanish when the process dies.`
    ),

    'Shared Memory': dd(
        [`<b>Shared memory</b> lets processes read and write the same block of RAM without pickling. Options: <code>multiprocessing.Value</code>/<code>Array</code> (small typed values) and <code>multiprocessing.shared_memory.SharedMemory</code> (raw buffer, 3.8+).`,
            r`import multiprocessing as mp

def add_one(counter):
    with counter.get_lock():                 # Value carries its own lock
        counter.value += 1

if __name__ == "__main__":
    counter = mp.Value("i", 0)               # shared C int, initial 0
    ps = [mp.Process(target=add_one, args=(counter,)) for _ in range(4)]
    for p in ps: p.start()
    for p in ps: p.join()
    print("counter:", counter.value)

# OUTPUT:
# counter: 4`],
        [`Copying a 500 MB array to each worker wastes time and RAM. Shared memory gives all workers a view of the same bytes, so only the work, not the data, is distributed.`,
            r`from multiprocessing import shared_memory, Process

def fill(name, size):
    shm = shared_memory.SharedMemory(name=name)      # attach by name
    for i in range(size): shm.buf[i] = i * 2          # write into the same RAM
    shm.close()

if __name__ == "__main__":
    shm = shared_memory.SharedMemory(create=True, size=5)
    p = Process(target=fill, args=(shm.name, 5)); p.start(); p.join()
    print(list(shm.buf[:5]))                          # parent sees child's writes
    shm.close(); shm.unlink()                         # free the block

# OUTPUT:
# [0, 2, 4, 6, 8]`],
        [`Real use: NumPy arrays shared by workers (image tiles, matrices, ML features), shared counters and flags, and zero-copy hand-off of large buffers.`,
            r`import numpy as np
from multiprocessing import shared_memory, Process

def double(name, shape):
    shm = shared_memory.SharedMemory(name=name)
    a = np.ndarray(shape, dtype=np.int64, buffer=shm.buf)   # view, no copy
    a *= 2
    shm.close()

if __name__ == "__main__":
    src = np.arange(6, dtype=np.int64)
    shm = shared_memory.SharedMemory(create=True, size=src.nbytes)
    a = np.ndarray(src.shape, dtype=src.dtype, buffer=shm.buf); a[:] = src
    p = Process(target=double, args=(shm.name, src.shape)); p.start(); p.join()
    print(a)
    shm.close(); shm.unlink()

# OUTPUT:
# [ 0  2  4  6  8 10]`],
        [`<b>Advantages:</b> zero-copy, very fast, constant memory regardless of worker count, ideal for large numeric data.`,
            r`from multiprocessing import Array, Process

def set_cell(arr, i):
    arr[i] = i * i                            # each worker writes its own slot

if __name__ == "__main__":
    arr = Array("i", 5)                       # 5 shared ints, zero-filled
    ps = [Process(target=set_cell, args=(arr, i)) for i in range(5)]
    for p in ps: p.start()
    for p in ps: p.join()
    print(list(arr))                          # no pickling of the array contents

# OUTPUT:
# [0, 1, 4, 9, 16]`],
        [`<b>Disadvantages:</b> YOU own synchronisation (races return), you must unlink blocks to avoid leaks, and only flat bytes or C types fit, not Python objects.`,
            r`from multiprocessing import Value, Process

def sloppy(v):
    for _ in range(50_000):
        v.value += 1                          # no lock: read-modify-write race

if __name__ == "__main__":
    v = Value("i", 0, lock=False)
    ps = [Process(target=sloppy, args=(v,)) for _ in range(4)]
    for p in ps: p.start()
    for p in ps: p.join()
    print("expected 200000, got", v.value)

# OUTPUT (example):
# expected 200000, got 71230`],
        [`<b>Limitations:</b> fixed size at creation, no lists, dicts or custom objects, and a leaked block outlives the program on Linux (<code>/dev/shm</code>) until unlinked.`,
            r`from multiprocessing import shared_memory

shm = shared_memory.SharedMemory(create=True, size=4)
try:
    shm.buf[:6] = b"toolong"                  # cannot grow: the size is fixed
except ValueError as e:
    print("ValueError:", e)
shm.close(); shm.unlink()                     # always clean up

# OUTPUT (example; the block is page-aligned on some OSes):
# ValueError: memoryview assignment: lvalue and rvalue have different structures`],
        `
   Process A ──┐           ┌───────────────────────┐
               ├─ attach ─►│ shared RAM block      │  one copy of the data
   Process B ──┘           │ [ 0 | 2 | 4 | 6 | 8 ] │  both see changes instantly
                           └───────────────────────┘
   (no pickling)           needs a Lock / careful ownership to avoid races
`,
        `Shared memory suits big, flat, numeric data with clear partition ownership (each worker writes a disjoint slice, so no locks). For irregular objects use a Manager or messaging. Mind the lifecycle: one owner creates and unlinks, workers only attach and close.`
    ),

    'CPU-bound Workloads': dd(
        [`<b>CPU-bound workloads</b> keep the processor busy computing. In CPython the standard fix is to split the work into chunks and run them on separate processes so every core is used.`,
            r`from concurrent.futures import ProcessPoolExecutor

def count_primes(lo_hi):
    lo, hi = lo_hi
    return sum(all(n % d for d in range(2, int(n ** 0.5) + 1)) for n in range(max(lo, 2), hi))

if __name__ == "__main__":
    ranges = [(0, 25_000), (25_000, 50_000), (50_000, 75_000), (75_000, 100_000)]
    with ProcessPoolExecutor() as ex:
        print("primes below 100000:", sum(ex.map(count_primes, ranges)))

# OUTPUT:
# primes below 100000: 9592`],
        [`A single Python thread uses one core. A 16-core server running one process wastes 15 cores; splitting CPU work across processes gives near-linear speedup.`,
            r`import os, time
from concurrent.futures import ProcessPoolExecutor

def work(n): return sum(i * i for i in range(n))

if __name__ == "__main__":
    N = os.cpu_count()
    jobs = [3_000_000] * N
    t0 = time.perf_counter(); [work(j) for j in jobs]; one = time.perf_counter() - t0
    t0 = time.perf_counter()
    with ProcessPoolExecutor(N) as ex: list(ex.map(work, jobs))
    print(f"{N} cores: speedup x{one / (time.perf_counter() - t0):.1f}")

# OUTPUT (example, 8 cores):
# 8 cores: speedup x6.4`],
        [`Real use: scientific simulations, hashing/encryption of many files, ML feature engineering, rendering, PDF/report generation, compression.`,
            r`import hashlib
from concurrent.futures import ProcessPoolExecutor

def hash_blob(seed):
    data = (str(seed) * 100_000).encode()
    for _ in range(20): data = hashlib.sha256(data).digest()   # CPU heavy chain
    return data.hex()[:8]

if __name__ == "__main__":
    with ProcessPoolExecutor() as ex:
        print(list(ex.map(hash_blob, range(3))))

# OUTPUT (example):
# ['ae2f7c10', '9b41d03e', '5c80a1f2']`],
        [`<b>Advantages:</b> scales with core count, no code rewrite for pure-Python functions, can be combined with NumPy and chunked algorithms.`,
            r`from concurrent.futures import ProcessPoolExecutor

def partial_sum(chunk):
    return sum(chunk)

if __name__ == "__main__":
    data = list(range(1, 1_000_001))
    chunks = [data[i::4] for i in range(4)]              # map: 4 slices
    with ProcessPoolExecutor(4) as ex:
        total = sum(ex.map(partial_sum, chunks))         # reduce: combine results
    print(total == sum(data), total)

# OUTPUT:
# True 500000500000`],
        [`<b>Disadvantages:</b> overhead (pickling, start-up), memory times worker count, Amdahl's law caps speedup by the serial part, and results of small jobs can be slower than serial.`,
            r`# Amdahl's law: speedup = 1 / (serial + parallel / cores)
def speedup(parallel_fraction, cores):
    return 1 / ((1 - parallel_fraction) + parallel_fraction / cores)

for cores in (2, 8, 64):
    print(cores, "cores, 90% parallel ->", round(speedup(0.9, cores), 1), "x")

# OUTPUT:
# 2 cores, 90% parallel -> 1.8 x
# 8 cores, 90% parallel -> 4.7 x
# 64 cores, 90% parallel -> 8.8 x`],
        [`<b>Limitations:</b> only as many useful workers as physical cores, workloads sharing big state need shared memory, and cgroup/container CPU limits make os.cpu_count() misleading.`,
            r`import os

print("cpu_count (machine):", os.cpu_count())
if hasattr(os, "process_cpu_count"):                      # Python 3.13+
    print("usable by this process:", os.process_cpu_count())
if hasattr(os, "sched_getaffinity"):                      # Linux only
    print("affinity:", len(os.sched_getaffinity(0)))
# In Docker with --cpus=2, cpu_count still reports the HOST core count.

# OUTPUT (example, Linux, 3.13):
# cpu_count (machine): 16
# usable by this process: 16
# affinity: 16`],
        `
   input ─► split ─┬─► chunk 1 ─► process 1 (core 1) ─┐
                   ├─► chunk 2 ─► process 2 (core 2) ─┼─► combine ─► result
                   └─► chunk 3 ─► process 3 (core 3) ─┘
                  ~ speedup limited by the serial split/combine parts
`,
        `Before reaching for processes, try a better algorithm, NumPy/Numba/Cython, or a Rust extension: a 100x single-core win beats an 8x multi-core one. When you do parallelise, size workers from the cgroup limit, chunk for balance, and move big data via shared memory or files. Beyond one machine use Dask, Ray or a job queue.`
    )
};
