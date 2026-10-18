import { Topic } from '../../coreJava';

export const bitmaskDp: Topic = {
    id: 'dsa-bit-manipulation-bitmask-dp',
    name: 'Bitmask DP',
    beginner: [
        {
            content: `<h4>Using a Bitmask as a DP Dimension</h4>
BITMASK DP extends ordinary DP by adding "which subset of items has been used/visited" as part of the state, encoded as an integer mask. The state becomes <code>dp[mask][...]</code>, and transitions move from one mask to another by setting a bit (<code>mask | (1 &lt;&lt; i)</code>) when item <code>i</code> gets included.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.Arrays;

public class MinCostToVisitAllDemo {

    // dp[mask][i] = minimum cost to have visited exactly the cities in mask, ending at city i
    static int solve(int[][] cost, int n) {
        int[][] dp = new int[1 << n][n];
        for (int[] row : dp) Arrays.fill(row, Integer.MAX_VALUE / 2);

        dp[1][0] = 0;   // start at city 0, only city 0 visited

        for (int mask = 1; mask < (1 << n); mask++) {
            for (int last = 0; last < n; last++) {
                if ((mask & (1 << last)) == 0) continue;   // last must be in mask
                if (dp[mask][last] == Integer.MAX_VALUE / 2) continue;

                for (int next = 0; next < n; next++) {
                    if ((mask & (1 << next)) != 0) continue;   // next must NOT be visited yet

                    int newMask = mask | (1 << next);
                    dp[newMask][next] = Math.min(dp[newMask][next], dp[mask][last] + cost[last][next]);
                }
            }
        }

        int fullMask = (1 << n) - 1;
        int best = Integer.MAX_VALUE;
        for (int last = 0; last < n; last++) {
            best = Math.min(best, dp[fullMask][last]);
        }
        return best;
    }

    public static void main(String[] args) {
        int[][] cost = {
            {0, 2, 9, 10},
            {1, 0, 6, 4},
            {15, 7, 0, 8},
            {6, 3, 12, 0}
        };
        System.out.println(solve(cost, 4));
    }
}
// OUTPUT:
// 17`
            ],
            codeExplanations: [
                `dp[mask][last] holds the cheapest cost to have visited exactly the cities in mask, ending at city last. Starting state dp[1][0] = 0 means "only city 0 visited, standing at city 0, cost 0." Each transition takes a reachable (mask, last) state and extends it to an unvisited next city, folding next's bit into mask and adding the travel cost - so by the time mask reaches (1<<n)-1 (all cities visited), the smallest dp[fullMask][last] across every possible last city is the answer to the full tour, which comes out to 17 for this cost matrix.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Complexity and When Bitmask DP is the Right Tool</h3>
Bitmask DP's state space is <code>O(2&#8317; &times; n)</code>, so it's only practical for small <code>n</code> (typically up to ~20). The classic signal that a problem wants bitmask DP: it involves "assigning/visiting/matching n items" where the OPTIMAL answer genuinely depends on WHICH SPECIFIC subset has been used so far (not just how many) - Traveling Salesman, Assignment Problem, and "count ways to partition into valid groups" problems are the canonical examples.`,
            codeExamples: [
                `package com.javaschoollab;

public class AssignmentProblemDemo {

    // dp[mask] = minimum cost to assign tasks represented by set bits in mask,
    // where the number of assigned tasks == number of workers used so far
    static int solve(int[][] cost, int n) {
        int[] dp = new int[1 << n];
        java.util.Arrays.fill(dp, Integer.MAX_VALUE / 2);
        dp[0] = 0;

        for (int mask = 0; mask < (1 << n); mask++) {
            if (dp[mask] == Integer.MAX_VALUE / 2) continue;

            int worker = Integer.bitCount(mask);   // next worker to assign is implied by how many bits are set
            if (worker == n) continue;

            for (int task = 0; task < n; task++) {
                if ((mask & (1 << task)) != 0) continue;   // task already assigned

                int newMask = mask | (1 << task);
                dp[newMask] = Math.min(dp[newMask], dp[mask] + cost[worker][task]);
            }
        }
        return dp[(1 << n) - 1];
    }

    public static void main(String[] args) {
        int[][] cost = {
            {9, 2, 7},
            {6, 4, 3},
            {5, 8, 1}
        };
        System.out.println(solve(cost, 3));
    }
}
// OUTPUT:
// 12`
            ],
            codeExplanations: [
                `dp[mask] is the minimum cost of assigning tasks in mask, one per worker, in worker order 0, 1, 2, .... bitCount(mask) counts how many tasks have already been assigned, which - since workers are filled strictly in order - tells you exactly which worker index is being assigned next, with no need to track it separately. For every unassigned task, the code tries assigning it to that next worker and updates dp[newMask] if the resulting cost is lower, so by the time mask covers all tasks, dp[(1<<n)-1] holds the cheapest full assignment - 12 for this cost matrix.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why does bitmask DP have exponential space/time even though it's "just DP"?</td><td>The state itself IS a subset (2^n possibilities), so any DP table indexed by mask inherently has 2^n rows - the exponential blowup comes from the state space definition, not from inefficient transitions</td></tr>
<tr class='text-center'><td>In the Assignment Problem solution, why does bitCount(mask) tell you which worker to assign next?</td><td>Because tasks are assigned to workers in a fixed order (worker 0 first, then 1, then 2...), the number of bits already set in the mask equals exactly how many workers have been assigned so far - which is exactly the index of the next worker</td></tr>
<tr class='text-center'><td>What's the key difference between the TSP-style dp[mask][last] and the Assignment-style dp[mask]?</td><td>TSP needs to know WHICH city you ended at (since future travel cost depends on the last position), so "last" is a needed second dimension; Assignment only needs to know HOW MANY tasks are assigned (the next worker is implied), so mask alone suffices as state</td></tr>
</table>`
        }
    ]
};
