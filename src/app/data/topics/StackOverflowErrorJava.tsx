import { Topic } from '../coreJava';

export const stackOverflowErrorJava: Topic = {
    id: 'stack-overflow-error-java',
    name: 'StackOverflowError',
    beginner: [
        {
            content: `<h3>What is StackOverflowError?</h3>
Every time a method is called, the JVM pushes a new <strong>stack frame</strong> onto that thread's call stack, to
remember local variables, parameters, and where to return to. Each thread's stack has a fixed maximum size. <br><br>
<code>java.lang.StackOverflowError</code> is thrown when a thread's call stack grows beyond that limit - almost
always because of a method calling itself (directly or indirectly) too many times without stopping, i.e.
<strong>uncontrolled recursion</strong>. <br><br>
Like OutOfMemoryError, it is a subclass of <code>java.lang.Error</code>, not Exception.`
        },
        {
            content: `<h4>1. Infinite Recursion</h4>
The simplest way to trigger it: a method that calls itself with no base case (no stopping condition) at all.`,
            codeExamples: [`public class InfiniteRecursionDemo {

    static void recurse() {
        recurse(); // no base case - calls itself forever
    }

    public static void main(String[] args) {
        recurse();
    }
}
// OUTPUT:
// Exception in thread "main" java.lang.StackOverflowError
//     at InfiniteRecursionDemo.recurse(InfiniteRecursionDemo.java:4)
//     at InfiniteRecursionDemo.recurse(InfiniteRecursionDemo.java:4)
//     at InfiniteRecursionDemo.recurse(InfiniteRecursionDemo.java:4)
//     ... (thousands more identical lines)`]
        },
        {
            content: `<h4>2. A Base Case That's Wrong (Bug, Not Design)</h4>
More often in real code, the recursion <em>does</em> have a base case - but a bug means it's never actually
reached for certain inputs.`,
            codeExamples: [`public class BrokenFactorialDemo {

    // BUG: decrements the wrong way for negative input, so it never hits 0
    static long factorial(int n) {
        if (n == 0) {
            return 1;
        }
        return n * factorial(n - 1);
    }

    public static void main(String[] args) {
        System.out.println(factorial(-5)); // n goes -5, -6, -7 ... never reaches 0
    }
}
// OUTPUT:
// Exception in thread "main" java.lang.StackOverflowError
//     at BrokenFactorialDemo.factorial(BrokenFactorialDemo.java:6)
//     at BrokenFactorialDemo.factorial(BrokenFactorialDemo.java:6)
//     ... (repeats until the stack is exhausted)`]
        },
        {
            content: `<h4>3. Mutual (Indirect) Recursion</h4>
StackOverflowError doesn't require a method to call <em>itself</em> - two or more methods calling each other in a
cycle produce the exact same problem.`,
            codeExamples: [`public class MutualRecursionDemo {

    static boolean isEven(int n) {
        if (n == 0) return true;
        return isOdd(n - 1);
    }

    static boolean isOdd(int n) {
        if (n == 0) return false;
        return isEven(n - 1); // BUG: should be n - 1 going toward 0, but say n grows
    }

    public static void main(String[] args) {
        System.out.println(isEven(-1)); // n never reaches 0 - keeps going negative
    }
}
// OUTPUT:
// Exception in thread "main" java.lang.StackOverflowError
//     at MutualRecursionDemo.isOdd(MutualRecursionDemo.java:9)
//     at MutualRecursionDemo.isEven(MutualRecursionDemo.java:5)
//     at MutualRecursionDemo.isOdd(MutualRecursionDemo.java:9)
//     ... (alternating frames)`]
        },
        {
            content: `<h4>Fixing It: Convert Recursion to Iteration</h4>
The most reliable fix for deep/unbounded recursion is to rewrite it as a loop, which uses a small, constant amount
of stack space no matter how many "steps" are performed.`,
            codeExamples: [`public class IterativeFactorialDemo {

    static long factorial(int n) {
        long result = 1;
        for (int i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }

    public static void main(String[] args) {
        System.out.println(factorial(20)); // works fine, no matter how large n is (until overflow of long itself)
    }
}
// OUTPUT:
// 2432902008176640000`]
        }
    ],

    expert: [
        {
            content: `<h3>Why Java Has No Guaranteed Tail-Call Optimization</h3>
In languages like Scala or Scheme, "tail-recursive" calls (where the recursive call is the very last operation,
with nothing left to do after it returns) can be compiled into a loop by the compiler, reusing the same stack
frame. <br><br>
The JVM specification does <strong>not</strong> guarantee tail-call optimization, and the HotSpot JVM does not
perform it (as of current mainstream JDKs). This means even a "clean" tail-recursive Java method still consumes one
stack frame per call - so relying on deep recursion in Java is inherently risky, unlike in TCO languages.`
        },
        {
            content: `<h3>Manually Simulating Tail-Call Style with an Explicit Stack</h3>
When a recursive algorithm is naturally elegant but might recurse too deep (e.g. traversing a very deep tree or
long linked list), a common production technique is to replace the call stack with your own heap-allocated
<code>Deque</code>, which has no fixed size limit (bounded only by heap memory, which can grow far larger than a
thread stack).`,
            codeExamples: [`import java.util.ArrayDeque;
import java.util.Deque;

public class IterativeTreeTraversal {

    static class Node {
        int value;
        Node left, right;
        Node(int v) { value = v; }
    }

    // Recursive version would StackOverflow on a very deep/unbalanced tree
    static void traverseIterative(Node root) {
        Deque<Node> stack = new ArrayDeque<>();
        stack.push(root);
        while (!stack.isEmpty()) {
            Node node = stack.pop();
            if (node == null) continue;
            System.out.println(node.value);
            stack.push(node.right);
            stack.push(node.left);
        }
    }

    public static void main(String[] args) {
        Node root = new Node(1);
        root.left = new Node(2);
        root.right = new Node(3);
        traverseIterative(root);
    }
}
// OUTPUT:
// 1
// 2
// 3`]
        },
        {
            content: `<h3>Tuning Thread Stack Size with -Xss</h3>
The <code>-Xss</code> flag sets the stack size <em>per thread</em> (default is typically 512KB-1MB depending on OS
and JDK version). Increasing it lets recursion go deeper before overflowing, but it is a trade-off, not a real
fix: <br><br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">java -Xss4m RecursiveApp   # 4MB stack instead of default ~512KB-1MB

Trade-off:
  Larger -Xss  -> deeper recursion survives, BUT
                  each thread now reserves more memory,
                  so max thread count for a given RAM budget goes DOWN.

  1000 threads x 512KB = ~512MB reserved for stacks
  1000 threads x 4MB   = ~4GB reserved for stacks (may itself cause native OOM)</pre>
In server applications running hundreds of threads, bumping <code>-Xss</code> globally to fix one bad
recursive path can quietly push the JVM toward
<code>OutOfMemoryError: unable to create new native thread</code> instead - so treat it as a stopgap, and fix the
recursion (or convert it to iteration) as the real solution.`
        },
        {
            content: `<h3>Reading a StackOverflowError Stack Trace</h3>
The key diagnostic signal is <strong>repetition</strong>: the same one or two method frames repeating hundreds or
thousands of times is the fingerprint of runaway recursion, as opposed to a normal deep-but-varied call chain.
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Exception in thread "main" java.lang.StackOverflowError
    at com.shop.pricing.DiscountEngine.applyRule(DiscountEngine.java:42)
    at com.shop.pricing.DiscountEngine.applyRule(DiscountEngine.java:42)
    at com.shop.pricing.DiscountEngine.applyRule(DiscountEngine.java:42)
    at com.shop.pricing.DiscountEngine.applyRule(DiscountEngine.java:42)
    ... (repeats thousands of times) ...
    at com.shop.pricing.DiscountEngine.applyRule(DiscountEngine.java:42)
    at com.shop.pricing.OrderService.calculateTotal(OrderService.java:88)
    at com.shop.web.CheckoutController.checkout(CheckoutController.java:31)</pre>
Line 42 in <code>DiscountEngine.applyRule</code> is where to look first - that's the recursive call site, and the
bug is almost always in its base/stopping condition.`
        },
        {
            content: `<h3>Symptom -> Root Cause -> Diagnosis -> Fix</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Symptom</th><th>Root Cause</th><th>Diagnosis</th><th>Fix</th></tr>
<tr><td>StackOverflowError on a specific "rule engine" / tree-walking code path only for certain inputs</td><td>Recursive base case never reached for those inputs (e.g. cyclic data structure, off-by-one termination bug)</td><td>Trace repeating frame in the stack trace to find the exact recursive method and inspect its termination condition</td><td>Fix the base case / add a cycle-detection guard (visited set) before recursing further</td></tr>
<tr><td>StackOverflowError only in production, never locally</td><td>Production data is deeper/larger than test fixtures (e.g. a genuinely deep category tree, deeply nested JSON)</td><td>Reproduce with production-sized/shaped input in a test; measure actual recursion depth reached</td><td>Convert to an iterative algorithm with an explicit Deque, which scales with heap, not stack</td></tr>
<tr><td>Two mutually-recursive methods (e.g. Parser/Evaluator) overflow on complex expressions</td><td>Indirect/mutual recursion with no depth limit, common in recursive-descent parsers</td><td>Look for alternating method names in the repeating stack frames</td><td>Add an explicit maximum nesting-depth check, or rewrite using an explicit stack-based parser</td></tr>
<tr><td>Increasing -Xss "fixes" it temporarily, then OutOfMemoryError: unable to create new native thread appears under load</td><td>Larger per-thread stacks multiplied across many concurrent threads exhaust native/process memory</td><td>Compare thread count x -Xss against available process memory; check ulimit -u</td><td>Revert -Xss increase; fix the underlying unbounded recursion instead of masking it</td></tr>
</table>`
        },
        {
            content: `<h3>War Story: The Self-Referencing Category Tree</h3>
An e-commerce catalog service exposed a "breadcrumb" feature that recursively walked up a product category's
parent chain to build a path like <code>Electronics &gt; Laptops &gt; Gaming Laptops</code>. It had worked in
production for two years. <br><br>
A data-migration script introduced a bug that, under a rare merge-conflict scenario, set a category's
<code>parentId</code> to point to one of its own descendants - creating a cycle. The very next time a customer
viewed a product in that category, the breadcrumb-building recursion walked up the "parent" chain forever
(A -&gt; B -&gt; C -&gt; A -&gt; B -&gt; C ...) until <code>StackOverflowError</code> crashed that request thread.
Because the cycle only affected one category, it looked like a random, hard-to-reproduce crash for days. <br><br>
<strong>Fix:</strong> the recursive breadcrumb builder was rewritten iteratively with an explicit
<code>Set&lt;Long&gt; visitedIds</code>, so that if a cycle is ever encountered again, the code detects it and
throws a clear, catchable <code>IllegalStateException("Cyclic category detected")</code> instead of crashing the
thread with StackOverflowError.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What causes StackOverflowError?</td><td>A thread's call stack exceeds its maximum size, almost always due to recursion (direct, indirect, or via a cyclic data structure) without a properly reached base case</td></tr>
<tr><td>Is StackOverflowError an Exception or an Error?</td><td>It is a java.lang.Error (subclass of Throwable, sibling of Exception) - it signals a serious JVM-level condition, not an ordinary recoverable exception</td></tr>
<tr><td>Does Java optimize tail-recursive calls into loops?</td><td>No - the JVM spec does not require tail-call optimization and mainstream HotSpot JVMs do not perform it, so every recursive call, even tail-recursive ones, consumes a stack frame</td></tr>
<tr><td>How does -Xss relate to StackOverflowError?</td><td>-Xss sets the per-thread stack size; increasing it lets recursion go deeper before overflowing, but increases memory reserved per thread, reducing how many threads a given memory budget supports</td></tr>
<tr><td>How would you fix a recursive method that risks StackOverflowError on deep input?</td><td>Rewrite it iteratively using an explicit Deque/stack on the heap, since heap-based structures aren't bound by the fixed thread stack size</td></tr>
<tr><td>How do you recognize StackOverflowError from a stack trace at a glance?</td><td>The same one or two method frames repeat an unusually large number of times consecutively, unlike a normal varied deep call chain</td></tr>
<tr><td>Can mutual recursion between two methods cause StackOverflowError?</td><td>Yes - Method A calling Method B calling Method A in a cycle with no terminating condition overflows the stack exactly like direct self-recursion</td></tr>
<tr><td>Why is simply increasing -Xss risky as a fix in a high-concurrency server app?</td><td>Multiplying a larger stack size across hundreds/thousands of threads can exhaust native process memory, potentially trading StackOverflowError for OutOfMemoryError: unable to create new native thread</td></tr>
</table>`
        }
    ]
};
