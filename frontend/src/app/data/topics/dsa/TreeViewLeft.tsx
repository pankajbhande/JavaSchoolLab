import { Topic } from '../../coreJava';

export const treeViewLeft: Topic = {
    id: 'dsa-trees-tree-view-left-view',
    name: 'Tree View - Left View',
    beginner: [
        {
            content: `<h4>Left View - the First Node Visible at Each Level</h4>
Standing to the LEFT of the tree, which nodes can you see? Exactly the FIRST node encountered at each depth during a level-order (BFS) traversal. Group by level, take the first element of each group.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.*;

public class LeftViewDemo {

    static class TreeNode {
        int val;
        TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    static List<Integer> leftView(TreeNode root) {
        List<Integer> result = new ArrayList<>();
        if (root == null) return result;

        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);

        while (!queue.isEmpty()) {
            int levelSize = queue.size();
            for (int i = 0; i < levelSize; i++) {
                TreeNode node = queue.poll();
                if (i == 0) result.add(node.val);   // FIRST node of this level
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

        System.out.println(leftView(root));
    }
}
// OUTPUT:
// [1, 2, 4]`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>DFS Alternative - First Visit Wins</h3>
Left view can also be computed with DFS (preorder, visiting LEFT before right), tracking the maximum depth seen so far - a node is added to the result only the FIRST time its depth is reached, which happens to always be its leftmost representative since left is explored first.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.ArrayList;
import java.util.List;

public class LeftViewDfsDemo {

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
            result.add(node.val);   // first time reaching this depth - and since we go LEFT
            maxDepthSeen = depth;    // first, this is guaranteed to be the leftmost node here
        }

        dfs(node.left, depth + 1);   // left explored BEFORE right
        dfs(node.right, depth + 1);
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
// [1, 2, 4]`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why does DFS need to visit left before right for this trick to work?</td><td>The "first time reaching a depth" logic only picks the LEFTMOST node at that depth if left is explored first - visiting right first would incorrectly capture the rightmost node instead</td></tr>
<tr class='text-center'><td>What's the time and space complexity of either approach?</td><td>O(n) time (every node visited once), O(w) space for BFS (queue holds one level, up to the tree's max width) or O(h) space for DFS (call stack, up to the tree's height)</td></tr>
<tr class='text-center'><td>How is Right View different in the BFS version?</td><td>Just take the LAST node of each level's group instead of the first - one condition flip (i == levelSize - 1 instead of i == 0)</td></tr>
</table>`
        }
    ]
};
