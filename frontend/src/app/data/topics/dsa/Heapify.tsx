import { Topic } from '../../coreJava';

export const heapify: Topic = {
    id: 'dsa-heap-heapify',
    name: 'Heapify',
    beginner: [
        {
            content: `<h4>What Does Heapify Do?</h4>
Heapify restores the heap property at ONE node, ASSUMING both its children are already valid heaps - it "sinks" the node down, swapping with its smaller (min-heap) or larger (max-heap) child, until the property holds locally. This single-node operation is the building block for both building a whole heap and for extraction.`,
            codeExamples: [
                `package com.javaschoollab;

public class HeapifyDemo {

    // Sinks arr[i] down within a heap of size 'heapSize', assuming
    // both children subtrees are ALREADY valid min-heaps
    static void heapify(int[] arr, int heapSize, int i) {
        int smallest = i;
        int left = 2 * i + 1, right = 2 * i + 2;

        if (left < heapSize && arr[left] < arr[smallest]) smallest = left;
        if (right < heapSize && arr[right] < arr[smallest]) smallest = right;

        if (smallest != i) {
            int temp = arr[i]; arr[i] = arr[smallest]; arr[smallest] = temp;
            heapify(arr, heapSize, smallest);   // continue sinking from the new position
        }
    }

    public static void main(String[] args) {
        // arr[1..2] are ALREADY valid heaps; only arr[0]=10 might violate the property
        int[] arr = {10, 3, 5};
        heapify(arr, arr.length, 0);
        System.out.println(java.util.Arrays.toString(arr));
    }
}
// OUTPUT:
// [3, 10, 5]`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why Heapify's Precondition Matters - and What Happens If It's Violated</h3>
Heapify ONLY works correctly if both children subtrees are ALREADY valid heaps before it's called on the parent. Calling heapify TOP-DOWN (root first) on an arbitrary unsorted array does NOT correctly build a heap, because the precondition is violated - this is precisely why "build heap" processes nodes BOTTOM-UP (from the last non-leaf node backward), ensuring every heapify call's precondition is satisfied by the time it runs.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.Arrays;

public class HeapifyPreconditionDemo {

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

    public static void main(String[] args) {
        int[] arr = {5, 3, 8, 1, 9, 2};

        // WRONG: heapify top-down on an unsorted array - children aren't valid heaps yet
        int[] wrong = arr.clone();
        heapify(wrong, wrong.length, 0);
        System.out.println("Wrong (top-down only): " + Arrays.toString(wrong) + " - NOT a valid heap");

        // RIGHT: heapify bottom-up, starting from the last non-leaf node
        int[] right = arr.clone();
        for (int i = right.length / 2 - 1; i >= 0; i--) {
            heapify(right, right.length, i);
        }
        System.out.println("Right (bottom-up)     : " + Arrays.toString(right) + " - valid min-heap");
    }
}
// OUTPUT:
// Wrong (top-down only): [3, 5, 2, 1, 9, 8] - NOT a valid heap
// Right (bottom-up)     : [1, 3, 2, 5, 9, 8] - valid min-heap`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What's the time complexity of a SINGLE heapify call?</td><td>O(log n) - bounded by the height of the subtree it operates on, since it sinks at most that far</td></tr>
<tr class='text-center'><td>Why must "build heap" call heapify from the LAST non-leaf node BACKWARD to the root?</td><td>Heapify's correctness depends on both children already being valid heaps - processing bottom-up guarantees that precondition is always satisfied by the time a given node's heapify call runs</td></tr>
<tr class='text-center'><td>What's the index of the last non-leaf node in a 0-indexed array of size n?</td><td>n/2 - 1 (integer division) - every index beyond that has no children, since 2*(n/2) exceeds the array bounds</td></tr>
</table>`
        }
    ]
};
