import { Topic } from '../../coreJava';

export const monotonicArray: Topic = {
    id: 'dsa-arrays-monotonic-array',
    name: 'Monotonic Array',
    beginner: [
        {
            content: `<h4>What is a Monotonic Array?</h4>
An array is <b>monotonic</b> if it is entirely non-increasing or entirely non-decreasing - values only move in one direction (or stay flat), never both.
<ul>
<li><b>Monotonically increasing:</b> <code>arr[i] &le; arr[i+1]</code> for every i.</li>
<li><b>Monotonically decreasing:</b> <code>arr[i] &ge; arr[i+1]</code> for every i.</li>
</ul>
Checking is a single O(n) pass: track whether any "increasing" violation and any "decreasing" violation occurs - the array is monotonic if at least one of the two never happens.`,
            codeExamples: [
                `package com.javaschoollab;

public class MonotonicCheckDemo {

    static boolean isMonotonic(int[] arr) {
        boolean increasing = true, decreasing = true;

        for (int i = 1; i < arr.length; i++) {
            if (arr[i] > arr[i - 1]) decreasing = false;
            if (arr[i] < arr[i - 1]) increasing = false;
        }
        return increasing || decreasing;
    }

    public static void main(String[] args) {
        System.out.println(isMonotonic(new int[]{1, 2, 2, 3}));   // increasing
        System.out.println(isMonotonic(new int[]{6, 5, 5, 2}));   // decreasing
        System.out.println(isMonotonic(new int[]{1, 3, 2}));      // neither
    }
}
// OUTPUT:
// true
// true
// false`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why "Monotonic" Matters: It Unlocks Binary Search and Monotonic Stacks</h3>
A monotonic array/sequence is the precondition that makes several techniques valid:
<ul>
<li><b>Binary search</b> only works correctly on a monotonic (sorted) sequence - the "discard half" logic depends on knowing which half the target could possibly be in.</li>
<li><b>Monotonic stack/queue</b> problems (Next Greater Element, Sliding Window Maximum) work by MAINTAINING a monotonic invariant inside the stack/deque as elements are processed, popping anything that would break monotonicity.</li>
<li><b>"Binary search on the answer"</b> problems require proving the answer space itself is monotonic (e.g. "if capacity X works, every capacity > X also works") before binary search can be applied to it.</li>
</ul>`,
            codeExamples: [
                `package com.javaschoollab;

// Maintaining a monotonic (increasing) stack invariant while scanning
public class MonotonicStackDemo {

    // For each element, find the index of the Next Greater Element (or -1)
    static int[] nextGreaterElement(int[] arr) {
        int n = arr.length;
        int[] result = new int[n];
        java.util.Arrays.fill(result, -1);

        java.util.Deque<Integer> stack = new java.util.ArrayDeque<>(); // stores INDICES

        for (int i = 0; i < n; i++) {
            // Pop everything smaller than the current element - it just found its "next greater"
            while (!stack.isEmpty() && arr[stack.peek()] < arr[i]) {
                result[stack.pop()] = i;
            }
            stack.push(i);
        }
        return result;
    }

    public static void main(String[] args) {
        int[] arr = {2, 1, 2, 4, 3};
        System.out.println(java.util.Arrays.toString(nextGreaterElement(arr)));
    }
}
// OUTPUT:
// [3, 2, 3, -1, -1]`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is the time complexity of checking if an array is monotonic?</td><td>O(n) - a single pass tracking two booleans is enough, no need to check increasing and decreasing separately in two passes</td></tr>
<tr class='text-center'><td>Why does binary search require a sorted (monotonic) array?</td><td>Discarding half the search space on each step is only valid if you can guarantee the target cannot be in the discarded half - that guarantee comes directly from monotonic order</td></tr>
<tr class='text-center'><td>What does it mean for a monotonic STACK to be increasing?</td><td>The elements from bottom to top of the stack are in increasing order - maintained by popping any element that is smaller than the one about to be pushed</td></tr>
</table>`
        }
    ]
};
