import { Topic } from '../coreJava';

export const zgcCollector: Topic = {
    id: 'zgc-collector',
    name: 'ZGC',
    beginner: [
        {
            content: `<h3>What is ZGC?</h3>
ZGC (short for <strong>Z Garbage Collector</strong>) is a scalable, low-latency garbage collector introduced as an
experimental feature in Java 11 and made production-ready in later releases. Its headline promise is
<strong>sub-millisecond pause times</strong>, even on heaps that are hundreds of gigabytes in size. <br><br>
Where G1 aims for a configurable, "reasonably low" pause, ZGC aims to make Stop-the-World pauses almost
disappear entirely, regardless of how large the heap gets.`
        },
        {
            content: `<h3>Why "Ultra-Low-Latency" Matters</h3>
Some applications - trading systems, real-time bidding platforms, large in-memory caches, latency-sensitive
APIs - cannot tolerate even a 100-200ms pause, because every request being processed at that instant freezes along
with it. ZGC is designed specifically for this class of application, where predictable, tiny pauses matter more than
maximum raw throughput.`,
            codeExamples: [`public class ZgcMotivation {
    public static void main(String[] args) {
        // Run with: java -XX:+UseZGC ZgcMotivation
        long start = System.currentTimeMillis();

        StringBuilder data = new StringBuilder();
        for (int i = 0; i < 500000; i++) {
            data.append("payload-" + i); // heavy allocation, simulating a busy service
        }

        long elapsed = System.currentTimeMillis() - start;
        System.out.println("Work done in " + elapsed + " ms (ZGC keeps pauses in sub-ms range even here)");
    }
}
// OUTPUT (illustrative - exact ms varies by machine):
// Work done in 120 ms (ZGC keeps pauses in sub-ms range even here)`]
        },
        {
            content: `<h3>Concurrent Collection - The Big Idea</h3>
Traditional collectors stop all application threads ("Stop-the-World") while they trace and move objects, because
moving an object while a thread is reading it is unsafe. <br><br>
ZGC instead does almost <strong>all of its work concurrently</strong> - while your application threads keep running
- including the hardest part: actually relocating (moving) live objects in memory. This is what allows it to keep
pauses so short.`
        },
        {
            content: `<h3>How to Enable ZGC</h3>
Turning ZGC on is a single JVM flag - no code changes are needed in your application.`,
            codeExamples: [`public class EnableZgcDemo {
    public static void main(String[] args) {
        System.out.println("Run this class with: java -XX:+UseZGC EnableZgcDemo");
        System.out.println("No source code changes are required to switch collectors");
    }
}
// OUTPUT:
// Run this class with: java -XX:+UseZGC EnableZgcDemo
// No source code changes are required to switch collectors`]
        },
        {
            content: `<h3>When Should You Reach for ZGC?</h3>
• Your application has a strict, low latency SLA (e.g. p99 response time under 10ms). <br>
• You run a very large heap (many GB to TB range) and pause times with older collectors scale badly with heap size.
<br>
• You can tolerate slightly higher CPU usage and memory overhead in exchange for near-elimination of long pauses.
<br><br>
If your workload is a batch job or offline data pipeline where total throughput matters more than pause time, a
throughput-oriented collector (like Parallel GC) is usually a better fit than ZGC.`
        }
    ],

    expert: [
        {
            content: `<h3>Colored Pointers</h3>
ZGC's core trick for enabling concurrent relocation is a technique called <strong>colored pointers</strong>. On
64-bit systems, object references (pointers) have far more bits than are needed to address memory, so ZGC
"steals" a handful of unused high-order bits in every reference and uses them to store metadata about the object's
GC state directly in the pointer itself: <br><br>
• Whether the object has been marked as live in this GC cycle <br>
• Whether the object has already been relocated <br>
• Whether the reference still needs to be "remapped" to the object's new address <br><br>
Because this metadata lives in the pointer, not in a separate side table, the JVM can inspect and update a
reference's GC status extremely cheaply, without needing to stop other threads to keep bookkeeping data consistent.`
        },
        {
            content: `<h3>Load Barriers and Concurrent Relocation</h3>
ZGC inserts a lightweight check called a <strong>load barrier</strong> on every reference read from the heap. When a
thread reads a reference, the barrier examines its colored bits: <br><br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Thread reads reference "ref" from the heap
        |
        v
Load barrier inspects ref's color bits
        |
   +----+----------------------+
   |                           |
Good color              Bad color (object relocated / needs remap)
   |                           |
Use ref directly       Slow path: look up new address,
(fast, common case)     fix up the reference on the fly,
                         then continue using it

Result: the application thread never sees a stale
pointer to a moved object, without ever needing a
Stop-the-World pause to fix up references globally.</pre>
This is what allows ZGC to relocate (move) objects while application threads keep running - each thread fixes up
any reference it happens to touch, one reference at a time, instead of the JVM pausing everyone to fix all
references at once.`
        },
        {
            content: `<h3>ZGC vs G1 vs Shenandoah - Comparison</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>G1</th><th>ZGC</th><th>Shenandoah</th></tr>
<tr><td>Typical pause target</td><td>Tens to low hundreds of ms</td><td>Sub-millisecond</td><td>Sub-millisecond to low single-digit ms</td></tr>
<tr><td>Core technique</td><td>Region-based, mostly Stop-the-World evacuation</td><td>Colored pointers + concurrent load barriers</td><td>Brooks forwarding pointers + concurrent compaction</td></tr>
<tr><td>Scales to very large heaps?</td><td>Good up to several GB, pauses grow with heap</td><td>Yes - pause time largely independent of heap size</td><td>Yes, similar goal to ZGC</td></tr>
<tr><td>CPU / memory overhead</td><td>Lower</td><td>Higher (barrier checks, extra metadata)</td><td>Higher (forwarding pointer per object)</td></tr>
<tr><td>Default since</td><td>Java 9</td><td>Production-ready Java 15+ (generational ZGC in Java 21+)</td><td>Not the JDK default (OpenJDK backport, Red Hat-driven)</td></tr>
<tr><td>Best fit</td><td>General-purpose default</td><td>Ultra-low-latency, very large heaps</td><td>Ultra-low-latency, similar use case to ZGC</td></tr>
</table>`
        },
        {
            content: `<h3>Production Scenario: Migrating to ZGC</h3>
A real-time bidding platform running G1 on a 64GB heap was seeing occasional pauses of 300-500ms during mixed
collections, violating a strict 20ms p99 SLA for bid responses. <br><br>
Steps taken: <br>
• Switched from <code>-XX:+UseG1GC</code> to <code>-XX:+UseZGC</code> (Java 17, then later generational ZGC on
Java 21 with <code>-XX:+ZGenerational</code> for better throughput on high-allocation-rate workloads). <br>
• Verified enough spare CPU headroom existed, since ZGC's concurrent work runs alongside application threads and
consumes extra CPU cycles that G1's Stop-the-World phases did not. <br>
• Monitored with GC logging (<code>-Xlog:gc*:file=gc.log</code>) to confirm pause times dropped into the
sub-millisecond range consistently. <br><br>
Result: p99 pause-related latency dropped from hundreds of ms to effectively negligible, at the cost of roughly
10-15% higher steady-state CPU usage - an acceptable tradeoff given the strict SLA.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is ZGC's headline design goal?</td><td>Sub-millisecond garbage collection pause times, largely independent of heap size, even on multi-terabyte heaps</td></tr>
<tr><td>What are colored pointers?</td><td>References that use spare unused bits in a 64-bit pointer to store GC metadata (marked, relocated, remap-needed) directly in the reference itself</td></tr>
<tr><td>What is a load barrier in ZGC?</td><td>A lightweight check inserted on every heap reference read that inspects the pointer's color bits and fixes up stale references on the fly if needed</td></tr>
<tr><td>How does ZGC relocate objects without a long Stop-the-World pause?</td><td>It relocates objects concurrently while application threads run, using load barriers to transparently redirect any thread that touches a moved object's reference</td></tr>
<tr><td>What is the tradeoff of using ZGC compared to G1?</td><td>ZGC offers far shorter pauses but typically consumes more CPU and memory overhead due to barrier checks and extra per-object metadata</td></tr>
<tr><td>Which flag enables ZGC?</td><td><code>-XX:+UseZGC</code></td></tr>
<tr><td>What workload is ZGC best suited for?</td><td>Latency-sensitive applications with strict pause-time SLAs and/or very large heaps, such as trading systems or real-time bidding platforms</td></tr>
<tr><td>What is generational ZGC?</td><td>A newer mode (default in recent JDKs) that adds young/old generation separation to ZGC, improving throughput for high-allocation-rate workloads while keeping its low-pause guarantees</td></tr>
</table>`
        }
    ]
};
