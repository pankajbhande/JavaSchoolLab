import { Topic } from '../coreJava';

export const bigOmegaNotation: Topic = {
    id: 'big-omega',
    name: 'Big-Omega',
    beginner: [
        {
            content: `<h3>What is Big-Omega (Ω)?</h3>
Big-Omega notation describes the <strong>lower bound / best case</strong> of an algorithm — the
<strong>minimum</strong> amount of work it will ever do for a given input size <code>n</code>. <br><br>

Where Big-O (<code>O</code>) asks "how bad can it get?", Big-Omega (<code>Ω</code>) asks
"how good can it get?" <br><br>

• Written as <code>Ω(f(n))</code>, e.g. <code>Ω(1)</code>, <code>Ω(n)</code>. <br>
• It represents the fastest the algorithm could possibly finish, under the luckiest possible input. <br>
• It does NOT mean "average case" — it is strictly the best-case floor.`
        },
        {
            content: `<h3>Ω(1) — Best Case is Instant</h3>
Linear Search over an array is O(n) in the worst case (the target is missing or at the very end), but its
<strong>best case</strong> is Ω(1) — the target happens to be the very first element checked.`,
            codeExamples: [`public class LinearSearchBestCase {
    static int linearSearch(int[] arr, int target) {
        for (int i = 0; i < arr.length; i++) {
            if (arr[i] == target) {
                return i;   // found immediately -> best case
            }
        }
        return -1;
    }

    public static void main(String[] args) {
        int[] arr = {7, 2, 9, 4, 1, 8};

        // Best case: target is the FIRST element -> only 1 comparison -> Omega(1)
        System.out.println(linearSearch(arr, 7));

        // Worst case: target is missing entirely -> n comparisons -> O(n)
        System.out.println(linearSearch(arr, 100));
    }
}
// OUTPUT:
// 0
// -1`]
        },
        {
            content: `<h3>Ω(n) — When Best Case Still Requires a Full Pass</h3>
Some algorithms have no "lucky shortcut" — every single input forces at least n units of work, even in the
best case. Summing all elements of an array is a simple example: there is no early exit, so the best case
and worst case are the same order of growth.`,
            codeExamples: [`public class SumArrayOmega {
    static int sum(int[] arr) {
        int total = 0;
        // No matter the input, this loop MUST run all n times
        // Best case is still Omega(n), not Omega(1)
        for (int i = 0; i < arr.length; i++) {
            total += arr[i];
        }
        return total;
    }

    public static void main(String[] args) {
        System.out.println(sum(new int[]{1, 2, 3, 4, 5}));
    }
}
// OUTPUT:
// 15`]
        },
        {
            content: `<h3>Why Big-Omega Matters</h3>
Big-Omega is useful when you want to know the guaranteed minimum cost of an operation — for example,
proving that <strong>no comparison-based sorting algorithm can do better than Ω(n log n)</strong> in the
worst case across all inputs (a famous theoretical lower bound), or showing that even the luckiest run of
your algorithm cannot be faster than a certain threshold.`
        }
    ],

    intermediate: [
        {
            content: `<h3>Big-O vs Big-Omega vs Big-Theta at a Glance</h3>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Notation</th><th>Meaning</th><th>Bound Type</th></tr>
<tr class='text-center'><td>O(f(n))</td><td>Algorithm never does MORE than this</td><td>Upper bound (worst case)</td></tr>
<tr class='text-center'><td>Ω(f(n))</td><td>Algorithm never does LESS than this</td><td>Lower bound (best case)</td></tr>
<tr class='text-center'><td>Θ(f(n))</td><td>Algorithm always does exactly this (best = worst)</td><td>Tight bound</td></tr>
</table>
<br>
For Linear Search: worst case O(n), best case Ω(1) - since O and Ω differ, Linear Search has
<strong>no single Θ</strong> that covers all inputs generally (though for the "target always missing"
family of inputs it is Θ(n)).`,
            codeExamples: [`public class LinearSearchAllBounds {
    static int linearSearch(int[] arr, int target) {
        for (int i = 0; i < arr.length; i++) {
            if (arr[i] == target) return i;
        }
        return -1;
    }
    // Best case  (target at index 0):        Omega(1)
    // Worst case (target missing or at end):  O(n)
    // Because best-case != worst-case order, there is NO overall Theta bound.
}`]
        }
    ],

    expert: [
        {
            content: `<h3>Formal Definition</h3>
<code>f(n) = Ω(g(n))</code> means there exist positive constants <code>c</code> and <code>n0</code> such
that <code>f(n) >= c * g(n)</code> for all <code>n >= n0</code>. In plain terms: beyond some point, the
algorithm's running time never dips below a constant multiple of <code>g(n)</code>.`
        },
        {
            content: `<h3>Complexity Classes Recap (Same Ladder, Used as Lower Bounds)</h3>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Notation</th><th>Name</th><th>Example</th></tr>
<tr class='text-center'><td>Ω(1)</td><td>Constant lower bound</td><td>Linear Search when the target is first</td></tr>
<tr class='text-center'><td>Ω(log n)</td><td>Logarithmic lower bound</td><td>Binary search WORST case. Its best case is Ω(1) - one comparison when the target sits at the middle</td></tr>
<tr class='text-center'><td>Ω(n)</td><td>Linear lower bound</td><td>Any algorithm that must read all n inputs at least once</td></tr>
<tr class='text-center'><td>Ω(n log n)</td><td>Linearithmic lower bound</td><td>Comparison-based sorting's proven theoretical floor</td></tr>
</table>`
        },
        {
            content: `<h3>Best Case vs Worst Case — Visualized</h3>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Linear Search on array of size n:

Best case  (Omega): target found at index 0
  [ T | x | x | x | x | x | x ]
    ^
    1 comparison -> Omega(1)

Worst case (O): target missing entirely
  [ x | x | x | x | x | x | x ]  -> scan ALL n elements
                              ^
                              n comparisons -> O(n)</pre>`
        },
        {
            content: `<h3>Common Mistakes</h3>
• <strong>Treating Ω as "average case":</strong> Ω is strictly the best case, not the typical/average
case - average case needs separate probabilistic analysis. <br>
• <strong>Assuming every algorithm has a meaningful Ω that differs from its O:</strong> for algorithms
like array traversal that always do exactly n work, Ω(n) equals O(n), so it's simply Θ(n). <br>
• <strong>Forgetting Ω is per-algorithm, not per-problem, unless stated as a theoretical bound:</strong>
"sorting is Ω(n log n)" refers to the best any comparison-based algorithm CAN do, not any single
algorithm's best case.`
        },
        {
            content: `<h3>Interview Questions</h3>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What does Big-Omega represent?</td><td>The lower bound / best-case growth rate of an algorithm's running time</td></tr>
<tr class='text-center'><td>Is Ω the same as average case?</td><td>No - Ω is the best case only; average case requires separate analysis</td></tr>
<tr class='text-center'><td>What is the best case of Linear Search?</td><td>Ω(1) - the target is the first element checked</td></tr>
<tr class='text-center'><td>What is the best case of Bubble Sort on an already-sorted array?</td><td>Ω(n) with an early-exit optimization flag, otherwise Ω(n^2) for the naive version</td></tr>
<tr class='text-center'><td>What is the theoretical Ω for comparison-based sorting?</td><td>Ω(n log n) - proven that no comparison sort can beat this in the worst case across all inputs</td></tr>
<tr class='text-center'><td>If O(f(n)) and Ω(f(n)) are the same, what do we call it?</td><td>Θ(f(n)) - a tight bound</td></tr>
<tr class='text-center'><td>Give an algorithm where best case and worst case are equal.</td><td>Summing all elements of an array - always exactly n additions, so Ω(n) = O(n) = Θ(n)</td></tr>
</table>`
        }
    ]
};
