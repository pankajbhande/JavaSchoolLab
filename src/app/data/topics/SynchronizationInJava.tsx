import { Topic } from '../coreJava';

export const synchronizationInJava: Topic = {
                        id: `Synchronization in Java `,
                        name: `Synchronization in Java `,
                        beginner: [
                            {
                                content: `<ul>
<li><b>Synchronization</b> controls how many threads can use a shared resource at one time.</li>
<li>When many threads use the same resource together, the results can become inconsistent.</li>
<li>Synchronization is necessary for reliable communication between threads.</li>
</ul>`,
                                codeExamples: [
                                    `package com.synchronizaitons;

public class Account {
    private int balance = 5000;

    public int getBalance() {
        return balance;
    }

    public int withdraw(int amount) {
        balance = balance - amount;
        return balance;
    }
}

// OUTPUT:
// (no output: this class only holds the shared balance)`
                                ]
                            },
                            {
                                content: `<h3>1. Definition</h3>
• <b>Synchronization</b> in Java is the way of allowing only <b>one thread at a time</b> to enter a block of code that touches shared data.<br>
• It is written with the keyword <code>synchronized</code> on a method or on a block.<br>
• Every Java object carries a hidden lock, called the <b>monitor</b>. A thread must get that lock before entering a synchronized area and gives it back on exit.<br><br>

<h3>2. Purpose of This Topic</h3>
• The purpose is to stop a <b>race condition</b>, where two threads read and write the same variable at the same time and the result becomes wrong.<br>
• It makes updates <b>atomic</b>. A balance update of the form read, subtract, write happens as one unbreakable unit.<br>
• It also makes the new value <b>visible</b> to other threads, because releasing a lock pushes the change out of the CPU cache.<br><br>

<h3>3. Need of This Topic</h3>
• A joint bank account can be used from an ATM in Pune and from a mobile app in Mumbai at the same second. Without synchronization the balance goes wrong.<br>
• In IRCTC, the last seat of a train must go to exactly one passenger, never to two.<br>
• Any counter, cache, list or map shared between threads needs it, otherwise you get lost updates and corrupted data.<br>`,
                                codeExamples: [
                                    `// Demonstrates points 1, 2 and 3.
// A joint savings account used from two places at the same time.

class JointAccount {
    private int balanceInRupees = 100000;

    // WRONG: no lock. Two threads can read the same balance and both write back.
    public void withdrawWrong(int amount) {
        int current = balanceInRupees;   // read
        current = current - amount;      // modify
        balanceInRupees = current;       // write
    }

    // RIGHT: only one thread at a time can be inside this method
    public synchronized void withdrawRight(int amount) {
        int current = balanceInRupees;
        current = current - amount;
        balanceInRupees = current;
    }

    public int getBalance() {
        return balanceInRupees;
    }

    public void reset() {
        balanceInRupees = 100000;
    }
}

public class SynchronizationBasicsDemo {
    public static void main(String[] args) throws InterruptedException {

        JointAccount account = new JointAccount();

        // POINT 3: the unsafe version loses updates
        runBoth(account, false);
        System.out.println("Without synchronized, expected 80000, actual " + account.getBalance());

        account.reset();

        // POINT 1 and 2: the safe version is always correct
        runBoth(account, true);
        System.out.println("With synchronized,    expected 80000, actual " + account.getBalance());
    }

    static void runBoth(JointAccount account, boolean safe) throws InterruptedException {
        Runnable job = () -> {
            for (int i = 0; i < 10000; i++) {
                if (safe) {
                    account.withdrawRight(1);
                } else {
                    account.withdrawWrong(1);
                }
            }
        };
        Thread atm = new Thread(job, "ATM-Pune");
        Thread app = new Thread(job, "App-Mumbai");
        atm.start();
        app.start();
        atm.join();
        app.join();
    }
}
// OUTPUT (the first number changes on every run, that is the bug):
// Without synchronized, expected 80000, actual 86412
// With synchronized,    expected 80000, actual 80000`
                                ]
                            },
                            {
                                content: `<h3>4. Advantages</h3>
• <b>Correct data:</b> shared counters, balances and seat counts stay accurate no matter how many threads run.<br>
• <b>Simple to write:</b> one keyword gives you both mutual exclusion and memory visibility.<br>
• <b>Automatic unlock:</b> the lock is released even if the code throws an exception, so you can never forget to unlock.<br>
• <b>Reentrant:</b> a thread that already holds the lock can call another synchronized method on the same object without blocking itself.<br>
• <b>Built into the language:</b> nothing to import, works on every Java version.<br><br>

<h3>5. Disadvantages</h3>
• <b>Slower:</b> threads stand in a queue, so a synchronized method reduces parallel work. This is called contention.<br>
• <b>Deadlock risk:</b> if two threads take two locks in opposite order, both wait forever.<br>
• <b>No timeout and no tryLock:</b> a thread waiting on <code>synchronized</code> cannot give up or be interrupted. <code>ReentrantLock</code> can.<br>
• <b>Easy to lock the wrong object:</b> synchronizing on two different objects gives no protection at all.<br>
• <b>Too wide a block</b> hurts throughput. Only the lines that touch shared data should be inside the lock.<br>`,
                                codeExamples: [
                                    `// Demonstrates points 4 and 5.
// Advantage: correctness and reentrancy. Disadvantage: wrong lock object gives no safety.

class TicketCounter {
    private int seatsLeft = 1;

    // RIGHT: reentrancy, book() calls log(), both need the same lock
    public synchronized boolean book(String passenger) {
        if (seatsLeft > 0) {
            seatsLeft--;
            log(passenger + " got the last seat");
            return true;
        }
        log(passenger + " got no seat");
        return false;
    }

    private synchronized void log(String message) { // same lock, re entered safely
        System.out.println("LOG: " + message);
    }
}

class WrongLockCounter {
    private int count = 0;

    // WRONG: a brand new lock object on every call, so nothing is protected
    public void increment() {
        synchronized (new Object()) {
            count++;
        }
    }

    public int getCount() {
        return count;
    }
}

public class SyncProsAndConsDemo {
    public static void main(String[] args) throws InterruptedException {

        // POINT 4: only one passenger can get the last seat
        TicketCounter counter = new TicketCounter();
        Thread p1 = new Thread(() -> counter.book("Amit"));
        Thread p2 = new Thread(() -> counter.book("Priya"));
        p1.start();
        p2.start();
        p1.join();
        p2.join();

        // POINT 5: locking on the wrong object protects nothing
        WrongLockCounter wrong = new WrongLockCounter();
        Runnable job = () -> {
            for (int i = 0; i < 50000; i++) {
                wrong.increment();
            }
        };
        Thread a = new Thread(job);
        Thread b = new Thread(job);
        a.start();
        b.start();
        a.join();
        b.join();
        System.out.println("Wrong lock object, expected 100000, actual " + wrong.getCount());
        System.out.println("RIGHT fix: synchronize on one shared final object, not a new one");
    }
}
// OUTPUT (order of the two LOG lines can swap, the count is wrong every run):
// LOG: Amit got the last seat
// LOG: Priya got no seat
// Wrong lock object, expected 100000, actual 73921
// RIGHT fix: synchronize on one shared final object, not a new one`
                                ]
                            },
                            {
                                content: `<h3>6. Real Time Examples</h3>
• <b>Bank balance update:</b> a debit from an ATM and a credit from NEFT must not overlap, so the account update method is synchronized.<br>
• <b>IRCTC tatkal booking:</b> the seat count must go down by exactly one per confirmed ticket, even with lakhs of clicks in the same second.<br>
• <b>BookMyShow seat map:</b> two users clicking seat A15 together must produce one booking and one polite error.<br>
• <b>College exam form counter:</b> a shared token number generator must never give the same token to two students.<br>
• <b>Printer spooler in an office:</b> only one job may write to the printer port at a time, otherwise pages get mixed.<br>
• <b>Global example:</b> an e commerce stock counter for a flash sale. Without a lock, more units get sold than exist in the warehouse.<br>`,
                                codeExamples: [
                                    `// Demonstrates point 6: a BookMyShow style seat booking with a
// synchronized block that is kept as small as possible.

import java.util.ArrayList;
import java.util.List;

class ShowSeats {
    private final boolean[] seats = new boolean[5]; // 5 seats, false means free
    private final Object seatLock = new Object();   // one shared final lock
    private final List<String> bookings = new ArrayList<>();

    public void bookSeat(String user, int seatNo) {
        // Slow work that does NOT touch shared data stays OUTSIDE the lock
        verifyPayment(user);

        synchronized (seatLock) {              // RIGHT: small critical section
            if (!seats[seatNo]) {
                seats[seatNo] = true;
                bookings.add(user + " -> seat " + seatNo);
                System.out.println(user + " booked seat " + seatNo + " for 250 rupees");
            } else {
                System.out.println(user + " could not book seat " + seatNo + ", already taken");
            }
        }
    }

    private void verifyPayment(String user) {
        try {
            Thread.sleep(100); // UPI verification, no shared data touched
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    public int totalBookings() {
        synchronized (seatLock) {
            return bookings.size();
        }
    }
}

public class BookMyShowSyncDemo {
    public static void main(String[] args) throws InterruptedException {

        ShowSeats show = new ShowSeats();
        String[] users = {"Amit", "Priya", "Rahul", "Sneha"};

        Thread[] threads = new Thread[users.length];
        for (int i = 0; i < users.length; i++) {
            final String user = users[i];
            threads[i] = new Thread(() -> show.bookSeat(user, 3)); // all want seat 3
            threads[i].start();
        }
        for (Thread t : threads) {
            t.join();
        }

        System.out.println("Total confirmed bookings for seat 3: " + show.totalBookings());
    }
}
// OUTPUT (which user wins changes on every run, but the total is always 1):
// Amit booked seat 3 for 250 rupees
// Priya could not book seat 3, already taken
// Rahul could not book seat 3, already taken
// Sneha could not book seat 3, already taken
// Total confirmed bookings for seat 3: 1`
                                ]
                            }
                        ],
                        intermediate: [
                            {
                                content: `<p>Synchronization can be applied to <b>methods</b> and <b>blocks</b> only. It cannot be applied to variables or classes.</p>
<ul>
<li>It is used when many threads reach the same resource at the same time.</li>
<li>The goal is that only <b>one thread at a time</b> uses that resource.</li>
</ul>
<h4>Why do we need it?</h4>
<p>Two threads share one <code>Account</code> below. Each makes five withdrawals of 500.</p>`,
                                codeExamples: [`package com.synchronizaitons;

public class AccountDetails implements Runnable {
    Account account = new Account();

    @Override
    public void run() {
        for (int x = 0; x < 5; x++) {
            makeWithdrawal(500);
            if (account.getBalance() <= 0) {
                System.out.println("Account is overdrawn...");
            }
        }
    }

    // add "synchronized" here to fix the race
    private void makeWithdrawal(int amt) {
        String name = Thread.currentThread().getName();
        if (account.getBalance() >= amt) {
            System.out.println(name + " is going to withdraw=>");
        }
        try {
            Thread.sleep(100);
        } catch (InterruptedException e) {
            System.out.println(e.getMessage());
        }
        int bal = account.withdraw(amt);
        System.out.println(name + " complete withdrawal=>" + bal);
    }
}

// OUTPUT:
// (no output: this class is started by MainTest below)`,
                                    `package com.synchronizaitons;

public class MainTest {
    public static void main(String[] args) {
        AccountDetails accountDetails = new AccountDetails();
        Thread thread1 = new Thread(accountDetails);
        Thread thread2 = new Thread(accountDetails);
        thread1.setName("Pankaj");
        thread2.setName("bhande");
        thread1.start();
        thread2.start();
    }
}

// OUTPUT: (varies per run, see the two outputs below)
// Pankaj is going to withdraw=>
// bhande is going to withdraw=>
// ...`
                                ]
                            },
                            {
                                content: `<p>In this example two threads run in random order. To make them use the account safely, mark <code>makeWithdrawal</code> as <code>synchronized</code>.</p>
<h4>Note</h4>
<p>A synchronized method gives mutual exclusion for each call. The lock is released at every method exit, so both threads compete again on each loop turn and the two names normally still <b>interleave</b>. Synchronization removes the corrupted balance, not the interleaving. To let one thread finish its whole loop first, hold the lock across the entire loop or <code>join</code> the first thread.</p>
<p>A possible output with synchronization (each withdrawal is complete before the next starts):</p>
<div class="p-2 bg-secondary">
<h4>Output: using synchronization</h4>
<pre>Pankaj is going to withdraw=&gt;
Pankaj complete withdrawal=&gt;4500
bhande is going to withdraw=&gt;
bhande complete withdrawal=&gt;4000
Pankaj is going to withdraw=&gt;
Pankaj complete withdrawal=&gt;3500
...
bhande complete withdrawal=&gt;0
Account is overdrawn...</pre>
</div>
<p>A possible output without synchronization (both threads start before either finishes, so the balance and the order are mixed):</p>
<div class="p-2 bg-secondary">
<h4>Output: without synchronization</h4>
<pre>Pankaj is going to withdraw=&gt;
bhande is going to withdraw=&gt;
bhande complete withdrawal=&gt;4500
Pankaj complete withdrawal=&gt;4000
...
bhande complete withdrawal=&gt;0
Account is overdrawn...
Pankaj complete withdrawal=&gt;500
Account is overdrawn...</pre>
</div>

<h4>Type 1: Synchronized method</h4>
<ul>
<li>A method declared <code>synchronized</code> is a <b>synchronized method</b>.</li>
<li>It locks the object while one thread runs it.</li>
<li>The thread gets the lock when it calls the method and releases it when the method ends.</li>
</ul>
<pre>synchronized void test() {
    // write code here
}</pre>

<h4>Type 2: Synchronized block</h4>
<ul>
<li>A <b>synchronized block</b> locks only the lines inside it.</li>
<li>If a method has 50 lines but only 5 touch shared data, put just those 5 in a block.</li>
<li>If you put the whole method body in the block, it works like a synchronized method.</li>
<li>The scope of a block is smaller than a method, so other threads wait less.</li>
</ul>
<pre>synchronized (objectReference) {
    // code block
}</pre>
`
                            }
                        ],

                        expert: [
                            {
                                content: `<h3>The Race Condition Problem — Proof, Not Just Theory</h3>
A race condition happens when two or more threads read-modify-write a shared variable without coordination, and the operations interleave in a way that loses updates. <code>count++</code> is NOT atomic - it is really 3 steps: read count, add 1, write count back. If two threads interleave between those steps, one thread's increment can be silently overwritten.<br><br>

Below, two threads each increment a shared counter 100,000 times. The expected final value is <strong>200000</strong>. Without synchronization, the actual value comes out <strong>less than 200000</strong> almost every run (the exact number varies run to run - that unpredictability IS the bug).<br>`,
                                codeExamples: [
                                    `public class UnsafeCounterDemo {
    private static int count = 0;

    static void increment() { // NOT synchronized - unsafe
        count++; // read -> add 1 -> write : 3 separate steps
    }

    public static void main(String[] args) throws InterruptedException {
        Runnable task = () -> {
            for (int i = 0; i < 100_000; i++) {
                increment();
            }
        };

        Thread t1 = new Thread(task);
        Thread t2 = new Thread(task);
        t1.start();
        t2.start();
        t1.join(); // wait for both threads to finish before reading count
        t2.join();

        System.out.println("Expected: 200000");
        System.out.println("Actual  : " + count);
    }
}
// OUTPUT (non-deterministic - actual value varies per run, but is
// almost always LESS than 200000 because updates get lost):
// Expected: 200000
// Actual  : 187342   <-- example run; your number will differ`
                                ]
                            },
                            {
                                content: `<h4>The Fix — synchronized Method</h4>
Making the increment method <code>synchronized</code> forces both threads to acquire the same lock before entering it, so the read-modify-write sequence completes fully for one thread before the other can start. Now the result is deterministic and correct on every run.<br>`,
                                codeExamples: [
                                    `public class SafeCounterDemo {
    private static int count = 0;

    // synchronized -> only one thread can execute this method at a time
    synchronized static void increment() {
        count++;
    }

    public static void main(String[] args) throws InterruptedException {
        Runnable task = () -> {
            for (int i = 0; i < 100_000; i++) {
                increment();
            }
        };

        Thread t1 = new Thread(task);
        Thread t2 = new Thread(task);
        t1.start();
        t2.start();
        t1.join();
        t2.join();

        System.out.println("Expected: 200000");
        System.out.println("Actual  : " + count);
    }
}
// OUTPUT (deterministic - always correct now):
// Expected: 200000
// Actual  : 200000`
                                ]
                            },
                            {
                                content: `<h3>The Intrinsic Lock (Monitor) — What "synchronized" Actually Acquires</h3>
• Every object in Java has an associated <strong>intrinsic lock</strong> (also called a monitor lock), inherited from <code>Object</code> - you don't declare it, it's just there. <br>
• When a thread enters a <code>synchronized</code> method or block, it must first <strong>acquire</strong> the intrinsic lock of the object named in the <code>synchronized(...)</code> reference (or <code>this</code>, for a synchronized instance method). <br>
• Only one thread can hold a given object's lock at a time; every other thread trying to acquire the same lock is blocked until the holder exits the synchronized region (lock is released automatically, even if an exception is thrown). <br>
• This is why the lock reference matters: synchronizing on two different objects provides ZERO mutual exclusion between them - they are different locks entirely.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Thread A                    Object's Monitor Lock          Thread B
   |                              [ FREE ]                     |
   |-- synchronized(obj) ------->  ACQUIRED by A                |
   |   (critical section runs)                                  |-- synchronized(obj) --> BLOCKED (waits)
   |-- exits block, lock released -> [ FREE ] ------------------>|   ACQUIRED by B
   |                                                              |   (critical section runs)
   |                                                              |-- exits, lock released</pre>`
                            },
                            {
                                content: `<h3>Synchronized Method vs Synchronized Block</h3>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>Synchronized Method</th><th>Synchronized Block</th></tr>
<tr class='text-center'><td>Scope of lock</td><td>Entire method body</td><td>Only the statements inside the block</td></tr>
<tr class='text-center'><td>Lock object</td><td>Implicit - <code>this</code> (instance method) or the Class object (static method)</td><td>Explicit - you choose exactly which object to lock on</td></tr>
<tr class='text-center'><td>Performance</td><td>Can be worse - blocks other threads even from non-critical, unrelated code inside the method</td><td>Better - smaller critical section means less time other threads spend waiting</td></tr>
<tr class='text-center'><td>Flexibility</td><td>Low - all-or-nothing</td><td>High - lock on a dedicated private lock object, and only around the lines that actually touch shared state</td></tr>
</table>
<br>
<strong>Why smaller critical sections win:</strong> anything a thread does while holding a lock blocks every other thread that needs the same lock. If a method does file I/O, logging, or heavy computation in addition to touching the shared variable, wrapping the WHOLE method in <code>synchronized</code> serializes all of that unnecessarily. A synchronized block lets you do the expensive/unrelated work outside the lock and only hold the lock for the few lines that read/write shared state.<br>`,
                                codeExamples: [
                                    `public class BlockVsMethod {
    private int sharedCounter = 0;
    private final Object lock = new Object(); // dedicated lock object

    // Whole-method lock: even the "heavy work" below is serialized
    // even though it doesn't touch sharedCounter at all.
    public synchronized void wholeMethodLocked() {
        doHeavyUnrelatedWork();     // does NOT need protection, but still blocks other threads
        sharedCounter++;            // this is the only part that actually needs protection
    }

    // Synchronized block: only the critical section is locked;
    // doHeavyUnrelatedWork() runs freely, without blocking other threads.
    public void smallerCriticalSection() {
        doHeavyUnrelatedWork();
        synchronized (lock) {
            sharedCounter++;        // small, fast critical section
        }
    }

    private void doHeavyUnrelatedWork() {
        // simulate unrelated expensive work (logging, I/O, computation...)
    }

    public static void main(String[] args) {
        BlockVsMethod demo = new BlockVsMethod();
        demo.smallerCriticalSection();
        System.out.println("Counter: " + demo.sharedCounter);
    }
}
// OUTPUT:
// Counter: 1`
                                ]
                            },
                            {
                                content: `<h3>The Static Synchronized Trap — Locks on the Class, Not the Instance</h3>
• A <code>synchronized</code> <strong>instance</strong> method locks on <code>this</code> - i.e., the specific object the method is called on. Two threads calling the method on two DIFFERENT instances do NOT block each other. <br>
• A <code>synchronized</code> <strong>static</strong> method locks on the <code>Class</code> object itself (e.g. <code>MyClass.class</code>) - there is only ONE such lock per class, shared by ALL instances. <br>
• <strong>Common trap:</strong> engineers assume that because two threads use two different object references, they must be safe from blocking each other. If the method is <code>static synchronized</code>, that assumption is wrong - both threads share the exact same Class-level lock and WILL block each other, even though they never touch the same object.<br>`,
                                codeExamples: [
                                    `public class StaticLockTrap {

    // static synchronized -> locks on StaticLockTrap.class,
    // shared by every instance - NOT per-object.
    synchronized static void staticTask(String label) {
        System.out.println(label + " acquired the CLASS lock");
        try { Thread.sleep(1000); } catch (InterruptedException e) {}
        System.out.println(label + " releasing the CLASS lock");
    }

    public static void main(String[] args) {
        StaticLockTrap obj1 = new StaticLockTrap(); // two DIFFERENT instances
        StaticLockTrap obj2 = new StaticLockTrap();

        Thread t1 = new Thread(() -> obj1.staticTask("Thread-1 (via obj1)"));
        Thread t2 = new Thread(() -> obj2.staticTask("Thread-2 (via obj2)"));
        t1.start();
        t2.start();
    }
}
// OUTPUT (Thread-2 waits ~1 second even though it used a different
// object, because both threads share the same Class-level lock):
// Thread-1 (via obj1) acquired the CLASS lock
// Thread-1 (via obj1) releasing the CLASS lock
// Thread-2 (via obj2) acquired the CLASS lock
// Thread-2 (via obj2) releasing the CLASS lock`
                                ]
                            },
                            {
                                content: `<h3>Deadlock — When Two Locks Wait on Each Other Forever</h3>
A deadlock happens when Thread A holds Lock 1 and waits for Lock 2, while Thread B holds Lock 2 and waits for Lock 1. Neither can proceed, and neither ever will - the program hangs on those two threads permanently. <strong>Do not actually run the snippet below expecting it to finish</strong> - it is written to illustrate the hang, not to be executed to completion.<br>`,
                                codeExamples: [
                                    `public class DeadlockDemo {
    private static final Object lock1 = new Object();
    private static final Object lock2 = new Object();

    public static void main(String[] args) {
        Thread threadA = new Thread(() -> {
            synchronized (lock1) {                 // A acquires lock1
                System.out.println("Thread A: holding lock1...");
                try { Thread.sleep(100); } catch (InterruptedException e) {}
                synchronized (lock2) {             // A now wants lock2 (held by B)
                    System.out.println("Thread A: acquired lock2");
                }
            }
        });

        Thread threadB = new Thread(() -> {
            synchronized (lock2) {                 // B acquires lock2
                System.out.println("Thread B: holding lock2...");
                try { Thread.sleep(100); } catch (InterruptedException e) {}
                synchronized (lock1) {             // B now wants lock1 (held by A)
                    System.out.println("Thread B: acquired lock1");
                }
            }
        });

        threadA.start();
        threadB.start();
        // Program HANGS forever here: A waits for lock2 (B has it),
        // B waits for lock1 (A has it) - classic circular wait.
    }
}
// OUTPUT (prints these two lines, then hangs forever - never
// reaches "acquired lock2" / "acquired lock1"):
// Thread A: holding lock1...
// Thread B: holding lock2...
// <program never terminates>`
                                ]
                            },
                            {
                                content: `<h4>The Standard Fix — Consistent Lock Ordering</h4>
The classic remedy is to make every thread acquire multiple locks in the SAME global order (e.g. always lock1 before lock2, everywhere in the codebase). If both threads only ever request lock1 first, then lock2, a circular wait can never form.<br>`,
                                codeExamples: [
                                    `public class DeadlockFixed {
    private static final Object lock1 = new Object();
    private static final Object lock2 = new Object();

    public static void main(String[] args) throws InterruptedException {
        Thread threadA = new Thread(() -> {
            synchronized (lock1) {          // always lock1 first...
                System.out.println("Thread A: holding lock1...");
                synchronized (lock2) {      // ...then lock2
                    System.out.println("Thread A: acquired lock2");
                }
            }
        });

        Thread threadB = new Thread(() -> {
            synchronized (lock1) {          // same order: lock1 first...
                System.out.println("Thread B: holding lock1...");
                synchronized (lock2) {      // ...then lock2
                    System.out.println("Thread B: acquired lock2");
                }
            }
        });

        threadA.start();
        threadB.start();
        threadA.join();
        threadB.join();
        System.out.println("Both threads finished - no deadlock");
    }
}
// OUTPUT (deterministic ordering of which thread runs first can vary,
// but the program ALWAYS terminates - no deadlock is possible):
// Thread A: holding lock1...
// Thread A: acquired lock2
// Thread B: holding lock1...
// Thread B: acquired lock2
// Both threads finished - no deadlock`
                                ]
                            },
                            {
                                content: `<h3>ReentrantLock — A More Flexible Alternative to synchronized</h3>
<code>java.util.concurrent.locks.ReentrantLock</code> provides the same mutual-exclusion guarantee as <code>synchronized</code>, but with extra capabilities <code>synchronized</code> cannot offer: <br>
• <code>tryLock()</code> - attempt to acquire without blocking forever, optionally with a timeout. <br>
• <code>lockInterruptibly()</code> - a thread waiting for the lock can be interrupted. <br>
• Explicit, code-visible <code>lock()</code> / <code>unlock()</code> calls, instead of an implicit block scope - useful for non-block-structured locking. <br>
• <strong>Caveat:</strong> unlike <code>synchronized</code>, the lock is NOT released automatically - you must always <code>unlock()</code> in a <code>finally</code> block, or a thread that throws an exception will leave the lock held forever.<br>`,
                                codeExamples: [
                                    `import java.util.concurrent.locks.ReentrantLock;

public class ReentrantLockDemo {
    private static int count = 0;
    private static final ReentrantLock lock = new ReentrantLock();

    static void increment() {
        lock.lock();          // acquire, blocks if another thread holds it
        try {
            count++;
        } finally {
            lock.unlock();     // MUST release in finally - not automatic like synchronized
        }
    }

    public static void main(String[] args) throws InterruptedException {
        Runnable task = () -> {
            for (int i = 0; i < 100_000; i++) {
                increment();
            }
        };

        Thread t1 = new Thread(task);
        Thread t2 = new Thread(task);
        t1.start();
        t2.start();
        t1.join();
        t2.join();

        System.out.println("Expected: 200000");
        System.out.println("Actual  : " + count);
    }
}
// OUTPUT (deterministic - correct every run):
// Expected: 200000
// Actual  : 200000`
                                ]
                            },
                            {
                                content: `<h3>Synchronization Interview Questions &amp; Answers</h3>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is a race condition?</td><td>Two or more threads read-modify-write shared data without coordination, so interleaved execution loses or corrupts updates - the outcome depends on unpredictable thread timing</td></tr>
<tr><td>What lock does a synchronized instance method acquire?</td><td>The intrinsic/monitor lock of <code>this</code> - the specific object instance the method is called on</td></tr>
<tr><td>What lock does a synchronized static method acquire?</td><td>The intrinsic lock of the Class object (e.g. <code>MyClass.class</code>) - shared by ALL instances, not per-object</td></tr>
<tr><td>Why prefer a synchronized block over a synchronized method?</td><td>A block lets you shrink the critical section to only the lines that touch shared state, reducing the time other threads are blocked and improving throughput</td></tr>
<tr><td>What is a deadlock and what causes it?</td><td>Two or more threads are each waiting for a lock the other holds, forming a circular wait, so none can ever proceed; caused by acquiring multiple locks in inconsistent order across threads</td></tr>
<tr><td>How do you prevent deadlock?</td><td>Always acquire multiple locks in a fixed, consistent global order across the entire codebase, use lock timeouts (<code>tryLock</code>), or avoid holding more than one lock at a time where possible</td></tr>
<tr><td>Is synchronized reentrant?</td><td>Yes - a thread that already holds an object's lock can re-enter another synchronized method/block guarded by the same lock without blocking itself</td></tr>
<tr><td>What is the difference between synchronized and ReentrantLock?</td><td>ReentrantLock offers tryLock (non-blocking/timeout acquire), lockInterruptibly, and explicit unlock control, but requires manual unlock() in a finally block since it isn't released automatically like synchronized</td></tr>
<tr><td>Does synchronizing on two different objects prevent both threads from running concurrently?</td><td>No - synchronized only blocks threads competing for the SAME lock object; different lock objects provide no mutual exclusion between them at all</td></tr>
<tr><td>Can you synchronize a variable or a class declaration?</td><td>No - the synchronized keyword can only be applied to methods and blocks, never directly to variables or class declarations</td></tr>
</table>`
                            },
                            {
                                content: `<h3>1. Definition (Advanced)</h3>
• At production level, synchronization is one point on a whole scale: <code>volatile</code> for visibility only, <code>Atomic</code> classes for lock free single variable updates, <code>synchronized</code> and <code>ReentrantLock</code> for full mutual exclusion, and <code>StampedLock</code> or <code>ReadWriteLock</code> for read heavy data.<br>
• The JVM implements <code>synchronized</code> with <b>monitor enter</b> and <b>monitor exit</b> bytecodes. An uncontended lock is very cheap. Once two threads fight for it, the lock inflates to a heavyweight OS monitor.<br>
• The real contract is the <b>Java Memory Model</b>. Unlocking a monitor <i>happens before</i> the next locking of the same monitor, which is what makes writes visible.<br><br>

<h3>2. Purpose of This Topic (Advanced)</h3>
• The purpose is to pick the cheapest correct tool. Using <code>synchronized</code> where an <code>AtomicLong</code> or a <code>ConcurrentHashMap</code> would do costs throughput.<br>
• It is also about <b>lock granularity</b>. One global lock on a service is a bottleneck. A lock per account or per key scales.<br>
• And about <b>lock ordering</b> discipline, which is the only reliable defence against deadlock in a large codebase.<br><br>

<h3>3. Need of This Topic (Advanced)</h3>
• A payment service doing 20000 transactions per second cannot hold one lock for the whole ledger. It needs striped locks or a database level optimistic update.<br>
• Interviews ask about double checked locking, why <code>volatile</code> is mandatory there, and why <code>synchronized</code> on a wrapper such as <code>Integer</code> or a <code>String</code> literal is dangerous.<br>
• Production hangs are usually lock convoys. You must know <code>tryLock</code> with a timeout to fail fast instead of hanging.<br>`,
                                codeExamples: [
                                    `import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.locks.ReentrantLock;

// Advanced points 1, 2 and 3: choosing the right tool and the right granularity.
public class LockGranularityAndTools {

    // WRONG: one global lock for every account in the bank
    static final Object globalLock = new Object();
    static long globalTotal = 0;

    // RIGHT 1: lock free counter for a single variable
    static final AtomicLong atomicTotal = new AtomicLong();

    // RIGHT 2: one lock per account key, so different accounts never block each other
    static final ConcurrentHashMap<String, ReentrantLock> accountLocks = new ConcurrentHashMap<>();
    static final ConcurrentHashMap<String, Long> balances = new ConcurrentHashMap<>();

    static void creditStriped(String account, long paise) throws InterruptedException {
        ReentrantLock lock = accountLocks.computeIfAbsent(account, k -> new ReentrantLock());

        // POINT 3: tryLock with a timeout fails fast instead of hanging forever
        if (lock.tryLock(500, TimeUnit.MILLISECONDS)) {
            try {
                balances.merge(account, paise, Long::sum);
            } finally {
                lock.unlock(); // MUST be in finally, unlike synchronized
            }
        } else {
            System.out.println("Could not lock " + account + " in time, retry later");
        }
    }

    public static void main(String[] args) throws Exception {

        ExecutorService pool = Executors.newFixedThreadPool(8);
        String[] accounts = {"SB-1001", "SB-1002", "SB-1003", "SB-1004"};

        for (int i = 0; i < 4000; i++) {
            final String acc = accounts[i % accounts.length];
            pool.submit(() -> {
                try {
                    // WRONG approach kept only for comparison
                    synchronized (globalLock) {
                        globalTotal += 100;
                    }
                    atomicTotal.addAndGet(100);       // RIGHT 1
                    creditStriped(acc, 100);          // RIGHT 2
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            });
        }

        pool.shutdown();
        pool.awaitTermination(20, TimeUnit.SECONDS);

        System.out.println("Global lock total : " + globalTotal + " paise (correct but serialised)");
        System.out.println("Atomic total      : " + atomicTotal.get() + " paise (correct and lock free)");
        System.out.println("Striped SB-1001   : " + balances.get("SB-1001") + " paise");
        System.out.println("Distinct locks created: " + accountLocks.size());
    }
}
// OUTPUT:
// Global lock total : 400000 paise (correct but serialised)
// Atomic total      : 400000 paise (correct and lock free)
// Striped SB-1001   : 100000 paise
// Distinct locks created: 4`
                                ]
                            },
                            {
                                content: `<h3>4. Advantages (Advanced)</h3>
• <b>Guaranteed happens before:</b> the JMM promises that everything written before an unlock is visible after the matching lock, which no amount of clever coding can replace.<br>
• <b>Cheap when uncontended:</b> the JVM optimises an uncontended monitor to a thin lock, so correct code is not automatically slow.<br>
• <b>Exception safe:</b> unlike <code>ReentrantLock</code>, a <code>synchronized</code> block releases the monitor automatically on any exception path.<br>
• <b>Composable with wait and notify:</b> producer consumer coordination is built into the same monitor.<br>
• <b>Alternatives for every shape of problem:</b> <code>ReadWriteLock</code> for read heavy caches, <code>Semaphore</code> for pool limits, <code>StampedLock</code> for optimistic reads.<br><br>

<h3>5. Disadvantages (Advanced)</h3>
• <b>Serialises throughput:</b> Amdahl law means a 5 percent locked section caps your speedup no matter how many cores you buy.<br>
• <b>Deadlock, livelock and lock convoy</b> are all real production failures and none of them show up in a unit test.<br>
• <b>Not interruptible and no timeout:</b> a thread blocked on <code>synchronized</code> cannot be cancelled, so a slow holder freezes the service.<br>
• <b>Dangerous lock objects:</b> synchronizing on a <code>String</code> literal, a boxed <code>Integer</code> from the cache, or <code>this</code> in a public class lets outside code lock you out.<br>
• <b>Virtual thread pinning:</b> in Java 21, blocking inside a <code>synchronized</code> block pins the virtual thread to its carrier, killing the scalability benefit. Use <code>ReentrantLock</code> instead.<br>
• <b>Broken double checked locking</b> without <code>volatile</code> can publish a half constructed object because of instruction reordering.<br>`,
                                codeExamples: [
                                    `import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.ReentrantLock;

// Advanced points 4 and 5.
// Shows: correct double checked locking, a dangerous lock object,
// and tryLock as the cure for a hang.
public class SyncPitfallsAdvanced {

    // POINT 5: WRONG, no volatile. Another thread can see a half built object.
    private static Config wrongInstance;

    // POINT 4 and 5: RIGHT, volatile makes double checked locking safe
    private static volatile Config rightInstance;
    private static final Object initLock = new Object();

    static class Config {
        final String upiHandle;
        Config(String upiHandle) {
            this.upiHandle = upiHandle;
        }
    }

    static Config getWrong() {
        if (wrongInstance == null) {
            synchronized (SyncPitfallsAdvanced.class) {
                if (wrongInstance == null) {
                    wrongInstance = new Config("wrong@bank"); // WRONG: no volatile
                }
            }
        }
        return wrongInstance;
    }

    static Config getRight() {
        Config local = rightInstance;
        if (local == null) {
            synchronized (initLock) {
                local = rightInstance;
                if (local == null) {
                    rightInstance = local = new Config("right@bank");
                }
            }
        }
        return local;
    }

    public static void main(String[] args) throws Exception {

        System.out.println("Wrong singleton handle: " + getWrong().upiHandle);
        System.out.println("Right singleton handle: " + getRight().upiHandle);

        // POINT 5: WRONG lock object. A String literal is shared JVM wide,
        // so unrelated code can block your critical section.
        String badLock = "LEDGER";
        synchronized (badLock) {
            System.out.println("WRONG: locking on a String literal, any class can grab it");
        }

        // POINT 4 and 5: tryLock lets a slow holder be survived, synchronized cannot
        ReentrantLock ledgerLock = new ReentrantLock();

        Thread slowHolder = new Thread(() -> {
            ledgerLock.lock();
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            } finally {
                ledgerLock.unlock();
            }
        }, "Slow-Holder");
        slowHolder.start();
        Thread.sleep(100);

        if (ledgerLock.tryLock(200, TimeUnit.MILLISECONDS)) {
            try {
                System.out.println("Got the ledger lock");
            } finally {
                ledgerLock.unlock();
            }
        } else {
            System.out.println("RIGHT: gave up after 200 ms instead of hanging the request");
        }

        slowHolder.join();
    }
}
// OUTPUT:
// Wrong singleton handle: wrong@bank
// Right singleton handle: right@bank
// WRONG: locking on a String literal, any class can grab it
// RIGHT: gave up after 200 ms instead of hanging the request`
                                ]
                            },
                            {
                                content: `<h3>6. Real Time Examples (Advanced)</h3>
• <b>NPCI style ledger:</b> instead of one lock, the service takes a lock per account number and always in ascending account order, so a transfer from A to B and from B to A can never deadlock.<br>
• <b>Flash sale stock counter:</b> Flipkart Big Billion Days uses an atomic decrement or a database conditional update, not a Java monitor, because the stock lives outside one JVM.<br>
• <b>Spring singleton bean:</b> a bean field mutated by request threads needs a lock or must be made stateless. Most production bugs in Spring come from a mutable field in a singleton service.<br>
• <b>In memory rate limiter:</b> a <code>Semaphore</code> of 100 permits caps concurrent calls to a partner bank API, which is a form of synchronization without a monitor.<br>
• <b>Read heavy config cache:</b> a <code>ReentrantReadWriteLock</code> lets hundreds of reader threads work together and blocks them only during the rare refresh.<br>
• <b>Global example:</b> Kafka producer batching uses fine grained locks per partition buffer so different partitions never contend, which is the same striping idea.<br>`,
                                codeExamples: [
                                    `import java.util.concurrent.*;
import java.util.concurrent.locks.ReentrantReadWriteLock;

// Advanced point 6: two production patterns in one program.
// 1) Ordered lock acquisition for a bank transfer, deadlock proof.
// 2) ReadWriteLock for a read heavy config cache.
public class ProductionSyncPatterns {

    static class Account {
        final int id;
        long balancePaise;
        final Object lock = new Object();
        Account(int id, long balancePaise) {
            this.id = id;
            this.balancePaise = balancePaise;
        }
    }

    // RIGHT: always lock the lower id first, so no cycle can form
    static void transfer(Account from, Account to, long paise) {
        Account first = from.id < to.id ? from : to;
        Account second = from.id < to.id ? to : from;

        synchronized (first.lock) {
            synchronized (second.lock) {
                if (from.balancePaise >= paise) {
                    from.balancePaise -= paise;
                    to.balancePaise += paise;
                }
            }
        }
    }

    static class ConfigCache {
        private final ReentrantReadWriteLock rw = new ReentrantReadWriteLock();
        private String upiLimit = "100000";

        String read() {
            rw.readLock().lock();          // many readers together
            try {
                return upiLimit;
            } finally {
                rw.readLock().unlock();
            }
        }

        void refresh(String value) {
            rw.writeLock().lock();         // exclusive, blocks readers briefly
            try {
                upiLimit = value;
            } finally {
                rw.writeLock().unlock();
            }
        }
    }

    public static void main(String[] args) throws Exception {

        Account a = new Account(1001, 500000); // 5000 rupees
        Account b = new Account(1002, 500000);

        ExecutorService pool = Executors.newFixedThreadPool(4);
        for (int i = 0; i < 1000; i++) {
            pool.submit(() -> transfer(a, b, 100));
            pool.submit(() -> transfer(b, a, 100)); // opposite direction, still safe
        }
        pool.shutdown();
        pool.awaitTermination(20, TimeUnit.SECONDS);

        System.out.println("A balance: " + a.balancePaise + " paise");
        System.out.println("B balance: " + b.balancePaise + " paise");
        System.out.println("Total conserved: " + (a.balancePaise + b.balancePaise) + " paise");

        ConfigCache cache = new ConfigCache();
        System.out.println("UPI limit before refresh: " + cache.read());
        cache.refresh("200000");
        System.out.println("UPI limit after refresh : " + cache.read());
    }
}
// OUTPUT:
// A balance: 500000 paise
// B balance: 500000 paise
// Total conserved: 1000000 paise
// UPI limit before refresh: 100000
// UPI limit after refresh : 200000`
                                ]
                            }
                        ]
                    };
