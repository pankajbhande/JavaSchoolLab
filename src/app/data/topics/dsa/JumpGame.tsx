import { Topic } from '../../coreJava';

export const jumpGame: Topic = {
    id: 'dsa-greedy-jump-game',
    name: 'Jump Game',
    beginner: [
        {
            content: `<h4>Can You Reach the Last Index?</h4>
Each array element is the MAXIMUM jump length from that position. Determine if the last index is reachable from index 0. Greedy approach: track the FARTHEST reachable index seen so far as you scan left to right - if you ever reach a position beyond that farthest reach before updating it, you're stuck.`,
            codeExamples: [
                `package com.javaschoollab;

public class JumpGameDemo {

    static boolean canJump(int[] nums) {
        int farthestReachable = 0;

        for (int i = 0; i < nums.length; i++) {
            if (i > farthestReachable) {
                return false;   // this position is unreachable - stuck before getting here
            }
            farthestReachable = Math.max(farthestReachable, i + nums[i]);
        }
        return true;
    }

    public static void main(String[] args) {
        System.out.println(canJump(new int[]{2, 3, 1, 1, 4}));
        System.out.println(canJump(new int[]{3, 2, 1, 0, 4}));
    }
}
// OUTPUT:
// true
// false`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Jump Game II - Minimum Number of Jumps</h3>
A harder follow-up: find the MINIMUM jumps needed to reach the end (assuming it's always reachable). The greedy trick uses an implicit "BFS by levels" idea: track the current jump's reach and the NEXT jump's best possible reach; when the scan passes the current jump's boundary, that's when a jump is "used", moving the boundary forward.`,
            codeExamples: [
                `package com.javaschoollab;

public class MinimumJumpsDemo {

    static int jump(int[] nums) {
        int jumps = 0;
        int currentEnd = 0;       // farthest reachable with jumps taken SO FAR
        int farthest = 0;         // farthest reachable with ONE MORE jump from here

        for (int i = 0; i < nums.length - 1; i++) {
            farthest = Math.max(farthest, i + nums[i]);

            if (i == currentEnd) {
                jumps++;                  // must jump now to make further progress
                currentEnd = farthest;     // this jump's new reachable boundary
            }
        }
        return jumps;
    }

    public static void main(String[] args) {
        int[] nums = {2, 3, 1, 1, 4};
        System.out.println(jump(nums));
    }
}
// OUTPUT:
// 2`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why does "i > farthestReachable" correctly detect an impossible Jump Game?</td><td>farthestReachable represents the BEST possible reach given everything seen so far - if the current index i already exceeds it, no sequence of jumps from earlier positions could have gotten here, so it's definitively unreachable</td></tr>
<tr class='text-center'><td>What's the intuition behind Jump Game II's "level by level" framing?</td><td>currentEnd marks the boundary of everywhere reachable with the jumps used SO FAR (like a BFS level); farthest tracks the best possible NEXT boundary; crossing currentEnd forces incrementing the jump count, exactly like moving to the next BFS level</td></tr>
<tr class='text-center'><td>What's the time and space complexity of both versions?</td><td>Both are O(n) time, O(1) space - single-pass greedy scans with running trackers, no extra data structures needed</td></tr>
</table>`
        }
    ]
};
