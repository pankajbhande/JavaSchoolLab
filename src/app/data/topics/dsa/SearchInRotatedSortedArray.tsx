import { Topic } from '../../coreJava';

export const searchInRotatedSortedArray: Topic = {
    id: 'dsa-searching-search-in-rotated-sorted-array',
    name: 'Search in Rotated Sorted Array',
    beginner: [
        {
            content: `<h4>Binary Search on a Rotated Array</h4>
A sorted array rotated at some unknown pivot (e.g. <code>[4,5,6,7,0,1,2]</code>) is no longer fully sorted, but at every step, AT LEAST ONE HALF around the midpoint IS sorted. Determine which half is sorted, check if the target lies within that sorted half's range, and recurse into the correct side - still O(log n).

<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:12px 0;">
<svg viewBox="0 0 420 60" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;font-family:monospace">
  <g font-size="12">
    <rect x="10" y="10" width="40" height="26" fill="#ecfdf5" stroke="#059669"/><text x="30" y="28" text-anchor="middle" fill="#065f46">4</text>
    <rect x="50" y="10" width="40" height="26" fill="#ecfdf5" stroke="#059669"/><text x="70" y="28" text-anchor="middle" fill="#065f46">5</text>
    <rect x="90" y="10" width="40" height="26" fill="#ecfdf5" stroke="#059669"/><text x="110" y="28" text-anchor="middle" fill="#065f46">6</text>
    <rect x="130" y="10" width="40" height="26" fill="#fff7ed" stroke="#ea580c"/><text x="150" y="28" text-anchor="middle" fill="#9a3412">7</text>
    <rect x="170" y="10" width="40" height="26" fill="#fef2f2" stroke="#dc2626"/><text x="190" y="28" text-anchor="middle" fill="#991b1b">0</text>
    <rect x="210" y="10" width="40" height="26" fill="#fef2f2" stroke="#dc2626"/><text x="230" y="28" text-anchor="middle" fill="#991b1b">1</text>
    <rect x="250" y="10" width="40" height="26" fill="#fef2f2" stroke="#dc2626"/><text x="270" y="28" text-anchor="middle" fill="#991b1b">2</text>
  </g>
  <text x="290" y="28" font-size="11" fill="#6b7280">left half sorted (green), right half sorted (red)</text>
</svg>
</div>`,
            codeExamples: [
                `package com.javaschoollab;

public class SearchRotatedArrayDemo {

    static int search(int[] arr, int target) {
        int low = 0, high = arr.length - 1;

        while (low <= high) {
            int mid = low + (high - low) / 2;
            if (arr[mid] == target) return mid;

            if (arr[low] <= arr[mid]) {   // LEFT half is sorted
                if (arr[low] <= target && target < arr[mid]) {
                    high = mid - 1;        // target is within the sorted left half
                } else {
                    low = mid + 1;
                }
            } else {                       // RIGHT half is sorted
                if (arr[mid] < target && target <= arr[high]) {
                    low = mid + 1;          // target is within the sorted right half
                } else {
                    high = mid - 1;
                }
            }
        }
        return -1;
    }

    public static void main(String[] args) {
        int[] arr = {4, 5, 6, 7, 0, 1, 2};
        System.out.println(search(arr, 0));
        System.out.println(search(arr, 3));
    }
}
// OUTPUT:
// 4
// -1`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>The Harder Variant - Duplicates Allowed</h3>
When duplicates are allowed (e.g. <code>[1,0,1,1,1]</code>), <code>arr[low] == arr[mid] == arr[high]</code> can happen even though the array IS rotated, making it impossible to tell which half is sorted from that comparison alone. The fix: when this ambiguity occurs, just shrink the search space by one from each side and keep going - this degrades worst-case time to O(n), but only for this specific pathological pattern.`,
            codeExamples: [
                `package com.javaschoollab;

public class SearchRotatedWithDuplicatesDemo {

    static boolean search(int[] arr, int target) {
        int low = 0, high = arr.length - 1;

        while (low <= high) {
            int mid = low + (high - low) / 2;
            if (arr[mid] == target) return true;

            if (arr[low] == arr[mid] && arr[mid] == arr[high]) {
                // Ambiguous case: can't tell which half is sorted
                low++;
                high--;
            } else if (arr[low] <= arr[mid]) {
                if (arr[low] <= target && target < arr[mid]) {
                    high = mid - 1;
                } else {
                    low = mid + 1;
                }
            } else {
                if (arr[mid] < target && target <= arr[high]) {
                    low = mid + 1;
                } else {
                    high = mid - 1;
                }
            }
        }
        return false;
    }

    public static void main(String[] args) {
        int[] arr = {1, 0, 1, 1, 1};
        System.out.println(search(arr, 0));
    }
}
// OUTPUT:
// true`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why is at least one half around mid ALWAYS sorted in a rotated array?</td><td>A single rotation point exists in the whole array; splitting at any mid either keeps the rotation point entirely in one half (making the other half fully sorted) or mid itself is the rotation point</td></tr>
<tr class='text-center'><td>Why does allowing duplicates degrade worst-case time from O(log n) to O(n)?</td><td>The ambiguous arr[low]==arr[mid]==arr[high] case can force shrinking by only one element per step (e.g. an array of all-identical values with one different element), removing the guarantee of halving the search space each time</td></tr>
<tr class='text-center'><td>How would you find the MINIMUM element (the rotation point) in a rotated sorted array?</td><td>A simplified version of the same idea: compare arr[mid] to arr[high] - if arr[mid] > arr[high], the minimum is in the right half; otherwise it's in the left half (including mid)</td></tr>
</table>`
        }
    ]
};
