import { Topic } from '../../coreJava';

export const bstOperations: Topic = {
    id: 'dsa-trees-bst-operations',
    name: 'BST Operations',
    beginner: [
        {
            content: `<h4>The Full Set: Insert, Search, Delete, Min, Max</h4>
Every core BST operation follows the same shape - use the ordering property to decide left or right, and recurse: O(h) time, where h is the tree's height (O(log n) balanced, O(n) worst case skewed).`,
            codeExamples: [
                `package com.javaschoollab;

public class BstFullOperationsDemo {

    static class TreeNode {
        int val;
        TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    static TreeNode insert(TreeNode node, int val) {
        if (node == null) return new TreeNode(val);
        if (val < node.val) node.left = insert(node.left, val);
        else if (val > node.val) node.right = insert(node.right, val);
        return node;
    }

    static TreeNode findMin(TreeNode node) {
        while (node.left != null) node = node.left;   // leftmost node = smallest
        return node;
    }

    static TreeNode findMax(TreeNode node) {
        while (node.right != null) node = node.right;  // rightmost node = largest
        return node;
    }

    public static void main(String[] args) {
        TreeNode root = null;
        for (int v : new int[]{50, 30, 70, 20, 40, 60, 80}) {
            root = insert(root, v);
        }

        System.out.println("Min: " + findMin(root).val);
        System.out.println("Max: " + findMax(root).val);
    }
}
// OUTPUT:
// Min: 20
// Max: 80`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Converting a Sorted Array into a BALANCED BST</h3>
Given a sorted array, always picking the MIDDLE element as the root (recursively, for each half) guarantees a height-balanced BST in one pass - O(n) time, since each of the n elements is processed exactly once, and the recursive midpoint choice automatically keeps subtree sizes even.`,
            codeExamples: [
                `package com.javaschoollab;

public class SortedArrayToBstDemo {

    static class TreeNode {
        int val;
        TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    static TreeNode sortedArrayToBst(int[] arr, int left, int right) {
        if (left > right) return null;

        int mid = left + (right - left) / 2;   // always pick the MIDDLE for balance
        TreeNode root = new TreeNode(arr[mid]);

        root.left = sortedArrayToBst(arr, left, mid - 1);
        root.right = sortedArrayToBst(arr, mid + 1, right);
        return root;
    }

    static void preorder(TreeNode node, StringBuilder sb) {
        if (node == null) return;
        sb.append(node.val).append(" ");
        preorder(node.left, sb);
        preorder(node.right, sb);
    }

    public static void main(String[] args) {
        int[] sorted = {1, 2, 3, 4, 5, 6, 7};
        TreeNode root = sortedArrayToBst(sorted, 0, sorted.length - 1);

        StringBuilder sb = new StringBuilder();
        preorder(root, sb);
        System.out.println(sb.toString().trim());   // root should be 4 (the middle)
    }
}
// OUTPUT:
// 4 2 1 3 6 5 7`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why does inserting a SORTED sequence into a plain BST produce the worst-case shape?</td><td>Every new value is either always the largest or always the smallest seen so far, so each insertion attaches only as a single right (or left) child - degenerating into a linked list with height n instead of log n</td></tr>
<tr class='text-center'><td>Why does picking the middle element guarantee balance when building from a sorted array?</td><td>Splitting at the midpoint always creates two halves that differ in size by at most 1, so the resulting tree's height stays O(log n) - the same reasoning as a well-balanced binary search</td></tr>
<tr class='text-center'><td>What real-world problem is "sorted array to balanced BST" the solution for?</td><td>Rebalancing an existing unbalanced BST: do an inorder traversal to get a sorted array, then rebuild it via this middle-picking technique - O(n) total to fully rebalance any BST</td></tr>
</table>`
        }
    ]
};
