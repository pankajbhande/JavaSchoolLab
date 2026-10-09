// JVM course extras, part 3: variable memory and garbage collectors (keyed by topic id).
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const jvm3Extras: Record<string, Extra> = {
    'static-variables-memory': x(
        ['<b>One copy</b>: a <code>static</code> field belongs to the class, so every object shares the same single value.',
            '<b>Where it lives</b>: the value is stored with the class data in the JVM (in the <code>Class</code> object on the heap since Java 8), not inside each instance.',
            '<b>Access</b>: use <code>ClassName.field</code>; it works without creating any object.'],
        ['<b>Initialization</b>: statics are set once, when the class is first initialized, by field initializers and <code>static {}</code> blocks in order.',
            '<b>GC roots</b>: a static reference keeps its object alive as long as the class is loaded, so large static collections can leak memory.',
            '<b>Thread visibility</b>: a mutable static is shared by all threads, so guard it with <code>volatile</code>, locks or atomics.'],
        ['<b>Class unloading</b>: statics are freed only when the class loader that loaded the class is collected, which is why redeploys in app servers leak.',
            '<b>Design</b>: avoid mutable global state; prefer dependency injection and immutable <code>static final</code> constants.',
            '<b>Lazy holder</b>: use a nested holder class for thread-safe lazy singletons, since class initialization is guaranteed once by the JVM.'],
        [['F', 'What is a static variable?', 'A field declared with static that is shared by all objects of the class and exists once per class.'],
            ['F', 'Can you access a static variable without an object?', 'Yes, with ClassName.variableName.'],
            ['M', 'When is a static variable initialized?', 'When the class is initialized, which happens on first use such as creating an instance or accessing a static member.'],
            ['M', 'Why can a static List cause a memory leak?', 'It is reachable from the loaded class, so the elements are never collected while the class stays loaded.'],
            ['S', 'Where are static variables stored in Java 8 and later?', 'Primitive values and references live in the Class mirror object on the heap; metadata is in Metaspace.'],
            ['S', 'How can statics leak in an application server?', 'A static in a library holds objects of a webapp class loader, so the loader cannot be unloaded after redeploy.']],
        [['Shared counter.',
            r`class Counter {
    static int created = 0;
    Counter() { created++; }
}
new Counter(); new Counter(); new Counter();
System.out.println(Counter.created);

// OUTPUT:
// 3`],
            ['Static init order.',
                r`class Boot {
    static int a = init("a");
    static { System.out.println("static block"); }
    static int b = init("b");
    static int init(String n) { System.out.println("init " + n); return 1; }
}
new Boot();

// OUTPUT:
// init a
// static block
// init b`]],
        [['Static cache leak.',
            r`class Cache {
    static final Map<String, byte[]> DATA = new HashMap<>();
}
for (int i = 0; i < 3; i++) Cache.DATA.put("k" + i, new byte[1_000_000]);
System.out.println(Cache.DATA.size() + " entries stay reachable");

// OUTPUT:
// 3 entries stay reachable`],
            ['Lazy holder singleton.',
                r`class Service {
    private Service() {}
    private static class Holder { static final Service I = new Service(); }
    static Service get() { return Holder.I; }
}
System.out.println(Service.get() == Service.get());

// OUTPUT:
// true`]]
    ),
    'instance-variables-memory': x(
        ['<b>Per object</b>: each object has its own copy of every instance variable, stored inside the object on the heap.',
            '<b>Default values</b>: fields get <code>0</code>, <code>false</code> or <code>null</code> automatically; local variables get none.',
            '<b>Lifetime</b>: the fields live as long as the object is reachable, then the garbage collector reclaims them.'],
        ['<b>Object layout</b>: a header (mark word and class pointer, usually 12 bytes with compressed class pointers) is followed by the fields, padded to 8 bytes.',
            '<b>References</b>: an instance field of object type stores only a reference (4 bytes with compressed oops), not the other object.',
            '<b>Stack versus heap</b>: the reference variable sits on the stack, while the object and its fields are on the heap.'],
        ['<b>Field reordering</b>: the JVM groups fields by size to cut padding, so declaration order does not decide the layout.',
            '<b>False sharing</b>: hot fields of different threads on the same cache line slow each other; <code>@Contended</code> pads them.',
            '<b>Footprint</b>: millions of small objects cost header overhead; use primitives, arrays or records of primitives, and measure with JOL.'],
        [['F', 'What is an instance variable?', 'A non-static field declared in a class; every object gets its own copy.'],
            ['F', 'Where are instance variables stored?', 'Inside the object on the heap.'],
            ['M', 'Do instance variables have default values?', 'Yes: 0 for numbers, false for boolean and null for references. Local variables do not.'],
            ['M', 'Difference between instance and static variable memory?', 'Instance fields exist once per object; a static field exists once per class.'],
            ['S', 'How big is an object with one int field on a 64-bit JVM?', 'Usually 16 bytes: 12 byte header, 4 byte int, with compressed class pointers (varies by flags).'],
            ['S', 'How do you inspect object layout?', 'Use the JOL library with ClassLayout.parseClass(X.class).toPrintable().']],
        [['Separate copies.',
            r`class Dog { String name; Dog(String n) { name = n; } }
Dog a = new Dog("Rex");
Dog b = new Dog("Max");
a.name = "Rocky";
System.out.println(a.name + " " + b.name);

// OUTPUT:
// Rocky Max`],
            ['Defaults.',
                r`class Box { int n; boolean ok; String s; double d; }
Box b = new Box();
System.out.println(b.n + " " + b.ok + " " + b.s + " " + b.d);

// OUTPUT:
// 0 false null 0.0`]],
        [['Shared reference.',
            r`class Person { String name; Person(String n) { name = n; } }
Person p1 = new Person("Ann");
Person p2 = p1;
p2.name = "Bob";
System.out.println(p1.name);

// OUTPUT:
// Bob`],
            ['Local needs init.',
                r`class T {
    int field;
    void run() {
        int local;
        // System.out.println(local);   // compile error: might not be initialized
        System.out.println(field);
    }
}
new T().run();

// OUTPUT:
// 0`]]
    ),
    'gc-fundamentals': x(
        ['<b>Automatic memory</b>: the garbage collector frees objects that no live code can reach, so you never call <code>free</code>.',
            '<b>Reachability</b>: an object is garbage when no chain of references leads to it from a GC root.',
            '<b>Not guaranteed</b>: <code>System.gc()</code> is only a hint, and you cannot decide when collection happens.'],
        ['<b>GC roots</b>: thread stacks, static fields, JNI references and active threads are the starting points of the reachability walk.',
            '<b>Mark, sweep, compact</b>: mark live objects, free the rest, and optionally move survivors together to remove fragmentation.',
            '<b>Stop-the-world</b>: during some phases all application threads pause; collectors differ in how long and how often.'],
        ['<b>Trade-offs</b>: throughput, latency and footprint cannot all be optimal; choose the collector by the goal.',
            '<b>Collectors</b>: Serial, Parallel (throughput), G1 (default since Java 9), ZGC and Shenandoah (low pause).',
            '<b>Observe first</b>: read GC logs with <code>-Xlog:gc*</code> before changing any flag.'],
        [['F', 'What does the garbage collector do?', 'It finds objects that are no longer reachable and reclaims their memory.'],
            ['F', 'Can you force garbage collection?', 'No. System.gc() is a request that the JVM may ignore.'],
            ['M', 'What are GC roots?', 'Local variables on thread stacks, static fields, JNI handles and similar references from which reachability is traced.'],
            ['M', 'Can Java leak memory?', 'Yes: objects that stay reachable but are never used again, such as entries in a static map.'],
            ['S', 'Why do collectors move objects?', 'Compaction removes fragmentation and makes allocation fast with a simple pointer bump.'],
            ['S', 'Throughput versus latency?', 'Throughput is the share of time spent on real work; latency is the pause length. Parallel favors the first, ZGC the second.']],
        [['Eligible for GC.',
            r`Object o = new Object();
o = null;              // the object is now unreachable
System.gc();           // only a hint
System.out.println("done");

// OUTPUT:
// done`],
            ['Watch GC run.',
                r`// java -Xlog:gc -Xmx64m Alloc
for (int i = 0; i < 2_000; i++) { byte[] b = new byte[100_000]; }

// OUTPUT: (varies)
// [0.101s][info][gc] GC(0) Pause Young (Normal) (G1 Evacuation Pause) 25M->1M(64M) 3.2ms`]],
        [['WeakReference.',
            r`WeakReference<byte[]> w = new WeakReference<>(new byte[1000]);
System.gc();
System.out.println(w.get() == null);

// OUTPUT: (varies)
// true`],
            ['Unintended retention.',
                r`class Registry {
    static final List<Object> ALL = new ArrayList<>();
}
void handle() { Registry.ALL.add(new byte[1_000_000]); }  // never removed: leak

// OUTPUT:
// heap grows on every call until OutOfMemoryError`]]
    ),
    'generational-gc': x(
        ['<b>Weak generational hypothesis</b>: most objects die young, so collecting a small young area often is cheap.',
            '<b>Two areas</b>: the young generation (Eden plus two survivor spaces) and the old generation.',
            '<b>Promotion</b>: an object that survives several young collections moves to the old generation.'],
        ['<b>Minor GC</b> cleans only the young generation and is fast; <b>major or full GC</b> involves the old generation and costs more.',
            '<b>Age threshold</b>: objects get an age per survived collection; <code>-XX:MaxTenuringThreshold</code> caps it (15 maximum).',
            '<b>Card table</b>: tracks old-to-young references so a minor GC does not scan the whole old generation.'],
        ['<b>Sizing</b>: <code>-XX:NewRatio</code> and <code>-Xmn</code> set the young size; too small means premature promotion.',
            '<b>Premature promotion</b>: short-lived objects reaching old space fill it and trigger full GCs.',
            '<b>Newer collectors</b>: ZGC became generational in JDK 21 with <code>-XX:+ZGenerational</code>; G1 and Parallel were always generational.'],
        [['F', 'What is the young generation?', 'The heap area where new objects are allocated; it holds Eden and survivor spaces.'],
            ['F', 'Why split the heap into generations?', 'Because most objects die young, so frequent cheap young collections reclaim most garbage.'],
            ['M', 'What is a minor GC?', 'A collection of only the young generation, usually short.'],
            ['M', 'When is an object promoted?', 'After it survives enough young collections or when survivor space is too full.'],
            ['S', 'What is the card table for?', 'It records old objects that point to young ones, so minor GCs scan only those cards.'],
            ['S', 'How do you diagnose premature promotion?', 'In GC logs, see old generation growing quickly after young collections and many full GCs; enlarge young or reduce allocation.']],
        [['Allocation and survival.',
            r`// java -Xlog:gc*:file=gc.log -Xmx128m Demo
List<byte[]> keep = new ArrayList<>();
for (int i = 0; i < 500; i++) {
    byte[] tmp = new byte[50_000];     // dies young
    if (i % 100 == 0) keep.add(tmp);   // survives, may be promoted
}

// OUTPUT: (varies)
// [0.120s][info][gc] GC(0) Pause Young (Normal) (G1 Evacuation Pause) 24M->2M(128M) 2.1ms`],
            ['Set young size.',
                r`// java -Xms256m -Xmx256m -Xmn96m -XX:MaxTenuringThreshold=6 -Xlog:gc App

// OUTPUT: (varies)
// [0.210s][info][gc] GC(1) Pause Young (Normal) (G1 Evacuation Pause) 90M->8M(256M) 4.0ms`]],
        [['Premature promotion.',
            r`// a request creates 5 MB of temporary data, young space is only 4 MB
byte[] big = new byte[5_000_000];   // goes straight to old (or humongous in G1)

// OUTPUT:
// [gc] Pause Young ... 3M->3M(...)   old generation grows each request`],
            ['Print ages.',
                r`// java -Xlog:gc+age=trace App

// OUTPUT: (varies)
// [gc,age] GC(2) Desired survivor size 6291456 bytes, new threshold 7 (max 15)
// [gc,age] GC(2) - age   1:    1048576 bytes,    1048576 total`]]
    ),
    'g1-collector': x(
        ['<b>Default collector</b>: G1 (Garbage-First) has been the default on server-class machines since Java 9.',
            '<b>Regions</b>: the heap is split into many equal regions, each acting as Eden, Survivor, Old or Humongous.',
            '<b>Pause goal</b>: set a target with <code>-XX:MaxGCPauseMillis</code> (default 200 ms).'],
        ['<b>Garbage first</b>: G1 evacuates the regions with the most garbage first, to get the most space for the least pause.',
            '<b>Concurrent marking</b>: it marks old regions while the app runs, then runs mixed collections that include old regions.',
            '<b>Humongous objects</b>: objects of half a region or more get their own regions and can cause fragmentation.'],
        ['<b>Tuning</b>: keep it simple, set <code>-Xmx</code> and a realistic pause goal; avoid fixing young size, which disables adaptation.',
            '<b>IHOP</b>: <code>-XX:InitiatingHeapOccupancyPercent</code> decides when concurrent marking starts.',
            '<b>Failure signs</b>: "To-space exhausted" or Full GC in logs means G1 could not keep up; give it more headroom.'],
        [['F', 'What is G1?', 'The Garbage-First collector, a region-based collector that is the default since Java 9.'],
            ['F', 'How do you select G1?', 'It is the default; explicitly use -XX:+UseG1GC.'],
            ['M', 'What does MaxGCPauseMillis do?', 'It is a soft goal; G1 sizes the collection set to try to stay under it.'],
            ['M', 'What is a humongous object?', 'An object at least half a region size, allocated in contiguous special regions.'],
            ['S', 'What is a mixed collection?', 'A pause that evacuates young regions plus some old regions chosen after concurrent marking.'],
            ['S', 'What does To-space exhausted mean?', 'G1 ran out of free regions while evacuating; it falls back to a slow full GC.']],
        [['Enable and log.',
            r`// java -XX:+UseG1GC -Xmx2g -XX:MaxGCPauseMillis=100 -Xlog:gc App

// OUTPUT: (varies)
// [1.210s][info][gc] Using G1
// [3.402s][info][gc] GC(5) Pause Young (Normal) (G1 Evacuation Pause) 600M->120M(2048M) 38.7ms`],
            ['Region size.',
                r`// java -XX:G1HeapRegionSize=8m -Xmx4g -Xlog:gc+heap=debug App

// OUTPUT: (varies)
// [gc,heap] Heap Region Size: 8M`]],
        [['Humongous allocation.',
            r`// region size 4 MB: a 3 MB array is humongous (needs >= 2 MB)
byte[] big = new byte[3 * 1024 * 1024];

// OUTPUT: (varies)
// [gc] GC(9) Pause Young (G1 Humongous Allocation) 700M->650M(1024M) 12.4ms`],
            ['Full GC symptom.',
                r`// java -Xmx512m -Xlog:gc App   (allocation rate too high)

// OUTPUT: (varies)
// [gc] GC(30) Pause Young (Concurrent Start) (G1 Humongous Allocation) 480M->470M(512M)
// [gc] GC(31) Pause Full (G1 Compaction Pause) 500M->300M(512M) 820.5ms`]]
    ),
    'zgc-collector': x(
        ['<b>Low latency</b>: ZGC keeps pauses very short (typically under a millisecond in modern JDKs), almost independent of heap size.',
            '<b>Concurrent</b>: marking, relocation and reference processing run while application threads keep working.',
            '<b>Enable</b>: <code>-XX:+UseZGC</code>; since JDK 21 add <code>-XX:+ZGenerational</code> for the generational mode.'],
        ['<b>Colored pointers and load barriers</b>: metadata in pointer bits and a check on each reference load let ZGC move objects concurrently.',
            '<b>Heap range</b>: it scales from small heaps to multi-terabyte heaps (up to 16 TB).',
            '<b>Cost</b>: it uses more CPU and some extra memory than G1, so throughput can be a little lower.'],
        ['<b>Generational ZGC</b>: JDK 21 adds young and old generations, cutting allocation stalls and memory overhead; it became the default ZGC mode in JDK 23.',
            '<b>Allocation stall</b>: if the app allocates faster than ZGC reclaims, threads wait; add heap or concurrent threads.',
            '<b>Alternatives</b>: Shenandoah is another low-pause collector (OpenJDK builds); Parallel suits batch throughput.'],
        [['F', 'What is ZGC for?', 'A low-latency collector with very short pauses on large heaps.'],
            ['F', 'How do you turn on ZGC?', 'Use -XX:+UseZGC.'],
            ['M', 'How does ZGC keep pauses short?', 'It does marking and object relocation concurrently, using colored pointers and load barriers.'],
            ['M', 'Is ZGC always better than G1?', 'No. It trades some CPU and throughput for latency; G1 is a fine default for most apps.'],
            ['S', 'What does -XX:+ZGenerational do in JDK 21?', 'It selects generational ZGC, which collects young objects separately and uses less memory and CPU.'],
            ['S', 'What is an allocation stall?', 'A thread blocks because no free memory is available while ZGC is still reclaiming; give more heap headroom.']],
        [['Run with ZGC.',
            r`// java -XX:+UseZGC -XX:+ZGenerational -Xmx8g -Xlog:gc App   (JDK 21)

// OUTPUT: (varies)
// [0.015s][info][gc] Using The Z Garbage Collector
// [4.210s][info][gc] GC(3) Minor Collection (Allocation Rate) 2048M->310M 0.012ms`],
            ['Check collector.',
                r`for (GarbageCollectorMXBean b : ManagementFactory.getGarbageCollectorMXBeans())
    System.out.println(b.getName());

// OUTPUT: (varies, JDK 21 with generational ZGC)
// ZGC Minor Cycles
// ZGC Minor Pauses
// ZGC Major Cycles
// ZGC Major Pauses`]],
        [['Allocation stall log.',
            r`// java -XX:+UseZGC -Xmx512m -Xlog:gc App

// OUTPUT: (varies)
// [gc] Allocation Stall (main) 14.200ms`],
            ['Concurrent workers.',
                r`// java -XX:+UseZGC -XX:ConcGCThreads=4 -Xmx16g -Xlog:gc*:file=z.log App

// OUTPUT:
// z.log written with Pause Mark Start, Concurrent Mark and Concurrent Relocate lines`]]
    )
};

