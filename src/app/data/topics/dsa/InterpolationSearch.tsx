import { Topic } from '../../coreJava';

export const interpolationSearch: Topic = {
    id: 'dsa-searching-interpolation-search',
    name: 'Interpolation Search',
    beginner: [
        {
            content: `<h4>Guessing WHERE the Target Probably Is</h4>
Binary search always checks the MIDDLE, regardless of the target's value. Interpolation search does better on UNIFORMLY DISTRIBUTED sorted data by estimating a smarter probe position - like flipping to the right page in a phone book directly, instead of always opening to the middle first.
<code>probe = low + (target - arr[low]) * (high - low) / (arr[high] - arr[low])</code>`,
            codeExamples: [
                `package com.javaschoollab;

public class InterpolationSearchDemo {

    static int interpolationSearch(int[] arr, int target) {
        int low = 0, high = arr.length - 1;

        while (low <= high && target >= arr[low] && target <= arr[high]) {
            if (low == high) {
                return (arr[low] == target) ? low : -1;
            }

            // Estimate WHERE the target likely is, proportionally
            int probe = low + (int) ((long) (target - arr[low]) * (high - low) / (arr[high] - arr[low]));

            if (arr[probe] == target) {
                return probe;
            } else if (arr[probe] < target) {
                low = probe + 1;
            } else {
                high = probe - 1;
            }
        }
        return -1;
    }

    public static void main(String[] args) {
        int[] arr = {10, 20, 30, 40, 50, 60, 70, 80, 90, 100};
        System.out.println(interpolationSearch(arr, 70));
    }
}
// OUTPUT:
// 6`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>O(log log n) Average Case, But O(n) Worst Case</h3>
On uniformly distributed data, interpolation search's probe estimate is usually very close to the target's true position, giving an impressive O(log log n) average case. But on SKEWED data (e.g. <code>{1, 2, 3, 4, 5, 1000000}</code>), the linear-interpolation formula makes terrible guesses, degrading to O(n) - worse than binary search's guaranteed O(log n). This is exactly why interpolation search is a specialized tool, not a default replacement for binary search.`,
            codeExamples: [
                `package com.javaschoollab;

public class InterpolationWorstCaseDemo {

    static int interpolationSearch(int[] arr, int target) {
        int low = 0, high = arr.length - 1;
        int probes = 0;

        while (low <= high && target >= arr[low] && target <= arr[high]) {
            probes++;
            if (low == high) {
                System.out.println("Probes used: " + probes);
                return (arr[low] == target) ? low : -1;
            }
            int probe = low + (int) ((long) (target - arr[low]) * (high - low) / (arr[high] - arr[low]));
            if (arr[probe] == target) {
                System.out.println("Probes used: " + probes);
                return probe;
            } else if (arr[probe] < target) {
                low = probe + 1;
            } else {
                high = probe - 1;
            }
        }
        System.out.println("Probes used: " + probes);
        return -1;
    }

    public static void main(String[] args) {
        // Skewed distribution: mostly small values, one huge outlier
        int[] skewed = {1, 2, 3, 4, 5, 6, 7, 8, 9, 1_000_000};
        interpolationSearch(skewed, 9);   // the formula badly misjudges where 9 should be
    }
}
// OUTPUT:
// Probes used: 9
// (nearly a linear scan - interpolation's guess was thrown off by the outlier)`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why is interpolation search's average case O(log log n)?</td><td>On uniformly distributed data, each probe's estimate error shrinks quadratically rather than just halving - a much faster convergence than binary search's guaranteed halving per step</td></tr>
<tr class='text-center'><td>What input pattern makes interpolation search degrade to O(n)?</td><td>Highly skewed/non-uniform data (e.g. one huge outlier among small values) - the linear interpolation formula's position estimate becomes wildly inaccurate, causing the search range to shrink by only one element at a time in the worst case</td></tr>
<tr class='text-center'><td>When would you actually choose interpolation search over binary search in practice?</td><td>Only when you have strong evidence the data is roughly uniformly distributed AND the array is large enough that the average-case speedup matters - binary search's guaranteed worst case makes it the safer default otherwise</td></tr>
</table>`
        }
    ]
};
