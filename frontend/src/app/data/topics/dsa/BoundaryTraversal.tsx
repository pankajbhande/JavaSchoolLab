import { Topic } from '../../coreJava';

export const boundaryTraversal: Topic = {
    id: 'dsa-trees-boundary-traversal',
    name: 'Boundary Traversal',
    beginner: [
        {
            content: `<h4>Tracing the Tree's Outline</h4>
Boundary traversal prints the tree's OUTER EDGE, counter-clockwise: the left boundary (top to bottom), then all LEAVES (left to right), then the right boundary (bottom to top). Each of the three parts needs its own careful traversal, with rules to avoid duplicating corner nodes.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.ArrayList;
import java.util.List;

public class BoundaryTraversalDemo {

    static class TreeNode {
        int val;
        TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    static boolean isLeaf(TreeNode node) {
        return node.left == null && node.right == null;
    }

    static void addLeftBoundary(TreeNode node, List<Integer> result) {
        TreeNode cur = node.left;
        while (cur != null) {
            if (!isLeaf(cur)) result.add(cur.val);   // leaves handled separately - skip here
            cur = (cur.left != null) ? cur.left : cur.right;
        }
    }

    static void addLeaves(TreeNode node, List<Integer> result) {
        if (node == null) return;
        if (isLeaf(node)) {
            result.add(node.val);
            return;
        }
        addLeaves(node.left, result);
        addLeaves(node.right, result);
    }

    static void addRightBoundary(TreeNode node, List<Integer> result) {
        TreeNode cur = node.right;
        List<Integer> temp = new ArrayList<>();
        while (cur != null) {
            if (!isLeaf(cur)) temp.add(cur.val);
            cur = (cur.right != null) ? cur.right : cur.left;
        }
        for (int i = temp.size() - 1; i >= 0; i--) {   // reverse: bottom to top
            result.add(temp.get(i));
        }
    }

    static List<Integer> boundaryTraversal(TreeNode root) {
        List<Integer> result = new ArrayList<>();
        if (root == null) return result;
        if (!isLeaf(root)) result.add(root.val);

        addLeftBoundary(root, result);
        addLeaves(root, result);
        addRightBoundary(root, result);
        return result;
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(1);
        root.left = new TreeNode(2);
        root.right = new TreeNode(3);
        root.left.left = new TreeNode(4);
        root.left.right = new TreeNode(5);
        root.right.right = new TreeNode(6);

        System.out.println(boundaryTraversal(root));
    }
}
// OUTPUT:
// [1, 2, 4, 5, 6, 3]`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why Corner Nodes Need Careful Handling to Avoid Duplicates</h3>
The three passes (left boundary, leaves, right boundary) can EASILY double-count nodes at the corners: if the root itself is a leaf, or if the leftmost/rightmost boundary node IS also a leaf, naive concatenation would print it twice. The pattern above explicitly EXCLUDES leaves from the boundary-walk functions (<code>if (!isLeaf(cur))</code>) since the separate <code>addLeaves</code> pass already covers every leaf exactly once.`,
            codeExamples: [
                `package com.javaschoollab;

public class BoundaryEdgeCaseDemo {
    public static void main(String[] args) {
        // Edge case: a tree with ONLY a root - it's both the "root" and a "leaf"
        System.out.println("If root.left == null AND root.right == null,");
        System.out.println("the root itself is a leaf - boundary traversal should");
        System.out.println("output just [root.val], not repeat it in multiple passes.");
        System.out.println();
        System.out.println("This is why the main function checks isLeaf(root) before");
        System.out.println("adding it directly, avoiding double-counting with addLeaves().");
    }
}
// OUTPUT:
// If root.left == null AND root.right == null,
// the root itself is a leaf - boundary traversal should
// output just [root.val], not repeat it in multiple passes.
//
// This is why the main function checks isLeaf(root) before
// adding it directly, avoiding double-counting with addLeaves().`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why is the right boundary collected then REVERSED, but the left boundary isn't?</td><td>The overall traversal order is counter-clockwise: left boundary goes top-to-bottom naturally, but the right boundary is walked top-to-bottom for convenience (easier to code) then reversed to appear bottom-to-top in the final output</td></tr>
<tr class='text-center'><td>What's the time complexity of boundary traversal?</td><td>O(n) - each of the three passes visits a subset of nodes, and leaves are visited exactly once total across the whole traversal, giving linear overall work</td></tr>
<tr class='text-center'><td>Why exclude leaves from the left/right boundary walking functions?</td><td>To avoid printing corner leaf nodes twice - once from the boundary walk and again from the dedicated leaves pass; excluding them from the boundary walk and relying solely on the leaves pass for those nodes keeps each node counted exactly once</td></tr>
</table>`
        }
    ]
};
