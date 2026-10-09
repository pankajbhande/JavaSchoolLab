import { Topic } from '../../coreJava';

export const binaryTree: Topic = {
    id: 'dsa-trees-binary-tree',
    name: 'Binary Tree',
    beginner: [
        {
            content: `<h4>What is a Binary Tree?</h4>
A hierarchical structure where each node has AT MOST two children, conventionally called <b>left</b> and <b>right</b>. Unlike a linked list (one "next"), a tree branches - which is what makes recursive algorithms so natural for it: a tree is just "a node plus two smaller trees".

<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:12px 0;">
<svg viewBox="0 0 220 140" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:220px;height:auto;font-family:monospace">
  <circle cx="110" cy="20" r="16" fill="#fff7ed" stroke="#ea580c"/><text x="110" y="24" text-anchor="middle" font-size="12" fill="#9a3412">1</text>
  <circle cx="60" cy="70" r="16" fill="#ecfdf5" stroke="#059669"/><text x="60" y="74" text-anchor="middle" font-size="12" fill="#065f46">2</text>
  <circle cx="160" cy="70" r="16" fill="#ecfdf5" stroke="#059669"/><text x="160" y="74" text-anchor="middle" font-size="12" fill="#065f46">3</text>
  <circle cx="35" cy="120" r="16" fill="#f3f4f6" stroke="#9ca3af"/><text x="35" y="124" text-anchor="middle" font-size="12" fill="#6b7280">4</text>
  <circle cx="85" cy="120" r="16" fill="#f3f4f6" stroke="#9ca3af"/><text x="85" y="124" text-anchor="middle" font-size="12" fill="#6b7280">5</text>
  <line x1="98" y1="32" x2="72" y2="58" stroke="#6b7280"/>
  <line x1="122" y1="32" x2="148" y2="58" stroke="#6b7280"/>
  <line x1="52" y1="84" x2="41" y2="106" stroke="#6b7280"/>
  <line x1="68" y1="84" x2="79" y2="106" stroke="#6b7280"/>
</svg>
</div>`,
            codeExamples: [
                `package com.javaschoollab;

public class BinaryTreeDemo {

    static class TreeNode {
        int val;
        TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(1);
        root.left = new TreeNode(2);
        root.right = new TreeNode(3);
        root.left.left = new TreeNode(4);
        root.left.right = new TreeNode(5);

        // Simple recursive inorder print: left, root, right
        printInorder(root);
    }

    static void printInorder(TreeNode node) {
        if (node == null) return;
        printInorder(node.left);
        System.out.print(node.val + " ");
        printInorder(node.right);
    }
}
// OUTPUT:
// 4 2 5 1 3`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why Recursion is the Natural Fit for Tree Problems</h3>
A binary tree is a RECURSIVE data structure by definition: <code>root + leftSubtree + rightSubtree</code>, where each subtree is itself a smaller binary tree. Almost every tree algorithm follows the same shape: handle the base case (null node), then combine the results of recursing into left and right - this is why counting nodes, computing height, and summing values all look structurally identical.`,
            codeExamples: [
                `package com.javaschoollab;

public class TreeRecursivePatternsDemo {

    static class TreeNode {
        int val;
        TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    // Count total nodes - base case + combine left and right results
    static int countNodes(TreeNode node) {
        if (node == null) return 0;
        return 1 + countNodes(node.left) + countNodes(node.right);
    }

    // Sum all values - same shape, different combine operation
    static int sumValues(TreeNode node) {
        if (node == null) return 0;
        return node.val + sumValues(node.left) + sumValues(node.right);
    }

    // Height of the tree - same shape again, combine via max instead of sum
    static int height(TreeNode node) {
        if (node == null) return 0;
        return 1 + Math.max(height(node.left), height(node.right));
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(1);
        root.left = new TreeNode(2);
        root.right = new TreeNode(3);
        root.left.left = new TreeNode(4);

        System.out.println("Nodes : " + countNodes(root));
        System.out.println("Sum   : " + sumValues(root));
        System.out.println("Height: " + height(root));
    }
}
// OUTPUT:
// Nodes : 4
// Sum   : 10
// Height: 3`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What's the time complexity of most basic recursive tree operations?</td><td>O(n) - every node is visited exactly once, since each recursive call handles one node and delegates the rest to its children's calls</td></tr>
<tr class='text-center'><td>What's the space complexity of recursive tree traversal?</td><td>O(h) where h is the tree's height, for the call stack - O(log n) for a balanced tree, but O(n) worst case for a completely skewed (linked-list-shaped) tree</td></tr>
<tr class='text-center'><td>What's the difference between a binary tree and a Binary Search Tree?</td><td>A binary tree has no ordering constraint; a BST additionally requires every node's left subtree to hold smaller values and right subtree to hold larger values, which is what enables O(log n) search on a balanced BST</td></tr>
</table>`
        }
    ]
};
