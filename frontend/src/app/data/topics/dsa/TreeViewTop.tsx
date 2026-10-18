import { Topic } from '../../coreJava';

export const treeViewTop: Topic = {
    id: 'dsa-trees-tree-view-top-view',
    name: 'Tree View - Top View',
    beginner: [
        {
            content: `<h4>Top View - What's Visible Looking Down</h4>
Assign each node a HORIZONTAL DISTANCE (HD) from the root: root = 0, left child = parent's HD - 1, right child = parent's HD + 1. The top view shows the FIRST node encountered at each distinct horizontal distance during a level-order (BFS) scan - "first" matters because BFS processes shallower nodes before deeper ones at the same HD.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.*;

public class TopViewDemo {

    static class TreeNode {
        int val;
        TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    static List<Integer> topView(TreeNode root) {
        if (root == null) return new ArrayList<>();

        TreeMap<Integer, Integer> hdToValue = new TreeMap<>();   // sorted by horizontal distance
        Queue<TreeNode> queue = new LinkedList<>();
        Queue<Integer> hdQueue = new LinkedList<>();
        queue.offer(root);
        hdQueue.offer(0);

        while (!queue.isEmpty()) {
            TreeNode node = queue.poll();
            int hd = hdQueue.poll();

            // Only record the FIRST node seen at this HD (BFS guarantees it's the shallowest)
            hdToValue.putIfAbsent(hd, node.val);

            if (node.left != null) { queue.offer(node.left); hdQueue.offer(hd - 1); }
            if (node.right != null) { queue.offer(node.right); hdQueue.offer(hd + 1); }
        }
        return new ArrayList<>(hdToValue.values());
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(1);
        root.left = new TreeNode(2);
        root.right = new TreeNode(3);
        root.left.right = new TreeNode(4);   // HD 0, same as root - but root arrives first
        root.right.left = new TreeNode(5);   // HD 0 too

        System.out.println(topView(root));
    }
}
// OUTPUT:
// [2, 1, 3]`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why BFS (Not DFS) is Required for Correctness</h3>
Top view specifically needs the SHALLOWEST node at each horizontal distance to win ties - DFS visits nodes in a depth-first order, so a DEEPER node at some HD could be recorded before a SHALLOWER one at that same HD arrives later, giving the wrong answer. BFS processes level by level, guaranteeing the first node encountered at any HD is always the shallowest one - this is why <code>putIfAbsent</code> combined with BFS order is correct, but the same trick with DFS order is NOT.`,
            codeExamples: [
                `package com.javaschoollab;

public class WhyBfsForTopViewDemo {
    public static void main(String[] args) {
        // Consider: root(HD=0), root.right.left has HD=0 too, but is DEEPER.
        // If we used DFS and happened to explore root.right's subtree
        // before recording root itself in some naive traversal order,
        // we could incorrectly record the deeper node first.
        System.out.println("BFS guarantees: at HD=0, the ROOT (depth 0) is dequeued");
        System.out.println("before any deeper node that also has HD=0.");
        System.out.println("DFS gives no such depth-ordering guarantee across different HDs.");
    }
}
// OUTPUT:
// BFS guarantees: at HD=0, the ROOT (depth 0) is dequeued
// before any deeper node that also has HD=0.
// DFS gives no such depth-ordering guarantee across different HDs.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is "horizontal distance" and why is it the key to this problem?</td><td>It's each node's horizontal offset from the root (left = -1, right = +1 relative to parent) - nodes with the SAME horizontal distance appear in the same vertical column when the tree is drawn, which is exactly what "view from above" needs to group</td></tr>
<tr class='text-center'><td>Why use TreeMap instead of a plain HashMap for hdToValue?</td><td>TreeMap keeps keys sorted, so iterating its values directly gives the horizontal distances in left-to-right order - a HashMap would need an extra sort step</td></tr>
<tr class='text-center'><td>How does Bottom View differ from Top View in implementation?</td><td>Use put() (unconditional overwrite) instead of putIfAbsent() - since later-arriving (deeper) nodes at the same HD should WIN for bottom view, the opposite priority from top view</td></tr>
</table>`
        }
    ]
};
