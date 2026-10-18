import { Topic } from '../../coreJava';

export const topKProblems: Topic = {
    id: 'dsa-heap-top-k-problems',
    name: 'Top K Problems',
    beginner: [
        {
            content: `<h4>The General "Top K" Pattern</h4>
A huge family of interview problems reduces to the same shape: maintain a heap of size K, evicting the "weakest" candidate whenever a better one shows up. Beyond raw numbers, this works for ANY object with a defined priority - most frequent elements, closest points, cheapest flights.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.*;

public class TopKFrequentDemo {

    // Top K most FREQUENT elements - combines a frequency map with a heap
    static int[] topKFrequent(int[] nums, int k) {
        Map<Integer, Integer> freq = new HashMap<>();
        for (int n : nums) freq.merge(n, 1, Integer::sum);

        // Min-heap of size k, ordered by FREQUENCY (not value)
        PriorityQueue<Map.Entry<Integer, Integer>> minHeap =
            new PriorityQueue<>(Comparator.comparingInt(Map.Entry::getValue));

        for (Map.Entry<Integer, Integer> entry : freq.entrySet()) {
            minHeap.offer(entry);
            if (minHeap.size() > k) {
                minHeap.poll();   // evict the least frequent
            }
        }

        int[] result = new int[k];
        for (int i = k - 1; i >= 0; i--) {
            result[i] = minHeap.poll().getKey();
        }
        return result;
    }

    public static void main(String[] args) {
        int[] nums = {1, 1, 1, 2, 2, 3};
        System.out.println(Arrays.toString(topKFrequent(nums, 2)));
    }
}
// OUTPUT:
// [1, 2]`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>K Closest Points to Origin - the Same Pattern, Different Priority</h3>
Same "heap of size K, evict the weakest" template, but the comparator is now DISTANCE from origin instead of frequency - demonstrating that the pattern generalizes to any custom priority, not just plain numbers.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.PriorityQueue;

public class KClosestPointsDemo {

    static int[][] kClosest(int[][] points, int k) {
        // Max-heap of size k, ordered by DISTANCE - largest distance evicted first
        PriorityQueue<int[]> maxHeap = new PriorityQueue<>(
            (a, b) -> (b[0] * b[0] + b[1] * b[1]) - (a[0] * a[0] + a[1] * a[1]));

        for (int[] point : points) {
            maxHeap.offer(point);
            if (maxHeap.size() > k) {
                maxHeap.poll();   // evict the FARTHEST point
            }
        }
        return maxHeap.toArray(new int[0][]);
    }

    public static void main(String[] args) {
        int[][] points = {{1, 3}, {-2, 2}, {5, 8}, {0, 1}};
        int[][] closest = kClosest(points, 2);
        for (int[] p : closest) {
            System.out.println(java.util.Arrays.toString(p));
        }
    }
}
// OUTPUT:
// [-2, 2]
// [0, 1]
// (exact order between the two may vary since heap iteration order isn't sorted)`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why use a MAX-heap for "K closest" but a MIN-heap for "K largest"?</td><td>The heap should always be able to evict the WORST candidate for the goal - for "K closest", the worst candidate is the FARTHEST (so a max-heap on distance lets you pop the farthest); for "K largest", the worst candidate is the SMALLEST (min-heap lets you pop the smallest)</td></tr>
<tr class='text-center'><td>What's the general time complexity of the Top-K-heap pattern?</td><td>O(n log k) - each of the n elements does at most one O(log k) heap operation, since the heap never exceeds size k</td></tr>
<tr class='text-center'><td>When would bucket sort beat the heap approach for Top K Frequent?</td><td>When frequencies are bounded by a small known range (at most n), bucket sort by frequency count achieves O(n) instead of O(n log k) - each bucket index IS a frequency value, and you read buckets from the top down</td></tr>
</table>`
        }
    ]
};
