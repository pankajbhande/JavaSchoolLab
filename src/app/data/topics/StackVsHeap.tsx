import { Topic } from '../coreJava';

export const stackVsHeap: Topic = {
    id: 'stack-vs-heap',
    name: 'Stack vs Heap',
    beginner: [
        {
            content: `<h3>Two Memory Areas Every Java Program Uses</h3>
When a Java program runs, the JVM splits the memory it uses into different areas. The two you'll hear about
constantly are the <strong>Stack</strong> and the <strong>Heap</strong>. <br><br>
• <strong>Stack</strong> - stores method calls and local variables. Very fast, very short-lived. <br>
• <strong>Heap</strong> - stores all objects (created with <code>new</code>). Larger, longer-lived, shared
by the whole program.`
        },
        {
            content: `<h3>What Goes on the Stack</h3>
Each time a method is called, the JVM pushes a new <strong>stack frame</strong> for it. That frame holds the
method's local variables and primitive values. When the method finishes, its frame is popped and everything
in it disappears automatically.`,
            codeExamples: [`public class StackDemo {

    static int square(int n) {
        int result = n * n; // 'n' and 'result' live in this method's stack frame
        return result;
    }

    public static void main(String[] args) {
        int x = 5; // lives in main's stack frame
        int y = square(x); // creates a NEW stack frame for square()
        System.out.println("y = " + y);
    }
}
// OUTPUT:
// y = 25`]
        },
        {
            content: `<h3>What Goes on the Heap</h3>
Every object you create with <code>new</code> lives on the Heap - not the Stack. Only the reference
(address) to that object sits on the Stack.`,
            codeExamples: [`public class HeapDemo {
    int value;

    HeapDemo(int value) { this.value = value; }

    public static void main(String[] args) {
        HeapDemo obj = new HeapDemo(10); // 'obj' (reference) -> Stack
                                          // the HeapDemo object itself -> Heap
        System.out.println("obj.value = " + obj.value);
    }
}
// OUTPUT:
// obj.value = 10`]
        },
        {
            content: `<h3>Primitives vs Objects: Where They Live</h3>
A <strong>local primitive variable</strong> (int, double, boolean, etc.) stores its actual value directly on
the Stack. An <strong>object</strong> always lives on the Heap, and the variable pointing to it (on the
Stack) only holds its address.`,
            codeExamples: [`public class PrimitiveVsObjectDemo {
    public static void main(String[] args) {
        int age = 25;                 // value 25 stored directly on Stack
        String name = new String("Aisha"); // "Aisha" object on Heap, reference on Stack

        System.out.println("age = " + age);
        System.out.println("name = " + name);
    }
}
// OUTPUT:
// age = 25
// name = Aisha`]
        },
        {
            content: `<h3>Why This Matters: Method Calls Are Isolated</h3>
Because each method call gets its own fresh stack frame, local variables in one method call can never
accidentally clash with local variables of another call - even recursive calls to the same method.`,
            codeExamples: [`public class RecursionStackDemo {

    static int factorial(int n) {
        if (n <= 1) return 1;
        return n * factorial(n - 1); // each call gets its OWN stack frame with its own 'n'
    }

    public static void main(String[] args) {
        System.out.println(factorial(5));
    }
}
// OUTPUT:
// 120`]
        }
    ],

    expert: [
        {
            content: `<h3>Stack Frame Anatomy</h3>
Each thread in Java gets its own private Stack (this is why Stack data is inherently thread-safe - no
sharing). Every stack frame pushed onto it typically contains: <br>
• Local variables array (primitives and object references). <br>
• Operand stack (used internally by the JVM to evaluate expressions/bytecode). <br>
• A reference to the runtime constant pool of the current class (for resolving symbols). <br><br>
The Heap, in contrast, is a single shared area across ALL threads - which is exactly why object access can
require synchronization, while purely-local primitive computation never does.`
        },
        {
            content: `<h3>Memory Layout Diagram</h3>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Thread-1 Stack        Thread-2 Stack             Shared Heap
+--------------+       +--------------+       +-------------------------+
| main() frame |       | run() frame  |       | Eden | Survivor 0/1     |
|  x = 5       |       |  local vars  |  -->  | Young Generation        |
|  obj -----------------------------------+   +-------------------------+
+--------------+       +--------------+   |   | Old Generation (Tenured)|
                                           +-> |  long-lived objects     |
                                               +-------------------------+</pre>
Notice: each thread's stack is private and small; the Heap is shared, larger, and is where the Garbage
Collector does all of its work - the Stack is never garbage collected, it just unwinds.`
        },
        {
            content: `<h3>Stack vs Heap: Detailed Comparison</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>Stack</th><th>Heap</th></tr>
<tr class='text-center'><td>Stores</td><td>Method frames, local vars, primitives, references</td><td>All objects and arrays</td></tr>
<tr class='text-center'><td>Scope</td><td>Per-thread (private)</td><td>Shared across all threads</td></tr>
<tr class='text-center'><td>Lifetime</td><td>Tied to method call (LIFO)</td><td>Tied to reachability (GC-managed)</td></tr>
<tr class='text-center'><td>Speed</td><td>Very fast (pointer bump / pop)</td><td>Slower (allocation + GC overhead)</td></tr>
<tr class='text-center'><td>Size</td><td>Small, fixed per thread (<code>-Xss</code>)</td><td>Large, configurable (<code>-Xms</code>/<code>-Xmx</code>)</td></tr>
<tr class='text-center'><td>Error on exhaustion</td><td>StackOverflowError</td><td>OutOfMemoryError</td></tr>
<tr class='text-center'><td>Thread safety</td><td>Inherently thread-safe (private)</td><td>Requires synchronization for shared mutable objects</td></tr>
</table>`
        },
        {
            content: `<h3>Common Bugs and Misconceptions</h3>
• <strong>"All local variables are on the stack, always."</strong> Mostly true for primitives, but a local
<em>object</em> variable only stores a reference on the stack - the object itself is on the heap (unless
escape analysis proves it can be scalar-replaced and avoid the heap entirely). <br>
• <strong>Deep/unbounded recursion causing <code>StackOverflowError</code></strong> - each call pushes a
new frame; without a proper base case, thousands of frames accumulate until the (small, fixed) stack size
is exhausted. <br>
• <strong>Confusing "heap" (JVM heap) with "Heap" the data structure</strong> (priority queue) - same word,
completely unrelated concepts. <br>
• <strong>Assuming bigger Stack always helps performance.</strong> Increasing <code>-Xss</code> only helps
avoid StackOverflowError for deep recursion; it does nothing for heap/object performance, and consumes more
memory per thread (multiplied by thread count).`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is stored on the Java Stack?</td><td>Method call frames: local primitive variables and object references (not the objects themselves)</td></tr>
<tr><td>What is stored on the Java Heap?</td><td>All objects and arrays created with <code>new</code>, shared across all threads</td></tr>
<tr><td>Is the Stack shared between threads?</td><td>No, each thread has its own private stack; only the Heap is shared</td></tr>
<tr><td>What error occurs when the Stack is exhausted?</td><td>StackOverflowError, typically from unbounded/deep recursion</td></tr>
<tr><td>What error occurs when the Heap is exhausted?</td><td>OutOfMemoryError</td></tr>
<tr><td>Which JVM flags control Stack and Heap size?</td><td><code>-Xss</code> for per-thread stack size; <code>-Xms</code>/<code>-Xmx</code> for initial/max heap size</td></tr>
<tr><td>Why is the Stack faster than the Heap for allocation?</td><td>Stack allocation is just moving a pointer (push/pop, LIFO) with no GC involvement, while Heap allocation involves bookkeeping and eventual garbage collection</td></tr>
<tr><td>Can an object ever avoid the Heap entirely?</td><td>Yes, via JIT escape analysis and scalar replacement, if the object is proven not to escape the method</td></tr>
</table>`
        }
    ]
};
