// JVM course extras, part 5: diagnostics tools (keyed by topic id).
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const jvm5Extras: Record<string, Extra> = {
    'thread-dumps': x(
        ['<b>Thread dump</b>: a snapshot of every thread with its state, name and stack trace at one moment.',
            '<b>How to take one</b>: <code>jcmd &lt;pid&gt; Thread.print</code>, or <code>Ctrl+Break</code> on Windows and <code>kill -3 &lt;pid&gt;</code> on Linux.',
            '<b>States</b>: read <code>RUNNABLE</code>, <code>BLOCKED</code>, <code>WAITING</code> and <code>TIMED_WAITING</code> first.'],
        ['<b>Take three</b> dumps a few seconds apart; a thread stuck on the same frame in all of them is the suspect.',
            '<b>Deadlock</b>: the dump ends with <code>Found one Java-level deadlock</code> and lists the locks each thread holds and wants.',
            '<b>Thread names</b>: give pool threads real names, so a dump shows <code>order-worker-3</code> and not <code>pool-1-thread-3</code>.'],
        ['<b>Virtual threads</b>: <code>jcmd &lt;pid&gt; Thread.dump_to_file -format=json file.json</code> includes them, while plain <code>Thread.print</code> does not.',
            '<b>High CPU</b>: match the hex <code>nid</code> in the dump to the busiest OS thread id from <code>top -H</code>.',
            '<b>Automation</b>: capture dumps on a health-check failure, and compare them with a tool such as a dump analyzer.'],
        [['F', 'What is a thread dump?', 'A snapshot of all JVM threads with their states and stack traces. It shows what the application is doing right now.'],
            ['F', 'Name two ways to take one.', 'Run jcmd with Thread.print, or send kill -3 on Linux. On Windows press Ctrl+Break in the console.'],
            ['M', 'How do you find a deadlock in a dump?', 'Search for "Found one Java-level deadlock". It prints each thread, the lock it waits for and the lock it holds.'],
            ['M', 'Why take several dumps?', 'One dump is a single moment. A thread at the same place in several dumps is really stuck, not just passing.'],
            ['S', 'Which thread is burning CPU?', 'Get the thread id from top -H, convert it to hex and match it to nid=0x... in the dump.'],
            ['S', 'How do you dump virtual threads?', 'Use jcmd Thread.dump_to_file, because the classic Thread.print output leaves virtual threads out.']],
        [['Take a dump on Linux and Windows.',
            r`# Linux
jcmd 4242 Thread.print > dump1.txt
kill -3 4242                     # prints to the application stdout

# Windows
jcmd 4242 Thread.print > dump1.txt
# or press Ctrl+Break in the console that runs the application

# OUTPUT: (excerpt, varies)
# "main" #1 prio=5 os_prio=0 tid=0x... nid=0x1a2c waiting on condition
#    java.lang.Thread.State: TIMED_WAITING (sleeping)
#         at java.lang.Thread.sleep(Native Method)`],
            ['Take three dumps with a pause.',
                r`for i in 1 2 3; do
  jcmd 4242 Thread.print > dump_$i.txt
  sleep 5
done
ls dump_*.txt

# OUTPUT:
# dump_1.txt  dump_2.txt  dump_3.txt`]],
        [['Read a blocked thread.',
            r`"http-nio-8080-exec-7" #52 prio=5 os_prio=0 nid=0x2f10 waiting for monitor entry
   java.lang.Thread.State: BLOCKED (on object monitor)
        at com.shop.Cart.add(Cart.java:41)
        - waiting to lock <0x000000076b2a1c20> (a com.shop.Cart)
        - locked by "http-nio-8080-exec-3"

// OUTPUT:
// exec-7 waits on a Cart monitor that exec-3 holds: look at exec-3 next`],
            ['Spot a deadlock.',
                r`Found one Java-level deadlock:
=============================
"T1": waiting to lock monitor 0x...1 (object 0x...a, a java.lang.Object),
  which is held by "T2"
"T2": waiting to lock monitor 0x...2 (object 0x...b, a java.lang.Object),
  which is held by "T1"

// OUTPUT:
// the fix is a single global lock order, or tryLock with a timeout`]]
    ),
    'jfr-tool': x(
        ['<b>JFR</b> (Java Flight Recorder) records JVM and application events with very low overhead.',
            '<b>Start</b> at launch with <code>-XX:StartFlightRecording=duration=60s,filename=app.jfr</code>.',
            '<b>Open</b> the <code>.jfr</code> file in JDK Mission Control, or print it with the <code>jfr</code> command.'],
        ['<b>Free</b>: JFR is open source and free in OpenJDK 11 and later (it was commercial in Oracle JDK 8).',
            '<b>Profiles</b>: <code>settings=default</code> is light, and <code>settings=profile</code> collects more detail with a little more cost.',
            '<b>Running JVM</b>: use <code>jcmd &lt;pid&gt; JFR.start</code>, <code>JFR.dump</code> and <code>JFR.stop</code>.'],
        ['<b>Continuous recording</b>: run with <code>maxage</code> and <code>maxsize</code> and dump on demand, so an incident always has data.',
            '<b>CLI</b>: <code>jfr summary</code>, <code>jfr print --events jdk.GCPhasePause</code> and <code>jfr view</code> (JDK 21) work without a GUI.',
            '<b>Custom events</b>: extend <code>jdk.jfr.Event</code> to record business timings next to JVM events.'],
        [['F', 'What is JFR?', 'A built-in JVM event recorder for profiling and diagnostics. It has a very small overhead.'],
            ['F', 'How do you start a recording?', 'Add -XX:StartFlightRecording to the JVM options, or run jcmd JFR.start on a live process.'],
            ['M', 'Which settings profile do you use in production?', 'The default profile is meant for always-on use. Use profile only for a short, targeted investigation.'],
            ['M', 'How do you save a recording from a running JVM?', 'Run jcmd pid JFR.dump filename=x.jfr, or JFR.stop with a filename.'],
            ['S', 'How do you keep a rolling window of data?', 'Start with maxage and maxsize and no fixed duration, then dump when an incident happens.'],
            ['S', 'How do you add your own event?', 'Extend jdk.jfr.Event, add fields, and call begin, commit around the work. It then shows up in the same recording.']],
        [['Start and dump a recording.',
            r`jcmd 4242 JFR.start name=rec1 settings=profile maxage=10m
jcmd 4242 JFR.dump name=rec1 filename=C:\temp\rec1.jfr
jcmd 4242 JFR.stop name=rec1

# OUTPUT: (varies)
# Started recording 1. Use jcmd 4242 JFR.dump name=rec1 filename=FILEPATH to copy it
# Dumped recording "rec1", 3.2 MB written to: C:\temp\rec1.jfr`],
            ['Start at launch.',
                r`java -XX:StartFlightRecording=duration=60s,filename=app.jfr,settings=profile -jar app.jar

# OUTPUT:
# Started recording 1. The result will be written to: app.jfr`]],
        [['Read a recording from the command line.',
            r`jfr summary app.jfr
jfr print --events jdk.GarbageCollection app.jfr

# OUTPUT: (excerpt, varies)
#  Event Type                     Count  Size (bytes)
#  jdk.GarbageCollection             12           480`],
            ['A custom event.',
                r`@Name("shop.Checkout")
@Label("Checkout")
class CheckoutEvent extends jdk.jfr.Event {
    String orderId;
}
CheckoutEvent e = new CheckoutEvent();
e.begin(); e.orderId = "A-17"; /* work */ e.commit();

// OUTPUT:
// jfr print --events shop.Checkout app.jfr shows the event with its duration`]]
    ),
    'jmc-tool': x(
        ['<b>JMC</b> (JDK Mission Control) is a desktop tool to open and analyze <code>.jfr</code> files and monitor live JVMs.',
            '<b>Automated analysis</b>: the rules page lists problems such as GC pauses and lock contention, with a score.',
            '<b>Separate download</b>: JMC is not bundled with the JDK since version 9, so install it on its own.'],
        ['<b>Pages</b>: Java Application, JVM Internals, Memory, Method Profiling, Lock Instances and Threads.',
            '<b>Flame graph</b>: shows which methods take the most sampled time.',
            '<b>Remote JVM</b>: connect with JMX, then start a recording from the JVM browser.'],
        ['<b>Allocation</b>: use the TLAB allocation views to find the code that creates the most garbage.',
            '<b>Compare</b>: open a good and a bad recording and compare GC, CPU and locks.',
            '<b>Security</b>: protect JMX with authentication and TLS, and prefer copying the file from the server.'],
        [['F', 'What is JMC used for?', 'To open JFR recordings and look at CPU, memory, GC and thread data in a GUI.'],
            ['F', 'Is JMC part of the JDK?', 'Not any more. It is a separate download from the OpenJDK based vendors.'],
            ['M', 'What does automated analysis do?', 'It runs rules on the recording and flags likely problems, with advice and a score.'],
            ['M', 'Where do you find hot methods?', 'In the Method Profiling page or in the flame graph view.'],
            ['S', 'How do you find allocation hot spots?', 'Use the memory page with allocation by class and by stack trace, then check the top frames.'],
            ['S', 'How do you use JMC on a server with no GUI?', 'Record on the server, copy the .jfr file, and open it locally. Or use the jfr CLI there.']],
        [['Open a recording.',
            r`jmc -open C:\temp\rec1.jfr
# Linux
jmc -open /tmp/rec1.jfr

# OUTPUT:
# JMC opens, runs the Automated Analysis Results page first`],
            ['Enable JMX for a remote connection (test only).',
                r`java -Dcom.sun.management.jmxremote.port=9010 \
     -Dcom.sun.management.jmxremote.authenticate=true \
     -Dcom.sun.management.jmxremote.ssl=true -jar app.jar

# OUTPUT:
# JMC: File - Connect - Remote host:9010 shows the JVM`]],
        [['Reading the result.',
            r`Automated Analysis (example, varies)
  Lock Instances ......... 82   Java threads blocked on one monitor
  GC Pauses .............. 15   max pause 38 ms
  Hot Methods ............ 60   OrderService.price() 31 percent

// OUTPUT:
// the lock page is the first place to look, then the hot method`],
            ['Typical workflow.',
                r`1. jcmd <pid> JFR.start settings=profile duration=2m filename=a.jfr
2. reproduce the slow request
3. jmc -open a.jfr
4. Automated Analysis -> Method Profiling -> flame graph

// OUTPUT:
// a short, targeted recording plus one hypothesis per page`]]
    ),
    'jstack-command': x(
        ['<b>jstack</b> prints the thread stacks of a running Java process: <code>jstack &lt;pid&gt;</code>.',
            '<b>Find the pid</b> with <code>jps</code> or <code>jcmd</code> with no arguments.',
            '<b>Same user</b>: run it as the user that owns the Java process.'],
        ['<b>Options</b>: <code>-l</code> adds lock information, such as owned ownable synchronizers.',
            '<b>Save</b>: redirect to a file, <code>jstack -l 4242 &gt; dump.txt</code>, for later reading.',
            '<b>Deadlock</b>: jstack reports Java-level deadlocks at the end of the output.'],
        ['<b>Prefer jcmd</b>: <code>jcmd &lt;pid&gt; Thread.print</code> does the same job and works with the other jcmd commands.',
            '<b>Hung JVM</b>: if the attach fails, use <code>kill -3</code> on Linux, because it needs no attach.',
            '<b>Safepoint</b>: a dump stops the threads briefly, so avoid very frequent dumps on huge thread counts.'],
        [['F', 'What does jstack do?', 'It prints the stack trace of every thread of a running Java process.'],
            ['F', 'How do you get the process id?', 'Run jps or jcmd without arguments.'],
            ['M', 'What does jstack -l add?', 'Extra lock information, including java.util.concurrent synchronizers.'],
            ['M', 'Why can jstack fail with "Unable to open socket file"?', 'The user differs from the process owner, or the temp directory is not reachable. Use the same user.'],
            ['S', 'jstack or jcmd?', 'jcmd Thread.print is the modern, supported way. jstack is a thin tool kept for convenience.'],
            ['S', 'What if the JVM does not respond to attach?', 'Send SIGQUIT with kill -3 so the JVM prints the dump itself, or use jstack -F in older JDKs.']],
        [['Basic use.',
            r`jps -l
jstack 4242 > dump.txt
jstack -l 4242 | findstr /C:"deadlock"      # Windows
jstack -l 4242 | grep -i deadlock           # Linux

# OUTPUT: (varies)
# 4242 com.shop.Main
# Found one Java-level deadlock:`],
            ['Equivalent with jcmd.',
                r`jcmd 4242 Thread.print -l

# OUTPUT: (excerpt)
# 4242:
# 2026-10-07 10:15:03
# Full thread dump OpenJDK 64-Bit Server VM (21.0.2+13 mixed mode):`]],
        [['Count threads by state.',
            r`jstack 4242 | grep "java.lang.Thread.State" | sort | uniq -c

# OUTPUT: (varies)
#      6 java.lang.Thread.State: RUNNABLE
#     31 java.lang.Thread.State: TIMED_WAITING (parking)
#     12 java.lang.Thread.State: WAITING (on object monitor)`],
            ['Windows count.',
                r`jstack 4242 | findstr /C:"Thread.State" > states.txt
(Get-Content states.txt | Group-Object).Count

# OUTPUT: (varies)
# 4 distinct state lines`]]
    ),
    'jmap-command': x(
        ['<b>jmap</b> inspects heap memory: <code>jmap -histo &lt;pid&gt;</code> lists classes by instance count and size.',
            '<b>Heap dump</b>: <code>jmap -dump:live,format=b,file=heap.hprof &lt;pid&gt;</code> writes an HPROF file.',
            '<b>Analyze</b> the dump in Eclipse MAT, VisualVM or IntelliJ.'],
        ['<b>live</b> in the dump option runs a full GC first and keeps only reachable objects.',
            '<b>Pause</b>: a dump stops the application, and a big heap can take many seconds and as much disk.',
            '<b>OOM dump</b>: <code>-XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/dumps</code> writes a dump at the failure.'],
        ['<b>Prefer jcmd</b>: <code>jcmd &lt;pid&gt; GC.heap_dump file</code> and <code>jcmd &lt;pid&gt; GC.class_histogram</code> replace jmap.',
            '<b>-histo:live</b> triggers a full GC, so use it with care in production.',
            '<b>Sensitive data</b>: a heap dump contains passwords and tokens, so store and share it with care.'],
        [['F', 'What is a heap dump?', 'A file with all objects on the heap at one moment. It is used to find memory leaks.'],
            ['F', 'How do you list the biggest classes?', 'Run jmap -histo pid, or jcmd pid GC.class_histogram.'],
            ['M', 'What does live do?', 'It forces a full GC and dumps only reachable objects, so the file is smaller.'],
            ['M', 'How do you get a dump when the JVM runs out of memory?', 'Start with -XX:+HeapDumpOnOutOfMemoryError and set HeapDumpPath.'],
            ['S', 'What is the cost in production?', 'The JVM pauses while writing, and the file size is about the heap size. Plan disk and the pause.'],
            ['S', 'jmap or jcmd?', 'jcmd GC.heap_dump is the supported route. jmap -dump still works but is the older tool.']],
        [['Histogram and dump.',
            r`jmap -histo:live 4242 | head -5
jmap -dump:live,format=b,file=heap.hprof 4242

# OUTPUT: (varies)
#  num     #instances         #bytes  class name
#    1:        812340       64987200  [B
#    2:        120004       21600720  java.lang.String
# Heap dump file created`],
            ['Same with jcmd.',
                r`jcmd 4242 GC.class_histogram | head -5
jcmd 4242 GC.heap_dump C:\dumps\heap.hprof

# OUTPUT: (varies)
# 4242:
# Heap dump file created [91234567 bytes in 0.9 secs]`]],
        [['Dump on OutOfMemoryError.',
            r`java -Xmx256m -XX:+HeapDumpOnOutOfMemoryError ^
     -XX:HeapDumpPath=C:\dumps -jar app.jar

# OUTPUT:
# java.lang.OutOfMemoryError: Java heap space
# Dumping heap to C:\dumps\java_pid4242.hprof ...`],
            ['A leak that the histogram shows.',
                r`static final List<byte[]> CACHE = new ArrayList<>();
for (int i = 0; i < 100; i++) CACHE.add(new byte[1_000_000]);

// OUTPUT: (jmap -histo:live, varies)
//   1:   100  100002400  [B     <- grows with every request: a static cache leak`]]
    ),
    'jcmd-command': x(
        ['<b>jcmd</b> sends diagnostic commands to a running JVM: <code>jcmd &lt;pid&gt; help</code> lists what it supports.',
            '<b>No arguments</b>: <code>jcmd</code> lists the running Java processes, like <code>jps</code>.',
            '<b>One tool</b> that replaces most uses of jstack, jmap and jinfo.'],
        ['<b>Common commands</b>: <code>Thread.print</code>, <code>GC.heap_dump</code>, <code>GC.class_histogram</code>, <code>VM.flags</code>, <code>VM.system_properties</code>.',
            '<b>GC</b>: <code>GC.run</code> asks for a collection, and <code>GC.heap_info</code> shows heap regions.',
            '<b>JFR</b>: <code>JFR.start</code>, <code>JFR.dump</code> and <code>JFR.stop</code> control recordings.'],
        ['<b>Virtual threads</b>: <code>jcmd &lt;pid&gt; Thread.dump_to_file -format=json out.json</code>.',
            '<b>Native memory</b>: start with <code>-XX:NativeMemoryTracking=summary</code>, then use <code>VM.native_memory</code>.',
            '<b>Scripting</b>: use <code>-f file</code> to run several commands, and run it as the same user as the JVM.'],
        [['F', 'What does jcmd do?', 'It sends diagnostic commands, such as a thread dump or heap dump, to a running JVM.'],
            ['F', 'How do you list the commands?', 'Run jcmd pid help.'],
            ['M', 'How do you take a heap dump?', 'jcmd pid GC.heap_dump filename. Add -all to include unreachable objects.'],
            ['M', 'How do you see the JVM flags?', 'jcmd pid VM.flags, or VM.command_line for the full start command.'],
            ['S', 'How do you investigate native memory?', 'Start with NativeMemoryTracking, take a baseline, then compare with VM.native_memory summary.diff.'],
            ['S', 'How do you dump virtual threads?', 'Use Thread.dump_to_file with the json format. Thread.print does not list them.']],
        [['The basics.',
            r`jcmd
jcmd 4242 help
jcmd 4242 VM.version

# OUTPUT: (varies)
# 4242 com.shop.Main
# 4242:
# JVM version is 21.0.2+13-58`],
            ['Info commands.',
                r`jcmd 4242 VM.flags
jcmd 4242 GC.heap_info

# OUTPUT: (excerpt, varies)
# -XX:InitialHeapSize=268435456 -XX:MaxHeapSize=4294967296 -XX:+UseG1GC
# garbage-first heap total 262144K, used 81920K`]],
        [['Dump to file, including virtual threads.',
            r`jcmd 4242 Thread.dump_to_file -format=json C:\dumps\threads.json
jcmd 4242 GC.heap_dump C:\dumps\heap.hprof

# OUTPUT: (varies)
# 4242:
# Created C:\dumps\threads.json`],
            ['Native memory baseline and diff.',
                r`java -XX:NativeMemoryTracking=summary -jar app.jar
jcmd 4242 VM.native_memory baseline
jcmd 4242 VM.native_memory summary.diff

# OUTPUT: (excerpt, varies)
# Total: reserved=..., committed=...  (+12MB)
# - Thread (committed=...) (+2MB)`]]
    )
};

