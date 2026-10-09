import { Topic } from '../../coreJava';

export const directedGraph: Topic = {
    id: 'dsa-graphs-directed-graph',
    name: 'Directed Graph',
    beginner: [
        {
            content: `<h4>Edges That Only Go One Way</h4>
In a directed graph (digraph), an edge from u to v does NOT imply an edge from v to u - "u follows v" on Twitter doesn't mean "v follows u". This asymmetry is why directed graphs support concepts undirected graphs don't: topological ordering (only meaningful with direction), and strongly vs weakly connected components.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.*;

public class DirectedGraphDemo {

    static Map<Integer, List<Integer>> graph = new HashMap<>();

    static void addDirectedEdge(int from, int to) {
        graph.computeIfAbsent(from, k -> new ArrayList<>()).add(to);
        // deliberately NOT adding the reverse edge - direction matters
    }

    public static void main(String[] args) {
        addDirectedEdge(0, 1);   // 0 -> 1, but NOT 1 -> 0
        addDirectedEdge(1, 2);

        System.out.println("Neighbors of 0: " + graph.get(0));
        System.out.println("Neighbors of 1: " + graph.get(1));
        System.out.println("Neighbors of 2: " + graph.getOrDefault(2, List.of()));   // no outgoing edges
    }
}
// OUTPUT:
// Neighbors of 0: [1]
// Neighbors of 1: [2]
// Neighbors of 2: []`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>In-Degree and Out-Degree - the Foundation of Topological Sort</h3>
Each vertex has an IN-DEGREE (edges pointing TO it) and OUT-DEGREE (edges pointing FROM it) - independent counts, unlike undirected graphs where degree is a single number. In-degree specifically is what Kahn's Algorithm for topological sort relies on: a vertex with in-degree 0 has no unprocessed prerequisites, so it's safe to process first.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.*;

public class InOutDegreeDemo {
    public static void main(String[] args) {
        Map<Integer, List<Integer>> graph = new HashMap<>();
        graph.put(0, List.of(1, 2));
        graph.put(1, List.of(2));
        graph.put(2, List.of());

        int[] inDegree = new int[3];
        for (List<Integer> neighbors : graph.values()) {
            for (int v : neighbors) {
                inDegree[v]++;
            }
        }

        for (int v = 0; v < 3; v++) {
            int outDegree = graph.getOrDefault(v, List.of()).size();
            System.out.println("Vertex " + v + ": in-degree=" + inDegree[v] + ", out-degree=" + outDegree);
        }
    }
}
// OUTPUT:
// Vertex 0: in-degree=0, out-degree=2
// Vertex 1: in-degree=1, out-degree=1
// Vertex 2: in-degree=2, out-degree=0`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why is topological sort only defined for DIRECTED acyclic graphs?</td><td>Topological order requires a well-defined "comes before" relationship between vertices, which only makes sense when edges have direction - and it must be a DAG, since a cycle would create a contradictory ordering requirement</td></tr>
<tr class='text-center'><td>What's the difference between strongly and weakly connected in a directed graph?</td><td>Strongly connected: a path exists in BOTH directions between every pair of vertices; weakly connected: a path exists between every pair when edge direction is IGNORED (treating the graph as undirected)</td></tr>
<tr class='text-center'><td>What real-world systems are naturally modeled as directed graphs?</td><td>Task dependency graphs (build systems, course prerequisites), web page links, social media "follows", and version control commit history - all have inherently asymmetric relationships</td></tr>
</table>`
        }
    ]
};
