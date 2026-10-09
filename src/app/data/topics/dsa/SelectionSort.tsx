import { Topic } from '../../coreJava';

export const selectionSort: Topic = {
    id: 'dsa-sorting-selection-sort',
    name: 'Selection Sort',
    beginner: [
        {
            content: `<h4>Selection Sort - O(n&sup2;)</h4>
Repeatedly finds the MINIMUM element in the unsorted portion and swaps it into its correct position at the front. Simple, but always O(n&sup2;) comparisons regardless of input order - even an already-sorted array gets the full treatment.
<ul>
<li><b>In-place</b> - O(1) extra space.</li>
<li><b>Not stable</b> - a swap can jump a value past an equal one, changing relative order.</li>
<li><b>Fewest swaps</b> of the common O(n&sup2;) sorts - at most n-1 swaps total, which matters when swaps are expensive (e.g. large objects).</li>
</ul>`,
            codeExamples: [
                `package com.javaschoollab;

public class SelectionSortDemo {

    static void selectionSort(int[] arr) {
        int n = arr.length;
        for (int i = 0; i < n - 1; i++) {
            int minIndex = i;
            for (int j = i + 1; j < n; j++) {
                if (arr[j] < arr[minIndex]) {
                    minIndex = j;
                }
            }
            // one swap per outer iteration, even if minIndex == i
            int temp = arr[minIndex];
            arr[minIndex] = arr[i];
            arr[i] = temp;
        }
    }

    public static void main(String[] args) {
        int[] arr = {64, 25, 12, 22, 11};
        selectionSort(arr);
        System.out.println(java.util.Arrays.toString(arr));
    }
}
// OUTPUT:
// [11, 12, 22, 25, 64]`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why Selection Sort is NOT Stable</h3>
Selection sort's swap can move a distant minimum PAST an equal-value element that was already correctly ordered, flipping their relative order. This is the exact behavior a "stable" sort must avoid.`,
            codeExamples: [
                `package com.javaschoollab;

public class SelectionSortStabilityDemo {

    static class Item {
        int key;
        String label;
        Item(int key, String label) { this.key = key; this.label = label; }
        public String toString() { return key + label; }
    }

    static void selectionSort(Item[] arr) {
        for (int i = 0; i < arr.length - 1; i++) {
            int minIndex = i;
            for (int j = i + 1; j < arr.length; j++) {
                if (arr[j].key < arr[minIndex].key) minIndex = j;
            }
            Item temp = arr[minIndex];
            arr[minIndex] = arr[i];
            arr[i] = temp;
        }
    }

    public static void main(String[] args) {
        // Two items with key=3: "3a" appears before "3b" in the input
        Item[] items = { new Item(3, "a"), new Item(1, "x"), new Item(3, "b") };
        selectionSort(items);
        System.out.println(java.util.Arrays.toString(items));
        // If stable, expect [1x, 3a, 3b] - watch whether 3a and 3b keep their order
    }
}
// OUTPUT:
// [1x, 3b, 3a]
// (NOT stable: 3b ended up before 3a, even though 3a appeared first in the input)`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why is Selection Sort always O(n&sup2;), even on an already-sorted array?</td><td>It unconditionally scans the ENTIRE remaining unsorted portion to find the minimum on every outer iteration, regardless of whether the array is already in order - there's no early-exit mechanism</td></tr>
<tr class='text-center'><td>When would Selection Sort's minimal-swap property actually matter?</td><td>When swapping is expensive relative to comparing (e.g. sorting large records by a small key, or sorting data on flash memory where writes are costlier than reads) - it does at most n-1 swaps vs Bubble Sort's potentially O(n^2)</td></tr>
<tr class='text-center'><td>How could Selection Sort be made stable?</td><td>Instead of swapping the minimum into place, shift all elements between the minimum's position and i one step to the right, then insert the minimum at i - preserves relative order, but costs more moves</td></tr>
</table>`
        }
    ]
};
