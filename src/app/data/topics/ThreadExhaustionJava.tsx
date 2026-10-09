import { Topic } from '../coreJava';

export const threadExhaustionJava: Topic = {
    id: 'thread-exhaustion-java',
    name: 'Thread Exhaustion',
    beginner: [
        {
            content: `<h3>What is Thread Exhaustion?</h3>
Every Java thread you create consumes real operating-system resources: a native memory stack (default roughly
512KB-1MB), kernel scheduling structures, and a slot against the OS's per-process thread limit. <br><br>
<strong>Thread exhaustion</strong> happens when an application creates far more threads than it should (usually
unintentionally) - either running out of memory to back them, or hitting the OS's hard limit on threads per
process. Unlike heap OOM, this isn't about your objects; it's about the JVM itself running out of room to create
new <em>threads</em>.`
        },
        {
            content: `<h4>Cause 1: Creating a New Thread Per Task, Unbounded</h4>
The classic beginner mistake is calling <code>new Thread(...).start()</code> for every incoming task instead of
using a bounded thread pool. Under enough load, this creates thousands of threads simultaneously.`,
            codeExamples: [`public class UnboundedThreadCreationDemo {

    static void handleTask(int taskId) {
        try {
            Thread.sleep(60_000); // simulates a slow task (e.g. waiting on a slow downstream call)
        } catch (InterruptedException ignored) { }
    }

    public static void main(String[] args) {
        int taskId = 0;
        while (true) {
            int id = taskId++;
            // BUG: a brand-new OS thread for every single task, with no limit
            new Thread(() -> handleTask(id)).start();
        }
    }
}
// OUTPUT (after enough threads accumulate, depends on OS ulimit/JVM -Xss):
// Exception in thread "main" java.lang.OutOfMemoryError: unable to create new native thread
//     at java.lang.Thread.start0(Native Method)
//     at java.lang.Thread.start(Thread.java:803)
//     at UnboundedThreadCreationDemo.main(UnboundedThreadCreationDemo.java:14)`]
        },
        {
            content: `<h4>Cause 2: An Unbounded Thread Pool (CachedThreadPool)</h4>
<code>Executors.newCachedThreadPool()</code> creates a <strong>new thread for every submitted task if none are
idle</strong>, with no upper bound on pool size. If tasks arrive faster than they complete (e.g. they're all
blocked waiting on something slow), the pool will keep growing without limit - same problem as Cause 1, just
hidden behind an innocent-looking API.`,
            codeExamples: [`import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class CachedPoolExhaustionDemo {

    public static void main(String[] args) {
        // newCachedThreadPool has NO maximum pool size (effectively Integer.MAX_VALUE)
        ExecutorService pool = Executors.newCachedThreadPool();

        for (int i = 0; i < 1_000_000; i++) {
            pool.submit(() -> {
                try {
                    Thread.sleep(60_000); // every task blocks for a long time
                } catch (InterruptedException ignored) { }
            });
        }
    }
}
// OUTPUT:
// Exception in thread "main" java.lang.OutOfMemoryError: unable to create new native thread
//     at java.lang.Thread.start0(Native Method)
//     at java.util.concurrent.ThreadPoolExecutor.addWorker(ThreadPoolExecutor.java:957)
//     at java.util.concurrent.ThreadPoolExecutor.execute(ThreadPoolExecutor.java:1378)`]
        },
        {
            content: `<h4>The Beginner-Level Fix: Always Use a Bounded Pool</h4>
Use a thread pool with an explicit, sensible maximum size for the kind of work being done, instead of an unbounded
pool or raw <code>new Thread()</code> per task.`,
            codeExamples: [`import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class BoundedPoolFixDemo {

    public static void main(String[] args) {
        // Fixed pool - only ever 10 threads exist, no matter how many tasks arrive
        ExecutorService pool = Executors.newFixedThreadPool(10);

        for (int i = 0; i < 1000; i++) {
            int taskId = i;
            pool.submit(() -> System.out.println("Processing task " + taskId + " on " + Thread.currentThread().getName()));
        }
        pool.shutdown();
    }
}
// OUTPUT (sample - only 10 distinct thread names ever appear, tasks queue safely):
// Processing task 0 on pool-1-thread-1
// Processing task 1 on pool-1-thread-2
// ...
// Processing task 999 on pool-1-thread-7`]
        }
    ],

    expert: [
        {
            content: `<h3>Anatomy of "unable to create new native thread"</h3>
This specific OutOfMemoryError message is misleading to newcomers because it says "OutOfMemoryError" but usually
has nothing to do with the Java heap. It occurs when the JVM asks the OS to create a new native thread (via
<code>pthread_create</code> on Linux) and the OS refuses. That refusal has two common underlying causes: <br><br>
• <strong>Native memory exhaustion</strong> - each thread reserves a stack (<code>-Xss</code>, default
~512KB-1MB); with thousands of threads, that alone can exhaust available process/native memory, especially in a
memory-constrained container. <br>
• <strong>OS thread-count limits</strong> - Linux's <code>ulimit -u</code> (max user processes/threads) or
<code>/proc/sys/kernel/threads-max</code>, and inside containers, resource limits (cgroups) can cap the number of
threads far below what raw memory would allow. <br><br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Exception in thread "pool-4-thread-8231" java.lang.OutOfMemoryError: unable to create new native thread
    at java.base/java.lang.Thread.start0(Native Method)
    at java.base/java.lang.Thread.start(Thread.java:803)
    at java.base/java.util.concurrent.ThreadPoolExecutor.addWorker(ThreadPoolExecutor.java:957)
    at java.base/java.util.concurrent.ThreadPoolExecutor.execute(ThreadPoolExecutor.java:1378)
    at java.base/java.util.concurrent.AbstractExecutorService.submit(AbstractExecutorService.java:145)
    at com.shop.orders.OrderNotifier.notifyAsync(OrderNotifier.java:52)

Diagnostic checklist:
  $ ps -eLf | grep <pid> | wc -l        # actual current thread count for the process
  $ cat /proc/<pid>/limits | grep processes    # ulimit -u as seen by the process
  $ jstack <pid> | grep 'nid=' | wc -l         # cross-check via JVM's own thread list</pre>`
        },
        {
            content: `<h3>Thread Pool Sizing: CPU-Bound vs I/O-Bound Work</h3>
Choosing a pool size isn't arbitrary - it should be driven by what the tasks actually spend their time doing: <br><br>
• <strong>CPU-bound tasks</strong> (pure computation, no blocking) - optimal pool size is roughly
<code>number of CPU cores (+1)</code>. More threads than cores just adds context-switching overhead with no
throughput gain. <br>
• <strong>I/O-bound tasks</strong> (waiting on network calls, DB queries, disk) - threads spend most of their time
blocked, not computing, so a much larger pool can improve throughput. A common starting formula:
<code>threads = cores x (1 + wait_time / compute_time)</code> - e.g. if a task waits 90ms for every 10ms of actual
CPU work, that's a wait/compute ratio of 9, suggesting roughly 10x the core count. <br><br>
In practice, teams tune this empirically with load tests rather than trusting the formula blindly, but the formula
gives a sane starting point instead of guessing "100 sounds fine."`
        },
        {
            content: `<h3>Bounding Cached Pools and Rejecting Overload Gracefully</h3>
The real production fix for thread exhaustion is rarely "just use a fixed pool" alone - it's combining a bounded
pool with a bounded queue and an explicit rejection policy, so the system fails predictably under overload instead
of unboundedly consuming resources.`,
            codeExamples: [`import java.util.concurrent.*;

public class ProductionSafeThreadPool {

    public static void main(String[] args) {
        ThreadPoolExecutor executor = new ThreadPoolExecutor(
            10,                              // core pool size
            50,                              // maximum pool size - a real upper bound
            60L, TimeUnit.SECONDS,           // idle thread keep-alive
            new LinkedBlockingQueue<>(500),  // bounded queue - NOT unbounded
            new ThreadPoolExecutor.CallerRunsPolicy() // backpressure: caller thread runs it instead of crashing
        );

        for (int i = 0; i < 100_000; i++) {
            executor.submit(() -> {
                try { Thread.sleep(100); } catch (InterruptedException ignored) { }
            });
        }
        executor.shutdown();
    }
}
// With CallerRunsPolicy, once queue+pool are saturated, the submitting thread itself
// executes the task, naturally slowing down the producer instead of exploding thread count.`]
        },
        {
            content: `<h3>Symptom -> Root Cause -> Diagnosis -> Fix</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Symptom</th><th>Root Cause</th><th>Diagnosis</th><th>Fix</th></tr>
<tr><td>OutOfMemoryError: unable to create new native thread under sustained load</td><td>Unbounded thread creation (raw new Thread() per task, or Executors.newCachedThreadPool with slow/blocked tasks)</td><td>ps -eLf | grep &lt;pid&gt; | wc -l shows thread count climbing without bound; jstack confirms thousands of pool threads</td><td>Switch to a bounded ThreadPoolExecutor with explicit core/max size and a bounded queue plus rejection policy</td></tr>
<tr><td>Thread count climbs but each new "task" never seems to be doing real work</td><td>Tasks blocked waiting on a slow/unresponsive downstream dependency, so worker threads accumulate faster than they free up</td><td>jstack shows most threads BLOCKED/WAITING on the same downstream call (DB, HTTP client)</td><td>Add timeouts to downstream calls, apply backpressure/circuit breaker, and cap pool size so the pool itself limits concurrent downstream load</td></tr>
<tr><td>Native thread OOM happens well below expected memory limits inside a container</td><td>Container/cgroup thread or memory limits are stricter than assumed from host-level testing</td><td>Compare /proc/&lt;pid&gt;/limits and cgroup limits inside the container against local dev assumptions</td><td>Right-size container thread/memory limits, or reduce max pool size to fit within actual container constraints</td></tr>
<tr><td>Application seems to leak threads slowly over days (thread count only ever grows)</td><td>Threads not being properly shut down/joined - e.g. a new ExecutorService created per request and never shut down</td><td>jstack thread count trending upward over time even at steady traffic; look for repeated pool-N-thread-1 patterns (new pools created repeatedly)</td><td>Create thread pools once at startup and reuse them; ensure ExecutorService.shutdown() is called wherever pools are scoped to a shorter lifecycle</td></tr>
<tr><td>Reducing -Xss "fixes" native thread OOM but recursion-heavy code starts StackOverflowError-ing</td><td>Thread count vs per-thread stack size trade-off was pushed too far in one direction</td><td>Compare thread count x -Xss against available memory, alongside recursion depth requirements of the codebase</td><td>Address the actual thread-count problem (bounded pools) rather than just shrinking -Xss to fit more threads</td></tr>
</table>`
        },
        {
            content: `<h3>War Story: The Retry Storm That Multiplied Threads</h3>
A payments-notification service used <code>Executors.newCachedThreadPool()</code> to fire outbound webhook calls
to merchant endpoints asynchronously - reasonable when merchant endpoints usually respond in under 200ms. During a
partial outage of one large merchant's endpoint, its webhook URL started timing out after the client's default
60-second socket timeout instead of failing fast. <br><br>
Because the cached pool has no upper bound, and webhook volume didn't slow down, the service kept spinning up a
brand-new thread for every notification, each of which sat blocked for up to 60 seconds waiting on that one
unresponsive merchant. Within about 12 minutes, the process had accumulated over 30,000 threads and crashed with
<code>OutOfMemoryError: unable to create new native thread</code> - taking down webhook delivery for
<em>every</em> merchant, not just the one that was actually having problems. <br><br>
<strong>Fix:</strong> the cached pool was replaced with a bounded <code>ThreadPoolExecutor</code> (max 200 threads,
bounded queue, <code>CallerRunsPolicy</code>), and the HTTP client's socket timeout was reduced to 5 seconds with a
per-merchant circuit breaker, so one slow merchant could no longer starve threads needed for everyone else.`
        },
        {
            content: `<h3>Prevention Checklist</h3>
• Never use <code>Executors.newCachedThreadPool()</code> or raw <code>new Thread()</code> per task in production
code that handles untrusted/variable load - always define an explicit maximum. <br>
• Pair a bounded pool with a bounded queue and a deliberate rejection policy (
<code>CallerRunsPolicy</code>, <code>AbortPolicy</code> with monitoring, or a custom handler) so overload is
handled predictably. <br>
• Set aggressive timeouts on any blocking call made from within a pooled task - a thread blocked forever on a
downstream dependency is a thread that can never be reused. <br>
• Monitor thread count (via JMX/Micrometer <code>jvm.threads.live</code>) as a first-class metric with alerting,
the same way you'd monitor heap usage. <br>
• Size pools deliberately using the CPU-bound vs I/O-bound distinction, and validate under realistic load tests
rather than trusting a guessed constant.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What does "OutOfMemoryError: unable to create new native thread" actually mean?</td><td>The JVM asked the OS to create a new native thread and it was refused - usually due to native memory exhaustion (thread stacks) or hitting an OS/cgroup thread-count limit, not the Java heap being full</td></tr>
<tr><td>Why is Executors.newCachedThreadPool() dangerous in production?</td><td>It has no maximum pool size, so if tasks arrive faster than they complete (e.g. they block on a slow dependency), it will keep creating new threads without bound, risking thread exhaustion</td></tr>
<tr><td>How do you size a thread pool for CPU-bound work versus I/O-bound work?</td><td>CPU-bound: roughly the number of CPU cores (+1); I/O-bound: a larger pool since threads spend most time blocked, often estimated as cores x (1 + wait_time/compute_time)</td></tr>
<tr><td>What's the role of a bounded queue and rejection policy in a ThreadPoolExecutor?</td><td>They provide backpressure - once the pool and queue are both saturated, the rejection policy (e.g. CallerRunsPolicy) determines what happens next instead of letting the pool grow unboundedly or silently dropping work</td></tr>
<tr><td>How would you diagnose which threads are causing thread exhaustion in a running process?</td><td>Compare ps -eLf thread count and /proc/&lt;pid&gt;/limits against expectations, then use jstack to see what the accumulated threads are doing (often BLOCKED/WAITING on the same downstream call)</td></tr>
<tr><td>Why can a slow downstream dependency cause thread exhaustion even with reasonable traffic volume?</td><td>If each task blocks waiting on the slow dependency for a long time, worker threads accumulate faster than they're freed, especially with an unbounded pool, eventually exhausting native thread capacity</td></tr>
<tr><td>What's the trade-off of reducing -Xss to allow more threads within the same memory budget?</td><td>Smaller per-thread stacks let more threads fit in a given memory budget, but increase the risk of StackOverflowError for any code with deep recursion or large stack frames</td></tr>
</table>`
        }
    ]
};
