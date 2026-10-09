import { Topic } from '../../coreJava';

export const exponentialSearch: Topic = {
    id: 'dsa-searching-exponential-search',
    name: 'Exponential Search',
    beginner: [
        {
            content: `<h4>Finding a Range, Then Binary Searching It</h4>
Exponential search is for searching a sorted array whose SIZE IS UNKNOWN (e.g. an unbounded/streamed array, or one accessed only through an iterator). It first finds a RANGE that must contain the target by doubling an index (1, 2, 4, 8, ...) until overshooting, then runs plain binary search within that bounded range.`,
            codeExamples: [
                `package com.javaschoollab;

public class ExponentialSearchDemo {

    static int exponentialSearch(int[] arr, int target) {
        if (arr[0] == target) return 0;

        // Step 1: find a range [i/2, min(i, n-1)] that must contain the target
        int i = 1;
        while (i < arr.length && arr[i] <= target) {
            i *= 2;
        }

        // Step 2: binary search within that bounded range
        return binarySearch(arr, target, i / 2, Math.min(i, arr.length - 1));
    }

    static int binarySearch(int[] arr, int target, int low, int high) {
        while (low <= high) {
            int mid = low + (high - low) / 2;
            if (arr[mid] == target) return mid;
            else if (arr[mid] < target) low = mid + 1;
            else high = mid - 1;
        }
        return -1;
    }

    public static void main(String[] args) {
        int[] arr = {1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23};
        System.out.println(exponentialSearch(arr, 17));
    }
}
// OUTPUT:
// 8`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why Exponential Search Beats Plain Binary Search When Size is Unknown</h3>
Plain binary search NEEDS to know the array's bounds up front to pick an initial midpoint. When only an iterator or a "has more elements" check is available (e.g. searching an unbounded stream), exponential search's doubling phase discovers a valid bound in O(log p) steps, where p is the target's actual position - meaning it finds SMALL targets very fast without ever needing to know the full size.`,
            codeExamples: [
                `package com.javaschoollab;

public class UnboundedArraySearchDemo {

    // Simulates an "unbounded" array where reading past the real end
    // throws, just like array-index-out-of-bounds would on a real stream.
    static int get(int[] arr, int index) {
        if (index >= arr.length) return Integer.MAX_VALUE;   // treat "past the end" as infinity
        return arr[index];
    }

    static int searchUnbounded(int[] arr, int target) {
        int i = 1;
        while (get(arr, i) < target) {
            i *= 2;
        }
        return binarySearch(arr, target, i / 2, i);
    }

    static int binarySearch(int[] arr, int target, int low, int high) {
        while (low <= high) {
            int mid = low + (high - low) / 2;
            int val = get(arr, mid);
            if (val == target) return mid;
            else if (val < target) low = mid + 1;
            else high = mid - 1;
        }
        return -1;
    }

    public static void main(String[] args) {
        int[] arr = {2, 4, 6, 8, 10, 12, 14, 16, 18, 20};
        System.out.println(searchUnbounded(arr, 6));   // found quickly without knowing arr.length
    }
}
// OUTPUT:
// 2`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What's the time complexity of exponential search?</td><td>O(log p) where p is the position of the target - the doubling phase takes O(log p) steps, and the subsequent binary search over a range of size O(p) also takes O(log p)</td></tr>
<tr class='text-center'><td>When is exponential search preferred over plain binary search?</td><td>When the array's size is unknown or unbounded (e.g. searching a very large or streamed sorted sequence), or when the target is likely near the beginning, making the doubling phase very cheap</td></tr>
<tr class='text-center'><td>Why is it also called "galloping search"?</td><td>The doubling index-jump pattern resembles a horse's gallop - accelerating strides until overshooting, then refining - a nickname used especially in the context of merging algorithms like TimSort's galloping mode</td></tr>
</table>`
        }
    ]
};
