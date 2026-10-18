import type { Topic } from '../../types';

export const gilThreadsVsProcesses: Topic = {
    id: 'python-gil-threads-vs-processes',
    name: 'Threads vs Processes',
    beginner: [
        {
            content: `<h4>Introduction</h4>
A <b>thread</b> is a flow of execution inside a process and shares its memory; a <b>process</b> is a separate program instance with its own memory and its own interpreter - and therefore its own GIL. Threads are light but take turns on one GIL, while processes run Python code truly in parallel at the cost of copying data between them. Java developers know the same split as threads inside one JVM versus separate JVM processes.

<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:12px 0;">
<svg viewBox="0 0 580 190" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:580px;height:auto;font-family:monospace;display:block;margin:0 auto">
<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#6b7280"/></marker></defs>
<text x="10" y="29" font-size="12" fill="#374151">Thread A</text><line x1="89.7" y1="43" x2="569.7" y2="43" stroke="#e5e7eb"/><rect x="89.7" y="10" width="160" height="30" rx="6" fill="#ecfdf5" stroke="#059669"/><text text-anchor="middle" font-size="12" fill="#065f46"><tspan x="169.7" y="29">run</tspan></text><rect x="249.7" y="10" width="160" height="30" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="329.7" y="29">wait</tspan></text><rect x="409.7" y="10" width="160" height="30" rx="6" fill="#ecfdf5" stroke="#059669"/><text text-anchor="middle" font-size="12" fill="#065f46"><tspan x="489.7" y="29">run</tspan></text><text x="10" y="71" font-size="12" fill="#374151">Thread B</text><line x1="89.7" y1="85" x2="569.7" y2="85" stroke="#e5e7eb"/><rect x="89.7" y="52" width="160" height="30" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="169.7" y="71">wait</tspan></text><rect x="249.7" y="52" width="160" height="30" rx="6" fill="#fff7ed" stroke="#ea580c"/><text text-anchor="middle" font-size="12" fill="#9a3412"><tspan x="329.7" y="71">run</tspan></text><rect x="409.7" y="52" width="160" height="30" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="489.7" y="71">wait</tspan></text><text x="10" y="113" font-size="12" fill="#374151">Process 1</text><line x1="89.7" y1="127" x2="569.7" y2="127" stroke="#e5e7eb"/><rect x="89.7" y="94" width="480" height="30" rx="6" fill="#eff6ff" stroke="#2563eb"/><text text-anchor="middle" font-size="12" fill="#1e40af"><tspan x="329.7" y="113">runs all the time (own GIL)</tspan></text><text x="10" y="155" font-size="12" fill="#374151">Process 2</text><line x1="89.7" y1="169" x2="569.7" y2="169" stroke="#e5e7eb"/><rect x="89.7" y="136" width="480" height="30" rx="6" fill="#f5f3ff" stroke="#7c3aed"/><text text-anchor="middle" font-size="12" fill="#5b21b6"><tspan x="329.7" y="155">runs all the time (own GIL)</tspan></text><text x="89.7" y="184" font-size="11" fill="#6b7280">time →</text>
</svg>
<div style="font-size:12px;color:#6b7280;text-align:center;margin-top:6px;">Figure: threads share one GIL and alternate; processes each have a GIL and run side by side</div>
</div>`
        },
        {
            content: `<h4>Purpose / Need of This Topic</h4>
<b>The problem:</b> If you do not know that processes have separate memory, you wonder why a variable changed by a worker "does not change" in the parent, or why threads gave no CPU speed-up.
<br><br>
<b>Why we need it:</b>
<ul>
<li>Choose <b>threads</b> (shared memory, cheap) or <b>processes</b> (parallel, isolated).</li>
<li>Understand why <b>each process has its own GIL</b>.</li>
<li>Know how data must travel between processes (queues, pipes).</li>
<li>Predict what shared variables do in each model.</li>
</ul>`
        },
        {
            content: `<h4>Complete Example: Shared memory vs separate memory</h4>
The same function appends to a list. A thread changes the parent list; a process changes only its own copy and must send the result back through a <code>Queue</code>.`,
            codeExamples: [
                `import multiprocessing
import threading

shared_log = []     # a module-level list


def record(source):
    shared_log.append(source)


def process_task(queue):
    record("process")                   # changes the child's own copy
    queue.put(list(shared_log))         # send the child's view back


def main():
    queue = multiprocessing.Queue()
    child = multiprocessing.Process(target=process_task, args=(queue,))
    child.start()
    child_view = queue.get()            # read before join to avoid a hang
    child.join()
    print("child process saw:", child_view)
    print("parent after process:", shared_log)

    worker = threading.Thread(target=record, args=("thread",))
    worker.start()
    worker.join()
    print("parent after thread:", shared_log)


if __name__ == "__main__":
    main()

# OUTPUT:
# child process saw: ['process']
# parent after process: []
# parent after thread: ['thread']`
            ],
            codeExplanations: [
                `The child process works on its own copy of shared_log, so the parent list stays empty and the child reports ['process'] through the queue. The thread shares the parent's memory, so after it finishes the parent list contains 'thread'. The __main__ guard is mandatory for multiprocessing.`
            ]
        },
        {
            content: `<h4>Two Ways to Do Things at Once</h4>
A <b>process</b> is a running program with its <b>own memory</b> and its own Python interpreter. A <b>thread</b> is a flow of execution <b>inside</b> a process; all threads of one process <b>share the same memory</b>.
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>Threads (<code>threading</code>)</th><th>Processes (<code>multiprocessing</code>)</th></tr>
<tr class='text-center'><td>Memory</td><td>Shared with the other threads</td><td>Separate - nothing shared by default</td></tr>
<tr class='text-center'><td>GIL</td><td>One GIL shared by all threads</td><td>Each process has its <b>own</b> GIL</td></tr>
<tr class='text-center'><td>Parallel Python code on many cores?</td><td>No (standard CPython)</td><td>Yes</td></tr>
<tr class='text-center'><td>Start-up cost</td><td>Tiny (microseconds to milliseconds)</td><td>Larger (tens of milliseconds; a new interpreter)</td></tr>
<tr class='text-center'><td>Sharing data</td><td>Just use variables (but lock them)</td><td>Must send it: queues, pipes, shared memory (pickling)</td></tr>
<tr class='text-center'><td>If one crashes</td><td>The whole process can die</td><td>Other processes keep running</td></tr>
<tr class='text-center'><td>Best for</td><td>I/O-bound work</td><td>CPU-bound work</td></tr>
</table>`
        },
        {
            content: `<h4>Shared Memory vs Separate Memory</h4>
The same function does different things to the parent's variable depending on whether it runs in a process or a thread.`,
            codeExamples: [
                `import multiprocessing
import threading

counter = 0

def child():
    global counter
    counter += 1
    print("child sees", counter)

if __name__ == "__main__":
    p = multiprocessing.Process(target=child)
    p.start()
    p.join()
    print("after process", counter)      # the child changed ITS OWN copy

    t = threading.Thread(target=child)
    t.start()
    t.join()
    print("after thread", counter)       # the thread changed the SAME variable

# OUTPUT:
# child sees 1
# after process 0
# child sees 1
# after thread 1`
            ],
            codeExplanations: [
                `The process worked on its own copy of counter (it has separate memory), so the parent still sees 0. The thread ran inside the parent's memory, so the parent sees the change. This is the central difference: threads share data effortlessly but must protect it with locks; processes are isolated and must pass data explicitly.`
            ]
        },
        {
            content: `<h4>Passing Data Between Processes</h4>
Since memory is not shared, processes communicate through <b>queues</b> or <b>pipes</b>. Items are pickled, sent, and unpickled on the other side.`,
            codeExamples: [
                `from multiprocessing import Process, Queue

def producer(queue):
    for i in range(3):
        queue.put(i * i)
    queue.put(None)                    # a sentinel meaning "finished"

if __name__ == "__main__":
    queue = Queue()
    worker = Process(target=producer, args=(queue,))
    worker.start()

    while (item := queue.get()) is not None:
        print("got", item)
    worker.join()

# OUTPUT:
# got 0
# got 1
# got 4`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>One API for Both: concurrent.futures</h3>
<code>ThreadPoolExecutor</code> and <code>ProcessPoolExecutor</code> have the same interface, so switching between them is a one-word change. That makes it easy to measure which model suits your workload.`,
            codeExamples: [
                `from concurrent.futures import ProcessPoolExecutor, ThreadPoolExecutor

def square(n):
    return n * n

def run(executor_class):
    with executor_class(max_workers=4) as pool:
        return list(pool.map(square, range(6)))

if __name__ == "__main__":
    print(run(ThreadPoolExecutor))
    print(run(ProcessPoolExecutor))

# OUTPUT:
# [0, 1, 4, 9, 16, 25]
# [0, 1, 4, 9, 16, 25]`
            ]
        },
        {
            content: `<h3>Start Methods and the __main__ Guard</h3>
How a new process is created depends on the <b>start method</b>:
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Method</th><th>How</th><th>Notes</th></tr>
<tr class='text-center'><td><code>spawn</code></td><td>Starts a fresh interpreter and re-imports your main module</td><td>Default on Windows and macOS; safest; needs the <code>if __name__ == "__main__":</code> guard</td></tr>
<tr class='text-center'><td><code>fork</code></td><td>Copies the running process (copy-on-write)</td><td>Fast, but unsafe if the parent already has threads or open locks; being phased out as a default</td></tr>
<tr class='text-center'><td><code>forkserver</code></td><td>A clean helper process forks workers on request</td><td>Safer than fork; the default on Linux from Python 3.14</td></tr>
</table>
Without the <code>__main__</code> guard, a spawned child re-imports your script, which starts new processes, which re-import it... Python detects this and raises a <code>RuntimeError</code>.`,
            codeExamples: [
                `import multiprocessing

print(multiprocessing.get_start_method())      # the platform default
print(multiprocessing.cpu_count() >= 1)

# Choose explicitly (once, early, inside the __main__ guard):
#   multiprocessing.set_start_method("spawn")
# or per use:
#   ctx = multiprocessing.get_context("spawn")
#   ctx.Process(target=...)

# OUTPUT (on Windows):
# spawn
# True`
            ]
        },
        {
            content: `<h3>Pickling: What Can Cross the Process Boundary</h3>
Arguments and return values are serialized with <code>pickle</code>. That works for numbers, strings, lists, dicts and instances of top-level classes, but <b>not</b> for lambdas, nested functions, open files, locks, sockets or database connections. A worker function must be defined at the <b>module top level</b>. Large objects are expensive to copy: pass small identifiers (file names, ids) and let each worker load its own data, or use <code>multiprocessing.shared_memory</code> for big arrays.`,
            codeExamples: [
                `import pickle

def top_level(x):
    return x + 1

print(pickle.loads(pickle.dumps(top_level))(1))   # pickled by reference to its name

try:
    pickle.dumps(lambda x: x)                      # lambdas have no importable name
except (pickle.PicklingError, AttributeError) as error:
    print("cannot pickle a lambda")

# OUTPUT:
# 2
# cannot pickle a lambda`
            ]
        },
        {
            content: `<h3>Sharing State Safely</h3>
<ul>
<li><b>Threads:</b> protect shared data with <code>Lock</code>, <code>RLock</code>, <code>Semaphore</code>, or avoid sharing by passing work through a thread-safe <code>queue.Queue</code>.</li>
<li><b>Processes:</b> <code>multiprocessing.Queue</code> / <code>Pipe</code> for messages, <code>Value</code> / <code>Array</code> for small shared numbers, <code>shared_memory</code> for big buffers (such as NumPy arrays) without copying, and <code>Manager</code> for shared dicts and lists (convenient but slow, since each access is an inter-process call).</li>
<li><b>Prefer message passing</b> ("share by communicating") over shared mutable state in both models; it removes most locking bugs.</li>
</ul>`
        },
        {
            content: `<h3>Choosing: A Practical Checklist</h3>
<ul>
<li>Waiting on a network, disk or database: <b>threads</b> (or <code>asyncio</code>).</li>
<li>Heavy computation in pure Python: <b>processes</b>, with batches large enough to cover start-up and pickling cost.</li>
<li>Need isolation (untrusted or crash-prone code, memory leaks): <b>processes</b>. Use <code>maxtasksperchild</code> (in <code>multiprocessing.Pool</code>) or <code>max_tasks_per_child</code> (executor) to recycle leaky workers.</li>
<li>Many tasks that share a large read-only structure: <b>threads</b> (or processes created with fork before heavy writes, taking care with its risks) to avoid copying it.</li>
<li>Python 3.13+ free-threaded build: <b>threads</b> may now give real parallelism (see the last topic).</li>
</ul>`
        },
        {
            content: `<h3>Advantages and Disadvantages</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Advantages</th><th>Disadvantages</th></tr>
<tr><td>Threads: tiny start-up cost and easy data sharing</td><td>Threads: one GIL, so no CPU parallelism</td></tr>
<tr><td>Processes: true parallel Python on every core</td><td>Processes: heavier start-up and more memory</td></tr>
<tr><td>Processes: a crash in one does not kill the others</td><td>Threads: shared data needs locks to stay correct</td></tr>
<tr><td>Each process has its own GIL, so no contention</td><td>Processes: data must be pickled and copied</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Thread vs process?</td><td>Threads share one process's memory and one GIL; processes have separate memory and each their own GIL</td></tr>
<tr class='text-center'><td>Why do processes give parallelism in Python?</td><td>Each has its own interpreter and GIL, so they run on separate cores at the same time</td></tr>
<tr class='text-center'><td>How do processes share data?</td><td>Queues, pipes, shared memory or managers - data is pickled and copied</td></tr>
<tr class='text-center'><td>Why the <code>if __name__ == "__main__"</code> guard?</td><td>With spawn, children re-import the main module; without the guard they would start processes recursively</td></tr>
<tr class='text-center'><td>What cannot be sent to a worker process?</td><td>Unpicklable objects such as lambdas, open files, locks and connections</td></tr>
</table>`
        }
    ]
};
