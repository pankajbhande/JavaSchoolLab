import { Topic } from '../../coreJava';

export const permutationsTopic: Topic = {
    id: 'dsa-recursion-backtracking-permutations',
    name: 'Permutations',
    beginner: [
        {
            content: `<h4>Generating All Orderings</h4>
A set of n distinct elements has n! permutations. Backtracking builds each one by choosing an UNUSED element at each position, recursing, then un-choosing it (backtrack) to try the next option - a <code>used[]</code> array tracks which elements are already placed in the current permutation.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.ArrayList;
import java.util.List;

public class PermutationsDemo {

    static List<List<Integer>> permute(int[] nums) {
        List<List<Integer>> result = new ArrayList<>();
        backtrack(nums, new ArrayList<>(), new boolean[nums.length], result);
        return result;
    }

    static void backtrack(int[] nums, List<Integer> current, boolean[] used, List<List<Integer>> result) {
        if (current.size() == nums.length) {
            result.add(new ArrayList<>(current));
            return;
        }

        for (int i = 0; i < nums.length; i++) {
            if (used[i]) continue;   // skip already-placed elements

            used[i] = true;
            current.add(nums[i]);

            backtrack(nums, current, used, result);

            current.remove(current.size() - 1);   // backtrack
            used[i] = false;
        }
    }

    public static void main(String[] args) {
        int[] nums = {1, 2, 3};
        System.out.println(permute(nums));
    }
}
// OUTPUT:
// [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]]`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Permutations with Duplicates - Avoiding Duplicate Output</h3>
With repeated values, the naive approach produces duplicate permutations. The fix: SORT first, then at each position, skip a value if it equals the PREVIOUS value AND that previous occurrence is currently unused - meaning both would produce an identical permutation from this position onward.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.*;

public class PermutationsWithDuplicatesDemo {

    static List<List<Integer>> permuteUnique(int[] nums) {
        Arrays.sort(nums);
        List<List<Integer>> result = new ArrayList<>();
        backtrack(nums, new ArrayList<>(), new boolean[nums.length], result);
        return result;
    }

    static void backtrack(int[] nums, List<Integer> current, boolean[] used, List<List<Integer>> result) {
        if (current.size() == nums.length) {
            result.add(new ArrayList<>(current));
            return;
        }

        for (int i = 0; i < nums.length; i++) {
            if (used[i]) continue;

            // Skip a duplicate value UNLESS the previous identical value is already placed
            if (i > 0 && nums[i] == nums[i - 1] && !used[i - 1]) continue;

            used[i] = true;
            current.add(nums[i]);
            backtrack(nums, current, used, result);
            current.remove(current.size() - 1);
            used[i] = false;
        }
    }

    public static void main(String[] args) {
        int[] nums = {1, 1, 2};
        System.out.println(permuteUnique(nums));
    }
}
// OUTPUT:
// [[1, 1, 2], [1, 2, 1], [2, 1, 1]]`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What's the time complexity of generating all permutations?</td><td>O(n! &times; n) - there are n! permutations, and copying each completed permutation into the result costs O(n)</td></tr>
<tr class='text-center'><td>Why is "!used[i-1]" specifically the correct duplicate-skip condition, not "used[i-1]"?</td><td>It ensures duplicates are always placed in a FIXED relative order within any single permutation (the earlier occurrence must be used before the later one) - this canonical ordering eliminates duplicate permutations without accidentally skipping valid ones</td></tr>
<tr class='text-center'><td>How would you generate permutations WITHOUT extra space for a used[] array?</td><td>Swap-based in-place generation: swap the current index with each later index in turn, recurse on the remainder, then swap back - avoids the boolean array at the cost of mutating (and restoring) the input array itself</td></tr>
</table>`
        }
    ]
};
