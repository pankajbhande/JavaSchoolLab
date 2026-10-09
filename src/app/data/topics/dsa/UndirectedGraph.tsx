import { Topic } from '../../coreJava';

export const undirectedGraph: Topic = {
    id: 'dsa-graphs-undirected-graph',
    name: 'Undirected Graph',
    beginner: [
        {
            content: `<h4>Edges That Go Both Ways</h4>
In an undirected graph, an edge between u and v means the relationship is SYMMETRIC - "u is friends with v" implies "v is friends with u". Implementing this just means adding BOTH directions when building an adjacency list, and each vertex has a single DEGREE (not separate in/out counts).`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.*;

public class UndirectedGraphDemo {

    static Map<Integer, List<Integer>> graph = new HashMap<>();

    static void addEdge(int u, int v) {
        graph.computeIfAbsent(u, k -> new ArrayList<>()).add(v);
        graph.computeIfAbsent(v, k -> new ArrayList<>()).add(u);   // BOTH directions
    }

    public static void main(String[] args) {
        addEdge(0, 1);
        addEdge(1, 2);

        System.out.println("Neighbors of 0: " + graph.get(0));
        System.out.println("Neighbors of 1: " + graph.get(1));   // includes BOTH 0 and 2
        System.out.println("Degree of 1: " + graph.get(1).size());
    }
}
// OUTPUT:
// Neighbors of 0: [1]
// Neighbors of 1: [0, 2]
// Degree of 1: 2`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>The Handshaking Lemma - Sum of Degrees is Always Even</h3>
Since every edge contributes exactly 1 to TWO vertices' degrees (one on each end), the sum of ALL vertex degrees in an undirected graph is always exactly <code>2 &times; (number of edges)</code> - and therefore always EVEN. This isn't just a curiosity: it's a useful sanity check (and occasionally a direct proof tool) in graph theory problems.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.*;

public class HandshakingLemmaDemo {
    public static void main(String[] args) {
        Map<Integer, List<Integer>> graph = new HashMap<>();
        graph.put(0, List.of(1, 2));
        graph.put(1, List.of(0, 2, 3));
        graph.put(2, List.of(0, 1));
        graph.put(3, List.of(1));

        int sumOfDegrees = 0;
        for (List<Integer> neighbors : graph.values()) {
            sumOfDegrees += neighbors.size();
        }

        int edgeCount = sumOfDegrees / 2;   // handshaking lemma: sum of degrees = 2 * edges
        System.out.println("Sum of degrees: " + sumOfDegrees);
        System.out.println("Number of edges: " + edgeCount);
    }
}
// OUTPUT:
// Sum of degrees: 8
// Number of edges: 4`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why is the sum of degrees in an undirected graph always even?</td><td>Each edge is counted exactly twice - once from each endpoint's perspective - so the total is always 2 times the edge count, an inherently even number</td></tr>
<tr class='text-center'><td>Which algorithms behave differently on undirected vs directed graphs?</td><td>Cycle detection (undirected needs to track the parent to avoid falsely flagging the edge just traversed as a "back edge"), and connectivity concepts (undirected has one notion of "connected", directed splits into weakly/strongly connected)</td></tr>
<tr class='text-center'><td>Why does Union-Find (DSU) naturally fit undirected graph problems?</td><td>DSU tracks which vertices belong to the same connected GROUP, a concept that's inherently symmetric - it doesn't need to distinguish direction, matching undirected graphs' structure directly</td></tr>
</table>`
        }
    ]
};
