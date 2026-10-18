import { Topic } from '../coreJava';

export const complexityAnalysis: Topic = {
    id: 'dsa-foundations-time-complexity-big-o-omega-theta',
    name: 'Time Complexity - Big O, Omega, Theta',
    beginner: [
        {
            content: `<h3>What is Algorithm Complexity?</h3>
<ul>
<li><strong>Time complexity</strong> describes how an algorithm's running time grows as the input size (n) grows. <strong>Space complexity</strong> describes how memory usage grows.</li>
<li><strong>Big-O notation</strong> expresses the WORST-CASE growth rate, ignoring constant factors - it answers "how does this scale?" not "how many milliseconds does it take?"</li>
</ul>

<h4>Common Complexities (fastest to slowest)</h4>
1. O(1) - Constant: array index access.<br>
2. O(log n) - Logarithmic: binary search.<br>
3. O(n) - Linear: a single loop over n elements.<br>
4. O(n log n) - Linearithmic: efficient sorting (merge sort, quicksort average case).<br>
5. O(n&sup2;) - Quadratic: nested loops over n elements (bubble sort).<br>
6. O(2&#8319;) - Exponential: naive recursive Fibonacci.<br>`,
            codeExamples: [
                `// O(1) - constant time, regardless of array size
int getFirst(int[] arr) {
    return arr[0];
}

// O(n) - linear time, grows directly with array size
int sum(int[] arr) {
    int total = 0;
    for (int num : arr) { // runs n times
        total += num;
    }
    return total;
}

// O(n^2) - quadratic time, nested loop over the same n elements
void printAllPairs(int[] arr) {
    for (int i = 0; i < arr.length; i++) {
        for (int j = 0; j < arr.length; j++) { // n iterations inside n iterations
            System.out.println(arr[i] + ", " + arr[j]);
        }
    }
}`
            ]
        }
    ]
};
