import { Topic } from '../coreJava';

export const virtualThreads: Topic = {
                        id: 'virtual-threads',
                        name: 'Virtual Threads',
                        beginner: [
                            {
                                content: `<h3>Virtual Threads in Java 21</h3>
<h4>Introduction</h4>
<strong>Virtual Threads</strong> (Project Loom) are a major feature of Java 21 that introduces lightweight, JVM-managed threads. Unlike traditional platform threads (which map 1:1 to OS threads), virtual threads are cheap to create and can number in the millions, enabling massive concurrency.<br><br>

<h4>Key Features</h4>
• <strong>Lightweight</strong> — Virtual threads consume very little memory (~few KB vs ~1MB for platform threads)<br>
• <strong>JVM-managed</strong> — The JVM schedules virtual threads on a small pool of platform (carrier) threads<br>
• <strong>Massive scalability</strong> — Create millions of virtual threads without running out of resources<br>
• <strong>Same Thread API</strong> — Virtual threads implement java.lang.Thread, so existing code works<br>
• <strong>Blocking is cheap</strong> — When a virtual thread blocks (I/O, sleep), the carrier thread is freed<br><br>

<h4>Creating Virtual Threads</h4>
• <strong>Thread.ofVirtual().start(runnable)</strong> — Start a virtual thread<br>
• <strong>Thread.startVirtualThread(runnable)</strong> — Shorthand to start<br>
• <strong>Executors.newVirtualThreadPerTaskExecutor()</strong> — Executor for virtual threads`,
                                codeExamples: [
`// Virtual Threads — Basic Usage
public class VirtualThreadBasic {
    public static void main(String[] args) throws Exception {
        // Create and start a virtual thread
        Thread vThread = Thread.ofVirtual().start(() -> {
            System.out.println("Hello from virtual thread!");
            System.out.println("Thread: " + Thread.currentThread());
            System.out.println("Is virtual: " + Thread.currentThread().isVirtual());
        });
        vThread.join(); // wait for completion

        // Shorthand
        Thread.startVirtualThread(() -> {
            System.out.println("Quick virtual thread!");
        }).join();

        // Named virtual thread
        Thread named = Thread.ofVirtual()
            .name("my-virtual-thread")
            .start(() -> {
                System.out.println("Named: " + Thread.currentThread().getName());
            });
        named.join();

        // Creating many virtual threads — try this with platform threads!
        long start = System.currentTimeMillis();
        var threads = new java.util.ArrayList<Thread>();
        for (int i = 0; i < 100_000; i++) {
            int taskId = i;
            Thread t = Thread.ofVirtual().start(() -> {
                try { Thread.sleep(100); } catch (InterruptedException e) {}
            });
            threads.add(t);
        }
        for (Thread t : threads) { t.join(); }
        long duration = System.currentTimeMillis() - start;
        System.out.println("100,000 virtual threads completed in " + duration + "ms");
    }
}`
                                ]
                            }
                        ],
                        intermediate: [
                            {
                                content: `<h3>Virtual Threads — Intermediate Usage</h3>
<h4>Using with ExecutorService</h4>
The <strong>Executors.newVirtualThreadPerTaskExecutor()</strong> creates an executor that spawns a new virtual thread for each submitted task, combining the convenience of executors with virtual thread efficiency.<br><br>

<h4>Virtual Threads with I/O Operations</h4>
Virtual threads excel at I/O-bound workloads. When a virtual thread blocks on I/O, its carrier thread is released to run other virtual threads.<br><br>

<h4>Structured Concurrency (Preview)</h4>
Java 21 also previews <strong>StructuredTaskScope</strong> for managing groups of related virtual threads as a unit.<br><br>

<h4>Best Practices</h4>
• Use virtual threads for I/O-bound tasks (HTTP calls, database queries, file I/O)<br>
• Don't use virtual threads for CPU-bound tasks — use platform threads or ForkJoinPool<br>
• Avoid thread-local variables in virtual threads (use scoped values instead)<br>
• Don't pool virtual threads — create new ones as needed<br>
• Avoid synchronized blocks in virtual thread code (use ReentrantLock instead)`,
                                codeExamples: [
`// Virtual Threads — Intermediate Usage
import java.util.concurrent.*;
import java.util.List;
import java.util.ArrayList;

public class VirtualThreadIntermediate {
    // Simulated I/O operation
    static String fetchData(int id) {
        try {
            Thread.sleep(100); // simulate I/O delay
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        return "Data-" + id + " [" + Thread.currentThread() + "]";
    }

    public static void main(String[] args) throws Exception {
        // ExecutorService with virtual threads
        try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
            // Submit 1000 I/O tasks
            List<Future<String>> futures = new ArrayList<>();
            long start = System.currentTimeMillis();

            for (int i = 0; i < 1000; i++) {
                int id = i;
                futures.add(executor.submit(() -> fetchData(id)));
            }

            // Collect results
            List<String> results = new ArrayList<>();
            for (Future<String> future : futures) {
                results.add(future.get());
            }

            long duration = System.currentTimeMillis() - start;
            System.out.println("Fetched " + results.size() + " results in " + duration + "ms");
            System.out.println("First result: " + results.get(0));
            System.out.println("Last result: " + results.get(results.size() - 1));
        }

        // Compare with platform threads
        try (var platformExecutor = Executors.newFixedThreadPool(100)) {
            long start = System.currentTimeMillis();
            List<Future<String>> futures = new ArrayList<>();

            for (int i = 0; i < 1000; i++) {
                int id = i;
                futures.add(platformExecutor.submit(() -> fetchData(id)));
            }

            for (Future<String> f : futures) { f.get(); }
            long duration = System.currentTimeMillis() - start;
            System.out.println("Platform threads (100 pool): " + duration + "ms");
        }
    }
}`
                                ]
                            }
                        ],
                        expert: [
                            {
                                content: `<h3>Virtual Threads — Expert Deep Dive</h3>
<h4>Internal Architecture</h4>
• Virtual threads are scheduled on a <strong>ForkJoinPool</strong> of carrier threads (default: number of CPUs)<br>
• When a virtual thread blocks (I/O, sleep, lock), it is <strong>unmounted</strong> from the carrier thread<br>
• The carrier thread then picks up another virtual thread to run<br>
• When the blocking operation completes, the virtual thread is <strong>remounted</strong> on an available carrier<br>
• This is called <strong>continuation-based scheduling</strong><br><br>

<h4>Pinning</h4>
A virtual thread is <strong>pinned</strong> to its carrier thread when:<br>
• Inside a <strong>synchronized</strong> block/method (use ReentrantLock instead)<br>
• Executing a <strong>native method</strong> or <strong>foreign function</strong><br>
Pinning prevents the carrier from running other virtual threads, reducing throughput.<br><br>

<h4>Interview Questions</h4>
• <strong>Q: Virtual threads vs platform threads?</strong> — Virtual threads are JVM-managed, lightweight (KB not MB), designed for I/O-bound tasks at massive scale<br>
• <strong>Q: What is pinning?</strong> — When a virtual thread cannot be unmounted (e.g., in synchronized), blocking the carrier<br>
• <strong>Q: Should you pool virtual threads?</strong> — No, they are cheap to create. Pooling defeats their purpose<br>
• <strong>Q: Are virtual threads faster?</strong> — Not faster per-thread, but allow much higher concurrency by not wasting OS threads on blocking operations`,
                                codeExamples: [
`// Expert Virtual Threads patterns
import java.util.concurrent.*;
import java.util.concurrent.locks.ReentrantLock;

public class VirtualThreadExpert {
    // Use ReentrantLock instead of synchronized to avoid pinning
    private static final ReentrantLock lock = new ReentrantLock();
    private static int sharedCounter = 0;

    static void incrementSafely() {
        lock.lock();
        try {
            sharedCounter++;
        } finally {
            lock.unlock();
        }
    }

    // BAD: synchronized causes pinning!
    // static synchronized void incrementBad() { sharedCounter++; }

    public static void main(String[] args) throws Exception {
        // Massive concurrency demonstration
        int taskCount = 1_000_000;
        System.out.println("Starting " + taskCount + " virtual threads...");

        long start = System.currentTimeMillis();
        try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
            var latch = new CountDownLatch(taskCount);
            for (int i = 0; i < taskCount; i++) {
                executor.submit(() -> {
                    incrementSafely();
                    latch.countDown();
                });
            }
            latch.await();
        }
        long duration = System.currentTimeMillis() - start;

        System.out.println("Counter: " + sharedCounter);
        System.out.println("Duration: " + duration + "ms");
        System.out.println("Throughput: " + (taskCount * 1000L / duration) + " tasks/sec");

        // Checking virtual thread properties
        Thread vt = Thread.ofVirtual().name("probe").unstarted(() -> {});
        System.out.println("\\nVirtual thread properties:");
        System.out.println("Is virtual: " + vt.isVirtual());
        System.out.println("Is daemon: " + vt.isDaemon());  // always true for virtual
        System.out.println("Priority: " + vt.getPriority()); // always NORM_PRIORITY

        // Thread factory for virtual threads
        ThreadFactory factory = Thread.ofVirtual()
            .name("worker-", 0)  // worker-0, worker-1, etc.
            .factory();

        Thread t1 = factory.newThread(() ->
            System.out.println(Thread.currentThread().getName()));
        Thread t2 = factory.newThread(() ->
            System.out.println(Thread.currentThread().getName()));
        t1.start(); t2.start();
        t1.join(); t2.join();
    }
}`
                                ]
                            }
                        ]
};
