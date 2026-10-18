import { Topic } from '../../coreJava';

export const travelingSalesmanProblem: Topic = {
    id: 'dsa-dynamic-programming-traveling-salesman-problem',
    name: 'Traveling Salesman Problem',
    beginner: [
        {
            content: `<h4>Visit Every City Exactly Once, Minimize Total Distance</h4>
Brute force tries all n! orderings. Bitmask DP reduces this to O(2&#8319; &times; n&sup2;): the STATE is <code>(mask, current city)</code>, where mask is a BITMASK recording which cities have been visited. Since only "which cities visited so far" and "where I am now" matter (not the exact visiting ORDER), this compresses the state space enormously.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.Arrays;

public class TspBitmaskDemo {

    static int tsp(int[][] dist) {
        int n = dist.length;
        int[][] dp = new int[1 << n][n];
        for (int[] row : dp) Arrays.fill(row, Integer.MAX_VALUE / 2);

        dp[1][0] = 0;   // start at city 0, only city 0 visited (bit 0 set)

        for (int mask = 1; mask < (1 << n); mask++) {
            for (int u = 0; u < n; u++) {
                if ((mask & (1 << u)) == 0) continue;   // u must be in the visited set
                if (dp[mask][u] == Integer.MAX_VALUE / 2) continue;

                for (int v = 0; v < n; v++) {
                    if ((mask & (1 << v)) != 0) continue;   // v must NOT be visited yet

                    int newMask = mask | (1 << v);
                    dp[newMask][v] = Math.min(dp[newMask][v], dp[mask][u] + dist[u][v]);
                }
            }
        }

        int fullMask = (1 << n) - 1;
        int minCost = Integer.MAX_VALUE;
        for (int u = 1; u < n; u++) {
            if (dp[fullMask][u] != Integer.MAX_VALUE / 2) {
                minCost = Math.min(minCost, dp[fullMask][u] + dist[u][0]);   // return to start
            }
        }
        return minCost;
    }

    public static void main(String[] args) {
        int[][] dist = {
            {0, 10, 15, 20},
            {10, 0, 35, 25},
            {15, 35, 0, 30},
            {20, 25, 30, 0}
        };
        System.out.println(tsp(dist));
    }
}
// OUTPUT:
// 80`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why the Bitmask Captures Everything Needed - and What It Deliberately Ignores</h3>
The key insight enabling this optimization: the FUTURE optimal path from state <code>(mask, u)</code> depends only on WHICH cities remain unvisited and WHERE we currently are - NOT on the specific ORDER those visited cities were reached in. This means many different visiting orders that happen to reach the same (mask, current city) pair can share ONE computed answer, collapsing what would be n! distinct paths down to just 2&#8319; &times; n distinct states.`,
            codeExamples: [
                `package com.javaschoollab;

public class WhyBitmaskCollapsesStatesDemo {
    public static void main(String[] args) {
        System.out.println("Visiting order A: 0 -> 1 -> 2 -> currently at city 3");
        System.out.println("Visiting order B: 0 -> 2 -> 1 -> currently at city 3");
        System.out.println();
        System.out.println("Both orders result in the SAME state: mask={0,1,2,3 visited}, current=3");
        System.out.println("(here mask would be 0b1111 with all 4 low bits set)");
        System.out.println();
        System.out.println("The FUTURE remaining path only cares about that state, not HOW it was");
        System.out.println("reached - so dp[mask][3] can be shared between orders A and B, computed once.");
        System.out.println();
        System.out.println("Without this collapse, n! = 24 distinct orderings for just 4 cities would");
        System.out.println("each need separate tracking - the bitmask reduces this to 2^4 * 4 = 64 states.");
    }
}
// OUTPUT:
// Visiting order A: 0 -> 1 -> 2 -> currently at city 3
// ...`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What's the time and space complexity of the bitmask DP TSP solution?</td><td>O(2^n * n^2) time, O(2^n * n) space - exponential, but a massive improvement over the O(n!) brute force, making n up to roughly 20 feasible instead of only 10-11</td></tr>
<tr class='text-center'><td>Is TSP NP-hard, and does this DP solve it in polynomial time?</td><td>TSP is NP-hard; this Held-Karp DP algorithm is still exponential (O(2^n * n^2)), just a much better exponential base than brute force - no known polynomial-time exact algorithm exists</td></tr>
<tr class='text-center'><td>What real-world problems reduce to (or approximate) TSP?</td><td>Vehicle routing / delivery route optimization, circuit board drilling (minimizing tool travel distance), and DNA sequencing (fragment assembly ordering) - for large n, heuristics/approximations are used instead of exact DP</td></tr>
</table>`
        }
    ]
};
