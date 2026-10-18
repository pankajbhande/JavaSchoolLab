import { Topic } from '../../coreJava';

export const jobSequencing: Topic = {
    id: 'dsa-greedy-job-sequencing',
    name: 'Job Sequencing',
    beginner: [
        {
            content: `<h4>Maximizing Profit with Deadlines</h4>
Each job has a DEADLINE and a PROFIT; each job takes exactly 1 unit of time, and only one job can run at a time. Schedule jobs to maximize total profit. Greedy strategy: sort jobs by profit DESCENDING, then for each job, schedule it as LATE as possible (closest to its deadline, but still before it) - leaving earlier slots open for other jobs.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.Arrays;

public class JobSequencingDemo {

    static int scheduleJobs(int[][] jobs) {   // {deadline, profit}
        Arrays.sort(jobs, (a, b) -> b[1] - a[1]);   // sort by PROFIT, descending

        int maxDeadline = 0;
        for (int[] job : jobs) maxDeadline = Math.max(maxDeadline, job[0]);

        boolean[] slotUsed = new boolean[maxDeadline + 1];   // slotUsed[t] = is time slot t taken
        int totalProfit = 0;

        for (int[] job : jobs) {
            int deadline = job[0], profit = job[1];

            // Try to place this job as LATE as possible, but before its deadline
            for (int t = deadline; t >= 1; t--) {
                if (!slotUsed[t]) {
                    slotUsed[t] = true;
                    totalProfit += profit;
                    break;
                }
            }
        }
        return totalProfit;
    }

    public static void main(String[] args) {
        int[][] jobs = {{4, 20}, {1, 10}, {1, 40}, {1, 30}};
        System.out.println(scheduleJobs(jobs));
    }
}
// OUTPUT:
// 60`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why "Schedule As Late As Possible" Beats "As Early As Possible"</h3>
Scheduling a job EARLY unnecessarily "wastes" an early time slot that a job with an EARLIER deadline might desperately need. Scheduling as LATE as possible (but still on time) preserves maximum flexibility for jobs that have tighter deadlines - a subtle but crucial greedy design choice that's easy to get backward.`,
            codeExamples: [
                `package com.javaschoollab;

public class LateSchedulingReasonDemo {
    public static void main(String[] args) {
        // Job A: deadline=1, profit=10
        // Job B: deadline=2, profit=20
        // Sorted by profit: B (20) then A (10)
        //
        // WRONG (schedule as EARLY as possible):
        //   B placed at slot 1 (earliest available) -> A needs slot <= 1, but it's taken -> A DROPPED
        //   Total profit: 20
        //
        // RIGHT (schedule as LATE as possible):
        //   B placed at slot 2 (latest available, deadline=2) -> slot 1 still free
        //   A placed at slot 1 (its only option, deadline=1) -> BOTH scheduled
        //   Total profit: 30
        System.out.println("Scheduling late preserves early slots for tighter-deadline jobs -");
        System.out.println("scheduling early can needlessly block a job that has NO other option.");
    }
}
// OUTPUT:
// Scheduling late preserves early slots for tighter-deadline jobs -
// scheduling early can needlessly block a job that has NO other option.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What's the time complexity of this Job Sequencing approach?</td><td>O(n log n) for sorting plus O(n * maxDeadline) for the placement scan - can be improved to O(n log n) overall using a Disjoint Set Union to jump directly to the nearest free slot instead of scanning backward one by one</td></tr>
<tr class='text-center'><td>What does the boolean slotUsed[] array represent conceptually?</td><td>Each time unit is a resource that can host at most one job - the array tracks which discrete time slots are already occupied</td></tr>
<tr class='text-center'><td>How would DSU speed up the "find the latest free slot" search?</td><td>Each slot's DSU parent points to the next FREE slot at or before it; finding a slot is a find() call, and "using" a slot unions it with the slot before it - both become near O(1) amortized instead of a linear backward scan</td></tr>
</table>`
        }
    ]
};