export const jvm5Deep: Record<string, Deep> = {
    'thread-dumps': dv(
        [`<p>A dump is produced at a safepoint, when every thread is paused briefly.</p><ul><li><b>Request:</b> attach (jcmd) or SIGQUIT asks the JVM to print.</li><li><b>Per thread:</b> name, id, <code>nid</code> (the OS thread id in hex), state and frames.</li><li><b>Locks:</b> lines such as <code>- locked</code> and <code>- waiting to lock</code> show monitor ownership.</li><li><b>Deadlock check:</b> the JVM looks for cycles in the lock graph and prints them at the end.</li></ul>`,
            r`"pool-1-thread-1" #21 prio=5 os_prio=0 cpu=12.3ms tid=0x... nid=0x3c0 runnable
   java.lang.Thread.State: RUNNABLE
        at com.shop.Pricing.compute(Pricing.java:88)
        - locked <0x000000076b2a1c20> (a com.shop.Pricing)

// OUTPUT:
// nid=0x3c0 is decimal 960: match it with top -H or Process Explorer`],
        [`<p>Ways to get and format a dump:</p><ul><li><b>jcmd Thread.print:</b> add <code>-l</code> for locks.</li><li><b>kill -3 / Ctrl+Break:</b> output goes to the process stdout.</li><li><b>jstack:</b> older front end.</li><li><b>Thread.dump_to_file:</b> text or JSON, includes virtual threads (JDK 21).</li><li><b>ThreadMXBean:</b> <code>dumpAllThreads</code> from code or JMX.</li></ul>`,
            r`ThreadMXBean mx = ManagementFactory.getThreadMXBean();
for (ThreadInfo ti : mx.dumpAllThreads(true, true)) {
    System.out.println(ti.getThreadName() + " " + ti.getThreadState());
}
long[] dead = mx.findDeadlockedThreads();
System.out.println("deadlocked=" + (dead == null ? 0 : dead.length));

// OUTPUT: (varies)
// main RUNNABLE
// Reference Handler RUNNABLE
// deadlocked=0`],
        [`<p>Common mistakes:</p><ul><li><b>One dump only:</b> take three, a few seconds apart.</li><li><b>Reading only RUNNABLE:</b> a thread waiting in native socket read is also shown as <code>RUNNABLE</code>.</li><li><b>Unnamed pools:</b> use a <code>ThreadFactory</code> with names.</li><li><b>Ignoring idle pool threads:</b> parked pool workers are normal, not a problem.</li><li><b>Dump to a file that fills the disk:</b> rotate and compress dumps.</li></ul>`,
            r`ThreadFactory tf = r -> {
    Thread t = new Thread(r, "order-worker-" + counter.incrementAndGet());
    t.setDaemon(true);
    return t;
};
ExecutorService pool = Executors.newFixedThreadPool(8, tf);

// OUTPUT:
// a dump now shows "order-worker-1" ... "order-worker-8"`],
        [`<p>A dump has a small cost, so use it with a plan.</p><ul><li><b>Pause:</b> grows with the thread count and stack depth.</li><li><b>Many threads:</b> thousands of platform threads signal a pool sizing problem, and virtual threads can replace them for blocking I/O.</li><li><b>Pool saturation:</b> all workers in the same frame, such as a JDBC call, means the dependency is slow.</li><li><b>JFR alternative:</b> JFR records thread states over time with less manual work.</li></ul>`,
            r`jcmd 4242 Thread.print | grep -c "http-nio-8080-exec"
jcmd 4242 Thread.print | grep -A3 "exec-" | grep -c "SocketInputStream"

# OUTPUT: (varies)
# 200
# 187      <- almost all workers wait on a slow downstream call`],
        [`<p>Scenario: a service stops answering but CPU is low.</p><ul><li><b>Step 1:</b> take three dumps, 5 seconds apart.</li><li><b>Step 2:</b> count threads by state and by top frame.</li><li><b>Step 3:</b> find the lock owner for the BLOCKED threads.</li><li><b>Step 4:</b> fix the root cause: lock order, a timeout, or a bigger or isolated pool.</li></ul>`,
            r`for i in 1 2 3; do jcmd 4242 Thread.print -l > d$i.txt; sleep 5; done
grep -h "waiting to lock" d1.txt d2.txt d3.txt | sort | uniq -c

# OUTPUT: (varies)
#     66 - waiting to lock <0x000000076b2a1c20> (a com.shop.Cart)
# the same monitor in all three dumps: one thread holds it too long`]
    ),
    'jfr-tool': dv(
        [`<p>JFR is built into the JVM and writes events into thread-local buffers.</p><ul><li><b>Events:</b> JVM (GC, JIT, locks), OS (CPU) and application ones.</li><li><b>Sampling:</b> method samples about every 10 or 20 ms, not every call, so overhead stays low.</li><li><b>Storage:</b> buffers flush to chunks in a repository, then to a <code>.jfr</code> file on dump.</li><li><b>Config:</b> <code>.jfc</code> files choose events and thresholds.</li></ul>`,
            r`java -XX:StartFlightRecording=filename=app.jfr,settings=default -jar app.jar
jfr configure --help

# OUTPUT: (varies)
# Started recording 1. The result will be written to: app.jfr`],
        [`<p>Useful options:</p><ul><li><b>duration</b> / <b>maxage</b> / <b>maxsize:</b> bound the recording.</li><li><b>settings:</b> <code>default</code>, <code>profile</code> or a custom <code>.jfc</code> path.</li><li><b>dumponexit=true:</b> write the file when the JVM ends.</li><li><b>jfr print / summary / view:</b> inspect on the command line.</li><li><b>jfr assemble and disassemble:</b> split or join chunk files.</li></ul>`,
            r`java -XX:StartFlightRecording=maxage=15m,maxsize=250m,dumponexit=true,filename=last.jfr ^
     -jar app.jar
jfr print --events jdk.CPULoad last.jfr

# OUTPUT: (excerpt, varies)
# jdk.CPULoad { jvmUser = 12.4 %  jvmSystem = 1.1 %  machineTotal = 35.0 % }`],
        [`<p>Common mistakes:</p><ul><li><b>Wrong file path:</b> the file is written on the server, not your laptop.</li><li><b>profile in production all day:</b> use default for continuous use.</li><li><b>No dump before restart:</b> use <code>dumponexit</code>.</li><li><b>Old Java 8 flags:</b> <code>-XX:+UnlockCommercialFeatures</code> is not needed in OpenJDK 11 and later.</li><li><b>Reading only CPU:</b> check allocation, locks and GC events too.</li></ul>`,
            r`# Java 8 Oracle (old)
java -XX:+UnlockCommercialFeatures -XX:+FlightRecorder -jar app.jar
# Java 11+ OpenJDK (right)
java -XX:StartFlightRecording=filename=app.jfr -jar app.jar

# OUTPUT:
# the second form works in OpenJDK with no unlock flag`],
        [`<p>Overhead is usually around 1 to 2 percent with the default profile (varies by workload).</p><ul><li><b>Reduce events:</b> raise thresholds, for example for file and socket I/O.</li><li><b>Disk:</b> use <code>maxsize</code>.</li><li><b>Stack depth:</b> the default stack depth is 64, and deeper stacks cost more.</li><li><b>Measure:</b> compare latency with and without recording on your load.</li></ul>`,
            r`jcmd 4242 JFR.start name=low settings=default maxsize=100m
jcmd 4242 JFR.check

# OUTPUT: (varies)
# Recording 1: name=low maxsize=100.0MB (running)`],
        [`<p>Scenario: p99 latency spikes every few minutes.</p><ul><li><b>Step 1:</b> keep a rolling recording running.</li><li><b>Step 2:</b> after a spike, dump the last 10 minutes.</li><li><b>Step 3:</b> open it and compare the spike time with GC pauses, safepoints and lock waits.</li><li><b>Step 4:</b> tune the cause: heap size, collector, or the contended lock.</li></ul>`,
            r`jcmd 4242 JFR.dump name=rolling filename=spike.jfr
jfr print --events jdk.GCPhasePause spike.jfr | head -8

# OUTPUT: (excerpt, varies)
# jdk.GCPhasePause { startTime = 10:15:02  duration = 145 ms  name = "GC Pause" }`]
    ),
    'jmc-tool': dv(
        [`<p>JMC reads the same event stream that JFR writes and adds analysis.</p><ul><li><b>Parser:</b> loads chunks and builds tables and graphs.</li><li><b>Rules engine:</b> each rule reads events and produces a score from 0 to 100.</li><li><b>JMX console:</b> reads live MBeans from a connected JVM.</li><li><b>Plugins:</b> extra pages, such as flame graphs, come from plugins.</li></ul>`,
            r`jmc -vm "C:\Program Files\Java\jdk-21\bin"
# Linux
jmc -vm /usr/lib/jvm/java-21-openjdk/bin

# OUTPUT:
# JMC starts using the chosen JDK as its runtime`],
        [`<p>Where to look:</p><ul><li><b>Automated Analysis:</b> first view.</li><li><b>Method Profiling:</b> hot methods and flame graph.</li><li><b>Memory and GC:</b> allocation, heap use and pauses.</li><li><b>Threads and Lock Instances:</b> contention.</li><li><b>Environment:</b> flags, system properties, container limits.</li></ul>`,
            r`Method Profiling (example, varies)
  OrderService.price()      31 %
  JsonMapper.write()        14 %
  String.format()            9 %

// OUTPUT:
// top 3 methods hold more than half of the samples: tune those first`],
        [`<p>Common mistakes:</p><ul><li><b>JMC too old</b> for the recording version: use a current JMC.</li><li><b>Running JMC with a JRE:</b> it needs a JDK.</li><li><b>Trusting one rule:</b> a rule is a hint, confirm it in the events.</li><li><b>Open JMX port without security:</b> anyone can control the JVM.</li><li><b>Ignoring sample bias:</b> sampling shows where time is spent, not exact call counts.</li></ul>`,
            r`-Dcom.sun.management.jmxremote.authenticate=true
-Dcom.sun.management.jmxremote.password.file=C:\conf\jmxremote.password
-Dcom.sun.management.jmxremote.access.file=C:\conf\jmxremote.access

// OUTPUT:
// only users in the access file can connect`],
        [`<p>Performance tips for the tool:</p><ul><li><b>Large files:</b> raise the JMC heap in <code>jmc.ini</code>, for example <code>-Xmx4g</code>.</li><li><b>Time range:</b> select a range to focus on and speed up views.</li><li><b>Filter by thread:</b> remove idle pool threads.</li><li><b>Use the CLI</b> for very large files.</li></ul>`,
            r`# jmc.ini
-vmargs
-Xmx4g

// OUTPUT:
// a 2 GB recording opens without OutOfMemoryError in JMC (varies)`],
        [`<p>Scenario: batch job is slower after a release.</p><ul><li><b>Step 1:</b> record the old and the new version with the same input.</li><li><b>Step 2:</b> compare Automated Analysis and the flame graphs.</li><li><b>Step 3:</b> a new hot method or more allocation shows the regression.</li><li><b>Step 4:</b> fix, re-record, confirm.</li></ul>`,
            r`java -XX:StartFlightRecording=filename=v1.jfr,settings=profile -jar job-1.0.jar
java -XX:StartFlightRecording=filename=v2.jfr,settings=profile -jar job-1.1.jar

// OUTPUT:
// two files to open side by side in JMC`]
    ),
    'jstack-command': dv(
        [`<p>jstack is an attach-based client.</p><ul><li><b>Attach:</b> the tool connects to the target JVM through a socket file in the temp directory.</li><li><b>Command:</b> it asks the JVM to run the thread-print diagnostic command.</li><li><b>Output:</b> the JVM writes the dump back to jstack, which prints it.</li><li><b>Same engine:</b> that is why jcmd Thread.print gives identical text.</li></ul>`,
            r`jstack -l 4242 | head -4

# OUTPUT: (varies)
# 2026-10-07 10:15:03
# Full thread dump OpenJDK 64-Bit Server VM (21.0.2+13-58 mixed mode, sharing):
#
# Threads class SMR info:`],
        [`<p>Variants:</p><ul><li><b>jstack pid:</b> stacks only.</li><li><b>jstack -l pid:</b> with lock details.</li><li><b>jstack -e pid:</b> extended info in older releases.</li><li><b>jstack -F pid:</b> forced dump of a hung JVM, removed in recent JDKs.</li><li><b>jstack core:</b> read a core file (older JDKs).</li></ul>`,
            r`jstack -l 4242 > dump.txt
jcmd 4242 Thread.print -l > dump2.txt

# OUTPUT:
# both files hold the same kind of data`],
        [`<p>Common mistakes:</p><ul><li><b>Different user:</b> use <code>sudo -u appuser jstack pid</code>.</li><li><b>Different JDK version</b> than the target: use the matching JDK.</li><li><b>Container:</b> run it inside the container or share the pid namespace.</li><li><b>Reading the stdout of kill -3 in the wrong place:</b> it goes to the application log.</li></ul>`,
            r`sudo -u appuser jstack 4242 > dump.txt
docker exec shop-app jcmd 1 Thread.print

# OUTPUT:
# 1:
# Full thread dump OpenJDK 64-Bit Server VM ...`],
        [`<p>Cost and care:</p><ul><li><b>Pause:</b> short, grows with thread count.</li><li><b>Frequency:</b> one dump per few seconds is fine, many per second is not.</li><li><b>Size:</b> huge thread counts produce large files, so compress them.</li></ul>`,
            r`jstack 4242 | gzip > dump.txt.gz
ls -l dump.txt.gz

# OUTPUT: (varies)
# -rw-r--r-- 1 app app 18432 Oct  7 10:16 dump.txt.gz`],
        [`<p>Scenario: CPU is at 100 percent.</p><ul><li><b>Step 1:</b> <code>top -H -p pid</code> finds the busiest thread id.</li><li><b>Step 2:</b> convert it to hex.</li><li><b>Step 3:</b> find that <code>nid</code> in the dump and read its stack.</li></ul>`,
            r`top -H -p 4242 -b -n 1 | head -12
printf "%x\n" 15361
jstack 4242 | grep -A8 "nid=0x3c01"

# OUTPUT: (varies)
# 3c01
# "pool-2-thread-4" ... nid=0x3c01 runnable
#         at com.shop.Report.loop(Report.java:57)`]
    ),
    'jmap-command': dv(
        [`<p>jmap also attaches to the JVM.</p><ul><li><b>Histogram:</b> walks the heap and counts instances per class.</li><li><b>Dump:</b> writes the heap in HPROF format at a safepoint, so the application pauses.</li><li><b>live:</b> triggers a full GC before the walk.</li><li><b>Class names:</b> <code>[B</code> means byte[], <code>[C</code> means char[], and <code>[Ljava.lang.String;</code> means String[].</li></ul>`,
            r`jmap -histo 4242 | head -4

# OUTPUT: (varies)
#  num     #instances         #bytes  class name (module)
#    1:        500112       40009600  [B (java.base@21.0.2)
#    2:        210554        5053296  java.lang.String (java.base@21.0.2)`],
        [`<p>Variants:</p><ul><li><b>-histo:</b> all objects.</li><li><b>-histo:live:</b> reachable objects only.</li><li><b>-dump:live,format=b,file=f:</b> HPROF.</li><li><b>-clstats / -finalizerinfo:</b> classloader and finalizer data in older JDKs.</li><li><b>jcmd GC.heap_dump -all:</b> keep unreachable objects too.</li></ul>`,
            r`jmap -dump:format=b,file=all.hprof 4242
jcmd 4242 GC.heap_dump -all all2.hprof

# OUTPUT: (varies)
# Heap dump file created`],
        [`<p>Common mistakes:</p><ul><li><b>Dump to a small disk:</b> the file is about the heap size.</li><li><b>Dump on a busy node:</b> remove it from the load balancer first.</li><li><b>Relative file path:</b> the file goes where the target JVM runs, not where jmap runs.</li><li><b>Sharing a dump:</b> it holds secrets.</li><li><b>Using histo to find a leak at one time:</b> take two and compare the growth.</li></ul>`,
            r`jmap -histo:live 4242 > h1.txt
sleep 600
jmap -histo:live 4242 > h2.txt
diff <(head -20 h1.txt) <(head -20 h2.txt)

# OUTPUT: (varies)
# < 1: 100 100002400 [B
# > 1: 300 300002400 [B       <- growing class is the leak suspect`],
        [`<p>Tuning and cost:</p><ul><li><b>Pause</b> scales with heap size, so a 16 GB heap can pause for a long time.</li><li><b>Use histo</b> first, it is cheaper than a dump.</li><li><b>Compress</b> HPROF files for transfer.</li><li><b>Analysis memory:</b> MAT needs a heap larger than the file for fast work.</li></ul>`,
            r`jcmd 4242 GC.class_histogram | head -3
gzip heap.hprof

# OUTPUT: (varies)
# 4242:
#  num     #instances         #bytes  class name`],
        [`<p>Scenario: memory grows until the pod restarts.</p><ul><li><b>Step 1:</b> two histograms 10 minutes apart show the growing class.</li><li><b>Step 2:</b> take one heap dump.</li><li><b>Step 3:</b> in MAT, open the dominator tree and path to GC roots.</li><li><b>Step 4:</b> fix the owner, usually a static map or an unbounded cache.</li></ul>`,
            r`jcmd 4242 GC.heap_dump /dumps/leak.hprof
# MAT: Leak Suspects report

# OUTPUT: (example, varies)
# One instance of "com.shop.SessionCache" occupies 412 MB (64 percent)`]
    ),
    'jcmd-command': dv(
        [`<p>jcmd uses the JVM attach mechanism to call built-in diagnostic commands.</p><ul><li><b>Attach:</b> a socket file is created in the temp directory of the target.</li><li><b>Dispatch:</b> the JVM Attach Listener thread runs the named command.</li><li><b>Result:</b> text is sent back to the client.</li><li><b>Reach:</b> only the same user and the same host, or the same container.</li></ul>`,
            r`jcmd 4242 help VM.flags

# OUTPUT: (excerpt)
# VM.flags
# Print VM flag options and their current values.
# Impact: Medium: Depends on the flags
# Syntax : VM.flags [options]`],
        [`<p>Command groups:</p><ul><li><b>Thread and VM:</b> <code>Thread.print</code>, <code>VM.uptime</code>, <code>VM.info</code>, <code>VM.command_line</code>.</li><li><b>GC:</b> <code>GC.run</code>, <code>GC.heap_info</code>, <code>GC.heap_dump</code>, <code>GC.class_histogram</code>.</li><li><b>JFR:</b> <code>JFR.start</code>, <code>JFR.check</code>, <code>JFR.dump</code>, <code>JFR.stop</code>.</li><li><b>Classes:</b> <code>VM.classloader_stats</code>, <code>VM.metaspace</code>.</li><li><b>Set flags:</b> <code>VM.set_flag</code> for manageable flags.</li></ul>`,
            r`jcmd 4242 VM.uptime
jcmd 4242 VM.set_flag MinHeapFreeRatio 20
jcmd 4242 Compiler.codecache

# OUTPUT: (varies)
# 4242:
# 3612.452 s
# CodeHeap 'non-nmethods': size=5760Kb used=1200Kb max_used=1250Kb free=4560Kb`],
        [`<p>Common mistakes:</p><ul><li><b>Wrong user:</b> attach fails, run as the JVM owner.</li><li><b>Relative paths:</b> files are written by the target JVM, so use an absolute path.</li><li><b>-XX:+DisableAttachMechanism:</b> disables jcmd, so keep it off if you need it.</li><li><b>Containers:</b> run jcmd inside the container.</li><li><b>Many JVMs:</b> check the pid with <code>jcmd</code> first.</li></ul>`,
            r`jcmd
docker exec shop-app jcmd 1 VM.command_line

# OUTPUT: (varies)
# 1 com.shop.Main
# 1:
# VM Arguments:
# jvm_args: -Xmx512m`],
        [`<p>Tuning and safety:</p><ul><li><b>Impact:</b> help lists the impact of each command: Low, Medium or High.</li><li><b>Avoid</b> GC.run and heap dumps at peak.</li><li><b>NMT</b> summary mode costs a few percent, and detail costs more.</li><li><b>Script</b> it into a health runbook.</li></ul>`,
            r`jcmd 4242 -f commands.txt
# commands.txt: Thread.print / GC.heap_info / VM.uptime

# OUTPUT: (varies)
# 4242:
# (output of each command, in order)`],
        [`<p>Scenario: incident runbook for a slow service.</p><ul><li><b>Step 1:</b> <code>Thread.print</code> three times.</li><li><b>Step 2:</b> <code>GC.heap_info</code> and <code>GC.class_histogram</code>.</li><li><b>Step 3:</b> <code>JFR.start</code> for two minutes with profile settings.</li><li><b>Step 4:</b> collect the files and attach them to the ticket.</li></ul>`,
            r`PID=4242
jcmd $PID Thread.print > t1.txt
jcmd $PID GC.heap_info > heap.txt
jcmd $PID JFR.start duration=120s settings=profile filename=/dumps/inc.jfr

# OUTPUT: (varies)
# Started recording 2. The result will be written to: /dumps/inc.jfr`]
    )
};
