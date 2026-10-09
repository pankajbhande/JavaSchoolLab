import type { Topic } from '../../types';

export const threadingEventCondition: Topic = {
    id: 'python-multithreading-event-condition',
    name: 'Event & Condition',
    beginner: [
        {
            content: `<h4>Introduction</h4>
Locks keep threads out of each other's way, but often one thread must <b>wait until another says "go"</b>. An <code>Event</code> is a flag that threads can <code>wait()</code> on until another thread calls <code>set()</code>. A <code>Condition</code> combines a lock with a waiting room: a thread waits until a condition on shared data becomes true and is woken by <code>notify()</code>. In Java the same ideas are <code>wait()</code>/<code>notify()</code> (or <code>Condition.await()</code>/<code>signal()</code>) and <code>CountDownLatch</code> for one-shot signals.

<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:12px 0;">
<svg viewBox="0 0 653 106" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:653px;height:auto;font-family:monospace;display:block;margin:0 auto">
<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#6b7280"/></marker></defs>
<text x="10" y="29" font-size="12" fill="#374151">Producer</text><line x1="82.4" y1="43" x2="642.4" y2="43" stroke="#e5e7eb"/><rect x="82.4" y="10" width="240" height="30" rx="6" fill="#ecfdf5" stroke="#059669"/><text text-anchor="middle" font-size="12" fill="#065f46"><tspan x="202.4" y="29">produce item</tspan></text><rect x="322.4" y="10" width="80" height="30" rx="6" fill="#fff7ed" stroke="#ea580c"/><text text-anchor="middle" font-size="12" fill="#9a3412"><tspan x="362.4" y="29">notify</tspan></text><rect x="402.4" y="10" width="240" height="30" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="522.4" y="29">continues</tspan></text><text x="10" y="71" font-size="12" fill="#374151">Consumer</text><line x1="82.4" y1="85" x2="642.4" y2="85" stroke="#e5e7eb"/><rect x="82.4" y="52" width="320" height="30" rx="6" fill="#fef2f2" stroke="#dc2626"/><text text-anchor="middle" font-size="12" fill="#991b1b"><tspan x="242.4" y="71">wait() blocked</tspan></text><rect x="402.4" y="52" width="240" height="30" rx="6" fill="#ecfdf5" stroke="#059669"/><text text-anchor="middle" font-size="12" fill="#065f46"><tspan x="522.4" y="71">consume item</tspan></text><text x="82.4" y="100" font-size="11" fill="#6b7280">time →</text>
</svg>
<div style="font-size:12px;color:#6b7280;text-align:center;margin-top:6px;">Figure: the consumer sleeps in wait() until the producer calls notify()</div>
</div>`
        },
        {
            content: `<h4>Purpose / Need of This Topic</h4>
<b>The problem:</b> Without a signalling tool, a waiting thread must busy-loop (<code>while not ready: pass</code>), burning a whole CPU core and still reacting late.
<br><br>
<b>Why we need it:</b>
<ul>
<li>Make a thread <b>sleep until work is available</b> instead of polling.</li>
<li>Build <b>producer-consumer</b> hand-offs on shared data with <code>Condition</code>.</li>
<li>Broadcast one-shot signals such as "start" or "stop" with <code>Event</code>.</li>
<li>React immediately to a change, with zero CPU use while waiting.</li>
</ul>`
        },
        {
            content: `<h4>Complete Example: Producer and consumer with a Condition</h4>
The consumer sleeps in <code>wait_for()</code> until the producer has put an item in the buffer. A sentinel value tells it to stop, and an <code>Event</code> reports completion.`,
            codeExamples: [
                `import threading
from collections import deque

ITEM_COUNT = 5
SENTINEL = None                             # marks "no more items"

buffer = deque()
condition = threading.Condition()           # a lock plus a waiting room
finished = threading.Event()
consumed = []


def put(item):
    with condition:
        buffer.append(item)
        condition.notify()                  # wake the waiting consumer


def producer():
    for n in range(1, ITEM_COUNT + 1):
        put(n * 10)
    put(SENTINEL)


def consumer():
    while True:
        with condition:
            condition.wait_for(lambda: len(buffer) > 0)
            item = buffer.popleft()
        if item is SENTINEL:
            break
        consumed.append(item)
    finished.set()                          # tell main we are done


def main():
    workers = [threading.Thread(target=consumer), threading.Thread(target=producer)]
    for t in workers:
        t.start()

    print("finished in time:", finished.wait(timeout=5))
    for t in workers:
        t.join()
    print("consumed:", consumed)
    print("buffer empty:", len(buffer) == 0)


if __name__ == "__main__":
    main()

# OUTPUT:
# finished in time: True
# consumed: [10, 20, 30, 40, 50]
# buffer empty: True`
            ],
            codeExplanations: [
                `The consumer is started first and goes to sleep in wait_for() because the buffer is empty. Each put() appends under the lock and calls notify(), which wakes the consumer. With a single consumer, items are consumed in the order they were produced, so the printed list is always the same. finished.wait(timeout=5) returns True as soon as the consumer sets the event.`
            ]
        },
        {
            content: `<h4>Threads Often Need to Wait for Each Other</h4>
Locks keep threads <i>out of each other's way</i>. But often one thread must <b>wait until another thread says "go"</b>: a worker waits for data, a service waits for a shutdown request. Python has two tools for this:
<ul>
<li><b><code>Event</code></b> - a simple flag. Threads wait until it is <i>set</i>.</li>
<li><b><code>Condition</code></b> - a lock plus a waiting room: threads wait until some <i>condition on shared data</i> becomes true, and are woken when another thread changes that data.</li>
</ul>
Using these is far better than <b>busy-waiting</b> (<code>while not ready: pass</code>), which burns an entire CPU core doing nothing.`
        },
        {
            content: `<h4>Event: A Flag Threads Can Wait On</h4>
An <code>Event</code> starts <i>cleared</i>. <code>wait()</code> blocks until another thread calls <code>set()</code>. All waiting threads are released at once.
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Method</th><th>Does</th></tr>
<tr class='text-center'><td><code>set()</code></td><td>Sets the flag; wakes every waiting thread</td></tr>
<tr class='text-center'><td><code>clear()</code></td><td>Resets the flag to False</td></tr>
<tr class='text-center'><td><code>wait(timeout=None)</code></td><td>Blocks until set; returns True if set, False if the timeout expired</td></tr>
<tr class='text-center'><td><code>is_set()</code></td><td>Checks the flag without waiting</td></tr>
</table>`,
            codeExamples: [
                `import threading
import time

start = threading.Event()
finished = []

def runner(n):
    start.wait()                  # every runner waits at the starting line
    finished.append(n)

threads = [threading.Thread(target=runner, args=(n,)) for n in range(3)]
for t in threads:
    t.start()

time.sleep(0.1)
print("started so far:", len(finished))     # nobody has moved yet

start.set()                       # the starting gun
for t in threads:
    t.join()
print(sorted(finished))

print(threading.Event().wait(timeout=0.1))  # nobody sets it: times out

# OUTPUT:
# started so far: 0
# [0, 1, 2]
# False`
            ]
        },
        {
            content: `<h4>Event as a Stop Signal</h4>
A very common pattern: a background worker loops until someone sets a "stop" event. Waiting on the event instead of <code>sleep()</code> lets it wake <b>immediately</b> when asked to stop.`,
            codeExamples: [
                `import threading

stop = threading.Event()
ticks = 0

def worker():
    global ticks
    while not stop.is_set():
        ticks += 1
        stop.wait(0.05)           # sleeps 50 ms, but wakes at once if stop is set

t = threading.Thread(target=worker)
t.start()

stop.wait(0.3)                    # let it run for a moment
stop.set()                        # ask it to finish
t.join()

print("ticked:", ticks > 0)
print("stopped cleanly")

# OUTPUT:
# ticked: True
# stopped cleanly`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Condition: Wait Until the Data Is Right</h3>
A <code>Condition</code> combines a <b>lock</b> with the ability to <b>wait and be notified</b>. The pattern:
<ol>
<li><b>Waiter:</b> take the lock, then <code>while not condition: cond.wait()</code>. <code>wait()</code> releases the lock while sleeping and re-acquires it before returning.</li>
<li><b>Changer:</b> take the lock, change the shared data, then <code>cond.notify()</code> (or <code>notify_all()</code>).</li>
</ol>
Always test the condition in a <b>while loop</b> (or use <code>wait_for(predicate)</code>): a woken thread must re-check, because another thread may have consumed the item first, or the wake-up may be spurious.`,
            codeExamples: [
                `import threading
import time

condition = threading.Condition()
buffer = []

def consumer():
    with condition:
        condition.wait_for(lambda: len(buffer) > 0)   # sleeps until True
        item = buffer.pop(0)
    print("consumed", item)

def producer():
    time.sleep(0.1)
    with condition:
        buffer.append("data")
        condition.notify()                             # wake one waiter
    print("produced data")

c = threading.Thread(target=consumer)
p = threading.Thread(target=producer)
c.start()
p.start()
c.join()
p.join()

# OUTPUT (the two lines may swap order):
# produced data
# consumed data`
            ],
            codeExplanations: [
                `The consumer starts first and finds the buffer empty, so wait_for() releases the lock and sleeps. After 0.1 s the producer adds the item and calls notify(). The consumer wakes, re-acquires the lock, re-checks the predicate (now true) and removes the item. Because both sides use the same lock, the buffer is never read while half-modified.`
            ]
        },
        {
            content: `<h3>A Bounded Buffer With Two Conditions</h3>
A classic producer/consumer buffer with limited capacity: producers wait when it is full, consumers wait when it is empty. (In real code use <code>queue.Queue</code>, which is built exactly like this - the example shows the mechanism.)`,
            codeExamples: [
                `import threading

class BoundedBuffer:
    def __init__(self, capacity):
        self.items = []
        self.capacity = capacity
        lock = threading.Lock()
        self.not_full = threading.Condition(lock)     # two conditions, one lock
        self.not_empty = threading.Condition(lock)

    def put(self, item):
        with self.not_full:
            self.not_full.wait_for(lambda: len(self.items) < self.capacity)
            self.items.append(item)
            self.not_empty.notify()

    def get(self):
        with self.not_empty:
            self.not_empty.wait_for(lambda: len(self.items) > 0)
            item = self.items.pop(0)
            self.not_full.notify()
            return item

buffer = BoundedBuffer(capacity=2)
consumed = []

def producer():
    for i in range(5):
        buffer.put(i)

def consumer():
    for _ in range(5):
        consumed.append(buffer.get())

threads = [threading.Thread(target=producer), threading.Thread(target=consumer)]
for t in threads:
    t.start()
for t in threads:
    t.join()

print(consumed)

# OUTPUT:
# [0, 1, 2, 3, 4]`
            ]
        },
        {
            content: `<h3>Barrier: Wait for Everyone</h3>
A <code>threading.Barrier(n)</code> makes threads wait until <b>n of them have arrived</b>, then releases them all together - useful for phased computations ("everyone finish phase 1 before phase 2 starts"). An optional <code>action</code> runs once when the barrier trips.`,
            codeExamples: [
                `import threading

barrier = threading.Barrier(3, action=lambda: print("all arrived"))
log = []

def worker(n):
    log.append(f"phase 1 by {n}")
    barrier.wait()                 # nobody passes until all 3 have called wait()
    log.append(f"phase 2 by {n}")

threads = [threading.Thread(target=worker, args=(n,)) for n in range(3)]
for t in threads:
    t.start()
for t in threads:
    t.join()

phase1 = [i for i, line in enumerate(log) if line.startswith("phase 1")]
phase2 = [i for i, line in enumerate(log) if line.startswith("phase 2")]
print(max(phase1) < min(phase2))   # every phase-1 entry comes before any phase-2 entry

# OUTPUT:
# all arrived
# True`
            ]
        },
        {
            content: `<h3>Choosing the Right Tool</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Need</th><th>Use</th></tr>
<tr class='text-center'><td>One-time "go" or "stop" signal for many threads</td><td><code>Event</code></td></tr>
<tr class='text-center'><td>Wait for a condition on shared state; fine control of who is woken</td><td><code>Condition</code></td></tr>
<tr class='text-center'><td>Hand items from producers to consumers</td><td><code>queue.Queue</code> (built on Condition; handles all the waiting for you)</td></tr>
<tr class='text-center'><td>All threads must reach a point together</td><td><code>Barrier</code></td></tr>
<tr class='text-center'><td>Limit how many threads use a resource</td><td><code>Semaphore</code></td></tr>
</table>
<b>Pitfalls:</b> a <code>notify()</code> sent <i>before</i> anyone waits is lost (conditions have no memory - an <code>Event</code>'s flag does); calling <code>wait()</code> without holding the condition's lock raises <code>RuntimeError</code>; use <code>notify_all()</code> when waiters have different predicates; always give long waits a <code>timeout</code> so a lost wake-up cannot hang forever.`
        },
        {
            content: `<h3>Advantages and Disadvantages</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Advantages</th><th>Disadvantages</th></tr>
<tr><td>Waiting threads use no CPU while they sleep</td><td><code>Condition</code> needs its lock held around wait and notify</td></tr>
<tr><td>Instant wake-up when the state changes</td><td>Always re-check the condition (<code>wait_for</code> or a <code>while</code> loop)</td></tr>
<tr><td><code>Event</code> is a very simple one-flag signal</td><td>A missed <code>set()</code> or <code>notify()</code> leaves a thread waiting forever</td></tr>
<tr><td><code>Condition</code> expresses "wait until this is true" cleanly</td><td>An <code>Event</code> carries no data: only "happened or not"</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Event vs Condition?</td><td>An Event is a simple flag; a Condition pairs a lock with wait/notify so threads can wait for arbitrary conditions on shared data</td></tr>
<tr class='text-center'><td>Why wait in a <code>while</code> loop (or use <code>wait_for</code>)?</td><td>To re-check the condition after waking: another thread may have changed it, or the wake-up was spurious</td></tr>
<tr class='text-center'><td>What does <code>wait()</code> do with the lock?</td><td>Releases it while sleeping and re-acquires it before returning</td></tr>
<tr class='text-center'><td><code>notify()</code> vs <code>notify_all()</code>?</td><td>Wake one waiting thread vs all waiting threads</td></tr>
<tr class='text-center'><td>Why not busy-wait?</td><td>It wastes CPU; Event/Condition put the thread to sleep until needed</td></tr>
</table>`
        }
    ]
};
