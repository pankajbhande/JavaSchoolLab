import { Topic } from '../../coreJava';

export const kadaneDpFramework: Topic = {
    id: 'dsa-dynamic-programming-kadane-dp',
    name: 'Kadane (DP)',
    beginner: [
        {
            content: `<h4>Kadane's as a Formal DP Recurrence</h4>
Kadane's Algorithm IS dynamic programming, just usually taught without the DP framing: define <code>dp[i]</code> = the maximum subarray sum ENDING exactly at index i. The recurrence <code>dp[i] = max(arr[i], dp[i-1] + arr[i])</code> is the same "extend or restart" idea, just written as an explicit DP array instead of two rolling variables.`,
            codeExamples: [
                `package com.javaschoollab;

public class KadaneAsDpDemo {

    static int maxSubarraySum(int[] arr) {
        int n = arr.length;
        int[] dp = new int[n];
        dp[0] = arr[0];
        int maxSum = dp[0];

        for (int i = 1; i < n; i++) {
            dp[i] = Math.max(arr[i], dp[i - 1] + arr[i]);   // extend previous, or restart here
            maxSum = Math.max(maxSum, dp[i]);
        }
        return maxSum;
    }

    public static void main(String[] args) {
        int[] arr = {-2, 1, -3, 4, -1, 2, 1, -5, 4};
        System.out.println(maxSubarraySum(arr));
    }
}
// OUTPUT:
// 6`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Maximum PRODUCT Subarray - Tracking Two DP States</h3>
Products behave differently from sums: a negative number can turn the SMALLEST product into the LARGEST. This means the DP state must track BOTH the max and min product ending at each index, since a future negative multiplier could flip the current minimum into the new maximum.`,
            codeExamples: [
                `package com.javaschoollab;

public class MaxProductSubarrayDemo {

    static int maxProduct(int[] arr) {
        int maxSoFar = arr[0], minSoFar = arr[0], result = arr[0];

        for (int i = 1; i < arr.length; i++) {
            int num = arr[i];

            // If num is negative, max and min SWAP roles when multiplied
            if (num < 0) {
                int temp = maxSoFar;
                maxSoFar = minSoFar;
                minSoFar = temp;
            }

            maxSoFar = Math.max(num, maxSoFar * num);
            minSoFar = Math.min(num, minSoFar * num);

            result = Math.max(result, maxSoFar);
        }
        return result;
    }

    public static void main(String[] args) {
        int[] arr = {2, 3, -2, 4};
        System.out.println(maxProduct(arr));

        int[] arr2 = {-2, 3, -4};
        System.out.println(maxProduct(arr2));   // two negatives cancel out
    }
}
// OUTPUT:
// 6
// 24`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why does the standard "extend or restart" recurrence for SUM not directly work for PRODUCT?</td><td>Sum is monotonic in a simple sense (adding more never flips a comparison's direction based on sign alone); multiplying by a negative number can turn the smallest value into the largest, so tracking only a "running maximum" misses cases where the running MINIMUM becomes relevant</td></tr>
<tr class='text-center'><td>Why swap maxSoFar and minSoFar when the current number is negative?</td><td>Multiplying the previous minimum (likely a large negative product) by a new negative number produces a large POSITIVE product - by swapping first, the same max()/min() update lines correctly handle both cases without duplicated logic</td></tr>
<tr class='text-center'><td>What's the space complexity of both the sum and product versions?</td><td>Both can be done in O(1) space using rolling variables instead of a full dp[] array, since each step only depends on the immediately preceding state</td></tr>
</table>`
        }
    ]
};
