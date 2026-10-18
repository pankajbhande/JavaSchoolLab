import { Topic } from '../../coreJava';

export const binarySearchTopic: Topic = {
    id: 'dsa-searching-binary-search',
    name: 'Binary Search',
    beginner: [
        {
            content: `<h4>Binary Search - O(log n)</h4>
On a SORTED array, repeatedly compare the target against the middle element and discard the half that cannot contain it. Each comparison halves the search space, giving O(log n) instead of linear search's O(n).

<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:12px 0;">
<svg viewBox="0 0 420 70" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;font-family:monospace">
  <g font-size="12">
    <rect x="10" y="10" width="40" height="26" fill="#f3f4f6" stroke="#9ca3af"/><text x="30" y="28" text-anchor="middle" fill="#6b7280">2</text>
    <rect x="50" y="10" width="40" height="26" fill="#f3f4f6" stroke="#9ca3af"/><text x="70" y="28" text-anchor="middle" fill="#6b7280">5</text>
    <rect x="90" y="10" width="40" height="26" fill="#fff7ed" stroke="#ea580c"/><text x="110" y="28" text-anchor="middle" fill="#9a3412">8</text>
    <rect x="130" y="10" width="40" height="26" fill="#f3f4f6" stroke="#9ca3af"/><text x="150" y="28" text-anchor="middle" fill="#6b7280">12</text>
    <rect x="170" y="10" width="40" height="26" fill="#f3f4f6" stroke="#9ca3af"/><text x="190" y="28" text-anchor="middle" fill="#6b7280">16</text>
  </g>
  <text x="10" y="55" font-size="11" fill="#9a3412">target=12: mid=8 &lt; 12 &#8594; discard left half, search [12,16]</text>
</svg>
</div>`,
            codeExamples: [
                `package com.javaschoollab;

public class BinarySearchDemo {

    static int binarySearch(int[] arr, int target) {
        int low = 0, high = arr.length - 1;

        while (low <= high) {
            int mid = low + (high - low) / 2;   // avoids overflow vs (low+high)/2

            if (arr[mid] == target) {
                return mid;
            } else if (arr[mid] < target) {
                low = mid + 1;    // discard the LEFT half
            } else {
                high = mid - 1;   // discard the RIGHT half
            }
        }
        return -1;   // not found
    }

    public static void main(String[] args) {
        int[] arr = {2, 5, 8, 12, 16, 23, 38};
        System.out.println(binarySearch(arr, 12));
        System.out.println(binarySearch(arr, 100));
    }
}
// OUTPUT:
// 3
// -1`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why low + (high - low) / 2 Instead of (low + high) / 2</h3>
For very large arrays, <code>low + high</code> can overflow a 32-bit int before the division happens (e.g. both near <code>Integer.MAX_VALUE</code>), silently producing a negative or wrong mid index. <code>low + (high - low) / 2</code> avoids the intermediate overflow entirely, since <code>high - low</code> is always a reasonably small, non-negative value.`,
            codeExamples: [
                `package com.javaschoollab;

public class BinarySearchOverflowDemo {
    public static void main(String[] args) {
        int low = 1_800_000_000;
        int high = 2_000_000_000;

        int unsafeMid = (low + high) / 2;         // overflows: sum exceeds Integer.MAX_VALUE
        int safeMid = low + (high - low) / 2;     // never overflows

        System.out.println("Unsafe mid: " + unsafeMid);   // wrong, likely negative
        System.out.println("Safe mid  : " + safeMid);     // correct
    }
}
// OUTPUT:
// Unsafe mid: -247483648
// Safe mid  : 1900000000`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What's the precondition for binary search to work correctly?</td><td>The array (or, more generally, the search space) must be sorted / monotonic with respect to the comparison being made - binary search on unsorted data gives no correctness guarantee</td></tr>
<tr class='text-center'><td>Why use low <= high (not low < high) in the loop condition?</td><td>low <= high allows the search space to correctly narrow to exactly one remaining element and still check it, rather than exiting one comparison too early</td></tr>
<tr class='text-center'><td>What's the recursive version's space complexity compared to iterative?</td><td>Recursive: O(log n) extra space for the call stack. Iterative: O(1) - the standard reason interviewers often prefer the iterative form for binary search specifically</td></tr>
</table>`
        }
    ]
};
