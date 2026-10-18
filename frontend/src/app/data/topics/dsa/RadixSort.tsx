import { Topic } from '../../coreJava';

export const radixSort: Topic = {
    id: 'dsa-sorting-radix-sort',
    name: 'Radix Sort',
    beginner: [
        {
            content: `<h4>Radix Sort - O(d &middot; (n + k)), Digit by Digit</h4>
Sorts multi-digit numbers by processing one digit position at a time, from LEAST significant to most significant, using a STABLE sort (counting sort) at each digit. After processing every digit, the numbers end up fully sorted - d passes of O(n + k) each, where d is the number of digits.`,
            codeExamples: [
                `package com.javaschoollab;

public class RadixSortDemo {

    static void radixSort(int[] arr) {
        int max = getMax(arr);

        // Process one digit place at a time: ones, tens, hundreds, ...
        for (int place = 1; max / place > 0; place *= 10) {
            countingSortByDigit(arr, place);
        }
    }

    static int getMax(int[] arr) {
        int max = arr[0];
        for (int n : arr) max = Math.max(max, n);
        return max;
    }

    // Stable counting sort keyed on one digit (arr[i] / place % 10)
    static void countingSortByDigit(int[] arr, int place) {
        int n = arr.length;
        int[] output = new int[n];
        int[] count = new int[10];   // digits 0-9

        for (int num : arr) {
            count[(num / place) % 10]++;
        }
        for (int i = 1; i < 10; i++) {
            count[i] += count[i - 1];
        }
        for (int i = n - 1; i >= 0; i--) {   // backward for stability
            int digit = (arr[i] / place) % 10;
            output[count[digit] - 1] = arr[i];
            count[digit]--;
        }
        System.arraycopy(output, 0, arr, 0, n);
    }

    public static void main(String[] args) {
        int[] arr = {170, 45, 75, 90, 802, 24, 2, 66};
        radixSort(arr);
        System.out.println(java.util.Arrays.toString(arr));
    }
}
// OUTPUT:
// [2, 24, 45, 66, 75, 90, 170, 802]`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why Radix Sort MUST Use a Stable Sort at Each Digit</h3>
The correctness of Radix Sort hinges entirely on stability. After sorting by the ONES digit, two numbers with the same ones digit are in some relative order; sorting by the TENS digit next must PRESERVE that relative order for numbers that also share the same tens digit - otherwise, work from the previous pass is silently undone. This is exactly why counting sort (which is stable) is the standard choice, never an unstable sort like quicksort.`,
            codeExamples: [
                `package com.javaschoollab;

public class WhyStabilityMattersDemo {
    public static void main(String[] args) {
        // Numbers 23 and 13 both have ones digit 3.
        // After the ones-digit pass, they should stay in their relative order
        // (23 before 13, since 23 appeared first) UNTIL the tens digit sorts them properly.
        int[] arr = {23, 13, 3};

        System.out.println("Before ones-digit pass: " + java.util.Arrays.toString(arr));
        // Ones digit: 23->3, 13->3, 3->3 - all tie! A STABLE sort keeps them as 23, 13, 3.
        // An UNSTABLE sort could shuffle them arbitrarily, corrupting the eventual
        // tens-digit pass's correctness for equal-tens-digit groups.
        System.out.println("Radix sort REQUIRES a stable sort at every digit pass to be correct.");
    }
}
// OUTPUT:
// Before ones-digit pass: [23, 13, 3]
// Radix sort REQUIRES a stable sort at every digit pass to be correct.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is d in Radix Sort's O(d(n+k)) complexity?</td><td>The number of digits in the largest number being sorted - for numbers up to 10^d, that's roughly log(max value)</td></tr>
<tr class='text-center'><td>When is Radix Sort actually faster than a comparison sort in practice?</td><td>When d is small relative to log n (e.g. sorting fixed-width data like phone numbers or dates), Radix Sort's d*(n+k) can beat O(n log n) - but for arbitrary large integers, d can grow enough that the advantage disappears</td></tr>
<tr class='text-center'><td>Does Radix Sort process digits LSB-to-MSB or MSB-to-LSB, and why does it matter?</td><td>The standard version processes Least-Significant-Digit first - this ordering, combined with a stable per-digit sort, guarantees that by the time the most significant digit is processed, everything is fully and correctly ordered</td></tr>
</table>`
        }
    ]
};
