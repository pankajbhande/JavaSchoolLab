import { Topic } from '../coreJava';

export const staticVariablesMemory: Topic = {
    id: 'static-variables-memory',
    name: 'Static Variables',
    beginner: [
        {
            content: `<h3>What Does <code>static</code> Mean?</h3>
Normally, every object gets its own copy of a class's fields. But mark a field <strong>static</strong> and
something different happens: instead of belonging to each object, it belongs to the <em>class itself</em>.
There is only ONE copy of it, no matter how many objects you create.`
        },
        {
            content: `<h3>Static Variables Are Shared Across All Objects</h3>
Every instance of the class sees and shares the exact same static variable. Changing it through one object
is visible through every other object too.`,
            codeExamples: [`public class Counter {
    static int totalCount = 0; // ONE shared copy for the whole class
    int id;

    Counter() {
        totalCount++;      // shared counter increments
        id = totalCount;   // each object still gets its own 'id'
    }

    public static void main(String[] args) {
        Counter c1 = new Counter();
        Counter c2 = new Counter();
        Counter c3 = new Counter();

        System.out.println("c1.id = " + c1.id + ", c2.id = " + c2.id + ", c3.id = " + c3.id);
        System.out.println("totalCount = " + Counter.totalCount);
    }
}
// OUTPUT:
// c1.id = 1, c2.id = 2, c3.id = 3
// totalCount = 3`]
        },
        {
            content: `<h3>You Don't Need an Object to Access a Static Variable</h3>
Because a static variable belongs to the class, not to any object, you can access it directly through the
class name - even before any object has been created.`,
            codeExamples: [`public class Config {
    static String appName = "SchoolApp";

    public static void main(String[] args) {
        System.out.println(Config.appName); // accessed via class name, no 'new' needed
    }
}
// OUTPUT:
// SchoolApp`]
        },
        {
            content: `<h3>Static Variables Exist Even With Zero Objects</h3>
A static variable is created once when the class is loaded by the JVM, and it keeps its value even if no
objects of that class currently exist.`,
            codeExamples: [`public class LoginTracker {
    static int loginAttempts = 0;

    static void recordLogin() {
        loginAttempts++;
    }

    public static void main(String[] args) {
        LoginTracker.recordLogin();
        LoginTracker.recordLogin();
        System.out.println("Attempts so far: " + LoginTracker.loginAttempts);
        // notice: we never created a single 'new LoginTracker()' object
    }
}
// OUTPUT:
// Attempts so far: 2`]
        }
    ],

    expert: [
        {
            content: `<h3>Where Static Variables Actually Live</h3>
Static variables are stored in an area of memory tied to the <strong>Class object's metadata</strong>,
managed by the Metaspace (Java 8+) or historically PermGen (Java 7 and earlier). Specifically: <br>
• The metadata describing the class layout lives in Metaspace. <br>
• The actual static variable <em>values</em> live as part of the class's representation on the Heap in
modern JVMs, conceptually attached to the <code>Class</code> object for that class. <br>
• They are created when the class is first loaded/initialized, and destroyed only when the class is
unloaded (which, for normal application classes, is effectively "never" until JVM shutdown).`
        },
        {
            content: `<h3>Class Loading and Static Initialization Order</h3>
Static variables are initialized in the exact textual order they appear, interleaved with any static
initializer blocks, the very first time the class is loaded (referenced for the first time by the JVM).`,
            codeExamples: [`public class StaticInitOrderDemo {
    static int a = 10;
    static int b;

    static {
        System.out.println("Static block running, a = " + a);
        b = a * 2;
    }

    static int c = a + b;

    public static void main(String[] args) {
        System.out.println("a=" + a + " b=" + b + " c=" + c);
    }
}
// OUTPUT:
// Static block running, a = 10
// a=10 b=20 c=30`]
        },
        {
            content: `<h3>Static Memory Layout Diagram</h3>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Metaspace                       Heap
+----------------------+        +---------------------------+
| Counter.class layout |        | Counter object #1          |
|  method bytecode      |        |  id = 1                    |
|  field descriptors    |        +---------------------------+
+----------------------+        | Counter object #2          |
          |                      |  id = 2                    |
          |  (Class object)      +---------------------------+
          v
  static totalCount = 3   <-- ONE value, tied to the class,
                               NOT duplicated per object above</pre>`
        },
        {
            content: `<h3>Static vs Instance Variables: Storage Comparison</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>Static Variable</th><th>Instance Variable</th></tr>
<tr class='text-center'><td>Copies</td><td>One per class</td><td>One per object</td></tr>
<tr class='text-center'><td>Created when</td><td>Class is loaded/initialized</td><td>Each time <code>new</code> runs</td></tr>
<tr class='text-center'><td>Destroyed when</td><td>Class unloaded (rare) / JVM shuts down</td><td>Object becomes unreachable and is GC'd</td></tr>
<tr class='text-center'><td>Access</td><td>ClassName.field (or via instance, discouraged)</td><td>instance.field only</td></tr>
<tr class='text-center'><td>Lifetime relative to objects</td><td>Can outlive every object of the class</td><td>Tied strictly to its own object</td></tr>
</table>`
        },
        {
            content: `<h3>Static Memory Leaks - A Real Production Hazard</h3>
Because static fields live for (almost) the entire lifetime of the application, anything you store in a
static collection and forget to remove becomes a classic, hard-to-diagnose memory leak: <br><br>
• A <code>static List</code> or <code>static Map</code> used as a "cache" that only ever grows, never
evicting old entries. <br>
• Static references to listeners/callbacks that outlive the objects that registered them, preventing those
objects from ever being garbage collected. <br>
• <code>ThreadLocal</code> variables stored statically in thread-pooled environments (e.g. web servers) that
are never cleared, silently accumulating request-scoped data across requests. <br><br>
Because the GC sees a live static reference as a permanent GC root, none of these objects are ever
collected, no matter how much memory pressure builds up - eventually leading to
<code>OutOfMemoryError</code>.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What does the <code>static</code> keyword mean for a variable?</td><td>The variable belongs to the class itself, with a single shared copy across all instances, instead of one copy per object</td></tr>
<tr><td>Where do static variables live in modern JVMs?</td><td>Their metadata lives in Metaspace; their values are effectively part of the Class object's representation on the Heap</td></tr>
<tr><td>When are static variables initialized?</td><td>Once, the first time the class is loaded/initialized by the JVM, in textual order interleaved with static blocks</td></tr>
<tr><td>Can you access a static variable without creating an object?</td><td>Yes, directly via <code>ClassName.field</code>, since it doesn't belong to any specific instance</td></tr>
<tr><td>Why are static fields a common source of memory leaks?</td><td>They act as permanent GC roots for the life of the class, so anything referenced from them (e.g. a growing static cache) is never collected</td></tr>
<tr><td>What replaced PermGen for static/class metadata since Java 8?</td><td>Metaspace, which is allocated from native memory and grows dynamically instead of a fixed-size PermGen</td></tr>
<tr><td>Is a static variable shared across threads?</td><td>Yes - since it's one copy per class (not per thread), concurrent modification from multiple threads requires synchronization</td></tr>
</table>`
        }
    ]
};
