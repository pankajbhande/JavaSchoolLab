import { Topic } from '../../coreJava';

export const graphAdjacencyMatrix: Topic = {
    id: 'dsa-graphs-graph-representation-adjacency-matrix',
    name: 'Graph Representation - Adjacency Matrix',
    beginner: [
        {
            content: `<h4>Representing a Graph as a 2D Grid</h4>
An adjacency matrix is a <code>V &times; V</code> array where <code>matrix[i][j] = 1</code> (or a weight) means an edge exists from i to j. Checking "does an edge exist" is O(1); listing a vertex's neighbors is O(V) since the whole row must be scanned.`,
            codeExamples: [
                `package com.javaschoollab;

public class AdjacencyMatrixDemo {

    static int[][] matrix;

    static void addEdge(int u, int v, boolean directed) {
        matrix[u][v] = 1;
        if (!directed) matrix[v][u] = 1;   // undirected: mirror the edge
    }

    public static void main(String[] args) {
        int vertices = 4;
        matrix = new int[vertices][vertices];

        addEdge(0, 1, false);
        addEdge(0, 2, false);
        addEdge(1, 3, false);

        System.out.println("Edge 0-1 exists: " + (matrix[0][1] == 1));   // O(1) check
        System.out.println("Neighbors of 0:");
        for (int j = 0; j < vertices; j++) {   // O(V) to list neighbors
            if (matrix[0][j] == 1) System.out.println("  " + j);
        }
    }
}
// OUTPUT:
// Edge 0-1 exists: true
// Neighbors of 0:
//   1
//   2`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>When O(V&sup2;) Space is Actually the Right Trade-off</h3>
An adjacency matrix wastes space on SPARSE graphs (few edges relative to V&sup2; possible ones), but for DENSE graphs (edges approaching V&sup2;), or algorithms that need frequent O(1) "does this edge exist" checks (like Floyd-Warshall, which inherently operates on a full V&times;V distance matrix), the matrix representation is the natural and efficient choice.`,
            codeExamples: [
                `package com.javaschoollab;

public class MatrixVsListTradeoffDemo {
    public static void main(String[] args) {
        System.out.println("Adjacency Matrix:");
        System.out.println("  Space: O(V^2) always, regardless of edge count");
        System.out.println("  Edge existence check: O(1)");
        System.out.println("  List all neighbors of a vertex: O(V)");
        System.out.println("  Best for: DENSE graphs, or algorithms needing O(1) edge lookups (Floyd-Warshall)");
        System.out.println();
        System.out.println("Adjacency List:");
        System.out.println("  Space: O(V + E) - proportional to ACTUAL edges");
        System.out.println("  Edge existence check: O(degree of vertex) unless using a HashSet per vertex");
        System.out.println("  List all neighbors of a vertex: O(degree of vertex) - optimal");
        System.out.println("  Best for: SPARSE graphs (most real-world graphs), BFS/DFS traversal");
    }
}
// OUTPUT:
// Adjacency Matrix:
// ...`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What's the space complexity of an adjacency matrix, and why is it wasteful for sparse graphs?</td><td>O(V^2) always - for a sparse graph with only O(V) edges, most matrix cells are 0, wasting almost all the allocated space</td></tr>
<tr class='text-center'><td>Why is Floyd-Warshall naturally matrix-based rather than list-based?</td><td>It needs O(1) access to the distance between ANY pair of vertices at every step of its triple-nested loop - a matrix provides this directly, while a list would require a lookup (or a separate distance array) for each pair</td></tr>
<tr class='text-center'><td>How do you represent a WEIGHTED graph with an adjacency matrix?</td><td>Store the edge weight directly instead of 1 (matrix[i][j] = weight), and use a sentinel value like infinity (or -1) for "no edge exists" instead of 0, since 0 could be a legitimate weight</td></tr>
</table>`
        }
    ]
};
