import { Topic } from '../../coreJava';

export const heapSortViaPriorityQueue: Topic = {
    id: 'dsa-heap-heap-sort',
    name: 'Heap Sort',
    beginner: [
        {
            content: `<h4>Sorting by Repeated Extraction</h4>
The conceptual core of Heap Sort: put everything into a heap, then repeatedly extract the minimum (or maximum) - since each extraction always removes the current smallest remaining element, the extraction ORDER is automatically sorted. A <code>PriorityQueue</code> makes this trivial to express, though the in-place array version (covered under Sorting) avoids its O(n) extra space.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.PriorityQueue;

public class HeapSortWithPriorityQueueDemo {

    static int[] heapSort(int[] arr) {
        PriorityQueue<Integer> minHeap = new PriorityQueue<>();
        for (int num : arr) minHeap.offer(num);   // O(n) via bulk-insert internally

        int[] sorted = new int[arr.length];
        for (int i = 0; i < arr.length; i++) {
            sorted[i] = minHeap.poll();   // always extracts the current smallest
        }
        return sorted;
    }

    public static void main(String[] args) {
        int[] arr = {29, 10, 14, 37, 13};
        System.out.println(java.util.Arrays.toString(heapSort(arr)));
    }
}
// OUTPUT:
// [10, 13, 14, 29, 37]`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This PriorityQueue Version is O(n) Extra Space, Unlike In-Place Heap Sort</h3>
This version allocates a SEPARATE <code>PriorityQueue</code> plus a separate output array - O(n) extra space. The classic in-place array Heap Sort algorithm achieves the same O(n log n) time WITHOUT that extra space, by building the heap directly inside the original array and swapping the extracted max to the END of the shrinking heap region each time (see the "Heap Sort" topic under Sorting for the full in-place version).`,
            codeExamples: [
                `package com.javaschoollab;

public class SpaceComparisonDemo {
    public static void main(String[] args) {
        System.out.println("PriorityQueue-based heap sort:");
        System.out.println("  - Simple to write, clear intent");
        System.out.println("  - O(n) extra space: separate heap structure + output array");
        System.out.println();
        System.out.println("In-place array heap sort:");
        System.out.println("  - Builds the heap WITHIN the original array");
        System.out.println("  - Swaps the max to the shrinking array's end, re-heapifies the rest");
        System.out.println("  - O(1) extra space - the array itself IS the sorted result at the end");
    }
}
// OUTPUT:
// PriorityQueue-based heap sort:
//   - Simple to write, clear intent
//   - O(n) extra space: separate heap structure + output array
//
// In-place array heap sort:
//   - Builds the heap WITHIN the original array
//   - Swaps the max to the shrinking array's end, re-heapifies the rest
//   - O(1) extra space - the array itself IS the sorted result at the end`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why does repeatedly extracting the min ALWAYS produce sorted order?</td><td>A min-heap guarantees the root is the smallest remaining element at every point in time - removing it repeatedly is, by definition, removing elements in strictly non-decreasing order</td></tr>
<tr class='text-center'><td>Is this approach's time complexity the same as in-place heap sort?</td><td>Yes - both are O(n log n): O(n) to build the heap plus O(n log n) for n extractions, each costing O(log n)</td></tr>
<tr class='text-center'><td>When might you actually use the PriorityQueue-based version in real code?</td><td>When code clarity matters more than the O(n) space overhead, or when you're already using a PriorityQueue for another purpose (e.g. a Top-K structure) and sorting the remaining contents is a small side task</td></tr>
</table>`
        }
    ]
};
