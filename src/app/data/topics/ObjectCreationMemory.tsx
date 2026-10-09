import { Topic } from '../coreJava';

export const objectCreationMemory: Topic = {
    id: 'object-creation-memory',
    name: 'Object Creation',
    beginner: [
        {
            content: `<h3>What Happens When You Write <code>new</code>?</h3>
Every time you use the <strong>new</strong> keyword in Java, the JVM does a small sequence of work behind the
scenes to build you a brand-new object in memory. <br><br>
Think of a class as a <em>blueprint</em> (like a house plan) and an object as the <em>actual house</em> built
from that plan. The <code>new</code> keyword is the construction crew that turns the plan into a real house
sitting on a real plot of land (memory).`
        },
        {
            content: `<h3>The Object Creation Steps</h3>
When the JVM executes <code>new Student()</code>, it roughly performs these steps: <br><br>
• <strong>Step 1:</strong> Allocate a block of memory on the Heap large enough for the object. <br>
• <strong>Step 2:</strong> Set all fields to their default values (0, false, null etc). <br>
• <strong>Step 3:</strong> Run the constructor code to initialize the fields with real values. <br>
• <strong>Step 4:</strong> Return a reference (memory address) to the newly created object.`,
            codeExamples: [`public class Student {
    int rollNumber;
    String name;

    Student(int rollNumber, String name) {
        this.rollNumber = rollNumber;
        this.name = name;
    }

    public static void main(String[] args) {
        Student s1 = new Student(101, "Aisha");
        System.out.println("Roll: " + s1.rollNumber + ", Name: " + s1.name);
    }
}
// OUTPUT:
// Roll: 101, Name: Aisha`]
        },
        {
            content: `<h3>Every Object Has a Little "Header" Too</h3>
Besides your own fields (rollNumber, name), every object secretly carries a small amount of extra bookkeeping
data called the <strong>object header</strong>. It stores things like: <br>
• A hash code (used by <code>hashCode()</code>). <br>
• Locking information (used when the object is synchronized). <br>
• A pointer back to the object's class (so the JVM knows "this is a Student"). <br><br>
You never access the header directly - it's managed entirely by the JVM - but it's part of why even an
"empty" object still takes up some memory.`
        },
        {
            content: `<h3>Default Values Before the Constructor Runs</h3>
A common beginner surprise: fields are NOT left "empty" or garbage before your constructor runs. The JVM
zeroes them out first (Step 2 above), then your constructor overwrites them.`,
            codeExamples: [`public class DefaultValuesDemo {
    int count;      // defaults to 0
    boolean active; // defaults to false
    String label;   // defaults to null

    public static void main(String[] args) {
        DefaultValuesDemo d = new DefaultValuesDemo();
        System.out.println("count = " + d.count);
        System.out.println("active = " + d.active);
        System.out.println("label = " + d.label);
    }
}
// OUTPUT:
// count = 0
// active = false
// label = null`]
        },
        {
            content: `<h3>Each <code>new</code> Creates a Separate Object</h3>
Calling <code>new</code> twice always produces two completely independent objects in memory, even if their
field values are identical.`,
            codeExamples: [`public class SeparateObjectsDemo {
    int value;

    SeparateObjectsDemo(int value) {
        this.value = value;
    }

    public static void main(String[] args) {
        SeparateObjectsDemo a = new SeparateObjectsDemo(5);
        SeparateObjectsDemo b = new SeparateObjectsDemo(5);

        System.out.println(a == b); // compares memory addresses, not values
    }
}
// OUTPUT:
// false`]
        }
    ],

    expert: [
        {
            content: `<h3>Deep Dive: JVM-Level Object Allocation</h3>
At the bytecode level, <code>new Student(101, "Aisha")</code> actually compiles into two separate bytecode
instructions: <br><br>
• <code>new</code> - allocates raw, zeroed memory on the heap for the object and pushes a reference to it
onto the operand stack. <br>
• <code>invokespecial</code> - calls the constructor (<code>&lt;init&gt;</code>) on that freshly allocated
memory to actually initialize it. <br><br>
This two-step split matters: the object technically "exists" on the heap (with all-default field values)
for a brief moment before the constructor has even started running.`
        },
        {
            content: `<h3>Where Allocation Actually Happens: TLAB</h3>
Modern JVMs rarely allocate directly from a shared, lock-protected heap region for every single object -
that would cause heavy thread contention. Instead, each thread gets its own small private chunk of the
Young Generation called a <strong>TLAB (Thread-Local Allocation Buffer)</strong>. <br><br>
• Small, short-lived objects are usually "bump allocated" inside the thread's TLAB - just moving a pointer
forward, extremely fast, no locking needed. <br>
• When a TLAB fills up, the thread requests a new TLAB from the shared heap (this does need a small amount
of synchronization). <br>
• Very large objects (bigger than a threshold) may bypass TLABs and allocate directly in the shared heap,
or even go straight to the Old Generation.`
        },
        {
            content: `<h3>Object Layout in Memory</h3>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Heap memory for a Student object (conceptual, HotSpot-style)

+------------------------------+
|  Object Header                |
|   - Mark Word (hash, lock)    |
|   - Klass Pointer (-> Class)  |
+------------------------------+
|  Instance Fields               |
|   - int rollNumber = 101       |
|   - String name  -> "Aisha"    |
+------------------------------+
|  Padding (alignment to 8B)     |
+------------------------------+</pre>
The header typically costs 12-16 bytes (depending on JVM/compressed-oops settings) before your own fields
even start - this is why a "tiny" object is never truly free.`
        },
        {
            content: `<h3>Allocation Strategies Compared</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Strategy</th><th>Where</th><th>Speed</th><th>Used For</th></tr>
<tr class='text-center'><td>TLAB bump allocation</td><td>Thread-local slice of Eden</td><td>Very fast (pointer bump)</td><td>Small, short-lived objects (most objects)</td></tr>
<tr class='text-center'><td>Shared Eden allocation</td><td>Eden space, synchronized</td><td>Slower (contention)</td><td>When a thread's TLAB is exhausted</td></tr>
<tr class='text-center'><td>Direct Old Gen / humongous</td><td>Old Generation</td><td>Slowest, triggers GC pressure</td><td>Very large objects, e.g. big arrays</td></tr>
<tr class='text-center'><td>Escape-analyzed scalar replacement</td><td>Stack / registers (no heap at all)</td><td>Fastest possible</td><td>Objects the JIT proves never "escape" a method</td></tr>
</table>`
        },
        {
            content: `<h3>Common Bugs and Misconceptions</h3>
• <strong>"Object creation is basically free."</strong> Not true - even fast TLAB allocation still adds GC
pressure later; creating millions of short-lived objects in a hot loop (e.g. boxing primitives, building
Strings with <code>+</code> in a loop) is a classic performance bug. <br>
• <strong>Believing fields hold garbage before the constructor runs.</strong> The JVM guarantees zeroing
first - you can never see uninitialized garbage memory in Java, unlike C/C++. <br>
• <strong>Assuming <code>new</code> always hits the heap.</strong> With escape analysis and scalar
replacement, the JIT compiler can sometimes eliminate heap allocation entirely for objects proven to stay
local to a method. <br>
• <strong>Forgetting that constructors can throw before fully initializing an object</strong>, leaving a
half-initialized (but already heap-allocated) object referenced by nothing, ready to be garbage collected.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What are the steps the JVM performs on <code>new</code>?</td><td>Allocate zeroed memory, set default field values, run the constructor, return a reference to the caller</td></tr>
<tr><td>What bytecode instructions does <code>new Foo()</code> compile to?</td><td><code>new</code> (allocate memory) followed by <code>invokespecial</code> (call the constructor)</td></tr>
<tr><td>What is a TLAB?</td><td>Thread-Local Allocation Buffer - a small per-thread slice of Eden space used for fast, lock-free object allocation</td></tr>
<tr><td>What is stored in an object's header?</td><td>The mark word (hash code, lock state, GC age) and a pointer to the object's class (Klass pointer)</td></tr>
<tr><td>Are object fields guaranteed to be zeroed before the constructor runs?</td><td>Yes, the JVM always zeroes fields first, so Java never exposes uninitialized/garbage memory</td></tr>
<tr><td>Can the JVM avoid heap allocation entirely for some objects?</td><td>Yes, via escape analysis and scalar replacement, if the JIT proves the object never escapes the method</td></tr>
<tr><td>Why is creating millions of short-lived objects in a loop a performance concern?</td><td>Even fast TLAB allocation increases minor GC frequency and pause time due to higher allocation pressure</td></tr>
</table>`
        }
    ]
};
