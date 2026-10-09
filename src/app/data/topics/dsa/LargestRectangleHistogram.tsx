import { Topic } from '../../coreJava';

export const largestRectangleHistogram: Topic = {
    id: 'dsa-stack-largest-rectangle-in-histogram',
    name: 'Largest Rectangle in Histogram',
    beginner: [
        {
            content: `<h4>The Problem</h4>
Given bar heights of a histogram, find the area of the LARGEST rectangle that fits entirely within the bars. The brute force tries every pair of left/right boundaries - O(n&sup2;) or worse. A monotonic stack solves it in a single O(n) pass.

<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:12px 0;">
<svg viewBox="0 0 240 100" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:240px;height:auto;font-family:monospace">
  <rect x="10" y="60" width="30" height="30" fill="#fff7ed" stroke="#ea580c"/>
  <rect x="40" y="80" width="30" height="10" fill="#fff7ed" stroke="#ea580c"/>
  <rect x="70" y="10" width="30" height="80" fill="#ecfdf5" stroke="#059669"/>
  <rect x="100" y="0" width="30" height="90" fill="#ecfdf5" stroke="#059669"/>
  <rect x="130" y="60" width="30" height="30" fill="#fff7ed" stroke="#ea580c"/>
  <rect x="160" y="50" width="30" height="40" fill="#fff7ed" stroke="#ea580c"/>
  <rect x="70" y="10" width="60" height="80" fill="none" stroke="#dc2626" stroke-width="2" stroke-dasharray="4,3"/>
  <text x="100" y="95" text-anchor="middle" font-size="10" fill="#dc2626">max area = 5 &#215; 2 = 10</text>
</svg>
</div>`,
            codeExamples: [
                `package com.javaschoollab;

public class LargestRectangleBruteForceDemo {

    // O(n^2) - for each bar, expand left and right while bars are tall enough
    static int largestRectangleArea(int[] heights) {
        int maxArea = 0;
        for (int i = 0; i < heights.length; i++) {
            int minHeight = heights[i];
            for (int j = i; j < heights.length; j++) {
                minHeight = Math.min(minHeight, heights[j]);
                maxArea = Math.max(maxArea, minHeight * (j - i + 1));
            }
        }
        return maxArea;
    }

    public static void main(String[] args) {
        int[] heights = {2, 1, 5, 6, 2, 3};
        System.out.println(largestRectangleArea(heights));
    }
}
// OUTPUT:
// 10`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>O(n) Monotonic Stack Solution</h3>
Keep an increasing stack of bar indices. When a shorter bar arrives, pop the taller bars - each popped bar's MAXIMUM possible rectangle is now fully determined: its height times the width between the new shorter bar and whatever's now below it on the stack. This resolves every bar's best rectangle in one pass.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.ArrayDeque;
import java.util.Deque;

public class LargestRectangleStackDemo {

    static int largestRectangleArea(int[] heights) {
        Deque<Integer> stack = new ArrayDeque<>();   // increasing stack of indices
        int maxArea = 0;
        int n = heights.length;

        for (int i = 0; i <= n; i++) {
            // Use height 0 as a sentinel at the end to flush any remaining bars
            int currentHeight = (i == n) ? 0 : heights[i];

            while (!stack.isEmpty() && heights[stack.peek()] >= currentHeight) {
                int height = heights[stack.pop()];
                // width spans from the new stack top (exclusive) to i (exclusive)
                int width = stack.isEmpty() ? i : i - stack.peek() - 1;
                maxArea = Math.max(maxArea, height * width);
            }
            stack.push(i);
        }
        return maxArea;
    }

    public static void main(String[] args) {
        int[] heights = {2, 1, 5, 6, 2, 3};
        System.out.println(largestRectangleArea(heights));
    }
}
// OUTPUT:
// 10`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why is a height-0 sentinel added at the end of the loop?</td><td>It forces the stack to flush every remaining bar, since a 0-height "bar" is guaranteed to be shorter than anything real - without it, bars still on the stack at the end would never have their rectangle computed</td></tr>
<tr class='text-center'><td>How is the width calculated when a bar is popped?</td><td>It spans from the CURRENT new stack top (exclusive, since that bar is shorter and bounds the rectangle) to the current index i (exclusive, the new shorter bar that triggered the pop)</td></tr>
<tr class='text-center'><td>What's the relationship between this problem and Maximal Rectangle in a binary matrix?</td><td>Maximal Rectangle reduces to running Largest Rectangle in Histogram once per row, treating each row as a histogram of consecutive 1s stacked from previous rows - O(rows &times; cols) overall</td></tr>
</table>`
        }
    ]
};
