import { Topic } from '../coreJava';

export const threadDumps: Topic = {
    id: 'thread-dumps',
    name: 'Thread Dumps',
    beginner: [
        {
            content: `<h3>What is a Thread Dump?</h3>
A thread dump is a snapshot of every thread running inside the JVM at a single moment - what each thread is doing
right now, and its full call stack. It's a plain text report, not a binary file like a heap dump, so you can read it
directly in a terminal or editor. <br><br>
Thread dumps are the go-to tool when an application seems <strong>stuck, hung, or unresponsive</strong> - they show
you exactly what every thread was doing at the moment things froze.`
        },
        {
            content: `<h3>What Does a Thread Dump Show You?</h3>
For every single thread, a thread dump shows: <br>
• The thread's name and ID. <br>
• Its current <strong>state</strong> (RUNNABLE, BLOCKED, WAITING, TIMED_WAITING, etc). <br>
• Its full stack trace - which method it's currently executing, and the chain of calls that got it there. <br>
• Any locks it holds or is waiting for.`,
            codeExamples: [`"http-nio-8080-exec-3" #45 daemon prio=5 os_prio=0 tid=0x00007f cpu=120.50ms
   java.lang.Thread.State: RUNNABLE
        at com.myapp.service.OrderService.calculateTotal(OrderService.java:88)
        at com.myapp.controller.OrderController.checkout(OrderController.java:41)
        at java.base/java.lang.reflect.Method.invoke(Method.java:568)`]
        },
        {
            content: `<h3>Generating a Thread Dump with jstack</h3>
The simplest way to get a thread dump is with the <code>jstack</code> command-line tool included in the JDK.`,
            codeExamples: [`# Find the process ID
jps -l

# Capture a thread dump to a file
jstack 12345 > thread_dump.txt`]
        },
        {
            content: `<h3>Generating a Thread Dump with kill -3 (Linux/Mac)</h3>
On Unix-like systems, you can also send a <code>SIGQUIT</code> signal (signal 3) directly to the Java process. The
JVM catches this signal and prints the thread dump to standard output/its log file, rather than terminating the
process (despite "kill" being in the command name).`,
            codeExamples: [`# Send SIGQUIT to trigger a thread dump - written to the app's stdout/log, not a separate file
kill -3 12345`]
        },
        {
            content: `<h3>Common Thread States You'll See</h3>
• <strong>RUNNABLE</strong> - actively executing code or ready to run on the CPU. <br>
• <strong>BLOCKED</strong> - waiting to acquire a <code>synchronized</code> lock held by another thread. <br>
• <strong>WAITING</strong> - waiting indefinitely for another thread's signal (e.g. <code>Object.wait()</code>,
<code>Thread.join()</code>). <br>
• <strong>TIMED_WAITING</strong> - waiting, but with a timeout (e.g. <code>Thread.sleep()</code>). <br><br>
Seeing many threads stuck in BLOCKED state at the same spot is a strong hint of lock contention or a deadlock.`
        }
    ],

    expert: [
        {
            content: `<h3>Detecting a Deadlock in a Thread Dump</h3>
When two or more threads are each waiting for a lock the other one holds, they deadlock permanently. <code>jstack</code>
is smart enough to detect this pattern automatically and prints a dedicated section at the end of the dump. <br><br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Found one Java-level deadlock:
=============================
"Thread-1":
  waiting to lock monitor 0x00007f8a1c003f28 (object 0x000000076ac03a70, a java.lang.Object),
  which is held by "Thread-2"
"Thread-2":
  waiting to lock monitor 0x00007f8a1c001a08 (object 0x000000076ac03a80, a java.lang.Object),
  which is held by "Thread-1"

Java stack information for the threads listed above:
===================================================
"Thread-1":
        at com.myapp.TransferService.transfer(TransferService.java:22)
        - waiting to lock &lt;0x000000076ac03a70&gt; (a java.lang.Object)
        - locked &lt;0x000000076ac03a80&gt; (a java.lang.Object)
"Thread-2":
        at com.myapp.TransferService.transfer(TransferService.java:22)
        - waiting to lock &lt;0x000000076ac03a80&gt; (a java.lang.Object)
        - locked &lt;0x000000076ac03a70&gt; (a java.lang.Object)</pre>
This is the textbook "lock ordering" deadlock: two threads acquire the same two locks in opposite order.`
        },
        {
            content: `<h3>Reading BLOCKED vs Lock-Owner Relationships</h3>
When a thread is <code>BLOCKED</code>, its stack trace includes a line like
<code>- waiting to lock &lt;0xADDRESS&gt; (a com.myapp.Account)</code>. Somewhere else in the same dump, another thread
will show <code>- locked &lt;0xADDRESS&gt;</code> for the same address - that's the thread currently holding the
lock you need to find. <br><br>
This lets you manually trace lock-contention chains even when <code>jstack</code>'s automatic deadlock detector
doesn't fire (e.g. contention without a true cyclic deadlock, just severe serialization on one hot lock).`
        },
        {
            content: `<h3>Thread States - Full Reference</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>State</th><th>Meaning</th><th>Common Cause</th></tr>
<tr class='text-center'><td>NEW</td><td>Thread created but not yet started</td><td>Rare to catch in a dump; thread object exists, start() not called</td></tr>
<tr class='text-center'><td>RUNNABLE</td><td>Executing or ready to execute on CPU</td><td>Normal active work, or busy-spinning/CPU-bound code</td></tr>
<tr class='text-center'><td>BLOCKED</td><td>Waiting to enter a synchronized block/method</td><td>Lock contention, potential deadlock</td></tr>
<tr class='text-center'><td>WAITING</td><td>Waiting indefinitely for another thread</td><td>Object.wait(), Thread.join(), LockSupport.park()</td></tr>
<tr class='text-center'><td>TIMED_WAITING</td><td>Waiting with a timeout</td><td>Thread.sleep(), wait(timeout), a connection-pool checkout with timeout</td></tr>
<tr class='text-center'><td>TERMINATED</td><td>Thread has finished executing</td><td>run() method completed or threw an uncaught exception</td></tr>
</table>`
        },
        {
            content: `<h3>Multiple Dumps Over Time - The Real Diagnostic Technique</h3>
A single thread dump only shows one instant; the real skill is taking 3-5 dumps a few seconds apart during the
incident and comparing them: <br>
• If the same threads are stuck at the exact same stack frame across all dumps -&gt; genuinely stuck (deadlock,
infinite loop, or blocked on an external call with no timeout). <br>
• If threads are RUNNABLE but at different stack frames each time -&gt; the app is just slow/CPU-bound, not hung. <br>
• If threads are BLOCKED waiting on the same lock across dumps -&gt; strong lock contention, look at what's holding
it and why it's held so long.`,
            codeExamples: [`# Capture 5 thread dumps, 5 seconds apart, for comparison
for i in 1 2 3 4 5; do
  jstack 12345 > dump_$i.txt
  sleep 5
done`]
        },
        {
            content: `<h3>Production Troubleshooting Scenarios</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Symptom</th><th>Root Cause</th><th>Diagnosis</th><th>Fix</th></tr>
<tr><td>All request-handling threads eventually go BLOCKED and the app stops responding entirely</td><td>True deadlock between two locks acquired in inconsistent order (e.g. account transfer logic)</td><td>jstack's "Found one Java-level deadlock" section identifies the exact threads and locks</td><td>Enforce a consistent global lock ordering, or replace nested locking with a single lock / lock-free structure</td></tr>
<tr><td>Throughput degrades under load but no deadlock is reported</td><td>Severe contention on a single coarse-grained lock (e.g. a synchronized cache) - not cyclic, just serialized</td><td>Multiple dumps show many threads BLOCKED waiting on the same lock address, held briefly by a rotating single owner</td><td>Narrow the synchronized scope, use a concurrent collection (ConcurrentHashMap) or finer-grained locking</td></tr>
<tr><td>App hangs specifically when calling a downstream service, never recovers</td><td>A thread is TIMED_WAITING/RUNNABLE stuck inside a socket read with no timeout configured on the HTTP client</td><td>Stack trace shows the thread stuck inside the HTTP client's socket read across all dumps</td><td>Configure explicit connect/read timeouts on all outbound clients so threads never wait forever</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is a thread dump?</td><td>A snapshot of every thread's state and stack trace in a running JVM at a point in time</td></tr>
<tr><td>How do you generate a thread dump?</td><td>Use <code>jstack &lt;pid&gt;</code>, or send <code>kill -3 &lt;pid&gt;</code> on Unix systems to print it to the process's stdout/log</td></tr>
<tr><td>What thread states indicate a potential problem?</td><td>BLOCKED (waiting on a lock) most directly; many threads stuck at the same frame across repeated dumps in any waiting state also signals a problem</td></tr>
<tr><td>How does jstack detect a deadlock?</td><td>It analyzes the lock-wait graph across threads and reports cycles where thread A waits for a lock held by B, which waits for a lock held by A</td></tr>
<tr><td>Why take multiple thread dumps instead of just one?</td><td>A single dump only shows one instant; comparing several dumps a few seconds apart distinguishes a genuinely stuck thread from one that's just slow/CPU-bound</td></tr>
<tr><td>What's the difference between WAITING and TIMED_WAITING?</td><td>WAITING blocks indefinitely until another thread signals it; TIMED_WAITING blocks for a bounded time and resumes automatically on timeout</td></tr>
<tr><td>How would you diagnose a hang caused by a downstream call with no timeout?</td><td>Take a thread dump and look for a thread stuck inside the HTTP/socket client's read call across repeated dumps, then check if a read/connect timeout is configured</td></tr>
</table>`
        }
    ]
};
