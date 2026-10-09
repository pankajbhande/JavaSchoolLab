import { Topic } from '../../coreJava';

export const lowerBound: Topic = {
    id: 'dsa-searching-lower-bound',
    name: 'Lower Bound',
    beginner: [
        {
            content: `<h4>What is Lower Bound?</h4>
The lower bound of a target in a sorted array is the index of the FIRST element that is &ge; target - even if the target itself isn't present, it's where it WOULD be inserted to keep the array sorted. A small tweak to binary search: instead of stopping on an exact match, keep narrowing toward the leftmost valid position.`,
            codeExamples: [
                `package com.javaschoollab;

public class LowerBoundDemo {

    static int lowerBound(int[] arr, int target) {
        int low = 0, high = arr.length;   // note: high starts at length, not length-1

        while (low < high) {
            int mid = low + (high - low) / 2;
            if (arr[mid] < target) {
                low = mid + 1;
            } else {
                high = mid;   // arr[mid] >= target - it COULD be the answer, don't exclude it
            }
        }
        return low;   // first index where arr[index] >= target
    }

    public static void main(String[] args) {
        int[] arr = {1, 3, 3, 5, 7, 9};
        System.out.println(lowerBound(arr, 3));   // first index where value >= 3
        System.out.println(lowerBound(arr, 4));   // 4 not present - insertion point
        System.out.println(lowerBound(arr, 10));  // bigger than everything
    }
}
// OUTPUT:
// 1
// 3
// 6`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Java's Built-in Equivalent - Collections.binarySearch and Arrays</h3>
Java's <code>Arrays.binarySearch</code> only guarantees finding SOME matching index when duplicates exist, not the first one - it does NOT give lower-bound semantics. When you need "the first occurrence" or "the insertion point", write the lower-bound loop explicitly (as above), or use a <code>TreeSet</code>/<code>TreeMap</code>'s <code>ceiling()</code> method if the data structure allows it.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.Arrays;
import java.util.TreeSet;

public class LowerBoundComparisonDemo {
    public static void main(String[] args) {
        int[] arr = {1, 3, 3, 3, 5, 7};

        // Arrays.binarySearch gives NO guarantee about WHICH occurrence of 3 it finds
        int someIndex = Arrays.binarySearch(arr, 3);
        System.out.println("Arrays.binarySearch found index: " + someIndex + " (unspecified WHICH 3)");

        // A TreeSet's ceiling() gives the lower-bound VALUE directly
        TreeSet<Integer> set = new TreeSet<>();
        for (int n : arr) set.add(n);
        System.out.println("ceiling(3) = " + set.ceiling(3));   // smallest element >= 3
        System.out.println("ceiling(4) = " + set.ceiling(4));   // smallest element >= 4
    }
}
// OUTPUT (exact index from binarySearch may vary by JDK implementation):
// Arrays.binarySearch found index: 2 (unspecified WHICH 3)
// ceiling(3) = 3
// ceiling(4) = 5`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why does the lower-bound search start with high = arr.length, not arr.length - 1?</td><td>The answer can legitimately be "insert at the very end" (target is bigger than every element), which is index arr.length - the loop's invariant needs that value to be a reachable result</td></tr>
<tr class='text-center'><td>What does lowerBound(target) equal when target is not present in the array?</td><td>The index where target WOULD be inserted to keep the array sorted - exactly what a "TreeSet.ceiling()"-style operation returns as an index</td></tr>
<tr class='text-center'><td>How is lower bound different from finding the FIRST occurrence of a duplicate value?</td><td>They're the same thing when target IS present - lower bound of an existing value always lands on its first occurrence, since all earlier equal-or-smaller values get excluded first</td></tr>
</table>`
        }
    ]
};
