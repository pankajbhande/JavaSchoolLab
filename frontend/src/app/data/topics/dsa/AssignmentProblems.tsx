import { Topic } from '../../coreJava';

export const assignmentProblems: Topic = {
    id: 'dsa-dynamic-programming-assignment-problems',
    name: 'Assignment Problems',
    beginner: [
        {
            content: `<h4>Assigning N Workers to N Tasks, Minimizing Total Cost</h4>
Each worker has a different cost for each task; assign each worker to exactly one task (and vice versa) to minimize total cost. Same bitmask DP shape as TSP: state = <code>(worker index, mask of tasks already assigned)</code> - since workers are processed in a fixed order, only the current worker index and which tasks remain matter.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.Arrays;

public class AssignmentProblemDemo {

    static int assignTasks(int[][] cost) {
        int n = cost.length;
        int[][] dp = new int[n + 1][1 << n];
        for (int[] row : dp) Arrays.fill(row, Integer.MAX_VALUE / 2);
        dp[0][0] = 0;   // no workers assigned yet, no tasks taken

        for (int worker = 0; worker < n; worker++) {
            for (int mask = 0; mask < (1 << n); mask++) {
                if (dp[worker][mask] == Integer.MAX_VALUE / 2) continue;

                for (int task = 0; task < n; task++) {
                    if ((mask & (1 << task)) != 0) continue;   // task already assigned

                    int newMask = mask | (1 << task);
                    int newCost = dp[worker][mask] + cost[worker][task];
                    dp[worker + 1][newMask] = Math.min(dp[worker + 1][newMask], newCost);
                }
            }
        }
        return dp[n][(1 << n) - 1];
    }

    public static void main(String[] args) {
        int[][] cost = {
            {9, 2, 7, 8},
            {6, 4, 3, 7},
            {5, 8, 1, 8},
            {7, 6, 9, 4}
        };
        System.out.println(assignTasks(cost));
    }
}
// OUTPUT:
// 13`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This is O(n &times; 2&#8319;) Instead of TSP's O(2&#8319; &times; n&sup2;)</h3>
Assignment Problem's state only needs "which WORKER we're on" (not which specific PATH of workers, since they're always processed 0, 1, 2, ... in order) - this is strictly simpler than TSP's state, which needs "current CITY" because the visiting order isn't fixed. This subtle structural difference is why Assignment Problem's bitmask DP is faster than TSP's despite looking superficially similar.`,
            codeExamples: [
                `package com.javaschoollab;

public class AssignmentVsTspComparisonDemo {
    public static void main(String[] args) {
        System.out.println("TSP: which city to visit NEXT depends on which city we're CURRENTLY at -");
        System.out.println("      so the state needs BOTH the mask AND the current city: O(2^n * n) states,");
        System.out.println("      each transition trying n next cities -> O(2^n * n^2) total.");
        System.out.println();
        System.out.println("Assignment: workers are processed in a FIXED order (0, 1, 2, ...) -");
        System.out.println("      the state only needs the mask AND which worker index we're on,");
        System.out.println("      but worker index is IMPLIED by mask's popcount, so effectively");
        System.out.println("      O(2^n) states, each transition trying n tasks -> O(2^n * n) total.");
    }
}
// OUTPUT:
// TSP: which city to visit NEXT depends on which city we're CURRENTLY at -
// ...`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What's the time and space complexity of the bitmask DP solution?</td><td>O(n * 2^n) time, O(n * 2^n) space - exponential but far better than the O(n!) brute force of trying every permutation of worker-task pairings</td></tr>
<tr class='text-center'><td>What polynomial-time algorithm exists for Assignment Problem, and why doesn't TSP have an equivalent?</td><td>The Hungarian Algorithm solves Assignment Problem in O(n^3) - genuinely polynomial. TSP has no known polynomial algorithm because it's NP-hard; Assignment Problem, despite looking similar, is actually a much "easier" problem (solvable via network flow / matching theory)</td></tr>
<tr class='text-center'><td>When would the bitmask DP approach still be preferred over the Hungarian Algorithm?</td><td>When n is small enough that O(n * 2^n) is fast, and implementation simplicity matters more than optimality of complexity - the Hungarian Algorithm is considerably more intricate to implement correctly</td></tr>
</table>`
        }
    ]
};
