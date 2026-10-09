import { Topic } from '../coreJava';

export const spaceComplexity: Topic = {
    id: 'space-complexity',
    name: 'Space Complexity',
    beginner: [
        {
            content: `<h3>What is Space Complexity?</h3>
Space complexity measures <strong>how much extra memory an algorithm needs, relative to the input size
n</strong>. Just like time complexity, we express it using Big-O notation — O(1), O(n), O(n^2), etc. <br><br>

Total memory usage has two parts: <br>
• <strong>Input space</strong> — the memory taken by the input itself (usually not counted). <br>
• <strong>Auxiliary space</strong> — the EXTRA memory the algorithm allocates while running (this is
what "space complexity" almost always refers to). <br><br>

When people say "this algorithm is O(n) space", they mean it uses auxiliary space proportional to n,
beyond the input it was given.`
        },
        {
            content: `<h3>O(1) Space — No Extra Memory Needed</h3>
An algorithm that only uses a fixed number of variables, regardless of input size, has constant space
complexity.`,
            codeExamples: [`public class ConstantSpaceDemo {
    static int sumArray(int[] arr) {
        int total = 0;              // just ONE extra variable, no matter how big arr is
        for (int i = 0; i < arr.length; i++) {
            total += arr[i];
        }
        return total;
    }
    // Auxiliary space = O(1) - "total" and "i" don't grow with input size
}`]
        },
        {
            content: `<h3>O(n) Space — Extra Memory Proportional to Input</h3>
If an algorithm creates a new array/list/map whose size grows with the input, its space complexity is
O(n).`,
            codeExamples: [`import java.util.*;

public class LinearSpaceDemo {
    static int[] doubleAllValues(int[] arr) {
        int[] result = new int[arr.length]; // NEW array of size n -> O(n) extra space
        for (int i = 0; i < arr.length; i++) {
            result[i] = arr[i] * 2;
        }
        return result;
    }
    // Auxiliary space = O(n) - "result" grows in direct proportion to the input
}`]
        },
        {
            content: `<h3>Auxiliary Space vs Total Space</h3>
Given an input array of size n, if a method just reads it without allocating anything new, the
<strong>auxiliary</strong> space is O(1), even though the <strong>total</strong> space (input + auxiliary)
is O(n). Interviewers almost always mean auxiliary space when they ask "what's the space complexity?"`
        }
    ],

    intermediate: [
        {
            content: `<h3>Recursion Uses Stack Space Too</h3>
Every recursive call adds a new frame to the JVM's call stack, holding local variables and the return
address. A recursive function that goes n levels deep uses O(n) auxiliary space for that stack — even
if it allocates no arrays or objects at all. The iterative equivalent, using a simple loop, uses O(1)
space instead.`,
            codeExamples: [`public class RecursionVsIterationSpace {

    // O(n) space - each call adds a frame to the call stack
    // n frames exist simultaneously at the deepest point of recursion
    static int sumRecursive(int[] arr, int index) {
        if (index == arr.length) return 0;
        return arr[index] + sumRecursive(arr, index + 1);
    }

    // O(1) space - only a few variables, no matter how large arr is
    static int sumIterative(int[] arr) {
        int total = 0;
        for (int i = 0; i < arr.length; i++) {
            total += arr[i];
        }
        return total;
    }

    public static void main(String[] args) {
        int[] arr = {1, 2, 3, 4, 5};
        System.out.println("Recursive (O(n) stack space): " + sumRecursive(arr, 0));
        System.out.println("Iterative (O(1) space): " + sumIterative(arr));
    }
}
// OUTPUT:
// Recursive (O(n) stack space): 15
// Iterative (O(1) space): 15`]
        },
        {
            content: `<h3>Deep Recursion Can Overflow the Stack</h3>
Because each recursive call consumes real stack memory, a recursive method with O(n) call-stack depth on
a very large n can throw <code>StackOverflowError</code> - something an O(1)-space iterative loop never
risks, since it doesn't grow the call stack at all.`,
            codeExamples: [`public class StackOverflowRisk {
    static long sumRecursive(int n) {
        if (n == 0) return 0;
        return n + sumRecursive(n - 1); // 1 stack frame per call
    }

    public static void main(String[] args) {
        try {
            System.out.println(sumRecursive(1_000_000)); // very deep recursion
        } catch (StackOverflowError e) {
            System.out.println("StackOverflowError - O(n) stack space exhausted the JVM stack");
        }
    }
}
// OUTPUT (typical default JVM stack size):
// StackOverflowError - O(n) stack space exhausted the JVM stack`]
        }
    ],

    expert: [
        {
            content: `<h3>Space Complexity Classes</h3>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Space Complexity</th><th>Example</th></tr>
<tr class='text-center'><td>O(1)</td><td>Iterative sum, swapping two variables, in-place array reversal</td></tr>
<tr class='text-center'><td>O(log n)</td><td>Recursive binary search (recursion depth is log n)</td></tr>
<tr class='text-center'><td>O(n)</td><td>Copying an array, recursive linear sum, HashMap holding n entries</td></tr>
<tr class='text-center'><td>O(n)</td><td>Merge Sort's temporary merge arrays</td></tr>
<tr class='text-center'><td>O(n^2)</td><td>2D matrix / adjacency matrix for a graph with n nodes</td></tr>
</table>`
        },
        {
            content: `<h3>Call Stack Growth Visualized</h3>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">sumRecursive(5)
  -> sumRecursive(4)
       -> sumRecursive(3)
            -> sumRecursive(2)
                 -> sumRecursive(1)
                      -> sumRecursive(0)   <- base case, deepest frame

Stack (grows downward, one frame per call):
  [ sumRecursive(5) ]
  [ sumRecursive(4) ]
  [ sumRecursive(3) ]
  [ sumRecursive(2) ]
  [ sumRecursive(1) ]
  [ sumRecursive(0) ]   <- 6 frames alive simultaneously for n=5 -> O(n) space

sumIterative(5): single frame the whole time
  [ sumIterative ]      <- only 1 frame ever, regardless of n -> O(1) space</pre>`
        },
        {
            content: `<h3>Time-Space Tradeoffs</h3>
Algorithms often trade memory for speed. A classic example: recursive Fibonacci without memoization is
O(2^n) time but only O(n) space (call stack depth). Adding a memoization cache (HashMap) increases space
to O(n) - wait, actually reduces time to O(n) at the cost of O(n) space for the cache, on top of the
O(n) recursion stack.`,
            codeExamples: [`import java.util.*;

public class TimeSpaceTradeoff {

    // O(2^n) time, O(n) space (just the call stack, no cache)
    static long fibNaive(int n) {
        if (n <= 1) return n;
        return fibNaive(n - 1) + fibNaive(n - 2);
    }

    // O(n) time, O(n) space (call stack + memo cache)
    static long fibMemo(int n, Map<Integer, Long> memo) {
        if (n <= 1) return n;
        if (memo.containsKey(n)) return memo.get(n); // O(1) cache hit
        long result = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);
        memo.put(n, result); // trade memory for speed
        return result;
    }

    public static void main(String[] args) {
        System.out.println("Naive fib(30): " + fibNaive(30));
        System.out.println("Memoized fib(30): " + fibMemo(30, new HashMap<>()));
    }
}
// OUTPUT:
// Naive fib(30): 832040
// Memoized fib(30): 832040`]
        },
        {
            content: `<h3>Common Mistakes When Analyzing Space Complexity</h3>
• <strong>Forgetting recursion has hidden stack cost</strong> - a "space O(1)" recursive method is a
myth; every level of recursion adds a stack frame. <br>
• <strong>Counting input space as auxiliary space</strong> - if a method just reads its input array
without copying it, that array does not count toward auxiliary space. <br>
• <strong>Ignoring space used by return values</strong> - a method that builds and returns a new O(n)
list should be counted as O(n) space, not O(1), even though "no local variables" might look small. <br>
• <strong>Assuming in-place algorithms are always O(1) space</strong> - "in-place" refers to not needing
a full copy of the input, but some in-place algorithms still use O(log n) recursion stack space
(e.g. in-place Quick Sort).`
        },
        {
            content: `<h3>Interview Questions</h3>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is space complexity?</td><td>The amount of extra (auxiliary) memory an algorithm needs relative to its input size n</td></tr>
<tr class='text-center'><td>What is auxiliary space vs total space?</td><td>Auxiliary is the extra memory used beyond the input; total space includes the input itself</td></tr>
<tr class='text-center'><td>Why does recursion use O(n) space even without arrays?</td><td>Each recursive call adds a frame to the call stack, and n levels of recursion means n frames exist simultaneously</td></tr>
<tr class='text-center'><td>Why can deep recursion cause StackOverflowError?</td><td>Each call consumes real stack memory; enough levels exhaust the JVM's fixed-size stack</td></tr>
<tr class='text-center'><td>What is the space complexity of Merge Sort?</td><td>O(n) - it needs temporary arrays to merge sorted halves</td></tr>
<tr class='text-center'><td>Is an "in-place" algorithm always O(1) space?</td><td>Not necessarily - e.g. in-place recursive Quick Sort still uses O(log n) stack space</td></tr>
<tr class='text-center'><td>How does memoization affect space complexity?</td><td>It typically increases space (cache storage) in exchange for reducing time complexity</td></tr>
<tr class='text-center'><td>What is the space complexity of an iterative loop with only a few variables?</td><td>O(1) - constant, regardless of input size</td></tr>
</table>`
        }
    ]
};
