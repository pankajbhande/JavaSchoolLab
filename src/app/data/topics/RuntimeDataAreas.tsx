import { Topic } from '../coreJava';

export const runtimeDataAreas: Topic = {
    id: 'runtime-data-areas',
    name: 'Runtime Data Areas',
    beginner: [
        {
            content: `<h3>What are Runtime Data Areas?</h3>
When a Java program runs, the JVM doesn't just execute instructions - it also needs places in memory to store
objects, method calls, variables, and class information. These memory regions are collectively called the
<strong>Runtime Data Areas</strong>. <br><br>
Think of them as different "rooms" inside the JVM's memory, each with a specific job.`
        },
        {
            content: `<h3>The Five Main Areas</h3>
• <strong>Heap</strong> - stores all objects created with <code>new</code>. Shared by the whole application. <br>
• <strong>Stack</strong> - stores method calls and local variables. Each thread gets its own stack. <br>
• <strong>Method Area (Metaspace)</strong> - stores class-level information like class structure, method code,
and static variables. Shared across the application. <br>
• <strong>PC Register</strong> - a tiny area that tracks which instruction a thread is currently executing. Each
thread gets its own. <br>
• <strong>Native Method Stack</strong> - similar to the regular Stack, but for native (non-Java) method calls.`
        },
        {
            content: `<h3>Shared vs Per-Thread Areas</h3>
This distinction is important and comes up a lot: <br><br>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Area</th><th>Shared or Per-Thread?</th></tr>
<tr class='text-center'><td>Heap</td><td>Shared (one per JVM)</td></tr>
<tr class='text-center'><td>Method Area / Metaspace</td><td>Shared (one per JVM)</td></tr>
<tr class='text-center'><td>Stack</td><td>Per-Thread (one for each thread)</td></tr>
<tr class='text-center'><td>PC Register</td><td>Per-Thread (one for each thread)</td></tr>
<tr class='text-center'><td>Native Method Stack</td><td>Per-Thread (one for each thread)</td></tr>
</table>`
        },
        {
            content: `<h3>A Quick Mental Model</h3>
When you call a method that creates an object: <br>
• The <em>method call itself</em> (its local variables, parameters) goes on that thread's <strong>Stack</strong>. <br>
• The <em>object</em> created inside the method goes on the shared <strong>Heap</strong>. <br>
• The <em>class definition</em> for that object's type lives in the <strong>Method Area</strong>. <br><br>
This is why an object can keep existing on the Heap even after the method that created it has finished and its
stack frame has been removed - as long as something else still references it.`,
            codeExamples: [`public class MemoryAreasDemo {

    static Object createObject() {
        Object obj = new Object(); // 'obj' reference lives on the Stack
        return obj;                // the actual Object lives on the Heap
    }

    public static void main(String[] args) {
        Object result = createObject();
        System.out.println("Object still alive: " + result);
    }
}
// OUTPUT:
// Object still alive: java.lang.Object@...`]
        }
    ],

    expert: [
        {
            content: `<h3>Full Picture of the JVM Runtime Data Areas</h3>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">                     JVM Process
   +-----------------------------------------------------+
   |  Shared across all threads                           |
   |   +----------------+   +--------------------------+  |
   |   |     Heap       |   |  Method Area (Metaspace)  |  |
   |   | (all objects)  |   |  (class metadata, static  |  |
   |   |                |   |   vars, runtime const pool)|  |
   |   +----------------+   +--------------------------+  |
   |                                                       |
   |  Per-Thread (one set for each running thread)         |
   |   +---------+  +---------+  +------------------+      |
   |   | Stack   |  |   PC    |  | Native Method     |      |
   |   | (frames)|  | Register|  |     Stack         |      |
   |   +---------+  +---------+  +------------------+      |
   +-----------------------------------------------------+</pre>`
        },
        {
            content: `<h3>Comparison Table: All Five Areas at a Glance</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Area</th><th>Scope</th><th>Stores</th><th>Can it throw OutOfMemoryError?</th><th>Tuning Flag</th></tr>
<tr><td>Heap</td><td>Shared</td><td>Objects, instance variables, arrays</td><td>Yes - java.lang.OutOfMemoryError: Java heap space</td><td>-Xms / -Xmx</td></tr>
<tr><td>Stack</td><td>Per-Thread</td><td>Stack frames, local variables, partial results, call chain</td><td>StackOverflowError (and OutOfMemoryError: unable to create new native thread)</td><td>-Xss</td></tr>
<tr><td>Method Area / Metaspace</td><td>Shared</td><td>Class metadata, static variables, runtime constant pool</td><td>Yes - java.lang.OutOfMemoryError: Metaspace</td><td>-XX:MetaspaceSize / -XX:MaxMetaspaceSize</td></tr>
<tr><td>PC Register</td><td>Per-Thread</td><td>Address of the currently executing JVM instruction</td><td>No - fixed tiny size</td><td>Not tunable</td></tr>
<tr><td>Native Method Stack</td><td>Per-Thread</td><td>Frames for native (JNI/C/C++) method calls</td><td>Yes - StackOverflowError or OutOfMemoryError depending on JVM implementation</td><td>JVM/OS dependent</td></tr>
</table>`
        },
        {
            content: `<h3>Why the Shared/Per-Thread Split Matters in Production</h3>
This split directly explains real production behavior: <br>
• A memory leak from objects that are never dereferenced grows the <strong>Heap</strong> and eventually causes a
full-application <code>OutOfMemoryError</code> that affects every thread. <br>
• A single runaway recursive method only blows up <strong>that one thread's Stack</strong>
(<code>StackOverflowError</code>) - other threads keep running unaffected. <br>
• Loading thousands of dynamically generated classes (common with heavy reflection/proxy frameworks) pressures
the shared <strong>Method Area/Metaspace</strong>, which can bring down the whole JVM even though the Heap looks
perfectly healthy.`
        },
        {
            content: `<h3>Common Misconceptions</h3>
• <strong>"Local variables live on the Heap."</strong> Wrong - primitive local variables and object references
live on the Stack; only the actual objects they point to live on the Heap. <br>
• <strong>"More threads only cost Heap memory."</strong> Wrong - every new thread also claims its own Stack, PC
Register, and Native Method Stack, which is why creating unbounded threads can itself cause an
<code>OutOfMemoryError: unable to create new native thread</code>, separate from Heap exhaustion. <br>
• <strong>"The Method Area is part of the Heap."</strong> Historically debated - the JVM spec treats it as a
logically distinct area, and since Java 8 it's physically implemented as Metaspace in native (non-heap) memory.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>Name the five main JVM runtime data areas.</td><td>Heap, Stack, Method Area/Metaspace, PC Register, Native Method Stack</td></tr>
<tr><td>Which areas are shared across all threads?</td><td>Heap and Method Area/Metaspace</td></tr>
<tr><td>Which areas are created per-thread?</td><td>Stack, PC Register, and Native Method Stack</td></tr>
<tr><td>Where do objects created with 'new' live?</td><td>On the Heap</td></tr>
<tr><td>Where do local variables and method call frames live?</td><td>On the thread's Stack</td></tr>
<tr><td>Which area stores static variables and class metadata?</td><td>The Method Area (Metaspace since Java 8)</td></tr>
<tr><td>Why can one thread's infinite recursion not crash other threads' execution directly?</td><td>Because each thread has its own independent Stack, so a StackOverflowError is isolated to that thread</td></tr>
<tr><td>What does the PC Register track?</td><td>The address of the JVM instruction currently being executed by that thread</td></tr>
</table>`
        }
    ]
};
