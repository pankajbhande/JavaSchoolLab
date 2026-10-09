import { Topic } from '../../coreJava';

export const prefixSumHashMap: Topic = {
    id: 'dsa-hashing-prefix-sum-hashmap',
    name: 'Prefix-Sum + HashMap',
    beginner: [
        {
            content: `<h4>Combining Prefix Sum with a HashMap</h4>
Plain prefix sum answers "what's the sum of range [l, r]?" in O(1), but only when you already know l and r. Pairing it with a HashMap unlocks a different question: "does ANY subarray sum to exactly k?" - answered in a single O(n) pass, no nested loop needed.
<ul>
<li>Track a running sum as you scan left to right.</li>
<li>At each step, check whether <code>(runningSum - k)</code> was seen as a PAST prefix sum - if so, everything between that past point and now sums to exactly k.</li>
</ul>

<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:12px 0;">
<svg viewBox="0 0 460 110" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;font-family:monospace">
  <text x="10" y="18" font-size="12" fill="#374151">arr = [1, 2, 3, -2, 5],  k = 5</text>
  <g font-size="12">
    <rect x="10" y="30" width="40" height="28" fill="#fff7ed" stroke="#ea580c"/><text x="30" y="49" text-anchor="middle" fill="#9a3412">1</text>
    <rect x="50" y="30" width="40" height="28" fill="#fff7ed" stroke="#ea580c"/><text x="70" y="49" text-anchor="middle" fill="#9a3412">2</text>
    <rect x="90" y="30" width="40" height="28" fill="#ecfdf5" stroke="#059669"/><text x="110" y="49" text-anchor="middle" fill="#065f46">3</text>
    <rect x="130" y="30" width="40" height="28" fill="#fff7ed" stroke="#ea580c"/><text x="150" y="49" text-anchor="middle" fill="#9a3412">-2</text>
    <rect x="170" y="30" width="40" height="28" fill="#ecfdf5" stroke="#059669"/><text x="190" y="49" text-anchor="middle" fill="#065f46">5</text>
  </g>
  <text x="10" y="80" font-size="12" fill="#6b7280">running sums: 1, 3, 6, 4, 9</text>
  <text x="10" y="98" font-size="12" fill="#059669">subarray [3,-2,5] sums to 5 &#8594; prefix(6) - prefix(1) = 5</text>
</svg>
</div>`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.HashMap;
import java.util.Map;

public class SubarraySumEqualsKDemo {

    static int countSubarraysWithSum(int[] arr, int k) {
        Map<Integer, Integer> prefixCount = new HashMap<>();
        prefixCount.put(0, 1);   // empty prefix - needed for subarrays starting at index 0

        int runningSum = 0;
        int count = 0;

        for (int num : arr) {
            runningSum += num;
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
// 3`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why the Empty Prefix (0 &rarr; 1) Must Be Seeded First</h3>
Without pre-seeding <code>prefixCount.put(0, 1)</code>, a subarray starting at index 0 whose sum exactly equals k would never be counted - there'd be no "earlier prefix sum" to subtract, since the subarray IS the prefix. Seeding the empty prefix as "seen once" handles this edge case for free, without a special-cased branch.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.HashMap;
import java.util.Map;

public class LongestSubarraySumKDemo {

    // Longest subarray summing to EXACTLY k - same pattern, tracking first occurrence index
    static int longestSubarrayWithSum(int[] arr, int k) {
        Map<Integer, Integer> firstIndexOfSum = new HashMap<>();
        firstIndexOfSum.put(0, -1);   // empty prefix ends "before index 0"

        int runningSum = 0, maxLen = 0;
        for (int i = 0; i < arr.length; i++) {
            runningSum += arr[i];

            if (firstIndexOfSum.containsKey(runningSum - k)) {
                maxLen = Math.max(maxLen, i - firstIndexOfSum.get(runningSum - k));
            }
            // only store the FIRST time a sum occurs - keeps the subarray as long as possible
            firstIndexOfSum.putIfAbsent(runningSum, i);
        }
        return maxLen;
    }

    public static void main(String[] args) {
        int[] arr = {1, -1, 5, -2, 3};
        System.out.println(longestSubarrayWithSum(arr, 3));
    }
}
// OUTPUT:
// 4
// (subarray [1, -1, 5, -2] sums to 3, length 4)`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why is this O(n) instead of the brute force O(n&sup2;)?</td><td>The brute force checks every (start, end) pair explicitly; the HashMap approach makes each "has this prefix sum occurred before" check O(1), turning the whole scan into a single O(n) pass</td></tr>
<tr class='text-center'><td>What changes between "count subarrays summing to k" and "find the longest such subarray"?</td><td>Counting sums ALL occurrences of each prefix value; longest-length only needs the FIRST occurrence of each prefix value, since an earlier start gives a longer subarray</td></tr>
<tr class='text-center'><td>Does this technique work with negative numbers?</td><td>Yes - unlike a sliding window (which assumes sums grow monotonically as you add elements, breaking with negatives), the prefix-sum + HashMap approach works regardless of sign</td></tr>
</table>`
        }
    ]
};
