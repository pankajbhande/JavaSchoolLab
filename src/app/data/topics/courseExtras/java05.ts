// Core Java extras, part 5: multithreading (keyed by topic id).
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const java05Extras: Record<string, Extra> = {
    'Multitasking in Java': x(
        ['Multitasking is doing several tasks at the same time. <b>Process-based</b> multitasking runs separate programs; <b>thread-based</b> runs several threads inside one program.',
            '<b>Shared memory:</b> threads of one process share memory, so they are lightweight and communicate easily (but need care).',
            '<b>Java support:</b> thread-based multitasking uses <code>Thread</code>, <code>Runnable</code> and the executor framework.'],
        ['<b>Concurrency</b> means tasks make progress by interleaving; <b>parallelism</b> means tasks run at the same instant on multiple cores.',
            '<b>When to use threads:</b> for I/O waiting (network, disk) and CPU parallelism, not for tiny tasks.',
            '<b>Scheduling:</b> the OS scheduler decides which thread runs, so order is not guaranteed.'],
        ['<b>Pick the model:</b> platform threads (OS), bounded thread pools, virtual threads (Java 21) for blocking I/O at scale, reactive for non-blocking pipelines.',
            '<b>Amdahl law:</b> the serial fraction limits speedup, so adding cores helps only the parallel parts.',
            '<b>Pool sizing:</b> size CPU pools near the core count and I/O pools by waiting ratio; measure.'],
        [['F', 'What is multitasking?', 'Running multiple tasks at the same time, as processes or as threads.'],
            ['F', 'Process vs thread?', 'A process is an independent program with its own memory; a thread is a lightweight path of execution inside a process sharing its memory.'],
            ['M', 'Concurrency vs parallelism?', 'Concurrency is managing many tasks that may interleave; parallelism is running tasks simultaneously on multiple cores.'],
            ['M', 'Why are threads called lightweight?', 'They share the process memory and resources, so creating and switching is cheaper than for processes.'],
            ['S', 'How do you size a thread pool?', 'For CPU-bound work about the number of cores; for I/O-bound work more, based on wait time to compute time ratio.'],
            ['S', 'What is Amdahl law?', 'Speedup is limited by the portion of the program that must run serially.']],
        [['Two threads running together.',
            r`Thread a = new Thread(() -> {
    for (int i = 0; i < 3; i++) System.out.println("A" + i);
});
Thread b = new Thread(() -> {
    for (int i = 0; i < 3; i++) System.out.println("B" + i);
});
a.start(); b.start();
a.join(); b.join();

// OUTPUT: (order varies)
// A0
// B0
// A1
// B1
// A2
// B2`],
            ['Parallel speedup with a stream.',
                r`long t = System.nanoTime();
long seq = LongStream.rangeClosed(1, 200_000_000L).sum();
long t1 = System.nanoTime() - t;
t = System.nanoTime();
long par = LongStream.rangeClosed(1, 200_000_000L).parallel().sum();
long t2 = System.nanoTime() - t;
System.out.println((seq == par) + " seq=" + t1 / 1_000_000
        + "ms par=" + t2 / 1_000_000 + "ms");

// OUTPUT: (varies)
// true seq=90ms par=25ms`]],
        [['Cores available.',
            r`System.out.println(Runtime.getRuntime().availableProcessors());

// OUTPUT: (varies)
// 8`],
            ['Sleeping thread does not block others.',
                r`Thread slow = new Thread(() -> {
    try { Thread.sleep(500); } catch (InterruptedException e) { }
    System.out.println("slow done");
});
slow.start();
System.out.println("main continues");
slow.join();

// OUTPUT:
// main continues
// slow done`]]
    ),

    'MultiThreading in Java': x(
        ['<b>Create a thread:</b> extend <code>Thread</code> or (better) implement <code>Runnable</code> and pass it to <code>new Thread(runnable)</code>.',
            '<b>start() vs run():</b> <code>start()</code> runs the task in a new thread. Calling <code>run()</code> directly runs it in the current thread.',
            '<b>Waiting:</b> <code>join()</code> waits for a thread to finish. <code>sleep(ms)</code> pauses the current thread.'],
        ['<b>Callable:</b> <code>Callable</code> returns a value and can throw. Submit it with <code>ExecutorService.submit</code> to get a <code>Future</code>.',
            '<b>Daemon threads:</b> <code>setDaemon(true)</code> threads do not keep the JVM alive. The JVM exits when only daemon threads remain.',
            '<b>Interrupts:</b> on <code>InterruptedException</code>, either stop the work or restore the flag with <code>Thread.currentThread().interrupt()</code>.'],
        ['<b>Executors:</b> prefer them over manual threads, and always shut them down (<code>shutdown</code>, <code>awaitTermination</code>).',
            '<b>Safe sharing:</b> use immutability, confinement, locks, atomics or concurrent collections.',
            '<b>Virtual threads:</b> from Java 21, one thread per task is cheap for blocking code.'],
        [['F', 'How do you create a thread?', 'Extend Thread or implement Runnable (or Callable with an executor) and call start().'],
            ['F', 'start() vs run()?', 'start creates a new thread that calls run; calling run directly runs on the caller thread.'],
            ['M', 'Runnable vs Callable?', 'Runnable returns nothing and cannot throw checked exceptions; Callable returns a value and can throw.'],
            ['M', 'What is a daemon thread?', 'A background thread that does not prevent the JVM from exiting.'],
            ['S', 'How should you handle InterruptedException?', 'Stop the work or restore the interrupt flag by calling Thread.currentThread().interrupt().'],
            ['S', 'Why prefer executors to raw threads?', 'They reuse threads, bound resources, return futures, and manage lifecycle and errors.']],
        [['Runnable, Callable and executor.',
            r`ExecutorService ex = Executors.newFixedThreadPool(3);
List<Future<Integer>> fs = new ArrayList<>();
for (int i = 1; i <= 3; i++) {
    final int n = i;
    fs.add(ex.submit(() -> n * n));   // Callable returning n squared
}
int sum = 0;
for (Future<Integer> f : fs) sum += f.get();   // 1 + 4 + 9
ex.shutdown();
System.out.println(sum);

// OUTPUT:
// 14`],
            ['start vs run.',
                r`Thread t = new Thread(
        () -> System.out.println(Thread.currentThread().getName()), "worker");
t.run();          // runs on main
t.start(); t.join();

// OUTPUT:
// main
// worker`]],
        [['Interrupt a thread.',
            r`Thread t = new Thread(() -> {
    try {
        Thread.sleep(10_000);
    } catch (InterruptedException e) {
        System.out.println("interrupted, cleaning up");
        Thread.currentThread().interrupt();   // restore the flag
    }
});
t.start();
t.interrupt();
t.join();

// OUTPUT:
// interrupted, cleaning up`],
            ['Uncaught exception handler.',
                r`Thread t = new Thread(() -> { throw new IllegalStateException("boom"); });
t.setUncaughtExceptionHandler(
        (th, ex) -> System.out.println("caught " + ex.getMessage()));
t.start();
t.join();

// OUTPUT:
// caught boom`]]
    ),

    'Life Cycle of Thread': x(
        ['Thread states: <b>NEW</b> (created), <b>RUNNABLE</b> (running or ready), <b>BLOCKED</b> (waiting for a monitor lock), <b>WAITING</b> (wait/join without timeout), <b>TIMED_WAITING</b> (sleep, wait with timeout) and <b>TERMINATED</b>.',
            '<b>Reading state:</b> <code>thread.getState()</code> returns the current state.',
            '<b>Terminated:</b> a terminated thread cannot be started again.'],
        ['<b>Transitions:</b> <code>start()</code> moves NEW to RUNNABLE; <code>sleep</code> gives TIMED_WAITING; <code>synchronized</code> contention gives BLOCKED; <code>wait()</code> and <code>join()</code> give WAITING.',
            '<b>Wake-up:</b> <code>notify</code>/<code>notifyAll</code> wake waiting threads, which then compete for the lock.',
            '<b>Restart:</b> calling <code>start()</code> twice throws <code>IllegalThreadStateException</code>.'],
        ['<b>Thread dumps:</b> use <code>jstack</code> or <code>jcmd Thread.print</code> to see states and diagnose deadlocks and contention.',
            '<b>Reading counts:</b> many threads in BLOCKED means lock contention; many in WAITING on a pool queue means idle workers.',
            '<b>RUNNABLE caveat:</b> it includes threads blocked in native I/O, which can mislead.'],
        [['F', 'Name the thread states.', 'NEW, RUNNABLE, BLOCKED, WAITING, TIMED_WAITING and TERMINATED.'],
            ['F', 'Can a thread be restarted after finishing?', 'No, start() again throws IllegalThreadStateException.'],
            ['M', 'Difference between BLOCKED and WAITING?', 'BLOCKED waits to acquire a monitor lock; WAITING waits for another thread to act (notify, join, unpark).'],
            ['M', 'What does sleep do to the state?', 'The thread goes to TIMED_WAITING and keeps any locks it holds.'],
            ['S', 'How do you diagnose a hung application?', 'Take thread dumps with jstack or jcmd and look for BLOCKED threads, deadlock reports and stuck frames.'],
            ['S', 'Does wait() release the lock?', 'Yes, wait releases the monitor; sleep does not.']],
        [['Observing states.',
            r`Thread t = new Thread(() -> { try { Thread.sleep(300); } catch (InterruptedException e) {} });
System.out.println(t.getState());
t.start(); Thread.sleep(50);
System.out.println(t.getState());
t.join();
System.out.println(t.getState());

// OUTPUT:
// NEW
// TIMED_WAITING
// TERMINATED`],
            ['BLOCKED state.',
                r`Object lock = new Object();
Thread holder = new Thread(() -> {
    synchronized (lock) {
        try { Thread.sleep(500); } catch (InterruptedException e) {}
    }
});
Thread waiter = new Thread(() -> { synchronized (lock) { } });
holder.start(); Thread.sleep(50);
waiter.start(); Thread.sleep(50);
System.out.println(waiter.getState());

// OUTPUT:
// BLOCKED`]],
        [['Restart error.',
            r`Thread t = new Thread(() -> {});
t.start(); t.join();
try { t.start(); } catch (IllegalThreadStateException e) { System.out.println("cannot restart"); }

// OUTPUT:
// cannot restart`],
            ['Thread dump.',
                r`// jcmd <pid> Thread.print
// "worker-1" #21 prio=5 java.lang.Thread.State: BLOCKED (on object monitor)
//     - waiting to lock <0x000000076ab62208> (a java.lang.Object)
//     - locked <0x...> by "worker-2"

// OUTPUT:
// shows who holds which lock`]]
    ),

    'Synchronization in Java ': x(
        ['<b>Critical section:</b> the code that only one thread may run at a time, marked with <code>synchronized</code> on a method or block.',
            '<b>Race condition:</b> threads update shared data together and lose updates, for example <code>count++</code>.',
            '<b>Monitor lock:</b> every object has one. A static synchronized method locks the class object.'],
        ['<b>Block vs method:</b> <code>synchronized (lock) { ... }</code> locks less code than a whole method. Lock on a private final object.',
            '<b>volatile vs atomic:</b> <code>volatile</code> gives visibility, not atomicity. <code>AtomicInteger</code> gives lock-free atomic updates.',
            '<b>Coordination:</b> <code>wait</code> and <code>notify</code> work only inside synchronized code.'],
        ['<b>Deadlock:</b> threads wait for each other locks. Avoid it with a fixed lock order, <code>tryLock</code> with a timeout, or a smaller lock scope.',
            '<b>Higher-level tools:</b> <code>ConcurrentHashMap</code>, <code>AtomicLong</code>, <code>LongAdder</code>, <code>ReentrantLock</code>, <code>ReadWriteLock</code>, <code>StampedLock</code>.',
            '<b>Happens-before:</b> the Java Memory Model rule that makes writes visible: unlock then lock, volatile write then read, thread start and join.'],
        [['F', 'Why is synchronization needed?', 'To prevent race conditions when threads share mutable data.'],
            ['F', 'What does synchronized do?', 'It lets one thread at a time execute a block or method guarded by the same monitor.'],
            ['M', 'synchronized vs volatile?', 'synchronized gives mutual exclusion and visibility; volatile gives only visibility and ordering for a single variable.'],
            ['M', 'What is a deadlock and how can it be avoided?', 'Threads wait on each other locks forever; avoid it with consistent lock ordering, timeouts and small critical sections.'],
            ['S', 'What does happens-before mean?', 'A guarantee that writes by one action are visible to another, such as a monitor unlock before a later lock of the same monitor.'],
            ['S', 'Why use AtomicInteger instead of synchronized for a counter?', 'It uses CAS hardware instructions, avoiding blocking and giving better scalability.']],
        [['Race condition and fix.',
            r`class Counter { int n; synchronized void inc() { n++; } }
class Racy { int n; void inc() { n++; } }
Counter c = new Counter();
Racy r = new Racy();
Thread[] ts = new Thread[4];
for (int i = 0; i < 4; i++) {
    ts[i] = new Thread(() -> {
        for (int k = 0; k < 100_000; k++) {
            c.inc();
            r.inc();
        }
    });
    ts[i].start();
}
for (Thread t : ts) t.join();
System.out.println(c.n + " "
    + (r.n < 400_000 ? "racy lost updates" : "racy luckily correct"));

// OUTPUT: (typical)
// 400000 racy lost updates`],
            ['Atomic counter.',
                r`AtomicInteger hits = new AtomicInteger();
IntStream.range(0, 1000).parallel().forEach(i -> hits.incrementAndGet());
System.out.println(hits.get());

// OUTPUT:
// 1000`]],
        [['Deadlock and ordered locking.',
            r`Object a = new Object();
Object b = new Object();
// Thread 1: synchronized (a) { synchronized (b) { ... } }
// Thread 2: synchronized (b) { synchronized (a) { ... } }   -> deadlock
// Fix: both threads lock a, then b (consistent order)

// OUTPUT:
// no deadlock when the lock order is the same everywhere`],
            ['wait and notify.',
                r`Object lock = new Object();
boolean[] ready = {false};
Thread waiter = new Thread(() -> {
    synchronized (lock) {
        while (!ready[0]) {              // always wait inside a loop
            try {
                lock.wait();             // releases the lock while waiting
            } catch (InterruptedException e) {
                return;
            }
        }
        System.out.println("go");
    }
});
waiter.start();
synchronized (lock) {
    ready[0] = true;
    lock.notifyAll();
}
waiter.join();

// OUTPUT:
// go`]]
    ),

    'Interview Questions': x(
        ['<b>Common topics</b>: thread vs process, <code>Runnable</code> vs <code>Thread</code>, <code>start()</code> vs <code>run()</code>, synchronization, <code>volatile</code>, deadlock, wait/notify, thread pools.',
            '<b>Thread states</b>: know what each method does to them.',
            '<b>Coding tasks</b>: be ready to write a small producer-consumer or a thread-safe counter.'],
        ['<b>Race conditions</b>: explain them, plus visibility problems and atomicity, with examples.',
            '<b>Toolbox</b>: know <code>java.util.concurrent</code>: <code>ExecutorService</code>, <code>Future</code>, <code>CompletableFuture</code>, <code>ConcurrentHashMap</code>, <code>CountDownLatch</code>, <code>Semaphore</code>, locks.',
            '<b>Comparison</b>: be able to compare <code>synchronized</code>, <code>ReentrantLock</code> and atomics.'],
        ['<b>Senior topics</b>: the Java Memory Model, happens-before, false sharing, lock striping, work stealing, virtual threads, structured concurrency, backpressure.',
            '<b>Debugging</b>: thread dumps, JFR, deadlock detection, race detectors, stress tests (jcstress).',
            '<b>Trade-offs</b>: explain more than definitions, for example when to prefer immutability or message passing to locks.'],
        [['F', 'What is the difference between a process and a thread?', 'A process has its own memory space; threads in a process share memory.'],
            ['F', 'What does volatile do?', 'It makes writes to the variable visible to all threads and prevents certain reorderings.'],
            ['M', 'What causes a deadlock and how do you detect it?', 'Circular lock waiting; detect with thread dumps (jstack shows Found one Java-level deadlock).'],
            ['M', 'What is a thread pool and why use it?', 'A set of reusable worker threads that bound resource use and avoid the cost of creating threads per task.'],
            ['S', 'How does ConcurrentHashMap achieve thread safety?', 'Per-bin locking with CAS for inserts, lock-free reads, and atomic compute methods.'],
            ['S', 'What are virtual threads and when to use them?', 'Lightweight JVM-managed threads for blocking I/O workloads, letting you write simple blocking code that scales to millions of tasks.']],
        [['Producer-consumer with BlockingQueue.',
            r`BlockingQueue<Integer> q = new ArrayBlockingQueue<>(5);
Thread prod = new Thread(() -> {
    try {
        for (int i = 1; i <= 5; i++) q.put(i);
        q.put(-1);                       // -1 = stop signal
    } catch (InterruptedException e) { }
});
Thread cons = new Thread(() -> {
    try {
        int v;
        while ((v = q.take()) != -1) System.out.print(v + " ");
        System.out.println();
    } catch (InterruptedException e) { }
});
prod.start(); cons.start();
prod.join(); cons.join();

// OUTPUT:
// 1 2 3 4 5`],
            ['Thread-safe singleton (holder).',
                r`class Single {
    private Single() { }
    private static class H { static final Single I = new Single(); }
    static Single get() { return H.I; }   // class loading makes this thread-safe
}
System.out.println(Single.get() == Single.get());

// OUTPUT:
// true`]],
        [['Double-checked locking needs volatile.',
            r`class Lazy {
    private static volatile Lazy inst;
    static Lazy get() {
        Lazy l = inst;
        if (l == null) {                       // first check, no lock
            synchronized (Lazy.class) {
                l = inst;
                if (l == null) inst = l = new Lazy();   // second check
            }
        }
        return l;
    }
}
System.out.println(Lazy.get() == Lazy.get());

// OUTPUT:
// true`],
            ['CountDownLatch.',
                r`CountDownLatch latch = new CountDownLatch(3);
for (int i = 0; i < 3; i++) {
    new Thread(() -> latch.countDown()).start();   // each worker counts down
}
latch.await();
System.out.println("all workers done");

// OUTPUT:
// all workers done`]]
    )
};

