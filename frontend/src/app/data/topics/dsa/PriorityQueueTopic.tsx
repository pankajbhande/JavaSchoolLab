import { Topic } from '../../coreJava';

export const priorityQueueTopic: Topic = {
    id: 'dsa-queue-deque-priority-queue',
    name: 'Priority Queue',
    beginner: [
        {
            content: `<h4>What is a Priority Queue?</h4>
Unlike a regular queue (FIFO order), a priority queue always returns the element with the HIGHEST PRIORITY first - in Java, that means the SMALLEST element by default (a min-heap). <code>offer</code> and <code>poll</code> are both O(log n).`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.PriorityQueue;

public class PriorityQueueBasicsDemo {
    public static void main(String[] args) {
        PriorityQueue<Integer> minHeap = new PriorityQueue<>();   // min-heap by default

        minHeap.offer(5);
        minHeap.offer(1);
        minHeap.offer(3);
        minHeap.offer(2);

        while (!minHeap.isEmpty()) {
            System.out.print(minHeap.poll() + " ");   // always removes the smallest
        }
    }
}
// OUTPUT:
// 1 2 3 5`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Custom Comparators and Max-Heap</h3>
Java's <code>PriorityQueue</code> is min-heap only by default - build a max-heap or any custom ordering by passing a <code>Comparator</code>. This is the standard tool for "Top K" problems: keep a heap of size K, and any new element that beats the heap's worst kicks that worst element out.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.PriorityQueue;
import java.util.Collections;

public class TopKElementsDemo {

    // Finds the K largest elements using a MIN-heap of size K
    // (counter-intuitive but efficient: the heap's top is always the
    // SMALLEST of the current top-K candidates, ready to be evicted)
    static int[] topKLargest(int[] nums, int k) {
        PriorityQueue<Integer> minHeap = new PriorityQueue<>();

        for (int num : nums) {
            minHeap.offer(num);
            if (minHeap.size() > k) {
                minHeap.poll();   // evict the smallest - it can't be in the top K
            }
        }

        int[] result = new int[k];
        for (int i = k - 1; i >= 0; i--) {
            result[i] = minHeap.poll();
        }
        return result;
    }

    public static void main(String[] args) {
        int[] nums = {3, 1, 5, 12, 2, 11};
        System.out.println(java.util.Arrays.toString(topKLargest(nums, 3)));

        // A max-heap via a custom comparator
        PriorityQueue<Integer> maxHeap = new PriorityQueue<>(Collections.reverseOrder());
        maxHeap.offer(5);
        maxHeap.offer(1);
        maxHeap.offer(9);
        System.out.println("Max-heap top: " + maxHeap.peek());
    }
}
// OUTPUT:
// [5, 11, 12]
// Max-heap top: 9`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why use a MIN-heap of size K to find the K LARGEST elements?</td><td>The heap's smallest element is always the weakest candidate in the current top-K set - keeping the heap capped at size K and evicting its minimum whenever a bigger element arrives naturally converges on the true top K</td></tr>
<tr class='text-center'><td>What's the time complexity of finding the K largest elements this way?</td><td>O(n log k) - each of the n elements does at most one O(log k) heap operation, much better than sorting the whole array (O(n log n)) when k is small</td></tr>
<tr class='text-center'><td>What underlying data structure powers Java's PriorityQueue?</td><td>A binary heap stored in a resizable array - offer/poll are O(log n), peek is O(1)</td></tr>
</table>`
        }
    ]
};
