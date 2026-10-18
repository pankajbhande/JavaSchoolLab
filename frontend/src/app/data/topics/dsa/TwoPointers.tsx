import { Topic } from '../../coreJava';

export const twoPointers: Topic = {
    id: 'dsa-arrays-two-pointers',
    name: 'Two Pointers',
    beginner: [
        {
            content: `<h4>What is the Two Pointers Technique?</h4>
Two pointers walk through data using two indices instead of one, usually moving toward each other (from both ends) or in the same direction at different speeds - turning an O(n&sup2;) nested-loop scan into O(n).
<ul>
<li><b>Opposite ends:</b> <code>left = 0</code>, <code>right = n-1</code>, move them toward the middle based on a condition. Requires the array to be <b>sorted</b> for most classic uses (like Two Sum on a sorted array, or reversing an array).</li>
<li><b>Same direction:</b> both pointers start at 0 and move forward at different rates (e.g. fast/slow pointer, or a read/write pointer for in-place removal).</li>
</ul>`,
            codeExamples: [
                `package com.javaschoollab;

public class TwoSumSortedDemo {

    // Array is SORTED. Find two numbers that add up to target.
    static int[] twoSumSorted(int[] arr, int target) {
        int left = 0, right = arr.length - 1;

        while (left < right) {
            int sum = arr[left] + arr[right];
            if (sum == target) {
                return new int[]{left, right};
            } else if (sum < target) {
                left++;          // sum too small, need a bigger value -> move left up
            } else {
                right--;         // sum too big, need a smaller value -> move right down
            }
        }
        return new int[]{-1, -1};
    }

    public static void main(String[] args) {
        int[] arr = {1, 3, 5, 7, 9, 11};
        System.out.println(java.util.Arrays.toString(twoSumSorted(arr, 12)));
    }
}
// OUTPUT:
// [1, 4]
// (arr[1]=3 + arr[4]=9 = 12)`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Removing Duplicates In-Place - Same-Direction Two Pointers</h3>
A "read pointer" (<code>i</code>) scans every element while a "write pointer" (<code>writeIndex</code>) only advances when a genuinely new value is found - this compacts a sorted array to its unique elements in O(n) time and O(1) extra space, no auxiliary array needed.`,
            codeExamples: [
                `package com.javaschoollab;

public class RemoveDuplicatesDemo {

    // arr must be sorted. Returns the new length; the first 'newLength'
    // slots of arr hold the unique elements in order.
    static int removeDuplicates(int[] arr) {
        if (arr.length == 0) return 0;

        int writeIndex = 1;   // arr[0] is always kept
        for (int i = 1; i < arr.length; i++) {
            if (arr[i] != arr[writeIndex - 1]) {
                arr[writeIndex] = arr[i];
                writeIndex++;
            }
        }
        return writeIndex;
    }

    public static void main(String[] args) {
        int[] arr = {1, 1, 2, 2, 2, 3, 4, 4, 5};
        int newLength = removeDuplicates(arr);

        System.out.println("New length: " + newLength);
        System.out.println("Unique part: " +
            java.util.Arrays.toString(java.util.Arrays.copyOf(arr, newLength)));
    }
}
// OUTPUT:
// New length: 5
// Unique part: [1, 2, 3, 4, 5]`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why does the opposite-ends two-pointer Two Sum require a sorted array?</td><td>The decision to move left up or right down relies on knowing whether the current sum is too small or too large relative to sorted order - it breaks on unsorted data</td></tr>
<tr class='text-center'><td>What's the time complexity of the opposite-ends technique?</td><td>O(n) - each pointer moves at most n times total, combined, before they meet</td></tr>
<tr class='text-center'><td>How is this different from sliding window?</td><td>Sliding window pointers move in the SAME direction over a contiguous range; two pointers can move toward each other from opposite ends, which sliding window never does</td></tr>
</table>`
        }
    ]
};
