import { Topic } from '../../coreJava';

export const subsetsTopic: Topic = {
    id: 'dsa-recursion-backtracking-subsets',
    name: 'Subsets',
    beginner: [
        {
            content: `<h4>Generating All Subsets (the Power Set)</h4>
A set of n elements has 2&#8319; subsets - each element is either INCLUDED or EXCLUDED, independently. Backtracking generates them all by trying both choices at every element and recursing, with a base case that records the current partial subset once all elements have been decided.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.ArrayList;
import java.util.List;

public class SubsetsDemo {

    static List<List<Integer>> subsets(int[] nums) {
        List<List<Integer>> result = new ArrayList<>();
        backtrack(nums, 0, new ArrayList<>(), result);
        return result;
    }

    static void backtrack(int[] nums, int index, List<Integer> current, List<List<Integer>> result) {
        if (index == nums.length) {
            result.add(new ArrayList<>(current));   // record this subset (a COPY)
            return;
        }

        // Choice 1: EXCLUDE nums[index]
        backtrack(nums, index + 1, current, result);

        // Choice 2: INCLUDE nums[index]
        current.add(nums[index]);
        backtrack(nums, index + 1, current, result);
        current.remove(current.size() - 1);   // backtrack: undo the inclusion
    }

    public static void main(String[] args) {
        int[] nums = {1, 2, 3};
        System.out.println(subsets(nums));
    }
}
// OUTPUT:
// [[], [3], [2], [2, 3], [1], [1, 3], [1, 2], [1, 2, 3]]`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Handling Duplicates - Subsets II</h3>
When the input array has DUPLICATE values, the naive approach produces duplicate subsets. The fix: SORT first, then at each recursion level, skip over a value if it equals the PREVIOUS value at the same level (meaning that "include/exclude" choice for this value was already explored from an earlier duplicate).`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.*;

public class SubsetsWithDuplicatesDemo {

    static List<List<Integer>> subsetsWithDup(int[] nums) {
        Arrays.sort(nums);   // group duplicates together - required for the skip logic to work
        List<List<Integer>> result = new ArrayList<>();
        backtrack(nums, 0, new ArrayList<>(), result);
        return result;
    }

    static void backtrack(int[] nums, int start, List<Integer> current, List<List<Integer>> result) {
        result.add(new ArrayList<>(current));   // every prefix IS a valid subset here

        for (int i = start; i < nums.length; i++) {
            // Skip duplicates AT THE SAME RECURSION LEVEL (not globally)
            if (i > start && nums[i] == nums[i - 1]) continue;

            current.add(nums[i]);
            backtrack(nums, i + 1, current, result);
            current.remove(current.size() - 1);
        }
    }

    public static void main(String[] args) {
        int[] nums = {1, 2, 2};
        System.out.println(subsetsWithDup(nums));
    }
}
// OUTPUT:
// [[], [1], [1, 2], [1, 2, 2], [2], [2, 2]]`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why does a set of n elements have exactly 2^n subsets?</td><td>Each element independently has 2 states (in or out); by the multiplication principle, n independent binary choices give 2^n total combinations</td></tr>
<tr class='text-center'><td>Why does "i > start" (not "i > 0") matter for the duplicate-skip condition?</td><td>It only skips duplicates within the SAME recursive call's loop (the same "level" of choices being made), not duplicates that appear legitimately at DIFFERENT recursion depths - using i > 0 would incorrectly block valid subsets</td></tr>
<tr class='text-center'><td>How could you generate all subsets iteratively, without recursion?</td><td>Start with just the empty set; for each new element, take every EXISTING subset and add a copy of it WITH the new element appended - doubling the subset count each iteration, matching the 2^n growth</td></tr>
</table>`
        }
    ]
};
