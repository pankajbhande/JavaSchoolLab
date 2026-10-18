import type { Topic } from '../../types';

export const gilLimitations: Topic = {
    id: 'python-gil-gil-limitations',
    name: 'GIL Limitations',
    beginner: [
        {
            content: `<h4>Introduction</h4>
The GIL brings real limits: CPU-bound threads do <b>not</b> run in parallel, threads add switching overhead, and the GIL does <b>not</b> make your multi-step operations atomic. CPython hands the lock over about every 5 ms (<code>sys.getswitchinterval()</code>), so a thread can be interrupted between any two bytecodes. Unlike Java, where more threads give more throughput on more cores, you must design around this with processes, native extensions or locks.

<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:12px 0;">
<svg viewBox="0 0 522 168" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:522px;height:auto;font-family:monospace;display:block;margin:0 auto">
<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#6b7280"/></marker></defs>
<rect x="10" y="10" width="235.7" height="26" rx="6" fill="#fef2f2" stroke="#dc2626"/><text text-anchor="middle" font-size="12" fill="#991b1b"><tspan x="127.9" y="27">GIL limits</tspan></text><rect x="10" y="44" width="235.7" height="29" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="127.9" y="62.5">no CPU parallelism in threads</tspan></text><rect x="10" y="79" width="235.7" height="29" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="127.9" y="97.5">switching overhead</tspan></text><rect x="10" y="114" width="235.7" height="29" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="127.9" y="132.5">compound ops not atomic</tspan></text><rect x="275.7" y="10" width="235.7" height="26" rx="6" fill="#ecfdf5" stroke="#059669"/><text text-anchor="middle" font-size="12" fill="#065f46"><tspan x="393.5" y="27">Workarounds</tspan></text><rect x="275.7" y="44" width="235.7" height="29" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="393.5" y="62.5">multiprocessing</tspan></text><rect x="275.7" y="79" width="235.7" height="44" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="393.5" y="97.5">NumPy / C code that</tspan><tspan x="393.5" y="112.5">releases the GIL</tspan></text><rect x="275.7" y="129" width="235.7" height="29" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="393.5" y="147.5">Lock, Queue, asyncio</tspan></text>
</svg>
<div style="font-size:12px;color:#6b7280;text-align:center;margin-top:6px;">Figure: each limitation has a standard workaround</div>
</div>`
        },
        {
            content: `<h4>Purpose / Need of This Topic</h4>
<b>The problem:</b> Assuming threads give a speed-up, or that the GIL makes shared data safe, leads to slow programs and rare, hard-to-reproduce data corruption.
<br><br>
<b>Why we need it:</b>
<ul>
<li>Know <b>what the GIL does not give you</b>: speed-up and atomicity.</li>
<li>Recognise the workarounds: processes, C extensions, <code>asyncio</code>, locks.</li>
<li>Avoid shipping code that works in tests but fails under load.</li>
<li>Judge honestly whether a threaded design is worth it.</li>
</ul>`
        },
        {
            content: `<h4>Complete Example: Correct results, no free speed-up</h4>
Four threads compute the same sum of squares and update a shared tally under a lock. Correctness is certain; speed-up is not claimed.`,
            codeExamples: [
                `import sys
import threading
from concurrent.futures import ThreadPoolExecutor

N = 1000            # sum the squares below N
WORKERS = 4
REPEATS = 5000


def sum_squares(n):
    return sum(i * i for i in range(n))


class Tally:
    def __init__(self):
        self.value = 0
        self._lock = threading.Lock()

    def add(self):
        with self._lock:                # += is not atomic without this
            self.value += 1


def bump(tally):
    for _ in range(REPEATS):
        tally.add()


def main():
    expected = (N - 1) * N * (2 * N - 1) // 6
    with ThreadPoolExecutor(WORKERS) as pool:
        results = list(pool.map(sum_squares, [N] * WORKERS))
    print("expected sum:", expected)
    print("all threads correct:", all(r == expected for r in results))

    tally = Tally()
    threads = [threading.Thread(target=bump, args=(tally,))
               for _ in range(WORKERS)]
    for thread in threads:
        thread.start()
    for thread in threads:
        thread.join()
    print("tally:", tally.value)
    print("switch interval:", sys.getswitchinterval())   # default value


if __name__ == "__main__":
    main()

# OUTPUT:
# expected sum: 332833500
# all threads correct: True
# tally: 20000
# switch interval: 0.005`
            ],
            codeExplanations: [
                `The formula (N-1)*N*(2N-1)/6 gives 332,833,500 for N = 1000, and every thread returns it. The tally reaches exactly 4 x 5000 = 20000 only because of the lock. The default switch interval is 0.005 seconds (5 ms), the point at which a running thread may be asked to release the GIL.`
            ]
        },
        {
            content: `<h4>Limitation 1: No Parallel Speed-up for CPU-bound Threads</h4>
Because only one thread runs Python bytecode at a time, splitting a calculation across threads does <b>not</b> use more than one core. It can even be slightly <b>slower</b> than doing it in one thread, because the threads fight over the lock and switch back and forth.

Try this benchmark yourself (times differ by machine, so none are shown here):`,
            codeExamples: [
                `import time
from concurrent.futures import ProcessPoolExecutor, ThreadPoolExecutor

def burn(n):
    total = 0
    for i in range(n):
        total += i * i
    return total

def timed(label, run):
    start = time.perf_counter()
    run()
    print(f"{label:<10} {time.perf_counter() - start:.2f}s")

if __name__ == "__main__":
    work = [5_000_000] * 4

    timed("sequential", lambda: [burn(n) for n in work])
    with ThreadPoolExecutor(4) as pool:
        timed("threads", lambda: list(pool.map(burn, work)))
    with ProcessPoolExecutor(4) as pool:
        timed("processes", lambda: list(pool.map(burn, work)))

# TYPICAL RESULT on a 4-core machine (standard CPython):
#   sequential  ~ 1x   (the baseline)
#   threads     ~ 1x or a little slower - no speed-up
#   processes   ~ 0.3x - 0.4x of the baseline (about 3x faster)`
            ],
            codeExplanations: [
                `All three versions do the same four chunks of work. Threads cannot run the chunks at once because of the GIL, so they take about as long as the sequential version. Processes have a GIL each, so the four chunks run on four cores. The gain is never a perfect 4x because of process start-up and result copying.`
            ]
        },
        {
            content: `<h4>Limitation 2: It Does Not Make Your Code Thread-Safe</h4>
Many beginners think "the GIL means I don't need locks". It does not. Operations that look like one step are often several, and a thread switch can happen between them. This "check then act" example looks harmless but runs the expensive part three times:`,
            codeExamples: [
                `import threading
import time

cache = {}
computations = []

def get(key):
    if key not in cache:             # step 1: check
        time.sleep(0.1)              # expensive work (also widens the race window)
        computations.append(key)
        cache[key] = key.upper()     # step 2: act
    return cache[key]

threads = [threading.Thread(target=get, args=("a",)) for _ in range(3)]
for t in threads:
    t.start()
for t in threads:
    t.join()

print(len(computations))

# OUTPUT:
# 3`
            ],
            codeExplanations: [
                `All three threads checked "key not in cache" before any of them had stored the result, so each decided to compute it. Every individual dictionary operation was safe, but the sequence of steps was not atomic. Fix it with a lock around the check-and-set, or use functools.lru_cache or a dedicated per-key lock.`
            ]
        },
        {
            content: `<h4>Limitation 3: Only the Main Thread Handles Signals</h4>
Signal handlers (such as Ctrl+C turning into <code>KeyboardInterrupt</code>) always run in the <b>main thread</b>. If the main thread is blocked waiting (for example on a lock) in a way that does not wake up, the program can seem to ignore Ctrl+C. Design long-running worker threads with a shared <code>threading.Event</code> to tell them to stop.`
        }
    ],

    expert: [
        {
            content: `<h3>Contention and Latency</h3>
<ul>
<li><b>GIL contention overhead.</b> With several CPU-bound threads on a multi-core machine, threads constantly request and hand over the GIL, which adds cost. Four CPU-bound threads can be <i>slower</i> than one.</li>
<li><b>Latency of I/O threads.</b> An I/O thread that wakes up (a packet arrived) must wait to get the GIL back. If a CPU-bound thread is running, it waits up to one switch interval (5 ms) every time, so a mixed program can show poor responsiveness for its I/O.</li>
<li><b>Blocking calls in C extensions.</b> A C function that does not release the GIL (many older extensions) freezes <i>all</i> other Python threads while it runs.</li>
<li><b>Fairness.</b> The GIL is not a fair queue; a thread can reacquire it before others get a turn, so scheduling is not predictable.</li>
</ul>`
        },
        {
            content: `<h3>Libraries That Release the GIL (and How to Do It Yourself)</h3>
Native code <b>can</b> release the GIL while it does not touch Python objects, so threads then run in parallel. NumPy, SciPy, many parts of pandas, <code>hashlib</code> (large inputs), <code>zlib</code>, <code>lzma</code>, and Pillow do this for their heavy loops. You can use the same idea:
<ul>
<li><b>Numba:</b> <code>@njit(nogil=True)</code> compiles a function and releases the GIL while it runs.</li>
<li><b>Cython:</b> a <code>with nogil:</code> block, or <code>cdef ... nogil</code> functions.</li>
<li><b>Rust / C / C++ extensions</b> (PyO3, pybind11, the C-API macros <code>Py_BEGIN_ALLOW_THREADS</code>): release the GIL around work that does not use Python objects.</li>
<li><b><code>ctypes</code></b> releases the GIL while calling a C function from a shared library.</li>
</ul>`,
            codeExamples: [
                `import hashlib
from concurrent.futures import ThreadPoolExecutor

blocks = [bytes([i]) * 20_000_000 for i in range(4)]     # four 20 MB blocks

def digest(block):
    return hashlib.sha256(block).hexdigest()              # large input: GIL released

with ThreadPoolExecutor(4) as pool:
    results = list(pool.map(digest, blocks))

print(len(results), all(len(r) == 64 for r in results))

# OUTPUT:
# 4 True
#
# On a multi-core machine these four hashes run in parallel threads,
# because hashlib releases the GIL for large inputs.`
            ]
        },
        {
            content: `<h3>Workarounds Summary</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Approach</th><th>Works because</th><th>Cost</th></tr>
<tr class='text-center'><td><code>multiprocessing</code> / <code>ProcessPoolExecutor</code></td><td>One GIL per process</td><td>Pickling, memory duplication, start-up</td></tr>
<tr class='text-center'><td><code>asyncio</code></td><td>One thread, tasks yield during I/O</td><td>Only for I/O; code must be <code>async</code></td></tr>
<tr class='text-center'><td>Native code (NumPy, Numba, Cython, Rust)</td><td>Heavy loops leave Python and release the GIL</td><td>Extra tooling or a rewrite</td></tr>
<tr class='text-center'><td>Sub-interpreters (3.12+ internals; <code>concurrent.interpreters</code> in 3.14)</td><td>Each interpreter has its own GIL, in one process</td><td>Newer; limited object sharing; extension modules must support it</td></tr>
<tr class='text-center'><td>Free-threaded build (3.13t and later)</td><td>There is no GIL</td><td>Slower single thread, extension support still maturing</td></tr>
<tr class='text-center'><td>Another implementation (Jython, IronPython)</td><td>No GIL</td><td>Lags behind CPython; poor C-extension support</td></tr>
</table>`
        },
        {
            content: `<h3>Do Not Over-Blame the GIL</h3>
<ul>
<li>Most Python programs are I/O-bound, single-threaded, or already use NumPy/processes - for them the GIL costs nothing noticeable.</li>
<li>When a program is slow, <b>profile first</b>. A better algorithm, a database index, caching or vectorisation usually outperforms any parallel rewrite.</li>
<li>Removing the GIL does not make code correct or automatically fast: you will still need locks, and parallel code has overhead.</li>
<li>Code written for the GIL era (relying on "this operation is atomic") must be revisited for free-threaded Python, which keeps built-in types safe but not your multi-step logic.</li>
</ul>`
        },
        {
            content: `<h3>Advantages and Disadvantages</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Advantages</th><th>Disadvantages</th></tr>
<tr><td>Limits are well understood with standard workarounds</td><td>Threads give no speed-up on CPU-bound code</td></tr>
<tr><td>Processes sidestep the GIL completely</td><td>Workarounds add complexity and memory use</td></tr>
<tr><td>Many C libraries release the GIL during heavy work</td><td>Switching between threads has its own cost</td></tr>
<tr><td>Locks and queues make shared data safe</td><td>Missing locks cause rare, hard-to-find bugs</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is the main limitation of the GIL?</td><td>CPU-bound Python code cannot run in parallel on multiple cores using threads</td></tr>
<tr class='text-center'><td>Can CPU-bound threads be slower than a single thread?</td><td>Yes - contention for the GIL adds overhead</td></tr>
<tr class='text-center'><td>Is <code>if key not in d: d[key] = ...</code> safe with the GIL?</td><td>No - check-then-act spans several bytecodes; use a lock</td></tr>
<tr class='text-center'><td>How do NumPy and similar libraries avoid the limitation?</td><td>Their C code releases the GIL while working on raw data</td></tr>
<tr class='text-center'><td>List ways around the GIL.</td><td>Processes, native extensions with nogil, asyncio for I/O, sub-interpreters, free-threaded builds</td></tr>
</table>`
        }
    ]
};
