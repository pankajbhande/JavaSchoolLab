import { Topic } from '../../coreJava';

export const gasStation: Topic = {
    id: 'dsa-greedy-gas-station',
    name: 'Gas Station',
    beginner: [
        {
            content: `<h4>Finding the Starting Point for a Complete Circular Trip</h4>
Given gas available and cost to travel between stations arranged in a circle, find the starting station that lets a car complete the full loop (if one exists). The greedy insight: if the TOTAL gas &ge; TOTAL cost, a valid starting point is GUARANTEED to exist - and it can be found in one pass by tracking where the running tank first goes negative.`,
            codeExamples: [
                `package com.javaschoollab;

public class GasStationDemo {

    static int canCompleteCircuit(int[] gas, int[] cost) {
        int totalTank = 0, currentTank = 0, startIndex = 0;

        for (int i = 0; i < gas.length; i++) {
            int diff = gas[i] - cost[i];
            totalTank += diff;
            currentTank += diff;

            if (currentTank < 0) {
                // Can't reach station i+1 from the current start -
                // NONE of the stations between startIndex and i can work either
                startIndex = i + 1;
                currentTank = 0;
            }
        }

        return totalTank >= 0 ? startIndex : -1;
    }

    public static void main(String[] args) {
        int[] gas =  {1, 2, 3, 4, 5};
        int[] cost = {3, 4, 5, 1, 2};
        System.out.println(canCompleteCircuit(gas, cost));
    }
}
// OUTPUT:
// 3`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why Failing at Station i Rules Out EVERY Station Between startIndex and i</h3>
This is the subtle correctness argument: if starting at <code>startIndex</code> and the tank goes negative reaching station <code>i</code>, then starting from ANY station strictly between <code>startIndex</code> and <code>i</code> would ALSO fail - because that later start has LESS accumulated surplus gas than starting from <code>startIndex</code> did (it skips some of the positive contributions <code>startIndex</code> already banked). This is exactly why the algorithm safely jumps <code>startIndex</code> all the way to <code>i+1</code> without needing to individually test every skipped station.`,
            codeExamples: [
                `package com.javaschoollab;

public class WhySkippingIsSafeDemo {
    public static void main(String[] args) {
        System.out.println("Claim: if starting at station S fails by the time we reach station F,");
        System.out.println("then starting at ANY station strictly between S and F also fails.");
        System.out.println();
        System.out.println("Proof sketch: let sum(S, k) = cumulative (gas[i]-cost[i]) from S to k.");
        System.out.println("Failing at F from S means sum(S, F) < 0 for the first time.");
        System.out.println("For any station M between S and F: sum(M, F) = sum(S, F) - sum(S, M-1).");
        System.out.println("Since we never went negative BEFORE F, sum(S, M-1) >= 0.");
        System.out.println("So sum(M, F) = sum(S, F) - sum(S, M-1) <= sum(S, F) < 0 -> M also fails.");
        System.out.println();
        System.out.println("This is exactly why jumping startIndex straight to i+1 loses no valid candidates.");
    }
}
// OUTPUT:
// Claim: if starting at station S fails by the time we reach station F,
// then starting at ANY station strictly between S and F also fails.
// ...`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why does totalTank >= 0 guarantee a solution exists?</td><td>If the total gas across the whole circuit is at least the total cost, some starting point must let the tank stay non-negative the whole way around - this is provable, and the algorithm's single pass happens to also FIND that point as a side effect</td></tr>
<tr class='text-center'><td>What's the time and space complexity?</td><td>O(n) time, O(1) space - a single pass with running totals, no extra data structures</td></tr>
<tr class='text-center'><td>Is the answer guaranteed to be UNIQUE when a solution exists?</td><td>Yes - it can be proven that if totalTank >= 0, exactly one valid starting index exists (given the circuit must be traversed once around without repeating), which is why the algorithm can confidently return a single index rather than a set of candidates</td></tr>
</table>`
        }
    ]
};
