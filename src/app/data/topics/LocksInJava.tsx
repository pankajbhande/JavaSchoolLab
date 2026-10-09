import { Topic } from '../coreJava';

export const locksInJava: Topic = {
    id: 'locks-in-java',
    name: 'Locks in Java',

    beginner: [
        {
            content: `<h4>Limitations of the synchronized Keyword</h4>
<p><code>synchronized</code> (covered in Synchronization) is simple but rigid:</p>
<ul>
<li>You <b>cannot try to acquire</b> the lock with a timeout. A thread either waits forever or gets it immediately.</li>
<li>You <b>cannot interrupt</b> a thread that is blocked waiting to enter a synchronized block.</li>
<li>There is <b>no fairness policy</b>. The JVM does not guarantee waiting threads are served in arrival order.</li>
<li>Each monitor has only <b>one implicit condition</b> (via <code>wait()</code>/<code>notify()</code>). You cannot have separate wait-sets for different conditions.</li>
</ul>
<p><code>java.util.concurrent.locks</code> provides the <code>Lock</code> interface and its implementations to address exactly these gaps.</p>`
        },
        {
            content: `<h4>ReentrantLock — The Explicit Alternative to synchronized</h4>
<p><code>ReentrantLock</code> implements <code>Lock</code> and behaves like <code>synchronized</code> (a thread can re-acquire a lock it already holds, hence "reentrant") but with explicit control:</p>
<ul>
<li><code>lock()</code> acquires the lock, blocking if necessary.</li>
<li><code>unlock()</code> releases it. It <b>must</b> be called in a <code>finally</code> block, because nothing releases the lock automatically as a synchronized block does.</li>
</ul>`,
            codeExamples: [
                `import java.util.concurrent.locks.ReentrantLock;

public class ReentrantLockDemo {
    private static final ReentrantLock lock = new ReentrantLock();
    private static int counter = 0;

    public static void increment() {
        lock.lock();
        try {
            counter++;
        } finally {
            lock.unlock(); // mandatory - always release, even if an exception occurs
        }
    }

    public static void main(String[] args) throws InterruptedException {
        Runnable task = () -> {
            for (int i = 0; i < 1000; i++) increment();
        };

        Thread t1 = new Thread(task);
        Thread t2 = new Thread(task);
        t1.start(); t2.start();
        t1.join(); t2.join();

        System.out.println("Counter: " + counter);
    }
}
// OUTPUT:
// Counter: 2000`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>tryLock() — Avoiding a Deadlock synchronized Cannot Avoid</h3>
<p><code>tryLock()</code> attempts to acquire the lock and returns <code>false</code> at once if it is unavailable, instead of blocking forever. <code>tryLock(timeout, unit)</code> waits only up to a limit. This lets a thread <b>back off</b> and retry instead of deadlocking, which plain <code>synchronized</code> cannot do.</p>`,
            codeExamples: [
                `import java.util.concurrent.locks.ReentrantLock;
import java.util.concurrent.TimeUnit;

public class TryLockDemo {
    private static final ReentrantLock lockA = new ReentrantLock();
    private static final ReentrantLock lockB = new ReentrantLock();

    static void transfer() {
        try {
            if (lockA.tryLock(200, TimeUnit.MILLISECONDS)) {
                try {
                    if (lockB.tryLock(200, TimeUnit.MILLISECONDS)) {
                        try {
                            System.out.println("Acquired both locks - transferring");
                        } finally {
                            lockB.unlock();
                        }
                    } else {
                        System.out.println("Could not get lockB - backing off instead of deadlocking");
                    }
                } finally {
                    lockA.unlock();
                }
            }
        } catch (InterruptedException ignored) {}
    }

    public static void main(String[] args) {
        transfer();
    }
}
// OUTPUT:
// Acquired both locks - transferring`
            ]
        },
        {
            content: `<h3>Fairness, isLocked() and getHoldCount()</h3>
<ul>
<li><code>new ReentrantLock(true)</code> enables a <b>fair</b> policy: the longest-waiting thread gets the lock first (slower, because of extra bookkeeping).</li>
<li><code>isLocked()</code> reports whether any thread currently holds the lock.</li>
<li><code>getHoldCount()</code> returns how many times the <b>current thread</b> has acquired the lock (it grows on each re-entry).</li>
</ul>`,
            codeExamples: [
                `import java.util.concurrent.locks.ReentrantLock;

public class ReentrancyDemo {
    static final ReentrantLock lock = new ReentrantLock();

    static void outer() {
        lock.lock();
        try {
            System.out.println("Hold count in outer(): " + lock.getHoldCount());
            inner();
        } finally {
            lock.unlock();
        }
    }

    static void inner() {
        lock.lock(); // same thread re-acquiring - allowed because it's reentrant
        try {
            System.out.println("Hold count in inner(): " + lock.getHoldCount());
        } finally {
            lock.unlock();
        }
    }

    public static void main(String[] args) {
        outer();
    }
}
// OUTPUT:
// Hold count in outer(): 1
// Hold count in inner(): 2`
            ]
        },
        {
            content: `<h3>ReadWriteLock — Many Readers, One Writer</h3>
<p><code>ReentrantReadWriteLock</code> exposes two locks from one object: <code>readLock()</code> and <code>writeLock()</code>.</p>
<ul>
<li>Many threads can hold the <b>read lock</b> at the same time, as long as no thread holds the write lock.</li>
<li>The <b>write lock</b> is exclusive. While it is held, no other thread can hold the read or write lock.</li>
</ul>
<p>This is a big win for <b>read-heavy</b> workloads. A single exclusive lock (like plain synchronized) forces even simple reads to take turns.</p>`,
            codeExamples: [
                `import java.util.concurrent.locks.ReentrantReadWriteLock;

public class ReadWriteLockDemo {
    private static final ReentrantReadWriteLock rwLock = new ReentrantReadWriteLock();
    private static int sharedValue = 0;

    static int read() {
        rwLock.readLock().lock();
        try {
            return sharedValue;
        } finally {
            rwLock.readLock().unlock();
        }
    }

    static void write(int value) {
        rwLock.writeLock().lock();
        try {
            sharedValue = value;
        } finally {
            rwLock.writeLock().unlock();
        }
    }

    public static void main(String[] args) {
        write(42);
        System.out.println("Read value: " + read());
    }
}
// OUTPUT:
// Read value: 42`
            ]
        },
        {
            content: `<h3>Condition — Multiple Wait-Sets Per Lock</h3>
<p>A <code>synchronized</code> monitor gives you exactly one implicit wait-set (<code>wait()</code>/<code>notify()</code>). A <code>Lock</code> can create <b>multiple</b> <code>Condition</code> objects via <code>newCondition()</code>, each with its own wait-set. This helps when different events should wake different threads, for example a bounded buffer with a "not full" and a "not empty" condition.</p>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Lock lock = new ReentrantLock();
Condition notFull  = lock.newCondition();
Condition notEmpty = lock.newCondition();
// producer awaits notFull, signals notEmpty
// consumer awaits notEmpty, signals notFull</pre>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why use ReentrantLock instead of synchronized?</td><td>It supports tryLock() with timeout, interruptible waiting, fairness policies, and multiple Condition wait-sets - none of which synchronized offers</td></tr>
<tr class='text-center'><td>What must you always do after lock.lock()?</td><td>Wrap the critical section in try/finally and call unlock() in finally - there's no automatic release like a synchronized block gets</td></tr>
<tr class='text-center'><td>How does tryLock() help avoid deadlock?</td><td>It returns immediately (or after a timeout) instead of blocking forever, letting a thread back off and retry rather than wait indefinitely for a lock another thread holds</td></tr>
<tr class='text-center'><td>What does ReadWriteLock optimize for?</td><td>Read-heavy workloads - multiple readers can hold the read lock concurrently, while the write lock stays exclusive</td></tr>
<tr class='text-center'><td>What replaces wait()/notify() when using explicit locks?</td><td>Condition objects created via lock.newCondition(), which support multiple independent wait-sets per lock</td></tr>
</table>`
        }
    ]
};
