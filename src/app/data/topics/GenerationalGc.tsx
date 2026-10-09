import { Topic } from '../coreJava';

export const generationalGc: Topic = {
    id: 'generational-gc',
    name: 'Generational GC',
    beginner: [
        {
            content: `<h3>Why Split the Heap into Generations?</h3>
Studies of real programs found a simple but powerful pattern: <strong>most objects die young</strong>. A temporary
string built inside a loop, a short-lived request object, a local list used once and discarded - these are created
and thrown away within milliseconds. <br><br>
Very few objects (a cache, a database connection pool, a singleton service) live for the entire lifetime of the
application. <br><br>
Java's Garbage Collector takes advantage of this by dividing the heap into <strong>generations</strong> and treating
young and old objects differently.`
        },
        {
            content: `<h3>The Young Generation</h3>
Every new object is first created in the <strong>Young Generation</strong> (also called the "nursery"). It is
usually small and gets garbage collected very often, but each collection is fast because most objects in it are
already dead. <br><br>
This frequent, cheap cleanup of the Young Generation is called a <strong>Minor GC</strong>.`,
            codeExamples: [`public class YoungGenDemo {
    public static void main(String[] args) {
        for (int i = 0; i < 1000; i++) {
            String temp = "value-" + i; // created fresh each loop, in the Young Generation
            // temp becomes unreachable at the end of each iteration - a Minor GC will clean these up quickly
        }
        System.out.println("Loop finished - most temp strings already collected");
    }
}
// OUTPUT:
// Loop finished - most temp strings already collected`]
        },
        {
            content: `<h3>The Old Generation</h3>
Objects that survive several Minor GC cycles are considered long-lived, and get <strong>promoted</strong> (moved) to
the <strong>Old Generation</strong> (also called Tenured Generation). This area is collected much less often, but a
collection here - called a <strong>Major GC</strong> - takes longer because the Old Generation is larger and has more
live data to examine.`,
            codeExamples: [`import java.util.ArrayList;
import java.util.List;

public class OldGenDemo {
    static List<String> cache = new ArrayList<>(); // lives for the whole program - will be promoted to Old Gen

    public static void main(String[] args) {
        for (int i = 0; i < 5; i++) {
            cache.add("cached-item-" + i); // stays reachable via the static field
        }
        System.out.println("Cache size: " + cache.size());
    }
}
// OUTPUT:
// Cache size: 5`]
        },
        {
            content: `<h3>Minor GC vs Major GC - Quick Comparison</h3>
• <strong>Minor GC</strong> - cleans the Young Generation only. Fast, frequent, small pause. <br>
• <strong>Major GC</strong> - cleans the Old Generation (sometimes the whole heap, called a <strong>Full GC</strong>).
Slower, less frequent, bigger pause. <br><br>
As a beginner, the key takeaway is: creating lots of short-lived objects is cheap in Java precisely because of this
design - the Young Generation is built to handle exactly that pattern efficiently.`
        },
        {
            content: `<h3>Promotion in a Nutshell</h3>
Think of the Young Generation like a classroom that gets cleared out every day - most students (objects) leave after
one day (one GC cycle). A few students who keep showing up for many days in a row (surviving many Minor GCs)
eventually get "promoted" to a permanent desk in another room - the Old Generation.`,
            codeExamples: [`public class PromotionAnalogy {
    static Object longLived = new Object(); // survives many cycles - eventually promoted

    public static void main(String[] args) {
        for (int i = 0; i < 100; i++) {
            Object shortLived = new Object(); // dies almost immediately, stays in Young Gen
        }
        System.out.println("longLived is still referenced: " + (longLived != null));
    }
}
// OUTPUT:
// longLived is still referenced: true`]
        }
    ],

    expert: [
        {
            content: `<h3>The Weak Generational Hypothesis</h3>
Generational GC is built entirely on one empirical observation, formally called the <strong>Weak Generational
Hypothesis</strong>: <br><br>
<em>"Most objects die young, and the ones that survive tend to live a long time."</em> <br><br>
This is "weak" (as opposed to a hard guarantee) because it's a statistical tendency, not a law - some workloads
(e.g. large in-memory caches with high churn, or object pools with unusual lifetimes) violate it and suffer worse GC
performance as a result. Understanding this hypothesis is the single most important mental model for reasoning
about GC tuning.`
        },
        {
            content: `<h3>Young Generation Internal Layout</h3>
The Young Generation itself is subdivided further to implement an efficient <strong>copying collector</strong>: <br><br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Young Generation
 |-- Eden Space        <-- almost all new objects are allocated here
 |-- Survivor Space S0  <-- "from" space
 |-- Survivor Space S1  <-- "to" space (swaps roles with S0 each Minor GC)

Old Generation
 |-- Tenured Space      <-- objects promoted after surviving enough Minor GCs</pre>
Each Minor GC: <br>
• Copies all live objects from Eden into whichever Survivor space is currently empty ("to" space). <br>
• Copies all live objects from the other Survivor space into "to" space as well, aging them by one. <br>
• Clears Eden and the old "from" Survivor space entirely - they become the next "to" space. <br>
• Objects that have survived past a threshold (<code>-XX:MaxTenuringThreshold</code>, default 15) get promoted to
Tenured space instead of copied into a Survivor space again.`
        },
        {
            content: `<h3>Minor GC vs Major GC vs Full GC</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>Minor GC</th><th>Major GC</th><th>Full GC</th></tr>
<tr><td>Scope</td><td>Young Generation only</td><td>Old Generation (implementation-dependent)</td><td>Entire heap (Young + Old + Metaspace)</td></tr>
<tr><td>Frequency</td><td>Very frequent</td><td>Less frequent</td><td>Rare (ideally)</td></tr>
<tr><td>Typical pause</td><td>Sub-millisecond to a few ms</td><td>Tens to hundreds of ms</td><td>Can be seconds on large heaps</td></tr>
<tr><td>Algorithm used</td><td>Copying collection</td><td>Mark-Sweep-Compact (collector dependent)</td><td>Mark-Sweep-Compact across the whole heap</td></tr>
<tr><td>Common trigger</td><td>Eden space fills up</td><td>Old Generation occupancy crosses a threshold</td><td>Allocation failure even after Old GC, or explicit <code>System.gc()</code></td></tr>
</table>`
        },
        {
            content: `<h3>Production Scenario: Premature Promotion</h3>
A common production issue is <strong>premature promotion</strong>: if the Young Generation (particularly Eden and
Survivor spaces) is undersized relative to the allocation rate, objects that would normally die young get promoted
to the Old Generation before they actually die - simply because a Minor GC catches them "in transit" too many times,
or Survivor space overflows and forces early tenuring. <br><br>
Symptom: Old Generation fills up faster than expected, triggering frequent, expensive Major/Full GCs even though the
application's true long-lived data set is small. <br><br>
Fix: increase Young Generation size (<code>-Xmn</code>) or tune the survivor ratio (<code>-XX:SurvivorRatio</code>)
so short-lived objects have enough room and time to die inside the Young Generation before being swept along into
Old Gen.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is the Weak Generational Hypothesis?</td><td>The observation that most objects die young, while a small fraction survive and live much longer - the basis for splitting the heap into generations</td></tr>
<tr><td>What is the difference between Minor GC and Major/Full GC?</td><td>Minor GC cleans only the Young Generation (fast, frequent); Major/Full GC cleans the Old Generation or the entire heap (slower, less frequent)</td></tr>
<tr><td>What are Eden and Survivor spaces?</td><td>Eden is where new objects are allocated; Survivor spaces (S0/S1) hold objects that survived at least one Minor GC, aging them before promotion</td></tr>
<tr><td>What triggers promotion of an object to the Old Generation?</td><td>Surviving a number of Minor GC cycles beyond the tenuring threshold (<code>-XX:MaxTenuringThreshold</code>), or Survivor space overflow</td></tr>
<tr><td>Why is copying collection used for the Young Generation specifically?</td><td>Because most objects there are dead, copying only the small number of live survivors is far cheaper than sweeping the whole space</td></tr>
<tr><td>What is premature promotion and why is it a problem?</td><td>Short-lived objects get promoted to Old Gen too early due to an undersized Young Gen, causing the Old Gen to fill up faster and trigger more expensive Major GCs</td></tr>
<tr><td>Which JVM flag controls Young Generation size directly?</td><td><code>-Xmn</code></td></tr>
<tr><td>Does every collector implement Major GC the same way?</td><td>No - the exact algorithm and even the definition of "Major GC" varies by collector (e.g. G1's mixed collections behave differently from Parallel GC's Old Gen collection)</td></tr>
</table>`
        }
    ]
};
