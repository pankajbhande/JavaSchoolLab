import { Topic } from '../../coreJava';

export const climbingStairs: Topic = {
    id: 'dsa-dynamic-programming-climbing-stairs',
    name: 'Climbing Stairs',
    beginner: [
        {
            content: `<h4>How Many Ways to Climb N Stairs, 1 or 2 Steps at a Time?</h4>
The number of ways to reach step n equals ways to reach <code>n-1</code> (then take 1 step) PLUS ways to reach <code>n-2</code> (then take 2 steps) - literally the Fibonacci recurrence in disguise. Bottom-up DP builds this from the base cases upward, O(n) time, O(1) space.`,
            codeExamples: [
                `package com.javaschoollab;

public class ClimbingStairsDemo {

    static int climbStairs(int n) {
        if (n <= 2) return n;

        int prev2 = 1, prev1 = 2;   // ways to reach step 1, step 2
        for (int i = 3; i <= n; i++) {
            int current = prev1 + prev2;   // ways to reach step i
            prev2 = prev1;
            prev1 = current;
        }
        return prev1;
    }

    public static void main(String[] args) {
        System.out.println(climbStairs(5));
    }
}
// OUTPUT:
// 8`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Generalizing to K Allowed Step Sizes</h3>
When steps of {1, 2, ..., k} are allowed instead of just {1, 2}, <code>ways(n) = sum of ways(n - s)</code> for each allowed step size <code>s</code> - a direct generalization, still O(n &times; k) time with a simple DP array.`,
            codeExamples: [
                `package com.javaschoollab;

public class ClimbingStairsKStepsDemo {

    static int climbStairsK(int n, int[] allowedSteps) {
        int[] dp = new int[n + 1];
        dp[0] = 1;   // one way to be "at the start": do nothing

        for (int i = 1; i <= n; i++) {
            for (int step : allowedSteps) {
                if (i - step >= 0) {
                    dp[i] += dp[i - step];
                }
            }
        }
        return dp[n];
    }

    public static void main(String[] args) {
        System.out.println(climbStairsK(5, new int[]{1, 2}));      // matches classic version
        System.out.println(climbStairsK(4, new int[]{1, 2, 3}));   // 3 allowed step sizes
    }
}
// OUTPUT:
// 8
// 7`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why is Climbing Stairs literally the Fibonacci sequence?</td><td>Its recurrence ways(n) = ways(n-1) + ways(n-2) is identical in structure to fib(n) = fib(n-1) + fib(n-2), just with different base case values</td></tr>
<tr class='text-center'><td>What's the space-optimized version's complexity, and why does it work?</td><td>O(1) space - since each step only depends on the previous TWO values, only two variables need to be tracked instead of a full DP array</td></tr>
<tr class='text-center'><td>How would you solve this with matrix exponentiation for very large n?</td><td>The Fibonacci-style recurrence can be expressed as a 2x2 matrix power, computable in O(log n) time via fast exponentiation - useful when n is astronomically large and O(n) is too slow</td></tr>
</table>`
        }
    ]
};
