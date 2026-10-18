import { Topic } from '../../coreJava';

export const lowestCommonAncestor: Topic = {
    id: 'dsa-trees-lowest-common-ancestor',
    name: 'Lowest Common Ancestor',
    beginner: [
        {
            content: `<h4>What is LCA?</h4>
The Lowest Common Ancestor of two nodes p and q is the DEEPEST node that has BOTH p and q as descendants (a node is considered a descendant of itself). For a general binary tree, find it with a bottom-up recursive search: a node IS the LCA if p and q are found in DIFFERENT subtrees (or the node itself is p or q).`,
            codeExamples: [
                `package com.javaschoollab;

public class LcaBinaryTreeDemo {

    static class TreeNode {
        int val;
        TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    static TreeNode lca(TreeNode node, TreeNode p, TreeNode q) {
        if (node == null || node == p || node == q) {
            return node;   // found one of the targets, or hit the bottom
        }

        TreeNode leftResult = lca(node.left, p, q);
        TreeNode rightResult = lca(node.right, p, q);

        if (leftResult != null && rightResult != null) {
            return node;   // p and q found in DIFFERENT subtrees - this node IS the LCA
        }
        return (leftResult != null) ? leftResult : rightResult;   // bubble up whichever was found
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(3);
        TreeNode five = new TreeNode(5);
        TreeNode one = new TreeNode(1);
        root.left = five;
        root.right = one;
        TreeNode six = new TreeNode(6);
        TreeNode two = new TreeNode(2);
        five.left = six;
        five.right = two;

        TreeNode result = lca(root, six, two);
        System.out.println("LCA: " + result.val);
    }
}
// OUTPUT:
// LCA: 5`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>LCA in a BST - Much Simpler, No Search Needed</h3>
On a BST, the ordering property gives a shortcut: the LCA is the FIRST node encountered while walking down from the root where p and q split - i.e. one is &le; the node and the other is &ge; it (or the node IS one of them). No need to search both subtrees like the general binary tree case.`,
            codeExamples: [
                `package com.javaschoollab;

public class LcaBstDemo {

    static class TreeNode {
        int val;
        TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    static TreeNode lcaBst(TreeNode node, int p, int q) {
        while (node != null) {
            if (p < node.val && q < node.val) {
                node = node.left;    // both targets are smaller - LCA must be in the left subtree
            } else if (p > node.val && q > node.val) {
                node = node.right;   // both targets are bigger - LCA must be in the right subtree
            } else {
                return node;         // split point (or node IS p or q) - this is the LCA
            }
        }
        return null;
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(6);
        root.left = new TreeNode(2);
        root.right = new TreeNode(8);
        root.left.left = new TreeNode(0);
        root.left.right = new TreeNode(4);

        TreeNode result = lcaBst(root, 0, 4);
        System.out.println("LCA: " + result.val);
    }
}
// OUTPUT:
// LCA: 2`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why is BST-LCA O(h) with a simple loop, while general-tree-LCA needs full recursion?</td><td>A BST's ordering property lets you DECIDE which single direction to go at each step (no need to search both subtrees); a general binary tree has no such ordering, so you must search both subtrees at every node to know where p and q actually are</td></tr>
<tr class='text-center'><td>What does it mean for a node to be its own ancestor in the LCA definition?</td><td>If p is an ancestor of q (or vice versa), p itself is the LCA - the base case "node == p or node == q" in the general solution handles this correctly</td></tr>
<tr class='text-center'><td>How would you find LCA if each node had a parent pointer?</td><td>Walk up from p to the root recording the path (or depths), do the same for q, then either use a HashSet of p's ancestors to find the first ancestor of q also in that set, or align both paths by depth and walk up together until they meet</td></tr>
</table>`
        }
    ]
};
