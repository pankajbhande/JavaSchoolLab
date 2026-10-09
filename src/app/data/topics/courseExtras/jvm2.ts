// JVM memory extras, part 2: PC register, native stack, object creation, references, stack vs heap, string pool.
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const jvm2Extras: Record<string, Extra> = {
    'pc-register-jvm': x(
        ['<b>One per thread</b>: every Java thread has its own program counter, so threads can run different code at the same time.',
            '<b>What it holds</b>: the address (bytecode index) of the JVM instruction the thread will run next.',
            '<b>Not for you</b>: you cannot read or change it from Java code; the JVM updates it after each instruction.'],
        ['<b>Context switch</b>: when the OS pauses a thread, its PC register value is saved so the thread resumes at the exact instruction.',
            '<b>Native methods</b>: while a thread runs native code, the PC value of that thread is undefined.',
            '<b>Line numbers</b>: stack traces show source lines because the JVM maps the bytecode index to a line using the <code>LineNumberTable</code>.'],
        ['<b>No OutOfMemoryError</b>: the specification lists the PC register as the only runtime area with no defined out-of-memory condition.',
            '<b>Real hardware</b>: HotSpot keeps the equivalent state in real CPU registers and thread structures, and the JIT-compiled code uses machine addresses.',
            '<b>Debugging</b>: debuggers and profilers use bytecode index data (see <code>javap -c -l</code>) to place breakpoints and report lines.'],
        [['F', 'What is the PC register?', 'A small per-thread area that stores the address of the next JVM instruction to execute.'],
            ['F', 'Is the PC register shared between threads?', 'No. Each thread has its own, which is how many threads run independently.'],
            ['M', 'What does the PC register hold during a native method?', 'It is undefined, because native code is not JVM bytecode.'],
            ['M', 'How does a stack trace get a line number?', 'The JVM maps the bytecode index to a source line with the LineNumberTable in the class file.'],
            ['S', 'Why does the JVM need a PC per thread and not one global PC?', 'Threads are scheduled preemptively and interleaved, so each needs its own saved position to resume correctly.'],
            ['S', 'Can the PC register cause OutOfMemoryError?', 'No. It is a fixed-size area, and the specification defines no out-of-memory condition for it.']],
        [['See bytecode offsets with javap.',
            r`// Source: int add(int a, int b) { int c = a + b; return c; }
// Command: javap -c -l Calc
//
// OUTPUT:
//   int add(int, int);
//     Code:
//        0: iload_1
//        1: iload_2
//        2: iadd
//        3: istore_3
//        4: iload_3
//        5: ireturn
//     LineNumberTable:
//       line 3: 0
//       line 4: 4`],
            ['Two threads, two positions.',
                r`Runnable job = () -> {
    int total = 0;
    for (int i = 0; i < 3; i++) total += i;
    System.out.println(Thread.currentThread().getName() + " total=" + total);
};
new Thread(job, "T1").start();
new Thread(job, "T2").start();

// OUTPUT: (order varies)
// T1 total=3
// T2 total=3`]],
        [['Find the line from a stack trace.',
            r`static int div(int a, int b) { return a / b; }   // line 3
public static void main(String[] args) {
    try { div(1, 0); }
    catch (ArithmeticException e) {
        StackTraceElement top = e.getStackTrace()[0];
        System.out.println(top.getMethodName() + " line " + top.getLineNumber());
    }
}

// OUTPUT:
// div line 3`],
            ['Compile without line info.',
                r`// javac -g:none Calc.java   (no LineNumberTable)
// java Calc
//
// OUTPUT:
// Exception in thread "main" java.lang.ArithmeticException: / by zero
//     at Calc.div(Unknown Source)
//     at Calc.main(Unknown Source)`]]
    ),

    'native-method-stack-jvm': x(
        ['<b>Native method</b>: a method declared with <code>native</code> and implemented in C or C++, such as <code>System.currentTimeMillis()</code>.',
            '<b>Native stack</b>: the memory a thread uses while it runs native code, separate in concept from the Java stack.',
            '<b>Loading</b>: <code>System.loadLibrary("name")</code> loads the library; a missing one throws <code>UnsatisfiedLinkError</code>.'],
        ['<b>HotSpot</b> uses one thread stack for both Java frames and native frames, sized by <code>-Xss</code>.',
            '<b>JNI</b> (Java Native Interface) is the standard bridge between Java and native code, and it needs a header and a compiled library.',
            '<b>Crash risk</b>: a bug in native code can kill the whole JVM with a segmentation fault and an <code>hs_err_pid</code> file, not a Java exception.'],
        ['<b>Native memory</b> (direct buffers, thread stacks, metaspace, JNI allocations) lies outside the heap, so <code>-Xmx</code> does not limit it.',
            '<b>Tracking</b>: use <code>-XX:NativeMemoryTracking=summary</code> and <code>jcmd &lt;pid&gt; VM.native_memory summary</code>.',
            '<b>Modern bridge</b>: the Foreign Function and Memory API replaces JNI for many cases; it was preview in JDK 21 and final in JDK 22.'],
        [['F', 'What is a native method?', 'A method declared native whose body is written in another language such as C, loaded from a library.'],
            ['F', 'What does the native method stack do?', 'It holds the frames of native method calls made by a thread.'],
            ['M', 'What is JNI?', 'The Java Native Interface, the standard way for Java code to call native code and the reverse.'],
            ['M', 'What happens if the native library is missing?', 'The JVM throws UnsatisfiedLinkError when the library is loaded or the method is first called.'],
            ['S', 'Does -Xmx limit native memory?', 'No. Heap size is limited by -Xmx, while thread stacks, metaspace, direct buffers and JNI memory are extra.'],
            ['S', 'How do you find a native memory leak?', 'Enable Native Memory Tracking, take a baseline, and compare with jcmd VM.native_memory summary.diff.']],
        [['A native method in the JDK.',
            r`long a = System.nanoTime();          // native in the JDK
long b = System.currentTimeMillis();   // native in the JDK
System.out.println(b > 0 && a != 0);
Object o = new Object();
System.out.println(o.hashCode() != 0); // Object.hashCode is native

// OUTPUT:
// true
// true`],
            ['Declare and load a native method.',
                r`public class Hello {
    static { System.loadLibrary("hello"); }
    private static native void greet();
    public static void main(String[] a) { greet(); }
}
// java Hello   (library libhello.so not on java.library.path)
//
// OUTPUT:
// Exception in thread "main" java.lang.UnsatisfiedLinkError: no hello in java.library.path`]],
        [['Track native memory.',
            r`// java -XX:NativeMemoryTracking=summary -jar app.jar
// jcmd 4242 VM.native_memory summary
//
// OUTPUT: (varies)
// Total: reserved=1650MB, committed=420MB
// -  Java Heap (reserved=512MB, committed=256MB)
// -  Class (reserved=1050MB, committed=12MB)
// -  Thread (reserved=30MB, committed=30MB)
// -  Other (reserved=8MB, committed=8MB)`],
            ['Allocate off-heap memory.',
                r`ByteBuffer buf = ByteBuffer.allocateDirect(64 * 1024 * 1024);
System.out.println("direct=" + buf.isDirect() + " cap=" + buf.capacity());
// This 64 MB is native memory, limited by -XX:MaxDirectMemorySize, not by -Xmx.

// OUTPUT:
// direct=true cap=67108864`]]
    ),

    'object-creation-memory': x(
        ['<b>new</b> allocates memory for the object, sets fields to defaults (<code>0</code>, <code>false</code>, <code>null</code>) and then runs the constructor.',
            '<b>Where</b>: the object lives on the heap; the variable that points to it lives on the stack (for a local).',
            '<b>Size</b>: an object is its header plus its fields plus padding, so a small object is never zero bytes.'],
        ['<b>Order</b>: superclass constructor, then instance field initializers and instance blocks, then the rest of the constructor body.',
            '<b>Header</b>: with compressed class pointers, the object header is 12 bytes; objects are aligned to 8 bytes.',
            '<b>Class loading</b>: the first <code>new Foo()</code> loads, links and initializes class <code>Foo</code> if that has not happened yet.'],
        ['<b>TLAB</b>: each thread allocates from its own Thread-Local Allocation Buffer, so allocation is usually a pointer bump without locking.',
            '<b>Escape analysis</b>: the JIT can remove an allocation (scalar replacement) when the object never escapes the method.',
            '<b>Measure</b>: use JOL (<code>ClassLayout.parseClass</code>) to see real object layout instead of guessing.'],
        [['F', 'What does the new keyword do?', 'It allocates heap memory for the object, initializes fields to defaults and calls the constructor.'],
            ['F', 'Where are objects stored?', 'On the heap. Only the reference variable of a local lives in the stack frame.'],
            ['M', 'What is the initialization order of an object?', 'Superclass constructor, then field initializers and instance blocks, then the constructor body.'],
            ['M', 'What is in an object header?', 'A mark word (hash, lock, GC age) and a class pointer; 12 bytes with compressed class pointers on 64-bit.'],
            ['S', 'Why is allocation fast in the JVM?', 'Threads allocate from a private TLAB by bumping a pointer, with no lock; the GC compacts and reclaims in bulk.'],
            ['S', 'Can new Foo() avoid the heap?', 'Yes. If escape analysis shows the object does not escape, the JIT may replace it with local scalars.']],
        [['Defaults before the constructor.',
            r`class Box {
    int n;  boolean ok;  String s;
    Box() { System.out.println(n + " " + ok + " " + s); n = 7; }
}
Box b = new Box();
System.out.println(b.n);

// OUTPUT:
// 0 false null
// 7`],
            ['Initialization order.',
                r`class P { P() { System.out.println("P ctor"); } }
class C extends P {
    int x = init("field");
    { System.out.println("instance block"); }
    C() { System.out.println("C ctor"); }
    static int init(String s) { System.out.println(s); return 1; }
}
new C();

// OUTPUT:
// P ctor
// field
// instance block
// C ctor`]],
        [['Object size with JOL.',
            r`// dependency: org.openjdk.jol:jol-core
class Point { int x; int y; }
System.out.println(ClassLayout.parseClass(Point.class).toPrintable());

// OUTPUT: (64-bit, compressed class pointers, typical)
// Point object internals:
// OFF  SZ   TYPE DESCRIPTION
//   0   8        (object header: mark)
//   8   4        (object header: class)
//  12   4    int Point.x
//  16   4    int Point.y
//  20   4        (object alignment gap)
// Instance size: 24 bytes`],
            ['Allocation count with a quick loop.',
                r`long before = Runtime.getRuntime().totalMemory()
            - Runtime.getRuntime().freeMemory();
Object[] keep = new Object[100_000];
for (int i = 0; i < keep.length; i++) keep[i] = new Object();
long after = Runtime.getRuntime().totalMemory()
           - Runtime.getRuntime().freeMemory();
System.out.println("approx bytes per object: " + (after - before) / keep.length);

// OUTPUT: (varies)
// approx bytes per object: 20`]]
    ),

    'references-in-java': x(
        ['<b>Reference</b>: a variable holds the address of an object, not the object itself; <code>a = b</code> copies the reference.',
            '<b>Pass by value</b>: Java always passes a copy of the reference, so a method can change the object but cannot re-point your variable.',
            '<b>null</b>: a reference to nothing; calling a method on it throws <code>NullPointerException</code>.'],
        ['<b>Strong</b>: a normal reference; the object is never collected while one exists.',
            '<b>Soft and weak</b>: <code>SoftReference</code> keeps the object until memory is short; <code>WeakReference</code> lets it go at the next GC.',
            '<b>== vs equals</b>: <code>==</code> compares references, <code>equals</code> compares content when overridden.'],
        ['<b>Four strengths</b>: strong, soft, weak, phantom; they decide when the GC may reclaim an object.',
            '<b>ReferenceQueue and Cleaner</b>: get a notification after collection; use <code>Cleaner</code> instead of <code>finalize()</code>, which is deprecated for removal since JDK 18.',
            '<b>Leaks</b>: a long-lived map or static field holding strong references is the most common Java memory leak; <code>WeakHashMap</code> can help for caches keyed by identity-like objects.'],
        [['F', 'What is a reference variable?', 'A variable that stores the address of an object on the heap.'],
            ['F', 'Is Java pass by value or by reference?', 'Always by value; for objects the value passed is a copy of the reference.'],
            ['M', 'Difference between soft and weak reference?', 'Soft references survive until memory is low; weak references are cleared at the next GC if no strong reference remains.'],
            ['M', 'What is == on two objects?', 'It compares whether both references point to the same object.'],
            ['S', 'What is a phantom reference for?', 'It is enqueued after the object is finalized and gives no access to it; used for cleanup actions, as Cleaner does.'],
            ['S', 'How can a cache cause an OutOfMemoryError and how do you avoid it?', 'Strong references in an unbounded map keep everything alive; bound it by size or use soft or weak references.']],
        [['Aliasing.',
            r`StringBuilder a = new StringBuilder("hi");
StringBuilder b = a;           // same object, two references
b.append("!");
System.out.println(a + " " + (a == b));
b = null;
System.out.println(a);

// OUTPUT:
// hi! true
// hi!`],
            ['Pass by value of the reference.',
                r`static void change(StringBuilder sb) { sb.append("X"); sb = new StringBuilder("new"); }
StringBuilder s = new StringBuilder("old");
change(s);
System.out.println(s);

// OUTPUT:
// oldX`]],
        [['WeakReference cleared by GC.',
            r`Object big = new Object();
WeakReference<Object> w = new WeakReference<>(big);
System.out.println(w.get() != null);
big = null;
System.gc();                          // a request, usually honored here
System.out.println(w.get());

// OUTPUT: (usually)
// true
// null`],
            ['SoftReference cache.',
                r`SoftReference<byte[]> cache = new SoftReference<>(new byte[10_000_000]);
byte[] data = cache.get();
if (data == null) data = new byte[10_000_000];   // rebuild after clearing
System.out.println(data.length);

// OUTPUT:
// 10000000`]]
    ),

    'stack-vs-heap': x(
        ['<b>Stack</b>: each method call pushes a frame with locals and parameters; the frame is removed when the method returns.',
            '<b>Heap</b>: all objects and arrays live here and are shared by every thread.',
            '<b>Cleanup</b>: stack memory is freed automatically on return; heap memory is freed by the garbage collector.'],
        ['<b>Primitives vs objects</b>: a local <code>int</code> sits in the frame; a local <code>String</code> variable holds a reference into the heap.',
            '<b>StackOverflowError</b>: too-deep recursion fills the stack; <b>OutOfMemoryError</b>: the heap is full.',
            '<b>Sizes</b>: set with <code>-Xss</code> (per thread stack) and <code>-Xms</code> / <code>-Xmx</code> (heap).'],
        ['<b>Thread safety</b>: locals are private to a thread, so they are safe; heap objects need synchronization when shared.',
            '<b>Escape analysis</b> can place non-escaping objects in registers or stack-like storage, so "objects always on the heap" is a model, not a guarantee.',
            '<b>Many threads</b>: total stack memory is threads times <code>-Xss</code>, which matters with thousands of platform threads; virtual threads keep stacks on the heap.'],
        [['F', 'What is stored in the stack?', 'Method frames: local variables, parameters and return information.'],
            ['F', 'What is stored in the heap?', 'Objects and arrays, including their fields.'],
            ['M', 'What causes StackOverflowError?', 'Recursion or call chains that are too deep for the thread stack size.'],
            ['M', 'Is a local variable always safe in multithreading?', 'A primitive or a reference variable is, but the object it points to may be shared and need protection.'],
            ['S', 'How do you tune the stack size?', 'Use -Xss for new threads or the Thread constructor stack size argument; bigger stacks allow deeper recursion but cost memory per thread.'],
            ['S', 'Where do virtual thread stacks live?', 'They are stored as stack chunk objects on the heap while unmounted, and run on a carrier thread stack when mounted.']],
        [['See both areas.',
            r`static int depth;
static void recurse() { depth++; recurse(); }
public static void main(String[] args) {
    int local = 5;                       // stack
    int[] arr = new int[3];              // reference on stack, array on heap
    try { recurse(); }
    catch (StackOverflowError e) { System.out.println("overflow, depth > 1000: " + (depth > 1000)); }
}

// OUTPUT:
// overflow, depth > 1000: true`],
            ['Frame per call.',
                r`static int fact(int n) { return n <= 1 ? 1 : n * fact(n - 1); }
System.out.println(fact(5));    // five frames exist at the deepest point

// OUTPUT:
// 120`]],
        [['Change the stack size.',
            r`// java -Xss256k Deep    vs    java -Xss4m Deep
// Deep prints the depth reached before StackOverflowError
//
// OUTPUT: (varies by JVM and frame size)
// -Xss256k -> depth ~ 2500
// -Xss4m   -> depth ~ 40000`],
            ['Heap exhaustion.',
                r`// java -Xmx64m Fill
List<byte[]> list = new ArrayList<>();
while (true) list.add(new byte[1_000_000]);

// OUTPUT:
// Exception in thread "main" java.lang.OutOfMemoryError: Java heap space`]]
    ),

    'string-pool-java': x(
        ['<b>String pool</b>: a shared table of unique string literals, so <code>"hi"</code> used twice is one object.',
            '<b>Literal vs new</b>: <code>"hi"</code> reuses a pooled object; <code>new String("hi")</code> always makes a new one.',
            '<b>intern()</b>: returns the pooled copy of a string, adding it if missing.'],
        ['<b>Compile-time constants</b>: <code>"a" + "b"</code> is folded to <code>"ab"</code> and pooled; a runtime concatenation is not.',
            '<b>Location</b>: since JDK 7 the pool lives in the heap, so pooled strings can be garbage collected when unreachable.',
            '<b>Why immutable</b>: sharing is only safe because a <code>String</code> cannot change.'],
        ['<b>StringTable</b> is a native hash table; its size is <code>-XX:StringTableSize</code> (default 65536 since JDK 11).',
            '<b>Statistics</b>: <code>-XX:+PrintStringTableStatistics</code> or <code>jcmd &lt;pid&gt; VM.stringtable</code> show size and buckets.',
            '<b>Deduplication</b>: with G1, <code>-XX:+UseStringDeduplication</code> shares the char data of equal strings that are not interned.'],
        [['F', 'Why does "a" == "a" give true?', 'Both literals point to the same pooled String object.'],
            ['F', 'Why is new String("a") == "a" false?', 'new creates a separate heap object; the literal is the pooled one.'],
            ['M', 'What does intern() do?', 'It returns the canonical pooled instance of the string, adding the string to the pool if absent.'],
            ['M', 'Is a + b pooled when a and b are variables?', 'No, it is built at runtime, unless both are compile-time constants such as final variables with constant values.'],
            ['S', 'Is calling intern() on many strings a good idea?', 'Rarely. It costs a table lookup and can bloat the table; use it only for a small set of repeated values.'],
            ['S', 'How does string deduplication differ from interning?', 'Deduplication is done by the G1 GC, shares only the internal byte array and keeps distinct String objects; interning shares the String object itself.']],
        [['Literals and new.',
            r`String a = "java";
String b = "java";
String c = new String("java");
System.out.println((a == b) + " " + (a == c) + " " + (a == c.intern()) + " " + a.equals(c));

// OUTPUT:
// true false true true`],
            ['Constant folding.',
                r`String h = "hel";
final String f = "hel";
String x = "hello";
System.out.println((x == "hel" + "lo") + " " + (x == h + "lo") + " " + (x == f + "lo"));

// OUTPUT:
// true false true`]],
        [['Compare safely.',
            r`String in = new Scanner("yes").next();
System.out.println(in == "yes");        // wrong idea: depends on identity
System.out.println(in.equals("yes"));   // right
System.out.println("yes".equals(in));   // right and null-safe

// OUTPUT:
// false
// true
// true`],
            ['Inspect the string table.',
                r`// jcmd 4242 VM.stringtable
//
// OUTPUT: (varies)
// StringTable statistics:
// Number of buckets       :     65536
// Number of entries       :      7210
// Number of literals      :      7210`]]
    )
};

