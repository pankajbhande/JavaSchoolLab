import { Topic } from '../coreJava';

export const metaspaceJvm: Topic = {
    id: 'metaspace-jvm',
    name: 'Metaspace',
    beginner: [
        {
            content: `<h3>What is Metaspace?</h3>
<strong>Metaspace</strong> is the area of memory where the JVM stores class metadata - things like class
structure, method bytecode, and static variables. It was introduced in <strong>Java 8</strong> to replace an
older area called <strong>PermGen (Permanent Generation)</strong>.`
        },
        {
            content: `<h3>Why Did Java Replace PermGen with Metaspace?</h3>
Before Java 8, class metadata lived in PermGen, which was part of the Heap and had a <strong>fixed maximum
size</strong> set at JVM startup. Applications that loaded lots of classes at runtime (common with big frameworks
like Spring, Hibernate, and application servers) would frequently run out of PermGen space and crash with
<code>OutOfMemoryError: PermGen space</code> - even if there was plenty of free Heap memory otherwise. <br><br>
Metaspace fixed this by moving class metadata out of the Heap entirely, into <strong>native memory</strong>
(memory managed by the operating system, outside the JVM's Heap), which can grow much more flexibly.`
        },
        {
            content: `<h3>A Simple Example</h3>
Every class you load, including ones generated dynamically, consumes some Metaspace.`,
            codeExamples: [`public class MetaspaceDemo {
    public static void main(String[] args) {
        Class<?> cls = MetaspaceDemo.class;
        System.out.println("Class metadata for: " + cls.getName());
        // The metadata describing this class (its methods, fields,
        // structure) is stored in Metaspace, not on the Heap.
    }
}
// OUTPUT:
// Class metadata for: MetaspaceDemo`]
        },
        {
            content: `<h3>Controlling Metaspace Size</h3>
Just like the Heap has <code>-Xms</code>/<code>-Xmx</code>, Metaspace has its own flags: <br><br>
• <code>-XX:MetaspaceSize=&lt;size&gt;</code> - the initial threshold at which a garbage collection is triggered
to clean up unused class metadata. <br>
• <code>-XX:MaxMetaspaceSize=&lt;size&gt;</code> - the maximum size Metaspace is allowed to grow to. By default,
this is <strong>unlimited</strong> (only bounded by available system memory), unless you set it explicitly.`
        }
    ],

    expert: [
        {
            content: `<h3>PermGen vs Metaspace</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>PermGen (Java 7 and earlier)</th><th>Metaspace (Java 8+)</th></tr>
<tr><td>Memory location</td><td>Part of the Heap (contiguous JVM-managed memory)</td><td>Native memory (managed by the OS, outside the Heap)</td></tr>
<tr><td>Default max size</td><td>Fixed at startup (small default, e.g. 64-82 MB depending on platform)</td><td>Unlimited by default - grows until system memory is exhausted</td></tr>
<tr><td>Resizing</td><td>Cannot grow past the fixed max without a restart</td><td>Can grow/shrink dynamically as classes load/unload</td></tr>
<tr><td>Common failure</td><td>OutOfMemoryError: PermGen space (very common in app servers)</td><td>OutOfMemoryError: Metaspace (rarer, but possible if MaxMetaspaceSize is set or system memory runs out)</td></tr>
<tr><td>GC behavior</td><td>Collected as part of Full GC, tightly coupled to Heap GC cycles</td><td>Collected somewhat independently, triggered by MetaspaceSize threshold</td></tr>
</table>`
        },
        {
            content: `<h3>Metaspace Internal Layout</h3>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">      JVM Process Memory
   +---------------------------------------------------+
   |   Heap (-Xms / -Xmx bounded)                        |
   |     Young Gen | Old Gen                              |
   +---------------------------------------------------+
   |   Native (non-Heap) Memory                           |
   |     +-------------------------------------------+   |
   |     |  Metaspace (-XX:MetaspaceSize /             |   |
   |     |              -XX:MaxMetaspaceSize)          |   |
   |     |    - Class metadata                          |   |
   |     |    - Method bytecode                         |   |
   |     |    - Runtime constant pools                  |   |
   |     +-------------------------------------------+   |
   |     Thread stacks, JIT compiled code cache, etc.     |
   +---------------------------------------------------+</pre>
Static variables themselves actually moved to the Heap starting in Java 8 (as part of the corresponding Class
object), while the class structure/bytecode metadata moved to Metaspace - a subtlety worth knowing beyond "it's
just PermGen renamed."`
        },
        {
            content: `<h3>What Happens When Metaspace Runs Out</h3>
If <code>-XX:MaxMetaspaceSize</code> is set and reached (or, without that flag, if the OS itself runs out of
available native memory), the JVM throws <code>java.lang.OutOfMemoryError: Metaspace</code>. Common production
causes: <br>
• <strong>Classloader leaks</strong> - repeatedly redeploying an application (common in application servers)
without the old ClassLoader and its classes ever becoming eligible for collection, so metadata accumulates
release after release. <br>
• Frameworks that generate huge numbers of dynamic proxy/CGLIB classes at runtime without bound. <br>
• Leaving <code>-XX:MaxMetaspaceSize</code> unset on a shared/constrained host, letting Metaspace silently
consume memory that other processes on the machine needed, potentially triggering the OS's own OOM killer
instead of a clean JVM error.`
        },
        {
            content: `<h3>Production Tip: Always Set MaxMetaspaceSize in Containers</h3>
Because Metaspace defaults to unlimited, it's easy to forget it needs a ceiling - especially in containerized
environments (Docker/Kubernetes) with a hard memory limit. Without <code>-XX:MaxMetaspaceSize</code>, a
classloader leak can silently grow Metaspace until the container's memory limit is hit, and the container
runtime kills the whole JVM process outright (OOMKilled) with no Java-level stack trace to debug from - far
worse than a clean <code>OutOfMemoryError: Metaspace</code> that at least leaves a diagnosable log entry.`
        },
        {
            content: `<h3>Common Misconceptions</h3>
• <strong>"Metaspace is just PermGen renamed."</strong> Wrong - it changed memory location entirely (native
memory instead of Heap) and its default sizing behavior (unbounded instead of a small fixed cap). <br>
• <strong>"Metaspace can never run out of memory."</strong> Wrong - it's unbounded by default but still limited
by total system memory, and can be explicitly capped with <code>-XX:MaxMetaspaceSize</code>. <br>
• <strong>"Static variables are stored in Metaspace."</strong> Wrong since Java 8 - static variable values live
on the Heap (attached to the Class object); Metaspace holds the class's structural metadata and bytecode.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What replaced PermGen, and in which Java version?</td><td>Metaspace, introduced in Java 8</td></tr>
<tr><td>Where does Metaspace physically live in memory?</td><td>In native memory, managed by the OS, outside the JVM Heap</td></tr>
<tr><td>What is the default maximum size of Metaspace?</td><td>Unlimited by default - bounded only by available system memory, unless -XX:MaxMetaspaceSize is set</td></tr>
<tr><td>Why was PermGen replaced?</td><td>Its fixed, small default size caused frequent OutOfMemoryError: PermGen space in applications that loaded many classes dynamically</td></tr>
<tr><td>What flags control Metaspace sizing?</td><td>-XX:MetaspaceSize (GC trigger threshold) and -XX:MaxMetaspaceSize (hard cap)</td></tr>
<tr><td>What commonly causes Metaspace exhaustion in production?</td><td>ClassLoader leaks from repeated hot redeployments, or frameworks generating unbounded dynamic proxy classes</td></tr>
<tr><td>Why is it risky to leave -XX:MaxMetaspaceSize unset in a Docker container?</td><td>Metaspace can grow until the container's memory limit is hit, causing an OOMKilled container crash instead of a diagnosable Java OutOfMemoryError</td></tr>
<tr><td>Did static variables also move to Metaspace in Java 8?</td><td>No - static variable values moved to live on the Heap attached to the Class object; Metaspace holds structural class metadata and bytecode</td></tr>
</table>`
        }
    ]
};
