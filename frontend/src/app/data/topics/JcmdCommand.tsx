import { Topic } from '../coreJava';

export const jcmdCommand: Topic = {
    id: 'jcmd-command',
    name: 'jcmd',
    beginner: [
        {
            content: `<h3>What is jcmd?</h3>
<code>jcmd</code> is the modern, unified command-line tool for sending diagnostic commands to a running JVM. Instead
of needing separate tools like <code>jstack</code>, <code>jmap</code>, and <code>jinfo</code>, <code>jcmd</code>
provides one consistent interface that can do everything those older tools do, plus more - and it's the tool the
JVM team actively adds new capabilities to first.`
        },
        {
            content: `<h3>Basic Usage</h3>
Every <code>jcmd</code> command follows the same pattern: the target process ID, followed by the diagnostic command
name.`,
            codeExamples: [`# List running JVMs and their PIDs (jcmd's own built-in version of jps)
jcmd -l

# Ask a specific JVM what diagnostic commands it supports
jcmd 12345 help`]
        },
        {
            content: `<h3>Getting a Thread Dump with jcmd</h3>
This replaces the older <code>jstack</code> command with the exact same information.`,
            codeExamples: [`jcmd 12345 Thread.print`]
        },
        {
            content: `<h3>Getting Heap Info with jcmd</h3>
This replaces <code>jmap -heap</code> for a quick heap summary.`,
            codeExamples: [`jcmd 12345 GC.heap_info

# Sample output:
#  garbage-first heap   total 1048576K, used 214823K
#   region size 1024K, 210 young (215040K), 5 survivors (5120K)
#  Metaspace       used 45210K, committed 46080K, reserved 1093632K`]
        },
        {
            content: `<h3>Getting Configured Flags with jcmd</h3>
Instead of restarting a process just to check what memory/GC flags it's actually running with, you can ask the live
JVM directly.`,
            codeExamples: [`jcmd 12345 VM.flags

# Sample output:
# -XX:MaxHeapSize=1073741824 -XX:MinHeapSize=268435456 -XX:+UseG1GC -XX:+PrintGCDetails`]
        }
    ],

    expert: [
        {
            content: `<h3>Why jcmd Replaced the Older Tool Family</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Old Tool</th><th>jcmd Equivalent</th><th>Advantage of jcmd</th></tr>
<tr><td>jstack &lt;pid&gt;</td><td>jcmd &lt;pid&gt; Thread.print</td><td>Same JVM attach mechanism as every other diagnostic command - one tool to learn</td></tr>
<tr><td>jmap -heap &lt;pid&gt;</td><td>jcmd &lt;pid&gt; GC.heap_info</td><td>Also exposes GC.run, GC.class_histogram, and more without switching tools</td></tr>
<tr><td>jmap -dump &lt;pid&gt;</td><td>jcmd &lt;pid&gt; GC.heap_dump &lt;file&gt;</td><td>Consistent syntax; new diagnostic commands are added to jcmd first, not the legacy tools</td></tr>
<tr><td>jinfo -flags &lt;pid&gt;</td><td>jcmd &lt;pid&gt; VM.flags</td><td>Can also show only non-default flags with VM.flags -all</td></tr>
</table>
<br>
Newer JDK diagnostic capabilities (like native memory tracking summaries, JFR control, and system property dumps) are
increasingly exposed only through <code>jcmd</code>, making it the tool worth standardizing on for new tooling and
runbooks.`
        },
        {
            content: `<h3>Frequently Used jcmd Subcommands</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Command</th><th>Purpose</th></tr>
<tr><td>Thread.print</td><td>Print a full thread dump, including deadlock detection</td></tr>
<tr><td>GC.heap_info</td><td>Print heap generation sizes and usage</td></tr>
<tr><td>GC.heap_dump &lt;file&gt;</td><td>Write a full heap dump to the given file</td></tr>
<tr><td>GC.run</td><td>Trigger an explicit full garbage collection</td></tr>
<tr><td>GC.class_histogram</td><td>Print a class histogram, equivalent to jmap -histo</td></tr>
<tr><td>VM.flags [-all]</td><td>Print current JVM flags (add -all to include unset defaults)</td></tr>
<tr><td>VM.system_properties</td><td>Print all Java system properties</td></tr>
<tr><td>VM.native_memory summary</td><td>Show a breakdown of native (non-heap) memory usage, if NMT is enabled</td></tr>
<tr><td>JFR.start / JFR.dump / JFR.stop</td><td>Control a Java Flight Recorder recording without restarting the app</td></tr>
<tr><td>VM.version</td><td>Print the exact JVM build/version running</td></tr>
</table>`
        },
        {
            content: `<h3>Native Memory Tracking via jcmd</h3>
One capability that has no equivalent in the old tool family at all is Native Memory Tracking (NMT) - a way to see
exactly where the JVM's <em>non-heap</em> memory is going (thread stacks, code cache, GC internal structures,
Metaspace, direct buffers). This requires the JVM to be started with NMT enabled.`,
            codeExamples: [`# Start the JVM with NMT enabled (small overhead, safe for production)
java -XX:NativeMemoryTracking=summary -jar myapp.jar

# Query the summary live via jcmd
jcmd 12345 VM.native_memory summary

# Sample output (trimmed):
#          Java Heap (reserved=1048576KB, committed=524288KB)
#              Class   (reserved=1114112KB, committed=48640KB)
#             Thread   (reserved=32784KB, committed=32784KB)
#               Code   (reserved=253952KB, committed=8320KB)
#                  GC   (reserved=98765KB, committed=76543KB)`]
        },
        {
            content: `<h3>Sample Thread.print Deadlock Output via jcmd</h3>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">$ jcmd 12345 Thread.print
12345:

Found one Java-level deadlock:
=============================
"Thread-1":
  waiting to lock monitor 0x00007f, which is held by "Thread-2"
"Thread-2":
  waiting to lock monitor 0x00007e, which is held by "Thread-1"

Found 1 deadlock.</pre>
Identical detection logic to <code>jstack</code>, since both ultimately use the same JVM attach API under the hood -
<code>jcmd</code> is simply the newer, more extensible front end to it.`
        },
        {
            content: `<h3>Production Troubleshooting Scenarios</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Symptom</th><th>Root Cause</th><th>Diagnosis</th><th>Fix</th></tr>
<tr><td>Container gets OOM-killed even though <code>-Xmx</code> is well below the container memory limit</td><td>Non-heap native memory (thread stacks, code cache, direct buffers) is consuming the remaining headroom</td><td><code>jcmd &lt;pid&gt; VM.native_memory summary</code> (with NMT enabled) breaks down exactly which native region is largest</td><td>Right-size the offending region (e.g. limit thread count, tune code cache size) or increase the container's memory limit to account for it</td></tr>
<tr><td>On-call engineer needs a quick health check script that covers threads, heap, and flags without SSHing in with multiple tools</td><td>Legacy workflow required separate jstack/jmap/jinfo invocations and different syntax for each</td><td>N/A - process/tooling gap</td><td>Standardize a single runbook script built entirely on jcmd subcommands (Thread.print, GC.heap_info, VM.flags) for consistency</td></tr>
<tr><td>Need to start a profiling recording on a production incident without restarting the affected process</td><td>Team previously believed profiling required relaunching with -XX:StartFlightRecording at JVM startup</td><td>N/A - awareness gap</td><td>Use <code>jcmd &lt;pid&gt; JFR.start</code> to attach and begin recording on the already-running process, no restart needed</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is jcmd?</td><td>A unified command-line diagnostic tool that sends commands to a running JVM, replacing/consolidating older tools like jstack, jmap, and jinfo</td></tr>
<tr><td>How do you get a thread dump using jcmd?</td><td><code>jcmd &lt;pid&gt; Thread.print</code></td></tr>
<tr><td>How do you get heap usage info using jcmd?</td><td><code>jcmd &lt;pid&gt; GC.heap_info</code></td></tr>
<tr><td>How do you discover all commands a specific JVM supports via jcmd?</td><td><code>jcmd &lt;pid&gt; help</code></td></tr>
<tr><td>How do you trigger a heap dump using jcmd instead of jmap?</td><td><code>jcmd &lt;pid&gt; GC.heap_dump &lt;filename&gt;</code></td></tr>
<tr><td>Why is jcmd generally preferred over jstack/jmap/jinfo today?</td><td>It's the single actively developed tool that new diagnostic capabilities (like NMT and JFR control) are added to first, with a consistent command syntax</td></tr>
<tr><td>How would you inspect native (non-heap) memory usage of a running JVM?</td><td>Start the JVM with <code>-XX:NativeMemoryTracking=summary</code> and query it live with <code>jcmd &lt;pid&gt; VM.native_memory summary</code></td></tr>
</table>`
        }
    ]
};
