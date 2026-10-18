import { Topic } from '../../coreJava';

export const twoSumPattern: Topic = {
    id: 'dsa-hashing-two-sum-pattern',
    name: 'Two-Sum Pattern',
    beginner: [
        {
            content: `<h4>The Two-Sum Pattern</h4>
Find two numbers in an array that add up to a target. The brute force checks every pair - O(n&sup2;). A HashMap turns this into a single O(n) pass: for each number, check whether its COMPLEMENT (target - number) has already been seen.

<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:12px 0;">
<svg viewBox="0 0 460 100" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;font-family:monospace">
  <text x="10" y="16" font-size="12" fill="#374151">nums = [2, 7, 11, 15], target = 9</text>
  <g font-size="12">
    <rect x="10" y="28" width="40" height="26" fill="#ecfdf5" stroke="#059669"/><text x="30" y="46" text-anchor="middle" fill="#065f46">2</text>
    <rect x="50" y="28" width="40" height="26" fill="#ecfdf5" stroke="#059669"/><text x="70" y="46" text-anchor="middle" fill="#065f46">7</text>
    <rect x="90" y="28" width="40" height="26" fill="#fff7ed" stroke="#ea580c"/><text x="110" y="46" text-anchor="middle" fill="#9a3412">11</text>
    <rect x="130" y="28" width="40" height="26" fill="#fff7ed" stroke="#ea580c"/><text x="150" y="46" text-anchor="middle" fill="#9a3412">15</text>
  </g>
  <text x="10" y="76" font-size="12" fill="#059669">i=0: seen={}, complement(7) not found, store 2&#8594;0</text>
  <text x="10" y="92" font-size="12" fill="#065f46">i=1: complement(2) FOUND in seen &#8594; answer = [0, 1]</text>
</svg>
</div>`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.HashMap;
import java.util.Map;

public class TwoSumDemo {

    static int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> seen = new HashMap<>();   // value -> index

        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (seen.containsKey(complement)) {
                return new int[]{seen.get(complement), i};
            }
            seen.put(nums[i], i);
        }
        return new int[]{-1, -1};
    }

    public static void main(String[] args) {
        int[] nums = {2, 7, 11, 15};
        System.out.println(java.util.Arrays.toString(twoSum(nums, 9)));
    }
}
// OUTPUT:
// [0, 1]`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Three-Sum - Extending the Pattern with Sort + Two Pointers</h3>
Three-Sum (find all triplets summing to zero) doesn't extend cleanly to a pure HashMap approach without producing duplicate triplets. The standard solution instead SORTS the array, fixes one element, then uses the opposite-ends two-pointer technique on the rest - O(n&sup2;) total, with explicit duplicate-skipping.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class ThreeSumDemo {

    static List<List<Integer>> threeSum(int[] nums) {
        Arrays.sort(nums);
        List<List<Integer>> result = new ArrayList<>();

        for (int i = 0; i < nums.length - 2; i++) {
            if (i > 0 && nums[i] == nums[i - 1]) continue;   // skip duplicate first elements

            int left = i + 1, right = nums.length - 1;
            while (left < right) {
                int sum = nums[i] + nums[left] + nums[right];
                if (sum == 0) {
                    result.add(Arrays.asList(nums[i], nums[left], nums[right]));
                    while (left < right && nums[left] == nums[left + 1]) left++;   // skip duplicates
                    while (left < right && nums[right] == nums[right - 1]) right--;
                    left++;
                    right--;
                } else if (sum < 0) {
                    left++;
                } else {
                    right--;
                }
            }
        }
        return result;
    }

    public static void main(String[] args) {
        int[] nums = {-1, 0, 1, 2, -1, -4};
        System.out.println(threeSum(nums));
    }
}
// OUTPUT:
// [[-1, -1, 2], [-1, 0, 1]]`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why does Two Sum only need ONE pass through the array?</td><td>Each number is checked against everything seen SO FAR; by the time a valid pair exists, both its complement lookup and its own insertion have already happened in the same left-to-right scan</td></tr>
<tr class='text-center'><td>Why can't Three-Sum reuse the exact same HashMap trick without extra care?</td><td>It can, but avoiding duplicate triplets (e.g. [-1,0,1] found multiple times via different index combinations) requires extra deduplication logic that the sort + two-pointer approach handles more naturally</td></tr>
<tr class='text-center'><td>What's the time complexity difference between the HashMap Two Sum and the sorted Three Sum?</td><td>Two Sum: O(n) time, O(n) space. Three Sum: O(n^2) time (O(n log n) sort + O(n) two-pointer scan per fixed first element), O(1) extra space besides the output</td></tr>
</table>`
        }
    ]
};
