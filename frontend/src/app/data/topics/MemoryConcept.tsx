import { Topic } from '../coreJava';

export const memoryConcept: Topic = {
    id: 'memory-concept',
    name: 'Memory',
    beginner: [
        {
            content: `<h3>Why Programs Need Memory</h3>
Every variable, object, and piece of running code needs somewhere to "live" while the program executes - that place is the computer's memory (RAM). When you run a Java program, the JVM (Java Virtual Machine) sets aside memory regions to store method calls and the objects your program creates.<br>`,
            codeExamples: [`public class MemoryIntro {
    public static void main(String[] args) {
        int number = 42;             // stored in memory
        String text = "Hello";        // object stored in memory, reference stored too
        System.out.println(number + " " + text);
    }
}
// OUTPUT:
// 42 Hello`]
        },
        {
            content: `<h3>Two Main Areas: Stack and Heap</h3>
Java divides memory into two important areas for running code: the <strong>stack</strong> (for method calls and local variables) and the <strong>heap</strong> (for objects created with <code>new</code>). Understanding which area something lives in helps explain how Java programs behave.<br>`,
            codeExamples: [`public class StackHeapIntro {
    public static void main(String[] args) {
        int localValue = 10;                 // lives on the stack
        StringBuilder obj = new StringBuilder("Hi"); // obj (reference) on stack, actual object on heap
        System.out.println(localValue + " " + obj);
    }
}
// OUTPUT:
// 10 Hi`]
        },
        {
            content: `<h3>Memory is Freed Automatically (Garbage Collection)</h3>
Unlike some languages where you must manually free memory, Java's <strong>Garbage Collector (GC)</strong> automatically finds objects that are no longer reachable by any variable and reclaims their memory, preventing manual memory-management bugs.<br>`,
            codeExamples: [`public class GcIntro {
    public static void main(String[] args) {
        String s = new String("temporary");
        System.out.println(s);
        s = null; // no variable points to the old String object anymore
        // The old "temporary" object is now eligible for garbage collection
        System.out.println("Reference cleared");
    }
}
// OUTPUT:
// temporary
// Reference cleared`]
        },
        {
            content: `<h3>Running Out of Memory</h3>
Memory is not infinite. If a program keeps creating objects that never become unreachable, or if a method calls itself endlessly, the JVM eventually runs out of memory and throws an error.<br>`,
            codeExamples: [`public class MemoryLimit {
    public static void main(String[] args) {
        try {
            recurse(0);
        } catch (StackOverflowError e) {
            System.out.println("Ran out of stack memory!");
        }
    }
    static void recurse(int n) {
        recurse(n + 1); // never stops - keeps adding to the stack
    }
}
// OUTPUT:
// Ran out of stack memory!`]
        },
    ],
    expert: [
        {
            content: `<h3>Stack vs Heap - The Core Model</h3>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">STACK (per thread)                    HEAP (shared, one per JVM)
+----------------------+              +----------------------------+
| main() frame         |              |                            |
|  int x = 5           |              |  new Person("Raoji", 22)   |
|  Person p ----------------------&gt;   |  { name: "Raoji",          |
|                       |              |    age: 22 }               |
+----------------------+              |                            |
| greet() frame         |              +----------------------------+
|  (pushed on call,     |
|   popped on return)   |
+----------------------+</pre>
The stack holds method call frames (local variables, parameters, return addresses) and is LIFO (last-in-first-out) - frames are pushed on call and popped on return. The heap holds all objects created with <code>new</code>, and persists until garbage collected.<br><br>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>Stack</th><th>Heap</th></tr>
<tr class='text-center'><td>Stores</td><td>Method frames, local variables, primitives, references</td><td>All objects and arrays (the actual data)</td></tr>
<tr class='text-center'><td>Lifetime</td><td>Tied to the method call - freed when method returns</td><td>Tied to reachability - freed by GC when unreachable</td></tr>
<tr class='text-center'><td>Allocation speed</td><td>Very fast (just move a pointer)</td><td>Slower (bookkeeping required)</td></tr>
<tr class='text-center'><td>Thread sharing</td><td>Each thread has its own stack</td><td>Shared across all threads</td></tr>
<tr class='text-center'><td>Failure mode</td><td>StackOverflowError (too much nesting/recursion)</td><td>OutOfMemoryError (too many live objects)</td></tr>
</table>`,
            codeExamples: [`public class StackVsHeapDemo {
    public static void main(String[] args) {
        int a = 10;                 // primitive: value lives directly on stack
        Person p = new Person("Meera", 30); // reference "p" on stack, Person object on heap
        greet(p);
    }
    static void greet(Person person) { // new stack frame for greet()
        System.out.println("Hello, " + person.name);
    } // frame popped here - "person" reference gone, but heap object survives via "p" in main
}
class Person {
    String name;
    int age;
    Person(String name, int age) { this.name = name; this.age = age; }
}
// OUTPUT:
// Hello, Meera`]
        },
        {
            content: `<h3>Method Call Stack in Action</h3>
Each method call pushes a new frame onto the stack; returning pops it off. This is why recursion consumes stack memory proportional to recursion depth.<br>`,
            codeExamples: [`public class CallStackDemo {
    public static void main(String[] args) {
        System.out.println(factorial(4));
    }
    static int factorial(int n) {
        // Each call: a NEW frame with its own "n" is pushed
        if (n <= 1) return 1;
        return n * factorial(n - 1);
    } // frame popped as each call returns, unwinding back to main
}
// OUTPUT:
// 24
// Call sequence: factorial(4) -> factorial(3) -> factorial(2) -> factorial(1)
// Return sequence: 1 -> 2 -> 6 -> 24`]
        },
        {
            content: `<h3>Garbage Collection: Reachability, Not Reference Counting</h3>
The GC does not simply count references - it periodically traces from a set of "GC roots" (active thread stacks, static fields) and marks every object reachable from them as live. Anything unreached is garbage, even if it's part of a reference cycle (two objects pointing at each other but reachable from nowhere).<br>`,
            codeExamples: [`public class GcReachability {
    public static void main(String[] args) {
        Node a = new Node();
        Node b = new Node();
        a.next = b;
        b.next = a; // a and b reference each other (a cycle)

        a = null;
        b = null;
        // Neither local variable points to the nodes anymore.
        // Even though a and b still reference EACH OTHER, neither is
        // reachable from a GC root (main's stack) - both are collectible.
        System.out.println("Cycle is now eligible for GC despite mutual references");
    }
}
class Node { Node next; }
// OUTPUT:
// Cycle is now eligible for GC despite mutual references`]
        },
        {
            content: `<h3>Common Memory Errors</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Error</th><th>Region</th><th>Typical Cause</th></tr>
<tr class='text-center'><td>StackOverflowError</td><td>Stack</td><td>Infinite or excessively deep recursion (no base case, or base case never reached)</td></tr>
<tr class='text-center'><td>OutOfMemoryError: Java heap space</td><td>Heap</td><td>Too many live objects retained (e.g. growing a list forever, memory leak via static collections)</td></tr>
</table>`,
            codeExamples: [`import java.util.ArrayList;
import java.util.List;

public class MemoryLeakDemo {
    static List<int[]> leaky = new ArrayList<>(); // static field - never cleared, roots keep it alive

    public static void main(String[] args) {
        try {
            while (true) {
                leaky.add(new int[1_000_000]); // keeps adding, never removes
            }
        } catch (OutOfMemoryError e) {
            System.out.println("Heap exhausted - classic memory leak pattern");
        }
    }
}
// OUTPUT:
// Heap exhausted - classic memory leak pattern`]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is the difference between stack and heap memory?</td><td>Stack stores method frames/local variables and is freed automatically on return; heap stores objects and is freed by the garbage collector when unreachable</td></tr>
<tr class='text-center'><td>What causes a StackOverflowError?</td><td>Excessively deep or infinite recursion that keeps pushing frames onto the stack until it's exhausted</td></tr>
<tr class='text-center'><td>What causes an OutOfMemoryError?</td><td>The heap fills with live (still-reachable) objects faster than the GC can reclaim space, e.g. a memory leak</td></tr>
<tr class='text-center'><td>Does the garbage collector use reference counting?</td><td>No - the standard JVM GC uses reachability analysis from GC roots, which correctly collects reference cycles too</td></tr>
<tr class='text-center'><td>Is each thread's stack shared with other threads?</td><td>No - every thread gets its own private stack; the heap is shared across all threads</td></tr>
<tr class='text-center'><td>Can you force garbage collection to run immediately?</td><td>You can request it with System.gc(), but it is only a hint - the JVM decides if/when to actually run it</td></tr>
<tr class='text-center'><td>Where do static variables live?</td><td>In the method area (part of the JVM's memory, sometimes called metaspace), not the stack or per-object heap space</td></tr>
</table>`
        },
    ],
};
