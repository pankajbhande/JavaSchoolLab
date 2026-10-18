import type { Topic } from '../../types';

export const threadingSemaphore: Topic = {
    id: 'python-multithreading-semaphore',
    name: 'Semaphore',
    beginner: [
        {
            content: `<h4>Introduction</h4>
A <b>semaphore</b> is a counter of permits. <code>acquire()</code> takes a permit and waits when none are left; <code>release()</code> returns one. Unlike a lock it admits <b>up to N threads</b> at the same time, so it limits concurrency instead of forbidding it. Java has the same class, <code>java.util.concurrent.Semaphore</code>, with identical <code>acquire()</code> and <code>release()</code> methods. Use <code>threading.BoundedSemaphore</code> if you want an error when a thread releases more often than it acquired.

<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:12px 0;">
<svg viewBox="0 0 573 190" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:573px;height:auto;font-family:monospace;display:block;margin:0 auto">
<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#6b7280"/></marker></defs>
<text x="10" y="29" font-size="12" fill="#374151">Thread 1</text><line x1="82.4" y1="43" x2="562.4" y2="43" stroke="#e5e7eb"/><rect x="82.4" y="10" width="240" height="30" rx="6" fill="#ecfdf5" stroke="#059669"/><text text-anchor="middle" font-size="12" fill="#065f46"><tspan x="202.4" y="29">permit 1</tspan></text><text x="10" y="71" font-size="12" fill="#374151">Thread 2</text><line x1="82.4" y1="85" x2="562.4" y2="85" stroke="#e5e7eb"/><rect x="82.4" y="52" width="240" height="30" rx="6" fill="#ecfdf5" stroke="#059669"/><text text-anchor="middle" font-size="12" fill="#065f46"><tspan x="202.4" y="71">permit 2</tspan></text><text x="10" y="113" font-size="12" fill="#374151">Thread 3</text><line x1="82.4" y1="127" x2="562.4" y2="127" stroke="#e5e7eb"/><rect x="82.4" y="94" width="240" height="30" rx="6" fill="#fef2f2" stroke="#dc2626"/><text text-anchor="middle" font-size="12" fill="#991b1b"><tspan x="202.4" y="113">waiting</tspan></text><rect x="322.4" y="94" width="240" height="30" rx="6" fill="#ecfdf5" stroke="#059669"/><text text-anchor="middle" font-size="12" fill="#065f46"><tspan x="442.4" y="113">permit 1</tspan></text><text x="10" y="155" font-size="12" fill="#374151">Thread 4</text><line x1="82.4" y1="169" x2="562.4" y2="169" stroke="#e5e7eb"/><rect x="82.4" y="136" width="240" height="30" rx="6" fill="#fef2f2" stroke="#dc2626"/><text text-anchor="middle" font-size="12" fill="#991b1b"><tspan x="202.4" y="155">waiting</tspan></text><rect x="322.4" y="136" width="240" height="30" rx="6" fill="#ecfdf5" stroke="#059669"/><text text-anchor="middle" font-size="12" fill="#065f46"><tspan x="442.4" y="155">permit 2</tspan></text><text x="82.4" y="184" font-size="11" fill="#6b7280">time →</text>
</svg>
<div style="font-size:12px;color:#6b7280;text-align:center;margin-top:6px;">Figure: Semaphore(2): two threads run at once, the others wait for a released permit</div>
</div>`
        },
        {
            content: `<h4>Purpose / Need of This Topic</h4>
<b>The problem:</b> Starting hundreds of threads that all use a limited resource (database connections, an API with a rate limit) overloads it and makes requests fail.
<br><br>
<b>Why we need it:</b>
<ul>
<li>Cap the number of threads using a <b>limited resource</b> (connections, licences, slots).</li>
<li>Throttle load on a server without changing the number of threads you create.</li>
<li>Let extra threads <b>wait politely</b> instead of failing or crashing the resource.</li>
<li>Signal between threads when started with zero permits (producer releases, consumer acquires).</li>
</ul>`
        },
        {
            content: `<h4>Complete Example: Limiting eight workers to three at a time</h4>
All eight threads start together, but a <code>Semaphore(3)</code> lets only three use the "resource" at any moment. A small lock protects the shared counters.`,
            codeExamples: [
                `import threading
import time

LIMIT = 3                                   # permits available
WORKERS = 8
WORK_TIME = 0.1                             # seconds spent holding a permit

semaphore = threading.Semaphore(LIMIT)
guard = threading.Lock()                    # protects the counters below
state = {"active": 0, "peak": 0, "done": 0}


def use_resource():
    with semaphore:                         # take a permit, give it back on exit
        with guard:
            state["active"] += 1
            state["peak"] = max(state["peak"], state["active"])
        time.sleep(WORK_TIME)
        with guard:
            state["active"] -= 1
            state["done"] += 1


def main():
    threads = [threading.Thread(target=use_resource) for _ in range(WORKERS)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()

    print("workers finished:", state["done"])
    print("peak concurrent: ", state["peak"])
    print("within limit:    ", state["peak"] <= LIMIT)


if __name__ == "__main__":
    main()

# OUTPUT:
# workers finished: 8
# peak concurrent:  3
# within limit:     True`
            ],
            codeExplanations: [
                `Eight threads compete for three permits, so at most three are between "with semaphore" and its end at any time; the rest wait. The peak reaches exactly 3 because all threads start within a few milliseconds while each holds a permit for 0.1 s. The guard lock is still needed: the semaphore limits how many threads are inside, it does not protect the shared counters.`
            ]
        },
        {
            content: `<h4>A Counter of Permits</h4>
A <b>semaphore</b> is a lock that lets <b>up to N threads</b> in at the same time, instead of just one. It holds a counter of available "permits":
<ul>
<li><code>acquire()</code> takes a permit (the counter goes down). If none are left, the thread <b>waits</b>.</li>
<li><code>release()</code> returns a permit (the counter goes up) and wakes a waiting thread.</li>
</ul>
A <code>Lock</code> is like a semaphore with exactly one permit. Think of a car park with N spaces: the (N+1)-th car waits at the gate until one leaves. Java has the same class: <code>java.util.concurrent.Semaphore</code>.`
        },
        {
            content: `<h4>Limiting Concurrency</h4>
Six workers all want to run, but the semaphore allows only two at once. The program measures the highest number that were ever inside together.`,
            codeExamples: [
                `import threading
import time

semaphore = threading.Semaphore(2)       # at most 2 threads inside at once
guard = threading.Lock()
active = 0
peak = 0

def worker():
    global active, peak
    with semaphore:                       # acquire on entry, release on exit
        with guard:
            active += 1
            peak = max(peak, active)
        time.sleep(0.1)                   # pretend to use the limited resource
        with guard:
            active -= 1

threads = [threading.Thread(target=worker) for _ in range(6)]
for t in threads:
    t.start()
for t in threads:
    t.join()

print("peak concurrent workers:", peak)

# OUTPUT:
# peak concurrent workers: 2`
            ],
            codeExplanations: [
                `All six threads start at once, but only two get past "with semaphore" at any moment; the others wait. The small guard lock protects the two shared counters (active and peak), because the semaphore only limits how many threads are inside, it does not protect the data they share.`
            ]
        },
        {
            content: `<h4>Typical Uses</h4>
<ul>
<li><b>Connection pools:</b> allow at most N database or API connections at the same time.</li>
<li><b>Rate and load limiting:</b> do not hit a server with more than N parallel downloads.</li>
<li><b>Bounded resources:</b> N printers, N licences, N GPU slots.</li>
<li><b>Signalling:</b> a semaphore starting at 0 lets one thread tell another "an item is ready".</li>
</ul>`,
            codeExamples: [
                `import threading
import time

ready = threading.Semaphore(0)           # no permits yet: consumers must wait

def producer():
    time.sleep(0.1)
    print("item produced")
    ready.release()                       # hand out one permit

def consumer():
    ready.acquire()                       # blocks until the producer releases
    print("item consumed")

c = threading.Thread(target=consumer)
p = threading.Thread(target=producer)
c.start()
p.start()
c.join()
p.join()

# OUTPUT:
# item produced
# item consumed`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>BoundedSemaphore: Catch Over-Release Bugs</h3>
A plain <code>Semaphore</code> lets you <code>release()</code> more times than you <code>acquire()</code>d, silently <b>raising the limit</b> above N - a bug that is hard to find later. <code>BoundedSemaphore</code> raises <code>ValueError</code> instead. Use it whenever the counter is meant to represent a fixed pool.`,
            codeExamples: [
                `import threading

plain = threading.Semaphore(1)
plain.release()                           # no error: the limit is now 2!
print(plain.acquire(blocking=False), plain.acquire(blocking=False))

bounded = threading.BoundedSemaphore(1)
try:
    bounded.release()                     # more releases than acquires
except ValueError as error:
    print("ValueError:", error)

# OUTPUT:
# True True
# ValueError: Semaphore released too many times`
            ]
        },
        {
            content: `<h3>Non-Blocking and Timed Acquire</h3>
Like locks, semaphores support <code>acquire(blocking=False)</code> and <code>acquire(timeout=...)</code>, returning whether a permit was obtained. This allows "try, or skip/shed load" designs instead of queueing without limit.`,
            codeExamples: [
                `import threading

slots = threading.BoundedSemaphore(2)

def try_handle(request):
    if not slots.acquire(blocking=False):
        return f"{request}: busy, try later"          # shed load
    try:
        return f"{request}: handled"
    finally:
        slots.release()

print(try_handle("req-1"))

slots.acquire()
slots.acquire()                                       # both permits taken elsewhere
print(try_handle("req-2"))

# OUTPUT:
# req-1: handled
# req-2: busy, try later`
            ]
        },
        {
            content: `<h3>A Semaphore-Limited Thread Pool Queue</h3>
<code>ThreadPoolExecutor</code> has an <b>unbounded</b> internal queue: submitting a million tasks stores a million pending items in memory. A semaphore gives you <b>back-pressure</b>: the producer blocks when too many tasks are already outstanding.`,
            codeExamples: [
                `import threading
from concurrent.futures import ThreadPoolExecutor

class BoundedExecutor:
    def __init__(self, workers, max_pending):
        self._pool = ThreadPoolExecutor(max_workers=workers)
        self._slots = threading.BoundedSemaphore(max_pending)

    def submit(self, func, *args):
        self._slots.acquire()                         # blocks when the queue is full
        future = self._pool.submit(func, *args)
        future.add_done_callback(lambda _: self._slots.release())
        return future

    def shutdown(self):
        self._pool.shutdown(wait=True)

executor = BoundedExecutor(workers=2, max_pending=4)
futures = [executor.submit(pow, 2, n) for n in range(10)]
print([f.result() for f in futures])
executor.shutdown()

# OUTPUT:
# [1, 2, 4, 8, 16, 32, 64, 128, 256, 512]`
            ]
        },
        {
            content: `<h3>Semaphore vs Other Primitives</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Primitive</th><th>Meaning</th><th>Use when</th></tr>
<tr class='text-center'><td><code>Lock</code></td><td>1 thread inside; the thread that took it releases it</td><td>Protect shared data</td></tr>
<tr class='text-center'><td><code>Semaphore(n)</code></td><td>Up to n threads inside; any thread may release</td><td>Limit access to a resource pool</td></tr>
<tr class='text-center'><td><code>Event</code></td><td>A flag threads wait on</td><td>"Go" and "stop" signals</td></tr>
<tr class='text-center'><td><code>Condition</code></td><td>Wait until a condition on shared state holds</td><td>Producer / consumer protocols</td></tr>
<tr class='text-center'><td><code>queue.Queue</code></td><td>Thread-safe queue (built from the above)</td><td>Passing work between threads (usually the best choice)</td></tr>
</table>
Remember: the semaphore bounds <b>how many</b> threads run a section, not <b>what they do to shared data</b>. If the section modifies shared state, it still needs its own lock. Also note <code>asyncio.Semaphore</code> is a different class for coroutines and multiprocessing has <code>multiprocessing.Semaphore</code> for processes.`
        },
        {
            content: `<h3>Advantages and Disadvantages</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Advantages</th><th>Disadvantages</th></tr>
<tr><td>Limits concurrency to exactly N threads</td><td>Does not protect shared data: you still need a lock</td></tr>
<tr><td>Protects limited resources from overload</td><td>A forgotten <code>release()</code> permanently loses a permit</td></tr>
<tr><td><code>with</code> statement releases the permit automatically</td><td>Plain <code>Semaphore</code> allows extra releases; use <code>BoundedSemaphore</code> to catch them</td></tr>
<tr><td>Can also be used as a simple signalling tool</td><td>Choosing N wrongly either wastes capacity or overloads the resource</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is a semaphore?</td><td>A synchronisation primitive with a counter of permits; acquire decrements (waiting at zero), release increments</td></tr>
<tr class='text-center'><td>Semaphore vs Lock?</td><td>A lock admits one thread; a semaphore admits up to N, and any thread may release it</td></tr>
<tr class='text-center'><td>Why prefer BoundedSemaphore?</td><td>It raises <code>ValueError</code> if released more than acquired, catching accounting bugs</td></tr>
<tr class='text-center'><td>Name a real use.</td><td>Limiting concurrent connections or downloads; back-pressure on a work queue</td></tr>
<tr class='text-center'><td>Does a semaphore protect shared data?</td><td>No - with N > 1 threads inside, shared data still needs a lock</td></tr>
</table>`
        }
    ]
};
