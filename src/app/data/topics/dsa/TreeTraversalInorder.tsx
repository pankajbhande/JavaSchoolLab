import { Topic } from '../../coreJava';

export const treeTraversalInorder: Topic = {
    id: 'dsa-trees-tree-traversal-inorder',
    name: 'Tree Traversal - Inorder',
    beginner: [
        {
            content: `<h4>Inorder: Left &rarr; Root &rarr; Right</h4>
Recurse left FIRST, then visit the current node, then recurse right. The single most important fact about inorder: on a <b>Binary Search Tree</b>, inorder traversal visits nodes in SORTED ASCENDING order - a direct consequence of the BST property (left &lt; node &lt; right) applied recursively.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.ArrayList;
import java.util.List;

public class InorderTraversalDemo {

    static class TreeNode {
        int val;
        TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    static void inorder(TreeNode node, List<Integer> result) {
        if (node == null) return;
        inorder(node.left, result);
        result.add(node.val);         // visit ROOT between the two subtrees
        inorder(node.right, result);
    }

    public static void main(String[] args) {
        // A valid BST
        TreeNode root = new TreeNode(50);
        root.left = new TreeNode(30);
        root.right = new TreeNode(70);
        root.left.left = new TreeNode(20);
        root.left.right = new TreeNode(40);

        List<Integer> result = new ArrayList<>();
        inorder(root, result);
        System.out.println(result);   // sorted ascending order, because it's a BST
    }
}
// OUTPUT:
// [20, 30, 40, 50, 70]`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Validating a BST Using Inorder</h3>
Since a valid BST's inorder traversal is ALWAYS sorted ascending, the simplest correct way to validate a BST is: run inorder traversal, and check that each value is strictly greater than the previous one. This sidesteps a common bug where people incorrectly check only "node.left.val < node.val < node.right.val" locally, missing violations from grandchildren further down.`,
            codeExamples: [
                `package com.javaschoollab;

public class ValidateBstInorderDemo {

    static class TreeNode {
        int val;
        TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    static Integer previous = null;   // tracks the last visited value during inorder

    static boolean isValidBst(TreeNode node) {
        if (node == null) return true;

        if (!isValidBst(node.left)) return false;

        if (previous != null && node.val <= previous) {
            return false;   // NOT strictly increasing - violates BST property
        }
        previous = node.val;

        return isValidBst(node.right);
    }

    public static void main(String[] args) {
        // WRONG tree: 5's left subtree contains 6, violating BST property
        // even though locally 5's direct children look fine
        TreeNode root = new TreeNode(5);
        root.left = new TreeNode(3);
        root.right = new TreeNode(8);
        root.left.right = new TreeNode(6);   // 6 > 5, but it's in 5's LEFT subtree - invalid!

        System.out.println(isValidBst(root));
    }
}
// OUTPUT:
// false`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why does inorder traversal give sorted output specifically for a BST?</td><td>At each node, the BST property guarantees everything in the left subtree is smaller and everything in the right subtree is larger - visiting left-root-right recursively at every level naturally produces ascending order</td></tr>
<tr class='text-center'><td>Why is checking only immediate children insufficient to validate a BST?</td><td>A node deep in a subtree can violate the property relative to an ANCESTOR several levels up, even while satisfying the local parent-child comparison - only a full range check (or the inorder-sortedness check) catches this</td></tr>
<tr class='text-center'><td>How would you find the Kth smallest element in a BST using inorder?</td><td>Run inorder traversal and stop after visiting the Kth element - since inorder visits in sorted order, the Kth visited value IS the Kth smallest, no separate sort needed</td></tr>
</table>`
        }
    ]
};
