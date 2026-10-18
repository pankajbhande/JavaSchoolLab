import { Topic } from '../../coreJava';

export const nextGreaterElement: Topic = {
    id: 'dsa-stack-next-greater-element',
    name: 'Next Greater Element',
    beginner: [
        {
            content: `<h4>Next Greater Element - Standard Version</h4>
For every element, find the first element to its RIGHT that is strictly greater (or -1 if none exists). A DECREASING monotonic stack of indices solves this in O(n): scan left to right, and whenever the current element beats the stack's top, that's the top's "next greater".`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.ArrayDeque;
import java.util.Arrays;
import java.util.Deque;

public class NextGreaterElementDemo {

    static int[] nextGreaterElements(int[] arr) {
        int n = arr.length;
        int[] result = new int[n];
        Arrays.fill(result, -1);

        Deque<Integer> stack = new ArrayDeque<>();   // holds INDICES, decreasing by value

        for (int i = 0; i < n; i++) {
            while (!stack.isEmpty() && arr[stack.peek()] < arr[i]) {
                result[stack.pop()] = arr[i];   // arr[i] is the next greater for this popped index
            }
            stack.push(i);
        }
        return result;
    }

    public static void main(String[] args) {
        int[] arr = {4, 5, 2, 10, 8};
        System.out.println(Arrays.toString(nextGreaterElements(arr)));
    }
}
// OUTPUT:
// [5, 10, 10, -1, -1]`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Next Greater Element in a CIRCULAR Array</h3>
When the array wraps around (element n-1's "next" can be element 0), simulate circularity by iterating the index range TWICE (using <code>i % n</code>), without actually duplicating the array in memory.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.ArrayDeque;
import java.util.Arrays;
import java.util.Deque;

public class CircularNextGreaterDemo {

    static int[] nextGreaterCircular(int[] arr) {
        int n = arr.length;
        int[] result = new int[n];
        Arrays.fill(result, -1);
        Deque<Integer> stack = new ArrayDeque<>();

        // Loop 2n times to simulate wrapping around once, without copying the array
        for (int i = 0; i < 2 * n; i++) {
            int num = arr[i % n];
            while (!stack.isEmpty() && arr[stack.peek()] < num) {
                result[stack.pop()] = num;
            }
            if (i < n) {
                stack.push(i);   // only push real indices, not the second lap
            }
        }
        return result;
    }

    public static void main(String[] args) {
        int[] arr = {1, 2, 1};
        System.out.println(Arrays.toString(nextGreaterCircular(arr)));
    }
}
// OUTPUT:
// [2, -1, 2]
// (index 1's value 2 has no greater element even after wrapping, so it stays -1)`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why does the circular version loop 2n times instead of n?</td><td>It gives every index one full "lap" of potential right-neighbors to compare against, simulating the wraparound without physically duplicating the array</td></tr>
<tr class='text-center'><td>Why only push indices during the FIRST lap (i < n)?</td><td>Pushing again during the second lap would create duplicate index entries on the stack, corrupting future pop/compare logic - each real index should only ever be pushed once</td></tr>
<tr class='text-center'><td>What's the time and space complexity?</td><td>O(n) time (amortized, same monotonic-stack argument as the linear version, just over 2n iterations), O(n) space for the stack and result array</td></tr>
</table>`
        }
    ]
};
