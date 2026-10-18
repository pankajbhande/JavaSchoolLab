import { Topic } from '../coreJava';

export const recursionConcept: Topic = {
    id: 'recursion-concept',
    name: 'Recursion',
    beginner: [
        {
            content: `<h3>What is Recursion?</h3>
Recursion is when a function solves a problem by calling <strong>itself</strong> with a smaller version of the same problem. Each call works on a slightly simpler input, until the problem becomes so simple it can be answered directly, without any further calls.<br>`,
            codeExamples: [`public class WhatIsRecursion {
    static void countdown(int n) {
        System.out.println(n);
        if (n > 1) {
            countdown(n - 1); // the function calls itself
        }
    }

    public static void main(String[] args) {
        countdown(5);
    }
}
// OUTPUT:
// 5
// 4
// 3
// 2
// 1`]
        },
        {
            content: `<h3>Every Recursive Function Needs a Base Case</h3>
The <strong>base case</strong> is the simplest version of the problem - one that can be answered directly, without recursing further. Without a base case, a recursive function would call itself forever (until the program crashes).<br>`,
            codeExamples: [`public class BaseCaseDemo {
    static int factorial(int n) {
        if (n == 0) {           // base case - stops the recursion
            return 1;
        }
        return n * factorial(n - 1); // recursive case - smaller subproblem
    }

    public static void main(String[] args) {
        System.out.println(factorial(4));
    }
}
// OUTPUT:
// 24`]
        },
        {
            content: `<h3>The Recursive Case: Reducing Toward the Base Case</h3>
The <strong>recursive case</strong> is where the function calls itself, but with input that is closer to the base case than before. Every recursive call must make progress toward that base case, or the recursion never ends.<br>`,
            codeExamples: [`public class RecursiveCaseDemo {
    static int sumUpTo(int n) {
        if (n == 0) return 0;          // base case
        return n + sumUpTo(n - 1);      // recursive case: n-1 is closer to 0
    }

    public static void main(String[] args) {
        System.out.println(sumUpTo(5)); // 5+4+3+2+1+0
    }
}
// OUTPUT:
// 15`]
        },
        {
            content: `<h3>A Simple Real Example: Counting Digits</h3>
Recursion is a natural fit whenever a problem can be defined in terms of a smaller version of itself. Counting the digits of a number is one such problem: "the digit count of n is 1 plus the digit count of n with its last digit removed."<br>`,
            codeExamples: [`public class DigitCountDemo {
    static int countDigits(int n) {
        if (n < 10) return 1;              // base case: single digit
        return 1 + countDigits(n / 10);     // recursive case: strip last digit
    }

    public static void main(String[] args) {
        System.out.println(countDigits(24567));
    }
}
// OUTPUT:
// 5`]
        },
    ],
    expert: [
        {
            content: `<h3>Visualizing the Call Stack During Recursion</h3>
Each recursive call pushes a new stack frame with its own copy of the parameters and local variables. The calls "wind up" (going deeper) until the base case is hit, then "unwind" (returning) as each frame completes and is popped.<br><br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">factorial(4)
  calls factorial(3)
    calls factorial(2)
      calls factorial(1)
        calls factorial(0) -> returns 1   (base case hit)
      factorial(1) returns 1 * 1  = 1
    factorial(2) returns 2 * 1  = 2
  factorial(3) returns 3 * 2  = 6
factorial(4) returns 4 * 6  = 24

Stack while factorial(0) is executing (deepest point):
+----------------+
| factorial(4)    |  n=4, waiting for factorial(3)
+----------------+
| factorial(3)    |  n=3, waiting for factorial(2)
+----------------+
| factorial(2)    |  n=2, waiting for factorial(1)
+----------------+
| factorial(1)    |  n=1, waiting for factorial(0)
+----------------+
| factorial(0)    |  n=0, returns 1 immediately (base case)
+----------------+</pre>`,
            codeExamples: [`public class CallStackTrace {
    static int factorial(int n) {
        System.out.println("Entering factorial(" + n + ")");
        if (n == 0) {
            System.out.println("Base case hit, returning 1");
            return 1;
        }
        int result = n * factorial(n - 1);
        System.out.println("Returning from factorial(" + n + ") = " + result);
        return result;
    }

    public static void main(String[] args) {
        factorial(3);
    }
}
// OUTPUT:
// Entering factorial(3)
// Entering factorial(2)
// Entering factorial(1)
// Entering factorial(0)
// Base case hit, returning 1
// Returning from factorial(1) = 1
// Returning from factorial(2) = 2
// Returning from factorial(3) = 6`]
        },
        {
            content: `<h3>Missing or Wrong Base Case: StackOverflowError</h3>
If the base case is missing, unreachable, or the recursive call doesn't actually move toward it, the function keeps calling itself until the stack runs out of space, throwing a <code>StackOverflowError</code>.<br>`,
            codeExamples: [`public class MissingBaseCase {
    // BUG: passes the same n every time - never approaches a base case
    static int broken(int n) {
        return broken(n) + 1; // n never changes - infinite recursion
    }

    public static void main(String[] args) {
        try {
            broken(5);
        } catch (StackOverflowError e) {
            System.out.println("Caught StackOverflowError - missing/incorrect base case");
        }
    }
}
// OUTPUT:
// Caught StackOverflowError - missing/incorrect base case`]
        },
        {
            content: `<h3>Recursion vs Iteration: Cost Trade-off</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>Recursion</th><th>Iteration (loop)</th></tr>
<tr class='text-center'><td>Extra memory</td><td>O(depth) - one stack frame per call</td><td>O(1) typically - just loop variables</td></tr>
<tr class='text-center'><td>Readability for naturally recursive problems</td><td>Often clearer (tree traversal, divide & conquer)</td><td>Can require an explicit stack/queue to mimic recursion</td></tr>
<tr class='text-center'><td>Risk</td><td>StackOverflowError on deep/unbounded recursion</td><td>Infinite loop if the condition never becomes false</td></tr>
<tr class='text-center'><td>Does Java optimize tail calls?</td><td>No - unlike some languages, the JVM does not perform tail-call elimination</td><td>N/A</td></tr>
</table>`,
            codeExamples: [`public class RecursionVsIterationDemo {
    static long sumRecursive(int n) {
        if (n == 0) return 0;
        return n + sumRecursive(n - 1); // uses n stack frames
    }
    static long sumIterative(int n) {
        long total = 0;
        for (int i = 1; i <= n; i++) total += i; // constant extra memory
        return total;
    }

    public static void main(String[] args) {
        System.out.println(sumRecursive(10));
        System.out.println(sumIterative(10));
    }
}
// OUTPUT:
// 55
// 55`]
        },
        {
            content: `<h3>Why Some Problems Are Naturally Recursive</h3>
Certain data structures and problems are themselves defined recursively - a tree is "a node plus two smaller trees," so traversing it recursively mirrors its own definition and is often clearer than the equivalent iterative code with a manual stack.<br>`,
            codeExamples: [`public class TreeRecursionDemo {
    static class Node {
        int value;
        Node left, right;
        Node(int value, Node left, Node right) {
            this.value = value; this.left = left; this.right = right;
        }
    }

    static int sumTree(Node node) {
        if (node == null) return 0; // base case: empty subtree contributes 0
        return node.value + sumTree(node.left) + sumTree(node.right);
    }

    public static void main(String[] args) {
        Node tree = new Node(1, new Node(2, null, null), new Node(3, new Node(4, null, null), null));
        System.out.println("Sum of tree: " + sumTree(tree));
    }
}
// OUTPUT:
// Sum of tree: 10`]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What are the two essential parts of every recursive function?</td><td>A base case (stops the recursion) and a recursive case (calls itself with a smaller/simpler input)</td></tr>
<tr class='text-center'><td>What happens if the base case is missing or unreachable?</td><td>The function keeps calling itself indefinitely, eventually exhausting the stack and throwing StackOverflowError</td></tr>
<tr class='text-center'><td>Does Java optimize tail-recursive calls the way some functional languages do?</td><td>No - the JVM does not perform tail-call elimination, so even tail-recursive Java code still consumes stack frames per call</td></tr>
<tr class='text-center'><td>Can every recursive function be rewritten iteratively?</td><td>Yes - any recursion can be converted to an iterative version, often using an explicit stack to hold the state each recursive call would have held</td></tr>
<tr class='text-center'><td>Why might recursion be preferred over iteration despite the memory cost?</td><td>For problems that are naturally recursive in structure (e.g. tree/graph traversal), recursive code mirrors the problem's own definition and is often much easier to read and verify</td></tr>
<tr class='text-center'><td>What determines how much stack memory a recursive call uses?</td><td>The maximum recursion depth - each nested call adds one more stack frame until the base case is reached and frames start unwinding</td></tr>
</table>`
        },
    ],
};
