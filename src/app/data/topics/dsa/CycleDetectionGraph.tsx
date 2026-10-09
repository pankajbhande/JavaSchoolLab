import { Topic } from '../../coreJava';

export const cycleDetectionGraph: Topic = {
    id: 'dsa-graphs-cycle-detection',
    name: 'Cycle Detection',
    beginner: [
        {
            content: `<h4>Detecting a Cycle in an UNDIRECTED Graph</h4>
DFS with a visited set - but a subtlety: encountering an already-visited neighbor is only a REAL cycle if that neighbor isn't the PARENT you just came from (in an undirected graph, the edge back to your immediate parent is expected, not a cycle).`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.*;

public class UndirectedCycleDetectionDemo {

    static boolean hasCycle(Map<Integer, List<Integer>> graph, int node, int parent, Set<Integer> visited) {
        visited.add(node);

        for (int neighbor : graph.getOrDefault(node, List.of())) {
            if (!visited.contains(neighbor)) {
                if (hasCycle(graph, neighbor, node, visited)) return true;
            } else if (neighbor != parent) {
                return true;   // visited AND not the parent - a real cycle
            }
        }
        return false;
    }

    public static void main(String[] args) {
        Map<Integer, List<Integer>> graph = new HashMap<>();
        graph.put(0, List.of(1, 2));
        graph.put(1, List.of(0, 2));   // 0-1-2-0 forms a cycle
        graph.put(2, List.of(0, 1));

        System.out.println(hasCycle(graph, 0, -1, new HashSet<>()));
    }
}
// OUTPUT:
// true`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Cycle Detection in a DIRECTED Graph - Needs a Different Trick</h3>
The "ignore the parent" trick doesn't work for directed graphs, since edges aren't symmetric. Instead, track nodes CURRENTLY on the active recursion path (<code>inStack</code>) - a cycle exists if DFS reaches a node that's ALREADY on the current path, not just previously visited at some point in the past.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.*;

public class DirectedCycleDetectionDemo {

    static boolean hasCycle(Map<Integer, List<Integer>> graph, int node,
                             Set<Integer> visited, Set<Integer> inStack) {
        visited.add(node);
        inStack.add(node);

        for (int neighbor : graph.getOrDefault(node, List.of())) {
            if (inStack.contains(neighbor)) {
                return true;   // back edge to a node ON THE CURRENT PATH - a real cycle
            }
            if (!visited.contains(neighbor) && hasCycle(graph, neighbor, visited, inStack)) {
                return true;
            }
        }

        inStack.remove(node);   // backtrack: done exploring this node's path
        return false;
    }

    public static void main(String[] args) {
        Map<Integer, List<Integer>> graph = new HashMap<>();
        graph.put(0, List.of(1));
        graph.put(1, List.of(2));
        graph.put(2, List.of(0));   // 0 -> 1 -> 2 -> 0, a directed cycle

        System.out.println(hasCycle(graph, 0, new HashSet<>(), new HashSet<>()));
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
<tr class='text-center'><td>Why does the undirected "check parent" trick fail on directed graphs?</td><td>In a directed graph, reaching a previously-visited node through a DIFFERENT unrelated path (not the current recursion path) is normal and NOT a cycle - the parent-check heuristic can't distinguish "safely revisited via a different branch" from "genuinely revisited via a back edge on the current path"</td></tr>
<tr class='text-center'><td>What does the inStack set represent conceptually?</td><td>Exactly the set of ancestors of the current node in the DFS recursion tree - nodes still "in progress", not yet fully explored and backtracked from</td></tr>
<tr class='text-center'><td>How does cycle detection relate to Topological Sort?</td><td>Topological sort is only defined for DAGs (Directed Acyclic Graphs) - detecting a cycle first (or discovering one DURING the topological sort attempt itself) is how you determine whether a valid topological order even exists</td></tr>
</table>`
        }
    ]
};
