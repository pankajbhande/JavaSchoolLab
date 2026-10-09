import { Topic } from '../coreJava';

export const executorFrameworkInJava: Topic = {
    id: 'executor-framework',
    name: 'Executor Framework in Java',

    beginner: [
        {
            content: `<h4>Why Not Just Create Threads Manually?</h4>
Creating a raw <code>Thread</code> for every task (as covered in Multithreading) does not scale in real applications.<br>
• Thread creation is <b>expensive</b> — each OS-level thread costs memory (its own stack) and setup time.<br>
• There is <b>no reuse</b> — every <code>new Thread(...)</code> is thrown away after <code>run()</code> finishes.<br>
• There is <b>no bounded control</b> — nothing stops a program from spawning thousands of threads and crashing the JVM.<br><br>

The <b>Executor Framework</b> (<code>java.util.concurrent</code>) solves this with a managed <b>pool of reusable worker threads</b> that tasks are submitted to.`
        },
        {
            content: `<h4>ExecutorService and Thread Pools</h4>
<code>ExecutorService</code> is the main interface for submitting tasks to a thread pool. Instead of managing threads yourself, you hand work to the executor and it decides which pooled thread runs it.<br>
• <code>Executors.newFixedThreadPool(n)</code> — a fixed number of reusable threads; extra tasks wait in a queue.<br>
• <code>Executors.newCachedThreadPool()</code> — creates threads as needed and reuses idle ones; can grow unbounded under load.<br>
• <code>Executors.newSingleThreadExecutor()</code> — exactly one worker thread; tasks run one at a time, in order.<br>`,
            codeExamples: [
                `import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class FixedPoolDemo {
    public static void main(String[] args) {
        ExecutorService executor = Executors.newFixedThreadPool(2);

        for (int i = 1; i <= 4; i++) {
            int taskId = i;
            executor.submit(() -> {
                String name = Thread.currentThread().getName();
                System.out.println("Task " + taskId + " running on " + name);
            });
        }

        executor.shutdown();
    }
}
// OUTPUT (only 2 threads exist, so tasks run in pairs; order of "Task N" can vary):
// Task 1 running on pool-1-thread-1
// Task 2 running on pool-1-thread-2
// Task 3 running on pool-1-thread-1
// Task 4 running on pool-1-thread-2`
            ]
        },
        {
            content: `<h4>Runnable vs Callable&lt;T&gt;</h4>
• <code>Runnable</code> — <code>run()</code> returns <b>nothing</b> and cannot throw a checked exception.<br>
• <code>Callable&lt;T&gt;</code> — <code>call()</code> <b>returns a value</b> of type <code>T</code> and is allowed to throw a checked exception.<br>
Submitting a <code>Callable</code> gives you back a <code>Future&lt;T&gt;</code> — a handle you can use to retrieve that result once it's ready.`,
            codeExamples: [
                `import java.util.concurrent.*;

public class CallableDemo {
    public static void main(String[] args) throws Exception {
        ExecutorService executor = Executors.newSingleThreadExecutor();

        Callable<Integer> task = () -> {
            Thread.sleep(200);
            return 10 * 10;
        };

        Future<Integer> future = executor.submit(task);
        System.out.println("Task submitted, doing other work...");
        System.out.println("Result: " + future.get()); // blocks until the result is ready

        executor.shutdown();
    }
}
// OUTPUT:
// Task submitted, doing other work...
// Result: 100`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Future&lt;T&gt; — get(), isDone(), cancel()</h3>
A <code>Future&lt;T&gt;</code> represents the eventual result of an asynchronous task:<br>
• <code>get()</code> — blocks the calling thread until the result is available (or throws if the task failed).<br>
• <code>get(timeout, unit)</code> — blocks only up to a timeout, then throws <code>TimeoutException</code>.<br>
• <code>isDone()</code> — non-blocking check for whether the task has finished (normally, exceptionally, or by cancellation).<br>
• <code>cancel(mayInterruptIfRunning)</code> — attempts to cancel the task; returns <code>false</code> if it already completed.<br>`,
            codeExamples: [
                `import java.util.concurrent.*;

public class FutureControlDemo {
    public static void main(String[] args) throws Exception {
        ExecutorService executor = Executors.newSingleThreadExecutor();

        Future<String> future = executor.submit(() -> {
            Thread.sleep(2000);
            return "done";
        });

        System.out.println("isDone right after submit: " + future.isDone());

        try {
            future.get(500, TimeUnit.MILLISECONDS);
        } catch (TimeoutException e) {
            System.out.println("Timed out waiting for result");
        }

        boolean cancelled = future.cancel(true);
        System.out.println("Cancelled: " + cancelled);

        executor.shutdown();
    }
}
// OUTPUT:
// isDone right after submit: false
// Timed out waiting for result
// Cancelled: true`
            ]
        },
        {
            content: `<h3>Submitting Multiple Callables and Collecting Results</h3>
<code>ExecutorService</code> also offers <code>invokeAll(...)</code> to submit a batch of <code>Callable</code> tasks and block until <b>all</b> of them complete, returning a <code>List&lt;Future&lt;T&gt;&gt;</code> in the same order the tasks were submitted.`,
            codeExamples: [
                `import java.util.*;
import java.util.concurrent.*;

public class InvokeAllDemo {
    public static void main(String[] args) throws Exception {
        ExecutorService executor = Executors.newFixedThreadPool(3);

        List<Callable<Integer>> tasks = new ArrayList<>();
        for (int i = 1; i <= 3; i++) {
            int n = i;
            tasks.add(() -> n * n);
        }

        List<Future<Integer>> results = executor.invokeAll(tasks);

        int total = 0;
        for (Future<Integer> f : results) {
            total += f.get();
        }
        System.out.println("Sum of squares: " + total);

        executor.shutdown();
    }
}
// OUTPUT:
// Sum of squares: 14`
            ]
        },
        {
            content: `<h3>shutdown() vs shutdownNow() — Graceful vs Immediate</h3>
An <code>ExecutorService</code>'s threads are non-daemon by default, so the JVM will <b>not exit</b> until the pool is explicitly shut down.<br>
• <code>shutdown()</code> — stops accepting new tasks, but lets already-submitted tasks finish (graceful).<br>
• <code>shutdownNow()</code> — attempts to stop all actively running tasks immediately (via interruption) and returns the list of tasks that were still waiting in the queue.<br>
• <code>awaitTermination(timeout, unit)</code> — blocks until either all tasks finish or the timeout elapses; commonly paired with <code>shutdown()</code> for a clean-and-bounded exit.<br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">executor.shutdown();
if (!executor.awaitTermination(5, TimeUnit.SECONDS)) {
    executor.shutdownNow();   // force-stop if graceful shutdown took too long
}</pre>`
        },
        {
            content: `<h3>Why the Unbounded Executors Factories Are Discouraged</h3>
<code>Executors.newCachedThreadPool()</code> and <code>newFixedThreadPool()</code> (via their default queue) can hide resource exhaustion: <code>newCachedThreadPool()</code> has an effectively <b>unbounded thread count</b>, and <code>newFixedThreadPool()</code> uses an <b>unbounded work queue</b>, so a burst of tasks can silently pile up memory instead of failing fast.<br><br>
Modern guidance (Java's own documentation and Effective Java) recommends constructing <code>ThreadPoolExecutor</code> directly, with an explicit bounded queue and a rejection policy:<br>`,
            codeExamples: [
                `import java.util.concurrent.*;

public class BoundedPoolDemo {
    public static void main(String[] args) {
        ThreadPoolExecutor executor = new ThreadPoolExecutor(
            2,                                   // core pool size
            4,                                   // max pool size
            30, TimeUnit.SECONDS,                // idle thread keep-alive
            new ArrayBlockingQueue<>(10),        // bounded queue
            new ThreadPoolExecutor.CallerRunsPolicy() // when full
        );

        executor.submit(() -> System.out.println(
            "Task running on " + Thread.currentThread().getName()));
        executor.shutdown();
    }
}
// OUTPUT:
// Task running on pool-1-thread-1`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why use ExecutorService instead of raw Thread?</td><td>It reuses a bounded pool of threads instead of creating an expensive new OS thread per task</td></tr>
<tr class='text-center'><td>Runnable vs Callable?</td><td>Runnable's run() returns nothing and can't throw checked exceptions; Callable's call() returns a value and can throw checked exceptions</td></tr>
<tr class='text-center'><td>What does Future.get() do?</td><td>Blocks the calling thread until the async task's result is available (or rethrows its exception)</td></tr>
<tr class='text-center'><td>shutdown() vs shutdownNow()?</td><td>shutdown() lets in-flight tasks finish and rejects new ones; shutdownNow() tries to interrupt running tasks immediately and returns unstarted ones</td></tr>
<tr class='text-center'><td>Why avoid Executors.newCachedThreadPool() in production?</td><td>Its thread count is effectively unbounded, so a task burst can exhaust memory/OS threads instead of failing fast</td></tr>
<tr class='text-center'><td>What does invokeAll() return?</td><td>A List&lt;Future&lt;T&gt;&gt; in submission order, after blocking until every submitted task has completed</td></tr>
</table>`
        }
    ]
};
