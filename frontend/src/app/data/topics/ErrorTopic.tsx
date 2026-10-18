import { Topic } from '../coreJava';

export const errorTopic: Topic = {
                        id: 'error',
                        name: 'Error ',
                        beginner: [
                            {
                                content: `An <strong>Error</strong> is a serious problem that a reasonable application should not try to catch. <br>
It usually indicates something has gone wrong at the JVM/environment level (running out of memory, a stack that has recursed too deep, a broken class file) rather than a mistake in normal application logic. <br><br>

Below is one small, runnable code + output for each core idea: <br>`
                            },

                            {
                                content: `<h4>1. Error vs Exception — the basic difference</h4>
An <code>Exception</code> is usually caused by the application itself (bad input, dividing by zero, a null reference) and is meant to be caught and handled. <br>
An <code>Error</code> is usually caused by the environment the program is running in (JVM ran out of memory, ran out of stack space) and is generally NOT meant to be caught or recovered from.<br><br>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr>
<th></th>
<th>Exception</th>
<th>Error</th>
</tr>
<tr class='text-center'>
<td>Caused by</td>
<td>Application logic (bad input, null reference, bad array index)</td>
<td>JVM / environment (out of memory, stack exhausted)</td>
</tr>
<tr class='text-center'>
<td>Recoverable?</td>
<td>Usually yes</td>
<td>Usually no</td>
</tr>
<tr class='text-center'>
<td>Should application code catch it?</td>
<td>Yes, with try-catch</td>
<td>Generally no</td>
</tr>
<tr class='text-center'>
<td>Example</td>
<td>ArithmeticException, NullPointerException</td>
<td>OutOfMemoryError, StackOverflowError</td>
</tr>
</table>`
                            },

                            {
                                content: `<h4>2. Proof: a StackOverflowError being thrown</h4>
A method that keeps calling itself with no stopping condition (infinite recursion) eventually uses up all the memory reserved for the call stack, and the JVM throws a <code>StackOverflowError</code>.`,
                                codeExamples: [
                                    `public class Test {
    static void recurse() {
        recurse(); // calls itself forever - no base case
    }

    public static void main(String[] args) {
        System.out.println("Starting recursion...");
        recurse();
    }
}
// OUTPUT:
// Starting recursion...
// Exception in thread "main" java.lang.StackOverflowError
//     at Test.recurse(Test.java:2)
//     at Test.recurse(Test.java:2)
//     at Test.recurse(Test.java:2)
//     ... (repeats thousands of times until the stack is exhausted)`
                                ]
                            },

                            {
                                content: `<h4>3. Why application code generally should NOT catch Errors</h4>
Technically, <code>Error</code> can be caught with <code>catch (Error e)</code> because it is a subclass of <code>Throwable</code>, just like <code>Exception</code>. <br>
But in practice you should almost never do this, because:
<ul>
<li>An Error usually means the JVM itself is in a bad state (out of memory, corrupted stack) - there is often no safe way to keep running normally.</li>
<li>Catching it can hide a serious problem instead of letting it surface and be fixed.</li>
<li>Trying to do meaningful work (like logging to a file) right after an OutOfMemoryError can itself fail, since there may be no memory left to do it.</li>
</ul>
The standard advice: let Errors propagate and crash the application (or the specific thread) rather than trying to catch and "handle" them like a normal Exception.`
                            }
                        ],

                        expert: [
                            {
                                content: `<h3>Where Error sits in the Throwable hierarchy</h3>
Both <code>Error</code> and <code>Exception</code> extend <code>Throwable</code> - the root class for anything that can be thrown with <code>throw</code> and caught with <code>catch</code>.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">                java.lang.Object
                       |
                java.lang.Throwable
                    /       \\
             Exception       Error
             /       \\           \\
   RuntimeException  Checked    VirtualMachineError, AssertionError,
   (Unchecked)       Exception  NoClassDefFoundError, ...
                      (IOException,           |
                       SQLException, ...)      +-- OutOfMemoryError
                                               +-- StackOverflowError</pre>

<strong>Key takeaway:</strong> Error and Exception are siblings under Throwable, not parent/child of each other. An Error is unchecked (like RuntimeException) - the compiler never forces you to declare or catch it, but that doesn't make it safe to ignore or catch casually.<br>`
                            },

                            {
                                content: `<h3>Common Error subtypes</h3>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr>
<th>Error subtype</th>
<th>When it happens</th>
</tr>
<tr>
<td>OutOfMemoryError</td>
<td>The JVM heap (or another memory area) cannot allocate any more objects because it has run out of available memory.</td>
</tr>
<tr>
<td>StackOverflowError</td>
<td>A thread's call stack exceeds its allowed depth - almost always caused by infinite or excessively deep recursion.</td>
</tr>
<tr>
<td>NoClassDefFoundError</td>
<td>A class that was present at compile time is missing at runtime (e.g. a .class file was deleted, or a jar is missing from the classpath) - different from ClassNotFoundException, which is a checked Exception thrown by reflective loading APIs.</td>
</tr>
<tr>
<td>AssertionError</td>
<td>Thrown by the <code>assert</code> statement when the asserted condition evaluates to false - used to signal "this should never happen" during development/testing.</td>
</tr>
</table>`,
                                codeExamples: [
                                    `public class AssertionDemo {
    static int half(int n) {
        assert n % 2 == 0 : "n must be even, got " + n;
        return n / 2;
    }

    public static void main(String[] args) {
        // Run with: java -ea AssertionDemo   (assertions are disabled by default)
        System.out.println(half(4));
        System.out.println(half(5)); // fails the assertion when -ea is enabled
    }
}
// OUTPUT (only when run with -ea):
// 2
// Exception in thread "main" java.lang.AssertionError: n must be even, got 5
//     at AssertionDemo.half(AssertionDemo.java:3)`
                                ]
                            },

                            {
                                content: `<h3>Causing an OutOfMemoryError - the code pattern</h3>
Deliberately exhausting heap memory will crash whatever process runs it, so the exact output/stack trace is environment-dependent (it depends on heap size, JVM flags, and available system memory). <br>
The pattern below shows the idea conceptually - repeatedly allocating memory and never releasing it, until the JVM cannot find enough contiguous heap space for the next allocation and throws <code>OutOfMemoryError: Java heap space</code>.<br>`,
                                codeExamples: [
                                    `import java.util.ArrayList;
import java.util.List;

public class OomDemo {
    public static void main(String[] args) {
        List<int[]> memoryHog = new ArrayList<>();
        while (true) {
            // Keep allocating large arrays and holding references
            // so the garbage collector can never reclaim them.
            memoryHog.add(new int[1_000_000]);
        }
    }
}
// EXPECTED (environment-dependent, not a literal captured run):
// Exception in thread "main" java.lang.OutOfMemoryError: Java heap space
//     at OomDemo.main(OomDemo.java:10)`
                                ]
                            },

                            {
                                content: `<h3>When is it (occasionally) acceptable to catch an Error?</h3>
The default rule is: don't catch Errors. There is one narrow, well-known exception: catching <code>StackOverflowError</code> in a controlled way to detect and report runaway recursion, typically in tooling, testing frameworks, or a sandboxed evaluator - where the goal is to fail gracefully with a diagnostic message instead of letting the thread die with a raw stack trace.<br>`,
                                codeExamples: [
                                    `public class ControlledRecursionCheck {
    static int recurse(int depth) {
        return 1 + recurse(depth + 1); // no base case, by design (for the demo)
    }

    public static void main(String[] args) {
        try {
            recurse(0);
        } catch (StackOverflowError e) {
            // Acceptable here: this is a controlled boundary (e.g. a
            // sandboxed evaluator or a test harness) reporting the
            // condition gracefully instead of crashing the whole app.
            System.out.println("Detected runaway recursion - aborting safely");
        }
        System.out.println("Application continues running");
    }
}
// OUTPUT:
// Detected runaway recursion - aborting safely
// Application continues running`
                                ]
                            },

                            {
                                content: `<h3>Why catching Errors is dangerous in general</h3>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr>
<th>Situation</th>
<th>Risk of catching the Error</th>
</tr>
<tr>
<td>catch (OutOfMemoryError e)</td>
<td>The JVM may not have enough memory left to even run your catch/finally block's logic (e.g. logging), and other threads may already be failing too.</td>
</tr>
<tr>
<td>catch (StackOverflowError e) in general application code</td>
<td>Masks an actual bug (missing base case, unbounded recursive data) instead of surfacing it during development.</td>
</tr>
<tr>
<td>catch (Throwable t) / catch (Error e) broadly</td>
<td>Swallows serious JVM-level failures alongside normal exceptions, making the application appear to "handle" conditions it has no real way to recover from.</td>
</tr>
</table>
<br>
<strong>Golden rule:</strong> catch <code>Exception</code> (and its specific subtypes) for conditions you can meaningfully recover from. Let <code>Error</code> propagate, log it if your framework/monitoring captures it automatically, and fix the root cause (increase heap, fix the recursion, fix the classpath) rather than papering over it with a catch block.<br>`
                            },

                            {
                                content: `<h3>Interview Questions</h3>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is the difference between Error and Exception?</td><td>Both extend Throwable. Exception represents application-level problems that are usually recoverable and should be caught; Error represents serious JVM/environment-level problems (out of memory, stack exhausted) that are generally unrecoverable and should not be caught.</td></tr>
<tr><td>Is Error checked or unchecked?</td><td>Unchecked - the compiler never requires you to declare or catch an Error, the same as RuntimeException.</td></tr>
<tr><td>Can you catch an Error in Java?</td><td>Yes, syntactically (Error extends Throwable), but it is strongly discouraged except in narrow, controlled cases like reporting a StackOverflowError from a sandboxed recursion check.</td></tr>
<tr><td>What causes a StackOverflowError?</td><td>A thread's call stack exceeds its maximum depth, almost always due to infinite or excessively deep recursion with no base case.</td></tr>
<tr><td>What causes an OutOfMemoryError?</td><td>The JVM cannot allocate more memory in a given memory area (commonly the heap) because it is exhausted and garbage collection cannot free enough space.</td></tr>
<tr><td>What is the difference between NoClassDefFoundError and ClassNotFoundException?</td><td>NoClassDefFoundError is an Error thrown when a class that was available at compile time is missing at runtime (e.g. a missing jar); ClassNotFoundException is a checked Exception thrown by reflective APIs like Class.forName() when a class cannot be found dynamically.</td></tr>
<tr><td>Where does Error sit relative to Exception in the class hierarchy?</td><td>They are siblings - both directly extend Throwable. Error is not a subclass of Exception, nor vice versa.</td></tr>
</table>`
                            }
                        ]
};
