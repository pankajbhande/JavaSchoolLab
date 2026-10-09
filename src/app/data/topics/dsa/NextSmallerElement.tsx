import { Topic } from '../../coreJava';

export const nextSmallerElement: Topic = {
    id: 'dsa-stack-next-smaller-element',
    name: 'Next Smaller Element',
    beginner: [
        {
            content: `<h4>Next Smaller Element - the Mirror of Next Greater</h4>
For every element, find the first element to its RIGHT that is strictly smaller (or -1 if none exists). Same monotonic-stack shape as Next Greater Element, just with the comparison flipped: use an INCREASING stack instead of decreasing.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.ArrayDeque;
import java.util.Arrays;
import java.util.Deque;

public class NextSmallerElementDemo {

    static int[] nextSmallerElements(int[] arr) {
        int n = arr.length;
        int[] result = new int[n];
        Arrays.fill(result, -1);

        Deque<Integer> stack = new ArrayDeque<>();   // holds indices, increasing by value

        for (int i = 0; i < n; i++) {
            while (!stack.isEmpty() && arr[stack.peek()] > arr[i]) {
                result[stack.pop()] = arr[i];   // arr[i] is the next smaller for this popped index
            }
            stack.push(i);
        }
        return result;
    }

    public static void main(String[] args) {
        int[] arr = {4, 8, 5, 2, 25};
        System.out.println(Arrays.toString(nextSmallerElements(arr)));
    }
}
// OUTPUT:
// [2, 5, 2, -1, -1]`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Application: Largest Rectangle in Histogram Setup</h3>
Next Smaller Element (on both sides) is exactly the precomputation the Largest Rectangle in Histogram problem needs: for each bar, knowing the nearest shorter bar to its left and right tells you the WIDEST rectangle that bar can be the height of, without scanning outward from every bar individually.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.ArrayDeque;
import java.util.Deque;

public class WidthFromNextSmallerDemo {

    // For each bar, computes how many bars it can extend across
    // (until hitting something shorter on either side) using next-smaller on both sides.
    static int[] widthOfEachBar(int[] heights) {
        int n = heights.length;
        int[] left = new int[n], right = new int[n];
        Deque<Integer> stack = new ArrayDeque<>();

        // Nearest strictly shorter bar to the LEFT
        for (int i = 0; i < n; i++) {
            while (!stack.isEmpty() && heights[stack.peek()] >= heights[i]) stack.pop();
            left[i] = stack.isEmpty() ? -1 : stack.peek();
            stack.push(i);
        }
        stack.clear();

        // Nearest strictly shorter bar to the RIGHT
        for (int i = n - 1; i >= 0; i--) {
            while (!stack.isEmpty() && heights[stack.peek()] >= heights[i]) stack.pop();
            right[i] = stack.isEmpty() ? n : stack.peek();
            stack.push(i);
        }

        int[] width = new int[n];
        for (int i = 0; i < n; i++) {
            width[i] = right[i] - left[i] - 1;   // span between the two boundaries
        }
        return width;
    }

    public static void main(String[] args) {
        int[] heights = {2, 1, 5, 6, 2, 3};
        System.out.println(java.util.Arrays.toString(widthOfEachBar(heights)));
    }
}
// OUTPUT:
// [1, 6, 2, 1, 4, 1]`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>How do Next Greater and Next Smaller differ in implementation?</td><td>Only the comparison direction changes - Next Greater pops while stack top < current (decreasing stack), Next Smaller pops while stack top > current (increasing stack); everything else is identical</td></tr>
<tr class='text-center'><td>Why use >= (not just >) when popping for the "left boundary" in the histogram setup?</td><td>Using >= treats equal-height bars correctly as boundaries too, avoiding double-counting width when there are duplicate heights in the array</td></tr>
<tr class='text-center'><td>What's the time complexity of computing next-smaller on BOTH sides?</td><td>Still O(n) total - two separate O(n) monotonic stack passes (one left-to-right, one right-to-left), not O(n^2)</td></tr>
</table>`
        }
    ]
};
