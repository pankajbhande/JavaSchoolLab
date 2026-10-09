import { Topic } from '../../coreJava';

export const treeTraversalPostorder: Topic = {
    id: 'dsa-trees-tree-traversal-postorder',
    name: 'Tree Traversal - Postorder',
    beginner: [
        {
            content: `<h4>Postorder: Left &rarr; Right &rarr; Root</h4>
Recurse left, recurse right, THEN visit the current node LAST. Postorder guarantees every node's CHILDREN are fully processed before the node itself - exactly the order needed for safely DELETING a tree (free children before their parent) or evaluating an expression tree.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.ArrayList;
import java.util.List;

public class PostorderTraversalDemo {

    static class TreeNode {
        int val;
        TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    static void postorder(TreeNode node, List<Integer> result) {
        if (node == null) return;
        postorder(node.left, result);
        postorder(node.right, result);
        result.add(node.val);          // visit ROOT last
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(1);
        root.left = new TreeNode(2);
        root.right = new TreeNode(3);
        root.left.left = new TreeNode(4);
        root.left.right = new TreeNode(5);

        List<Integer> result = new ArrayList<>();
        postorder(root, result);
        System.out.println(result);
    }
}
// OUTPUT:
// [4, 5, 2, 3, 1]`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Evaluating a Postfix Expression Tree</h3>
Since postorder visits both operands (children) before the operator (root), the postorder sequence of an expression tree directly IS its postfix notation - and evaluating that tree bottom-up (compute children's values first, then apply the parent's operator) is a direct postorder traversal with a "combine" step.`,
            codeExamples: [
                `package com.javaschoollab;

public class EvaluateExpressionTreeDemo {

    static class TreeNode {
        String val;   // either a number or an operator: + - * /
        TreeNode left, right;
        TreeNode(String val) { this.val = val; }
    }

    static int evaluate(TreeNode node) {
        if (node.left == null && node.right == null) {
            return Integer.parseInt(node.val);   // leaf = operand
        }

        int leftVal = evaluate(node.left);     // fully resolve left subtree FIRST
        int rightVal = evaluate(node.right);    // fully resolve right subtree FIRST

        switch (node.val) {                     // apply the operator LAST - postorder shape
            case "+": return leftVal + rightVal;
            case "-": return leftVal - rightVal;
            case "*": return leftVal * rightVal;
            case "/": return leftVal / rightVal;
            default: throw new IllegalArgumentException();
        }
    }

    public static void main(String[] args) {
        // Represents (3 + 5) * 2
        TreeNode root = new TreeNode("*");
        root.left = new TreeNode("+");
        root.left.left = new TreeNode("3");
        root.left.right = new TreeNode("5");
        root.right = new TreeNode("2");

        System.out.println(evaluate(root));
    }
}
// OUTPUT:
// 16`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why is postorder the correct order for freeing/deleting a tree's nodes?</td><td>A node's children must be deleted before the node itself is safe to delete (you'd lose the reference to them otherwise) - postorder guarantees children are processed before their parent</td></tr>
<tr class='text-center'><td>Why does postorder match postfix (RPN) notation for expression trees?</td><td>Postfix places the operator AFTER its operands; postorder visits both children (operands) before the root (operator) - the two orderings describe the exact same visitation sequence</td></tr>
<tr class='text-center'><td>How is postorder used in computing the Diameter of a Tree efficiently?</td><td>Each node needs its children's heights already computed to determine the longest path through itself - postorder's "children before parent" order provides exactly that, enabling an O(n) single-pass solution instead of a naive O(n^2)</td></tr>
</table>`
        }
    ]
};
