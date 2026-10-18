import { Topic } from '../../coreJava';

export const monotonicQueue: Topic = {
    id: 'dsa-queue-deque-monotonic-queue',
    name: 'Monotonic Queue',
    beginner: [
        {
            content: `<h4>What is a Monotonic Queue?</h4>
The deque equivalent of a monotonic stack: a deque kept in increasing or decreasing order, but crucially it also needs to evict elements that have SLID OUT of the current window from the FRONT - something a monotonic stack (single-ended) can't do. This is what makes it the tool for sliding-window maximum/minimum problems.
<ul>
<li>Before adding a new element from the back, pop weaker elements from the back (same idea as monotonic stack).</li>
<li>Before reading the front (the current max/min), pop anything from the FRONT that has fallen outside the window.</li>
</ul>`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.ArrayDeque;
import java.util.Deque;

public class MonotonicQueueDemo {
    public static void main(String[] args) {
        int[] arr = {1, 3, -1, -3, 5, 3, 6, 7};
        int k = 3;
        Deque<Integer> deque = new ArrayDeque<>();   // holds indices, decreasing values

        for (int i = 0; i < arr.length; i++) {
            // Evict from the BACK: anything weaker than the incoming element
            while (!deque.isEmpty() && arr[deque.peekLast()] < arr[i]) {
                deque.pollLast();
            }
            deque.offerLast(i);

            // Evict from the FRONT: anything that has slid out of the window
            if (deque.peekFirst() <= i - k) {
                deque.pollFirst();
            }

            if (i >= k - 1) {
                System.out.println("Window ending at " + i + ", max = " + arr[deque.peekFirst()]);
            }
        }
    }
}
// OUTPUT:
// Window ending at 2, max = 3
// Window ending at 3, max = 3
// Window ending at 4, max = 5
// Window ending at 5, max = 5
// Window ending at 6, max = 6
// Window ending at 7, max = 7`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This is O(n) Total, Not O(n&middot;k)</h3>
Just like a monotonic stack, every index is pushed to the back exactly once and popped from either end AT MOST once across the entire run - so total deque operations are bounded by O(n), regardless of the window size k. This beats the naive approach of scanning all k elements for every window, which is O(n&middot;k).`,
            codeExamples: [
                `package com.javaschoollab;

public class NaiveSlidingWindowMaxDemo {

    // O(n*k) - for comparison, scans the whole window every time
    static int[] naiveMaxSlidingWindow(int[] arr, int k) {
        int n = arr.length;
        int[] result = new int[n - k + 1];

        for (int i = 0; i <= n - k; i++) {
            int max = arr[i];
            for (int j = i; j < i + k; j++) {   // rescans the whole window every step
                max = Math.max(max, arr[j]);
            }
            result[i] = max;
        }
        return result;
    }

    public static void main(String[] args) {
        int[] arr = {1, 3, -1, -3, 5, 3, 6, 7};
        System.out.println(java.util.Arrays.toString(naiveMaxSlidingWindow(arr, 3)));
        // The monotonic-deque version computes the SAME result in O(n) instead of O(n*k)
    }
}
// OUTPUT:
// [3, 3, 5, 5, 6, 7]`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why does a monotonic queue need a DEQUE, not a stack?</td><td>It must evict from BOTH ends: the back to maintain monotonic order when adding, and the FRONT to expire elements that have slid outside the current window - a single-ended stack can't do the front eviction</td></tr>
<tr class='text-center'><td>Why check arr[deque.peekLast()] < arr[i] with STRICT less-than for a max-window?</td><td>Keeping equal elements means ties are broken by favoring the more RECENT occurrence, which matters if the older equal element is about to expire from the window sooner</td></tr>
<tr class='text-center'><td>Why is the front-eviction check "deque.peekFirst() <= i - k" rather than "< i - k + 1"?</td><td>They're equivalent, but the form used directly expresses "this index is now more than k positions behind the current one, meaning it's outside the window of size k"</td></tr>
</table>`
        }
    ]
};
