// JVM extras, part 6: OutOfMemoryError, StackOverflowError, high CPU, high GC, leaks, threads.
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const jvm6Extras: Record<string, Extra> = {
    'out-of-memory-error-java': x(
        ['<b>OutOfMemoryError</b> is an <code>Error</code>, not an exception: the JVM could not allocate memory and the message tells you which area ran out.',
            '<b>Java heap space</b> means the heap is full of live objects; <code>Metaspace</code> means too many classes are loaded.',
            '<b>Heap size</b> is set with <code>-Xmx</code>, and a bigger value only delays the failure if the code has a leak.'],
        ['<b>Heap dump</b>: start with <code>-XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/var/dumps</code> so the evidence is saved at the moment of failure.',
            '<b>GC overhead limit exceeded</b> means the JVM spends almost all its time in GC and frees almost nothing; it is a leak symptom.',
            '<b>Native thread</b>: <code>unable to create native thread</code> is about OS limits and thread stacks, not the heap.'],
        ['<b>ExitOnOutOfMemoryError</b>: <code>-XX:+ExitOnOutOfMemoryError</code> kills a half-broken JVM so the orchestrator restarts a clean one.',
            '<b>Direct buffer memory</b> is off-heap and limited by <code>-XX:MaxDirectMemorySize</code>; Netty and NIO code hit it.',
            '<b>Container sizing</b>: heap plus Metaspace plus thread stacks plus direct memory must fit the container limit, otherwise the kernel OOM killer acts first.'],
        [['F', 'Is OutOfMemoryError an exception?', 'No, it extends Error through VirtualMachineError. You normally do not catch it.'],
            ['F', 'Which flag sets the maximum heap?', '-Xmx, for example -Xmx512m.'],
            ['M', 'What does GC overhead limit exceeded mean?', 'The JVM spent about 98 percent of the time in GC and recovered under 2 percent of the heap, so it gave up.'],
            ['M', 'How do you find what filled the heap?', 'Open the heap dump in Eclipse MAT or VisualVM and look at the dominator tree and the path to GC roots.'],
            ['S', 'Why use ExitOnOutOfMemoryError?', 'After an OOM other threads may have died silently; exiting lets Kubernetes or systemd restart a healthy process.'],
            ['S', 'Why can the container be killed with heap below Xmx?', 'Metaspace, thread stacks, direct buffers and the code cache sit outside the heap, so total memory can pass the cgroup limit.']],
        [['Trigger a heap OOM on purpose.',
            r`import java.util.*;

public class HeapEater {
    public static void main(String[] args) {
        List<byte[]> hold = new ArrayList<>();
        while (true) {
            hold.add(new byte[1024 * 1024]);   // 1 MB each, never released
        }
    }
}
// run: java -Xmx64m -XX:+HeapDumpOnOutOfMemoryError HeapEater

// OUTPUT:
// java.lang.OutOfMemoryError: Java heap space
// Dumping heap to java_pid4242.hprof ...
// Heap dump file created [68500123 bytes in 0.250 secs] (varies)`],
            ['Read the error kind from the message.',
                r`try {
    Object o = new long[Integer.MAX_VALUE];
} catch (OutOfMemoryError e) {
    System.out.println(e.getMessage());
}

// OUTPUT: (varies by JVM and platform)
// Requested array size exceeds VM limit`]],
        [['Production JVM flags.',
            r`java -Xms512m -Xmx512m \
  -XX:MaxMetaspaceSize=192m \
  -XX:+HeapDumpOnOutOfMemoryError \
  -XX:HeapDumpPath=/var/dumps \
  -XX:+ExitOnOutOfMemoryError \
  -jar app.jar

// OUTPUT:
// no output until a failure; then the dump is written and the JVM exits with code 3`],
            ['Metaspace growth from generated classes.',
                r`// Each call defines a new class; with a small limit the JVM fails.
// run: java -XX:MaxMetaspaceSize=16m ClassMaker
for (int i = 0; ; i++) {
    Object proxy = java.lang.reflect.Proxy.newProxyInstance(
        new ClassLoader() {}, new Class<?>[] { Runnable.class },
        (p, m, a) -> null);
}

// OUTPUT: (varies)
// java.lang.OutOfMemoryError: Metaspace`]]
    ),
    'stack-overflow-error-java': x(
        ['<b>StackOverflowError</b> happens when the call stack of a thread is full, most often because of recursion without a stop condition.',
            '<b>Each call</b> adds a stack frame that holds local variables and the return address, and frames are freed on return.',
            '<b>Fix</b> the base case first; the stack trace repeats the same few lines, which shows the loop.'],
        ['<b>Stack size</b> is set per thread with <code>-Xss</code>, for example <code>-Xss1m</code>; the default is usually 512 KB to 1 MB.',
            '<b>Hidden recursion</b> hides in <code>toString()</code>, <code>equals()</code>, <code>hashCode()</code> and JPA bidirectional links that call each other.',
            '<b>Deep but valid</b> recursion (big trees, long linked lists) is better rewritten with an explicit <code>Deque</code> loop.'],
        ['<b>No tail call</b> optimization exists in Java, so tail-recursive code still uses one frame per call.',
            '<b>Raising -Xss</b> costs memory for every thread, so raise it only for a known deep workload or use a dedicated thread with a custom stack size.',
            '<b>Serialization and JSON</b> libraries recurse on object graphs; a cycle gives a StackOverflowError, so break cycles with <code>@JsonIgnore</code> or <code>@JsonManagedReference</code>.'],
        [['F', 'What causes StackOverflowError?', 'Too many nested method calls, usually infinite recursion with no base case.'],
            ['F', 'Is it an Exception?', 'No, it is an Error subclass (VirtualMachineError), so it is not meant to be caught.'],
            ['M', 'Which flag changes the stack size?', '-Xss, which applies to each new thread; the main thread may use an OS value.'],
            ['M', 'Name a hidden recursion cause.', 'Two entities with toString() that print each other, or a Lombok-generated hashCode over a cycle.'],
            ['S', 'How do you convert recursion to avoid overflow?', 'Use an explicit stack (ArrayDeque) and a loop, or process iteratively in levels.'],
            ['S', 'Does a larger -Xss fix the bug?', 'Only if the depth is valid. For infinite recursion it only delays the error and wastes memory in every thread.']],
        [['Classic infinite recursion.',
            r`public class Boom {
    static int depth = 0;
    static void down() { depth++; down(); }
    public static void main(String[] a) {
        try { down(); }
        catch (StackOverflowError e) { System.out.println("depth=" + depth); }
    }
}

// OUTPUT: (varies with -Xss and frame size)
// depth=11400`],
            ['Hidden recursion through toString.',
                r`class A { B b; public String toString() { return "A" + b; } }
class B { A a; public String toString() { return "B" + a; } }
// A x = new A(); B y = new B(); x.b = y; y.a = x;
// System.out.println(x);

// OUTPUT:
// Exception in thread "main" java.lang.StackOverflowError
//     at B.toString(Main.java:2)
//     at A.toString(Main.java:1)`]],
        [['Recursion rewritten as a loop.',
            r`static int depthRecursive(Node n) {
    return n == null ? 0 : 1 + depthRecursive(n.next);   // overflows on long lists
}
static int depthLoop(Node n) {
    int d = 0;
    for (; n != null; n = n.next) d++;
    return d;
}

// OUTPUT:
// the loop version handles 1,000,000 nodes; the recursive one overflows`],
            ['Run deep work in a thread with a big stack.',
                r`Thread t = new Thread(null, () -> System.out.println(fib(35)),
        "deep", 256L * 1024 * 1024);   // 256 MB stack for this thread only
t.start();

// OUTPUT:
// 9227465`]]
    ),
    'high-cpu-java': x(
        ['<b>High CPU</b> means the process uses most cores; first decide whether the work is useful (real load) or wasted (spin loop, GC, regex).',
            '<b>top</b> shows the busy process, and <code>top -H -p PID</code> shows the busy thread inside it.',
            '<b>Thread dump</b> with <code>jstack PID</code> shows what the busy threads are executing.'],
        ['<b>Hex conversion</b>: the thread id in top is decimal, but jstack shows <code>nid=0x...</code>, so convert with <code>printf "%x" TID</code>.',
            '<b>Common causes</b>: infinite loops, busy waiting without sleep, catastrophic regex backtracking, and a HashMap corrupted by threads.',
            '<b>GC threads</b> can be the busy ones; check with <code>jstat -gcutil</code> before blaming application code.'],
        ['<b>Sampling profiler</b>: async-profiler or JFR gives hot methods with low overhead, which is safe in production.',
            '<b>Take 3 dumps</b> a few seconds apart; a thread in the same frame each time is the suspect.',
            '<b>JIT compiler threads</b> burn CPU during warm-up, so a spike right after start is often normal.'],
        [['F', 'How do you find the busy Java process?', 'Run top or ps and sort by CPU, then note the PID.'],
            ['F', 'What tool prints a thread dump?', 'jstack PID, or jcmd PID Thread.print.'],
            ['M', 'How do you find the busy thread?', 'Run top -H -p PID, convert the thread id to hex, and search nid=0x in the dump.'],
            ['M', 'How can a regex cause high CPU?', 'Nested quantifiers cause catastrophic backtracking on certain inputs, taking exponential time.'],
            ['S', 'How do you tell GC from application CPU?', 'Use jstat -gcutil and GC logs; if GC threads dominate in top -H, the cause is memory pressure.'],
            ['S', 'Why prefer async-profiler to repeated jstack?', 'It samples many times per second without safepoint bias and shows hot methods and flame graphs.']],
        [['Busy spin loop.',
            r`volatile boolean ready = false;
void waitBad() {
    while (!ready) { }          // burns 100 percent of one core
}
void waitGood() throws InterruptedException {
    while (!ready) Thread.sleep(10);   // or use a CountDownLatch
}

// OUTPUT:
// top shows one Java thread at about 100 percent CPU for waitBad`],
            ['Find the thread with top and jstack.',
                r`// top -H -p 4242        -> thread 4301 uses 99.7 percent CPU
// printf "%x" 4301       -> 10cd
// jstack 4242 | grep -A 8 "nid=0x10cd"

// OUTPUT: (varies)
// "worker-3" #21 prio=5 nid=0x10cd runnable
//    java.lang.Thread.State: RUNNABLE
//     at com.shop.Pricing.recalc(Pricing.java:88)`]],
        [['Catastrophic regex.',
            r`String evil = "aaaaaaaaaaaaaaaaaaaaaaaaaaaa!";
long t = System.nanoTime();
boolean m = evil.matches("(a+)+$");
System.out.println(m + " ms=" + (System.nanoTime() - t) / 1_000_000);

// OUTPUT: (varies, grows exponentially with the input length)
// false ms=8500`],
            ['Safer polling with a deadline.',
                r`CountDownLatch done = new CountDownLatch(1);
// worker calls done.countDown() when finished
boolean ok = done.await(5, TimeUnit.SECONDS);   // no spinning, no wasted CPU
System.out.println(ok);

// OUTPUT:
// true`]]
    ),
    'high-gc-java': x(
        ['<b>High GC</b> means the JVM spends a large share of time collecting garbage, so the application slows down or pauses.',
            '<b>GC logs</b> are switched on with <code>-Xlog:gc*:file=gc.log</code> in Java 9 and later.',
            '<b>Young versus old</b>: short-lived objects die in the young generation cheaply; objects that survive move to the old generation.'],
        ['<b>Allocation rate</b>: creating many temporary objects (strings in loops, boxing) triggers frequent young collections.',
            '<b>Full GC</b> that frees little means the live set is too big for the heap; this is a leak or an undersized heap.',
            '<b>jstat</b>: <code>jstat -gcutil PID 1000</code> prints occupancy and counts every second.'],
        ['<b>Collector choice</b>: G1 balances throughput and pauses; ZGC and Shenandoah give very short pauses on large heaps.',
            '<b>Pause target</b>: <code>-XX:MaxGCPauseMillis=200</code> is a goal for G1, not a guarantee.',
            '<b>Tune last</b>: reduce allocation and fix leaks first, then size the heap, and only then change collector flags.'],
        [['F', 'What is garbage collection?', 'The automatic freeing of memory held by objects that nothing references any more.'],
            ['F', 'Which flag enables GC logging in Java 17?', '-Xlog:gc* with an output such as file=gc.log.'],
            ['M', 'What is a Full GC and why is it costly?', 'It collects the whole heap, and in many collectors it pauses application threads for a long time.'],
            ['M', 'How do you spot a leak in GC logs?', 'Heap after each Full GC keeps growing, so the live set rises over time.'],
            ['S', 'Why does GC throughput drop with a too small heap?', 'The collector runs more often and has little free space, so it spends more time per byte freed.'],
            ['S', 'When choose ZGC?', 'For large heaps with strict latency goals, accepting some extra CPU and memory overhead.']],
        [['Create allocation pressure.',
            r`long sum = 0;
for (int i = 0; i < 50_000_000; i++) {
    String s = "id-" + i;          // many short-lived strings
    sum += s.length();
}
System.out.println(sum);
// run: java -Xmx256m -Xlog:gc ChurnDemo

// OUTPUT: (varies)
// [0.210s][info][gc] GC(0) Pause Young (Normal) (G1 Evacuation Pause) 24M->2M(256M) 2.1ms
// [0.320s][info][gc] GC(1) Pause Young (Normal) (G1 Evacuation Pause) 26M->2M(256M) 1.8ms`],
            ['Watch GC with jstat.',
                r`// jstat -gcutil 4242 1000
//   S0   S1    E     O     M    CCS   YGC  YGCT  FGC  FGCT
// OUTPUT: (varies)
//   0.0  3.2  45.1  98.4  95.2  90.1  812  12.5  96  210.7
// old space near 98 percent and FGC rising: Full GCs that free nothing`]],
        [['Reduce garbage in a hot loop.',
            r`StringBuilder sb = new StringBuilder();
for (int i = 0; i < 1_000_000; i++) {
    sb.setLength(0);                 // reuse one buffer instead of new Strings
    sb.append("id-").append(i);
    consume(sb);
}

// OUTPUT:
// allocation rate falls and young GC count drops (varies)`],
            ['Choose a collector.',
                r`java -XX:+UseG1GC -XX:MaxGCPauseMillis=150 -Xmx4g -jar app.jar
java -XX:+UseZGC -Xmx16g -jar app.jar

// OUTPUT:
// compare pause times in the GC log before and after the change (varies)`]]
    ),
    'memory-leak-java': x(
        ['<b>Memory leak</b> in Java means objects that are no longer needed are still reachable, so the GC cannot free them.',
            '<b>Symptom</b>: heap use after each GC grows slowly until an <code>OutOfMemoryError</code> appears after hours or days.',
            '<b>Static collections</b> such as a <code>static Map</code> used as a cache are the most common leak source.'],
        ['<b>Listeners</b>: registering a listener or callback and never removing it keeps the whole owner object alive.',
            '<b>ThreadLocal</b> values in a thread pool stay for the life of the pooled thread unless you call <code>remove()</code> in a finally block.',
            '<b>Unclosed resources</b>: streams, connections and executors that are not closed keep buffers and threads alive.'],
        ['<b>Diagnose</b> with two heap dumps (<code>jcmd PID GC.heap_dump file.hprof</code>) taken some time apart and compare the growing classes in MAT.',
            '<b>Dominator tree</b> and <b>path to GC roots</b> show which static field or thread holds the memory.',
            '<b>Bounded caches</b>: use Caffeine or a size-limited <code>LinkedHashMap</code>, and use <code>WeakHashMap</code> only when you understand its key semantics.'],
        [['F', 'Can Java leak memory with a garbage collector?', 'Yes. The GC frees unreachable objects only, so objects still referenced by mistake stay.'],
            ['F', 'Give one typical leak.', 'Adding objects to a static list or map and never removing them.'],
            ['M', 'Why are ThreadLocals risky in pools?', 'Pool threads live long, so the value stays referenced until remove() is called.'],
            ['M', 'How do you capture a heap dump from a running JVM?', 'jcmd PID GC.heap_dump /tmp/h.hprof or jmap -dump:live,format=b,file=h.hprof PID.'],
            ['S', 'How do you tell a leak from a small heap?', 'Check the heap after Full GCs: a rising floor over time means a leak; a flat floor near the limit means an undersized heap.'],
            ['S', 'Why compare two dumps?', 'The class whose instance count and retained size grows between them points to the leaking structure.']],
        [['Static map leak.',
            r`public class Cache {
    private static final Map<String, byte[]> CACHE = new HashMap<>();
    static byte[] load(String key) {
        return CACHE.computeIfAbsent(key, k -> new byte[100_000]);  // never evicted
    }
}

// OUTPUT: (varies)
// jstat shows the old generation growing with every new key until
// java.lang.OutOfMemoryError: Java heap space`],
            ['Listener leak.',
                r`class Screen {
    void open(EventBus bus) {
        bus.register(this);            // bus keeps a strong reference
    }
    void close(EventBus bus) {
        bus.unregister(this);          // fix: always unregister
    }
}

// OUTPUT:
// without unregister, every closed Screen stays in memory`]],
        [['ThreadLocal cleanup.',
            r`private static final ThreadLocal<byte[]> BUF =
    ThreadLocal.withInitial(() -> new byte[1_000_000]);

void handle() {
    try {
        use(BUF.get());
    } finally {
        BUF.remove();                  // pooled threads would keep it forever
    }
}

// OUTPUT:
// no output; heap stays flat across many requests`],
            ['Bounded cache with LinkedHashMap.',
                r`class Lru<K, V> extends LinkedHashMap<K, V> {
    private final int max;
    Lru(int max) { super(16, 0.75f, true); this.max = max; }
    @Override protected boolean removeEldestEntry(Map.Entry<K, V> e) {
        return size() > max;           // evicts the least recently used
    }
}

// OUTPUT:
// new Lru<String, byte[]>(1000) never holds more than 1000 entries`]]
    ),
    'thread-exhaustion-java': x(
        ['<b>Thread exhaustion</b> means no thread is free (pool full) or the JVM cannot create more threads.',
            '<b>Platform threads</b> are mapped to OS threads and each reserves a stack, so thousands of them are costly.',
            '<b>Symptom</b>: requests wait in a queue, latency rises, and the log may show <code>unable to create native thread</code>.'],
        ['<b>Pool sizing</b>: an unbounded <code>Executors.newCachedThreadPool()</code> can create thousands of threads under load.',
            '<b>Blocking calls</b>: threads waiting for a slow database or HTTP call are held, so a slow dependency exhausts the pool.',
            '<b>Thread dump</b> shows many threads in the same <code>WAITING</code> or <code>BLOCKED</code> frame, which names the bottleneck.'],
        ['<b>OS limits</b>: check <code>ulimit -u</code>, <code>/proc/sys/kernel/threads-max</code> and container pid limits; each thread also uses <code>-Xss</code> of native memory.',
            '<b>Virtual threads</b> (Java 21) are cheap and block without holding an OS thread, so use <code>Executors.newVirtualThreadPerTaskExecutor()</code> for blocking I/O.',
            '<b>Protect dependencies</b> with timeouts, bulkheads and bounded queues, and limit concurrency with a <code>Semaphore</code> when a downstream cannot take more.'],
        [['F', 'What is a thread pool?', 'A set of reusable worker threads that run submitted tasks, avoiding the cost of creating a thread per task.'],
            ['F', 'What error shows the JVM cannot start more threads?', 'java.lang.OutOfMemoryError: unable to create native thread.'],
            ['M', 'Why avoid an unbounded queue in a fixed pool?', 'Tasks pile up in memory and latency grows without limit, hiding the overload.'],
            ['M', 'How do you count threads of a process?', 'ls /proc/PID/task | wc -l, or jcmd PID Thread.print and count the entries.'],
            ['S', 'What do virtual threads change?', 'Blocking becomes cheap because the JVM unmounts the virtual thread from its carrier; you can run huge numbers of tasks.'],
            ['S', 'What is a pinning risk for virtual threads?', 'Blocking inside synchronized (before newer JDKs fix it) or in native code holds the carrier thread; use ReentrantLock instead.']],
        [['Unbounded thread creation.',
            r`for (int i = 0; ; i++) {
    new Thread(() -> {
        try { Thread.sleep(Long.MAX_VALUE); } catch (InterruptedException e) { }
    }).start();
}

// OUTPUT: (varies by OS limits)
// Exception in thread "main" java.lang.OutOfMemoryError:
//     unable to create native thread: possibly out of memory or process/resource limits reached`],
            ['Bounded pool with a rejection policy.',
                r`ExecutorService pool = new ThreadPoolExecutor(
    8, 8, 0L, TimeUnit.SECONDS,
    new ArrayBlockingQueue<>(100),
    new ThreadPoolExecutor.CallerRunsPolicy());   // slows the producer when full

// OUTPUT:
// at most 8 threads and 100 queued tasks; extra work runs in the caller thread`]],
        [['Virtual threads for blocking I/O.',
            r`try (var ex = Executors.newVirtualThreadPerTaskExecutor()) {
    for (int i = 0; i < 10_000; i++) {
        ex.submit(() -> { Thread.sleep(1000); return null; });
    }
}   // close() waits for all tasks
System.out.println("done");

// OUTPUT: (varies)
// done   (in about one second, with only a few carrier threads)`],
            ['Limit concurrency to a fragile service.',
                r`Semaphore limit = new Semaphore(20);
String call(String url) throws Exception {
    limit.acquire();
    try { return http.get(url); }
    finally { limit.release(); }
}

// OUTPUT:
// never more than 20 calls run at once, whatever the number of threads`]]
    )
};

