import { Topic } from '../../coreJava';

export const verticalTraversal: Topic = {
    id: 'dsa-trees-vertical-traversal',
    name: 'Vertical Traversal',
    beginner: [
        {
            content: `<h4>Grouping Nodes by Vertical Column</h4>
Extends the Top/Bottom View's "horizontal distance" idea: instead of keeping only ONE node per column, vertical traversal returns EVERY node in each column, top to bottom. Nodes sharing both the same column AND the same row are typically sorted by VALUE as a tiebreak.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.*;

public class VerticalTraversalDemo {

    static class TreeNode {
        int val;
        TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    // Each entry: [row, column, value] - sorted by column, then row, then value
    static List<List<Integer>> verticalTraversal(TreeNode root) {
        List<int[]> nodes = new ArrayList<>();
        collect(root, 0, 0, nodes);

        nodes.sort((a, b) -> {
            if (a[1] != b[1]) return a[1] - b[1];   // primary: column
            if (a[0] != b[0]) return a[0] - b[0];   // secondary: row
            return a[2] - b[2];                      // tertiary: value
        });

        Map<Integer, List<Integer>> columns = new TreeMap<>();
        for (int[] n : nodes) {
            columns.computeIfAbsent(n[1], k -> new ArrayList<>()).add(n[2]);
        }
        return new ArrayList<>(columns.values());
    }

    static void collect(TreeNode node, int row, int col, List<int[]> nodes) {
        if (node == null) return;
        nodes.add(new int[]{row, col, node.val});
        collect(node.left, row + 1, col - 1, nodes);
        collect(node.right, row + 1, col + 1, nodes);
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(3);
        root.left = new TreeNode(9);
        root.right = new TreeNode(20);
        root.right.left = new TreeNode(15);
        root.right.right = new TreeNode(7);

        System.out.println(verticalTraversal(root));
    }
}
// OUTPUT:
// [[9], [3, 15], [20], [7]]`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why Vertical Traversal Needs a Full Sort, Unlike Top/Bottom View</h3>
Top/Bottom View only ever keep ONE winner per column (first or last by depth), so BFS ordering alone determines correctness. Vertical Traversal keeps EVERY node per column, so ties (same row AND column, from different parents) need an explicit tiebreak - by value, per the standard problem definition - which requires collecting everything first and sorting, rather than resolving winners on the fly during a single pass.`,
            codeExamples: [
                `package com.javaschoollab;

public class VerticalTraversalTieDemo {
    public static void main(String[] args) {
        // A tree where two DIFFERENT nodes land at the same (row, column):
        // root(1) -> left(2) -> right-child(4)   at col=0, row=2
        // root(1) -> right(3) -> left-child(5)   at col=0, row=2 too
        // Without a value tiebreak, their relative order would be ambiguous -
        // the problem's standard definition resolves this by sorting by VALUE.
        System.out.println("When (row, column) ties occur, sort by node VALUE ascending");
        System.out.println("as the deterministic tiebreaker - this is why a full collect-then-sort");
        System.out.println("approach is used instead of a single-pass BFS/DFS resolution.");
    }
}
// OUTPUT:
// When (row, column) ties occur, sort by node VALUE ascending
// as the deterministic tiebreaker - this is why a full collect-then-sort
// approach is used instead of a single-pass BFS/DFS resolution.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What's the time complexity of vertical traversal, and why?</td><td>O(n log n) - dominated by the sort over all n nodes; the collection pass itself is O(n)</td></tr>
<tr class='text-center'><td>How does vertical traversal relate to Top View and Bottom View?</td><td>All three use the same "horizontal distance / column" concept; Top View keeps the first (shallowest) node per column, Bottom View keeps the last (deepest), and Vertical Traversal keeps ALL nodes per column in sorted order</td></tr>
<tr class='text-center'><td>Could you solve this with BFS instead of collecting all nodes and sorting?</td><td>BFS naturally gives correct ROW order for free (shallower rows processed first), but same-row same-column ties still need value-based sorting within that group - a hybrid approach (BFS + per-level sort) is possible but the collect-and-sort approach is simpler to get correct</td></tr>
</table>`
        }
    ]
};
