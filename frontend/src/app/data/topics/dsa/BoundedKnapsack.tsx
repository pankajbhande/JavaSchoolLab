import { Topic } from '../../coreJava';

export const boundedKnapsack: Topic = {
    id: 'dsa-dynamic-programming-bounded-knapsack',
    name: 'Bounded Knapsack',
    beginner: [
        {
            content: `<h4>Each Item Has a Limited Quantity Available</h4>
A middle ground between 0/1 (quantity 1) and Unbounded (unlimited quantity): each item has a SPECIFIC count available. The naive approach treats each available copy as a separate 0/1 item - correct, but wasteful if counts are large.`,
            codeExamples: [
                `package com.javaschoollab;

public class BoundedKnapsackNaiveDemo {

    // Naive: expand each item into 'count' separate 0/1 items
    static int boundedKnapsack(int[] weights, int[] values, int[] counts, int capacity) {
        int[] dp = new int[capacity + 1];

        for (int i = 0; i < weights.length; i++) {
            for (int copy = 0; copy < counts[i]; copy++) {
                // Standard 0/1 Knapsack update, backward iteration, once PER available copy
                for (int w = capacity; w >= weights[i]; w--) {
                    dp[w] = Math.max(dp[w], dp[w - weights[i]] + values[i]);
                }
            }
        }
        return dp[capacity];
    }

    public static void main(String[] args) {
        int[] weights = {1, 3, 4};
        int[] values = {15, 20, 30};
        int[] counts = {2, 3, 2};   // available quantities
        System.out.println(boundedKnapsack(weights, values, counts, 10));
    }
}
// OUTPUT:
// 135`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Binary (Power-of-2) Grouping - O(n &times; log(count) &times; capacity)</h3>
Expanding into individual copies is O(sum of counts &times; capacity) - slow when counts are large. The optimization: group each item's available count into chunks of size 1, 2, 4, 8, ... (binary representation) - any quantity from 0 to count can be formed by SOME subset of these chunks, so treating each chunk as one 0/1 "super-item" covers all possibilities in far fewer iterations.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.ArrayList;
import java.util.List;

public class BoundedKnapsackBinaryGroupingDemo {

    static int boundedKnapsackOptimized(int[] weights, int[] values, int[] counts, int capacity) {
        List<int[]> items = new ArrayList<>();   // expanded {weight, value} "super-items"

        for (int i = 0; i < weights.length; i++) {
            int remaining = counts[i];
            int chunk = 1;
            while (remaining > 0) {
                int take = Math.min(chunk, remaining);
                items.add(new int[]{weights[i] * take, values[i] * take});   // one "super-item" of size 'take'
                remaining -= take;
                chunk *= 2;   // next power of 2
            }
        }

        int[] dp = new int[capacity + 1];
        for (int[] item : items) {
            for (int w = capacity; w >= item[0]; w--) {
                dp[w] = Math.max(dp[w], dp[w - item[0]] + item[1]);
            }
        }
        return dp[capacity];
    }

    public static void main(String[] args) {
        int[] weights = {1, 3, 4};
        int[] values = {15, 20, 30};
        int[] counts = {2, 3, 2};
        System.out.println(boundedKnapsackOptimized(weights, values, counts, 10));
    }
}
// OUTPUT:
// 135`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why does binary grouping into {1, 2, 4, 8, ...} chunks cover every possible quantity?</td><td>Any integer can be represented as a sum of distinct powers of 2 (binary representation) - so choosing any subset of the power-of-2 chunks can reconstruct any count from 0 up to the total available</td></tr>
<tr class='text-center'><td>How does binary grouping improve the time complexity?</td><td>Instead of O(count) separate 0/1 items per original item, it needs only O(log(count)) "super-items" - reducing overall complexity from O(sum(counts) * capacity) to O(n * log(maxCount) * capacity)</td></tr>
<tr class='text-center'><td>When does Bounded Knapsack reduce to 0/1 or Unbounded Knapsack as special cases?</td><td>counts[i] = 1 for all items reduces to 0/1 Knapsack; counts[i] = infinity (or capacity/weights[i]) for all items reduces to Unbounded Knapsack</td></tr>
</table>`
        }
    ]
};
