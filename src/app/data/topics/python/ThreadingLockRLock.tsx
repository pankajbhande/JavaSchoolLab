import type { Topic } from '../../types';

export const threadingLockRLock: Topic = {
    id: 'python-multithreading-lock-rlock',
    name: 'Lock & RLock',
    beginner: [
        {
            content: `<h4>Introduction</h4>
A <b>lock</b> (mutex) allows only one thread at a time into a protected section of code, so threads that share data cannot corrupt it. <code>threading.Lock</code> corresponds to a Java <code>synchronized</code> block or a <code>ReentrantLock</code>. A plain <code>Lock</code> cannot be taken twice by the same thread; an <code>RLock</code> (reentrant lock, like Java's <code>synchronized</code> and <code>ReentrantLock</code>) can, which makes it the right choice when a locked method calls another locked method of the same object. Always use <code>with lock:</code> so the lock is released even when an exception occurs.

<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:12px 0;">
<svg viewBox="0 0 633 148" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:633px;height:auto;font-family:monospace;display:block;margin:0 auto">
<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#6b7280"/></marker></defs>
<text x="10" y="29" font-size="12" fill="#374151">Thread A</text><line x1="82.4" y1="43" x2="622.4" y2="43" stroke="#e5e7eb"/><rect x="82.4" y="10" width="180" height="30" rx="6" fill="#ecfdf5" stroke="#059669"/><text text-anchor="middle" font-size="12" fill="#065f46"><tspan x="172.4" y="29">holds lock</tspan></text><text x="10" y="71" font-size="12" fill="#374151">Thread B</text><line x1="82.4" y1="85" x2="622.4" y2="85" stroke="#e5e7eb"/><rect x="82.4" y="52" width="180" height="30" rx="6" fill="#fef2f2" stroke="#dc2626"/><text text-anchor="middle" font-size="12" fill="#991b1b"><tspan x="172.4" y="71">waiting</tspan></text><rect x="262.4" y="52" width="180" height="30" rx="6" fill="#ecfdf5" stroke="#059669"/><text text-anchor="middle" font-size="12" fill="#065f46"><tspan x="352.4" y="71">holds lock</tspan></text><text x="10" y="113" font-size="12" fill="#374151">Thread C</text><line x1="82.4" y1="127" x2="622.4" y2="127" stroke="#e5e7eb"/><rect x="82.4" y="94" width="360" height="30" rx="6" fill="#fef2f2" stroke="#dc2626"/><text text-anchor="middle" font-size="12" fill="#991b1b"><tspan x="262.4" y="113">waiting</tspan></text><rect x="442.4" y="94" width="180" height="30" rx="6" fill="#ecfdf5" stroke="#059669"/><text text-anchor="middle" font-size="12" fill="#065f46"><tspan x="532.4" y="113">holds lock</tspan></text><text x="82.4" y="142" font-size="11" fill="#6b7280">time →</text>
</svg>
<div style="font-size:12px;color:#6b7280;text-align:center;margin-top:6px;">Figure: green = inside the critical section, red = blocked: only one holder at any moment</div>
</div>`
        },
        {
            content: `<h4>Purpose / Need of This Topic</h4>
<b>The problem:</b> Several threads changing the same counter or object at once can interleave their read-modify-write steps and silently lose updates.
<br><br>
<b>Why we need it:</b>
<ul>
<li>Guarantee <b>mutual exclusion</b>: one thread at a time inside a critical section.</li>
<li>Keep shared objects <b>consistent</b>: every update completes before the next begins.</li>
<li>Use <code>RLock</code> so methods of a thread-safe class can call each other without self-deadlock.</li>
<li>Release automatically with <code>with</code>, even if the protected code raises.</li>
</ul>`
        },
        {
            content: `<h4>Complete Example: A thread-safe Counter with RLock</h4>
Four threads update one shared <code>Counter</code>. <code>increment_twice()</code> takes the lock and then calls <code>increment()</code>, which takes it again: only an <code>RLock</code> allows that.`,
            codeExamples: [
                `import threading

THREADS = 4
REPEATS = 10_000


class Counter:
    def __init__(self):
        self.value = 0
        self._lock = threading.RLock()      # reentrant: same thread may re-acquire

    def increment(self):
        with self._lock:
            self.value += 1

    def increment_twice(self):
        with self._lock:                    # lock taken here...
            self.increment()                # ...and again here (same thread)
            self.increment()


def work(counter):
    for _ in range(REPEATS):
        counter.increment_twice()


def main():
    counter = Counter()
    threads = [
        threading.Thread(target=work, args=(counter,)) for _ in range(THREADS)
    ]
    for t in threads:
        t.start()
    for t in threads:
        t.join()

    expected = THREADS * REPEATS * 2
    print("expected:", expected)
    print("actual:  ", counter.value)
    print("correct: ", counter.value == expected)


if __name__ == "__main__":
    main()

# OUTPUT:
# expected: 80000
# actual:   80000
# correct:  True`
            ],
            codeExplanations: [
                `Each increment is a read, an add and a write; the lock makes the three steps indivisible, so no update is lost. With a plain Lock the nested call in increment_twice() would block forever, because the thread already owns the lock. The RLock counts acquisitions and frees the lock only when the outermost with block ends.`
            ]
        },
        {
            content: `<h4>Why Locks?</h4>
When several threads read and change the <b>same data</b>, their steps can interleave and corrupt it (the next-but-one topic, <i>Race Conditions</i>, shows exactly how). A <b>lock</b> (mutex) lets only <b>one thread at a time</b> enter a protected section - the Python equivalent of Java's <code>synchronized</code> block or <code>ReentrantLock</code>.

A lock has two operations: <code>acquire()</code> (take it, or wait until it is free) and <code>release()</code> (give it back).`
        },
        {
            content: `<h4>Using a Lock the Right Way: with</h4>
Always use the <code>with</code> statement. It acquires on entry and <b>always releases on exit</b>, even if an exception happens inside - so the lock can never be left locked by mistake.`,
            codeExamples: [
                `import threading

balance = 0
lock = threading.Lock()

def deposit_many(times):
    global balance
    for _ in range(times):
        with lock:                    # only one thread inside at a time
            balance += 1

threads = [threading.Thread(target=deposit_many, args=(100_000,)) for _ in range(4)]
for t in threads:
    t.start()
for t in threads:
    t.join()

print(balance)

# OUTPUT:
# 400000`
            ],
            codeExplanations: [
                `balance += 1 is a read, an add and a write. Without the lock two threads can read the same old value and one increment is lost. With the lock each increment completes before another thread starts, so the total is always exactly 4 x 100000.`
            ]
        },
        {
            content: `<h4>Trying a Lock Without Waiting</h4>
<code>acquire()</code> normally waits forever. You can instead try with <code>blocking=False</code> or a <code>timeout</code>; it returns <code>True</code> if you got the lock and <code>False</code> if not. <code>locked()</code> reports the current state.`,
            codeExamples: [
                `import threading

lock = threading.Lock()

lock.acquire()
print(lock.locked())
print(lock.acquire(blocking=False))      # already taken: do not wait
print(lock.acquire(timeout=0.1))         # wait at most 0.1 s, then give up

lock.release()
print(lock.locked())

# OUTPUT:
# True
# False
# False
# False`
            ]
        },
        {
            content: `<h4>RLock: A Lock You Can Re-enter</h4>
A normal <code>Lock</code> is <b>not reentrant</b>: if the thread that holds it tries to acquire it again, it blocks <b>forever</b> (a self-deadlock). An <b><code>RLock</code></b> remembers which thread owns it and how many times it was acquired, so the <i>same thread</i> can acquire it repeatedly. It is released for others only when released the same number of times.`,
            codeExamples: [
                `import threading

rlock = threading.RLock()

with rlock:
    with rlock:                       # fine: same thread, counted twice
        print("re-entered the RLock")

class Counter:
    def __init__(self):
        self._lock = threading.RLock()
        self.value = 0

    def increment(self):
        with self._lock:
            self.value += 1

    def increment_twice(self):
        with self._lock:              # holds the lock...
            self.increment()          # ...and this takes it again
            self.increment()

c = Counter()
c.increment_twice()
print(c.value)

# OUTPUT:
# re-entered the RLock
# 2`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Lock vs RLock</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th><code>Lock</code></th><th><code>RLock</code></th></tr>
<tr class='text-center'><td>Same thread acquires twice</td><td>Blocks forever (deadlock)</td><td>Allowed; counted</td></tr>
<tr class='text-center'><td>Owner</td><td>None - any thread can release it</td><td>Only the owning thread may release it</td></tr>
<tr class='text-center'><td>Speed</td><td>Faster, simpler</td><td>Slightly slower (tracks owner and count)</td></tr>
<tr class='text-center'><td>Typical use</td><td>Guard one small critical section</td><td>Classes whose public methods call each other; recursive functions</td></tr>
</table>
Prefer a plain <code>Lock</code> and keep critical sections small and non-nested. Reach for an <code>RLock</code> when re-entry is genuinely part of the design.`,
            codeExamples: [
                `import threading

lock = threading.Lock()
lock.acquire()

helper = threading.Thread(target=lock.release)     # a DIFFERENT thread releases it
helper.start()
helper.join()
print("lock still held:", lock.locked())

rlock = threading.RLock()
try:
    rlock.release()                                 # not the owner / not acquired
except RuntimeError as error:
    print("RuntimeError:", error)

# OUTPUT:
# lock still held: False
# RuntimeError: cannot release un-acquired lock`
            ]
        },
        {
            content: `<h3>Design Rules for Using Locks</h3>
<ul>
<li><b>Lock the data, not the code.</b> Associate each lock with the data it protects (often as an attribute next to it: <code>self._lock</code>), and take it every time that data is touched - reads of multi-field state included.</li>
<li><b>Keep critical sections tiny.</b> Compute outside the lock, then lock only to read or update shared state. Never do I/O, <code>sleep</code> or call unknown callbacks while holding a lock.</li>
<li><b>Avoid nesting locks.</b> If you must take two, always take them in the same global order (otherwise: deadlock, see the Deadlocks topic).</li>
<li><b>One lock per independent resource.</b> A single global lock is simple but serialises everything; fine-grained locks scale better but are easier to get wrong.</li>
<li><b>Don't use <code>acquire()</code>/<code>release()</code> pairs by hand.</b> If code between them raises, the release is skipped. Use <code>with</code> (or <code>try/finally</code>).</li>
<li><b>Prefer higher-level tools</b> where possible: <code>queue.Queue</code>, <code>ThreadPoolExecutor</code>, immutable data and thread-local storage need no locks at all.</li>
</ul>`
        },
        {
            content: `<h3>Timeouts for Robustness</h3>
In a long-running service, waiting forever on a lock turns a bug into a hang. Using a <b>timeout</b> lets you log, retry, or fail loudly instead.`,
            codeExamples: [
                `import threading

lock = threading.Lock()

def update(shared):
    if not lock.acquire(timeout=2):
        raise TimeoutError("could not get the lock in 2 s - possible deadlock")
    try:
        shared["count"] += 1
    finally:
        lock.release()                 # always release what you acquired

data = {"count": 0}
update(data)
print(data)

# OUTPUT:
# {'count': 1}`
            ]
        },
        {
            content: `<h3>Notes on the Implementation</h3>
<ul>
<li><code>threading.Lock</code> wraps a low-level lock (<code>_thread.lock</code>), the same primitive the GIL machinery builds on. Acquiring an uncontended lock costs about as much as a function call.</li>
<li>The GIL does <b>not</b> make a lock unnecessary: a thread can be switched out between any two bytecodes of <code>x += 1</code>.</li>
<li>There is no built-in read-write lock. For read-mostly data, snapshot immutable copies, or use a third-party read-write lock.</li>
<li>Locks are not <b>fair</b>: waiting threads are not guaranteed to be served in order, so starvation is possible under heavy contention.</li>
<li>In multiprocessing use <code>multiprocessing.Lock</code>; a <code>threading.Lock</code> does not synchronise separate processes. In <code>asyncio</code> use <code>asyncio.Lock</code> - never a threading lock inside a coroutine.</li>
</ul>`
        },
        {
            content: `<h3>Advantages and Disadvantages</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Advantages</th><th>Disadvantages</th></tr>
<tr><td>Simple and reliable way to protect shared data</td><td>Threads wait while the lock is held: less concurrency</td></tr>
<tr><td><code>with lock:</code> releases automatically, even on exceptions</td><td>A plain <code>Lock</code> self-deadlocks if re-acquired by its owner</td></tr>
<tr><td><code>RLock</code> lets locked methods call each other safely</td><td>Forgetting the lock in one code path leaves a race condition</td></tr>
<tr><td>Supports <code>acquire(timeout=...)</code> to avoid waiting forever</td><td>Several locks used together can cause deadlocks</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why use <code>with lock:</code> instead of acquire/release?</td><td>It releases the lock even if an exception occurs</td></tr>
<tr class='text-center'><td>Lock vs RLock?</td><td>RLock can be re-acquired by the thread that holds it and is owned by that thread; a Lock cannot, and re-acquiring blocks forever</td></tr>
<tr class='text-center'><td>When do you need an RLock?</td><td>When a method that holds the lock calls another method that takes the same lock (or in recursion)</td></tr>
<tr class='text-center'><td>How do you avoid waiting forever?</td><td><code>acquire(timeout=...)</code> or <code>acquire(blocking=False)</code></td></tr>
<tr class='text-center'><td>Does the GIL remove the need for locks?</td><td>No - compound operations such as <code>x += 1</code> can still be interleaved</td></tr>
</table>`
        }
    ]
};
