import { Topic } from '../../coreJava';

export const shortestPathDijkstra: Topic = {
    id: 'dsa-graphs-shortest-path-dijkstra',
    name: 'Shortest Path - Dijkstra',
    beginner: [
        {
            content: `<h4>Shortest Paths from One Source, Non-Negative Weights</h4>
Dijkstra's Algorithm greedily expands the UNVISITED vertex with the smallest known distance, using a min-heap - once a vertex is finalized, its distance is guaranteed correct and never revisited. Works ONLY when all edge weights are non-negative.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.*;

public class DijkstraDemo {

    static int[] dijkstra(int n, Map<Integer, List<int[]>> graph, int source) {
        int[] dist = new int[n];
        Arrays.fill(dist, Integer.MAX_VALUE);
        dist[source] = 0;

        PriorityQueue<int[]> pq = new PriorityQueue<>(Comparator.comparingInt(a -> a[1]));
        pq.offer(new int[]{source, 0});

        while (!pq.isEmpty()) {
            int[] current = pq.poll();
            int node = current[0], d = current[1];
            if (d > dist[node]) continue;   // stale entry - a shorter path was already found

            for (int[] edge : graph.getOrDefault(node, List.of())) {
                int neighbor = edge[0], weight = edge[1];
                if (dist[node] + weight < dist[neighbor]) {
                    dist[neighbor] = dist[node] + weight;
                    pq.offer(new int[]{neighbor, dist[neighbor]});
                }
            }
        }
        return dist;
    }

    public static void main(String[] args) {
        Map<Integer, List<int[]>> graph = new HashMap<>();
        graph.put(0, List.of(new int[]{1, 4}, new int[]{2, 1}));
        graph.put(2, List.of(new int[]{1, 2}, new int[]{3, 5}));
        graph.put(1, List.of(new int[]{3, 1}));

        System.out.println(Arrays.toString(dijkstra(4, graph, 0)));
    }
}
// OUTPUT:
// [0, 3, 1, 4]`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why Dijkstra Fails with Negative Edges - a Concrete Counterexample</h3>
Dijkstra permanently FINALIZES a vertex's distance the moment it's popped from the heap, assuming no future path could possibly improve it. A negative edge violates this assumption - a path through a LATER-explored, seemingly-worse vertex could use a negative edge to become cheaper than an already-finalized "shortest" path.`,
            codeExamples: [
                `package com.javaschoollab;

public class NegativeEdgeCounterexampleDemo {
    public static void main(String[] args) {
        // Graph: source=A. Edges: A->B (weight 5), A->C (weight 2), C->B (weight -4)
        //
        // Dijkstra's greedy order:
        //   1. Pop A (dist 0)
        //   2. Relax B to 5, C to 2. Push both.
        //   3. Pop C (dist 2, smaller than B's 5) - FINALIZE dist[C] = 2
        //   4. Relax B via C: dist[C] + (-4) = 2 - 4 = -2, which is LESS than current dist[B]=5
        //      -> B gets updated to -2
        //   5. Pop B (dist -2 now) - but dist[A] was ALREADY finalized at 0 before this...
        //
        // The REAL issue: if a negative edge existed making A itself improvable via some
        // later-processed vertex, Dijkstra would never revisit A - since it already
        // marked A 'done' the instant it was first popped.
        System.out.println("Dijkstra assumes: once popped, a vertex's distance is FINAL.");
        System.out.println("Negative edges can make a 'later' path cheaper than an ALREADY");
        System.out.println("finalized one - Dijkstra has no mechanism to revisit and fix this.");
        System.out.println("Bellman-Ford relaxes ALL edges repeatedly instead, correctly handling this.");
    }
}
// OUTPUT:
// Dijkstra assumes: once popped, a vertex's distance is FINAL.
// ...`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What's the time complexity of Dijkstra with a binary heap PriorityQueue?</td><td>O((V + E) log V) - each vertex is popped once (O(log V) each), each edge triggers at most one heap insertion (O(log V) each)</td></tr>
<tr class='text-center'><td>What does "if (d > dist[node]) continue" guard against?</td><td>Stale heap entries - since a vertex can be pushed to the heap multiple times as shorter paths are discovered, this skips outdated entries instead of reprocessing a vertex with worse information than what's already recorded</td></tr>
<tr class='text-center'><td>How would you adapt Dijkstra to also reconstruct the actual shortest PATH, not just its length?</td><td>Maintain a "previous vertex" array, updated alongside dist[] whenever a shorter path is found - then trace backward from the destination to the source once the algorithm finishes</td></tr>
</table>`
        }
    ]
};
