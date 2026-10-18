import { Topic } from '../../coreJava';

export const greedyPlusHeap: Topic = {
    id: 'dsa-greedy-greedy-heap',
    name: 'Greedy + Heap',
    beginner: [
        {
            content: `<h4>Connect Ropes to Minimize Total Cost</h4>
Given ropes of different lengths, connecting two ropes costs the SUM of their lengths; find the minimum total cost to connect ALL ropes into one. Greedy insight: always connect the two SHORTEST ropes first - a min-heap makes finding "the two shortest, repeatedly, as the set changes" efficient.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.PriorityQueue;

public class ConnectRopesDemo {

    static int minCost(int[] ropes) {
        PriorityQueue<Integer> minHeap = new PriorityQueue<>();
        for (int rope : ropes) minHeap.offer(rope);

        int totalCost = 0;
        while (minHeap.size() > 1) {
            int first = minHeap.poll();    // two SHORTEST ropes currently available
            int second = minHeap.poll();

            int connectionCost = first + second;
            totalCost += connectionCost;

            minHeap.offer(connectionCost);   // the newly connected rope goes back into the pool
        }
        return totalCost;
    }

    public static void main(String[] args) {
        int[] ropes = {4, 3, 2, 6};
        System.out.println(minCost(ropes));
    }
}
// OUTPUT:
// 29`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This is Structurally Identical to Huffman Coding</h3>
Connect Ropes and Huffman Coding are the SAME algorithm in disguise: both repeatedly merge the two smallest values using a min-heap, and both are provably optimal by the identical exchange argument (any two ropes/frequencies connected/merged LATER than necessary only increases total cost, since their length/frequency gets counted as part of MORE subsequent merges the longer they wait unconnected).`,
            codeExamples: [
                `package com.javaschoollab;

public class RopesVsHuffmanDemo {
    public static void main(String[] args) {
        System.out.println("Connect Ropes            <->  Huffman Coding");
        System.out.println("Rope length               <->  Character frequency");
        System.out.println("Connecting two ropes       <->  Merging two tree nodes");
        System.out.println("Connection cost (sum)      <->  New node's combined frequency");
        System.out.println("Total connection cost      <->  Total encoded bit length");
        System.out.println();
        System.out.println("Both greedily merge the two SMALLEST available values first,");
        System.out.println("using a min-heap for O(log n) repeated 'find the smallest two'.");
    }
}
// OUTPUT:
// Connect Ropes            <->  Huffman Coding
// Rope length               <->  Character frequency
// Connecting two ropes       <->  Merging two tree nodes
// Connection cost (sum)      <->  New node's combined frequency
// Total connection cost      <->  Total encoded bit length
//
// Both greedily merge the two SMALLEST available values first,
// using a min-heap for O(log n) repeated 'find the smallest two'.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What's the time complexity of Connect Ropes?</td><td>O(n log n) - n-1 merges, each involving two O(log n) heap pops and one O(log n) push</td></tr>
<tr class='text-center'><td>Why is a heap needed here instead of just sorting once at the start?</td><td>Every merge produces a NEW value that must be reinserted into consideration for future merges - a one-time sort can't accommodate a value that didn't exist yet when sorting happened; a heap supports this dynamic insert/extract pattern efficiently</td></tr>
<tr class='text-center'><td>What other classic problems use this exact "min-heap, merge two smallest, repeat" template?</td><td>Huffman Coding (tree construction), and the general "merge K sorted lists efficiently" family, though that specific problem uses the heap slightly differently (tracking one element per list rather than merging pairs)</td></tr>
</table>`
        }
    ]
};
