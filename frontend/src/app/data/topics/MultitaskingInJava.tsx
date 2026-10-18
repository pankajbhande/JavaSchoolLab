import { Topic } from '../coreJava';
import multitaskingImg from '../../../assets/multitasking.jpg';

export const multitaskingInJava: Topic = {
                        id: `Multitasking in Java`,
                        name: `Multitasking in Java`,
                        beginner: [
                            {
                                content: `Multitasking in Java refers to the system's ability to run multiple tasks concurrently, primarily achieved through
                Process-based multitasking (running different Java apps or OS apps simultaneously) and Thread-based multitasking (multithreading),
                where a single Java program performs multiple tasks (threads) concurrently, sharing resources for better efficiency and responsiveness,
                using java.lang.Thread and Runnable for implementation.<br>

                Multithreading is Java's key to efficient resource use, allowing tasks like UI updates and background processing to run in parallel<br><br>
                <h4> Types of Multitasking in Java</h4>
1. Process-based Multitasking: <br>
• Definition: Running multiple independent programs (processes) at the same time, managed by the Operating System (OS).
• Example: Using a web browser, media player, and code editor simultaneously. <br>
• Key Feature: Each process has its own memory space, providing isolation. <br><br>
2. Thread-based Multitasking (Multithreading):<br>
• Definition: Executing multiple threads (lightweight sub-processes) within a single Java program concurrently, within the same memory space. <br>
• Example: Formatting text while printing in a word processor, or a server handling multiple client requests. <br>
• Key Feature: Threads share resources, leading to faster execution and better CPU utilization for complex tasks. <br>`

                            },
                            {
                                content: `<h4>How Java Actually Creates a New Process</h4>
Thread-based multitasking is built into the language via <code>Thread</code>/<code>Runnable</code>, but Java can also trigger true <b>process-based</b> multitasking - launching a brand-new OS process (with its own separate memory and its own JVM/executable) - using <code>ProcessBuilder</code> (or the older <code>Runtime.exec()</code>).<br>`,
                                codeExamples: [
                                    `public class ProcessDemo {

    public static void main(String[] args) throws Exception {

        new ProcessBuilder("notepad").start();
        new ProcessBuilder("calc").start();

        System.out.println("Two independent processes started.");
    }
}
// OUTPUT:
// Two independent processes started.
// (Notepad and Calculator open as two separate OS processes, each
//  with its own memory space - completely isolated from the JVM
//  that launched them and from each other.)`
                                ]
                            }
                        ],
                        intermediate: [
                            {
                                content: `Process of executing multiple tasks simultaneously. We use multitasking to utilize the CPU.<br>
• Multitasking is when a single CPU performs several tasks (program, process, task, threads) at the
same time. To perform multitasking, the CPU switches among these tasks very frequently so that
user can interact with each program simultaneously.<br>
• In a multitasking operating system, several users can share the system simultaneously. CPU rapidly
switches among the tasks, so a little time is needed to switch from one user to the next user. This
puts an impression on a user that entire computer system is dedicated to him.<br><br>
 <img src="${multitaskingImg}" alt="Multitasking overview" class="d-block mx-auto"/><br>

• When several users are sharing a multitasking operating system, CPU scheduling and
multiprogramming makes it possible for each user to have at least a small portion of Multitasking
OS and let each user have at least one program in the memory for execution.<br>

<h4>Multitasking can be achieved in two ways:</h4>
• Process-based Multitasking (Multiprocessing)<br>
• Thread-based Multitasking (Multithreading)<br>
Example:<br> In online session, what are the different activities done by students as?<br>
• Listen the class<br>
• Taking running notes<br>
• Checking mobile<br>

<h4>1. Process Based / Process Based Multitasking (Multiprocessing):</h4>
• Executing several tasks simultaneously where each task is separate independent process such
as multitasking is called as Process Based.<br>
Example <br>
1: Typing java program into eclipse, also listening the audio songs, download a file from
internet.<br>
2. In this every activity is independent process here.<br>

Example<br>
2: Task manager, see the multiple process list. (Control+Shift+Esc key)<br>
• Cost of communication between the process is high.<br>
• Switching from one process to another requires some time for saving and loading registers, memory
maps, updating lists, etc.<br>
• Process is heavy weight components.<br>
• Each process has an own address in memory. In other words, each process allocates a separate
memory area.<br>

<h4>2. Thread Based / Thread Based Multitasking (Multithreading):</h4>

• Executing several tasks simultaneously where each task is separate part of same program called as
thread based.<br>
Example-<br> suppose I have 1000 lines of code into java program and it will takes 4 hours to execute it
where first 500 line is executed after that remaining 500 lines is executed but there is no any
dependency between them so I can run that tasks simultaneously to minimize the execution time.<br>
• Thread shares the same address space.<br>
• Thread is light weight components.<br>
• Cost of communication between the thread is low.<br>


<table border="2" cellpadding="15" cellspacing="0" style="border-collapse: collapse; width: 100%;">
  <tr style="background-color: #4CAF50; color: white;">
    <th style="border: 2px solid #333;">Process-Based Multitasking</th>
    <th style="border: 2px solid #333;">Thread-Based Multitasking</th>
  </tr>
  <tr style="background-color: #f2f2f2;">
    <td style="border: 2px solid #333;">This deals with "Big Picture"</td>
    <td style="border: 2px solid #333;">This deals with Details</td>
  </tr>
  <tr>
    <td style="border: 2px solid #333;">These are Heavyweight tasks</td>
    <td style="border: 2px solid #333;">These are Lightweight tasks</td>
  </tr>
  <tr style="background-color: #f2f2f2;">
    <td style="border: 2px solid #333;">Inter-process communication is expensive and limited </td>
    <td style="border: 2px solid #333;">Inter-thread communication is inexpensive</td>
  </tr>
  <tr>
    <td style="border: 2px solid #333;">Context switching from one process to another is costly in terms of memory</td>
    <td style="border: 2px solid #333;">Context switching is low cost in terms of memory , because they run on the same address space</td>
  </tr>
  <tr style="background-color: #f2f2f2;">
    <td style="border: 2px solid #333;">This is not under the control of Java </td>
    <td style="border: 2px solid #333;">This is controlled by Java</td>
  </tr>
</table>

`,
                            }
                        ],

                        expert: [
                            {
                                content: `<h3>Process-Based vs Thread-Based Multitasking: Memory Model</h3>
The fundamental difference between the two forms of multitasking is <strong>where the memory boundary is drawn</strong>. A process gets its own isolated address space from the OS; a thread lives inside an address space that is already shared with its sibling threads.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">PROCESS-BASED MULTITASKING (Multiprocessing)
+------------------+   +------------------+   +------------------+
|   Process A      |   |   Process B      |   |   Process C      |
|  (e.g. browser)   |   |  (e.g. IDE)       |   |  (e.g. JVM)       |
|  own heap         |   |  own heap         |   |  own heap         |
|  own stack(s)      |   |  own stack(s)      |   |  own stack(s)      |
|  own file handles  |   |  own file handles  |   |  own file handles  |
+------------------+   +------------------+   +------------------+
        No shared memory - OS enforces isolation. Heavyweight
        context switch: save/restore full CPU register set,
        memory maps (page tables), open file tables, etc.

THREAD-BASED MULTITASKING (Multithreading) - inside ONE process
+--------------------------------------------------------------+
|                    Single JVM Process                        |
|   +-----------+   +-----------+   +-----------+              |
|   | Thread-1  |   | Thread-2  |   | Thread-3  |              |
|   | own stack |   | own stack |   | own stack |              |
|   +-----------+   +-----------+   +-----------+              |
|            \            |            /                        |
|             \           |           /                         |
|          Shared Heap + Shared Static/Class data               |
+--------------------------------------------------------------+
        Threads share heap & static memory. Lightweight context
        switch: only registers + program counter + own stack
        pointer need saving - no page table / memory map swap.</pre>

• <strong>Process-based:</strong> each process (e.g. a browser, an IDE, a music player) has its own memory space - isolated, safe, but expensive to switch between and expensive to communicate across (needs IPC - pipes, sockets, shared memory files).<br>
• <strong>Thread-based:</strong> all threads of one Java program run inside the same process, so they automatically share the heap and static fields - no IPC needed, communication is as cheap as reading/writing a shared variable.<br>`
                            },
                            {
                                content: `<h3>Proof: Multiple Threads, One Process, Shared Memory</h3>
The demo below starts 3 threads from a single <code>main()</code>. Each thread prints its own name (proving they are distinct threads) alongside a <strong>shared static counter</strong> (proving they all read/write the SAME memory, because they belong to the SAME process). If these were separate OS processes instead of threads, none of them could see or modify another's counter without explicit IPC.<br>`,
                                codeExamples: [
                                    `public class SharedMemoryDemo {

    // Shared across ALL threads because they live in the same process
    static int sharedCounter = 0;

    public static void main(String[] args) throws InterruptedException {
        Runnable task = () -> {
            synchronized (SharedMemoryDemo.class) {
                sharedCounter++;
                System.out.println(Thread.currentThread().getName()
                        + " incremented sharedCounter to " + sharedCounter);
            }
        };

        Thread t1 = new Thread(task, "Worker-1");
        Thread t2 = new Thread(task, "Worker-2");
        Thread t3 = new Thread(task, "Worker-3");

        t1.start();
        t1.join();
        t2.start();
        t2.join();
        t3.start();
        t3.join();

        System.out.println("Final sharedCounter (same process, same memory) = " + sharedCounter);
    }
}
// OUTPUT:
// Worker-1 incremented sharedCounter to 1
// Worker-2 incremented sharedCounter to 2
// Worker-3 incremented sharedCounter to 3
// Final sharedCounter (same process, same memory) = 3`
                                ]
                            },
                            {
                                content: `Each thread still has its own private call stack and its own local variables - only the heap/static area is shared. The next demo proves both halves of that claim in one program: a <strong>local variable</strong> is independent per thread, while a <strong>static field</strong> is the same memory for every thread.<br>`,
                                codeExamples: [
                                    `public class StackVsHeapDemo {

    static int sharedInstanceOfProcessMemory = 100; // one copy, shared by all threads

    static void showLocalAndShared(String label) {
        int localToThisThread = 0; // own stack - every thread gets a fresh copy
        for (int i = 0; i < 3; i++) {
            localToThisThread++;
        }
        System.out.println(label + " -> localToThisThread=" + localToThisThread
                + ", sharedInstanceOfProcessMemory=" + sharedInstanceOfProcessMemory);
    }

    public static void main(String[] args) throws InterruptedException {
        Thread t1 = new Thread(() -> showLocalAndShared("Thread-A"));
        Thread t2 = new Thread(() -> showLocalAndShared("Thread-B"));
        t1.start(); t1.join();
        t2.start(); t2.join();
    }
}
// OUTPUT:
// Thread-A -> localToThisThread=3, sharedInstanceOfProcessMemory=100
// Thread-B -> localToThisThread=3, sharedInstanceOfProcessMemory=100`
                                ]
                            },
                            {
                                content: `<h3>Why Threads Are Cheaper Than Processes</h3>
For an application that needs many concurrent units of work (a web server handling thousands of requests, for example), spinning up an OS process per task is far too expensive - threads are the practical choice. The table below compares the cost of a context switch in each model.<br><br>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>Process Context Switch</th><th>Thread Context Switch</th></tr>
<tr class='text-center'><td>Memory map / page table</td><td>Must be swapped (TLB flush)</td><td>Same for all threads - not touched</td></tr>
<tr class='text-center'><td>CPU cache effect</td><td>Cold cache after switch (different process' data)</td><td>Cache often stays warmer - same process' data</td></tr>
<tr class='text-center'><td>Creation cost</td><td>High - OS allocates new address space, file tables, etc.</td><td>Low - just a new stack + thread control block</td></tr>
<tr class='text-center'><td>Communication cost</td><td>High - needs IPC (pipes, sockets, shared memory)</td><td>Low - direct read/write of shared heap/static fields</td></tr>
<tr class='text-center'><td>Isolation / safety</td><td>Strong - one process crashing doesn't affect another</td><td>Weaker - an unsynchronized thread can corrupt shared data of the whole process</td></tr>
<tr class='text-center'><td>Typical scale</td><td>Tens to hundreds per machine</td><td>Thousands per single JVM process is feasible</td></tr>
</table>
<br>
This is exactly why a single Java application uses <strong>thread-based multitasking internally</strong> (via <code>Thread</code>/<code>Runnable</code>/<code>ExecutorService</code>) rather than spawning a new OS process for every concurrent task - the per-task overhead of a thread is a small fraction of the overhead of a process.<br>`
                            },
                            {
                                content: `<h3>Concurrency vs Parallelism - It Depends on CPU Cores</h3>
Multitasking makes tasks <em>appear</em> to run at the same time, but whether they are truly simultaneous depends on the hardware:<br><br>
• <strong>Concurrency:</strong> multiple tasks make progress by being interleaved on a single CPU core - the OS/JVM rapidly switches between them, so no two instructions from different tasks execute at the exact same instant.<br>
• <strong>Parallelism:</strong> multiple tasks genuinely execute at the exact same instant, each on its own CPU core.<br>
A multi-core machine running multiple threads gets both: parallelism across cores, and concurrency (interleaving) among any threads that outnumber the available cores.<br>`,
                                codeExamples: [
                                    `public class CoreCheckDemo {
    public static void main(String[] args) {
        int cores = Runtime.getRuntime().availableProcessors();
        System.out.println("Available CPU cores to this JVM: " + cores);

        if (cores > 1) {
            System.out.println("True parallel execution of threads is possible.");
        } else {
            System.out.println("Only concurrency (interleaving) is possible on this single core.");
        }
    }
}
// OUTPUT (example on a 8-core machine, actual number varies by machine):
// Available CPU cores to this JVM: 8
// True parallel execution of threads is possible.`
                                ]
                            },
                            {
                                content: `<h3>Interview Questions</h3>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is multitasking?</td><td>The ability of a system to execute more than one task at the same time (or apparently at the same time)</td></tr>
<tr class='text-center'><td>What are the two types of multitasking?</td><td>Process-based multitasking (multiprocessing) and thread-based multitasking (multithreading)</td></tr>
<tr class='text-center'><td>What is the key memory difference between a process and a thread?</td><td>Each process has its own isolated memory space; threads of the same process share that process' heap and static memory</td></tr>
<tr class='text-center'><td>Why is a thread called "lightweight" compared to a process?</td><td>Creating/switching a thread doesn't require allocating a new address space or swapping memory maps - only a new stack and CPU register state are involved</td></tr>
<tr class='text-center'><td>Why is inter-thread communication cheaper than inter-process communication?</td><td>Threads already share memory, so they communicate via ordinary shared variables; processes are isolated and need OS-level IPC mechanisms (pipes, sockets, shared memory)</td></tr>
<tr class='text-center'><td>What is the difference between concurrency and parallelism?</td><td>Concurrency is multiple tasks making progress via interleaving (possibly on one core); parallelism is multiple tasks executing at literally the same instant on separate cores</td></tr>
<tr class='text-center'><td>How can you find out how many CPU cores are available to the JVM?</td><td><code>Runtime.getRuntime().availableProcessors()</code></td></tr>
<tr class='text-center'><td>Does having more threads than CPU cores still help performance?</td><td>Yes for I/O-bound or blocking tasks, since idle threads (waiting on I/O) let the OS schedule other threads on the same core - though for pure CPU-bound work, threads beyond the core count add context-switch overhead without real parallel gain</td></tr>
<tr class='text-center'><td>Which classes does Java provide to implement thread-based multitasking?</td><td><code>java.lang.Thread</code> and the <code>java.lang.Runnable</code> interface, plus higher-level utilities like <code>ExecutorService</code></td></tr>
</table>`
                            }
                        ]
                    };
