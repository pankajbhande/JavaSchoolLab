import { Topic } from '../../coreJava';

export const graphAdjacencyList: Topic = {
    id: 'dsa-graphs-graph-representation-adjacency-list',
    name: 'Graph Representation - Adjacency List',
    beginner: [
        {
            content: `<h4>Representing a Graph as a List of Neighbors Per Vertex</h4>
Each vertex maps to a LIST of its neighbors - space is O(V + E), proportional to what's actually in the graph, not V&sup2;. This is the default choice for most graph algorithms (BFS, DFS, Dijkstra) since it directly hands you "iterate over this vertex's neighbors" in optimal time.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.*;

public class AdjacencyListDemo {

    static Map<Integer, List<Integer>> graph = new HashMap<>();

    static void addEdge(int u, int v, boolean directed) {
        graph.computeIfAbsent(u, k -> new ArrayList<>()).add(v);
        if (!directed) {
            graph.computeIfAbsent(v, k -> new ArrayList<>()).add(u);
        }
    }

    public static void main(String[] args) {
        addEdge(0, 1, false);
        addEdge(0, 2, false);
        addEdge(1, 3, false);

        System.out.println("Neighbors of 0: " + graph.get(0));
        System.out.println("Neighbors of 1: " + graph.get(1));
    }
}
// OUTPUT:
// Neighbors of 0: [1, 2]
// Neighbors of 1: [0, 3]`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Weighted Adjacency List and Edge-Existence Trade-off</h3>
For weighted graphs, store <code>int[]{neighbor, weight}</code> pairs (or a small class) instead of plain integers. The one thing adjacency LIST is genuinely worse at: checking "does edge (u,v) exist" is O(degree of u) with a plain list - use a <code>Set</code> per vertex instead of a <code>List</code> if that specific query needs to be fast.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.*;

public class WeightedAdjacencyListDemo {

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
            System.out.println("0 -> " + edge[0] + " (weight " + edge[1] + ")");
        }
    }
}
// OUTPUT:
// 0 -> 1 (weight 4)
// 0 -> 2 (weight 1)`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why is adjacency list the default representation for BFS/DFS?</td><td>Both algorithms need to iterate over "all neighbors of the current vertex" repeatedly - adjacency list gives exactly that in O(degree), the minimum possible work, unlike a matrix's O(V) scan per vertex</td></tr>
<tr class='text-center'><td>What's the space complexity, and why is it better than a matrix for sparse graphs?</td><td>O(V + E) - proportional to what actually exists in the graph, versus a matrix's fixed O(V^2) regardless of edge count; for sparse real-world graphs (E much less than V^2), this is a massive savings</td></tr>
<tr class='text-center'><td>How would you make edge-existence checks O(1) with an adjacency list?</td><td>Use a HashSet<Integer> (or Map<Integer, Integer> for weighted) per vertex instead of a List - trades a bit of memory and iteration-order guarantees for O(1) average "does this edge exist" lookups</td></tr>
</table>`
        }
    ]
};
