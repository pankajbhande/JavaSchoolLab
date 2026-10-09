import { Topic } from '../coreJava';

export const dynamicProgramming: Topic = {
    id: 'dynamic-programming',
    name: 'Dynamic Programming',
    beginner: [
        {
            content: `Dynamic Programming (DP) is a technique for solving problems by breaking them into overlapping
sub-problems, solving each sub-problem <strong>only once</strong>, and reusing (caching) the result the
next time it's needed. <br><br>
DP applies when a problem has: <br>
• <strong>Overlapping sub-problems</strong> - the same smaller problem is solved again and again. <br>
• <strong>Optimal substructure</strong> - the overall solution can be built from optimal solutions to
sub-problems. <br><br>
There are two ways to implement DP: <br>
• <strong>Memoization</strong> (top-down) - recursion + a cache. <br>
• <strong>Tabulation</strong> (bottom-up) - an iterative table built from the smallest sub-problem
upward.`
        },
        {
            content: `<h3>1. Naive Recursive Fibonacci (No DP)</h3>
This is correct but slow - it recomputes the same values repeatedly.`,
            codeExamples: [`public class NaiveFibonacci {

    static int fib(int n) {
        if (n <= 1) return n;
        return fib(n - 1) + fib(n - 2); // recomputes overlapping sub-problems
    }

    public static void main(String[] args) {
        long start = System.nanoTime();
        System.out.println("fib(30) = " + fib(30));
        long end = System.nanoTime();
        System.out.println("Time taken (ms): " + (end - start) / 1_000_000);
    }
}
// OUTPUT (approximate time, will vary by machine):
// fib(30) = 832040
// Time taken (ms): 15`]
        },
        {
            content: `<h3>2. Fibonacci With Memoization (Top-Down DP)</h3>
Store each computed result in a cache array so it is never recomputed.`,
            codeExamples: [`import java.util.Arrays;

public class MemoizedFibonacci {

    static int[] memo;

    static int fib(int n) {
        if (n <= 1) return n;
        if (memo[n] != -1) return memo[n]; // already computed - reuse it

        memo[n] = fib(n - 1) + fib(n - 2);
        return memo[n];
    }

    public static void main(String[] args) {
        int n = 30;
        memo = new int[n + 1];
        Arrays.fill(memo, -1);

        System.out.println("fib(30) = " + fib(n));
    }
}
// OUTPUT:
// fib(30) = 832040`]
        },
        {
            content: `<h3>3. Fibonacci With Tabulation (Bottom-Up DP)</h3>
Build the answer iteratively from the smallest sub-problems up, avoiding recursion entirely.`,
            codeExamples: [`public class TabulatedFibonacci {

    static int fib(int n) {
        if (n <= 1) return n;

        int[] dp = new int[n + 1];
        dp[0] = 0;
        dp[1] = 1;

        for (int i = 2; i <= n; i++) {
            dp[i] = dp[i - 1] + dp[i - 2]; // build up from smaller answers
        }
        return dp[n];
    }

    public static void main(String[] args) {
        System.out.println("fib(30) = " + fib(30));
    }
}
// OUTPUT:
// fib(30) = 832040`]
        }
    ],

    expert: [
        {
            content: `<h3>Performance Comparison: Naive vs Memoized vs Tabulated</h3>
Run all three approaches for fib(40) and compare - naive recursion becomes noticeably slow while the DP
versions stay instant.`,
            codeExamples: [`public class FibonacciBenchmark {

    static int naiveFib(int n) {
        if (n <= 1) return n;
        return naiveFib(n - 1) + naiveFib(n - 2);
    }

    static int[] memo;
    static int memoFib(int n) {
        if (n <= 1) return n;
        if (memo[n] != -1) return memo[n];
        return memo[n] = memoFib(n - 1) + memoFib(n - 2);
    }

    static int tabFib(int n) {
        if (n <= 1) return n;
        int[] dp = new int[n + 1];
        dp[1] = 1;
        for (int i = 2; i <= n; i++) dp[i] = dp[i - 1] + dp[i - 2];
        return dp[n];
    }

    public static void main(String[] args) {
        int n = 35;

        long t1 = System.nanoTime();
        int naiveResult = naiveFib(n);
        long t2 = System.nanoTime();
        System.out.println("Naive:     result=" + naiveResult + "  time(ms)=" + (t2 - t1) / 1_000_000);

        memo = new int[n + 1];
        java.util.Arrays.fill(memo, -1);
        t1 = System.nanoTime();
        int memoResult = memoFib(n);
        t2 = System.nanoTime();
        System.out.println("Memoized:  result=" + memoResult + "  time(ms)=" + (t2 - t1) / 1_000_000);

        t1 = System.nanoTime();
        int tabResult = tabFib(n);
        t2 = System.nanoTime();
        System.out.println("Tabulated: result=" + tabResult + "  time(ms)=" + (t2 - t1) / 1_000_000);
    }
}
// OUTPUT (exact ms varies by machine, but the ORDER OF MAGNITUDE gap is consistent):
// Naive:     result=9227465  time(ms)=45
// Memoized:  result=9227465  time(ms)=0
// Tabulated: result=9227465  time(ms)=0`]
        },
        {
            content: `<h3>Complexity Comparison</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Approach</th><th>Time Complexity</th><th>Space Complexity</th><th>Notes</th></tr>
<tr class='text-center'><td>Naive Recursion</td><td>O(2^n)</td><td>O(n) stack</td><td>Exponential - unusable beyond n ~ 40</td></tr>
<tr class='text-center'><td>Memoization (top-down)</td><td>O(n)</td><td>O(n) cache + O(n) stack</td><td>Easy to derive from naive recursion</td></tr>
<tr class='text-center'><td>Tabulation (bottom-up)</td><td>O(n)</td><td>O(n) table</td><td>No recursion, no stack overflow risk</td></tr>
<tr class='text-center'><td>Tabulation (space-optimized)</td><td>O(n)</td><td>O(1)</td><td>Only keep last 2 values, not the full table</td></tr>
</table>`
        },
        {
            content: `<h3>Space-Optimized Tabulation</h3>
Since Fibonacci only ever needs the previous two values, we can drop the array entirely and use two
variables - O(1) space instead of O(n).`,
            codeExamples: [`public class SpaceOptimizedFibonacci {

    static int fib(int n) {
        if (n <= 1) return n;

        int prev2 = 0, prev1 = 1;
        for (int i = 2; i <= n; i++) {
            int current = prev1 + prev2;
            prev2 = prev1;
            prev1 = current;
        }
        return prev1;
    }

    public static void main(String[] args) {
        System.out.println("fib(30) = " + fib(30));
    }
}
// OUTPUT:
// fib(30) = 832040`]
        },
        {
            content: `<h3>Another Classic: 0/1 Knapsack With DP</h3>
Given item weights/values and a capacity, choose a subset maximizing value without exceeding capacity -
each item is either fully taken or not (unlike Fractional Knapsack, greedy does NOT work here).`,
            codeExamples: [`public class KnapsackDP {

    static int knapsack(int[] weights, int[] values, int capacity) {
        int n = weights.length;
        int[][] dp = new int[n + 1][capacity + 1];

        for (int i = 1; i <= n; i++) {
            for (int w = 0; w <= capacity; w++) {
                if (weights[i - 1] <= w) {
                    // max of: skip item, or take item + best of remaining capacity
                    dp[i][w] = Math.max(dp[i - 1][w], values[i - 1] + dp[i - 1][w - weights[i - 1]]);
                } else {
                    dp[i][w] = dp[i - 1][w]; // can't fit - skip
                }
            }
        }
        return dp[n][capacity];
    }

    public static void main(String[] args) {
        int[] weights = {1, 3, 4, 5};
        int[] values  = {1, 4, 5, 7};
        int capacity = 7;

        System.out.println("Max value: " + knapsack(weights, values, capacity));
    }
}
// OUTPUT:
// Max value: 9`]
        },
        {
            content: `<h3>Recognizing DP Problems</h3>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Does the problem ask you to find a MIN / MAX / COUNT
of ways, given choices at each step?
        |
        v
Can the problem be broken into smaller sub-problems
that overlap (the same sub-problem recurs)?
        |
        v
   YES to both  --> candidate for Dynamic Programming
   NO           --> plain recursion, greedy, or divide & conquer instead</pre>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What two properties must a problem have for DP to apply?</td><td>Overlapping sub-problems and optimal substructure</td></tr>
<tr><td>What is the difference between memoization and tabulation?</td><td>Memoization is top-down recursion with caching; tabulation is bottom-up iteration filling a table</td></tr>
<tr><td>What is the time complexity of naive recursive Fibonacci?</td><td>O(2^n) - exponential due to repeated recomputation</td></tr>
<tr><td>What is the time complexity of memoized/tabulated Fibonacci?</td><td>O(n) - each sub-problem computed exactly once</td></tr>
<tr><td>How can you reduce Fibonacci DP space from O(n) to O(1)?</td><td>Only keep the last two computed values in variables instead of a full array</td></tr>
<tr><td>Why doesn't Greedy work for 0/1 Knapsack?</td><td>Local best-ratio choices can block a better combination since items can't be split - it lacks the greedy-choice property</td></tr>
<tr><td>What data structure is typically used in tabulated DP for 2D problems?</td><td>A 2D array/table, e.g. dp[i][w] for Knapsack, indexed by item count and remaining capacity</td></tr>
<tr><td>What is the risk of memoization for very large n?</td><td>Deep recursion can cause a StackOverflowError even though results are cached - tabulation avoids this</td></tr>
</table>`
        }
    ]
};
