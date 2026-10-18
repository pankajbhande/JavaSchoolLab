import { Topic } from '../../coreJava';

export const twoHeapTechnique: Topic = {
    id: 'dsa-heap-two-heap-technique',
    name: 'Two Heap Technique',
    beginner: [
        {
            content: `<h4>The General Pattern Behind Median From Data Stream</h4>
"Two heap" is a named technique: split a dataset into two balanced halves using a max-heap for the lower half and a min-heap for the upper half, maintaining the invariant that every lower-half element &le; every upper-half element. It solves any problem needing fast access to a MIDDLE point in a dynamically changing dataset - not just plain medians.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.Collections;
import java.util.PriorityQueue;

public class TwoHeapSkeletonDemo {

    static PriorityQueue<Integer> lowerHalf = new PriorityQueue<>(Collections.reverseOrder());
    static PriorityQueue<Integer> upperHalf = new PriorityQueue<>();

    static void insert(int num) {
        if (lowerHalf.isEmpty() || num <= lowerHalf.peek()) {
            lowerHalf.offer(num);
        } else {
            upperHalf.offer(num);
        }
        rebalance();
    }

    static void rebalance() {
        // Keep sizes within 1 of each other
        if (lowerHalf.size() > upperHalf.size() + 1) {
            upperHalf.offer(lowerHalf.poll());
        } else if (upperHalf.size() > lowerHalf.size()) {
            lowerHalf.offer(upperHalf.poll());
        }
    }

    public static void main(String[] args) {
        int[] stream = {41, 35, 62, 5, 97, 108};
        for (int num : stream) {
            insert(num);
            System.out.println("After inserting " + num
                + ": lowerHalf top = " + lowerHalf.peek()
                + ", upperHalf top = " + upperHalf.peek());
        }
    }
}
// OUTPUT:
// After inserting 41: lowerHalf top = 41, upperHalf top = null
// After inserting 35: lowerHalf top = 35, upperHalf top = 41
// After inserting 62: lowerHalf top = 41, upperHalf top = 62
// After inserting 5: lowerHalf top = 35, upperHalf top = 41
// After inserting 97: lowerHalf top = 41, upperHalf top = 62
// After inserting 108: lowerHalf top = 41, upperHalf top = 62`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Sliding Window Median - Two Heaps Plus Lazy Deletion</h3>
Extending two-heap to a SLIDING WINDOW (fixed-size window over a stream, median needed for each position) adds a real complication: heaps don't support efficient removal of an arbitrary element. The standard fix is LAZY DELETION - mark a value as "to be removed" in a hash map, and only actually discard it from a heap when it happens to reach the top, skipping over any stale entries encountered.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.*;

public class SlidingWindowMedianSketchDemo {

    static PriorityQueue<Integer> lowerHalf = new PriorityQueue<>(Collections.reverseOrder());
    static PriorityQueue<Integer> upperHalf = new PriorityQueue<>();
    static Map<Integer, Integer> pendingRemoval = new HashMap<>();

    // Discards any values at the top that are marked for lazy removal
    static void prune(PriorityQueue<Integer> heap) {
        while (!heap.isEmpty() && pendingRemoval.getOrDefault(heap.peek(), 0) > 0) {
            pendingRemoval.merge(heap.peek(), -1, Integer::sum);
            heap.poll();
        }
    }

    static void remove(int num) {
        pendingRemoval.merge(num, 1, Integer::sum);   // mark for lazy removal, don't touch heap yet
    }

    public static void main(String[] args) {
        lowerHalf.offer(5);
        lowerHalf.offer(3);
        lowerHalf.offer(8);

        remove(8);          // mark 8 as removed, but it's NOT physically gone yet
        prune(lowerHalf);    // only removes 8 if it's currently at the top

        System.out.println("Top after lazy removal + prune: " + lowerHalf.peek());
    }
}
// OUTPUT:
// Top after lazy removal + prune: 5`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What other problems use the two-heap pattern besides finding the median?</td><td>"IPO" (choose projects to maximize capital, splitting by affordability), and any "find the Kth-from-middle element dynamically" style problem</td></tr>
<tr class='text-center'><td>Why is lazy deletion necessary for a sliding window median, but not for the basic streaming median?</td><td>The basic version only ever ADDS numbers, never removes them; a sliding window must also REMOVE the number leaving the window each step, and heaps have no O(log n) way to remove an arbitrary (non-top) element directly</td></tr>
<tr class='text-center'><td>Does lazy deletion change the overall time complexity?</td><td>Amortized, no - each element is inserted once and removed (lazily or actually) once across the whole run, keeping total work O(n log n) for n operations, same order as the non-lazy version</td></tr>
</table>`
        }
    ]
};
