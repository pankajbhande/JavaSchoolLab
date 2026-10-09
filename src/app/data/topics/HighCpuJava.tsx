import { Topic } from '../coreJava';

export const highCpuJava: Topic = {
    id: 'high-cpu-java',
    name: 'High CPU',
    beginner: [
        {
            content: `<h3>What Does "High CPU" Mean for a Java App?</h3>
A Java process is said to have a "high CPU" problem when it consumes an unusually large, sustained share of the
machine's CPU - often 100% of one or more cores - even though the actual useful work being done doesn't justify
it. <br><br>
This isn't a single exception you can catch. It's a <strong>symptom</strong> you observe from outside the JVM (via
the OS) and then have to trace back <em>inside</em> the JVM to find which thread(s) and which line(s) of code are
responsible.`
        },
        {
            content: `<h4>Cause 1: A Busy (Spinning) Loop</h4>
The simplest way to cause high CPU is a loop that keeps running without ever pausing or blocking - e.g. waiting
for a condition by spinning instead of using proper thread coordination.`,
            codeExamples: [`public class BusyLoopDemo {

    static volatile boolean ready = false;

    public static void main(String[] args) throws InterruptedException {
        // Worker thread "busy-waits" for ready to become true - burns 100% of a CPU core
        Thread worker = new Thread(() -> {
            while (!ready) {
                // spinning - constantly checking, never sleeping/blocking
            }
            System.out.println("Ready! Doing work now.");
        });
        worker.start();

        Thread.sleep(3000); // simulate other work happening
        ready = true;
        worker.join();
    }
}
// OUTPUT (observe with 'top' or Task Manager while running):
// worker thread pins one CPU core at ~100% for the full 3 seconds
// Ready! Doing work now.`]
        },
        {
            content: `<h4>Cause 2: Catastrophic Regex Backtracking</h4>
Certain regular expressions can take exponential time on specific "evil" inputs due to backtracking - a single
<code>matches()</code> call can peg a CPU core for minutes on a moderately long string.`,
            codeExamples: [`import java.util.regex.Pattern;

public class RegexHighCpuDemo {

    public static void main(String[] args) {
        // Classic catastrophic-backtracking pattern: nested quantifiers
        Pattern evilPattern = Pattern.compile("(a+)+b");

        String input = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaac";

        System.out.println("Starting match...");
        boolean result = evilPattern.matcher(input).matches(); // hangs, pegs CPU
        System.out.println("Matched: " + result);
    }
}
// OUTPUT:
// Starting match...
// (this line may never print in a reasonable time -
//  the thread runs at 100% CPU indefinitely evaluating backtracking paths)`]
        },
        {
            content: `<h4>Cause 3: GC Thrashing</h4>
When the JVM is allocating objects faster than it can safely reclaim memory, the Garbage Collector runs almost
continuously, consuming large amounts of CPU just to keep the app barely alive (see the "High GC" and
"OutOfMemoryError" topics for the full picture).`,
            codeExamples: [`import java.util.ArrayList;
import java.util.List;

public class GcThrashingCpuDemo {
    public static void main(String[] args) {
        List<int[]> data = new ArrayList<>();
        while (true) {
            data.add(new int[100_000]); // continuous large, retained allocations
        }
    }
}
// Run with a small heap, e.g. java -Xmx64m GcThrashingCpuDemo
// OUTPUT (observe CPU with 'top' before the eventual crash):
// GC threads consume 90-100% CPU trying to keep up, well before:
// Exception in thread "main" java.lang.OutOfMemoryError: GC overhead limit exceeded`]
        },
        {
            content: `<h4>How to Start Investigating High CPU</h4>
On any OS, the basic workflow is the same two-step process: <br>
• <strong>Find which OS thread is hot</strong> - use <code>top -H -p &lt;pid&gt;</code> (Linux) or Task Manager's
per-thread view to find the native thread ID (TID/LWP) consuming the most CPU. <br>
• <strong>Map that OS thread to a Java thread</strong> - take a thread dump with <code>jstack &lt;pid&gt;</code> and
match the hex-converted TID to the <code>nid=0x...</code> field in the dump to see exactly which Java method that
thread is stuck executing.`
        }
    ],

    expert: [
        {
            content: `<h3>The top -H + jstack Correlation Technique</h3>
This is the single most important production skill for high-CPU Java diagnosis - correlating an OS-level thread ID
with a JVM-level stack trace. <br><br>
1. Identify the process: <code>top -p &lt;pid&gt;</code> confirms the Java process itself is the CPU hog. <br>
2. Break it down by thread: <code>top -H -p &lt;pid&gt;</code> shows individual native threads (LWPs) and their
individual CPU%. Note the TID of the hottest thread(s), e.g. <code>18452</code>. <br>
3. Convert to hex: <code>printf "%x\\n" 18452</code> gives <code>4814</code>. <br>
4. Take a thread dump: <code>jstack &lt;pid&gt; &gt; dump.txt</code> (or <code>kill -3 &lt;pid&gt;</code> to print it
to stdout/log). <br>
5. Search the dump for <code>nid=0x4814</code> - that block of the dump is exactly what that hot native thread was
executing in Java at that moment.
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">"pool-3-thread-7" #47 prio=5 os_prio=0 cpu=48213.45ms elapsed=612.09s tid=0x00007f2c productive
   nid=0x4814 runnable [0x00007f2b1a1fe000]
   java.lang.Thread.State: RUNNABLE
        at com.shop.pricing.DiscountEngine.matchPromoCode(DiscountEngine.java:118)
        at com.shop.pricing.DiscountEngine.applyRule(DiscountEngine.java:64)
        at com.shop.pricing.OrderService.calculateTotal(OrderService.java:88)</pre>
Taking 2-3 thread dumps a few seconds apart and seeing the <strong>same</strong> line repeatedly is strong evidence
of a genuine hot loop (as opposed to normal, varying activity) at that exact line.`
        },
        {
            content: `<h3>Async-Profiler / JFR for Flame Graphs</h3>
For CPU problems that are spread across many methods rather than one obvious hot loop, sampling profilers give a
much clearer picture than manual thread-dump correlation: <br><br>
• <strong>Java Flight Recorder (JFR)</strong> - built into the JDK, low overhead, can even be run continuously in
production: <code>java -XX:+FlightRecorder -XX:StartFlightRecording=duration=60s,filename=recording.jfr MyApp</code>,
then open the recording in JDK Mission Control to see a flame graph of where CPU time was actually spent. <br>
• <strong>async-profiler</strong> - an external agent that samples native + Java stacks with very low overhead,
commonly attached on demand: <code>./profiler.sh -d 30 -e cpu -f flamegraph.html &lt;pid&gt;</code>. <br><br>
Flame graphs let you see, at a glance, which method call trees consume the widest share of total CPU samples -
far faster than manually diffing multiple jstack dumps.`
        },
        {
            content: `<h3>Symptom -> Root Cause -> Diagnosis -> Fix</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Symptom</th><th>Root Cause</th><th>Diagnosis</th><th>Fix</th></tr>
<tr><td>One core pegged at 100% constantly, even at low traffic</td><td>Busy-wait / spin loop instead of proper blocking wait (e.g. polling a flag instead of using wait/notify or a BlockingQueue)</td><td>top -H shows one thread consistently hot; jstack repeatedly shows same RUNNABLE frame in a tight loop</td><td>Replace polling with proper synchronization primitives (wait/notify, CountDownLatch, BlockingQueue, CompletableFuture)</td></tr>
<tr><td>CPU spikes to 100% on specific user input (e.g. certain search strings)</td><td>Catastrophic regex backtracking (evil regex pattern with nested quantifiers)</td><td>Correlate the hot thread's stack trace with java.util.regex.Pattern$Matcher frames; test the exact input against the regex in isolation</td><td>Rewrite the regex to avoid nested quantifiers/ambiguous alternation, or use a regex engine/library with backtracking limits (e.g. RE2J)</td></tr>
<tr><td>High CPU across many GC threads, correlates with high allocation rate</td><td>GC thrashing due to excessive allocation rate or undersized heap</td><td>GC logs show frequent full GCs with low reclaim %; correlate CPU spikes with GC log timestamps</td><td>Reduce allocation rate (avoid unnecessary object creation, reuse buffers), tune heap size/GC algorithm</td></tr>
<tr><td>High CPU with no single obviously hot thread - spread across many threads</td><td>Inefficient algorithm (e.g. O(n^2) logic) run at scale, or excessive serialization/deserialization</td><td>JFR/async-profiler flame graph shows a wide, flat top spread across a specific method call tree</td><td>Optimize the hot algorithm (better data structure, caching, batching), or parallelize/offload it appropriately</td></tr>
<tr><td>CPU high only right after deployment, settles after a few minutes</td><td>JIT warm-up - code is running in interpreted/C1 mode before hitting C2 optimization threshold</td><td>Compare CPU trend against JIT compilation logs (-XX:+PrintCompilation) and request latency trend post-deploy</td><td>Usually expected/benign - consider a warm-up phase before routing production traffic (readiness gating)</td></tr>
</table>`
        },
        {
            content: `<h3>War Story: The Promo Code Regex That Cost 40% of the Fleet</h3>
A retail checkout service began throwing timeouts across roughly 40% of instances during a flash sale, while the
rest of the fleet looked healthy. CPU graphs showed the affected instances pinned at 100% on exactly one core each,
while overall request rate hadn't grown dramatically. <br><br>
Running <code>top -H</code> plus <code>jstack</code> on an affected instance repeatedly showed the same hot thread
stuck inside <code>DiscountEngine.matchPromoCode</code>, which validated promo codes using a hand-written regex
containing a nested quantifier: <code>^(PROMO-[A-Z0-9]+)+$</code>. A marketing campaign had, that day, started
generating promo codes with an unusual trailing suffix that didn't cleanly match - triggering catastrophic
backtracking on every validation attempt for those specific codes, and each affected instance happened to be one
that had recently received a request containing one of the problem codes. <br><br>
<strong>Fix:</strong> the regex was replaced with a simple, linear-time manual prefix/character-class check
(no nested quantifiers), and a CPU-time watchdog was added around promo validation as a safety net for future
regex-related regressions.`
        },
        {
            content: `<h3>Prevention Checklist</h3>
• Avoid regex patterns with nested or overlapping quantifiers on untrusted/variable-length input; test regexes
against long adversarial strings before shipping. <br>
• Never busy-wait; always use blocking coordination primitives (<code>wait/notify</code>,
<code>BlockingQueue</code>, <code>CompletableFuture</code>, <code>CountDownLatch</code>). <br>
• Bake <code>top -H</code> + <code>jstack</code> correlation (or an equivalent APM CPU profiler) into your standard
incident runbook so responders don't waste time guessing. <br>
• Run continuous low-overhead JFR recording in production so a CPU spike can be analyzed retroactively without
needing to reproduce it live. <br>
• Load-test with realistic, occasionally adversarial input data (not just "happy path" fixtures) to catch
algorithmic complexity issues before production.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>How do you diagnose which Java thread is causing high CPU on a server?</td><td>Use "top -H -p &lt;pid&gt;" to find the hot native thread ID (TID), convert it to hex, then match it against the nid field in a jstack thread dump to see exactly what that thread was executing</td></tr>
<tr><td>What is a "busy-wait" loop and why is it bad?</td><td>A loop that repeatedly checks a condition without blocking/sleeping, consuming 100% CPU on that core; it should be replaced with proper blocking coordination like wait/notify or a BlockingQueue</td></tr>
<tr><td>What is catastrophic regex backtracking?</td><td>A regex with ambiguous nested/overlapping quantifiers can require exponential time to fail to match certain inputs, because the engine tries an exponential number of backtracking paths, pegging CPU</td></tr>
<tr><td>How can GC cause high CPU?</td><td>If allocation rate is too high or the heap is undersized, the GC runs very frequently or continuously trying to reclaim space, consuming large amounts of CPU with little useful application progress</td></tr>
<tr><td>What's the difference between jstack and a profiler like async-profiler/JFR for CPU issues?</td><td>jstack gives point-in-time snapshots useful for finding one obviously hot, repeating stack frame; a sampling profiler aggregates over time into a flame graph, better for CPU spread across many methods</td></tr>
<tr><td>Why might taking multiple jstack dumps a few seconds apart be more useful than just one?</td><td>Seeing the same stack frame repeat across multiple dumps is strong evidence of a genuine hot loop, distinguishing it from normal varying thread activity captured in a single snapshot</td></tr>
<tr><td>Can high CPU happen right after a deployment even with no bug?</td><td>Yes - JIT warm-up means new code runs interpreted/less-optimized initially, causing temporarily elevated CPU until hot methods are compiled by C2; this is usually benign and settles quickly</td></tr>
</table>`
        }
    ]
};
