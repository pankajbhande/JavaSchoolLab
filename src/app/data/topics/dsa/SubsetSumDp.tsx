import { Topic } from '../../coreJava';

export const subsetSumDp: Topic = {
    id: 'dsa-dynamic-programming-subset-sum',
    name: 'Subset Sum',
    beginner: [
        {
            content: `<h4>Does ANY Subset Sum to a Target?</h4>
A yes/no version of 0/1 Knapsack: <code>dp[i][s]</code> = "can the first i elements form sum s?" - true if EITHER skipping element i already achieves s, OR including element i achieves the remaining <code>s - arr[i]</code>.`,
            codeExamples: [
                `package com.javaschoollab;

public class SubsetSumDemo {

    static boolean subsetSum(int[] arr, int target) {
        boolean[] dp = new boolean[target + 1];
        dp[0] = true;   // sum 0 is always achievable (the empty subset)

        for (int num : arr) {
            for (int s = target; s >= num; s--) {   // backward - each element used at most once
                dp[s] = dp[s] || dp[s - num];
            }
        }
        return dp[target];
    }

    public static void main(String[] args) {
        int[] arr = {3, 34, 4, 12, 5, 2};
        System.out.println(subsetSum(arr, 9));
        System.out.println(subsetSum(arr, 30));
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
            content: `<h3>Counting HOW MANY Subsets Sum to a Target</h3>
Change the boolean OR to an integer SUM: <code>dp[s]</code> now counts the NUMBER of subsets achieving sum <code>s</code>, not just whether one exists - same backward-iteration structure, different accumulation operation.`,
            codeExamples: [
                `package com.javaschoollab;

public class CountSubsetsWithSumDemo {

    static int countSubsets(int[] arr, int target) {
        int[] dp = new int[target + 1];
        dp[0] = 1;   // exactly one way to make sum 0: the empty subset

        for (int num : arr) {
            for (int s = target; s >= num; s--) {
                dp[s] += dp[s - num];   // add the ways that existed BEFORE including this element
            }
        }
        return dp[target];
    }

    public static void main(String[] args) {
        int[] arr = {1, 2, 3, 3};
        System.out.println(countSubsets(arr, 6));
    }
}
// OUTPUT:
// 3
// (subsets: {1,2,3}(first 3), {1,2,3}(second 3), {3,3})`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What's the time and space complexity of Subset Sum?</td><td>O(n * target) time, O(target) space with the 1D rolling-array optimization</td></tr>
<tr class='text-center'><td>Why is Subset Sum considered "pseudo-polynomial" rather than truly polynomial?</td><td>Its complexity depends on the VALUE of target, not the number of bits needed to represent it - for a target with many digits, the algorithm becomes exponentially slower relative to the input's actual encoded size, which is why Subset Sum is technically NP-complete in general</td></tr>
<tr class='text-center'><td>How does Subset Sum relate to Equal Partition and Target Sum?</td><td>Equal Partition is exactly "does a subset sum to totalSum/2"; Target Sum (with +/- signs) reduces to Subset Sum via algebraic manipulation - both are direct applications of this same core technique</td></tr>
</table>`
        }
    ]
};
