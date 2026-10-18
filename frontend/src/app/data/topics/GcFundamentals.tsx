import { Topic } from '../coreJava';

export const gcFundamentals: Topic = {
    id: 'gc-fundamentals',
    name: 'GC Fundamentals',
    beginner: [
        {
            content: `<h3>What is Garbage Collection?</h3>
Garbage Collection (GC) is the process by which the Java Virtual Machine (JVM) automatically finds objects that are
no longer being used by your program and reclaims the memory they occupy. <br><br>
In languages like C or C++, the programmer must manually call <code>free()</code> (or <code>delete</code>) to release
memory. Forget to do it, and you get a <strong>memory leak</strong>. Do it too early or twice, and you get a crash. <br><br>
Java removes this burden - a background process called the <strong>Garbage Collector</strong> does this cleanup for you.`
        },
        {
            content: `<h3>Why Doesn't Java Need free()?</h3>
When you create an object with <code>new</code>, Java allocates memory for it on the <strong>heap</strong>. As long as
something in your program can still "reach" that object, it stays alive. <br><br>
Once nothing refers to it anymore, the object becomes <strong>unreachable</strong> - and the JVM's Garbage Collector
will eventually notice this and free the memory automatically, without you writing any cleanup code.`,
            codeExamples: [`public class NoManualFree {
    public static void main(String[] args) {
        StringBuilder sb = new StringBuilder("Hello");
        System.out.println(sb);

        sb = null; // the original StringBuilder object is now unreachable
        // No free(), no delete() - the JVM's GC will reclaim it automatically later

        System.out.println("Reference cleared, GC will handle cleanup");
    }
}
// OUTPUT:
// Hello
// Reference cleared, GC will handle cleanup`]
        },
        {
            content: `<h3>Reachability - How the JVM Decides What's "Alive"</h3>
An object is considered <strong>reachable</strong> if it can be accessed by following references starting from a
<strong>GC Root</strong> - things like: <br>
• Local variables on any thread's stack <br>
• Active static fields of classes <br>
• JNI references <br><br>
If you can draw an unbroken chain of references from a GC Root to an object, that object is alive. If you can't,
it's garbage - eligible for collection.`,
            codeExamples: [`public class ReachabilityDemo {
    static class Node {
        String name;
        Node(String name) { this.name = name; }
    }

    public static void main(String[] args) {
        Node a = new Node("A"); // reachable via local variable 'a' (a GC Root path)
        Node b = new Node("B");

        a = null; // Node "A" is now unreachable - nothing points to it anymore
        System.out.println("Node B is still reachable: " + b.name);
    }
}
// OUTPUT:
// Node B is still reachable: B`]
        },
        {
            content: `<h3>Mark and Sweep - The Basic Idea</h3>
Most Java garbage collectors are built on a simple two-step idea called <strong>Mark and Sweep</strong>: <br><br>
• <strong>Mark phase</strong> - starting from the GC Roots, the collector walks every reference chain and marks every
object it can reach as "alive". <br>
• <strong>Sweep phase</strong> - it then scans the whole heap and reclaims memory for every object that was
<em>not</em> marked - those are the unreachable ones. <br><br>
Think of it like tracing string from a bulletin board (the roots) to every note connected to it. Any note with no
string reaching it gets thrown away.`,
            codeExamples: [`public class MarkAndSweepIdea {
    public static void main(String[] args) {
        Object obj1 = new Object(); // marked alive (reachable from local variable)
        Object obj2 = new Object();

        obj2 = null; // obj2's original object becomes unreachable

        // Conceptually: Mark phase marks obj1's object as alive.
        // Sweep phase reclaims the memory of the old obj2 object.
        System.out.println("obj1 is still in use: " + (obj1 != null));
    }
}
// OUTPUT:
// obj1 is still in use: true`]
        },
        {
            content: `<h3>You Can't Force GC, Only Suggest It</h3>
Java gives you <code>System.gc()</code> to <em>request</em> garbage collection, but it is only a hint to the JVM -
the JVM is free to ignore it entirely. Relying on it in real applications is considered bad practice; the JVM's
internal heuristics almost always make better decisions than manual triggers.`,
            codeExamples: [`public class GcHintDemo {
    public static void main(String[] args) {
        String temp = new String("temporary data");
        temp = null;

        System.gc(); // just a request/hint - JVM may or may not run GC immediately

        System.out.println("Requested GC - actual timing is up to the JVM");
    }
}
// OUTPUT:
// Requested GC - actual timing is up to the JVM`]
        }
    ],

    expert: [
        {
            content: `<h3>Reachability States in Detail</h3>
The JVM specification (and <code>java.lang.ref</code> package) actually defines several strengths of reachability,
not just "reachable" vs "not reachable". This matters for caches, listeners, and memory-sensitive data structures.

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Reachability</th><th>Reference Type</th><th>Collected When</th></tr>
<tr><td>Strongly Reachable</td><td>Ordinary reference (<code>Object o = new Object()</code>)</td><td>Never, while a strong reference chain exists</td></tr>
<tr><td>Softly Reachable</td><td><code>SoftReference</code></td><td>Only when the JVM is close to running out of heap memory</td></tr>
<tr><td>Weakly Reachable</td><td><code>WeakReference</code></td><td>At the next GC cycle, regardless of memory pressure</td></tr>
<tr><td>Phantom Reachable</td><td><code>PhantomReference</code></td><td>After finalization, used to schedule cleanup actions</td></tr>
<tr><td>Unreachable</td><td>No reference chain from any GC Root</td><td>Immediately eligible for collection</td></tr>
</table>`,
            codeExamples: [`import java.lang.ref.WeakReference;

public class WeakReferenceDemo {
    public static void main(String[] args) {
        Object strong = new Object();
        WeakReference<Object> weakRef = new WeakReference<>(strong);

        strong = null; // remove the only strong reference

        System.gc(); // hint the JVM to run collection

        System.out.println("Weak reference cleared: " + (weakRef.get() == null));
    }
}
// OUTPUT (result is JVM-dependent, but typically):
// Weak reference cleared: true`]
        },
        {
            content: `<h3>Mark-and-Sweep Internals</h3>
Under the hood, a naive Mark-and-Sweep collector works roughly like this: <br><br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">GC Roots
  |-- Thread stacks (local variables, parameters)
  |-- Static fields
  |-- JNI handles
       |
       v
  MARK: traverse every reachable object graph
        set a "marked" bit on each visited object
       |
       v
  SWEEP: scan the entire heap linearly
         unmarked objects  -> reclaim memory, add to free list
         marked objects    -> clear mark bit for next cycle</pre>
This basic algorithm has two well-known costs in production: <br>
• <strong>Stop-the-World pauses</strong> - application threads are typically paused during marking so the object
graph doesn't change mid-traversal. <br>
• <strong>Fragmentation</strong> - plain sweep leaves free memory scattered in small holes rather than one
contiguous block, which is why most real collectors add a <strong>compaction</strong> step afterward.`
        },
        {
            content: `<h3>Mark-Sweep vs Mark-Sweep-Compact vs Copying Collection</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Strategy</th><th>How it works</th><th>Fragmentation</th><th>Cost</th></tr>
<tr><td>Mark-Sweep</td><td>Mark reachable objects, free the rest in place</td><td>High - holes left behind</td><td>Fast sweep, but slow future allocation</td></tr>
<tr><td>Mark-Sweep-Compact</td><td>Mark, sweep, then slide live objects together</td><td>None after compaction</td><td>Extra compaction pass adds pause time</td></tr>
<tr><td>Copying Collection</td><td>Copy all live objects into a second empty space, discard the old space entirely</td><td>None - allocation is always contiguous</td><td>Needs 2x space reserved, but very fast for short-lived objects</td></tr>
</table>
<br>
Java's real-world collectors combine these ideas by generation (see the "Generational GC" topic) - copying collection
for the young generation where most objects die quickly, and mark-sweep-compact for the older, longer-lived
generation.`
        },
        {
            content: `<h3>Production Note: System.gc() in Real Systems</h3>
Calling <code>System.gc()</code> explicitly in application code is almost always an anti-pattern in production
services - it can trigger a full, expensive Stop-the-World collection at an unpredictable moment, causing a latency
spike for every request being served at that instant. <br><br>
Some libraries (old RMI implementations, certain NIO direct-buffer cleanup paths) historically called it internally,
which surprised teams debugging periodic latency spikes. The fix in modern JVMs is the flag
<code>-XX:+DisableExplicitGC</code>, which makes <code>System.gc()</code> a no-op - useful when you can't remove the
calls from third-party code but need predictable latency.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is Garbage Collection in Java?</td><td>The JVM's automatic process of finding and reclaiming memory occupied by objects that are no longer reachable from the program</td></tr>
<tr><td>What makes an object eligible for garbage collection?</td><td>When there is no reference chain from any GC Root (stack variables, static fields, JNI handles) reaching that object</td></tr>
<tr><td>Does <code>System.gc()</code> guarantee an immediate garbage collection?</td><td>No - it is only a hint/request; the JVM decides whether and when to actually run GC</td></tr>
<tr><td>What are the two basic phases of Mark-and-Sweep?</td><td>Mark - traverse and flag all reachable objects; Sweep - reclaim memory for everything not marked</td></tr>
<tr><td>Why do collectors add a Compact step after Sweep?</td><td>Plain sweeping leaves fragmented free memory as scattered holes; compaction slides live objects together for contiguous free space</td></tr>
<tr><td>What is the difference between a WeakReference and a SoftReference?</td><td>A WeakReference is cleared at the next GC cycle regardless of memory pressure; a SoftReference is cleared only when the JVM is low on memory</td></tr>
<tr><td>What are GC Roots?</td><td>The starting points of reachability analysis - thread stacks, static fields, and JNI references</td></tr>
<tr><td>Why doesn't Java need a manual free() like C/C++?</td><td>The JVM's garbage collector automatically tracks reachability and reclaims memory for unreachable objects, removing the risk of manual leaks and double-frees</td></tr>
</table>`
        }
    ]
};
