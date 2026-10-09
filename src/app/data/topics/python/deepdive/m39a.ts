// Module 39 (Performance Optimization), part A: measuring and algorithmic speed.
import { dd, r, type DeepDive } from './deepDive';

export const m39a: Record<string, DeepDive> = {
    'Profiling Basics': dd(
        [`<b>Profiling</b> means measuring where a program spends time and memory before changing it. Rule one of optimization: measure, do not guess.`,
            r`import time

t0 = time.perf_counter()                 # high-resolution monotonic clock
total = sum(i * i for i in range(1_000_000))
elapsed = time.perf_counter() - t0
print(f"result={total}  took {elapsed:.3f}s")

# OUTPUT (the time varies by machine):
# result=333332833333500000  took 0.071s`],
        [`Programmers are bad at guessing bottlenecks. Optimizing a function that takes 2 percent of runtime cannot speed the program up by more than 2 percent (Amdahl's law).`,
            r`# Amdahl's law: overall speedup if a part taking fraction p gets s times faster
def overall_speedup(p, s):
    return 1 / ((1 - p) + p / s)

print(round(overall_speedup(0.02, 100), 3))    # 100x faster on 2% of the time
print(round(overall_speedup(0.80, 5), 2))      # 5x faster on 80% of the time

# OUTPUT:
# 1.02
# 2.78`],
        [`Finding a slow API endpoint, a nightly job that overran, memory growth in a service, or choosing between two implementations with evidence.`,
            r`import time
from contextlib import contextmanager

@contextmanager
def timed(label):                        # reusable stopwatch for any block
    t0 = time.perf_counter()
    yield
    print(f"{label}: {(time.perf_counter() - t0) * 1000:.1f} ms")

with timed("build list"):
    data = [i for i in range(500_000)]
with timed("sort"):
    data.sort(reverse=True)

# OUTPUT (varies):
# build list: 21.4 ms
# sort: 9.8 ms`],
        [`<b>Advantages:</b> targets effort at the real hot spot, prevents wasted or harmful "optimizations", and gives before/after proof.`,
            r`import time

def bench(fn, repeat=3):
    best = float("inf")
    for _ in range(repeat):              # take the best of several runs: less noise
        t0 = time.perf_counter(); fn()
        best = min(best, time.perf_counter() - t0)
    return best

print(bench(lambda: sorted(range(100_000), reverse=True)) < 1.0)

# OUTPUT:
# True`],
        [`<b>Disadvantages:</b> profilers add overhead that can distort results, and a profile on your laptop may not reflect production data or hardware.`,
            r`import time

# Observer effect: a trace hook on every call makes the program slower
import sys
def tracer(frame, event, arg): return None

def work(): return sum(range(10000))
t0 = time.perf_counter(); [work() for _ in range(2000)]; plain = time.perf_counter() - t0
sys.setprofile(tracer)
t0 = time.perf_counter(); [work() for _ in range(2000)]; traced = time.perf_counter() - t0
sys.setprofile(None)
print("profiling overhead visible:", traced >= plain)

# OUTPUT (varies):
# profiling overhead visible: True`],
        [`<b>Limitations:</b> wall-clock timings fluctuate (other processes, CPU caches, frequency scaling), so one run proves nothing. Short benchmarks may measure only warm-up.`,
            r`import time

runs = []
for _ in range(5):
    t0 = time.perf_counter(); sum(range(200_000)); runs.append(time.perf_counter() - t0)
print("spread between fastest and slowest run:", max(runs) > min(runs))

# OUTPUT (varies):
# spread between fastest and slowest run: True`],
        `
   hunch  --X-->  rewrite      (wasteful)

   measure --> find hot spot --> change ONE thing --> re-measure --> keep / revert
      ^                                                      |
      +------------------------------------------------------+
   tools:  perf_counter | timeit | cProfile | line_profiler | tracemalloc
`,
        `Profile with production-like data and load, and keep a repeatable benchmark in CI for critical paths. Prefer sampling profilers (py-spy, Scalene) in production because their overhead is tiny. Optimize the algorithm and architecture before micro-tuning, and stop once the target (a latency or cost SLO) is met.`
    ),

    'timeit': dd(
        [`<code>timeit</code> times small snippets accurately: it runs the code many times, disables garbage collection during the run, and uses the best clock available.`,
            r`import timeit

t = timeit.timeit("sum(range(1000))", number=10_000)    # total seconds for 10,000 runs
print(f"{t / 10_000 * 1e6:.2f} microseconds per call")

# OUTPUT (varies):
# 6.31 microseconds per call`],
        [`A single measurement is noisy and includes startup and caching effects. Repeating and taking the minimum gives a stable, comparable number.`,
            r`import timeit

runs = timeit.repeat("sorted(data)", setup="data = list(range(1000, 0, -1))",
                     repeat=5, number=1000)
print(len(runs), "samples; use min():", min(runs) <= max(runs))

# OUTPUT:
# 5 samples; use min(): True`],
        [`Choosing between two ways to write the same thing: list comprehension vs loop, str.join vs +=, dict lookup vs if-chain.`,
            r`import timeit

setup = "words = ['a'] * 1000"
join   = timeit.timeit("''.join(words)", setup, number=2000)
concat = timeit.timeit("s=''\nfor w in words: s += w", setup, number=2000)
print("join faster:", join < concat)

# OUTPUT (varies by interpreter, but join almost always wins):
# join faster: True`],
        [`<b>Advantages:</b> accurate, built in, usable from code or the command line, and the setup argument keeps preparation out of the measured time.`,
            r`# Command line form (run in a terminal):
#   python -m timeit -s "d = {i: i for i in range(1000)}" "d[500]"
# Notebook form:  %timeit d[500]
import timeit
print(timeit.timeit("d[500]", "d = {i: i for i in range(1000)}", number=100_000) > 0)

# OUTPUT:
# True`],
        [`<b>Disadvantages:</b> measures micro-snippets only, cannot show where time goes in a full program, and tiny benchmarks can mislead (cache-hot data, constant folding).`,
            r`import timeit

# Constant folding: the compiler precomputes 2**10, so this measures nothing real
print(timeit.timeit("2**10", number=1_000_000) < 0.5)
# Use variables from setup to defeat folding:
print(timeit.timeit("x**y", "x=2; y=10", number=1_000_000) < 5)

# OUTPUT (varies):
# True
# True`],
        [`<b>Limitations:</b> timeit runs code in its own namespace, so names from your script are not visible unless you pass globals or setup.`,
            r`import timeit

data = [3, 1, 2]
try:
    timeit.timeit("sorted(data)", number=1)          # 'data' is not visible
except NameError as e:
    print("NameError:", e)
print(timeit.timeit("sorted(data)", number=1, globals=globals()) >= 0)   # fix

# OUTPUT:
# NameError: name 'data' is not defined
# True`],
        `
   setup (once) --> [ stmt ] x number  --> total seconds
                      (GC off)
   repeat=5 --> [t1 t2 t3 t4 t5] --> use min()  (others include system noise)
   compare:  stmt A  vs  stmt B   -->  keep the faster, correct one
`,
        `Use timeit only for micro-decisions and always compare candidates on realistic input sizes, since asymptotic behaviour dominates for large n. Prefer min of repeats, record the Python version, and never let micro-benchmark wins override readability unless the code is proven hot by a profiler.`
    ),

    'cProfile': dd(
        [`<code>cProfile</code> is Python's built-in deterministic profiler. It records every function call: how many times it ran and how long it took, including time in sub-calls.`,
            r`import cProfile, pstats, io

def slow():  return sum(range(200_000))
def fast():  return 42
def main():
    slow(); [fast() for _ in range(1000)]

pr = cProfile.Profile()
pr.runcall(main)
buf = io.StringIO()
pstats.Stats(pr, stream=buf).sort_stats("cumulative").print_stats(3)
print(buf.getvalue().splitlines()[0])

# OUTPUT (example - counts and times vary by version):
# 1004 function calls in 0.003 seconds`],
        [`Timing the whole program shows nothing about causes. A call-level profile ranks functions so you can see which few account for most of the time.`,
            r`# From the command line, profile a whole script and sort by cumulative time:
#   python -m cProfile -s cumulative myscript.py
# Save binary stats to inspect later:
#   python -m cProfile -o out.prof myscript.py
import cProfile
cProfile.run("sum(range(100000))", sort="tottime")   # prints a table

# OUTPUT (example):
#          4 function calls in 0.001 seconds
#    Ordered by: internal time
#    ncalls  tottime  percall  cumtime  percall filename:lineno(function)
#         1    0.001    0.001    0.001    0.001 {built-in method builtins.sum}`],
        [`Finding the slow endpoint handler, the unexpectedly hot helper called a million times, or why an import takes seconds.`,
            r`import cProfile, pstats

def parse(line): return line.split(",")
def load(n):
    return [parse("a,b,c") for _ in range(n)]

pr = cProfile.Profile()
pr.enable()
load(50_000)
pr.disable()
stats = pstats.Stats(pr).sort_stats("ncalls")
top = stats.stats                     # dict: (file, line, name) -> (cc, nc, tt, ct, callers)
calls = {k[2]: v[1] for k, v in top.items() if k[2] in ("parse", "load")}
print(dict(sorted(calls.items())))

# OUTPUT:
# {'load': 1, 'parse': 50000}`],
        [`<b>Advantages:</b> built in, accurate call counts, shows callers and callees (<code>print_callers</code>), and works on any code with no changes.`,
            r`import cProfile, pstats, io

def a(): return b() + b()
def b(): return sum(range(1000))

pr = cProfile.Profile(); pr.runcall(a)
s = io.StringIO()
pstats.Stats(pr, stream=s).print_callers("b")       # who calls b?
print("a" in s.getvalue())

# OUTPUT:
# True`],
        [`<b>Disadvantages:</b> adds noticeable overhead (often 1.5-3x slower), only function-level granularity, and it distorts programs made of many tiny function calls.`,
            r`import cProfile, time

def tiny(): return 1
def loop():
    for _ in range(300_000): tiny()

t0 = time.perf_counter(); loop(); plain = time.perf_counter() - t0
pr = cProfile.Profile()
t0 = time.perf_counter(); pr.runcall(loop); prof = time.perf_counter() - t0
print("profiled run slower:", prof > plain)

# OUTPUT (varies):
# profiled run slower: True`],
        [`<b>Limitations:</b> measures only Python-level calls and CPU time of the process (not other processes), says nothing about which line inside a function is slow, and is not ideal for async or multi-process code.`,
            r`# Visualize results: python -m cProfile -o out.prof app.py
#                   pip install snakeviz ; snakeviz out.prof
# For line-level detail use line_profiler; for production use py-spy (sampling).
import pstats
print(callable(pstats.Stats))

# OUTPUT:
# True`],
        `
   program --> cProfile hooks every call/return
                    |
                    v
   ncalls  tottime  cumtime  function          tottime = own time only
   ------  -------  -------  ----------------  cumtime = own + children
     1      0.001    0.021   main
     1      0.020    0.020   slow   <-- hot spot (ranks first by tottime)
  1000      0.000    0.000   fast
`,
        `Start with sort by cumulative to find the expensive subtree, then by tottime to find the expensive leaf. Use sampling profilers (py-spy, Scalene, pyinstrument) for production and long runs, and flame graphs for readability. Remember the profile reflects the inputs you gave it, so profile representative workloads.`
    ),

    'line_profiler': dd(
        [`<b>line_profiler</b> measures time per source line for functions you mark with <code>@profile</code>, answering "which line inside this function is slow?".`,
            r`# pip install line_profiler
# Run with:   kernprof -l -v demo.py
@profile                       # injected by kernprof; no import needed
def build(n):
    data = []
    for i in range(n):
        data.append(i * i)     # called n times
    total = sum(data)
    return total

build(100_000)

# OUTPUT (example):
# Line #  Hits    Time  Per Hit  % Time  Line Contents
#      4     1     0.3      0.3     0.0      data = []
#      5 100001  12000.0     0.1    45.0      for i in range(n):
#      6 100000  14000.0     0.1    52.0          data.append(i * i)
#      7     1   1000.0   1000.0     3.0      total = sum(data)`],
        [`cProfile tells you the function is slow, but a 50-line function hides which statement matters. Line-level data prevents optimizing the wrong line.`,
            r`# Programmatic use without kernprof:
from line_profiler import LineProfiler

def work():
    a = [i for i in range(50_000)]          # line A
    b = sorted(a, reverse=True)             # line B
    return b[0]

lp = LineProfiler()
lp.add_function(work)
lp.runcall(work)
lp.print_stats()                            # prints the per-line table

# OUTPUT (example): a table with Hits, Time and % Time for each line of work()`],
        [`Tuning numeric loops, data-cleaning functions and request handlers where one line (a regex, a repeated lookup, a copy) is the real culprit.`,
            r`# Typical finding: the slow line is an accidental O(n) inside a loop
def dedupe(items):
    seen = []
    out = []
    for x in items:
        if x not in seen:          # <-- line profiler flags this: O(n) list scan per item
            seen.append(x)
            out.append(x)
    return out

def dedupe_fast(items):
    seen = set()                   # fix: O(1) membership
    return [x for x in items if not (x in seen or seen.add(x))]

print(dedupe([3, 1, 3, 2, 1]), dedupe_fast([3, 1, 3, 2, 1]))

# OUTPUT:
# [3, 1, 2] [3, 1, 2]`],
        [`<b>Advantages:</b> pinpoint granularity, readable table with percent per line, and integrates with Jupyter via <code>%lprun</code>.`,
            r`# Jupyter usage:
#   %load_ext line_profiler
#   %lprun -f my_function my_function(arg)
# Only functions you register are traced, so overhead stays focused.
print("register only the suspects")

# OUTPUT:
# register only the suspects`],
        [`<b>Disadvantages:</b> significant overhead, requires an extra package and decorating or registering code, and the numbers are relative rather than absolute.`,
            r`# The @profile decorator exists only under kernprof; plain python fails:
try:
    profile
except NameError as e:
    print("NameError:", e)
# Remove decorators before committing, or guard them:
try:
    profile
except NameError:
    def profile(f): return f

# OUTPUT:
# NameError: name 'profile' is not defined`],
        [`<b>Limitations:</b> only pure-Python lines (a call into C shows as one line), no multi-process aggregation, and recent Python versions need a matching line_profiler release.`,
            r`# One line that calls NumPy/C is a black box: time shows on that single line only.
import numpy as np
x = np.random.default_rng(0).random(1_000_000)
y = np.sort(x)               # line profiler: one line, all the cost, no inner detail
print(y.shape)

# OUTPUT:
# (1000000,)`],
        `
   def f():                          Hits   Time    %Time
       a = load()                      1    5.0     4%
       for r in rows:                  N   10.0     8%
           x = slow_regex(r)           N  100.0    80%   <-- fix THIS line
       return a                        1    0.0     0%
`,
        `Use it as the second step after cProfile: narrow to one function, then one line, then fix the algorithm or data structure rather than shaving the syntax. Remove profiling decorators from committed code, and prefer sampling line-level tools (Scalene, py-spy) when you need to profile a live service.`
    ),

    'Memory Profiling': dd(
        [`<b>Memory profiling</b> measures how much RAM objects and allocations use and where it grows. The standard library offers <code>tracemalloc</code> and <code>sys.getsizeof</code>; <code>memory_profiler</code> and <code>memray</code> add line-level views.`,
            r`import tracemalloc

tracemalloc.start()
data = [str(i) for i in range(100_000)]          # allocate many small strings
current, peak = tracemalloc.get_traced_memory()  # bytes
print(f"current={current/1e6:.1f} MB  peak={peak/1e6:.1f} MB")
tracemalloc.stop()

# OUTPUT (example):
# current=6.5 MB  peak=6.5 MB`],
        [`Python objects are heavy and memory leaks are silent. Running out of RAM kills a service or makes it swap, so you must see what is big.`,
            r`import sys

print(sys.getsizeof(1))            # an int object
print(sys.getsizeof([]), sys.getsizeof([0] * 1000))   # list: pointers only
print(sys.getsizeof("a"), sys.getsizeof("a" * 100))

# OUTPUT (CPython 3.12, 64-bit):
# 28
# 56 8056
# 50 149`],
        [`Finding why a worker grows to 4 GB, shrinking a DataFrame, checking a cache has a bound, or spotting objects never released.`,
            r`import tracemalloc

tracemalloc.start()
cache = {}
for i in range(50_000):
    cache[i] = "x" * 20                         # an unbounded cache: the leak
snap = tracemalloc.take_snapshot()
top = snap.statistics("lineno")[0]              # biggest allocation site
print(top.size / 1e6 > 1, "line:", top.traceback[0].lineno)

# OUTPUT (example):
# True line: 6`],
        [`<b>Advantages:</b> shows allocation sites, snapshot comparison finds growth between two points, and tracemalloc needs no installs.`,
            r`import tracemalloc

tracemalloc.start()
before = tracemalloc.take_snapshot()
junk = [bytes(1000) for _ in range(1000)]       # ~1 MB retained
after = tracemalloc.take_snapshot()
diff = after.compare_to(before, "lineno")[0]    # biggest growth
print(diff.size_diff > 900_000)

# OUTPUT:
# True`],
        [`<b>Disadvantages:</b> tracemalloc slows the program (often 2x or more) and uses extra memory itself, and getsizeof is shallow (it ignores referenced objects).`,
            r`import sys

nested = [[0] * 1000 for _ in range(100)]
print(sys.getsizeof(nested))                     # only the outer list of 100 pointers
print(sum(sys.getsizeof(x) for x in nested) > 800_000)   # the real data is bigger

# OUTPUT (example, CPython 3.12):
# 920
# True`],
        [`<b>Limitations:</b> it tracks Python allocations (C-extension memory such as NumPy buffers needs memray or OS tools), and RSS reported by the OS can stay high even after Python frees objects.`,
            r`import os
try:
    import psutil                                # pip install psutil
    rss = psutil.Process(os.getpid()).memory_info().rss
    print("process RSS MB:", round(rss / 1e6))   # what the OS actually sees
except ImportError:
    print("install psutil for process-level memory")

# OUTPUT (example):
# process RSS MB: 28`],
        `
   Python heap objects  <-- tracemalloc / getsizeof / memory_profiler
   C-extension buffers  <-- memray / valgrind-like tools
   Process RSS (OS)     <-- psutil / top / Task Manager
   snapshot A ----(run code)----> snapshot B --> compare_to() --> top growers
`,
        `Fix memory with structure, not tweaks: generators and chunked reads instead of lists, __slots__ or dataclasses(slots=True) for many small objects, compact dtypes (NumPy/pandas categories), bounded caches, and weakrefs for back-references. Add memory limits and RSS alerts in production, and use memray in staging for native allocations.`
    ),

    'Algorithm Optimization': dd(
        [`The biggest speed-ups come from choosing a better <b>algorithm or data structure</b>, reducing time complexity (for example O(n squared) to O(n log n) or O(n)) rather than tuning constant factors.`,
            r`# Two-sum: find a pair that adds to target
def two_sum_slow(nums, t):                 # O(n^2): check every pair
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == t:
                return (i, j)

def two_sum_fast(nums, t):                 # O(n): remember what we have seen
    seen = {}
    for i, x in enumerate(nums):
        if t - x in seen:
            return (seen[t - x], i)
        seen[x] = i

nums = [2, 7, 11, 15]
print(two_sum_slow(nums, 9), two_sum_fast(nums, 9))

# OUTPUT:
# (0, 1) (0, 1)`],
        [`A hardware upgrade gives maybe 2-4x. An algorithm change can give 1000x on large inputs, and the gap widens as data grows.`,
            r`# Operation counts for n = 100,000
import math
n = 100_000
print("O(n^2):    ", n * n)
print("O(n log n):", int(n * math.log2(n)))
print("O(n):      ", n)

# OUTPUT:
# O(n^2):     10000000000
# O(n log n): 1660964
# O(n):       100000`],
        [`Membership tests in sets instead of lists, bisect for sorted lookups, heaps for top-k, deque for queues, sorting once instead of repeatedly, and precomputing prefix sums.`,
            r`import heapq, bisect
from collections import deque

nums = [5, 1, 9, 3, 7]
print(heapq.nlargest(2, nums))              # top-k without a full sort: O(n log k)
srt = sorted(nums)
print(bisect.bisect_left(srt, 7))           # binary search: O(log n)
q = deque([1, 2, 3]); q.popleft()           # O(1); list.pop(0) is O(n)
print(list(q))

# OUTPUT:
# [9, 7]
# 3
# [2, 3]`],
        [`<b>Advantages:</b> large and durable gains, no extra dependencies, and often simpler code that scales with the data.`,
            r`# Prefix sums: answer many range-sum queries in O(1) each after O(n) setup
from itertools import accumulate
a = [3, 1, 4, 1, 5, 9]
prefix = [0] + list(accumulate(a))
def range_sum(l, r_):                      # sum of a[l:r_]
    return prefix[r_] - prefix[l]

print(range_sum(1, 4), sum(a[1:4]))

# OUTPUT:
# 6 6`],
        [`<b>Disadvantages:</b> needs algorithmic knowledge, can make code harder to read, and trades memory for speed (hash maps, caches, indexes).`,
            r`import sys

lst = list(range(100_000))
st = set(lst)
print(sys.getsizeof(lst) < sys.getsizeof(st))     # the fast structure costs more RAM

# OUTPUT:
# True`],
        [`<b>Limitations:</b> asymptotic gains do not help small inputs (constants dominate), and some problems are inherently hard (NP-complete), so you must settle for heuristics.`,
            r`import timeit

# For tiny n, a list scan beats building a set - constants matter
small = [1, 2, 3, 4, 5]
list_t = timeit.timeit("3 in small", globals={"small": small}, number=200_000)
set_t  = timeit.timeit("3 in set(small)", globals={"small": small}, number=200_000)
print("list scan faster for tiny n:", list_t < set_t)

# OUTPUT (varies):
# list scan faster for tiny n: True`],
        `
   time
    ^                              . O(n^2)
    |                          .
    |                     .
    |              .                 ___ O(n log n)
    |        .   __---'''
    |   . _--'''  ------------------- O(n)
    +-----------------------------------> input size n
   better algorithm beats faster hardware as n grows
`,
        `Fix complexity first, then constants. Know your structures: hash tables for lookups, heaps for priorities, sorted arrays plus bisect for ranges, tries and graphs for specialised queries. Where the algorithm is already right, vectorize (NumPy), push work into C (built-ins, itertools) or a database, and only then consider Cython, Numba or Rust.`
    )
};
