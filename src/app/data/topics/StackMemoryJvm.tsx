import { Topic } from '../coreJava';

export const stackMemoryJvm: Topic = {
    id: 'stack-memory-jvm',
    name: 'Stack',
    beginner: [
        {
            content: `<h3>What is the Stack?</h3>
The <strong>Stack</strong> is the area of JVM memory that keeps track of method calls. Every time a method is
called, a new block of memory called a <strong>stack frame</strong> is pushed onto the Stack; when the method
finishes, that frame is popped off. <br><br>
Unlike the Heap, every thread gets its own private Stack - one thread's Stack is never visible to another thread.`
        },
        {
            content: `<h3>What Lives in a Stack Frame?</h3>
Each stack frame holds everything a method needs while it's running: <br>
• Local variables (including method parameters) <br>
• Partial results of expressions being calculated <br>
• Information needed to return control to the calling method`
        },
        {
            content: `<h3>A Simple Example</h3>
Watch how methods stack on top of each other as they call one another.`,
            codeExamples: [`public class StackDemo {

    static void methodA() {
        int x = 10;      // 'x' lives in methodA's stack frame
        methodB();
    }

    static void methodB() {
        int y = 20;      // 'y' lives in methodB's stack frame
        System.out.println("Inside methodB, y = " + y);
    }

    public static void main(String[] args) {
        methodA();
    }
}
// OUTPUT:
// Inside methodB, y = 20`]
        },
        {
            content: `<h3>StackOverflowError</h3>
The Stack is not unlimited - if too many methods call each other without returning (most commonly from
uncontrolled recursion), the Stack runs out of space and the JVM throws a
<code>StackOverflowError</code>.`,
            codeExamples: [`public class StackOverflowDemo {

    static void recurse(int depth) {
        recurse(depth + 1); // calls itself forever, never returns
    }

    public static void main(String[] args) {
        recurse(0);
    }
}
// OUTPUT:
// Exception in thread "main" java.lang.StackOverflowError`]
        },
        {
            content: `<h3>Controlling Stack Size with -Xss</h3>
Just like the Heap has <code>-Xmx</code>, the Stack has its own size flag: <code>-Xss&lt;size&gt;</code>. It sets
the maximum stack size for each thread. Example: <code>java -Xss512k MyApp</code> gives each thread a 512 KB
stack.`
        }
    ],

    expert: [
        {
            content: `<h3>Stack Frame Internals</h3>
Each stack frame the JVM pushes actually contains three logical parts: <br><br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Thread's Stack (grows downward with each call)
+--------------------------------------------------+
|  Frame: main()                                     |
+--------------------------------------------------+
|  Frame: methodA()                                  |
|   - Local Variable Array  (params + local vars)    |
|   - Operand Stack (scratch space for computation)  |
|   - Frame Data (return address, reference to        |
|                 the constant pool of this class)   |
+--------------------------------------------------+
|  Frame: methodB()  <-- currently executing          |
+--------------------------------------------------+</pre>
The topmost frame always corresponds to the method currently executing; when it returns, its frame is popped and
control (and any return value) goes back to the frame below it.`
        },
        {
            content: `<h3>Stack vs Heap - Key Differences</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>Stack</th><th>Heap</th></tr>
<tr><td>Scope</td><td>Per-thread (private)</td><td>Shared by all threads</td></tr>
<tr><td>Stores</td><td>Local variables, method call frames, references</td><td>Actual objects and arrays</td></tr>
<tr><td>Allocation speed</td><td>Very fast (just move a pointer)</td><td>Slower (needs GC bookkeeping)</td></tr>
<tr><td>Lifetime</td><td>Tied to the method call - freed automatically on return</td><td>Tied to reachability - freed by Garbage Collector whenever it's no longer referenced</td></tr>
<tr><td>Failure mode</td><td>StackOverflowError</td><td>OutOfMemoryError: Java heap space</td></tr>
<tr><td>Tuning flag</td><td>-Xss</td><td>-Xms / -Xmx</td></tr>
</table>`
        },
        {
            content: `<h3>What Actually Happens on StackOverflowError</h3>
When the JVM tries to push a new frame but the thread's Stack has no room left, it throws
<code>StackOverflowError</code> immediately - it does <strong>not</strong> try to grow the Stack automatically
(unlike the Heap, which can grow up to <code>-Xmx</code>). Production causes typically fall into two buckets: <br>
• A genuine bug - unbounded or incorrectly-based recursion (missing/broken base case). <br>
• A legitimately deep call chain (e.g. deeply nested JSON/XML parsing, or a very deep object graph being
processed recursively) that simply needs more Stack space, tunable via <code>-Xss</code>.`
        },
        {
            content: `<h3>Common Pitfall: Increasing -Xss to "Fix" StackOverflowError</h3>
Bumping <code>-Xss</code> can mask a genuine infinite-recursion bug rather than fix it - the program will still
eventually overflow, just after more iterations, and each thread now consumes more memory (which matters a lot
in high-thread-count applications, since Stack memory is per-thread and multiplies quickly). Always check for a
missing/incorrect base case in recursive code first, and only increase <code>-Xss</code> for algorithms that are
correctly, intentionally, deeply recursive.`
        },
        {
            content: `<h3>Common Misconceptions</h3>
• <strong>"Objects created inside a method live on the Stack."</strong> Wrong - only the <em>reference variable</em>
lives on the Stack; the actual object it points to is always on the Heap. <br>
• <strong>"More threads means the Heap runs out faster."</strong> Partially wrong - more threads primarily
consume more Stack memory (one Stack per thread), which is a separate, common cause of
<code>OutOfMemoryError: unable to create new native thread</code>, distinct from Heap exhaustion. <br>
• <strong>"StackOverflowError can be safely caught and ignored like a normal exception."</strong> Risky -
by the time it's thrown, the Stack is nearly exhausted, so the catch block itself may have very little
Stack space left to execute safely.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is stored in a stack frame?</td><td>Local variables, method parameters, the operand stack for expression evaluation, and the return address</td></tr>
<tr><td>Is the Stack shared across threads?</td><td>No - each thread has its own private Stack</td></tr>
<tr><td>What causes StackOverflowError?</td><td>Too many nested/recursive method calls exceeding the thread's Stack capacity, most commonly from unbounded recursion</td></tr>
<tr><td>What flag controls the Stack size?</td><td>-Xss</td></tr>
<tr><td>Does the Stack grow automatically like the Heap?</td><td>No - if it runs out of space, the JVM throws StackOverflowError immediately rather than growing it</td></tr>
<tr><td>Where does an object created with 'new' inside a method actually live?</td><td>On the Heap - only its reference variable lives on the Stack</td></tr>
<tr><td>Why might increasing -Xss be the wrong fix for StackOverflowError?</td><td>It can mask a genuine infinite-recursion bug and increases per-thread memory cost, which adds up quickly with many threads</td></tr>
<tr><td>What happens to a stack frame when its method returns?</td><td>It is popped off the Stack immediately and its memory is reclaimed</td></tr>
</table>`
        }
    ]
};
