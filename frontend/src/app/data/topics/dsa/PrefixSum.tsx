import { Topic } from '../../coreJava';

export const prefixSum: Topic = {
    id: 'dsa-arrays-prefix-sum',
    name: 'Prefix Sum',
    beginner: [
        {
            content: `<h4>What is a Prefix Sum?</h4>
A prefix sum array <code>pre</code> stores running totals: <code>pre[i] = arr[0] + arr[1] + ... + arr[i]</code>. Once built (O(n) once), the sum of ANY range <code>[l, r]</code> can be answered in O(1) instead of O(n):
<ul>
<li><code>sum(0, r) = pre[r]</code></li>
<li><code>sum(l, r) = pre[r] - pre[l - 1]</code> (for l &gt; 0)</li>
</ul>
This is the single biggest win of prefix sums: many range-sum queries, each O(1), after one O(n) precomputation.`,
            codeExamples: [
                `package com.javaschoollab;

public class PrefixSumDemo {

    static int[] buildPrefix(int[] arr) {
        int[] pre = new int[arr.length];
        pre[0] = arr[0];
        for (int i = 1; i < arr.length; i++) {
            pre[i] = pre[i - 1] + arr[i];
        }
        return pre;
    }

    // Sum of arr[l..r] inclusive, in O(1) using the prefix array
    static int rangeSum(int[] pre, int l, int r) {
        if (l == 0) return pre[r];
        return pre[r] - pre[l - 1];
    }

    public static void main(String[] args) {
        int[] arr = {2, 4, 6, 8, 10};
        int[] pre = buildPrefix(arr);

        System.out.println("Sum(1, 3) = " + rangeSum(pre, 1, 3)); // 4+6+8
        System.out.println("Sum(0, 4) = " + rangeSum(pre, 0, 4)); // whole array
    }
}
// OUTPUT:
// Sum(1, 3) = 18
// Sum(0, 4) = 30`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Prefix Sum for Subarray-Sum Problems</h3>
The classic trick: to find a subarray whose sum equals <code>k</code>, note that <code>sum(i+1, j) = pre[j] - pre[i] = k</code> means <code>pre[i] = pre[j] - k</code>. Store every prefix sum seen so far in a HashMap, and for each new prefix check whether <code>pre[j] - k</code> already occurred - this turns an O(n&sup2;) brute force into O(n).`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.HashMap;
import java.util.Map;

public class SubarraySumEqualsKDemo {

    // Counts subarrays whose sum equals k, in O(n)
    static int countSubarraysWithSum(int[] arr, int k) {
        Map<Integer, Integer> prefixCount = new HashMap<>();
        prefixCount.put(0, 1);   // empty prefix, needed for subarrays starting at index 0

        int runningSum = 0;
        int count = 0;

        for (int num : arr) {
            runningSum += num;

            // If (runningSum - k) was seen before, those prefixes mark subarrays summing to k
            count += prefixCount.getOrDefault(runningSum - k, 0);

            prefixCount.merge(runningSum, 1, Integer::sum);
        }
        return count;
    }

    public static void main(String[] args) {
        int[] arr = {1, 2, 3, -2, 5};
        System.out.println(countSubarraysWithSum(arr, 5));
    }
}
// OUTPUT:
// 3
// (subarrays: [2,3], [3,-2,5]... - three subarrays sum to 5)`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why use a prefix sum array instead of recomputing each range sum?</td><td>Recomputing is O(n) per query; a prefix array answers each range-sum query in O(1) after one O(n) build</td></tr>
<tr class='text-center'><td>What's the 2D generalization of prefix sums?</td><td>A 2D prefix sum matrix, letting any rectangular sub-rectangle's sum be computed in O(1) using inclusion-exclusion</td></tr>
<tr class='text-center'><td>When does prefix sum stop being the right tool?</td><td>When the underlying array is updated frequently between queries - a Fenwick Tree or Segment Tree supports O(log n) updates that a plain prefix array cannot</td></tr>
</table>`
        }
    ]
};
