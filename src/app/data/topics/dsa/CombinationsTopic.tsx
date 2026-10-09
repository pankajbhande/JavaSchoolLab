import { Topic } from '../../coreJava';

export const combinationsTopic: Topic = {
    id: 'dsa-recursion-backtracking-combinations',
    name: 'Combinations',
    beginner: [
        {
            content: `<h4>Choosing K Elements, Order Doesn't Matter</h4>
Combinations differ from permutations by ignoring ORDER - {1,2} and {2,1} count as the SAME combination. The backtracking trick: always choose elements in INCREASING index order (never look backward), which naturally avoids generating the same combination twice.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.ArrayList;
import java.util.List;

public class CombinationsDemo {

    // All combinations of size k, choosing from 1..n
    static List<List<Integer>> combine(int n, int k) {
        List<List<Integer>> result = new ArrayList<>();
        backtrack(1, n, k, new ArrayList<>(), result);
        return result;
    }

    static void backtrack(int start, int n, int k, List<Integer> current, List<List<Integer>> result) {
        if (current.size() == k) {
            result.add(new ArrayList<>(current));
            return;
        }

        for (int i = start; i <= n; i++) {
            current.add(i);
            backtrack(i + 1, n, k, current, result);   // start from i+1 - never revisit earlier numbers
            current.remove(current.size() - 1);
        }
    }

    public static void main(String[] args) {
        System.out.println(combine(4, 2));
    }
}
// OUTPUT:
// [[1, 2], [1, 3], [1, 4], [2, 3], [2, 4], [3, 4]]`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Pruning - Stop Early When Not Enough Elements Remain</h3>
A key optimization: if the remaining numbers (from <code>i</code> to <code>n</code>) can't possibly fill the remaining slots needed, stop trying immediately instead of recursing into a doomed branch - this pruning significantly reduces wasted exploration for larger n and k.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.ArrayList;
import java.util.List;

public class CombinationsPrunedDemo {

    static List<List<Integer>> combine(int n, int k) {
        List<List<Integer>> result = new ArrayList<>();
        backtrack(1, n, k, new ArrayList<>(), result);
        return result;
    }

    static void backtrack(int start, int n, int k, List<Integer> current, List<List<Integer>> result) {
        if (current.size() == k) {
            result.add(new ArrayList<>(current));
            return;
        }

        int needed = k - current.size();
        // PRUNE: if there aren't enough remaining numbers to fill the rest of the combination, stop
        for (int i = start; i <= n - needed + 1; i++) {
            current.add(i);
            backtrack(i + 1, n, k, current, result);
            current.remove(current.size() - 1);
        }
    }

    public static void main(String[] args) {
        // Without pruning, the loop above would still try i up to n; with pruning,
        // it stops early once too few numbers remain to complete a valid combination.
        System.out.println(combine(4, 3));
    }
}
// OUTPUT:
// [[1, 2, 3], [1, 2, 4], [1, 3, 4], [2, 3, 4]]`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>How many combinations of size k exist from n elements?</td><td>C(n, k) = n! / (k! * (n-k)!), the binomial coefficient - unlike permutations, order doesn't multiply the count</td></tr>
<tr class='text-center'><td>Why does "start from i+1" prevent duplicate combinations, unlike permutations' used[] array?</td><td>Combinations don't care about order, so restricting each choice to come AFTER the previous one guarantees each unique SET of elements is generated in exactly one canonical (sorted) order, never revisited from a different starting sequence</td></tr>
<tr class='text-center'><td>How does the "n - needed + 1" pruning bound get derived?</td><td>If 'needed' more elements must be chosen from the remaining range [i, n], there must be at least 'needed' numbers available - meaning i can go no higher than n - needed + 1, or the branch can never complete a valid combination</td></tr>
</table>`
        }
    ]
};
