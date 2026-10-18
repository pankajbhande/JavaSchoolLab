import { Topic } from '../../coreJava';

export const treeTraversalPreorder: Topic = {
    id: 'dsa-trees-tree-traversal-preorder',
    name: 'Tree Traversal - Preorder',
    beginner: [
        {
            content: `<h4>Preorder: Root &rarr; Left &rarr; Right</h4>
Visit the current node FIRST, then recurse left, then recurse right. Preorder naturally produces a sequence where a parent always appears before its children - useful for COPYING a tree (create the root first, then attach copied children) or for serializing a tree in a way that's easy to reconstruct.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.ArrayList;
import java.util.List;

public class PreorderTraversalDemo {

    static class TreeNode {
        int val;
        TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    static void preorder(TreeNode node, List<Integer> result) {
        if (node == null) return;
        result.add(node.val);       // visit ROOT first
        preorder(node.left, result);
        preorder(node.right, result);
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(1);
        root.left = new TreeNode(2);
        root.right = new TreeNode(3);
        root.left.left = new TreeNode(4);
        root.left.right = new TreeNode(5);

        List<Integer> result = new ArrayList<>();
        preorder(root, result);
        System.out.println(result);
    }
}
// OUTPUT:
// [1, 2, 4, 5, 3]`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Cloning a Tree Using Preorder</h3>
Because preorder visits a parent before either child, it's the natural order for BUILDING a new tree top-down: create the copy of the current node first, then recursively attach copied left and right subtrees to it.`,
            codeExamples: [
                `package com.javaschoollab;

public class CloneTreeDemo {

    static class TreeNode {
        int val;
        TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    static TreeNode clone(TreeNode node) {
        if (node == null) return null;
        TreeNode copy = new TreeNode(node.val);   // ROOT created first (preorder shape)
        copy.left = clone(node.left);
        copy.right = clone(node.right);
        return copy;
    }

    static void preorderPrint(TreeNode node, StringBuilder sb) {
        if (node == null) return;
        sb.append(node.val).append(" ");
        preorderPrint(node.left, sb);
        preorderPrint(node.right, sb);
    }

    public static void main(String[] args) {
        TreeNode original = new TreeNode(1);
        original.left = new TreeNode(2);
        original.right = new TreeNode(3);

        TreeNode copy = clone(original);
        copy.left.val = 99;   // mutate the COPY - original must stay unaffected

        StringBuilder originalStr = new StringBuilder();
        StringBuilder copyStr = new StringBuilder();
        preorderPrint(original, originalStr);
        preorderPrint(copy, copyStr);

        System.out.println("Original: " + originalStr.toString().trim());
        System.out.println("Copy    : " + copyStr.toString().trim());
    }
}
// OUTPUT:
// Original: 1 2 3
// Copy    : 1 99 3`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why is preorder the natural choice for serializing a tree for later reconstruction?</td><td>Since a parent always appears before its children in preorder output, a reader can reconstruct the tree top-down in a single left-to-right pass, without needing to look ahead</td></tr>
<tr class='text-center'><td>What's the time and space complexity of recursive preorder traversal?</td><td>O(n) time (every node visited once), O(h) space for the call stack, where h is tree height</td></tr>
<tr class='text-center'><td>How would preorder traversal help evaluate a PREFIX (Polish notation) expression tree?</td><td>Since preorder visits the operator (root) before its operands (children), the preorder sequence of an expression tree directly IS the prefix notation of that expression</td></tr>
</table>`
        }
    ]
};
