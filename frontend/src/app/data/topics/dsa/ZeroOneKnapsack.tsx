import { Topic } from '../../coreJava';

export const zeroOneKnapsack: Topic = {
    id: 'dsa-dynamic-programming-0-1-knapsack',
    name: '0/1 Knapsack',
    beginner: [
        {
            content: `<h4>Each Item Taken At Most Once</h4>
Given items with weight and value, and a capacity, maximize value - each item is either taken WHOLE or not at all (unlike Fractional Knapsack). <code>dp[i][w]</code> = best value using the first i items with capacity w: either skip item i, or take it (if it fits) and add its value to the best result with the remaining capacity.`,
            codeExamples: [
                `package com.javaschoollab;

public class ZeroOneKnapsackDemo {

    static int knapsack(int[] weights, int[] values, int capacity) {
        int n = weights.length;
        int[][] dp = new int[n + 1][capacity + 1];

        for (int i = 1; i <= n; i++) {
            for (int w = 0; w <= capacity; w++) {
                dp[i][w] = dp[i - 1][w];   // option 1: skip item i

                if (weights[i - 1] <= w) {   // option 2: take item i, if it fits
                    dp[i][w] = Math.max(dp[i][w], dp[i - 1][w - weights[i - 1]] + values[i - 1]);
                }
            }
        }
        return dp[n][capacity];
    }

    public static void main(String[] args) {
        int[] weights = {1, 3, 4, 5};
        int[] values = {1, 4, 5, 7};
        System.out.println(knapsack(weights, values, 7));
    }
}
// OUTPUT:
// 9`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Space Optimization - Why the Weight Loop Must Go BACKWARD</h3>
Since <code>dp[i][w]</code> only depends on ROW <code>i-1</code>, a single 1D array can replace the 2D table - BUT the capacity loop must iterate BACKWARD (high to low). Forward iteration would let an item's own contribution leak into its OWN calculation within the same row, incorrectly allowing that item to be used more than once (turning 0/1 Knapsack into Unbounded Knapsack by accident).`,
            codeExamples: [
                `package com.javaschoollab;

public class KnapsackSpaceOptimizedDemo {

    static int knapsack(int[] weights, int[] values, int capacity) {
        int[] dp = new int[capacity + 1];

        for (int i = 0; i < weights.length; i++) {
            // BACKWARD iteration is essential for 0/1 (each item used at most once)
            for (int w = capacity; w >= weights[i]; w--) {
                dp[w] = Math.max(dp[w], dp[w - weights[i]] + values[i]);
            }
        }
        return dp[capacity];
    }

    public static void main(String[] args) {
        int[] weights = {1, 3, 4, 5};
        int[] values = {1, 4, 5, 7};
        System.out.println(knapsack(weights, values, 7));
    }
}
// OUTPUT:
// 9`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What's the time and space complexity of 0/1 Knapsack?</td><td>O(n * capacity) time; O(n * capacity) space for the 2D version, reducible to O(capacity) with the backward-iteration 1D optimization</td></tr>
<tr class='text-center'><td>Why must the space-optimized version iterate the capacity loop BACKWARD?</td><td>Forward iteration would read dp[w - weight] AFTER it's already been updated for the CURRENT item in this same pass, effectively allowing the item to be counted twice - backward iteration guarantees dp[w - weight] still reflects the PREVIOUS item's state</td></tr>
<tr class='text-center'><td>Is 0/1 Knapsack NP-hard?</td><td>The general (unbounded-weight, unbounded-capacity) version is NP-hard, but the DP solution shown is "pseudo-polynomial" - O(n*capacity) is polynomial in the VALUE of capacity, not in the number of BITS needed to represent it, which is why it's fast in practice for reasonable capacities but not truly polynomial-time</td></tr>
</table>`
        }
    ]
};
