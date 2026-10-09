import { Topic } from '../../coreJava';

export const kadanesAlgorithm: Topic = {
    id: 'dsa-arrays-kadane-s-algorithm',
    name: "Kadane's Algorithm",
    beginner: [
        {
            content: `<h4>Maximum Subarray Sum in O(n)</h4>
Kadane's Algorithm finds the maximum-sum contiguous subarray in a single pass. The insight: at each index, a running sum either <b>extends</b> the previous subarray or <b>restarts</b> from the current element - whichever gives a bigger sum.
<ul>
<li><code>currentSum = Math.max(arr[i], currentSum + arr[i])</code></li>
<li><code>maxSum = Math.max(maxSum, currentSum)</code></li>
</ul>
If <code>currentSum</code> ever drops below <code>arr[i]</code> itself, it's better to abandon the old subarray and start fresh at <code>i</code>.`,
            codeExamples: [
                `package com.javaschoollab;

public class KadaneDemo {

    static int maxSubarraySum(int[] arr) {
        int currentSum = arr[0];
        int maxSum = arr[0];

        for (int i = 1; i < arr.length; i++) {
            currentSum = Math.max(arr[i], currentSum + arr[i]);
            maxSum = Math.max(maxSum, currentSum);
        }
        return maxSum;
    }

    public static void main(String[] args) {
        int[] arr = {-2, 1, -3, 4, -1, 2, 1, -5, 4};
        System.out.println(maxSubarraySum(arr));
    }
}
// OUTPUT:
// 6
// (subarray [4, -1, 2, 1] sums to 6)`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Tracking the Actual Subarray, and the All-Negative Edge Case</h3>
Interviewers often ask for the subarray's START and END indices, not just the sum - track them whenever a "restart" happens. Also watch the all-negative-numbers case: the algorithm still works correctly and returns the least-negative single element, as long as you seed <code>maxSum</code> with <code>arr[0]</code> rather than 0.`,
            codeExamples: [
                `package com.javaschoollab;

public class KadaneWithIndicesDemo {

    static int[] maxSubarrayWithBounds(int[] arr) {
        int currentSum = arr[0];
        int maxSum = arr[0];
        int start = 0, end = 0, tempStart = 0;

        for (int i = 1; i < arr.length; i++) {
            if (arr[i] > currentSum + arr[i]) {
                currentSum = arr[i];
                tempStart = i;              // restarting here
            } else {
                currentSum += arr[i];       // extending the previous run
            }

            if (currentSum > maxSum) {
                maxSum = currentSum;
                start = tempStart;
                end = i;
            }
        }
        return new int[]{maxSum, start, end};
    }

    public static void main(String[] args) {
        int[] allNegative = {-8, -3, -6, -2, -5, -4};
        int[] result = maxSubarrayWithBounds(allNegative);
        System.out.println("Max sum: " + result[0] + ", from index " + result[1] + " to " + result[2]);
    }
}
// OUTPUT:
// Max sum: -2, from index 3 to 3
// (the single least-negative element, -2, wins when everything is negative)`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is Kadane's Algorithm's time and space complexity?</td><td>O(n) time, O(1) extra space - a single pass with two running variables</td></tr>
<tr class='text-center'><td>How does it handle an array of all negative numbers?</td><td>Correctly returns the maximum (least negative) single element, as long as maxSum is seeded with arr[0], not 0</td></tr>
<tr class='text-center'><td>How would you adapt Kadane's for maximum PRODUCT subarray?</td><td>Track both a running max AND running min product at each step, since multiplying by a negative number can flip the smallest product into the largest</td></tr>
</table>`
        }
    ]
};
