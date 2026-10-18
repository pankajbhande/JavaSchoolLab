import { Topic } from '../../coreJava';

export const upperBound: Topic = {
    id: 'dsa-searching-upper-bound',
    name: 'Upper Bound',
    beginner: [
        {
            content: `<h4>What is Upper Bound?</h4>
The upper bound of a target is the index of the FIRST element that is STRICTLY greater than target - one position past the last occurrence of target, if it exists. Only one comparison changes from lower bound: <code>&le;</code> instead of <code>&lt;</code>.`,
            codeExamples: [
                `package com.javaschoollab;

public class UpperBoundDemo {

    static int upperBound(int[] arr, int target) {
        int low = 0, high = arr.length;

        while (low < high) {
            int mid = low + (high - low) / 2;
            if (arr[mid] <= target) {
                low = mid + 1;   // arr[mid] is not strictly greater - keep searching right
            } else {
                high = mid;
            }
        }
        return low;   // first index where arr[index] > target
    }

    public static void main(String[] args) {
        int[] arr = {1, 3, 3, 3, 5, 7};
        System.out.println(upperBound(arr, 3));   // one past the LAST occurrence of 3
        System.out.println(upperBound(arr, 4));   // 4 not present
    }
}
// OUTPUT:
// 4
// 4`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Counting Occurrences with Lower + Upper Bound Together</h3>
The count of a target's occurrences in a sorted array is exactly <code>upperBound(target) - lowerBound(target)</code> - two O(log n) searches, no scanning needed, even when the target appears thousands of times.`,
            codeExamples: [
                `package com.javaschoollab;

public class CountOccurrencesDemo {

    static int lowerBound(int[] arr, int target) {
        int low = 0, high = arr.length;
        while (low < high) {
            int mid = low + (high - low) / 2;
            if (arr[mid] < target) low = mid + 1; else high = mid;
        }
        return low;
    }

    static int upperBound(int[] arr, int target) {
        int low = 0, high = arr.length;
        while (low < high) {
            int mid = low + (high - low) / 2;
            if (arr[mid] <= target) low = mid + 1; else high = mid;
        }
        return low;
    }

    static int countOccurrences(int[] arr, int target) {
        return upperBound(arr, target) - lowerBound(arr, target);
    }

    public static void main(String[] args) {
        int[] arr = {1, 2, 2, 2, 2, 3, 4, 5};
        System.out.println(countOccurrences(arr, 2));
        System.out.println(countOccurrences(arr, 10));
    }
}
// OUTPUT:
// 4
// 0`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What's the ONE line that differs between lower bound and upper bound code?</td><td>The comparison inside the loop: lower bound uses arr[mid] < target, upper bound uses arr[mid] <= target - everything else is identical</td></tr>
<tr class='text-center'><td>Why is "upperBound - lowerBound" the count, and not "upperBound - lowerBound + 1"?</td><td>Lower bound is the FIRST occurrence's index; upper bound is one PAST the last occurrence - so the difference already counts exactly the span of matching elements, no +1 needed</td></tr>
<tr class='text-center'><td>What's the overall time complexity of counting occurrences this way?</td><td>O(log n) - two independent binary searches, dramatically better than an O(n) linear scan for large arrays with many duplicates</td></tr>
</table>`
        }
    ]
};
