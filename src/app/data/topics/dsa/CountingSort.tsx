import { Topic } from '../../coreJava';

export const countingSort: Topic = {
    id: 'dsa-sorting-counting-sort',
    name: 'Counting Sort',
    beginner: [
        {
            content: `<h4>Counting Sort - O(n + k), NOT Comparison-Based</h4>
When elements are integers within a KNOWN, SMALL range <code>[0, k]</code>, counting sort beats every comparison-based sort's O(n log n) floor by never comparing elements at all - it counts occurrences of each value directly.
<ul>
<li>Count how many times each value appears.</li>
<li>Convert counts to a prefix sum - this gives each value's correct FINAL position.</li>
<li>Place each element directly at its computed position.</li>
</ul>`,
            codeExamples: [
                `package com.javaschoollab;

public class CountingSortDemo {

    static int[] countingSort(int[] arr, int maxValue) {
        int[] count = new int[maxValue + 1];
        for (int num : arr) {
            count[num]++;
        }

        // Convert to prefix sum - count[v] now means "how many elements are <= v"
        for (int i = 1; i <= maxValue; i++) {
            count[i] += count[i - 1];
        }

        int[] output = new int[arr.length];
        // Iterate BACKWARD through the input to keep the sort stable
        for (int i = arr.length - 1; i >= 0; i--) {
            output[count[arr[i]] - 1] = arr[i];
            count[arr[i]]--;
        }
        return output;
    }

    public static void main(String[] args) {
        int[] arr = {4, 2, 2, 8, 3, 3, 1};
        System.out.println(java.util.Arrays.toString(countingSort(arr, 8)));
    }
}
// OUTPUT:
// [1, 2, 2, 3, 3, 4, 8]`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why O(n + k) Does NOT Contradict the O(n log n) Comparison Sort Lower Bound</h3>
The famous "no comparison sort beats O(n log n)" theorem applies ONLY to algorithms that sort by COMPARING elements. Counting sort never compares two elements against each other - it uses their VALUES directly as array indices. This sidesteps the lower bound entirely, at the cost of requiring a known, bounded integer range (k) and O(k) extra space, which becomes impractical if k is very large relative to n.`,
            codeExamples: [
                `package com.javaschoollab;

public class CountingSortRangeDemo {
    public static void main(String[] args) {
        // Counting sort shines when k (the value range) is comparable to n
        int[] smallRange = {5, 3, 5, 1, 4, 2, 5, 3};   // values 1-5, n=8 -> great fit
        System.out.println("Good fit: n=" + smallRange.length + ", k=5");

        // But if k were, say, 1,000,000 for the same 8 elements,
        // counting sort would allocate a million-element array for 8 values -
        // comparison-based sorts (O(n log n)) would be far more practical here.
        System.out.println("Bad fit example: n=8, k=1,000,000 -> counting sort wastes huge memory");
    }
}
// OUTPUT:
// Good fit: n=8, k=5
// Bad fit example: n=8, k=1,000,000 -> counting sort wastes huge memory`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What are the preconditions for counting sort to be practical?</td><td>Elements must be integers (or map cleanly to integers) within a known range [0, k], and k should not be dramatically larger than n - otherwise the O(k) space cost dominates</td></tr>
<tr class='text-center'><td>Why iterate BACKWARD through the input during the placement phase?</td><td>It makes the sort stable - placing later-input duplicates first (from the back) means earlier-input duplicates get the higher-index slot within their group after the count is decremented, preserving original relative order</td></tr>
<tr class='text-center'><td>What's counting sort the building block for?</td><td>Radix Sort - which applies counting sort digit-by-digit to sort numbers that would otherwise have too large a range for a single counting sort pass</td></tr>
</table>`
        }
    ]
};
