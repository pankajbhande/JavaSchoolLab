import { Topic } from '../../coreJava';

export const bipartiteGraph: Topic = {
    id: 'dsa-graphs-bipartite-graph',
    name: 'Bipartite Graph',
    beginner: [
        {
            content: `<h4>Can the Graph Be 2-Colored?</h4>
A graph is bipartite if its vertices can be split into two groups such that every edge connects a vertex from ONE group to the OTHER - never within the same group. Checking: BFS/DFS coloring - assign alternating colors as you traverse; if a neighbor is already colored the SAME as the current vertex, the graph is NOT bipartite.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.*;

public class BipartiteCheckDemo {

    static boolean isBipartite(Map<Integer, List<Integer>> graph, int n) {
        int[] color = new int[n];
        Arrays.fill(color, -1);   // -1 = uncolored

        for (int start = 0; start < n; start++) {
            if (color[start] != -1) continue;

            Queue<Integer> queue = new LinkedList<>();
            queue.offer(start);
            color[start] = 0;

            while (!queue.isEmpty()) {
                int node = queue.poll();
                for (int neighbor : graph.getOrDefault(node, List.of())) {
                    if (color[neighbor] == -1) {
                        color[neighbor] = 1 - color[node];   // OPPOSITE color
                        queue.offer(neighbor);
                    } else if (color[neighbor] == color[node]) {
                        return false;   // same color on both ends of an edge - NOT bipartite
                    }
                }
            }
        }
        return true;
    }

    public static void main(String[] args) {
        Map<Integer, List<Integer>> graph = new HashMap<>();
        graph.put(0, List.of(1, 3));
        graph.put(1, List.of(0, 2));
        graph.put(2, List.of(1, 3));
        graph.put(3, List.of(0, 2));

        System.out.println(isBipartite(graph, 4));
    }
}
// OUTPUT:
// true`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why a Graph is Bipartite If and Only If It Has No Odd-Length Cycle</h3>
This is the key theorem behind bipartiteness: traveling around ANY cycle, colors must alternate (0,1,0,1,...) - for the cycle to close consistently (the last vertex's color must differ from the first, since they're connected by an edge), the cycle's LENGTH must be EVEN. An odd-length cycle makes this alternation impossible to close consistently - which is EXACTLY the situation the BFS coloring check detects as a conflict.`,
            codeExamples: [
                `package com.javaschoollab;

public class OddCycleTheoremDemo {
    public static void main(String[] args) {
        System.out.println("A 3-cycle (triangle): vertices A-B-C-A");
        System.out.println("Coloring: A=0, B=1 (opposite A), C=0 (opposite B)");
        System.out.println("But C connects back to A, and BOTH are color 0 -> CONFLICT!");
        System.out.println("A triangle (odd cycle, length 3) can never be 2-colored -> NOT bipartite.");
        System.out.println();
        System.out.println("A 4-cycle: A-B-C-D-A");
        System.out.println("Coloring: A=0, B=1, C=0, D=1");
        System.out.println("D connects back to A: D=1, A=0 -> different colors, NO conflict.");
        System.out.println("An even-length cycle CAN always be 2-colored consistently -> bipartite-compatible.");
    }
}
// OUTPUT:
// A 3-cycle (triangle): vertices A-B-C-A
// ...`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What's the time complexity of the bipartite check?</td><td>O(V + E) - a single BFS/DFS pass over the whole graph, same as standard traversal</td></tr>
<tr class='text-center'><td>Why does the algorithm loop over ALL vertices (for start = 0 to n-1), not just start from vertex 0?</td><td>The graph might be DISCONNECTED - each connected component must be checked independently, since a coloring conflict could only be detected by actually visiting all reachable vertices from each unvisited component's starting point</td></tr>
<tr class='text-center'><td>What real-world problems reduce to bipartite checking?</td><td>Job/worker matching feasibility checks, scheduling conflicts (two groups that can never overlap), and detecting whether a graph coloring with exactly 2 colors is possible for a resource-allocation constraint</td></tr>
</table>`
        }
    ]
};
