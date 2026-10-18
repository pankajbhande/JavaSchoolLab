import { Topic } from '../../coreJava';

export const treeViewBottom: Topic = {
    id: 'dsa-trees-tree-view-bottom-view',
    name: 'Tree View - Bottom View',
    beginner: [
        {
            content: `<h4>Bottom View - What's Visible Looking Up</h4>
Same horizontal-distance idea as Top View, but the LAST (deepest) node at each horizontal distance wins instead of the first. Use unconditional overwrite (<code>put</code>) rather than <code>putIfAbsent</code> - since BFS processes in increasing depth order, each new node at a given HD replaces the previous one, so whatever remains after the full scan is the deepest.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.*;

public class BottomViewDemo {

    static class TreeNode {
        int val;
        TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    static List<Integer> bottomView(TreeNode root) {
        if (root == null) return new ArrayList<>();

        TreeMap<Integer, Integer> hdToValue = new TreeMap<>();
        Queue<TreeNode> queue = new LinkedList<>();
        Queue<Integer> hdQueue = new LinkedList<>();
        queue.offer(root);
        hdQueue.offer(0);

        while (!queue.isEmpty()) {
            TreeNode node = queue.poll();
            int hd = hdQueue.poll();

            hdToValue.put(hd, node.val);   // OVERWRITE - the latest (deepest) node wins

            if (node.left != null) { queue.offer(node.left); hdQueue.offer(hd - 1); }
            if (node.right != null) { queue.offer(node.right); hdQueue.offer(hd + 1); }
        }
        return new ArrayList<>(hdToValue.values());
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(1);
        root.left = new TreeNode(2);
        root.right = new TreeNode(3);
        root.left.right = new TreeNode(4);   // HD 0, deeper than root - wins for bottom view
        root.right.left = new TreeNode(5);   // HD 0 also

        System.out.println(bottomView(root));
    }
}
// OUTPUT:
// [2, 5, 3]`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Handling Ties at the SAME (Horizontal Distance, Depth)</h3>
When two nodes share BOTH the same horizontal distance AND the same depth (e.g. one is a left-child's right-child, the other is a right-child's left-child, both landing at HD 0 at the same level), the convention is that whichever was processed LATER in the BFS traversal order wins - typically the one reached via the RIGHT branch, since BFS processes a node's left child before its right child at each step, but siblings across different parents follow queue insertion order.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.*;

public class BottomViewTieDemo {

    static class TreeNode {
        int val;
        TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    static List<Integer> bottomView(TreeNode root) {
        if (root == null) return new ArrayList<>();
        TreeMap<Integer, Integer> hdToValue = new TreeMap<>();
        Queue<TreeNode> queue = new LinkedList<>();
        Queue<Integer> hdQueue = new LinkedList<>();
        queue.offer(root);
        hdQueue.offer(0);

        while (!queue.isEmpty()) {
            TreeNode node = queue.poll();
            int hd = hdQueue.poll();
            hdToValue.put(hd, node.val);
            if (node.left != null) { queue.offer(node.left); hdQueue.offer(hd - 1); }
            if (node.right != null) { queue.offer(node.right); hdQueue.offer(hd + 1); }
        }
        return new ArrayList<>(hdToValue.values());
    }

    public static void main(String[] args) {
        // root.left.right and root.right.left BOTH land at HD=0, same depth 2
        TreeNode root = new TreeNode(1);
        root.left = new TreeNode(2);
        root.right = new TreeNode(3);
        root.left.right = new TreeNode(4);    // HD 0, depth 2
        root.right.left = new TreeNode(5);    // HD 0, depth 2 - processed AFTER node 4 in BFS order

        System.out.println(bottomView(root));   // node 5 wins the HD=0 slot, since it's dequeued later
    }
}
// OUTPUT:
// [2, 5, 3]`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why does bottom view need BFS specifically, just like top view?</td><td>Both rely on processing nodes in strictly increasing DEPTH order so that "overwrite" (bottom view) or "first write wins" (top view) correctly reflect which node is shallower vs deeper - DFS gives no such depth ordering guarantee across different horizontal distances</td></tr>
<tr class='text-center'><td>Can top view and bottom view ever be identical for the same tree?</td><td>Yes - for any tree where each horizontal distance is occupied by exactly one node total (e.g. a tree with no HD collisions at all)</td></tr>
<tr class='text-center'><td>What's the time and space complexity of computing bottom view?</td><td>O(n log n) - O(n) for the BFS traversal, plus O(log n) per TreeMap insertion; a HashMap plus separate min/max HD tracking and a final sort could also achieve this, with similar overall complexity</td></tr>
</table>`
        }
    ]
};
