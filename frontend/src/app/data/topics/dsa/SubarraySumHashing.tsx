import { Topic } from '../../coreJava';

export const subarraySumHashing: Topic = {
    id: 'dsa-hashing-subarray-sum',
    name: 'Subarray Sum',
    beginner: [
        {
            content: `<h4>Subarray Sum Problems - Which Tool Fits?</h4>
"Subarray sum" problems come in several flavors, and picking the right tool matters:
<ul>
<li><b>All positive numbers, exact target:</b> Sliding Window - grow/shrink based on whether the sum is too small or too large.</li>
<li><b>Numbers can be negative, exact target:</b> Prefix Sum + HashMap - sliding window breaks because shrinking doesn't monotonically decrease the sum anymore.</li>
<li><b>Just need the maximum sum, no target:</b> Kadane's Algorithm.</li>
</ul>`,
            codeExamples: [
                `package com.javaschoollab;

public class SubarraySumPositiveDemo {

    // All-positive array, sliding window - O(n)
    static boolean hasSubarrayWithSum(int[] arr, int target) {
        int left = 0, windowSum = 0;

        for (int right = 0; right < arr.length; right++) {
            windowSum += arr[right];

            while (windowSum > target && left <= right) {
                windowSum -= arr[left];
                left++;
            }
            if (windowSum == target) return true;
        }
        return false;
    }

    public static void main(String[] args) {
        int[] arr = {1, 4, 20, 3, 10, 5};
        System.out.println(hasSubarrayWithSum(arr, 33));
    }
}
// OUTPUT:
// true
// (subarray [20, 3, 10] sums to 33)`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why Sliding Window Breaks With Negative Numbers</h3>
Sliding window's shrink step relies on a key invariant: removing an element from the left always DECREASES the window sum, so shrinking is a valid way to search for a smaller-but-still-valid window. With negative numbers, removing an element from the left could INCREASE the sum - the invariant that makes "shrink while too big" correct no longer holds, so the technique silently gives wrong answers instead of erroring.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.HashMap;
import java.util.Map;

public class SubarraySumWithNegativesDemo {

    // Works correctly even with negative numbers - prefix sum + HashMap
    static boolean hasSubarrayWithSum(int[] arr, int target) {
        Map<Integer, Boolean> seenPrefix = new HashMap<>();
        seenPrefix.put(0, true);

        int runningSum = 0;
        for (int num : arr) {
            runningSum += num;
            if (seenPrefix.containsKey(runningSum - target)) {
                return true;
            }
            seenPrefix.put(runningSum, true);
        }
        return false;
    }

    public static void main(String[] args) {
        int[] arr = {3, 4, -7, 1, 3, 3, 1, -4};
        System.out.println(hasSubarrayWithSum(arr, 7));
        // A sliding window would incorrectly handle this due to the -7 and -4
    }
}
// OUTPUT:
// true`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Given an array that MIGHT have negative numbers, which technique is safe by default?</td><td>Prefix Sum + HashMap - it makes no assumption about sign, unlike sliding window which requires all-positive (or at least monotonic) values</td></tr>
<tr class='text-center'><td>How would you find the number of subarrays with sum divisible by k?</td><td>Track prefix sums MODULO k in a HashMap; two prefixes with the same remainder mean the subarray between them is divisible by k - same core pattern as subarray-sum-equals-k, generalized</td></tr>
<tr class='text-center'><td>What's the space complexity of the prefix-sum + HashMap approach?</td><td>O(n) - in the worst case, every prefix sum is distinct and gets its own map entry</td></tr>
</table>`
        }
    ]
};
