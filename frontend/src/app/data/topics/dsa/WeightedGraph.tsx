import { Topic } from '../../coreJava';

export const weightedGraph: Topic = {
    id: 'dsa-graphs-weighted-graph',
    name: 'Weighted Graph',
    beginner: [
        {
            content: `<h4>Edges With a Cost, Not Just a Connection</h4>
A weighted graph attaches a NUMBER to each edge - distance, cost, time, capacity. This single addition changes which algorithms apply: plain BFS finds shortest paths only in UNWEIGHTED graphs (every edge "costs" 1); weighted graphs need Dijkstra, Bellman-Ford, or Floyd-Warshall instead.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.*;

public class WeightedGraphDemo {

    static Map<Integer, List<int[]>> graph = new HashMap<>();   // {neighbor, weight}

    static void addEdge(int u, int v, int weight) {
        graph.computeIfAbsent(u, k -> new ArrayList<>()).add(new int[]{v, weight});
        graph.computeIfAbsent(v, k -> new ArrayList<>()).add(new int[]{u, weight});
    }

    public static void main(String[] args) {
        addEdge(0, 1, 4);
        addEdge(0, 2, 1);
        addEdge(2, 1, 2);

        for (int[] edge : graph.get(0)) {
            System.out.println("0 -> " + edge[0] + " costs " + edge[1]);
        }
    }
}
// OUTPUT:
// 0 -> 1 costs 4
// 0 -> 2 costs 1`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why BFS Breaks on Weighted Graphs - and What Fixes It</h3>
BFS finds the shortest path by counting EDGES, implicitly assuming every edge costs exactly 1 - correct only for unweighted graphs. On a weighted graph, a path with MORE edges can have a SMALLER total weight than a path with fewer edges - BFS's level-by-level exploration has no way to account for that, which is exactly why Dijkstra replaces the queue with a PRIORITY QUEUE ordered by accumulated distance.`,
            codeExamples: [
                `package com.javaschoollab;

public class BfsFailsOnWeightedDemo {
    public static void main(String[] args) {
        // Path A: 0 -> 1 -> 3, using edges of weight 1 and 1 -> total cost 2, but 2 EDGES
        // Path B: 0 -> 3 directly, using ONE edge of weight 10 -> total cost 10, but 1 EDGE
        //
        // BFS (counting EDGES only) would incorrectly prefer Path B (fewer edges),
        // when Path A is actually CHEAPER in total weighted cost.
        System.out.println("BFS finds the path with the FEWEST EDGES.");
        System.out.println("On a weighted graph, fewest edges != lowest total cost.");
        System.out.println("Dijkstra fixes this by always expanding the vertex with the");
        System.out.println("SMALLEST accumulated distance so far, using a min-heap priority queue");
        System.out.println("instead of a plain FIFO queue.");
    }
}
// OUTPUT:
// BFS finds the path with the FEWEST EDGES.
// ...`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Which shortest-path algorithm is appropriate for a weighted graph with NEGATIVE edges?</td><td>Bellman-Ford - Dijkstra's greedy "always expand the current smallest distance" assumption breaks with negative edges, since a longer initial path could still be improved later by a negative edge Dijkstra already dismissed</td></tr>
<tr class='text-center'><td>What's a "negative cycle", and why is it fundamentally problematic?</td><td>A cycle whose total weight is negative - traversing it repeatedly decreases path cost without bound, making "shortest path" undefined (it approaches negative infinity); Bellman-Ford can DETECT such cycles but can't return a meaningful shortest path through them</td></tr>
<tr class='text-center'><td>How would you represent an UNWEIGHTED graph using weighted-graph code without modification?</td><td>Assign every edge a weight of 1 - Dijkstra on a uniformly-weighted graph degenerates into behaving identically to BFS, confirming BFS is really just a special case of shortest-path search</td></tr>
</table>`
        }
    ]
};
