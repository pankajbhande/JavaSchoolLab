import { Topic } from '../../coreJava';

export const insertionSort: Topic = {
    id: 'dsa-sorting-insertion-sort',
    name: 'Insertion Sort',
    beginner: [
        {
            content: `<h4>Insertion Sort - O(n&sup2;) Worst, O(n) Best</h4>
Builds the sorted portion one element at a time, like sorting playing cards in your hand: take the next element and shift it backward past everything bigger, until it lands in its correct spot.
<ul>
<li><b>Stable</b> - equal elements never jump past each other, since shifting stops at the first element that's NOT bigger.</li>
<li><b>Adaptive</b> - O(n) on an already-sorted (or nearly-sorted) array, since the inner shift loop barely runs.</li>
<li><b>In-place</b> - O(1) extra space.</li>
</ul>`,
            codeExamples: [
                `package com.javaschoollab;

public class InsertionSortDemo {

    static void insertionSort(int[] arr) {
        for (int i = 1; i < arr.length; i++) {
            int key = arr[i];
            int j = i - 1;

            // Shift everything bigger than 'key' one position to the right
            while (j >= 0 && arr[j] > key) {
                arr[j + 1] = arr[j];
                j--;
            }
            arr[j + 1] = key;   // insert key into its correct position
        }
    }

    public static void main(String[] args) {
        int[] arr = {12, 11, 13, 5, 6};
        insertionSort(arr);
        System.out.println(java.util.Arrays.toString(arr));
    }
}
// OUTPUT:
// [5, 6, 11, 12, 13]`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why Insertion Sort Wins for Small or Nearly-Sorted Arrays</h3>
Its best case is O(n) - if the array is already sorted, the inner <code>while</code> loop never executes, since <code>arr[j] > key</code> is immediately false. This is exactly why production sorts like Java's <code>Arrays.sort()</code> (Dual-Pivot Quicksort for primitives, TimSort for objects) switch to insertion sort for small subarrays (typically under ~47 elements) - the constant-factor overhead of Quicksort/Mergesort isn't worth it at small sizes, and insertion sort's adaptiveness helps with the partially-sorted runs those algorithms produce.`,
            codeExamples: [
                `package com.javaschoollab;

public class HybridSortDemo {

    static final int INSERTION_SORT_THRESHOLD = 10;

    // A simplified illustration of what TimSort/Dual-Pivot Quicksort do internally:
    // fall back to insertion sort once the subarray is small enough.
    static void hybridSort(int[] arr, int low, int high) {
        if (high - low < INSERTION_SORT_THRESHOLD) {
            insertionSort(arr, low, high);
            return;
        }
        int mid = low + (high - low) / 2;
        hybridSort(arr, low, mid);
        hybridSort(arr, mid + 1, high);
        merge(arr, low, mid, high);
    }

    static void insertionSort(int[] arr, int low, int high) {
        for (int i = low + 1; i <= high; i++) {
            int key = arr[i];
            int j = i - 1;
            while (j >= low && arr[j] > key) {
                arr[j + 1] = arr[j];
                j--;
            }
            arr[j + 1] = key;
        }
    }

    static void merge(int[] arr, int low, int mid, int high) {
        int[] temp = new int[high - low + 1];
        int i = low, j = mid + 1, k = 0;
        while (i <= mid && j <= high) temp[k++] = (arr[i] <= arr[j]) ? arr[i++] : arr[j++];
        while (i <= mid) temp[k++] = arr[i++];
        while (j <= high) temp[k++] = arr[j++];
        System.arraycopy(temp, 0, arr, low, temp.length);
    }

    public static void main(String[] args) {
        int[] arr = {9, 3, 7, 1, 8, 2, 6, 4, 5, 0, 11, 10};
        hybridSort(arr, 0, arr.length - 1);
        System.out.println(java.util.Arrays.toString(arr));
    }
}
// OUTPUT:
// [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why is insertion sort called "adaptive"?</td><td>Its running time scales with how UNSORTED the input already is - a nearly-sorted array is close to O(n), unlike selection sort which always does the same O(n^2) work regardless of input order</td></tr>
<tr class='text-center'><td>Why is arr[j] > key (strict) rather than >= the correct condition for stability?</td><td>Stopping the shift as soon as an equal element is found (arr[j] > key is false when equal) means key is inserted AFTER any equal elements already placed, preserving their original relative order</td></tr>
<tr class='text-center'><td>Why do production sort implementations switch to insertion sort for small subarrays?</td><td>Quicksort/Mergesort's overhead (recursive calls, partitioning, merging) isn't worth it below a certain size threshold (commonly ~16-47 elements) where insertion sort's simplicity and cache-friendliness make it faster in practice despite its worse asymptotic complexity</td></tr>
</table>`
        }
    ]
};
