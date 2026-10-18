import { Topic } from '../../coreJava';

export const arrayRotation: Topic = {
    id: 'dsa-arrays-array-rotation',
    name: 'Array Rotation',
    beginner: [
        {
            content: `<h4>Rotating an Array by K Positions</h4>
Rotating right by <code>k</code> moves every element <code>k</code> positions forward, wrapping around at the end. The naive approach shifts one element at a time, k times - O(n&middot;k). A much better approach uses O(n) extra space with a temp array, or O(1) extra space with the <b>reversal trick</b>.`,
            codeExamples: [
                `package com.javaschoollab;

public class RotateWithExtraSpaceDemo {

    // O(n) time, O(n) space
    static void rotateRight(int[] arr, int k) {
        int n = arr.length;
        k = k % n;   // rotating by n is a no-op
        int[] rotated = new int[n];

        for (int i = 0; i < n; i++) {
            rotated[(i + k) % n] = arr[i];
        }
        System.arraycopy(rotated, 0, arr, 0, n);
    }

    public static void main(String[] args) {
        int[] arr = {1, 2, 3, 4, 5, 6, 7};
        rotateRight(arr, 3);
        System.out.println(java.util.Arrays.toString(arr));
    }
}
// OUTPUT:
// [5, 6, 7, 1, 2, 3, 4]`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>The Reversal Trick - O(1) Extra Space</h3>
Rotating right by k is equivalent to: reverse the WHOLE array, then reverse the first k elements, then reverse the remaining n-k elements. Three reversals, each O(n), still O(n) total time but with NO extra array.`,
            codeExamples: [
                `package com.javaschoollab;

public class RotateInPlaceDemo {

    static void rotateRight(int[] arr, int k) {
        int n = arr.length;
        k = k % n;

        reverse(arr, 0, n - 1);       // reverse everything
        reverse(arr, 0, k - 1);       // reverse the first k (now correctly placed values)
        reverse(arr, k, n - 1);       // reverse the rest
    }

    static void reverse(int[] arr, int left, int right) {
        while (left < right) {
            int temp = arr[left];
            arr[left] = arr[right];
            arr[right] = temp;
            left++;
            right--;
        }
    }

    public static void main(String[] args) {
        int[] arr = {1, 2, 3, 4, 5, 6, 7};
        rotateRight(arr, 3);
        System.out.println(java.util.Arrays.toString(arr));
    }
}
// OUTPUT:
// [5, 6, 7, 1, 2, 3, 4]`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why take k % n before rotating?</td><td>Rotating by exactly n positions returns the array to its original order, so any k larger than n has redundant full rotations that can be stripped off</td></tr>
<tr class='text-center'><td>What's the time/space trade-off between the extra-array and reversal approaches?</td><td>Both are O(n) time; the extra-array approach uses O(n) space, the reversal trick uses O(1) extra space at the cost of three passes instead of one</td></tr>
<tr class='text-center'><td>How is left rotation different from right rotation?</td><td>Left rotation by k is the same as right rotation by (n - k); with the reversal trick, just reverse the first k elements, then the rest, then the whole array (order of the three reversals flips)</td></tr>
</table>`
        }
    ]
};
