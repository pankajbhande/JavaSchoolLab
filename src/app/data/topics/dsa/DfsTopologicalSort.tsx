import { Topic } from '../../coreJava';

export const dfsTopologicalSort: Topic = {
    id: 'dsa-graphs-dfs-topological-sort',
    name: 'DFS Topological Sort',
    beginner: [
        {
            content: `<h4>Topological Sort via DFS Finishing Order</h4>
Run DFS from every unvisited vertex; when a vertex FINISHES (all its descendants fully explored), push it onto a stack. Reversing the finish order (via the stack) gives a valid topological order - a vertex finishes AFTER everything reachable from it, so it naturally ends up appearing BEFORE those descendants once reversed.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.*;

public class DfsTopologicalSortDemo {

    static void dfs(Map<Integer, List<Integer>> graph, int node, Set<Integer> visited, Deque<Integer> stack) {
        visited.add(node);
        for (int neighbor : graph.getOrDefault(node, List.of())) {
            if (!visited.contains(neighbor)) {
                dfs(graph, neighbor, visited, stack);
            }
        }
        stack.push(node);   // push AFTER exploring everything reachable from 'node'
    }

    static List<Integer> topologicalSort(int n, Map<Integer, List<Integer>> graph) {
        Set<Integer> visited = new HashSet<>();
        Deque<Integer> stack = new ArrayDeque<>();

        for (int v = 0; v < n; v++) {
            if (!visited.contains(v)) {
                dfs(graph, v, visited, stack);
            }
        }

        return new ArrayList<>(stack);   // popping the stack gives the topological order
    }

    public static void main(String[] args) {
        Map<Integer, List<Integer>> graph = new HashMap<>();
        graph.put(0, List.of(1, 2));
        graph.put(1, List.of(3));
        graph.put(2, List.of(3));

        System.out.println(topologicalSort(4, graph));
    }
}
// OUTPUT:
// [0, 2, 1, 3]`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why "Finish Order Reversed" is Always a Valid Topological Order</h3>
For any edge u &rarr; v, DFS from u will always recurse into v (directly or transitively) BEFORE u itself finishes - v's DFS call completes (finishes) first, gets pushed to the stack first, and therefore ends up DEEPER in the stack. When the stack is later popped (or iterated as a list, as shown), u comes out BEFORE v - exactly satisfying the topological order requirement, for every edge in the graph.`,
            codeExamples: [
                `package com.javaschoollab;

public class WhyFinishOrderWorksDemo {
    public static void main(String[] args) {
        System.out.println("For edge u -> v:");
        System.out.println("DFS(u) calls DFS(v) (directly or via some chain) BEFORE u itself");
        System.out.println("is marked 'finished' and pushed onto the stack.");
        System.out.println();
        System.out.println("So v finishes and gets pushed FIRST; u finishes and gets pushed LATER.");
        System.out.println("Stack order (bottom to top): ..., v, ..., u");
        System.out.println();
        System.out.println("Popping the stack (top first) or iterating the ArrayDeque as built:");
        System.out.println("u comes out BEFORE v - exactly satisfying 'u must appear before v'.");
    }
}
// OUTPUT:
// For edge u -> v:
// ...`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What's the time and space complexity of DFS-based topological sort?</td><td>O(V + E) time (standard DFS traversal), O(V) space for the visited set, recursion stack, and result stack</td></tr>
<tr class='text-center'><td>Does this approach detect cycles on its own?</td><td>Not without extra tracking - a separate inStack set (like the directed cycle detection technique) must be added if cycle detection is also required; plain DFS finish-order alone assumes the graph is already a valid DAG</td></tr>
<tr class='text-center'><td>How does DFS-based topological sort relate to Kosaraju's Algorithm for Strongly Connected Components?</td><td>Kosaraju's first step is EXACTLY this DFS finish-order computation on the original graph - it then reuses that order to drive a second DFS pass on the graph's TRANSPOSE (all edges reversed) to discover SCCs</td></tr>
</table>`
        }
    ]
};
