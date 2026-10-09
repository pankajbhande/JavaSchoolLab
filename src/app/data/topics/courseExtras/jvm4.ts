// JVM extras, part 4: GC cycles, GC tuning, JIT, escape analysis, JVM arguments, heap dumps.
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const jvm4Extras: Record<string, Extra> = {
    'gc-cycles': x(
        ['<b>Young and old</b>: new objects start in the young generation; objects that survive several collections are promoted to the old generation.',
            '<b>Minor GC</b> cleans only the young generation and is frequent and short; a <b>major or full GC</b> touches the old generation too and takes longer.',
            '<b>Reachability</b>: an object is garbage when no GC root (thread stack, static field, JNI reference) can reach it.'],
        ['<b>Stop-the-world</b>: all application threads pause at a safepoint while the collector runs its pause phases.',
            '<b>Premature promotion</b>: a survivor space that is too small pushes short-lived objects into the old generation and causes more full GCs.',
            '<b>Allocation rate</b> drives minor GC frequency, while the live set drives pause time and old generation growth.'],
        ['<b>G1 cycle</b>: young-only collections, then a concurrent marking cycle, then mixed collections that also reclaim old regions.',
            '<b>Concurrent collectors</b> (ZGC, Shenandoah) do marking and relocation while the application runs, so pauses stay short and mostly independent of heap size.',
            '<b>Read the log</b>: use <code>-Xlog:gc*</code> and look at pause time, heap before and after, and the cause such as Allocation Failure or Humongous Allocation.'],
        [['F', 'What is a minor GC?', 'A collection of the young generation only. It is frequent, fast and most objects die in it.'],
            ['F', 'Can you force garbage collection?', 'No. System.gc() is only a hint and the JVM may ignore it; do not rely on it.'],
            ['M', 'What causes a full GC?', 'Old generation or metaspace exhaustion, a failed concurrent cycle, a humongous allocation failure, or an explicit System.gc() call.'],
            ['M', 'What is a GC root?', 'A reference the JVM treats as live: thread stacks, static fields, JNI handles and class loaders. Marking starts from roots.'],
            ['S', 'Why do pause times grow with the live set and not with garbage?', 'Tracing collectors mark and copy only live objects, so work is proportional to what survives, not to what dies.'],
            ['S', 'What is a mixed collection in G1?', 'A pause that collects young regions plus a chosen set of old regions with the most garbage, found by the concurrent marking cycle.']],
        [['Watch a minor GC happen.',
            r`// run: java -Xmx64m -Xlog:gc -cp . Churn
public class Churn {
    public static void main(String[] args) {
        for (int i = 0; i < 2_000_000; i++) {
            byte[] tmp = new byte[1024];   // short-lived garbage
        }
        System.out.println("done");
    }
}

// OUTPUT: (varies)
// [0.045s][info][gc] GC(0) Pause Young (Normal) (G1 Evacuation Pause) 25M->1M(64M) 1.2ms
// [0.071s][info][gc] GC(1) Pause Young (Normal) (G1 Evacuation Pause) 26M->1M(64M) 0.9ms
// done`],
            ['Objects survive by being reachable.',
                r`List<byte[]> keep = new ArrayList<>();
for (int i = 0; i < 50; i++) {
    keep.add(new byte[1024 * 1024]);   // reachable: never collected
    byte[] junk = new byte[1024];      // unreachable after this line
}
System.out.println("kept " + keep.size() + " MB");

// OUTPUT:
// kept 50 MB`]],
        [['Print the GC cause.',
            r`// run: java -Xlog:gc*:file=gc.log:time,uptime,level,tags -jar app.jar
// then: findstr "Pause" gc.log

// OUTPUT: (varies)
// [2026-01-10T10:00:01.120+0000][1.120s][info][gc] GC(3) Pause Young (Normal) 40M->8M(256M) 3.4ms
// [2026-01-10T10:00:09.870+0000][9.870s][info][gc] GC(9) Pause Full (System.gc()) 90M->7M(256M) 38.0ms`],
            ['Force a full GC for a demo only.',
                r`Runtime rt = Runtime.getRuntime();
long before = rt.totalMemory() - rt.freeMemory();
System.gc();   // a hint; for demos and tests only
long after = rt.totalMemory() - rt.freeMemory();
System.out.println(after <= before);

// OUTPUT: (varies)
// true`]]
    ),

    'gc-tuning': x(
        ['<b>Measure first</b>: turn on GC logging and tune only when pauses or throughput are a real problem.',
            '<b>Heap size</b> is set with <code>-Xms</code> (initial) and <code>-Xmx</code> (maximum); a heap that is too small causes frequent GC.',
            '<b>Default collector</b>: since JDK 9 G1 is the default on server-class machines; the default is fine for most applications.'],
        ['<b>Goals</b>: low latency (short pauses), high throughput (little time in GC) and small footprint cannot all be maximized together.',
            '<b>Pause target</b>: G1 accepts <code>-XX:MaxGCPauseMillis=200</code> as a goal, not a guarantee.',
            '<b>Containers</b>: prefer <code>-XX:MaxRAMPercentage=75</code> so the heap follows the container memory limit.'],
        ['<b>Choose the collector</b>: Parallel for batch throughput, G1 for balanced services, ZGC (<code>-XX:+UseZGC</code>) for very large heaps and tight latency.',
            '<b>Change one thing at a time</b> and compare logs under a realistic load test, not a microbenchmark.',
            '<b>Fix allocation</b> first: reducing garbage and live data beats any flag.'],
        [['F', 'How do you set the heap size?', 'With -Xms for the initial size and -Xmx for the maximum, for example -Xms512m -Xmx2g.'],
            ['F', 'Which collector is the default in Java 17?', 'G1 (Garbage-First).'],
            ['M', 'Why set Xms equal to Xmx on servers?', 'It avoids heap resizing pauses and gives predictable memory use, at the cost of reserving memory up front.'],
            ['M', 'Is MaxGCPauseMillis a guarantee?', 'No. It is a soft goal; G1 adapts region counts to try to meet it but can miss it.'],
            ['S', 'How would you diagnose long full GC pauses?', 'Read the GC log for the cause, check old generation occupancy after GC, take a heap dump, and fix leaks or sizing before changing collectors.'],
            ['S', 'When choose ZGC over G1?', 'For multi-gigabyte heaps that need sub-millisecond-class pauses, accepting some extra CPU and memory overhead.']],
        [['Start with sizing and logging.',
            r`// run:
// java -Xms1g -Xmx1g -XX:+UseG1GC -XX:MaxGCPauseMillis=100 -Xlog:gc -jar app.jar

// OUTPUT: (varies)
// [0.210s][info][gc] Using G1
// [3.402s][info][gc] GC(5) Pause Young (Normal) (G1 Evacuation Pause) 410M->120M(1024M) 8.7ms`],
            ['Container friendly heap.',
                r`// run in a container limited to 2 GB:
// java -XX:MaxRAMPercentage=75 -XX:+PrintFlagsFinal -version | findstr MaxHeapSize

// OUTPUT: (varies)
//    size_t MaxHeapSize = 1610612736   {product} {ergonomic}`]],
        [['Compare collectors on one workload.',
            r`// java -XX:+UseParallelGC -Xlog:gc -jar batch.jar
// java -XX:+UseG1GC       -Xlog:gc -jar batch.jar
// java -XX:+UseZGC        -Xlog:gc -jar batch.jar
// Compare total GC time (throughput) and the longest pause (latency).

// OUTPUT: (varies)
// Parallel: total pause 1.9 s, max 210 ms
// G1:       total pause 2.6 s, max  95 ms
// ZGC:      total pause 0.1 s, max   1 ms (more CPU used)`],
            ['Reduce allocation instead of tuning.',
                r`// before: a new formatter and many Strings per call
String slow(List<Integer> ids) {
    String s = "";
    for (int id : ids) s += id + ",";
    return s;
}
// after: one builder
String fast(List<Integer> ids) {
    StringBuilder sb = new StringBuilder(ids.size() * 4);
    for (int id : ids) sb.append(id).append(',');
    return sb.toString();
}

// OUTPUT:
// both return the same text; fast() creates far less garbage`]]
    ),

    'jit-compiler': x(
        ['<b>JIT</b> means just-in-time: the JVM compiles hot bytecode to native machine code while the program runs.',
            '<b>Interpreter first</b>: code starts interpreted, and methods or loops that run often get compiled.',
            '<b>Warm-up</b>: a program is slower at the start, so benchmarks must warm up before measuring.'],
        ['<b>Tiered compilation</b>: C1 compiles quickly with light optimization, then C2 recompiles the hottest code with heavy optimization.',
            '<b>Inlining</b> replaces a small method call with its body and is the base for many other optimizations.',
            '<b>Deoptimization</b>: if an assumption proves wrong (for example a new subclass is loaded), the JVM falls back to the interpreter.'],
        ['<b>See it</b> with <code>-XX:+PrintCompilation</code> and, for inlining, <code>-XX:+UnlockDiagnosticVMOptions -XX:+PrintInlining</code>.',
            '<b>Code cache</b>: compiled code lives in a limited area, sized by <code>-XX:ReservedCodeCacheSize</code>.',
            '<b>Benchmark with JMH</b>, which handles warm-up, dead-code elimination and forks for you.'],
        [['F', 'What does the JIT compiler do?', 'It turns frequently executed bytecode into native machine code at run time to make it faster.'],
            ['F', 'Why is Java slow at startup?', 'Code is interpreted until it becomes hot and gets compiled, and classes must be loaded first.'],
            ['M', 'What are C1 and C2?', 'C1 is the fast client compiler with light optimizations; C2 is the server compiler with aggressive optimizations. Tiered mode uses both.'],
            ['M', 'What is inlining?', 'Copying a small callee into the caller to remove call overhead and enable further optimization.'],
            ['S', 'What is deoptimization?', 'Discarding compiled code whose speculative assumption failed and returning to the interpreter, then recompiling with new profile data.'],
            ['S', 'Why do naive microbenchmarks mislead?', 'Warm-up, dead-code elimination, constant folding and OSR distort the timing; JMH exists to control them.']],
        [['See methods being compiled.',
            r`// run: java -XX:+PrintCompilation Hot
public class Hot {
    static int sq(int x) { return x * x; }
    public static void main(String[] args) {
        long sum = 0;
        for (int i = 0; i < 5_000_000; i++) sum += sq(i);
        System.out.println(sum);
    }
}

// OUTPUT: (varies)
//     72   45       3       Hot::sq (6 bytes)
//     75   48       4       Hot::sq (6 bytes)
//     80   50 %     4       Hot::main @ 8 (35 bytes)
// 41666654166667500000`],
            ['Warm-up effect.',
                r`for (int round = 0; round < 3; round++) {
    long t = System.nanoTime();
    long s = 0;
    for (int i = 0; i < 20_000_000; i++) s += i % 7;
    System.out.println("round " + round + ": "
        + (System.nanoTime() - t) / 1_000_000 + " ms (" + s + ")");
}

// OUTPUT: (varies)
// round 0: 48 ms (59999997)
// round 1: 21 ms (59999997)
// round 2: 20 ms (59999997)`]],
        [['Reading the PrintCompilation columns.',
            r`// columns: timestamp(ms)  compile-id  flags  tier  method (size)
// flags: % = on-stack replacement, s = synchronized, n = native
// tier: 1-3 = C1 levels, 4 = C2

// OUTPUT: (varies)
//    120  210  s  3   java.lang.StringBuffer::append (13 bytes)
//    131  222 %    4   Hot::main @ 8 (35 bytes)
//    140  230     4   Hot::sq (6 bytes)   made not entrant`],
            ['Disable the JIT to see the cost.',
                r`// java -Xint Hot      (interpreter only)
// java Hot            (default tiered JIT)

// OUTPUT: (varies)
// -Xint:   real 1.8 s
// default: real 0.12 s`]]
    ),

    'escape-analysis': x(
        ['<b>Escape analysis</b> is a C2 JIT optimization that checks whether an object can be seen outside the method or thread that created it.',
            '<b>Scalar replacement</b>: if the object does not escape, the JVM can drop the allocation and keep its fields in registers.',
            '<b>Result</b>: less heap allocation and less GC work, with no change to the program output.'],
        ['<b>Escape states</b>: no escape (stays in the method), arg escape (passed to a call) and global escape (stored in a field or returned).',
            '<b>Lock elision</b>: a lock on an object that never escapes its thread can be removed.',
            '<b>It is automatic</b>: it is on by default (<code>-XX:+DoEscapeAnalysis</code>) and applies only to hot, compiled code.'],
        ['<b>Not guaranteed</b>: large methods, failed inlining or branches that leak the object can block it.',
            '<b>Not stack allocation</b>: HotSpot does not put objects on the stack; it removes the object and keeps scalars.',
            '<b>Verify</b> with allocation profiling or JMH <code>-prof gc</code>, not by guessing; do not rewrite code to chase it.'],
        [['F', 'What is escape analysis?', 'A JIT analysis that decides whether an object is reachable outside the method or thread that allocated it.'],
            ['F', 'Is it something you code?', 'No. The JIT applies it automatically; you only write clear, small methods.'],
            ['M', 'What is scalar replacement?', 'Replacing a non-escaping object with its individual fields so no heap allocation is needed.'],
            ['M', 'What is lock elision?', 'Removing synchronization on an object that cannot be seen by other threads.'],
            ['S', 'Does Java allocate objects on the stack?', 'Not in HotSpot. It uses scalar replacement, which is similar in effect but removes the object entirely.'],
            ['S', 'How can you check it worked?', 'Compare allocation rate with and without -XX:-DoEscapeAnalysis, using JMH -prof gc or JFR allocation events.']],
        [['An object that does not escape.',
            r`record Point(int x, int y) {}

static int dist2(int a, int b) {
    Point p = new Point(a, b);   // never leaves this method: can be scalar replaced
    return p.x() * p.x() + p.y() * p.y();
}

// OUTPUT:
// dist2(3, 4) returns 25 and, after C2 compilation, allocates nothing`],
            ['An object that escapes.',
                r`static final List<Point> SEEN = new ArrayList<>();

static int dist2(int a, int b) {
    Point p = new Point(a, b);
    SEEN.add(p);                 // stored in a static field: global escape
    return p.x() * p.x() + p.y() * p.y();
}

// OUTPUT:
// every call allocates a real Point on the heap`]],
        [['Compare with escape analysis off.',
            r`// java -Xlog:gc -XX:+DoEscapeAnalysis Loop     (default)
// java -Xlog:gc -XX:-DoEscapeAnalysis Loop

// OUTPUT: (varies)
// with EA:    0 young GCs for 100 million calls
// without EA: 120 young GCs for 100 million calls`],
            ['Lock elision.',
                r`static String join(String a, String b) {
    StringBuffer sb = new StringBuffer();   // synchronized, but never shared
    sb.append(a).append(b);
    return sb.toString();                   // locks can be removed by the JIT
}

// OUTPUT:
// join("ab", "cd") returns abcd`]]
    ),

    'jvm-arguments': x(
        ['<b>Three families</b>: standard options (<code>-version</code>, <code>-cp</code>), <code>-X</code> options (<code>-Xmx512m</code>) and <code>-XX</code> options (<code>-XX:+UseG1GC</code>).',
            '<b>Boolean flags</b> use <code>+</code> to enable and <code>-</code> to disable, as in <code>-XX:+HeapDumpOnOutOfMemoryError</code>.',
            '<b>Value flags</b> use <code>=</code>, as in <code>-XX:MaxGCPauseMillis=200</code>; system properties use <code>-Dkey=value</code>.'],
        ['<b>Heap flags</b>: <code>-Xms</code>, <code>-Xmx</code>, <code>-Xss</code> for thread stack size and <code>-XX:MaxMetaspaceSize</code>.',
            '<b>JAVA_TOOL_OPTIONS</b> adds flags through an environment variable, which is handy when you cannot edit the start command.',
            '<b>Argument files</b>: <code>java @args.txt</code> reads options from a file, useful for long command lines.'],
        ['<b>Inspect the real values</b> with <code>-XX:+PrintFlagsFinal</code> or <code>jcmd PID VM.flags</code>.',
            '<b>Containers</b>: JDK 17 and 21 are container aware; use <code>-XX:MaxRAMPercentage</code> instead of a fixed <code>-Xmx</code>.',
            '<b>Unlock carefully</b>: experimental and diagnostic flags need <code>-XX:+UnlockExperimentalVMOptions</code> or <code>-XX:+UnlockDiagnosticVMOptions</code> and may change between releases.'],
        [['F', 'What is -Xmx?', 'The maximum heap size, for example -Xmx2g.'],
            ['F', 'How do you pass a system property?', 'With -Dname=value before the class or -jar; read it with System.getProperty.'],
            ['M', 'What does -XX:+HeapDumpOnOutOfMemoryError do?', 'It writes an .hprof heap dump automatically when an OutOfMemoryError is thrown; add -XX:HeapDumpPath to choose the location.'],
            ['M', 'How do you see the final value of every flag?', 'Run java -XX:+PrintFlagsFinal -version, or jcmd PID VM.flags on a running process.'],
            ['S', 'Why prefer MaxRAMPercentage in containers?', 'The heap then scales with the container memory limit, leaving room for metaspace, threads and native memory.'],
            ['S', 'Why are copy-pasted tuning flags risky?', 'They were tuned for another JDK, collector and workload, and some are obsolete or ignored; test each flag and keep the list short.']],
        [['A production style command line.',
            r`// java -XX:MaxRAMPercentage=75 -XX:+HeapDumpOnOutOfMemoryError \
//      -XX:HeapDumpPath=/dumps -Xlog:gc*:file=/logs/gc.log:time \
//      -Dspring.profiles.active=prod -jar app.jar

// OUTPUT:
// (no output from the flags themselves; the application starts normally)`],
            ['List flags the JVM chose.',
                r`// java -XX:+PrintFlagsFinal -version | findstr /C:"UseG1GC" /C:"MaxHeapSize"

// OUTPUT: (varies)
//      bool UseG1GC          = true      {product} {ergonomic}
//    size_t MaxHeapSize      = 4294967296 {product} {ergonomic}`]],
        [['Read flags from a file.',
            r`// args.txt contains:
//   -Xms512m
//   -Xmx512m
//   -XX:+UseG1GC
// run: java @args.txt -jar app.jar

// OUTPUT:
// the JVM behaves as if the three flags were typed on the command line`],
            ['Check flags of a running process.',
                r`// jcmd 12345 VM.flags

// OUTPUT: (varies)
// 12345:
// -XX:CICompilerCount=4 -XX:InitialHeapSize=268435456 -XX:+UseG1GC
// -XX:MaxHeapSize=4294967296 -XX:MaxNewSize=2575302656`]]
    ),

    'heap-dumps': x(
        ['<b>Heap dump</b>: a snapshot of every live object in the heap, saved as an <code>.hprof</code> file.',
            '<b>Use it</b> to find memory leaks and see which objects take the most memory.',
            '<b>Automatic dump</b>: start the JVM with <code>-XX:+HeapDumpOnOutOfMemoryError</code> so the evidence is saved when it crashes.'],
        ['<b>Manual dump</b>: <code>jcmd PID GC.heap_dump file.hprof</code> or <code>jmap -dump:live,format=b,file=heap.hprof PID</code>.',
            '<b>Analyze</b> with Eclipse MAT, VisualVM or IntelliJ; sort by retained size to find the real owners.',
            '<b>Size</b>: the file is about as large as the used heap, so make sure the disk has room.'],
        ['<b>Shallow vs retained size</b>: retained size is memory freed if the object were collected, and it points to the leak root.',
            '<b>Dominator tree and path to GC roots</b> explain why an object stays alive.',
            '<b>Security</b>: a dump contains passwords, tokens and personal data, so protect and delete it like a secret.'],
        [['F', 'What is a heap dump?', 'A file with a snapshot of all objects in the JVM heap at one moment.'],
            ['F', 'How do you get one when the app runs out of memory?', 'Start with -XX:+HeapDumpOnOutOfMemoryError and -XX:HeapDumpPath=/some/dir.'],
            ['M', 'jcmd or jmap?', 'Both work; jcmd GC.heap_dump is the modern, recommended tool. The live option dumps only reachable objects and triggers a full GC.'],
            ['M', 'What is retained size?', 'The total memory that would be freed if that object and everything only it references were collected.'],
            ['S', 'How do you find a leak in a dump?', 'Open the dominator tree, find the largest retained sizes, and use path to GC roots to see which static field or thread holds them.'],
            ['S', 'Risks of taking a dump in production?', 'The JVM pauses while writing, disk can fill, and the file holds sensitive data. Use a replica when possible and restrict access.']],
        [['Create a dump of a running process.',
            r`// jcmd 12345 GC.heap_dump C:\dumps\heap.hprof

// OUTPUT: (varies)
// 12345:
// Heap dump file created [182345678 bytes in 1.420 secs]`],
            ['A classic leak to find.',
                r`public class Leak {
    static final List<byte[]> CACHE = new ArrayList<>();   // grows forever
    public static void main(String[] args) {
        // run: java -Xmx64m -XX:+HeapDumpOnOutOfMemoryError Leak
        while (true) CACHE.add(new byte[1024 * 1024]);
    }
}

// OUTPUT: (varies)
// java.lang.OutOfMemoryError: Java heap space
// Dumping heap to java_pid4242.hprof ...
// Heap dump file created [67108864 bytes in 0.09 secs]`]],
        [['Dump only live objects with jmap.',
            r`// jmap -dump:live,format=b,file=heap.hprof 12345

// OUTPUT: (varies)
// Dumping heap to C:\dumps\heap.hprof ...
// Heap dump file created`],
            ['Quick histogram without a full dump.',
                r`// jcmd 12345 GC.class_histogram | more

// OUTPUT: (varies)
//  num     #instances         #bytes  class name
//    1:        182000       58240000  [B
//    2:        181500        4356000  java.lang.String
//    3:          9000        1008000  com.shop.CartItem`]]
    )
};

