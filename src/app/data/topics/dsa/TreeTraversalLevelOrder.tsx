import { Topic } from '../../coreJava';

export const treeTraversalLevelOrder: Topic = {
    id: 'dsa-trees-tree-traversal-level-order',
    name: 'Tree Traversal - Level Order',
    beginner: [
        {
            content: `<h4>Level Order (BFS) - Visiting Level by Level</h4>
Unlike preorder/inorder/postorder (all DEPTH-first), level order visits the tree BREADTH-first: all of level 0, then all of level 1, then level 2, and so on. It's implemented with a QUEUE, not recursion - the same core idea as BFS on a graph.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.*;

public class LevelOrderTraversalDemo {

    static class TreeNode {
        int val;
        TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    static List<Integer> levelOrder(TreeNode root) {
        List<Integer> result = new ArrayList<>();
        if (root == null) return result;

        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);

        while (!queue.isEmpty()) {
            TreeNode node = queue.poll();
            result.add(node.val);
            if (node.left != null) queue.offer(node.left);
            if (node.right != null) queue.offer(node.right);
        }
        return result;
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(1);
        root.left = new TreeNode(2);
        root.right = new TreeNode(3);
        root.left.left = new TreeNode(4);
        root.left.right = new TreeNode(5);

        System.out.println(levelOrder(root));
    }
}
// OUTPUT:
// [1, 2, 3, 4, 5]`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Level-by-Level Grouping - the Sentinel/Size-Snapshot Trick</h3>
Many problems need results grouped BY LEVEL (e.g. "return each level as its own list"), not flattened. The standard technique: capture <code>queue.size()</code> BEFORE processing each level - that snapshot tells you exactly how many nodes belong to the current level, letting you process precisely that many before moving to the next.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.*;

public class LevelOrderGroupedDemo {

    static class TreeNode {
        int val;
        TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    static List<List<Integer>> levelOrderGrouped(TreeNode root) {
        List<List<Integer>> result = new ArrayList<>();
        if (root == null) return result;

        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);

        while (!queue.isEmpty()) {
            int levelSize = queue.size();   // SNAPSHOT: exactly how many nodes are in THIS level
            List<Integer> currentLevel = new ArrayList<>();

            for (int i = 0; i < levelSize; i++) {
                TreeNode node = queue.poll();
                currentLevel.add(node.val);
                if (node.left != null) queue.offer(node.left);
                if (node.right != null) queue.offer(node.right);
            }
            result.add(currentLevel);
        }
        return result;
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(1);
        root.left = new TreeNode(2);
        root.right = new TreeNode(3);
        root.left.left = new TreeNode(4);
        root.right.right = new TreeNode(5);

        System.out.println(levelOrderGrouped(root));
    }
}
// OUTPUT:
// [[1], [2, 3], [4, 5]]`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why does level order use a Queue instead of recursion?</td><td>Recursion naturally follows a depth-first path (all the way down one branch before backtracking); a Queue's FIFO order naturally processes nodes in the breadth-first, level-by-level sequence needed</td></tr>
<tr class='text-center'><td>What's the time and space complexity of level order traversal?</td><td>O(n) time (every node processed once), O(w) space where w is the tree's maximum WIDTH (the queue never holds more than one level's worth of nodes at a time)</td></tr>
<tr class='text-center'><td>How would you find the tree's Right View using level order?</td><td>Group by level (using the size-snapshot trick), and for each level take the LAST element added - that's the rightmost visible node at that depth</td></tr>
</table>`
        }
    ]
};
