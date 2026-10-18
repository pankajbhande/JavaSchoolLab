import { Topic } from '../../coreJava';

export const mstPrims: Topic = {
    id: "dsa-graphs-minimum-spanning-tree-prim-s",
    name: "Minimum Spanning Tree - Prim's",
    beginner: [
        {
            content: `<h4>Growing a Minimum Spanning Tree One Vertex at a Time</h4>
A Minimum Spanning Tree connects ALL vertices with the MINIMUM total edge weight, using exactly V-1 edges and no cycles. Prim's grows the MST from a single starting vertex: repeatedly add the CHEAPEST edge that connects the current tree to a NEW vertex outside it - a min-heap tracks candidate edges efficiently.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.*;

public class PrimsMstDemo {

    static int primMST(int n, Map<Integer, List<int[]>> graph) {
        boolean[] inMST = new boolean[n];
        PriorityQueue<int[]> pq = new PriorityQueue<>(Comparator.comparingInt(a -> a[1]));   // {vertex, edgeWeight}
        pq.offer(new int[]{0, 0});   // start from vertex 0, cost 0 to "add" it

        int totalWeight = 0, edgesUsed = 0;

        while (!pq.isEmpty() && edgesUsed < n) {
            int[] current = pq.poll();
            int node = current[0], weight = current[1];
            if (inMST[node]) continue;   // already included - skip

            inMST[node] = true;
            totalWeight += weight;
            edgesUsed++;

            for (int[] edge : graph.getOrDefault(node, List.of())) {
                int neighbor = edge[0], edgeWeight = edge[1];
                if (!inMST[neighbor]) {
                    pq.offer(new int[]{neighbor, edgeWeight});
                }
            }
        }
        return totalWeight;
    }

    public static void main(String[] args) {
        Map<Integer, List<int[]>> graph = new HashMap<>();
        graph.put(0, List.of(new int[]{1, 2}, new int[]{2, 3}));
        graph.put(1, List.of(new int[]{0, 2}, new int[]{2, 1}, new int[]{3, 4}));
        graph.put(2, List.of(new int[]{0, 3}, new int[]{1, 1}, new int[]{3, 5}));
        graph.put(3, List.of(new int[]{1, 4}, new int[]{2, 5}));

        System.out.println(primMST(4, graph));
    }
}
// OUTPUT:
// 7`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why Prim's is Essentially "Dijkstra With a Different Relaxation Rule"</h3>
Both algorithms use a min-heap to greedily expand the frontier - the ONLY structural difference: Dijkstra tracks TOTAL accumulated distance from the source, while Prim's tracks just the SINGLE cheapest EDGE weight connecting to the growing tree (ignoring how far that tree has traveled overall). This subtle change in what's compared is what turns "shortest path" into "minimum spanning tree".`,
            codeExamples: [
                `package com.javaschoollab;

public class PrimVsDijkstraComparisonDemo {
    public static void main(String[] args) {
        System.out.println("Dijkstra's relaxation: ");
        System.out.println("  if (dist[node] + edgeWeight < dist[neighbor]) update");
        System.out.println("  -> compares TOTAL PATH COST from the source");
        System.out.println();
        System.out.println("Prim's relaxation (conceptually):");
        System.out.println("  if (edgeWeight < minEdgeToTree[neighbor]) update");
        System.out.println("  -> compares ONLY the single edge weight connecting to the tree,");
        System.out.println("     NOT any accumulated path cost");
        System.out.println();
        System.out.println("Same greedy min-heap machinery, different quantity being minimized -");
        System.out.println("total path distance for Dijkstra, single connecting edge weight for Prim's.");
    }
}
// OUTPUT:
// Dijkstra's relaxation:
// ...`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What's the time complexity of Prim's with a binary heap?</td><td>O((V + E) log V), identical complexity class to Dijkstra with a binary heap - the same greedy min-heap expansion pattern</td></tr>
<tr class='text-center'><td>Does Prim's work correctly with negative edge weights?</td><td>Yes - unlike Dijkstra, Prim's correctness doesn't rely on "shorter accumulated path is always better" reasoning; it only ever compares single edge weights directly, so negative weights don't break its greedy guarantee</td></tr>
<tr class='text-center'><td>When would you prefer Prim's over Kruskal's for MST?</td><td>Prim's is typically faster on DENSE graphs (adjacency matrix + simple array-based version can hit O(V^2), competitive with or better than Kruskal's sort-heavy approach); Kruskal's tends to be simpler and faster on SPARSE graphs</td></tr>
</table>`
        }
    ]
};
