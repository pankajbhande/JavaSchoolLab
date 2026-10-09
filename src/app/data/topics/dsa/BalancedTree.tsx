import { Topic } from '../../coreJava';

export const balancedTree: Topic = {
    id: 'dsa-trees-balanced-tree',
    name: 'Balanced Tree',
    beginner: [
        {
            content: `<h4>What Does "Balanced" Mean?</h4>
A tree is HEIGHT-BALANCED if, for every node, the heights of its left and right subtrees differ by at most 1. Balance is what keeps a BST's operations at O(log n) - an unbalanced BST can degrade to a linked list with O(n) operations.`,
            codeExamples: [
                `package com.javaschoollab;

public class IsBalancedDemo {

    static class TreeNode {
        int val;
        TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    // Returns height if balanced, -1 if NOT balanced (propagates up immediately)
    static int checkBalance(TreeNode node) {
        if (node == null) return 0;

        int leftHeight = checkBalance(node.left);
        if (leftHeight == -1) return -1;   // left subtree already unbalanced

        int rightHeight = checkBalance(node.right);
        if (rightHeight == -1) return -1;

        if (Math.abs(leftHeight - rightHeight) > 1) return -1;

        return 1 + Math.max(leftHeight, rightHeight);
    }

    static boolean isBalanced(TreeNode root) {
        return checkBalance(root) != -1;
    }

    public static void main(String[] args) {
        TreeNode balanced = new TreeNode(1);
        balanced.left = new TreeNode(2);
        balanced.right = new TreeNode(3);

        TreeNode unbalanced = new TreeNode(1);
        unbalanced.left = new TreeNode(2);
        unbalanced.left.left = new TreeNode(3);
        unbalanced.left.left.left = new TreeNode(4);

        System.out.println(isBalanced(balanced));
        System.out.println(isBalanced(unbalanced));
    }
}
// OUTPUT:
// true
// false`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why a Naive Height-Check Approach is O(n&sup2;), and How to Fix It</h3>
Computing height separately for every node (calling a plain <code>height()</code> function at each node while checking balance) recomputes overlapping subtree heights repeatedly - O(n&sup2;) worst case. The fix, shown above, COMBINES the balance check with the height computation in a single bottom-up pass: each call returns either the real height or a sentinel (-1) meaning "already unbalanced", short-circuiting further work - O(n) total.`,
            codeExamples: [
                `package com.javaschoollab;

public class NaiveVsOptimalBalanceDemo {

    static class TreeNode {
        int val;
        TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    // NAIVE - O(n^2): height() is called repeatedly, recomputing overlapping subtrees
    static int height(TreeNode node) {
        if (node == null) return 0;
        return 1 + Math.max(height(node.left), height(node.right));
    }

    static boolean isBalancedNaive(TreeNode node) {
        if (node == null) return true;
        int leftH = height(node.left);    // recomputes the WHOLE left subtree's height
        int rightH = height(node.right);  // recomputes the WHOLE right subtree's height
        return Math.abs(leftH - rightH) <= 1
            && isBalancedNaive(node.left)
            && isBalancedNaive(node.right);
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(1);
        root.left = new TreeNode(2);
        root.right = new TreeNode(3);

        System.out.println("Naive result: " + isBalancedNaive(root));
        System.out.println("Naive approach recomputes height() at every node - O(n^2) worst case.");
        System.out.println("The optimal approach combines height + balance check into ONE pass - O(n).");
    }
}
// OUTPUT:
// Naive result: true
// Naive approach recomputes height() at every node - O(n^2) worst case.
// The optimal approach combines height + balance check into ONE pass - O(n).`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why does an unbalanced BST break the O(log n) guarantee?</td><td>Search/insert/delete cost is proportional to the tree's HEIGHT, not its node count - a skewed tree's height approaches n, matching a linked list's O(n) operations</td></tr>
<tr class='text-center'><td>How do AVL trees maintain balance automatically?</td><td>After every insert/delete, they check the balance factor (height difference between left and right subtrees) at each ancestor and perform ROTATIONS (single or double) to restore the height-balanced invariant</td></tr>
<tr class='text-center'><td>Is a "complete" tree automatically balanced?</td><td>Yes - completeness (filled level by level, left to right) is actually a STRICTER guarantee than height-balance, so every complete tree is balanced, though not every balanced tree is complete</td></tr>
</table>`
        }
    ]
};
