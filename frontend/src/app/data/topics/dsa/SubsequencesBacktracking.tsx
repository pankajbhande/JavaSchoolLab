import { Topic } from '../../coreJava';

export const subsequencesBacktracking: Topic = {
    id: 'dsa-recursion-backtracking-subsequences',
    name: 'Subsequences',
    beginner: [
        {
            content: `<h4>Generating Subsequences with a Condition</h4>
Subsequences generation uses the exact same include/exclude backtracking shape as subsets - the difference is usually a FILTER: only keep subsequences meeting some condition (a target sum, a specific length, alternating parity). This is where backtracking becomes genuinely useful over just enumerating everything.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.ArrayList;
import java.util.List;

public class SubsequencesWithSumDemo {

    // Finds all subsequences that sum to EXACTLY target
    static List<List<Integer>> subsequencesWithSum(int[] arr, int target) {
        List<List<Integer>> result = new ArrayList<>();
        backtrack(arr, 0, target, new ArrayList<>(), result);
        return result;
    }

    static void backtrack(int[] arr, int index, int remaining, List<Integer> current, List<List<Integer>> result) {
        if (index == arr.length) {
            if (remaining == 0) {
                result.add(new ArrayList<>(current));
            }
            return;
        }

        // Include arr[index]
        current.add(arr[index]);
        backtrack(arr, index + 1, remaining - arr[index], current, result);
        current.remove(current.size() - 1);   // backtrack

        // Exclude arr[index]
        backtrack(arr, index + 1, remaining, current, result);
    }

    public static void main(String[] args) {
        int[] arr = {1, 2, 3, 4};
        System.out.println(subsequencesWithSum(arr, 5));
    }
}
// OUTPUT:
// [[1, 4], [2, 3]]`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Only the FIRST Matching Subsequence - Early Termination</h3>
When a problem needs just ANY one valid subsequence (not all of them), the recursion should RETURN a boolean/found-flag and stop exploring once found - avoiding wasted work exploring the rest of the search space after an answer is already in hand.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.ArrayList;
import java.util.List;

public class FirstMatchingSubsequenceDemo {

    static boolean findFirst(int[] arr, int index, int remaining, List<Integer> current) {
        if (index == arr.length) {
            return remaining == 0;
        }

        // Try INCLUDING first
        current.add(arr[index]);
        if (findFirst(arr, index + 1, remaining - arr[index], current)) {
            return true;   // found - stop immediately, don't explore further
        }
        current.remove(current.size() - 1);

        // Try EXCLUDING only if including didn't work
        return findFirst(arr, index + 1, remaining, current);
    }

    public static void main(String[] args) {
        int[] arr = {1, 2, 3, 4};
        List<Integer> result = new ArrayList<>();

        if (findFirst(arr, 0, 5, result)) {
            System.out.println("Found: " + result);
        } else {
            System.out.println("No subsequence sums to target");
        }
    }
}
// OUTPUT:
// Found: [1, 4]`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why does "find only ONE matching subsequence" run much faster than "find ALL"?</td><td>It can stop exploring the moment a valid answer is found, pruning away the rest of the exponential search space that would otherwise still be checked when collecting every match</td></tr>
<tr class='text-center'><td>How does this problem relate to the 0/1 Knapsack / Subset Sum family?</td><td>They share the identical include/exclude recursive structure - Subset Sum is exactly "does ANY subsequence sum to target", answerable with the same backtracking shown here (or solved faster with DP if only existence, not the actual subsequence, is needed)</td></tr>
<tr class='text-center'><td>What's the worst-case time complexity of exhaustively finding ALL matching subsequences?</td><td>O(2^n) - every element still independently branches into include/exclude, regardless of the target-sum filter, since the filter only prunes AFTER a full path is built (unless additional pruning like "remaining sum can't reach target" is added)</td></tr>
</table>`
        }
    ]
};
