import type { Topic } from '../../types';

export const threadingRaceConditions: Topic = {
    id: 'python-multithreading-race-conditions',
    name: 'Race Conditions',
    beginner: [
        {
            content: `<h4>Introduction</h4>
A <b>race condition</b> is a bug where the result depends on the exact timing of threads. The classic form is the <i>lost update</i>: two threads <b>read</b> the same old value, each computes a new one and each <b>writes</b> it back, so one update overwrites the other. Statements such as <code>balance -= 30</code> or <code>count += 1</code> look like one step but are several; Java programmers know the same problem with unsynchronised fields, solved by <code>synchronized</code> or <code>AtomicInteger</code>. The fix is to make the whole read-compute-write sequence <b>atomic</b> with a lock.

<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:12px 0;">
<svg viewBox="0 0 653 106" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:653px;height:auto;font-family:monospace;display:block;margin:0 auto">
<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#6b7280"/></marker></defs>
<text x="10" y="29" font-size="12" fill="#374151">Thread A</text><line x1="82.4" y1="43" x2="642.4" y2="43" stroke="#e5e7eb"/><rect x="82.4" y="10" width="140" height="30" rx="6" fill="#eff6ff" stroke="#2563eb"/><text text-anchor="middle" font-size="12" fill="#1e40af"><tspan x="152.4" y="29">read 100</tspan></text><rect x="222.4" y="10" width="210" height="30" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="327.4" y="29">compute</tspan></text><rect x="432.4" y="10" width="140" height="30" rx="6" fill="#fef2f2" stroke="#dc2626"/><text text-anchor="middle" font-size="12" fill="#991b1b"><tspan x="502.4" y="29">write 70</tspan></text><text x="10" y="71" font-size="12" fill="#374151">Thread B</text><line x1="82.4" y1="85" x2="642.4" y2="85" stroke="#e5e7eb"/><rect x="152.4" y="52" width="140" height="30" rx="6" fill="#eff6ff" stroke="#2563eb"/><text text-anchor="middle" font-size="12" fill="#1e40af"><tspan x="222.4" y="71">read 100</tspan></text><rect x="292.4" y="52" width="210" height="30" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="397.4" y="71">compute</tspan></text><rect x="502.4" y="52" width="140" height="30" rx="6" fill="#fef2f2" stroke="#dc2626"/><text text-anchor="middle" font-size="12" fill="#991b1b"><tspan x="572.4" y="71">write 70</tspan></text><text x="82.4" y="100" font-size="11" fill="#6b7280">time →</text>
</svg>
<div style="font-size:12px;color:#6b7280;text-align:center;margin-top:6px;">Figure: both threads read 100 before either writes: balance ends at 70, not 40</div>
</div>`
        },
        {
            content: `<h4>Purpose / Need of This Topic</h4>
<b>The problem:</b> The program gives the right answer most of the time and a wrong one occasionally, and the failure disappears whenever you add a print or run it under a debugger.
<br><br>
<b>Why we need it:</b>
<ul>
<li>Recognise <b>unsafe read-modify-write</b> sequences on shared data.</li>
<li>Understand why such bugs are rare, silent and hard to reproduce.</li>
<li>Reproduce them on purpose with a forced pause so they can be tested.</li>
<li>Fix them by protecting the <b>whole sequence</b> with one lock.</li>
</ul>`
        },
        {
            content: `<h4>Complete Example: Lost update and its lock fix</h4>
A short pause between read and write forces the bad interleaving every time, so the program shows the bug and the fix side by side.`,
            codeExamples: [
                `import threading
import time

START_BALANCE = 100
AMOUNT = 30
PAUSE = 0.05                                # forces the bad interleaving


class Account:
    def __init__(self, balance):
        self.balance = balance
        self._lock = threading.Lock()

    def withdraw_unsafe(self, amount):
        current = self.balance              # 1. read
        time.sleep(PAUSE)                   # 2. other thread reads old value now
        self.balance = current - amount     # 3. write based on the OLD value

    def withdraw_safe(self, amount):
        with self._lock:                    # whole sequence is atomic
            self.withdraw_unsafe(amount)


def run_two_withdrawals(action):
    threads = [threading.Thread(target=action, args=(AMOUNT,)) for _ in range(2)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()


def main():
    unsafe = Account(START_BALANCE)
    run_two_withdrawals(unsafe.withdraw_unsafe)
    safe = Account(START_BALANCE)
    run_two_withdrawals(safe.withdraw_safe)

    print("expected:", START_BALANCE - 2 * AMOUNT)
    print("unsafe:  ", unsafe.balance)
    print("safe:    ", safe.balance)


if __name__ == "__main__":
    main()

# OUTPUT:
# expected: 40
# unsafe:   70
# safe:     40`
            ],
            codeExplanations: [
                `In the unsafe version both threads read 100 during the 0.05 s pause, so both write 70 and one withdrawal is lost. In the safe version the lock lets the second thread read only after the first has written, so it sees 70 and writes 40. Real race conditions have no visible sleep, which is why they appear only occasionally.`
            ]
        },
        {
            content: `<h4>What Is a Race Condition?</h4>
A <b>race condition</b> is a bug where the result depends on the <b>exact timing</b> of threads - on who "wins the race" to the shared data. The same program may give the right answer 999 times and a wrong one the 1000th, which makes these bugs notoriously hard to reproduce ("heisenbugs"). They appear whenever threads <b>read and modify shared data without coordination</b>.`
        },
        {
            content: `<h4>The Classic Case: Lost Update</h4>
Updating a value is three steps: <b>read</b> it, <b>compute</b> a new one, <b>write</b> it back. If two threads both read before either writes, one update overwrites the other. We put a tiny <code>sleep</code> between read and write to make the bad timing happen every time:`,
            codeExamples: [
                `import threading
import time

balance = 100

def withdraw(amount):
    global balance
    current = balance            # 1. read
    time.sleep(0.01)             # (any work: a network call, a calculation...)
    balance = current - amount   # 3. write based on the OLD value

threads = [threading.Thread(target=withdraw, args=(30,)) for _ in range(2)]
for t in threads:
    t.start()
for t in threads:
    t.join()

print(balance)

# OUTPUT:
# 70`
            ],
            codeExplanations: [
                `Two withdrawals of 30 from 100 should leave 40. Both threads read 100 before either wrote, so both wrote 70: one withdrawal vanished. In real code the pause is not a visible sleep but a thread switch at an unlucky moment, so the bug appears only occasionally.`
            ]
        },
        {
            content: `<h4>The Fix: Make the Whole Sequence Atomic</h4>
Hold a lock around the <b>entire</b> read-modify-write sequence so no other thread can slip in between.`,
            codeExamples: [
                `import threading
import time

balance = 100
lock = threading.Lock()

def withdraw(amount):
    global balance
    with lock:                       # the whole read-compute-write is protected
        current = balance
        time.sleep(0.01)
        balance = current - amount

threads = [threading.Thread(target=withdraw, args=(30,)) for _ in range(2)]
for t in threads:
    t.start()
for t in threads:
    t.join()

print(balance)

# OUTPUT:
# 40`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Check-Then-Act (TOCTOU)</h3>
A second very common shape: a thread <b>checks</b> a condition and then <b>acts</b> on it, but the condition changes in between ("time of check to time of use"). Even if each individual step is safe, the combination is not.`,
            codeExamples: [
                `import threading
import time

balance = 100

def withdraw_if_enough(amount):
    global balance
    if balance >= amount:            # check
        time.sleep(0.01)             # ...other thread checks here too...
        balance -= amount            # act

threads = [threading.Thread(target=withdraw_if_enough, args=(80,)) for _ in range(2)]
for t in threads:
    t.start()
for t in threads:
    t.join()

print(balance)                       # an overdraft the check was meant to prevent

# OUTPUT:
# -60`
            ]
        },
        {
            content: `<h3>Lazy Initialisation and Double-Checked Locking</h3>
"Create it on first use" is check-then-act too: two threads can both see <code>None</code> and both create the object, breaking a singleton or doing the expensive set-up twice. A lock fixes it; the extra outer check avoids taking the lock on every call afterwards.`,
            codeExamples: [
                `import threading
import time

created = []
_instance = None
_lock = threading.Lock()

def get_instance():
    global _instance
    if _instance is None:                 # cheap check, no lock
        with _lock:
            if _instance is None:         # check again, now exclusively
                time.sleep(0.05)          # expensive construction
                created.append(1)
                _instance = object()
    return _instance

threads = [threading.Thread(target=get_instance) for _ in range(5)]
for t in threads:
    t.start()
for t in threads:
    t.join()

print("instances created:", len(created))

# OUTPUT:
# instances created: 1`
            ]
        },
        {
            content: `<h3>Other Shapes of Race Conditions</h3>
<ul>
<li><b>Modifying a collection while iterating it</b> in another thread (<code>RuntimeError: dictionary changed size during iteration</code>, or silently skipped items). Iterate over a snapshot (<code>list(d.items())</code>) or lock both sides.</li>
<li><b>Compound operations on collections:</b> <code>d[k] += 1</code>, <code>if k not in d: d[k] = []</code>, <code>lst.append(len(lst))</code>.</li>
<li><b>Shared resources outside memory:</b> two threads writing the same file, or "check the file does not exist, then create it" (use <code>open(path, "x")</code>, which is atomic).</li>
<li><b>Publication order:</b> a thread sees an object that another thread is still building. Finish construction before sharing the reference.</li>
<li><b>Data races vs race conditions:</b> a <i>data race</i> is an unsynchronised access to memory; a <i>race condition</i> is any timing-dependent wrong result (even with every access individually synchronised, like the overdraft above).</li>
</ul>`
        },
        {
            content: `<h3>Preventing Races: Strategies from Best to Worst</h3>
<ol>
<li><b>Don't share.</b> Give each thread its own data (arguments, <code>threading.local</code>) and combine results at the end.</li>
<li><b>Share only immutable data.</b> Tuples, frozen dataclasses, strings and numbers cannot be modified, so they cannot race.</li>
<li><b>Pass messages, not memory.</b> Hand work and results over <code>queue.Queue</code>; one owner thread modifies each piece of state.</li>
<li><b>Lock the shared state</b> around the <i>whole</i> compound operation, consistently, everywhere it is touched.</li>
<li><b>Use thread-safe building blocks:</b> <code>queue.Queue</code>, <code>collections.deque</code> for append/pop, <code>concurrent.futures</code>.</li>
</ol>
Relying on "it is atomic in CPython because of the GIL" is the weakest option: it is an implementation detail and breaks in free-threaded builds and other interpreters.`,
            codeExamples: [
                `import threading
from queue import Queue

# One thread owns the shared total; workers send it messages instead of locking.
inbox = Queue()

def worker(numbers):
    inbox.put(sum(numbers))

def accumulator(expected, result):
    total = 0
    for _ in range(expected):
        total += inbox.get()
    result.append(total)

result = []
chunks = [range(0, 100), range(100, 200), range(200, 300)]
workers = [threading.Thread(target=worker, args=(c,)) for c in chunks]
owner = threading.Thread(target=accumulator, args=(len(chunks), result))

owner.start()
for w in workers:
    w.start()
for w in workers:
    w.join()
owner.join()

print(result[0])

# OUTPUT:
# 44850`
            ]
        },
        {
            content: `<h3>Finding Race Conditions</h3>
<ul>
<li><b>Make them likely:</b> <code>sys.setswitchinterval(1e-6)</code> forces very frequent thread switches in tests, exposing races that normally hide. Add random <code>time.sleep(0)</code> yields in suspect code.</li>
<li><b>Stress tests:</b> run the code with many threads and many iterations, repeatedly, and assert invariants (totals, uniqueness, no overdraft).</li>
<li><b>Code review checklist:</b> for every shared variable, ask "which lock protects this?". If the answer is "none", or "a different lock in different places", there is a bug.</li>
<li><b>Tooling:</b> ThreadSanitizer (TSan) builds of CPython and extensions detect data races; <code>pytest-repeat</code> or <code>pytest -p no:randomly</code> variations help; free-threaded Python makes races more visible, so it is also a good test bed.</li>
</ul>`,
            codeExamples: [
                `import sys

old = sys.getswitchinterval()
sys.setswitchinterval(1e-6)          # switch threads about every microsecond
try:
    pass                             # ...run your multi-threaded test here...
finally:
    sys.setswitchinterval(old)       # always restore

print(old)

# OUTPUT:
# 0.005`
            ]
        },
        {
            content: `<h3>Advantages and Disadvantages</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Advantages</th><th>Disadvantages</th></tr>
<tr><td>Understanding races lets you spot unsafe code during review</td><td>Races are intermittent and often vanish when debugging</td></tr>
<tr><td>A forced pause makes the bug repeatable in tests</td><td>Code that looks correct can still be unsafe (<code>x += 1</code> is not atomic)</td></tr>
<tr><td>One lock around the whole sequence fixes it</td><td>Locking everything reduces concurrency and risks deadlocks</td></tr>
<tr><td>Atomic helpers (<code>queue.Queue</code>, locks) remove the need to reason about timing</td><td>Tests pass by luck: absence of failure is not proof of safety</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is a race condition?</td><td>A bug where the outcome depends on the relative timing of threads accessing shared state</td></tr>
<tr class='text-center'><td>Why is <code>counter += 1</code> not thread-safe in Python?</td><td>It compiles to separate read, add and write steps; a thread switch between them loses an update</td></tr>
<tr class='text-center'><td>What is check-then-act?</td><td>Testing a condition and then acting on it with a gap between - the condition may change in the gap; make both steps atomic with a lock</td></tr>
<tr class='text-center'><td>Name ways to avoid races without locks.</td><td>Thread-local data, immutable data, message passing with queues</td></tr>
<tr class='text-center'><td>How do you test for races?</td><td>Stress tests, tiny switch intervals, invariant assertions, ThreadSanitizer</td></tr>
</table>`
        }
    ]
};
