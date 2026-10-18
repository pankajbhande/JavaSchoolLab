import { Topic } from '../../coreJava';

export const topologicalSort: Topic = {
    id: 'dsa-graphs-topological-sort',
    name: 'Topological Sort',
    beginner: [
        {
            content: `<h4>Ordering Tasks So Every Prerequisite Comes First</h4>
A topological order of a DAG lists vertices such that for EVERY directed edge u &rarr; v, u appears BEFORE v. It only exists for Directed Acyclic Graphs - a cycle would create an impossible "must come before itself" requirement. Two standard algorithms: Kahn's (BFS-based, using in-degrees) and DFS-based (using a finishing-order stack) - both covered in their own dedicated topics.`,
            codeExamples: [
                `package com.javaschoollab;

public class TopologicalSortConceptDemo {
    public static void main(String[] args) {
        // Course prerequisites: "101" must be taken before "201", "201" before "301"
        System.out.println("Edges: 101 -> 201, 201 -> 301, 101 -> 301");
        System.out.println();
        System.out.println("Valid topological order: 101, 201, 301");
        System.out.println("(101 appears before both 201 and 301, since edges point FROM 101)");
        System.out.println("(201 appears before 301, since edge points FROM 201 TO 301)");
        System.out.println();
        System.out.println("INVALID order example: 201, 101, 301");
        System.out.println("(violates edge 101 -> 201: 101 must come BEFORE 201, not after)");
    }
}
// OUTPUT:
// Edges: 101 -> 201, 201 -> 301, 101 -> 301
// ...`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why Topological Order is Generally NOT Unique</h3>
Multiple valid topological orders often exist - any two vertices with NO direct or indirect dependency relationship between them can appear in EITHER relative order. This non-uniqueness is exactly why "find the LEXICOGRAPHICALLY SMALLEST topological order" is itself a distinct, harder variant of the problem (solved by always picking the smallest available in-degree-0 vertex in Kahn's Algorithm, using a min-heap instead of a plain queue).`,
            codeExamples: [
                `package com.javaschoollab;

public class NonUniqueOrderDemo {
    public static void main(String[] args) {
        System.out.println("Graph: A -> C, B -> C  (both A and B must come before C, but");
        System.out.println("there's NO edge directly between A and B)");
        System.out.println();
        System.out.println("Both of these are VALID topological orders:");
        System.out.println("  A, B, C");
        System.out.println("  B, A, C");
        System.out.println();
        System.out.println("Neither order is 'more correct' - the problem only constrains");
        System.out.println("relationships that HAVE an edge; unrelated vertices are free to");
        System.out.println("appear in either relative order.");
    }
}
// OUTPUT:
// Graph: A -> C, B -> C  (both A and B must come before C, but
// there's NO edge directly between A and B)
// ...`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why must the graph be a DAG for topological sort to exist?</td><td>A cycle A -> B -> A would require A before B AND B before A simultaneously - a logical contradiction that makes a valid linear ordering impossible</td></tr>
<tr class='text-center'><td>What's the time complexity of topological sort (either algorithm)?</td><td>O(V + E) - both Kahn's and DFS-based approaches visit every vertex and edge exactly once</td></tr>
<tr class='text-center'><td>What real-world systems compute topological orderings?</td><td>Build systems (compiling files in dependency order), spreadsheet formula recalculation order, package manager dependency resolution, and course scheduling systems all rely on topological sort</td></tr>
</table>`
        }
    ]
};
