import { Topic } from '../coreJava';

export const gcCycles: Topic = {
    id: 'gc-cycles',
    name: 'Garbage Collection Cycles',
    beginner: [
        {
            content: `<h3>What is a GC Cycle?</h3>
A <strong>GC cycle</strong> is one complete run of the garbage collector - from deciding it needs to collect, to
actually reclaiming memory, to handing control back to your application. Every GC cycle, regardless of which
collector is running, generally goes through the same three conceptual phases: <strong>Mark</strong>,
<strong>Sweep/Compact</strong>, and <strong>Promote</strong>.`
        },
        {
            content: `<h3>Phase 1: Mark</h3>
The collector starts from the GC Roots (stack variables, static fields) and walks every reference it can find,
marking each object it reaches as "alive". Anything it never reaches during this walk is garbage.`,
            codeExamples: [`public class MarkPhaseDemo {
    public static void main(String[] args) {
        Object alive = new Object();      // reachable - will be marked
        Object garbage = new Object();    // about to become unreachable
        garbage = null;

        System.out.println("Only 'alive' object will survive the Mark phase");
    }
}
// OUTPUT:
// Only 'alive' object will survive the Mark phase`]
        },
        {
            content: `<h3>Phase 2: Sweep / Compact</h3>
Once marking is done, the collector reclaims memory from every unmarked (garbage) object. Many collectors then also
<strong>compact</strong> - sliding the remaining live objects together - so that free memory ends up as one
large, contiguous block instead of scattered small gaps.`
        },
        {
            content: `<h3>Phase 3: Promote</h3>
Objects that have survived several GC cycles in the Young Generation get <strong>promoted</strong> to the Old
Generation, since they've proven they are likely to stick around for a while. This ties directly into the
Generational GC design covered in the previous topic.`,
            codeExamples: [`public class PromotePhaseDemo {
    static Object longLived = new Object(); // referenced by a static field - survives every cycle

    public static void main(String[] args) {
        for (int i = 0; i < 50; i++) {
            new Object(); // dies almost immediately each iteration, never promoted
        }
        System.out.println("longLived object will eventually be promoted to Old Generation");
    }
}
// OUTPUT:
// longLived object will eventually be promoted to Old Generation`]
        },
        {
            content: `<h3>What is a Stop-the-World Pause?</h3>
During key parts of a GC cycle (especially marking), the collector often needs to <strong>pause every application
thread</strong> so the object graph doesn't change while it's being examined. This pause is called a
<strong>Stop-the-World (STW)</strong> event. <br><br>
This is exactly why GC tuning matters in real systems - a long STW pause means your application literally freezes
for that duration, which can cause timeouts, dropped connections, or missed deadlines.`,
            codeExamples: [`public class StopTheWorldIdea {
    public static void main(String[] args) {
        // While a Stop-the-World pause happens, NO application code runs at all -
        // not this main method, not any other thread - until the pause ends.
        System.out.println("Before allocation burst");

        for (int i = 0; i < 200000; i++) {
            byte[] chunk = new byte[100]; // triggers GC activity, possibly a brief STW pause
        }

        System.out.println("After allocation burst - execution resumed once GC finished");
    }
}
// OUTPUT:
// Before allocation burst
// After allocation burst - execution resumed once GC finished`]
        }
    ],

    expert: [
        {
            content: `<h3>Anatomy of a Full GC Cycle</h3>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">1. Allocation Failure / Threshold Reached
        |
        v
2. Stop-the-World: pause all application ("mutator") threads
        |
        v
3. MARK
   - Traverse from GC Roots, mark every reachable object
   - Modern collectors do this in parallel across GC worker threads
        |
        v
4. SWEEP
   - Reclaim memory occupied by unmarked (dead) objects
        |
        v
5. COMPACT (if used)
   - Slide live objects together to eliminate fragmentation
   - Update all references to point to new object addresses
        |
        v
6. PROMOTE
   - Objects past the tenuring threshold move Young -> Old Generation
        |
        v
7. Resume application threads</pre>
Not every cycle runs every step - a Minor GC only performs steps 3-6 scoped to the Young Generation, while a Full GC
runs the entire pipeline across the whole heap.`
        },
        {
            content: `<h3>Stop-the-World vs Concurrent Phases</h3>
Modern collectors try to move as much work as possible <em>out</em> of the Stop-the-World pause and into concurrent
phases that run alongside the application:

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Phase</th><th>Typically STW?</th><th>Why</th></tr>
<tr><td>Initial Mark</td><td>Yes (usually brief)</td><td>Must snapshot GC roots consistently before app threads resume</td></tr>
<tr><td>Concurrent Marking</td><td>No</td><td>Can tolerate the object graph changing slightly if it re-checks (via write barriers)</td></tr>
<tr><td>Remark</td><td>Yes (short)</td><td>Finalizes marking, catches objects that changed during concurrent marking</td></tr>
<tr><td>Sweep</td><td>Collector-dependent</td><td>Reclaiming clearly-dead memory is often safe concurrently</td></tr>
<tr><td>Evacuation / Compaction</td><td>Collector-dependent (STW in G1, mostly concurrent in ZGC/Shenandoah)</td><td>Moving live objects while threads read them requires either a pause or a barrier mechanism (e.g. colored pointers)</td></tr>
</table>`
        },
        {
            content: `<h3>Write Barriers - Keeping Concurrent Marking Correct</h3>
When marking happens concurrently with running application threads, there's a risk: the application could create a
new reference from an already-marked "black" object to a not-yet-marked "white" object, and if the collector never
revisits the black object, it could wrongly reclaim the white object while it's still in use. <br><br>
Collectors solve this with a <strong>write barrier</strong> - a small piece of code the JVM injects on every
reference field write, which records ("remembers") that a change happened so the marking phase can re-examine
affected objects during Remark. This is what keeps concurrent marking correct.`
        },
        {
            content: `<h3>Production Scenario: Diagnosing a Long GC Cycle</h3>
A service running Parallel GC on a 16GB heap saw a 2.5 second Full GC pause during a nightly batch job, causing a
cascade of client timeouts. GC log analysis (<code>-Xlog:gc*,gc+heap=debug:file=gc.log</code>) showed: <br><br>
• Old Generation occupancy climbed steadily during the batch job (a large in-memory sort operation). <br>
• A Full GC was triggered when Old Gen filled completely, forcing a full Mark-Sweep-Compact across the entire heap
in one Stop-the-World pause - Parallel GC has no concurrent phases at all. <br><br>
Fix: switched to G1 (<code>-XX:+UseG1GC</code>) so Old Generation marking could run concurrently, and split the sort
operation into smaller batches to reduce peak Old Gen occupancy - cutting the worst observed pause from 2.5s to
under 150ms.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What are the three core phases of a GC cycle?</td><td>Mark (find live objects), Sweep/Compact (reclaim and defragment memory), Promote (move surviving objects to an older generation)</td></tr>
<tr><td>What is a Stop-the-World pause?</td><td>A pause where all application threads are frozen so the garbage collector can safely examine or move objects without the object graph changing underneath it</td></tr>
<tr><td>Why do some GC phases need to be Stop-the-World while others can be concurrent?</td><td>Phases that require a globally consistent snapshot (like finalizing marks) need a pause; phases that can tolerate ongoing changes if tracked (like concurrent marking with write barriers) don't</td></tr>
<tr><td>What is a write barrier used for in GC?</td><td>To record reference field writes during concurrent marking so the collector can revisit and correctly re-mark objects that changed mid-cycle</td></tr>
<tr><td>What's the difference between Sweep and Compact?</td><td>Sweep reclaims memory from dead objects in place, leaving fragmentation; Compact additionally slides live objects together to eliminate that fragmentation</td></tr>
<tr><td>Why does Parallel GC tend to have longer Full GC pauses than G1?</td><td>Parallel GC has no concurrent phases - the entire Mark-Sweep-Compact cycle runs Stop-the-World, unlike G1 which does most marking concurrently</td></tr>
<tr><td>What typically triggers a Full GC?</td><td>The Old Generation (or whole heap) filling up such that a Minor GC or mixed collection alone cannot free enough space, or an explicit System.gc() call</td></tr>
<tr><td>How would you diagnose a long GC pause in production?</td><td>Enable and analyze GC logs (e.g. -Xlog:gc*) to identify which phase and generation caused the pause, then correlate with allocation patterns or heap sizing</td></tr>
</table>`
        }
    ]
};
