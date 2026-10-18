import { Topic } from '../coreJava';

export const graphBfsdfs: Topic = {
    id: 'dsa-graphs-bfs',
    name: 'BFS',
    beginner: [
        {
            content: `<h3>Traversing a Graph</h3>
<ul>
<li><strong>BFS (Breadth-First Search)</strong> - explores level by level using a Queue; finds the SHORTEST path in an unweighted graph.</li>
<li><strong>DFS (Depth-First Search)</strong> - explores as deep as possible along one branch before backtracking, using a Stack (or recursion).</li>
</ul>`,
            codeExamples: [
                `import java.util.*;

// BFS on an adjacency list, starting from 'start'
void bfs(Map<Integer, List<Integer>> graph, int start) {
    Set<Integer> visited = new HashSet<>();
    Queue<Integer> queue = new LinkedList<>();

    queue.add(start);
    visited.add(start);

    while (!queue.isEmpty()) {
        int node = queue.poll();
        System.out.println(node);

        for (int neighbor : graph.getOrDefault(node, List.of())) {
            if (!visited.contains(neighbor)) {
                visited.add(neighbor);
                queue.add(neighbor);
            }
        }
    }
}
// Visits nodes level-by-level outward from the start node`
            ]
        }
    ]
};
