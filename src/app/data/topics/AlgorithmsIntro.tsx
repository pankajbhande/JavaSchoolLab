import { Topic } from '../coreJava';

export const algorithmsIntro: Topic = {
    id: 'algorithms-intro',
    name: 'Algorithms',
    beginner: [
        {
            content: `<h3>What is an Algorithm?</h3>
An algorithm is a precise, step-by-step set of instructions for solving a problem or completing a task - like a recipe for a computer. Every program you write, no matter how simple, follows some algorithm.<br><br>
A good algorithm is: <br>
• <strong>Well-defined</strong> - each step is unambiguous. <br>
• <strong>Finite</strong> - it eventually terminates. <br>
• <strong>Effective</strong> - each step can actually be carried out.<br>`,
            codeExamples: [`public class SimpleAlgorithm {
    public static void main(String[] args) {
        // Algorithm: find the largest of three numbers
        int a = 12, b = 45, c = 7;
        int largest = a;
        if (b > largest) largest = b;
        if (c > largest) largest = c;
        System.out.println("Largest: " + largest);
    }
}
// OUTPUT:
// Largest: 45`]
        },
        {
            content: `<h3>From Plain English to Code</h3>
Before writing code, it helps to describe the algorithm in plain steps (pseudocode). For example, "to check if a number is even: divide it by 2, if the remainder is 0 it's even, otherwise it's odd." Only after the logic is clear do we translate it into Java.<br>`,
            codeExamples: [`public class EvenOddAlgorithm {
    public static void main(String[] args) {
        int number = 17;
        // Step 1: divide by 2, check remainder
        if (number % 2 == 0) {
            System.out.println(number + " is even");
        } else {
            System.out.println(number + " is odd");
        }
    }
}
// OUTPUT:
// 17 is odd`]
        },
        {
            content: `<h3>Searching: A Classic Algorithm</h3>
Searching means finding whether a value exists in a collection, and where. The simplest approach - <strong>linear search</strong> - checks every item one by one until a match is found or the list ends.<br>`,
            codeExamples: [`public class LinearSearchDemo {
    public static void main(String[] args) {
        int[] numbers = {4, 8, 15, 16, 23, 42};
        int target = 16;
        int foundAt = -1;

        for (int i = 0; i < numbers.length; i++) {
            if (numbers[i] == target) {
                foundAt = i;
                break;
            }
        }
        System.out.println("Found at index: " + foundAt);
    }
}
// OUTPUT:
// Found at index: 3`]
        },
        {
            content: `<h3>Sorting: Another Classic Algorithm</h3>
Sorting arranges data into a defined order (ascending/descending). A simple example is <strong>bubble sort</strong>, which repeatedly compares neighboring elements and swaps them if they're out of order.<br>`,
            codeExamples: [`public class BubbleSortDemo {
    public static void main(String[] args) {
        int[] arr = {5, 2, 9, 1, 5};
        for (int i = 0; i < arr.length - 1; i++) {
            for (int j = 0; j < arr.length - 1 - i; j++) {
                if (arr[j] > arr[j + 1]) {
                    int temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                }
            }
        }
        for (int n : arr) System.out.print(n + " ");
    }
}
// OUTPUT:
// 1 2 5 5 9`]
        },
    ],
    expert: [
        {
            content: `<h3>Why Algorithms Matter: Efficiency</h3>
Two algorithms can solve the exact same problem and produce the exact same output, yet take wildly different amounts of time or memory. We measure this with <strong>time complexity</strong>, usually expressed in Big-O notation - a description of how the runtime grows as input size (n) grows.<br><br>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Big-O</th><th>Name</th><th>Example</th></tr>
<tr class='text-center'><td>O(1)</td><td>Constant</td><td>Accessing an array element by index</td></tr>
<tr class='text-center'><td>O(log n)</td><td>Logarithmic</td><td>Binary search on a sorted array</td></tr>
<tr class='text-center'><td>O(n)</td><td>Linear</td><td>Linear search, single loop over n items</td></tr>
<tr class='text-center'><td>O(n log n)</td><td>Linearithmic</td><td>Efficient sorts (merge sort, quicksort average case)</td></tr>
<tr class='text-center'><td>O(n^2)</td><td>Quadratic</td><td>Bubble sort, nested loops over the same data</td></tr>
</table>`,
            codeExamples: [`public class ComplexityDemo {
    public static void main(String[] args) {
        int[] data = {3, 7, 1, 9, 4, 2, 8};

        // O(n) - visits every element once
        int sum = 0;
        for (int x : data) sum += x;
        System.out.println("Sum: " + sum);

        // O(n^2) - nested loop over the same data
        int pairChecks = 0;
        for (int i = 0; i < data.length; i++) {
            for (int j = 0; j < data.length; j++) {
                pairChecks++;
            }
        }
        System.out.println("Pair checks: " + pairChecks);
    }
}
// OUTPUT:
// Sum: 34
// Pair checks: 49`]
        },
        {
            content: `<h3>Linear Search vs Binary Search</h3>
Binary search is dramatically faster than linear search, but it has a prerequisite: the data must already be sorted. It repeatedly halves the search space by comparing the target to the middle element.<br>`,
            codeExamples: [`public class BinarySearchDemo {
    public static void main(String[] args) {
        int[] sorted = {2, 4, 8, 15, 16, 23, 42, 55}; // must be sorted
        int target = 23;
        int low = 0, high = sorted.length - 1;
        int result = -1;

        while (low <= high) {
            int mid = (low + high) / 2;
            if (sorted[mid] == target) { result = mid; break; }
            else if (sorted[mid] < target) low = mid + 1;
            else high = mid - 1;
        }
        System.out.println("Found at index: " + result);
    }
}
// OUTPUT:
// Found at index: 5`]
        },
        {
            content: `<h3>Algorithm Design Strategies</h3>
Most algorithms fall into a handful of general design patterns:<br><br>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Strategy</th><th>Idea</th><th>Example</th></tr>
<tr class='text-center'><td>Brute force</td><td>Try every possibility</td><td>Checking all pairs for a matching sum</td></tr>
<tr class='text-center'><td>Divide and conquer</td><td>Split problem into smaller subproblems, solve, combine</td><td>Merge sort, binary search</td></tr>
<tr class='text-center'><td>Greedy</td><td>Make the locally best choice at each step</td><td>Coin change with standard denominations</td></tr>
<tr class='text-center'><td>Dynamic programming</td><td>Break into overlapping subproblems, cache results</td><td>Fibonacci with memoization</td></tr>
</table>`,
            codeExamples: [`import java.util.HashMap;
import java.util.Map;

public class FibMemoDemo {
    static Map<Integer, Long> cache = new HashMap<>();

    static long fib(int n) {
        if (n <= 1) return n;
        if (cache.containsKey(n)) return cache.get(n); // reuse previous work
        long result = fib(n - 1) + fib(n - 2);
        cache.put(n, result);
        return result;
    }

    public static void main(String[] args) {
        System.out.println(fib(30));
    }
}
// OUTPUT:
// 832040`]
        },
        {
            content: `<h3>Space Complexity: The Other Half of Efficiency</h3>
Time isn't the only cost - algorithms also use extra memory (space complexity). A recursive solution might be simple to read but use O(n) stack space, while an iterative version of the same logic might use only O(1) extra space.<br>`,
            codeExamples: [`public class SpaceComplexityDemo {
    // O(n) extra space - recursion uses the call stack
    static long sumRecursive(int n) {
        if (n == 0) return 0;
        return n + sumRecursive(n - 1);
    }

    // O(1) extra space - just a running total
    static long sumIterative(int n) {
        long total = 0;
        for (int i = 1; i <= n; i++) total += i;
        return total;
    }

    public static void main(String[] args) {
        System.out.println(sumRecursive(10));
        System.out.println(sumIterative(10));
    }
}
// OUTPUT:
// 55
// 55`]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What makes something an "algorithm" vs just "code"?</td><td>An algorithm is the language-independent logical procedure; code is one specific implementation of that procedure in a language</td></tr>
<tr class='text-center'><td>What is Big-O notation used for?</td><td>Describing how an algorithm's running time (or space) grows as the input size grows, ignoring constant factors</td></tr>
<tr class='text-center'><td>Why is binary search faster than linear search?</td><td>It eliminates half the remaining search space each step (O(log n)) instead of checking one element at a time (O(n)) - but it requires sorted data</td></tr>
<tr class='text-center'><td>What is the time complexity of bubble sort in the worst case?</td><td>O(n^2), because of the nested comparison loops</td></tr>
<tr class='text-center'><td>What is the difference between time complexity and space complexity?</td><td>Time complexity measures how runtime scales with input size; space complexity measures how extra memory usage scales with input size</td></tr>
<tr class='text-center'><td>What is memoization?</td><td>Caching results of expensive function calls so repeated calls with the same input return instantly instead of recomputing</td></tr>
<tr class='text-center'><td>Give an example of a greedy algorithm.</td><td>Making change with the fewest coins by always picking the largest denomination that fits, when denominations allow it</td></tr>
</table>`
        },
    ],
};
