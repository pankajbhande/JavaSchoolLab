import { Topic } from '../../coreJava';

export const fractionalKnapsack: Topic = {
    id: 'dsa-greedy-fractional-knapsack',
    name: 'Fractional Knapsack',
    beginner: [
        {
            content: `<h4>Filling a Knapsack When Items CAN Be Split</h4>
Given items with weight and value, and a knapsack capacity, maximize total value - items can be taken in FRACTIONS (unlike 0/1 Knapsack). The greedy strategy: always take as much as possible of the item with the HIGHEST value-per-weight ratio first.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.Arrays;
import java.util.Comparator;

public class FractionalKnapsackDemo {

    static double maxValue(int[][] items, int capacity) {
        // Sort by value/weight ratio, DESCENDING
        Arrays.sort(items, Comparator.comparingDouble(
            (int[] item) -> (double) item[1] / item[0]).reversed());

        double totalValue = 0;
        int remainingCapacity = capacity;

        for (int[] item : items) {
            int weight = item[0], value = item[1];

            if (remainingCapacity >= weight) {
                totalValue += value;              // take the WHOLE item
                remainingCapacity -= weight;
            } else {
                double fraction = (double) remainingCapacity / weight;
                totalValue += value * fraction;   // take a FRACTION of it
                break;                              // knapsack is now full
            }
        }
        return totalValue;
    }

    public static void main(String[] args) {
        // {weight, value}
        int[][] items = {{10, 60}, {20, 100}, {30, 120}};
        System.out.println(maxValue(items, 50));
    }
}
// OUTPUT:
// 240.0`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why Fractional Knapsack Allows Greedy, But 0/1 Knapsack Doesn't</h3>
Fractional Knapsack's greedy correctness relies ENTIRELY on being able to split items - taking the highest ratio item first is provably optimal because any "waste" of capacity can always be filled with a PARTIAL unit of the current best-ratio item. In 0/1 Knapsack, items are indivisible - the highest-ratio item might not fit at all, forcing a completely different combination to be better, which is exactly why 0/1 Knapsack needs Dynamic Programming instead.`,
            codeExamples: [
                `package com.javaschoollab;

public class WhyGreedyFailsFor01KnapsackDemo {
    public static void main(String[] args) {
        // Capacity = 10
        // Item A: weight=6, value=12 (ratio 2.0) - highest ratio, greedy picks this first
        // Item B: weight=5, value=9  (ratio 1.8)
        // Item C: weight=5, value=9  (ratio 1.8)
        //
        // FRACTIONAL: take all of A (value 12), then 4/5 of B (value 7.2) = 19.2 total
        // 0/1 ONLY: A alone (weight 6, value 12) leaves 4 capacity - B or C don't fit (weight 5)
        //           BUT choosing B + C instead (weight 10, value 18) beats A alone (value 12)!
        //
        // Greedy-by-ratio would pick A first and get stuck at 12,
        // missing the actually-optimal B+C combination worth 18.
        System.out.println("0/1 Knapsack: greedy-by-ratio can miss the true optimum -");
        System.out.println("Dynamic Programming is required to explore all valid combinations correctly.");
    }
}
// OUTPUT:
// 0/1 Knapsack: greedy-by-ratio can miss the true optimum -
// Dynamic Programming is required to explore all valid combinations correctly.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What's the time complexity of Fractional Knapsack?</td><td>O(n log n), dominated by sorting items by value/weight ratio; the greedy fill itself is O(n)</td></tr>
<tr class='text-center'><td>Why does taking the highest ratio item first maximize value for the fractional version?</td><td>Since fractions are allowed, filling capacity with the highest "value per unit weight" always yields at least as much value as any other allocation of that same capacity - an exchange argument identical in spirit to Activity Selection's</td></tr>
<tr class='text-center'><td>What real-world problems map to Fractional Knapsack rather than 0/1?</td><td>Resource allocation problems where partial amounts genuinely make sense - blending commodities (like mixing ores by value/cost ratio), or allocating a divisible budget across investments</td></tr>
</table>`
        }
    ]
};
