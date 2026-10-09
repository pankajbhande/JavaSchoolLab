import { Topic } from '../coreJava';

export const methodAreaJvm: Topic = {
    id: 'method-area-jvm',
    name: 'Method Area',
    beginner: [
        {
            content: `<h3>What is the Method Area?</h3>
The <strong>Method Area</strong> is the part of JVM memory that stores information <em>about the classes</em>
themselves, rather than the objects created from them. It is shared by all threads in the application, just
like the Heap.`
        },
        {
            content: `<h3>What is Stored in the Method Area?</h3>
• <strong>Class structure</strong> - the class's name, its parent class, and which interfaces it implements. <br>
• <strong>Method code</strong> - the actual compiled bytecode for every method in the class. <br>
• <strong>Static variables</strong> - fields declared with the <code>static</code> keyword, since they belong to
the class itself, not to any one object. <br>
• <strong>Runtime Constant Pool</strong> - a table of constants (literals, references) used by the class,
resolved at runtime.`
        },
        {
            content: `<h3>A Simple Example</h3>
Static variables are a good example of something stored in the Method Area rather than on the Heap with regular
objects.`,
            codeExamples: [`public class MethodAreaDemo {

    static int counter = 0; // stored in the Method Area, one copy shared by all objects

    MethodAreaDemo() {
        counter++;
    }

    public static void main(String[] args) {
        new MethodAreaDemo();
        new MethodAreaDemo();
        new MethodAreaDemo();

        System.out.println("Total objects created: " + counter);
    }
}
// OUTPUT:
// Total objects created: 3`]
        },
        {
            content: `<h3>Method Area vs Heap</h3>
It's easy to confuse these two shared areas, but they store different things: <br><br>
• The <strong>Method Area</strong> stores information <em>about the class</em> - one copy per class, no matter
how many objects of that class exist. <br>
• The <strong>Heap</strong> stores the actual <em>objects</em> (instances) - a separate copy for every single
object created with <code>new</code>.`
        }
    ],

    expert: [
        {
            content: `<h3>Method Area Contents, In Detail</h3>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">                    Method Area (one region per JVM, shared)
   +------------------------------------------------------------+
   |  For each loaded class:                                     |
   |    - Fully qualified class name, superclass, interfaces      |
   |    - Access modifiers (public/final/abstract/...)            |
   |    - Method bytecode + method signatures                     |
   |    - Field information (names, types, modifiers)             |
   |    - Static variables (class-level, one copy per class)      |
   |    - Runtime Constant Pool (literals, symbolic references     |
   |      to other classes/methods/fields, resolved lazily)       |
   |    - Reference to the ClassLoader that loaded this class      |
   +------------------------------------------------------------+</pre>`
        },
        {
            content: `<h3>Runtime Constant Pool Explained</h3>
Every compiled <code>.class</code> file has a <strong>constant pool</strong> - a table of numeric literals,
string literals, and symbolic references to classes/fields/methods that the code uses. When the class is loaded,
the JVM copies this into the <strong>Runtime Constant Pool</strong> inside the Method Area, and resolves symbolic
references (e.g. "call method X on class Y") into direct memory references as needed. <br><br>
This is also where interned <code>String</code> literals conceptually tie in - the String Pool is closely
related to (and in modern JVMs physically resides in) the Heap, but its entries are referenced from constant
pools in the Method Area.`
        },
        {
            content: `<h3>Method Area vs Heap vs Metaspace - Comparison</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>Method Area</th><th>Heap</th></tr>
<tr><td>What it stores</td><td>Class metadata, method bytecode, static variables, runtime constant pool</td><td>Object instances and arrays</td></tr>
<tr><td>Copies per class</td><td>One (shared across all instances)</td><td>Many (one per object created)</td></tr>
<tr><td>Java 7 and earlier implementation</td><td>PermGen (part of Heap, fixed size)</td><td>Heap</td></tr>
<tr><td>Java 8+ implementation</td><td>Metaspace (native memory, not part of Heap)</td><td>Heap</td></tr>
<tr><td>Garbage collected?</td><td>Yes, but only when the defining ClassLoader itself becomes unreachable</td><td>Yes, per normal GC rules for unreachable objects</td></tr>
</table>
<br>
Note: the <strong>Method Area is a logical concept defined by the JVM Specification</strong>; <strong>Metaspace</strong>
is simply how HotSpot (the mainstream JVM) implements that concept since Java 8. The next topic covers Metaspace
specifically.`
        },
        {
            content: `<h3>What Happens When the Method Area Runs Out</h3>
Because static variables and class metadata for every loaded class sit in the Method Area, applications that
dynamically generate huge numbers of classes at runtime (heavy reflection, dynamic proxies, some ORM/ AOP
frameworks, or classes that are loaded but never unloaded by leaking class loaders) can exhaust it. In Java 7
and earlier this surfaced as <code>java.lang.OutOfMemoryError: PermGen space</code>; from Java 8 onward it
surfaces as <code>java.lang.OutOfMemoryError: Metaspace</code>.`
        },
        {
            content: `<h3>Common Misconceptions</h3>
• <strong>"Static variables live on the Heap with regular instance fields."</strong> Wrong - static variables
belong to the class itself and are stored in the Method Area, not per-object. Note that since JDK 7 the static field VALUES live on the heap, attached to the java.lang.Class mirror - the Method Area holds the class metadata and bytecode. <br>
• <strong>"The Method Area is never garbage collected."</strong> Wrong - class metadata can be collected, but
only when its entire defining ClassLoader becomes unreachable, which is much rarer than ordinary object
collection on the Heap. <br>
• <strong>"Method Area and Metaspace are two different things."</strong> Not quite - Method Area is the JVM
Specification's logical concept; Metaspace is HotSpot's concrete implementation of it since Java 8.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What does the Method Area store?</td><td>Class-level metadata: class structure, method bytecode, static variables, and the runtime constant pool</td></tr>
<tr><td>How many copies of a static variable exist for a class?</td><td>Exactly one, shared by all instances of that class</td></tr>
<tr><td>Is the Method Area shared across threads?</td><td>Yes, like the Heap, it is shared by the entire JVM/application</td></tr>
<tr><td>What is the Runtime Constant Pool?</td><td>A per-class table of literals and symbolic references, copied from the compiled .class file's constant pool and resolved at runtime</td></tr>
<tr><td>How is the Method Area implemented before vs after Java 8?</td><td>Before Java 8 it was PermGen, a fixed-size part of the Heap; from Java 8 onward it is Metaspace, allocated from native memory</td></tr>
<tr><td>Is Method Area content ever garbage collected?</td><td>Yes, but only when the ClassLoader that defined those classes becomes completely unreachable</td></tr>
<tr><td>Why do heavy reflection/proxy frameworks risk Method Area exhaustion?</td><td>They can dynamically generate very large numbers of classes at runtime, filling up the shared Method Area/Metaspace</td></tr>
<tr><td>Where do instance (non-static) fields live?</td><td>On the Heap, as part of each individual object, not in the Method Area</td></tr>
</table>`
        }
    ]
};
