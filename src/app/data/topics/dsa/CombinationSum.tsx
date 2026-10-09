import { Topic } from '../../coreJava';

export const combinationSum: Topic = {
    id: 'dsa-recursion-backtracking-combination-sum',
    name: 'Combination Sum',
    beginner: [
        {
            content: `<h4>Combinations That Sum to a Target - REUSING Elements Allowed</h4>
Given candidates and a target, find all combinations summing to target, where each candidate can be used UNLIMITED times. The key difference from plain Combinations: when recursing after choosing candidates[i], the next call starts from <code>i</code> again (not <code>i+1</code>), allowing the same element to be picked repeatedly.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.ArrayList;
import java.util.List;

public class CombinationSumDemo {

    static List<List<Integer>> combinationSum(int[] candidates, int target) {
        List<List<Integer>> result = new ArrayList<>();
        backtrack(candidates, 0, target, new ArrayList<>(), result);
        return result;
    }

    static void backtrack(int[] candidates, int start, int remaining, List<Integer> current, List<List<Integer>> result) {
        if (remaining == 0) {
            result.add(new ArrayList<>(current));
            return;
        }
        if (remaining < 0) return;   // overshot - prune this branch

        for (int i = start; i < candidates.length; i++) {
            current.add(candidates[i]);
            backtrack(candidates, i, remaining - candidates[i], current, result);   // 'i', NOT 'i+1' - reuse allowed
            current.remove(current.size() - 1);
        }
    }

    public static void main(String[] args) {
        int[] candidates = {2, 3, 6, 7};
        System.out.println(combinationSum(candidates, 7));
    }
}
// OUTPUT:
// [[2, 2, 3], [7]]`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Combination Sum II - No Reuse, But Duplicates in the Input Array</h3>
A harder variant: each candidate usable at most ONCE, but the input array itself may contain duplicate values. Two changes from the basic version: recurse from <code>i+1</code> (no reuse), and sort + skip same-level duplicates (same trick as Subsets II) to avoid duplicate combinations in the output.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.*;

public class CombinationSumIIDemo {

    static List<List<Integer>> combinationSum2(int[] candidates, int target) {
        Arrays.sort(candidates);
        List<List<Integer>> result = new ArrayList<>();
        backtrack(candidates, 0, target, new ArrayList<>(), result);
        return result;
    }

    static void backtrack(int[] candidates, int start, int remaining, List<Integer> current, List<List<Integer>> result) {
        if (remaining == 0) {
            result.add(new ArrayList<>(current));
            return;
        }

        for (int i = start; i < candidates.length; i++) {
            if (candidates[i] > remaining) break;              // sorted, so no point continuing
            if (i > start && candidates[i] == candidates[i - 1]) continue;   // skip same-level duplicates

            current.add(candidates[i]);
            backtrack(candidates, i + 1, remaining - candidates[i], current, result);   // i+1 - no reuse
            current.remove(current.size() - 1);
        }
    }

    public static void main(String[] args) {
        int[] candidates = {10, 1, 2, 7, 6, 1, 5};
        System.out.println(combinationSum2(candidates, 8));
    }
}
// OUTPUT:
// [[1, 1, 6], [1, 2, 5], [1, 7], [2, 6]]`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why pass 'i' (not 'i+1') when reuse is allowed, but 'i+1' when it isn't?</td><td>Passing i lets the NEXT recursive call still consider candidates[i] again (reuse); passing i+1 forces strictly forward progress, guaranteeing each candidate is used at most once</td></tr>
<tr class='text-center'><td>Why does sorting first enable the "break" optimization?</td><td>Once candidates are sorted, any candidate exceeding the remaining target means EVERY later candidate (being even bigger) would too - so the loop can stop entirely instead of just skipping that one element</td></tr>
<tr class='text-center'><td>What's the worst-case time complexity of Combination Sum with unlimited reuse?</td><td>Exponential in the target divided by the smallest candidate - roughly O(candidates^(target/min_candidate)), since the recursion depth can grow proportionally to how many times the smallest candidate could be reused</td></tr>
</table>`
        }
    ]
};
