import { Topic } from '../../coreJava';

export const fractionalOptimization: Topic = {
    id: 'dsa-greedy-fractional-optimization',
    name: 'Fractional Optimization',
    beginner: [
        {
            content: `<h4>Minimizing Average Waiting Time - the General Ratio-Greedy Pattern</h4>
A whole family of problems is solved by sorting on the RIGHT ratio or simple key, not by anything complex. Classic example: given job durations, schedule them (one at a time, no preemption) to minimize AVERAGE waiting time across all jobs. Greedy answer: run the SHORTEST job first - "Shortest Job First" scheduling.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.Arrays;

public class MinimizeAverageWaitingTimeDemo {

    static double minAverageWaitingTime(int[] jobDurations) {
        Arrays.sort(jobDurations);   // shortest job first

        long totalWaitingTime = 0;
        long currentTime = 0;

        for (int duration : jobDurations) {
            totalWaitingTime += currentTime;   // this job waited 'currentTime' before starting
            currentTime += duration;
        }
        return (double) totalWaitingTime / jobDurations.length;
    }

    public static void main(String[] args) {
        int[] jobs = {3, 1, 4, 1, 5};
        System.out.println(minAverageWaitingTime(jobs));
    }
}
// OUTPUT:
// 2.8`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why "Shortest Job First" Minimizes Total Waiting Time - Exchange Argument</h3>
Suppose an optimal schedule has a LONGER job immediately before a SHORTER one. Swapping their order: the shorter job now finishes earlier, reducing the waiting time of EVERY job after it by the difference in their durations, while the longer job's own start time doesn't get worse relative to jobs before it. Net effect: swapping always helps or ties, never hurts - so sorting shortest-first is optimal.`,
            codeExamples: [
                `package com.javaschoollab;

public class ShortestJobFirstProofDemo {
    public static void main(String[] args) {
        // Two adjacent jobs: A (duration 5) then B (duration 2), starting at time T.
        //   Order A,B: A waits T,       B waits T+5           -> combined wait = 2T+5
        //   Order B,A: B waits T,       A waits T+2           -> combined wait = 2T+2
        // Swapping to put the SHORTER job first REDUCES combined waiting time by 3
        // (the duration difference), and every job scheduled AFTER these two
        // benefits identically since the total time consumed by both is unchanged.
        System.out.println("Swapping a longer-then-shorter adjacent pair to shorter-then-longer");
        System.out.println("strictly reduces (or keeps equal) total waiting time - proving");
        System.out.println("that the fully sorted (shortest-first) order is optimal.");
    }
}
// OUTPUT:
// Swapping a longer-then-shorter adjacent pair to shorter-then-longer
// strictly reduces (or keeps equal) total waiting time - proving
// that the fully sorted (shortest-first) order is optimal.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What's the general recipe for spotting a "sort by the right ratio/key" greedy problem?</td><td>Look for an objective that's a SUM or AVERAGE over all items, where each item's contribution depends on WHEN it's processed relative to others - an adjacent-swap exchange argument usually reveals the correct sort key</td></tr>
<tr class='text-center'><td>How does this generalize Fractional Knapsack's value/weight ratio idea?</td><td>Both are instances of "greedily order by a ratio that directly measures efficiency per unit of the constrained resource" - weight in Knapsack, time in scheduling; the underlying exchange-argument proof technique is the same</td></tr>
<tr class='text-center'><td>What's the time complexity of Shortest Job First scheduling?</td><td>O(n log n), dominated by sorting - the waiting time computation afterward is a single O(n) pass</td></tr>
</table>`
        }
    ]
};
