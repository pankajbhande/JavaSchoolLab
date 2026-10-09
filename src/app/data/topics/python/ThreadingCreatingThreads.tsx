import type { Topic } from '../../types';

export const threadingCreatingThreads: Topic = {
    id: 'python-multithreading-creating-threads',
    name: 'Creating Threads',
    beginner: [
        {
            content: `<h4>Introduction</h4>
A <b>thread</b> is an independent flow of execution inside one program. All threads of a process share the same memory, so they can cooperate cheaply, but each has its own call stack. In Python you create a <code>threading.Thread</code> with a <code>target</code> function, call <code>start()</code> to run it concurrently and <code>join()</code> to wait for it. This is the same life cycle as Java's <code>Thread</code> class (<code>new Thread(runnable)</code>, <code>start()</code>, <code>join()</code>). Because of the GIL, threads in CPython overlap <i>waiting</i> (I/O, sleep) very well but do not run Python bytecode in parallel.

<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:12px 0;">
<svg viewBox="0 0 638 106" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:638px;height:auto;font-family:monospace;display:block;margin:0 auto">
<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#6b7280"/></marker></defs>
<text x="10" y="29" font-size="12" fill="#374151">main  </text><line x1="67.8" y1="43" x2="627.8" y2="43" stroke="#e5e7eb"/><rect x="67.8" y="10" width="93.3" height="30" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="114.5" y="29">create</tspan></text><rect x="161.1" y="10" width="93.3" height="30" rx="6" fill="#fff7ed" stroke="#ea580c"/><text text-anchor="middle" font-size="12" fill="#9a3412"><tspan x="207.8" y="29">start()</tspan></text><rect x="254.5" y="10" width="140" height="30" rx="6" fill="#eff6ff" stroke="#2563eb"/><text text-anchor="middle" font-size="12" fill="#1e40af"><tspan x="324.5" y="29">main work</tspan></text><rect x="394.5" y="10" width="140" height="30" rx="6" fill="#fef2f2" stroke="#dc2626"/><text text-anchor="middle" font-size="12" fill="#991b1b"><tspan x="464.5" y="29">join() waits</tspan></text><rect x="534.5" y="10" width="93.3" height="30" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="581.1" y="29">done</tspan></text><text x="10" y="71" font-size="12" fill="#374151">worker</text><line x1="67.8" y1="85" x2="627.8" y2="85" stroke="#e5e7eb"/><rect x="254.5" y="52" width="280" height="30" rx="6" fill="#ecfdf5" stroke="#059669"/><text text-anchor="middle" font-size="12" fill="#065f46"><tspan x="394.5" y="71">target function runs</tspan></text><text x="67.8" y="100" font-size="11" fill="#6b7280">time →</text>
</svg>
<div style="font-size:12px;color:#6b7280;text-align:center;margin-top:6px;">Figure: start() makes the worker run beside main; join() waits for it to finish</div>
</div>`
        },
        {
            content: `<h4>Purpose / Need of This Topic</h4>
<b>The problem:</b> A single-threaded program does one thing at a time: while it waits for a slow download or a sleep, everything else is frozen, and five waits of 0.3 s cost 1.5 s in total.
<br><br>
<b>Why we need it:</b>
<ul>
<li>Run several <b>waiting tasks at the same time</b> so total time is about the longest wait, not the sum.</li>
<li>Keep a program <b>responsive</b>: a background thread works while the main thread continues.</li>
<li>Model naturally concurrent jobs (one thread per connection, per sensor, per file).</li>
<li>Learn the base mechanism (<code>start</code>, <code>join</code>, names) that locks, events and pools build on.</li>
</ul>`
        },
        {
            content: `<h4>Complete Example: Five overlapping worker threads</h4>
Five threads each wait 0.3 s. Started together, the whole job takes far less than the 1.5 s a sequential loop would need.`,
            codeExamples: [
                `import threading
import time

WORKER_COUNT = 5
DELAY = 0.3                                 # seconds each worker "works"

results = {}


def square(n):
    time.sleep(DELAY)
    results[n] = n * n                      # each thread writes its own key


def main():
    threads = [
        threading.Thread(target=square, args=(n,), name=f"worker-{n}")
        for n in range(WORKER_COUNT)
    ]

    start = time.perf_counter()
    for t in threads:
        t.start()
    print("all alive:", all(t.is_alive() for t in threads))
    for t in threads:
        t.join()
    elapsed = time.perf_counter() - start

    print("names:", [t.name for t in threads])
    print("results:", sorted(results.items()))
    print("overlapped:", elapsed < 1.0)     # sequential would take 1.5 s
    print("any alive:", any(t.is_alive() for t in threads))


if __name__ == "__main__":
    main()

# OUTPUT:
# all alive: True
# names: ['worker-0', 'worker-1', 'worker-2', 'worker-3', 'worker-4']
# results: [(0, 0), (1, 1), (2, 4), (3, 9), (4, 16)]
# overlapped: True
# any alive: False`
            ],
            codeExplanations: [
                `All threads are created first, then started, then joined, so the five 0.3 s sleeps overlap (about 0.3 s in total). Results are read only after join() and sorted, so the output is the same on every run. After join() no thread is alive any more.`
            ]
        },
        {
            content: `<h4>A Thread in Three Steps</h4>
A <b>thread</b> is an independent flow of execution inside your program. Python's <code>threading</code> module (like <code>java.lang.Thread</code>) gives you the <code>Thread</code> class. The pattern is always:
<ol>
<li><b>Create</b> it: <code>Thread(target=function, args=(...))</code></li>
<li><b>Start</b> it: <code>t.start()</code> - the function now runs concurrently.</li>
<li><b>Join</b> it: <code>t.join()</code> - wait until it has finished.</li>
</ol>
Call <code>start()</code>, <b>not</b> <code>run()</code>: calling <code>run()</code> just executes the function in the current thread, with no concurrency.`,
            codeExamples: [
                `import threading

def greet(name, times):
    for i in range(times):
        print(f"Hello {name} {i}")

t = threading.Thread(target=greet, args=("Asha", 2))
t.start()
t.join()
print("done")

# OUTPUT:
# Hello Asha 0
# Hello Asha 1
# done`
            ],
            codeExplanations: [
                `The worker thread runs greet("Asha", 2). join() makes the main thread wait for it, which is why "done" is printed last. Without join(), "done" could appear first or in the middle, because the two threads run independently.`
            ]
        },
        {
            content: `<h4>Running Several Threads</h4>
Create all the threads first, start them all, then join them all. Starting and joining inside the same loop would run them one after another.`,
            codeExamples: [
                `import threading

results = {}

def square(n):
    results[n] = n * n          # each thread writes its own key

threads = [threading.Thread(target=square, args=(n,)) for n in range(5)]

for t in threads:
    t.start()
for t in threads:
    t.join()

print(sorted(results.items()))

# OUTPUT:
# [(0, 0), (1, 1), (2, 4), (3, 9), (4, 16)]`
            ]
        },
        {
            content: `<h4>Threads Do Not Return Values</h4>
A thread's target function can <code>return</code> a value, but <code>join()</code> discards it. Hand results back through a shared structure (as above), a <code>queue.Queue</code>, or use <code>ThreadPoolExecutor</code> futures (last topic of this module), which return results directly.`
        },
        {
            content: `<h4>Waiting, Checking and Names</h4>
<code>join(timeout)</code> waits at most that many seconds; <code>is_alive()</code> tells you if the thread is still running. Give threads a <code>name</code> to make logs and debugging readable.`,
            codeExamples: [
                `import threading
import time

t = threading.Thread(target=time.sleep, args=(0.3,), name="sleeper")
t.start()

t.join(timeout=0.05)             # give up waiting after 50 ms
print(t.name, t.is_alive())

t.join()                          # now wait for real
print(t.name, t.is_alive())

# OUTPUT:
# sleeper True
# sleeper False`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Subclassing Thread</h3>
Instead of passing a function you can subclass <code>Thread</code> and override <code>run()</code>. This is handy when the thread owns state. Prefer the <code>target=</code> style for simple jobs; subclass when the thread is an object with a lifecycle.`,
            codeExamples: [
                `import threading

class Downloader(threading.Thread):
    def __init__(self, url):
        super().__init__(name=f"dl-{url}")
        self.url = url
        self.result = None

    def run(self):                       # runs in the new thread after start()
        self.result = f"content of {self.url}"

jobs = [Downloader("a.com"), Downloader("b.com")]
for job in jobs:
    job.start()
for job in jobs:
    job.join()

print([job.result for job in jobs])

try:
    jobs[0].start()                      # a thread can only be started once
except RuntimeError as error:
    print("RuntimeError:", error)

# OUTPUT:
# ['content of a.com', 'content of b.com']
# RuntimeError: threads can only be started once`
            ]
        },
        {
            content: `<h3>Daemon Threads</h3>
A Python program exits when all <b>non-daemon</b> threads have finished. A <b>daemon thread</b> (<code>daemon=True</code>, set <i>before</i> <code>start()</code>) does not keep the program alive: when only daemon threads remain they are <b>stopped abruptly</b> - no <code>finally</code> blocks, no cleanup. Use daemons only for background chores that are safe to kill (heartbeats, metrics); never for work that must complete or release resources.`,
            codeExamples: [
                `import threading
import time

def background():
    while True:
        time.sleep(0.1)          # runs forever

t = threading.Thread(target=background, daemon=True)
t.start()

print("daemon:", t.daemon)
print("main finished - the program exits even though t is still running")

# OUTPUT:
# daemon: True
# main finished - the program exits even though t is still running`
            ]
        },
        {
            content: `<h3>Exceptions Inside Threads</h3>
An exception that escapes a thread's function <b>does not stop the main thread</b>. By default a traceback is printed to stderr and that thread simply ends - easy to miss. Install <code>threading.excepthook</code> to log or collect such failures, or catch exceptions inside the target, or use futures, which re-raise on <code>result()</code>.`,
            codeExamples: [
                `import threading

def hook(args):
    print("thread failed:", args.exc_type.__name__, args.exc_value)

threading.excepthook = hook

def bad():
    raise ValueError("boom")

t = threading.Thread(target=bad)
t.start()
t.join()
print("main continues")

# OUTPUT:
# thread failed: ValueError boom
# main continues`
            ]
        },
        {
            content: `<h3>Thread-Local Data, Timers and Introspection</h3>
<ul>
<li><b><code>threading.local()</code></b> gives each thread its own private attributes - ideal for per-thread connections or request context without passing arguments around.</li>
<li><b><code>threading.Timer(seconds, func)</code></b> runs a function once after a delay (cancel with <code>.cancel()</code>).</li>
<li><b><code>threading.current_thread()</code>, <code>active_count()</code>, <code>enumerate()</code>, <code>main_thread()</code>, <code>get_ident()</code></b> let you inspect what is running.</li>
</ul>`,
            codeExamples: [
                `import threading
import time

local = threading.local()
seen = []

def worker(n):
    local.value = n                      # private to this thread
    time.sleep(0.05)                     # other threads set THEIR value meanwhile
    seen.append((n, local.value))

threads = [threading.Thread(target=worker, args=(n,)) for n in range(3)]
for t in threads:
    t.start()
for t in threads:
    t.join()
print(sorted(seen))

timer = threading.Timer(0.1, print, args=("timer fired",))
timer.start()
timer.join()

# OUTPUT:
# [(0, 0), (1, 1), (2, 2)]
# timer fired`
            ]
        },
        {
            content: `<h3>Common Mistakes</h3>
<ul>
<li><b>Calling the function instead of passing it:</b> <code>Thread(target=work())</code> runs <code>work</code> immediately in the current thread and passes its <i>result</i> as the target. Write <code>target=work</code>.</li>
<li><b>One-item args without the comma:</b> <code>args=(5)</code> is just the number 5. Use <code>args=(5,)</code>.</li>
<li><b>Late-binding lambdas:</b> <code>Thread(target=lambda: print(i))</code> in a loop captures the variable <code>i</code>, not its value, so every thread sees the final value. Pass the value with <code>args</code>.</li>
<li><b>Forgetting to join:</b> the main thread may finish and read incomplete results.</li>
<li><b>Too many threads:</b> each costs memory (a stack of up to several MB of address space) and scheduling time. Use a pool for large numbers of tasks.</li>
</ul>`,
            codeExamples: [
                `import threading

threads = [threading.Thread(target=lambda: print("late binding:", i)) for i in range(3)]
for t in threads:
    t.start()
for t in threads:
    t.join()

fixed = [threading.Thread(target=print, args=("fixed:", i)) for i in range(3)]
for t in fixed:
    t.start()
for t in fixed:
    t.join()

# OUTPUT (lines of the same kind appear in thread-scheduling order):
# late binding: 2
# late binding: 2
# late binding: 2
# fixed: 0
# fixed: 1
# fixed: 2`
            ]
        },
        {
            content: `<h3>Advantages and Disadvantages</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Advantages</th><th>Disadvantages</th></tr>
<tr><td>Waiting tasks overlap: total time is about the longest wait</td><td>The GIL stops CPU-bound Python code from running in parallel</td></tr>
<tr><td>Threads share memory: no copying of data between them</td><td><code>join()</code> discards the return value: results need a shared structure</td></tr>
<tr><td>Cheap to create compared with separate processes</td><td>Shared memory invites race conditions and deadlocks</td></tr>
<tr><td>Simple API: <code>Thread</code>, <code>start()</code>, <code>join()</code></td><td>Output order between threads is nondeterministic and hard to test</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td><code>start()</code> vs <code>run()</code>?</td><td><code>start()</code> creates a new thread that calls <code>run()</code>; calling <code>run()</code> directly just runs it in the current thread</td></tr>
<tr class='text-center'><td>What does <code>join()</code> do?</td><td>Blocks the caller until that thread finishes (or the timeout expires)</td></tr>
<tr class='text-center'><td>What is a daemon thread?</td><td>A background thread that does not keep the program alive and is killed abruptly at exit</td></tr>
<tr class='text-center'><td>What happens if a thread raises an exception?</td><td>Only that thread ends (traceback to stderr); the main thread continues - use <code>threading.excepthook</code> or futures to handle it</td></tr>
<tr class='text-center'><td>How do you get a result out of a thread?</td><td>Shared structure, <code>queue.Queue</code>, or a <code>Future</code> from <code>ThreadPoolExecutor</code></td></tr>
</table>`
        }
    ]
};
