import { Topic } from '../../coreJava';

export const heapSortTopic: Topic = {
    id: 'dsa-sorting-heap-sort',
    name: 'Heap Sort',
    beginner: [
        {
            content: `<h4>Heap Sort - O(n log n), In-Place, No Worst-Case Surprises</h4>
Builds a MAX-HEAP from the array, then repeatedly swaps the root (the maximum) with the last unsorted element and "sinks" the new root back down - shrinking the heap by one each time. Guaranteed O(n log n) in every case, no adversarial input can degrade it, unlike Quick Sort.
<ul>
<li><b>In-place</b> - O(1) extra space, sorts within the same array.</li>
<li><b>Not stable</b> - heap operations can reorder equal elements.</li>
</ul>`,
            codeExamples: [
                `package com.javaschoollab;

public class HeapSortDemo {

    static void heapSort(int[] arr) {
        int n = arr.length;

        // Build a max-heap (start from the last non-leaf node, working backward)
        for (int i = n / 2 - 1; i >= 0; i--) {
            heapify(arr, n, i);
        }

        // Repeatedly extract the max (root) and shrink the heap
        for (int i = n - 1; i > 0; i--) {
            int temp = arr[0]; arr[0] = arr[i]; arr[i] = temp;   // move max to the end
            heapify(arr, i, 0);   // restore heap property on the shrunk heap
        }
    }

    static void heapify(int[] arr, int heapSize, int root) {
        int largest = root;
        int left = 2 * root + 1, right = 2 * root + 2;

        if (left < heapSize && arr[left] > arr[largest]) largest = left;
        if (right < heapSize && arr[right] > arr[largest]) largest = right;

        if (largest != root) {
            int temp = arr[root]; arr[root] = arr[largest]; arr[largest] = temp;
            heapify(arr, heapSize, largest);   // continue sinking down
        }
    }

    public static void main(String[] args) {
        int[] arr = {12, 11, 13, 5, 6, 7};
        heapSort(arr);
        System.out.println(java.util.Arrays.toString(arr));
    }
}
// OUTPUT:
// [5, 6, 7, 11, 12, 13]`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why Building the Heap is O(n), Not O(n log n)</h3>
It's tempting to assume calling <code>heapify</code> n/2 times (once per non-leaf node), each costing up to O(log n), gives O(n log n) for the build phase. The tighter analysis: most nodes are near the BOTTOM of the tree and only need a SHORT sink (small height), and only a few nodes near the root need the full O(log n) sink - summing this geometric-series-weighted cost across all levels gives O(n) total, not O(n log n).`,
            codeExamples: [
                `package com.javaschoollab;

public class HeapBuildCostDemo {
    public static void main(String[] args) {
        // Illustrating the insight: most nodes are leaves (height 0, free to heapify),
        // and the number of nodes at height h shrinks by half as h grows.
        int n = 16;
        System.out.println("n = " + n + " elements, tree height = " + (int) (Math.log(n) / Math.log(2)));

        for (int height = 0; height <= 4; height++) {
            int nodesAtThisHeight = n / (int) Math.pow(2, height + 1);
            System.out.println("Height " + height + ": ~" + nodesAtThisHeight
                + " nodes, each costs up to " + height + " swaps to sink");
        }
        System.out.println("Sum of (nodes * height) across all levels converges to O(n), not O(n log n)");
    }
}
// OUTPUT:
// n = 16 elements, tree height = 4
// Height 0: ~8 nodes, each costs up to 0 swaps to sink
// Height 1: ~4 nodes, each costs up to 1 swaps to sink
// Height 2: ~2 nodes, each costs up to 2 swaps to sink
// Height 3: ~1 nodes, each costs up to 3 swaps to sink
// Height 4: ~0 nodes, each costs up to 4 swaps to sink
// Sum of (nodes * height) across all levels converges to O(n), not O(n log n)`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why does Heap Sort have NO bad worst case, unlike Quick Sort?</td><td>Heap structure and sink operations don't depend on the input's initial order the way pivot selection does - every extraction costs exactly O(log n) regardless of how the data was originally arranged</td></tr>
<tr class='text-center'><td>Why is Heap Sort rarely the default choice despite guaranteed O(n log n)?</td><td>Its cache locality is worse than Quick Sort's (heap operations jump around the array via parent/child index formulas rather than accessing memory sequentially), making it slower in practice despite the same asymptotic complexity</td></tr>
<tr class='text-center'><td>What's the relationship between Heap Sort and the Priority Queue "Top K" pattern?</td><td>Both rely on the same heapify/sink mechanics - Heap Sort repeatedly extracts the max from a full heap to sort everything, while a bounded-size heap for "Top K" only ever holds K elements, giving O(n log k) instead of O(n log n)</td></tr>
</table>`
        }
    ]
};
