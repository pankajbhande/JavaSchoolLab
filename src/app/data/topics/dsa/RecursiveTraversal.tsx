import { Topic } from '../../coreJava';

export const recursiveTraversal: Topic = {
    id: 'dsa-trees-recursive-traversal',
    name: 'Recursive Traversal',
    beginner: [
        {
            content: `<h4>Why Recursion is the Default for Tree Traversal</h4>
The call stack IMPLICITLY tracks "where to return to" after finishing a subtree - exactly the bookkeeping an iterative version would otherwise need an explicit stack for. This is why recursive tree code is almost always shorter and more directly mirrors the traversal's definition.`,
            codeExamples: [
                `package com.javaschoollab;

public class RecursiveTraversalDemo {

    static class TreeNode {
        int val;
        TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    // The call stack itself tracks "come back to this node after the left subtree finishes"
    static void preorder(TreeNode node) {
        if (node == null) return;          // base case
        System.out.print(node.val + " ");
        preorder(node.left);                // recursive case: left
        preorder(node.right);               // recursive case: right
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(1);
        root.left = new TreeNode(2);
        root.right = new TreeNode(3);
        root.left.left = new TreeNode(4);

        preorder(root);
    }
}
// OUTPUT:
// 1 2 4 3`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>The Real Cost - Stack Overflow on Deep/Skewed Trees</h3>
Recursive traversal's implicit call stack has a REAL limit - each nested call consumes stack frame memory, and a very deep (or maliciously skewed) tree can exhaust it, throwing <code>StackOverflowError</code>. This is the concrete reason iterative traversal exists: for untrusted or unbounded-depth input, an explicit heap-allocated stack (bounded only by available memory, not the JVM's fixed stack size) is the safer choice.`,
            codeExamples: [
                `package com.javaschoollab;

public class StackOverflowRiskDemo {

    static class TreeNode {
        int val;
        TreeNode left;
        TreeNode(int val) { this.val = val; }
    }

    static int depth(TreeNode node) {
        if (node == null) return 0;
        return 1 + depth(node.left);
    }

    public static void main(String[] args) {
        // Build a deeply skewed "tree" (really a linked list) to illustrate the risk
        TreeNode root = new TreeNode(0);
        TreeNode current = root;
        for (int i = 1; i < 50_000; i++) {
            current.left = new TreeNode(i);
            current = current.left;
        }

        try {
            System.out.println("Depth: " + depth(root));
        } catch (StackOverflowError e) {
            System.out.println("StackOverflowError - the recursive call stack ran out");
        }
    }
}
// OUTPUT (exact behavior depends on JVM stack size, e.g. -Xss):
// StackOverflowError - the recursive call stack ran out`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What determines how deep a recursive traversal can safely go?</td><td>The JVM's thread stack size (configurable via -Xss), divided by the memory each recursive call's stack frame consumes - a balanced tree of millions of nodes is fine (log-depth), but a skewed one of the same size may overflow</td></tr>
<tr class='text-center'><td>Is recursive traversal's O(h) space complexity "free"?</td><td>No - it's real memory consumed by the call stack, distinct from any heap-allocated data structures the algorithm explicitly creates; it's easy to forget when reasoning about total space usage</td></tr>
<tr class='text-center'><td>When would you prefer recursive over iterative traversal despite the stack-depth risk?</td><td>When the tree is guaranteed reasonably balanced (bounding depth to O(log n)), or when code clarity/correctness matters more than defending against pathological input - recursive code is almost always shorter and easier to verify</td></tr>
</table>`
        }
    ]
};
