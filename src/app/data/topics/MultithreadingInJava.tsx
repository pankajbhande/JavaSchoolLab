import { Topic } from '../coreJava';
import multiImg from '../../../assets/multi.png';
import multithreadingImg from '../../../assets/multithreading.png';

export const multithreadingInJava: Topic = {
                        id: `MultiThreading in Java`,
                        name: `Multithreading in Java`,
                        beginner: [
                            {
                                content: `• Multithreading in Java is a programming concept that allows multiple threads (smaller units of a process) to run concurrently within a single Java program. <br>
                • Each thread represents a separate path of execution, enabling tasks to be performed simultaneously, which enhances the efficiency and responsiveness of applications.<br>
                • Java provides built-in support for multithreading through the java.lang.Thread class and the Runnable interface, allowing developers to create and manage threads easily.<br>
                • Multithreading is particularly useful for tasks that require parallel processing, such as handling user interfaces, performing background operations, or managing multiple client requests in server applications.<br><br>
                `
                            },
                            {
                                content: `<h4>Process vs Thread</h4>
• A <strong>process</strong> is a running program with its own separate memory space (heap, stack, code) allocated by the OS. Two processes cannot directly share memory.<br>
• A <strong>thread</strong> is a lightweight sub-unit of a process. All threads inside the same process share that process's memory and resources, but each thread still gets its own stack and program counter.<br>
• Because threads share memory with the process they belong to, creating a thread is much cheaper (faster, less memory) than creating a whole new process.<br><br>

<h4>Every Java Program Already Has One Thread: main</h4>
• The moment a Java program starts, the JVM automatically creates one thread called <code>main</code> to run the <code>public static void main(String[] args)</code> method.<br>
• Any additional threads you create in your program run alongside this main thread - that's what makes the program "multithreaded".<br>`,
                                codeExamples: [
                                    `public class MainThreadDemo {
    public static void main(String[] args) {
        // The JVM already gave us a thread just to run main()
        Thread currentThread = Thread.currentThread();
        System.out.println("Currently executing thread: " + currentThread.getName());
    }
}
// OUTPUT:
// Currently executing thread: main`
                                ]
                            },
                            {
                                content: `<h4>Single-Threaded vs Multithreaded Execution</h4>
• In a single-threaded program, tasks run one after another - the next task only starts once the previous one fully finishes.<br>
• In a multithreaded program, independent tasks can run at (roughly) the same time, so the total time taken can be much less than running them one by one.<br>`,
                                codeExamples: [
                                    `public class SingleVsMultiThreadDemo {

    static void printNumbers() {
        for (int i = 1; i <= 3; i++) System.out.println("Numbers: " + i);
    }

    static void printLetters() {
        for (char c = 'A'; c <= 'C'; c++) System.out.println("Letters: " + c);
    }

    public static void main(String[] args) {
        // Single-threaded: printLetters() starts only AFTER printNumbers() ends
        printNumbers();
        printLetters();

        System.out.println("---- now the multithreaded way ----");

        // Multithreaded way: both tasks run concurrently on their own threads
        Thread t1 = new Thread(SingleVsMultiThreadDemo::printNumbers);
        Thread t2 = new Thread(SingleVsMultiThreadDemo::printLetters);
        t1.start();
        t2.start();
        // The "Numbers:" and "Letters:" lines from t1/t2 may now interleave
        // in any order - that interleaving is the visible sign of true concurrency.
    }
}
// OUTPUT (single-threaded part is always in this exact order):
// Numbers: 1
// Numbers: 2
// Numbers: 3
// Letters: A
// Letters: B
// Letters: C
// ---- now the multithreaded way ----
// (then 6 more lines from t1/t2, interleaved in a non-deterministic order)`
                                ]
                            },
                            {
                                content: `<h4>Creating a Thread - Quick First Example (extending Thread)</h4>
The simplest way to get a second thread running: extend <code>Thread</code>, override <code>run()</code> with the code you want to execute, then call <code>start()</code> (never call <code>run()</code> directly - that just runs it like a normal method on the current thread, with no new thread involved).<br>`,
                                codeExamples: [
                                    `class HelloThread extends Thread {
    public void run() {
        String name = Thread.currentThread().getName();
        System.out.println("Hello from a new thread: " + name);
    }
}

public class ExtendThreadBasicDemo {
    public static void main(String[] args) {
        HelloThread thread = new HelloThread();
        thread.start(); // starts a NEW thread, which then calls run()
        System.out.println("Hello from: " + Thread.currentThread().getName());
    }
}
// OUTPUT (order of the two lines can vary since both threads run concurrently):
// Hello from: main
// Hello from a new thread: Thread-0`
                                ]
                            },
                            {
                                content: `<h4>Creating a Thread - Quick First Example (implementing Runnable)</h4>
The alternative, generally preferred, approach: implement <code>Runnable</code>'s single <code>run()</code> method, then hand that Runnable to a <code>Thread</code> object to actually run it. (The full comparison between the two approaches is covered later.)<br>`,
                                codeExamples: [
                                    `class HelloRunnable implements Runnable {
    public void run() {
        String name = Thread.currentThread().getName();
        System.out.println("Hello from a new thread: " + name);
    }
}

public class RunnableBasicDemo {
    public static void main(String[] args) {
        Thread thread = new Thread(new HelloRunnable());
        thread.start();
        System.out.println("Hello from: " + Thread.currentThread().getName());
    }
}
// OUTPUT (order of the two lines can vary since both threads run concurrently):
// Hello from: main
// Hello from a new thread: Thread-0`
                                ]
                            },
                            {
                                content: `<h4>Naming Threads and Running Several at Once</h4>
• Every thread has a name - if you don't set one, the JVM auto-assigns something like <code>Thread-0</code>, <code>Thread-1</code>, etc.<br>
• Giving threads meaningful names (via the <code>Thread(Runnable, String name)</code> constructor or <code>setName()</code>) makes debugging and log-reading far easier once several threads are running together.<br>`,
                                codeExamples: [
                                    `public class NamedThreadsDemo {
    public static void main(String[] args) {
        Runnable task = () ->
            System.out.println(Thread.currentThread().getName() + " is working");

        Thread downloader = new Thread(task, "Downloader-Thread");
        Thread uploader = new Thread(task, "Uploader-Thread");

        downloader.start();
        uploader.start();
    }
}
// OUTPUT (order between the two threads can vary):
// Downloader-Thread is working
// Uploader-Thread is working`
                                ]
                            },
                            {
                                content: `<h4>Daemon Threads vs User (Normal) Threads</h4>
• By default, every thread you create is a <strong>user thread</strong> - the JVM keeps running as long as at least one user thread is still alive, even if main() has already finished.<br>
• A <strong>daemon thread</strong> is a background/service thread (e.g. garbage collection) that does NOT keep the JVM alive - once every user thread finishes, the JVM exits immediately, killing any daemon threads mid-execution without waiting for them.<br>
• Mark a thread as daemon with <code>setDaemon(true)</code> BEFORE calling <code>start()</code> (calling it after start() throws <code>IllegalThreadStateException</code>). Use daemon threads for background housekeeping work that should never block the application from shutting down.<br>`,
                                codeExamples: [
                                    `public class DaemonThreadDemo {
    public static void main(String[] args) throws InterruptedException {
        Thread daemonThread = new Thread(() -> {
            while (true) {
                System.out.println("Daemon thread running in background...");
                try {
                    Thread.sleep(300);
                } catch (InterruptedException e) {
                    return;
                }
            }
        });

        daemonThread.setDaemon(true); // must be set BEFORE start()
        daemonThread.start();

        System.out.println("Main thread doing a little work...");
        Thread.sleep(700); // let the daemon print a couple of times

        System.out.println("Main thread finished - JVM exits, daemon is killed");
    }
}
// OUTPUT (exact repeat count of the daemon line can vary slightly, but the
// program always exits right after the last line below - the daemon thread
// never gets to print again, even though its while(true) loop never ended):
// Main thread doing a little work...
// Daemon thread running in background...
// Daemon thread running in background...
// Main thread finished - JVM exits, daemon is killed`
                                ]
                            },
                            {
                                content: `<h4>Why Multithreading Matters - A Concrete Timing Comparison</h4>
The clearest way to see the benefit is to time independent, slow tasks run one-by-one versus run concurrently. When tasks don't depend on each other's results, running them on separate threads lets their waiting/working time overlap instead of stacking up.<br>`,
                                codeExamples: [
                                    `public class TimingComparisonDemo {

    static void simulateSlowTask(String name) {
        try {
            Thread.sleep(1000); // pretend this is a slow download/file read
        } catch (InterruptedException ignored) {}
        System.out.println(name + " done");
    }

    public static void main(String[] args) throws InterruptedException {
        long start = System.currentTimeMillis();
        simulateSlowTask("Task-1");
        simulateSlowTask("Task-2");
        long sequentialTime = System.currentTimeMillis() - start;
        System.out.println("Sequential total time: ~" + sequentialTime + "ms");

        start = System.currentTimeMillis();
        Thread t1 = new Thread(() -> simulateSlowTask("Task-1"));
        Thread t2 = new Thread(() -> simulateSlowTask("Task-2"));
        t1.start();
        t2.start();
        t1.join();
        t2.join();
        long concurrentTime = System.currentTimeMillis() - start;
        System.out.println("Concurrent total time: ~" + concurrentTime + "ms");
    }
}
// OUTPUT (approximate - actual milliseconds vary by machine):
// Task-1 done
// Task-2 done
// Sequential total time: ~2000ms
// Task-1 done
// Task-2 done
// Concurrent total time: ~1000ms`
                                ]
                            },
                            {
                                content: `<h3>1. Definition</h3>
• <b>Multithreading</b> is the ability of a Java program to run more than one thread at the same time inside a single process.<br>
• A <b>thread</b> is the smallest unit of work that the CPU can schedule. Every Java program starts with one thread called <b>main</b>.<br>
• All threads of one program share the same heap memory, but each thread keeps its own stack and its own program counter.<br><br>

<h3>2. Purpose of This Topic</h3>
• The purpose is to let one program do several jobs together instead of doing them one after the other.<br>
• It keeps the application <b>responsive</b>. In an IRCTC style booking screen, one thread can talk to the payment gateway while another thread keeps the screen alive.<br>
• It uses the CPU better. Modern laptops have 4, 8 or 16 cores, and a single threaded program uses only one of them.<br><br>

<h3>3. Need of This Topic</h3>
• Without threads, a slow job like reading a file or calling a bank API <b>blocks</b> everything behind it.<br>
• A college portal that prints 500 mark sheets one by one would keep every student waiting. With threads the work is shared.<br>
• Almost every real Java framework, such as Spring Boot or Tomcat, is multithreaded, so you cannot understand them without this topic.<br>`,
                                codeExamples: [
                                    `// Demonstrates points 1, 2 and 3 of the beginner definition section.
// Scenario: a college portal in Pune prints mark sheets for students.

public class CollegePortalThreadBasics {

    // A single job: printing one mark sheet takes some time
    static void printMarkSheet(String studentName) {
        try {
            Thread.sleep(300); // pretend printing takes 300 milliseconds
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        System.out.println("Mark sheet ready for " + studentName
                + " (printed by " + Thread.currentThread().getName() + ")");
    }

    public static void main(String[] args) throws InterruptedException {

        // POINT 1: every program already runs on one thread named main
        String me = Thread.currentThread().getName();
        System.out.println("Program started on thread: " + me);

        // WRONG WAY (point 3): everything on one thread, students wait in a queue
        long start = System.currentTimeMillis();
        printMarkSheet("Amit");
        printMarkSheet("Priya");
        printMarkSheet("Rahul");
        long single = System.currentTimeMillis() - start;
        System.out.println("Single thread time: " + single + " ms");

        // RIGHT WAY (points 2 and 3): one thread per student, work overlaps
        start = System.currentTimeMillis();
        Thread t1 = new Thread(() -> printMarkSheet("Amit"), "Printer-1");
        Thread t2 = new Thread(() -> printMarkSheet("Priya"), "Printer-2");
        Thread t3 = new Thread(() -> printMarkSheet("Rahul"), "Printer-3");
        t1.start();
        t2.start();
        t3.start();
        t1.join();
        t2.join();
        t3.join();
        long multi = System.currentTimeMillis() - start;
        System.out.println("Multi thread time: " + multi + " ms");
    }
}
// OUTPUT (times are approximate, order of the three printer lines can change):
// Program started on thread: main
// Mark sheet ready for Amit (printed by main)
// Mark sheet ready for Priya (printed by main)
// Mark sheet ready for Rahul (printed by main)
// Single thread time: 903 ms
// Mark sheet ready for Priya (printed by Printer-2)
// Mark sheet ready for Amit (printed by Printer-1)
// Mark sheet ready for Rahul (printed by Printer-3)
// Multi thread time: 305 ms`
                                ]
                            },
                            {
                                content: `<h3>4. Advantages</h3>
• <b>Speed:</b> independent jobs run together, so total time drops. Three 1 second jobs can finish in about 1 second instead of 3.<br>
• <b>Responsive screens:</b> the user interface thread stays free while a long download runs in the background.<br>
• <b>Better CPU use:</b> when one thread waits for a disk or network reply, another thread can use the CPU.<br>
• <b>Cheap compared to processes:</b> creating a thread needs far less memory than creating a whole new process.<br>
• <b>Isolation of failures:</b> if one thread throws an exception, the other threads keep running.<br><br>

<h3>5. Disadvantages</h3>
• <b>Race conditions:</b> when two threads change the same variable, the result can be wrong. A shared bank balance is the classic case.<br>
• <b>Hard to debug:</b> bugs appear only sometimes because thread order changes on every run.<br>
• <b>Deadlock:</b> two threads can wait for each other forever and the program hangs.<br>
• <b>Context switching cost:</b> too many threads make the CPU spend time switching instead of working.<br>
• <b>More memory:</b> every thread takes its own stack, usually around 512 KB to 1 MB.<br>`,
                                codeExamples: [
                                    `// Demonstrates points 4 and 5.
// Advantage: work finishes faster. Disadvantage: shared data goes wrong.

public class ThreadAdvantageAndProblem {

    // A shared bank account of a customer in Mumbai
    static int balanceInRupees = 10000;

    // WRONG: no protection, two threads change the same variable
    static void withdrawWrong(int amount) {
        for (int i = 0; i < 1000; i++) {
            balanceInRupees = balanceInRupees - amount;
        }
    }

    public static void main(String[] args) throws InterruptedException {

        // POINT 5 (disadvantage): race condition on shared data
        Thread atm1 = new Thread(() -> withdrawWrong(1), "ATM-Dadar");
        Thread atm2 = new Thread(() -> withdrawWrong(1), "ATM-Andheri");
        atm1.start();
        atm2.start();
        atm1.join();
        atm2.join();
        System.out.println("Expected balance: 8000");
        System.out.println("Actual balance  : " + balanceInRupees + "  <-- may be wrong");

        // POINT 4 (advantage): independent jobs really do finish faster
        long start = System.currentTimeMillis();
        Thread sms = new Thread(() -> slowJob("Send SMS alert"));
        Thread mail = new Thread(() -> slowJob("Send email statement"));
        sms.start();
        mail.start();
        sms.join();
        mail.join();
        System.out.println("Both alerts done in about "
                + (System.currentTimeMillis() - start) + " ms instead of 1000 ms");
    }

    static void slowJob(String name) {
        try {
            Thread.sleep(500);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        System.out.println(name + " finished");
    }
}
// OUTPUT (the actual balance changes on every run, that is the bug):
// Expected balance: 8000
// Actual balance  : 8437  <-- may be wrong
// Send SMS alert finished
// Send email statement finished
// Both alerts done in about 505 ms instead of 1000 ms`
                                ]
                            },
                            {
                                content: `<h3>6. Real Time Examples</h3>
• <b>IRCTC ticket booking:</b> thousands of users book at 10 AM. The server gives each request its own thread so nobody waits for another person.<br>
• <b>Bank cheque clearing:</b> a nightly batch splits one lakh cheques among 10 threads so the job finishes before morning.<br>
• <b>Paytm or PhonePe app:</b> one thread shows the spinning loader while another thread waits for the UPI reply.<br>
• <b>WhatsApp:</b> one thread sends your message, another downloads photos, another keeps the chat list smooth.<br>
• <b>College attendance app:</b> a background thread syncs today attendance to the server while the teacher keeps marking students.<br>
• <b>Global example:</b> a web server such as Tomcat keeps a pool of 200 threads and gives one thread to each incoming HTTP request.<br>`,
                                codeExamples: [
                                    `// Demonstrates point 6: a simple IRCTC style booking counter.
// Five passengers try to book at the same time, each on its own thread.

public class IrctcBookingSimulation {

    static void bookTicket(String passenger, String train) {
        System.out.println(passenger + " searching seats in " + train
                + " on thread " + Thread.currentThread().getName());
        try {
            Thread.sleep(200); // network call to the railway server
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        System.out.println(passenger + " ticket confirmed, fare 1450 rupees");
    }

    public static void main(String[] args) throws InterruptedException {
        String[] passengers = {"Amit", "Priya", "Rahul", "Sneha", "Vikram"};

        Thread[] counters = new Thread[passengers.length];
        long start = System.currentTimeMillis();

        // RIGHT: one thread per passenger, all searches happen together
        for (int i = 0; i < passengers.length; i++) {
            final String name = passengers[i];
            counters[i] = new Thread(
                    () -> bookTicket(name, "Deccan Queen"), "Counter-" + (i + 1));
            counters[i].start();
        }

        for (Thread counter : counters) {
            counter.join(); // wait for every booking to finish
        }

        System.out.println("All 5 bookings finished in about "
                + (System.currentTimeMillis() - start) + " ms");
    }
}
// OUTPUT (line order between passengers changes on every run):
// Amit searching seats in Deccan Queen on thread Counter-1
// Priya searching seats in Deccan Queen on thread Counter-2
// Rahul searching seats in Deccan Queen on thread Counter-3
// Sneha searching seats in Deccan Queen on thread Counter-4
// Vikram searching seats in Deccan Queen on thread Counter-5
// Amit ticket confirmed, fare 1450 rupees
// Priya ticket confirmed, fare 1450 rupees
// Rahul ticket confirmed, fare 1450 rupees
// Sneha ticket confirmed, fare 1450 rupees
// Vikram ticket confirmed, fare 1450 rupees
// All 5 bookings finished in about 210 ms`
                                ]
                            }

                        ],
                        intermediate: [

                            {
                                content: `<h4>Process of executing multiple threads simultaneously.</h4>
• <b>Multithreading vs multitasking:</b> multitasking runs several programs (processes) at the same time. Multithreading runs several threads of one program at the same time.<br>
• A thread is a basic unit of execution. It has its own program counter, registers and stack. It shares the code, data and open files of its process.<br>
• One process can have many threads. The CPU switches between them so fast that the user feels they all run together.<br><br>


<h4>Benefits of Multithreading</h4>
• <b>Responsiveness:</b> if one thread is busy or blocked, other threads keep the application alive, so the user does not sit idle.<br>
• <b>Resource sharing:</b> threads of one process share its code and data in the same address space.<br>
• <b>Low cost:</b> a new process needs its own memory and resources. A new thread of the same process needs no separate memory.<br><br>

<img src="${multiImg}" alt="Image"class="d-block mx-auto" style="height:250px"/><br>`,
                            },
                            {
                                content: `<h4>What is Thread?</h4>
• A <b>thread</b> is a lightweight sub-process and the smallest unit of processing. It runs inside a larger process as a separate path of execution.<br>
• Threads are independent. If one thread throws an exception, the other threads are not affected. They use a shared memory area.<br>

<img src="${multithreadingImg}" alt="Image"class="d-block mx-auto" style="height:380px" /><br>

In the figure above, threads run inside a process and the CPU switches between them (context switching). An OS can run many processes, and each process can have many threads.<br>
<h4>Note: Only one thread runs per CPU core at a time - on an N-core machine up to N threads execute in true parallel</h4>
<h4>How to Create a Thread?</h4>
There are 2 ways:<br>
1. By extending the <code>Thread</code> class<br>
2. By implementing the <code>Runnable</code> interface<br><br>

<h4>1. By Extending the Thread Class</h4>

The <code>Thread</code> class has constructors and methods to create and control a thread. It extends <code>Object</code> and implements <code>Runnable</code>.<br><br>
<b>Constructors</b><br>
• <code>Thread()</code><br>
• <code>Thread(String name)</code><br>
• <code>Thread(Runnable r)</code><br>
• <code>Thread(Runnable r, String name)</code><br><br>

<h4>Methods with Description</h4>
1. <code>public void run()</code>: holds the action the thread performs.<br>
2. <code>public void start()</code>: starts the thread. The JVM then calls <code>run()</code> on it.<br>
3. <code>public static void sleep(long ms)</code>: pauses the <b>current</b> thread for the given milliseconds. It is static, so <code>t.sleep(100)</code> still pauses the caller, not thread <code>t</code>.<br>
4. <code>public void join()</code>: waits for a thread to die.<br>
5. <code>public void join(long ms)</code>: waits for a thread to die, for at most the given milliseconds.<br>
6. <code>public int getPriority()</code>: returns the priority of the thread.<br>
7. <code>public void setPriority(int priority)</code>: changes the priority of the thread.<br>
8. <code>public String getName()</code>: returns the name of the thread.<br>
9. <code>public void setName(String name)</code>: changes the name of the thread.<br>
10. <code>public static Thread currentThread()</code>: returns the thread that is running now.<br>
11. <code>public long getId()</code>: returns the id of the thread (deprecated since Java 19, use <code>threadId()</code>).<br>
12. <code>public Thread.State getState()</code>: returns the state of the thread.<br>
13. <code>public boolean isAlive()</code>: tests if the thread is alive.<br>
14. <code>public static void yield()</code>: hints that the current thread is willing to let other threads run.<br>
15. <code>public void suspend()</code>: suspends the thread (deprecated, unsafe).<br>
16. <code>public void resume()</code>: resumes a suspended thread (deprecated, unsafe).<br>
17. <code>public void stop()</code>: stops the thread (deprecated, unsafe; it throws <code>UnsupportedOperationException</code> in recent Java).<br>
18. <code>public boolean isDaemon()</code>: tests if the thread is a daemon thread.<br>
19. <code>public void setDaemon(boolean b)</code>: marks the thread as daemon or user thread.<br>
20. <code>public void interrupt()</code>: interrupts the thread.<br>
21. <code>public boolean isInterrupted()</code>: tests if the thread has been interrupted.<br>
22. <code>public static boolean interrupted()</code>: tests if the current thread was interrupted, and clears the flag.<br>`,

                                codeExamples: [
                                    `// Program 01: print 1 to 5 on a new thread
package com.javaschoollab.demo;

public class ThreadDemo extends Thread {
    public void run() {
        for (int i = 1; i <= 5; i++) { // 1 to 5
            System.out.println(i);
        }
    }

    public static void main(String[] args) {
        ThreadDemo thread = new ThreadDemo();
        thread.start(); // starts the new thread
    }
}
// OUTPUT:
// 1
// 2
// 3
// 4
// 5`,

                                    `// Program 02: a minimal Thread subclass
package com.javaschoollab.demo;

class MyThread extends Thread {
    public void run() {
        System.out.println("Thread is running.");
    }
}

public class Main {
    public static void main(String[] args) {
        MyThread thread = new MyThread();
        thread.start(); // starts the new thread
    }
}
// OUTPUT:
// Thread is running.`
                                ]
                            },
                            {
                                content: `<h4>2. By Implementing the Runnable Interface</h4>
Any class whose instances are meant to run on a thread can implement <code>Runnable</code>. The interface has only one method, <code>run()</code>.`,

                                codeExamples: [
                                    `package com.threads;

public class ThreadDemo implements Runnable {
    public static void main(String[] args) {
        ThreadDemo task = new ThreadDemo();  // create the task
        Thread t = new Thread(task);         // wrap it in a Thread
        t.start();                           // run() is invoked on the new thread
    }

    @Override
    public void run() {
        for (int i = 1; i <= 10; i++) {
            System.out.println(i);
        }
    }
}
// OUTPUT:
// 1
// 2
// ... (one number per line)
// 10`,
                                    `package com.javaschoollab.demo;

class MyRunnable implements Runnable {
    public void run() {
        System.out.println("Thread is running.");
    }
}

public class Main {
    public static void main(String[] args) {
        MyRunnable myRunnable = new MyRunnable();
        Thread thread = new Thread(myRunnable);
        thread.start(); // starts the new thread
    }
}
// OUTPUT:
// Thread is running.`
                                ]
                            },
                            {
                                content: `<h4>Note</h4>
A class that only implements <code>Runnable</code> is not a thread. You must create a <code>Thread</code> object and pass your object to it, so that your <code>run()</code> method can execute.<br><br>

<h4>When to use which?</h4>
• <b>Extend Thread:</b> when your class does not need to extend any other class.<br>
• <b>Implement Runnable:</b> when your class already extends another class. Java has no multiple inheritance, so Runnable is the way to go.<br><br>

<h3>Difference between Thread class and Runnable interface (Self assignment)</h3>

<table border="2" cellpadding="15" cellspacing="0" style="border-collapse: collapse; width: 100%;">

  <tr style="background-color: #4CAF50; color: white;">
    <th style="border: 2px solid #333;" class="p-2">Sr.no</th>
    <th style="border: 2px solid #333;" class="p-2">Key</th>
    <th style="border: 2px solid #333;">Thread </th>
    <th style="border: 2px solid #333;">Runnable</th>
  </tr>

  <tr>
    <td style="border: 2px solid #333;">1.</td>
    <td style="border: 2px solid #333;" class="p-2">Basic</td>
    <td style="border: 2px solid #333;">Thread is a class. It is used to create a thread</td>
    <td style="border: 2px solid #333;">Runnable is a functional interface which is used to create a thread</td>
  </tr>

   <tr>
    <td style="border: 2px solid #333;">2.</td>
    <td style="border: 2px solid #333;" class="p-2">Method</td>
    <td style="border: 2px solid #333;">It has multiple methods including start() and run()</td>
    <td style="border: 2px solid #333;">It has only abstract method run() </td>
  </tr>

  <tr>
    <td style="border: 2px solid #333;">3.</td>
    <td style="border: 2px solid #333;" class="p-2">Object</td>
    <td style="border: 2px solid #333;">Each thread creates a unique object and gets associated with it</td>
    <td style="border: 2px solid #333;">Multiple threads share the same objects. </td>
  </tr>

  <tr>
    <td style="border: 2px solid #333;">4.</td>
    <td style="border: 2px solid #333;" class="p-2" >Limitation</td>
    <td style="border: 2px solid #333;">Java has no multiple inheritance, so a class that extends Thread cannot extend any other class</td>
    <td style="border: 2px solid #333;">A class that implements Runnable can still extend another class</td>
  </tr>

</table>


`,
                                codeExamples: [
                                    `// Example of Runnable
package com.javaschoollab.demo;

public class RunnableExample implements Runnable {
    public void run() {
        System.out.println("Thread is running for Runnable Implementation");
    }

    public static void main(String[] args) {
        RunnableExample runnable = new RunnableExample();
        Thread t1 = new Thread(runnable);
        t1.start();
    }
}
// OUTPUT:
// Thread is running for Runnable Implementation`,

                                    `// Example of Thread
package com.javaschoollab.demo;

public class ThreadExample extends Thread {
    public void run() {
        System.out.println("Thread is running");
    }

    public static void main(String[] args) {
        ThreadExample t1 = new ThreadExample();
        t1.start();
    }
}
// OUTPUT:
// Thread is running`,
                                    `// Example for multithreading: two threads count 1 to 5
package com.multi;

public class MultithreadingExample extends Thread {
    public void run() {
        for (int i = 1; i <= 5; i++) {
            try {
                Thread.sleep(500); // pause this thread for 500 ms
            } catch (Exception e) {
                System.out.println(e.getMessage());
            }
            System.out.println(i);
        }
    }

    public static void main(String[] args) {
        MultithreadingExample thread1 = new MultithreadingExample();
        MultithreadingExample thread2 = new MultithreadingExample();
        thread1.start();
        thread2.start();
    }
}
// OUTPUT (the two threads interleave, so each number appears twice):
// 1
// 1
// 2
// 2
// ... up to 5 5`        ]
                            },
                            {
                                content: `<h4>Advantages for Multithreading in Java</h4>
• <b>Not blocked:</b> threads are independent, so users are not blocked and many operations run at the same time.<br>
• <b>Failure isolation:</b> an exception in one thread does not affect the others.<br><br>
Key benefits:<br>
1. <b>Improved performance:</b> threads run concurrently and use multi-core processors well.<br>
2. <b>Better resource use:</b> while one thread waits for I/O, other threads keep the CPU busy.<br>
3. <b>Responsive user interface:</b> slow work runs in the background, so a GUI stays smooth.<br>
4. <b>Simpler program structure:</b> tasks like asynchronous I/O, periodic jobs and background processing become easier to organise.<br>
5. <b>Scalability:</b> a multithreaded program can use more CPU cores as they become available.<br>
6. <b>Concurrency handling:</b> a server can process many client requests at once.<br>`,

                                codeExamples: [
                                    `package com.threads;

public class ThreadDemo extends Thread {
    public static void main(String[] args) {
        ThreadDemo thread = new ThreadDemo();
        System.out.println(thread.getId());       // unique id
        System.out.println(thread.getName());     // default name
        System.out.println(thread.getPriority()); // default priority
        System.out.println(thread.getState());    // not started yet
    }
}
// OUTPUT (the id differs between runs and Java versions):
// 21
// Thread-0
// 5
// NEW`
                                ]
                            }
                        ],
                        expert: [
                            {
                                content: `<h3>Thread vs Runnable — Which Should You Actually Use?</h3>
Both ways of creating a thread ultimately run the same JVM machinery, but they are not equally good choices for real code. The comparison below goes beyond the beginner-level list already covered earlier and focuses on WHY <code>Runnable</code> is the preferred approach in production code.<br><br>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr>
<th>Aspect</th>
<th>extends Thread</th>
<th>implements Runnable</th>
</tr>
<tr class='text-center'><td>Inheritance</td><td>Uses up your one allowed superclass slot</td><td>Leaves the superclass slot free - you can still extend another class</td></tr>
<tr class='text-center'><td>Design</td><td>Couples the "task" with the "thread mechanism"</td><td>Decouples the task (what to run) from how it is run - the same Runnable can be handed to a Thread, an ExecutorService, or run directly</td></tr>
<tr class='text-center'><td>Object identity</td><td>Every task IS-A Thread</td><td>The task HAS-A Thread (or no thread at all, e.g. inside a pool)</td></tr>
<tr class='text-center'><td>Reusability</td><td>Cannot share the same Thread object's task across multiple threads</td><td>The same Runnable instance can be passed to multiple Thread objects or submitted to a pool</td></tr>
<tr class='text-center'><td>Fits Executor framework?</td><td>Not directly - ExecutorService expects Runnable/Callable</td><td>Yes - Runnable is exactly what ExecutorService.submit() accepts</td></tr>
<tr class='text-center'><td>Industry recommendation</td><td>Avoid unless you genuinely need to override other Thread methods</td><td>Preferred default</td></tr>
</table>
<br>
<strong>Rule of thumb:</strong> almost always implement <code>Runnable</code> (or <code>Callable</code>). Only extend <code>Thread</code> directly when you truly need to override its behavior (rare).<br>`,
                                codeExamples: [
                                    `// Approach 1: extending Thread
class ReportTask extends Thread {
    public void run() {
        System.out.println("Generating report via extends Thread");
    }
}

public class ExtendsThreadDemo {
    public static void main(String[] args) {
        ReportTask task = new ReportTask();
        task.start();
        // task.start(); // Calling start() twice on the SAME instance
        // would throw IllegalThreadStateException - a Thread object
        // can be started only once.
    }
}
// OUTPUT:
// Generating report via extends Thread`,

                                    `// Approach 2: implementing Runnable - the preferred style
class ReportRunnable implements Runnable {
    public void run() {
        System.out.println("Generating report via implements Runnable");
    }
}

public class RunnableDemo {
    public static void main(String[] args) {
        ReportRunnable task = new ReportRunnable();

        // The SAME Runnable instance can back multiple Thread objects
        Thread t1 = new Thread(task, "Worker-1");
        Thread t2 = new Thread(task, "Worker-2");
        t1.start();
        t2.start();
    }
}
// OUTPUT (order between t1 and t2 is NOT guaranteed - the OS scheduler
// decides which thread runs first; run it multiple times and you may
// see the two lines swap order):
// Generating report via implements Runnable
// Generating report via implements Runnable`,

                                    `// Why Runnable decouples task from mechanism - the SAME Runnable
// can be run directly, on a raw Thread, or on a thread pool.
class Greeter implements Runnable {
    public void run() {
        System.out.println(Thread.currentThread().getName() + ": Hello");
    }
}

public class DecouplingDemo {
    public static void main(String[] args) throws InterruptedException {
        Greeter task = new Greeter();

        task.run();                     // 1) plain method call - no new thread at all
        new Thread(task).start();        // 2) run on a dedicated raw Thread

        java.util.concurrent.ExecutorService pool =
                java.util.concurrent.Executors.newSingleThreadExecutor();
        pool.submit(task);               // 3) run on a pooled thread
        pool.shutdown();
    }
}
// OUTPUT (thread names will vary, but the pattern is always
// "<threadName>: Hello" printed three times):
// main: Hello
// Thread-0: Hello
// pool-1-thread-1: Hello`
                                ]
                            },
                            {
                                content: `<h3>Thread Priority — A Hint, Not a Guarantee</h3>
Every thread has a priority between <code>Thread.MIN_PRIORITY</code> (1) and <code>Thread.MAX_PRIORITY</code> (10), with <code>Thread.NORM_PRIORITY</code> (5) as the default. You set it with <code>setPriority(int)</code> and read it with <code>getPriority()</code>.<br><br>

<strong>Critical interview point:</strong> thread priority is only a <em>suggestion</em> to the OS/JVM thread scheduler about relative importance - it is NOT a contract. The JVM specification does not guarantee that a higher-priority thread will run before, more often than, or instead of a lower-priority one. Actual scheduling behavior is platform-dependent (it can differ between Windows, Linux, and different JVM implementations). Never rely on priority for correctness - use it only as a soft performance hint, and use proper synchronization (join, locks, etc.) whenever ordering actually matters.<br>`,
                                codeExamples: [
                                    `public class PriorityDemo {
    public static void main(String[] args) {
        Thread low = new Thread(() -> {
            for (int i = 1; i <= 3; i++) {
                System.out.println("LOW priority - count " + i);
            }
        }, "LowPriorityThread");

        Thread high = new Thread(() -> {
            for (int i = 1; i <= 3; i++) {
                System.out.println("HIGH priority - count " + i);
            }
        }, "HighPriorityThread");

        low.setPriority(Thread.MIN_PRIORITY);   // 1
        high.setPriority(Thread.MAX_PRIORITY);  // 10

        System.out.println("Low thread priority: " + low.getPriority());
        System.out.println("High thread priority: " + high.getPriority());

        low.start();
        high.start();
        // NOTE: setting MAX_PRIORITY on "high" does NOT guarantee its
        // lines print before "low"'s lines. The interleaving of the
        // "LOW priority" / "HIGH priority" lines below is scheduler-
        // and platform-dependent and can change between runs - that is
        // exactly the point of this demo.
    }
}
// OUTPUT (fixed part is deterministic; the interleaving of the two
// threads' loop output is NOT - only the first two lines are guaranteed):
// Low thread priority: 1
// High thread priority: 10
// (then 6 more lines from both threads, in a non-deterministic order)`
                                ]
                            },
                            {
                                content: `<h3>join() — Waiting for a Thread to Finish</h3>
By default, once you call <code>start()</code>, the calling thread does NOT wait for the new thread to complete - both proceed independently and their output can interleave unpredictably. <code>join()</code> makes the calling thread pause until the target thread finishes (or until an optional timeout elapses), which is how you get deterministic, ordered output when you actually need it.<br>`,
                                codeExamples: [
                                    `// WITHOUT join(): main thread does not wait - output order between
// "main" and "worker" is NOT guaranteed.
public class WithoutJoinDemo {
    public static void main(String[] args) {
        Thread worker = new Thread(() -> {
            try {
                Thread.sleep(200);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
            System.out.println("Worker: finished doing work");
        });

        worker.start();
        System.out.println("Main: reached end of main() immediately");
        // Main almost certainly prints BEFORE Worker here because Worker
        // sleeps for 200ms, but this is a race, not a guarantee.
    }
}
// OUTPUT (typical, but the order is not guaranteed by the language spec):
// Main: reached end of main() immediately
// Worker: finished doing work`,

                                    `// WITH join(): main thread BLOCKS until worker completes -
// this ordering IS guaranteed.
public class WithJoinDemo {
    public static void main(String[] args) throws InterruptedException {
        Thread worker = new Thread(() -> {
            try {
                Thread.sleep(200);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
            System.out.println("Worker: finished doing work");
        });

        worker.start();
        worker.join();   // main BLOCKS here until worker's run() returns
        System.out.println("Main: worker is done, safe to continue");
    }
}
// OUTPUT (this exact order is guaranteed because of join()):
// Worker: finished doing work
// Main: worker is done, safe to continue`,

                                    `// join(long millis): wait only up to a timeout, then move on
// regardless of whether the thread finished.
public class JoinWithTimeoutDemo {
    public static void main(String[] args) throws InterruptedException {
        Thread slowWorker = new Thread(() -> {
            try {
                Thread.sleep(2000); // simulate a slow task
            } catch (InterruptedException ignored) {}
            System.out.println("Slow worker eventually finished");
        });

        slowWorker.start();
        slowWorker.join(100); // wait at most 100ms, then continue
        System.out.println("Main: gave up after 100ms, isAlive=" + slowWorker.isAlive());
    }
}
// OUTPUT:
// Main: gave up after 100ms, isAlive=true
// (then, about 1.9 seconds later, printed by the still-running slowWorker thread:)
// Slow worker eventually finished`
                                ]
                            },
                            {
                                content: `<h3>Beyond Raw Threads: the ExecutorService / Thread Pool Approach</h3>
Manually creating a <code>new Thread(...)</code> for every task does not scale: unbounded thread creation exhausts memory and OS resources, and there is no easy way to reuse threads, queue excess work, or manage a shutdown sequence. Production Java code almost never calls <code>new Thread().start()</code> directly for application tasks - it uses the <code>java.util.concurrent</code> Executor framework, which manages a pool of reusable worker threads for you.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Manual Thread                      ExecutorService (thread pool)
--------------                     -----------------------------
new Thread(task).start()           executor.submit(task)
  |                                    |
  v                                    v
1 task  -> 1 brand-new OS thread    N tasks -> reused from a fixed
(created & destroyed every time)    pool of worker threads
  |                                    |
No built-in queueing,               Built-in task queue, thread reuse,
no lifecycle management             graceful shutdown() / awaitTermination()</pre>

Common factory methods on <code>Executors</code>: <code>newFixedThreadPool(n)</code>, <code>newSingleThreadExecutor()</code>, <code>newCachedThreadPool()</code>, and (Java 21+) <code>newVirtualThreadPerTaskExecutor()</code>. Always call <code>shutdown()</code> when done so pooled threads can terminate.<br>`,
                                codeExamples: [
                                    `import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class ExecutorDemo {
    public static void main(String[] args) {
        // A pool of just 2 worker threads handles 5 tasks
        ExecutorService pool = Executors.newFixedThreadPool(2);

        for (int i = 1; i <= 5; i++) {
            int taskId = i;
            pool.submit(() -> {
                String t = Thread.currentThread().getName();
                System.out.println("Task " + taskId + " running on " + t);
            });
        }

        pool.shutdown(); // no more tasks accepted; pool threads exit once queue drains
    }
}
// OUTPUT (5 lines total; exact task-to-thread assignment and ordering
// between the 2 pooled threads is NOT guaranteed - only that all 5
// tasks run exactly once, each on one of the 2 pool threads):
// Task 1 running on pool-1-thread-1
// Task 2 running on pool-1-thread-2
// Task 3 running on pool-1-thread-1
// Task 4 running on pool-1-thread-2
// Task 5 running on pool-1-thread-1`,

                                    `import java.util.concurrent.*;

// Callable + Future: submit a task that RETURNS a value and
// wait for the result (this blocks, similar in spirit to join()).
public class CallableFutureDemo {
    public static void main(String[] args) throws Exception {
        ExecutorService pool = Executors.newSingleThreadExecutor();

        Callable<Integer> sumTask = () -> {
            int sum = 0;
            for (int i = 1; i <= 100; i++) sum += i;
            return sum;
        };

        Future<Integer> future = pool.submit(sumTask);
        System.out.println("Result: " + future.get()); // blocks until sumTask completes

        pool.shutdown();
    }
}
// OUTPUT:
// Result: 5050`
                                ]
                            },
                            {
                                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why is implementing Runnable generally preferred over extending Thread?</td><td>Java allows only single inheritance, so extending Thread uses up your one superclass slot; Runnable also decouples the task from the threading mechanism, letting the same task run on a raw Thread, an ExecutorService, or directly</td></tr>
<tr class='text-center'><td>What happens if you call run() directly instead of start()?</td><td>It executes like a normal method call on the current thread - no new thread is created, and none of the JVM's thread-scheduling machinery is invoked</td></tr>
<tr class='text-center'><td>Can you call start() twice on the same Thread object?</td><td>No - it throws IllegalThreadStateException; a Thread instance can be started only once, ever</td></tr>
<tr class='text-center'><td>Does a higher thread priority guarantee that thread runs first?</td><td>No - priority is only a scheduling hint to the OS/JVM; actual behavior is platform-dependent and not guaranteed by the Java specification</td></tr>
<tr class='text-center'><td>What does join() do, and why is it needed?</td><td>It makes the calling thread block until the target thread finishes (or a timeout elapses) - needed whenever you require deterministic ordering between a spawned thread and the thread that started it</td></tr>
<tr class='text-center'><td>Why prefer ExecutorService over manually creating Thread objects?</td><td>Manually creating unbounded threads wastes memory/OS resources and has no reuse or queueing; ExecutorService manages a pool of reusable worker threads with built-in task queueing and graceful shutdown</td></tr>
<tr class='text-center'><td>What is the difference between Runnable and Callable in the Executor framework?</td><td>Runnable's run() returns void and cannot throw checked exceptions; Callable's call() returns a value (via Future) and can throw checked exceptions</td></tr>
<tr class='text-center'><td>What must you remember to do after submitting tasks to an ExecutorService?</td><td>Call shutdown() (or shutdownNow()) so the pool's worker threads are allowed to terminate once queued/running tasks complete - otherwise the JVM may not exit</td></tr>
</table>`
                            },
                            {
                                content: `<h3>1. Definition (Advanced)</h3>
• At production level, multithreading is not just <code>new Thread()</code>. It is the <b>Java Memory Model (JMM)</b> plus the <code>java.util.concurrent</code> toolkit.<br>
• The JMM defines <b>happens before</b> rules. Without such a rule, one thread may never see the value another thread wrote, because of CPU caches and compiler reordering.<br>
• A Java thread is normally a <b>platform thread</b> mapped one to one on an OS thread. From Java 21 a <b>virtual thread</b> is a lightweight thread managed by the JVM, so lakhs of them can exist.<br><br>

<h3>2. Purpose of This Topic (Advanced)</h3>
• The purpose is to build systems that scale to high throughput without corrupting data and without leaking resources.<br>
• It teaches you to pick the right tool: <code>ExecutorService</code> for CPU work, <code>CompletableFuture</code> for pipelines, virtual threads for blocking IO.<br>
• It also teaches safe shutdown, which every production service needs so that in flight payments are not lost during a deploy.<br><br>

<h3>3. Need of This Topic (Advanced)</h3>
• A NEFT settlement service that handles 50000 transactions per minute cannot create a thread per transaction. It needs a bounded pool and back pressure.<br>
• Interviewers ask about <code>volatile</code>, <code>synchronized</code>, <code>AtomicInteger</code> and thread pool sizing because these decide whether money is counted correctly.<br>
• Debugging a production hang needs knowledge of thread dumps, deadlock detection and pool starvation.<br>`,
                                codeExamples: [
                                    `import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicLong;

// Advanced points 1, 2 and 3.
// A UPI settlement engine: bounded pool, visibility, safe shutdown.
public class UpiSettlementEngine {

    // WRONG: a plain boolean may be cached by a thread and never refreshed
    static boolean wrongStopFlag = false;

    // RIGHT: volatile gives a happens before edge so every thread sees the write
    static volatile boolean stopFlag = false;

    // RIGHT: atomic counter, no lost updates across threads
    static final AtomicLong settledPaise = new AtomicLong(0);

    public static void main(String[] args) throws Exception {

        // POINT 3: bounded pool with a bounded queue gives back pressure
        ThreadPoolExecutor pool = new ThreadPoolExecutor(
                4, 4,
                60L, TimeUnit.SECONDS,
                new ArrayBlockingQueue<>(100),
                // CallerRunsPolicy slows the producer instead of dropping work
                new ThreadPoolExecutor.CallerRunsPolicy());

        for (int i = 1; i <= 200; i++) {
            final long amountPaise = 25000L; // 250 rupees
            pool.submit(() -> settledPaise.addAndGet(amountPaise));
        }

        // POINT 2: graceful shutdown, never just abandon the pool
        pool.shutdown();
        if (!pool.awaitTermination(10, TimeUnit.SECONDS)) {
            pool.shutdownNow();
        }

        System.out.println("Total settled: " + (settledPaise.get() / 100) + " rupees");

        // POINT 1: volatile flag actually stops the worker
        Thread worker = new Thread(() -> {
            long spins = 0;
            while (!stopFlag) {
                spins++;
            }
            String amount = spins > 0 ? "many" : "zero";
            System.out.println("Worker stopped after " + amount + " spins");
        });
        worker.start();
        Thread.sleep(100);
        stopFlag = true;   // visible to the worker because of volatile
        worker.join();
        System.out.println("wrongStopFlag (never used) is still: " + wrongStopFlag);
    }
}
// OUTPUT:
// Total settled: 50000 rupees
// Worker stopped after many spins
// wrongStopFlag (never used) is still: false`
                                ]
                            },
                            {
                                content: `<h3>4. Advantages (Advanced)</h3>
• <b>Throughput at scale:</b> a tuned pool keeps every core busy and turns a batch job that took 8 hours into one that takes 40 minutes.<br>
• <b>Latency hiding:</b> with <code>CompletableFuture</code> you fire three downstream calls together, so the response time is the slowest call and not their sum.<br>
• <b>Bounded resource use:</b> a fixed pool plus a bounded queue protects the service from an out of memory crash during a traffic spike.<br>
• <b>Virtual threads (Java 21):</b> blocking IO code stays simple to read yet scales to lakhs of concurrent requests.<br>
• <b>Composable primitives:</b> <code>CountDownLatch</code>, <code>Semaphore</code>, <code>ConcurrentHashMap</code> remove the need for hand written locks.<br><br>

<h3>5. Disadvantages (Advanced)</h3>
• <b>Non deterministic bugs:</b> a race may appear once in a lakh runs, usually in production and never on your laptop.<br>
• <b>Deadlock and livelock:</b> two locks taken in different order will hang the service and need a thread dump to diagnose.<br>
• <b>Thread pool starvation:</b> a task that blocks waiting for another task in the same pool can freeze the whole pool.<br>
• <b>False sharing and cache line contention</b> can make a multithreaded version slower than the single threaded one.<br>
• <b>ThreadLocal leaks:</b> values left on pooled threads leak memory and can expose one user data to the next request.<br>
• <b>Testing cost:</b> concurrency needs stress tests, and correctness cannot be proved by a single unit test.<br>`,
                                codeExamples: [
                                    `import java.util.concurrent.*;

// Advanced points 4 and 5.
// Advantage: parallel downstream calls. Disadvantage: deadlock by lock ordering.
public class ConcurrencyProsAndCons {

    static final Object ledgerLock = new Object();
    static final Object auditLock = new Object();

    public static void main(String[] args) throws Exception {

        // POINT 4: three independent service calls run together
        ExecutorService pool = Executors.newFixedThreadPool(3);
        long start = System.currentTimeMillis();

        CompletableFuture<String> kyc =
                CompletableFuture.supplyAsync(() -> call("KYC service"), pool);
        CompletableFuture<String> limit =
                CompletableFuture.supplyAsync(() -> call("Limit service"), pool);
        CompletableFuture<String> fraud =
                CompletableFuture.supplyAsync(() -> call("Fraud service"), pool);

        CompletableFuture.allOf(kyc, limit, fraud).join();
        System.out.println(kyc.get() + ", " + limit.get() + ", " + fraud.get());
        System.out.println("Latency: about " + (System.currentTimeMillis() - start)
                + " ms instead of 900 ms");
        pool.shutdown();

        // POINT 5: WRONG lock ordering can deadlock
        Thread a = new Thread(() -> {
            synchronized (ledgerLock) {
                sleep(50);
                synchronized (auditLock) {   // waits for b
                    System.out.println("A finished");
                }
            }
        }, "Txn-A");

        Thread b = new Thread(() -> {
            synchronized (auditLock) {       // WRONG: opposite order
                sleep(50);
                synchronized (ledgerLock) {  // waits for a, deadlock
                    System.out.println("B finished");
                }
            }
        }, "Txn-B");

        a.start();
        b.start();
        a.join(1000);
        b.join(1000);
        System.out.println("Deadlock detected, both threads still alive: "
                + (a.isAlive() && b.isAlive()));
        System.out.println("RIGHT fix: always take ledgerLock first, then auditLock");
        System.exit(0); // needed because the two threads are stuck
    }

    static String call(String name) {
        sleep(300);
        return name + " ok";
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
// KYC service ok, Limit service ok, Fraud service ok
// Latency: about 310 ms instead of 900 ms
// Deadlock detected, both threads still alive: true
// RIGHT fix: always take ledgerLock first, then auditLock`
                                ]
                            },
                            {
                                content: `<h3>6. Real Time Examples (Advanced)</h3>
• <b>NPCI UPI switch:</b> handles crores of transactions a day using bounded thread pools per stage and idempotent retries, so a duplicate request never debits twice.<br>
• <b>Spring Boot on Tomcat:</b> the container keeps a pool of worker threads. Setting <code>server.tomcat.threads.max</code> too high causes memory pressure, too low causes queueing.<br>
• <b>Zomato or Swiggy order pipeline:</b> when an order is placed, restaurant confirmation, rider assignment and payment capture run in parallel as <code>CompletableFuture</code> stages.<br>
• <b>Kafka consumer group:</b> each partition is handled by one thread so message order inside a partition is preserved while different partitions run in parallel.<br>
• <b>Bank end of day batch:</b> a Spring Batch job partitions accounts across threads. A shared <code>AtomicLong</code> holds the total and a <code>CountDownLatch</code> waits for all partitions.<br>
• <b>Global example:</b> Netflix uses bulkheads, one small pool per downstream service, so a slow recommendation service cannot exhaust the threads needed for video playback.<br>`,
                                codeExamples: [
                                    `import java.util.concurrent.*;

// Advanced point 6: bulkhead pattern plus a latch, as used in a
// bank end of day batch that also calls a slow external service.
public class BulkheadBatchDemo {

    public static void main(String[] args) throws Exception {

        // RIGHT: separate small pool per downstream, so one slow service
        // cannot eat every thread the critical work needs
        ExecutorService criticalPool = Executors.newFixedThreadPool(4);
        ExecutorService reportingPool = Executors.newFixedThreadPool(1);

        int partitions = 4;
        CountDownLatch latch = new CountDownLatch(partitions);
        ConcurrentHashMap<String, Long> totalsByBranch = new ConcurrentHashMap<>();

        String[] branches = {"Pune", "Mumbai", "Delhi", "Chennai"};

        for (String branch : branches) {
            criticalPool.submit(() -> {
                try {
                    long sum = 0;
                    for (int i = 1; i <= 1000; i++) {
                        sum += 500L; // 500 rupees per account
                    }
                    // merge is atomic on ConcurrentHashMap
                    totalsByBranch.merge(branch, sum, Long::sum);
                } finally {
                    latch.countDown(); // always count down, even on failure
                }
            });
        }

        // The slow report never blocks the critical pool
        reportingPool.submit(() -> {
            try {
                Thread.sleep(2000);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
            System.out.println("Slow reporting service replied");
        });

        boolean finished = latch.await(5, TimeUnit.SECONDS);
        System.out.println("All partitions finished: " + finished);
        System.out.println("Pune total: " + totalsByBranch.get("Pune") + " rupees");
        System.out.println("Branches settled: " + totalsByBranch.size());

        criticalPool.shutdown();
        reportingPool.shutdownNow(); // we do not wait for the slow report
    }
}
// OUTPUT:
// All partitions finished: true
// Pune total: 500000 rupees
// Branches settled: 4`
                                ]
                            }
                        ]
                    };
