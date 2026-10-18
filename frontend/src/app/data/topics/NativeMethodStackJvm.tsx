import { Topic } from '../coreJava';

export const nativeMethodStackJvm: Topic = {
    id: 'native-method-stack-jvm',
    name: 'Native Method Stack',
    beginner: [
        {
            content: `<h3>What is the Native Method Stack?</h3>
The <strong>Native Method Stack</strong> is a memory area very similar to the regular Stack, except it's used
specifically for <strong>native methods</strong> - methods that are implemented in a language other than Java,
usually C or C++. <br><br>
Just like the regular Stack, every thread gets its own private Native Method Stack.`
        },
        {
            content: `<h3>What is a Native Method?</h3>
A native method is declared in Java using the <code>native</code> keyword, but has <strong>no method body</strong>
in Java - its actual implementation lives in a compiled C/C++ library that the JVM loads and calls into. This
mechanism is called <strong>JNI (Java Native Interface)</strong>.`,
            codeExamples: [`public class NativeMethodDemo {

    // Declared here, but implemented in native C/C++ code elsewhere
    public native void printFromNative();

    static {
        // System.loadLibrary("nativeimpl"); // would load the compiled native library
    }

    public static void main(String[] args) {
        System.out.println("This line runs entirely on the regular JVM Stack.");
        // Calling printFromNative() would push a frame onto the
        // Native Method Stack instead of the regular Stack.
    }
}
// OUTPUT:
// This line runs entirely on the regular JVM Stack.`]
        },
        {
            content: `<h3>Why Does Java Need Native Methods At All?</h3>
Most Java code never touches native methods directly, but they're used under the hood for things like: <br>
• Talking directly to the operating system (file I/O, low-level networking). <br>
• Interfacing with hardware or existing C/C++ libraries that have no Java equivalent. <br>
• Performance-critical operations that benefit from direct native execution. <br><br>
In fact, many familiar JDK classes (like parts of <code>java.io</code> and <code>java.lang.Thread</code>) rely on
native methods behind the scenes.`
        },
        {
            content: `<h3>Native Method Stack vs Regular Stack</h3>
The two are conceptually the same idea (tracking method calls for a thread), just for different kinds of code: <br><br>
• The <strong>regular Stack</strong> tracks calls to Java methods (bytecode). <br>
• The <strong>Native Method Stack</strong> tracks calls to native methods (compiled C/C++ code).`
        }
    ],

    expert: [
        {
            content: `<h3>How JNI Calls Interact with the Stacks</h3>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Thread's Memory
+------------------------------------------------+
|  Regular Stack        |  Native Method Stack     |
|  +------------------+ |  +--------------------+  |
|  | main()           | |  |                    |  |
|  +------------------+ |  |                    |  |
|  | callNative()      | |  |                    |  |
|  +------------------+ |  |                    |  |
|                        |  | native_impl()      |  |  <-- JNI transition
|                        |  | (C/C++ stack frame)|  |
|                        |  +--------------------+  |
+------------------------------------------------+
When Java code calls a native method, execution "crosses over" via JNI into
the Native Method Stack; if that native code calls back into Java, execution
crosses back onto the regular Stack.</pre>`
        },
        {
            content: `<h3>Native Method Stack vs Regular Stack - Comparison</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>Regular (Java) Stack</th><th>Native Method Stack</th></tr>
<tr><td>Used for</td><td>Java bytecode method calls</td><td>Native (C/C++) method calls via JNI</td></tr>
<tr><td>Defined by JVM Specification?</td><td>Yes, required</td><td>Optional - JVM Spec allows implementations to combine it with the regular Stack</td></tr>
<tr><td>Scope</td><td>Per-thread</td><td>Per-thread</td></tr>
<tr><td>HotSpot JVM implementation</td><td>Separate region</td><td>In practice, HotSpot often implements it combined with the regular Stack (OS-native thread stack)</td></tr>
<tr><td>Failure mode</td><td>StackOverflowError</td><td>StackOverflowError or a native crash, depending on how the native code fails</td></tr>
</table>`
        },
        {
            content: `<h3>An Important Nuance: The JVM Spec Makes This Optional</h3>
The JVM Specification does not strictly mandate a separate Native Method Stack - it explicitly allows an
implementation to combine it with the regular Stack. This is exactly what Oracle's HotSpot JVM does in practice:
Java frames and native frames for a given thread typically coexist on the same underlying OS thread stack, even
though the specification describes them as two conceptually distinct areas. Other JVM implementations are free
to keep them fully separate.`
        },
        {
            content: `<h3>Production Relevance: Native Crashes Don't Look Like Java Errors</h3>
Because native methods run compiled C/C++ code outside the JVM's normal safety net (bounds checking, garbage
collection, exception handling), a bug in native code can crash the <strong>entire JVM process</strong> with a
native crash (segfault) rather than a clean, catchable Java exception - producing an <code>hs_err_pidNNNN.log</code>
crash file instead of a normal Java stack trace. This is a key reason JNI usage is treated cautiously in
production: a bug three layers deep in a native library can take down the whole application instantly, with no
chance for application-level error handling to intervene. <br><br>
Common real-world native-boundary issues: <br>
• A misbehaving native library causing a JVM segfault under load. <br>
• Memory leaks in native code that don't show up in Java heap dumps at all (since they live outside the Heap
entirely). <br>
• JNI reference leaks (native code holding onto Java object references so they can never be garbage collected).`
        },
        {
            content: `<h3>Common Misconceptions</h3>
• <strong>"Every JVM has a physically separate Native Method Stack."</strong> Wrong - the JVM Spec permits
combining it with the regular Stack, and HotSpot typically does exactly that. <br>
• <strong>"Native method bugs always throw a normal Java exception."</strong> Wrong - native code bugs can crash
the entire JVM process outright (a native crash/segfault), bypassing Java's exception handling completely. <br>
• <strong>"Native methods are rare/exotic and irrelevant to typical Java apps."</strong> Wrong - many everyday
JDK operations (file I/O, threading, some java.lang.Math operations) are backed by native methods under the
hood, even if application developers never write <code>native</code> keywords themselves.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is the Native Method Stack used for?</td><td>Tracking method calls for native (C/C++) methods invoked via JNI, separate from Java bytecode method calls</td></tr>
<tr><td>Is the Native Method Stack per-thread or shared?</td><td>Per-thread, just like the regular Stack</td></tr>
<tr><td>Does the JVM Specification require a physically separate Native Method Stack?</td><td>No - it explicitly allows combining it with the regular Java Stack, which HotSpot typically does</td></tr>
<tr><td>What mechanism lets Java code call native code?</td><td>JNI (Java Native Interface)</td></tr>
<tr><td>What happens if native code has a serious bug?</td><td>It can crash the entire JVM process natively (e.g. a segfault), producing an hs_err crash log instead of a catchable Java exception</td></tr>
<tr><td>Can Native Method Stack usage cause a StackOverflowError?</td><td>Yes, it's possible, though native code failures can also manifest as lower-level native crashes depending on the implementation</td></tr>
<tr><td>Do JDK classes use native methods internally?</td><td>Yes - many core operations (file I/O, threading primitives, some math routines) are backed by native methods, even though most developers never see them directly</td></tr>
<tr><td>Why are JNI-related memory leaks hard to detect with a Java heap dump?</td><td>Because native memory used by native code lives outside the Java Heap entirely, so heap dumps and standard Heap-based tools don't capture it</td></tr>
</table>`
        }
    ]
};
