import { Topic } from '../../coreJava';

export const quickSortTopic: Topic = {
    id: 'dsa-sorting-quick-sort',
    name: 'Quick Sort',
    beginner: [
        {
            content: `<h4>Quick Sort - O(n log n) Average, In-Place</h4>
Picks a PIVOT, partitions the array so everything smaller is to its left and everything bigger is to its right, then recursively sorts each side. Unlike Merge Sort, partitioning happens IN-PLACE - no auxiliary array needed for the main work.
<ul>
<li><b>Average case O(n log n)</b>, but <b>worst case O(n&sup2;)</b> when the pivot repeatedly splits badly (e.g. always picking the smallest/largest element, as happens on an already-sorted array with a naive "always pick the last element" pivot rule).</li>
<li><b>In-place</b> - O(log n) extra space for the recursion stack, no auxiliary array.</li>
<li><b>Not stable</b> - partitioning can reorder equal elements.</li>
</ul>`,
            codeExamples: [
                `package com.javaschoollab;

public class QuickSortDemo {

    static void quickSort(int[] arr, int low, int high) {
        if (low < high) {
            int pivotIndex = partition(arr, low, high);
            quickSort(arr, low, pivotIndex - 1);
            quickSort(arr, pivotIndex + 1, high);
        }
    }

    // Lomuto partition scheme: last element as pivot
    static int partition(int[] arr, int low, int high) {
        int pivot = arr[high];
        int i = low - 1;   // boundary of "elements known to be < pivot"

        for (int j = low; j < high; j++) {
            if (arr[j] < pivot) {
                i++;
                swap(arr, i, j);
            }
        }
        swap(arr, i + 1, high);   // place the pivot in its final sorted position
        return i + 1;
    }

    static void swap(int[] arr, int i, int j) {
        int temp = arr[i]; arr[i] = arr[j]; arr[j] = temp;
    }

    public static void main(String[] args) {
        int[] arr = {10, 7, 8, 9, 1, 5};
        quickSort(arr, 0, arr.length - 1);
        System.out.println(java.util.Arrays.toString(arr));
    }
}
// OUTPUT:
// [1, 5, 7, 8, 9, 10]`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Randomized Pivot - Avoiding the O(n&sup2;) Worst Case in Practice</h3>
Always picking the LAST element as pivot makes an already-sorted (or reverse-sorted) array hit the O(n&sup2;) worst case every single time - a predictable, exploitable weakness. Picking a RANDOM pivot (swap it with the last element, then run the same partition) makes the worst case astronomically unlikely for any fixed input, since an adversary can't predict which element will be chosen.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.Random;

public class RandomizedQuickSortDemo {

    static final Random RANDOM = new Random();

    static void quickSort(int[] arr, int low, int high) {
        if (low < high) {
            int pivotIndex = randomizedPartition(arr, low, high);
            quickSort(arr, low, pivotIndex - 1);
            quickSort(arr, pivotIndex + 1, high);
        }
    }

    static int randomizedPartition(int[] arr, int low, int high) {
        int randomIndex = low + RANDOM.nextInt(high - low + 1);
        swap(arr, randomIndex, high);   // move random pick to the pivot slot
        return partition(arr, low, high);
    }

    static int partition(int[] arr, int low, int high) {
        int pivot = arr[high];
        int i = low - 1;
        for (int j = low; j < high; j++) {
            if (arr[j] < pivot) {
                i++;
                swap(arr, i, j);
            }
        }
        swap(arr, i + 1, high);
        return i + 1;
    }

    static void swap(int[] arr, int i, int j) {
        int temp = arr[i]; arr[i] = arr[j]; arr[j] = temp;
    }

    public static void main(String[] args) {
        // Already-sorted input: worst case for a naive last-element pivot,
        // but randomization keeps this fast on average.
        int[] arr = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
        quickSort(arr, 0, arr.length - 1);
        System.out.println(java.util.Arrays.toString(arr));
    }
}
// OUTPUT:
// [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What input causes Quick Sort's O(n&sup2;) worst case with a naive pivot choice?</td><td>An already-sorted or reverse-sorted array, when the pivot is always the first or last element - every partition splits maximally unevenly (n-1 vs 0), degenerating recursion depth to O(n)</td></tr>
<tr class='text-center'><td>Why does Quick Sort typically outperform Merge Sort in practice despite a worse worst case?</td><td>Better cache locality (in-place partitioning touches memory sequentially) and lower constant factors (no auxiliary array allocation/copying) - average case is the same O(n log n), but with smaller hidden constants</td></tr>
<tr class='text-center'><td>How does 3-way (Dutch flag) partitioning improve Quick Sort for arrays with many duplicates?</td><td>Standard partitioning treats equal-to-pivot elements as either "less" or "greater", wasting recursive work re-sorting them; 3-way partitioning groups all pivot-equal elements together in one pass, so they're excluded from BOTH recursive calls entirely</td></tr>
</table>`
        }
    ]
};
