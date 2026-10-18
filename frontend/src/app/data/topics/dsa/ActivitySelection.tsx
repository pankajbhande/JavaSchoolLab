import { Topic } from '../../coreJava';

export const activitySelection: Topic = {
    id: 'dsa-greedy-activity-selection',
    name: 'Activity Selection',
    beginner: [
        {
            content: `<h4>Selecting the Maximum Number of Non-Overlapping Activities</h4>
Given activities each with a start and end time, pick the MAXIMUM number that don't overlap. The greedy insight: always pick the activity that FINISHES EARLIEST among the remaining valid options - it leaves the most room for future activities. Sort by end time, then scan once.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.Arrays;

public class ActivitySelectionDemo {

    static int maxActivities(int[][] activities) {
        // Sort by END time - the greedy choice
        Arrays.sort(activities, (a, b) -> a[1] - b[1]);

        int count = 1;
        int lastEndTime = activities[0][1];

        for (int i = 1; i < activities.length; i++) {
            if (activities[i][0] >= lastEndTime) {   // starts after the last selected one ends
                count++;
                lastEndTime = activities[i][1];
            }
        }
        return count;
    }

    public static void main(String[] args) {
        int[][] activities = {{1, 4}, {3, 5}, {0, 6}, {5, 7}, {3, 9}, {5, 9}, {6, 10}, {8, 11}, {8, 12}, {2, 14}, {12, 16}};
        System.out.println(maxActivities(activities));
    }
}
// OUTPUT:
// 4`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why "Earliest Finish Time" is Provably Optimal (Exchange Argument)</h3>
The proof that greedy works here uses an EXCHANGE ARGUMENT: suppose an optimal solution doesn't pick the earliest-finishing activity first. Swap it in instead of whatever the optimal solution DID pick first - since the earliest-finish activity ends no later, this swap can only free up MORE room for subsequent choices, never less. So an optimal solution using the greedy first choice always exists - by induction, the whole greedy strategy is optimal.`,
            codeExamples: [
                `package com.javaschoollab;

public class ExchangeArgumentDemo {
    public static void main(String[] args) {
        System.out.println("Exchange argument sketch:");
        System.out.println("Suppose optimal solution OPT picks activity X first (X does not have");
        System.out.println("the earliest finish time). Let E = the activity that DOES finish earliest.");
        System.out.println();
        System.out.println("Since E finishes no later than X, replacing X with E in OPT still leaves");
        System.out.println("every OTHER activity in OPT compatible (they all started after X ended,");
        System.out.println("so they also start after E ends, since E ends <= X ends).");
        System.out.println();
        System.out.println("This proves: an optimal solution exists that starts with the greedy choice -");
        System.out.println("so greedily always picking earliest-finish is safe.");
    }
}
// OUTPUT:
// Exchange argument sketch:
// Suppose optimal solution OPT picks activity X first (X does not have
// the earliest finish time). Let E = the activity that DOES finish earliest.
//
// Since E finishes no later than X, replacing X with E in OPT still leaves
// every OTHER activity in OPT compatible (they all started after X ended,
// so they also start after E ends, since E ends <= X ends).
//
// This proves: an optimal solution exists that starts with the greedy choice -
// so greedily always picking earliest-finish is safe.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why sort by END time rather than start time or duration?</td><td>End time directly measures how much room is left for FUTURE activities - sorting by start time or duration doesn't correlate with that, and can lead to suboptimal choices</td></tr>
<tr class='text-center'><td>What's the time complexity of Activity Selection?</td><td>O(n log n), dominated by the sort; the greedy scan afterward is O(n)</td></tr>
<tr class='text-center'><td>Does a greedy approach work for the WEIGHTED version (each activity has a value, maximize total value)?</td><td>No - weighted activity selection requires Dynamic Programming, since a locally "safe" greedy choice no longer guarantees the globally optimal total value once weights are unequal</td></tr>
</table>`
        }
    ]
};
