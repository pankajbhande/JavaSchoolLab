import { Topic } from '../../coreJava';

export const intervalScheduling: Topic = {
    id: 'dsa-greedy-interval-scheduling',
    name: 'Interval Scheduling',
    beginner: [
        {
            content: `<h4>Minimum Removals to Make Intervals Non-Overlapping</h4>
The flip side of Activity Selection: instead of asking "how many can I KEEP", ask "how many must I REMOVE" so the rest don't overlap. Both questions share the same greedy foundation (sort by end time), and the answer to one directly gives the other: <code>removals = total - maxKept</code>.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.Arrays;

public class NonOverlappingIntervalsDemo {

    static int eraseOverlapIntervals(int[][] intervals) {
        Arrays.sort(intervals, (a, b) -> a[1] - b[1]);   // sort by END time

        int removals = 0;
        int lastEnd = intervals[0][1];

        for (int i = 1; i < intervals.length; i++) {
            if (intervals[i][0] < lastEnd) {
                removals++;   // this interval overlaps - it must be removed
                // keep 'lastEnd' as-is: the PREVIOUSLY kept interval still ends earlier,
                // which is better for future comparisons than this overlapping one
            } else {
                lastEnd = intervals[i][1];   // no overlap - keep it, update the boundary
            }
        }
        return removals;
    }

    public static void main(String[] args) {
        int[][] intervals = {{1, 2}, {2, 3}, {3, 4}, {1, 3}};
        System.out.println(eraseOverlapIntervals(intervals));
    }
}
// OUTPUT:
// 1`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why the Overlapping Interval is Discarded, Not the Kept One</h3>
When two intervals overlap, the algorithm ALWAYS discards the one being examined and keeps the one with the EARLIER end time already recorded (never updating <code>lastEnd</code> to a later value on a conflict) - this is exactly the "always favor earliest finish" greedy principle, applied here as "never let the boundary get WORSE (later) than what's already been secured".`,
            codeExamples: [
                `package com.javaschoollab;

public class WhyDiscardLaterEndDemo {
    public static void main(String[] args) {
        // Intervals: [1,4], [2,3] - these overlap.
        // [1,4] ends at 4, [2,3] ends at 3 - [2,3] has the EARLIER end time.
        //
        // WRONG: keep [1,4] (arbitrary/first-seen), discard [2,3]
        //   -> lastEnd becomes 4, blocking anything starting before 4
        //
        // RIGHT: keep [2,3] (earlier end), discard [1,4]
        //   -> lastEnd becomes 3, leaving MORE room for future intervals
        System.out.println("Always keep the interval with the EARLIER end time on a conflict -");
        System.out.println("it leaves the most room for subsequent intervals, exactly like Activity Selection.");
    }
}
// OUTPUT:
// Always keep the interval with the EARLIER end time on a conflict -
// it leaves the most room for subsequent intervals, exactly like Activity Selection.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>How does "minimum removals" relate to "maximum non-overlapping intervals"?</td><td>They're complementary: removals = total intervals - (maximum number that can be kept non-overlapping), which is exactly what Activity Selection computes directly</td></tr>
<tr class='text-center'><td>What's the time complexity of the minimum-removals approach?</td><td>O(n log n) for the sort, O(n) for the single greedy scan - same complexity class as Activity Selection</td></tr>
<tr class='text-center'><td>Would sorting by START time work equally well here?</td><td>No - sorting by end time is what guarantees the greedy "keep the earliest-ending" choice is always locally and globally correct; start-time sorting doesn't have that same optimality guarantee</td></tr>
</table>`
        }
    ]
};
