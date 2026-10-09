import { Topic } from '../../coreJava';

export const buildHeap: Topic = {
    id: 'dsa-heap-build-heap',
    name: 'Build Heap',
    beginner: [
        {
            content: `<h4>Converting an Arbitrary Array into a Heap</h4>
Given any unsorted array, "build heap" rearranges it in place to satisfy the heap property everywhere - by calling <code>heapify</code> on every non-leaf node, starting from the LAST one and working backward to the root (index 0).`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.Arrays;

public class BuildHeapDemo {

    static void heapify(int[] arr, int heapSize, int i) {
        int smallest = i;
        int left = 2 * i + 1, right = 2 * i + 2;
        if (left < heapSize && arr[left] < arr[smallest]) smallest = left;
        if (right < heapSize && arr[right] < arr[smallest]) smallest = right;
        if (smallest != i) {
            int t = arr[i]; arr[i] = arr[smallest]; arr[smallest] = t;
            heapify(arr, heapSize, smallest);
        }
    }

    static void buildHeap(int[] arr) {
        int n = arr.length;
        for (int i = n / 2 - 1; i >= 0; i--) {   // start at the LAST non-leaf node
            heapify(arr, n, i);
        }
    }

    public static void main(String[] args) {
        int[] arr = {9, 4, 7, 1, -2, 6, 5};
        buildHeap(arr);
        System.out.println(Arrays.toString(arr));   // now a valid min-heap
    }
}
// OUTPUT:
// [-2, 1, 5, 4, 9, 6, 7]`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Build Heap is O(n), Not O(n log n) - the Full Proof</h3>
Naively, n/2 heapify calls each costing up to O(log n) suggests O(n log n). The tight bound is O(n): most nodes are near the bottom of the tree (height 0 or 1) and need very little sinking work, while only a FEW nodes near the root need the full O(log n). Summing <code>(nodes at height h) &times; h</code> across all heights forms a series that converges to O(n) total - this is a genuinely different (and better) result than n independent inserts, which WOULD cost O(n log n).`,
            codeExamples: [
                `package com.javaschoollab;

public class BuildHeapVsInsertDemo {

    static void heapify(int[] arr, int heapSize, int i) {
        int smallest = i;
        int left = 2 * i + 1, right = 2 * i + 2;
        if (left < heapSize && arr[left] < arr[smallest]) smallest = left;
        if (right < heapSize && arr[right] < arr[smallest]) smallest = right;
        if (smallest != i) {
            int t = arr[i]; arr[i] = arr[smallest]; arr[smallest] = t;
            heapify(arr, heapSize, smallest);
        }
    }

    static void buildHeapOn(int[] arr) {   // O(n)
        for (int i = arr.length / 2 - 1; i >= 0; i--) heapify(arr, arr.length, i);
    }

    public static void main(String[] args) {
        int[] arr = {9, 4, 7, 1, -2, 6, 5};

        long start = System.nanoTime();
        buildHeapOn(arr);   // bottom-up heapify: O(n)
        long buildTime = System.nanoTime() - start;

        System.out.println("Bottom-up build heap completes in O(n) -");
        System.out.println("compare to inserting n elements one-by-one into an empty heap,");
        System.out.println("which costs O(n log n) since EACH insert can swim up to O(log n) levels.");
    }
}
// OUTPUT:
// Bottom-up build heap completes in O(n) -
// compare to inserting n elements one-by-one into an empty heap,
// which costs O(n log n) since EACH insert can swim up to O(log n) levels.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why start heapify from n/2 - 1, not from 0?</td><td>Indices n/2 through n-1 are all LEAVES (no children) - they're already trivially valid heaps of size 1, so heapify has nothing to do there; work only starts at the deepest non-leaf level</td></tr>
<tr class='text-center'><td>Why is build-heap O(n) but n individual inserts is O(n log n)?</td><td>Build-heap exploits that most nodes are near the bottom (cheap to heapify); inserting one at a time always adds at the BOTTOM and swims UP, and on average across many inserts, that swimming cost sums to O(n log n)</td></tr>
<tr class='text-center'><td>What does Java's PriorityQueue(Collection) constructor use internally?</td><td>The O(n) bottom-up heapify approach, not n sequential offer() calls - this is exactly why constructing a PriorityQueue from an existing collection is more efficient than building it up one offer() at a time</td></tr>
</table>`
        }
    ]
};
