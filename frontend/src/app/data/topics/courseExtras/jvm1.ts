// JVM extras, part 1: class loader, runtime data areas, heap, stack, method area, metaspace.
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const jvm1Extras: Record<string, Extra> = {
    'class-loader-jvm': x(
        ['<b>Class loader</b>: the JVM component that finds a <code>.class</code> file and turns its bytes into a <code>Class</code> object, lazily, on first use.',
            '<b>Three built-in loaders</b>: bootstrap (core <code>java.base</code>), platform (other JDK modules) and application (your classpath).',
            '<b>Loading steps</b>: loading, linking (verify, prepare, resolve) and initialization (static blocks run).'],
        ['<b>Parent delegation</b>: a loader first asks its parent, so <code>java.lang.String</code> always comes from the bootstrap loader and cannot be faked.',
            '<b>Class identity</b> is the class name plus its loader, so the same bytes loaded by two loaders give two different, incompatible types.',
            '<b>Failures</b>: <code>ClassNotFoundException</code> comes from an explicit lookup like <code>Class.forName</code>; <code>NoClassDefFoundError</code> means it compiled but is missing or failed to initialize at run time.'],
        ['<b>Custom loaders</b> power plugin systems, app servers (Tomcat per-webapp loaders) and hot reload, but they can leak: a loader lives as long as any of its classes or instances.',
            '<b>Context class loader</b>: <code>Thread.currentThread().getContextClassLoader()</code> lets framework code (JDBC, ServiceLoader) see application classes.',
            '<b>Diagnosis</b>: use <code>-verbose:class</code> or <code>-Xlog:class+load</code> to see where each class came from.'],
        [['F', 'What does a class loader do?', 'It locates class bytes and defines them as Class objects inside the JVM. It does this on demand, when a class is first needed.'],
            ['F', 'Name the built-in class loaders.', 'Bootstrap, platform (called extension before Java 9) and application (system) class loader.'],
            ['M', 'What is parent delegation?', 'A loader asks its parent to load a class before trying itself. This protects core classes and avoids loading duplicates.'],
            ['M', 'ClassNotFoundException versus NoClassDefFoundError?', 'The first is a checked exception from a failed explicit lookup. The second is an Error: the class was present at compile time but not usable at run time.'],
            ['S', 'How can a class loader cause a memory leak?', 'A loader is only collected when it, all its classes and all instances are unreachable. A static reference or thread from a parent loader to one of its classes pins the whole loader, a classic redeploy leak.'],
            ['S', 'When would you break parent delegation?', 'In web containers and plugin hosts that must isolate versions of the same library per application. The loader tries its own classes first for non-core packages.']],
        [['Print the loader of a few classes.',
            r`public class WhoLoads {
    public static void main(String[] args) {
        System.out.println(String.class.getClassLoader());
        System.out.println(WhoLoads.class.getClassLoader());
        System.out.println(java.sql.Driver.class.getClassLoader());
    }
}

// OUTPUT: (varies by JDK build)
// null
// jdk.internal.loader.ClassLoaders$AppClassLoader@<hash>
// jdk.internal.loader.ClassLoaders$PlatformClassLoader@<hash>`],
            ['Walk the loader chain.',
                r`ClassLoader cl = WhoLoads.class.getClassLoader();
while (cl != null) {
    System.out.println(cl.getName());
    cl = cl.getParent();
}

// OUTPUT:
// app
// platform`]],
        [['Lazy loading and initialization.',
            r`class Lazy {
    static { System.out.println("Lazy initialized"); }
    static void hi() { System.out.println("hi"); }
}
public class LazyDemo {
    public static void main(String[] args) {
        System.out.println("start");
        Lazy.hi();            // first active use triggers load, link, init
    }
}

// OUTPUT:
// start
// Lazy initialized
// hi`],
            ['Trace class loading from the command line.',
                r`java -Xlog:class+load:file=load.log LazyDemo
type load.log | findstr Lazy

// OUTPUT: (varies)
// [0.045s][info][class,load] Lazy source: file:/C:/app/`]]
    )
    ,
    'runtime-data-areas': x(
        ['<b>Runtime data areas</b> are the memory regions the JVM manages: heap, method area (metaspace), thread stacks, PC registers and native method stacks.',
            '<b>Shared versus per-thread</b>: heap and method area are shared by all threads; stack, PC register and native stack belong to one thread each.',
            '<b>Objects live on the heap</b>; local variables and call frames live on the stack; class metadata lives in metaspace.'],
        ['<b>PC register</b> holds the address of the bytecode instruction the thread executes next.',
            '<b>Frame contents</b>: local variable array, operand stack and a reference to the run-time constant pool of the current class.',
            '<b>Different errors</b>: <code>StackOverflowError</code> for stacks, <code>OutOfMemoryError: Java heap space</code> for heap, <code>OutOfMemoryError: Metaspace</code> for class metadata.'],
        ['<b>Beyond the spec</b>: real JVMs also use code cache (JIT output), direct buffers, thread stacks and GC structures that are outside the heap.',
            '<b>Footprint</b> of a process is larger than <code>-Xmx</code>; plan container limits with this in mind.',
            '<b>Tools</b>: <code>jcmd &lt;pid&gt; VM.native_memory</code> with <code>-XX:NativeMemoryTracking=summary</code> shows each area.'],
        [['F', 'List the JVM runtime data areas.', 'Heap, method area, Java stacks, PC registers and native method stacks.'],
            ['F', 'Which areas are shared between threads?', 'The heap and the method area. Stacks and PC registers are private to each thread.'],
            ['M', 'Where do local variables and objects live?', 'Primitive locals and references sit in stack frames. The objects they point to are in the heap.'],
            ['M', 'Which error goes with which area?', 'StackOverflowError for the stack, Java heap space OOM for the heap, Metaspace OOM for class metadata.'],
            ['S', 'Why can a container be killed although heap is below Xmx?', 'Non-heap memory such as metaspace, code cache, thread stacks and direct buffers adds to the process. The OS counts the whole resident size against the limit.'],
            ['S', 'How do you see the non-heap memory split?', 'Start with -XX:NativeMemoryTracking=summary and run jcmd pid VM.native_memory summary. It lists each category with reserved and committed size.']],
        [['Observe the areas from code.',
            r`Runtime rt = Runtime.getRuntime();
System.out.println("max heap MB   = " + rt.maxMemory() / (1024 * 1024));
System.out.println("used heap MB  = "
    + (rt.totalMemory() - rt.freeMemory()) / (1024 * 1024));
System.out.println("processors    = " + rt.availableProcessors());

// OUTPUT: (varies)
// max heap MB   = 4096
// used heap MB  = 12
// processors    = 8`],
            ['Memory MXBeans per pool.',
                r`for (MemoryPoolMXBean p : ManagementFactory.getMemoryPoolMXBeans()) {
    System.out.println(p.getName() + " " + p.getType());
}

// OUTPUT: (varies with the collector)
// CodeHeap 'non-nmethods' Non-heap memory
// Metaspace Non-heap memory
// G1 Eden Space Heap memory
// G1 Old Gen Heap memory`]],
        [['Which area fails here?',
            r`static int depth = 0;
static void recurse() {
    depth++;
    recurse();
}  // stack area
public static void main(String[] a) {
    try { recurse(); }
    catch (StackOverflowError e) { System.out.println("stack failed"); }
    List<byte[]> keep = new ArrayList<>();       // heap area
    try { while (true) keep.add(new byte[10_000_000]); }
    catch (OutOfMemoryError e) { System.out.println(e.getMessage()); }
}

// OUTPUT: (run with -Xmx64m)
// stack failed
// Java heap space`],
            ['Native memory summary.',
                r`java -XX:NativeMemoryTracking=summary -jar app.jar
jcmd 4242 VM.native_memory summary

// OUTPUT: (varies)
// Total: reserved=1.6GB, committed=420MB
// -  Java Heap (reserved=512MB, committed=256MB)
// -  Class (reserved=1.0GB, committed=14MB)
// -  Thread (reserved=40MB, committed=40MB)
// -  Code (reserved=240MB, committed=12MB)`]]
    )
    ,
    'heap-memory-jvm': x(
        ['<b>Heap</b> is the shared area where all objects and arrays are allocated; the garbage collector reclaims unreachable ones.',
            '<b>Sizing flags</b>: <code>-Xms</code> sets the initial heap and <code>-Xmx</code> the maximum.',
            '<b>Generations</b>: new objects start in the young generation and long-lived ones move to the old generation.'],
        ['<b>Young gen</b> holds Eden plus two survivor spaces; a minor GC copies live objects out of Eden.',
            '<b>Promotion</b>: objects that survive enough collections (the tenuring threshold) move to the old generation.',
            '<b>OutOfMemoryError: Java heap space</b> means live data does not fit in <code>-Xmx</code> even after a full collection.'],
        ['<b>G1 is the default</b> collector since Java 9; it splits the heap into regions and targets a pause goal with <code>-XX:MaxGCPauseMillis</code>.',
            '<b>Set Xms equal to Xmx</b> on servers to avoid resize pauses; in containers prefer <code>-XX:MaxRAMPercentage</code>.',
            '<b>Evidence first</b>: use GC logs (<code>-Xlog:gc*</code>) and heap dumps (<code>-XX:+HeapDumpOnOutOfMemoryError</code>) before changing flags.'],
        [['F', 'What is stored on the heap?', 'All objects and arrays, including their instance fields. Local primitives are not on the heap.'],
            ['F', 'Which flags set the heap size?', 'Xms for the initial size and Xmx for the maximum size.'],
            ['M', 'What is the difference between young and old generation?', 'Young holds new, mostly short-lived objects and is collected often and cheaply. Old holds long-lived objects and is collected less often.'],
            ['M', 'Does System.gc() free memory immediately?', 'No. It is only a request, and may be ignored or may trigger an expensive full collection. Avoid it in production code.'],
            ['S', 'How do you find a heap leak?', 'Take a heap dump with jcmd GC.heap_dump, open it in a tool such as Eclipse MAT, and follow the dominator tree and paths to GC roots of the growing type.'],
            ['S', 'Why is a bigger heap not always faster?', 'More heap can mean longer collections and, in containers, less memory for other areas. Right-size from GC logs and the live set after full GC.']],
        [['Allocate and watch heap use.',
            r`Runtime rt = Runtime.getRuntime();
long before = rt.totalMemory() - rt.freeMemory();
byte[] block = new byte[50 * 1024 * 1024];
long after = rt.totalMemory() - rt.freeMemory();
System.out.println("delta MB ~ " + (after - before) / (1024 * 1024));
System.out.println(block.length);

// OUTPUT: (varies)
// delta MB ~ 50
// 52428800`],
            ['Show the flags in use.',
                r`java -Xms256m -Xmx512m -XX:+PrintFlagsFinal -version | findstr /i "InitialHeapSize MaxHeapSize UseG1GC"

// OUTPUT: (varies)
//    size_t InitialHeapSize = 268435456
//    size_t MaxHeapSize     = 536870912
//      bool UseG1GC         = true`]],
        [['Provoke and catch heap exhaustion.',
            r`java -Xmx32m -XX:+HeapDumpOnOutOfMemoryError Leak

// Leak.java
// static final List<int[]> HOLD = new ArrayList<>();
// main: while (true) HOLD.add(new int[1_000_000]);

// OUTPUT:
// java.lang.OutOfMemoryError: Java heap space
// Dumping heap to java_pid9120.hprof ...`],
            ['Read a GC log line.',
                r`java -Xlog:gc -Xmx256m App

// OUTPUT: (varies)
// [0.210s][info][gc] GC(0) Pause Young (Normal) (G1 Evacuation Pause) 24M->4M(256M) 3.1ms
// [1.870s][info][gc] GC(7) Pause Young (Normal) (G1 Evacuation Pause) 60M->9M(256M) 4.0ms`]]
    )
    ,
    'stack-memory-jvm': x(
        ['<b>Thread stack</b>: every thread has its own stack made of frames, one frame per method call.',
            '<b>Frame</b> holds local variables, the operand stack and return information; it is removed when the method returns.',
            '<b>StackOverflowError</b> happens when calls nest too deep, usually from missing base case in recursion.'],
        ['<b>Primitives and references</b> are stored in the frame; the objects behind references are in the heap.',
            '<b>Thread safety</b>: locals are private to a thread, so they need no synchronization unless a reference escapes.',
            '<b>Stack size</b> is set with <code>-Xss</code> (or <code>new Thread(group, run, name, stackSize)</code>); the default on 64-bit Linux is typically 1 MB.'],
        ['<b>Escape analysis</b>: the JIT can allocate a non-escaping object in registers or on the stack (scalar replacement), so short-lived objects may cost nothing.',
            '<b>Cost of threads</b>: many platform threads reserve many MB of stack; Java 21 virtual threads keep stacks on the heap and grow on demand.',
            '<b>Diagnosis</b>: <code>jstack</code> or <code>jcmd Thread.print</code> shows each stack; deep recursion or lock waits are visible there.'],
        [['F', 'What is stored in a stack frame?', 'Local variables, an operand stack and data for returning to the caller.'],
            ['F', 'When is StackOverflowError thrown?', 'When the thread stack is full, typically from infinite or very deep recursion.'],
            ['M', 'Stack versus heap?', 'The stack is per thread, fast, and freed automatically on return. The heap is shared, holds objects and is cleaned by the garbage collector.'],
            ['M', 'Are local variables thread safe?', 'Yes, each thread has its own copy. Only the objects they refer to can be shared.'],
            ['S', 'How do you fix a StackOverflowError?', 'Add or fix the base case, convert deep recursion to a loop with an explicit Deque, and only then raise Xss. Raising Xss hides the bug and costs memory per thread.'],
            ['S', 'How do virtual threads change stack memory?', 'Their stacks are heap objects that grow and shrink, so millions can exist. Platform threads reserve a fixed stack up front.']],
        [['Trigger and measure recursion depth.',
            r`static int depth;
static void dive() {
    depth++;
    dive();
}
public static void main(String[] args) {
    try { dive(); }
    catch (StackOverflowError e) {
        System.out.println("depth reached > 1000: " + (depth > 1000));
    }
}

// OUTPUT:
// depth reached > 1000: true`],
            ['Locals are thread private.',
                r`Runnable task = () -> {
    int counter = 0;                 // lives in this thread's frame
    for (int i = 0; i < 1000; i++) counter++;
    System.out.println(Thread.currentThread().getName() + " " + counter);
};
new Thread(task, "t1").start();
new Thread(task, "t2").start();

// OUTPUT: (order varies)
// t1 1000
// t2 1000`]],
        [['Recursion to explicit stack.',
            r`static long sumRecursive(int n) { return n == 0 ? 0 : n + sumRecursive(n - 1); }

static long sumLoop(int n) {
    Deque<Integer> st = new ArrayDeque<>();
    for (int i = 1; i <= n; i++) st.push(i);
    long s = 0;
    while (!st.isEmpty()) s += st.pop();
    return s;
}
// sumRecursive(1_000_000) overflows the default stack; sumLoop does not.
System.out.println(sumLoop(1_000_000));

// OUTPUT:
// 500000500000`],
            ['Print a thread stack.',
                r`jcmd 4242 Thread.print

// OUTPUT: (varies)
// "main" #1 prio=5 tid=0x000001 nid=0x1a4c runnable
//    java.lang.Thread.State: RUNNABLE
//         at Demo.dive(Demo.java:5)
//         at Demo.dive(Demo.java:5)
//         at Demo.main(Demo.java:9)`]]
    )
    ,
    'method-area-jvm': x(
        ['<b>Method area</b> is the shared region that stores per-class data: class structure, field and method info, method bytecode and static metadata.',
            '<b>Run-time constant pool</b> belongs to each class and holds literals and symbolic references resolved at link time.',
            '<b>Logical area</b>: the spec defines it; HotSpot implements it as metaspace in native memory since Java 8.'],
        ['<b>Static variables</b>: the static field slot is tied to the class mirror, and in modern HotSpot the static object values live in the heap inside the <code>Class</code> object.',
            '<b>String literals</b> are interned in the String table, which is on the heap since Java 7.',
            '<b>Per class loader</b>: class metadata is allocated per loader and freed when the loader is collected.'],
        ['<b>Not the same as PermGen</b>: PermGen was a fixed-size heap-like region removed in Java 8, which also removed <code>-XX:MaxPermSize</code>.',
            '<b>Code cache</b> is separate: JIT-compiled native code is not in the method area.',
            '<b>Inspect</b> with <code>jcmd &lt;pid&gt; VM.classloader_stats</code> and <code>jcmd &lt;pid&gt; GC.class_stats</code> style tools, or <code>jmap -clstats</code>.'],
        [['F', 'What does the method area store?', 'Class-level data: metadata, method code, field info, the run-time constant pool and static information.'],
            ['F', 'Is the method area shared by threads?', 'Yes. It is created at JVM start and shared by all threads.'],
            ['M', 'What is the run-time constant pool?', 'A per-class table built from the class file constant pool. It holds literals and symbolic references that are resolved when first used.'],
            ['M', 'Where do static fields live?', 'Their metadata is in the method area, while static reference values are kept in the heap with the Class mirror object in HotSpot.'],
            ['S', 'How does the method area relate to metaspace?', 'The method area is the spec concept. Metaspace is the HotSpot implementation in native memory, replacing PermGen in Java 8.'],
            ['S', 'Can classes be unloaded?', 'Yes, when their class loader becomes unreachable and a GC cycle processes it. Classes from the bootstrap and application loaders are in practice never unloaded.']],
        [['Class metadata through reflection.',
            r`Class<?> c = java.util.ArrayList.class;
System.out.println(c.getName());
System.out.println(c.getDeclaredMethods().length > 10);
System.out.println(c.getSuperclass().getSimpleName());

// OUTPUT:
// java.util.ArrayList
// true
// AbstractList`],
            ['Interned literals.',
                r`String a = "java";
String b = "ja" + "va";                 // folded at compile time
String c = new String("java");
System.out.println(a == b);
System.out.println(a == c);
System.out.println(a == c.intern());

// OUTPUT:
// true
// false
// true`]],
        [['Count loaded classes.',
            r`ClassLoadingMXBean bean = ManagementFactory.getClassLoadingMXBean();
System.out.println(bean.getLoadedClassCount() > 0);
System.out.println(bean.getTotalLoadedClassCount() >= bean.getLoadedClassCount());

// OUTPUT:
// true
// true`],
            ['Class loader statistics.',
                r`jcmd 4242 VM.classloader_stats

// OUTPUT: (varies)
// ClassLoader  Parent  CLD*  Classes  ChunkSz  BlockSz
// app          platform 0x1f  1812     9.6M     9.2M
// <boot>       -        0x02  480      4.1M     3.9M`]]
    )
    ,
    'metaspace-jvm': x(
        ['<b>Metaspace</b> stores class metadata in native memory; it replaced PermGen in Java 8.',
            '<b>Grows by default</b>: unlike PermGen, metaspace is not capped unless you set <code>-XX:MaxMetaspaceSize</code>.',
            '<b>Error</b>: <code>OutOfMemoryError: Metaspace</code> means too many or too large classes for the limit or for the machine.'],
        ['<b>Flags</b>: <code>-XX:MetaspaceSize</code> is the size at which the first metaspace GC is triggered, not a reservation.',
            '<b>Freed per loader</b>: memory comes back only when a class loader and all its classes are unloaded.',
            '<b>Typical causes</b>: endless generated classes (proxies, bytecode libraries, scripting) and redeploy leaks.'],
        ['<b>Always set a cap</b> in containers, for example <code>-XX:MaxMetaspaceSize=256m</code>, so a leak fails fast with a clear error instead of consuming node memory.',
            '<b>Compressed class space</b> (<code>-XX:CompressedClassSpaceSize</code>, default 1 GB) holds class pointers separately and can run out first.',
            '<b>Monitor</b> with <code>jcmd &lt;pid&gt; VM.metaspace</code> and the MXBean pool named Metaspace.'],
        [['F', 'What replaced PermGen?', 'Metaspace, in Java 8. It lives in native memory rather than the Java heap.'],
            ['F', 'What flag caps metaspace?', 'XX:MaxMetaspaceSize. Without it the size is limited only by available native memory.'],
            ['M', 'What does MetaspaceSize do?', 'It is the high-water mark that triggers the first garbage collection to unload classes. It does not limit or preallocate memory.'],
            ['M', 'What fills metaspace?', 'Class metadata: method data, constant pools, annotations and so on, for every loaded class. Dynamic class generation adds to it.'],
            ['S', 'Diagnose OutOfMemoryError: Metaspace.', 'Check loaded class count over time, run jcmd VM.classloader_stats, and find which loader owns the growing class set. Typical fixes are caching generated classes or releasing loaders on redeploy.'],
            ['S', 'Why can metaspace growth cause full GCs?', 'Crossing the dynamic high-water mark triggers a collection to unload classes. If nothing can be unloaded, the mark is raised, and repeated cycles show up as GC pauses.']],
        [['Read metaspace usage.',
            r`for (MemoryPoolMXBean p : ManagementFactory.getMemoryPoolMXBeans()) {
    if (p.getName().equals("Metaspace")) {
        System.out.println("used MB = " + p.getUsage().getUsed() / (1024 * 1024));
    }
}

// OUTPUT: (varies)
// used MB = 8`],
            ['Cap metaspace.',
                r`java -XX:MaxMetaspaceSize=64m -XX:MetaspaceSize=32m -jar app.jar
java -XX:+PrintFlagsFinal -version | findstr Metaspace

// OUTPUT: (varies)
//    size_t MaxMetaspaceSize  = 18446744073709551615
//    size_t MetaspaceSize     = 22020096`]],
        [['Exhaust metaspace with generated classes.',
            r`// run with: java -XX:MaxMetaspaceSize=32m Gen  (needs a bytecode library)
for (int i = 0; ; i++) {
    // define a new class "Gen" + i in a fresh class loader each time
    ByteBuddyLike.defineInNewLoader("Gen" + i);
}

// OUTPUT:
// Exception in thread "main" java.lang.OutOfMemoryError: Metaspace`],
            ['Watch class count and loaders.',
                r`jcmd 4242 VM.metaspace

// OUTPUT: (varies)
// Total Usage - 1900 loaders, 24000 classes (1200 shared):
//   Non-Class: reserved 40.00 MB, committed 30.00 MB
//   Class:     reserved  1.00 GB, committed  4.00 MB`]]
    )
};

