import { Topic } from '../../coreJava';

export const hashSetTopic: Topic = {
    id: 'dsa-hashing-hashset',
    name: 'HashSet',
    beginner: [
        {
            content: `<h4>What is a HashSet?</h4>
A HashSet stores unique elements with average O(1) <code>add</code>, <code>contains</code>, and <code>remove</code>. Internally, it's literally backed by a HashMap where every element is stored as a KEY with a dummy constant value - so everything true about HashMap's hashing behavior applies here too.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.HashSet;
import java.util.Set;

public class HashSetBasicsDemo {
    public static void main(String[] args) {
        Set<Integer> seen = new HashSet<>();
        int[] arr = {1, 2, 3, 2, 4, 1, 5};

        for (int num : arr) {
            if (!seen.add(num)) {
                System.out.println("Duplicate found: " + num);
            }
        }
        System.out.println("Unique count: " + seen.size());
    }
}
// OUTPUT:
// Duplicate found: 2
// Duplicate found: 1
// Unique count: 5`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>HashSet for O(1) Membership Checks - Two Sum Without Nested Loops</h3>
Replacing a nested-loop O(n&sup2;) search with a HashSet lookup is one of the highest-value DSA patterns: any time a problem needs "have I seen X before?" or "does the complement of X exist?", a HashSet turns an O(n) inner scan into O(1).`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.HashMap;
import java.util.Map;

public class TwoSumHashDemo {

    // Returns the INDICES of two numbers that add up to target - O(n), one pass
    static int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> seen = new HashMap<>();  // value -> index

        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (seen.containsKey(complement)) {
                return new int[]{seen.get(complement), i};
            }
            seen.put(nums[i], i);
        }
        return new int[]{-1, -1};
    }

    public static void main(String[] args) {
        int[] nums = {2, 7, 11, 15};
        System.out.println(java.util.Arrays.toString(twoSum(nums, 9)));
    }
}
// OUTPUT:
// [0, 1]`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>How is HashSet implemented internally?</td><td>It wraps a HashMap<E, Object>, storing each set element as a key with a shared dummy value - add/contains/remove delegate straight to the underlying map's key operations</td></tr>
<tr class='text-center'><td>What's the time complexity of checking if an array has duplicates using a HashSet?</td><td>O(n) - one pass, adding each element and checking add()'s boolean return value for a collision with an existing element</td></tr>
<tr class='text-center'><td>When would you use a HashSet over sorting to detect duplicates?</td><td>HashSet is O(n) vs sorting's O(n log n); sorting is preferable only when you also need the elements in order afterward, or when memory for an extra structure is tightly constrained</td></tr>
</table>`
        }
    ]
};
