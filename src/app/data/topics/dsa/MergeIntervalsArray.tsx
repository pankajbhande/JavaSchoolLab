import { Topic } from '../../coreJava';

export const mergeIntervalsArray: Topic = {
    id: 'dsa-arrays-merge-intervals',
    name: 'Merge Intervals',
    beginner: [
        {
            content: `<h4>Merging Overlapping Intervals</h4>
Given a list of intervals like <code>[start, end]</code>, merge all that overlap into the minimum set of non-overlapping intervals.
<ul>
<li><b>Step 1:</b> sort intervals by START time - O(n log n). Without sorting, overlaps can't be detected in one pass.</li>
<li><b>Step 2:</b> scan left to right; if the current interval's start is &le; the last merged interval's end, merge them (extend the end); otherwise, start a new interval.</li>
</ul>`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.*;

public class MergeIntervalsDemo {

    static int[][] merge(int[][] intervals) {
        Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0])); // sort by start

        List<int[]> merged = new ArrayList<>();
        for (int[] interval : intervals) {
            if (merged.isEmpty() || merged.get(merged.size() - 1)[1] < interval[0]) {
                merged.add(interval);   // no overlap with the last merged interval
            } else {
                // overlaps - extend the end of the last merged interval
                merged.get(merged.size() - 1)[1] =
                    Math.max(merged.get(merged.size() - 1)[1], interval[1]);
            }
        }
        return merged.toArray(new int[0][]);
    }

    public static void main(String[] args) {
        int[][] intervals = {{1, 3}, {2, 6}, {8, 10}, {15, 18}};
        int[][] result = merge(intervals);
        for (int[] r : result) {
            System.out.println(Arrays.toString(r));
        }
    }
}
// OUTPUT:
// [1, 6]
// [8, 10]
// [15, 18]`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Inserting a New Interval Without Re-Sorting</h3>
If the intervals are ALREADY sorted and non-overlapping (a common follow-up), a new interval can be inserted and merged in a single O(n) pass, without re-sorting: collect intervals ending before the new one starts, merge all overlapping ones together, then collect the rest.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.*;

public class InsertIntervalDemo {

    static int[][] insert(int[][] intervals, int[] newInterval) {
        List<int[]> result = new ArrayList<>();
        int i = 0, n = intervals.length;

        // 1. Add all intervals ending before newInterval starts
        while (i < n && intervals[i][1] < newInterval[0]) {
            result.add(intervals[i++]);
        }

        // 2. Merge all intervals that overlap with newInterval
        while (i < n && intervals[i][0] <= newInterval[1]) {
            newInterval[0] = Math.min(newInterval[0], intervals[i][0]);
            newInterval[1] = Math.max(newInterval[1], intervals[i][1]);
            i++;
        }
        result.add(newInterval);

        // 3. Add all remaining intervals (start after newInterval ends)
        while (i < n) {
            result.add(intervals[i++]);
        }
        return result.toArray(new int[0][]);
    }

    public static void main(String[] args) {
        int[][] intervals = {{1, 3}, {6, 9}};
        int[][] result = insert(intervals, new int[]{2, 5});
        for (int[] r : result) {
            System.out.println(Arrays.toString(r));
        }
    }
}
// OUTPUT:
// [1, 5]
// [6, 9]`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why must intervals be sorted by start time before merging?</td><td>Merging relies on scanning left to right and only ever comparing against the last merged interval - without sorting, a later interval could overlap an earlier one already passed</td></tr>
<tr class='text-center'><td>What's the overall time complexity of merge intervals?</td><td>O(n log n), dominated by the initial sort; the merge scan itself is O(n)</td></tr>
<tr class='text-center'><td>How do you check if two intervals overlap at all?</td><td>a and b overlap when a.start <= b.end AND b.start <= a.end - equivalently, they do NOT overlap when one ends strictly before the other begins</td></tr>
</table>`
        }
    ]
};
