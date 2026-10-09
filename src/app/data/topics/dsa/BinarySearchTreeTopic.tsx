import { Topic } from '../../coreJava';

export const binarySearchTreeTopic: Topic = {
    id: 'dsa-trees-binary-search-tree-bst',
    name: 'Binary Search Tree - BST',
    beginner: [
        {
            content: `<h4>The BST Ordering Property</h4>
For EVERY node in a Binary Search Tree: everything in its left subtree is SMALLER, everything in its right subtree is LARGER. This ordering is what makes search, insert, and delete all O(h) - O(log n) on a balanced tree, since each comparison eliminates one whole subtree.`,
            codeExamples: [
                `package com.javaschoollab;

public class BstBasicsDemo {

    static class TreeNode {
        int val;
        TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    static TreeNode insert(TreeNode node, int val) {
        if (node == null) return new TreeNode(val);
        if (val < node.val) {
            node.left = insert(node.left, val);
        } else if (val > node.val) {
            node.right = insert(node.right, val);
        }
        return node;
    }

    static boolean search(TreeNode node, int target) {
        if (node == null) return false;
        if (node.val == target) return true;
        return target < node.val ? search(node.left, target) : search(node.right, target);
    }

    public static void main(String[] args) {
        TreeNode root = null;
        for (int v : new int[]{50, 30, 70, 20, 40, 60, 80}) {
            root = insert(root, v);
        }

        System.out.println("Search 40: " + search(root, 40));
        System.out.println("Search 45: " + search(root, 45));
    }
}
// OUTPUT:
// Search 40: true
// Search 45: false`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Deletion - the Trickiest BST Operation</h3>
Deleting a node with ZERO or ONE child is straightforward (splice it out). Deleting a node with TWO children requires finding a replacement that preserves the ordering property - conventionally the INORDER SUCCESSOR (the smallest value in the right subtree), which is guaranteed to be &ge; everything in the left subtree and &le; everything remaining in the right subtree.`,
            codeExamples: [
                `package com.javaschoollab;

public class BstDeleteDemo {

    static class TreeNode {
        int val;
        TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    static TreeNode delete(TreeNode node, int key) {
        if (node == null) return null;

        if (key < node.val) {
            node.left = delete(node.left, key);
        } else if (key > node.val) {
            node.right = delete(node.right, key);
        } else {
            // Found the node to delete
            if (node.left == null) return node.right;    // 0 or 1 child (right)
            if (node.right == null) return node.left;     // 1 child (left)

            // Two children: find the inorder successor (smallest in right subtree)
            TreeNode successor = node.right;
            while (successor.left != null) successor = successor.left;

            node.val = successor.val;                       // copy successor's value up
            node.right = delete(node.right, successor.val);  // remove the successor's original node
        }
        return node;
    }

    static void inorder(TreeNode node, StringBuilder sb) {
        if (node == null) return;
        inorder(node.left, sb);
        sb.append(node.val).append(" ");
        inorder(node.right, sb);
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(50);
        int[] values = {30, 70, 20, 40, 60, 80};
        TreeNode cur = root;
        for (int v : values) {
            TreeNode n = root;
            while (true) {
                if (v < n.val) { if (n.left == null) { n.left = new TreeNode(v); break; } n = n.left; }
                else { if (n.right == null) { n.right = new TreeNode(v); break; } n = n.right; }
            }
        }

        root = delete(root, 30);   // delete a node with two children

        StringBuilder sb = new StringBuilder();
        inorder(root, sb);
        System.out.println(sb.toString().trim());
    }
}
// OUTPUT:
// 20 40 50 60 70 80`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What's the worst-case time complexity of BST operations, and when does it happen?</td><td>O(n) - when the tree degenerates into a linked-list shape (e.g. inserting already-sorted data into a plain BST with no rebalancing), height equals n instead of log n</td></tr>
<tr class='text-center'><td>Why use the inorder SUCCESSOR (not predecessor) conventionally for two-child deletion?</td><td>Either works correctly - successor (smallest in right subtree) or predecessor (largest in left subtree) both preserve the BST property; successor is just the more common convention</td></tr>
<tr class='text-center'><td>How do self-balancing trees (AVL, Red-Black) fix the O(n) worst case?</td><td>They perform ROTATIONS after insert/delete to keep the tree's height bounded at O(log n), guaranteeing O(log n) operations regardless of insertion order</td></tr>
</table>`
        }
    ]
};
