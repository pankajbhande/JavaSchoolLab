import { Topic } from '../../coreJava';

export const kthSmallestLargestBst: Topic = {
    id: 'dsa-trees-kth-smallest-largest-in-bst',
    name: 'Kth Smallest / Largest in BST',
    beginner: [
        {
            content: `<h4>Using Inorder's Sorted Property</h4>
Since inorder traversal of a BST visits nodes in ascending order, the Kth SMALLEST element is simply the Kth value visited by inorder - stop as soon as a counter reaches K, no need to traverse the whole tree.`,
            codeExamples: [
                `package com.javaschoollab;

public class KthSmallestDemo {

    static class TreeNode {
        int val;
        TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    static int count = 0;
    static int result = -1;

    static void inorder(TreeNode node, int k) {
        if (node == null || count >= k) return;

        inorder(node.left, k);
        count++;
        if (count == k) {
            result = node.val;
            return;   // stop early - no need to visit the rest of the tree
        }
        inorder(node.right, k);
    }

    static int kthSmallest(TreeNode root, int k) {
        count = 0;
        result = -1;
        inorder(root, k);
        return result;
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(5);
        root.left = new TreeNode(3);
        root.right = new TreeNode(6);
        root.left.left = new TreeNode(2);
        root.left.right = new TreeNode(4);
        root.left.left.left = new TreeNode(1);

        System.out.println(kthSmallest(root, 3));
    }
}
// OUTPUT:
// 3`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Kth Largest - Reverse Inorder, No Separate Logic Needed</h3>
The Kth largest is just the Kth smallest of a REVERSED order: traverse RIGHT before LEFT (a "reverse inorder"), and the Kth value visited is the Kth largest - same counting logic, one line swapped.`,
            codeExamples: [
                `package com.javaschoollab;

public class KthLargestDemo {

    static class TreeNode {
        int val;
        TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    static int count = 0;
    static int result = -1;

    static void reverseInorder(TreeNode node, int k) {
        if (node == null || count >= k) return;

        reverseInorder(node.right, k);   // RIGHT first - descending order
        count++;
        if (count == k) {
            result = node.val;
            return;
        }
        reverseInorder(node.left, k);
    }

    static int kthLargest(TreeNode root, int k) {
        count = 0;
        result = -1;
        reverseInorder(root, k);
        return result;
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(5);
        root.left = new TreeNode(3);
        root.right = new TreeNode(6);
        root.left.left = new TreeNode(2);
        root.left.right = new TreeNode(4);

        System.out.println(kthLargest(root, 2));
    }
}
// OUTPUT:
// 5`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What's the time complexity of finding the Kth smallest, and why does it beat sorting?</td><td>O(h + k) - walk down to the leftmost node (O(h)) then visit k nodes; far better than O(n) or O(n log n) for a sort when k is small relative to n</td></tr>
<tr class='text-center'><td>How would you support REPEATED "find Kth smallest" queries efficiently as the BST changes?</td><td>Augment each node with a "size of its left subtree" count, updated during insert/delete - this lets you jump directly toward the Kth element using the counts, in O(h) per query without a full inorder scan</td></tr>
<tr class='text-center'><td>Why does the early-return (count >= k) matter for efficiency?</td><td>Without it, the traversal would continue visiting the ENTIRE tree even after finding the answer - the early exit keeps the cost proportional to k, not n</td></tr>
</table>`
        }
    ]
};
