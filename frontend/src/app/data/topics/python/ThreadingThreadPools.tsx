import type { Topic } from '../../types';

export const threadingThreadPools: Topic = {
    id: 'python-multithreading-thread-pools',
    name: 'Thread Pools',
    beginner: [
        {
            content: `<h4>Introduction</h4>
A <b>thread pool</b> keeps a fixed number of worker threads alive and feeds them tasks from a queue, so you do not create one thread per task. In Python this is <code>concurrent.futures.ThreadPoolExecutor</code>, the counterpart of Java's <code>ExecutorService</code> (<code>Executors.newFixedThreadPool(n)</code>). <code>submit()</code> returns a <b>Future</b> (like Java's <code>Future</code>), whose <code>result()</code> returns the value or re-raises the task's exception. Used in a <code>with</code> block, the pool waits for all tasks and shuts down cleanly.

<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:12px 0;">
<svg viewBox="0 0 642 68" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:642px;height:auto;font-family:monospace;display:block;margin:0 auto">
<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#6b7280"/></marker></defs>
<rect x="10" y="10" width="111.6" height="48" rx="6" fill="#eff6ff" stroke="#2563eb"/><text text-anchor="middle" font-size="12" fill="#1e40af"><tspan x="65.8" y="30.5">submit(task)</tspan><tspan x="65.8" y="45.5">8 tasks</tspan></text><line x1="121.6" y1="34" x2="151.6" y2="34" stroke="#6b7280" marker-end="url(#ar)"/><rect x="155.6" y="10" width="140.8" height="48" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="226" y="30.5">task queue</tspan><tspan x="226" y="45.5">[t5][t6][t7][t8]</tspan></text><line x1="296.4" y1="34" x2="326.4" y2="34" stroke="#6b7280" marker-end="url(#ar)"/><rect x="330.4" y="10" width="126.2" height="48" rx="6" fill="#fff7ed" stroke="#ea580c"/><text text-anchor="middle" font-size="12" fill="#9a3412"><tspan x="393.5" y="30.5">worker threads</tspan><tspan x="393.5" y="45.5">max_workers=4</tspan></text><line x1="456.6" y1="34" x2="486.6" y2="34" stroke="#6b7280" marker-end="url(#ar)"/><rect x="490.6" y="10" width="140.8" height="48" rx="6" fill="#ecfdf5" stroke="#059669"/><text text-anchor="middle" font-size="12" fill="#065f46"><tspan x="561" y="30.5">Future</tspan><tspan x="561" y="45.5">result() / error</tspan></text>
</svg>
<div style="font-size:12px;color:#6b7280;text-align:center;margin-top:6px;">Figure: tasks wait in a queue, a fixed set of workers runs them, futures carry the results back</div>
</div>`
        },
        {
            content: `<h4>Purpose / Need of This Topic</h4>
<b>The problem:</b> Creating a thread for every small task wastes memory and start-up time, and a thousand tasks means a thousand threads, while <code>join()</code> gives no return values or errors.
<br><br>
<b>Why we need it:</b>
<ul>
<li><b>Reuse</b> a fixed number of threads for many tasks.</li>
<li>Limit concurrency with <code>max_workers</code> so the machine is not overloaded.</li>
<li>Get <b>return values and exceptions</b> back through futures.</li>
<li>Shut down cleanly with a <code>with</code> block instead of tracking threads by hand.</li>
</ul>`
        },
        {
            content: `<h4>Complete Example: Eight tasks on four workers</h4>
Eight 0.2 s downloads share four workers. One task fails on purpose to show that <code>future.result()</code> re-raises the exception in the caller.`,
            codeExamples: [
                `import time
from concurrent.futures import ThreadPoolExecutor

WORKERS = 4
TASKS = 8
DELAY = 0.2                                 # stands in for a network request
BAD_PAGE = 7


def download(page):
    time.sleep(DELAY)
    if page == BAD_PAGE:
        raise ValueError(f"page {page} is missing")
    return f"page {page}"


def main():
    start = time.perf_counter()
    with ThreadPoolExecutor(max_workers=WORKERS) as pool:
        futures = [pool.submit(download, n) for n in range(TASKS)]
    elapsed = time.perf_counter() - start

    pages, errors = [], []
    for future in futures:
        try:
            pages.append(future.result())   # value, or re-raises the task's error
        except ValueError as error:
            errors.append(str(error))

    print("downloaded:", len(pages), "last:", pages[-1])
    print("errors:", errors)
    print("faster than sequential:", elapsed < 1.0)   # 8 x 0.2 s = 1.6 s alone


if __name__ == "__main__":
    main()

# OUTPUT:
# downloaded: 7 last: page 6
# errors: ['page 7 is missing']
# faster than sequential: True`
            ],
            codeExplanations: [
                `Four workers process the eight tasks in two rounds of about 0.2 s, so the total is near 0.4 s instead of 1.6 s. Futures are read in submission order, so the pages are in order and "page 6" is the last successful one. The exception raised inside the worker thread is stored in the future and re-raised by result(), where the caller can handle it.`
            ]
        },
        {
            content: `<h4>Why a Pool?</h4>
Creating a new thread for every small task is wasteful (each thread costs memory and start-up time) and dangerous (a thousand tasks means a thousand threads). A <b>thread pool</b> keeps a fixed number of worker threads alive and feeds them tasks from a queue; finished workers pick up the next task. Python's standard tool is <code>concurrent.futures.ThreadPoolExecutor</code> - the same idea as Java's <code>ExecutorService</code>.`
        },
        {
            content: `<h4>submit() and Futures</h4>
<code>pool.submit(func, *args)</code> schedules a call and immediately returns a <b>Future</b>: a placeholder for the result. <code>future.result()</code> waits for the task and returns its value - or <b>re-raises its exception</b>. Using the pool in a <code>with</code> block waits for all tasks and shuts it down cleanly.`,
            codeExamples: [
                `from concurrent.futures import ThreadPoolExecutor

def square(n):
    return n * n

with ThreadPoolExecutor(max_workers=3) as pool:
    futures = [pool.submit(square, n) for n in range(5)]
    results = [f.result() for f in futures]      # in submission order

print(results)

# OUTPUT:
# [0, 1, 4, 9, 16]`
            ]
        },
        {
            content: `<h4>map(): The Short Version</h4>
<code>pool.map(func, iterable)</code> applies the function to every item and yields results <b>in input order</b>.`,
            codeExamples: [
                `import time
from concurrent.futures import ThreadPoolExecutor

def fetch(page):
    time.sleep(0.2)                     # stands in for a network request
    return f"page {page}"

start = time.perf_counter()
with ThreadPoolExecutor(max_workers=10) as pool:
    pages = list(pool.map(fetch, range(10)))
elapsed = time.perf_counter() - start

print(pages[:3])
print(elapsed < 1.0)                    # ten 0.2 s tasks overlapped (2 s one by one)

# OUTPUT:
# ['page 0', 'page 1', 'page 2']
# True`
            ]
        },
        {
            content: `<h4>as_completed(): Results as They Finish</h4>
<code>map</code> and a list of <code>result()</code> calls return in <i>input</i> order, so one slow task delays everything behind it. <code>as_completed(futures)</code> yields each future <b>as soon as it is done</b>.`,
            codeExamples: [
                `import time
from concurrent.futures import ThreadPoolExecutor, as_completed

def task(name, delay):
    time.sleep(delay)
    return name

with ThreadPoolExecutor(max_workers=3) as pool:
    futures = [
        pool.submit(task, "slow", 0.3),
        pool.submit(task, "fast", 0.1),
        pool.submit(task, "medium", 0.2),
    ]
    for future in as_completed(futures):
        print(future.result())

# OUTPUT:
# fast
# medium
# slow`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Exceptions Travel Through Futures</h3>
An exception raised in a task is stored in its Future and <b>re-raised in the caller</b> when you ask for the result - so errors are not silently lost like in a bare <code>Thread</code>. You can also inspect it with <code>future.exception()</code>.`,
            codeExamples: [
                `from concurrent.futures import ThreadPoolExecutor

def risky(n):
    if n == 2:
        raise ValueError(f"bad input {n}")
    return n * 10

with ThreadPoolExecutor(max_workers=2) as pool:
    futures = [pool.submit(risky, n) for n in range(4)]

for future in futures:
    try:
        print(future.result())
    except ValueError as error:
        print("error:", error)

# OUTPUT:
# 0
# 10
# error: bad input 2
# 30`
            ]
        },
        {
            content: `<h3>Callbacks, Timeouts and Waiting</h3>
<ul>
<li><code>future.add_done_callback(fn)</code> calls <code>fn(future)</code> when the task finishes (in the worker thread, or immediately if already done).</li>
<li><code>future.result(timeout=2)</code> raises <code>TimeoutError</code> if the task takes longer. The task <b>keeps running</b> - a thread cannot be killed.</li>
<li><code>future.cancel()</code> cancels only a task that has <b>not started</b> yet.</li>
<li><code>wait(futures, return_when=FIRST_COMPLETED)</code> waits for the first result, all of them, or the first exception.</li>
</ul>`,
            codeExamples: [
                `import time
from concurrent.futures import FIRST_COMPLETED, ThreadPoolExecutor, TimeoutError, wait

def work(name, delay):
    time.sleep(delay)
    return name

with ThreadPoolExecutor(max_workers=2) as pool:
    first = pool.submit(work, "quick", 0.05)
    first.add_done_callback(lambda f: print("callback got", f.result()))
    slow = pool.submit(work, "slow", 0.5)

    done, not_done = wait([first, slow], return_when=FIRST_COMPLETED)
    print([f.result() for f in done])
    print(len(not_done))

    try:
        slow.result(timeout=0.01)           # too impatient
    except TimeoutError:
        print("timed out waiting; the task is still running")

# OUTPUT (the callback line and the next line may swap):
# callback got quick
# ['quick']
# 1
# timed out waiting; the task is still running`
            ]
        },
        {
            content: `<h3>Sizing the Pool</h3>
The default is <code>min(32, os.cpu_count() + 4)</code> workers - a sensible choice for I/O work. Guidance:
<ul>
<li><b>I/O-bound:</b> more workers than cores is fine; the limit is the remote service, the database or your file-descriptor budget. Measure, starting from 10-50.</li>
<li><b>CPU-bound:</b> threads give no speed-up under the GIL; use <code>ProcessPoolExecutor</code> (or a free-threaded build).</li>
<li><b>Calling a rate-limited API:</b> size the pool to the allowed concurrency, not to the number of tasks.</li>
<li><b>Never create a pool per task.</b> Create it once, reuse it, and shut it down at exit.</li>
</ul>
Give threads recognisable names with <code>thread_name_prefix</code> so logs and stack dumps say which pool a thread belongs to, and use <code>initializer</code> to set up per-thread resources once (for example a database connection or HTTP session stored in a <code>threading.local</code>).`,
            codeExamples: [
                `import threading
from concurrent.futures import ThreadPoolExecutor

local = threading.local()

def init_worker():
    local.session = f"session-for-{threading.current_thread().name}"

def job(n):
    return threading.current_thread().name, local.session

with ThreadPoolExecutor(max_workers=2, thread_name_prefix="fetch",
                        initializer=init_worker) as pool:
    results = list(pool.map(job, range(6)))

print(all(name.startswith("fetch_") for name, _ in results))
print(all(session.endswith(name) for name, session in results))

# OUTPUT:
# True
# True`
            ]
        },
        {
            content: `<h3>Shutdown and Back-Pressure</h3>
<ul>
<li><b>Always shut down:</b> use <code>with</code>, or call <code>shutdown(wait=True)</code>. <code>shutdown(cancel_futures=True)</code> (3.9+) drops tasks that have not started.</li>
<li><b>Unbounded queue:</b> <code>submit</code> never blocks, so submitting millions of tasks fills memory with pending work. Submit in batches, or bound the queue with a semaphore (see the Semaphore topic).</li>
<li><b>Worker threads are non-daemon</b> (since 3.9 they are joined at exit), so a never-ending task keeps the program from exiting.</li>
<li><b>Don't wait on the same pool from inside a task</b> - it can deadlock when all workers are busy waiting (see Deadlocks).</li>
<li><b>Mixing with asyncio:</b> <code>await loop.run_in_executor(pool, func, arg)</code> or <code>asyncio.to_thread(func, arg)</code> lets coroutines call blocking code without freezing the event loop.</li>
</ul>`
        },
        {
            content: `<h3>ThreadPoolExecutor vs the Alternatives</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Tool</th><th>Best for</th></tr>
<tr class='text-center'><td><code>ThreadPoolExecutor</code></td><td>Modern default for blocking I/O tasks; futures and clean error handling</td></tr>
<tr class='text-center'><td><code>ProcessPoolExecutor</code></td><td>CPU-bound tasks; same API</td></tr>
<tr class='text-center'><td><code>asyncio</code></td><td>Thousands of concurrent I/O operations</td></tr>
<tr class='text-center'><td><code>multiprocessing.pool.ThreadPool</code></td><td>Older API (<code>apply_async</code>, <code>imap_unordered</code>); still works</td></tr>
<tr class='text-center'><td>Manual <code>Thread</code> + <code>Queue</code></td><td>Long-lived workers with custom protocols</td></tr>
</table>`
        },
        {
            content: `<h3>Advantages and Disadvantages</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Advantages</th><th>Disadvantages</th></tr>
<tr><td>Threads are reused: no start-up cost per task</td><td>Still limited by the GIL for CPU-bound work (use processes)</td></tr>
<tr><td><code>max_workers</code> caps the number of threads</td><td>Too few workers leaves tasks queued; too many wastes memory</td></tr>
<tr><td>Futures return values and propagate exceptions</td><td>A task that never finishes blocks its worker, and the shutdown wait</td></tr>
<tr><td><code>with</code> block gives clean shutdown</td><td>An unread future hides its exception until <code>result()</code> is called</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why use a thread pool?</td><td>Reuse a bounded set of threads instead of creating one per task: lower overhead and controlled concurrency</td></tr>
<tr class='text-center'><td>What is a Future?</td><td>A handle for a result that is not ready yet; <code>result()</code> waits and returns it or re-raises the task's exception</td></tr>
<tr class='text-center'><td><code>map</code> vs <code>as_completed</code>?</td><td><code>map</code> yields in input order; <code>as_completed</code> yields futures in completion order</td></tr>
<tr class='text-center'><td>Can you cancel a running task?</td><td>No - only tasks that have not started; threads cannot be killed, so design tasks to check a stop flag</td></tr>
<tr class='text-center'><td>When is a thread pool the wrong tool?</td><td>CPU-bound work in a GIL build - use a process pool</td></tr>
</table>`
        }
    ]
};
