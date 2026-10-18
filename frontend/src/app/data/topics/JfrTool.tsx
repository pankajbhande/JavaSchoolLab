import { Topic } from '../coreJava';

export const jfrTool: Topic = {
    id: 'jfr-tool',
    name: 'JFR (Java Flight Recorder)',
    beginner: [
        {
            content: `<h3>What is JFR?</h3>
Java Flight Recorder (JFR) is a profiling and event-collection tool built directly into the JVM itself. It records
detailed information about what's happening inside your application - method execution, garbage collection pauses,
lock contention, I/O, exceptions - while it runs, with very low overhead (typically under 1-2%). <br><br>
It's called a "flight recorder" by analogy to an airplane's black box: it continuously records what the JVM is
doing, so if something goes wrong, you can go back and see exactly what happened.`
        },
        {
            content: `<h3>Why JFR is Special</h3>
Before JFR, most profiling tools attached an external agent that added significant overhead, often changing the very
behavior you were trying to measure (the "observer effect"). JFR is different because: <br>
• It's built into the JVM itself - no external agent needed. <br>
• It's designed to run safely in production, continuously, with minimal performance impact. <br>
• It's free and included with every OpenJDK/Oracle JDK since Java 11 (and available via backport in Java 8).`
        },
        {
            content: `<h3>Starting a JFR Recording</h3>
You can start a JFR recording right when you launch your application, or attach to one that's already running.`,
            codeExamples: [`# Start the app with a JFR recording running for its whole lifetime
java -XX:StartFlightRecording=filename=recording.jfr,duration=60s -jar myapp.jar

# Attach to an already-running JVM and record for 60 seconds
jcmd 12345 JFR.start duration=60s filename=recording.jfr

# Check the status of an active recording
jcmd 12345 JFR.check

# Manually stop and dump a running recording
jcmd 12345 JFR.stop filename=recording.jfr`]
        },
        {
            content: `<h3>What Kind of Events Does JFR Capture?</h3>
JFR organizes what it captures into "events" - each one a small, structured record of something that happened. Common
categories include: <br>
• <strong>CPU / Method profiling</strong> - which methods consumed the most CPU time. <br>
• <strong>Garbage Collection</strong> - every GC pause, its duration and cause. <br>
• <strong>Memory allocation</strong> - which classes are allocated most frequently. <br>
• <strong>Thread activity / lock contention</strong> - which locks threads waited on, and for how long. <br>
• <strong>I/O</strong> - file and socket read/write events. <br>
• <strong>Exceptions</strong> - thrown exceptions and their frequency.`
        },
        {
            content: `<h3>Viewing a Recording</h3>
Once you have a <code>.jfr</code> file, you open it in <strong>JMC (Java Mission Control)</strong> - a free GUI tool
covered in the next topic - to browse the recorded events visually with charts and drill-down views.`
        }
    ],

    expert: [
        {
            content: `<h3>JFR Architecture: Event Streaming</h3>
Internally, JFR events are written to an in-memory circular buffer per thread, then periodically flushed to disk (or
consumed live). This design is what keeps overhead so low - most of the work is simple, lock-free buffer writes
rather than expensive synchronization or I/O on every event. <br><br>
Since JDK 14, JFR also supports <strong>Event Streaming</strong> - reading events in near real-time as they're
produced, rather than only after a recording finishes, which enables live dashboards and alerting built directly on
top of JFR data.`,
            codeExamples: [`// Programmatic event streaming (JDK 14+)
import jdk.jfr.consumer.RecordingStream;

try (RecordingStream rs = new RecordingStream()) {
    rs.enable("jdk.GarbageCollection").withThreshold(java.time.Duration.ofMillis(20));
    rs.onEvent("jdk.GarbageCollection", event -> {
        System.out.println("GC pause: " + event.getDuration().toMillis() + " ms, cause=" + event.getString("cause"));
    });
    rs.start();
}`]
        },
        {
            content: `<h3>Recording Configurations: default vs profile</h3>
JFR ships with two built-in configuration templates that trade off detail against overhead: <br><br>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Template</th><th>Typical Overhead</th><th>Use Case</th></tr>
<tr class='text-center'><td>default</td><td>&lt; 1%</td><td>Always-on continuous production monitoring</td></tr>
<tr class='text-center'><td>profile</td><td>~2%</td><td>Deep-dive performance investigation, shorter targeted recordings</td></tr>
</table>
<br>
You can also define a fully custom <code>.jfc</code> configuration file to enable/disable specific event types and
their thresholds/stack-depth precisely.`,
            codeExamples: [`# Use the deeper "profile" template for a focused investigation
jcmd 12345 JFR.start name=deepdive settings=profile duration=120s filename=deepdive.jfr

# List available/running recordings on a JVM
jcmd 12345 JFR.dump name=deepdive filename=snapshot.jfr`]
        },
        {
            content: `<h3>Sample JFR Text Summary (jfr print)</h3>
The JDK also ships a <code>jfr</code> CLI tool that can summarize or print recordings without opening a GUI - handy
for quick server-side triage or scripting.
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">$ jfr summary recording.jfr

 Version: 2.1
 Chunks: 3
 Start: 2026-08-14 10:02:11
 Duration: 60 s

 Event Type                          Count  Size (bytes)
 jdk.ExecutionSample                 12,904   642,180
 jdk.GarbageCollection                    8     1,920
 jdk.JavaMonitorEnter                 3,410   187,340
 jdk.SocketRead                       9,822   511,004
 jdk.ObjectAllocationSample            5,672   296,116</pre>`
        },
        {
            content: `<h3>Continuous Production Recording Strategy</h3>
Because overhead is so low, a common production pattern is to run JFR <strong>continuously</strong> with the default
template and a rolling ring-buffer, so that whenever an incident happens (crash, latency spike, alert), you can dump
the last N minutes of recorded data retroactively - even though you didn't know in advance that you'd need it.`,
            codeExamples: [`# Start a continuous recording that keeps the last 15 minutes in a ring buffer
java -XX:StartFlightRecording=disk=true,maxage=15m,maxsize=250M,name=continuous -jar myapp.jar

# After an incident is noticed, dump what's currently buffered without stopping the recording
jcmd 12345 JFR.dump name=continuous filename=incident_$(date +%s).jfr`]
        },
        {
            content: `<h3>Production Troubleshooting Scenarios</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Symptom</th><th>Root Cause</th><th>Diagnosis</th><th>Fix</th></tr>
<tr><td>Intermittent latency spikes with no clear trigger, hard to reproduce</td><td>Occasional long GC pauses or lock contention that only shows up under specific traffic patterns</td><td>Run continuous JFR recording; when a spike is reported, dump the ring buffer and open in JMC, filter by timestamp of the spike</td><td>Identify and address the specific GC/lock event causing the spike (tune GC, reduce lock scope)</td></tr>
<tr><td>Team is hesitant to profile production because of past overhead problems with other tools</td><td>Previous profiler used bytecode instrumentation/sampling with much higher overhead than JFR</td><td>Benchmark JFR's actual overhead (default template, &lt;1%) against the previous tool</td><td>Adopt JFR as the standard always-on production profiler instead of ad hoc heavier tools</td></tr>
<tr><td>Need to prove a specific deploy caused a regression, but no dumps were taken beforehand</td><td>No continuous recording was configured, so historical data doesn't exist</td><td>N/A retroactively - this is a process gap, not a technical bug</td><td>Enable always-on continuous JFR recording (ring buffer) in all environments going forward so every incident is analyzable after the fact</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is JFR?</td><td>Java Flight Recorder - a low-overhead, built-in JVM profiling and event-recording framework</td></tr>
<tr><td>Why is JFR considered safe for production use?</td><td>Its default configuration adds well under 1-2% overhead by writing events to lock-free per-thread ring buffers rather than doing expensive instrumentation on every call</td></tr>
<tr><td>How do you start a JFR recording on an already-running JVM?</td><td>Use <code>jcmd &lt;pid&gt; JFR.start</code> with options like <code>duration</code> and <code>filename</code></td></tr>
<tr><td>What is the difference between the default and profile JFR templates?</td><td>default is tuned for near-zero overhead continuous monitoring; profile captures more detail (e.g. more allocation/lock events) at slightly higher (~2%) overhead</td></tr>
<tr><td>What is JFR Event Streaming?</td><td>A JDK 14+ API (RecordingStream) that lets applications consume JFR events in near real-time as they occur, enabling live dashboards/alerts</td></tr>
<tr><td>What types of events can JFR capture?</td><td>CPU/method samples, GC pauses, memory allocation, lock contention, thread activity, I/O, and exceptions, among others</td></tr>
<tr><td>What tool would you use to open and visually analyze a .jfr file?</td><td>JMC (Java Mission Control)</td></tr>
</table>`
        }
    ]
};
