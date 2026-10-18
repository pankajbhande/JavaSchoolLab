import { Topic } from '../../coreJava';

export const burstBalloons: Topic = {
    id: 'dsa-dynamic-programming-burst-balloons',
    name: 'Burst Balloons',
    beginner: [
        {
            content: `<h4>Maximize Coins from Bursting Balloons in Order</h4>
Bursting a balloon at position k earns <code>coins[left] * coins[k] * coins[right]</code>, where left/right are the CURRENTLY ADJACENT balloons (after previously burst ones are gone). The trick that makes this DP-friendly: think BACKWARD - instead of "which balloon do I burst first", ask "which balloon do I burst LAST within this range" - that balloon's neighbors at burst time are fixed as the range's boundaries, regardless of what happens inside.`,
            codeExamples: [
                `package com.javaschoollab;

public class BurstBalloonsDemo {

    static int maxCoins(int[] balloons) {
        int n = balloons.length;
        int[] nums = new int[n + 2];
        nums[0] = 1;
        nums[n + 1] = 1;   // virtual boundary balloons of value 1
        for (int i = 0; i < n; i++) nums[i + 1] = balloons[i];

        int[][] dp = new int[n + 2][n + 2];

        for (int len = 1; len <= n; len++) {
            for (int left = 1; left <= n - len + 1; left++) {
                int right = left + len - 1;

                for (int k = left; k <= right; k++) {
                    // k is the LAST balloon burst in [left, right] -
                    // its neighbors at that moment are nums[left-1] and nums[right+1]
                    int coins = nums[left - 1] * nums[k] * nums[right + 1]
                              + dp[left][k - 1] + dp[k + 1][right];
                    dp[left][right] = Math.max(dp[left][right], coins);
                }
            }
        }
        return dp[1][n];
    }

    public static void main(String[] args) {
        int[] balloons = {3, 1, 5, 8};
        System.out.println(maxCoins(balloons));
    }
}
// OUTPUT:
// 167`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why "Burst Last" (Not "Burst First") is the Key Reframing</h3>
If you think about which balloon to burst FIRST, its neighbors change unpredictably depending on what gets burst around it later - a nightmare to model with clean subproblems. But if you decide which balloon burst LAST within a range, its neighbors at that final moment are GUARANTEED to be the range's own boundaries (nothing between them and the range edges is left, since everything else in the range was already burst) - this fixed boundary is exactly what makes clean, independent left/right subproblems possible.`,
            codeExamples: [
                `package com.javaschoollab;

public class BurstLastReframingDemo {
    public static void main(String[] args) {
        System.out.println("Thinking 'burst FIRST': balloon k's neighbors depend on the");
        System.out.println("UNKNOWN future order of bursts around it - no clean subproblem boundary.");
        System.out.println();
        System.out.println("Thinking 'burst LAST' within range [left, right]: by definition,");
        System.out.println("EVERYTHING else in [left, right] except k has already been burst,");
        System.out.println("so k's neighbors at that moment are fixed as nums[left-1] and nums[right+1]");
        System.out.println("(the range's own boundaries) - completely independent of what happened");
        System.out.println("inside [left, k-1] and [k+1, right], which can be solved as separate subproblems.");
    }
}
// OUTPUT:
// Thinking 'burst FIRST': balloon k's neighbors depend on the
// UNKNOWN future order of bursts around it - no clean subproblem boundary.
// ...`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why are virtual boundary balloons of value 1 added at both ends?</td><td>They uniformly handle the edge case of bursting the actual leftmost/rightmost balloon in the original array, without needing special-case boundary logic - a balloon at the true edge simply multiplies by 1 on that side</td></tr>
<tr class='text-center'><td>What's the time and space complexity of Burst Balloons?</td><td>O(n^3) time (O(n^2) intervals, each trying O(n) possible "last burst" choices), O(n^2) space for the DP table</td></tr>
<tr class='text-center'><td>What class of problems benefit from this "think about the LAST/OUTERMOST choice" reframing technique?</td><td>Any interval DP problem where the natural "first choice" creates unpredictable dependencies - Matrix Chain Multiplication (last multiplication) and Optimal BST (root choice) use closely related reframing ideas</td></tr>
</table>`
        }
    ]
};
