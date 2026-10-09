import type { Topic } from '../../types';

export const threadingDeadlocks: Topic = {
    id: 'python-multithreading-deadlocks',
    name: 'Deadlocks',
    beginner: [
        {
            content: `<h4>Introduction</h4>
A <b>deadlock</b> occurs when threads wait for each other forever: thread 1 holds lock A and waits for lock B, while thread 2 holds lock B and waits for lock A. Nobody can proceed, nothing is released, and the program simply hangs with no error. The conditions are the same as in Java: mutual exclusion, hold and wait, no preemption and a <b>circular wait</b>. Break any one of them, most simply by always acquiring locks in the <b>same global order</b>, and deadlock becomes impossible.

<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:12px 0;">
<svg viewBox="0 0 342 195" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:342px;height:auto;font-family:monospace;display:block;margin:0 auto">
<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#6b7280"/></marker></defs>
<line x1="92.4" y1="35.5" x2="260.0" y2="35.5" stroke="#6b7280" marker-end="url(#ar)"/><text x="180.2" y="31.5" font-size="11" fill="#6b7280">holds</text><line x1="92.4" y1="165.5" x2="260.0" y2="165.5" stroke="#6b7280" marker-end="url(#ar)"/><text x="180.2" y="161.5" font-size="11" fill="#6b7280">holds</text><line x1="80.1" y1="51.0" x2="265.0" y2="150.0" stroke="#6b7280" stroke-dasharray="5 4" marker-end="url(#ar)"/><line x1="80.1" y1="150.0" x2="265.0" y2="51.0" stroke="#6b7280" stroke-dasharray="5 4" marker-end="url(#ar)"/><rect x="10" y="20" width="82.4" height="31" rx="6" fill="#eff6ff" stroke="#2563eb"/><text text-anchor="middle" font-size="12" fill="#1e40af"><tspan x="51.2" y="39.5">Thread 1</tspan></text><rect x="10" y="150" width="82.4" height="31" rx="6" fill="#eff6ff" stroke="#2563eb"/><text text-anchor="middle" font-size="12" fill="#1e40af"><tspan x="51.2" y="169.5">Thread 2</tspan></text><rect x="260" y="20" width="67.8" height="31" rx="6" fill="#fff7ed" stroke="#ea580c"/><text text-anchor="middle" font-size="12" fill="#9a3412"><tspan x="293.9" y="39.5">Lock A</tspan></text><rect x="260" y="150" width="67.8" height="31" rx="6" fill="#fff7ed" stroke="#ea580c"/><text text-anchor="middle" font-size="12" fill="#9a3412"><tspan x="293.9" y="169.5">Lock B</tspan></text>
</svg>
<div style="font-size:12px;color:#6b7280;text-align:center;margin-top:6px;">Figure: solid = holds, dashed = waits for: each thread waits for the lock the other holds</div>
</div>`
        },
        {
            content: `<h4>Purpose / Need of This Topic</h4>
<b>The problem:</b> A program that uses more than one lock freezes at random, uses no CPU, prints nothing, and cannot be stopped except by killing it.
<br><br>
<b>Why we need it:</b>
<ul>
<li>Recognise the <b>circular wait</b> pattern behind a frozen program.</li>
<li>Prevent it by acquiring multiple locks in one <b>consistent order</b>.</li>
<li>Detect it safely during testing with daemon threads and <code>join(timeout)</code>.</li>
<li>Reduce risk by holding fewer locks, for a shorter time.</li>
</ul>`
        },
        {
            content: `<h4>Complete Example: Opposite lock order versus the same order</h4>
Two scenarios run the same worker. Opposite lock order deadlocks; the same order finishes. Daemon threads and <code>join(timeout)</code> keep the program from hanging.`,
            codeExamples: [
                `import threading
import time

TIMEOUT = 1.0                               # seconds to wait before giving up


def worker(first, second):
    with first:
        time.sleep(0.1)                     # let the other thread take its first lock
        with second:
            pass


def is_deadlocked(orders):
    locks = {"A": threading.Lock(), "B": threading.Lock()}
    threads = [
        threading.Thread(
            target=worker, args=(locks[a], locks[b]), daemon=True
        )
        for a, b in orders
    ]
    for t in threads:
        t.start()
    for t in threads:
        t.join(timeout=TIMEOUT)
    return any(t.is_alive() for t in threads)


def main():
    opposite = [("A", "B"), ("B", "A")]     # circular wait possible
    same = [("A", "B"), ("A", "B")]         # one global order

    print("opposite order -> deadlocked:", is_deadlocked(opposite))
    print("same order     -> deadlocked:", is_deadlocked(same))


if __name__ == "__main__":
    main()

# OUTPUT:
# opposite order -> deadlocked: True
# same order     -> deadlocked: False`
            ],
            codeExplanations: [
                `With opposite order each thread takes its first lock, sleeps, then waits forever for the lock the other holds, so both are still alive after the timeout. With the same order the second thread cannot even take lock A until the first has finished, so both complete in about 0.2 s. Daemon threads let the interpreter exit even though the deadlocked pair never ends.`
            ]
        },
        {
            content: `<h4>What Is a Deadlock?</h4>
A <b>deadlock</b> happens when threads wait for each other <b>forever</b>. Thread A holds lock 1 and waits for lock 2; thread B holds lock 2 and waits for lock 1. Neither can continue, so neither ever releases anything. The program does not crash or print an error - it just <b>hangs</b>, using no CPU.
<pre>Thread A: holds lock_a  --- waits for --->  lock_b
Thread B: holds lock_b  --- waits for --->  lock_a      (a circular wait)</pre>
It is like two people meeting in a narrow corridor, each refusing to step back until the other does.`
        },
        {
            content: `<h4>Creating One (Safely)</h4>
The two threads below take the same two locks in <b>opposite order</b>. The sleep guarantees each grabs its first lock before trying for its second. They are daemon threads and we use <code>join(timeout)</code>, so the demo reports the deadlock instead of hanging.`,
            codeExamples: [
                `import threading
import time

lock_a = threading.Lock()
lock_b = threading.Lock()

def worker_1():
    with lock_a:
        time.sleep(0.1)          # make sure worker_2 has taken lock_b
        with lock_b:             # waits forever
            pass

def worker_2():
    with lock_b:
        time.sleep(0.1)
        with lock_a:             # waits forever
            pass

t1 = threading.Thread(target=worker_1, daemon=True)
t2 = threading.Thread(target=worker_2, daemon=True)
t1.start()
t2.start()

t1.join(timeout=1)
t2.join(timeout=1)
print("deadlocked:", t1.is_alive() and t2.is_alive())

# OUTPUT:
# deadlocked: True`
            ],
            codeExplanations: [
                `After 1 second both threads are still alive, each stuck on its second lock. Without daemon=True and the timeouts this program would never end. Because the threads are daemons the interpreter can still exit.`
            ]
        },
        {
            content: `<h4>The Fix: Always Lock in the Same Order</h4>
If every thread takes the locks in the <b>same global order</b>, a circular wait is impossible. A simple way is to sort the locks by a fixed key (here the object's <code>id</code>) before acquiring.`,
            codeExamples: [
                `import threading
import time
from contextlib import ExitStack

lock_a = threading.Lock()
lock_b = threading.Lock()

def acquire_in_order(*locks):
    stack = ExitStack()
    for lock in sorted(locks, key=id):        # one consistent global order
        stack.enter_context(lock)
    return stack

def worker_1():
    with acquire_in_order(lock_a, lock_b):
        time.sleep(0.1)

def worker_2():
    with acquire_in_order(lock_b, lock_a):    # written in the opposite order...
        time.sleep(0.1)                       # ...but acquired in the same order

t1 = threading.Thread(target=worker_1, daemon=True)
t2 = threading.Thread(target=worker_2, daemon=True)
t1.start()
t2.start()
t1.join(timeout=2)
t2.join(timeout=2)

print("finished:", not t1.is_alive() and not t2.is_alive())

# OUTPUT:
# finished: True`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>The Four Conditions (Coffman)</h3>
A deadlock needs <b>all four</b> of these at once. Remove any one and it cannot happen:
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Condition</th><th>Meaning</th><th>How to break it</th></tr>
<tr class='text-center'><td>Mutual exclusion</td><td>A resource is held by one thread at a time</td><td>Use lock-free / immutable data or queues</td></tr>
<tr class='text-center'><td>Hold and wait</td><td>A thread holds one lock while waiting for another</td><td>Acquire everything at once, or release before waiting</td></tr>
<tr class='text-center'><td>No preemption</td><td>Locks cannot be taken away</td><td>Use timeouts and back off</td></tr>
<tr class='text-center'><td>Circular wait</td><td>A cycle of threads each waiting for the next</td><td><b>Impose a global lock order</b> (the usual fix)</td></tr>
</table>`
        },
        {
            content: `<h3>Timeout and Back-Off</h3>
When a consistent order is not possible, acquire the second lock with a <b>timeout</b>. If it fails, release the first lock, wait a little (with random jitter), and retry. This turns a permanent hang into a recoverable delay. Beware <b>livelock</b>: threads that keep backing off and retrying in lock-step make no progress either - the random jitter prevents it.`,
            codeExamples: [
                `import random
import threading
import time

def transfer(first, second, work, attempts=10):
    for _ in range(attempts):
        with first:
            if second.acquire(timeout=0.05):
                try:
                    return work()
                finally:
                    second.release()
        time.sleep(random.uniform(0.001, 0.01))     # jitter before retrying
    raise TimeoutError("could not obtain both locks")

a, b = threading.Lock(), threading.Lock()
print(transfer(a, b, lambda: "transferred"))

# OUTPUT:
# transferred`
            ]
        },
        {
            content: `<h3>Other Ways to Deadlock</h3>
<ul>
<li><b>Self-deadlock:</b> taking a non-reentrant <code>Lock</code> twice in the same thread (a method calling another method that takes the same lock). Use <code>RLock</code> or restructure.</li>
<li><b>Join cycles:</b> thread A holds a lock and calls <code>b.join()</code> while thread B needs that lock to finish.</li>
<li><b>Queue deadlock:</b> a bounded <code>queue.Queue</code> where producers and consumers are the same threads and the queue is full: everyone is waiting to <code>put</code>, nobody is calling <code>get</code>.</li>
<li><b>Thread-pool starvation:</b> tasks that submit sub-tasks to the <i>same</i> pool and wait for them. With all workers occupied by waiting parents, the children can never run.</li>
<li><b>Callbacks under a lock:</b> calling user code (which may take other locks) while holding your lock.</li>
<li><b>Forking with threads:</b> <code>fork()</code> copies locks held by other threads in a locked state, with no thread alive to release them. Another reason <code>spawn</code>/<code>forkserver</code> are safer.</li>
</ul>`,
            codeExamples: [
                `from concurrent.futures import ThreadPoolExecutor, TimeoutError   # 3.11+: same as the built-in

pool = ThreadPoolExecutor(max_workers=1)

def parent():
    child = pool.submit(lambda: "child result")
    return child.result()          # waits for a worker - but the only worker is HERE

future = pool.submit(parent)
try:
    future.result(timeout=1)
except TimeoutError:
    print("deadlock: the parent waits for a child that can never start")

pool.shutdown(wait=False, cancel_futures=True)

# OUTPUT:
# deadlock: the parent waits for a child that can never start`
            ]
        },
        {
            content: `<h3>Diagnosing a Hang</h3>
When a program freezes, you need to see <b>where each thread is stuck</b>:
<ul>
<li><b><code>faulthandler.dump_traceback_later(seconds, exit=True)</code></b> prints every thread's stack after a delay and can abort - a built-in watchdog for tests and CI.</li>
<li><b><code>faulthandler.register(signal.SIGUSR1)</code></b> (POSIX) dumps all stacks on demand without stopping the process.</li>
<li><b><code>py-spy dump --pid &lt;pid&gt;</code></b> inspects a running process from outside, no code changes needed.</li>
<li><b><code>sys._current_frames()</code></b> gives each thread's current frame, for building your own diagnostics.</li>
<li><b>Debugger:</b> pause the program and look at the threads panel; two threads waiting in <code>acquire</code> on each other's locks is the signature.</li>
</ul>`,
            codeExamples: [
                `import faulthandler
import sys

# Watchdog: if the program is still running after 30 s, print all thread
# stacks to stderr and exit. Cancel it when the work completes normally.
faulthandler.dump_traceback_later(30, exit=True)

# ... run the code that might deadlock ...

faulthandler.cancel_dump_traceback_later()
print("finished before the watchdog fired")

# OUTPUT:
# finished before the watchdog fired`
            ]
        },
        {
            content: `<h3>Design Habits That Prevent Deadlocks</h3>
<ul>
<li><b>Prefer one lock</b> over several, unless profiling shows contention. Fewer locks means fewer orderings to get wrong.</li>
<li><b>Never call unknown code</b> (callbacks, overridable methods, I/O) while holding a lock.</li>
<li><b>Document the lock order</b> (e.g. "always account lock before ledger lock") and enforce it in code review.</li>
<li><b>Use higher-level structures:</b> queues, thread pools and futures hide most locking.</li>
<li><b>Give every blocking wait a timeout</b> in production code, and log when it expires.</li>
<li><b>Keep critical sections short</b> and never block inside them.</li>
</ul>`
        },
        {
            content: `<h3>Advantages and Disadvantages</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Advantages</th><th>Disadvantages</th></tr>
<tr><td>Knowing the four conditions shows exactly how to prevent it</td><td>No error or traceback: the program just hangs silently</td></tr>
<tr><td>A consistent lock order removes the circular wait</td><td>Often appears only under rare timing, so tests miss it</td></tr>
<tr><td><code>acquire(timeout=...)</code> turns a hang into a handled error</td><td>Enforcing a global lock order across a large code base is hard</td></tr>
<tr><td>Daemon threads and <code>join(timeout)</code> make deadlocks testable</td><td>Deadlocked non-daemon threads keep the process from exiting</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is a deadlock?</td><td>Threads blocked forever, each waiting for a resource another holds</td></tr>
<tr class='text-center'><td>What four conditions are required?</td><td>Mutual exclusion, hold and wait, no preemption, circular wait</td></tr>
<tr class='text-center'><td>How do you prevent the classic two-lock deadlock?</td><td>Acquire locks in a single global order everywhere</td></tr>
<tr class='text-center'><td>Deadlock vs livelock vs starvation?</td><td>Deadlock: all blocked. Livelock: all busy but making no progress. Starvation: one thread never gets its turn</td></tr>
<tr class='text-center'><td>How do you debug a hung program?</td><td><code>faulthandler</code> stack dumps, <code>py-spy dump</code>, or a debugger's thread view</td></tr>
</table>`
        }
    ]
};