export const jvm2Deep: Record<string, Deep> = {
    'pc-register-jvm': dv(
        [`<p>The PC register tracks execution per thread.</p><ul><li><b>Interpreter:</b> after each bytecode the JVM advances the bytecode index (bci) of the current frame.</li><li><b>Frames:</b> each frame also remembers its own return bci, so after a call returns the caller continues where it stopped.</li><li><b>JIT code:</b> compiled methods use machine program counters, and the JVM keeps debug maps back to bytecode indexes for stack traces and deoptimization.</li><li><b>Exceptions:</b> the exception table maps a bci range to a handler bci.</li></ul>`,
            r`// javap -c -p Loop   (for: for (int i = 0; i < 3; i++) {})
//
// OUTPUT:
//   0: iconst_0
//   1: istore_1
//   2: iload_1
//   3: iconst_3
//   4: if_icmpge 13
//   7: iinc 1, 1
//  10: goto 2          // PC jumps back: this is the loop
//  13: return`],
        [`<p>Tools that expose the PC / bytecode index:</p><ul><li><b>javap -c:</b> bytecode with offsets.</li><li><b>javap -l:</b> line and local variable tables.</li><li><b>jstack and jcmd Thread.print:</b> show the current line of each thread.</li><li><b>-XX:+PrintAssembly:</b> compiled code (needs the hsdis library).</li><li><b>Debuggers (JDWP):</b> use the bci to place breakpoints.</li></ul>`,
            r`// jcmd 4242 Thread.print
//
// OUTPUT: (varies)
// "worker-1" #21 prio=5 tid=0x... nid=0x... runnable
//    java.lang.Thread.State: RUNNABLE
//     at com.shop.Worker.compute(Worker.java:42)
//     at com.shop.Worker.run(Worker.java:18)`],
        [`<p>Common mistakes:</p><ul><li><b>Thinking the PC is shared:</b> it is per thread, which is why code position is never lost on a context switch.</li><li><b>Expecting OutOfMemoryError from it:</b> it is fixed size; look at heap, metaspace or thread count instead.</li><li><b>Trusting line numbers after obfuscation:</b> stripped debug info shows <code>Unknown Source</code>; keep the mapping file.</li><li><b>Reading a thread dump as a snapshot of one instant:</b> threads are stopped at safepoints, so the line is the nearest safepoint.</li></ul>`,
            r`// ProGuard / javac -g:none removes LineNumberTable
// Fix: compile with javac -g (default keeps lines) and keep the mapping file.
//
// OUTPUT (stripped build):
// at com.shop.Order.total(Unknown Source)
// OUTPUT (default build):
// at com.shop.Order.total(Order.java:57)`],
        [`<p>The PC register itself is never a tuning target, but its effects are:</p><ul><li><b>Context switches:</b> far too many runnable threads waste CPU saving and restoring state.</li><li><b>Safepoints:</b> threads must reach a safepoint poll; long counted loops delayed this in old JVMs.</li><li><b>JIT:</b> hot loops are compiled so the bytecode PC is no longer stepped one instruction at a time.</li></ul>`,
            r`// -Xlog:safepoint to see pause causes
// java -Xlog:safepoint -jar app.jar
//
// OUTPUT: (varies)
// [2.101s][info][safepoint] Safepoint "G1CollectForAllocation", Time since last: 812345 ns,
//   Reaching safepoint: 120100 ns, At safepoint: 2400000 ns`],
        [`<p>Scenario: a production thread seems stuck. Take three thread dumps a few seconds apart.</p><ul><li>If the same method and line appear each time, that thread is stuck or looping there.</li><li>If the line changes, the thread is working and the problem is elsewhere.</li></ul>`,
            r`// jcmd 4242 Thread.print   (3 times, 5 seconds apart)
//
// OUTPUT: (varies)
// dump 1: at com.shop.Pricing.recalc(Pricing.java:88)
// dump 2: at com.shop.Pricing.recalc(Pricing.java:88)
// dump 3: at com.shop.Pricing.recalc(Pricing.java:88)
// => the loop at line 88 never advances`]
    ),

    'native-method-stack-jvm': dv(
        [`<p>How a native call works in HotSpot.</p><ul><li><b>Binding:</b> the JVM looks up the symbol, for example <code>Java_Hello_greet</code>, in loaded libraries on the first call.</li><li><b>Transition:</b> the thread changes state from "in Java" to "in native"; the GC may run while it is in native code.</li><li><b>Stack:</b> native frames sit on the same OS thread stack as Java frames; there is no separate stack in HotSpot.</li><li><b>References:</b> JNI passes handles, not raw pointers, so the GC can move objects.</li></ul>`,
            r`// javah is gone; generate the header with: javac -h . Hello.java
//
// OUTPUT: Hello.h contains
// JNIEXPORT void JNICALL Java_Hello_greet(JNIEnv *, jclass);`],
        [`<p>Ways to call native code:</p><ul><li><b>JNI:</b> the classic way; a header and compiled library are needed.</li><li><b>JNA:</b> a third-party library that avoids writing C glue.</li><li><b>Foreign Function and Memory API:</b> <code>java.lang.foreign</code>, preview in JDK 21 and final in JDK 22.</li><li><b>Direct ByteBuffer:</b> off-heap memory without native code.</li></ul>`,
            r`// JDK 22+ (java.lang.foreign) call to C strlen
Linker linker = Linker.nativeLinker();
MethodHandle strlen = linker.downcallHandle(
    linker.defaultLookup().find("strlen").orElseThrow(),
    FunctionDescriptor.of(ValueLayout.JAVA_LONG, ValueLayout.ADDRESS));
try (Arena arena = Arena.ofConfined()) {
    MemorySegment s = arena.allocateUtf8String("hello");
    System.out.println((long) strlen.invokeExact(s));
}

// OUTPUT:
// 5`],
        [`<p>Common mistakes:</p><ul><li><b>Wrong library name or path:</b> <code>UnsatisfiedLinkError</code>; check <code>-Djava.library.path</code>.</li><li><b>Wrong signature:</b> the C function name must match the mangled name exactly.</li><li><b>Leaking local references:</b> in long native loops, release them with <code>DeleteLocalRef</code>.</li><li><b>Blaming the heap:</b> an OOM with free heap may be native memory.</li></ul>`,
            r`// java.lang.OutOfMemoryError: unable to create native thread
// Cause: too many threads times -Xss, or an OS limit (ulimit -u).
// Fix: pool threads, lower -Xss, raise OS limits, or use virtual threads.
//
// OUTPUT:
// Exception in thread "main" java.lang.OutOfMemoryError: unable to create native thread`],
        [`<p>Tuning points:</p><ul><li><b>Call cost:</b> a JNI call costs far more than a normal call, so batch work into one native call.</li><li><b>Direct buffers:</b> reuse them; allocation and freeing is expensive.</li><li><b>Stack size:</b> keep <code>-Xss</code> small for many threads.</li><li><b>Limit:</b> <code>-XX:MaxDirectMemorySize</code> caps direct buffers.</li></ul>`,
            r`// java -Xss512k -XX:MaxDirectMemorySize=256m -jar app.jar
// 2000 threads x 512 KB = about 1 GB of reserved stack (not all committed)
//
// OUTPUT: (jcmd VM.native_memory, varies)
// -  Thread (reserved=1030MB, committed=60MB)`],
        [`<p>Scenario: a service shows a RSS of 6 GB with an <code>-Xmx</code> of 2 GB.</p><ul><li>Enable NMT and take a baseline, then a diff after load.</li><li>If <b>Internal</b> or <b>Other</b> grows, suspect direct buffers or a native library.</li><li>If <b>Thread</b> grows, suspect thread leaks.</li></ul>`,
            r`// jcmd 4242 VM.native_memory baseline
// ... run load ...
// jcmd 4242 VM.native_memory summary.diff
//
// OUTPUT: (varies)
// -  Other (reserved=+1800MB, committed=+1800MB)   <- direct buffers leak`]
    ),

    'object-creation-memory': dv(
        [`<p>What <code>new Foo()</code> does inside HotSpot.</p><ul><li><b>Bytecode:</b> <code>new</code>, <code>dup</code>, <code>invokespecial &lt;init&gt;</code>.</li><li><b>Class check:</b> the class must be loaded and initialized.</li><li><b>Allocation:</b> the fast path bumps the TLAB pointer; if the TLAB is full, a new one is requested, and if the heap is full, a GC runs.</li><li><b>Zeroing:</b> memory is cleared, then the header (mark word, class pointer) is set.</li><li><b>Constructor:</b> <code>&lt;init&gt;</code> runs and fields get their values.</li></ul>`,
            r`// javap -c Main   for: Foo f = new Foo(3);
//
// OUTPUT:
//   0: new           #7    // class Foo
//   3: dup
//   4: iconst_3
//   5: invokespecial #9    // Method Foo."<init>":(I)V
//   8: astore_1`],
        [`<p>Ways an object comes into existence:</p><ul><li><b>new:</b> the normal way.</li><li><b>Class.newInstance / Constructor.newInstance:</b> reflection.</li><li><b>clone():</b> copies without calling the constructor.</li><li><b>Deserialization:</b> builds the object without its own constructor.</li><li><b>Factory methods and records:</b> hide <code>new</code> behind a static method.</li><li><b>Array creation:</b> <code>new int[n]</code> uses <code>newarray</code>.</li></ul>`,
            r`record Pt(int x, int y) {}
Pt p = new Pt(1, 2);
Constructor<Pt> c = Pt.class.getDeclaredConstructor(int.class, int.class);
Pt q = c.newInstance(1, 2);              // reflection
System.out.println(p.equals(q) + " " + (p == q));

// OUTPUT:
// true false`],
        [`<p>Common mistakes:</p><ul><li><b>Calling an overridable method in a constructor:</b> the subclass field is still at its default.</li><li><b>Allocating in a hot loop:</b> <code>new Integer</code> or short-lived temp objects; use primitives.</li><li><b>Creating an object per call:</b> for expensive objects like <code>Pattern</code> or <code>DateTimeFormatter</code>, make them <code>static final</code>.</li><li><b>Assuming zero size:</b> an empty object still takes 16 bytes.</li></ul>`,
            r`class A { A() { show(); } void show() {} }
class B extends A {
    String name = "bee";
    void show() { System.out.println(name); }   // runs before name is set
}
new B();

// OUTPUT:
// null`],
        [`<p>Allocation tuning:</p><ul><li><b>Reduce garbage:</b> fewer short-lived objects means fewer young collections.</li><li><b>Compressed oops:</b> heaps under about 32 GB keep 4-byte references; crossing it makes references 8 bytes.</li><li><b>Watch allocation rate:</b> use JFR (<code>jdk.ObjectAllocationSample</code>) or GC logs.</li><li><b>Layout:</b> group fields to cut padding; use primitives over wrappers.</li></ul>`,
            r`// java -Xlog:gc -Xmx512m -jar app.jar
//
// OUTPUT: (varies)
// [1.204s][info][gc] GC(7) Pause Young (Normal) (G1 Evacuation Pause) 180M->12M(512M) 3.2ms
// Allocation rate = (young before - young after) / interval`],
        [`<p>Scenario: an API endpoint is slow under load and GC shows many young collections.</p><ul><li>Record with JFR and find the top allocation sites.</li><li>Replace per-request regex compilation and string formatting with cached objects and <code>StringBuilder</code>.</li></ul>`,
            r`// Before: compiles a regex on every request
boolean ok(String s) { return Pattern.compile("[a-z]+").matcher(s).matches(); }
// After: compile once
private static final Pattern WORD = Pattern.compile("[a-z]+");
boolean ok2(String s) { return WORD.matcher(s).matches(); }

// OUTPUT: (varies)
// allocation rate before: 900 MB/s, after: 150 MB/s`]
    ),

    'references-in-java': dv(
        [`<p>How the GC treats reference strengths.</p><ul><li><b>Strong:</b> the object is a GC root path target and stays.</li><li><b>Soft:</b> kept until the GC needs memory; the policy uses <code>-XX:SoftRefLRUPolicyMSPerMB</code> (default 1000 ms per free MB).</li><li><b>Weak:</b> cleared when the object is only weakly reachable.</li><li><b>Phantom:</b> enqueued after the object is finalized; <code>get()</code> always returns <code>null</code>.</li><li><b>Queues:</b> the GC enqueues cleared references on a <code>ReferenceQueue</code>.</li></ul>`,
            r`ReferenceQueue<Object> q = new ReferenceQueue<>();
Object o = new Object();
WeakReference<Object> w = new WeakReference<>(o, q);
o = null;
System.gc();
Thread.sleep(100);
System.out.println(q.poll() == w);

// OUTPUT: (usually)
// true`],
        [`<p>Reference types and helpers:</p><ul><li><b>SoftReference:</b> memory-sensitive caches.</li><li><b>WeakReference / WeakHashMap:</b> canonical maps, listener registries.</li><li><b>PhantomReference + Cleaner:</b> run cleanup after unreachable.</li><li><b>Optional:</b> a safer holder than <code>null</code> for return values.</li><li><b>Objects.requireNonNull:</b> fail fast on null.</li></ul>`,
            r`Cleaner cleaner = Cleaner.create();
class Res implements AutoCloseable {
    private final Cleaner.Cleanable c;
    Res() { c = cleaner.register(this, () -> System.out.println("native freed")); }
    public void close() { c.clean(); }
}
try (Res r = new Res()) { System.out.println("using"); }

// OUTPUT:
// using
// native freed`],
        [`<p>Common mistakes:</p><ul><li><b>Using finalize():</b> slow, unpredictable and deprecated for removal; use try-with-resources and <code>Cleaner</code>.</li><li><b>Weak reference to a value you only hold weakly:</b> the cache empties at once.</li><li><b>Key referenced by its own value in a WeakHashMap:</b> the entry never goes away.</li><li><b>Static collections that only grow:</b> a classic leak.</li><li><b>Relying on System.gc():</b> it is only a hint.</li></ul>`,
            r`static final Map<Long, byte[]> CACHE = new HashMap<>();   // leaks: never evicts
// Fix: bounded LRU
static final Map<Long, byte[]> LRU = new LinkedHashMap<>(16, 0.75f, true) {
    protected boolean removeEldestEntry(Map.Entry<Long, byte[]> e) { return size() > 1000; }
};
LRU.put(1L, new byte[10]);
System.out.println(LRU.size());

// OUTPUT:
// 1`],
        [`<p>Tuning notes:</p><ul><li><b>Soft references</b> make GC behavior harder to predict; prefer a sized cache (Caffeine) for most cases.</li><li><b>Many reference objects</b> add reference-processing time to GC pauses.</li><li><b>Check logs:</b> <code>-Xlog:gc+ref=debug</code> shows reference processing time.</li></ul>`,
            r`// java -Xlog:gc+ref=debug -jar app.jar
//
// OUTPUT: (varies)
// [gc,ref] GC(3) SoftReference 0.1ms
// [gc,ref] GC(3) WeakReference 0.1ms
// [gc,ref] GC(3) PhantomReference 0.0ms`],
        [`<p>Scenario: heap grows until OOM after a few days. Take a heap dump and look at the dominator tree.</p><ul><li>Find the biggest retained set, then the path to GC roots.</li><li>A static map or a listener list holding strong references is the usual cause.</li></ul>`,
            r`// jcmd 4242 GC.heap_dump /tmp/app.hprof
// Open in Eclipse MAT: Leak Suspects report
//
// OUTPUT: (varies)
// Problem Suspect 1: one instance of "com.shop.SessionCache" retains 1.4 GB (78%)
// Path to GC root: static field SessionCache.INSTANCE`]
    ),

    'stack-vs-heap': dv(
        [`<p>Internals of the two areas.</p><ul><li><b>Stack frame:</b> local variable array, operand stack and frame data, all sized at compile time.</li><li><b>Per thread:</b> created with the thread, reserved by <code>-Xss</code>, and grown by the OS as needed.</li><li><b>Heap:</b> shared, split into generations or regions by the collector, and grows between <code>-Xms</code> and <code>-Xmx</code>.</li><li><b>Reference:</b> a frame slot holds either a primitive value or a reference into the heap.</li></ul>`,
            r`// javap -c -v Frame   for: static int f(int a, int b) { int c = a + b; return c; }
//
// OUTPUT:
//   stack=2, locals=3, args_size=2
//   (stack=2 : max operand stack depth, locals=3 : a, b and c)`],
        [`<p>Sizing options:</p><ul><li><b>-Xss:</b> stack size of new threads (default 1 MB on 64-bit Linux).</li><li><b>-Xms / -Xmx:</b> initial and maximum heap.</li><li><b>-XX:MaxRAMPercentage:</b> heap as a share of container memory.</li><li><b>-XX:+HeapDumpOnOutOfMemoryError:</b> dump the heap when it fills.</li><li><b>Thread constructor:</b> a per-thread stack size hint.</li></ul>`,
            r`Thread t = new Thread(null, () -> System.out.println("deep thread"),
                       "deep", 64L * 1024 * 1024);   // 64 MB stack hint
t.start();

// java -XX:MaxRAMPercentage=75 -XX:+HeapDumpOnOutOfMemoryError -jar app.jar
//
// OUTPUT:
// deep thread`],
        [`<p>Common mistakes:</p><ul><li><b>Saying "objects are on the stack":</b> only the reference is, unless the JIT scalar-replaces the object.</li><li><b>Raising -Xss to hide infinite recursion:</b> fix the base case instead.</li><li><b>Large local arrays in recursion:</b> the array is on the heap, but deep recursion still overflows with big frames.</li><li><b>Sharing a mutable heap object between threads without a lock.</b></li><li><b>Setting -Xmx equal to container memory:</b> there is no room left for metaspace and thread stacks.</li></ul>`,
            r`static int sum(int n) { return n + sum(n - 1); }    // no base case
// Fix: add the base case, or loop
static int sum2(int n) { int s = 0; for (int i = 1; i <= n; i++) s += i; return s; }
System.out.println(sum2(100_000));

// OUTPUT:
// 705082704`],
        [`<p>Tuning:</p><ul><li><b>Prefer iteration</b> over deep recursion; the JVM does not eliminate tail calls.</li><li><b>Small frames:</b> fewer locals means more depth per MB.</li><li><b>Right-size the heap:</b> too small gives frequent GC; too large gives long pauses on some collectors.</li><li><b>Many tasks:</b> use virtual threads (JDK 21) instead of thousands of large platform stacks.</li></ul>`,
            r`try (var ex = Executors.newVirtualThreadPerTaskExecutor()) {
    for (int i = 0; i < 10_000; i++) ex.submit(() -> Thread.sleep(100));
}
System.out.println("done");

// OUTPUT:
// done`],
        [`<p>Scenario: a JSON parser fails with <code>StackOverflowError</code> on deeply nested input.</p><ul><li>Cap nesting depth and reject hostile input.</li><li>If the depth is legitimate, parse in a thread with a larger stack, or convert to an explicit stack on the heap.</li></ul>`,
            r`Deque<Node> stack = new ArrayDeque<>();      // explicit stack lives on the heap
stack.push(root);
while (!stack.isEmpty()) {
    Node n = stack.pop();
    process(n);
    for (Node c : n.children()) stack.push(c);
}

// OUTPUT:
// no StackOverflowError, however deep the tree is`]
    ),

    'string-pool-java': dv(
        [`<p>How the pool works.</p><ul><li><b>Literals:</b> a string literal sits in the class constant pool; the first time it is resolved, the JVM looks it up in the StringTable or adds it.</li><li><b>ldc:</b> the bytecode that loads a constant, giving the same object each time.</li><li><b>Storage:</b> the String objects are on the heap; the table holds weak references so unused entries can be collected.</li><li><b>Representation:</b> since JDK 9 a String stores bytes with a coder (Latin-1 or UTF-16).</li></ul>`,
            r`// javap -c Main  for: String a = "java"; String b = "java";
//
// OUTPUT:
//   0: ldc  #7    // String java
//   2: astore_1
//   3: ldc  #7    // String java      <- same constant pool entry`],
        [`<p>Ways to get a String and what each does:</p><ul><li><b>Literal:</b> pooled.</li><li><b>new String(s):</b> new object, rarely needed.</li><li><b>intern():</b> pooled copy.</li><li><b>+ with constants:</b> folded and pooled.</li><li><b>StringBuilder.toString():</b> new object.</li><li><b>String.valueOf / concat:</b> new object.</li><li><b>Text block:</b> a literal, pooled.</li></ul>`,
            r`String lit = "ab";
String built = new StringBuilder("a").append("b").toString();
System.out.println(lit == built);
System.out.println(lit == built.intern());
String tb = """
    ab""";
System.out.println(lit == tb);

// OUTPUT:
// false
// true
// true`],
        [`<p>Common mistakes:</p><ul><li><b>Comparing with ==:</b> works by accident for literals and fails for runtime strings; use <code>equals</code>.</li><li><b>Interning every input string:</b> it grows the table and slows lookups.</li><li><b>Using new String(literal):</b> it only wastes memory.</li><li><b>Concatenating in a loop:</b> creates many temporary Strings; use <code>StringBuilder</code>.</li><li><b>Storing secrets as Strings:</b> they stay in memory until collected; prefer <code>char[]</code> that you clear.</li></ul>`,
            r`String s = "";
for (int i = 0; i < 5; i++) s += i;          // new String each pass (javac may hide this)
StringBuilder sb = new StringBuilder();
for (int i = 0; i < 5; i++) sb.append(i);    // one buffer
System.out.println(s.equals(sb.toString()));

// OUTPUT:
// true`],
        [`<p>Tuning:</p><ul><li><b>Table size:</b> if you intern many strings, raise <code>-XX:StringTableSize</code> to a prime near the expected count to keep buckets short.</li><li><b>Dedup:</b> try <code>-XX:+UseStringDeduplication</code> with G1 when heap dumps show many duplicate strings.</li><li><b>Compact strings:</b> on by default; <code>-XX:-CompactStrings</code> disables them.</li><li><b>Concatenation:</b> since JDK 9 javac uses <code>invokedynamic</code> (StringConcatFactory), which is fast for simple cases.</li></ul>`,
            r`// java -XX:+UseG1GC -XX:+UseStringDeduplication -Xlog:stringdedup*=debug -jar app.jar
//
// OUTPUT: (varies)
// [stringdedup] Concurrent String Deduplication 24.0M->18.5M (-5.5M)`],
        [`<p>Scenario: a heap dump shows 300 MB of duplicate country and status strings read from a database.</p><ul><li>Intern the small, fixed set at read time, or use an enum.</li><li>Or enable G1 deduplication with no code change.</li></ul>`,
            r`private static final Map<String, String> CANON = new ConcurrentHashMap<>();
static String canon(String s) { return CANON.computeIfAbsent(s, k -> k); }
String a = canon(new String("IN"));
String b = canon(new String("IN"));
System.out.println(a == b);

// OUTPUT:
// true`]
    )
};
