import { Topic } from '../coreJava';

export const searchingAlgorithms: Topic = {
    id: 'dsa-searching-linear-search',
    name: 'Linear Search',
    beginner: [
        {
            content: `<h3>Linear Search vs Binary Search</h3>
<ul>
<li><strong>Linear Search</strong> - O(n): checks every element one by one. Works on any array, sorted or not.</li>
<li><strong>Binary Search</strong> - O(log n): repeatedly halves the search range by comparing the middle element. REQUIRES the array to be sorted first.</li>
</ul>`,
            codeExamples: [
                `// Binary search - array MUST be sorted
int binarySearch(int[] arr, int target) {
    int low = 0, high = arr.length - 1;

    while (low <= high) {
        int mid = (low + high) / 2;
        if (arr[mid] == target) {
            return mid; // found
        } else if (arr[mid] < target) {
            low = mid + 1;  // search the right half
        } else {
            high = mid - 1; // search the left half
        }
    }
    return -1; // not found
}

// binarySearch({1,3,5,7,9,11}, 7) -> 3 (index of value 7)`
            ]
        }
    ]
};
