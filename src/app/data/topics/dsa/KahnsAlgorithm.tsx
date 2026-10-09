import { Topic } from '../../coreJava';

export const kahnsAlgorithm: Topic = {
    id: "dsa-graphs-kahn-s-algorithm",
    name: "Kahn's Algorithm",
    beginner: [
        {
            content: `<h4>BFS-Based Topological Sort Using In-Degrees</h4>
Repeatedly process any vertex with IN-DEGREE 0 (no unprocessed prerequisites) - removing it "frees up" its outgoing edges, decrementing its neighbors' in-degrees. When a neighbor's in-degree hits 0, it becomes eligible too. A queue naturally manages this "process whatever's ready" order.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.*;

public class KahnsAlgorithmDemo {

    static List<Integer> topologicalSort(int n, Map<Integer, List<Integer>> graph) {
        int[] inDegree = new int[n];
        for (List<Integer> neighbors : graph.values()) {
            for (int v : neighbors) inDegree[v]++;
        }

        Queue<Integer> queue = new LinkedList<>();
        for (int v = 0; v < n; v++) {
            if (inDegree[v] == 0) queue.offer(v);   // no prerequisites - ready immediately
        }

        List<Integer> order = new ArrayList<>();
        while (!queue.isEmpty()) {
            int node = queue.poll();
            order.add(node);

            for (int neighbor : graph.getOrDefault(node, List.of())) {
                inDegree[neighbor]--;
                if (inDegree[neighbor] == 0) {
                    queue.offer(neighbor);   // this neighbor just became ready
                }
            }
        }

        return order.size() == n ? order : List.of();   // fewer than n means a cycle exists
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
// [0, 1, 2, 3]`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why "order.size() != n" Reliably Detects a Cycle</h3>
Every vertex STUCK inside a cycle can never reach in-degree 0 - its in-degree only ever decreases when a PREDECESSOR is processed, but within a cycle, every vertex's predecessor is ALSO stuck waiting inside the same cycle. This deadlock means cycle vertices are NEVER added to the queue, so the final output list falls short of n vertices - a clean, direct way to both perform topological sort AND detect cycles in one pass.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.*;

public class KahnsCycleDetectionDemo {

    static boolean hasCycle(int n, Map<Integer, List<Integer>> graph) {
        int[] inDegree = new int[n];
        for (List<Integer> neighbors : graph.values()) {
            for (int v : neighbors) inDegree[v]++;
        }

        Queue<Integer> queue = new LinkedList<>();
        for (int v = 0; v < n; v++) {
            if (inDegree[v] == 0) queue.offer(v);
        }

        int processed = 0;
        while (!queue.isEmpty()) {
            int node = queue.poll();
            processed++;
            for (int neighbor : graph.getOrDefault(node, List.of())) {
                if (--inDegree[neighbor] == 0) queue.offer(neighbor);
            }
        }

        return processed != n;   // some vertices never reached in-degree 0 - a cycle exists
    }

    public static void main(String[] args) {
        Map<Integer, List<Integer>> graph = new HashMap<>();
        graph.put(0, List.of(1));
        graph.put(1, List.of(2));
        graph.put(2, List.of(0));   // cycle: 0 -> 1 -> 2 -> 0

        System.out.println(hasCycle(3, graph));
    }
}
// OUTPUT:
// true`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What's the time and space complexity of Kahn's Algorithm?</td><td>O(V + E) time (every vertex and edge processed once), O(V) space for the in-degree array and queue</td></tr>
<tr class='text-center'><td>How would you find the LEXICOGRAPHICALLY SMALLEST valid topological order?</td><td>Replace the plain Queue with a PriorityQueue (min-heap) - always picking the smallest available in-degree-0 vertex at each step produces the lexicographically smallest valid ordering</td></tr>
<tr class='text-center'><td>Why is Kahn's Algorithm considered more "explicit" about cycle detection than the DFS-based approach?</td><td>The final processed count directly and unambiguously reveals a cycle (processed != n); the DFS-based approach needs a separate inStack tracking mechanism specifically added for cycle detection, since plain DFS traversal alone doesn't naturally surface this</td></tr>
</table>`
        }
    ]
};
