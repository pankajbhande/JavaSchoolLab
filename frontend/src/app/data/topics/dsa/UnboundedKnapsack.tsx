import { Topic } from '../../coreJava';

export const unboundedKnapsack: Topic = {
    id: 'dsa-dynamic-programming-unbounded-knapsack',
    name: 'Unbounded Knapsack',
    beginner: [
        {
            content: `<h4>Unlimited Copies of Each Item Allowed</h4>
Same setup as 0/1 Knapsack, but each item can be used ANY number of times. The only change to the space-optimized 0/1 solution: iterate the capacity loop FORWARD instead of backward - this lets an item's own just-updated value be reused within the same pass, exactly enabling repeated use.`,
            codeExamples: [
                `package com.javaschoollab;

public class UnboundedKnapsackDemo {

    static int unboundedKnapsack(int[] weights, int[] values, int capacity) {
        int[] dp = new int[capacity + 1];

        for (int i = 0; i < weights.length; i++) {
            // FORWARD iteration - allows reusing the SAME item multiple times
            for (int w = weights[i]; w <= capacity; w++) {
                dp[w] = Math.max(dp[w], dp[w - weights[i]] + values[i]);
            }
        }
        return dp[capacity];
    }

    public static void main(String[] args) {
        int[] weights = {1, 3, 4, 5};
        int[] values = {1, 4, 5, 7};
        System.out.println(unboundedKnapsack(weights, values, 7));
    }
}
// OUTPUT:
// 11`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Rod Cutting - Unbounded Knapsack in Disguise</h3>
Given a rod of length n and prices for each possible cut length, maximize revenue by cutting it into pieces (each length usable ANY number of times, in any combination) - exactly Unbounded Knapsack with "weight" = piece length and "value" = piece price.`,
            codeExamples: [
                `package com.javaschoollab;

public class RodCuttingDemo {

    // prices[i] = price of a piece of length i+1
    static int maxRevenue(int[] prices, int rodLength) {
        int[] dp = new int[rodLength + 1];

        for (int len = 1; len <= rodLength; len++) {
            for (int cut = 1; cut <= len; cut++) {
                if (cut <= prices.length) {
                    dp[len] = Math.max(dp[len], prices[cut - 1] + dp[len - cut]);
                }
            }
        }
        return dp[rodLength];
    }

    public static void main(String[] args) {
        int[] prices = {1, 5, 8, 9, 10, 17, 17, 20};   // prices for lengths 1..8
        System.out.println(maxRevenue(prices, 8));
    }
}
// OUTPUT:
// 22`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What's the ONE-line difference between 0/1 and Unbounded Knapsack's space-optimized code?</td><td>The capacity loop direction: backward (high to low) for 0/1 Knapsack, forward (low to high) for Unbounded Knapsack - everything else is identical</td></tr>
<tr class='text-center'><td>What other classic problems reduce to Unbounded Knapsack?</td><td>Coin Change (minimum coins to make an amount, using unlimited coins of each denomination) and Rod Cutting both share the identical "unlimited reuse, maximize/minimize a value" structure</td></tr>
<tr class='text-center'><td>What's the time and space complexity of Unbounded Knapsack?</td><td>O(n * capacity) time, O(capacity) space with the 1D optimization - same complexity class as 0/1 Knapsack, just a different reuse policy</td></tr>
</table>`
        }
    ]
};