export const jvm1Deep: Record<string, Deep> = {
    'class-loader-jvm': dv(
        [`<p>Loading a class goes through fixed phases.</p><ul><li><b>Loading:</b> <code>loadClass(name)</code> asks the parent first, then <code>findClass</code> reads the bytes and <code>defineClass</code> creates the <code>Class</code> object.</li><li><b>Verification:</b> the bytecode is checked for type safety and stack correctness.</li><li><b>Preparation:</b> static fields get default values (0, null).</li><li><b>Resolution:</b> symbolic references become direct ones, often lazily.</li><li><b>Initialization:</b> static initializers run once, under a lock, in textual order.</li><li><b>Cache:</b> each loader records the classes it defined, so a name is defined once per loader.</li></ul>`,
            r`protected Class<?> loadClass(String name, boolean resolve) throws ClassNotFoundException {
    synchronized (getClassLoadingLock(name)) {
        Class<?> c = findLoadedClass(name);        // 1. already defined here?
        if (c == null) {
            try {
                c = (parent != null) ? parent.loadClass(name) : findBootstrapClass(name);
            } catch (ClassNotFoundException e) { /* parent could not find it */ }
            if (c == null) c = findClass(name);    // 2. try this loader
        }
        return c;
    }
}

// OUTPUT:
// (simplified view of java.lang.ClassLoader.loadClass: delegate up, then load locally)`],
        [`<p>Ways to load classes and the options around them:</p><ul><li><b>Implicit:</b> a reference in bytecode (<code>new</code>, static call) loads the class.</li><li><b>Explicit:</b> <code>Class.forName(name)</code> (initializes) or <code>loader.loadClass(name)</code> (does not initialize).</li><li><b>URLClassLoader:</b> load from jar or directory URLs, closeable.</li><li><b>ServiceLoader:</b> discover implementations through <code>META-INF/services</code> or <code>module-info</code>.</li><li><b>Lookup.defineClass:</b> define a class from bytes inside an existing package.</li><li><b>Flags:</b> <code>-cp</code>, <code>--module-path</code>, <code>-Xlog:class+load</code>.</li></ul>`,
            r`Path jar = Path.of("plugins/report.jar");
try (URLClassLoader loader = new URLClassLoader(
        new URL[] { jar.toUri().toURL() }, ClassLoader.getSystemClassLoader())) {
    Class<?> c = Class.forName("com.acme.ReportPlugin", true, loader);
    Object plugin = c.getDeclaredConstructor().newInstance();
    System.out.println(plugin.getClass().getName());
    System.out.println(c.getClassLoader() == loader);
}

// OUTPUT:
// com.acme.ReportPlugin
// true`],
        [`<p>Typical class loading mistakes:</p><ul><li><b>ClassCastException with the same name:</b> the two classes came from different loaders; load the shared type from a common parent.</li><li><b>Wrong context loader:</b> a framework cannot see your classes; set the context loader around the call.</li><li><b>Duplicate jars:</b> two versions on the classpath, the first one wins; find it with <code>-Xlog:class+load</code>.</li><li><b>Unclosed URLClassLoader:</b> keeps jar files locked and classes alive.</li><li><b>Static singletons in a shared parent:</b> they hold references to child loader classes and leak them.</li><li><b>Catching Throwable around init:</b> a failed static initializer gives <code>NoClassDefFoundError</code> on later uses and hides the first cause.</li></ul>`,
            r`ClassLoader old = Thread.currentThread().getContextClassLoader();
try {
    Thread.currentThread().setContextClassLoader(pluginLoader);
    ServiceLoader<Greeter> sl = ServiceLoader.load(Greeter.class);   // sees plugin classes
    sl.forEach(g -> System.out.println(g.greet()));
} finally {
    Thread.currentThread().setContextClassLoader(old);                // always restore
}

// OUTPUT:
// hello from plugin`],
        [`<p>Class loading costs startup time, so tune it deliberately.</p><ul><li><b>Fewer classes:</b> trim dependencies and avoid reflection-heavy startup.</li><li><b>AppCDS:</b> <code>-XX:ArchiveClassesAtExit</code> and <code>-XX:SharedArchiveFile</code> map pre-parsed classes and cut startup.</li><li><b>JDK 19+:</b> <code>-XX:+AutoCreateSharedArchive</code> creates and refreshes the archive automatically.</li><li><b>Parallel loading:</b> loaders that register as parallel capable lock per class name instead of per loader.</li><li><b>Lazy init:</b> keep static initializers cheap.</li></ul>`,
            r`java -XX:ArchiveClassesAtExit=app.jsa -jar app.jar
java -XX:SharedArchiveFile=app.jsa -jar app.jar
java -XX:+AutoCreateSharedArchive -XX:SharedArchiveFile=app.jsa -jar app.jar

// OUTPUT: (varies)
// startup without archive: 1.9 s
// startup with AppCDS:     1.3 s`],
        [`<p>Scenario: a servlet container redeploys a web app and memory climbs each time.</p><ul><li><b>Cause:</b> a library in the shared parent loader keeps a thread or static map pointing at the webapp classes.</li><li><b>Symptom:</b> loader count and loaded class count grow after each redeploy.</li><li><b>Fix:</b> stop threads and deregister drivers in a shutdown hook (<code>ServletContextListener</code>), and keep such libraries inside the webapp.</li></ul>`,
            r`@Override
public void contextDestroyed(ServletContextEvent e) {
    Enumeration<Driver> drivers = DriverManager.getDrivers();
    while (drivers.hasMoreElements()) {
        Driver d = drivers.nextElement();
        if (d.getClass().getClassLoader() == getClass().getClassLoader()) {
            try { DriverManager.deregisterDriver(d); } catch (SQLException ex) { }
        }
    }
    executor.shutdownNow();     // stop threads that hold the webapp loader
}

// OUTPUT:
// after redeploy: loaders 12 -> 12 (previously grew by 1 per redeploy)`]
    ),
    'runtime-data-areas': dv(
        [`<p>The specification divides memory by lifetime and sharing.</p><ul><li><b>Per JVM:</b> heap, method area and run-time constant pools, created at startup.</li><li><b>Per thread:</b> PC register, Java stack and native method stack, created with the thread.</li><li><b>Frames:</b> pushed on call, popped on return; each has locals, an operand stack and a constant pool reference.</li><li><b>Beyond the spec:</b> HotSpot adds code cache, GC bookkeeping, symbol tables and direct memory.</li></ul>`,
            r`static int add(int a, int b) {
    int c = a + b;
    return c;
}

javap -c Demo

// OUTPUT:
// static int add(int, int);
//   0: iload_0        // push local 0 onto the operand stack
//   1: iload_1
//   2: iadd           // pop two, push sum
//   3: istore_2       // store into local 2
//   4: iload_2
//   5: ireturn`],
        [`<p>Memory flags per area:</p><ul><li><b>Heap:</b> <code>-Xms</code>, <code>-Xmx</code>, <code>-XX:MaxRAMPercentage</code>.</li><li><b>Stack:</b> <code>-Xss</code>.</li><li><b>Metaspace:</b> <code>-XX:MaxMetaspaceSize</code>.</li><li><b>Code cache:</b> <code>-XX:ReservedCodeCacheSize</code>.</li><li><b>Direct buffers:</b> <code>-XX:MaxDirectMemorySize</code>.</li><li><b>Tracking:</b> <code>-XX:NativeMemoryTracking=summary|detail</code>.</li></ul>`,
            r`java -Xms512m -Xmx512m -Xss512k -XX:MaxMetaspaceSize=192m ^
     -XX:ReservedCodeCacheSize=128m -XX:MaxDirectMemorySize=128m ^
     -XX:NativeMemoryTracking=summary -jar app.jar

// OUTPUT:
// (no output on success; jcmd pid VM.native_memory summary reports each area)`],
        [`<p>Common mistakes:</p><ul><li><b>Sizing container limit equal to Xmx:</b> leave room for non-heap, often 25 to 50 percent extra.</li><li><b>Thinking all objects are on the heap:</b> escape analysis can remove allocations.</li><li><b>Mixing up errors:</b> each area has its own error and its own fix.</li><li><b>Raising Xmx for a leak:</b> it only delays the failure.</li><li><b>Ignoring thread count:</b> every platform thread costs stack memory.</li></ul>`,
            r`// Container limit 1 GB, JVM started with -Xmx1g: likely OOM-killed by the OS.
// Better: leave headroom and let the JVM size from the container.
java -XX:MaxRAMPercentage=65 -XX:MaxMetaspaceSize=128m -jar app.jar

// OUTPUT: (container with 1 GB limit)
// max heap ~ 650 MB, remaining memory covers metaspace, stacks, code cache`],
        [`<p>Performance relevant points:</p><ul><li><b>Stack access</b> is very fast; heap allocation is fast but feeds the collector.</li><li><b>Reduce allocation</b> in hot paths to cut GC work.</li><li><b>Direct memory</b> avoids a copy for I/O but is not managed by the heap collector.</li><li><b>Fewer threads</b> or virtual threads reduce stack footprint.</li><li><b>Measure</b> with JFR rather than guessing.</li></ul>`,
            r`jcmd 4242 JFR.start name=profile settings=profile duration=60s filename=rec.jfr
jfr summary rec.jfr

// OUTPUT: (varies)
// Event Type                         Count  Size (bytes)
// jdk.ObjectAllocationSample          2100         52000
// jdk.GarbageCollection                 31          1800
// jdk.ExecutionSample                 3000         90000`],
        [`<p>Scenario: a Spring service in Kubernetes is restarted with reason OOMKilled while heap graphs look healthy.</p><ul><li><b>Check:</b> heap max, metaspace, thread count, direct memory.</li><li><b>Finding:</b> 600 threads at 1 MB stack plus Netty direct buffers filled the gap.</li><li><b>Fix:</b> cap thread pools, set <code>-XX:MaxDirectMemorySize</code>, lower <code>MaxRAMPercentage</code>.</li></ul>`,
            r`jcmd 4242 VM.native_memory summary | findstr /i "Thread Internal Other"

// OUTPUT: (varies)
// -  Thread (reserved=640MB, committed=640MB)
//            (threads #610)
// -  Other (reserved=210MB, committed=210MB)`]
    ),
    'heap-memory-jvm': dv(
        [`<p>HotSpot heap layout (G1, the default since Java 9):</p><ul><li><b>Regions:</b> the heap is split into equal regions (1 to 32 MB) labeled Eden, Survivor, Old or Humongous.</li><li><b>Allocation:</b> each thread allocates in a private buffer (TLAB) inside Eden, which needs no lock.</li><li><b>Minor GC:</b> live objects are copied to survivor or old regions; dead ones are dropped with the region.</li><li><b>Mixed GC:</b> after concurrent marking, old regions with most garbage are also collected.</li><li><b>Humongous:</b> objects over half a region get dedicated regions.</li></ul>`,
            r`java -Xlog:gc+heap=debug -Xmx256m App

// OUTPUT: (varies)
// [0.300s][debug][gc,heap] Heap Regions: E=eden S=survivor O=old H=humongous
// [0.300s][debug][gc,heap] |E|E|E|S|O|O|H|H|F|F|`],
        [`<p>Heap options by purpose:</p><ul><li><b>Size:</b> <code>-Xms</code>, <code>-Xmx</code>, <code>-XX:MaxRAMPercentage</code>.</li><li><b>Collector:</b> <code>-XX:+UseG1GC</code> (default), <code>-XX:+UseParallelGC</code> (throughput), <code>-XX:+UseZGC</code> (low pause; generational mode with <code>-XX:+ZGenerational</code> in 21), <code>-XX:+UseSerialGC</code> (tiny apps).</li><li><b>Pause goal:</b> <code>-XX:MaxGCPauseMillis=200</code> is the G1 default.</li><li><b>Diagnostics:</b> <code>-Xlog:gc*</code>, <code>-XX:+HeapDumpOnOutOfMemoryError</code>, <code>-XX:HeapDumpPath</code>.</li></ul>`,
            r`java -XX:+UseZGC -XX:+ZGenerational -Xmx2g -Xlog:gc -jar app.jar
java -XX:+UseParallelGC -Xmx2g -jar batch.jar
java -XX:+UseG1GC -XX:MaxGCPauseMillis=100 -Xmx2g -jar api.jar

// OUTPUT:
// (each command starts the same app with a different collector; compare GC logs)`],
        [`<p>Typical heap problems:</p><ul><li><b>Unbounded caches:</b> a static <code>HashMap</code> that only grows; use a size-bounded cache with eviction.</li><li><b>Listeners never removed:</b> registered objects stay reachable.</li><li><b>ThreadLocal in pools:</b> values stay as long as the pooled thread.</li><li><b>Loading whole result sets or files:</b> stream or page instead.</li><li><b>Calling System.gc():</b> remove it, or disable with <code>-XX:+DisableExplicitGC</code>.</li></ul>`,
            r`// WRONG: grows forever
static final Map<String, byte[]> CACHE = new HashMap<>();

// RIGHT: bounded LRU using LinkedHashMap
static final Map<String, byte[]> LRU =
    new LinkedHashMap<>(16, 0.75f, true) {
        @Override protected boolean removeEldestEntry(Map.Entry<String, byte[]> e) {
            return size() > 1000;
        }
    };

// OUTPUT:
// LRU never holds more than 1000 entries, so the live set stays bounded`],
        [`<p>Tuning steps that work in practice:</p><ul><li><b>Measure the live set</b> after full or mixed GC; heap should be about 2 to 4 times that.</li><li><b>Reduce allocation rate</b> before tuning flags.</li><li><b>Avoid boxing</b> and temporary strings in hot loops.</li><li><b>Set Xms equal to Xmx</b> for stable servers.</li><li><b>Change one flag at a time</b> and compare GC logs or JFR.</li></ul>`,
            r`jcmd 4242 GC.heap_info
jcmd 4242 GC.class_histogram | more

// OUTPUT: (varies)
//  garbage-first heap   total 262144K, used 90112K
//   region size 1024K, 60 young (61440K), 4 survivors (4096K)
// num  #instances  #bytes  class name
//   1:   310000    24800000  [B
//   2:   120000     2880000  java.lang.String`],
        [`<p>Scenario: an order service shows steadily growing old generation and a restart every few days.</p><ul><li><b>Step 1:</b> dump the heap while it is high.</li><li><b>Step 2:</b> open in MAT and check the dominator tree.</li><li><b>Finding:</b> a static map of sessions never cleaned.</li><li><b>Fix:</b> expire entries and add a test that checks the size stays bounded.</li></ul>`,
            r`jcmd 4242 GC.heap_dump C:\dumps\orders.hprof

// OUTPUT: (varies)
// 4242:
// Heap dump file created [412345678 bytes in 2.4 secs]
// MAT: leak suspect - OrderSessionRegistry holds 71% of heap`]
    ),
    'stack-memory-jvm': dv(
        [`<p>How a call uses the stack:</p><ul><li><b>Invoke:</b> the JVM pushes a new frame sized at compile time (max locals plus max operand stack).</li><li><b>Arguments</b> become the first local slots; <code>this</code> is slot 0 for instance methods.</li><li><b>Return:</b> the result moves to the caller operand stack and the frame is popped.</li><li><b>Exceptions:</b> unwinding pops frames until a handler matches.</li><li><b>JIT:</b> compiled frames use machine registers and can inline callees, so the visible depth differs from bytecode.</li></ul>`,
            r`static int fact(int n) {
    if (n <= 1) return 1;
    return n * fact(n - 1);
}
public static void main(String[] args) {
    System.out.println(fact(5));
}

// OUTPUT:
// 120
// stack at deepest point: main -> fact(5) -> fact(4) -> fact(3) -> fact(2) -> fact(1)`],
        [`<p>Controlling stack size and depth:</p><ul><li><b>Global:</b> <code>-Xss512k</code> or <code>-XX:ThreadStackSize=512</code>.</li><li><b>Per thread:</b> the stackSize argument of the <code>Thread</code> constructor, a hint the JVM may ignore.</li><li><b>Executor threads:</b> pass a custom <code>ThreadFactory</code> to set it.</li><li><b>Virtual threads (Java 21):</b> no fixed stack size; limited by heap.</li><li><b>Main thread:</b> stack size is set by the launcher, <code>-Xss</code> applies.</li></ul>`,
            r`Thread big = new Thread(null, () -> System.out.println(depth(0)), "big", 256L * 1024 * 1024);
big.start();
big.join();

static int depth(int n) {
    try { return depth(n + 1); }
    catch (StackOverflowError e) { return n; }
}

// OUTPUT: (varies)
// 2750000`],
        [`<p>Common stack mistakes:</p><ul><li><b>Missing base case:</b> add it and test with small and large inputs.</li><li><b>Mutual recursion:</b> A calls B calls A without progress.</li><li><b>Recursive toString or equals</b> on cyclic object graphs.</li><li><b>Huge Xss for all threads:</b> memory is reserved per thread.</li><li><b>Assuming tail-call optimization:</b> Java does not do it, so deep recursion needs a loop.</li></ul>`,
            r`class Node { Node other;
    @Override public String toString() { return "Node->" + other; }
    }  // cycle overflows
Node a = new Node(), b = new Node();
a.other = b;
b.other = a;
try { a.toString(); }
catch (StackOverflowError e) { System.out.println("cyclic toString overflowed"); }

// OUTPUT:
// cyclic toString overflowed`],
        [`<p>Performance notes:</p><ul><li><b>Small methods</b> are inlined, so call depth costs little once hot.</li><li><b>Smaller Xss</b> lets you run more threads in the same memory.</li><li><b>Escape analysis</b> can keep short-lived objects out of the heap.</li><li><b>Thread dumps</b> are cheap and safe, take several 5 to 10 seconds apart.</li></ul>`,
            r`jstack -l 4242 > dump1.txt
jstack -l 4242 > dump2.txt
findstr /c:"BLOCKED" dump2.txt

// OUTPUT: (varies)
// java.lang.Thread.State: BLOCKED (on object monitor)
//         - waiting to lock <0x000000076ab62208> (a java.util.HashMap)`],
        [`<p>Scenario: a JSON parser endpoint crashes with StackOverflowError on deeply nested input from clients.</p><ul><li><b>Risk:</b> attacker-controlled depth is a denial-of-service vector.</li><li><b>Fix:</b> enforce a maximum nesting depth in the parser and reject the request with a 400 response.</li><li><b>Backup:</b> catch the error at the request boundary and log the input size only.</li></ul>`,
            r`static final int MAX_DEPTH = 64;
static void parse(Node n, int depth) {
    if (depth > MAX_DEPTH) throw new IllegalArgumentException("nesting too deep");
    for (Node child : n.children()) parse(child, depth + 1);
}

// OUTPUT:
// HTTP 400 {"error":"nesting too deep"}`]
    ),
    'method-area-jvm': dv(
        [`<p>What the method area holds for each loaded class:</p><ul><li><b>Class structure:</b> name, super type, interfaces, modifiers.</li><li><b>Members:</b> field and method descriptors, bytecode, exception tables.</li><li><b>Run-time constant pool:</b> literals and symbolic references, resolved lazily.</li><li><b>Statics:</b> in HotSpot the static reference values sit in the heap inside the Class mirror.</li><li><b>Vtables and itables</b> for dispatch.</li><li><b>Implementation:</b> metaspace in native memory, allocated per class loader.</li></ul>`,
            r`javap -v Demo | more

// OUTPUT: (varies)
// Constant pool:
//    #1 = Methodref   #2.#3   // java/lang/Object."<init>":()V
//    #7 = String      #8      // hello
//    #8 = Utf8        hello
// {
//   static final java.lang.String GREETING;
//     flags: ACC_STATIC, ACC_FINAL`],
        [`<p>Ways to look at method area data:</p><ul><li><b>Reflection:</b> <code>getDeclaredFields</code>, <code>getDeclaredMethods</code>.</li><li><b>javap:</b> <code>-c</code> code, <code>-v</code> constant pool, <code>-p</code> private members.</li><li><b>MXBean:</b> <code>ClassLoadingMXBean</code> for counts.</li><li><b>jcmd:</b> <code>VM.classloader_stats</code>, <code>VM.metaspace</code>, <code>GC.class_histogram</code>.</li><li><b>Logging:</b> <code>-Xlog:class+unload</code> shows unloading.</li></ul>`,
            r`java -Xlog:class+unload=info -jar app.jar

// OUTPUT: (varies)
// [12.4s][info][class,unload] unloading class com.acme.GeneratedProxy17 0x0000000800c80000
// [12.4s][info][class,unload] unloading class com.acme.GeneratedProxy18 0x0000000800c80400`],
        [`<p>Typical confusions and mistakes:</p><ul><li><b>Calling it PermGen:</b> PermGen no longer exists; the flag <code>-XX:MaxPermSize</code> is ignored with a warning.</li><li><b>Putting strings in the method area:</b> the String table is in the heap.</li><li><b>Assuming static means immortal:</b> statics die with their class loader.</li><li><b>Creating a class per request</b> with dynamic proxies without caching.</li></ul>`,
            r`java -XX:MaxPermSize=128m -version

// OUTPUT:
// OpenJDK 64-Bit Server VM warning: Ignoring option MaxPermSize; support was removed in 8.0
// openjdk version "17.0.9"`],
        [`<p>Performance points:</p><ul><li><b>Class Data Sharing</b> keeps JDK class metadata in a shared mapped archive, so startup is faster and memory is shared between JVMs.</li><li><b>Fewer classes</b> means less metaspace and quicker startup.</li><li><b>Cache generated classes</b> (proxies, lambdas are fine, they are linked via invokedynamic).</li></ul>`,
            r`java -Xshare:dump
java -Xshare:auto -Xlog:cds -version

// OUTPUT: (varies)
// [info][cds] Opened shared archive file classes.jsa
// openjdk version "17.0.9"`],
        [`<p>Scenario: a service that uses a scripting engine for rules loads a new script class on every evaluation.</p><ul><li><b>Symptom:</b> loaded class count rises steadily.</li><li><b>Fix:</b> compile each script once and cache the compiled object by script hash.</li></ul>`,
            r`private final Map<String, CompiledScript> compiled = new ConcurrentHashMap<>();

Object evaluate(String script, Bindings b) throws ScriptException {
    CompiledScript cs = compiled.computeIfAbsent(script, s -> compile(s));
    return cs.eval(b);
}

// OUTPUT:
// loaded classes: stable at 14500 after warm-up (previously +1 per call)`]
    ),
    'metaspace-jvm': dv(
        [`<p>How metaspace manages memory:</p><ul><li><b>Native memory:</b> memory is reserved from the OS in virtual space and committed as needed.</li><li><b>Per loader arenas:</b> each class loader allocates metadata chunks in its own arena.</li><li><b>Release:</b> when a loader is unloaded its arena is returned to the free lists.</li><li><b>Compressed class space:</b> a separate region (default 1 GB reserved) for class pointers when compressed class pointers are on.</li><li><b>High-water mark:</b> crossing <code>MetaspaceSize</code> triggers a GC to unload classes.</li></ul>`,
            r`jcmd 4242 VM.metaspace scale=m

// OUTPUT: (varies)
// Total Usage - 450 loaders, 9800 classes:
//   Both:  used 62.1 MB, committed 63.4 MB, reserved 1088 MB
//   Non-Class: used 55.2 MB
//   Class:     used  6.9 MB`],
        [`<p>Metaspace flags:</p><ul><li><code>-XX:MetaspaceSize</code>: first GC threshold.</li><li><code>-XX:MaxMetaspaceSize</code>: hard cap, unlimited by default.</li><li><code>-XX:MinMetaspaceFreeRatio</code> and <code>-XX:MaxMetaspaceFreeRatio</code>: how much free space to keep after a collection.</li><li><code>-XX:CompressedClassSpaceSize</code>: class space size.</li><li><code>-XX:+UseCompressedClassPointers</code>: on by default for heaps under the 32 GB class limit and in general on 64-bit.</li></ul>`,
            r`java -XX:MetaspaceSize=128m -XX:MaxMetaspaceSize=256m ^
     -XX:CompressedClassSpaceSize=128m -Xlog:gc+metaspace -jar app.jar

// OUTPUT: (varies)
// [5.1s][info][gc,metaspace] Metaspace: 98304K(104448K)->98304K(104448K) NonClass: ... Class: ...`],
        [`<p>Metaspace mistakes:</p><ul><li><b>No cap in containers:</b> a leak eats node memory instead of failing clearly.</li><li><b>Cap too small:</b> large apps with many frameworks need 150 to 400 MB; measure first.</li><li><b>Confusing MetaspaceSize with a limit.</b></li><li><b>Generating classes in a loop</b> with CGLIB, ASM or scripting without caching.</li><li><b>Leaking loaders</b> through threads, ThreadLocals, JDBC drivers and shutdown hooks.</li></ul>`,
            r`// WRONG: new proxy class and loader on every call
Object p = Proxy.newProxyInstance(new URLClassLoader(new URL[0]),
        new Class<?>[] { Runnable.class }, handler);

// RIGHT: reuse one loader (and ideally one proxy class)
static final ClassLoader LOADER = Runnable.class.getClassLoader();
Object p2 = Proxy.newProxyInstance(LOADER, new Class<?>[] { Runnable.class }, handler);

// OUTPUT:
// loaders stay constant instead of growing with every call`],
        [`<p>Operational guidance:</p><ul><li><b>Watch the trend</b> of used metaspace and loaded classes, not a single number.</li><li><b>Alert</b> when metaspace grows without a plateau after warm-up.</li><li><b>Headroom:</b> set the cap about 1.5 to 2 times the steady value.</li><li><b>Compare</b> class histogram snapshots to see growing class families.</li></ul>`,
            r`jcmd 4242 GC.class_histogram | findstr /i "Proxy Generated"

// OUTPUT: (varies)
// 118:   5200   332800  com.sun.proxy.$Proxy88
// 121:   5100   326400  com.acme.rules.GeneratedRule`],
        [`<p>Scenario: an app server shows OutOfMemoryError: Metaspace after the fifth redeploy.</p><ul><li><b>Investigate:</b> loader stats before and after a redeploy; old webapp loaders remain.</li><li><b>Root cause:</b> a library thread started by the webapp still runs.</li><li><b>Fix:</b> stop the thread on undeploy, then confirm loaders drop after a GC.</li></ul>`,
            r`jcmd 4242 VM.classloader_stats | findstr /i "WebappClassLoader"

// OUTPUT: (varies)
// WebappClassLoader  ... 1790 classes   <- old deployment still alive
// WebappClassLoader  ... 1812 classes
// After fix and GC: only one WebappClassLoader remains`]
    )
};
