import { Topic } from '../coreJava';

export const heapDumps: Topic = {
    id: 'heap-dumps',
    name: 'Heap Dumps',
    beginner: [
        {
            content: `<h3>What is a Heap Dump?</h3>
A heap dump is a snapshot of every object living in the JVM's heap memory at a single point in time - every object,
its fields, and the references between objects. It's saved to a file (usually with a <code>.hprof</code> extension)
that you can open later in an analysis tool. <br><br>
Think of it like a photograph of your application's memory - frozen at the exact moment you took it, so you can
study it calmly instead of guessing about a moving target.`
        },
        {
            content: `<h3>Why Do We Need Heap Dumps?</h3>
Heap dumps are the primary tool for answering questions like: <br>
• Why is my application running out of memory (<code>OutOfMemoryError</code>)? <br>
• Which objects are consuming the most memory right now? <br>
• Is there a memory leak - are objects piling up that should have been garbage collected? <br><br>
Without a heap dump, you're mostly guessing from symptoms. With one, you can see exactly what's in memory.`
        },
        {
            content: `<h3>Generating a Heap Dump Automatically on OutOfMemoryError</h3>
The easiest way to capture a heap dump exactly when it matters most is to tell the JVM to write one automatically
the moment it throws <code>OutOfMemoryError</code>.`,
            codeExamples: [`# Automatically dump the heap to a file when OutOfMemoryError occurs
java -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/var/dumps/myapp.hprof -jar myapp.jar`]
        },
        {
            content: `<h3>Generating a Heap Dump On-Demand with jmap</h3>
You don't have to wait for a crash - you can trigger a heap dump manually while the application is running, using
the <code>jmap</code> command-line tool that ships with the JDK.`,
            codeExamples: [`# Find the process ID of your running Java app
jps -l

# Trigger a live heap dump for that process
jmap -dump:live,format=b,file=myapp.hprof 12345`]
        },
        {
            content: `<h3>Analyzing a Heap Dump</h3>
A raw <code>.hprof</code> file is not human-readable - you open it in a specialized analysis tool: <br>
• <strong>Eclipse Memory Analyzer (MAT)</strong> - the most popular free tool, shows the biggest objects, retained
size, and suspected leaks. <br>
• <strong>VisualVM</strong> - bundled with the JDK, simpler but useful for a quick look. <br>
• <strong>JMC (Java Mission Control)</strong> - can also open heap dumps alongside JFR recordings. <br><br>
These tools let you browse "who is holding onto this object" (the reference chain), which is usually the key to
finding a leak.`
        }
    ],

    expert: [
        {
            content: `<h3>What's Actually Inside a Heap Dump</h3>
A <code>.hprof</code> file contains the full object graph at capture time: <br>
• Every object instance, its class, and field values. <br>
• Every array and its contents. <br>
• Class metadata (static fields, class loaders). <br>
• Thread stacks and local variables referencing heap objects (so you can see GC roots). <br><br>
From this, an analyzer computes two crucial numbers for each object: <br>
• <strong>Shallow size</strong> - the memory used by the object itself, not counting what it references. <br>
• <strong>Retained size</strong> - the total memory that would be freed if this object became unreachable, including
everything it exclusively keeps alive.`
        },
        {
            content: `<h3>live vs Full Heap Dumps</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Mode</th><th>Command</th><th>What Happens</th><th>Trade-off</th></tr>
<tr><td>Live objects only</td><td><code>jmap -dump:live,...</code></td><td>Forces a full GC first, then dumps only reachable objects</td><td>Smaller, cleaner dump; but the forced GC causes a pause and can hide short-lived garbage that might be relevant</td></tr>
<tr><td>Full heap</td><td><code>jmap -dump:...</code> (no <code>live</code>)</td><td>Dumps everything currently in the heap, including garbage not yet collected</td><td>Larger file; useful for allocation-rate analysis, but noisier for leak-hunting</td></tr>
</table>
<br>
For leak investigations, <code>live</code> dumps are usually preferred since a real leak means objects survive even a
full GC.`
        },
        {
            content: `<h3>Finding a Leak: The "Dominator Tree" Approach</h3>
In Eclipse MAT, the most effective workflow for a suspected leak is: <br>
1. Take two heap dumps some time apart (e.g. 30 minutes) under similar load. <br>
2. Run MAT's "Leak Suspects Report," which automatically flags large retained-size clusters. <br>
3. Use the "Dominator Tree" view, sorted by retained size, to find the single object subtree consuming the most
memory. <br>
4. Trace "Path to GC Roots" (excluding weak/soft references) on the suspicious object to see exactly what's still
holding a reference to it - this is usually the leak's root cause (e.g. a static <code>Map</code> that's never
cleared, or a listener never unregistered).`,
            codeExamples: [`# Take two dumps 30 minutes apart to compare growth
jmap -dump:live,format=b,file=heap_t1.hprof 12345
# ... wait 30 minutes under load ...
jmap -dump:live,format=b,file=heap_t2.hprof 12345

# In Eclipse MAT: File > Open, then use "Compare Basket" to diff heap_t1 vs heap_t2`]
        },
        {
            content: `<h3>Sample MAT Dominator Tree Output</h3>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Class                                   Shallow Heap   Retained Heap    %
com.myapp.cache.SessionCache            48             612,458,320    68.2%
  java.util.HashMap$Node[]              1,048,608      612,000,000    68.1%
    com.myapp.model.UserSession x 42000 -              608,100,000    67.7%
java.lang.Thread[]                      312            89,204,112     9.9%
byte[]                                  -               45,120,880    5.0%</pre>
Here, <code>SessionCache</code> retains 68% of the entire heap via a <code>HashMap</code> that has grown to 42,000
<code>UserSession</code> entries - a strong signal that sessions are never being evicted, a classic unbounded-cache
leak.`
        },
        {
            content: `<h3>Production Troubleshooting Scenarios</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Symptom</th><th>Root Cause</th><th>Diagnosis</th><th>Fix</th></tr>
<tr><td>Service memory usage climbs steadily over days until it OOMs and restarts</td><td>Unbounded cache or collection (e.g. static Map) never evicting entries</td><td>Take two heap dumps hours apart, diff dominator trees, look for the class growing unbounded</td><td>Add eviction policy (TTL/size-bounded cache like Caffeine) or explicitly clear stale entries</td></tr>
<tr><td>Heap dump command hangs or times out on a large production instance</td><td>Full/live dump on a multi-GB heap under active traffic causes a long stop-the-world pause while dumping</td><td>Check dump duration vs heap size; check if the app became unresponsive during the dump</td><td>Take dumps during low-traffic windows, or use a smaller sampling-based tool (JFR) first to narrow the suspect before a full dump</td></tr>
<tr><td>Heap dump shows plenty of free space, but OutOfMemoryError still occurs</td><td>The error is not heap exhaustion but Metaspace or a native memory limit (direct byte buffers, thread stacks)</td><td>Check the exact OOM message ("Java heap space" vs "Metaspace" vs "unable to create native thread")</td><td>Diagnose the correct memory region (Metaspace sizing, thread count, or native memory tracking) instead of only looking at heap dumps</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is a heap dump?</td><td>A snapshot file (.hprof) of every object, its fields, and reference graph in the JVM heap at a point in time</td></tr>
<tr><td>How do you automatically capture a heap dump on OutOfMemoryError?</td><td>Run the JVM with <code>-XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=&lt;path&gt;</code></td></tr>
<tr><td>How do you take a heap dump of a running process manually?</td><td>Use <code>jmap -dump:live,format=b,file=&lt;file&gt; &lt;pid&gt;</code></td></tr>
<tr><td>What is the difference between shallow size and retained size?</td><td>Shallow size is the memory of the object itself; retained size is all memory that would be freed if that object became unreachable</td></tr>
<tr><td>What does the "live" option in jmap do?</td><td>Forces a full GC before dumping, so only currently reachable objects are included, producing a smaller/cleaner dump</td></tr>
<tr><td>What tool is most commonly used to analyze a heap dump?</td><td>Eclipse Memory Analyzer (MAT), which offers a Leak Suspects Report and a Dominator Tree view</td></tr>
<tr><td>How would you confirm a memory leak using two heap dumps?</td><td>Take dumps at two points in time under similar load, compare dominator trees/retained sizes, and look for a class whose count/retained size grows without bound</td></tr>
</table>`
        }
    ]
};
