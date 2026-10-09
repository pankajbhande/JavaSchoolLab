import type { Topic } from '../../types';

export const gilFreeThreaded: Topic = {
    id: 'python-gil-free-threaded-python',
    name: 'Free-Threaded Python',
    beginner: [
        {
            content: `<h4>Introduction</h4>
<b>Free-threaded Python</b> is an optional CPython build with the GIL turned off (PEP 703), introduced as experimental in <b>Python 3.13</b>, so several threads can run Python code on different cores at once - much like JVM threads. Because nothing serialises threads any more, you must protect shared data with locks, exactly as in Java. The build is a separate executable (<code>python3.13t</code>), and some C extensions may re-enable the GIL if they are not ready.

<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:12px 0;">
<svg viewBox="0 0 463 133" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:463px;height:auto;font-family:monospace;display:block;margin:0 auto">
<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#6b7280"/></marker></defs>
<rect x="10" y="10" width="206.5" height="26" rx="6" fill="#fff7ed" stroke="#ea580c"/><text text-anchor="middle" font-size="12" fill="#9a3412"><tspan x="113.3" y="27">Standard build (GIL)</tspan></text><rect x="10" y="44" width="206.5" height="44" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="113.3" y="62.5">one thread runs Python</tspan><tspan x="113.3" y="77.5">at a time</tspan></text><rect x="10" y="94" width="206.5" height="29" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="113.3" y="112.5">threads: no CPU speed-up</tspan></text><rect x="246.5" y="10" width="206.5" height="26" rx="6" fill="#ecfdf5" stroke="#059669"/><text text-anchor="middle" font-size="12" fill="#065f46"><tspan x="349.8" y="27">Free-threaded (3.13t)</tspan></text><rect x="246.5" y="44" width="206.5" height="29" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="349.8" y="62.5">threads run on many cores</tspan></text><rect x="246.5" y="79" width="206.5" height="29" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="349.8" y="97.5">locks are essential</tspan></text>
</svg>
<div style="font-size:12px;color:#6b7280;text-align:center;margin-top:6px;">Figure: the GIL build serialises threads; the free-threaded build runs them in parallel</div>
</div>`
        },
        {
            content: `<h4>Purpose / Need of This Topic</h4>
<b>The problem:</b> Python programmers wanting multi-core threads had to switch to processes and copy data between them, which is heavy for large shared structures.
<br><br>
<b>Why we need it:</b>
<ul>
<li>Run <b>CPU-bound threads in parallel</b> inside one process with shared memory.</li>
<li>Know how to <b>detect</b> which build your program runs on.</li>
<li>Learn that correct locking matters <b>more</b>, not less, without the GIL.</li>
<li>Plan for the future of Python concurrency.</li>
</ul>`
        },
        {
            content: `<h4>Complete Example: Detecting the build and staying thread-safe</h4>
This program runs on <i>both</i> builds. It reports which build it is on and uses a <code>Lock</code>, which is required with or without the GIL. Free-threaded builds need Python 3.13 or newer.`,
            codeExamples: [
                `import sys
import sysconfig
import threading

THREADS = 4
REPEATS = 10_000


def gil_enabled():
    check = getattr(sys, "_is_gil_enabled", None)   # exists on 3.13+
    return True if check is None else check()


def count(state, lock):
    for _ in range(REPEATS):
        with lock:                      # needed even more without the GIL
            state["value"] += 1


def main():
    free_threaded = bool(sysconfig.get_config_var("Py_GIL_DISABLED"))
    state = {"value": 0}
    lock = threading.Lock()
    threads = [threading.Thread(target=count, args=(state, lock))
               for _ in range(THREADS)]
    for thread in threads:
        thread.start()
    for thread in threads:
        thread.join()
    print("free-threaded build:", free_threaded)
    print("GIL enabled:", gil_enabled())
    print("counter:", state["value"])


if __name__ == "__main__":
    main()

# OUTPUT (standard build, any version):
# free-threaded build: False
# GIL enabled: True
# counter: 40000
#
# OUTPUT (python3.13t, free-threaded; first two lines differ):
# free-threaded build: True
# GIL enabled: False
# counter: 40000`
            ],
            codeExplanations: [
                `Py_GIL_DISABLED is 1 only in the free-threaded build, and sys._is_gil_enabled() reports the run-time state (it can be True even in that build if an incompatible extension is loaded). The counter is 40000 on both builds because the lock makes each increment atomic; without the lock the free-threaded build would lose updates.`
            ]
        },
        {
            content: `<h4>Python Without the GIL</h4>
<b>Free-threaded Python</b> is a build of CPython in which the GIL is <b>turned off</b>, so several threads can execute Python code <b>at the same time on different cores</b>. It comes from <b>PEP 703</b>, was shipped as an <b>experimental</b> option in <b>Python 3.13</b>, and moved toward official support in later releases (PEP 779). It is <b>optional</b>: the normal Python you install is still the GIL build. The free-threaded build is a separate executable, usually named <code>python3.13t</code> (the "t" stands for threaded).`
        },
        {
            content: `<h4>Checking Which Build You Have</h4>`,
            codeExamples: [
                `import sys
import sysconfig

print(sysconfig.get_config_var("Py_GIL_DISABLED"))   # 1 in a free-threaded build

if hasattr(sys, "_is_gil_enabled"):                  # Python 3.13+
    print("GIL enabled:", sys._is_gil_enabled())
else:
    print("GIL enabled: True (older Python)")

# OUTPUT with the normal build (3.13):
# 0
# GIL enabled: True
#
# OUTPUT with the free-threaded build (python3.13t):
# 1
# GIL enabled: False`
            ],
            codeExplanations: [
                `Py_GIL_DISABLED is a build-time setting; it is 1 only in the free-threaded build. sys._is_gil_enabled() reports the state at run time: even in a free-threaded build the GIL can be switched back on, for example when you import a C extension that does not declare itself thread-safe.`
            ]
        },
        {
            content: `<h4>Getting It</h4>
<ul>
<li><b>Windows / macOS installers from python.org:</b> in the installer's customise step, tick the option to install the <b>free-threaded binaries</b>. On Windows launch it with <code>py -3.13t</code>.</li>
<li><b>uv:</b> <code>uv python install 3.13t</code>, then <code>uv venv --python 3.13t</code>.</li>
<li><b>Docker:</b> use the free-threaded images of the official Python repository (tags ending in <code>t</code>).</li>
<li><b>From source:</b> <code>./configure --disable-gil</code>.</li>
</ul>
You can switch the GIL <b>on or off at run time</b> with <code>python -X gil=1</code> / <code>-X gil=0</code> or the environment variable <code>PYTHON_GIL=1</code> / <code>0</code> - handy for comparing behaviour.`
        },
        {
            content: `<h4>Real Parallelism With Plain Threads</h4>
In a free-threaded build the CPU-bound thread example finally scales - this is the same code that gave no speed-up on the normal build.`,
            codeExamples: [
                `import time
from concurrent.futures import ThreadPoolExecutor

def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)

start = time.perf_counter()
with ThreadPoolExecutor(max_workers=4) as pool:
    results = list(pool.map(fib, [27] * 4))
elapsed = time.perf_counter() - start

print(results)

# OUTPUT:
# [196418, 196418, 196418, 196418]
#
# Timing (4 cores): on python3.13 the four calls run one after another,
# so it takes about 4x one call. On python3.13t they run on four cores at
# once, so it takes about 1x - roughly a 3-4x speed-up.`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>How Python Stays Safe Without the GIL</h3>
Removing one big lock means the interpreter's internals need other protection. PEP 703's design combines several techniques:
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Technique</th><th>Purpose</th></tr>
<tr class='text-center'><td><b>Biased reference counting</b></td><td>The owning thread updates a cheap non-atomic count; other threads use a separate atomic count - keeps the common case fast</td></tr>
<tr class='text-center'><td><b>Immortal objects</b></td><td>None, True, small ints, interned strings never change their count, so sharing them needs no synchronisation</td></tr>
<tr class='text-center'><td><b>Deferred reference counting</b></td><td>Functions, modules and code objects that are shared by all threads avoid count traffic</td></tr>
<tr class='text-center'><td><b>Per-object locks / critical sections</b></td><td>Built-in containers (list, dict, set) lock themselves, so each operation is safe</td></tr>
<tr class='text-center'><td><b>mimalloc</b></td><td>A thread-friendly memory allocator replaces pymalloc, which relied on the GIL</td></tr>
<tr class='text-center'><td><b>Thread-safe garbage collection</b></td><td>The cycle collector stops all threads to run (stop-the-world)</td></tr>
</table>`
        },
        {
            content: `<h3>What Changes for Your Code</h3>
<ul>
<li><b>Built-in types stay memory-safe.</b> Concurrent <code>list.append</code> or dict updates cannot corrupt the interpreter.</li>
<li><b>Your multi-step logic was never safe, but now races surface far more often.</b> Code that "worked" because the GIL rarely switched threads at the wrong moment may start to show lost updates. Use <code>threading.Lock</code>, queues, or thread-safe designs.</li>
<li><b>Use the standard tools:</b> <code>with lock:</code>, <code>queue.Queue</code>, <code>threading.local</code>, and immutable data. Avoid relying on "this operation is atomic because of the GIL".</li>
<li><b>Mutating a collection while another thread iterates it</b> can raise errors or give inconsistent views; iterate over a copy, or lock.</li>
</ul>`,
            codeExamples: [
                `import threading

counter = 0
lock = threading.Lock()

def work():
    global counter
    for _ in range(100_000):
        with lock:                 # required in BOTH builds for correctness
            counter += 1

threads = [threading.Thread(target=work) for _ in range(8)]
for t in threads:
    t.start()
for t in threads:
    t.join()

print(counter)

# OUTPUT:
# 800000`
            ]
        },
        {
            content: `<h3>Extension Modules and the GIL Re-enabling Rule</h3>
A C extension compiled for the normal build assumes the GIL protects it. If you import such a module into a free-threaded interpreter, Python <b>turns the GIL back on</b> (and prints a <code>RuntimeWarning</code>), because the module is not known to be safe. Extensions declare support with the <code>Py_mod_gil</code> module slot (<code>Py_MOD_GIL_NOT_USED</code>), or <code>gil_used=False</code> in PyBind11 / PyO3 equivalents, and need wheels built for the free-threaded ABI (tag <code>cp313t</code>).

Major libraries (NumPy, SciPy, pandas, Cython, many others) have added free-threaded builds; check the compatibility trackers before depending on one. Use <code>-X gil=0</code> to force the GIL off and test, or <code>python -W error</code> to turn the re-enable warning into a failure in CI.`
        },
        {
            content: `<h3>Trade-offs</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Benefit</th><th>Cost</th></tr>
<tr class='text-center'><td>CPU-bound Python code scales across cores with ordinary threads</td><td>Single-threaded code is somewhat slower than in the GIL build (the overhead started large in 3.13 and has been shrinking in later releases)</td></tr>
<tr class='text-center'><td>Threads share memory: no pickling, no data copying</td><td>Higher memory use per object and less mature tooling</td></tr>
<tr class='text-center'><td>No process start-up cost, shared caches</td><td>Extensions must be audited and rebuilt</td></tr>
<tr class='text-center'><td>Simpler than multiprocessing for shared data</td><td>You must write truly thread-safe code</td></tr>
</table>
Exact performance figures differ between releases and benchmarks; measure your own workload on both builds.`
        },
        {
            content: `<h3>Where Free-Threading Fits Among the Options</h3>
<ul>
<li><b>Sub-interpreters</b> (per-interpreter GIL since 3.12, a high-level <code>concurrent.interpreters</code> module in 3.14) give isolated parallelism inside one process with cheaper communication than separate processes.</li>
<li><b>Free-threading</b> shares everything - best when threads genuinely need to work on the same large in-memory structures (a web server's caches, in-memory analytics, ML data loaders).</li>
<li><b><code>multiprocessing</code></b> remains the choice for isolation and for programs that must run on every Python version today.</li>
<li><b>The long-term plan</b> from the Python steering council is gradual: make the free-threaded build supported, build ecosystem confidence, and only then consider making it the default. Standard builds with a GIL remain the norm for now.</li>
</ul>
Check the "What's New" notes and the free-threading guide of the Python version you use, since this area changes quickly.`
        },
        {
            content: `<h3>Advantages and Disadvantages</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Advantages</th><th>Disadvantages</th></tr>
<tr><td>Real multi-core parallelism for Python threads</td><td>Experimental in 3.13; support is still maturing</td></tr>
<tr><td>Threads share memory: no pickling or copying</td><td>Some single-thread code runs a little slower</td></tr>
<tr><td>Lighter than a pool of processes</td><td>Not all C extensions are compatible yet</td></tr>
<tr><td>Familiar model for developers from Java</td><td>Data races become possible: locks are your job</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is free-threaded Python?</td><td>A CPython build (PEP 703, from 3.13) without the GIL, allowing threads to run Python code in parallel</td></tr>
<tr class='text-center'><td>How do you detect it?</td><td><code>sysconfig.get_config_var("Py_GIL_DISABLED")</code> and <code>sys._is_gil_enabled()</code></td></tr>
<tr class='text-center'><td>How does it keep reference counts correct?</td><td>Biased reference counting, immortal and deferred-count objects, per-object locks</td></tr>
<tr class='text-center'><td>What happens when you import an incompatible C extension?</td><td>The interpreter re-enables the GIL (with a warning) unless forced off with <code>-X gil=0</code></td></tr>
<tr class='text-center'><td>Do you still need locks without the GIL?</td><td>Yes - built-ins stay safe, but multi-step operations on shared data need locks, and races become more visible</td></tr>
</table>`
        }
    ]
};
