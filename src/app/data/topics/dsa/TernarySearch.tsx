import { Topic } from '../../coreJava';

export const ternarySearch: Topic = {
    id: 'dsa-searching-ternary-search',
    name: 'Ternary Search',
    beginner: [
        {
            content: `<h4>Finding the Peak of a Unimodal Function</h4>
Ternary search finds the MAXIMUM (or minimum) of a UNIMODAL function - one that strictly increases then strictly decreases (or vice versa) - by comparing two midpoints per step and discarding a THIRD of the search space. Not for finding a specific VALUE (that's binary search's job) - this is for finding an EXTREME POINT.`,
            codeExamples: [
                `package com.javaschoollab;

public class TernarySearchDemo {

    // Finds the index of the maximum value in a strictly-increasing-then-decreasing array
    static int findPeak(int[] arr) {
        int low = 0, high = arr.length - 1;

        while (high - low > 2) {
            int m1 = low + (high - low) / 3;
            int m2 = high - (high - low) / 3;

            if (arr[m1] < arr[m2]) {
                low = m1 + 1;   // peak cannot be in the leftmost third
            } else {
                high = m2 - 1;  // peak cannot be in the rightmost third
            }
        }

        // Small enough remaining range - just scan it directly
        int peakIndex = low;
        for (int i = low; i <= high; i++) {
            if (arr[i] > arr[peakIndex]) peakIndex = i;
        }
        return peakIndex;
    }

    public static void main(String[] args) {
        int[] arr = {1, 3, 8, 12, 15, 10, 6, 2};
        int peak = findPeak(arr);
        System.out.println("Peak at index " + peak + ", value " + arr[peak]);
    }
}
// OUTPUT:
// Peak at index 4, value 15`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why Ternary Search is O(log&#8323; n), Not Necessarily Faster Than Binary Search</h3>
Ternary search does MORE work per iteration (two comparisons instead of one) but discards a smaller fraction per step (1/3 instead of 1/2) - the net effect is actually WORSE than doing two rounds of binary search for the same purpose. Ternary search's real value isn't speed - it's correctness on unimodal functions where binary search's ordering assumption doesn't directly apply.`,
            codeExamples: [
                `package com.javaschoollab;

public class TernarySearchOnFunctionDemo {

    // Finds the x that MINIMIZES f(x) = (x-3)^2 + 1 over a real-valued range
    static double f(double x) {
        return (x - 3) * (x - 3) + 1;
    }

    static double ternarySearchMin(double low, double high, int iterations) {
        for (int i = 0; i < iterations; i++) {
            double m1 = low + (high - low) / 3;
            double m2 = high - (high - low) / 3;

            if (f(m1) > f(m2)) {
                low = m1;   // minimum cannot be in [low, m1]
            } else {
                high = m2;  // minimum cannot be in [m2, high]
            }
        }
        return (low + high) / 2;
    }

    public static void main(String[] args) {
        double x = ternarySearchMin(-10, 10, 100);
        System.out.printf("Minimum near x = %.4f, f(x) = %.4f%n", x, f(x));
    }
}
// OUTPUT:
// Minimum near x = 3.0000, f(x) = 1.0000`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What does "unimodal" mean, and why does ternary search require it?</td><td>A function that strictly increases then strictly decreases (or the reverse) - exactly one peak or valley; without this property, comparing two midpoints can't reliably determine which third to discard</td></tr>
<tr class='text-center'><td>Is ternary search faster than binary search?</td><td>No - despite the catchy "divide into three parts" framing, its per-step work and convergence rate make it slightly SLOWER in practice than repeated binary search for equivalent problems; its purpose is correctness on unimodal shapes, not speed</td></tr>
<tr class='text-center'><td>What's a real DSA problem where ternary search is the natural tool?</td><td>Finding the point on a line/curve minimizing distance to a set of points, or finding the optimal "meeting point" minimizing total travel cost in certain formulations - continuous optimization over a unimodal cost function</td></tr>
</table>`
        }
    ]
};
