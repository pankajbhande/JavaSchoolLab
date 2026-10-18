import { Topic } from '../coreJava';
import lifecycle from '../../../assets/lifecycle.png';
import thread from '../../../assets/thread.png';

export const lifeCycleOfThread: Topic = {
                        id: `Life Cycle of Thread`,
                        name: `Life Cycle of Thread`,
                        beginner: [
                            {
                                content: `<h3>What is a Thread "State"?</h3>
• A thread does not run continuously from birth to death - at every moment it is in exactly one of a fixed set of states. <br>
• Java models this with the enum <code>Thread.State</code>, which has 6 values: <code>NEW</code>, <code>RUNNABLE</code>, <code>BLOCKED</code>, <code>WAITING</code>, <code>TIMED_WAITING</code>, <code>TERMINATED</code>. <br>
• You can check any thread's current state by calling <code>thread.getState()</code>. <br><br>

<img src="${lifecycle}" alt="Thread Lifecycle" class="d-block mx-auto" style="height:280px" /><br>

We will look at the 3 simplest states first - NEW, RUNNABLE, and TERMINATED - then go deeper into BLOCKED, WAITING, and TIMED_WAITING in the Expert section.<br>`
                            },
                            {
                                content: `<h4>1. NEW State</h4>
• A thread is in the <code>NEW</code> state right after it is created with <code>new Thread(...)</code>, but before <code>start()</code> has been called. <br>
• In this state the thread exists as an object only - no thread of execution has actually started at the OS level yet. <br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">new Thread(task)
      |
      v
  +-------+
  |  NEW  |   <-- object created, start() NOT called yet
  +-------+</pre>`,
                                codeExamples: [`public class NewStateDemo {
    public static void main(String[] args) {
        Thread t = new Thread(() -> System.out.println("Running"));
        System.out.println("State before start(): " + t.getState());
    }
}
// OUTPUT:
// State before start(): NEW`]
                            },
                            {
                                content: `<h4>2. RUNNABLE State</h4>
• Once <code>start()</code> is called, the thread moves to <code>RUNNABLE</code>. <br>
• RUNNABLE means the thread is eligible to run - it may actually be executing on a CPU core right now, or it may just be waiting its turn from the thread scheduler. Java does not distinguish these two as separate states. <br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">  +-------+  start()   +-----------+
  |  NEW  | ---------> | RUNNABLE  |   <-- eligible to run / running
  +-------+            +-----------+</pre>`,
                                codeExamples: [`public class RunnableStateDemo {
    public static void main(String[] args) throws InterruptedException {
        Thread t = new Thread(() -> {
            for (int i = 0; i < 1000; i++) { /* busy work */ }
        });
        t.start();
        System.out.println("State after start(): " + t.getState());
        t.join();
    }
}
// OUTPUT:
// State after start(): RUNNABLE`]
                            },
                            {
                                content: `<h4>3. TERMINATED State</h4>
• A thread enters <code>TERMINATED</code> (also called "dead") once its <code>run()</code> method completes - either normally or by throwing an uncaught exception. <br>
• A terminated thread can never be started again; calling <code>start()</code> on it throws <code>IllegalThreadStateException</code>. <br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">  +-----------+  run() returns   +------------+
  | RUNNABLE  | ---------------> | TERMINATED |   <-- dead, cannot restart
  +-----------+                  +------------+</pre>`,
                                codeExamples: [`public class TerminatedStateDemo {
    public static void main(String[] args) throws InterruptedException {
        Thread t = new Thread(() -> System.out.println("Task finished"));
        t.start();
        t.join(); // wait for the thread to fully complete
        System.out.println("State after run() completes: " + t.getState());
    }
}
// OUTPUT:
// Task finished
// State after run() completes: TERMINATED`]
                            },
                            {
                                content: `<h4>Why does the life cycle matter?</h4>
• A thread is "born" (NEW), gets "started" (RUNNABLE), may pause temporarily (BLOCKED / WAITING / TIMED_WAITING - covered in Expert level), and finally "dies" (TERMINATED). <br>
• Understanding these states helps you debug deadlocks, diagnose hung threads with a thread dump, and reason about concurrency correctly. <br>`
                            },
                            {
                                content: `<h3>1. Definition</h3>
• The <b>life cycle of a thread</b> is the set of states a thread passes through from the moment it is created until it dies.<br>
• Java names these states in the enum <code>java.lang.Thread.State</code>: <b>NEW, RUNNABLE, BLOCKED, WAITING, TIMED_WAITING, TERMINATED</b>.<br>
• You can read the current state at any time with <code>threadObject.getState()</code>.<br><br>

<h3>2. Purpose of This Topic</h3>
• The purpose is to show what a thread is actually doing at a given moment: is it ready, is it sleeping, or is it stuck waiting for a lock.<br>
• It explains why <code>start()</code> works only once. A thread that is TERMINATED can never go back to NEW.<br>
• It gives you the vocabulary used in a thread dump, which is the first thing a support engineer reads when a bank server hangs.<br><br>

<h3>3. Need of This Topic</h3>
• Without knowing the states you cannot tell the difference between a slow thread and a stuck thread.<br>
• Calling <code>start()</code> twice, or calling <code>run()</code> instead of <code>start()</code>, are common student mistakes that this topic removes.<br>
• Every interview on threads begins with the question, how many thread states are there in Java.<br>`,
                                codeExamples: [
                                    `// Demonstrates points 1, 2 and 3: printing the state at each stage.
public class ThreadStateJourney {

    public static void main(String[] args) throws InterruptedException {

        Thread cashCounter = new Thread(() -> {
            System.out.println("Counting cash inside the thread, state now is "
                    + Thread.currentThread().getState());
            try {
                Thread.sleep(400); // moves this thread to TIMED_WAITING
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }, "CashCounter");

        // POINT 1: created but not started
        System.out.println("After creation      : " + cashCounter.getState());

        cashCounter.start();
        // POINT 1: started, so it is RUNNABLE
        System.out.println("After start()       : " + cashCounter.getState());

        Thread.sleep(150);
        // POINT 2: it is sleeping, so TIMED_WAITING
        System.out.println("While it sleeps     : " + cashCounter.getState());

        cashCounter.join();
        // POINT 2: run() finished, so TERMINATED
        System.out.println("After join()        : " + cashCounter.getState());

        // POINT 3: WRONG, a dead thread can never be started again
        try {
            cashCounter.start();
        } catch (IllegalThreadStateException e) {
            System.out.println("WRONG: start() twice throws " + e.getClass().getSimpleName());
        }

        // RIGHT: create a fresh Thread object for a fresh run
        new Thread(() -> System.out.println("RIGHT: a new Thread object runs fine")).start();
    }
}
// OUTPUT:
// After creation      : NEW
// After start()       : RUNNABLE
// Counting cash inside the thread, state now is RUNNABLE
// While it sleeps     : TIMED_WAITING
// After join()        : TERMINATED
// WRONG: start() twice throws IllegalThreadStateException
// RIGHT: a new Thread object runs fine`
                                ]
                            },
                            {
                                content: `<h3>4. Advantages</h3>
• <b>Clear debugging:</b> <code>getState()</code> and a thread dump tell you instantly whether a thread is BLOCKED on a lock or WAITING for a signal.<br>
• <b>Predictable design:</b> once you know that <code>join()</code> puts the caller in WAITING, ordering your code becomes easy.<br>
• <b>Prevents wrong API use:</b> knowing that a TERMINATED thread cannot restart stops the classic <code>IllegalThreadStateException</code> bug.<br>
• <b>Better resource control:</b> a thread stuck in WAITING still holds memory, so you learn to add timeouts.<br><br>

<h3>5. Disadvantages</h3>
• <b>RUNNABLE is vague:</b> Java does not separate running from ready, so <code>getState()</code> cannot tell you if a core is really busy.<br>
• <b>The state is a snapshot only:</b> by the time you print it, the thread may already be in a different state.<br>
• <b>No state for a suspended thread:</b> the old <code>suspend()</code> and <code>resume()</code> methods are deprecated because they can freeze a thread while it holds a lock.<br>
• <b>Cannot be used for logic:</b> writing an if condition on <code>getState()</code> is a race and is never reliable. Use <code>join()</code>, latches or locks instead.<br>`,
                                codeExamples: [
                                    `// Demonstrates points 4 and 5.
// Advantage: state tells you a thread is BLOCKED. Disadvantage: state is only a snapshot.
public class StateUsefulButRacy {

    static final Object vaultLock = new Object();

    public static void main(String[] args) throws InterruptedException {

        Thread holder = new Thread(() -> {
            synchronized (vaultLock) {
                sleep(600); // holds the lock for a while
            }
        }, "Holder");

        Thread waiter = new Thread(() -> {
            synchronized (vaultLock) { // cannot enter, so it becomes BLOCKED
                System.out.println("Waiter finally got the vault lock");
            }
        }, "Waiter");

        holder.start();
        sleep(100);
        waiter.start();
        sleep(100);

        // POINT 4 (advantage): the state explains the hang instantly
        System.out.println("Holder state : " + holder.getState()); // TIMED_WAITING
        System.out.println("Waiter state : " + waiter.getState()); // BLOCKED

        // POINT 5 (disadvantage): WRONG, never drive logic from getState()
        if (waiter.getState() == Thread.State.BLOCKED) {
            // by the time this line runs the waiter may already be RUNNABLE
            System.out.println("WRONG: this check is a race, the state can change immediately");
        }

        // RIGHT: use join() when you truly need to wait
        holder.join();
        waiter.join();
        System.out.println("RIGHT: join() gave a guaranteed wait, both are "
                + holder.getState() + " and " + waiter.getState());
    }

    static void sleep(long ms) {
        try {
            Thread.sleep(ms);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
// OUTPUT:
// Holder state : TIMED_WAITING
// Waiter state : BLOCKED
// WRONG: this check is a race, the state can change immediately
// Waiter finally got the vault lock
// RIGHT: join() gave a guaranteed wait, both are TERMINATED and TERMINATED`
                                ]
                            },
                            {
                                content: `<h3>6. Real Time Examples</h3>
• <b>ATM cash dispenser:</b> the thread is RUNNABLE while counting notes, TIMED_WAITING while it waits 30 seconds for you to take the cash, and TERMINATED once the receipt prints.<br>
• <b>IRCTC payment page:</b> the booking thread goes to WAITING while it waits for the bank to confirm, then returns to RUNNABLE when the reply arrives.<br>
• <b>College library counter:</b> only one clerk desk is free, so the second student thread is BLOCKED until the first one leaves. That is exactly a lock.<br>
• <b>Printer queue in an office:</b> jobs sit in WAITING, one job moves to RUNNABLE, then TERMINATED when the page comes out.<br>
• <b>Swiggy delivery app:</b> a background sync thread is in TIMED_WAITING between two location updates, using <code>Thread.sleep</code> of 10 seconds.<br>
• <b>Global example:</b> a Tomcat worker thread that shows BLOCKED in a production thread dump usually means a slow database query is holding a lock.<br>`,
                                codeExamples: [
                                    `// Demonstrates point 6: an ATM in Pune, showing every state in one run.
public class AtmThreadLifeCycle {

    static final Object cashTray = new Object();

    public static void main(String[] args) throws InterruptedException {

        Thread customer = new Thread(() -> {
            synchronized (cashTray) {         // holds the tray
                System.out.println("Customer collecting 2000 rupees");
                sleep(500);                   // TIMED_WAITING while collecting
            }
        }, "Customer-1");

        Thread nextCustomer = new Thread(() -> {
            synchronized (cashTray) {         // BLOCKED until tray is free
                System.out.println("Next customer collecting 500 rupees");
            }
        }, "Customer-2");

        System.out.println("Customer-1 before start : " + customer.getState());

        customer.start();
        sleep(100);
        nextCustomer.start();
        sleep(100);

        System.out.println("Customer-1 while busy    : " + customer.getState());
        System.out.println("Customer-2 in the queue  : " + nextCustomer.getState());

        customer.join();
        nextCustomer.join();

        System.out.println("Customer-1 at the end    : " + customer.getState());
        System.out.println("Customer-2 at the end    : " + nextCustomer.getState());
    }

    static void sleep(long ms) {
        try {
            Thread.sleep(ms);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
// OUTPUT:
// Customer-1 before start : NEW
// Customer collecting 2000 rupees
// Customer-1 while busy    : TIMED_WAITING
// Customer-2 in the queue  : BLOCKED
// Next customer collecting 500 rupees
// Customer-1 at the end    : TERMINATED
// Customer-2 at the end    : TERMINATED`
                                ]
                            }
                        ],

                        expert: [
                            {
                                content: `<h3>The Complete 6-State Life Cycle</h3>
Java's <code>Thread.State</code> enum has exactly 6 values. The full transition diagram: <br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">                         start()
        +-------+ ---------------> +-----------+
        |  NEW  |                  | RUNNABLE  | <---------------------+
        +-------+                  +-----------+                      |
                                     |   |   |                         |
                    needs lock       |   |   | Thread.sleep(ms)        |
                    held by another  |   |   | wait(timeout)           |
                    thread           |   |   | join(timeout)           |
                       +-------------+   |   +----------------+        |
                       v                 |                    v        |
               +-----------+             |            +----------------+
               |  BLOCKED  |             |            | TIMED_WAITING  |
               +-----------+             |            +----------------+
                       |            Object.wait()             |        |
                       |            join()  (no timeout)       |        |
        lock acquired  |                 v                    | timeout|
        (notified/     |         +-----------+                | elapses|
         monitor free)  |         |  WAITING  |                |        |
                       |         +-----------+                |        |
                       |                 |                     |        |
                       +-----------------+---------------------+--------+
                                          |
                                          v  run() returns / exception
                                  +------------+
                                  | TERMINATED |
                                  +------------+</pre>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>State</th><th>Meaning</th><th>How you get there</th><th>How you leave</th></tr>
<tr class='text-center'><td>NEW</td><td>Thread object created, not started</td><td><code>new Thread(...)</code></td><td><code>start()</code></td></tr>
<tr class='text-center'><td>RUNNABLE</td><td>Eligible to run (running or ready)</td><td><code>start()</code>, or resumed from a wait/block/sleep</td><td>blocks, waits, sleeps, or finishes</td></tr>
<tr class='text-center'><td>BLOCKED</td><td>Waiting to acquire a monitor lock (<code>synchronized</code>)</td><td>entering a synchronized block/method held by another thread</td><td>lock becomes available</td></tr>
<tr class='text-center'><td>WAITING</td><td>Waiting indefinitely for another thread's action</td><td><code>Object.wait()</code>, <code>join()</code> (no timeout), <code>LockSupport.park()</code></td><td><code>notify()</code>/<code>notifyAll()</code>, target thread finishes, <code>unpark()</code></td></tr>
<tr class='text-center'><td>TIMED_WAITING</td><td>Waiting for a bounded amount of time</td><td><code>Thread.sleep(ms)</code>, <code>wait(timeout)</code>, <code>join(timeout)</code></td><td>timeout elapses, or notified/finished early</td></tr>
<tr class='text-center'><td>TERMINATED</td><td>run() has completed (dead)</td><td><code>run()</code> returns or throws</td><td>none - final state</td></tr>
</table>`
                            },
                            {
                                content: `<h3>BLOCKED vs WAITING vs TIMED_WAITING - The Key Interview Distinction</h3>
These three states are the ones interviewers probe most, because they are easy to confuse: <br><br>
• <strong>BLOCKED</strong> - the thread wants to enter a <code>synchronized</code> block/method but another thread already holds that monitor lock. It is purely about lock contention; the thread did nothing to voluntarily wait. <br>
• <strong>WAITING</strong> - the thread voluntarily called <code>Object.wait()</code> (with no timeout) or <code>Thread.join()</code> (no timeout) and is waiting indefinitely for another thread to call <code>notify()</code>/<code>notifyAll()</code> or for the joined thread to finish. It has released the lock while waiting. <br>
• <strong>TIMED_WAITING</strong> - same idea as WAITING, but bounded by a timeout: <code>Thread.sleep(ms)</code>, <code>wait(timeout)</code>, or <code>join(timeout)</code>. It resumes automatically once the timeout elapses even if nobody notifies it. <br><br>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th></th><th>BLOCKED</th><th>WAITING</th><th>TIMED_WAITING</th></tr>
<tr class='text-center'><td>Cause</td><td>Lock held by someone else</td><td>Voluntary indefinite wait</td><td>Voluntary bounded wait</td></tr>
<tr class='text-center'><td>Triggered by</td><td>entering synchronized block</td><td>wait(), join() no-arg</td><td>sleep(ms), wait(ms), join(ms)</td></tr>
<tr class='text-center'><td>Holds the monitor lock?</td><td>Never acquired it</td><td>Released it while waiting</td><td>sleep() keeps lock; wait(ms) releases it</td></tr>
<tr class='text-center'><td>Resumes on</td><td>Lock becomes free</td><td>notify()/notifyAll() or target finishes</td><td>Timeout elapses OR notify/finish</td></tr>
</table>`
                            },
                            {
                                content: `<h4>Demo 1: TIMED_WAITING via Thread.sleep()</h4>
A thread that calls <code>Thread.sleep(ms)</code> moves into <code>TIMED_WAITING</code> for the duration of the sleep. We inspect its state from the main thread while it is sleeping.<br>`,
                                codeExamples: [`public class TimedWaitingDemo {
    public static void main(String[] args) throws InterruptedException {
        Thread t = new Thread(() -> {
            try {
                Thread.sleep(2000); // sleeps for 2 seconds
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        });

        t.start();
        Thread.sleep(200); // give t time to enter sleep()
        System.out.println("State while sleeping: " + t.getState());

        t.join(); // wait for t to finish
        System.out.println("State after finishing: " + t.getState());
    }
}
// OUTPUT:
// State while sleeping: TIMED_WAITING
// State after finishing: TERMINATED`]
                            },
                            {
                                content: `<h4>Demo 2: BLOCKED via synchronized lock contention</h4>
Two threads compete for the same object's monitor lock. The first thread to enter the <code>synchronized</code> block holds the lock and sleeps inside it; the second thread tries to enter the same block and is forced into <code>BLOCKED</code> until the first thread releases the lock.<br>`,
                                codeExamples: [`public class BlockedStateDemo {
    private static final Object lock = new Object();

    public static void main(String[] args) throws InterruptedException {
        Thread t1 = new Thread(() -> {
            synchronized (lock) {
                try {
                    Thread.sleep(2000); // holds the lock for 2 seconds
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        }, "t1");

        Thread t2 = new Thread(() -> {
            synchronized (lock) { // will block here until t1 releases the lock
                System.out.println("t2 got the lock");
            }
        }, "t2");

        t1.start();
        Thread.sleep(200); // let t1 acquire the lock first
        t2.start();
        Thread.sleep(200); // give t2 time to attempt entry and block

        System.out.println("t2 state while t1 holds the lock: " + t2.getState());

        t1.join();
        t2.join();
        System.out.println("t2 state after t1 releases the lock: " + t2.getState());
    }
}
// OUTPUT:
// t2 state while t1 holds the lock: BLOCKED
// t2 got the lock
// t2 state after t1 releases the lock: TERMINATED`]
                            },
                            {
                                content: `<h4>Demo 3: WAITING via Object.wait() / notify()</h4>
A thread that calls <code>wait()</code> with no timeout goes into <code>WAITING</code> and stays there indefinitely - releasing the lock - until another thread calls <code>notify()</code> on the same object.<br>`,
                                codeExamples: [`public class WaitingStateDemo {
    private static final Object lock = new Object();

    public static void main(String[] args) throws InterruptedException {
        Thread waiter = new Thread(() -> {
            synchronized (lock) {
                try {
                    lock.wait(); // waits indefinitely until notified
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
            System.out.println("Waiter resumed after notify()");
        });

        waiter.start();
        Thread.sleep(200); // let waiter reach wait()
        System.out.println("Waiter state: " + waiter.getState());

        synchronized (lock) {
            lock.notify(); // wakes the waiting thread
        }
        waiter.join();
        System.out.println("Waiter state after notify: " + waiter.getState());
    }
}
// OUTPUT:
// Waiter state: WAITING
// Waiter resumed after notify()
// Waiter state after notify: TERMINATED`]
                            },
                            {
                                content: `<h3>Reference Diagram</h3>
<img src="${thread}" alt="Thread States" class="d-block mx-auto border border-primary" style="height:300px" /><br>

<h4>Historical Note - Deprecated States</h4>
Older Java versions exposed <code>suspend()</code> and <code>resume()</code> methods that put a thread into a "suspended" state and back. These are <strong>deprecated</strong> because <code>suspend()</code> can freeze a thread while it still holds a lock, causing deadlocks - modern code should never use them. Prefer <code>wait()</code>/<code>notify()</code>, <code>Lock</code>/<code>Condition</code>, or higher-level <code>java.util.concurrent</code> utilities instead.<br>`
                            },
                            {
                                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>How many thread states does Java define?</td><td>6 - NEW, RUNNABLE, BLOCKED, WAITING, TIMED_WAITING, TERMINATED (java.lang.Thread.State)</td></tr>
<tr class='text-center'><td>Difference between BLOCKED and WAITING?</td><td>BLOCKED is involuntary - waiting for a lock held by another thread. WAITING is voluntary - the thread called wait()/join() with no timeout and released the lock</td></tr>
<tr class='text-center'><td>What moves a thread from TIMED_WAITING back to RUNNABLE?</td><td>Either the timeout elapses, or the thread is notified/interrupted/joined thread finishes early</td></tr>
<tr class='text-center'><td>Does RUNNABLE mean the thread is actually executing right now?</td><td>Not necessarily - RUNNABLE covers both "currently running on a core" and "ready and waiting for the scheduler's turn"; Java does not distinguish these</td></tr>
<tr class='text-center'><td>Can a TERMINATED thread be restarted with start()?</td><td>No - it throws IllegalThreadStateException; a Thread object can only be started once</td></tr>
<tr class='text-center'><td>Does Thread.sleep() release the object's monitor lock?</td><td>No - sleep() keeps any locks the thread holds; only wait() releases the lock while waiting</td></tr>
<tr class='text-center'><td>Why are suspend()/resume() deprecated?</td><td>suspend() can freeze a thread while it still holds a lock, leading to deadlocks - use wait()/notify() or java.util.concurrent instead</td></tr>
</table>`
                            },
                            {
                                content: `<h3>1. Definition (Advanced)</h3>
• At production level the thread life cycle is what you read in a <b>thread dump</b> taken with <code>jstack</code> or <code>jcmd Thread.print</code>.<br>
• The six states are JVM level abstractions. The operating system has its own states, so a Java <code>RUNNABLE</code> thread may in fact be blocked inside a native socket read.<br>
• <b>BLOCKED</b> means waiting for a monitor lock. <b>WAITING</b> means the thread called <code>wait()</code>, <code>join()</code> or <code>LockSupport.park()</code> with no timeout.<br>
• Java 21 <b>virtual threads</b> follow the same enum, but a parked virtual thread releases its carrier platform thread instead of blocking it.<br><br>

<h3>2. Purpose of This Topic (Advanced)</h3>
• The purpose is production diagnosis: find why a service is hung, which lock is contended and which thread owns it.<br>
• It teaches you to design for <b>interruptible</b> waits, so a deploy or shutdown can stop threads cleanly instead of killing them.<br>
• It also drives capacity planning. If most threads sit in WAITING on IO, adding CPU cores will not help, but virtual threads will.<br><br>

<h3>3. Need of This Topic (Advanced)</h3>
• A UPI switch that stops responding at peak time is almost always a lock convoy or a pool starvation, both visible as many BLOCKED threads on one monitor.<br>
• Interviewers ask for the exact difference between BLOCKED, WAITING and TIMED_WAITING, and whether <code>sleep()</code> releases the lock. It does not.<br>
• Correct shutdown of a Spring Boot service depends on moving worker threads from WAITING to TERMINATED within the grace period.<br>`,
                                codeExamples: [
                                    `import java.lang.management.ManagementFactory;
import java.lang.management.ThreadInfo;
import java.lang.management.ThreadMXBean;
import java.util.concurrent.locks.LockSupport;

// Advanced points 1, 2 and 3: reading states programmatically,
// the way a monitoring agent does inside a payment service.
public class ThreadDumpDiagnosis {

    static final Object ledgerMonitor = new Object();

    public static void main(String[] args) throws Exception {

        Thread owner = new Thread(() -> {
            synchronized (ledgerMonitor) {
                LockSupport.parkNanos(800_000_000L); // timed park, keeps the lock
            }
        }, "Ledger-Owner");

        Thread contender = new Thread(() -> {
            synchronized (ledgerMonitor) {           // BLOCKED on the monitor
                System.out.println("Contender entered the ledger");
            }
        }, "Ledger-Contender");

        owner.start();
        Thread.sleep(100);
        contender.start();
        Thread.sleep(100);

        // POINT 1 and 2: this is what a thread dump shows you
        ThreadMXBean bean = ManagementFactory.getThreadMXBean();
        for (Thread t : new Thread[]{owner, contender}) {
            ThreadInfo info = bean.getThreadInfo(t.getId());
            System.out.println(t.getName() + " state=" + info.getThreadState()
                    + " blockedOn=" + info.getLockName()
                    + " ownedBy=" + info.getLockOwnerName());
        }

        // POINT 3: WRONG, sleep() does NOT release the monitor
        System.out.println("WRONG assumption: sleep releases the lock. It does not.");
        System.out.println("RIGHT: only wait() on the monitor releases it.");

        owner.join();
        contender.join();
        System.out.println("Both threads are now " + owner.getState());
    }
}
// OUTPUT (lock names include a hash that changes each run):
// Ledger-Owner state=TIMED_WAITING blockedOn=null ownedBy=null
// Ledger-Contender state=BLOCKED blockedOn=java.lang.Object@1b6d3586 ownedBy=Ledger-Owner
// WRONG assumption: sleep releases the lock. It does not.
// RIGHT: only wait() on the monitor releases it.
// Contender entered the ledger
// Both threads are now TERMINATED`
                                ]
                            },
                            {
                                content: `<h3>4. Advantages (Advanced)</h3>
• <b>Root cause in minutes:</b> a single <code>jstack</code> shows which thread owns the contended monitor, so a production hang is explained without a debugger.<br>
• <b>Deadlock detection is built in:</b> <code>ThreadMXBean.findDeadlockedThreads()</code> reports cycles automatically, and monitoring tools alert on it.<br>
• <b>Graceful shutdown:</b> understanding WAITING lets you use <code>interrupt()</code> plus <code>awaitTermination()</code> so no payment is left half done during a deploy.<br>
• <b>Right sizing pools:</b> if threads are mostly TIMED_WAITING on IO, you raise pool size or move to virtual threads. If they are RUNNABLE, you add cores.<br>
• <b>Safer library design:</b> every blocking API you write can accept a timeout, which keeps threads out of the un ending WAITING state.<br><br>

<h3>5. Disadvantages (Advanced)</h3>
• <b>RUNNABLE hides native blocking:</b> a thread stuck in a socket read still shows RUNNABLE, so the dump can mislead you.<br>
• <b>Dumps are point in time:</b> you often need three dumps ten seconds apart to prove a thread is really stuck and not just busy.<br>
• <b>Taking a dump costs a pause:</b> on a very large heap with thousands of threads, the safepoint can add latency.<br>
• <b>Virtual threads change the picture:</b> lakhs of virtual threads make a classic dump unreadable, and you need <code>jcmd Thread.dump_to_file</code> instead.<br>
• <b>Interrupt is cooperative:</b> a thread that swallows <code>InterruptedException</code> will never leave WAITING, and no state API can force it out.<br>
• <b>ThreadLocal on pooled threads:</b> a thread that returns to RUNNABLE for the next request may still carry the old user data if you forget to clean it.<br>`,
                                codeExamples: [
                                    `import java.lang.management.ManagementFactory;
import java.util.concurrent.*;

// Advanced points 4 and 5.
// Advantage: automatic deadlock detection and cooperative shutdown.
// Disadvantage: a swallowed interrupt keeps a thread stuck forever.
public class ShutdownAndDeadlockDiagnostics {

    public static void main(String[] args) throws Exception {

        // POINT 5: WRONG, this worker swallows the interrupt and never stops cleanly
        Thread stubborn = new Thread(() -> {
            while (true) {
                try {
                    Thread.sleep(200);
                } catch (InterruptedException e) {
                    // WRONG: interrupt flag is cleared and ignored
                }
            }
        }, "Stubborn-Worker");
        stubborn.setDaemon(true);
        stubborn.start();

        // POINT 4: RIGHT, this worker honours the interrupt and terminates
        Thread polite = new Thread(() -> {
            try {
                while (!Thread.currentThread().isInterrupted()) {
                    Thread.sleep(200);
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt(); // restore the flag
            }
            System.out.println("Polite worker shut down cleanly");
        }, "Polite-Worker");
        polite.start();

        Thread.sleep(300);
        stubborn.interrupt();
        polite.interrupt();
        polite.join(1000);

        System.out.println("Polite state  : " + polite.getState());
        System.out.println("Stubborn state: " + stubborn.getState() + "  <-- never stops");

        // POINT 4: graceful pool shutdown with a deadline
        ExecutorService pool = Executors.newFixedThreadPool(2);
        pool.submit(() -> System.out.println("Settlement task done"));
        pool.shutdown();
        boolean clean = pool.awaitTermination(5, TimeUnit.SECONDS);
        System.out.println("Pool shut down within the grace period: " + clean);

        // POINT 4: the JVM can find deadlocks by itself
        long[] deadlocked = ManagementFactory.getThreadMXBean().findDeadlockedThreads();
        System.out.println("Deadlocked threads found: " + (deadlocked == null ? 0 : deadlocked.length));
    }
}
// OUTPUT:
// Polite worker shut down cleanly
// Polite state  : TERMINATED
// Stubborn state: TIMED_WAITING  <-- never stops
// Settlement task done
// Pool shut down within the grace period: true
// Deadlocked threads found: 0`
                                ]
                            },
                            {
                                content: `<h3>6. Real Time Examples (Advanced)</h3>
• <b>Bank core banking hang at month end:</b> the dump shows 190 of 200 Tomcat threads BLOCKED on one <code>synchronized</code> interest calculation method. The fix is a per account lock or an optimistic update.<br>
• <b>UPI timeout storm:</b> threads sit in TIMED_WAITING on a socket read because no read timeout was set. Setting a 2 second timeout moves them to TERMINATED and frees the pool.<br>
• <b>Kafka consumer stuck:</b> the poll thread is WAITING on a rebalance. A long <code>max.poll.interval.ms</code> keeps the partition unassigned and lag grows.<br>
• <b>Spring Boot graceful shutdown:</b> <code>server.shutdown=graceful</code> gives in flight requests time to reach TERMINATED before the container exits, so no order is lost.<br>
• <b>Zomato image service:</b> after moving to Java 21 virtual threads, threads that were TIMED_WAITING on IO no longer pin a platform thread, so 20000 concurrent uploads work with 8 carrier threads.<br>
• <b>Global example:</b> a connection pool leak shows as many threads WAITING on <code>getConnection</code>. The real bug is a missing close in a finally block far away in the code.<br>`,
                                codeExamples: [
                                    `import java.util.concurrent.*;

// Advanced point 6: a connection pool leak, the most common production
// cause of threads sitting in WAITING. Shown with a Semaphore as the pool.
public class ConnectionPoolLeakDemo {

    // A pool of only 2 database connections
    static final Semaphore pool = new Semaphore(2);

    // WRONG: no finally, so a failure never returns the connection
    static void queryWrong(String sql) throws InterruptedException {
        pool.acquire();
        if (sql.contains("BAD")) {
            System.out.println("Query failed, connection LEAKED: " + sql);
            return; // WRONG: release() never runs
        }
        pool.release();
    }

    // RIGHT: always release in finally
    static void queryRight(String sql) throws InterruptedException {
        pool.acquire();
        try {
            if (sql.contains("BAD")) {
                System.out.println("Query failed but connection is returned: " + sql);
                return;
            }
        } finally {
            pool.release();
        }
    }

    public static void main(String[] args) throws Exception {

        queryWrong("SELECT BAD FROM accounts");
        queryWrong("SELECT BAD FROM ledger");
        System.out.println("Permits left after the leak: " + pool.availablePermits());

        Thread waiter = new Thread(() -> {
            try {
                pool.acquire(); // no permits left, this thread parks in WAITING
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }, "Report-Thread");
        waiter.start();
        Thread.sleep(200);
        System.out.println("Report-Thread state: " + waiter.getState() + "  <-- classic leak symptom");
        waiter.interrupt();
        waiter.join();

        // Recreate a healthy pool and show the correct pattern
        Semaphore healthy = new Semaphore(2);
        healthy.acquire();
        try {
            System.out.println("RIGHT pattern in use, permits now: " + healthy.availablePermits());
        } finally {
            healthy.release();
        }
        System.out.println("Permits after finally: " + healthy.availablePermits());

        queryRight("SELECT BAD FROM cards");
    }
}
// OUTPUT:
// Query failed, connection LEAKED: SELECT BAD FROM accounts
// Query failed, connection LEAKED: SELECT BAD FROM ledger
// Permits left after the leak: 0
// Report-Thread state: WAITING  <-- classic leak symptom
// RIGHT pattern in use, permits now: 1
// Permits after finally: 2
// Query failed but connection is returned: SELECT BAD FROM cards`
                                ]
                            }
                        ]

                    };
