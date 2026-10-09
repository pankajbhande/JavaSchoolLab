import { Topic } from '../coreJava';

export const g1Collector: Topic = {
    id: 'g1-collector',
    name: 'G1 Garbage Collector',
    beginner: [
        {
            content: `<h3>What is G1?</h3>
G1 (short for <strong>Garbage-First</strong>) is a garbage collector built into the JVM that tries to balance two
goals at once: keeping pause times short and predictable, while still collecting garbage efficiently even on large
heaps (multiple gigabytes). <br><br>
Since <strong>Java 9</strong>, G1 is the <strong>default garbage collector</strong> for most JVM configurations,
replacing the older Parallel GC as the out-of-the-box choice.`
        },
        {
            content: `<h3>Region-Based Heap</h3>
Older collectors treat the Young and Old Generations as single large, contiguous blocks of memory. G1 instead splits
the entire heap into many small, equal-sized chunks called <strong>regions</strong> (typically 1MB to 32MB each,
chosen automatically). <br><br>
Each region is dynamically labeled as Eden, Survivor, or Old at any given time - there's no fixed physical wall
between generations like in older collectors.`,
            codeExamples: [`public class G1RegionIdea {
    public static void main(String[] args) {
        // Conceptually, the JVM (running G1) has already split the heap into regions like:
        // [Eden][Eden][Survivor][Old][Eden][Old][Free][Old] ...
        Object obj = new Object(); // allocated into whichever region is currently acting as Eden

        System.out.println("Object allocated - G1 tracks which region it lives in");
    }
}
// OUTPUT:
// Object allocated - G1 tracks which region it lives in`]
        },
        {
            content: `<h3>Why "Garbage First"?</h3>
G1 gets its name from its core strategy: during a collection, it prioritizes cleaning up the regions that contain the
<strong>most garbage first</strong>, because that gives the biggest memory reclaim for the least amount of work -
maximizing efficiency within a limited pause-time budget.`
        },
        {
            content: `<h3>Pause-Time Goals</h3>
Unlike older collectors that just run "as needed," G1 lets you specify a target maximum pause time using
<code>-XX:MaxGCPauseMillis</code>. G1 then tries to pick how many regions to collect in each cycle so it stays close
to that goal, rather than collecting the whole heap in one go.`,
            codeExamples: [`public class PauseGoalIdea {
    public static void main(String[] args) {
        // Run this class with: java -XX:+UseG1GC -XX:MaxGCPauseMillis=100 PauseGoalIdea
        StringBuilder data = new StringBuilder();
        for (int i = 0; i < 100000; i++) {
            data.append("x"); // lots of allocation - G1 will collect in small, bounded steps
        }
        System.out.println("Data length: " + data.length());
    }
}
// OUTPUT:
// Data length: 100000`]
        },
        {
            content: `<h3>Mixed Collections - A Quick Preview</h3>
G1 doesn't only clean the Young Generation or only the Old Generation in one shot. Once Old Generation regions start
filling up, G1 runs <strong>mixed collections</strong> - a single GC cycle that collects the Young regions
<em>plus</em> a chosen subset of Old regions with the most garbage, all within its pause-time goal.`
        }
    ],

    expert: [
        {
            content: `<h3>G1's Region-Based Architecture in Detail</h3>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Heap (e.g. 4GB) split into ~2048 regions (region size auto-chosen, e.g. 2MB each)

[E][E][S][O][E][O][O][H][F][O][E][S][O][F][H][O] ...
 E = Eden   S = Survivor   O = Old   H = Humongous   F = Free

Humongous regions: objects larger than 50% of a region size
are allocated directly into one or more contiguous Humongous
regions, bypassing normal Eden allocation.</pre>
Because generations are just a logical label on top of physical regions, G1 can resize Young Generation capacity on
the fly each cycle - simply by reclassifying more or fewer regions as Eden - which is what lets it adapt toward the
pause-time goal dynamically instead of using a fixed generation size.`
        },
        {
            content: `<h3>The G1 Collection Cycle</h3>
A full G1 cycle typically involves these phases: <br><br>
• <strong>Young-only collections</strong> - repeated Minor-GC-like collections of Eden/Survivor regions using
copying collection, evacuating live objects into Survivor or Old regions. <br>
• <strong>Initial Mark</strong> - piggybacks on a Young collection, marks GC roots. <br>
• <strong>Concurrent Marking</strong> - runs alongside the application threads, traces the object graph in Old
regions to compute how much garbage each Old region holds, without stopping the world. <br>
• <strong>Remark</strong> - a short Stop-the-World pause to finalize marking. <br>
• <strong>Cleanup</strong> - reclaims completely empty regions immediately, and identifies the most garbage-dense Old
regions as candidates for the next step. <br>
• <strong>Mixed Collections</strong> - subsequent collections that evacuate both Young regions and the
garbage-densest Old region candidates, spread across multiple cycles to respect the pause-time goal.`
        },
        {
            content: `<h3>G1 vs Parallel GC vs CMS - Comparison</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>Parallel GC</th><th>CMS (removed in Java 14)</th><th>G1 GC</th></tr>
<tr><td>Heap layout</td><td>Contiguous Young/Old</td><td>Contiguous Young/Old</td><td>Region-based</td></tr>
<tr><td>Goal</td><td>Maximum throughput</td><td>Low pause, no compaction</td><td>Balanced throughput + predictable pause</td></tr>
<tr><td>Compaction</td><td>Yes, every collection</td><td>No - suffers fragmentation over time</td><td>Yes, incrementally per region during evacuation</td></tr>
<tr><td>Pause-time goal support</td><td>No direct control</td><td>No direct control</td><td>Yes - <code>-XX:MaxGCPauseMillis</code></td></tr>
<tr><td>Default since</td><td>Java 8 and earlier</td><td>Deprecated Java 9, removed Java 14</td><td>Java 9+</td></tr>
<tr><td>Best fit</td><td>Batch jobs, throughput-critical, few pause concerns</td><td>Legacy low-latency needs (superseded by G1/ZGC)</td><td>General-purpose default, medium-to-large heaps needing predictable pauses</td></tr>
</table>`
        },
        {
            content: `<h3>Production Tuning Scenario</h3>
A web service on an 8GB heap was seeing occasional 800ms pauses under load, well above its 200ms SLA. Investigation
of GC logs showed large, infrequent mixed collections were pulling in too many Old regions at once. <br><br>
Tuning applied: <br>
• Lowered <code>-XX:MaxGCPauseMillis</code> from the default 200ms explicitly to reinforce the target. <br>
• Reduced <code>-XX:G1MixedGCCountTarget</code> effect by tuning <code>-XX:G1HeapWastePercent</code> so G1 became
more willing to spread mixed collections across more cycles instead of front-loading Old region reclamation. <br>
• Increased heap headroom with <code>-XX:G1ReservePercent</code> to avoid "to-space exhaustion" fallbacks to a Full
GC, which is G1's worst-case, most expensive path. <br><br>
Result: pause times stabilized under the 200ms goal, at the cost of slightly more frequent (but shorter) mixed
collections - a classic latency-vs-frequency tradeoff.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What does G1 stand for and what is its main goal?</td><td>Garbage-First - it aims to provide predictable, configurable pause times while efficiently collecting garbage, even on large heaps</td></tr>
<tr><td>Since which Java version is G1 the default collector?</td><td>Java 9</td></tr>
<tr><td>How does G1's heap layout differ from older collectors?</td><td>G1 divides the heap into many equal-sized regions dynamically labeled Eden, Survivor, Old, or Humongous, instead of fixed contiguous generations</td></tr>
<tr><td>What is a Humongous region?</td><td>A region (or set of contiguous regions) used to allocate an object larger than 50% of the standard region size</td></tr>
<tr><td>What is a mixed collection in G1?</td><td>A GC cycle that collects Young regions together with a chosen subset of the most garbage-dense Old regions, within the pause-time goal</td></tr>
<tr><td>Which flag controls G1's target maximum pause time?</td><td><code>-XX:MaxGCPauseMillis</code></td></tr>
<tr><td>Why is G1 named "Garbage-First"?</td><td>Because it prioritizes collecting the regions containing the most garbage first, to reclaim the most memory for the least work</td></tr>
<tr><td>What happens when G1 runs out of space during evacuation ("to-space exhaustion")?</td><td>It falls back to a full, Stop-the-World Full GC - the most expensive and least predictable path, which tuning tries to avoid</td></tr>
</table>`
        }
    ]
};
