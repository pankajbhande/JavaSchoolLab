import { Topic } from '../../coreJava';

export const dfsGraph: Topic = {
    id: 'dsa-graphs-dfs',
    name: 'DFS',
    beginner: [
        {
            content: `<h4>Depth-First Search - Go Deep Before Backtracking</h4>
DFS explores as far as possible down one path before backtracking, using a STACK (or recursion, which uses the call stack implicitly) - the opposite exploration order from BFS's queue-based level-by-level approach. A <code>visited</code> set is essential to avoid infinite loops in graphs with cycles.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.*;

public class DfsRecursiveDemo {

    static void dfs(Map<Integer, List<Integer>> graph, int node, Set<Integer> visited) {
        if (visited.contains(node)) return;

        visited.add(node);
        System.out.print(node + " ");

        for (int neighbor : graph.getOrDefault(node, List.of())) {
            dfs(graph, neighbor, visited);
        }
    }

    public static void main(String[] args) {
        Map<Integer, List<Integer>> graph = new HashMap<>();
        graph.put(1, List.of(2, 3));
        graph.put(2, List.of(4));
        graph.put(3, List.of(4));
        graph.put(4, List.of());

        dfs(graph, 1, new HashSet<>());
    }
}
// OUTPUT:
// 1 2 4 3`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Iterative DFS with an Explicit Stack - and a Subtle Ordering Gotcha</h3>
Converting DFS to iterative form replaces the call stack with an explicit <code>Deque</code>. One common bug: pushing neighbors in NORMAL order makes them get visited in REVERSE order (since a stack pops the LAST pushed first) - if matching recursive DFS's exact visit order matters, neighbors must be pushed in reverse.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.*;

public class DfsIterativeDemo {

    static void dfsIterative(Map<Integer, List<Integer>> graph, int start) {
        Set<Integer> visited = new HashSet<>();
        Deque<Integer> stack = new ArrayDeque<>();
        stack.push(start);

        while (!stack.isEmpty()) {
            int node = stack.pop();
            if (visited.contains(node)) continue;

            visited.add(node);
            System.out.print(node + " ");

            List<Integer> neighbors = graph.getOrDefault(node, List.of());
            // Push in REVERSE so the FIRST neighbor is popped (visited) FIRST -
            // matching the natural left-to-right order recursion would give
            for (int i = neighbors.size() - 1; i >= 0; i--) {
                if (!visited.contains(neighbors.get(i))) {
                    stack.push(neighbors.get(i));
                }
            }
        }
    }

    public static void main(String[] args) {
        Map<Integer, List<Integer>> graph = new HashMap<>();
        graph.put(1, List.of(2, 3));
        graph.put(2, List.of(4));
        graph.put(3, List.of(4));
        graph.put(4, List.of());

        dfsIterative(graph, 1);
    }
}
// OUTPUT:
// 1 2 4 3`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What's the time and space complexity of DFS?</td><td>O(V + E) time (every vertex and edge examined once), O(V) space for the visited set plus O(h) for the recursion/explicit stack, where h is the graph's exploration depth</td></tr>
<tr class='text-center'><td>Why does DFS need a visited set but a tree traversal usually doesn't?</td><td>A tree has no cycles by definition, so a traversal naturally terminates; a general graph CAN have cycles, and without tracking visited nodes, DFS would loop forever revisiting the same cycle</td></tr>
<tr class='text-center'><td>When would you prefer DFS over BFS for graph traversal?</td><td>When exploring ALL paths matters more than shortest path (e.g. finding connected components, detecting cycles, topological sort, or exhaustive search/backtracking problems) - BFS is specifically better when you need the SHORTEST path in an unweighted graph</td></tr>
</table>`
        }
    ]
};
