import { Topic } from '../coreJava';

export const bigONotation: Topic = {
    id: 'big-o',
    name: 'Big-O',
    beginner: [
        {
            content: `<h3>What is Big-O Notation?</h3>
Big-O notation describes how the <strong>running time (or memory usage)</strong> of a program grows as the
input size (usually called <code>n</code>) grows. <br><br>

It answers one question: <strong>"If I double my input, roughly how much slower does my code get?"</strong><br><br>

• Big-O describes the <strong>worst case / upper bound</strong> — the maximum amount of work the algorithm
could possibly do for a given input size. <br>
• It ignores machine speed, JVM warm-up, constant factors — it only cares about the <strong>shape</strong> of
growth as <code>n</code> gets large. <br>
• It is written as <code>O(f(n))</code>, e.g. <code>O(n)</code>, <code>O(n^2)</code>, <code>O(log n)</code>. <br><br>

Think of Big-O as a "speed label" on an algorithm, similar to how a car has a fuel-efficiency rating —
it tells you what to expect, not the exact number for every trip.`
        },
        {
            content: `<h3>O(1) — Constant Time</h3>
The operation takes the <strong>same amount of time no matter how big the input is</strong>. Accessing an
array element by index is the classic example — the JVM computes the memory address directly, it does not
scan anything.`,
            codeExamples: [`public class ConstantTimeDemo {
    public static void main(String[] args) {
        int[] arr = {10, 20, 30, 40, 50};

        // O(1) - accessing by index takes the same time
        // whether arr has 5 elements or 5 million elements
        int value = arr[0];
        System.out.println("First element: " + value);

        // O(1) - HashMap.get() is average O(1) too
        java.util.Map<String, Integer> map = new java.util.HashMap<>();
        map.put("age", 25);
        int age = map.get("age"); // O(1) average
        System.out.println("Age: " + age);
    }
}
// OUTPUT:
// First element: 10
// Age: 25`]
        },
        {
            content: `<h3>O(n) — Linear Time</h3>
The work grows <strong>directly proportional</strong> to the input size. A single loop over every element of
an array/list is the textbook example — double the elements, double the time.`,
            codeExamples: [`public class LinearTimeDemo {
    public static void main(String[] args) {
        int[] arr = {4, 8, 15, 16, 23, 42};
        int sum = 0;

        // O(n) - the loop runs exactly n times, one pass over the array
        for (int i = 0; i < arr.length; i++) {
            sum += arr[i];
        }

        System.out.println("Sum = " + sum);
    }
}
// OUTPUT:
// Sum = 108`]
        },
        {
            content: `<h3>O(n^2) — Quadratic Time</h3>
Occurs with <strong>nested loops</strong> where each loop runs roughly n times — total work is n * n. This is
common in naive algorithms like Bubble Sort or brute-force pair comparisons.`,
            codeExamples: [`public class QuadraticTimeDemo {
    public static void main(String[] args) {
        int[] arr = {5, 2, 9, 1, 5, 6};

        // O(n^2) - outer loop runs n times,
        // inner loop runs n times for EACH outer iteration
        for (int i = 0; i < arr.length; i++) {           // n
            for (int j = 0; j < arr.length - 1; j++) {    // n
                if (arr[j] > arr[j + 1]) {                 // constant work
                    int temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                }
            }
        }
        System.out.println(java.util.Arrays.toString(arr));
    }
}
// OUTPUT:
// [1, 2, 5, 5, 6, 9]  (bubble sort result, O(n^2))`]
        },
        {
            content: `<h3>O(log n) — Logarithmic Time</h3>
The problem size is <strong>cut in half (or divided) each step</strong>, so the work grows very slowly even for
huge inputs. Binary search on a sorted array is the classic example — searching 1,000,000 elements takes only
about 20 comparisons, not 1,000,000.`,
            codeExamples: [`public class LogTimeDemo {
    public static void main(String[] args) {
        int[] sorted = {1, 3, 5, 7, 9, 11, 13, 15, 17, 19};
        System.out.println(binarySearch(sorted, 13));
    }

    // O(log n) - every comparison eliminates HALF the remaining elements
    static int binarySearch(int[] arr, int target) {
        int low = 0, high = arr.length - 1;
        while (low <= high) {           // runs ~log2(n) times, not n times
            int mid = (low + high) / 2;
            if (arr[mid] == target) return mid;
            else if (arr[mid] < target) low = mid + 1;
            else high = mid - 1;
        }
        return -1;
    }
}
// OUTPUT:
// 6   (index of value 13)`]
        }
    ],

    intermediate: [
        {
            content: `<h3>Deriving Big-O from Code — A Practical Method</h3>
When looking at a method, ask: <br><br>

1. <strong>Single loop over n items?</strong> → O(n) <br>
2. <strong>Loop nested inside another loop, both over n?</strong> → O(n^2) <br>
3. <strong>Loop that divides the problem in half each time (like binary search)?</strong> → O(log n) <br>
4. <strong>Loop over n combined with a divide-and-conquer sort/recursion (like Merge Sort)?</strong> → O(n log n) <br>
5. <strong>Recursion that branches into 2 calls per level (like naive Fibonacci)?</strong> → O(2^n) <br><br>

<strong>Rule of thumb:</strong> count the loops that depend on <code>n</code>, multiply their bounds together,
then drop constants and lower-order terms — see the Expert section for a full worked example.`
        },
        {
            content: `<h3>Common Java Collection Operation Complexities</h3>
Knowing Big-O for standard library operations is essential for writing efficient Java and for interviews.<br><br>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Operation</th><th>ArrayList</th><th>LinkedList</th><th>HashMap</th><th>TreeMap</th></tr>
<tr class='text-center'><td>get(index) / get(key)</td><td>O(1)</td><td>O(n)</td><td>O(1) avg</td><td>O(log n)</td></tr>
<tr class='text-center'><td>add at end</td><td>O(1) amortized</td><td>O(1)</td><td>O(1) avg</td><td>O(log n)</td></tr>
<tr class='text-center'><td>add/remove at front</td><td>O(n)</td><td>O(1)</td><td>-</td><td>-</td></tr>
<tr class='text-center'><td>contains(x)</td><td>O(n)</td><td>O(n)</td><td>O(1) avg</td><td>O(log n)</td></tr>
<tr class='text-center'><td>remove(index/key)</td><td>O(n)</td><td>O(n)*</td><td>O(1) avg</td><td>O(log n)</td></tr>
</table>
<br>
*LinkedList remove is O(n) to find the node, but O(1) once you already hold a reference to it (e.g. via
an Iterator). <br><br>

<strong>Why is ArrayList.get() O(1) but LinkedList.get() O(n)?</strong> ArrayList is backed by a real array
in memory, so index access is a direct memory offset calculation. LinkedList is a chain of nodes with
pointers — to reach index 500 it must walk 500 node links from the head (or tail, whichever is closer).`,
            codeExamples: [`import java.util.*;

public class CollectionComplexityDemo {
    public static void main(String[] args) {
        List<Integer> arrayList = new ArrayList<>();
        List<Integer> linkedList = new LinkedList<>();

        for (int i = 0; i < 100000; i++) {
            arrayList.add(i);   // O(1) amortized
            linkedList.add(i);  // O(1)
        }

        long start = System.nanoTime();
        int a = arrayList.get(99999); // O(1) - direct index math
        long arrayTime = System.nanoTime() - start;

        start = System.nanoTime();
        int b = linkedList.get(99999); // O(n) - must walk all 100000 nodes
        long linkedTime = System.nanoTime() - start;

        System.out.println("ArrayList.get() took: " + arrayTime + " ns");
        System.out.println("LinkedList.get() took: " + linkedTime + " ns (much slower)");
    }
}
// OUTPUT (illustrative - LinkedList.get is dramatically slower):
// ArrayList.get() took: 900 ns
// LinkedList.get() took: 450000 ns (much slower)`]
        }
    ],

    expert: [
        {
            content: `<h3>The Standard Complexity Classes</h3>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Big-O</th><th>Name</th><th>Example Algorithm</th></tr>
<tr class='text-center'><td>O(1)</td><td>Constant</td><td>Array index access, HashMap.get()</td></tr>
<tr class='text-center'><td>O(log n)</td><td>Logarithmic</td><td>Binary search, balanced BST lookup (TreeMap)</td></tr>
<tr class='text-center'><td>O(n)</td><td>Linear</td><td>Single loop, linear search, array traversal</td></tr>
<tr class='text-center'><td>O(n log n)</td><td>Linearithmic</td><td>Merge Sort, Quick Sort (avg), Collections.sort()</td></tr>
<tr class='text-center'><td>O(n^2)</td><td>Quadratic</td><td>Bubble Sort, Selection Sort, nested loops</td></tr>
<tr class='text-center'><td>O(2^n)</td><td>Exponential</td><td>Naive recursive Fibonacci, subset generation</td></tr>
</table>`
        },
        {
            content: `<h3>Growth Curves Compared</h3>
The gap between these classes explodes as n grows - this is why an O(n^2) algorithm that feels fine on
100 items can freeze on 1,000,000.<br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Operations
  ^
  |                                             *  O(2^n)
  |                                          *
  |                                       *
  |                                   *
  |                              *              O(n^2)
  |                          *          *
  |                       *          *
  |                    *         *
  |                *          *          O(n log n)
  |             *         *
  |          *        *              O(n)
  |       *       *              *
  |    *      *          *   *   *   *   *  O(log n)
  |  *    *  *   *   *
  +------------------------------------------------> n
     small n                              large n</pre>

<strong>Reading it:</strong> O(1) and O(log n) stay nearly flat. O(n) is a straight diagonal. O(n log n) is
just slightly steeper than O(n). O(n^2) curves sharply upward. O(2^n) becomes unusable within a handful
of steps.`
        },
        {
            content: `<h3>Worked Example: Deriving Big-O Step by Step</h3>`,
            codeExamples: [`public class DerivationExample {

    static void process(int[] arr) {
        int n = arr.length;

        int x = arr[0];                 // O(1)  - single statement

        for (int i = 0; i < n; i++) {   // O(n)  - loop runs n times
            System.out.println(arr[i]);
        }

        for (int i = 0; i < n; i++) {       // O(n)
            for (int j = 0; j < n; j++) {   // O(n) nested inside -> O(n*n) = O(n^2)
                System.out.println(arr[i] + arr[j]);
            }
        }
    }
    // Total = O(1) + O(n) + O(n^2)
    //       -> drop constants and lower-order terms
    //       -> Big-O reports only the FASTEST-GROWING term
    //       -> Final answer: O(n^2)
}`]
        },
        {
            content: `<h3>Common Mistakes When Analyzing Complexity</h3>
• <strong>Confusing "two separate loops" with "nested loops":</strong> two sequential loops over n is
O(n) + O(n) = O(2n) = O(n), not O(n^2). Only nested loops multiply. <br>
• <strong>Forgetting hidden loops inside library calls:</strong> <code>list.contains(x)</code> on an
ArrayList is O(n) internally - calling it inside another loop silently creates O(n^2). <br>
• <strong>Ignoring amortized cost:</strong> ArrayList.add() looks O(1) but occasionally triggers an O(n)
resize - Big-O for a sequence of n adds is still O(n) total, O(1) amortized (see the Amortized Complexity topic). <br>
• <strong>Mixing up best case and worst case:</strong> Big-O is the worst case / upper bound; the best
case is described by Big-Omega, and when both match, by Big-Theta. <br>
• <strong>Assuming string concatenation is O(1):</strong> <code>str += x</code> in a loop is O(n) per
concatenation because Strings are immutable, making the whole loop O(n^2) - use StringBuilder instead.`,
            codeExamples: [`public class HiddenComplexityMistake {
    public static void main(String[] args) {
        java.util.List<Integer> list = new java.util.ArrayList<>();
        for (int i = 0; i < 1000; i++) list.add(i);

        // MISTAKE: looks like O(n) but contains() on ArrayList is O(n)
        // so this whole block is actually O(n^2)
        int found = 0;
        for (int i = 0; i < list.size(); i++) {      // O(n)
            if (list.contains(i)) {                  // O(n) - hidden!
                found++;
            }
        }
        System.out.println("Found: " + found);

        // FIX: use a HashSet for O(1) average contains()
        java.util.Set<Integer> set = new java.util.HashSet<>(list);
        found = 0;
        for (int i = 0; i < list.size(); i++) {  // O(n)
            if (set.contains(i)) {               // O(1) average
                found++;
            }
        }
        System.out.println("Found (fast): " + found);
    }
}
// OUTPUT:
// Found: 1000
// Found (fast): 1000`]
        },
        {
            content: `<h3>Interview Questions</h3>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What does Big-O actually measure?</td><td>The upper bound / worst-case growth rate of time or space as input size n increases</td></tr>
<tr class='text-center'><td>Why do we drop constants, e.g. O(2n) becomes O(n)?</td><td>Big-O describes growth trend for large n, not exact operation counts - constant factors don't change the shape of the curve</td></tr>
<tr class='text-center'><td>Why is ArrayList.get(i) O(1) but LinkedList.get(i) O(n)?</td><td>ArrayList uses direct index math on a backed array; LinkedList must traverse node-by-node from head/tail</td></tr>
<tr class='text-center'><td>What is the complexity of HashMap.get()?</td><td>O(1) average case; O(n) worst case with many hash collisions (or O(log n) in Java 8+ since buckets treeify at 8+ collisions)</td></tr>
<tr class='text-center'><td>Two separate O(n) loops one after another - what's the total?</td><td>O(n) - they add, not multiply: O(n) + O(n) = O(2n) = O(n)</td></tr>
<tr class='text-center'><td>Why is nested-loop code usually O(n^2)?</td><td>The inner loop executes fully for every iteration of the outer loop, multiplying the two bounds: n * n</td></tr>
<tr class='text-center'><td>What is the complexity of Collections.sort()?</td><td>O(n log n) - it uses a TimSort/merge-sort-based algorithm</td></tr>
<tr class='text-center'><td>Give an example of O(log n).</td><td>Binary search, or lookups in a balanced BST like TreeMap</td></tr>
<tr class='text-center'><td>Give an example of O(2^n).</td><td>Naive recursive Fibonacci without memoization - each call branches into 2 more calls</td></tr>
<tr class='text-center'><td>Does Big-O tell you actual runtime in milliseconds?</td><td>No - it describes the growth trend as n scales, not the exact speed on a given machine</td></tr>
</table>`
        }
    ]
};
