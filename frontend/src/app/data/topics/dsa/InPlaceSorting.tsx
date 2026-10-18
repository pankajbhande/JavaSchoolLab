import { Topic } from '../../coreJava';

export const inPlaceSorting: Topic = {
    id: 'dsa-sorting-in-place-sorting',
    name: 'In-place Sorting',
    beginner: [
        {
            content: `<h4>What Does "In-Place" Mean?</h4>
An in-place sort uses O(1) (or sometimes O(log n) for recursion stack) EXTRA space beyond the input array - it rearranges elements within the original array rather than building a new one.
<ul>
<li><b>In-place:</b> Bubble Sort, Selection Sort, Insertion Sort, Quick Sort (O(log n) stack), Heap Sort.</li>
<li><b>Not in-place:</b> Merge Sort (needs O(n) auxiliary array), Counting Sort, Radix Sort, Bucket Sort (all need O(n) or O(k) extra structures).</li>
</ul>`,
            codeExamples: [
                `package com.javaschoollab;

public class InPlaceSwapDemo {

    // In-place reversal: O(1) extra space, swaps directly within the array
    static void reverseInPlace(int[] arr) {
        int left = 0, right = arr.length - 1;
        while (left < right) {
            int temp = arr[left];
            arr[left] = arr[right];
            arr[right] = temp;
            left++;
            right--;
        }
    }

    // NOT in-place: allocates a whole new array of the same size
    static int[] reverseWithNewArray(int[] arr) {
        int[] result = new int[arr.length];
        for (int i = 0; i < arr.length; i++) {
            result[arr.length - 1 - i] = arr[i];
        }
        return result;
    }

    public static void main(String[] args) {
        int[] arr = {1, 2, 3, 4, 5};
        reverseInPlace(arr);
        System.out.println(java.util.Arrays.toString(arr));
    }
}
// OUTPUT:
// [5, 4, 3, 2, 1]`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why Merge Sort is Genuinely Hard to Make In-Place</h3>
The merge step compares elements from TWO already-sorted ranges simultaneously while writing results - doing this truly in-place (without a temporary buffer) requires either accepting a much worse time complexity (rotating elements in place, degrading to O(n&sup2;)) or sophisticated techniques like block merge sort. This is exactly why practical implementations accept the O(n) auxiliary space rather than fighting for a true in-place merge.`,
            codeExamples: [
                `package com.javaschoollab;

public class WhyMergeNeedsBufferDemo {

    // Demonstrates the core problem: merging [1,3,5] and [2,4,6] in place
    // would require SHIFTING elements to make room, which is what the
    // temp array avoids entirely.
    public static void main(String[] args) {
        int[] arr = {1, 3, 5, 2, 4, 6};   // two sorted halves: [1,3,5] and [2,4,6]

        // WITHOUT a temp buffer, placing "2" between 1 and 3 requires
        // shifting 3 and 5 rightward - and that shifting cost repeats
        // for every element being merged, degrading toward O(n^2).
        System.out.println("Merging in place without a buffer requires shifting -");
        System.out.println("this is why the standard merge step trades O(n) space for O(n log n) time.");
    }
}
// OUTPUT:
// Merging in place without a buffer requires shifting -
// this is why the standard merge step trades O(n) space for O(n log n) time.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Is Quick Sort truly O(1) extra space?</td><td>Not quite - the recursion itself uses O(log n) stack space on average (O(n) worst case with unbalanced partitions), so it's often described as "in-place" loosely, meaning it doesn't need a separate data structure the size of the input</td></tr>
<tr class='text-center'><td>Why might you accept a non-in-place sort despite the extra memory cost?</td><td>When stability is required (Merge Sort) or when guaranteed worst-case time matters more than memory (Merge Sort's guaranteed O(n log n) vs Quick Sort's O(n^2) worst case)</td></tr>
<tr class='text-center'><td>Does "in-place" mean zero extra memory?</td><td>No - it specifically means O(1) (or sometimes O(log n)) extra space, not literally zero; a few extra variables for indices/temp swaps are still allowed</td></tr>
</table>`
        }
    ]
};
