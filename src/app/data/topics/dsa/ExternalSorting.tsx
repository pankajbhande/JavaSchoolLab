import { Topic } from '../../coreJava';

export const externalSorting: Topic = {
    id: 'dsa-sorting-external-sorting',
    name: 'External Sorting',
    beginner: [
        {
            content: `<h4>Sorting Data That Doesn't Fit in Memory</h4>
External sort handles datasets LARGER than available RAM (e.g. a 100GB file with 16GB of memory) - the classic technique is <b>External Merge Sort</b>:
<ul>
<li><b>Phase 1 (chunk & sort):</b> read a memory-sized chunk, sort it in RAM (any in-memory sort), write it back to disk as a sorted "run".</li>
<li><b>Phase 2 (merge):</b> repeatedly K-way merge the sorted runs (using a min-heap, same idea as Merge K Sorted Lists) until only one fully-sorted file remains.</li>
</ul>`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.*;

public class ExternalSortSimulationDemo {

    // Simulates the CHUNKING phase: splits data into memory-sized sorted runs
    static List<int[]> createSortedRuns(int[] data, int chunkSize) {
        List<int[]> runs = new ArrayList<>();
        for (int i = 0; i < data.length; i += chunkSize) {
            int end = Math.min(i + chunkSize, data.length);
            int[] chunk = Arrays.copyOfRange(data, i, end);
            Arrays.sort(chunk);   // in-memory sort, this chunk fits in RAM
            runs.add(chunk);
        }
        return runs;
    }

    public static void main(String[] args) {
        int[] data = {38, 27, 43, 3, 9, 82, 10, 1, 55, 21};
        List<int[]> runs = createSortedRuns(data, 3);   // simulate 3-element "memory"

        for (int[] run : runs) {
            System.out.println(Arrays.toString(run));
        }
    }
}
// OUTPUT:
// [27, 38, 43]
// [3, 9, 82]
// [1, 10, 55]
// [21]`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>K-Way Merge of Sorted Runs with a Min-Heap</h3>
Merging phase reads only ONE element from each run into memory at a time (a min-heap of size K, K = number of runs), extracting the global minimum and advancing that run - never needing more than K elements in RAM regardless of total file size. This is exactly the "Merge K Sorted Lists" pattern applied to disk-backed data.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.*;

public class KWayMergeDemo {

    static class RunPointer {
        int[] run;
        int index;
        RunPointer(int[] run) { this.run = run; this.index = 0; }
        boolean hasNext() { return index < run.length; }
        int value() { return run[index]; }
    }

    static int[] mergeRuns(List<int[]> runs) {
        PriorityQueue<RunPointer> heap = new PriorityQueue<>(
            Comparator.comparingInt(RunPointer::value));

        for (int[] run : runs) {
            RunPointer rp = new RunPointer(run);
            if (rp.hasNext()) heap.offer(rp);
        }

        List<Integer> result = new ArrayList<>();
        while (!heap.isEmpty()) {
            RunPointer smallest = heap.poll();
            result.add(smallest.value());
            smallest.index++;
            if (smallest.hasNext()) heap.offer(smallest);   // re-add if this run has more
        }

        return result.stream().mapToInt(Integer::intValue).toArray();
    }

    public static void main(String[] args) {
        List<int[]> runs = List.of(
            new int[]{3, 9, 27, 38, 43, 82},
            new int[]{1, 10, 21, 55}
        );
        System.out.println(Arrays.toString(mergeRuns(runs)));
    }
}
// OUTPUT:
// [1, 3, 9, 10, 21, 27, 38, 43, 55, 82]`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why is disk I/O, not comparisons, the real bottleneck in external sorting?</td><td>Disk reads/writes are orders of magnitude slower than in-memory operations - external sort algorithms are designed to MINIMIZE the number of disk passes, not to minimize comparisons the way in-memory sorts do</td></tr>
<tr class='text-center'><td>Why does the merge phase use a min-heap instead of comparing all K runs' fronts directly?</td><td>A heap gives O(log K) per extraction instead of O(K) linear scan across all runs - for a large number of runs (large K), that difference matters significantly</td></tr>
<tr class='text-center'><td>What real-world systems rely on external sorting?</td><td>Database engines sorting result sets larger than available buffer memory (ORDER BY on huge tables), distributed systems like Hadoop's MapReduce shuffle phase, and any ETL pipeline processing files far bigger than RAM</td></tr>
</table>`
        }
    ]
};
