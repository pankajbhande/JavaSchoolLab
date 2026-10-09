import { Topic } from '../../coreJava';

export const houseRobber: Topic = {
    id: 'dsa-dynamic-programming-house-robber',
    name: 'House Robber',
    beginner: [
        {
            content: `<h4>Maximize Loot Without Robbing Two Adjacent Houses</h4>
At each house, choose: SKIP it (carry forward the best result without it), or ROB it (its value plus the best result from two houses back, since the adjacent one can't also be robbed). <code>dp[i] = max(dp[i-1], dp[i-2] + nums[i])</code>.`,
            codeExamples: [
                `package com.javaschoollab;

public class HouseRobberDemo {

    static int rob(int[] nums) {
        int prev2 = 0, prev1 = 0;   // best loot up to i-2, i-1

        for (int num : nums) {
            int current = Math.max(prev1, prev2 + num);   // skip vs rob this house
            prev2 = prev1;
            prev1 = current;
        }
        return prev1;
    }

    public static void main(String[] args) {
        int[] houses = {2, 7, 9, 3, 1};
        System.out.println(rob(houses));
    }
}
// OUTPUT:
// 12`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>House Robber II - Houses Arranged in a CIRCLE</h3>
When the first and last houses are ADJACENT (circular arrangement), robbing both is forbidden. The trick: run the linear House Robber TWICE - once excluding the first house, once excluding the last house - and take the maximum. This correctly handles every valid configuration without needing new logic.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.Arrays;

public class HouseRobberCircularDemo {

    static int robLinear(int[] nums, int start, int end) {
        int prev2 = 0, prev1 = 0;
        for (int i = start; i <= end; i++) {
            int current = Math.max(prev1, prev2 + nums[i]);
            prev2 = prev1;
            prev1 = current;
        }
        return prev1;
    }

    static int robCircular(int[] nums) {
        int n = nums.length;
        if (n == 1) return nums[0];

        // Case 1: exclude the LAST house (rob among houses 0..n-2)
        int excludeLast = robLinear(nums, 0, n - 2);
        // Case 2: exclude the FIRST house (rob among houses 1..n-1)
        int excludeFirst = robLinear(nums, 1, n - 1);

        return Math.max(excludeLast, excludeFirst);
    }

    public static void main(String[] args) {
        int[] houses = {2, 3, 2};
        System.out.println(robCircular(houses));
    }
}
// OUTPUT:
// 3`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why does splitting into "exclude last" and "exclude first" correctly solve the circular version?</td><td>Together the two cases cover EVERY valid selection: any valid robbery either skips the last house (covered by case 1) or skips the first house (covered by case 2) - it can never rob BOTH first and last, so one of the two cases always contains the true optimum</td></tr>
<tr class='text-center'><td>What's the time and space complexity of both versions?</td><td>O(n) time; O(1) space with the rolling-variable optimization shown, though a naive dp[] array would be O(n) space</td></tr>
<tr class='text-center'><td>How would House Robber III (houses arranged in a TREE) differ?</td><td>It needs Tree DP: each node returns two values - best loot if this node IS robbed, and best loot if it is NOT - combining children's results bottom-up, since "adjacent" now means parent-child rather than array-neighbor</td></tr>
</table>`
        }
    ]
};
