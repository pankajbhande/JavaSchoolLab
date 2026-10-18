import { Topic } from '../../coreJava';

export const longestIncreasingSubsequence: Topic = {
    id: 'dsa-dynamic-programming-longest-increasing-subsequence-lis',
    name: 'Longest Increasing Subsequence - LIS',
    beginner: [
        {
            content: `<h4>The O(n&sup2;) DP Solution</h4>
<code>dp[i]</code> = length of the longest increasing subsequence ENDING exactly at index i. For each i, check every earlier j: if <code>arr[j] &lt; arr[i]</code>, this element could extend that subsequence.`,
            codeExamples: [
                `package com.javaschoollab;

public class LisDpDemo {

    static int lengthOfLIS(int[] nums) {
        int n = nums.length;
        int[] dp = new int[n];
        java.util.Arrays.fill(dp, 1);   // every element is its own LIS of length 1

        int maxLength = 1;
        for (int i = 1; i < n; i++) {
            for (int j = 0; j < i; j++) {
                if (nums[j] < nums[i]) {
                    dp[i] = Math.max(dp[i], dp[j] + 1);
                }
            }
            maxLength = Math.max(maxLength, dp[i]);
        }
        return maxLength;
    }

    public static void main(String[] args) {
        int[] nums = {10, 9, 2, 5, 3, 7, 101, 18};
        System.out.println(lengthOfLIS(nums));
    }
}
// OUTPUT:
// 4`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>O(n log n) with Binary Search - the Patience Sorting Trick</h3>
Maintain an array <code>tails</code> where <code>tails[k]</code> = the SMALLEST possible tail value of an increasing subsequence of length <code>k+1</code>. For each new number, binary search for where it belongs in <code>tails</code> - this array's LENGTH at the end is the LIS length, even though <code>tails</code> itself isn't necessarily a real subsequence of the input.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class LisBinarySearchDemo {

    static int lengthOfLIS(int[] nums) {
        List<Integer> tails = new ArrayList<>();

        for (int num : nums) {
            int pos = Collections.binarySearch(tails, num);
            if (pos < 0) {
                pos = -(pos + 1);   // insertion point for a non-exact match
            }

            if (pos == tails.size()) {
                tails.add(num);            // num extends the longest subsequence so far
            } else {
                tails.set(pos, num);        // num replaces a worse (larger) tail value
            }
        }
        return tails.size();
    }

    public static void main(String[] args) {
        int[] nums = {10, 9, 2, 5, 3, 7, 101, 18};
        System.out.println(lengthOfLIS(nums));
    }
}
// OUTPUT:
// 4`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why does replacing a value in tails[] not corrupt the final LENGTH answer?</td><td>tails[] only needs to track the SMALLEST tail achievable for each length - replacing a larger tail with a smaller one for the same length can only help FUTURE extensions, never hurts the count of how many distinct lengths have been achieved</td></tr>
<tr class='text-center'><td>Is tails[] itself a valid increasing subsequence of the input at the end?</td><td>Not necessarily - its VALUES may not correspond to an actual single subsequence path through the original array; only its LENGTH is guaranteed to equal the true LIS length</td></tr>
<tr class='text-center'><td>Why is this technique called "patience sorting"?</td><td>It mirrors the card game Patience/Solitaire, where cards are placed onto piles - each pile's top card corresponds to a tails[] entry, and the number of piles needed equals the LIS length</td></tr>
</table>`
        }
    ]
};
