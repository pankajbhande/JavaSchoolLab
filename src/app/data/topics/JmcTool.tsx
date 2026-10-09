import { Topic } from '../coreJava';

export const jmcTool: Topic = {
    id: 'jmc-tool',
    name: 'JMC (Java Mission Control)',
    beginner: [
        {
            content: `<h3>What is JMC?</h3>
Java Mission Control (JMC) is a free desktop GUI application for viewing and analyzing the data recorded by JFR
(Java Flight Recorder). While JFR does the recording inside the JVM, JMC is the tool you use to actually
<em>look</em> at that data - with charts, tables, and drill-down views instead of raw text. <br><br>
Think of JFR as the "black box recorder" and JMC as the "playback software" investigators use to review it.`
        },
        {
            content: `<h3>Getting JMC</h3>
JMC used to ship bundled with the JDK, but since Java 9 it's a separate free download maintained by the OpenJDK
community (and also offered by vendors like Azul and Red Hat). You download and install it once, then point it at
any <code>.jfr</code> recording file, or connect it live to a running JVM on your network.`,
            codeExamples: [`# Open a saved recording directly from the command line (once JMC is installed)
jmc -open recording.jfr`]
        },
        {
            content: `<h3>Connecting JMC to a Live JVM</h3>
Besides opening saved <code>.jfr</code> files, JMC can connect directly to a running JVM (local or over the network,
via JMX) to start/stop recordings and watch live data, without needing to manually use <code>jcmd</code> first.`
        },
        {
            content: `<h3>Key Views in JMC</h3>
Once a recording is open, JMC organizes the data into tabs, the most important being: <br>
• <strong>General</strong> - overview of the JVM, its version, flags, and system info during the recording. <br>
• <strong>Memory</strong> - heap usage over time, garbage collection pauses and their causes. <br>
• <strong>Code</strong> - "hot methods" - which methods consumed the most CPU time. <br>
• <strong>Threads</strong> - thread activity, lock contention (which locks caused the most blocking). <br>
• <strong>I/O</strong> - file and socket reads/writes, useful for spotting slow external calls.`
        },
        {
            content: `<h3>Why Use JMC Instead of Reading Raw JFR Text?</h3>
While you can print raw event data with the <code>jfr</code> command-line tool, JMC's real value is visual
correlation - seeing a CPU spike, a GC pause, and a lock-contention event all lined up on the same timeline, which
makes cause-and-effect jump out in a way scrolling through text output never does.`
        }
    ],

    expert: [
        {
            content: `<h3>The Automated Analysis Engine</h3>
JMC includes a built-in <strong>Automated Analysis Results</strong> tab that runs a rule engine over the recording
and automatically flags likely problems - similar in spirit to a linter, but for runtime behavior. It scores findings
by severity (info / warning / severe) and explains them in plain language, for example: <br>
• "Long garbage collection pauses detected" <br>
• "Class loading is a significant contributor to total time" <br>
• "Thread X spent a large percentage of the recording BLOCKED" <br><br>
This is often the fastest way to get oriented in an unfamiliar recording before manually drilling into the Memory,
Code, or Threads tabs.`
        },
        {
            content: `<h3>Threads Page: Lock Contention Analysis</h3>
The Threads tab's "Lock Instances" view ranks every monitor/lock by total accumulated blocking time across all
threads during the recording - directly answering "which lock is causing the most contention in production" without
manually cross-referencing multiple thread dumps by hand. <br><br>
Combined with the "Hot Methods" view under Code, you can typically go from "the app feels slow under load" to "this
exact synchronized block in <code>OrderService.reserveInventory()</code> is the bottleneck" within a few minutes.`
        },
        {
            content: `<h3>Memory Page: GC Pause Analysis</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Chart</th><th>What It Shows</th><th>What to Look For</th></tr>
<tr><td>Heap usage over time</td><td>Live heap size across the recording window</td><td>Steady sawtooth = healthy; a rising floor after each GC = possible leak</td></tr>
<tr><td>GC pause times</td><td>Duration of every individual GC pause, plotted over time</td><td>Occasional long pauses correlating with latency spike reports</td></tr>
<tr><td>Allocation by class</td><td>Which classes are allocated the most (by count and total size)</td><td>Unexpectedly high allocation rate from a class you didn't expect (often a hidden autoboxing or string concatenation hot spot)</td></tr>
</table>`
        },
        {
            content: `<h3>Sample Automated Analysis Output</h3>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Automated Analysis Results
============================
[SEVERE]   Garbage Collector: Frequent full GCs detected
           15 full GCs occurred, totaling 4.2s of pause time (7% of recording).
           Suggestion: Investigate the heap for a memory leak or undersized old generation.

[WARNING]  Contention: High lock contention on java.lang.Object@0x000000076b
           Thread "pool-2-thread-7" was blocked for 1.8s waiting on this lock.
           Suggestion: Review synchronized blocks guarding this object.

[INFO]     File I/O: 320 file read operations totaling 1.2s
           No action needed - within expected range for this workload.</pre>`
        },
        {
            content: `<h3>Production Troubleshooting Scenarios</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Symptom</th><th>Root Cause</th><th>Diagnosis</th><th>Fix</th></tr>
<tr><td>P99 latency spikes correlate loosely with "something in GC" but the team can't pinpoint it</td><td>Full GCs caused by old-generation growth from a slow leak, not visible from metrics dashboards alone</td><td>Open a JFR recording covering the spike window in JMC's Memory tab; overlay GC pause chart with the latency graph timestamps</td><td>Confirmed causal link lets the team prioritize fixing the underlying allocation/leak instead of just tuning GC flags</td></tr>
<tr><td>A specific customer-facing endpoint is consistently slower than similar endpoints</td><td>A synchronized block inside a shared service class is heavily contended only under that endpoint's specific call pattern</td><td>Use JMC's Threads > Lock Instances view sorted by total blocking time during a recording of that endpoint under load</td><td>Reduce the synchronized scope or replace with a non-blocking/finer-grained concurrency structure</td></tr>
<tr><td>Team suspects a "third-party library update" caused a regression but can't reproduce it locally</td><td>The regression only manifests under production-scale concurrency/data, which local testing doesn't replicate</td><td>Run JFR in production before/after the update, compare Automated Analysis Results and Hot Methods between the two recordings</td><td>Pinpoint the exact method/hot path that changed, confirming or ruling out the library update as the cause</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is JMC and how does it relate to JFR?</td><td>JMC (Java Mission Control) is a GUI tool for visualizing and analyzing recordings produced by JFR; JFR records the data, JMC displays and interprets it</td></tr>
<tr><td>What is the Automated Analysis Results feature?</td><td>A built-in rule engine in JMC that scans a JFR recording and automatically flags likely issues (long GC pauses, lock contention, etc.) with severity ratings and suggestions</td></tr>
<tr><td>Which JMC view would you use to find the most CPU-consuming methods?</td><td>The Code tab's "Hot Methods" view</td></tr>
<tr><td>Which JMC view would you use to find lock contention bottlenecks?</td><td>The Threads tab's "Lock Instances" view, which ranks locks by total accumulated blocking time</td></tr>
<tr><td>Is JMC bundled with the JDK?</td><td>Not since Java 9 - it's a separate free download from the OpenJDK project or JDK vendors</td></tr>
<tr><td>How can JMC help confirm a memory leak?</td><td>By showing the heap usage chart's post-GC floor rising over time in the Memory tab, alongside allocation-by-class data to identify the offending class</td></tr>
<tr><td>Can JMC connect to a live running JVM, not just saved files?</td><td>Yes - it can connect via JMX to start/stop recordings and view live data on a running JVM, local or remote</td></tr>
</table>`
        }
    ]
};
