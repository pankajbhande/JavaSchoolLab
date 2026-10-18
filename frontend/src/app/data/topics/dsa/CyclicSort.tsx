import { Topic } from '../../coreJava';

export const cyclicSort: Topic = {
    id: 'dsa-arrays-cyclic-sort',
    name: 'Cyclic Sort',
    beginner: [
        {
            content: `<h4>What is Cyclic Sort?</h4>
Cyclic Sort is a specialized O(n) sorting technique for arrays containing numbers in a known, bounded range like <code>[1, n]</code> or <code>[0, n-1]</code> - each number's VALUE tells you its correct index. Instead of comparing elements, swap each value directly to the index it belongs at.
<ul>
<li>At index <code>i</code>, the correct value is <code>i + 1</code> (for a 1..n range).</li>
<li>If <code>arr[i]</code> isn't already correct, swap it to its rightful home and check again - don't advance <code>i</code> until the current slot is correct.</li>
</ul>
This "swap into place" idea is also the base for a whole family of "find the missing/duplicate number" problems.`,
            codeExamples: [
                `package com.javaschoollab;

public class CyclicSortDemo {

    // Sorts an array containing exactly the numbers 1..n, in O(n)
    static void cyclicSort(int[] arr) {
        int i = 0;
        while (i < arr.length) {
            int correctIndex = arr[i] - 1;   // where arr[i] SHOULD live
            if (arr[i] != arr[correctIndex]) {
                // swap arr[i] into its correct slot
                int temp = arr[i];
                arr[i] = arr[correctIndex];
                arr[correctIndex] = temp;
            } else {
                i++;   // arr[i] is already correct (or a duplicate), move on
            }
        }
    }

    public static void main(String[] args) {
        int[] arr = {3, 1, 5, 4, 2};
        cyclicSort(arr);
        System.out.println(java.util.Arrays.toString(arr));
    }
}
// OUTPUT:
// [1, 2, 3, 4, 5]`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Finding the Missing Number - The Real Power of Cyclic Sort</h3>
After a cyclic sort pass, ANY index <code>i</code> where <code>arr[i] != i + 1</code> immediately points at a missing or duplicate number - no second pass or hash set needed.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.ArrayList;
import java.util.List;

public class FindAllMissingNumbersDemo {

    // arr has n elements, values in [1, n], some missing, some duplicated.
    // Find every missing number in O(n) time, O(1) extra space (besides output).
    static List<Integer> findMissingNumbers(int[] arr) {
        int i = 0;
        while (i < arr.length) {
            int correctIndex = arr[i] - 1;
            if (arr[i] != arr[correctIndex]) {
                int temp = arr[i];
                arr[i] = arr[correctIndex];
                arr[correctIndex] = temp;
            } else {
                i++;
            }
        }

        List<Integer> missing = new ArrayList<>();
        for (int idx = 0; idx < arr.length; idx++) {
            if (arr[idx] != idx + 1) {
                missing.add(idx + 1);   // the value that SHOULD be here
            }
        }
        return missing;
    }

    public static void main(String[] args) {
        int[] arr = {4, 3, 3, 7, 1, 6, 1};   // n=7, missing 2 and 5
        System.out.println(findMissingNumbers(arr));
    }
}
// OUTPUT:
// [2, 5]`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why is cyclic sort O(n) when it has a swapping loop nested inside a while loop?</td><td>Each swap places at least one value into its FINAL correct position - across the whole run, at most n swaps total happen, giving O(n) amortized despite the nested-looking structure</td></tr>
<tr class='text-center'><td>What class of problems is cyclic sort the classic solution for?</td><td>"Find the missing number", "find all duplicates", "find the first missing positive" - any problem with values in a known, small range tied to array indices</td></tr>
<tr class='text-center'><td>Why doesn't cyclic sort work for arbitrary unbounded integers?</td><td>It relies on the value directly telling you the target index (value - 1); with unbounded or negative values there's no valid index to map to</td></tr>
</table>`
        }
    ]
};
