import { Topic } from '../coreJava';

export const memoryLeakJava: Topic = {
    id: 'memory-leak-java',
    name: 'Memory Leak (JVM)',
    beginner: [
        {
            content: `<h3>Can Java Even Have Memory Leaks?</h3>
Java has automatic Garbage Collection (GC), so many beginners assume "memory leaks" are a C/C++ problem that
simply can't happen in Java. That's not true. <br><br>
A <strong>memory leak in Java</strong> happens when objects are no longer <em>needed</em> by the application, but
something still holds a <strong>reference</strong> to them - so the GC considers them "reachable" and correctly
refuses to collect them. The objects are technically alive but functionally garbage; over time they accumulate and
can eventually cause <code>OutOfMemoryError</code>. <br><br>
In short: Java prevents <em>dangling pointer</em> bugs, but it cannot prevent <em>you</em> from forgetting to let
go of a reference you no longer need.`
        },
        {
            content: `<h4>Cause 1: An Unbounded Static Collection</h4>
A <code>static</code> field lives for the entire lifetime of the application. If you keep adding to a static
collection and never remove old entries, it grows forever.`,
            codeExamples: [`import java.util.ArrayList;
import java.util.List;

public class StaticListLeakDemo {

    // static - lives as long as the class is loaded, i.e. basically forever
    static List<String> cache = new ArrayList<>();

    static void handleRequest(int requestId) {
        // BUG: added but never removed - grows without bound
        cache.add("request-data-" + requestId + "-" + new String(new byte[1024]));
    }

    public static void main(String[] args) {
        for (int i = 0; i < 2_000_000; i++) {
            handleRequest(i);
        }
        System.out.println("Cache size: " + cache.size());
    }
}
// Run with: java -Xmx128m StaticListLeakDemo
// OUTPUT:
// Exception in thread "main" java.lang.OutOfMemoryError: Java heap space
//     at StaticListLeakDemo.handleRequest(StaticListLeakDemo.java:10)
//     at StaticListLeakDemo.main(StaticListLeakDemo.java:15)`]
        },
        {
            content: `<h4>Cause 2: Unclosed Resources</h4>
Streams, database connections, and file handles hold onto native/off-heap resources. Forgetting to close them
leaks memory (and OS handles) even though the Java object itself is small.`,
            codeExamples: [`import java.io.FileInputStream;

public class UnclosedResourceLeakDemo {

    public static void main(String[] args) throws Exception {
        for (int i = 0; i < 100_000; i++) {
            // BUG: stream opened but never closed - no try-with-resources
            FileInputStream fis = new FileInputStream("data.txt");
            fis.read();
            // fis.close() is missing!
        }
        System.out.println("Done opening streams");
    }
}
// OUTPUT (after enough iterations, the OS file-handle limit is hit):
// Exception in thread "main" java.io.FileNotFoundException: data.txt (Too many open files)
//     at java.io.FileInputStream.open0(Native Method)
//     at java.io.FileInputStream.<init>(FileInputStream.java:219)
//
// Fix: always use try-with-resources so close() is guaranteed:
// try (FileInputStream fis = new FileInputStream("data.txt")) { fis.read(); }`]
        },
        {
            content: `<h4>Cause 3: Listener / Callback Leaks</h4>
Registering a listener (observer/callback) on a long-lived object, but never unregistering it, keeps the listener
- and everything it references - alive forever, even after the "real" owner is done with it.`,
            codeExamples: [`import java.util.ArrayList;
import java.util.List;

public class ListenerLeakDemo {

    interface Listener { void onEvent(); }

    static class EventBus { // long-lived, e.g. a singleton
        List<Listener> listeners = new ArrayList<>();
        void register(Listener l) { listeners.add(l); }
        // no unregister() is ever called anywhere in this demo!
    }

    static class Widget {
        byte[] bigData = new byte[1024 * 1024]; // 1MB per widget
        Widget(EventBus bus) {
            bus.register(() -> System.out.println("Widget event, data size=" + bigData.length));
        }
    }

    public static void main(String[] args) {
        EventBus bus = new EventBus();
        for (int i = 0; i < 500; i++) {
            new Widget(bus); // each Widget "should" be discardable after this line
            // but bus.listeners keeps a lambda referencing 'this' Widget forever
        }
        System.out.println("Listeners still registered: " + bus.listeners.size());
    }
}
// OUTPUT:
// Listeners still registered: 500
// (all 500 Widgets, and their 1MB arrays, are unreachable to the app but NOT to the GC)`]
        },
        {
            content: `<h4>The Beginner-Level Fix Pattern</h4>
• Always pair "register" with "unregister", "open" with "close" (prefer try-with-resources). <br>
• Don't put request-scoped or session-scoped data into <code>static</code> fields. <br>
• If you need a cache, use one with a maximum size and/or expiry, never a plain growing
<code>List</code>/<code>Map</code>.`
        }
    ],

    expert: [
        {
            content: `<h3>The GC Roots Model: Why "Reachable" Isn't Always "Needed"</h3>
The JVM's GC works purely on <strong>reachability</strong> from a set of "GC Roots" (local variables on active
stacks, static fields, JNI references, etc.) - not on whether a human thinks an object is "still useful." An
object graph is kept alive as long as <em>any</em> chain of references connects it back to a GC root, no matter how
irrelevant that chain has become to the application's actual logic.
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">GC Roots (static fields, thread stacks, JNI refs)
        |
        v
  EventBus.listeners (static singleton, always reachable)
        |
        v
  Listener lambda  --references-->  Widget.this
                                          |
                                          v
                                    byte[1MB] bigData

Even though 'Widget' has gone completely out of scope in main(),
it is still reachable via EventBus -> listeners -> lambda -> Widget.this
so the GC correctly (but unhelpfully) keeps it alive forever.</pre>
This is the core mental model every "memory leak" investigation comes back to: find the unexpected path from a
GC root to the object that shouldn't still be alive.`
        },
        {
            content: `<h3>ThreadLocal Leaks in Pooled-Thread Environments</h3>
<code>ThreadLocal</code> is a particularly sneaky leak source in server applications that use thread pools (which
is essentially all of them - servlet containers, executor services). Because pooled threads are reused
indefinitely, a <code>ThreadLocal</code> value set during one request and never explicitly removed stays attached
to that pooled thread and leaks into - or just wastes memory across - every future task that thread executes.`,
            codeExamples: [`public class ThreadLocalLeakDemo {

    // Simulates a "user context" ThreadLocal used in a web app per-request
    static ThreadLocal<byte[]> userContext = new ThreadLocal<>();

    static void handleRequestOnPooledThread() {
        userContext.set(new byte[1024 * 1024]); // 1MB "request context"
        // BUG: userContext.remove() is never called before the thread
        // goes back into the pool and picks up the NEXT unrelated request
    }

    public static void main(String[] args) throws InterruptedException {
        // Simulate a fixed-size thread pool reused across many "requests"
        Thread pooledThread = new Thread(() -> {
            for (int i = 0; i < 200; i++) {
                handleRequestOnPooledThread(); // old value silently replaced, but
                                                 // demonstrates the pattern that leaks
                                                 // when values are NOT primitive/small
            }
        });
        pooledThread.start();
        pooledThread.join();
        System.out.println("Done - in a real pool, forgetting remove() accumulates across many pooled threads");
    }
}
// Correct fix: always pair set() with remove() in a finally block:
// try { userContext.set(data); / * handle request * / }
// finally { userContext.remove(); }`]
        },
        {
            content: `<h3>Diagnosing a Leak with a Heap Dump: Dominator Tree and Retained Size</h3>
The professional workflow for confirming and pinpointing a leak: <br><br>
1. <strong>Capture two heap dumps</strong> some time apart under steady load (e.g. via
<code>jmap -dump:live,format=b,file=dump1.hprof &lt;pid&gt;</code>), then compare object counts/sizes between them
in Eclipse MAT's "Compare Basket" - classes whose instance count grows roughly linearly with time/traffic and never
shrinks are your leak suspects. <br>
2. <strong>Run the Leak Suspects report</strong> - MAT clusters the dominator tree and highlights the single
biggest retained-size object graphs automatically. <br>
3. <strong>Inspect "Path to GC Roots"</strong> on the suspect object, excluding weak/soft references - this shows
you the exact reference chain (e.g. <code>Thread -&gt; ThreadLocalMap -&gt; Entry -&gt; YourObject</code>) keeping
it alive, which tells you precisely which piece of code to fix. <br>
4. <strong>Distinguish shallow vs retained size</strong> - shallow size is just that one object; retained size is
everything that would be freed if that object became unreachable. Sort by retained size, not shallow size, to find
the real culprit.`
        },
        {
            content: `<h3>Symptom -> Root Cause -> Diagnosis -> Fix</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Symptom</th><th>Root Cause</th><th>Diagnosis</th><th>Fix</th></tr>
<tr><td>Old-gen heap occupancy climbs steadily over days, eventually OOMs</td><td>Unbounded static/singleton collection accumulating entries forever</td><td>Two heap dumps compared in MAT; instance count of one class grows roughly linearly with uptime</td><td>Bound the collection with a max size and/or TTL (e.g. Caffeine cache) instead of a raw growing Map/List</td></tr>
<tr><td>Memory grows specifically correlated with thread-pool task count, not request count</td><td>ThreadLocal values set but never removed on pooled threads</td><td>Heap dump "Path to GC Roots" from suspect object shows Thread -> ThreadLocalMap -> Entry chain</td><td>Always call ThreadLocal.remove() in a finally block after use, especially in pooled-thread environments</td></tr>
<tr><td>File descriptor / socket count grows until "Too many open files" errors, alongside memory growth</td><td>Streams/connections opened without try-with-resources, never explicitly closed</td><td>OS-level: lsof -p &lt;pid&gt; shows growing open file/socket count over time correlated with memory growth</td><td>Use try-with-resources (or explicit close() in finally) for every Closeable resource</td></tr>
<tr><td>Memory grows after a UI/component library is used heavily, even though components are discarded</td><td>Listener/observer registered on a long-lived event bus/singleton, never unregistered when the component is done</td><td>Path to GC Roots shows EventBus/listener list -> lambda/inner class -> the "discarded" object</td><td>Always pair register() with unregister(), or use weak listener references where the framework supports it</td></tr>
<tr><td>Memory grows specifically after cache lookups for keys that should have expired</td><td>Cache implemented with plain HashMap and manual/buggy eviction logic instead of a proper cache library</td><td>Inspect cache entry count vs configured max/TTL; check eviction code path for bugs</td><td>Replace hand-rolled caching with a battle-tested library (Caffeine, Guava Cache) with built-in size/time eviction</td></tr>
</table>`
        },
        {
            content: `<h3>War Story: The Executor Service That Remembered Every User</h3>
A support-ticketing platform started seeing gradual memory growth over about two weeks per deployment, always
eventually requiring a restart. The team initially suspected the newest feature (file attachments) since memory
growth "felt" proportional to ticket volume. <br><br>
A heap dump comparison in MAT told a different story: the fastest-growing class was
<code>java.lang.ThreadLocal$ThreadLocalMap$Entry</code>, retained by the application's fixed-size
<code>ExecutorService</code> thread pool. A "current user" <code>ThreadLocal</code>, set at the start of each
ticket-processing task to make the acting user's ID conveniently available deep in the call stack (avoiding having
to pass it as a parameter everywhere), was never removed at the end of the task. Because the executor's threads were
long-lived and reused for years, each thread's <code>ThreadLocalMap</code> silently accumulated stale entries -
technically the map does replace the value on the next <code>set()</code> for the same ThreadLocal instance, but the
real leak was several <em>different</em> ThreadLocal instances (one per feature team, added over years) each
accumulating separately, and some of those held large per-user context objects that outlived their usefulness. <br><br>
<strong>Fix:</strong> every <code>ThreadLocal.set()</code> in the codebase was audited and paired with a matching
<code>remove()</code> in a <code>finally</code> block, and a code-review checklist item was added specifically for
ThreadLocal usage going forward.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>Can a garbage-collected language like Java still have memory leaks? How?</td><td>Yes - a leak occurs when an object is no longer logically needed but a reference chain from a GC root (static field, active thread stack, etc.) still exists, so the GC correctly but unhelpfully keeps it reachable and alive</td></tr>
<tr><td>What is a "GC root" and why does it matter for leak analysis?</td><td>A GC root is a starting point the collector considers inherently reachable (static fields, local variables on live stacks, JNI references); leak analysis works backward from a suspect object to find the unexpected reference path connecting it to a GC root</td></tr>
<tr><td>Why are ThreadLocal variables a common leak source in server applications?</td><td>Pooled threads are long-lived and reused across many tasks; if a ThreadLocal value is set but never removed, it stays attached to that thread's ThreadLocalMap indefinitely, silently retaining memory across unrelated future tasks</td></tr>
<tr><td>What is the difference between "shallow size" and "retained size" in a heap dump?</td><td>Shallow size is the memory of just that one object; retained size is the total memory that would become collectible if that object were made unreachable - retained size is what matters for finding the real leak culprit</td></tr>
<tr><td>How would you confirm a suspected memory leak before spending time fixing it?</td><td>Capture two heap dumps under steady load some time apart and compare class instance counts/retained sizes - a class growing roughly linearly with time/traffic that never shrinks is strong evidence of a real leak versus normal fluctuation</td></tr>
<tr><td>Why do unclosed resources (streams, connections) count as a memory/resource leak even if the Java object is small?</td><td>Closeable resources often wrap native/OS-level handles (file descriptors, sockets, native memory buffers); failing to close them leaks those underlying OS resources even though the Java wrapper object itself is tiny</td></tr>
<tr><td>What's the standard fix pattern to prevent listener/observer leaks?</td><td>Always pair every register()/addListener() call with a corresponding unregister()/removeListener() call, ideally tied to the listening object's own lifecycle end, or use weak references where the framework supports them</td></tr>
<tr><td>What tool would you use to find the exact reference chain keeping a leaked object alive?</td><td>Eclipse MAT's "Path to GC Roots" (excluding weak/soft references) on the suspect object in a heap dump, which shows the precise chain of references from a GC root down to that object</td></tr>
</table>`
        }
    ]
};
