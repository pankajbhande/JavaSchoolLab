import { Topic } from '../../coreJava';

export const iterativeTraversal: Topic = {
    id: 'dsa-trees-iterative-traversal',
    name: 'Iterative Traversal',
    beginner: [
        {
            content: `<h4>Iterative Preorder - an Explicit Stack Replaces the Call Stack</h4>
Any recursive traversal can be rewritten iteratively using an explicit <code>Stack</code>/<code>Deque</code> that manually does what the call stack did implicitly. For preorder, push right BEFORE left, so left gets popped (and processed) FIRST.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.List;

public class IterativePreorderDemo {

    static class TreeNode {
        int val;
        TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    static List<Integer> preorderIterative(TreeNode root) {
        List<Integer> result = new ArrayList<>();
        if (root == null) return result;

        Deque<TreeNode> stack = new ArrayDeque<>();
        stack.push(root);

        while (!stack.isEmpty()) {
            TreeNode node = stack.pop();
            result.add(node.val);

            // Push RIGHT first so LEFT comes off the stack first (LIFO)
            if (node.right != null) stack.push(node.right);
            if (node.left != null) stack.push(node.left);
        }
        return result;
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(1);
        root.left = new TreeNode(2);
        root.right = new TreeNode(3);
        root.left.left = new TreeNode(4);
        root.left.right = new TreeNode(5);

        System.out.println(preorderIterative(root));
    }
}
// OUTPUT:
// [1, 2, 4, 5, 3]`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Iterative Inorder - the Trickiest of the Three</h3>
Inorder is harder to make iterative than preorder because the ROOT must be visited BETWEEN its subtrees, not first. The standard pattern: push all left-children onto the stack until hitting null, then pop-and-visit, then move to that node's right child and repeat.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.List;

public class IterativeInorderDemo {

    static class TreeNode {
        int val;
        TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    static List<Integer> inorderIterative(TreeNode root) {
        List<Integer> result = new ArrayList<>();
        Deque<TreeNode> stack = new ArrayDeque<>();
        TreeNode current = root;

        while (current != null || !stack.isEmpty()) {
            // Go as far left as possible, pushing every node along the way
            while (current != null) {
                stack.push(current);
                current = current.left;
            }
            // Backtrack: this is the next node to VISIT (leftmost unvisited)
            current = stack.pop();
            result.add(current.val);

            // Move to the right subtree and repeat the whole process
            current = current.right;
        }
        return result;
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(50);
        root.left = new TreeNode(30);
        root.right = new TreeNode(70);
        root.left.left = new TreeNode(20);
        root.left.right = new TreeNode(40);

        System.out.println(inorderIterative(root));
    }
}
// OUTPUT:
// [20, 30, 40, 50, 70]`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why push right before left for iterative preorder?</td><td>A stack is LIFO - pushing right first means left ends up on TOP and gets popped (visited) before right, matching preorder's left-before-right requirement</td></tr>
<tr class='text-center'><td>Why is iterative postorder considered the hardest of the three?</td><td>The root must be visited LAST, after BOTH children - this typically needs either two stacks, or one stack with a "last visited node" tracker to distinguish "returning from left" vs "returning from right"</td></tr>
<tr class='text-center'><td>What's the space complexity trade-off between recursive and iterative traversal?</td><td>Both are O(h) worst case - the explicit stack in the iterative version holds exactly what the call stack would have held; iterative avoids JVM stack-depth limits but doesn't change the asymptotic space complexity</td></tr>
</table>`
        }
    ]
};
