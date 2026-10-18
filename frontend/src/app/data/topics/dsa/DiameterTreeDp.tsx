import { Topic } from '../../coreJava';

export const diameterTreeDp: Topic = {
    id: 'dsa-dynamic-programming-diameter-tree-dp',
    name: 'Diameter (Tree DP)',
    beginner: [
        {
            content: `<h4>Diameter as a Tree DP Problem</h4>
Framing Diameter of a Tree formally as Tree DP: define <code>dp[node]</code> = height of the subtree rooted at node. The diameter THROUGH any node is <code>dp[left] + dp[right]</code> - computed as a side effect while the height itself is computed bottom-up (postorder), same technique covered under Trees, now explicitly named as a Tree DP pattern.`,
            codeExamples: [
                `package com.javaschoollab;

public class DiameterTreeDpDemo {

    static class TreeNode {
        int val;
        TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    static int maxDiameter = 0;

    // Returns height (the DP value), updates maxDiameter as a side effect
    static int height(TreeNode node) {
        if (node == null) return 0;

        int leftHeight = height(node.left);
        int rightHeight = height(node.right);

        maxDiameter = Math.max(maxDiameter, leftHeight + rightHeight);

        return 1 + Math.max(leftHeight, rightHeight);
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(1);
        root.left = new TreeNode(2);
        root.right = new TreeNode(3);
        root.left.left = new TreeNode(4);
        root.left.right = new TreeNode(5);

        maxDiameter = 0;
        height(root);
        System.out.println("Diameter: " + maxDiameter);
    }
}
// OUTPUT:
// Diameter: 3`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>The General Tree DP Template This Problem Demonstrates</h3>
Tree DP always follows the same shape: define a value at each node that depends ONLY on its children's values (never its parent's), compute it POSTORDER (children before parent), and optionally track a GLOBAL best answer as a side effect while doing so. Diameter, Maximum Path Sum, and Tree Independent Set all follow this exact template with different per-node DP values.`,
            codeExamples: [
                `package com.javaschoollab;

public class TreeDpTemplateDemo {
    public static void main(String[] args) {
        System.out.println("The Tree DP template:");
        System.out.println();
        System.out.println("dpValue solve(node):");
        System.out.println("    if node == null: return baseCase");
        System.out.println("    leftResult = solve(node.left)     // postorder: children FIRST");
        System.out.println("    rightResult = solve(node.right)");
        System.out.println("    globalBest = combine(globalBest, leftResult, rightResult, node)  // side effect");
        System.out.println("    return localDpValue(leftResult, rightResult, node)  // what the PARENT needs");
        System.out.println();
        System.out.println("Diameter:            localDpValue = height,        combine = leftHeight+rightHeight");
        System.out.println("Max Path Sum:        localDpValue = best downward path, combine = full path through node");
        System.out.println("Tree Independent Set: localDpValue = (included, excluded) pair, combine = best overall");
    }
}
// OUTPUT:
// The Tree DP template:
// ...`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why must Tree DP be computed POSTORDER, not preorder?</td><td>A node's DP value depends on its CHILDREN's already-computed values - postorder guarantees children are fully processed before the parent needs their results</td></tr>
<tr class='text-center'><td>What's the time and space complexity of Diameter via Tree DP?</td><td>O(n) time (single postorder pass, every node visited once), O(h) space for the recursion call stack</td></tr>
<tr class='text-center'><td>How does the "return value for parent" differ from the "global answer tracked as a side effect"?</td><td>The return value is what the PARENT needs to compute ITS OWN local value (e.g. height, so the parent can compute height+1); the global side-effect variable tracks the best answer seen ANYWHERE in the tree, which the parent doesn't need and shouldn't propagate</td></tr>
</table>`
        }
    ]
};