export const jvm3Deep: Record<string, Deep> = {
    'static-variables-memory': dv(
        [`<p>A static field is part of the class, not of any instance.</p><ul><li><b>Linking:</b> fields are allocated during preparation with default values.</li><li><b>Initialization:</b> the class initializer <code>&lt;clinit&gt;</code> runs the initializers and static blocks once, in textual order.</li><li><b>Location:</b> since Java 8 the values sit in the <code>Class</code> mirror on the heap; class metadata is in Metaspace.</li><li><b>Reachability:</b> the loaded class is a GC root path, so static references keep objects alive.</li><li><b>Safety:</b> the JVM locks class initialization, so it happens once even with many threads.</li></ul>`,
            r`class Config {
    static final String NAME = "app";            // compile-time constant, inlined
    static final List<String> ITEMS = new ArrayList<>();
    static { ITEMS.add("a"); System.out.println("Config initialized"); }
}
System.out.println(Config.NAME);                  // does not trigger init
System.out.println(Config.ITEMS);                 // triggers init

// OUTPUT:
// app
// Config initialized
// [a]`],
        [`<p>Static variants:</p><ul><li><b>static:</b> one value per class.</li><li><b>static final:</b> a constant; a primitive or String literal is inlined by the compiler.</li><li><b>static volatile:</b> a flag visible to all threads.</li><li><b>static block:</b> complex one-time setup.</li><li><b>Nested holder:</b> lazy initialization.</li><li><b>enum:</b> a safe singleton.</li></ul>`,
            r`class Flags {
    static volatile boolean running = true;
    static final AtomicInteger HITS = new AtomicInteger();
}
enum Registry { INSTANCE; final Map<String, Integer> map = new ConcurrentHashMap<>(); }
Flags.HITS.incrementAndGet();
Registry.INSTANCE.map.put("x", 1);
System.out.println(Flags.HITS + " " + Registry.INSTANCE.map);

// OUTPUT:
// 1 {x=1}`],
        [`<p>Common mistakes:</p><ul><li><b>Static for instance data:</b> all objects overwrite one value; make the field non-static.</li><li><b>Unsynchronized mutable static:</b> data races; use atomics or locks.</li><li><b>Unbounded static cache:</b> memory leak; use a bounded cache with eviction.</li><li><b>Static initialization order cycles:</b> a class sees a default value of another; avoid circular statics.</li><li><b>Static holding a Context or request:</b> blocks class loader unload.</li></ul>`,
            r`class User { static String name; }       // BUG: shared by every user
User.name = "Ann";
User.name = "Bob";
System.out.println(User.name);
class Fixed { String name; }                 // FIX: one value per object

// OUTPUT:
// Bob`],
        [`<p>Tuning and sizing:</p><ul><li><b>Bound caches:</b> a size limit or <code>WeakHashMap</code> or soft references.</li><li><b>Prefer constants:</b> immutable statics add no GC cost.</li><li><b>Heap dumps:</b> look for GC Roots of type "class" to find static retention.</li><li><b>Static init cost:</b> heavy work delays first use; consider lazy holders.</li></ul>`,
            r`// jcmd <pid> GC.heap_dump leak.hprof
// open in Eclipse MAT: Leak Suspects, path to GC roots, exclude weak references

// OUTPUT: (varies)
// One instance of "Cache" loaded by "app" occupies 410 MB (82%) of the heap`],
        [`<p>Scenario: after each redeploy of a web app on Tomcat, Metaspace grows until <code>OutOfMemoryError: Metaspace</code>.</p><ul><li>A shared library keeps a static reference to a webapp class.</li><li>The old class loader cannot be collected, so all its classes stay.</li><li>Fix by clearing the static in a shutdown hook or listener, and upgrading the library.</li></ul>`,
            r`@WebListener
public class Cleanup implements ServletContextListener {
    @Override public void contextDestroyed(ServletContextEvent e) {
        SharedLib.clear();         // drop static references to webapp classes
    }
}

// OUTPUT:
// after redeploy the old class loader becomes collectable; Metaspace stays flat`]
    ),
    'instance-variables-memory': dv(
        [`<p>Each object is a block on the heap: header plus fields.</p><ul><li><b>Header:</b> mark word (8 bytes) and class pointer (4 bytes compressed).</li><li><b>Fields:</b> primitives stored inline; object fields store a reference.</li><li><b>Alignment:</b> total size rounds up to a multiple of 8 bytes.</li><li><b>Allocation:</b> fast pointer bump in a thread-local buffer (TLAB).</li><li><b>Escape analysis:</b> the JIT may avoid heap allocation of objects that do not escape.</li></ul>`,
            r`// with JOL: System.out.println(ClassLayout.parseClass(P.class).toPrintable());
class P { int id; long score; boolean ok; }

// OUTPUT: (varies by JVM flags)
// P object internals:
// OFF  SZ      TYPE DESCRIPTION
//   0   8           (object header: mark)
//   8   4           (object header: class)
//  12   4       int P.id
//  16   8      long P.score
//  24   1   boolean P.ok
//  25   7           (object alignment gap)
// Instance size: 32 bytes`],
        [`<p>Field options:</p><ul><li><b>Modifiers:</b> <code>private</code>, <code>final</code>, <code>volatile</code>, <code>transient</code>.</li><li><b>Initializers:</b> inline, in an instance initializer block, or in the constructor.</li><li><b>final fields:</b> safely published after construction.</li><li><b>Records:</b> declare components that become private final fields.</li><li><b>Inheritance:</b> a subclass object contains the superclass fields too.</li></ul>`,
            r`class Base { int a = 1; }
class Child extends Base {
    final int b;
    { System.out.println("init block"); }
    Child() { b = 2; }
}
record Point(int x, int y) {}
Child c = new Child();
System.out.println(c.a + c.b + " " + new Point(3, 4));

// OUTPUT:
// init block
// 3 Point[x=3, y=4]`],
        [`<p>Common mistakes:</p><ul><li><b>Public mutable fields:</b> break encapsulation; use private and accessors.</li><li><b>Uninitialized reference:</b> null causes <code>NullPointerException</code>.</li><li><b>Shared mutable field across threads:</b> needs synchronization.</li><li><b>Calling an overridable method in a constructor:</b> sees defaults of the subclass fields.</li><li><b>Wrong equals on == :</b> compare objects with <code>equals</code>.</li></ul>`,
            r`class Parent { Parent() { hello(); } void hello() {} }
class Kid extends Parent {
    String msg = "hi";
    @Override void hello() { System.out.println(msg); }   // msg is still null
}
new Kid();

// OUTPUT:
// null`],
        [`<p>Footprint tips:</p><ul><li><b>Primitives over wrappers:</b> an <code>Integer</code> costs about 16 bytes versus 4.</li><li><b>Smaller types:</b> do not use <code>long</code> where <code>int</code> is enough.</li><li><b>Lazy fields:</b> allocate rarely used objects on demand.</li><li><b>Compressed oops:</b> heaps under about 32 GB keep 4-byte references.</li><li><b>Measure:</b> use JOL or a heap dump histogram.</li></ul>`,
            r`// jcmd <pid> GC.class_histogram | head

// OUTPUT: (varies)
//  num   #instances       #bytes  class name
//    1:     2000000     48000000  java.lang.Integer
//    2:      500000     24000000  [B`],
        [`<p>Scenario: a service keeps 5 million <code>Tick</code> objects with a price and time. Memory is large because of headers and boxed values.</p><ul><li>Each object costs header plus fields plus padding.</li><li>Store prices in a <code>double[]</code> and times in a <code>long[]</code> instead.</li><li>Heap use drops and GC has less to scan.</li></ul>`,
            r`final class Ticks {
    final long[] time = new long[5_000_000];
    final double[] price = new double[5_000_000];
}
Ticks t = new Ticks();
t.time[0] = 1L; t.price[0] = 99.5;
System.out.println(t.price[0]);

// OUTPUT:
// 99.5`]
    ),
    'gc-fundamentals': dv(
        [`<p>Tracing collectors find live objects, then free everything else.</p><ul><li><b>Mark:</b> walk references from GC roots and flag live objects.</li><li><b>Sweep:</b> reclaim unmarked memory.</li><li><b>Compact or copy:</b> move live objects together to avoid fragmentation.</li><li><b>Safepoints:</b> threads stop at safe points for the stop-the-world phases.</li><li><b>Barriers:</b> concurrent collectors use read or write barriers to track changes during marking.</li></ul>`,
            r`// java -Xlog:gc*:stdout -Xmx64m Demo

// OUTPUT: (varies)
// [0.020s][info][gc,start] GC(0) Pause Young (Normal) (G1 Evacuation Pause)
// [0.023s][info][gc,heap ] GC(0) Eden regions: 12->0(11)
// [0.023s][info][gc      ] GC(0) Pause Young (Normal) (G1 Evacuation Pause) 14M->2M(64M) 3.1ms`],
        [`<p>Collectors in JDK 17 and 21:</p><ul><li><b>Serial:</b> <code>-XX:+UseSerialGC</code>, single thread, tiny heaps.</li><li><b>Parallel:</b> <code>-XX:+UseParallelGC</code>, best throughput for batch jobs.</li><li><b>G1:</b> <code>-XX:+UseG1GC</code>, balanced default.</li><li><b>ZGC:</b> <code>-XX:+UseZGC</code>, low latency.</li><li><b>Shenandoah:</b> <code>-XX:+UseShenandoahGC</code>, low pause, in OpenJDK builds that include it.</li><li><b>Epsilon:</b> <code>-XX:+UseEpsilonGC</code>, no collection, for tests.</li></ul>`,
            r`// java -XX:+UseParallelGC -Xlog:gc App
// java -XX:+UseSerialGC   -Xlog:gc App

// OUTPUT: (varies)
// [0.050s][info][gc] Using Parallel
// [0.210s][info][gc] GC(0) Pause Young (Allocation Failure) 33M->4M(123M) 5.2ms`],
        [`<p>Common mistakes:</p><ul><li><b>Calling <code>System.gc()</code>:</b> triggers a full collection; disable with <code>-XX:+DisableExplicitGC</code> if libraries do it.</li><li><b>Relying on <code>finalize</code>:</b> deprecated; use try-with-resources or <code>Cleaner</code>.</li><li><b>Tuning blindly:</b> copying flags from the internet; measure first.</li><li><b>Heap too small:</b> constant GC; raise <code>-Xmx</code>.</li><li><b>Memory leak mistaken for GC problem:</b> more heap only delays the failure.</li></ul>`,
            r`class Res implements AutoCloseable {
    @Override public void close() { System.out.println("released"); }
}
try (Res res = new Res()) {
    System.out.println("using");
}

// OUTPUT:
// using
// released`],
        [`<p>Tuning workflow:</p><ul><li><b>Goal first:</b> latency, throughput or footprint.</li><li><b>Log:</b> <code>-Xlog:gc*:file=gc.log</code>.</li><li><b>Reduce allocation:</b> the cheapest GC is the one that does not run.</li><li><b>Set -Xms equal -Xmx</b> for stable servers to avoid resize pauses.</li><li><b>Analyze</b> with GCViewer or GCeasy.</li></ul>`,
            r`// java -Xms2g -Xmx2g -Xlog:gc*:file=gc.log:time,uptime App

// OUTPUT:
// gc.log is created; check pause times and heap after each GC`],
        [`<p>Scenario: an API shows occasional 2 second freezes.</p><ul><li>The log shows <code>Pause Full</code> events.</li><li>Heap dump finds an unbounded cache.</li><li>Bound the cache, then re-check pause times.</li></ul>`,
            r`// grep "Pause Full" gc.log

// OUTPUT: (varies)
// [812.4s][info][gc] GC(120) Pause Full (G1 Compaction Pause) 3900M->3700M(4096M) 2100.3ms
// after fix: no Pause Full lines`]
    ),
    'generational-gc': dv(
        [`<p>The heap is divided by object age.</p><ul><li><b>Eden:</b> new objects are allocated here (TLAB pointer bump).</li><li><b>Survivors S0 and S1:</b> live objects are copied between them each minor GC and age increases.</li><li><b>Old:</b> objects that reach the tenuring threshold, or do not fit in survivor space.</li><li><b>Remembered sets or card table:</b> record old-to-young pointers as extra roots.</li><li>Young collection is copying, so cost depends on live data, not on garbage.</li></ul>`,
            r`// java -XX:+UseParallelGC -Xlog:gc*:stdout App

// OUTPUT: (varies)
// [gc] GC(3) Pause Young (Allocation Failure) 80M->10M(256M) 6.4ms
// [gc,heap] PSYoungGen total 76800K, used 4096K
// [gc,heap] ParOldGen  total 175104K, used 10240K`],
        [`<p>Options:</p><ul><li><b>-Xmn:</b> fixed young size.</li><li><b>-XX:NewRatio=2:</b> old is 2 times young.</li><li><b>-XX:SurvivorRatio=8:</b> Eden is 8 times one survivor.</li><li><b>-XX:MaxTenuringThreshold:</b> promotion age limit.</li><li><b>-XX:G1NewSizePercent / G1MaxNewSizePercent:</b> young bounds for G1.</li><li><b>-XX:+ZGenerational:</b> generational ZGC in JDK 21.</li></ul>`,
            r`// java -XX:NewRatio=1 -XX:SurvivorRatio=6 -XX:MaxTenuringThreshold=10 App
// java -XX:+UseZGC -XX:+ZGenerational App

// OUTPUT: (varies)
// young generation is about half of the heap; Eden is 6/8 of the young area`],
        [`<p>Common mistakes:</p><ul><li><b>Tiny young generation:</b> objects promoted too early; enlarge it.</li><li><b>Huge young generation:</b> longer young pauses on Serial or Parallel.</li><li><b>Large temporary buffers:</b> allocated straight to old; reuse them.</li><li><b>Caches of medium-lived objects:</b> they survive many copies; consider an off-heap or bounded cache.</li></ul>`,
            r`// symptoms in the log
// OUTPUT: (varies)
// [gc] GC(40) Pause Young (Normal) 200M->190M(512M) 85.0ms   <- survivors too big
// [gc] GC(41) Pause Full 480M->400M(512M) 900.0ms`],
        [`<p>Tuning:</p><ul><li><b>Target:</b> keep live young survivors small.</li><li><b>Reduce allocation rate:</b> avoid needless temporary objects in hot paths.</li><li><b>G1:</b> do not set <code>-Xmn</code>; it adapts young size to the pause goal.</li><li><b>Watch:</b> promotion rate and old occupancy after each GC.</li></ul>`,
            r`// jstat -gcutil <pid> 1000 3

// OUTPUT: (varies)
//   S0    S1     E      O      M    YGC  FGC
//  0.00  12.5  41.2   35.0   96.1   210    0
//  0.00  12.5  78.9   35.0   96.1   210    0`],
        [`<p>Scenario: a session service promotes sessions early.</p><ul><li>Each request builds 3 MB of temporary JSON.</li><li>Young space is 20 MB so survivors overflow into old.</li><li>Raising the young size and streaming the JSON stops the full GCs.</li></ul>`,
            r`// before: -Xmx1g -Xmn20m   Pause Full every ~2 min
// after:  -Xmx1g -Xmn300m   no Pause Full

// OUTPUT: (varies)
// after the change old generation grows slowly and full GCs disappear`]
    ),
    'g1-collector': dv(
        [`<p>G1 divides the heap into 1 MB to 32 MB regions (power of two, about 2048 of them).</p><ul><li><b>Young pause:</b> evacuates Eden and Survivor regions, copying live objects.</li><li><b>Concurrent cycle:</b> snapshot-at-the-beginning marking finds live data in old regions.</li><li><b>Mixed pause:</b> adds old regions with the most reclaimable space.</li><li><b>Remembered sets</b> per region track incoming references.</li><li><b>Full GC:</b> fallback, single or parallel compaction of the heap.</li></ul>`,
            r`// java -Xlog:gc*:stdout -XX:+UseG1GC App

// OUTPUT: (varies)
// [gc] GC(7) Pause Young (Concurrent Start) (G1 Evacuation Pause) 900M->300M(2048M) 25.1ms
// [gc] GC(8) Concurrent Mark Cycle
// [gc] GC(8) Pause Remark 400M->380M(2048M) 4.2ms
// [gc] GC(9) Pause Young (Mixed) (G1 Evacuation Pause) 700M->250M(2048M) 31.0ms`],
        [`<p>Useful options:</p><ul><li><b>-XX:MaxGCPauseMillis=n:</b> soft pause goal.</li><li><b>-XX:G1HeapRegionSize:</b> region size for many humongous objects.</li><li><b>-XX:InitiatingHeapOccupancyPercent=45:</b> start of marking.</li><li><b>-XX:G1ReservePercent:</b> free space reserve (default 10).</li><li><b>-XX:ParallelGCThreads and ConcGCThreads:</b> worker counts.</li><li><b>-XX:+UseStringDeduplication:</b> shares duplicate String arrays.</li></ul>`,
            r`// java -XX:+UseG1GC -Xms4g -Xmx4g -XX:MaxGCPauseMillis=150 \
//      -XX:G1HeapRegionSize=8m -XX:InitiatingHeapOccupancyPercent=40 App

// OUTPUT: (varies)
// [gc,init] Heap Region Size: 8M
// [gc,init] Pause Target: 150ms`],
        [`<p>Common mistakes:</p><ul><li><b>Pause goal too low (like 5 ms):</b> G1 collects too little and falls behind.</li><li><b>Fixed -Xmn:</b> removes adaptive sizing.</li><li><b>Many humongous allocations:</b> raise region size or split the data.</li><li><b>Heap too tight:</b> To-space exhausted; add headroom.</li><li><b>Copying old CMS flags:</b> CMS was removed in JDK 14.</li></ul>`,
            r`// OUTPUT: (varies)
// [gc] GC(55) To-space exhausted
// [gc] GC(56) Pause Full (G1 Evacuation Pause) 1020M->600M(1024M) 1500.0ms`],
        [`<p>Tuning approach:</p><ul><li><b>Start with defaults</b> and only set heap size and pause goal.</li><li><b>Lower IHOP</b> if marking starts too late and Full GCs appear.</li><li><b>Check humongous counts</b> in logs with <code>-Xlog:gc+humongous</code>.</li><li><b>Compare</b> throughput against Parallel for batch jobs.</li></ul>`,
            r`// java -Xlog:gc+humongous=debug App

// OUTPUT: (varies)
// [gc,humongous] Humongous region reclaim: 6 regions`],
        [`<p>Scenario: a microservice with a 4 GB heap needs p99 under 300 ms.</p><ul><li>G1 with a 100 ms pause goal meets this.</li><li>Pauses of 30 to 80 ms are seen in logs.</li><li>Bulk imports of 50 MB arrays caused humongous Full GCs, so they are streamed.</li></ul>`,
            r`// java -Xms4g -Xmx4g -XX:MaxGCPauseMillis=100 -Xlog:gc:file=g1.log App

// OUTPUT: (varies)
// [gc] GC(210) Pause Young (Normal) (G1 Evacuation Pause) 2900M->700M(4096M) 46.3ms`]
    ),
    'zgc-collector': dv(
        [`<p>ZGC does almost all work concurrently.</p><ul><li><b>Colored pointers:</b> metadata bits in 64-bit references mark state.</li><li><b>Load barrier:</b> every reference read checks the color and fixes stale pointers.</li><li><b>Phases:</b> short pause mark start, concurrent mark, short pause mark end, concurrent relocate.</li><li><b>Pages:</b> small, medium and large pages are relocated to compact memory.</li><li><b>Generational (JDK 21):</b> minor cycles for young, major cycles for old.</li></ul>`,
            r`// java -XX:+UseZGC -XX:+ZGenerational -Xlog:gc*:stdout App

// OUTPUT: (varies)
// [gc,start] GC(4) Minor Collection (Allocation Rate)
// [gc,phases] GC(4) y: Pause Mark Start 0.010ms
// [gc,phases] GC(4) y: Concurrent Mark 8.200ms
// [gc,phases] GC(4) y: Pause Mark End 0.012ms
// [gc,phases] GC(4) y: Concurrent Relocate 3.100ms`],
        [`<p>Options (JDK 17 and 21):</p><ul><li><b>-XX:+UseZGC:</b> select ZGC.</li><li><b>-XX:+ZGenerational:</b> JDK 21 generational mode.</li><li><b>-Xmx:</b> leave headroom, ZGC needs free memory to relocate.</li><li><b>-XX:SoftMaxHeapSize:</b> soft target below Xmx.</li><li><b>-XX:ConcGCThreads:</b> concurrent worker count.</li><li><b>-XX:+UseLargePages:</b> may cut TLB misses.</li></ul>`,
            r`// java -XX:+UseZGC -XX:+ZGenerational -Xmx12g -XX:SoftMaxHeapSize=10g App

// OUTPUT: (varies)
// [gc,init] Version: 21 (release)
// [gc,init] Soft Max Capacity: 10240M`],
        [`<p>Common mistakes:</p><ul><li><b>Heap sized exactly to live data:</b> allocation stalls; add 20 to 30 percent.</li><li><b>Too few CPUs:</b> concurrent threads compete with the app.</li><li><b>Expecting best throughput:</b> Parallel is faster for batch jobs.</li><li><b>Assuming no pauses:</b> they are tiny but exist.</li><li><b>Using non-generational ZGC on JDK 21 for high allocation rates:</b> add <code>-XX:+ZGenerational</code>.</li></ul>`,
            r`// OUTPUT: (varies)
// [gc] Allocation Stall (http-1) 85.4ms    <- heap too small for the allocation rate`],
        [`<p>Tuning:</p><ul><li><b>Give headroom:</b> larger <code>-Xmx</code> beats more flags.</li><li><b>Watch CPU:</b> concurrent threads use cores.</li><li><b>Use generational mode</b> on JDK 21 for typical web apps.</li><li><b>Measure p99 and p999</b> latency, not just average.</li></ul>`,
            r`// jcmd <pid> VM.flags | findstr Z

// OUTPUT: (varies)
// -XX:+UseZGC -XX:+ZGenerational -XX:ConcGCThreads=3`],
        [`<p>Scenario: a trading gateway with a 64 GB heap must keep pauses under 5 ms.</p><ul><li>G1 pauses grow to 200 ms with that heap.</li><li>ZGC pauses stay near 1 ms.</li><li>The cost is about 10 percent more CPU, acceptable for the latency gain.</li></ul>`,
            r`// java -XX:+UseZGC -XX:+ZGenerational -Xms64g -Xmx64g -Xlog:gc:file=z.log App

// OUTPUT: (varies)
// [gc] GC(88) Minor Collection (Allocation Rate) 40G->6G(64G) 0.015ms pause`]
    )
};
