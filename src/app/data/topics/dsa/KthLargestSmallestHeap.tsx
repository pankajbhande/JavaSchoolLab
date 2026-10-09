import { Topic } from '../../coreJava';

export const kthLargestSmallestHeap: Topic = {
    id: 'dsa-heap-kth-largest-smallest',
    name: 'Kth Largest / Smallest',
    beginner: [
        {
            content: `<h4>Finding the Kth Largest Element with a Min-Heap</h4>
Keep a min-heap of size K as you scan the array; whenever it grows past K, evict the minimum. Whatever remains after the full scan has the root as the Kth largest - O(n log k), much better than sorting the whole array when k is small.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.PriorityQueue;

public class KthLargestDemo {

    static int findKthLargest(int[] nums, int k) {
        PriorityQueue<Integer> minHeap = new PriorityQueue<>();

        for (int num : nums) {
            minHeap.offer(num);
            if (minHeap.size() > k) {
                minHeap.poll();   // evict the smallest - it's not in the top K anymore
            }
        }
        return minHeap.peek();
    }

    public static void main(String[] args) {
        int[] nums = {3, 2, 1, 5, 6, 4};
        System.out.println(findKthLargest(nums, 2));
    }
}
// OUTPUT:
// 5`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Quickselect - O(n) Average, the Faster Alternative</h3>
The heap approach is O(n log k). Quickselect (using Quick Sort's partition step, but recursing into only ONE side) finds the Kth largest in O(n) AVERAGE time - though O(n&sup2;) worst case, same risk profile as Quick Sort itself, mitigated with a random pivot.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.Random;

public class QuickselectDemo {

    static final Random RANDOM = new Random();

    static int findKthLargest(int[] nums, int k) {
        int targetIndex = nums.length - k;   // Kth largest = (n-k)th smallest in sorted order
        return quickSelect(nums, 0, nums.length - 1, targetIndex);
    }

    static int quickSelect(int[] arr, int low, int high, int targetIndex) {
        int pivotIndex = partition(arr, low, high);

        if (pivotIndex == targetIndex) {
            return arr[pivotIndex];
        } else if (pivotIndex < targetIndex) {
            return quickSelect(arr, pivotIndex + 1, high, targetIndex);   // recurse RIGHT only
        } else {
            return quickSelect(arr, low, pivotIndex - 1, targetIndex);    // recurse LEFT only
        }
    }

    static int partition(int[] arr, int low, int high) {
        int randomIndex = low + RANDOM.nextInt(high - low + 1);
        swap(arr, randomIndex, high);

        int pivot = arr[high];
        int i = low - 1;
        for (int j = low; j < high; j++) {
            if (arr[j] < pivot) {
                i++;
                swap(arr, i, j);
            }
        }
        swap(arr, i + 1, high);
        return i + 1;
    }

    static void swap(int[] arr, int i, int j) {
        int t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }

    public static void main(String[] args) {
        int[] nums = {3, 2, 1, 5, 6, 4};
        System.out.println(findKthLargest(nums, 2));
    }
}
// OUTPUT:
// 5`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why does Quickselect only recurse into ONE side, unlike full Quick Sort?</td><td>It only needs to locate ONE specific position (the target index), so once the pivot lands there, the answer is found - there's no need to fully sort the other side, cutting the average work roughly in half each recursive step</td></tr>
<tr class='text-center'><td>When would you prefer the heap approach over Quickselect despite being asymptotically slower?</td><td>When the data is a STREAM (elements arriving one at a time, unknown total count) - the heap approach naturally maintains a running "top K so far", while Quickselect needs the full array available upfront</td></tr>
<tr class='text-center'><td>What's Quickselect's worst-case time complexity, and how is it mitigated?</td><td>O(n^2), from the same bad-pivot scenario as Quick Sort - a randomized pivot choice makes this vanishingly unlikely for any fixed adversarial input</td></tr>
</table>`
        }
    ]
};
