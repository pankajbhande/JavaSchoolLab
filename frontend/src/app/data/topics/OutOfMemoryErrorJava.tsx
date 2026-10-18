import { Topic } from '../coreJava';

export const outOfMemoryErrorJava: Topic = {
    id: 'out-of-memory-error-java',
    name: 'OutOfMemoryError',
    beginner: [
        {
            content: `<h3>What is OutOfMemoryError?</h3>
<code>java.lang.OutOfMemoryError</code> is thrown by the JVM when it cannot allocate an object because it has
run out of memory in a particular area, and the Garbage Collector (GC) cannot free up enough space to continue. <br><br>
It is an <strong>Error</strong>, not an Exception - it signals a serious problem that a normal application usually
cannot recover from on its own. <br><br>
There isn't just one kind of OutOfMemoryError - the JVM has several memory regions, and each can run out
independently. The most common ones you will meet as a Java developer are: <br>
• <strong>Java heap space</strong> - too many live objects for the configured heap <br>
• <strong>Metaspace</strong> - too many loaded classes <br>
• <strong>GC overhead limit exceeded</strong> - the GC is running constantly but reclaiming almost nothing`
        },
        {
            content: `<h4>1. Heap Space OutOfMemoryError</h4>
The <strong>heap</strong> is where all your objects (new Foo(), ArrayList entries, Strings, etc.) live. If you keep
creating objects and something keeps a reference to them (so GC can't collect them), the heap eventually fills up
completely and the JVM gives up.`,
            codeExamples: [`import java.util.ArrayList;
import java.util.List;

public class HeapOomDemo {
    public static void main(String[] args) {
        List<byte[]> memoryHog = new ArrayList<>();

        // Keep allocating 1MB chunks and NEVER release them
        while (true) {
            memoryHog.add(new byte[1024 * 1024]); // 1 MB
        }
    }
}
// Run with: java -Xmx64m HeapOomDemo
// OUTPUT:
// Exception in thread "main" java.lang.OutOfMemoryError: Java heap space
//     at HeapOomDemo.main(HeapOomDemo.java:9)`]
        },
        {
            content: `<h4>2. Metaspace OutOfMemoryError</h4>
Metaspace stores class metadata (the bytecode/definitions of classes, not objects). If your application (or a
buggy framework) keeps generating and loading <em>new</em> classes at runtime without ever unloading them, Metaspace
fills up.`,
            codeExamples: [`import java.lang.reflect.Method;
import javassist.ClassPool;

// Simplified illustration - in real life this happens with dynamic proxies,
// classloader leaks in app servers, or excessive Groovy/JS script compilation.
public class MetaspaceOomDemo {
    public static void main(String[] args) throws Exception {
        ClassPool pool = ClassPool.getDefault();
        int i = 0;
        while (true) {
            // Defines a brand-new class on every loop iteration
            pool.makeClass("GeneratedClass" + (i++)).toClass();
        }
    }
}
// Run with: java -XX:MaxMetaspaceSize=32m MetaspaceOomDemo
// OUTPUT:
// Exception in thread "main" java.lang.OutOfMemoryError: Metaspace
//     at java.lang.ClassLoader.defineClass1(Native Method)`]
        },
        {
            content: `<h4>3. GC Overhead Limit Exceeded</h4>
Sometimes the heap isn't 100% full, but the JVM notices it is spending almost <strong>all</strong> its CPU time
running Garbage Collection while reclaiming very little memory each time (by default: more than 98% of time in GC,
recovering less than 2% of the heap). Rather than let the app hang forever, the JVM throws this error early.`,
            codeExamples: [`import java.util.ArrayList;
import java.util.List;

public class GcOverheadDemo {
    public static void main(String[] args) {
        List<Object> list = new ArrayList<>();
        while (true) {
            // Small, short-lived-looking allocations that still get retained
            list.add(new Object());
        }
    }
}
// Run with: java -Xmx64m -XX:+UseSerialGC GcOverheadDemo
// OUTPUT:
// Exception in thread "main" java.lang.OutOfMemoryError: GC overhead limit exceeded
//     at java.util.ArrayList.grow(ArrayList.java:237)`]
        },
        {
            content: `<h4>Common Causes and Quick Fixes</h4>
• <strong>Loading a huge file/dataset fully into memory</strong> - stream it instead (e.g. <code>BufferedReader</code>
line by line) rather than reading it all into one giant String or List. <br>
• <strong>Unbounded caches or collections</strong> - a <code>static Map</code> that keeps growing forever - use a
bounded cache (e.g. Caffeine with a max size) or clear it periodically. <br>
• <strong>Heap sized too small for the workload</strong> - increase <code>-Xmx</code> if the application genuinely
needs more memory. <br>
• <strong>Too many classes generated dynamically</strong> - increase <code>-XX:MaxMetaspaceSize</code> or fix the
code/library that keeps generating classes.`
        }
    ],

    expert: [
        {
            content: `<h3>How the JVM Decides "Out of Memory"</h3>
Before throwing <code>OutOfMemoryError: Java heap space</code>, the JVM does not give up after a single failed
allocation. Modern collectors (G1, Parallel, ZGC) will: <br>
• Trigger a full GC to try to reclaim space <br>
• If a full GC barely reclaims anything and this keeps repeating, the collector estimates the "GC overhead" ratio <br>
• Only after this threshold is repeatedly breached (or a single allocation genuinely cannot fit even after a full
GC) does the JVM throw the error and, optionally, dump the heap <br><br>
This is why OOM often correlates with a visible <strong>GC storm</strong> in monitoring dashboards just before the
crash - CPU usage spikes because the collector is working overtime trying (and failing) to free space.`
        },
        {
            content: `<h3>Reading the Full Error Message</h3>
The text after the colon in <code>OutOfMemoryError</code> tells you exactly which memory region failed - always
read it carefully before jumping to conclusions.
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">java.lang.OutOfMemoryError: Java heap space
    -> The object heap itself is full. Classic memory leak or undersized heap.

java.lang.OutOfMemoryError: Metaspace
    -> Class metadata region is full. Usually a ClassLoader leak (redeploys, dynamic proxies).

java.lang.OutOfMemoryError: GC overhead limit exceeded
    -> GC is thrashing: >98% time in GC, <2% heap reclaimed. App is effectively dying slowly.

java.lang.OutOfMemoryError: unable to create new native thread
    -> Not heap at all - OS/process cannot allocate a new native thread stack.

java.lang.OutOfMemoryError: Requested array size exceeds VM limit
    -> A single array allocation is larger than the JVM/platform allows.

java.lang.OutOfMemoryError: Direct buffer memory
    -> off-heap NIO DirectByteBuffer space (-XX:MaxDirectMemorySize) exhausted.</pre>`
        },
        {
            content: `<h3>Diagnosing a Production Heap OOM</h3>
The standard production workflow when a service dies with <code>OutOfMemoryError: Java heap space</code>: <br><br>
1. <strong>Capture a heap dump</strong> - ideally automatically, using
<code>-XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/var/dumps</code> so you get a <code>.hprof</code> file at the
moment of the crash rather than trying to reproduce it later. <br>
2. <strong>Open the dump</strong> in Eclipse MAT (Memory Analyzer Tool) or VisualVM and run the "Leak Suspects"
report - it clusters retained objects by dominator and flags the largest retainers. <br>
3. <strong>Follow the "retained size"</strong> (not just "shallow size") to find which single object graph is
holding the most memory - this is usually the actual leak, e.g. a <code>static Map&lt;String, Session&gt;</code>
with millions of stale entries. <br>
4. <strong>Check the GC logs</strong> (<code>-Xlog:gc*</code>) leading up to the crash - if old-gen occupancy climbs
steadily after every full GC instead of returning to baseline, that's the signature of a genuine leak versus just
an undersized heap.`
        },
        {
            content: `<h3>Symptom -> Root Cause -> Diagnosis -> Fix</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Symptom</th><th>Root Cause</th><th>Diagnosis</th><th>Fix</th></tr>
<tr><td>App crashes after running fine for days/weeks with heap space OOM</td><td>Slow memory leak - a static/long-lived collection grows unbounded</td><td>Heap dump + MAT Leak Suspects; old-gen occupancy trending upward across multiple full GCs</td><td>Bound the collection (LRU/TTL cache), remove entries on cleanup, or use WeakReference where appropriate</td></tr>
<tr><td>OOM appears immediately under a specific request pattern (e.g. large file uploads)</td><td>A single request loads an entire large payload into memory at once</td><td>Correlate OOM timestamp with access logs / APM traces for that endpoint</td><td>Stream the payload (chunked reads, InputStream processing) instead of buffering it fully</td></tr>
<tr><td>Metaspace OOM after repeated hot-redeploys in an app server</td><td>ClassLoader leak - old web app's classes never get garbage collected because something still references them (ThreadLocal, static field, JDBC driver registration)</td><td>Heap/class histogram shows duplicate classes across multiple classloader instances</td><td>Deregister JDBC drivers, clear ThreadLocals in a shutdown hook, avoid static references to app classes from container-level singletons</td></tr>
<tr><td>GC overhead limit exceeded with CPU pegged at 100% before the crash</td><td>Heap too small for live-object working set - GC runs back-to-back with tiny gains</td><td>GC logs show consecutive full GCs reclaiming under 2% of heap each time</td><td>Increase -Xmx to match actual working set, or reduce allocation rate / retained object count</td></tr>
<tr><td>OutOfMemoryError: unable to create new native thread</td><td>Not heap - too many OS threads created (thread pool misconfiguration)</td><td>jstack thread count vs OS ulimit -u; thread count climbing unbounded</td><td>Use bounded thread pools, fix thread leak, raise ulimit only as a last resort</td></tr>
</table>`
        },
        {
            content: `<h3>War Story: The Session Cache That Ate Production</h3>
A production order-processing service ran fine in staging but died with <code>OutOfMemoryError: Java heap space</code>
roughly every 9 days in production, always around peak traffic. The on-call team's first instinct was
"just bump -Xmx" - which delayed the crash but didn't fix it. <br><br>
A heap dump taken via <code>-XX:+HeapDumpOnOutOfMemoryError</code> on the next crash showed a single
<code>static ConcurrentHashMap&lt;String, UserSession&gt;</code> retaining 92% of the heap, with over 4 million
entries - one for every user who had ever logged in since the last restart. The code added a session on login but
only removed it on an explicit "logout" click; most mobile users simply closed the app, so their session objects
(each holding a cached shopping cart and order history) never got removed. <br><br>
<strong>Fix:</strong> replaced the unbounded map with a Caffeine cache configured with
<code>expireAfterAccess(30, TimeUnit.MINUTES)</code> and a hard max size, so idle sessions are evicted automatically
regardless of whether logout was ever called.`
        },
        {
            content: `<h3>Prevention Checklist</h3>
• Always run production JVMs with <code>-XX:+HeapDumpOnOutOfMemoryError</code> so you capture evidence instead of
just a restart. <br>
• Set <code>-Xmx</code> deliberately based on measured working-set size plus headroom, not by copy-pasting a
default. <br>
• Prefer bounded caches (Caffeine, Guava CacheBuilder with maximumSize/expireAfter) over raw
<code>HashMap</code>/<code>ArrayList</code> for anything that grows with user activity. <br>
• Monitor old-gen occupancy after full GC over time (not just heap %) - a rising floor across GCs is the earliest
reliable leak signal, well before an actual OOM. <br>
• Use <code>-XX:MaxMetaspaceSize</code> explicitly in containerized environments so a classloader leak fails fast
and visibly instead of silently eating host memory.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is OutOfMemoryError and is it an Exception?</td><td>It is a java.lang.Error thrown when the JVM cannot allocate memory in a given region even after GC; it is an Error, not an Exception, and generally shouldn't be caught to "recover"</td></tr>
<tr><td>What's the difference between "Java heap space" and "Metaspace" OOM?</td><td>Heap space OOM means live objects fill the object heap; Metaspace OOM means class metadata (loaded classes) fills the metaspace region - a classloader leak, not an object leak</td></tr>
<tr><td>What does "GC overhead limit exceeded" mean?</td><td>The JVM detected that GC is consuming over ~98% of CPU time while reclaiming under ~2% of the heap repeatedly, so it fails fast instead of hanging indefinitely</td></tr>
<tr><td>How do you capture a heap dump automatically on OOM?</td><td>Start the JVM with -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=&lt;dir&gt; so a .hprof file is written the moment the error occurs</td></tr>
<tr><td>How do you find what's leaking memory from a heap dump?</td><td>Open it in Eclipse MAT or VisualVM, run the Leak Suspects report, and follow retained size (not shallow size) to the dominator object graph</td></tr>
<tr><td>Is increasing -Xmx always the right fix for OutOfMemoryError?</td><td>No - it can mask a real leak and just delay the crash; you should confirm via heap dump/GC logs whether it's a genuine capacity issue or a leak before resizing</td></tr>
<tr><td>What commonly causes Metaspace leaks in application servers?</td><td>ClassLoader leaks from repeated hot-redeploys - references left in ThreadLocals, static fields, JDBC driver registries, or shutdown hooks prevent the old classloader (and its classes) from being garbage collected</td></tr>
<tr><td>What is "OutOfMemoryError: unable to create new native thread" and how is it different from heap OOM?</td><td>It happens when the OS refuses to allocate a new native thread stack for the process (thread count or memory limit reached) - it's unrelated to Java heap occupancy and is usually caused by unbounded thread creation</td></tr>
</table>`
        }
    ]
};
