import { Topic } from '../../coreJava';

export const longestConsecutiveSequence: Topic = {
    id: 'dsa-hashing-longest-consecutive-sequence',
    name: 'Longest Consecutive Sequence',
    beginner: [
        {
            content: `<h4>Longest Run of Consecutive Integers</h4>
Given an unsorted array, find the length of the longest run of consecutive integers (e.g. <code>[100, 4, 200, 1, 3, 2]</code> &rarr; the run <code>1,2,3,4</code> has length 4). Sorting first gives O(n log n); a HashSet gives O(n) by only starting a count from numbers that are the BEGINNING of a run.

<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:12px 0;">
<svg viewBox="0 0 460 90" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;font-family:monospace">
  <text x="10" y="16" font-size="12" fill="#374151">set = {100, 4, 200, 1, 3, 2}</text>
  <g font-size="12">
    <rect x="10" y="28" width="34" height="26" fill="#ecfdf5" stroke="#059669"/><text x="27" y="46" text-anchor="middle" fill="#065f46">1</text>
    <rect x="48" y="28" width="34" height="26" fill="#ecfdf5" stroke="#059669"/><text x="65" y="46" text-anchor="middle" fill="#065f46">2</text>
    <rect x="86" y="28" width="34" height="26" fill="#ecfdf5" stroke="#059669"/><text x="103" y="46" text-anchor="middle" fill="#065f46">3</text>
    <rect x="124" y="28" width="34" height="26" fill="#ecfdf5" stroke="#059669"/><text x="141" y="46" text-anchor="middle" fill="#065f46">4</text>
    <rect x="172" y="28" width="44" height="26" fill="#fff7ed" stroke="#ea580c"/><text x="194" y="46" text-anchor="middle" fill="#9a3412">100</text>
    <rect x="226" y="28" width="44" height="26" fill="#fff7ed" stroke="#ea580c"/><text x="248" y="46" text-anchor="middle" fill="#9a3412">200</text>
  </g>
  <text x="10" y="76" font-size="12" fill="#059669">1 has no (1-1=0) in set &#8594; run START &#8594; count 1,2,3,4 &#8594; length 4</text>
</svg>
</div>`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.HashSet;
import java.util.Set;

public class LongestConsecutiveSequenceDemo {

    static int longestConsecutive(int[] nums) {
        Set<Integer> numSet = new HashSet<>();
        for (int n : nums) numSet.add(n);

        int longest = 0;
        for (int num : numSet) {
            // Only start counting from the BEGINNING of a run -
            // this is what keeps the whole algorithm O(n) instead of O(n^2)
            if (!numSet.contains(num - 1)) {
                int length = 1;
                while (numSet.contains(num + length)) {
                    length++;
                }
                longest = Math.max(longest, length);
            }
        }
        return longest;
    }

    public static void main(String[] args) {
        int[] nums = {100, 4, 200, 1, 3, 2};
        System.out.println(longestConsecutive(nums));
    }
}
// OUTPUT:
// 4`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This is O(n) Despite the Nested while Loop</h3>
It looks like the outer for-loop combined with the inner while-loop could be O(n&sup2;) - but the <code>if (!numSet.contains(num - 1))</code> guard ensures the inner while-loop only ever RUNS for numbers that start a run. Across the entire algorithm, every number is visited by the inner while-loop AT MOST ONCE (as part of counting its own run), so total work is bounded by O(n), not O(n) runs each doing O(n) work.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.HashSet;
import java.util.Set;

public class ConsecutiveSequenceWithBoundsDemo {

    // Also returns the actual [start, end] of the longest run, not just its length
    static int[] longestConsecutiveRange(int[] nums) {
        Set<Integer> numSet = new HashSet<>();
        for (int n : nums) numSet.add(n);

        int bestStart = 0, bestLength = 0;

        for (int num : numSet) {
            if (!numSet.contains(num - 1)) {
                int length = 1;
                while (numSet.contains(num + length)) {
                    length++;
                }
                if (length > bestLength) {
                    bestLength = length;
                    bestStart = num;
                }
            }
        }
        return new int[]{bestStart, bestStart + bestLength - 1};
    }

    public static void main(String[] args) {
        int[] nums = {36, 41, 56, 35, 44, 33, 34, 92, 43, 32, 42};
        System.out.println(java.util.Arrays.toString(longestConsecutiveRange(nums)));
    }
}
// OUTPUT:
// [32, 36]`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why is the HashSet approach O(n) but the sort-first approach O(n log n)?</td><td>Sorting inherently costs O(n log n); the HashSet approach avoids sorting entirely by using O(1) membership checks to detect run starts and walk runs, doing only O(n) total work across the whole array</td></tr>
<tr class='text-center'><td>What's the key trick that prevents the nested loop from being O(n^2)?</td><td>Only starting the inner while-loop when num-1 is NOT in the set - this guarantees the inner loop for each number's run only ever executes starting from that run's true beginning, once</td></tr>
<tr class='text-center'><td>Does this approach handle duplicate numbers in the input correctly?</td><td>Yes - converting to a Set naturally deduplicates first, so duplicates don't inflate the run length or cause incorrect counting</td></tr>
</table>`
        }
    ]
};
