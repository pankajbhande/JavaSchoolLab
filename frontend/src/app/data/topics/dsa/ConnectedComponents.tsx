import { Topic } from '../../coreJava';

export const connectedComponents: Topic = {
    id: 'dsa-graphs-connected-components',
    name: 'Connected Components',
    beginner: [
        {
            content: `<h4>Finding Separate "Islands" in a Graph</h4>
A connected component is a maximal set of vertices all reachable from each other. Finding all components: run DFS (or BFS) from any UNVISITED vertex, marking everything it reaches as one component, and repeat from the next unvisited vertex until all vertices are covered.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.*;

public class ConnectedComponentsDemo {

    static void dfs(Map<Integer, List<Integer>> graph, int node, Set<Integer> visited) {
        if (visited.contains(node)) return;
        visited.add(node);
        for (int neighbor : graph.getOrDefault(node, List.of())) {
            dfs(graph, neighbor, visited);
        }
    }

    static int countComponents(int n, Map<Integer, List<Integer>> graph) {
        Set<Integer> visited = new HashSet<>();
        int components = 0;

        for (int v = 0; v < n; v++) {
            if (!visited.contains(v)) {
                dfs(graph, v, visited);   // explores one WHOLE component
                components++;
            }
        }
        return components;
    }

    public static void main(String[] args) {
        Map<Integer, List<Integer>> graph = new HashMap<>();
        graph.put(0, List.of(1));
        graph.put(1, List.of(0));
        graph.put(3, List.of(4));
        graph.put(4, List.of(3));
        // vertex 2 has no edges - its own component

        System.out.println(countComponents(5, graph));
    }
}
// OUTPUT:
// 3`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Union-Find as an Alternative - Especially for Dynamic/Streaming Edges</h3>
DFS/BFS is ideal when the WHOLE graph is known upfront. When edges arrive ONE AT A TIME (a stream) and you need "how many components right now" after each addition, Union-Find is far more efficient - each new edge is a single near-O(1) union operation, versus re-running a full DFS/BFS scan.`,
            codeExamples: [
                `package com.javaschoollab;

public class ComponentsWithDsuDemo {

    static int[] parent;
    static int components;

    static int find(int x) {
        if (parent[x] != x) parent[x] = find(parent[x]);   // path compression
        return parent[x];
    }

    static void union(int a, int b) {
        int rootA = find(a), rootB = find(b);
        if (rootA != rootB) {
            parent[rootA] = rootB;
            components--;   // merging two components reduces the count by 1
        }
    }

    public static void main(String[] args) {
        int n = 5;
        parent = new int[n];
        for (int i = 0; i < n; i++) parent[i] = i;
        components = n;   // initially, every vertex is its own component

        int[][] edges = {{0, 1}, {3, 4}};
        for (int[] edge : edges) {
            union(edge[0], edge[1]);
            System.out.println("After adding edge (" + edge[0] + "," + edge[1]
                + "), components = " + components);
        }
    }
}
// OUTPUT:
// After adding edge (0,1), components = 4
// After adding edge (3,4), components = 3`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What's the time complexity of finding connected components via DFS/BFS?</td><td>O(V + E) - the entire graph is visited exactly once, regardless of how many separate components exist</td></tr>
<tr class='text-center'><td>Why is Union-Find better than repeated DFS for a STREAM of incoming edges?</td><td>Each new edge only requires one near-O(1) (amortized, with path compression + union by rank) union operation to update the component count, versus DFS which would need a full O(V+E) rescan of the ENTIRE graph after every single new edge</td></tr>
<tr class='text-center'><td>How does "connected components" generalize to "connected components in an IMAGE" (flood fill)?</td><td>The exact same idea applied to a grid instead of an explicit graph - each pixel is a vertex, adjacency is defined by neighboring pixels sharing a property (e.g. same color), and DFS/BFS/Union-Find all work identically</td></tr>
</table>`
        }
    ]
};
