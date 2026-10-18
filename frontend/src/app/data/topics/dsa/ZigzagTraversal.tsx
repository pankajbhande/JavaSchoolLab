import { Topic } from '../../coreJava';

export const zigzagTraversal: Topic = {
    id: 'dsa-trees-zigzag-traversal',
    name: 'Zigzag Traversal',
    beginner: [
        {
            content: `<h4>Level Order, Alternating Direction Each Level</h4>
Also called "spiral traversal": level 0 goes left-to-right, level 1 goes right-to-left, level 2 left-to-right again, and so on. Built directly on top of standard level-order BFS - just reverse every OTHER level's collected list before adding it to the result.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.*;

public class ZigzagTraversalDemo {

    static class TreeNode {
        int val;
        TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    static List<List<Integer>> zigzagLevelOrder(TreeNode root) {
        List<List<Integer>> result = new ArrayList<>();
        if (root == null) return result;

        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);
        boolean leftToRight = true;

        while (!queue.isEmpty()) {
            int levelSize = queue.size();
            List<Integer> currentLevel = new ArrayList<>();

            for (int i = 0; i < levelSize; i++) {
                TreeNode node = queue.poll();
                currentLevel.add(node.val);
                if (node.left != null) queue.offer(node.left);
                if (node.right != null) queue.offer(node.right);
            }

            if (!leftToRight) {
                Collections.reverse(currentLevel);
            }
            result.add(currentLevel);
            leftToRight = !leftToRight;   // flip direction for the next level
        }
        return result;
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(3);
        root.left = new TreeNode(9);
        root.right = new TreeNode(20);
        root.right.left = new TreeNode(15);
        root.right.right = new TreeNode(7);

        System.out.println(zigzagLevelOrder(root));
    }
}
// OUTPUT:
// [[3], [20, 9], [15, 7]]`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>A Deque-Based Alternative That Avoids Reversing</h3>
Instead of collecting each level normally then reversing it after the fact, a <code>Deque</code> can insert at the FRONT or BACK depending on the current direction - producing the zigzag order directly, without a separate reverse step.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.*;

public class ZigzagDequeDemo {

    static class TreeNode {
        int val;
        TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    static List<List<Integer>> zigzagLevelOrder(TreeNode root) {
        List<List<Integer>> result = new ArrayList<>();
        if (root == null) return result;

        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);
        boolean leftToRight = true;

        while (!queue.isEmpty()) {
            int levelSize = queue.size();
            Deque<Integer> currentLevel = new ArrayDeque<>();

            for (int i = 0; i < levelSize; i++) {
                TreeNode node = queue.poll();

                if (leftToRight) {
                    currentLevel.addLast(node.val);
                } else {
                    currentLevel.addFirst(node.val);   // insert at front - builds reversed order directly
                }

                if (node.left != null) queue.offer(node.left);
                if (node.right != null) queue.offer(node.right);
            }
            result.add(new ArrayList<>(currentLevel));
            leftToRight = !leftToRight;
        }
        return result;
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(3);
        root.left = new TreeNode(9);
        root.right = new TreeNode(20);
        root.right.left = new TreeNode(15);
        root.right.right = new TreeNode(7);

        System.out.println(zigzagLevelOrder(root));
    }
}
// OUTPUT:
// [[3], [20, 9], [15, 7]]`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Does the QUEUE ever process nodes out of normal left-to-right order?</td><td>No - children are always enqueued in the same left-then-right order regardless of the current level's display direction; only the COLLECTED result for that level gets reversed (or built in reverse via the deque), not the underlying BFS traversal itself</td></tr>
<tr class='text-center'><td>What's the time complexity of the reverse-after-collect vs deque approach?</td><td>Both are O(n) overall - reversing each level costs O(level size), summing to O(n) across all levels; the deque approach does the same total work, just distributed differently</td></tr>
<tr class='text-center'><td>How would you adapt this for a "boustrophedon" (ox-plowing) traversal across MULTIPLE trees or a graph?</td><td>The same level-alternating-direction principle applies to any BFS-based level structure - the key requirement is a well-defined notion of "level" to alternate on</td></tr>
</table>`
        }
    ]
};
