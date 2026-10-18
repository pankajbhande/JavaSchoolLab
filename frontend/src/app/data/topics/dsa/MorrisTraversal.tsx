import { Topic } from '../../coreJava';

export const morrisTraversal: Topic = {
    id: 'dsa-trees-morris-traversal',
    name: 'Morris Traversal',
    beginner: [
        {
            content: `<h4>Inorder Traversal with O(1) Space - No Stack, No Recursion</h4>
Every other traversal method needs O(h) extra space (call stack or explicit stack). Morris Traversal achieves O(1) EXTRA space by temporarily rewiring the tree itself: for each node with a left subtree, find its INORDER PREDECESSOR (the rightmost node in the left subtree) and make that predecessor's right pointer temporarily point back to the current node - a "thread" that lets traversal return upward without a stack.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.ArrayList;
import java.util.List;

public class MorrisTraversalDemo {

    static class TreeNode {
        int val;
        TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    static List<Integer> morrisInorder(TreeNode root) {
        List<Integer> result = new ArrayList<>();
        TreeNode current = root;

        while (current != null) {
            if (current.left == null) {
                result.add(current.val);   // no left subtree - visit and move right
                current = current.right;
            } else {
                // Find the inorder predecessor: rightmost node in the left subtree
                TreeNode predecessor = current.left;
                while (predecessor.right != null && predecessor.right != current) {
                    predecessor = predecessor.right;
                }

                if (predecessor.right == null) {
                    predecessor.right = current;   // create the temporary "thread" back up
                    current = current.left;
                } else {
                    predecessor.right = null;      // thread already exists - REMOVE it (restore tree)
                    result.add(current.val);        // visit now, since left subtree is done
                    current = current.right;
                }
            }
        }
        return result;
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(1);
        root.left = new TreeNode(2);
        root.right = new TreeNode(3);
        root.left.left = new TreeNode(4);
        root.left.right = new TreeNode(5);

        System.out.println(morrisInorder(root));
    }
}
// OUTPUT:
// [4, 2, 5, 1, 3]`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why the Tree Ends Up Exactly as It Started</h3>
Every thread created (<code>predecessor.right = current</code>) is EXPLICITLY removed the second time that predecessor is reached (<code>predecessor.right = null</code>) - the algorithm visits each thread exactly twice: once to create it (descending), once to detect and remove it (returning). This is what makes Morris Traversal safe to use on a tree you still need intact afterward, unlike naive "just add temporary pointers and leave them" approaches.`,
            codeExamples: [
                `package com.javaschoollab;

public class MorrisRestoresTreeDemo {

    static class TreeNode {
        int val;
        TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    static void morrisInorderVerifyRestore(TreeNode root) {
        TreeNode current = root;
        while (current != null) {
            if (current.left == null) {
                current = current.right;
            } else {
                TreeNode predecessor = current.left;
                while (predecessor.right != null && predecessor.right != current) {
                    predecessor = predecessor.right;
                }
                if (predecessor.right == null) {
                    predecessor.right = current;
                    current = current.left;
                } else {
                    predecessor.right = null;   // thread REMOVED - tree restored to original shape
                    current = current.right;
                }
            }
        }
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(1);
        root.left = new TreeNode(2);
        root.left.right = new TreeNode(3);

        morrisInorderVerifyRestore(root);

        // After traversal, the tree's ORIGINAL structure must be intact
        System.out.println("root.left.right after traversal: "
            + (root.left.right != null ? root.left.right.val : "null"));
    }
}
// OUTPUT:
// root.left.right after traversal: 3`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What's the time and space complexity of Morris Traversal?</td><td>O(n) time, O(1) EXTRA space - it does visit some nodes more than once (while threading/unthreading), but the total work across the whole traversal is still bounded by O(n)</td></tr>
<tr class='text-center'><td>Why is Morris Traversal rarely used in production code despite O(1) space?</td><td>It temporarily mutates the tree structure, which is dangerous in concurrent/multi-threaded contexts (another thread could observe the temporary threaded state) and makes the code significantly harder to read/verify than recursive or stack-based versions</td></tr>
<tr class='text-center'><td>When would O(1) space actually matter enough to justify Morris Traversal's complexity?</td><td>Extremely memory-constrained environments, or interview questions that EXPLICITLY forbid O(h) auxiliary space (a common "can you do better?" follow-up after a stack-based or recursive solution)</td></tr>
</table>`
        }
    ]
};
