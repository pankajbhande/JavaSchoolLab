import { Topic } from '../coreJava';

export const sortingAlgorithms: Topic = {
    id: 'dsa-sorting-bubble-sort',
    name: 'Bubble Sort',
    beginner: [
        {
            content: `<h3>Bubble Sort - O(n&sup2;)</h3>
Repeatedly compares adjacent elements and swaps them if out of order, "bubbling" the largest unsorted element to the end each pass. Simple to understand, but inefficient for large inputs.<br>`,
            codeExamples: [
                `void bubbleSort(int[] arr) {
    int n = arr.length;
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                // swap
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
}

// Example: {5, 2, 8, 1, 9} -> {1, 2, 5, 8, 9}`
            ]
        }
    ],
    intermediate: [
        {
            content: `<h4>Merge Sort - O(n log n)</h4>
A "divide and conquer" algorithm: recursively splits the array in half until each piece has 1 element, then merges the sorted halves back together. Much faster than O(n&sup2;) sorts on large inputs, and stable (equal elements keep their relative order).<br>`,
            codeExamples: [
                `void mergeSort(int[] arr, int left, int right) {
    if (left >= right) return; // base case: 1 element is already "sorted"

    int mid = (left + right) / 2;
    mergeSort(arr, left, mid);       // sort left half
    mergeSort(arr, mid + 1, right);  // sort right half
    merge(arr, left, mid, right);    // merge the two sorted halves
}

void merge(int[] arr, int left, int mid, int right) {
    int[] temp = new int[right - left + 1];
    int i = left, j = mid + 1, k = 0;

    while (i <= mid && j <= right) {
        temp[k++] = (arr[i] <= arr[j]) ? arr[i++] : arr[j++];
    }
    while (i <= mid) temp[k++] = arr[i++];
    while (j <= right) temp[k++] = arr[j++];

    System.arraycopy(temp, 0, arr, left, temp.length);
}
// Splits {5,2,8,1,9} down to single elements, then merges them back in sorted order`
            ]
        }
    ]
};
