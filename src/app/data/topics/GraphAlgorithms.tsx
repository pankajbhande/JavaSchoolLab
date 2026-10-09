import { Topic } from '../coreJava';

export const graphAlgorithms: Topic = {
    id: 'graph-algorithms',
    name: 'Graph Algorithms',
    beginner: [
        {
            content: `A graph is a collection of <strong>nodes (vertices)</strong> connected by <strong>edges</strong>. Graphs
model networks: social connections, road maps, web pages, and more. <br><br>
The most common way to represent a graph in code is an <strong>adjacency list</strong> - for each node,
keep a list of the nodes it directly connects to. <br><br>
The two fundamental ways to explore (traverse) a graph are: <br>
• <strong>BFS (Breadth-First Search)</strong> - explore level by level, using a Queue. <br>
• <strong>DFS (Depth-First Search)</strong> - explore as deep as possible before backtracking, using a
Stack (or recursion).`
        },
        {
            content: `<h3>1. Representing a Graph With an Adjacency List</h3>`,
            codeExamples: [`import java.util.*;

public class GraphRepresentation {

    public static void main(String[] args) {
        Map<Integer, List<Integer>> graph = new HashMap<>();

        graph.put(0, Arrays.asList(1, 2));
        graph.put(1, Arrays.asList(0, 3));
        graph.put(2, Arrays.asList(0, 3));
        graph.put(3, Arrays.asList(1, 2));

        for (int node : graph.keySet()) {
            System.out.println(node + " -> " + graph.get(node));
        }
    }
}
// OUTPUT:
// 0 -> [1, 2]
// 1 -> [0, 3]
// 2 -> [0, 3]
// 3 -> [1, 2]`]
        },
        {
            content: `<h3>2. Breadth-First Search (BFS)</h3>
BFS starts at a node, visits all its direct neighbors first, then their neighbors, and so on - using a
Queue to track what to visit next.`,
            codeExamples: [`import java.util.*;

public class BfsDemo {

    public static void main(String[] args) {
        Map<Integer, List<Integer>> graph = new HashMap<>();
        graph.put(0, Arrays.asList(1, 2));
        graph.put(1, Arrays.asList(0, 3, 4));
        graph.put(2, Arrays.asList(0, 4));
        graph.put(3, Arrays.asList(1));
        graph.put(4, Arrays.asList(1, 2));

        Queue<Integer> queue = new LinkedList<>();
        Set<Integer> visited = new HashSet<>();

        queue.add(0);
        visited.add(0);

        StringBuilder order = new StringBuilder();
        while (!queue.isEmpty()) {
            int node = queue.poll();
            order.append(node).append(" ");

            for (int neighbor : graph.get(node)) {
                if (!visited.contains(neighbor)) {
                    visited.add(neighbor);
                    queue.add(neighbor);
                }
            }
        }
        System.out.println("BFS order: " + order.toString().trim());
    }
}
// OUTPUT:
// BFS order: 0 1 2 3 4`]
        },
        {
            content: `<h3>3. Depth-First Search (DFS)</h3>
DFS goes as deep as possible down one path before backtracking - naturally expressed with recursion.`,
            codeExamples: [`import java.util.*;

public class DfsDemo {

    static void dfs(int node, Map<Integer, List<Integer>> graph, Set<Integer> visited, StringBuilder order) {
        visited.add(node);
        order.append(node).append(" ");

        for (int neighbor : graph.get(node)) {
            if (!visited.contains(neighbor)) {
                dfs(neighbor, graph, visited, order);
            }
        }
    }

    public static void main(String[] args) {
        Map<Integer, List<Integer>> graph = new HashMap<>();
        graph.put(0, Arrays.asList(1, 2));
        graph.put(1, Arrays.asList(0, 3, 4));
        graph.put(2, Arrays.asList(0, 4));
        graph.put(3, Arrays.asList(1));
        graph.put(4, Arrays.asList(1, 2));

        StringBuilder order = new StringBuilder();
        dfs(0, graph, new HashSet<>(), order);

        System.out.println("DFS order: " + order.toString().trim());
    }
}
// OUTPUT:
// DFS order: 0 1 3 4 2`]
        }
    ],

    expert: [
        {
            content: `<h3>Iterative DFS (Using an Explicit Stack)</h3>
DFS is usually written recursively, but it can also be done iteratively with your own Stack, which avoids
recursion-depth limits on very deep/large graphs.`,
            codeExamples: [`import java.util.*;

public class IterativeDfsDemo {

    public static void main(String[] args) {
        Map<Integer, List<Integer>> graph = new HashMap<>();
        graph.put(0, Arrays.asList(1, 2));
        graph.put(1, Arrays.asList(0, 3, 4));
        graph.put(2, Arrays.asList(0, 4));
        graph.put(3, Arrays.asList(1));
        graph.put(4, Arrays.asList(1, 2));

        Deque<Integer> stack = new ArrayDeque<>();
        Set<Integer> visited = new HashSet<>();
        StringBuilder order = new StringBuilder();

        stack.push(0);
        while (!stack.isEmpty()) {
            int node = stack.pop();
            if (visited.contains(node)) continue;

            visited.add(node);
            order.append(node).append(" ");

            List<Integer> neighbors = graph.get(node);
            for (int i = neighbors.size() - 1; i >= 0; i--) { // reverse to match recursive order
                if (!visited.contains(neighbors.get(i))) {
                    stack.push(neighbors.get(i));
                }
            }
        }
        System.out.println("Iterative DFS order: " + order.toString().trim());
    }
}
// OUTPUT:
// Iterative DFS order: 0 1 3 4 2`]
        },
        {
            content: `<h3>BFS for Shortest Path (Unweighted Graph)</h3>
Because BFS explores level by level, the first time it reaches a node is guaranteed to be via the
shortest path (fewest edges) in an unweighted graph.`,
            codeExamples: [`import java.util.*;

public class BfsShortestPath {

    public static void main(String[] args) {
        Map<Integer, List<Integer>> graph = new HashMap<>();
        graph.put(0, Arrays.asList(1, 2));
        graph.put(1, Arrays.asList(0, 3));
        graph.put(2, Arrays.asList(0, 3));
        graph.put(3, Arrays.asList(1, 2, 4));
        graph.put(4, Arrays.asList(3));

        int start = 0, target = 4;
        Map<Integer, Integer> distance = new HashMap<>();
        Queue<Integer> queue = new LinkedList<>();

        distance.put(start, 0);
        queue.add(start);

        while (!queue.isEmpty()) {
            int node = queue.poll();
            for (int neighbor : graph.get(node)) {
                if (!distance.containsKey(neighbor)) {
                    distance.put(neighbor, distance.get(node) + 1);
                    queue.add(neighbor);
                }
            }
        }
        System.out.println("Shortest distance from " + start + " to " + target + " = " + distance.get(target));
    }
}
// OUTPUT:
// Shortest distance from 0 to 4 = 3`]
        },
        {
            content: `<h3>Visualizing BFS vs DFS Traversal Order</h3>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Graph:
        0
       / \\
      1   2
     / \\   \\
    3   4---+

BFS from 0 (level by level, Queue):
  Level 0: 0
  Level 1: 1, 2
  Level 2: 3, 4
  Order: 0 1 2 3 4

DFS from 0 (go deep first, Stack/recursion):
  0 -> 1 -> 3 (dead end, backtrack)
       1 -> 4 -> 2 (already reachable, backtrack)
  Order: 0 1 3 4 2</pre>`
        },
        {
            content: `<h3>BFS vs DFS Comparison</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>BFS</th><th>DFS</th></tr>
<tr class='text-center'><td>Data structure</td><td>Queue</td><td>Stack (or recursion)</td></tr>
<tr class='text-center'><td>Time Complexity</td><td>O(V + E)</td><td>O(V + E)</td></tr>
<tr class='text-center'><td>Space Complexity</td><td>O(V)</td><td>O(V)</td></tr>
<tr class='text-center'><td>Shortest path (unweighted)?</td><td>Yes</td><td>No</td></tr>
<tr class='text-center'><td>Good for</td><td>Shortest path, level-order problems</td><td>Cycle detection, topological sort, path existence, maze solving</td></tr>
</table>
V = number of vertices, E = number of edges.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What data structure does BFS use, and why?</td><td>A Queue (FIFO) - ensures nodes are visited in the order they were discovered, i.e. level by level</td></tr>
<tr><td>What data structure does DFS use, and why?</td><td>A Stack (LIFO) or recursion - naturally explores as deep as possible before backtracking</td></tr>
<tr><td>What is the time complexity of both BFS and DFS?</td><td>O(V + E), visiting every vertex and edge once</td></tr>
<tr><td>Why does BFS find the shortest path in an unweighted graph?</td><td>It explores nodes strictly in increasing order of distance from the source, so the first visit is always via the shortest path</td></tr>
<tr><td>What is an adjacency list vs adjacency matrix?</td><td>Adjacency list stores neighbors per node (space-efficient for sparse graphs); adjacency matrix stores an NxN grid of connections (O(1) edge lookup, more memory)</td></tr>
<tr><td>How do you detect a cycle in an undirected graph?</td><td>DFS, tracking the parent node - if you reach an already-visited node that isn't the parent, there's a cycle</td></tr>
<tr><td>What algorithm would you use for weighted shortest path?</td><td>Dijkstra's algorithm (non-negative weights) or Bellman-Ford (handles negative weights)</td></tr>
<tr><td>What is topological sort and which traversal underlies it?</td><td>A linear ordering of nodes in a DAG such that every edge goes from earlier to later in the order - typically built using DFS with a finish-time stack</td></tr>
</table>`
        }
    ]
};
