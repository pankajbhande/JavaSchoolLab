import { Topic } from '../coreJava';

export const jmapCommand: Topic = {
    id: 'jmap-command',
    name: 'jmap',
    beginner: [
        {
            content: `<h3>What is jmap?</h3>
<code>jmap</code> is a command-line tool bundled with the JDK for inspecting a running JVM's <strong>memory</strong> -
its heap. It can print a summary of memory usage, list the object types filling up the heap, and produce a full
heap dump file for deeper analysis in a tool like Eclipse MAT.`
        },
        {
            content: `<h3>Finding the Process to Inspect</h3>
Like other JDK diagnostic tools, <code>jmap</code> operates on a process ID (PID), which you find with
<code>jps</code>.`,
            codeExamples: [`jps -l
# 12345 com.myapp.Application
# 8820  sun.tools.jps.Jps`]
        },
        {
            content: `<h3>Quick Heap Summary with -heap</h3>
This gives you a fast overview of heap configuration and current usage per generation, without producing any large
file.`,
            codeExamples: [`jmap -heap 12345

# Sample output (trimmed):
# Heap Configuration:
#    MinHeapFreeRatio = 40
#    MaxHeapSize      = 1073741824 (1024.0MB)
# Heap Usage:
# G1 Heap:
#    used     = 214748364 (204.8MB)
#    free     = 858993460 (819.2MB)
#    16.0% used`]
        },
        {
            content: `<h3>Listing the Biggest Object Types with -histo</h3>
The histogram option lists every class currently in the heap, sorted by total memory used - a quick way to spot
"what's eating all my memory" without opening a full heap dump.`,
            codeExamples: [`jmap -histo 12345 | head -10

# Sample output:
#  num     #instances         #bytes  class name
#    1:        420381       40196256  [C  (char array)
#    2:        180221       28835360  com.myapp.model.UserSession
#    3:        180221       11534144  java.util.HashMap$Node
#    4:         98211        7856880  java.lang.String`]
        },
        {
            content: `<h3>Producing a Full Heap Dump with -dump</h3>
When a summary or histogram isn't enough and you need to inspect the actual object graph, <code>jmap -dump</code>
writes a full <code>.hprof</code> heap dump file to disk - the same kind of file covered in the Heap Dumps topic.`,
            codeExamples: [`# Dump only live (reachable) objects, in binary format
jmap -dump:live,format=b,file=myapp.hprof 12345`]
        }
    ],

    expert: [
        {
            content: `<h3>jmap -histo:live vs -histo</h3>
Adding <code>:live</code> forces a full garbage collection before generating the histogram, so only reachable
objects are counted. This gives a more accurate view of "what's actually still needed" but the forced GC causes a
pause, so it's best avoided on latency-sensitive production traffic during peak load.`,
            codeExamples: [`# Includes garbage not yet collected - no GC pause triggered
jmap -histo 12345

# Forces a full GC first, so only live/reachable objects appear - causes a pause
jmap -histo:live 12345`]
        },
        {
            content: `<h3>Comparing Two Histograms to Spot a Leak</h3>
A classic lightweight leak-hunting technique doesn't even require a full heap dump - just two histograms taken
minutes apart, diffed for classes whose instance count keeps growing.`,
            codeExamples: [`jmap -histo:live 12345 > histo_t1.txt
sleep 600
jmap -histo:live 12345 > histo_t2.txt

diff histo_t1.txt histo_t2.txt | grep com.myapp

# Example diff output showing a suspicious grower:
# <    2:        180221       28835360  com.myapp.model.UserSession
# ---
# >    2:        512980       82076800  com.myapp.model.UserSession`]
        },
        {
            content: `<h3>jmap Options Reference</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Option</th><th>Purpose</th><th>Caution</th></tr>
<tr><td><code>-heap</code></td><td>Print heap configuration and generation usage summary</td><td>Safe, negligible overhead</td></tr>
<tr><td><code>-histo</code></td><td>Print class histogram (instance count, bytes) of the current heap</td><td>Can briefly pause the JVM while iterating the heap on some collectors</td></tr>
<tr><td><code>-histo:live</code></td><td>Same as -histo but forces a full GC first</td><td>Causes a real, sometimes multi-second stop-the-world pause on a large heap</td></tr>
<tr><td><code>-dump:live,format=b,file=...</code></td><td>Write a full heap dump of live objects</td><td>Forces full GC and can pause the app for seconds on large heaps; large output file</td></tr>
<tr><td><code>-clstats</code></td><td>Print class loader statistics</td><td>Useful for diagnosing Metaspace/class-loader leaks (e.g. in app servers doing hot redeploys)</td></tr>
</table>`
        },
        {
            content: `<h3>Sample -clstats Output for a Class Loader Leak</h3>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">$ jmap -clstats 12345

class_loader    classes bytes   parent_loader       alive?  type

&lt;bootstrap&gt;      724     3841004                              live    &lt;internal&gt;
0x00000007a1b3  1204    5230112 0x00000007a0d2      dead    org.myapp.PluginClassLoader
0x00000007a1c9  1204    5230112 0x00000007a0d2      dead    org.myapp.PluginClassLoader
0x00000007a1d5  1204    5230112 0x00000007a0d2      dead    org.myapp.PluginClassLoader
...(37 more identical dead PluginClassLoader entries)...</pre>
Many "dead" class loaders of the same type still holding classes/bytes is the textbook signature of a classloader
leak - typically caused by something (a static field, a ThreadLocal, or a registered shutdown hook) outside the
loader still referencing one of its classes, preventing the whole loader and everything it defined from being
collected.`
        },
        {
            content: `<h3>Production Troubleshooting Scenarios</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Symptom</th><th>Root Cause</th><th>Diagnosis</th><th>Fix</th></tr>
<tr><td>Metaspace usage keeps climbing after every hot-redeploy in an app server</td><td>Old class loaders from previous deployments are never freed because something still references their classes</td><td><code>jmap -clstats &lt;pid&gt;</code> shows growing numbers of "dead" class loaders of the same application type still holding bytes</td><td>Find and remove the lingering reference (common culprits: ThreadLocal not cleared, static caches, unregistered JDBC drivers/shutdown hooks)</td></tr>
<tr><td>Running <code>jmap -dump</code> on a large production heap causes a multi-second outage</td><td><code>-dump:live</code> forces a full GC and heap dump generation is itself expensive on a multi-GB heap</td><td>Compare heap size to typical dump duration; check if the app became unresponsive during the dump window</td><td>Prefer non-forced <code>jmap -dump</code> (no <code>:live</code>) if a full GC pause is unacceptable, or schedule dumps during low-traffic windows, or use JFR sampling first to narrow the investigation before a full dump</td></tr>
<tr><td>Histogram shows millions of <code>char[]</code>/<code>String</code> instances dominating memory</td><td>Excessive string creation/duplication - e.g. not using String interning for repeated values, or verbose logging building large strings unnecessarily</td><td>Cross-reference the histogram with a heap dump's "Path to GC Roots" for a sample String to find where they're created/retained</td><td>Intern or deduplicate repeated strings, or reduce unnecessary string concatenation in hot paths</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is jmap used for?</td><td>Inspecting a running JVM's heap - printing configuration/usage summaries, class histograms, or producing full heap dumps</td></tr>
<tr><td>What does jmap -histo:live do differently from jmap -histo?</td><td>-histo:live forces a full GC first so only live/reachable objects are counted, giving a more accurate but pause-inducing snapshot</td></tr>
<tr><td>How do you generate a full heap dump with jmap?</td><td><code>jmap -dump:live,format=b,file=heap.hprof &lt;pid&gt;</code></td></tr>
<tr><td>How can you spot a memory leak without taking a full heap dump?</td><td>Take two <code>jmap -histo:live</code> snapshots minutes apart and diff them, looking for a class whose instance count/bytes keeps growing</td></tr>
<tr><td>What does jmap -clstats help diagnose?</td><td>Class loader leaks - it lists class loaders, their classes/bytes, and whether they're still alive, revealing loaders that should have been collected but weren't</td></tr>
<tr><td>Why should jmap -dump:live be used carefully in production?</td><td>It forces a full GC and heap iteration, which can pause a large-heap application for seconds, potentially causing a visible outage</td></tr>
<tr><td>What's the difference between jmap and jstack?</td><td>jmap inspects heap/memory (histograms, heap dumps); jstack inspects threads (thread dumps, deadlock detection)</td></tr>
</table>`
        }
    ]
};
