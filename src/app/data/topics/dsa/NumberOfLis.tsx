import { Topic } from '../../coreJava';

export const numberOfLis: Topic = {
    id: 'dsa-dynamic-programming-number-of-lis',
    name: 'Number of LIS',
    beginner: [
        {
            content: `<h4>Counting HOW MANY Longest Increasing Subsequences Exist</h4>
Track TWO arrays alongside each other: <code>length[i]</code> = LIS length ending at i (as before), and <code>count[i]</code> = how many distinct LIS of that length end at i. When extending from j to i, if the new length TIES the current best at i, ADD j's count; if it BEATS it, RESET to j's count.`,
            codeExamples: [
                `package com.javaschoollab;

public class NumberOfLisDemo {

    static int findNumberOfLIS(int[] nums) {
        int n = nums.length;
        int[] length = new int[n];
        int[] count = new int[n];
        java.util.Arrays.fill(length, 1);
        java.util.Arrays.fill(count, 1);

        int maxLength = 1;

        for (int i = 1; i < n; i++) {
            for (int j = 0; j < i; j++) {
                if (nums[j] < nums[i]) {
                    if (length[j] + 1 > length[i]) {
                        length[i] = length[j] + 1;
                        count[i] = count[j];              // found a STRICTLY better path - reset count
                    } else if (length[j] + 1 == length[i]) {
                        count[i] += count[j];              // found an EQUALLY good path - accumulate
                    }
                }
            }
            maxLength = Math.max(maxLength, length[i]);
        }

        int result = 0;
        for (int i = 0; i < n; i++) {
            if (length[i] == maxLength) {
                result += count[i];
            }
        }
        return result;
    }

    public static void main(String[] args) {
        int[] nums = {1, 3, 5, 4, 7};
        System.out.println(findNumberOfLIS(nums));
    }
}
// OUTPUT:
// 2`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why "Reset on Strictly Better, Accumulate on Tie" is the Correct Rule</h3>
If a new path through j achieves a STRICTLY LONGER subsequence ending at i, all previously-counted (shorter) paths to i are irrelevant to the MAXIMUM length - count[i] must reset to reflect only paths achieving this new best length. If the new path TIES the current best length, it represents an ADDITIONAL distinct way to achieve that same best length, so its count contributes ADDITIONALLY, not by replacing.`,
            codeExamples: [
                `package com.javaschoollab;

public class CountingLogicExplainedDemo {
    public static void main(String[] args) {
        System.out.println("Example: nums = [1, 3, 5, 4, 7]");
        System.out.println();
        System.out.println("At index 4 (value 7), two DIFFERENT paths reach it with the SAME length:");
        System.out.println("  Path A: 1 -> 3 -> 5 -> 7  (length 4)");
        System.out.println("  Path B: 1 -> 3 -> 4 -> 7  (length 4)");
        System.out.println();
        System.out.println("Both are valid LIS of the maximum length - count[4] must equal");
        System.out.println("the SUM of count[j] for every j that ties the best length reaching index 4,");
        System.out.println("which is exactly what the accumulate-on-tie rule computes.");
    }
}
// OUTPUT:
// Example: nums = [1, 3, 5, 4, 7]
// ...`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What's the time complexity of counting LIS this way?</td><td>O(n^2), same as the basic O(n^2) LIS length algorithm - tracking two arrays instead of one doesn't change the asymptotic complexity</td></tr>
<tr class='text-center'><td>Can the O(n log n) patience-sorting technique be adapted to count LIS too?</td><td>Yes, but it requires a more sophisticated data structure (like a Fenwick Tree indexed by value, tracking both max length and count at each position) - significantly more complex than the O(n^2) approach, usually not worth it unless n is very large</td></tr>
<tr class='text-center'><td>Why is the FINAL answer a SUM over all indices with length[i] == maxLength?</td><td>The overall longest increasing subsequence could end at MULTIPLE different indices - the total count must combine the ways from every ending position that achieves the true maximum length</td></tr>
</table>`
        }
    ]
};
