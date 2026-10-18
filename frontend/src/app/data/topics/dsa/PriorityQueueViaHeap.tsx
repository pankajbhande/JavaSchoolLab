import { Topic } from '../../coreJava';

export const priorityQueueViaHeap: Topic = {
    id: 'dsa-heap-priority-queue',
    name: 'Priority Queue',
    beginner: [
        {
            content: `<h4>Why a Heap is the Standard Priority Queue Implementation</h4>
A priority queue needs fast <code>insert</code> AND fast <code>extract-highest-priority</code>. Comparing implementation choices makes clear why a heap wins:
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Backing structure</th><th>Insert</th><th>Extract min/max</th></tr>
<tr class='text-center'><td>Unsorted array</td><td>O(1)</td><td>O(n) - must scan for the best</td></tr>
<tr class='text-center'><td>Sorted array</td><td>O(n) - must shift to insert in order</td><td>O(1)</td></tr>
<tr class='text-center'><td>Binary heap</td><td>O(log n)</td><td>O(log n)</td></tr>
</table>
A heap is the balanced compromise - both operations logarithmic, neither one is a bottleneck.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.PriorityQueue;

public class WhyHeapForPQDemo {
    public static void main(String[] args) {
        PriorityQueue<Integer> pq = new PriorityQueue<>();

        long start = System.nanoTime();
        for (int i = 1000; i >= 1; i--) {
            pq.offer(i);   // O(log n) each, even inserting in REVERSE order
        }
        long insertTime = System.nanoTime() - start;

        start = System.nanoTime();
        for (int i = 0; i < 1000; i++) {
            pq.poll();     // O(log n) each
        }
        long extractTime = System.nanoTime() - start;

        System.out.println("Both insert and extract scale as O(log n),");
        System.out.println("regardless of insertion order - unlike sorted/unsorted array alternatives.");
    }
}
// OUTPUT:
// Both insert and extract scale as O(log n),
// regardless of insertion order - unlike sorted/unsorted array alternatives.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Dijkstra's Algorithm - the Canonical Real-World Priority Queue Use</h3>
Dijkstra's shortest-path algorithm needs to repeatedly grab the UNVISITED node with the smallest known distance - exactly a priority queue's job. Using a heap-backed <code>PriorityQueue</code> here is what brings Dijkstra's complexity down to O((V + E) log V), compared to O(V&sup2;) with a naive linear scan for the minimum each time.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.*;

public class DijkstraWithPQDemo {

    static int[] dijkstra(Map<Integer, List<int[]>> graph, int source, int n) {
        int[] dist = new int[n];
        Arrays.fill(dist, Integer.MAX_VALUE);
        dist[source] = 0;

        // Min-heap ordered by CURRENT KNOWN DISTANCE - exactly a priority queue's use case
        PriorityQueue<int[]> pq = new PriorityQueue<>(Comparator.comparingInt(a -> a[1]));
        pq.offer(new int[]{source, 0});

        while (!pq.isEmpty()) {
            int[] current = pq.poll();
            int node = current[0], d = current[1];
            if (d > dist[node]) continue;   // stale entry, a shorter path was already found

            for (int[] neighbor : graph.getOrDefault(node, List.of())) {
                int next = neighbor[0], weight = neighbor[1];
                if (dist[node] + weight < dist[next]) {
                    dist[next] = dist[node] + weight;
                    pq.offer(new int[]{next, dist[next]});
                }
            }
        }
        return dist;
    }

    public static void main(String[] args) {
        Map<Integer, List<int[]>> graph = new HashMap<>();
        graph.put(0, List.of(new int[]{1, 4}, new int[]{2, 1}));
        graph.put(2, List.of(new int[]{1, 2}));
        graph.put(1, List.of(new int[]{3, 1}));
        graph.put(3, List.of());

        System.out.println(Arrays.toString(dijkstra(graph, 0, 4)));
    }
}
// OUTPUT:
// [0, 3, 1, 4]`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why does Dijkstra's use a heap-based priority queue instead of scanning for the minimum?</td><td>A linear scan for the smallest unvisited distance is O(V) per step, giving O(V^2) total; a heap gets that operation down to O(log V), bringing the total to O((V+E) log V)</td></tr>
<tr class='text-center'><td>What does "if (d > dist[node]) continue" handle in the Dijkstra code above?</td><td>A STALE priority queue entry - since nodes can be added to the queue multiple times as shorter paths are discovered, this check skips outdated entries instead of reprocessing a node with worse information</td></tr>
<tr class='text-center'><td>Besides Dijkstra, what other algorithms fundamentally rely on a priority queue?</td><td>Prim's Algorithm (Minimum Spanning Tree), Huffman Coding (always merging the two least-frequent nodes), and A* Search (priority by estimated total cost)</td></tr>
</table>`
        }
    ]
};