export const jvm4Deep: Record<string, Deep> = {
    'gc-cycles': dv(
        [`<p>A tracing collector finds live objects and reclaims the rest.</p><ul><li><b>Roots:</b> thread stacks, statics, JNI handles and loaded classes.</li><li><b>Marking:</b> follows references from roots; unmarked objects are garbage.</li><li><b>Generational hypothesis:</b> most objects die young, so collecting the young generation is cheap.</li><li><b>Copying:</b> survivors move from eden to a survivor space, and their age grows with each cycle until promotion.</li><li><b>G1:</b> splits the heap into regions; young-only phases, a concurrent mark and mixed collections form the cycle.</li><li><b>Safepoints:</b> pause phases begin when all threads reach a safepoint.</li></ul>`,
            r`// run: java -Xlog:gc*,gc+age=trace -Xmx128m Churn
// shows eden, survivor and tenuring thresholds per collection

// OUTPUT: (varies)
// [0.101s][info][gc,heap] GC(2) Eden regions: 12->0(10)
// [0.101s][info][gc,heap] GC(2) Survivor regions: 2->3(3)
// [0.101s][info][gc,heap] GC(2) Old regions: 4->5
// [0.101s][trace][gc,age] GC(2) Desired survivor size 3145728 bytes, new threshold 7`],
        [`<p>Collection kinds and the log lines you see:</p><ul><li><b>Pause Young (Normal):</b> routine young collection.</li><li><b>Pause Young (Concurrent Start):</b> a young pause that also starts marking.</li><li><b>Concurrent Mark Cycle:</b> runs beside the application.</li><li><b>Pause Young (Mixed):</b> young plus old regions.</li><li><b>Pause Full:</b> the fallback, single-pass compaction of the whole heap.</li><li><b>Parallel GC:</b> generational, stop-the-world, throughput focused.</li><li><b>ZGC and Shenandoah:</b> concurrent, short pauses.</li></ul>`,
            r`// java -XX:+UseParallelGC -Xlog:gc Churn
// java -XX:+UseG1GC       -Xlog:gc Churn
// java -XX:+UseZGC        -Xlog:gc Churn

// OUTPUT: (varies)
// [0.05s][info][gc] GC(0) Pause Young (Allocation Failure) 16M->1M(61M) 1.8ms   Parallel
// [0.05s][info][gc] GC(0) Pause Young (Normal) (G1 Evacuation Pause) 25M->1M(64M) 1.2ms   G1
// [0.05s][info][gc] GC(0) Garbage Collection (Warmup) 20M(31%)->4M(6%)   ZGC`],
        [`<p>Common mistakes with GC and the fix for each:</p><ul><li><b>Calling System.gc():</b> triggers a full pause; remove it or set <code>-XX:+DisableExplicitGC</code> if a library calls it.</li><li><b>Relying on finalizers:</b> they delay reclamation; use try-with-resources or <code>Cleaner</code>.</li><li><b>Static caches that never evict:</b> they stay reachable; use bounded caches.</li><li><b>Unremoved listeners:</b> the registry keeps the object alive.</li><li><b>Large temporary arrays:</b> in G1 they become humongous allocations; reuse or split them.</li><li><b>ThreadLocal in pools:</b> values live as long as the thread; call <code>remove()</code>.</li></ul>`,
            r`static final Map<String, byte[]> CACHE = new HashMap<>();   // leak: no eviction

// fix: bounded LRU cache
static final Map<String, byte[]> LRU =
    new LinkedHashMap<>(16, 0.75f, true) {
        @Override
        protected boolean removeEldestEntry(Map.Entry<String, byte[]> e) {
            return size() > 1000;
        }
    };

// OUTPUT:
// LRU never holds more than 1000 entries, so old values become garbage`],
        [`<p>Performance levers:</p><ul><li><b>Lower allocation rate:</b> fewer minor GCs.</li><li><b>Smaller live set:</b> shorter marking and copying.</li><li><b>Right young size:</b> too small promotes garbage early; too large lengthens pauses on some collectors.</li><li><b>Survivor sizing:</b> watch the tenuring threshold in the log.</li><li><b>Avoid humongous objects</b> (half a G1 region or larger).</li><li><b>Watch:</b> GC time percentage, allocation rate and old generation after-GC occupancy.</li></ul>`,
            r`// java -Xlog:gc*:file=gc.log -jar app.jar
// quick check of throughput from the log with any GC analyzer, or by hand:
// GC overhead = total pause time / run time

// OUTPUT: (varies)
// run time 600 s, total pause 9.4 s -> GC overhead about 1.6 percent
// old generation after GC: 410M, 415M, 421M ... (steady growth suggests a leak)`],
        [`<p>Scenario: an order service shows 1.5 second latency spikes every few minutes.</p><ul><li><b>Evidence:</b> the GC log shows <code>Pause Full (G1 Humongous Allocation)</code>.</li><li><b>Cause:</b> a report builder allocates a 40 MB array per request.</li><li><b>Fix:</b> stream the data in chunks, then confirm that the full GCs disappear.</li></ul>`,
            r`// before
byte[] all = new byte[40 * 1024 * 1024];   // humongous allocation per request

// after: stream in chunks
try (OutputStream out = response.getOutputStream()) {
    byte[] chunk = new byte[64 * 1024];
    int n;
    while ((n = source.read(chunk)) > 0) out.write(chunk, 0, n);
}

// OUTPUT: (varies)
// before: Pause Full (G1 Humongous Allocation) 1480ms
// after:  only Pause Young (Normal) under 15ms`]
    ),

    'gc-tuning': dv(
        [`<p>Tuning works by trading three goals against each other.</p><ul><li><b>Throughput:</b> the share of time spent running application code.</li><li><b>Latency:</b> the length of the longest pauses.</li><li><b>Footprint:</b> heap and native memory used.</li><li><b>G1 ergonomics:</b> sizes regions and the young generation dynamically to meet the pause goal.</li><li><b>Adaptive sizing:</b> fixing the young size with flags disables part of that adaptation.</li></ul>`,
            r`// java -XX:+UseG1GC -XX:MaxGCPauseMillis=100 -Xlog:gc*,gc+ergo*=debug -jar app.jar

// OUTPUT: (varies)
// [1.2s][debug][gc,ergo] GC(7) Running G1 Young GC ... Target pause time: 100.00ms
// [1.2s][debug][gc,ergo] GC(7) Young list target length: 215 regions`],
        [`<p>Useful flags (JDK 17 and 21):</p><ul><li><b>Sizing:</b> <code>-Xms</code>, <code>-Xmx</code>, <code>-XX:MaxRAMPercentage</code>, <code>-XX:InitialRAMPercentage</code>.</li><li><b>Collector:</b> <code>-XX:+UseG1GC</code>, <code>-XX:+UseParallelGC</code>, <code>-XX:+UseZGC</code>, <code>-XX:+UseSerialGC</code>.</li><li><b>G1:</b> <code>-XX:MaxGCPauseMillis</code>, <code>-XX:G1HeapRegionSize</code>, <code>-XX:InitiatingHeapOccupancyPercent</code>.</li><li><b>ZGC:</b> <code>-XX:+ZGenerational</code> on JDK 21.</li><li><b>Threads:</b> <code>-XX:ParallelGCThreads</code>, <code>-XX:ConcGCThreads</code>.</li><li><b>Logging:</b> <code>-Xlog:gc*</code>.</li></ul>`,
            r`// small service
//   java -XX:MaxRAMPercentage=70 -XX:+UseG1GC -jar api.jar
// batch job
//   java -Xms4g -Xmx4g -XX:+UseParallelGC -jar batch.jar
// big heap, strict latency (JDK 21)
//   java -Xmx32g -XX:+UseZGC -XX:+ZGenerational -jar trading.jar

// OUTPUT:
// each line is a starting point to measure, not a final answer`],
        [`<p>Mistakes and fixes:</p><ul><li><b>Huge flag lists</b> copied from blogs: start from defaults and add one flag with evidence.</li><li><b>Tiny pause goal:</b> <code>MaxGCPauseMillis=10</code> on G1 makes young generation tiny and collections too frequent.</li><li><b>Heap larger than the container:</b> the OOM killer ends the process; leave room for non-heap memory.</li><li><b>Fixing the young size</b> with <code>-Xmn</code> and losing adaptivity.</li><li><b>Tuning when the problem is a leak:</b> more heap only delays the failure.</li></ul>`,
            r`// bad: pause goal too tight, young generation shrinks, GC runs constantly
//   java -XX:MaxGCPauseMillis=5 -jar app.jar
// better: realistic goal, then check the log
//   java -XX:MaxGCPauseMillis=100 -Xlog:gc -jar app.jar

// OUTPUT: (varies)
// bad:    GC every 40 ms, GC overhead 18 percent
// better: GC every 600 ms, GC overhead 2 percent`],
        [`<p>Performance method:</p><ul><li><b>Baseline:</b> record p50, p99 and GC overhead under a realistic load.</li><li><b>Change one flag</b> and repeat the same test.</li><li><b>Keep</b> a change only if the numbers improve.</li><li><b>Prefer code fixes:</b> reduce allocation and live data first.</li><li><b>Tools:</b> GC logs with an analyzer, JFR and JMH <code>-prof gc</code>.</li></ul>`,
            r`// capture a flight recording during the load test
// java -XX:StartFlightRecording=duration=120s,filename=run.jfr -jar app.jar
// jfr summary run.jfr
// jfr print --events jdk.GarbageCollection run.jfr

// OUTPUT: (varies)
// jdk.GarbageCollection {
//   name = "G1Young"
//   cause = "G1 Evacuation Pause"
//   sumOfPauses = 8.4 ms
// }`],
        [`<p>Scenario: a nightly batch of 20 million rows runs 40 percent slower after moving to a container.</p><ul><li><b>Finding:</b> the JVM sees 1 CPU and picks Serial GC.</li><li><b>Fix:</b> give the container 4 CPUs, or set the collector explicitly, and use a fixed heap.</li><li><b>Check:</b> <code>-Xlog:gc</code> shows which collector started.</li></ul>`,
            r`// before (1 CPU, 1 GB): ergonomics picks Serial
//   [0.01s][info][gc] Using Serial
// after (4 CPUs, 4 GB)
//   java -Xms3g -Xmx3g -XX:+UseParallelGC -Xlog:gc -jar batch.jar

// OUTPUT: (varies)
// [0.01s][info][gc] Using Parallel
// batch time 52 min -> 31 min`]
    ),

    'jit-compiler': dv(
        [`<p>HotSpot profiles code while it runs and compiles what is hot.</p><ul><li><b>Levels:</b> 0 interpreter, 1 to 3 C1 (3 adds profiling), 4 C2.</li><li><b>Counters:</b> method invocation and loop back-edge counters trigger compilation.</li><li><b>OSR:</b> on-stack replacement swaps a running loop into compiled code.</li><li><b>Speculation:</b> C2 uses profile data, such as the receiver types seen, and adds uncommon traps.</li><li><b>Background threads:</b> compilation runs on separate compiler threads.</li><li><b>Code cache:</b> stores the compiled code.</li></ul>`,
            r`// java -XX:+PrintCompilation -XX:+UnlockDiagnosticVMOptions -XX:+PrintInlining Hot

// OUTPUT: (varies)
//     80   50 %     4       Hot::main @ 8 (35 bytes)
//                             @ 14   Hot::sq (6 bytes)   inline (hot)`],
        [`<p>Options:</p><ul><li><b>Tiered:</b> <code>-XX:+TieredCompilation</code> is the default.</li><li><b>Stop at C1:</b> <code>-XX:TieredStopAtLevel=1</code> gives fast startup for short tools.</li><li><b>Interpreter only:</b> <code>-Xint</code>, for debugging.</li><li><b>Compile everything:</b> <code>-Xcomp</code> is for experiments only.</li><li><b>Threads:</b> <code>-XX:CICompilerCount</code>.</li><li><b>Code cache:</b> <code>-XX:ReservedCodeCacheSize=256m</code>.</li><li><b>Log:</b> <code>-XX:+PrintCompilation</code>, or <code>-Xlog:jit+compilation=debug</code>.</li></ul>`,
            r`// short-lived CLI tool: favor startup
//   java -XX:TieredStopAtLevel=1 -jar tool.jar
// long-running service: keep the default tiered mode
//   java -XX:ReservedCodeCacheSize=256m -jar service.jar

// OUTPUT: (varies)
// tool.jar: 0.35 s with level 1 versus 0.50 s default for a tiny job`],
        [`<p>Mistakes:</p><ul><li><b>Timing code without warm-up:</b> use JMH.</li><li><b>Results unused:</b> the JIT removes dead code, so the loop measures nothing.</li><li><b>Huge methods:</b> methods over 8000 bytecodes are not compiled by default (<code>HugeMethodLimit</code>); split them.</li><li><b>Code cache full:</b> the log says <code>CodeCache is full</code> and compilation stops.</li><li><b>Megamorphic call sites:</b> many receiver types stop inlining.</li></ul>`,
            r`// wrong: the result is never used, the JIT may delete the loop
long t = System.nanoTime();
for (int i = 0; i < 100_000_000; i++) { Math.sqrt(i); }
System.out.println(System.nanoTime() - t);

// right: use the value (or a JMH Blackhole)
double acc = 0;
for (int i = 0; i < 100_000_000; i++) acc += Math.sqrt(i);
System.out.println(acc);

// OUTPUT: (varies)
// 1200 ns for the wrong version; the right one takes tens of ms`],
        [`<p>Tuning for startup and peak speed:</p><ul><li><b>Warm-up:</b> send synthetic traffic before a node joins the load balancer.</li><li><b>Class data sharing (CDS):</b> speeds up startup.</li><li><b>AOT and GraalVM native image:</b> remove warm-up at the cost of peak throughput and flexibility.</li><li><b>Monitor:</b> JFR events <code>jdk.Compilation</code> and <code>jdk.Deoptimization</code>.</li></ul>`,
            r`// java -XX:ArchiveClassesAtExit=app.jsa -jar app.jar     (create AppCDS archive)
// java -XX:SharedArchiveFile=app.jsa -jar app.jar        (use it)

// OUTPUT: (varies)
// startup 2.1 s -> 1.6 s with the archive (class loading portion only)`],
        [`<p>Scenario: p99 latency is bad for the first minute after each deploy.</p><ul><li><b>Cause:</b> cold code is interpreted.</li><li><b>Fix:</b> warm-up requests on start, readiness only after warm-up, and rolling deploys.</li></ul>`,
            r`@EventListener(ApplicationReadyEvent.class)
void warmUp() {
    for (int i = 0; i < 20_000; i++) {
        pricingService.quote(sampleRequest(i));   // exercises hot paths
    }
    readiness.markReady();
}

// OUTPUT: (varies)
// first-minute p99: 900 ms -> 60 ms`]
    ),

    'escape-analysis': dv(
        [`<p>C2 builds a connection graph of allocations and references.</p><ul><li><b>Input:</b> inlined code, so inlining decides how much it can see.</li><li><b>Classification:</b> each allocation is NoEscape, ArgEscape or GlobalEscape.</li><li><b>NoEscape:</b> eligible for scalar replacement and lock elision.</li><li><b>Limits:</b> arrays larger than <code>EliminateAllocationArraySizeLimit</code> and objects used in merges are often skipped.</li><li><b>JDK 21:</b> improved handling of objects at control-flow merges is still evolving, so results vary by version.</li></ul>`,
            r`// java -XX:+UnlockDiagnosticVMOptions -XX:+PrintEliminateAllocations Loop

// OUTPUT: (varies; debug builds print more)
// ++++ Eliminated: 12 Allocate (Point)`],
        [`<p>Flags (all on by default except the printing ones):</p><ul><li><code>-XX:+DoEscapeAnalysis</code></li><li><code>-XX:+EliminateAllocations</code> (scalar replacement)</li><li><code>-XX:+EliminateLocks</code></li><li><code>-XX:+UnlockDiagnosticVMOptions -XX:+PrintEscapeAnalysis</code> (needs a debug build)</li><li>Use <code>-XX:-DoEscapeAnalysis</code> to compare behavior.</li></ul>`,
            r`// java -XX:-DoEscapeAnalysis -Xlog:gc Loop
// java -XX:+DoEscapeAnalysis -Xlog:gc Loop

// OUTPUT: (varies)
// -DoEscapeAnalysis: 200 young GCs
// +DoEscapeAnalysis: 0 young GCs`],
        [`<p>Mistakes:</p><ul><li><b>Believing objects go on the stack:</b> they are removed, not stacked.</li><li><b>Hand-optimizing</b> readable code into arrays or primitives without proof.</li><li><b>Leaking in a rare branch</b> (for example logging the object) blocks the optimization for the whole method.</li><li><b>Benchmarks in the interpreter:</b> escape analysis needs C2 compiled code.</li></ul>`,
            r`static int f(int a) {
    Point p = new Point(a, a);
    if (a < 0) LOG.add(p);       // a rare leak still makes p escape
    return p.x() + p.y();
}

// fix: leak only a copy in the rare branch
static int g(int a) {
    Point p = new Point(a, a);
    if (a < 0) LOG.add(new Point(a, a));
    return p.x() + p.y();
}

// OUTPUT:
// g() can be scalar replaced; f() allocates on the heap`],
        [`<p>Measure with JMH.</p><ul><li><b>Profiler:</b> <code>-prof gc</code> reports allocated bytes per operation.</li><li><b>Target:</b> close to 0 B/op means allocation was removed.</li><li><b>Beware:</b> small changes in the code or JDK can change the result.</li></ul>`,
            r`@Benchmark
public int dist() {
    Point p = new Point(3, 4);
    return p.x() * p.x() + p.y() * p.y();
}
// run: java -jar benchmarks.jar -prof gc

// OUTPUT: (varies)
// dist                 avgt   10   1.8 ns/op
// dist:gc.alloc.rate.norm   10  ~10^-5 B/op`],
        [`<p>Scenario: a parser creates many small tokens per line, and young GC is busy.</p><ul><li><b>Check:</b> JFR allocation profile shows <code>Token</code> as the top allocation.</li><li><b>Action:</b> keep the construction and use local to a small, inlinable method so C2 can remove it; if the profile does not improve, reuse a mutable cursor.</li></ul>`,
            r`record Token(int start, int end) {}

static int length(String line, int from) {
    Token t = findToken(line, from);   // small, inlinable, token not stored
    return t.end() - t.start();
}

// OUTPUT: (varies)
// allocation rate: 600 MB/s -> 40 MB/s after the refactor was confirmed with JFR`]
    ),

    'jvm-arguments': dv(
        [`<p>The launcher parses arguments in a fixed order.</p><ul><li><b>Sources:</b> <code>JAVA_TOOL_OPTIONS</code>, the command line, <code>@argfiles</code>, and <code>JDK_JAVA_OPTIONS</code> (JDK 9 and later).</li><li><b>Ergonomics:</b> flags you do not set are chosen from CPUs and memory, including container limits.</li><li><b>Flag kinds:</b> product, diagnostic, experimental, manageable (changeable at run time).</li><li><b>Class path:</b> arguments after the main class or jar go to <code>main(String[])</code>.</li></ul>`,
            r`// java -Xmx1g -Dmode=test MyApp one two
//   JVM options: -Xmx1g -Dmode=test      application args: one two

public static void main(String[] args) {
    System.out.println(System.getProperty("mode") + " " + Arrays.toString(args));
}

// OUTPUT:
// test [one, two]`],
        [`<p>Common groups:</p><ul><li><b>Memory:</b> <code>-Xms</code>, <code>-Xmx</code>, <code>-Xss</code>, <code>-XX:MaxMetaspaceSize</code>, <code>-XX:MaxDirectMemorySize</code>.</li><li><b>GC:</b> <code>-XX:+UseG1GC</code>, <code>-Xlog:gc*</code>.</li><li><b>Diagnostics:</b> <code>-XX:+HeapDumpOnOutOfMemoryError</code>, <code>-XX:+ExitOnOutOfMemoryError</code>, <code>-XX:NativeMemoryTracking=summary</code>.</li><li><b>Modules:</b> <code>--add-opens</code>, <code>--add-modules</code>.</li><li><b>Preview:</b> <code>--enable-preview</code>.</li></ul>`,
            r`// java -XX:+ExitOnOutOfMemoryError -XX:+HeapDumpOnOutOfMemoryError \
//      -XX:NativeMemoryTracking=summary -jar app.jar
// jcmd PID VM.native_memory summary

// OUTPUT: (varies)
// Native Memory Tracking:
// Total: reserved=2400MB, committed=950MB
// -  Java Heap (reserved=1024MB, committed=512MB)
// -  Class (reserved=1050MB, committed=75MB)`],
        [`<p>Mistakes:</p><ul><li><b>Xmx equal to container memory:</b> no room for metaspace, stacks and buffers; use 60 to 75 percent.</li><li><b>Flag after the jar name:</b> it becomes an application argument and is ignored by the JVM.</li><li><b>Typo in a flag:</b> an unknown <code>-XX</code> flag stops the JVM; add <code>-XX:+IgnoreUnrecognizedVMOptions</code> only deliberately.</li><li><b>Obsolete flags</b> such as <code>-XX:+UseConcMarkSweepGC</code>, removed in JDK 14.</li></ul>`,
            r`// wrong: -Xmx512m comes after the jar, so it is just a program argument
//   java -jar app.jar -Xmx512m
// right
//   java -Xmx512m -jar app.jar

// OUTPUT: (varies)
// wrong: heap stays at the default size
// right: MaxHeapSize = 536870912`],
        [`<p>Performance notes:</p><ul><li><b>Xms = Xmx</b> avoids resize pauses.</li><li><b>-XX:+AlwaysPreTouch</b> commits memory at start for steadier latency but slows startup.</li><li><b>Xss</b> larger stacks cost memory per thread; many threads need a small value.</li><li><b>Large pages and NUMA flags</b> only help specific workloads; test them.</li></ul>`,
            r`// java -Xms4g -Xmx4g -XX:+AlwaysPreTouch -jar app.jar

// OUTPUT: (varies)
// startup 5 s slower, but no page-fault stalls during the first minutes`],
        [`<p>Scenario: a Kubernetes pod is OOMKilled although the heap looks fine.</p><ul><li><b>Cause:</b> <code>-Xmx</code> equals the pod limit, and metaspace, thread stacks and direct buffers exceed it.</li><li><b>Fix:</b> use <code>MaxRAMPercentage=70</code>, and track non-heap with Native Memory Tracking.</li></ul>`,
            r`// before
//   java -Xmx2g -jar app.jar        (pod limit 2Gi -> OOMKilled)
// after
//   java -XX:MaxRAMPercentage=70 -XX:MaxMetaspaceSize=256m -jar app.jar

// OUTPUT: (varies)
// before: exit code 137 after a few hours
// after:  stable; heap max about 1.4 GB`]
    ),

    'heap-dumps': dv(
        [`<p>The HPROF file stores heap structure rather than a copy of the live program.</p><ul><li><b>Content:</b> classes, instances, field values, arrays and GC roots.</li><li><b>Creation:</b> the JVM stops at a safepoint and writes the heap; this pause grows with heap size.</li><li><b>live option:</b> runs a full GC first, so the dump holds only reachable objects.</li><li><b>Compression:</b> JDK 17 and later can write with <code>jcmd PID GC.heap_dump -gz=5 file.hprof.gz</code> (check your JDK build).</li></ul>`,
            r`// jcmd 12345 GC.heap_dump -all heap-all.hprof    (include unreachable objects)
// jcmd 12345 GC.heap_dump heap-live.hprof        (default: live objects only)

// OUTPUT: (varies)
// 12345:
// Heap dump file created [90112345 bytes in 0.830 secs]`],
        [`<p>Ways to obtain a dump:</p><ul><li><b>On OOM:</b> <code>-XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/dumps</code>.</li><li><b>jcmd:</b> <code>GC.heap_dump</code>.</li><li><b>jmap:</b> <code>-dump:live,format=b,file=...</code>.</li><li><b>JMX:</b> <code>HotSpotDiagnosticMXBean.dumpHeap</code>.</li><li><b>Tools:</b> VisualVM or JConsole buttons.</li><li><b>Analysis:</b> Eclipse MAT (Leak Suspects report), VisualVM, IntelliJ profiler.</li></ul>`,
            r`import com.sun.management.HotSpotDiagnosticMXBean;
import java.lang.management.ManagementFactory;

public static void dump(String file) throws Exception {
    HotSpotDiagnosticMXBean bean = ManagementFactory.newPlatformMXBeanProxy(
        ManagementFactory.getPlatformMBeanServer(),
        "com.sun.management:type=HotSpotDiagnostic",
        HotSpotDiagnosticMXBean.class);
    bean.dumpHeap(file, true);   // true = live objects only
}

// OUTPUT: (varies)
// creates the .hprof file at the given path`],
        [`<p>Mistakes:</p><ul><li><b>No dump path space:</b> the dump fails because the disk is full; point <code>HeapDumpPath</code> to a big volume.</li><li><b>Looking at shallow size</b> only: shallow size hides the owner; use retained size.</li><li><b>Opening a huge dump on a laptop:</b> raise the MAT memory in <code>MemoryAnalyzer.ini</code>.</li><li><b>Dump after restart:</b> the leak evidence is lost; take it before restarting.</li><li><b>Sharing dumps</b> over chat or tickets, leaking secrets.</li></ul>`,
            r`// MemoryAnalyzer.ini
//   -Xmx8g
// parse a big dump without the UI
//   ParseHeapDump.bat heap.hprof org.eclipse.mat.api:suspects

// OUTPUT: (varies)
// writes heap_Leak_Suspects.zip with an HTML report`],
        [`<p>Performance and safety:</p><ul><li><b>Pause:</b> expect seconds per few GB, and take the node out of rotation first.</li><li><b>Disk:</b> reserve about the heap size.</li><li><b>Two dumps:</b> take one early and one later and compare the growth.</li><li><b>Lighter option:</b> <code>GC.class_histogram</code> or a JFR old-object sample.</li></ul>`,
            r`// jcmd 12345 GC.class_histogram > h1.txt
// ...wait 30 minutes under load...
// jcmd 12345 GC.class_histogram > h2.txt
// compare the instance counts of the top classes

// OUTPUT: (varies)
//   com.shop.Session   h1: 8,000 instances   h2: 64,000 instances  -> suspect`],
        [`<p>Scenario: heap grows until OOM every two days.</p><ul><li><b>Dump:</b> taken automatically at the OOM.</li><li><b>MAT:</b> the dominator tree shows a static <code>Map</code> holding 300 MB of <code>Session</code> objects.</li><li><b>Path to GC roots:</b> leads to a listener registry that is never cleared.</li><li><b>Fix:</b> remove the listener on logout and bound the map.</li></ul>`,
            r`// leak
static final Map<String, Session> ACTIVE = new HashMap<>();
void login(Session s)  { ACTIVE.put(s.id(), s); }
// missing: logout never removes the entry

// fix
void logout(String id) { ACTIVE.remove(id); }

// OUTPUT: (varies)
// before: heap after GC grows about 40 MB per hour
// after:  heap after GC stays flat`]
    )
};
