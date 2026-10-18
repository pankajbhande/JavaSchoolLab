import { Topic } from '../../coreJava';

export const bucketSort: Topic = {
    id: 'dsa-sorting-bucket-sort',
    name: 'Bucket Sort',
    beginner: [
        {
            content: `<h4>Bucket Sort - Average O(n + k), Best for Uniform Distributions</h4>
Distributes elements into several "buckets" by value range, sorts each bucket individually (typically with insertion sort, since buckets are small), then concatenates the buckets in order. Works best when input is UNIFORMLY distributed over a known range - the same assumption interpolation search relies on.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class BucketSortDemo {

    // Sorts floating-point values in the range [0, 1)
    static void bucketSort(double[] arr) {
        int n = arr.length;
        List<List<Double>> buckets = new ArrayList<>();
        for (int i = 0; i < n; i++) buckets.add(new ArrayList<>());

        // Distribute elements into buckets based on their value
        for (double num : arr) {
            int bucketIndex = (int) (num * n);   // scale [0,1) to bucket index [0, n)
            buckets.get(bucketIndex).add(num);
        }

        // Sort each bucket individually
        for (List<Double> bucket : buckets) {
            Collections.sort(bucket);
        }

        // Concatenate buckets back into the array, in order
        int index = 0;
        for (List<Double> bucket : buckets) {
            for (double val : bucket) {
                arr[index++] = val;
            }
        }
    }

    public static void main(String[] args) {
        double[] arr = {0.78, 0.17, 0.39, 0.26, 0.72, 0.94, 0.21, 0.12, 0.23, 0.68};
        bucketSort(arr);
        System.out.println(java.util.Arrays.toString(arr));
    }
}
// OUTPUT:
// [0.12, 0.17, 0.21, 0.23, 0.26, 0.39, 0.68, 0.72, 0.78, 0.94]`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why Bucket Sort Degrades on Skewed Data</h3>
Bucket Sort's average-case O(n + k) assumes elements spread EVENLY across buckets - each bucket ends up with roughly n/(number of buckets) elements, making per-bucket insertion sort cheap. If the distribution is skewed (e.g. most values cluster in one range), one bucket ends up holding almost all n elements, and sorting that bucket alone degrades toward O(n&sup2;) - the exact same "bad assumption breaks the guarantee" pattern as Interpolation Search on non-uniform data.`,
            codeExamples: [
                `package com.javaschoollab;

public class BucketSortSkewedDemo {
    public static void main(String[] args) {
        // Uniformly distributed - bucket sort's ideal case
        double[] uniform = {0.1, 0.3, 0.5, 0.7, 0.9, 0.2, 0.4, 0.6, 0.8, 0.05};
        System.out.println("Uniform distribution: each bucket gets ~1 element, fast per-bucket sort");

        // Skewed distribution - almost everything lands in ONE bucket
        double[] skewed = {0.11, 0.12, 0.13, 0.14, 0.15, 0.16, 0.17, 0.18, 0.19, 0.99};
        System.out.println("Skewed distribution: bucket 1 gets 9 of 10 elements,");
        System.out.println("degrading that bucket's insertion sort toward O(n^2)");
    }
}
// OUTPUT:
// Uniform distribution: each bucket gets ~1 element, fast per-bucket sort
// Skewed distribution: bucket 1 gets 9 of 10 elements,
// degrading that bucket's insertion sort toward O(n^2)`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What's Bucket Sort's average vs worst-case time complexity?</td><td>Average O(n + k) with uniformly distributed data; worst case O(n^2) if all elements land in one bucket, since that bucket's insertion sort then processes nearly all n elements</td></tr>
<tr class='text-center'><td>Why sort within each bucket using insertion sort specifically?</td><td>Buckets are expected to be small (few elements each) under the uniform-distribution assumption, and insertion sort is fast and simple for small inputs - the same reasoning hybrid sorts use for small subarrays</td></tr>
<tr class='text-center'><td>How is Bucket Sort related to Radix Sort and Counting Sort?</td><td>All three are non-comparison-based sorts that trade a distributional/range assumption for speed beyond O(n log n) - Counting Sort buckets by exact value, Bucket Sort buckets by value RANGE, and Radix Sort applies Counting Sort repeatedly per digit</td></tr>
</table>`
        }
    ]
};
