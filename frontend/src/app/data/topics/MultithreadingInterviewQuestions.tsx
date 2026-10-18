import { Topic } from '../coreJava';

export const multithreadingInterviewQuestions: Topic = {
                        id: `Interview Questions`,
                        name: `Interview Questions`,
                        beginner: [
                            {
                                content: `
<h4>1. What is multithreading in Java?</h4>
<ul>
<li>Multithreading means running several threads at the same time to keep the CPU busy.</li>
<li>It lets one program do many operations concurrently.</li>
</ul>

<h4>2. How do you create a thread in Java?</h4>
<p>There are two main ways.</p>
<ol>
<li>Extend the <code>Thread</code> class:</li>
</ol>
<pre><code>class MyThread extends Thread {
    public void run() {
        System.out.println("Thread is running");
    }
}
MyThread t1 = new MyThread();
t1.start();</code></pre>
<ol start="2">
<li>Implement the <code>Runnable</code> interface:</li>
</ol>
<pre><code>class MyRunnable implements Runnable {
    public void run() {
        System.out.println("Thread is running");
    }
}
Thread t1 = new Thread(new MyRunnable());
t1.start();</code></pre>

<h4>3. What is the difference between start() and run()?</h4>
<ul>
<li><code>start()</code> creates a new thread and runs <code>run()</code> in that new thread.</li>
<li>Calling <code>run()</code> directly creates no thread. It runs in the current thread.</li>
</ul>

<h4>4. What are the states of a thread in Java?</h4>
<ul>
<li><b>New</b>: the thread is created but not yet started.</li>
<li><b>Runnable</b>: the thread is ready to run and waits for CPU time.</li>
<li><b>Blocked</b>: the thread waits for a monitor lock.</li>
<li><b>Waiting</b>: the thread waits indefinitely for another thread to act.</li>
<li><b>Timed Waiting</b>: the thread waits for another thread for up to a given time.</li>
<li><b>Terminated</b>: the thread has finished.</li>
</ul>
                `
                            }
                        ],
                        intermediate: [
                            {
                                content: `<h4>1. What is synchronization in Java?</h4>
<ul>
<li>Synchronization stops two or more threads from running a critical section (shared code) at the same time.</li>
<li>It prevents thread interference and memory consistency errors.</li>
</ul>

<h4>2. What is a deadlock in Java?</h4>
<ul>
<li>A deadlock is when two or more threads are blocked forever, each waiting for the other.</li>
<li>It usually happens when two threads need the same two locks in opposite order.</li>
</ul>

<h4>3. How can you avoid deadlock in Java?</h4>
<ul>
<li>Avoid nested locks.</li>
<li>Use a timeout while waiting for locks.</li>
<li>Use a lock ordering (lock hierarchy).</li>
</ul>

<h4>4. What is the difference between wait() and sleep()?</h4>
<ul>
<li><code>wait()</code> releases the lock on the object and waits until another thread calls <code>notify()</code> or <code>notifyAll()</code> on it.</li>
<li><code>sleep()</code> pauses the current thread for a given time but keeps the lock.</li>
</ul>

<h4>5. What is the volatile keyword in Java?</h4>
<ul>
<li><code>volatile</code> marks a variable that different threads may change.</li>
<li>Every read comes from main memory, not from a thread-local cache.</li>
</ul>

<h4>6. What is the ThreadLocal class in Java?</h4>
<ul>
<li><code>ThreadLocal</code> provides thread-local variables.</li>
<li>Each thread that uses such a variable gets its own independently initialized copy.</li>
</ul>`
                            }
                        ],

                        expert: [
                            {
                                content: `<h3>Synchronization &amp; Locks</h3>
<p>Every Java object has an intrinsic lock (also called a monitor). <code>synchronized</code> is built on this monitor. Knowing exactly what it locks is a favourite interview trap.</p>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What does the <code>synchronized</code> keyword actually lock?</td><td>It acquires the intrinsic lock (monitor) of an object. For a <code>synchronized</code> instance method the lock is <code>this</code>. For a <code>synchronized</code> static method it is the <code>Class</code> object. For a <code>synchronized(obj)</code> block it is the object you pass in</td></tr>
<tr class='text-center'><td>Difference between synchronizing a method and a block?</td><td>A synchronized method holds the lock for the whole method, always on a fixed object (this or Class). A synchronized block guards only the critical section and lets you choose ANY object as the lock. It is more fine-grained and usually faster</td></tr>
<tr class='text-center'><td>Can two threads run two different synchronized methods on the SAME object at the same time?</td><td>No. Both methods use the same monitor (this), and only one thread can hold it at a time, whichever method it calls</td></tr>
<tr class='text-center'><td>Is a static synchronized method blocked by a synchronized instance method?</td><td>No. The static method locks the Class object and the instance method locks <code>this</code>. They are different monitors, so both can run at the same time</td></tr>
<tr class='text-center'><td>Is <code>synchronized</code> reentrant in Java?</td><td>Yes. A thread that already holds a monitor can take it again, for example by calling another synchronized method on the same object, without blocking itself</td></tr>
</table>`,
                                codeExamples: [
                                    `public class SyncMechanicsDemo {
    // Instance method - locks "this"
    public synchronized void instanceWork() {
        System.out.println(Thread.currentThread().getName()
            + " in instanceWork (locked on 'this')");
    }

    // Static method - locks SyncMechanicsDemo.class, NOT "this"
    public static synchronized void staticWork() {
        System.out.println(Thread.currentThread().getName()
            + " in staticWork (locked on class object)");
    }

    // Block - locks a chosen object, only the critical section is guarded
    private final Object lockObj = new Object();
    public void blockWork() {
        System.out.println(Thread.currentThread().getName() + " unguarded work");
        synchronized (lockObj) {
            System.out.println(Thread.currentThread().getName() + " in block");
        }
    }

    public static void main(String[] args) throws InterruptedException {
        SyncMechanicsDemo demo = new SyncMechanicsDemo();
        Thread t1 = new Thread(demo::instanceWork, "T1");
        Thread t2 = new Thread(SyncMechanicsDemo::staticWork, "T2");
        t1.start();
        t2.start();
        t1.join();
        t2.join();
    }
}

// OUTPUT (the two lines may swap order: different monitors, so they run together):
// T1 in instanceWork (locked on 'this')
// T2 in staticWork (locked on class object)`
                                ]
                            },
                            {
                                content: `<h3>volatile - Visibility, Not Atomicity</h3>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What guarantee does <code>volatile</code> actually give?</td><td>Visibility. Every read of a volatile variable comes from main memory and every write goes to main memory at once, so all threads see the latest value. It also stops the compiler and JIT from reordering that variable's reads and writes</td></tr>
<tr class='text-center'><td>Does <code>volatile</code> make an operation atomic?</td><td>No. <code>count++</code> on a <code>volatile int</code> is still three steps (read, add, write). Two threads can read the same value before either writes, so an update is lost. volatile fixes stale reads, not compound operations</td></tr>
<tr class='text-center'><td>When is <code>volatile</code> enough on its own?</td><td>When one thread writes (or writes do not depend on the previous value) and others only read. Example: a boolean stop flag that ends a worker loop</td></tr>
<tr class='text-center'><td>volatile vs synchronized: what is the trade-off?</td><td>volatile is cheaper (no locking, no blocking) but covers visibility of one variable only. synchronized gives visibility AND atomicity for a whole critical section, but it blocks other threads</td></tr>
</table>`,
                                codeExamples: [
                                    `public class VolatileFlagDemo {
    // safe: single writer, flag-style read
    private static volatile boolean running = true;

    public static void main(String[] args) throws InterruptedException {
        Thread worker = new Thread(() -> {
            int iterations = 0;
            while (running) {
                iterations++;
            }
            System.out.println("Worker stopped. iterations > 0: " + (iterations > 0));
        });
        worker.start();
        Thread.sleep(100);
        running = false; // visible to the worker because of volatile
        worker.join();
        System.out.println("Main thread finished");
    }
}

// OUTPUT (the count varies, but the worker stops promptly):
// Worker stopped. iterations > 0: true
// Main thread finished
//
// NOTE: with a plain (non-volatile) boolean, the worker might cache the value
// and never see the update, looping forever.`
                                ]
                            },
                            {
                                content: `<h3>Deadlock &amp; Race Conditions</h3>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What are the 4 classic conditions for deadlock?</td><td>Mutual exclusion (a resource is held by one thread only). Hold and wait (a thread holds one lock while waiting for another). No preemption (locks cannot be taken away by force). Circular wait (a cycle of threads, each waiting for the next one's lock)</td></tr>
<tr class='text-center'><td>How do you avoid deadlock in practice?</td><td>Always take locks in the same global order. Use <code>tryLock(timeout)</code> from <code>java.util.concurrent.locks.Lock</code> instead of blocking forever. Keep nested locks few and short. Or use one coarser lock instead of several fine-grained ones</td></tr>
<tr class='text-center'><td>What is a race condition?</td><td>A bug where the result depends on the timing of two or more threads that use shared mutable state without proper synchronization</td></tr>
<tr class='text-center'><td>Why does <code>count++</code> lose updates under concurrency?</td><td>It is three separate steps: read count, add 1, write it back. Threads can interleave between the steps, so two threads that read the same value overwrite each other's increment</td></tr>
<tr class='text-center'><td>How do you fix a lost-update race?</td><td>Wrap the read-modify-write in a synchronized block or method, or use a lock-free class such as <code>AtomicInteger</code>, whose <code>incrementAndGet()</code> is atomic through CAS (compare-and-swap)</td></tr>
</table>`,
                                codeExamples: [
                                    `// DEADLOCK DEMO - do not run as-is, it hangs forever.
// Thread-1 locks lockA then lockB; Thread-2 locks lockB then lockA.
public class DeadlockDemo {
    private static final Object lockA = new Object();
    private static final Object lockB = new Object();

    public static void main(String[] args) {
        Thread t1 = new Thread(() -> {
            synchronized (lockA) {
                System.out.println("Thread-1: holding lockA, waiting for lockB...");
                try { Thread.sleep(50); } catch (InterruptedException ignored) {}
                synchronized (lockB) {
                    System.out.println("Thread-1: acquired both locks");
                }
            }
        }, "Thread-1");

        Thread t2 = new Thread(() -> {
            synchronized (lockB) {
                System.out.println("Thread-2: holding lockB, waiting for lockA...");
                try { Thread.sleep(50); } catch (InterruptedException ignored) {}
                synchronized (lockA) {
                    System.out.println("Thread-2: acquired both locks");
                }
            }
        }, "Thread-2");

        t1.start();
        t2.start();
        // HANGS: each thread holds one lock and waits for the other one.
    }
}
// FIX: take the locks in the SAME order in every thread (lockA, then lockB).
// That breaks the circular wait.

// OUTPUT (then the program hangs):
// Thread-1: holding lockA, waiting for lockB...
// Thread-2: holding lockB, waiting for lockA...`,
                                    `// RACE CONDITION: lost updates vs synchronized / AtomicInteger
import java.util.concurrent.atomic.AtomicInteger;

public class RaceConditionDemo {
    private static int unsafeCounter = 0;   // plain int - NOT thread-safe
    private static int safeCounter = 0;     // guarded by synchronized
    private static final AtomicInteger atomicCounter = new AtomicInteger(0);

    private static synchronized void incrementSafe() {
        safeCounter++;
    }

    public static void main(String[] args) throws InterruptedException {
        Runnable task = () -> {
            for (int i = 0; i < 1000; i++) {
                unsafeCounter++;                 // race: not atomic
                incrementSafe();                 // fixed with synchronized
                atomicCounter.incrementAndGet(); // fixed with CAS
            }
        };

        Thread t1 = new Thread(task);
        Thread t2 = new Thread(task);
        t1.start();
        t2.start();
        t1.join();
        t2.join();

        System.out.println("unsafeCounter (expected 2000): " + unsafeCounter);
        System.out.println("safeCounter (synchronized): " + safeCounter);
        System.out.println("atomicCounter (AtomicInteger): " + atomicCounter.get());
    }
}

// OUTPUT (unsafeCounter varies and is often below 2000; the other two are always 2000):
// unsafeCounter (expected 2000): 1847
// safeCounter (synchronized): 2000
// atomicCounter (AtomicInteger): 2000`
                                ]
                            },
                            {
                                content: `<h3>Thread Coordination - wait(), notify(), notifyAll()</h3>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why must <code>wait()</code> and <code>notify()</code> be called inside a synchronized block?</td><td>They work on the object's monitor, so the thread must own it. <code>wait()</code> releases the monitor while the thread is parked. <code>notify()</code> and <code>notifyAll()</code> wake a waiter, which must still re-take the monitor before it continues. Calling them without the lock throws <code>IllegalMonitorStateException</code></td></tr>
<tr class='text-center'><td>What exactly happens when a thread calls <code>wait()</code>?</td><td>It releases the monitor and enters the WAITING state. It stays parked until another thread calls <code>notify()</code> or <code>notifyAll()</code> on the same object, it is interrupted, or the timeout given to <code>wait(ms)</code> ends</td></tr>
<tr class='text-center'><td>notify() vs notifyAll(): which one when?</td><td><code>notify()</code> wakes one arbitrary waiting thread. Use it only when all waiters are interchangeable. <code>notifyAll()</code> wakes every waiter, and each re-checks its condition. It is the safer default and avoids lost-wakeup bugs when waiters wait for different reasons</td></tr>
<tr class='text-center'><td>Why check the wait condition in a while loop, not an if?</td><td>A thread can wake up spuriously, or be notified when the condition is not true yet (another thread got there first). The loop re-checks the condition and waits again if needed</td></tr>
</table>`,
                                codeExamples: [
                                    `import java.util.LinkedList;
import java.util.Queue;

// Classic producer-consumer using wait()/notifyAll()
public class ProducerConsumerDemo {
    private static final Queue<Integer> buffer = new LinkedList<>();
    private static final int CAPACITY = 3;
    private static final Object lock = new Object();

    public static void main(String[] args) throws InterruptedException {
        Thread producer = new Thread(() -> {
            for (int i = 1; i <= 5; i++) {
                synchronized (lock) {
                    while (buffer.size() == CAPACITY) {
                        try { lock.wait(); } catch (InterruptedException ignored) {}
                    }
                    buffer.add(i);
                    System.out.println("Produced: " + i);
                    lock.notifyAll(); // wake a waiting consumer
                }
            }
        }, "Producer");

        Thread consumer = new Thread(() -> {
            for (int i = 1; i <= 5; i++) {
                synchronized (lock) {
                    while (buffer.isEmpty()) {
                        try { lock.wait(); } catch (InterruptedException ignored) {}
                    }
                    int value = buffer.poll();
                    System.out.println("Consumed: " + value);
                    lock.notifyAll(); // wake a waiting producer
                }
            }
        }, "Consumer");

        producer.start();
        consumer.start();
        producer.join();
        consumer.join();
    }
}

// OUTPUT (the interleaving of lines can vary; no item is lost or duplicated):
// Produced: 1
// Consumed: 1
// Produced: 2
// Consumed: 2
// Produced: 3
// Consumed: 3
// Produced: 4
// Consumed: 4
// Produced: 5
// Consumed: 5`
                                ]
                            },
                            {
                                content: `<h3>Concurrency Utilities - What Modern Code Prefers</h3>
<p>Hand-written <code>synchronized</code>, <code>wait</code> and <code>notify</code> code is error-prone: it is easy to deadlock or forget a notify. The <code>java.util.concurrent</code> package (added in Java 5) offers tested, higher-level building blocks that production code should use first.</p>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What does <code>ExecutorService</code> give you over creating <code>Thread</code> objects yourself?</td><td>A managed, reusable pool of worker threads with task queuing, <code>submit()</code> and <code>execute()</code>, results through <code>Future</code>, and controlled shutdown. It avoids the cost and unbounded growth of one new thread per task</td></tr>
<tr class='text-center'><td>Why prefer <code>ConcurrentHashMap</code> over a synchronized <code>HashMap</code>?</td><td>It locks only part of the map, so threads can read and write different bins at the same time. Java 7 used segment locks; Java 8 uses CAS plus <code>synchronized</code> on the bin head. This gives far better throughput than one global lock from <code>Collections.synchronizedMap()</code></td></tr>
<tr class='text-center'><td>Why is <code>AtomicInteger</code> often faster than <code>synchronized</code> for a counter?</td><td>It uses CAS (compare-and-swap), a lock-free hardware instruction. Threads never block on a monitor; they just retry if another thread changed the value first. Under contention this scales better than locking</td></tr>
<tr class='text-center'><td>What is the rule of thumb for choosing an approach?</td><td>Use the highest-level tool that fits. First <code>java.util.concurrent</code> collections, atomics and executors. Then explicit <code>Lock</code> objects (for <code>tryLock</code>, fairness or several conditions). Raw <code>synchronized</code>, <code>wait</code> and <code>notify</code> come last</td></tr>
</table>`
                            }
                        ]
                    };
