import type { Topic } from '../../types';

export const gilWhyExists: Topic = {
    id: 'python-gil-why-the-gil-exists',
    name: 'Why the GIL Exists',
    beginner: [
        {
            content: `<h4>Introduction</h4>
CPython frees memory using <b>reference counts</b>: each object stores how many references point to it, and it is freed at zero. These counters change on almost every operation, so two threads updating one counter at once could lose an update and cause a crash or a leak. The GIL is the simple cure: only one thread runs Python code, so counts are always consistent. The JVM instead uses a tracing garbage collector with no per-object counters, which is why it needs no such lock.

<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:12px 0;">
<svg viewBox="0 0 573 148" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:573px;height:auto;font-family:monospace;display:block;margin:0 auto">
<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#6b7280"/></marker></defs>
<text x="10" y="29" font-size="12" fill="#374151">Thread A</text><line x1="82.4" y1="43" x2="562.4" y2="43" stroke="#e5e7eb"/><rect x="82.4" y="10" width="120" height="30" rx="6" fill="#ecfdf5" stroke="#059669"/><text text-anchor="middle" font-size="12" fill="#065f46"><tspan x="142.4" y="29">read 5</tspan></text><rect x="322.4" y="10" width="120" height="30" rx="6" fill="#ecfdf5" stroke="#059669"/><text text-anchor="middle" font-size="12" fill="#065f46"><tspan x="382.4" y="29">write 6</tspan></text><text x="10" y="71" font-size="12" fill="#374151">Thread B</text><line x1="82.4" y1="85" x2="562.4" y2="85" stroke="#e5e7eb"/><rect x="202.4" y="52" width="120" height="30" rx="6" fill="#fff7ed" stroke="#ea580c"/><text text-anchor="middle" font-size="12" fill="#9a3412"><tspan x="262.4" y="71">read 5</tspan></text><rect x="442.4" y="52" width="120" height="30" rx="6" fill="#fff7ed" stroke="#ea580c"/><text text-anchor="middle" font-size="12" fill="#9a3412"><tspan x="502.4" y="71">write 6</tspan></text><text x="10" y="113" font-size="12" fill="#374151">refcount</text><line x1="82.4" y1="127" x2="562.4" y2="127" stroke="#e5e7eb"/><rect x="82.4" y="94" width="240" height="30" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="202.4" y="113">5</tspan></text><rect x="322.4" y="94" width="120" height="30" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="382.4" y="113">6</tspan></text><rect x="442.4" y="94" width="120" height="30" rx="6" fill="#fef2f2" stroke="#dc2626"/><text text-anchor="middle" font-size="12" fill="#991b1b"><tspan x="502.4" y="113">6 (want 7)</tspan></text><text x="82.4" y="142" font-size="11" fill="#6b7280">time →</text>
</svg>
<div style="font-size:12px;color:#6b7280;text-align:center;margin-top:6px;">Figure: a lost update on a reference count: two increments, the count rises by one</div>
</div>`
        },
        {
            content: `<h4>Purpose / Need of This Topic</h4>
<b>The problem:</b> Without a global lock, every reference-count change - thousands per second - would need its own lock, making all Python code slow, or risk corrupting memory.
<br><br>
<b>Why we need it:</b>
<ul>
<li>Understand that the GIL protects the <b>interpreter's memory</b>, not your logic.</li>
<li>See why a <b>single lock</b> was cheaper and simpler than many small locks.</li>
<li>Know why C extensions (NumPy, drivers) could be written easily for Python.</li>
<li>Avoid the trap of thinking the GIL makes <code>counter += 1</code> thread-safe.</li>
</ul>`
        },
        {
            content: `<h4>Complete Example: What the GIL protects and what it does not</h4>
Appending to a list is one protected operation. A counter increment is several steps, so the program guards it with its own <code>Lock</code>, just as you would use <code>synchronized</code> in Java.`,
            codeExamples: [
                `import threading

THREADS = 4         # number of worker threads
REPEATS = 10_000    # operations per thread


class SafeCounter:
    def __init__(self):
        self.value = 0
        self._lock = threading.Lock()

    def increment(self):
        with self._lock:                # makes read-add-write one unit
            self.value += 1


def work(counter, items):
    for number in range(REPEATS):
        counter.increment()
        if number < 1000:
            items.append(number)        # a single append is atomic


def main():
    counter = SafeCounter()
    items = []
    threads = [threading.Thread(target=work, args=(counter, items))
               for _ in range(THREADS)]
    for thread in threads:
        thread.start()
    for thread in threads:
        thread.join()
    print("counter:", counter.value)
    print("items appended:", len(items))


if __name__ == "__main__":
    main()

# OUTPUT:
# counter: 40000
# items appended: 4000`
            ],
            codeExplanations: [
                `Each of the 4 threads increments 10,000 times under the lock, giving exactly 40000. Each thread also appends 1,000 items; list.append is a single protected operation, so none are lost and the length is 4000. The lock is needed for the counter because += is several bytecodes and a thread can be switched out in the middle.`
            ]
        },
        {
            content: `<h4>The Short Answer: Reference Counting</h4>
CPython tracks memory with <b>reference counts</b>: every object carries a counter of how many references point to it, and it is freed when the counter reaches zero. That counter is changed <b>constantly</b> - every assignment, function call and list access adjusts one.

If two threads change the same counter at the same moment without protection, an update can be lost, and the count becomes wrong. A count too low frees an object that is still in use (a crash); a count too high leaks memory. The GIL is the simple fix: <b>only one thread runs Python code, so the counts are always updated safely.</b>`
        },
        {
            content: `<h4>The Race the GIL Prevents</h4>
Incrementing a counter is three steps - read, add one, write back. Without a lock, two threads can interleave:
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Step</th><th>Thread A</th><th>Thread B</th><th>Count in memory</th></tr>
<tr class='text-center'><td>1</td><td>reads 5</td><td></td><td>5</td></tr>
<tr class='text-center'><td>2</td><td></td><td>reads 5</td><td>5</td></tr>
<tr class='text-center'><td>3</td><td>writes 6</td><td></td><td>6</td></tr>
<tr class='text-center'><td>4</td><td></td><td>writes 6</td><td><b>6 (should be 7)</b></td></tr>
</table>
Two references were added, but the count only went up by one. Locking <i>every</i> reference-count change individually would be extremely slow, so CPython locks the whole interpreter instead.`
        },
        {
            content: `<h4>Other Reasons It Was Chosen</h4>
<ul>
<li><b>Simplicity.</b> One lock is easy to implement and to reason about. Python's threading support was added in the early 1990s, when almost all machines had a single CPU.</li>
<li><b>Fast single-threaded code.</b> One lock acquisition is cheaper than thousands of small locks. Most Python programs are single-threaded, and the GIL keeps them fast.</li>
<li><b>Easy C extensions.</b> Extension authors can assume only one thread touches Python objects at a time. This is a major reason Python has such a large ecosystem of C-based libraries (NumPy, database drivers, GUI toolkits).</li>
<li><b>Safe built-in types.</b> A <code>list.append</code> or <code>dict</code> assignment cannot be torn in half by another thread, with no per-object locks needed.</li>
</ul>`
        }
    ],

    expert: [
        {
            content: `<h3>The GIL Does Not Protect Your Code</h3>
The GIL protects the <b>interpreter's internal data</b> (reference counts, object headers). It does <b>not</b> make your own multi-step operations atomic, because a thread can lose the GIL between any two bytecode instructions. <code>counter += 1</code> compiles into separate load, add and store instructions:`,
            codeExamples: [
                `import dis

counter = 0

def increment():
    global counter
    counter += 1

names = [i.opname for i in dis.get_instructions(increment)]
print("LOAD_GLOBAL" in names)         # read
print("BINARY_OP" in names)           # add (3.11+; INPLACE_ADD before)
print("STORE_GLOBAL" in names)        # write

# OUTPUT (Python 3.11 or newer):
# True
# True
# True`
            ],
            codeExplanations: [
                `Three separate instructions mean another thread can be scheduled between the read and the write, and its update then overwrites ours. The exact threshold at which this shows up depends on the Python version and timing, which is what makes this kind of bug so hard to reproduce - correct code must never rely on luck.`
            ]
        },
        {
            content: `<h3>The Fix: Use a Lock for Compound Operations</h3>
Protect any read-modify-write sequence with <code>threading.Lock</code>. The result is then always correct, whatever the thread scheduling.`,
            codeExamples: [
                `import threading

counter = 0
lock = threading.Lock()

def work():
    global counter
    for _ in range(100_000):
        with lock:
            counter += 1

threads = [threading.Thread(target=work) for _ in range(4)]
for t in threads:
    t.start()
for t in threads:
    t.join()

print(counter)

# OUTPUT:
# 400000`
            ]
        },
        {
            content: `<h3>What Is Effectively Atomic Under the GIL</h3>
Single operations implemented in C on built-in types run to completion without interruption. That is a property of today's CPython, not a language promise - treat it as a convenience, not a design tool.
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Effectively atomic (one C call)</th><th>NOT atomic (several steps)</th></tr>
<tr class='text-center'><td><code>lst.append(x)</code>, <code>lst.pop()</code></td><td><code>n += 1</code></td></tr>
<tr class='text-center'><td><code>d[key] = value</code>, <code>d.get(key)</code></td><td><code>d[key] += 1</code></td></tr>
<tr class='text-center'><td><code>x = y</code> (simple assignment)</td><td><code>if key not in d: d[key] = ...</code></td></tr>
<tr class='text-center'><td><code>queue.Queue.put/get</code> (has its own locks)</td><td><code>lst.append(lst[-1] + 1)</code></td></tr>
</table>`
        },
        {
            content: `<h3>Why Not Remove It? The History</h3>
<ul>
<li><b>1996, "free threading" patch:</b> removing the GIL by adding fine-grained locks made single-threaded Python roughly <b>twice as slow</b> on the hardware of the time, so it was rejected.</li>
<li><b>2007-2015, Python 3 era:</b> improved GIL scheduling (3.2) but no removal. Experiments such as <b>Gilectomy</b> (2016) again lost too much single-thread speed.</li>
<li><b>Compatibility:</b> thousands of C extensions assume the GIL protects them. Removing it breaks that contract.</li>
<li><b>2023, PEP 703:</b> accepted a plan for an optional GIL-free build, with techniques (biased reference counting, immortal objects, per-object locks) that keep the single-thread slowdown small. It arrived as an experimental build in 3.13 (see the last topic).</li>
</ul>`
        },
        {
            content: `<h3>Advantages and Disadvantages</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Advantages</th><th>Disadvantages</th></tr>
<tr><td>Protects reference counts with one cheap lock</td><td>Blocks parallel execution of Python code on many cores</td></tr>
<tr><td>Keeps single-threaded Python fast</td><td>Gives a false sense of safety for compound operations</td></tr>
<tr><td>Made writing C extensions much simpler</td><td>One lock for everything means all threads contend</td></tr>
<tr><td>Built-in types like list and dict never get corrupted</td><td>Hard to remove later: extensions rely on it</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why does the GIL exist?</td><td>CPython's reference counting is not thread-safe; one global lock is a simple, fast way to protect it (and C extensions)</td></tr>
<tr class='text-center'><td>Does the GIL make my code thread-safe?</td><td>No - it protects the interpreter, not multi-step operations like <code>counter += 1</code>; you still need locks</td></tr>
<tr class='text-center'><td>Why not use a lock per object instead?</td><td>It slowed single-threaded programs and was complex; early attempts were rejected for that reason</td></tr>
<tr class='text-center'><td>Name a benefit of the GIL.</td><td>Fast single-threaded execution, simple C extensions, and safe built-in types</td></tr>
<tr class='text-center'><td>What is PEP 703?</td><td>The accepted proposal for an optional free-threaded (GIL-less) CPython build</td></tr>
</table>`
        }
    ]
};
