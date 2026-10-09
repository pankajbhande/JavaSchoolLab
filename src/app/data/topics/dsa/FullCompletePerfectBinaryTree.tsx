import { Topic } from '../../coreJava';

export const fullCompletePerfectBinaryTree: Topic = {
    id: 'dsa-trees-full-complete-perfect-binary-tree',
    name: 'Full / Complete / Perfect Binary Tree',
    beginner: [
        {
            content: `<h4>Three Different Shape Constraints</h4>
<ul>
<li><b>Full (or "proper"):</b> every node has 0 or 2 children - never exactly 1.</li>
<li><b>Complete:</b> every level is fully filled except possibly the last, and the last level's nodes are filled LEFT to RIGHT with no gaps. This shape is exactly what a binary heap requires, since it enables an array-based representation with no wasted slots.</li>
<li><b>Perfect:</b> ALL levels are completely filled - every leaf is at the same depth. A perfect tree is both full and complete.</li>
</ul>`,
            codeExamples: [
                `package com.javaschoollab;

public class TreeShapeChecksDemo {

    static class TreeNode {
        int val;
        TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    static boolean isFull(TreeNode node) {
        if (node == null) return true;
        if ((node.left == null) != (node.right == null)) return false;   // exactly one child - not full
        return isFull(node.left) && isFull(node.right);
    }

    static int height(TreeNode node) {
        if (node == null) return 0;
        return 1 + Math.max(height(node.left), height(node.right));
    }

    static int countNodes(TreeNode node) {
        if (node == null) return 0;
        return 1 + countNodes(node.left) + countNodes(node.right);
    }

    static boolean isPerfect(TreeNode node) {
        int h = height(node);
        int n = countNodes(node);
        return n == (int) Math.pow(2, h) - 1;   // a perfect tree of height h has exactly 2^h - 1 nodes
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(1);
        root.left = new TreeNode(2);
        root.right = new TreeNode(3);
        root.left.left = new TreeNode(4);
        root.left.right = new TreeNode(5);
        root.right.left = new TreeNode(6);
        root.right.right = new TreeNode(7);

        System.out.println("Full?    " + isFull(root));
        System.out.println("Perfect? " + isPerfect(root));
    }
}
// OUTPUT:
// Full?    true
// Perfect? true`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why Completeness is What Enables an Array-Based Heap</h3>
A complete binary tree can be stored in a plain ARRAY with NO pointers at all: for a node at array index <code>i</code>, its children live at <code>2i+1</code> and <code>2i+2</code>, and its parent at <code>(i-1)/2</code>. This only works WITHOUT wasted slots because completeness guarantees no gaps - a non-complete tree stored this way would leave holes in the array. This is exactly why Java's <code>PriorityQueue</code> (a binary heap) is backed by a plain array internally.`,
            codeExamples: [
                `package com.javaschoollab;

public class CompleteTreeAsArrayDemo {

    // A complete binary tree stored as an array - no pointers needed
    static int[] heap = {1, 3, 6, 5, 9, 8};

    static int leftChildIndex(int i) { return 2 * i + 1; }
    static int rightChildIndex(int i) { return 2 * i + 2; }
    static int parentIndex(int i) { return (i - 1) / 2; }

    public static void main(String[] args) {
        for (int i = 0; i < heap.length; i++) {
            int left = leftChildIndex(i);
            int right = rightChildIndex(i);
            System.out.print("Node " + heap[i] + " (index " + i + "): children = ");
            System.out.print(left < heap.length ? heap[left] : "none");
            System.out.print(", ");
            System.out.println(right < heap.length ? heap[right] : "none");
        }
    }
}
// OUTPUT:
// Node 1 (index 0): children = 3, 6
// Node 3 (index 1): children = 5, 9
// Node 6 (index 2): children = 8, none
// Node 5 (index 3): children = none, none
// Node 9 (index 4): children = none, none
// Node 8 (index 5): children = none, none`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>How many nodes does a perfect binary tree of height h have?</td><td>Exactly 2^h - 1 - every level is fully populated, and level k (0-indexed) has 2^k nodes</td></tr>
<tr class='text-center'><td>Is every complete binary tree also full?</td><td>No - a complete tree can have a node with exactly one child (specifically, the rightmost node on the second-to-last level might have only a left child), which violates "full"</td></tr>
<tr class='text-center'><td>Why does array-based heap storage require completeness specifically, not just "balanced"?</td><td>A merely balanced tree can still have gaps in its shape (missing nodes anywhere, not just at the end); the array-index formulas (2i+1, 2i+2) only correctly map to actual nodes with no wasted slots when the tree is filled left-to-right with no internal gaps</td></tr>
</table>`
        }
    ]
};
