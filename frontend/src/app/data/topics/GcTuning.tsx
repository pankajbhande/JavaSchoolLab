import { Topic } from '../coreJava';

export const gcTuning: Topic = {
    id: 'gc-tuning',
    name: 'GC Tuning',
    beginner: [
        {
            content: `<h3>What Does "Tuning the GC" Mean?</h3>
GC tuning means adjusting JVM startup flags so the garbage collector behaves better for <em>your</em> specific
application - fewer pauses, shorter pauses, less memory used, or higher throughput, depending on what you actually
need. <br><br>
You don't change your Java source code to tune GC - you pass extra flags when starting the JVM.`,
            codeExamples: [`public class HelloTuning {
    public static void main(String[] args) {
        System.out.println("Run me with: java -Xms256m -Xmx512m HelloTuning");
        System.out.println("No code changes needed - tuning happens via JVM flags");
    }
}
// OUTPUT:
// Run me with: java -Xms256m -Xmx512m HelloTuning
// No code changes needed - tuning happens via JVM flags`]
        },
        {
            content: `<h3>-Xms and -Xmx: Setting Heap Size</h3>
The two most fundamental flags control how much heap memory the JVM can use: <br><br>
• <code>-Xms</code> - the <strong>initial</strong> heap size when the JVM starts. <br>
• <code>-Xmx</code> - the <strong>maximum</strong> heap size the JVM is allowed to grow to. <br><br>
Example: <code>java -Xms512m -Xmx2g MyApp</code> starts with a 512MB heap and allows it to grow up to 2GB as needed.`,
            codeExamples: [`public class HeapSizeDemo {
    public static void main(String[] args) {
        long maxMemory = Runtime.getRuntime().maxMemory();
        System.out.println("Max heap available to this JVM (bytes): " + maxMemory);
        // Run with: java -Xmx256m HeapSizeDemo  to see this number change
    }
}
// OUTPUT (varies by -Xmx setting used, example with -Xmx256m):
// Max heap available to this JVM (bytes): 268435456`]
        },
        {
            content: `<h3>Choosing a Collector</h3>
You can explicitly choose which garbage collector the JVM should use: <br><br>
• <code>-XX:+UseG1GC</code> - the general-purpose default since Java 9. <br>
• <code>-XX:+UseZGC</code> - for ultra-low-latency needs. <br>
• <code>-XX:+UseParallelGC</code> - for maximum throughput, batch-style workloads. <br><br>
If you don't specify one, the JVM picks a sensible default automatically (G1 on modern JVMs).`
        },
        {
            content: `<h3>Setting a Pause Time Goal</h3>
With G1, you can tell the collector how long you're willing to let a pause be, and it will try its best to honor
that target: <br><br>
<code>java -XX:+UseG1GC -XX:MaxGCPauseMillis=100 MyApp</code>`,
            codeExamples: [`public class PauseGoalBeginnerDemo {
    public static void main(String[] args) {
        StringBuilder builder = new StringBuilder();
        for (int i = 0; i < 200000; i++) {
            builder.append(i).append(",");
        }
        System.out.println("Total length: " + builder.length());
        // Run with: java -XX:+UseG1GC -XX:MaxGCPauseMillis=50 PauseGoalBeginnerDemo
    }
}
// OUTPUT:
// Total length: 1288890`]
        },
        {
            content: `<h3>Turning On GC Logging</h3>
Before tuning anything, you need visibility into what the GC is actually doing. The modern unified logging flag is:
<br><br>
<code>-Xlog:gc*:file=gc.log:time,level,tags</code> <br><br>
This writes a detailed log of every GC event - which phase ran, how long it took, and how much memory was
reclaimed - to <code>gc.log</code>, which you can then inspect or feed into a GC log analysis tool.`
        }
    ],

    expert: [
        {
            content: `<h3>Key JVM Flags Reference</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Flag</th><th>Purpose</th></tr>
<tr><td><code>-Xms</code> / <code>-Xmx</code></td><td>Initial / maximum heap size</td></tr>
<tr><td><code>-Xmn</code></td><td>Young Generation size (Parallel/CMS-style collectors)</td></tr>
<tr><td><code>-XX:+UseG1GC</code></td><td>Enable G1 (default since Java 9)</td></tr>
<tr><td><code>-XX:+UseZGC</code></td><td>Enable ZGC for ultra-low-latency workloads</td></tr>
<tr><td><code>-XX:+UseParallelGC</code></td><td>Enable throughput-oriented Parallel GC</td></tr>
<tr><td><code>-XX:MaxGCPauseMillis=N</code></td><td>Target maximum pause time goal (G1 and Parallel treat this as a soft goal; ZGC ignores it and bounds pauses by design)</td></tr>
<tr><td><code>-XX:G1HeapRegionSize=N</code></td><td>Override G1's auto-chosen region size</td></tr>
<tr><td><code>-XX:InitiatingHeapOccupancyPercent=N</code></td><td>Old Gen occupancy % that triggers G1's concurrent marking cycle to start</td></tr>
<tr><td><code>-XX:SurvivorRatio=N</code></td><td>Ratio of Eden to each Survivor space size</td></tr>
<tr><td><code>-XX:MaxTenuringThreshold=N</code></td><td>How many Minor GCs an object survives before being promoted to Old Gen</td></tr>
<tr><td><code>-XX:+HeapDumpOnOutOfMemoryError</code></td><td>Write a heap dump automatically on OutOfMemoryError, for post-mortem analysis</td></tr>
<tr><td><code>-Xlog:gc*:file=gc.log:time,level,tags</code></td><td>Unified GC logging (Java 9+) - the starting point for any tuning effort</td></tr>
</table>`
        },
        {
            content: `<h3>Reading a GC Log Line</h3>
A typical G1 GC log entry (simplified) looks like this: <br><br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">[2026-08-19T10:15:42.123+0000][gc,start] GC(42) Pause Young (Normal) (G1 Evacuation Pause)
[2026-08-19T10:15:42.145+0000][gc,heap]  GC(42) Eden regions: 40->0(42)
[2026-08-19T10:15:42.145+0000][gc,heap]  GC(42) Survivor regions: 5->6(8)
[2026-08-19T10:15:42.145+0000][gc,heap]  GC(42) Old regions: 12->14
[2026-08-19T10:15:42.146+0000][gc      ] GC(42) Pause Young (Normal) 165M->98M(512M) 22.7ms</pre>
How to read it: <br>
• <strong>GC(42)</strong> - the sequence number of this GC event, useful for correlating across log lines. <br>
• <strong>165M-&gt;98M(512M)</strong> - heap usage before GC, after GC, out of total committed heap. <br>
• <strong>22.7ms</strong> - the actual pause duration for this event - the number you compare against your
<code>MaxGCPauseMillis</code> goal. <br>
• Region deltas (Eden/Survivor/Old) show exactly where memory moved, which is essential for spotting patterns like
premature promotion.`
        },
        {
            content: `<h3>Throughput-Oriented vs Latency-Oriented Tuning</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Goal</th><th>Recommended Collector</th><th>Key Flags</th><th>Tradeoff Accepted</th></tr>
<tr><td>Maximum throughput (batch jobs, ETL)</td><td>Parallel GC</td><td><code>-XX:+UseParallelGC</code>, large <code>-Xmx</code>, tuned <code>-XX:GCTimeRatio</code></td><td>Longer, less predictable pauses</td></tr>
<tr><td>Balanced, general-purpose services</td><td>G1 GC</td><td><code>-XX:+UseG1GC -XX:MaxGCPauseMillis=200</code></td><td>Slightly lower throughput than Parallel GC</td></tr>
<tr><td>Ultra-low-latency (trading, bidding, real-time)</td><td>ZGC</td><td><code>-XX:+UseZGC -XX:+ZGenerational</code></td><td>Higher CPU and memory overhead</td></tr>
<tr><td>Minimize memory footprint (small containers)</td><td>Serial GC</td><td><code>-XX:+UseSerialGC</code>, small <code>-Xmx</code></td><td>Single-threaded GC, longer pauses relative to heap size</td></tr>
</table>`
        },
        {
            content: `<h3>Production Tuning Walkthrough: Diagnosing Frequent Full GCs</h3>
A microservice on G1 with <code>-Xmx4g</code> was hitting Full GCs every few minutes, each taking 1-2 seconds, and
memory usage kept climbing back to near-max after each collection - a classic sign of a memory leak, not just
under-tuning. <br><br>
Diagnostic steps: <br>
• Enabled <code>-Xlog:gc*:file=gc.log:time,level,tags</code> and watched Old Gen occupancy after each cycle - it
never dropped back to baseline, confirming a leak rather than a sizing issue. <br>
• Added <code>-XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/dumps</code> to capture a heap dump automatically
when it eventually failed. <br>
• Analyzed the heap dump and found a static <code>Map</code> used as an unbounded cache, growing without eviction. <br><br>
Fix: replaced the unbounded cache with a bounded, size-limited cache (eviction policy). GC frequency and pause
duration returned to normal immediately - illustrating that <strong>GC flags cannot fix an actual memory leak</strong>,
only application-level fixes can; tuning only helps when the underlying object lifetimes are legitimately what
they should be.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is the difference between -Xms and -Xmx?</td><td>-Xms sets the initial heap size at JVM startup; -Xmx sets the maximum size the heap is allowed to grow to</td></tr>
<tr><td>Which flag enables G1 explicitly, and is it needed on modern JVMs?</td><td><code>-XX:+UseG1GC</code>; it's usually not needed since G1 has been the default since Java 9</td></tr>
<tr><td>What does -XX:MaxGCPauseMillis actually guarantee?</td><td>It is a soft goal, not a hard guarantee - G1/ZGC try to stay within it by adjusting collection scope, but extreme conditions (e.g. allocation spikes) can still exceed it</td></tr>
<tr><td>How do you enable GC logging in modern Java (9+)?</td><td>Using the unified logging flag, e.g. <code>-Xlog:gc*:file=gc.log:time,level,tags</code></td></tr>
<tr><td>In a GC log line like "165M->98M(512M) 22.7ms", what does each number mean?</td><td>Heap usage before GC, heap usage after GC, total committed heap size, and the pause duration</td></tr>
<tr><td>If Full GCs keep happening and memory never drops back down, what should you suspect first?</td><td>A memory leak (objects unintentionally kept reachable), not a heap-sizing problem - GC tuning cannot fix a genuine leak</td></tr>
<tr><td>Which collector would you choose for a batch ETL job vs a low-latency trading system?</td><td>Parallel GC for maximum throughput on the batch job; ZGC for the trading system's strict low-pause requirements</td></tr>
<tr><td>What is -XX:+HeapDumpOnOutOfMemoryError used for?</td><td>Automatically writing a heap dump when an OutOfMemoryError occurs, enabling post-mortem analysis of what was consuming memory</td></tr>
</table>`
        }
    ]
};
