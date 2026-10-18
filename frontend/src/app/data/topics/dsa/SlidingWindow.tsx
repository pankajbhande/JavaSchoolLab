import { Topic } from '../../coreJava';

export const slidingWindow: Topic = {
    id: 'dsa-arrays-sliding-window',
    name: 'Sliding Window',
    beginner: [
        {
            content: `<h4>What is the Sliding Window Pattern?</h4>
Sliding window solves problems about a <b>contiguous range</b> (subarray/substring) by maintaining a window with two pointers, <code>left</code> and <code>right</code>, and sliding it across the array instead of recomputing from scratch for every position.
<ul>
<li><b>Fixed-size window:</b> the window size k never changes - slide it one step at a time, subtracting the element leaving and adding the element entering.</li>
<li><b>Variable-size window:</b> grow the window by moving <code>right</code>; shrink it by moving <code>left</code> whenever a condition is violated.</li>
</ul>
Both turn an O(n&middot;k) or O(n&sup2;) brute force into O(n).`,
            codeExamples: [
                `package com.javaschoollab;

public class FixedWindowDemo {

    // Maximum sum of any k consecutive elements
    static int maxSumOfSizeK(int[] arr, int k) {
        int windowSum = 0;
        for (int i = 0; i < k; i++) {
            windowSum += arr[i];      // build the first window
        }

        int maxSum = windowSum;
        for (int right = k; right < arr.length; right++) {
            windowSum += arr[right] - arr[right - k];  // slide: add new, drop old
            maxSum = Math.max(maxSum, windowSum);
        }
        return maxSum;
    }

    public static void main(String[] args) {
        int[] arr = {2, 1, 5, 1, 3, 2};
        System.out.println(maxSumOfSizeK(arr, 3));
    }
}
// OUTPUT:
// 9
// (window [5, 1, 3] sums to 9)`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Variable-Size Window - Smallest Subarray with Sum &ge; Target</h3>
Grow the window by moving <code>right</code> forward, adding each new element. As soon as the window's sum meets the target, shrink from <code>left</code> as much as possible while it still meets the target, recording the smallest length seen.`,
            codeExamples: [
                `package com.javaschoollab;

public class VariableWindowDemo {

    // Length of the smallest contiguous subarray whose sum is >= target, or 0 if none exists
    static int minSubArrayLen(int target, int[] arr) {
        int left = 0;
        int windowSum = 0;
        int minLen = Integer.MAX_VALUE;

        for (int right = 0; right < arr.length; right++) {
            windowSum += arr[right];   // grow the window

            // shrink from the left while the condition still holds
            while (windowSum >= target) {
                minLen = Math.min(minLen, right - left + 1);
                windowSum -= arr[left];
                left++;
            }
        }
        return minLen == Integer.MAX_VALUE ? 0 : minLen;
    }

    public static void main(String[] args) {
        int[] arr = {2, 3, 1, 2, 4, 3};
        System.out.println(minSubArrayLen(7, arr));
    }
}
// OUTPUT:
// 2
// (subarray [4, 3] sums to 7 in only 2 elements)`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why is sliding window O(n) instead of O(n*k)?</td><td>Each element enters and leaves the window at most once, so total pointer movement across the whole run is bounded by 2n, not n*k</td></tr>
<tr class='text-center'><td>When would you reach for sliding window vs two pointers generally?</td><td>Sliding window is specifically for CONTIGUOUS ranges (subarrays/substrings); two pointers is the broader technique that also covers non-contiguous scans, like on a sorted array</td></tr>
<tr class='text-center'><td>How do you handle "longest substring with at most K distinct characters"?</td><td>Variable-size window with a frequency map: grow right and add to the map; shrink from left whenever distinct count exceeds K, tracking the max window length seen</td></tr>
</table>`
        }
    ]
};
