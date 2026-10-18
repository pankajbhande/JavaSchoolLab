import { Topic } from '../../coreJava';

export const treeViewRight: Topic = {
    id: 'dsa-trees-tree-view-right-view',
    name: 'Tree View - Right View',
    beginner: [
        {
            content: `<h4>Right View - the Last Node Visible at Each Level</h4>
The mirror of Left View: standing to the RIGHT of the tree, you see the LAST node at each depth during level-order traversal. Same BFS grouping, just take the last element of each level instead of the first.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.*;

public class RightViewDemo {

    static class TreeNode {
        int val;
        TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    static List<Integer> rightView(TreeNode root) {
        List<Integer> result = new ArrayList<>();
        if (root == null) return result;

        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);

        while (!queue.isEmpty()) {
            int levelSize = queue.size();
            for (int i = 0; i < levelSize; i++) {
                TreeNode node = queue.poll();
                if (i == levelSize - 1) result.add(node.val);   // LAST node of this level
                if (node.left != null) queue.offer(node.left);
                if (node.right != null) queue.offer(node.right);
            }
        }
        return result;
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(1);
        root.left = new TreeNode(2);
        root.right = new TreeNode(3);
        root.left.right = new TreeNode(4);
        root.right.right = new TreeNode(5);

        System.out.println(rightView(root));
    }
}
// OUTPUT:
// [1, 3, 5]`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>DFS Alternative - Right First This Time</h3>
The DFS version of Right View flips the exploration order: visit RIGHT before LEFT, so the "first time reaching a depth" trick now captures the rightmost node instead of the leftmost.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.ArrayList;
import java.util.List;

public class RightViewDfsDemo {

    static class TreeNode {
        int val;
        TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    static List<Integer> result = new ArrayList<>();
    static int maxDepthSeen = -1;

    static void dfs(TreeNode node, int depth) {
        if (node == null) return;

        if (depth > maxDepthSeen) {
            result.add(node.val);
            maxDepthSeen = depth;
        }

        dfs(node.right, depth + 1);   // RIGHT explored BEFORE left - the key flip
        dfs(node.left, depth + 1);
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(1);
        root.left = new TreeNode(2);
        root.right = new TreeNode(3);
        root.left.right = new TreeNode(4);
        root.right.right = new TreeNode(5);

        result = new ArrayList<>();
        maxDepthSeen = -1;
        dfs(root, 0);
        System.out.println(result);
    }
}
// OUTPUT:
// [1, 3, 5]`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What's the single-line difference between Left View and Right View's DFS code?</td><td>Swapping the recursive call order: dfs(left) then dfs(right) for Left View, dfs(right) then dfs(left) for Right View - everything else is identical</td></tr>
<tr class='text-center'><td>Could a tree's Left View and Right View ever be identical?</td><td>Yes - for a tree with only one node per level (a "staircase" or fully skewed shape), or a tree with exactly one node at each depth, left and right views coincide</td></tr>
<tr class='text-center'><td>How does Right View relate to a heap's array representation or a complete binary tree's rightmost path?</td><td>They're unrelated concepts that are sometimes confused - Right View is about VISUAL visibility from one side across ALL levels, not a single root-to-node path</td></tr>
</table>`
        }
    ]
};