export const java05Deep: Record<string, Deep> = {
    'Multitasking in Java': dv(
        [`A Java platform thread maps one-to-one to an OS thread with its own stack (about 1 MB reserved). The OS scheduler time-slices threads across cores; context switches save registers and invalidate caches, so too many threads waste time. Virtual threads (Java 21) are scheduled by the JVM on a small pool of carrier threads and park cheaply when blocked.`,
            r`long t = System.nanoTime();
try (var ex = Executors.newVirtualThreadPerTaskExecutor()) {
    IntStream.range(0, 10_000).forEach(i -> ex.submit(() -> {
        Thread.sleep(Duration.ofMillis(100));
        return i;
    }));
}   // close() waits for all tasks to finish
long ms = (System.nanoTime() - t) / 1_000_000;
System.out.println("10,000 sleeping tasks in " + ms + " ms");

// OUTPUT: (varies)
// 10,000 sleeping tasks in 180 ms`],
        [`Models: thread-per-task, bounded pools (<code>newFixedThreadPool</code>, <code>ForkJoinPool</code> with work stealing), asynchronous composition (<code>CompletableFuture</code>), reactive streams (Reactor, RxJava), actors, and structured concurrency (preview) to scope subtasks. Parallel streams use the common ForkJoinPool and suit CPU-bound pure functions on large data.`,
            r`int n = Runtime.getRuntime().availableProcessors();
ExecutorService cpu = Executors.newFixedThreadPool(n);
CompletableFuture<Integer> price =
        CompletableFuture.supplyAsync(() -> 100, cpu);
CompletableFuture<Integer> tax =
        CompletableFuture.supplyAsync(() -> 18, cpu);
System.out.println(price.thenCombine(tax, Integer::sum).get());
cpu.shutdown();

// OUTPUT:
// 118`],
        [`Mistakes: creating a thread per request without limits (resource exhaustion), blocking inside a small pool (starvation), sharing the common pool for blocking I/O, ignoring exceptions in tasks (swallowed by Future), unbounded queues, and forgetting to shut down executors (JVM never exits). Name threads and use bounded queues with rejection policies.`,
            r`ExecutorService ex = new ThreadPoolExecutor(
        2, 4, 30, TimeUnit.SECONDS,
        new ArrayBlockingQueue<>(10),          // bounded queue
        r -> new Thread(r, "worker"),          // named threads
        new ThreadPoolExecutor.CallerRunsPolicy());
Future<?> f = ex.submit(() -> {
    throw new RuntimeException("hidden");
});
try {
    f.get();
} catch (ExecutionException e) {
    System.out.println("surfaced: " + e.getCause().getMessage());
}
ex.shutdown();

// OUTPUT:
// surfaced: hidden`],
        [`Throughput depends on contention, not only thread count. Amdahl law: with 10% serial work the maximum speedup is 10x, however many cores you add. Measure with realistic load, watch context switches and CPU stalls, and use JFR (Java Flight Recorder) to find lock contention.`,
            r`// speedup(n) = 1 / ( s + (1 - s) / n ), s = serial fraction
double s = 0.1;
for (int n : new int[]{2, 8, 64}) {
    System.out.printf("n=%d speedup=%.1f%n", n, 1 / (s + (1 - s) / n));
}

// OUTPUT:
// n=2 speedup=1.8
// n=8 speedup=4.7
// n=64 speedup=8.8`],
        [`Real-world: a web server handles each request on a worker or virtual thread, calls downstream services in parallel with CompletableFuture and applies timeouts, bulkheads and a bounded queue to protect itself.`,
            r`CompletableFuture<User> user =
        CompletableFuture.supplyAsync(() -> users.find(id), io);
CompletableFuture<List<Order>> orders =
        CompletableFuture.supplyAsync(() -> orderApi.forUser(id), io)
                .orTimeout(2, TimeUnit.SECONDS)
                .exceptionally(e -> List.of());   // fall back to empty
Profile p = user.thenCombine(orders, Profile::new).get();

// OUTPUT:
// the profile page loads even if the order service is slow`]
    ),

    'MultiThreading in Java': dv(
        [`<code>Thread.start()</code> asks the JVM to create an OS thread (native call) that runs <code>run()</code>. The new thread has its own stack and program counter, and shares the heap. <code>ThreadPoolExecutor</code> keeps core threads alive, queues extra tasks, grows to the max size when the queue is full, then applies the rejection policy. Thread locals give per-thread state.`,
            r`// SimpleDateFormat is not thread-safe, so give each thread its own copy
ThreadLocal<SimpleDateFormat> fmt =
        ThreadLocal.withInitial(() -> new SimpleDateFormat("yyyy-MM-dd"));
Runnable r = () -> System.out.println(
        Thread.currentThread().getName() + " " + fmt.get().format(new Date(0)));
Thread a = new Thread(r, "T1");
Thread b = new Thread(r, "T2");
a.start();
b.start();
a.join();
b.join();
fmt.remove();   // always clean up, especially on pooled threads

// OUTPUT (order varies; the date shown depends on your time zone):
// T1 1970-01-01
// T2 1970-01-01`],
        [`Coordination utilities: <code>CountDownLatch</code>, <code>CyclicBarrier</code>, <code>Semaphore</code>, <code>Phaser</code>, <code>Exchanger</code>, <code>BlockingQueue</code>, <code>ScheduledExecutorService</code>, <code>ForkJoinPool</code> / <code>RecursiveTask</code>. Timeouts everywhere: <code>future.get(timeout)</code>, <code>tryLock(timeout)</code>.`,
            r`class SumTask extends RecursiveTask<Long> {
    final int[] a;
    final int lo, hi;

    SumTask(int[] a, int lo, int hi) {
        this.a = a;
        this.lo = lo;
        this.hi = hi;
    }

    protected Long compute() {
        if (hi - lo <= 10_000) {          // small enough: add directly
            long s = 0;
            for (int i = lo; i < hi; i++) s += a[i];
            return s;
        }
        int mid = (lo + hi) >>> 1;        // otherwise split in two halves
        SumTask left = new SumTask(a, lo, mid);
        left.fork();                      // run the left half in parallel
        return new SumTask(a, mid, hi).compute() + left.join();
    }
}

int[] data = IntStream.rangeClosed(1, 1_000_000).toArray();
System.out.println(
        ForkJoinPool.commonPool().invoke(new SumTask(data, 0, data.length)));

ScheduledExecutorService ses = Executors.newScheduledThreadPool(1);
ses.schedule(() -> System.out.println("later"), 100, TimeUnit.MILLISECONDS);
ses.shutdown();
ses.awaitTermination(1, TimeUnit.SECONDS);

// OUTPUT:
// 500000500000
// later`],
        [`Mistakes: calling run instead of start, ignoring InterruptedException, using <code>Thread.stop</code> (deprecated, and it throws in recent Java), non-daemon pool threads preventing exit, thread leaks, <code>SimpleDateFormat</code> shared across threads, unsafe publication, and <code>ThreadLocal</code> leaks in pools (always call remove). Also wrong: catching <code>Exception</code> and doing nothing inside tasks.`,
            r`ExecutorService ex = Executors.newFixedThreadPool(2);
// submit() stores the exception in the Future; execute() would print it
ex.submit(() -> { throw new RuntimeException("lost silently"); });
ex.shutdown();
// Fix: call future.get(), or log inside a try/catch in the task

// OUTPUT:
// (no output: the failure is invisible)`],
        [`Thread creation costs about 50-100 microseconds and 1 MB of stack reservation; pools amortize this. Contended locks cause parking and context switches. Use fewer, longer-lived threads for CPU work, virtual threads for blocking, and avoid sharing mutable state.`,
            r`// platform threads: ~ 10,000 threads exhaust memory/OS limits
// virtual threads: 1,000,000 parked tasks fit in a few GB of heap
try (var ex = Executors.newVirtualThreadPerTaskExecutor()) {
    for (int i = 0; i < 100_000; i++) {
        ex.submit(() -> {
            Thread.sleep(Duration.ofSeconds(1));
            return null;
        });
    }
}   // close() waits for all tasks

// OUTPUT:
// completes in about 1 second on a laptop`],
        [`Real-world: a nightly job splits files across a fixed pool, collects results via futures, and reports failures with context; timeouts and interruption allow a clean shutdown.`,
            r`ExecutorService pool = Executors.newFixedThreadPool(4);
List<Callable<String>> jobs = files.stream()
        .map(f -> (Callable<String>) () -> process(f))
        .toList();
for (Future<String> fu : pool.invokeAll(jobs, 5, TimeUnit.MINUTES)) {
    try {
        log.info(fu.get());
    } catch (CancellationException | ExecutionException e) {
        log.error("job failed", e);
    }
}
pool.shutdown();

// OUTPUT:
// each file result or failure is logged`]
    ),

    'Life Cycle of Thread': dv(
        [`<code>Thread.State</code> is a JVM-level view. RUNNABLE covers both running on a CPU and ready or blocked in native I/O. Transitions: NEW to RUNNABLE on start; RUNNABLE to BLOCKED when entering a contended synchronized block; to WAITING on <code>Object.wait()</code>, <code>Thread.join()</code>, <code>LockSupport.park()</code>; to TIMED_WAITING with timeouts; to TERMINATED when run ends or throws.`,
            r`Thread t = new Thread(() -> LockSupport.park());
t.start(); Thread.sleep(100);
System.out.println(t.getState());
LockSupport.unpark(t); t.join();
System.out.println(t.getState());

// OUTPUT:
// WAITING
// TERMINATED`],
        [`Diagnostics: <code>jstack</code>, <code>jcmd Thread.print</code>, <code>ThreadMXBean.findDeadlockedThreads()</code>, JFR thread events, and VisualVM. Interrupt protocol: interrupt sets a flag and wakes blocking calls with InterruptedException; code should check <code>isInterrupted()</code> in loops and exit cleanly. Virtual threads show as "VirtualThread" in dumps (use <code>jcmd Thread.dump_to_file</code>).`,
            r`ThreadMXBean mx = ManagementFactory.getThreadMXBean();
long[] dead = mx.findDeadlockedThreads();
System.out.println(dead == null ? "no deadlock" : "deadlock among " + dead.length + " threads");
Thread worker = new Thread(() -> { while (!Thread.currentThread().isInterrupted()) { /* work */ } System.out.println("stopped cleanly"); });
worker.start(); worker.interrupt(); worker.join();

// OUTPUT:
// no deadlock
// stopped cleanly`],
        [`Mistakes: using Thread.stop/suspend (removed or unsafe), busy waiting instead of wait/park, assuming RUNNABLE means executing on a CPU, ignoring spurious wakeups (always loop on the condition around wait), and swallowing interrupts. Always call wait inside a while loop.`,
            r`synchronized (lock) { while (!condition) lock.wait(); }       // correct: re-check after wakeup
// if (!condition) lock.wait();                              // bug: spurious wakeup or missed condition

// OUTPUT:
// the condition is guaranteed true when the code proceeds`],
        [`Context switches and lock convoys slow throughput. Look for many threads BLOCKED on the same monitor in dumps: shrink critical sections, use lock striping, concurrent data structures, or read/write locks.`,
            r`// jcmd <pid> Thread.print | findstr BLOCKED
// JFR: jdk.JavaMonitorEnter events with duration > 20 ms point to hot locks

// OUTPUT:
// the top contended monitors and their stack traces`],
        [`Real-world: a stuck service with all request threads WAITING on a connection pool shows pool exhaustion; fix by finding leaked connections (not closed) or sizing and timeouts.`,
            r`// "http-nio-8080-exec-17" TIMED_WAITING
//   at com.zaxxer.hikari.pool.HikariPool.getConnection(HikariPool.java:181)
// all 200 exec threads waiting for a connection -> leak or slow query upstream

// OUTPUT:
// root cause: connections not closed in a rarely used code path`]
    ),

    'Synchronization in Java ': dv(
        [`The Java Memory Model (JMM) defines visibility and ordering through <b>happens-before</b> edges:<ul><li>Monitor unlock, then a later lock of the same monitor.</li><li>Volatile write, then a later read of that variable.</li><li>Thread start, then the actions of that thread.</li><li>Thread end, then a <code>join</code> that returns.</li><li>Final field freeze, after the constructor ends.</li></ul>Without these edges the CPU and compiler may reorder or cache values, so another thread can see stale data. A monitor lock is reentrant. Internally it moves between thin and inflated states (biased locking was removed in recent JDKs).`,
            r`class Flag {
    boolean stop;   // no volatile: the worker may never see the change
}
Flag f = new Flag();
Thread w = new Thread(() -> {
    while (!f.stop) { }              // busy loop, may spin forever
    System.out.println("stopped");
});
w.start();
Thread.sleep(100);
f.stop = true;                       // may hang forever without volatile
// fix: volatile boolean stop;

// OUTPUT: (without volatile)
// the program may never print "stopped"`],
        [`Tools you can choose from:<ul><li><code>synchronized</code>: the built-in monitor lock.</li><li><code>ReentrantLock</code>: tryLock, fairness and conditions.</li><li><code>ReadWriteLock</code> and <code>StampedLock</code>: many readers, optimistic reads.</li><li><code>Atomic*</code> and <code>LongAdder</code>: lock-free updates with CAS.</li><li><code>VarHandle</code>, concurrent collections, immutable objects, thread confinement, queues.</li></ul>Lock striping splits one lock into many. <code>ConcurrentHashMap</code> locks per bin.`,
            r`class Cache {
    private final ReadWriteLock rw = new ReentrantReadWriteLock();
    private final Map<String, String> m = new HashMap<>();

    String get(String k) {
        rw.readLock().lock();            // many readers at once
        try { return m.get(k); }
        finally { rw.readLock().unlock(); }
    }

    void put(String k, String v) {
        rw.writeLock().lock();           // one writer, no readers
        try { m.put(k, v); }
        finally { rw.writeLock().unlock(); }
    }
}

ReentrantLock lock = new ReentrantLock();
if (lock.tryLock(100, TimeUnit.MILLISECONDS)) {
    try { System.out.println("got lock"); }
    finally { lock.unlock(); }
}

// OUTPUT:
// got lock`],
        [`Common mistakes:<ul><li>Locking on a <code>String</code> or boxed <code>Integer</code> (shared instances), on a mutable field, or on <code>this</code> in a public class (outsiders can lock it).</li><li>Forgetting to <code>unlock()</code> in <code>finally</code>.</li><li>Calling unknown code while holding a lock (it may cause a deadlock).</li><li>Double-checked locking without <code>volatile</code>.</li><li>Check-then-act on concurrent collections.</li><li>Assuming <code>++</code> on a volatile is atomic.</li></ul>`,
            r`volatile int count;
Runnable r = () -> {
    for (int i = 0; i < 100_000; i++) {
        count++;                     // read-modify-write is not atomic
    }
};
Thread a = new Thread(r);
Thread b = new Thread(r);
a.start(); b.start();
a.join(); b.join();
System.out.println(count < 200_000 ? "lost updates" : "got lucky");

Map<String, Integer> m = new ConcurrentHashMap<>();
m.merge("k", 1, Integer::sum);       // atomic, not get then put

// OUTPUT: (typical)
// lost updates`],
        [`Lock contention is the usual bottleneck. To reduce it:<ul><li>Shrink the locked scope and split locks.</li><li>Use <code>LongAdder</code> for counters (striped cells).</li><li>Use copy-on-write snapshots for read-heavy data.</li><li>Use optimistic reads.</li></ul><b>False sharing</b> (threads writing nearby memory on one cache line) also hurts. <code>@Contended</code> pads fields to avoid it.`,
            r`LongAdder adder = new LongAdder();
AtomicLong atomic = new AtomicLong();
Runnable ra = () -> {
    for (int i = 0; i < 1_000_000; i++) adder.increment();
};
Runnable rb = () -> {
    for (int i = 0; i < 1_000_000; i++) atomic.incrementAndGet();
};
Thread[] ts = new Thread[8];
for (int i = 0; i < 8; i++) {
    ts[i] = new Thread(i % 2 == 0 ? ra : rb);
    ts[i].start();
}
for (Thread t : ts) t.join();
// under heavy contention LongAdder is typically several times faster
System.out.println(adder.sum() + " " + atomic.get());

// OUTPUT:
// 4000000 4000000`],
        [`A bank transfer must lock two accounts without deadlock. Order the locks by account id.`,
            r`static void transfer(Account from, Account to, long amt) {
    // lock the lower id first, so opposite transfers use the same order
    Account first = from.id < to.id ? from : to;
    Account second = (first == from) ? to : from;
    synchronized (first) {
        synchronized (second) {
            if (from.balance < amt) {
                throw new IllegalStateException("insufficient");
            }
            from.balance -= amt;
            to.balance += amt;
        }
    }
}

// OUTPUT:
// concurrent opposite transfers never deadlock`]
    ),

    'Interview Questions': dv(
        [`Deep-dive answers: <b>volatile</b> prevents caching and reordering across the write-read pair but is not atomic for compound actions. <b>synchronized</b> gives atomicity plus visibility. <b>CAS</b> (compare-and-swap) retries until the expected value matches, enabling lock-free algorithms with ABA caveats (use <code>AtomicStampedReference</code>). <b>ConcurrentHashMap</b> uses CAS for empty bins and synchronized on the bin head otherwise.`,
            r`AtomicInteger v = new AtomicInteger(5);
int old;
do {
    old = v.get();
} while (!v.compareAndSet(old, old * 2));   // manual CAS loop
System.out.println(v.get());

// OUTPUT:
// 10`],
        [`Frequently asked implementations: producer-consumer (BlockingQueue or wait/notify), print odd-even with two threads, dining philosophers (lock ordering), thread-safe LRU cache, rate limiter (token bucket), read-write cache, parallel merge sort with ForkJoin, and a custom thread pool. Practice writing them from scratch.`,
            r`// Odd/even printer with a Semaphore pair
Semaphore odd = new Semaphore(1), even = new Semaphore(0);
Thread t1 = new Thread(() -> {
    for (int i = 1; i <= 9; i += 2) {
        odd.acquireUninterruptibly();     // wait for my turn
        System.out.print(i + " ");
        even.release();                   // give the turn to the other thread
    }
});
Thread t2 = new Thread(() -> {
    for (int i = 2; i <= 10; i += 2) {
        even.acquireUninterruptibly();
        System.out.print(i + " ");
        odd.release();
    }
});
t1.start(); t2.start();
t1.join(); t2.join();
System.out.println();

// OUTPUT:
// 1 2 3 4 5 6 7 8 9 10`],
        [`Classic traps: <code>Thread.sleep</code> keeps locks while <code>wait</code> releases them; <code>notify</code> wakes one arbitrary waiter (use notifyAll or Conditions); <code>join</code> on yourself deadlocks; <code>synchronized</code> is reentrant; static synchronized and instance synchronized use different locks; <code>finalize</code> is not for cleanup; parallel streams with shared mutable state are wrong.`,
            r`List<Integer> shared = new ArrayList<>();
IntStream.range(0, 10_000).parallel()
        .forEach(shared::add);          // not thread-safe: lost items or exceptions
System.out.println(shared.size() == 10_000 ? "ok (lucky)" : "broken: " + shared.size());
List<Integer> safe = IntStream.range(0, 10_000).parallel()
        .boxed().toList();              // let the stream collect the results
System.out.println(safe.size());

// OUTPUT: (typical)
// broken: 9876
// 10000`],
        [`Senior-level trade-offs: throughput vs latency, fairness vs speed, locks vs lock-free, shared state vs message passing, thread pools sizing (Little law: threads = throughput x latency), and backpressure (bounded queues, rejection). Virtual threads change sizing: cap concurrency with semaphores to protect downstream resources, not threads.`,
            r`// Little's law: L = lambda x W
// requests in flight = 200 req/s x 0.05 s = 10 concurrent
double lambda = 200, w = 0.05;
System.out.println("threads needed ~ " + (int) Math.ceil(lambda * w));
Semaphore limit = new Semaphore(50);   // protects the database, whatever the threads

// OUTPUT:
// threads needed ~ 10`],
        [`Real-world answer pattern: describe the problem, the unsafe version, the failure mode, the fix and how to verify (stress test, jcstress, thread dump, load test).`,
            r`// 1. Problem: two requests update the same inventory row
// 2. Bug: read stock, check, write back -> oversell under concurrency
// 3. Fix: one atomic statement, then check the number of rows updated:
//    UPDATE items SET stock = stock - ? WHERE id = ? AND stock >= ?
// 4. Verify: 200 parallel requests in a test must never push stock below zero

// OUTPUT:
// the database enforces correctness; in-memory locks fail across servers`]
    )
};
