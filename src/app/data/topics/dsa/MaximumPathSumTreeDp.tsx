import { Topic } from '../../coreJava';

export const maximumPathSumTreeDp: Topic = {
    id: 'dsa-dynamic-programming-maximum-path-sum-tree-dp',
    name: 'Maximum Path Sum (Tree DP)',
    beginner: [
        {
            content: `<h4>Maximum Sum Path Between ANY Two Nodes</h4>
Unlike a root-to-leaf path, this path can START and END anywhere, possibly "bending" at some peak node. Each node returns the best DOWNWARD-only extension it can offer its parent (since a parent can only chain ONE side, not both), while separately tracking the GLOBAL best full path (which CAN use both children at a peak).`,
            codeExamples: [
                `package com.javaschoollab;

public class MaxPathSumDemo {

    static class TreeNode {
        int val;
        TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    static int maxPathSum = Integer.MIN_VALUE;

    // Returns the best DOWNWARD path starting at 'node' (usable by its parent)
    static int maxDownwardPath(TreeNode node) {
        if (node == null) return 0;

        // Negative contributions are worse than not extending at all - clamp to 0
        int leftGain = Math.max(0, maxDownwardPath(node.left));
        int rightGain = Math.max(0, maxDownwardPath(node.right));

        // The best FULL path THROUGH this node (can use both sides) - global answer only
        maxPathSum = Math.max(maxPathSum, node.val + leftGain + rightGain);

        // What this node can offer ITS PARENT - only ONE side, not both
        return node.val + Math.max(leftGain, rightGain);
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(-10);
        root.left = new TreeNode(9);
        root.right = new TreeNode(20);
        root.right.left = new TreeNode(15);
        root.right.right = new TreeNode(7);

        maxPathSum = Integer.MIN_VALUE;
        maxDownwardPath(root);
        System.out.println(maxPathSum);
    }
}
// OUTPUT:
// 42`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why the Return Value Differs from the Global Answer</h3>
This is the trickiest part of the problem: a path going UP through a node to its parent can only continue in ONE direction (a path can't branch), so the return value only offers the BETTER of left/right. But the GLOBAL best path, evaluated AT this node, CAN legitimately use both children simultaneously (forming a "peak" shape) - since that full path doesn't need to extend any further upward. Confusing these two different quantities is the single most common bug in this problem.`,
            codeExamples: [
                `package com.javaschoollab;

public class WhyTwoDifferentValuesDemo {
    public static void main(String[] args) {
        System.out.println("At node N with children L and R:");
        System.out.println();
        System.out.println("GLOBAL answer candidate at N: N.val + gain(L) + gain(R)");
        System.out.println("  -> a path shaped like:  L ... -> N -> ... R  (peaks AT N, uses BOTH sides)");
        System.out.println();
        System.out.println("RETURN value (what N offers its own parent P):");
        System.out.println("  N.val + max(gain(L), gain(R))");
        System.out.println("  -> P can only chain ONE more edge upward from N, so N can only");
        System.out.println("     contribute ONE of its two branches to whatever path P is building");
    }
}
// OUTPUT:
// At node N with children L and R:
// ...`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why clamp negative gains to 0 with Math.max(0, ...)?</td><td>Extending a path through a negative-contribution subtree would only REDUCE the total sum - it's always at least as good to simply not include that side at all, treating its contribution as 0</td></tr>
<tr class='text-center'><td>What's the time and space complexity?</td><td>O(n) time (one postorder pass), O(h) space for the recursion stack</td></tr>
<tr class='text-center'><td>What edge case does an all-negative tree test, and does this solution handle it?</td><td>maxPathSum must be seeded at Integer.MIN_VALUE (not 0), since a valid path must include at least ONE node - even the single least-negative node should be reported correctly as the answer, which this seeding correctly allows</td></tr>
</table>`
        }
    ]
};
