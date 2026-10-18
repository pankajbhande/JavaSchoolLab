import { Topic } from '../coreJava';

export const jstackCommand: Topic = {
    id: 'jstack-command',
    name: 'jstack',
    beginner: [
        {
            content: `<h3>What is jstack?</h3>
<code>jstack</code> is a command-line tool bundled with the JDK that prints a <strong>thread dump</strong> - a
snapshot of every thread's state and stack trace - for a running Java process. It's the quickest way to check
"what is my application's threads actually doing right now?" without adding any monitoring code.`
        },
        {
            content: `<h3>Basic Usage</h3>
You first need the process ID (PID) of the running JVM, which you can get with <code>jps</code> (JVM Process
Status), then pass it to <code>jstack</code>.`,
            codeExamples: [`# List running Java processes with their main class name
jps -l
# Sample output:
# 12345 com.myapp.Application
# 8820  sun.tools.jps.Jps

# Print a thread dump for process 12345 to the terminal
jstack 12345

# Save the thread dump to a file for later analysis
jstack 12345 > thread_dump.txt`]
        },
        {
            content: `<h3>Reading a Basic jstack Entry</h3>
Each thread in the output looks like this - a header line with the thread's name/state, followed by its call stack
from the current point of execution downward.`,
            codeExamples: [`"main" #1 prio=5 os_prio=0 tid=0x00007f8ab4009800 nid=0x1a03 waiting on condition [0x00007f8ab7]
   java.lang.Thread.State: TIMED_WAITING (sleeping)
        at java.base/java.lang.Thread.sleep(Native Method)
        at com.myapp.Application.main(Application.java:15)`]
        },
        {
            content: `<h3>What -l and -F Options Do</h3>
• <code>jstack -l &lt;pid&gt;</code> - adds extra information about ownable synchronizers (java.util.concurrent
locks), not just built-in <code>synchronized</code> monitors. Useful if your app uses <code>ReentrantLock</code>. <br>
• <code>jstack -F &lt;pid&gt;</code> - "force" mode; use this if the process is hung so badly that a normal dump
request doesn't respond.`,
            codeExamples: [`# Include java.util.concurrent lock ownership details
jstack -l 12345

# Force a dump when the process isn't responding to a normal request
jstack -F 12345`]
        },
        {
            content: `<h3>Why Every Java Developer Should Know jstack</h3>
When production support asks "why is the app frozen," a thread dump from <code>jstack</code> is usually the fastest
and least invasive first step - it takes a fraction of a second, doesn't require restarting anything, and often
immediately reveals the culprit (a deadlock, a stuck external call, or threads piling up on one lock).`
        }
    ],

    expert: [
        {
            content: `<h3>Full Anatomy of a jstack Thread Entry</h3>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">"http-nio-8080-exec-7" #52 daemon prio=5 os_prio=0 cpu=340.10ms elapsed=612.44s tid=0x00007f allocated=48MB defined_classes=2
   java.lang.Thread.State: BLOCKED (on object monitor)
        at com.myapp.inventory.InventoryService.reserve(InventoryService.java:112)
        - waiting to lock &lt;0x000000076bd12340&gt; (a com.myapp.inventory.InventoryService)
        at com.myapp.order.OrderController.checkout(OrderController.java:58)
        at java.base/jdk.internal.reflect.NativeMethodAccessorImpl.invoke0(Native Method)

   Locked ownable synchronizers:
        - &lt;0x000000076bc98a10&gt; (a java.util.concurrent.locks.ReentrantLock$NonfairSync)</pre>
Key fields: <code>daemon</code> (whether it's a daemon thread, JVM won't wait for it to exit), <code>cpu</code>
(total CPU time consumed), <code>elapsed</code> (wall-clock lifetime), and the <code>Thread.State</code> line which
tells you exactly what category of wait/execution the thread is in.`
        },
        {
            content: `<h3>jstack vs Alternatives</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Tool</th><th>Output</th><th>Best For</th></tr>
<tr><td>jstack</td><td>Plain text thread dump, one-time snapshot</td><td>Fast, scriptable, works over SSH with no GUI</td></tr>
<tr><td>kill -3 (SIGQUIT)</td><td>Same content, written to the app's own stdout/log</td><td>When you don't have direct JDK tool access but can signal the process</td></tr>
<tr><td>jcmd &lt;pid&gt; Thread.print</td><td>Same content, via the unified jcmd tool</td><td>Modern JDKs where jcmd is the preferred single entry point (see jcmd topic)</td></tr>
<tr><td>JFR thread/lock events</td><td>Continuous data over a time window, not just an instant</td><td>Understanding contention trends over time, not just "right now"</td></tr>
</table>`
        },
        {
            content: `<h3>Scripting Repeated Dumps for Trend Analysis</h3>
A single dump is a snapshot; the real diagnostic power comes from taking several in quick succession and diffing
which threads remain stuck at the same frame.`,
            codeExamples: [`#!/bin/bash
# Capture 6 thread dumps, 5 seconds apart, each timestamped
PID=12345
for i in $(seq 1 6); do
  jstack $PID > "dump_$(date +%H%M%S).txt"
  sleep 5
done

# Then compare which stack frames repeat across all files (candidates for "truly stuck")
grep -A1 "java.lang.Thread.State" dump_*.txt | sort | uniq -c | sort -rn | head`]
        },
        {
            content: `<h3>Production Troubleshooting Scenarios</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Symptom</th><th>Root Cause</th><th>Diagnosis</th><th>Fix</th></tr>
<tr><td><code>jstack &lt;pid&gt;</code> itself hangs and never prints output</td><td>The target JVM is in a state (e.g. deep GC pause, or the target process is actually a different/zombie process) where it can't respond to the attach request</td><td>Retry with <code>jstack -F &lt;pid&gt;</code> (force mode) which reads process memory directly instead of requesting cooperation from the target JVM</td><td>If force mode also fails, the JVM may be completely wedged - consider a heap+thread dump via OS-level core dump instead</td></tr>
<tr><td>Thread count grows unbounded over days, eventually hitting OS thread limits</td><td>A thread pool is misconfigured to grow unbounded, or threads are being leaked (created but never returned to a pool / never terminate)</td><td>Compare thread counts and thread name patterns across dumps taken days apart; look for a specific pool prefix growing</td><td>Bound the thread pool's max size and add monitoring/alerting on live thread count</td></tr>
<tr><td>App is "stuck" according to monitoring, but jstack shows all threads RUNNABLE</td><td>Not actually hung - likely CPU-bound (e.g. GC thrashing, inefficient algorithm) rather than blocked/deadlocked</td><td>Check CPU usage alongside the dump; take repeated dumps to see if RUNNABLE threads are progressing through different code or stuck in a tight loop</td><td>Profile with JFR to find the hot method causing CPU saturation, rather than looking for a lock issue that isn't there</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What does jstack do?</td><td>Prints a thread dump of a running JVM process - every thread's state and stack trace at that instant</td></tr>
<tr><td>How do you find the PID needed for jstack?</td><td>Use <code>jps -l</code> to list running Java processes with their main class</td></tr>
<tr><td>What does the -l flag add to jstack output?</td><td>Information about java.util.concurrent ownable synchronizers (e.g. ReentrantLock), in addition to built-in synchronized monitors</td></tr>
<tr><td>When would you use jstack -F?</td><td>When the target process is unresponsive to a normal dump request; force mode reads process state directly</td></tr>
<tr><td>How does jstack report a deadlock?</td><td>It automatically detects lock-wait cycles between threads and prints a "Found one Java-level deadlock" section listing the threads and locks involved</td></tr>
<tr><td>Why take multiple jstack dumps instead of one?</td><td>A single dump is only one instant; comparing several dumps taken seconds apart distinguishes genuinely stuck threads from ones that are simply slow/progressing</td></tr>
<tr><td>What's a modern alternative to jstack for the same information?</td><td><code>jcmd &lt;pid&gt; Thread.print</code>, part of the unified jcmd diagnostic tool</td></tr>
</table>`
        }
    ]
};
