import { Topic } from '../coreJava';

export const recursionAlgorithm: Topic = {
    id: 'recursion-algorithm',
    name: 'Recursion',
    beginner: [
        {
            content: `This topic focuses on <strong>designing algorithms recursively</strong> - taking a real problem and
expressing its solution as a smaller version of itself. We assume you already know that a recursive
method is one that calls itself; here we practice building recursive solutions step by step. <br><br>
Every recursive algorithm needs two things: <br>
• A <strong>base case</strong> - the simplest input, solved directly without further recursion. <br>
• A <strong>recursive case</strong> - breaks the problem into a smaller version of itself, plus a call to
the method again.`
        },
        {
            content: `<h3>1. Factorial (n!)</h3>
factorial(n) = n * factorial(n - 1), with factorial(0) = 1 as the base case.`,
            codeExamples: [`public class FactorialDemo {

    static int factorial(int n) {
        if (n == 0) {          // base case
            return 1;
        }
        return n * factorial(n - 1); // recursive case
    }

    public static void main(String[] args) {
        System.out.println("5! = " + factorial(5));
    }
}
// OUTPUT:
// 5! = 120`]
        },
        {
            content: `<h3>2. Fibonacci Sequence</h3>
fib(n) = fib(n-1) + fib(n-2), with fib(0) = 0 and fib(1) = 1 as base cases.`,
            codeExamples: [`public class FibonacciDemo {

    static int fib(int n) {
        if (n == 0) return 0;  // base case
        if (n == 1) return 1;  // base case
        return fib(n - 1) + fib(n - 2); // recursive case
    }

    public static void main(String[] args) {
        for (int i = 0; i < 8; i++) {
            System.out.print(fib(i) + " ");
        }
    }
}
// OUTPUT:
// 0 1 1 2 3 5 8 13`]
        },
        {
            content: `<h3>3. Sum of an Array</h3>
Recursively add the first element to the sum of the rest of the array.`,
            codeExamples: [`public class SumArrayDemo {

    static int sum(int[] arr, int index) {
        if (index == arr.length) { // base case: reached the end
            return 0;
        }
        return arr[index] + sum(arr, index + 1); // recursive case
    }

    public static void main(String[] args) {
        int[] numbers = {4, 8, 15, 16, 23};
        System.out.println("Sum = " + sum(numbers, 0));
    }
}
// OUTPUT:
// Sum = 66`]
        }
    ],

    expert: [
        {
            content: `<h3>Visualizing the Recursion Tree - factorial(4)</h3>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">factorial(4)
  = 4 * factorial(3)
        = 3 * factorial(2)
              = 2 * factorial(1)
                    = 1 * factorial(0)
                          = 1              <-- base case hit
                    = 1 * 1 = 1
              = 2 * 1 = 2
        = 3 * 2 = 6
  = 4 * 6 = 24</pre>
Each call waits on the stack for the call below it to return - this is why deep recursion consumes
stack memory proportional to the recursion depth, O(n) for factorial(n).`
        },
        {
            content: `<h3>Why Naive Fibonacci Recursion Is Expensive</h3>
fib(n) as written above recomputes the same sub-values repeatedly - fib(2) is computed multiple times
inside fib(5), for example. This gives an exponential O(2^n) time complexity.
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">                      fib(5)
                    /        \\
               fib(4)          fib(3)
              /      \\        /      \\
         fib(3)     fib(2)  fib(2)   fib(1)
         /    \\      /  \\    /  \\
     fib(2) fib(1) fib(1)fib(0)fib(1)fib(0)
     /  \\
  fib(1)fib(0)

Notice fib(3), fib(2), fib(1) are each recomputed multiple times - wasted work.</pre>`
        },
        {
            content: `<h3>Stack Depth and StackOverflowError</h3>
Every recursive call pushes a new stack frame. If the base case is never reached (or recursion is too
deep for the input), the JVM throws a <code>StackOverflowError</code>. This is the #1 real-world bug in
recursive code.`,
            codeExamples: [`public class StackOverflowDemo {

    static int badFactorial(int n) {
        // BUG: missing/incorrect base case, or n goes below it and never stops
        return n * badFactorial(n - 1);
    }

    public static void main(String[] args) {
        try {
            System.out.println(badFactorial(5));
        } catch (StackOverflowError e) {
            System.out.println("Caught: StackOverflowError - no base case reached");
        }
    }
}
// OUTPUT:
// Caught: StackOverflowError - no base case reached`]
        },
        {
            content: `<h3>Tail Recursion (and Java's Lack of Tail-Call Optimization)</h3>
A tail-recursive method's recursive call is the very last operation - no pending work remains after it
returns. Some languages optimize this into a loop internally, but <strong>the JVM does not perform
tail-call optimization</strong>, so even a tail-recursive Java method still consumes O(n) stack frames.`,
            codeExamples: [`public class TailRecursiveFactorial {

    static int factorial(int n, int accumulator) {
        if (n == 0) {
            return accumulator; // base case
        }
        return factorial(n - 1, n * accumulator); // tail call - last operation
    }

    public static void main(String[] args) {
        System.out.println("5! = " + factorial(5, 1));
        // Still uses 6 stack frames in Java - JVM does NOT flatten this into a loop
    }
}
// OUTPUT:
// 5! = 120`]
        },
        {
            content: `<h3>Recursion vs Iteration</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>Recursion</th><th>Iteration</th></tr>
<tr class='text-center'><td>Readability for divide-and-conquer problems</td><td>Often clearer</td><td>Can get complex</td></tr>
<tr class='text-center'><td>Memory usage</td><td>O(depth) stack frames</td><td>O(1) typically</td></tr>
<tr class='text-center'><td>Risk</td><td>StackOverflowError on deep recursion</td><td>None from depth</td></tr>
<tr class='text-center'><td>Performance</td><td>Function-call overhead per step</td><td>Usually faster</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What are the two required parts of any recursive method?</td><td>A base case and a recursive case that moves toward the base case</td></tr>
<tr><td>What is the time complexity of naive recursive Fibonacci?</td><td>O(2^n) - exponential, due to repeated recomputation of the same sub-problems</td></tr>
<tr><td>What causes a StackOverflowError?</td><td>Recursion that never reaches its base case, or recursion deeper than the JVM's stack size allows</td></tr>
<tr><td>Does Java optimize tail recursion into a loop?</td><td>No - unlike some functional languages, the JVM does not perform tail-call optimization</td></tr>
<tr><td>What is the space complexity of a recursive call with depth n?</td><td>O(n), one stack frame per active call</td></tr>
<tr><td>How can you convert naive recursive Fibonacci to run efficiently?</td><td>Use memoization (top-down) or tabulation (bottom-up) - see the Dynamic Programming topic</td></tr>
<tr><td>When would you prefer recursion over a loop?</td><td>When the problem is naturally self-similar (tree traversal, divide and conquer, backtracking) and depth is bounded</td></tr>
</table>`
        }
    ]
};
