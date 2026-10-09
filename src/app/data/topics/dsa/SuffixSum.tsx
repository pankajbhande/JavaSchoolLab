import { Topic } from '../../coreJava';

export const suffixSum: Topic = {
    id: 'dsa-arrays-suffix-sum',
    name: 'Suffix Sum',
    beginner: [
        {
            content: `<h4>What is a Suffix Sum?</h4>
The mirror image of a prefix sum: <code>suf[i] = arr[i] + arr[i+1] + ... + arr[n-1]</code>, the total from index <code>i</code> to the end. Built by scanning <b>right to left</b>.<br><br>
Useful whenever a problem needs "everything to the right of index i" alongside "everything to the left" - a classic pairing is <b>Product of Array Except Self</b>, where <code>result[i] = prefixProduct(0..i-1) * suffixProduct(i+1..n-1)</code>.`,
            codeExamples: [
                `package com.javaschoollab;

public class SuffixSumDemo {

    static int[] buildSuffix(int[] arr) {
        int n = arr.length;
        int[] suf = new int[n];
        suf[n - 1] = arr[n - 1];
        for (int i = n - 2; i >= 0; i--) {
            suf[i] = suf[i + 1] + arr[i];
        }
        return suf;
    }

    public static void main(String[] args) {
        int[] arr = {2, 4, 6, 8, 10};
        int[] suf = buildSuffix(arr);

        System.out.println("Total from index 2 to end: " + suf[2]); // 6+8+10
        System.out.println("Total from index 0 to end: " + suf[0]); // whole array
    }
}
// OUTPUT:
// Total from index 2 to end: 24
// Total from index 0 to end: 30`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Product of Array Except Self - Prefix + Suffix Together</h3>
Compute, for every index i, the product of all elements except <code>arr[i]</code> - <b>without using division</b> and in O(n) time. Combine a left-to-right prefix product pass with a right-to-left suffix product pass.`,
            codeExamples: [
                `package com.javaschoollab;

public class ProductExceptSelfDemo {

    static int[] productExceptSelf(int[] nums) {
        int n = nums.length;
        int[] result = new int[n];

        // Pass 1: result[i] = product of everything to the LEFT of i
        result[0] = 1;
        for (int i = 1; i < n; i++) {
            result[i] = result[i - 1] * nums[i - 1];
        }

        // Pass 2: multiply in everything to the RIGHT of i, using a running suffix product
        int rightProduct = 1;
        for (int i = n - 1; i >= 0; i--) {
            result[i] *= rightProduct;
            rightProduct *= nums[i];
        }
        return result;
    }

    public static void main(String[] args) {
        int[] nums = {1, 2, 3, 4};
        System.out.println(java.util.Arrays.toString(productExceptSelf(nums)));
    }
}
// OUTPUT:
// [24, 12, 8, 6]
// (index 0: 2*3*4=24, index 1: 1*3*4=12, index 2: 1*2*4=8, index 3: 1*2*3=6)`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why avoid division in Product of Array Except Self?</td><td>Division breaks if any element is zero, and the problem is often explicitly asked without division as a constraint</td></tr>
<tr class='text-center'><td>Can suffix sum be computed with only O(1) extra space (excluding the output)?</td><td>Yes - fold the suffix pass into the output array itself using a single running variable, as shown in the product-except-self example</td></tr>
</table>`
        }
    ]
};
