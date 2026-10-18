import { Topic } from '../../coreJava';

export const maximumSumIncreasingSubsequence: Topic = {
    id: 'dsa-dynamic-programming-maximum-sum-increasing-subsequence',
    name: 'Maximum Sum Increasing Subsequence',
    beginner: [
        {
            content: `<h4>Maximize SUM Instead of LENGTH</h4>
Same O(n&sup2;) LIS shape, but <code>dp[i]</code> tracks the maximum SUM of an increasing subsequence ending at i, not its length: <code>dp[i] = arr[i] + max(dp[j])</code> for every valid <code>j &lt; i</code> with <code>arr[j] &lt; arr[i]</code>.`,
            codeExamples: [
                `package com.javaschoollab;

public class MaxSumIncreasingSubsequenceDemo {

    static int maxSumIS(int[] arr) {
        int n = arr.length;
        int[] dp = new int[n];

        for (int i = 0; i < n; i++) {
            dp[i] = arr[i];   // base case: subsequence of just this element
        }

        int maxSum = arr[0];
        for (int i = 1; i < n; i++) {
            for (int j = 0; j < i; j++) {
                if (arr[j] < arr[i]) {
                    dp[i] = Math.max(dp[i], dp[j] + arr[i]);
                }
            }
            maxSum = Math.max(maxSum, dp[i]);
        }
        return maxSum;
    }

    public static void main(String[] args) {
        int[] arr = {1, 101, 2, 3, 100, 4, 5};
        System.out.println(maxSumIS(arr));
    }
}
// OUTPUT:
// 106`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why the O(n log n) LIS Trick Doesn't Directly Transfer Here</h3>
Patience sorting's "smallest tail per length" invariant only optimizes for LENGTH. For maximum SUM, a subsequence with a smaller tail value isn't necessarily better - a larger tail value might belong to a HIGHER-sum path. This is why Maximum Sum Increasing Subsequence generally stays at O(n&sup2;) with plain DP, unless a more sophisticated structure (like a Fenwick Tree indexed by value, storing maximum sum instead of a simple boolean/count) is used to recover O(n log n).`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.TreeMap;

public class MaxSumWithFenwickIdeaDemo {

    // Conceptual O(n log n) approach using a TreeMap as a stand-in for a
    // Fenwick Tree keyed by value, storing the best sum achievable for
    // subsequences ending with a tail <= a given value.
    static int maxSumIS(int[] arr) {
        TreeMap<Integer, Integer> bestSumUpTo = new TreeMap<>();   // value -> best sum ending there
        int overallMax = Integer.MIN_VALUE;

        for (int num : arr) {
            Integer bestBefore = bestSumUpTo.lowerKey(num) != null
                ? bestSumUpTo.get(bestSumUpTo.lowerKey(num)) : 0;
            // (a real Fenwick-Tree-based solution would query a PREFIX MAX up to num-1 in O(log n))

            int candidateSum = (bestBefore == null ? 0 : bestBefore) + num;
            bestSumUpTo.merge(num, candidateSum, Math::max);
            overallMax = Math.max(overallMax, candidateSum);
        }
        return overallMax;
    }

    public static void main(String[] args) {
        int[] arr = {1, 101, 2, 3, 100, 4, 5};
        System.out.println(maxSumIS(arr));
        System.out.println("(A full Fenwick Tree implementation gives true O(n log n) prefix-max queries)");
    }
}
// OUTPUT:
// 106
// (A full Fenwick Tree implementation gives true O(n log n) prefix-max queries)`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What's the time complexity of the standard DP solution?</td><td>O(n^2) - the same nested-loop shape as basic LIS, just tracking a different quantity per cell</td></tr>
<tr class='text-center'><td>Why can't the simple "smallest tail wins" patience-sorting invariant be reused directly?</td><td>It optimizes purely for subsequence LENGTH; for maximum SUM, a subsequence with a larger tail could still have a much higher total sum, so "smallest tail" is no longer automatically "best" - the optimization criterion has fundamentally changed</td></tr>
<tr class='text-center'><td>What data structure would give a true O(n log n) solution?</td><td>A Fenwick Tree (or Segment Tree) indexed by VALUE (coordinate-compressed if needed), supporting "query the maximum sum among all values less than X" and "update the maximum sum achievable ending at value X" - both O(log n) operations</td></tr>
</table>`
        }
    ]
};
