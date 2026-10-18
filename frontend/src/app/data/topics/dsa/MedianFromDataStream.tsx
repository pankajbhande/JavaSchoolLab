import { Topic } from '../../coreJava';

export const medianFromDataStream: Topic = {
    id: 'dsa-heap-median-from-data-stream',
    name: 'Median from Data Stream',
    beginner: [
        {
            content: `<h4>Maintaining a Running Median with Two Heaps</h4>
Split the numbers seen so far into two halves: a MAX-heap holding the SMALLER half (its top is the largest of the small numbers), and a MIN-heap holding the LARGER half (its top is the smallest of the large numbers). The median is derivable from the two tops in O(1) - inserting a new number costs O(log n) to keep both heaps balanced.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.Collections;
import java.util.PriorityQueue;

public class MedianFinderDemo {

    static class MedianFinder {
        private final PriorityQueue<Integer> smallHalf = new PriorityQueue<>(Collections.reverseOrder()); // max-heap
        private final PriorityQueue<Integer> largeHalf = new PriorityQueue<>();                            // min-heap

        void addNum(int num) {
            smallHalf.offer(num);

            // Always keep smallHalf's max <= largeHalf's min - rebalance if violated
            largeHalf.offer(smallHalf.poll());

            // Keep the two heaps' sizes within 1 of each other
            if (largeHalf.size() > smallHalf.size()) {
                smallHalf.offer(largeHalf.poll());
            }
        }

        double findMedian() {
            if (smallHalf.size() > largeHalf.size()) {
                return smallHalf.peek();
            }
            return (smallHalf.peek() + largeHalf.peek()) / 2.0;
        }
    }

    public static void main(String[] args) {
        MedianFinder mf = new MedianFinder();
        mf.addNum(5);
        System.out.println(mf.findMedian());
        mf.addNum(15);
        System.out.println(mf.findMedian());
        mf.addNum(1);
        System.out.println(mf.findMedian());
    }
}
// OUTPUT:
// 5.0
// 10.0
// 5.0`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why the Balancing Logic Guarantees Correctness</h3>
The invariant maintained after every insertion: <code>smallHalf.size() == largeHalf.size()</code> or <code>smallHalf.size() == largeHalf.size() + 1</code>, AND every element in smallHalf is &le; every element in largeHalf. Given that invariant, the median is trivially either smallHalf's top (odd total count) or the average of both tops (even total count) - no scanning or sorting ever needed.`,
            codeExamples: [
                `package com.javaschoollab;

public class MedianInvariantDemo {
    public static void main(String[] args) {
        System.out.println("Invariant after every addNum():");
        System.out.println("1. |smallHalf.size() - largeHalf.size()| <= 1");
        System.out.println("2. max(smallHalf) <= min(largeHalf)");
        System.out.println();
        System.out.println("These two facts TOGETHER guarantee the median is always");
        System.out.println("derivable in O(1) from just the two heap tops - no need to");
        System.out.println("ever look at any other element in either heap.");
    }
}
// OUTPUT:
// Invariant after every addNum():
// 1. |smallHalf.size() - largeHalf.size()| <= 1
// 2. max(smallHalf) <= min(largeHalf)
//
// These two facts TOGETHER guarantee the median is always
// derivable in O(1) from just the two heap tops - no need to
// ever look at any other element in either heap.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What's the time complexity of addNum() and findMedian()?</td><td>addNum() is O(log n) (heap insertion plus rebalancing), findMedian() is O(1) (just reading the tops)</td></tr>
<tr class='text-center'><td>Why route every new number through smallHalf first, rather than deciding directly which heap it belongs in?</td><td>It's a simplification trick: always insert into smallHalf, then immediately move its new max over to largeHalf - this single consistent rule automatically handles both "belongs in small half" and "belongs in large half" cases correctly without extra branching logic</td></tr>
<tr class='text-center'><td>How would you extend this to support REMOVING a number from the stream (a "sliding window median")?</td><td>Heaps don't support efficient arbitrary removal - a common approach uses lazy deletion (mark removed, skip stale entries when they reach the top) combined with a hash map tracking pending removals per value</td></tr>
</table>`
        }
    ]
};
