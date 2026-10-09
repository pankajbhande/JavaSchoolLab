import type { Topic } from '../../types';

export const gilCpuVsIoBound: Topic = {
    id: 'python-gil-cpu-bound-vs-i-o-bound-tasks',
    name: 'CPU-bound vs I/O-bound Tasks',
    beginner: [
        {
            content: `<h4>Introduction</h4>
A task is <b>CPU-bound</b> when the processor is the bottleneck (calculating, compressing, parsing) and <b>I/O-bound</b> when it mostly waits (network, disk, database). The GIL hurts only the first kind, because it is released during waiting. So the right tool depends on the kind: threads or <code>asyncio</code> for I/O, processes for CPU. In Java you would choose between a cached thread pool and a <code>ForkJoinPool</code> sized to the core count in much the same way.

<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:12px 0;">
<svg viewBox="0 0 493 168" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:493px;height:auto;font-family:monospace;display:block;margin:0 auto">
<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#6b7280"/></marker></defs>
<rect x="10" y="10" width="221.1" height="26" rx="6" fill="#fff7ed" stroke="#ea580c"/><text text-anchor="middle" font-size="12" fill="#9a3412"><tspan x="120.6" y="27">CPU-bound</tspan></text><rect x="10" y="44" width="221.1" height="29" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="120.6" y="62.5">processor always busy</tspan></text><rect x="10" y="79" width="221.1" height="44" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="120.6" y="97.5">examples: primes, images,</tspan><tspan x="120.6" y="112.5">encryption, ML</tspan></text><rect x="10" y="129" width="221.1" height="29" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="120.6" y="147.5">use: multiprocessing</tspan></text><rect x="261.1" y="10" width="221.1" height="26" rx="6" fill="#ecfdf5" stroke="#059669"/><text text-anchor="middle" font-size="12" fill="#065f46"><tspan x="371.7" y="27">I/O-bound</tspan></text><rect x="261.1" y="44" width="221.1" height="29" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="371.7" y="62.5">mostly waiting, CPU idle</tspan></text><rect x="261.1" y="79" width="221.1" height="44" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="371.7" y="97.5">examples: web calls, files,</tspan><tspan x="371.7" y="112.5">database queries</tspan></text><rect x="261.1" y="129" width="221.1" height="29" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="371.7" y="147.5">use: threading / asyncio</tspan></text>
</svg>
<div style="font-size:12px;color:#6b7280;text-align:center;margin-top:6px;">Figure: the kind of work decides the right concurrency tool</div>
</div>`
        },
        {
            content: `<h4>Purpose / Need of This Topic</h4>
<b>The problem:</b> Using threads for a heavy calculation gains nothing, and using processes for a few web requests wastes memory and start-up time. Picking blindly gives slow or bloated programs.
<br><br>
<b>Why we need it:</b>
<ul>
<li>Diagnose <b>what the program is waiting for</b> before optimising.</li>
<li>Pick <b>threads/asyncio</b> for I/O and <b>multiprocessing</b> for CPU work.</li>
<li>Predict whether adding workers will help at all.</li>
<li>Avoid the cost of the wrong concurrency model.</li>
</ul>`
        },
        {
            content: `<h4>Complete Example: Threads for waiting, processes for calculating</h4>
The I/O part overlaps four 0.3 s waits in threads. The CPU part counts primes below 50,000 in four process chunks and checks the total against a single-process run.`,
            codeExamples: [
                `import time
from concurrent.futures import ProcessPoolExecutor, ThreadPoolExecutor

WORKERS = 4
DELAY = 0.3
LIMIT = 50_000


def fake_request(_):
    time.sleep(DELAY)                   # I/O: the GIL is released


def is_prime(n):
    if n < 2:
        return False
    divisor = 2
    while divisor * divisor <= n:
        if n % divisor == 0:
            return False
        divisor += 1
    return True


def count_primes(bounds):
    low, high = bounds
    return sum(1 for n in range(low, high) if is_prime(n))


def main():
    start = time.perf_counter()
    with ThreadPoolExecutor(WORKERS) as pool:
        list(pool.map(fake_request, range(WORKERS)))
    overlapped = time.perf_counter() - start < 0.9
    print("I/O in 4 threads overlapped:", overlapped)

    step = LIMIT // WORKERS
    chunks = [(i * step, (i + 1) * step) for i in range(WORKERS)]
    with ProcessPoolExecutor(WORKERS) as pool:
        total = sum(pool.map(count_primes, chunks))
    print("CPU in 4 processes, primes below 50000:", total)
    print("same as one process:", total == count_primes((0, LIMIT)))


if __name__ == "__main__":
    main()

# OUTPUT:
# I/O in 4 threads overlapped: True
# CPU in 4 processes, primes below 50000: 5133
# same as one process: True`
            ],
            codeExplanations: [
                `Four 0.3 s waits in threads finish in about 0.3 s, well under the 0.9 s limit. The prime count is split into four ranges of 12,500 numbers, each handled by its own process with its own GIL; the four counts add up to 5133, the known number of primes below 50,000. The __main__ guard is required for process pools on Windows and macOS.`
            ]
        },
        {
            content: `<h4>What Is Your Program Waiting For?</h4>
Every slow program is slow for one of two reasons:
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th></th><th>CPU-bound</th><th>I/O-bound</th></tr>
<tr class='text-center'><td>The bottleneck</td><td>The processor is busy calculating</td><td>The program is waiting for something external</td></tr>
<tr class='text-center'><td>Examples</td><td>Image processing, encryption, number crunching, parsing huge data, ML training</td><td>Web requests, database queries, reading files, API calls, user input</td></tr>
<tr class='text-center'><td>CPU usage while running</td><td>High (near 100% of a core)</td><td>Low (mostly idle)</td></tr>
<tr class='text-center'><td>Faster if you...</td><td>Add more CPU cores</td><td>Overlap the waiting</td></tr>
<tr class='text-center'><td>Best tool in Python</td><td><code>multiprocessing</code> or native code</td><td><code>threading</code> or <code>asyncio</code></td></tr>
</table>
The GIL only matters for the first kind. For waiting, the GIL is released, so threads are fine.`
        },
        {
            content: `<h4>Telling Them Apart</h4>
Compare <b>wall-clock time</b> with <b>CPU time</b> (<code>time.process_time()</code>, the time actually spent computing). If CPU time is close to wall time the task is CPU-bound; if it is much smaller the task spent its time waiting.`,
            codeExamples: [
                `import time

def calculate():
    sum(i * i for i in range(2_000_000))     # pure computation

def wait():
    time.sleep(0.5)                          # pretend network call

for task in (calculate, wait):
    wall_start = time.perf_counter()
    cpu_start = time.process_time()
    task()
    wall = time.perf_counter() - wall_start
    cpu = time.process_time() - cpu_start
    kind = "CPU-bound" if cpu > wall * 0.5 else "I/O-bound"
    print(task.__name__, kind)

# OUTPUT:
# calculate CPU-bound
# wait I/O-bound`
            ]
        },
        {
            content: `<h4>I/O-bound: Use Threads</h4>
Ten "downloads" of 0.2 seconds each would take 2 seconds in a row. With a thread pool they overlap and finish in about 0.2 seconds.`,
            codeExamples: [
                `import time
from concurrent.futures import ThreadPoolExecutor

def fetch(page):
    time.sleep(0.2)                  # stands in for a network request
    return f"page {page}"

start = time.perf_counter()
with ThreadPoolExecutor(max_workers=10) as pool:
    pages = list(pool.map(fetch, range(10)))
elapsed = time.perf_counter() - start

print(pages[:3])
print(elapsed < 1.0)

# OUTPUT:
# ['page 0', 'page 1', 'page 2']
# True`
            ]
        },
        {
            content: `<h4>CPU-bound: Use Processes</h4>
Each process has its own interpreter and its own GIL, so processes run truly in parallel on separate cores. (The <code>if __name__ == "__main__":</code> guard is required with multiprocessing on Windows and macOS.)`,
            codeExamples: [
                `from concurrent.futures import ProcessPoolExecutor

def count_primes(limit):
    count = 0
    for n in range(2, limit):
        if all(n % d for d in range(2, int(n ** 0.5) + 1)):
            count += 1
    return count

if __name__ == "__main__":
    with ProcessPoolExecutor() as pool:
        results = list(pool.map(count_primes, [50_000] * 4))
    print(results)

# OUTPUT (4 tasks, running on up to 4 cores in parallel):
# [5133, 5133, 5133, 5133]`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>A Decision Guide</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Workload</th><th>Tool</th><th>Why</th></tr>
<tr class='text-center'><td>Thousands of network connections</td><td><code>asyncio</code></td><td>One thread, tiny memory per task, no lock bugs</td></tr>
<tr class='text-center'><td>A few dozen blocking calls (legacy libraries, DB drivers)</td><td><code>ThreadPoolExecutor</code></td><td>Simple; the GIL is released while blocked</td></tr>
<tr class='text-center'><td>Heavy Python computation</td><td><code>ProcessPoolExecutor</code></td><td>Separate GIL per process: real parallelism</td></tr>
<tr class='text-center'><td>Numeric arrays</td><td>NumPy / pandas / SciPy</td><td>Loops run in C with the GIL released and often SIMD</td></tr>
<tr class='text-center'><td>Hot loop of plain Python</td><td>Numba, Cython, or a Rust/C extension</td><td>Compile it, then optionally release the GIL</td></tr>
<tr class='text-center'><td>Mixed (download, then process)</td><td>Threads/async for I/O feeding a process pool for CPU</td><td>Each stage uses the right model</td></tr>
</table>`
        },
        {
            content: `<h3>Mixing Models: Run Blocking or CPU Work From asyncio</h3>
An <code>async</code> program must never block the event loop. Push blocking calls into a thread with <code>asyncio.to_thread()</code>, and CPU-heavy functions into a process pool with <code>loop.run_in_executor()</code>.`,
            codeExamples: [
                `import asyncio
import time
from concurrent.futures import ProcessPoolExecutor

def blocking_io():
    time.sleep(0.2)
    return "io done"

def heavy_cpu(n):
    return sum(i * i for i in range(n))

async def main():
    loop = asyncio.get_running_loop()
    with ProcessPoolExecutor() as pool:
        io_result, cpu_result = await asyncio.gather(
            asyncio.to_thread(blocking_io),                  # a worker thread
            loop.run_in_executor(pool, heavy_cpu, 1_000_000),   # another process
        )
    print(io_result, cpu_result)

if __name__ == "__main__":
    asyncio.run(main())

# OUTPUT:
# io done 333332833333500000`
            ]
        },
        {
            content: `<h3>Costs and Pitfalls</h3>
<ul>
<li><b>Processes are not free.</b> Starting one costs tens of milliseconds, and arguments and results are <b>pickled</b> and copied between processes. For tiny tasks the overhead exceeds the gain: send big batches (<code>chunksize</code> in <code>pool.map</code>) rather than many small items.</li>
<li><b>Workers = cores.</b> More CPU-bound workers than cores only adds scheduling overhead. In containers, check the real CPU limit (<code>os.cpu_count()</code> may report the host's cores).</li>
<li><b>Amdahl's law:</b> if 20% of the work cannot be parallelised, the maximum speed-up is 5x no matter how many cores you add.</li>
<li><b>Too many threads hurt I/O work too:</b> remote services, databases and file descriptors have limits. Pick a worker count from measurements, not guesses.</li>
<li><b>Profile first.</b> Use <code>cProfile</code> to find the real hotspot - often an algorithm or a missing index fixes a "CPU-bound" problem without any parallelism.</li>
</ul>`
        },
        {
            content: `<h3>Advantages and Disadvantages</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Advantages</th><th>Disadvantages</th></tr>
<tr><td>A simple rule picks the right tool for the job</td><td>Real programs mix both kinds of work</td></tr>
<tr><td>Threads handle thousands of waiting tasks cheaply</td><td>Processes cost memory and start-up time</td></tr>
<tr><td>Processes give true multi-core speed for calculations</td><td>Data must be pickled between processes</td></tr>
<tr><td>Avoids wasted effort optimising the wrong thing</td><td>Misjudging the kind gives no speed-up at all</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>CPU-bound vs I/O-bound?</td><td>CPU-bound is limited by computation speed; I/O-bound is limited by waiting for external resources</td></tr>
<tr class='text-center'><td>Which one benefits from threads in CPython?</td><td>I/O-bound - the GIL is released while waiting</td></tr>
<tr class='text-center'><td>Which tool do you use for CPU-bound work?</td><td><code>multiprocessing</code> / <code>ProcessPoolExecutor</code> (or native code that releases the GIL)</td></tr>
<tr class='text-center'><td>How can you tell which type a task is?</td><td>Compare <code>process_time()</code> with wall-clock time, or watch CPU usage while it runs</td></tr>
<tr class='text-center'><td>How do you combine asyncio with blocking or CPU work?</td><td><code>asyncio.to_thread</code> or <code>run_in_executor</code> with a thread or process pool</td></tr>
</table>`
        }
    ]
};
