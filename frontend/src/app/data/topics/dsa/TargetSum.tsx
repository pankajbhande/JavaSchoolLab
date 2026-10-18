import { Topic } from '../../coreJava';

export const targetSum: Topic = {
    id: 'dsa-dynamic-programming-target-sum',
    name: 'Target Sum',
    beginner: [
        {
            content: `<h4>Assigning + or - to Each Number to Hit a Target</h4>
Given numbers and a target, assign a <code>+</code> or <code>-</code> sign to EACH number so the total equals target; count how many ways this is possible. The algebraic trick: split numbers into a POSITIVE group P and NEGATIVE group N. Since <code>sum(P) - sum(N) = target</code> and <code>sum(P) + sum(N) = total</code>, solving gives <code>sum(P) = (total + target) / 2</code> - turning this into counting Subset Sum ways for that specific value.`,
            codeExamples: [
                `package com.javaschoollab;

public class TargetSumDemo {

    static int findTargetSumWays(int[] nums, int target) {
        int total = 0;
        for (int n : nums) total += n;

        // (total + target) must be even and non-negative for a valid split to exist
        if ((total + target) % 2 != 0 || total + target < 0) return 0;

        int subsetSumTarget = (total + target) / 2;
        return countSubsetsWithSum(nums, subsetSumTarget);
    }

    static int countSubsetsWithSum(int[] nums, int target) {
        int[] dp = new int[target + 1];
        dp[0] = 1;

        for (int num : nums) {
            for (int s = target; s >= num; s--) {
                dp[s] += dp[s - num];
            }
        }
        return dp[target];
    }

    public static void main(String[] args) {
        int[] nums = {1, 1, 1, 1, 1};
        System.out.println(findTargetSumWays(nums, 3));
    }
}
// OUTPUT:
// 5`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why the Algebraic Reduction to Subset Sum is Valid</h3>
The derivation <code>sum(P) = (total + target) / 2</code> comes directly from solving two simultaneous equations. This reduction is what turns an apparently "assign signs" combinatorics problem into a well-known "count subsets summing to X" problem - recognizing this kind of algebraic transformation is a common and valuable DP interview skill beyond just knowing the Subset Sum template itself.`,
            codeExamples: [
                `package com.javaschoollab;

public class TargetSumDerivationDemo {
    public static void main(String[] args) {
        System.out.println("Let P = set of numbers assigned '+', N = set assigned '-'.");
        System.out.println("sum(P) - sum(N) = target   ... (the target equation)");
        System.out.println("sum(P) + sum(N) = total    ... (all numbers, regardless of sign)");
        System.out.println();
        System.out.println("Adding both equations: 2*sum(P) = total + target");
        System.out.println("So: sum(P) = (total + target) / 2");
        System.out.println();
        System.out.println("Counting ways to choose P with this exact sum IS counting subsets");
        System.out.println("summing to (total + target) / 2 - directly reusing Subset Sum's DP.");
    }
}
// OUTPUT:
// Let P = set of numbers assigned '+', N = set assigned '-'.
// sum(P) - sum(N) = target   ... (the target equation)
// sum(P) + sum(N) = total    ... (all numbers, regardless of sign)
//
// Adding both equations: 2*sum(P) = total + target
// So: sum(P) = (total + target) / 2
//
// Counting ways to choose P with this exact sum IS counting subsets
// summing to (total + target) / 2 - directly reusing Subset Sum's DP.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why check "(total + target) % 2 != 0" before proceeding?</td><td>sum(P) must be a whole number of actual array elements' worth - if (total + target) is odd, no valid integer split into P and N can satisfy both equations simultaneously</td></tr>
<tr class='text-center'><td>What's the time complexity of Target Sum?</td><td>O(n * total), pseudo-polynomial - identical complexity class to the Subset Sum counting problem it reduces to</td></tr>
<tr class='text-center'><td>Could Target Sum be solved with plain backtracking instead?</td><td>Yes, trying + and - at each number - O(2^n) without memoization; the DP reduction avoids that exponential blowup entirely by recognizing the underlying subset-counting structure</td></tr>
</table>`
        }
    ]
};
