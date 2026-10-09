import { Topic } from '../../coreJava';

export const minHeap: Topic = {
    id: 'dsa-heap-min-heap',
    name: 'Min Heap',
    beginner: [
        {
            content: `<h4>The Min-Heap Property</h4>
A min-heap is a COMPLETE binary tree where every node is &le; both its children - the SMALLEST element is always at the root, reachable in O(1). It's typically stored as a plain array using the <code>2i+1</code>/<code>2i+2</code>/<code>(i-1)/2</code> index formulas, no pointers needed.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.PriorityQueue;

public class MinHeapBasicsDemo {
    public static void main(String[] args) {
        PriorityQueue<Integer> minHeap = new PriorityQueue<>();   // Java's built-in min-heap

        minHeap.offer(20);
        minHeap.offer(5);
        minHeap.offer(15);
        minHeap.offer(1);

        System.out.println("Root (min): " + minHeap.peek());   // O(1)

        while (!minHeap.isEmpty()) {
            System.out.print(minHeap.poll() + " ");   // O(log n) each
        }
    }
}
// OUTPUT:
// Root (min): 1
// 1 5 15 20`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Implementing a Min-Heap from Scratch with sink/swim</h3>
Insertion adds at the END, then "swims" up (swap with parent while smaller); extraction moves the LAST element to the root, then "sinks" down (swap with the smaller child while larger) - both O(log n), bounded by the tree's height.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.ArrayList;
import java.util.List;

public class MinHeapFromScratchDemo {

    static class MinHeap {
        private final List<Integer> heap = new ArrayList<>();

        void insert(int val) {
            heap.add(val);
            swim(heap.size() - 1);
        }

        int extractMin() {
            int min = heap.get(0);
            int last = heap.remove(heap.size() - 1);
            if (!heap.isEmpty()) {
                heap.set(0, last);
                sink(0);
            }
            return min;
        }

        void swim(int i) {
            while (i > 0) {
                int parent = (i - 1) / 2;
                if (heap.get(i) >= heap.get(parent)) break;
                swap(i, parent);
                i = parent;
            }
        }

        void sink(int i) {
            int n = heap.size();
            while (true) {
                int left = 2 * i + 1, right = 2 * i + 2, smallest = i;
                if (left < n && heap.get(left) < heap.get(smallest)) smallest = left;
                if (right < n && heap.get(right) < heap.get(smallest)) smallest = right;
                if (smallest == i) break;
                swap(i, smallest);
                i = smallest;
            }
        }

        void swap(int i, int j) {
            int temp = heap.get(i);
            heap.set(i, heap.get(j));
            heap.set(j, temp);
        }
    }

    public static void main(String[] args) {
        MinHeap heap = new MinHeap();
        for (int v : new int[]{20, 5, 15, 1, 8}) heap.insert(v);

        for (int i = 0; i < 5; i++) {
            System.out.print(heap.extractMin() + " ");
        }
    }
}
// OUTPUT:
// 1 5 8 15 20`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why is peek() O(1) but poll() O(log n)?</td><td>The minimum is always at the root (index 0), so reading it needs no traversal; removing it requires restoring the heap property afterward via sink(), which costs O(log n)</td></tr>
<tr class='text-center'><td>Why does "swim" only need to check the parent, while "sink" checks both children?</td><td>Swimming up, each node has exactly ONE parent to compare against; sinking down, a node has up to TWO children, and must swap with whichever is smaller to maintain the min-heap property correctly</td></tr>
<tr class='text-center'><td>What's the time complexity of building a heap from n elements?</td><td>O(n) via bottom-up heapify (not n inserts, which would be O(n log n)) - the same amortized analysis as Heap Sort's build phase</td></tr>
</table>`
        }
    ]
};
