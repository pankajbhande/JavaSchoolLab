import { Topic } from '../coreJava';

export const timeComplexity: Topic = {
    id: 'time-complexity',
    name: 'Time Complexity',
    beginner: [
        {
            content: `<h3>What is Time Complexity?</h3>
Time complexity measures <strong>how the number of operations an algorithm performs grows as the input
size n grows</strong>. It is not measured in seconds (that depends on the CPU, JVM warm-up, and system
load) — instead it counts <strong>basic operations</strong>: comparisons, assignments, arithmetic, and
array/collection accesses. <br><br>

We express time complexity using Big-O, Big-Omega, or Big-Theta notation depending on which bound we
care about.`
        },
        {
            content: `<h3>Counting Operations — A Simple Example</h3>
To find time complexity, literally count how many times each line executes as a function of n.`,
            codeExamples: [`public class CountOperations {
    static int sumFirstN(int[] arr) {
        int total = 0;              // 1 operation - runs once
        for (int i = 0; i < arr.length; i++) { // runs n times
            total += arr[i];        // 1 operation, executed n times
        }
        return total;               // 1 operation - runs once
    }
    // Total operations ~ 1 + n + 1 = n + 2
    // Drop the constant "+2" -> Time complexity = O(n)
}`]
        },
        {
            content: `<h3>Dropping Constants</h3>
Two separate loops, each running n times, is <code>n + n = 2n</code> operations — but Big-O drops the
constant multiplier <code>2</code>, because it does not change the growth SHAPE, only the steepness.`,
            codeExamples: [`public class DropConstants {
    static void twoLoops(int[] arr) {
        int n = arr.length;

        for (int i = 0; i < n; i++) {       // n operations
            System.out.println(arr[i]);
        }

        for (int i = 0; i < n; i++) {       // another n operations
            System.out.println(arr[i] * 2);
        }
    }
    // Total = n + n = 2n
    // Time complexity = O(n)   (the "2" constant is dropped)
}`]
        },
        {
            content: `<h3>Dropping Lower-Order Terms</h3>
If a method does O(n^2) work AND O(n) work, the O(n) part becomes irrelevant as n grows huge — so we only
keep the fastest-growing (dominant) term.`,
            codeExamples: [`public class DropLowerOrder {
    static void mixedWork(int[] arr) {
        int n = arr.length;

        for (int i = 0; i < n; i++) {           // O(n)
            System.out.println(arr[i]);
        }

        for (int i = 0; i < n; i++) {           // O(n^2) nested pair
            for (int j = 0; j < n; j++) {
                System.out.println(arr[i] + arr[j]);
            }
        }
    }
    // Total = O(n) + O(n^2)
    // For large n, n^2 completely dominates n
    // Time complexity = O(n^2)   (the lower-order "+ n" term is dropped)
}`]
        }
    ],

    intermediate: [
        {
            content: `<h3>Worked Examples on Real Java Code</h3>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Code Pattern</th><th>Time Complexity</th></tr>
<tr class='text-center'><td>Single statement (assignment, arithmetic)</td><td>O(1)</td></tr>
<tr class='text-center'><td>Single loop over n elements</td><td>O(n)</td></tr>
<tr class='text-center'><td>Two sequential (not nested) loops over n</td><td>O(n) (they add, not multiply)</td></tr>
<tr class='text-center'><td>Two nested loops, both over n</td><td>O(n^2)</td></tr>
<tr class='text-center'><td>Loop where the counter is halved each iteration</td><td>O(log n)</td></tr>
<tr class='text-center'><td>Loop over n, calling a O(log n) operation inside</td><td>O(n log n)</td></tr>
</table>`,
            codeExamples: [`public class TimeComplexityWorkedExamples {

    static void constant(int[] arr) {
        System.out.println(arr[0]);                 // O(1)
    }

    static void linear(int[] arr) {
        for (int x : arr) System.out.println(x);    // O(n)
    }

    static void logarithmic(int n) {
        int i = 1;
        while (i < n) {                              // O(log n)
            System.out.println(i);
            i *= 2;                                   // doubles each step
        }
    }

    static void nLogN(int[] arr) {
        for (int x : arr) {                           // O(n)
            int i = 1;
            while (i < arr.length) {                  // O(log n) inside
                i *= 2;
            }
        }
        // combined: O(n) * O(log n) = O(n log n)
    }
}`]
        },
        {
            content: `<h3>Time Complexity of Recursive Calls</h3>
For recursive methods, count how many times the method is called, multiplied by the work done per call.
A recursive method that halves its input each call and does O(1) work per call, like binary search, is
O(log n). A recursive method that spawns 2 calls per level, like naive Fibonacci, is O(2^n).`,
            codeExamples: [`public class RecursiveTimeComplexity {

    // O(log n) - halves the search space each call, O(1) work per call
    static int binarySearch(int[] arr, int low, int high, int target) {
        if (low > high) return -1;
        int mid = (low + high) / 2;
        if (arr[mid] == target) return mid;
        return arr[mid] < target
            ? binarySearch(arr, mid + 1, high, target)
            : binarySearch(arr, low, mid - 1, target);
    }

    // O(2^n) - each call spawns 2 more calls, forming an exponential call tree
    static int fibonacci(int n) {
        if (n <= 1) return n;
        return fibonacci(n - 1) + fibonacci(n - 2);
    }
}`]
        }
    ],

    expert: [
        {
            content: `<h3>Complexity Class Reference Table</h3>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Time Complexity</th><th>Name</th><th>Example</th></tr>
<tr class='text-center'><td>O(1)</td><td>Constant</td><td>arr[0], HashMap.get()</td></tr>
<tr class='text-center'><td>O(log n)</td><td>Logarithmic</td><td>Binary search</td></tr>
<tr class='text-center'><td>O(n)</td><td>Linear</td><td>Single loop / traversal</td></tr>
<tr class='text-center'><td>O(n log n)</td><td>Linearithmic</td><td>Merge Sort, Collections.sort()</td></tr>
<tr class='text-center'><td>O(n^2)</td><td>Quadratic</td><td>Nested loops, Bubble Sort</td></tr>
<tr class='text-center'><td>O(2^n)</td><td>Exponential</td><td>Naive recursive Fibonacci</td></tr>
</table>`
        },
        {
            content: `<h3>Growth Rate Visualized</h3>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Operations needed as n grows:

n = 10      n = 100      n = 1,000       n = 10,000
O(1)         1            1              1               1
O(log n)     3            7              10              13
O(n)         10           100            1,000           10,000
O(n log n)   33           664            9,966            132,877
O(n^2)       100          10,000         1,000,000        100,000,000
O(2^n)       1,024        (astronomical) (unusable)       (unusable)</pre>
This is why choosing the right algorithm matters far more than micro-optimizing code once n gets large.`
        },
        {
            content: `<h3>Time Complexity of Nested Method Calls</h3>
When a loop calls another method internally, you must multiply the loop's complexity by the called
method's own complexity - a common trap that silently turns O(n) code into O(n^2).`,
            codeExamples: [`import java.util.*;

public class NestedCallTrap {
    public static void main(String[] args) {
        List<Integer> list = new ArrayList<>();
        for (int i = 0; i < 5000; i++) list.add(i);

        // Looks like O(n) but list.remove(0) on ArrayList is O(n)
        // (it shifts every remaining element left by one)
        // -> overall this loop is O(n) * O(n) = O(n^2)
        while (!list.isEmpty()) {
            list.remove(0); // O(n) - hidden shift cost
        }
        System.out.println("Emptied via remove(0): O(n^2) total");

        // FIX: removing from the END of an ArrayList is O(1)
        List<Integer> list2 = new ArrayList<>();
        for (int i = 0; i < 5000; i++) list2.add(i);
        while (!list2.isEmpty()) {
            list2.remove(list2.size() - 1); // O(1) - no shifting needed
        }
        System.out.println("Emptied via remove(last): O(n) total");
    }
}
// OUTPUT:
// Emptied via remove(0): O(n^2) total
// Emptied via remove(last): O(n) total`]
        },
        {
            content: `<h3>Common Mistakes When Analyzing Time Complexity</h3>
• <strong>Forgetting that library method calls have their own cost</strong> (e.g. <code>list.contains()</code>,
<code>list.remove(0)</code>) - always check the underlying data structure's documented complexity. <br>
• <strong>Assuming recursion is automatically efficient</strong> - unmemoized recursive Fibonacci is
O(2^n), catastrophically slower than the O(n) iterative version. <br>
• <strong>Confusing "n" across different variables</strong> - if a method takes two different-sized
inputs, e.g. array of size n and array of size m, nested loops over each are O(n * m), not O(n^2). <br>
• <strong>Only measuring wall-clock time instead of reasoning about growth</strong> - a fast benchmark on
small input can hide an O(n^2) algorithm that becomes unusable at scale.`
        },
        {
            content: `<h3>Interview Questions</h3>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is time complexity?</td><td>A measure of how the number of operations an algorithm performs grows relative to input size n</td></tr>
<tr class='text-center'><td>Why do we drop constants like O(2n) -> O(n)?</td><td>Big-O describes the growth trend for large n, not exact operation counts</td></tr>
<tr class='text-center'><td>What is the time complexity of two nested loops both over n?</td><td>O(n^2) - the inner loop runs fully for each outer iteration</td></tr>
<tr class='text-center'><td>What is the time complexity of two sequential (non-nested) loops over n?</td><td>O(n) - they add rather than multiply: O(n) + O(n) = O(n)</td></tr>
<tr class='text-center'><td>What is the time complexity of naive recursive Fibonacci?</td><td>O(2^n) - each call branches into two more recursive calls</td></tr>
<tr class='text-center'><td>How do you find time complexity of nested loops with different bounds, e.g. n and m?</td><td>O(n * m), not O(n^2), unless n and m are known to be equal</td></tr>
<tr class='text-center'><td>Why is list.remove(0) risky inside a loop for ArrayList?</td><td>Each call is O(n) due to shifting elements, turning an O(n) loop into O(n^2)</td></tr>
<tr class='text-center'><td>What is the time complexity of binary search?</td><td>O(log n) - the search space halves each step</td></tr>
</table>`
        }
    ]
};
