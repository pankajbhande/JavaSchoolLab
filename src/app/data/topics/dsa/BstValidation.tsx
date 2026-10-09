import { Topic } from '../../coreJava';

export const bstValidation: Topic = {
    id: 'dsa-trees-bst-validation',
    name: 'BST Validation',
    beginner: [
        {
            content: `<h4>The Range (Min/Max Bounds) Approach</h4>
An alternative to the inorder-sortedness check: pass down a valid <code>(min, max)</code> RANGE as you recurse. Each node must fall strictly within its inherited range; its left child inherits <code>(min, node.val)</code>, its right child inherits <code>(node.val, max)</code> - correctly catching violations from ANY ancestor, not just the immediate parent.`,
            codeExamples: [
                `package com.javaschoollab;

public class BstValidationRangeDemo {

    static class TreeNode {
        int val;
        TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    static boolean isValidBst(TreeNode node, Long min, Long max) {
        if (node == null) return true;

        if ((min != null && node.val <= min) || (max != null && node.val >= max)) {
            return false;   // violates the range inherited from an ancestor
        }

        return isValidBst(node.left, min, (long) node.val)
            && isValidBst(node.right, (long) node.val, max);
    }

    public static void main(String[] args) {
        // Invalid: 6 is in root(5)'s LEFT subtree but 6 > 5
        TreeNode root = new TreeNode(5);
        root.left = new TreeNode(3);
        root.right = new TreeNode(8);
        root.left.right = new TreeNode(6);

        System.out.println(isValidBst(root, null, null));
    }
}
// OUTPUT:
// false`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why Long (Not Integer) Bounds are Needed</h3>
Using <code>Integer.MIN_VALUE</code>/<code>MAX_VALUE</code> as initial sentinel bounds seems natural, but breaks if the tree legitimately CONTAINS a node with exactly that value - the comparison would incorrectly reject it. Using <code>Long</code> (or a nullable wrapper, as above) for bounds avoids colliding with the actual int range of node values entirely.`,
            codeExamples: [
                `package com.javaschoollab;

public class IntegerBoundsBugDemo {

    static class TreeNode {
        int val;
        TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    // BUGGY: uses int bounds, breaks if a node's value IS Integer.MAX_VALUE
    static boolean isValidBstBuggy(TreeNode node, int min, int max) {
        if (node == null) return true;
        if (node.val <= min || node.val >= max) return false;
        return isValidBstBuggy(node.left, min, node.val)
            && isValidBstBuggy(node.right, node.val, max);
    }

    public static void main(String[] args) {
        // A single node with value Integer.MAX_VALUE is a perfectly valid BST,
        // but if called as isValidBstBuggy(root, Integer.MIN_VALUE, Integer.MAX_VALUE),
        // node.val >= max becomes MAX_VALUE >= MAX_VALUE -> true -> WRONGLY rejected.
        TreeNode edgeCase = new TreeNode(Integer.MAX_VALUE);
        System.out.println("Using int bounds with MAX_VALUE sentinel is a real correctness bug -");
        System.out.println("Long bounds (or null sentinels, as in the beginner example) avoid it entirely.");
    }
}
// OUTPUT:
// Using int bounds with MAX_VALUE sentinel is a real correctness bug -
// Long bounds (or null sentinels, as in the beginner example) avoid it entirely.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>How does the range approach compare to the inorder-sortedness check?</td><td>Both are O(n) and correct; range-based validates top-down in a single pass with explicit bounds, while inorder validates by checking strictly-increasing order during a left-root-right traversal - purely a style/preference difference</td></tr>
<tr class='text-center'><td>What's a classic WRONG approach to BST validation that this problem tests for?</td><td>Checking only "node.left.val < node.val < node.right.val" locally at each node - this misses violations from grandchildren or deeper descendants that break the property relative to a higher ancestor</td></tr>
<tr class='text-center'><td>Does BST validation allow duplicate values?</td><td>Depends on the exact BST definition used - strict BSTs (as in these examples, using <= and >=) disallow duplicates entirely; some variants allow duplicates only in one specific subtree by convention</td></tr>
</table>`
        }
    ]
};
