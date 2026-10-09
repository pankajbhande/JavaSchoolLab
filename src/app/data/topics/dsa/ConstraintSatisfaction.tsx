import { Topic } from '../../coreJava';

export const constraintSatisfaction: Topic = {
    id: 'dsa-recursion-backtracking-constraint-satisfaction',
    name: 'Constraint Satisfaction',
    beginner: [
        {
            content: `<h4>What is a Constraint Satisfaction Problem (CSP)?</h4>
A CSP asks: assign a value to each of several VARIABLES, from their respective DOMAINS, such that every CONSTRAINT between variables is satisfied. Sudoku, N-Queens, and graph coloring are all CSPs - backtracking is the general-purpose algorithm for solving them: assign a value, check constraints, recurse; undo and try another value if stuck.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.*;

public class GraphColoringDemo {

    // Assigns one of 'numColors' colors to each vertex so no edge connects
    // two same-colored vertices - a classic CSP
    static boolean solve(Map<Integer, List<Integer>> graph, int[] colors, int vertex, int numVertices, int numColors) {
        if (vertex == numVertices) return true;   // all vertices colored successfully

        for (int color = 1; color <= numColors; color++) {
            if (isValidColor(graph, colors, vertex, color)) {
                colors[vertex] = color;

                if (solve(graph, colors, vertex + 1, numVertices, numColors)) {
                    return true;
                }
                colors[vertex] = 0;   // backtrack
            }
        }
        return false;
    }

    static boolean isValidColor(Map<Integer, List<Integer>> graph, int[] colors, int vertex, int color) {
        for (int neighbor : graph.getOrDefault(vertex, List.of())) {
            if (colors[neighbor] == color) return false;   // constraint violated
        }
        return true;
    }

    public static void main(String[] args) {
        Map<Integer, List<Integer>> graph = new HashMap<>();
        graph.put(0, List.of(1, 2));
        graph.put(1, List.of(0, 2));
        graph.put(2, List.of(0, 1, 3));
        graph.put(3, List.of(2));

        int[] colors = new int[4];
        boolean success = solve(graph, colors, 0, 4, 3);
        System.out.println("Solvable with 3 colors: " + success);
        System.out.println("Colors: " + java.util.Arrays.toString(colors));
    }
}
// OUTPUT:
// Solvable with 3 colors: true
// Colors: [1, 2, 3, 1]`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Speeding Up CSPs - Variable and Value Ordering Heuristics</h3>
Real CSP solvers rarely process variables in a fixed order - two heuristics dramatically improve performance:
<ul>
<li><b>Minimum Remaining Values (MRV):</b> assign the variable with the FEWEST legal values remaining first - it's the most constrained, and if it's going to fail, better to find out early.</li>
<li><b>Least Constraining Value:</b> when choosing a value for a variable, prefer the one that rules out the FEWEST options for other variables - keeps the search space open longer.</li>
</ul>`,
            codeExamples: [
                `package com.javaschoollab;

public class MrvHeuristicDemo {
    public static void main(String[] args) {
        System.out.println("Minimum Remaining Values (MRV) heuristic:");
        System.out.println("Instead of always processing variables in a fixed order (0, 1, 2, ...),");
        System.out.println("pick the UNASSIGNED variable with the fewest legal values left.");
        System.out.println();
        System.out.println("Why this helps: a highly constrained variable is likely to FAIL soon");
        System.out.println("if the current partial assignment is doomed - discovering that failure");
        System.out.println("EARLY (via MRV) prunes the search tree far more aggressively than");
        System.out.println("discovering it late, after committing to many other assignments first.");
    }
}
// OUTPUT:
// Minimum Remaining Values (MRV) heuristic:
// Instead of always processing variables in a fixed order (0, 1, 2, ...),
// pick the UNASSIGNED variable with the fewest legal values left.
//
// Why this helps: a highly constrained variable is likely to FAIL soon
// if the current partial assignment is doomed - discovering that failure
// EARLY (via MRV) prunes the search tree far more aggressively than
// discovering it late, after committing to many other assignments first.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>How does Sudoku fit the CSP framework specifically?</td><td>Variables = the 81 cells, domains = digits 1-9 for each, constraints = "no repeated digit in any row, column, or 3x3 box" - exactly the standard CSP structure</td></tr>
<tr class='text-center'><td>What's the difference between CSP backtracking and general backtracking?</td><td>CSP backtracking specifically frames the problem as variables/domains/constraints and often applies domain-specific heuristics (MRV, constraint propagation like arc-consistency); general backtracking is the broader technique CSP-solving is built on top of</td></tr>
<tr class='text-center'><td>What is "constraint propagation" and how does it differ from backtracking itself?</td><td>Propagation actively REDUCES other variables' domains based on a new assignment (e.g. removing a color from neighbors' options immediately after coloring a vertex), catching failures even before backtracking would discover them through further recursive attempts</td></tr>
</table>`
        }
    ]
};