export const jvm6Deep: Record<string, Deep> = {
    'out-of-memory-error-java': dv(
        [`<p>The JVM throws OOM from several areas, and each has its own message.</p><ul><li><b>Java heap space:</b> an allocation failed after GC could not free enough.</li><li><b>GC overhead limit exceeded:</b> the Parallel collector gives up when GC time is about 98 percent and recovery is under 2 percent.</li><li><b>Metaspace:</b> class metadata lives in native memory, limited by <code>-XX:MaxMetaspaceSize</code>.</li><li><b>Direct buffer memory:</b> <code>ByteBuffer.allocateDirect</code> exceeds <code>-XX:MaxDirectMemorySize</code>.</li><li><b>Unable to create native thread:</b> the OS refused a thread or its stack.</li></ul>`,
            r`// Quick way to see which area failed: read the text after the colon.
try {
    java.nio.ByteBuffer.allocateDirect(Integer.MAX_VALUE);
} catch (OutOfMemoryError e) {
    System.out.println(e);
}

// OUTPUT: (varies with flags)
// java.lang.OutOfMemoryError: Cannot reserve 2147483647 bytes of direct buffer memory`],
        [`<p>Useful flags and tools:</p><ul><li><b>-Xms / -Xmx:</b> initial and maximum heap; equal values avoid resize pauses.</li><li><b>-XX:+HeapDumpOnOutOfMemoryError:</b> writes an hprof file when heap OOM occurs.</li><li><b>-XX:+ExitOnOutOfMemoryError:</b> exits at the first OOM; <code>-XX:+CrashOnOutOfMemoryError</code> also writes a crash file.</li><li><b>-XX:OnOutOfMemoryError="cmd":</b> runs a command, such as sending an alert.</li><li><b>-XX:NativeMemoryTracking=summary:</b> then <code>jcmd PID VM.native_memory summary</code>.</li><li><b>-XX:MaxRAMPercentage:</b> sizes the heap from the container limit.</li></ul>`,
            r`java -XX:MaxRAMPercentage=70 \
     -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/dumps \
     -XX:+ExitOnOutOfMemoryError \
     -XX:NativeMemoryTracking=summary -jar app.jar
jcmd 4242 VM.native_memory summary

// OUTPUT: (varies)
// Total: reserved=1650MB, committed=620MB
// -  Java Heap (reserved=716MB, committed=512MB)
// -  Class (reserved=1050MB, committed=62MB)
// -  Thread (reserved=48MB, committed=48MB)`],
        [`<p>Common mistakes:</p><ul><li><b>Only raising -Xmx:</b> a leak just fails later; find the retaining path.</li><li><b>Catching OutOfMemoryError and continuing:</b> state may be corrupt; log and exit.</li><li><b>No dump path space:</b> the volume must hold a file as large as the heap.</li><li><b>Ignoring off-heap:</b> heap looks fine while the container is killed.</li><li><b>Loading whole files or result sets:</b> stream or page the data.</li></ul>`,
            r`// WRONG: reads the whole file into memory
byte[] all = java.nio.file.Files.readAllBytes(java.nio.file.Path.of("big.log"));

// RIGHT: process line by line
try (var lines = java.nio.file.Files.lines(java.nio.file.Path.of("big.log"))) {
    lines.filter(l -> l.contains("ERROR")).forEach(System.out::println);
}

// OUTPUT:
// first form: OutOfMemoryError on a multi-GB file; second form: constant memory`],
        [`<p>Tuning to prevent OOM:</p><ul><li><b>Measure live set:</b> heap after Full GC times 2 to 3 is a sensible heap size.</li><li><b>Cap pools and queues:</b> unbounded structures are the usual cause.</li><li><b>Page database reads:</b> use <code>setFetchSize</code> and keyset paging.</li><li><b>Pre-size collections</b> to avoid copy spikes during growth.</li><li><b>Leave headroom:</b> container limit above heap by 25 to 40 percent for off-heap use.</li></ul>`,
            r`List<Row> page;
long lastId = 0;
do {
    page = dao.findAfter(lastId, 500);        // WHERE id > ? ORDER BY id LIMIT 500
    page.forEach(this::process);
    if (!page.isEmpty()) lastId = page.get(page.size() - 1).id();
} while (!page.isEmpty());

// OUTPUT:
// memory stays flat regardless of table size`],
        [`<p>Incident: a service restarts every few hours in Kubernetes with exit code 137.</p><ul><li><b>Symptoms:</b> pod status <code>OOMKilled</code>, latency spikes before each restart, no Java exception in logs.</li><li><b>Diagnosis:</b> <code>kubectl describe pod</code>, then <code>jcmd PID VM.native_memory summary</code> and GC logs.</li><li><b>Root cause:</b> heap was 90 percent of the container limit; Netty direct buffers and thread stacks pushed the process past it, so the kernel killed it before Java could throw OOM.</li><li><b>Fix:</b> heap set with <code>-XX:MaxRAMPercentage=65</code>, <code>-XX:MaxDirectMemorySize=256m</code>, alerts on container working set, and <code>-XX:+ExitOnOutOfMemoryError</code> for real heap OOM.</li></ul>`,
            r`kubectl describe pod shop-7d9f | grep -A 3 "Last State"
kubectl top pod shop-7d9f
jcmd 1 VM.native_memory summary | head -20

// OUTPUT: (varies)
// Last State: Terminated
//   Reason:   OOMKilled
//   Exit Code: 137
// shop-7d9f   410m   1010Mi   (limit 1024Mi)`]
    ),
    'stack-overflow-error-java': dv(
        [`<p>Every thread has its own stack, created with a fixed size.</p><ul><li><b>Frame:</b> each call pushes a frame with locals, operand stack and a return address.</li><li><b>Limit:</b> when the next frame does not fit, the JVM throws StackOverflowError at that call.</li><li><b>Frame size:</b> methods with many locals use bigger frames, so the maximum depth varies.</li><li><b>JIT:</b> compiled code can use smaller frames or inline calls, so depth differs between runs.</li><li><b>Heap:</b> objects are not on the stack, only references.</li></ul>`,
            r`static int d;
static void f(long a, long b, long c) { d++; f(a, b, c); }
public static void main(String[] args) {
    try { f(1, 2, 3); } catch (StackOverflowError e) {
        System.out.println("depth " + d);
    }
}

// OUTPUT: (varies with -Xss, JIT state and frame size)
// depth 9800`],
        [`<p>Options and variants:</p><ul><li><b>-Xss:</b> <code>-Xss512k</code>, <code>-Xss2m</code>; applies to new Java threads.</li><li><b>Thread constructor:</b> the fourth argument sets a stack size hint for one thread.</li><li><b>-XX:ThreadStackSize:</b> same effect in KB.</li><li><b>Trace length:</b> the trace is capped by <code>-XX:MaxJavaStackTraceDepth</code> (default 1024).</li><li><b>Explicit stack:</b> <code>ArrayDeque</code> for DFS, tree walks, flood fill.</li></ul>`,
            r`static void dfs(Node root) {
    Deque<Node> stack = new ArrayDeque<>();
    stack.push(root);
    while (!stack.isEmpty()) {
        Node n = stack.pop();
        visit(n);
        for (Node c : n.children()) stack.push(c);   // no recursion, no overflow
    }
}

// OUTPUT:
// handles a tree 1,000,000 levels deep with constant stack use`],
        [`<p>Mistakes and fixes:</p><ul><li><b>Missing base case:</b> add and unit test the stop condition.</li><li><b>Base case never reached:</b> for example the argument moves away from zero.</li><li><b>Cyclic data:</b> track visited nodes in a <code>Set</code>.</li><li><b>Mutual toString/equals/hashCode:</b> exclude the back reference.</li><li><b>Catching the Error:</b> hides the bug; fix the cause.</li></ul>`,
            r`// WRONG: counts away from the base case when n is negative
static int sum(int n) { return n == 0 ? 0 : n + sum(n - 1); }

// RIGHT: guard the domain
static int sumSafe(int n) {
    if (n < 0) throw new IllegalArgumentException("n must be >= 0");
    return n == 0 ? 0 : n + sumSafe(n - 1);
}

// OUTPUT:
// sum(-1) throws StackOverflowError; sumSafe(-1) throws IllegalArgumentException`],
        [`<p>Tuning notes:</p><ul><li><b>Memory cost:</b> stack memory is reserved per thread, so 500 threads at 2 MB reserve about 1 GB virtual.</li><li><b>Shrink for many threads:</b> lower <code>-Xss</code> only if you have measured the depth you need.</li><li><b>Memoize:</b> dynamic programming turns deep recursion into loops.</li><li><b>Avoid deep recursion in request threads</b> because the web container stack is small.</li></ul>`,
            r`static long fibIter(int n) {
    long a = 0, b = 1;
    for (int i = 0; i < n; i++) { long t = a + b; a = b; b = t; }
    return a;
}
System.out.println(fibIter(50));

// OUTPUT:
// 12586269025`],
        [`<p>Incident: a JSON endpoint returns HTTP 500 for some customers only.</p><ul><li><b>Symptoms:</b> <code>StackOverflowError</code> with a repeating trace of <code>BeanSerializer</code> frames.</li><li><b>Diagnosis:</b> read the repeating lines of the trace; they list <code>Order.getCustomer</code> then <code>Customer.getOrders</code>.</li><li><b>Root cause:</b> a bidirectional JPA relation serialized directly; customers with orders loop forever.</li><li><b>Fix:</b> return a DTO, or mark the back reference with <code>@JsonIgnore</code> or use <code>@JsonManagedReference</code> and <code>@JsonBackReference</code>; add a test with a linked pair.</li></ul>`,
            r`grep -c "StackOverflowError" app.log
grep -A 6 "StackOverflowError" app.log | head -12

// OUTPUT: (varies)
// 37
// java.lang.StackOverflowError: null
//   at com.shop.Customer.getOrders(Customer.java:41)
//   at com.shop.Order.getCustomer(Order.java:30)
//   at com.fasterxml.jackson.databind.ser.BeanPropertyWriter.serializeAsField(...)`]
    ),
    'high-cpu-java': dv(
        [`<p>CPU time in a JVM is spent in a few places.</p><ul><li><b>Application threads:</b> your code and libraries.</li><li><b>GC threads:</b> marking and copying; busy when memory is tight.</li><li><b>JIT compiler threads:</b> compile hot methods; heavy at startup.</li><li><b>Safepoint and VM thread:</b> pauses for GC and deopt.</li><li><b>Runnable but blocked in native I/O:</b> shows RUNNABLE but uses little CPU, so confirm with top.</li></ul>`,
            r`// Name your threads, it makes top -H and jstack far easier to read.
ThreadFactory tf = r -> {
    Thread t = new Thread(r, "invoice-worker");
    t.setDaemon(true);
    return t;
};
ExecutorService pool = Executors.newFixedThreadPool(4, tf);

// OUTPUT:
// top -H shows threads named invoice-worker instead of Thread-17 (varies)`],
        [`<p>Diagnosis toolbox:</p><ul><li><b>top -H -p PID:</b> per-thread CPU.</li><li><b>jstack PID / jcmd PID Thread.print:</b> thread dump with <code>nid</code>.</li><li><b>jcmd PID JFR.start duration=60s filename=a.jfr:</b> Flight Recorder.</li><li><b>async-profiler:</b> <code>asprof -d 30 -e cpu -f flame.html PID</code>.</li><li><b>jstat -gcutil:</b> rules GC in or out.</li><li><b>ThreadMXBean:</b> in-process per-thread CPU time.</li></ul>`,
            r`ThreadMXBean mx = java.lang.management.ManagementFactory.getThreadMXBean();
for (long id : mx.getAllThreadIds()) {
    long cpuMs = mx.getThreadCpuTime(id) / 1_000_000;
    ThreadInfo ti = mx.getThreadInfo(id);
    if (ti != null && cpuMs > 1000)
        System.out.println(ti.getThreadName() + " cpuMs=" + cpuMs);
}

// OUTPUT: (varies)
// invoice-worker cpuMs=48210
// main cpuMs=1320`],
        [`<p>Common mistakes:</p><ul><li><b>Guessing:</b> changing code before taking a dump.</li><li><b>One dump only:</b> a single sample can be unlucky; take three.</li><li><b>Spin on a flag:</b> use a latch, a condition or a blocking queue.</li><li><b>Regex on user input:</b> avoid nested quantifiers and bound input length.</li><li><b>Unsynchronized HashMap:</b> concurrent resize can create a loop in old JDKs; use <code>ConcurrentHashMap</code>.</li><li><b>Logging in a hot loop:</b> string formatting costs CPU even when the level is off, unless you use parameters.</li></ul>`,
            r`// WRONG: builds the message even when DEBUG is off
log.debug("user " + user + " items " + items);
// RIGHT: parameterized, formatted only if enabled
log.debug("user {} items {}", user, items);

// OUTPUT:
// the second form costs almost nothing when DEBUG is disabled`],
        [`<p>Tuning approach:</p><ul><li><b>Profile first:</b> optimize the top frame in the flame graph only.</li><li><b>Algorithm:</b> a better data structure beats micro tuning.</li><li><b>Cache pure results</b> with a bounded cache.</li><li><b>Batch work</b> to reduce per-call overhead.</li><li><b>Size pools to cores</b> for CPU-bound work: about <code>availableProcessors()</code> threads.</li><li><b>Warm-up:</b> expect higher CPU for the first minutes while the JIT compiles.</li></ul>`,
            r`int cores = Runtime.getRuntime().availableProcessors();
ExecutorService cpuPool = Executors.newFixedThreadPool(cores);
System.out.println("cpu pool size " + cores);

// OUTPUT: (varies)
// cpu pool size 8`],
        [`<p>Incident: CPU of one pod sits at 800 percent after a deployment, other pods are fine.</p><ul><li><b>Symptoms:</b> p99 latency up, load average high, no errors in the log.</li><li><b>Diagnosis:</b> <code>top -H</code> shows 6 threads near 100 percent; converted ids match <code>http-nio-exec</code> threads; three dumps show the same <code>Pattern.matcher</code> frames.</li><li><b>Root cause:</b> a new validation regex with nested quantifiers hit a long malformed input from one client.</li><li><b>Fix:</b> rewrite the regex without nesting, limit input length to 256, use a timeout wrapper, and add a test with a hostile string.</li></ul>`,
            r`top -H -p 4242 -b -n 1 | head -12
printf "%x\n" 4301
jstack 4242 | grep -A 10 "nid=0x10cd"

// OUTPUT: (varies)
//   PID  USER  %CPU COMMAND
//  4301  app   99.7 java
// 10cd
// "http-nio-8080-exec-7" #48 nid=0x10cd runnable
//   at java.util.regex.Pattern$GroupTail.match(Pattern.java:4770)
//   at com.shop.Validator.isValidCode(Validator.java:19)`]
    ),
    'high-gc-java': dv(
        [`<p>How the generational collectors work in outline.</p><ul><li><b>Eden:</b> new objects are allocated here by fast pointer bumping.</li><li><b>Young GC:</b> live objects are copied to survivor spaces; dead ones cost nothing.</li><li><b>Promotion:</b> objects that survive several collections move to the old generation.</li><li><b>Old collection:</b> G1 does concurrent marking and mixed collections; a Full GC is the fallback.</li><li><b>Safepoint:</b> application threads stop while the collector works in a pause.</li></ul>`,
            r`// Read a G1 log line:
// [12.4s][info][gc] GC(31) Pause Young (Normal) (G1 Evacuation Pause) 180M->40M(256M) 6.2ms
//   180M = heap before, 40M = after, (256M) = committed heap, 6.2ms = pause

// OUTPUT: (varies)
// a healthy service shows short young pauses and an "after" value that stays flat`],
        [`<p>Flags and views:</p><ul><li><b>-Xlog:gc*:file=gc.log:time,uptime:filecount=5,filesize=20m:</b> rotating GC logs.</li><li><b>-XX:+UseG1GC / -XX:+UseZGC / -XX:+UseParallelGC:</b> choose the collector.</li><li><b>-XX:MaxGCPauseMillis:</b> G1 pause goal.</li><li><b>-XX:InitiatingHeapOccupancyPercent:</b> when G1 starts concurrent marking.</li><li><b>-XX:+AlwaysPreTouch:</b> touches heap pages at start for stable latency.</li><li><b>Tools:</b> GCeasy, GCViewer, JFR, <code>jcmd PID GC.heap_info</code>.</li></ul>`,
            r`jcmd 4242 GC.heap_info

// OUTPUT: (varies)
// garbage-first heap   total 262144K, used 198000K
//  region size 1024K, 120 young (122880K), 6 survivors (6144K)
// Metaspace   used 31200K, committed 31744K, reserved 1081344K`],
        [`<p>Mistakes and fixes:</p><ul><li><b>System.gc() calls:</b> forces a Full GC; remove or add <code>-XX:+DisableExplicitGC</code>.</li><li><b>Heap too small:</b> frequent collections; raise <code>-Xmx</code> after measuring the live set.</li><li><b>Heap too large with default pauses:</b> long Full GCs; consider ZGC.</li><li><b>Large temporary arrays:</b> humongous allocations in G1; stream data.</li><li><b>Copying tuning flags from blogs:</b> test each flag against your own GC log.</li></ul>`,
            r`// WRONG: manual GC in a request path
void handle() { work(); System.gc(); }

// RIGHT: delete the call, then watch the log
// java -Xlog:gc -jar app.jar | grep "System.gc"

// OUTPUT: (varies)
// [8.1s][info][gc] GC(12) Pause Full (System.gc()) 120M->38M(256M) 55.0ms`],
        [`<p>Tuning order:</p><ul><li><b>1. Cut allocation:</b> avoid boxing, reuse buffers, avoid needless copies.</li><li><b>2. Fix leaks:</b> a rising floor cannot be tuned away.</li><li><b>3. Size the heap:</b> about 2 to 3 times the live set.</li><li><b>4. Pick a collector</b> for the goal: throughput or latency.</li><li><b>5. Compare</b> pause p99 and GC time percentage before and after.</li></ul>`,
            r`// GC time share from the JVM itself:
for (var gc : java.lang.management.ManagementFactory.getGarbageCollectorMXBeans()) {
    System.out.println(gc.getName() + " count=" + gc.getCollectionCount()
        + " timeMs=" + gc.getCollectionTime());
}

// OUTPUT: (varies)
// G1 Young Generation count=812 timeMs=12500
// G1 Old Generation count=0 timeMs=0`],
        [`<p>Incident: an API has 5 second pauses every few minutes.</p><ul><li><b>Symptoms:</b> timeouts in bursts, CPU spikes, GC pause metric high.</li><li><b>Diagnosis:</b> GC log shows <code>Pause Full (Allocation Failure)</code> every 3 minutes; the heap after Full GC is 90 percent of 2 GB.</li><li><b>Root cause:</b> a report job loaded a million rows into a list; the live set filled the heap.</li><li><b>Fix:</b> stream rows with a fetch size, move the job off the API pod, set heap to 4 GB with a heap-usage alert, and watch the floor after Full GC.</li></ul>`,
            r`grep "Pause Full" gc.log | tail -3

// OUTPUT: (varies)
// [901.2s][info][gc] GC(44) Pause Full (G1 Compaction Pause) 1890M->1720M(2048M) 4980.1ms
// [1085.7s][info][gc] GC(45) Pause Full (G1 Compaction Pause) 1900M->1735M(2048M) 5120.4ms
// 1890M->1720M: almost nothing freed, so the live set is the problem`]
    ),
    'memory-leak-java': dv(
        [`<p>The GC frees what is unreachable from GC roots, so a leak is a reachable but useless object.</p><ul><li><b>GC roots:</b> thread stacks, static fields, JNI references and class loaders.</li><li><b>Retained size:</b> memory that would be freed if an object was removed.</li><li><b>Class loader leaks:</b> in app servers, a leftover reference keeps the whole old webapp and its Metaspace.</li><li><b>Saw-tooth shape:</b> heap use falls after each GC but the minimum rises, which is the leak signature.</li></ul>`,
            r`// A leak in four lines: the list is a GC root path through a static field.
class Registry {
    static final List<Object> ALL = new ArrayList<>();
    Registry() { ALL.add(this); }       // every instance stays reachable forever
}

// OUTPUT:
// MAT path to GC roots: Registry.ALL -> ArrayList -> Object[] -> Registry`],
        [`<p>Tools and commands:</p><ul><li><b>jcmd PID GC.class_histogram:</b> counts per class; run twice and compare.</li><li><b>jcmd PID GC.heap_dump:</b> full dump for MAT or VisualVM.</li><li><b>JFR with OldObjectSample:</b> finds leak candidates with low overhead.</li><li><b>jmap -histo:live PID:</b> forces a GC then lists live objects.</li><li><b>Weak and soft references:</b> <code>WeakReference</code> for listeners, <code>SoftReference</code> only for simple memory-sensitive caches.</li></ul>`,
            r`jcmd 4242 GC.class_histogram | head -6

// OUTPUT: (varies)
//  num   #instances    #bytes  class name
//    1:      912344  58390016  [B
//    2:      901200  28838400  java.lang.String
//    3:      455001  18200040  com.shop.SessionData
// 455001 SessionData objects while only 800 users are logged in: leak`],
        [`<p>Mistakes and fixes:</p><ul><li><b>Cache without limit or TTL:</b> use Caffeine with <code>maximumSize</code> and <code>expireAfterWrite</code>.</li><li><b>Mutable key without equals/hashCode:</b> entries pile up.</li><li><b>Inner class holding the outer:</b> a non-static inner class or lambda keeps <code>this</code> alive.</li><li><b>Not closing resources:</b> use try-with-resources.</li><li><b>Not shutting down executors:</b> idle pool threads keep class loaders alive.</li></ul>`,
            r`// Bounded cache with expiry (Caffeine)
Cache<String, Session> cache = Caffeine.newBuilder()
    .maximumSize(10_000)
    .expireAfterWrite(Duration.ofMinutes(30))
    .build();

// OUTPUT:
// memory is capped at 10,000 entries, whatever the traffic`],
        [`<p>Tuning and prevention:</p><ul><li><b>Monitor the floor:</b> alert on heap after GC trend, not on peak usage.</li><li><b>Load test long:</b> leaks need hours; run a soak test.</li><li><b>Size limits everywhere:</b> queues, caches, maps, sessions.</li><li><b>Prefer weak listeners</b> or explicit unregister in lifecycle callbacks.</li><li><b>Dump on OOM:</b> keep the flag always on.</li></ul>`,
            r`MemoryMXBean mem = java.lang.management.ManagementFactory.getMemoryMXBean();
System.gc();                      // only for diagnostics, never in production paths
System.out.println("live heap MB=" + mem.getHeapMemoryUsage().getUsed() / 1_048_576);

// OUTPUT: (varies)
// live heap MB=412`],
        [`<p>Incident: heap grows 40 MB per hour and the service dies after 2 days.</p><ul><li><b>Symptoms:</b> old generation floor rises on every Full GC; OOM at the weekend.</li><li><b>Diagnosis:</b> two class histograms 1 hour apart show <code>com.shop.AuditEvent</code> growing; MAT path to roots ends at a static <code>List</code> in <code>AuditBuffer</code>.</li><li><b>Root cause:</b> the flusher thread died after a network error and the buffer was never drained.</li><li><b>Fix:</b> use a bounded queue, restart the flusher on error, drop or spill oldest events when full, and alert on queue size.</li></ul>`,
            r`jcmd 4242 GC.class_histogram | grep AuditEvent
sleep 3600
jcmd 4242 GC.class_histogram | grep AuditEvent

// OUTPUT: (varies)
//    8:   120344   5776512  com.shop.AuditEvent
//    5:   891002  42768096  com.shop.AuditEvent
// instance count grew about 7x in one hour`]
    ),
    'thread-exhaustion-java': dv(
        [`<p>Why threads run out.</p><ul><li><b>Platform thread:</b> a thin wrapper over an OS thread with its own stack (about 1 MB reserved).</li><li><b>Pool saturation:</b> all workers are busy, new tasks wait in the queue or are rejected.</li><li><b>Blocking:</b> threads waiting on slow I/O are not doing useful work but still occupy the pool.</li><li><b>Virtual thread:</b> a JVM-managed thread that mounts on a carrier, and unmounts when it blocks.</li><li><b>Little's law:</b> needed threads = request rate times average latency.</li></ul>`,
            r`// 200 requests per second at 2 seconds latency need about 400 threads.
double rate = 200, latencySec = 2.0;
System.out.println("threads needed = " + (int) (rate * latencySec));

// OUTPUT:
// threads needed = 400`],
        [`<p>Variants and options:</p><ul><li><b>Fixed pool:</b> <code>newFixedThreadPool(n)</code> with an unbounded queue; safe thread count, unsafe queue.</li><li><b>Cached pool:</b> unbounded threads; risky under load.</li><li><b>ThreadPoolExecutor:</b> core, max, bounded queue and a rejection policy (<code>AbortPolicy</code>, <code>CallerRunsPolicy</code>).</li><li><b>Virtual threads:</b> <code>Thread.ofVirtual().start(r)</code> or the per-task executor.</li><li><b>Tomcat:</b> <code>server.tomcat.threads.max</code>.</li><li><b>Stack size:</b> <code>-Xss</code>.</li></ul>`,
            r`Thread v = Thread.ofVirtual().name("job-1").start(() ->
    System.out.println("virtual=" + Thread.currentThread().isVirtual()));
v.join();

// OUTPUT:
// virtual=true`],
        [`<p>Common mistakes:</p><ul><li><b>Pool per request:</b> creating an executor in each call leaks threads; share one and shut it down.</li><li><b>Forgetting shutdown:</b> non-daemon workers keep the JVM alive.</li><li><b>Waiting for a task in the same pool</b> (nested submit and get) causes deadlock.</li><li><b>No timeouts:</b> a hung dependency holds threads forever.</li><li><b>Huge ThreadLocals with virtual threads:</b> millions of copies; prefer scoped values or pass parameters.</li></ul>`,
            r`// WRONG: pool created on every call, never shut down
String handle() throws Exception {
    return Executors.newFixedThreadPool(4).submit(() -> "x").get();
}
// RIGHT: one shared pool
private static final ExecutorService POOL = Executors.newFixedThreadPool(4);

// OUTPUT:
// the wrong version adds 4 idle threads per call until native thread creation fails`],
        [`<p>Tuning:</p><ul><li><b>CPU-bound:</b> pool near the core count.</li><li><b>I/O-bound:</b> more threads, or virtual threads, sized by the downstream limit.</li><li><b>Bulkheads:</b> separate pools per dependency so one slow service cannot take all threads.</li><li><b>Timeouts everywhere:</b> connect, read and queue wait.</li><li><b>Lower -Xss</b> only after measuring depth.</li><li><b>Monitor:</b> active threads, queue size and rejection count.</li></ul>`,
            r`ThreadPoolExecutor ex = (ThreadPoolExecutor) pool;
System.out.println("active=" + ex.getActiveCount()
    + " queue=" + ex.getQueue().size()
    + " completed=" + ex.getCompletedTaskCount());

// OUTPUT: (varies)
// active=8 queue=100 completed=15230`],
        [`<p>Incident: the checkout API stops answering although CPU is near zero.</p><ul><li><b>Symptoms:</b> requests time out, load balancer marks pods unhealthy, CPU 3 percent.</li><li><b>Diagnosis:</b> <code>jstack</code> shows all 200 <code>http-nio-exec</code> threads in <code>SocketInputStream.socketRead0</code> inside the payment client; <code>ls /proc/PID/task | wc -l</code> shows 260 threads.</li><li><b>Root cause:</b> the payment provider became slow and the HTTP client had no read timeout, so every Tomcat thread waited.</li><li><b>Fix:</b> 2 second read timeout, a separate bounded pool with a circuit breaker for payments, return a clear error when full; consider virtual threads for the blocking calls.</li></ul>`,
            r`jstack 4242 | grep -c "socketRead0"
ls /proc/4242/task | wc -l

// OUTPUT: (varies)
// 200
// 260
// all request threads wait on one remote call, so the pool is exhausted`]
    )
};
