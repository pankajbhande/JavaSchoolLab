import { Topic } from '../../coreJava';

export const fastSlowPointersArray: Topic = {
    id: 'dsa-arrays-fast-slow-pointers',
    name: 'Fast & Slow Pointers',
    beginner: [
        {
            content: `<h4>The Fast & Slow (Tortoise and Hare) Pattern</h4>
Two pointers start at the same place but move at different SPEEDS - typically <code>slow</code> moves 1 step and <code>fast</code> moves 2 steps per iteration. It's most famous for cycle detection in a linked list, but the same idea applies to arrays where values act as "next pointers" (each value tells you the next index to jump to).<br><br>
The key insight: if there's a cycle, the fast pointer will eventually lap the slow pointer and they will meet INSIDE the cycle - if there's no cycle, fast simply reaches the end first.`,
            codeExamples: [
                `package com.javaschoollab;

public class FindDuplicateArrayDemo {

    // Array of n+1 integers, each in [1, n]. Exactly one value repeats
    // (possibly more than once). Find it in O(n) time, O(1) space, without
    // modifying the array - by treating values as "next index" pointers,
    // which forces a cycle to exist (Floyd's algorithm on an implicit list).
    static int findDuplicate(int[] nums) {
        int slow = nums[0];
        int fast = nums[0];

        // Phase 1: find the meeting point inside the cycle
        do {
            slow = nums[slow];
            fast = nums[nums[fast]];
        } while (slow != fast);

        // Phase 2: find the cycle's entrance == the duplicate value
        slow = nums[0];
        while (slow != fast) {
            slow = nums[slow];
            fast = nums[fast];
        }
        return slow;
    }

    public static void main(String[] args) {
        int[] nums = {1, 3, 4, 2, 2};
        System.out.println(findDuplicate(nums));
    }
}
// OUTPUT:
// 2`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why the Meeting Point Reveals the Cycle's Start</h3>
Let the distance from the start to the cycle entrance be <code>a</code>, and the cycle length be <code>c</code>. By the time slow and fast meet, slow has traveled <code>a + b</code> steps and fast has traveled <code>a + b + k&middot;c</code> for some integer k, while covering exactly twice slow's distance. Solving that equation shows the distance from the START back to the cycle entrance equals the distance from the MEETING POINT forward to the cycle entrance - which is exactly why resetting one pointer to the start and advancing both at speed 1 makes them meet at the entrance.`,
            codeExamples: [
                `package com.javaschoollab;

// Middle of an array/list, in one pass, using fast=2x, slow=1x
public class MiddleOfSequenceDemo {

    static int findMiddleIndex(int[] arr) {
        int slow = 0, fast = 0;
        while (fast < arr.length - 1 && fast + 1 < arr.length) {
            slow++;
            fast += 2;
        }
        return slow;   // when fast reaches the end, slow sits at the middle
    }

    public static void main(String[] args) {
        int[] arr = {10, 20, 30, 40, 50, 60, 70};
        int mid = findMiddleIndex(arr);
        System.out.println("Middle index: " + mid + ", value: " + arr[mid]);
    }
}
// OUTPUT:
// Middle index: 3, value: 40`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What are the two phases of Floyd's cycle-finding algorithm?</td><td>Phase 1 finds ANY meeting point inside the cycle by running slow/fast until they collide; Phase 2 resets one pointer to the start and advances both at speed 1 until they meet again, which happens exactly at the cycle's entrance</td></tr>
<tr class='text-center'><td>What's the time and space complexity?</td><td>O(n) time, O(1) space - no hash set needed, unlike the naive "seen before" approach</td></tr>
<tr class='text-center'><td>Where else does this exact pattern appear?</td><td>Linked list cycle detection (LeetCode "Linked List Cycle II"), and detecting a repeated number in a bounded array by treating values as implicit next-pointers, as shown above</td></tr>
</table>`
        }
    ]
};
