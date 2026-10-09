import { Topic } from '../../coreJava';

export const mergeIntervalsGreedy: Topic = {
    id: 'dsa-greedy-merge-intervals-greedy',
    name: 'Merge Intervals (Greedy)',
    beginner: [
        {
            content: `<h4>Employee Free Time - Merging Across Multiple Schedules</h4>
A harder variant of basic interval merging: given several employees' individual busy schedules (each already sorted and non-overlapping WITHIN a person), find the COMMON free time slots shared by everyone. The greedy approach: flatten ALL intervals together, sort by start, merge overlapping busy periods exactly like basic merge intervals - then the GAPS between merged intervals are the shared free time.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.*;

public class EmployeeFreeTimeDemo {

    static List<int[]> employeeFreeTime(List<int[]> allSchedules) {
        allSchedules.sort((a, b) -> a[0] - b[0]);   // greedy: sort by START time

        List<int[]> merged = new ArrayList<>();
        int[] current = allSchedules.get(0);

        for (int[] interval : allSchedules) {
            if (interval[0] <= current[1]) {
                current[1] = Math.max(current[1], interval[1]);   // extend the merged busy block
            } else {
                merged.add(current);
                current = interval;
            }
        }
        merged.add(current);

        // Gaps between consecutive merged busy blocks ARE the shared free time
        List<int[]> freeTime = new ArrayList<>();
        for (int i = 1; i < merged.size(); i++) {
            freeTime.add(new int[]{merged.get(i - 1)[1], merged.get(i)[0]});
        }
        return freeTime;
    }

    public static void main(String[] args) {
        List<int[]> schedules = new ArrayList<>(List.of(
            new int[]{1, 3}, new int[]{6, 7},    // employee A
            new int[]{2, 4},                      // employee B
            new int[]{2, 5}, new int[]{9, 12}     // employee C
        ));

        for (int[] gap : employeeFreeTime(schedules)) {
            System.out.println(Arrays.toString(gap));
        }
    }
}
// OUTPUT:
// [5, 6]
// [7, 9]`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why Flattening Everyone's Schedule Together is Correct</h3>
The key insight: "when is EVERYONE simultaneously free" is equivalent to "when is NO ONE busy" - which only requires knowing the UNION of all busy periods, not which specific person owns which interval. Once flattened and merged, the merged busy blocks represent all moments when at least one person is occupied; the gaps between them are, by elimination, when nobody is busy at all.`,
            codeExamples: [
                `package com.javaschoollab;

public class WhyFlatteningWorksDemo {
    public static void main(String[] args) {
        System.out.println("Employee free time = complement of the UNION of everyone's busy time.");
        System.out.println();
        System.out.println("Merging intervals computes exactly that union: overlapping busy periods");
        System.out.println("from DIFFERENT people collapse into one continuous busy block, same as");
        System.out.println("overlapping intervals from the SAME person would - ownership is irrelevant");
        System.out.println("to the question 'is anyone busy right now?'");
    }
}
// OUTPUT:
// Employee free time = complement of the UNION of everyone's busy time.
//
// Merging intervals computes exactly that union: overlapping busy periods
// from DIFFERENT people collapse into one continuous busy block, same as
// overlapping intervals from the SAME person would - ownership is irrelevant
// to the question 'is anyone busy right now?'`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What's the time complexity of Employee Free Time?</td><td>O(n log n) where n is the total number of intervals across all employees - dominated by the sort, since merging and gap-finding are both O(n)</td></tr>
<tr class='text-center'><td>Could a heap-based K-way merge be used instead of flattening and sorting everything?</td><td>Yes - since each employee's OWN schedule is already sorted, a min-heap tracking the earliest unprocessed interval per employee achieves the same result in O(n log k) where k is the number of employees, better when k is much smaller than n</td></tr>
<tr class='text-center'><td>Why must the greedy merge sort by START time specifically for THIS problem?</td><td>The merge-adjacent-overlapping-intervals logic relies on processing intervals in start-time order so that "does the next interval overlap with what's currently merged" can be checked with a single comparison against the running merged block's end</td></tr>
</table>`
        }
    ]
};
