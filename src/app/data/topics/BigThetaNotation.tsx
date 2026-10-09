import { Topic } from '../coreJava';

export const bigThetaNotation: Topic = {
    id: 'big-theta',
    name: 'Big-Theta',
    beginner: [
        {
            content: `<h3>What is Big-Theta (Θ)?</h3>
Big-Theta notation describes a <strong>tight bound</strong> — it applies when the <strong>best case and
worst case grow at the same rate</strong>. In that situation, Big-O (upper bound) and Big-Omega (lower
bound) meet, and Theta gives the single, precise growth rate. <br><br>

• Written as <code>Θ(f(n))</code>. <br>
• If an algorithm is Θ(n), it means it ALWAYS does work proportional to n — never faster, never slower,
regardless of the specific input. <br>
• Theta is the most informative notation when it applies, because it pins down behavior exactly instead
of just bounding it from one side.`
        },
        {
            content: `<h3>Θ(n) — Simple Single-Pass Sum</h3>
Summing every element of an array always visits every element exactly once — there is no lucky shortcut
and no unlucky slowdown. Best case = worst case = Θ(n).`,
            codeExamples: [`public class ThetaSumDemo {
    static int sum(int[] arr) {
        int total = 0;
        // This loop ALWAYS runs arr.length times, for every possible input
        // Best case = Worst case = Theta(n)
        for (int i = 0; i < arr.length; i++) {
            total += arr[i];
        }
        return total;
    }

    public static void main(String[] args) {
        System.out.println(sum(new int[]{2, 4, 6, 8, 10}));
    }
}
// OUTPUT:
// 30`]
        },
        {
            content: `<h3>Θ(1) — Array Index Access</h3>
Accessing <code>arr[i]</code> always costs the same, single operation, for any array, any index, any
input. Best case and worst case are identical, so it is Θ(1).`,
            codeExamples: [`public class ThetaConstantDemo {
    public static void main(String[] args) {
        int[] arr = {100, 200, 300};
        int value = arr[1]; // Theta(1) - always exactly one lookup
        System.out.println("Value: " + value);
    }
}
// OUTPUT:
// Value: 200`]
        },
        {
            content: `<h3>When Theta Does NOT Apply</h3>
Linear Search does not have a single overall Theta, because its best case (target found first, Ω(1)) and
worst case (target missing, O(n)) grow at different rates. Theta only applies when those two bounds match.`,
            codeExamples: [`public class NoThetaExample {
    static int linearSearch(int[] arr, int target) {
        for (int i = 0; i < arr.length; i++) {
            if (arr[i] == target) return i;
        }
        return -1;
    }
    // Best case:  Omega(1)  (lucky - found at index 0)
    // Worst case: O(n)      (unlucky - missing entirely)
    // Since Omega(1) != O(n), Linear Search has NO general Theta bound.
}`]
        }
    ],

    intermediate: [
        {
            content: `<h3>How to Determine if Theta Applies</h3>
Ask: <strong>"Does this algorithm do the same order of work for every possible input of size n, or does
the amount of work depend on how lucky/unlucky the input is?"</strong> <br><br>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Algorithm</th><th>Best Case</th><th>Worst Case</th><th>Theta?</th></tr>
<tr class='text-center'><td>Sum of array</td><td>Omega(n)</td><td>O(n)</td><td>Theta(n)</td></tr>
<tr class='text-center'><td>Array index access</td><td>Omega(1)</td><td>O(1)</td><td>Theta(1)</td></tr>
<tr class='text-center'><td>Linear Search</td><td>Omega(1)</td><td>O(n)</td><td>No single Theta</td></tr>
<tr class='text-center'><td>Bubble Sort (naive, no early exit)</td><td>Omega(n^2)</td><td>O(n^2)</td><td>Theta(n^2)</td></tr>
<tr class='text-center'><td>Merge Sort</td><td>Omega(n log n)</td><td>O(n log n)</td><td>Theta(n log n)</td></tr>
</table>
<br>
Merge Sort is a great example: unlike Quick Sort (which degrades to O(n^2) on bad pivots) or Bubble Sort
without early-exit optimization, Merge Sort <strong>always</strong> splits and merges in the same pattern
regardless of input order, so its best and worst case coincide at Θ(n log n).`,
            codeExamples: [`public class MergeSortTheta {
    static void mergeSort(int[] arr, int left, int right) {
        if (left >= right) return;
        int mid = (left + right) / 2;
        mergeSort(arr, left, mid);      // always splits, regardless of data
        mergeSort(arr, mid + 1, right); // always splits, regardless of data
        merge(arr, left, mid, right);   // always merges in O(n) per level
    }

    static void merge(int[] arr, int left, int mid, int right) {
        int[] temp = new int[right - left + 1];
        int i = left, j = mid + 1, k = 0;
        while (i <= mid && j <= right) {
            temp[k++] = (arr[i] <= arr[j]) ? arr[i++] : arr[j++];
        }
        while (i <= mid) temp[k++] = arr[i++];
        while (j <= right) temp[k++] = arr[j++];
        System.arraycopy(temp, 0, arr, left, temp.length);
    }
    // Merge Sort ALWAYS does Theta(n log n) work - sorted, reverse-sorted,
    // or random input makes no difference to its split/merge structure.
}`]
        }
    ],

    expert: [
        {
            content: `<h3>Formal Definition</h3>
<code>f(n) = Θ(g(n))</code> means there exist positive constants <code>c1</code>, <code>c2</code>, and
<code>n0</code> such that <code>c1 * g(n) <= f(n) <= c2 * g(n)</code> for all <code>n >= n0</code>. In
words: for large enough n, f(n) is sandwiched between two constant multiples of g(n) - it is bounded both
above (like Big-O) and below (like Big-Omega) by the same function.`
        },
        {
            content: `<h3>Theta Sandwiched Between O and Omega</h3>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Time
  ^
  |                                    ___ c2*g(n)  <- O(g(n)) upper bound
  |                              __--''
  |                        __--''      f(n)  <- actual running time
  |                  __--''       __--'
  |            __--''       __--'
  |      __--''       __--'    ___ c1*g(n)  <- Omega(g(n)) lower bound
  |__--''       __--'
  +------------------------------------------------> n
                n0
   For n >= n0: c1*g(n) <= f(n) <= c2*g(n)  ==>  f(n) = Theta(g(n))</pre>`
        },
        {
            content: `<h3>Complexity Classes as Tight Bounds</h3>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Theta</th><th>Name</th><th>Example Algorithm</th></tr>
<tr class='text-center'><td>Θ(1)</td><td>Constant</td><td>Array index access, push/pop on array-backed stack</td></tr>
<tr class='text-center'><td>Θ(log n)</td><td>Logarithmic</td><td>Binary search (always halves, regardless of luck placement pattern of comparisons)</td></tr>
<tr class='text-center'><td>Θ(n)</td><td>Linear</td><td>Single full-array traversal, finding max element</td></tr>
<tr class='text-center'><td>Θ(n log n)</td><td>Linearithmic</td><td>Merge Sort (always splits/merges the same way)</td></tr>
<tr class='text-center'><td>Θ(n^2)</td><td>Quadratic</td><td>Naive Bubble/Selection Sort without early exit</td></tr>
<tr class='text-center'><td>Θ(2^n)</td><td>Exponential</td><td>Naive recursive Fibonacci (always branches fully)</td></tr>
</table>`
        },
        {
            content: `<h3>Common Mistakes</h3>
• <strong>Using Θ and O interchangeably in casual speech:</strong> technically correct only when best
case equals worst case - saying "Θ(n)" for Linear Search is wrong since its best case is Ω(1). <br>
• <strong>Forgetting that "early exit" optimizations break Theta:</strong> a Bubble Sort with a
"stop if no swaps happened" flag has best case Θ(n) (already sorted input) but worst case O(n^2) -
so with the optimization, it no longer has a single overall Theta. <br>
• <strong>Assuming recursive algorithms are automatically Theta:</strong> Quick Sort's average/typical
case is Θ(n log n), but its worst case (already-sorted input with a poor pivot choice) is O(n^2) - so
plain Quick Sort is NOT Θ(n log n) overall, only on average.`,
            codeExamples: [`public class BubbleSortNoTheta {
    static void bubbleSort(int[] arr) {
        int n = arr.length;
        for (int i = 0; i < n - 1; i++) {
            boolean swapped = false;
            for (int j = 0; j < n - i - 1; j++) {
                if (arr[j] > arr[j + 1]) {
                    int t = arr[j]; arr[j] = arr[j + 1]; arr[j + 1] = t;
                    swapped = true;
                }
            }
            if (!swapped) break; // early exit on already-sorted input
        }
    }
    // Best case (already sorted):  Omega(n)   - one pass, no swaps, exits early
    // Worst case (reverse sorted): O(n^2)     - full nested passes required
    // Omega(n) != O(n^2)  ->  NO single Theta bound for this optimized version
}`]
        },
        {
            content: `<h3>Interview Questions</h3>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What does Big-Theta represent?</td><td>A tight bound - the case when best-case (Ω) and worst-case (O) growth rates are the same</td></tr>
<tr class='text-center'><td>When can you say an algorithm is Theta(f(n))?</td><td>Only when Omega(f(n)) and O(f(n)) both hold for the same f(n)</td></tr>
<tr class='text-center'><td>Is Linear Search Theta(n)?</td><td>No - its best case is Omega(1), which differs from its worst case O(n), so it has no single overall Theta</td></tr>
<tr class='text-center'><td>Why is Merge Sort Theta(n log n) but Quick Sort is not?</td><td>Merge Sort always splits/merges the same way regardless of input; Quick Sort degrades to O(n^2) on already-sorted/poor-pivot input</td></tr>
<tr class='text-center'><td>Give an example of Theta(1).</td><td>Array index access - always exactly one operation for any input</td></tr>
<tr class='text-center'><td>Give an example of Theta(n^2).</td><td>Naive Bubble Sort without an early-exit flag - always does full nested passes</td></tr>
<tr class='text-center'><td>Is Theta stricter or looser than Big-O?</td><td>Stricter - Big-O only bounds from above, Theta bounds from both above and below</td></tr>
</table>`
        }
    ]
};
