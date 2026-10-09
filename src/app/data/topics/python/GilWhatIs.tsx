import type { Topic } from '../../types';

export const gilWhatIs: Topic = {
    id: 'python-gil-what-is-the-global-interpreter-lock',
    name: 'What is the Global Interpreter Lock?',
    beginner: [
        {
            content: `<h4>Introduction</h4>
The <b>Global Interpreter Lock (GIL)</b> is a mutex inside CPython that lets only <b>one thread execute Python bytecode at a time</b>. Many threads can exist, but they must take turns holding the lock. The lock is released while a thread waits (sleep, network, file I/O), so waiting work still overlaps. In Java the contrast is sharp: JVM threads run truly in parallel on all cores, and you protect shared data yourself with <code>synchronized</code> or <code>java.util.concurrent</code>.

<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:12px 0;">
<svg viewBox="0 0 573 106" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:573px;height:auto;font-family:monospace;display:block;margin:0 auto">
<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#6b7280"/></marker></defs>
<text x="10" y="29" font-size="12" fill="#374151">Thread A</text><line x1="82.4" y1="43" x2="562.4" y2="43" stroke="#e5e7eb"/><rect x="82.4" y="10" width="160" height="30" rx="6" fill="#ecfdf5" stroke="#059669"/><text text-anchor="middle" font-size="12" fill="#065f46"><tspan x="162.4" y="29">runs (GIL)</tspan></text><rect x="242.4" y="10" width="160" height="30" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="322.4" y="29">waits</tspan></text><rect x="402.4" y="10" width="160" height="30" rx="6" fill="#ecfdf5" stroke="#059669"/><text text-anchor="middle" font-size="12" fill="#065f46"><tspan x="482.4" y="29">runs (GIL)</tspan></text><text x="10" y="71" font-size="12" fill="#374151">Thread B</text><line x1="82.4" y1="85" x2="562.4" y2="85" stroke="#e5e7eb"/><rect x="82.4" y="52" width="160" height="30" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="162.4" y="71">waits</tspan></text><rect x="242.4" y="52" width="160" height="30" rx="6" fill="#fff7ed" stroke="#ea580c"/><text text-anchor="middle" font-size="12" fill="#9a3412"><tspan x="322.4" y="71">runs (GIL)</tspan></text><rect x="402.4" y="52" width="160" height="30" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="482.4" y="71">waits</tspan></text><text x="82.4" y="100" font-size="11" fill="#6b7280">time →</text>
</svg>
<div style="font-size:12px;color:#6b7280;text-align:center;margin-top:6px;">Figure: two threads take turns on the single GIL - never both running Python code at once</div>
</div>`
        },
        {
            content: `<h4>Purpose / Need of This Topic</h4>
<b>The problem:</b> Beginners add threads to a calculation expecting it to run on every core, then find it is no faster - and have no idea why.
<br><br>
<b>Why we need it:</b>
<ul>
<li>Explain <b>why</b> threads do not speed up CPU-heavy Python code.</li>
<li>Show <b>when</b> threads still help: tasks that spend their time waiting.</li>
<li>Let you choose the right tool (threads, processes, asyncio) instead of guessing.</li>
<li>Remove the myth that Python is "single-threaded" - threads exist, they just take turns.</li>
</ul>`
        },
        {
            content: `<h4>Complete Example: Threads overlap waiting</h4>
Five tasks each wait 0.3 seconds. Run one after another they need about 1.5 s; in five threads they overlap because <code>sleep</code> releases the GIL. Only safe boolean checks are printed because exact timings vary.`,
            codeExamples: [
                `import threading
import time

TASKS = 5       # number of tasks
DELAY = 0.3     # seconds each task waits


def wait_task():
    time.sleep(DELAY)                   # waiting: the GIL is released


def run_sequential():
    start = time.perf_counter()
    for _ in range(TASKS):
        wait_task()
    return time.perf_counter() - start


def run_threaded():
    threads = [threading.Thread(target=wait_task) for _ in range(TASKS)]
    start = time.perf_counter()
    for thread in threads:
        thread.start()
    for thread in threads:
        thread.join()                   # wait for all threads to finish
    return time.perf_counter() - start


def main():
    sequential = run_sequential()
    threaded = run_threaded()
    print("tasks:", TASKS)
    print("sequential >= 1.4 s:", sequential >= 1.4)
    print("threaded < 1.0 s:", threaded < 1.0)
    print("threads at least 2x faster:", sequential / threaded > 2)


if __name__ == "__main__":
    main()

# OUTPUT:
# tasks: 5
# sequential >= 1.4 s: True
# threaded < 1.0 s: True
# threads at least 2x faster: True`
            ],
            codeExplanations: [
                `sleep() releases the GIL, so while one thread waits the others can start their own wait. Five waits of 0.3 s overlap into roughly 0.3 s instead of 1.5 s. If the tasks were pure calculation instead, the GIL would force them to take turns and no such gain would appear.`
            ]
        },
        {
            content: `<h4>One Thread at a Time</h4>
The <b>Global Interpreter Lock (GIL)</b> is a <b>mutex</b> inside CPython that allows <b>only one thread to execute Python bytecode at any moment</b>, even on a computer with many CPU cores. A program can have dozens of threads, but to run Python code each must first hold the GIL, so they take turns.

Think of a meeting room with <b>one microphone</b>: many people (threads) are in the room, but only the one holding the microphone (the GIL) can speak (run Python code). Others wait until it is passed on.`
        },
        {
            content: `<h4>What This Means in Practice</h4>
<ul>
<li><b>CPU-heavy work does not speed up with threads.</b> Four threads doing arithmetic take about as long as one thread doing all of it, because they cannot run Python code at the same time.</li>
<li><b>Waiting work does speed up with threads.</b> The GIL is <b>released while a thread waits</b> for a network response, a file read or <code>time.sleep()</code>. Other threads use that time to run.</li>
<li><b>Threads still exist and still interleave.</b> The GIL does not make your program single-threaded; it only stops two threads from running Python bytecode <i>simultaneously</i>.</li>
</ul>`
        },
        {
            content: `<h4>Threads Overlap Their Waiting</h4>
Five tasks that each wait half a second take 2.5 seconds one after another, but only about 0.5 seconds in five threads - the GIL is released during <code>sleep</code>.`,
            codeExamples: [
                `import threading
import time

def worker():
    time.sleep(0.5)                 # waiting: the GIL is released

start = time.perf_counter()
for _ in range(5):
    worker()
sequential = time.perf_counter() - start

start = time.perf_counter()
threads = [threading.Thread(target=worker) for _ in range(5)]
for t in threads:
    t.start()
for t in threads:
    t.join()
threaded = time.perf_counter() - start

print(sequential >= 2.5)
print(threaded < 1.5)

# OUTPUT:
# True
# True`
            ],
            codeExplanations: [
                `The sequential version must take at least 5 x 0.5 = 2.5 seconds. In the threaded version all five sleeps run at the same time, so the whole thing finishes in roughly half a second. We print comparisons rather than exact times because the times vary from machine to machine.`
            ]
        },
        {
            content: `<h4>Is the GIL Part of Python?</h4>
No. The GIL is a feature of the <b>CPython implementation</b>, not of the Python language. Jython and IronPython have no GIL; PyPy has one. And since Python 3.13 there is an experimental CPython build <b>without</b> the GIL (see the last topic of this module).`
        }
    ],

    expert: [
        {
            content: `<h3>How the GIL Is Passed Around</h3>
A thread running Python code does not hold the GIL forever. Since Python 3.2 the mechanism is <b>time-based</b>:
<ol>
<li>A waiting thread asks for the GIL and waits up to the <b>switch interval</b> (5 ms by default).</li>
<li>If the running thread has not released it by then, the waiter sets a "drop request" flag.</li>
<li>The running thread notices the flag at the next safe point in the evaluation loop (between bytecode instructions), releases the GIL, and the waiter takes it.</li>
</ol>
A thread also releases the GIL <b>voluntarily</b> whenever it makes a blocking call.`,
            codeExamples: [
                `import sys

print(sys.getswitchinterval())

sys.setswitchinterval(0.001)       # ask for a faster hand-over
print(sys.getswitchinterval())

# OUTPUT:
# 0.005
# 0.001`
            ]
        },
        {
            content: `<h3>Who Releases the GIL?</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Releases the GIL</th><th>Holds the GIL</th></tr>
<tr class='text-center'><td><code>time.sleep()</code>, waiting on <code>Lock</code>, <code>Event</code>, <code>Queue.get</code></td><td>Pure Python code: loops, arithmetic, function calls</td></tr>
<tr class='text-center'><td>Socket and file reads and writes</td><td>Manipulating Python objects (lists, dicts, strings)</td></tr>
<tr class='text-center'><td><code>subprocess</code> waits, <code>sqlite3</code> queries</td><td>Most operations of the built-in types</td></tr>
<tr class='text-center'><td>Heavy C code that opts in: NumPy kernels, <code>zlib</code>, <code>hashlib</code> on large data, many image libraries</td><td>Anything in a C extension that does not release it</td></tr>
</table>
This is why a threaded web scraper or file downloader works well, a threaded image-processing script using NumPy can too, and a threaded pure-Python number cruncher does not.`
        },
        {
            content: `<h3>Real Threads, Preemptive Scheduling</h3>
Python threads are <b>real operating-system threads</b> (pthreads or Windows threads). The OS decides which runnable thread gets a CPU; the GIL then decides which one may <i>interpret bytecode</i>. Because the hand-over happens at arbitrary bytecode boundaries, thread execution can be interrupted <b>in the middle of a statement</b> such as <code>counter += 1</code> - which is why locks are still essential (the next topics show this).`
        },
        {
            content: `<h3>Which Implementations Have a GIL?</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Implementation</th><th>GIL?</th></tr>
<tr class='text-center'><td>CPython (standard build)</td><td>Yes</td></tr>
<tr class='text-center'><td>CPython 3.13+ free-threaded build</td><td>No (optional, experimental then supported - see last topic)</td></tr>
<tr class='text-center'><td>PyPy</td><td>Yes</td></tr>
<tr class='text-center'><td>Jython (JVM), IronPython (.NET)</td><td>No - they use the host runtime's threads</td></tr>
</table>
Since Python 3.12 each <b>sub-interpreter</b> can also have its <i>own</i> GIL (PEP 684), the basis for running several interpreters in parallel inside one process.`
        },
        {
            content: `<h3>Advantages and Disadvantages</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Advantages</th><th>Disadvantages</th></tr>
<tr><td>Simple, single lock: easy for the interpreter to implement</td><td>CPU-bound threads cannot use more than one core</td></tr>
<tr><td>Single-threaded programs stay fast (no fine-grained locking)</td><td>Java-style multi-core threading does not carry over</td></tr>
<tr><td>Waiting work (I/O, sleep) still overlaps across threads</td><td>Adding threads to calculations can even make them slower</td></tr>
<tr><td>Built-in objects are safe from corruption by simultaneous access</td><td>Your own multi-step operations still need locks</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is the GIL?</td><td>A mutex in CPython that lets only one thread execute Python bytecode at a time</td></tr>
<tr class='text-center'><td>Does it make multithreading useless?</td><td>No - threads still help I/O-bound work because the GIL is released while waiting</td></tr>
<tr class='text-center'><td>How often does a thread give up the GIL?</td><td>On blocking calls, or when another thread has waited for the switch interval (5 ms by default)</td></tr>
<tr class='text-center'><td>Is the GIL part of the Python language?</td><td>No, it is a CPython implementation detail</td></tr>
<tr class='text-center'><td>Why do C libraries like NumPy scale across threads?</td><td>They release the GIL while running their C code</td></tr>
</table>`
        }
    ]
};
