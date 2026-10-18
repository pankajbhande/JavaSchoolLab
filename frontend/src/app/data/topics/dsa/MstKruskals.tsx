import { Topic } from '../../coreJava';

export const mstKruskals: Topic = {
    id: "dsa-graphs-minimum-spanning-tree-kruskal-s",
    name: "Minimum Spanning Tree - Kruskal's",
    beginner: [
        {
            content: `<h4>Building an MST by Sorting Edges Globally</h4>
Unlike Prim's (which grows from one vertex), Kruskal's sorts ALL edges by weight ascending, then greedily adds each edge UNLESS it would create a cycle - checked in O(&alpha;(n)) using Union-Find. The result is always a valid MST once V-1 edges have been added.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.Arrays;

public class KruskalsMstDemo {

    static int[] parent;

    static int find(int x) {
        if (parent[x] != x) parent[x] = find(parent[x]);
        return parent[x];
    }

    static boolean union(int a, int b) {
        int rootA = find(a), rootB = find(b);
        if (rootA == rootB) return false;   // would create a cycle - reject this edge
        parent[rootA] = rootB;
        return true;
    }

    static int kruskalMST(int n, int[][] edges) {   // edges: {u, v, weight}
        Arrays.sort(edges, (a, b) -> a[2] - b[2]);   // sort by weight ASCENDING

        parent = new int[n];
        for (int i = 0; i < n; i++) parent[i] = i;

        int totalWeight = 0, edgesUsed = 0;
        for (int[] edge : edges) {
            if (union(edge[0], edge[1])) {   // only accept if it doesn't create a cycle
                totalWeight += edge[2];
                edgesUsed++;
                if (edgesUsed == n - 1) break;   // MST complete
            }
        }
        return totalWeight;
    }

    public static void main(String[] args) {
        int[][] edges = {
            {0, 1, 2}, {0, 2, 3}, {1, 2, 1}, {1, 3, 4}, {2, 3, 5}
        };
        System.out.println(kruskalMST(4, edges));
    }
}
// OUTPUT:
// 7`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why Rejecting Cycle-Forming Edges Still Produces the GLOBALLY OPTIMAL MST</h3>
This is the "cycle property" of MSTs: for any cycle, the HEAVIEST edge in that cycle can never be part of ANY minimum spanning tree - removing it (keeping the rest) always gives an equal-or-better tree. Kruskal's, by processing edges lightest-first and rejecting anything that would close a cycle, is implicitly always rejecting exactly the WOULD-BE-heaviest edge of whatever cycle it would have formed - which is precisely what the cycle property guarantees is safe to discard.`,
            codeExamples: [
                `package com.javaschoollab;

public class CyclePropertyDemo {
    public static void main(String[] args) {
        System.out.println("Cycle Property of MSTs:");
        System.out.println("For any cycle in the graph, the edge with the MAXIMUM weight");
        System.out.println("in that cycle is NEVER part of any minimum spanning tree.");
        System.out.println();
        System.out.println("Why Kruskal's respects this automatically:");
        System.out.println("Edges are processed lightest-first. By the time a cycle-forming");
        System.out.println("edge is encountered, every LIGHTER edge that could complete the");
        System.out.println("same cycle has ALREADY been added - meaning the rejected edge");
        System.out.println("is guaranteed to be the HEAVIEST possible edge in that cycle,");
        System.out.println("exactly the one the cycle property says is safe to discard.");
    }
}
// OUTPUT:
// Cycle Property of MSTs:
// ...`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What's the time complexity of Kruskal's Algorithm?</td><td>O(E log E) dominated by sorting edges (E log E is equivalent to E log V since E <= V^2), plus O(E * &alpha;(V)) for the Union-Find operations - the sort dominates</td></tr>
<tr class='text-center'><td>Why does Kruskal's need Union-Find specifically, rather than a simpler visited check?</td><td>Unlike Prim's (which grows one connected tree), Kruskal's edges arrive in arbitrary graph order - determining "would this edge connect two ALREADY-connected components" requires efficiently tracking which arbitrary GROUP each vertex currently belongs to, exactly what Union-Find provides</td></tr>
<tr class='text-center'><td>Is the MST unique if all edge weights are distinct?</td><td>Yes - with all distinct weights, both Prim's and Kruskal's are guaranteed to produce the SAME unique MST; with tied weights, multiple different valid MSTs (all with the same total weight) can exist</td></tr>
</table>`
        }
    ]
};
