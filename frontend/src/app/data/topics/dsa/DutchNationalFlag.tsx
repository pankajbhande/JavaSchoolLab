import { Topic } from '../../coreJava';

export const dutchNationalFlag: Topic = {
    id: 'dsa-arrays-dutch-national-flag',
    name: 'Dutch National Flag',
    beginner: [
        {
            content: `<h4>The Dutch National Flag Problem</h4>
Named by Edsger Dijkstra after the three horizontal stripes of the Dutch flag: given an array of only three distinct values (classically 0, 1, 2), sort it in a <b>single pass</b> with O(1) extra space - no counting sort, no comparison sort needed.<br><br>
Three pointers partition the array into three zones as they scan:
<ul>
<li><code>low</code> - boundary of the "all 0s" zone (everything before it is 0)</li>
<li><code>mid</code> - the current element being examined</li>
<li><code>high</code> - boundary of the "all 2s" zone (everything after it is 2)</li>
</ul>`,
            codeExamples: [
                `package com.javaschoollab;

public class DutchFlagDemo {

    // Sorts an array of only 0s, 1s and 2s in one pass, O(n) time, O(1) space
    static void sortColors(int[] arr) {
        int low = 0, mid = 0, high = arr.length - 1;

        while (mid <= high) {
            if (arr[mid] == 0) {
                swap(arr, low, mid);
                low++;
                mid++;              // the swapped-in value at mid is known-good (0 or 1), safe to advance
            } else if (arr[mid] == 1) {
                mid++;               // 1 already belongs in the middle zone
            } else {                 // arr[mid] == 2
                swap(arr, mid, high);
                high--;              // do NOT advance mid - the swapped-in value is unexamined
            }
        }
    }

    static void swap(int[] arr, int i, int j) {
        int temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }

    public static void main(String[] args) {
        int[] arr = {2, 0, 2, 1, 1, 0};
        sortColors(arr);
        System.out.println(java.util.Arrays.toString(arr));
    }
}
// OUTPUT:
// [0, 0, 1, 1, 2, 2]`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why mid Doesn't Advance After Swapping with high</h3>
When <code>arr[mid] == 2</code>, swapping brings an UNKNOWN value from index <code>high</code> into <code>mid</code> - it could be 0, 1, or another 2, and hasn't been classified yet. Advancing <code>mid</code> anyway would skip examining it. Contrast with the <code>low</code> swap: the value that lands at <code>mid</code> from <code>low</code> is guaranteed to be either 0 or 1 (since everything before <code>low</code> was already 0), so it's always safe to move past it.<br><br>
This three-way partitioning is also the core of <b>3-way Quicksort</b>, which handles arrays with many duplicate keys far better than standard 2-way partitioning.`,
            codeExamples: [
                `package com.javaschoollab;

// 3-way partition used inside Quicksort for arrays with many duplicate pivots
public class ThreeWayPartitionDemo {

    static void quickSort3Way(int[] arr, int lo, int hi) {
        if (lo >= hi) return;

        int pivot = arr[lo];
        int lt = lo, gt = hi, i = lo + 1;

        // Exactly the Dutch flag pattern: partition into <pivot, ==pivot, >pivot
        while (i <= gt) {
            if (arr[i] < pivot) {
                swap(arr, lt++, i++);
            } else if (arr[i] > pivot) {
                swap(arr, i, gt--);
            } else {
                i++;
            }
        }
        // arr[lo..lt-1] < pivot, arr[lt..gt] == pivot, arr[gt+1..hi] > pivot
        quickSort3Way(arr, lo, lt - 1);
        quickSort3Way(arr, gt + 1, hi);
    }

    static void swap(int[] arr, int i, int j) {
        int t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }

    public static void main(String[] args) {
        int[] arr = {5, 3, 5, 5, 1, 5, 9, 5};
        quickSort3Way(arr, 0, arr.length - 1);
        System.out.println(java.util.Arrays.toString(arr));
    }
}
// OUTPUT:
// [1, 3, 5, 5, 5, 5, 5, 9]`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is the time and space complexity of the Dutch flag algorithm?</td><td>O(n) time, single pass, O(1) extra space - it's an in-place partition, not a comparison sort</td></tr>
<tr class='text-center'><td>Why can't a simple counting sort be used instead?</td><td>Counting sort works fine here too and is also O(n), but Dutch flag is the go-to answer when the interviewer specifically wants a SINGLE-PASS in-place partition, as with 3-way quicksort partitioning</td></tr>
<tr class='text-center'><td>Where else does this exact 3-pointer partition pattern show up?</td><td>3-way (Dutch-flag) Quicksort partitioning, which is much faster than standard quicksort on arrays with many duplicate keys</td></tr>
</table>`
        }
    ]
};
