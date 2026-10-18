import { Topic } from '../../coreJava';

export const equalPartition: Topic = {
    id: 'dsa-dynamic-programming-equal-partition',
    name: 'Equal Partition',
    beginner: [
        {
            content: `<h4>Can the Array Be Split into Two Equal-Sum Halves?</h4>
Directly reduces to Subset Sum: if the total sum is ODD, it's immediately impossible (two integer halves can't sum to an odd total). Otherwise, check if any subset sums to EXACTLY <code>total / 2</code> - the remaining elements automatically form the other equal half.`,
            codeExamples: [
                `package com.javaschoollab;

public class EqualPartitionDemo {

    static boolean canPartition(int[] nums) {
        int total = 0;
        for (int n : nums) total += n;

        if (total % 2 != 0) return false;   // odd total - impossible to split evenly

        int target = total / 2;
        boolean[] dp = new boolean[target + 1];
        dp[0] = true;

        for (int num : nums) {
            for (int s = target; s >= num; s--) {
                dp[s] = dp[s] || dp[s - num];
            }
        }
        return dp[target];
    }

    public static void main(String[] args) {
        int[] nums = {1, 5, 11, 5};
        System.out.println(canPartition(nums));

        int[] nums2 = {1, 2, 3, 5};
        System.out.println(canPartition(nums2));
    }
}
// OUTPUT:
// true
// false`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Minimum Subset Sum Difference - a Direct Extension</h3>
Instead of checking for an EXACT half, find the subset sum CLOSEST to <code>total / 2</code> - minimizing the difference between the two partition sums. Run the same Subset Sum DP to find ALL achievable sums up to total/2, then the best achievable sum <code>s</code> gives a minimum difference of <code>total - 2*s</code>.`,
            codeExamples: [
                `package com.javaschoollab;

public class MinSubsetSumDifferenceDemo {

    static int minDifference(int[] nums) {
        int total = 0;
        for (int n : nums) total += n;

        int half = total / 2;
        boolean[] dp = new boolean[half + 1];
        dp[0] = true;

        for (int num : nums) {
            for (int s = half; s >= num; s--) {
                dp[s] = dp[s] || dp[s - num];
            }
        }

        // Find the LARGEST achievable sum <= total/2 - closest possible to an even split
        int closestSum = 0;
        for (int s = half; s >= 0; s--) {
            if (dp[s]) {
                closestSum = s;
                break;
            }
        }
        return total - 2 * closestSum;   // difference between the two resulting partitions
    }

    public static void main(String[] args) {
        int[] nums = {1, 6, 11, 5};
        System.out.println(minDifference(nums));
    }
}
// OUTPUT:
// 1`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why does an odd total sum immediately rule out an equal partition?</td><td>Two equal integer parts must sum to an even total - an odd total has no possible split into two equal integers</td></tr>
<tr class='text-center'><td>Why does the minimum difference formula use "total - 2*closestSum"?</td><td>If one partition sums to closestSum, the other sums to (total - closestSum); their difference is (total - closestSum) - closestSum = total - 2*closestSum</td></tr>
<tr class='text-center'><td>What's the time complexity of both problems?</td><td>O(n * total/2), pseudo-polynomial in the sum's magnitude - same complexity class as plain Subset Sum, since both reduce directly to it</td></tr>
</table>`
        }
    ]
};
