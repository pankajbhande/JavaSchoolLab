import { Topic } from '../../coreJava';

export const mergeSortTopic: Topic = {
    id: 'dsa-sorting-merge-sort',
    name: 'Merge Sort',
    beginner: [
        {
            content: `<h4>Merge Sort - O(n log n), Divide and Conquer</h4>
Recursively splits the array in half until each piece has one element (trivially sorted), then MERGES sorted halves back together. Guaranteed O(n log n) in every case - best, average, and worst - unlike Quick Sort's O(n&sup2;) worst case.
<ul>
<li><b>Stable</b> - the merge step takes from the left half whenever values are equal, preserving original order.</li>
<li><b>Not in-place</b> - needs O(n) auxiliary space for the merge step's temporary array.</li>
</ul>`,
            codeExamples: [
                `package com.javaschoollab;

public class MergeSortDemo {

    static void mergeSort(int[] arr, int left, int right) {
        if (left >= right) return;   // base case: 0 or 1 element is already sorted

        int mid = left + (right - left) / 2;
        mergeSort(arr, left, mid);
        mergeSort(arr, mid + 1, right);
        merge(arr, left, mid, right);
    }

    static void merge(int[] arr, int left, int mid, int right) {
        int[] temp = new int[right - left + 1];
        int i = left, j = mid + 1, k = 0;

        while (i <= mid && j <= right) {
            // <= keeps it STABLE - equal elements prefer the left half
            temp[k++] = (arr[i] <= arr[j]) ? arr[i++] : arr[j++];
        }
        while (i <= mid) temp[k++] = arr[i++];
        while (j <= right) temp[k++] = arr[j++];

        System.arraycopy(temp, 0, arr, left, temp.length);
    }

    public static void main(String[] args) {
        int[] arr = {38, 27, 43, 3, 9, 82, 10};
        mergeSort(arr, 0, arr.length - 1);
        System.out.println(java.util.Arrays.toString(arr));
    }
}
// OUTPUT:
// [3, 9, 10, 27, 38, 43, 82]`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Counting Inversions with Merge Sort</h3>
An "inversion" is a pair <code>(i, j)</code> where <code>i &lt; j</code> but <code>arr[i] &gt; arr[j]</code> - a measure of how far an array is from sorted. Merge sort's merge step counts them for FREE as a side effect: whenever an element from the right half is taken before the left half is exhausted, it's smaller than EVERY remaining left-half element - each of those forms an inversion.`,
            codeExamples: [
                `package com.javaschoollab;

public class CountInversionsDemo {

    static long countInversions(int[] arr, int left, int right) {
        if (left >= right) return 0;

        int mid = left + (right - left) / 2;
        long count = countInversions(arr, left, mid)
                   + countInversions(arr, mid + 1, right);

        int[] temp = new int[right - left + 1];
        int i = left, j = mid + 1, k = 0;

        while (i <= mid && j <= right) {
            if (arr[i] <= arr[j]) {
                temp[k++] = arr[i++];
            } else {
                // arr[j] is smaller than EVERY remaining element in the left half
                count += (mid - i + 1);
                temp[k++] = arr[j++];
            }
        }
        while (i <= mid) temp[k++] = arr[i++];
        while (j <= right) temp[k++] = arr[j++];

        System.arraycopy(temp, 0, arr, left, temp.length);
        return count;
    }

    public static void main(String[] args) {
        int[] arr = {2, 4, 1, 3, 5};
        System.out.println(countInversions(arr, 0, arr.length - 1));
    }
}
// OUTPUT:
// 3
// (pairs (2,1), (4,1), (4,3) are inversions)`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why is Merge Sort's time complexity O(n log n) in EVERY case?</td><td>The split is always exactly in half regardless of input order (log n levels of recursion), and each level does O(n) total merge work - there's no data-dependent worst case like Quicksort's bad-pivot scenario</td></tr>
<tr class='text-center'><td>Why is Merge Sort not in-place?</td><td>The merge step needs a temporary array to hold the combined result while comparing from two source ranges simultaneously - merging truly in-place is possible but adds significant complexity and typically increases time complexity too</td></tr>
<tr class='text-center'><td>When would you choose Merge Sort over Quick Sort in practice?</td><td>When stability is required, when worst-case O(n log n) is a hard requirement (e.g. real-time systems), or for sorting linked lists (where merge sort's sequential access pattern avoids Quicksort's need for random access)</td></tr>
</table>`
        }
    ]
};
