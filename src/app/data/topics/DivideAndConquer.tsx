import { Topic } from '../coreJava';

export const divideAndConquer: Topic = {
    id: 'divide-and-conquer',
    name: 'Divide and Conquer',
    beginner: [
        {
            content: `Divide and Conquer is a strategy for solving a problem by breaking it into three steps: <br><br>
• <strong>Divide</strong> - split the problem into smaller sub-problems of the same type. <br>
• <strong>Conquer</strong> - solve each sub-problem recursively (small enough sub-problems are solved
directly). <br>
• <strong>Combine</strong> - merge the sub-problem results into the final solution. <br><br>
Classic examples: Merge Sort, Quick Sort, and Binary Search all use this pattern.`
        },
        {
            content: `<h3>1. Binary Search: The Simplest Divide and Conquer</h3>
Binary Search divides the array in half each time, conquers by checking the middle, and there's nothing
to combine since only one half is ever explored.`,
            codeExamples: [`public class BinarySearchDC {

    static int search(int[] arr, int key, int low, int high) {
        if (low > high) {
            return -1; // base case
        }

        int mid = low + (high - low) / 2; // DIVIDE at the midpoint

        if (arr[mid] == key) {
            return mid; // CONQUER: solved directly
        } else if (arr[mid] < key) {
            return search(arr, key, mid + 1, high); // conquer right half
        } else {
            return search(arr, key, low, mid - 1);  // conquer left half
        }
    }

    public static void main(String[] args) {
        int[] sorted = {2, 5, 8, 12, 16, 23, 38, 45};
        System.out.println("Index of 23: " + search(sorted, 23, 0, sorted.length - 1));
    }
}
// OUTPUT:
// Index of 23: 5`]
        },
        {
            content: `<h3>2. Merge Sort: Divide, Conquer, and Combine</h3>
Merge Sort demonstrates all three steps clearly: divide the array in half, conquer by recursively
sorting each half, then combine by merging the two sorted halves.`,
            codeExamples: [`public class MergeSortDC {

    static void mergeSort(int[] arr, int left, int right) {
        if (left >= right) return; // base case: single element is already sorted

        int mid = left + (right - left) / 2;   // DIVIDE
        mergeSort(arr, left, mid);              // CONQUER left half
        mergeSort(arr, mid + 1, right);         // CONQUER right half
        merge(arr, left, mid, right);           // COMBINE
    }

    static void merge(int[] arr, int left, int mid, int right) {
        int[] leftArr = new int[mid - left + 1];
        int[] rightArr = new int[right - mid];
        System.arraycopy(arr, left, leftArr, 0, leftArr.length);
        System.arraycopy(arr, mid + 1, rightArr, 0, rightArr.length);

        int i = 0, j = 0, k = left;
        while (i < leftArr.length && j < rightArr.length) {
            arr[k++] = (leftArr[i] <= rightArr[j]) ? leftArr[i++] : rightArr[j++];
        }
        while (i < leftArr.length) arr[k++] = leftArr[i++];
        while (j < rightArr.length) arr[k++] = rightArr[j++];
    }

    public static void main(String[] args) {
        int[] numbers = {8, 3, 7, 4, 9, 1};
        mergeSort(numbers, 0, numbers.length - 1);

        for (int n : numbers) System.out.print(n + " ");
    }
}
// OUTPUT:
// 1 3 4 7 8 9`]
        }
    ],

    expert: [
        {
            content: `<h3>Visualizing the Divide / Conquer / Combine Pattern</h3>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">                     ORIGINAL PROBLEM
                            |
                        DIVIDE
                            |
              +-------------+-------------+
              |                           |
        SUB-PROBLEM 1               SUB-PROBLEM 2
              |                           |
          (recurse:                  (recurse:
        divide again until               divide again until
         base case)                       base case)
              |                           |
          CONQUER                     CONQUER
        (solved directly              (solved directly
         at base case)                 at base case)
              |                           |
              +-------------+-------------+
                            |
                        COMBINE
                            |
                     FINAL SOLUTION</pre>`
        },
        {
            content: `<h3>Finding Max and Min With Divide and Conquer</h3>
Instead of a simple linear scan, we can split the array, find max/min of each half recursively, then
combine by comparing the two pairs - useful for illustrating combine logic beyond sorting/searching.`,
            codeExamples: [`public class MaxMinDivideConquer {

    static int[] findMaxMin(int[] arr, int low, int high) {
        if (low == high) {
            return new int[]{arr[low], arr[low]}; // base case: one element
        }

        int mid = low + (high - low) / 2;
        int[] leftResult = findMaxMin(arr, low, mid);       // CONQUER left
        int[] rightResult = findMaxMin(arr, mid + 1, high); // CONQUER right

        int max = Math.max(leftResult[0], rightResult[0]);  // COMBINE
        int min = Math.min(leftResult[1], rightResult[1]);
        return new int[]{max, min};
    }

    public static void main(String[] args) {
        int[] numbers = {12, 45, 3, 67, 22, 9, 88, 1};
        int[] result = findMaxMin(numbers, 0, numbers.length - 1);

        System.out.println("Max = " + result[0] + ", Min = " + result[1]);
    }
}
// OUTPUT:
// Max = 88, Min = 1`]
        },
        {
            content: `<h3>Analyzing Complexity With the Master Theorem</h3>
Divide and conquer recurrences typically look like T(n) = a*T(n/b) + f(n), where the problem of size n is
split into <code>a</code> sub-problems of size n/b, plus f(n) work to combine. <br><br>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Algorithm</th><th>Recurrence</th><th>Resulting Complexity</th></tr>
<tr class='text-center'><td>Binary Search</td><td>T(n) = T(n/2) + O(1)</td><td>O(log n)</td></tr>
<tr class='text-center'><td>Merge Sort</td><td>T(n) = 2T(n/2) + O(n)</td><td>O(n log n)</td></tr>
<tr class='text-center'><td>Quick Sort (avg case)</td><td>T(n) = 2T(n/2) + O(n)</td><td>O(n log n)</td></tr>
<tr class='text-center'><td>Naive Matrix Multiply (D&C)</td><td>T(n) = 8T(n/2) + O(n²)</td><td>O(n³)</td></tr>
</table>`
        },
        {
            content: `<h3>Divide and Conquer vs Dynamic Programming</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>Divide and Conquer</th><th>Dynamic Programming</th></tr>
<tr class='text-center'><td>Sub-problems</td><td>Independent, non-overlapping</td><td>Overlapping - same sub-problem reused</td></tr>
<tr class='text-center'><td>Caching needed?</td><td>No</td><td>Yes - memoization/tabulation</td></tr>
<tr class='text-center'><td>Typical examples</td><td>Merge Sort, Quick Sort, Binary Search</td><td>Fibonacci (DP version), Knapsack, LCS</td></tr>
</table>
<br>
If sub-problems overlap, plain divide and conquer wastes time recomputing them - that is exactly the
signal to switch to Dynamic Programming instead.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What are the three steps of Divide and Conquer?</td><td>Divide, Conquer (solve sub-problems recursively), Combine</td></tr>
<tr><td>Name three classic Divide and Conquer algorithms.</td><td>Merge Sort, Quick Sort, Binary Search</td></tr>
<tr><td>What is the recurrence for Merge Sort and its complexity?</td><td>T(n) = 2T(n/2) + O(n), giving O(n log n)</td></tr>
<tr><td>How does Divide and Conquer differ from Dynamic Programming?</td><td>D&C sub-problems are independent (no overlap, no caching needed); DP sub-problems overlap and are cached</td></tr>
<tr><td>Why is Binary Search O(log n)?</td><td>Each step halves the search space, so after log2(n) halvings only one element remains</td></tr>
<tr><td>What is the "combine" step in Merge Sort?</td><td>Merging the two sorted halves into a single sorted array</td></tr>
<tr><td>Is Quick Sort's worst-case complexity the same as its average case?</td><td>No - average is O(n log n) but worst case (bad pivot choices) is O(n²)</td></tr>
</table>`
        }
    ]
};
