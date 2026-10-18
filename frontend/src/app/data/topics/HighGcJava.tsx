import { Topic } from '../coreJava';

export const highGcJava: Topic = {
    id: 'high-gc-java',
    name: 'High GC',
    beginner: [
        {
            content: `<h3>What is "High GC"?</h3>
Garbage Collection (GC) is the JVM automatically reclaiming memory used by objects that are no longer reachable.
Some GC activity is normal and healthy - it's how Java manages memory without manual <code>free()</code> calls. <br><br>
"High GC" describes a situation where GC runs <strong>too often</strong> or takes <strong>too long</strong>
relative to the actual work the application is doing - so much of the app's time is spent pausing for GC instead
of serving requests. This shows up to users as slow response times, timeouts, or stutter, even though there's no
crash (yet).`
        },
        {
            content: `<h4>Simulating High GC Frequency</h4>
Allocating lots of short-lived objects very rapidly forces the JVM's young generation to fill up and collect over
and over again, which you can literally watch happen with GC logging enabled.`,
            codeExamples: [`public class HighGcFrequencyDemo {

    public static void main(String[] args) {
        long start = System.currentTimeMillis();
        long count = 0;

        while (System.currentTimeMillis() - start < 5000) {
            // Each iteration allocates a short-lived String - the JVM has to
            // run Young Gen GC repeatedly to keep up with this allocation rate
            String temp = "value-" + count;
            count++;
        }
        System.out.println("Allocated roughly " + count + " short-lived Strings in 5 seconds");
    }
}
// Run with: java -Xmx64m -Xlog:gc HighGcFrequencyDemo
// OUTPUT (sample GC log lines interleaved with the app):
// [0.045s][info][gc] GC(0) Pause Young (Normal) (G1 Evacuation Pause) 12M->4M(64M) 3.112ms
// [0.098s][info][gc] GC(1) Pause Young (Normal) (G1 Evacuation Pause) 14M->4M(64M) 2.981ms
// [0.151s][info][gc] GC(2) Pause Young (Normal) (G1 Evacuation Pause) 13M->4M(64M) 2.870ms
// ... (dozens of Young GC pauses in just 5 seconds)
// Allocated roughly 41823113 short-lived Strings in 5 seconds`]
        },
        {
            content: `<h4>Simulating Long, Painful GC Pauses</h4>
Filling the heap close to its limit with objects that survive (are retained) forces expensive, longer full GCs
instead of quick young-gen collections.`,
            codeExamples: [`import java.util.ArrayList;
import java.util.List;

public class LongGcPauseDemo {

    static List<byte[]> retained = new ArrayList<>();

    public static void main(String[] args) {
        for (int i = 0; i < 60; i++) {
            retained.add(new byte[1024 * 1024]); // 1MB, kept alive by static list
            System.out.println("Added chunk " + i);
        }
    }
}
// Run with: java -Xmx64m -Xlog:gc LongGcPauseDemo
// OUTPUT (near the end, GC pauses get noticeably longer as the heap fills up):
// [0.512s][info][gc] GC(18) Pause Full (G1 Compaction Pause) 61M->58M(64M) 187.442ms
// [0.734s][info][gc] GC(19) Pause Full (G1 Compaction Pause) 63M->61M(64M) 201.887ms
// Added chunk 58
// Added chunk 59`]
        },
        {
            content: `<h4>Simple Fixes at the Beginner Level</h4>
• <strong>Reduce unnecessary allocation</strong> - avoid creating throwaway objects inside hot loops (e.g. building
Strings with <code>+</code> in a loop instead of <code>StringBuilder</code>). <br>
• <strong>Reuse objects/buffers</strong> where safe, instead of allocating a new one every call. <br>
• <strong>Right-size the heap</strong> - a heap that's too small forces the JVM to collect constantly just to make
room for normal traffic.`
        }
    ],

    expert: [
        {
            content: `<h3>Reading GC Logs Like an Engineer</h3>
Modern JVMs (9+) use unified logging (<code>-Xlog:gc*</code>). A single Young GC log line carries several important
numbers worth learning to read at a glance:
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">[12.451s][info][gc] GC(142) Pause Young (Normal) (G1 Evacuation Pause) 812M->210M(1024M) 45.223ms
   |          |     |                                         |     |      |
   timestamp  GC#   pause type / cause                     before after total-heap  duration

Key ratios to track over time, not just single lines:
  - Frequency:  how many GC(#) events per minute -> allocation rate proxy
  - Reclaim %:  (before - after) / before        -> how effective each GC is
  - Pause time: duration in ms                    -> user-facing latency impact
  - Post-GC floor: "after" value trending UP over successive GCs -> leak signal</pre>
A healthy young-gen GC reclaims 80-95% of the young generation in a few milliseconds. When reclaim percentage drops
and pause duration climbs together, that's the classic signature of a heap under real memory pressure, not just
routine collection.`
        },
        {
            content: `<h3>Throughput vs Latency: Choosing (and Tuning) a Collector</h3>
"High GC" often isn't really about a bug - it's about a collector mismatched to the workload's goals. <br><br>
• <strong>G1 GC (default since JDK 9)</strong> - balances throughput and pause time; tunable target pause via
<code>-XX:MaxGCPauseMillis=200</code>. Good general-purpose default. <br>
• <strong>Parallel GC</strong> - maximizes throughput, accepts longer/less predictable pauses; suited for batch
jobs where total runtime matters more than individual pause length. <br>
• <strong>ZGC / Shenandoah</strong> - designed for very low pause times (sub-millisecond to a few ms) even on
huge heaps (100s of GB), at some throughput/CPU cost; ideal for latency-sensitive services with big heaps. <br><br>
A common production mistake is running a latency-sensitive API on Parallel GC's default settings (tuned for
throughput) and being surprised by occasional multi-second pauses under load - the fix is often just switching
collector or its goals, not rewriting application code.`
        },
        {
            content: `<h3>Symptom -> Root Cause -> Diagnosis -> Fix</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Symptom</th><th>Root Cause</th><th>Diagnosis</th><th>Fix</th></tr>
<tr><td>Frequent short Young GC pauses (many per second) under normal load</td><td>High allocation rate - too many short-lived objects created per request</td><td>GC logs show high GC(#) frequency; profiler (JFR Allocation Profiling) shows top allocating call sites</td><td>Reduce allocations in hot paths (avoid boxing, reuse buffers, use StringBuilder, avoid unnecessary intermediate collections)</td></tr>
<tr><td>Occasional very long Full GC pauses (seconds) causing request timeouts</td><td>Old generation filling up, forcing expensive Full/Mixed GC compaction</td><td>GC logs show "Pause Full" events with large before->after deltas and long duration; correlate with request timeout spikes</td><td>Investigate for a leak first (see Memory Leak topic); if genuinely legitimate live-set, increase heap or switch to a low-pause collector (G1/ZGC) with tuned targets</td></tr>
<tr><td>Reclaim percentage steadily dropping across successive GCs over hours</td><td>Slow memory leak - live set growing, less to reclaim each cycle</td><td>Plot post-GC heap occupancy over time; a rising floor (not returning to baseline) confirms a leak, not just load</td><td>Heap dump + MAT to find and fix the leak (see Memory Leak topic)</td></tr>
<tr><td>High GC CPU usage with small heap even at low traffic</td><td>Heap sized too small for the working set, forcing constant collection just to fit normal live data</td><td>Compare -Xmx to observed steady-state old-gen occupancy after GC</td><td>Increase -Xmx to comfortably exceed the real working set with headroom</td></tr>
<tr><td>Latency-sensitive service has rare multi-second pause spikes despite low average GC time</td><td>Wrong collector for the goal - e.g. Parallel/throughput-tuned GC used for a latency-critical API</td><td>Check configured collector (-XX flags) and its pause-time targets against SLA requirements</td><td>Switch to G1 with -XX:MaxGCPauseMillis, or ZGC/Shenandoah for very tight pause SLAs on large heaps</td></tr>
</table>`
        },
        {
            content: `<h3>War Story: The Nightly Batch Job That Broke the Live API</h3>
An order-analytics service shared its JVM heap between two workloads: a customer-facing REST API and a nightly
batch aggregation job. After a new "real-time trending" feature was added to the batch job, on-call started
getting paged for API p99 latency spiking to 4-6 seconds every night at 2 AM - always exactly when the batch job
ran. <br><br>
GC logs during the incident window showed a burst of large "Pause Full" events instead of the usual quick Young
GCs - the batch job's new trending logic built several large intermediate <code>HashMap</code>s that lived just
long enough to get promoted into old generation, filling it and triggering expensive full compactions, which
stopped-the-world for every thread including the ones serving live API traffic. <br><br>
<strong>Fix:</strong> the batch workload was moved to a separate JVM process entirely (different heap, different
GC tuning profile suited to throughput), fully isolating its allocation behavior from the latency-sensitive API
process - a textbook case of "one JVM, two very different workloads" being the real root cause, not a code bug.`
        },
        {
            content: `<h3>Prevention Checklist</h3>
• Enable GC logging permanently in production (<code>-Xlog:gc*:file=gc.log:time,uptime:filecount=10,filesize=50m</code>)
- the overhead is negligible and the historical data is invaluable during incidents. <br>
• Track GC pause time and frequency as first-class dashboard metrics (via JMX/Micrometer), not just heap
percentage. <br>
• Separate workloads with very different allocation profiles (batch vs. real-time) into different JVM
processes/pods rather than sharing one heap. <br>
• Choose the collector based on stated latency vs throughput goals, and revisit that choice as heap size or SLA
requirements change. <br>
• Load-test with production-realistic allocation patterns, not just request volume, since GC pressure depends on
what each request allocates, not just how many requests arrive.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What does "high GC" mean and what user-facing symptom does it usually cause?</td><td>GC running too frequently or taking too long relative to actual work, causing elevated latency, timeouts, or throughput drops even without a crash</td></tr>
<tr><td>What's the difference between a Young GC pause and a Full GC pause?</td><td>Young GC only collects the young generation (fast, frequent, usually a few ms); Full GC collects the entire heap including old gen (slower, less frequent, can pause for hundreds of ms to seconds)</td></tr>
<tr><td>How do you tell from GC logs whether you have a leak versus just high load?</td><td>Track post-GC heap occupancy over time - if it returns to roughly the same baseline after each GC, it's load; if the floor keeps rising across successive GCs, it's a leak</td></tr>
<tr><td>What does -XX:MaxGCPauseMillis do?</td><td>Sets a soft target maximum pause time for G1 GC; G1 adapts region sizing and collection scheduling to try to meet it, though it's a goal, not a hard guarantee</td></tr>
<tr><td>When would you choose ZGC or Shenandoah over G1?</td><td>When the application needs very low, consistent pause times (sub-millisecond to a few ms) even with a very large heap, and can accept somewhat higher CPU/throughput overhead in exchange</td></tr>
<tr><td>Why might running a batch job and a latency-sensitive API in the same JVM cause GC problems?</td><td>Their very different allocation patterns (large batch intermediate structures vs small request-scoped objects) share one heap, so the batch job's allocations can trigger costly full GCs that pause the API's threads too</td></tr>
<tr><td>What's the first thing to check if GC frequency suddenly increases after a deploy?</td><td>What changed in allocation behavior - new code creating more objects per request, larger cached objects, or a new dependency with heavier allocation patterns</td></tr>
</table>`
        }
    ]
};
