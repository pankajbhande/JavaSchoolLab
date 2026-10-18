import { Topic } from '../../coreJava';

export const slidingWindowMaxMin: Topic = {
    id: 'dsa-queue-deque-sliding-window-maximum-minimum',
    name: 'Sliding Window Maximum / Minimum',
    beginner: [
        {
            content: `<h4>The Problem</h4>
Given an array and a window size k, return the maximum (or minimum) of EVERY window as it slides across the array. This is the canonical monotonic-deque application: O(n) total instead of the naive O(n&middot;k).`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.ArrayDeque;
import java.util.Deque;

public class SlidingWindowMaximumDemo {

    static int[] maxSlidingWindow(int[] nums, int k) {
        int n = nums.length;
        int[] result = new int[n - k + 1];
        Deque<Integer> deque = new ArrayDeque<>();   // indices, decreasing values

        for (int i = 0; i < n; i++) {
            while (!deque.isEmpty() && nums[deque.peekLast()] < nums[i]) {
                deque.pollLast();
            }
            deque.offerLast(i);

            if (deque.peekFirst() <= i - k) {
                deque.pollFirst();
            }

            if (i >= k - 1) {
                result[i - k + 1] = nums[deque.peekFirst()];
            }
        }
        return result;
    }

    public static void main(String[] args) {
        int[] nums = {1, 3, -1, -3, 5, 3, 6, 7};
        System.out.println(java.util.Arrays.toString(maxSlidingWindow(nums, 3)));
    }
}
// OUTPUT:
// [3, 3, 5, 5, 6, 7]`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Sliding Window MINIMUM - Just Flip the Comparison</h3>
The minimum version is a mirror image: maintain an INCREASING deque instead of decreasing, evicting larger elements from the back before adding, so the front always holds the current window's minimum.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.ArrayDeque;
import java.util.Deque;

public class SlidingWindowMinimumDemo {

    static int[] minSlidingWindow(int[] nums, int k) {
        int n = nums.length;
        int[] result = new int[n - k + 1];
        Deque<Integer> deque = new ArrayDeque<>();   // indices, increasing values

        for (int i = 0; i < n; i++) {
            while (!deque.isEmpty() && nums[deque.peekLast()] > nums[i]) {
                deque.pollLast();
            }
            deque.offerLast(i);

            if (deque.peekFirst() <= i - k) {
                deque.pollFirst();
            }

            if (i >= k - 1) {
                result[i - k + 1] = nums[deque.peekFirst()];
            }
        }
        return result;
    }

    public static void main(String[] args) {
        int[] nums = {1, 3, -1, -3, 5, 3, 6, 7};
        System.out.println(java.util.Arrays.toString(minSlidingWindow(nums, 3)));
    }
}
// OUTPUT:
// [-1, -3, -3, -3, 3, 3]`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Could you solve Sliding Window Maximum with a PriorityQueue instead of a deque?</td><td>Yes but less efficient - a max-heap gives O(n log k) since evicting expired elements requires lazy deletion (check-and-skip) rather than the deque's O(1) direct front-removal, making the deque approach the better default answer</td></tr>
<tr class='text-center'><td>What's the space complexity of the monotonic deque solution?</td><td>O(k) - the deque never holds more than k indices at once, since anything sliding out of the window gets evicted from the front</td></tr>
<tr class='text-center'><td>How would you adapt this to also track the sliding window's SUM alongside its max?</td><td>Sum needs its own separate O(1)-per-step running total (add the entering element, subtract the one leaving) - the monotonic deque only helps with max/min, not sum, since sum has no "dominance" relationship to exploit for eviction</td></tr>
</table>`
        }
    ]
};
