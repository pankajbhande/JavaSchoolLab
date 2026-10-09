import { Topic } from '../../coreJava';

export const maxHeap: Topic = {
    id: 'dsa-heap-max-heap',
    name: 'Max Heap',
    beginner: [
        {
            content: `<h4>The Mirror of Min-Heap</h4>
Every node is &ge; both its children - the LARGEST element sits at the root. Java's <code>PriorityQueue</code> is min-heap by default, so a max-heap needs a <code>Comparator</code> flipping the order.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.Collections;
import java.util.PriorityQueue;

public class MaxHeapBasicsDemo {
    public static void main(String[] args) {
        PriorityQueue<Integer> maxHeap = new PriorityQueue<>(Collections.reverseOrder());

        maxHeap.offer(5);
        maxHeap.offer(20);
        maxHeap.offer(15);
        maxHeap.offer(1);

        System.out.println("Root (max): " + maxHeap.peek());

        while (!maxHeap.isEmpty()) {
            System.out.print(maxHeap.poll() + " ");
        }
    }
}
// OUTPUT:
// Root (max): 20
// 20 15 5 1`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Negation Trick - Simulating Max-Heap with a Min-Heap</h3>
Without a custom Comparator (e.g. in languages/libraries that only provide min-heaps), NEGATING values before inserting and negating again on extraction simulates a max-heap using pure min-heap logic - the smallest negative value corresponds to the largest original value.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.PriorityQueue;

public class NegationMaxHeapDemo {
    public static void main(String[] args) {
        PriorityQueue<Integer> minHeap = new PriorityQueue<>();   // plain min-heap

        int[] values = {5, 20, 15, 1};
        for (int v : values) {
            minHeap.offer(-v);   // insert the NEGATION
        }

        System.out.println("Simulated max: " + (-minHeap.peek()));   // negate back to read

        while (!minHeap.isEmpty()) {
            System.out.print(-minHeap.poll() + " ");   // negate back on extraction too
        }
    }
}
// OUTPUT:
// Simulated max: 20
// 20 15 5 1`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why is Java's PriorityQueue min-heap by default, requiring a Comparator for max-heap?</td><td>It's a design choice of natural ordering (ascending) matching Comparable's default contract - Collections.reverseOrder() or a custom lambda comparator inverts it for max-heap behavior</td></tr>
<tr class='text-center'><td>When would the negation trick be preferred over a custom Comparator?</td><td>When working with primitive-only heap implementations that don't support custom comparators, or in performance-sensitive code avoiding the boxing/comparator-call overhead of object-based comparisons</td></tr>
<tr class='text-center'><td>What's a real use case that specifically needs a max-heap over a min-heap?</td><td>Finding the K SMALLEST elements efficiently uses a max-heap of size K (evicting the current maximum when a smaller element arrives) - the mirror of using a min-heap to find the K largest</td></tr>
</table>`
        }
    ]
};
