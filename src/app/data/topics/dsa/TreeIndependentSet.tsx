import { Topic } from '../../coreJava';

export const treeIndependentSet: Topic = {
    id: 'dsa-dynamic-programming-tree-independent-set',
    name: 'Tree Independent Set',
    beginner: [
        {
            content: `<h4>House Robber III - Maximum Weight Independent Set on a Tree</h4>
Select a subset of nodes with MAXIMUM total value, such that no two selected nodes are directly connected (parent-child) - the tree version of House Robber. Each node returns TWO values to its parent: the best sum IF this node is included, and the best sum IF it's excluded.`,
            codeExamples: [
                `package com.javaschoollab;

public class TreeIndependentSetDemo {

    static class TreeNode {
        int val;
        TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    // Returns {includedSum, excludedSum} for the subtree rooted at 'node'
    static int[] solve(TreeNode node) {
        if (node == null) return new int[]{0, 0};

        int[] left = solve(node.left);
        int[] right = solve(node.right);

        // If we INCLUDE this node, children must be EXCLUDED (adjacency rule)
        int included = node.val + left[1] + right[1];

        // If we EXCLUDE this node, each child independently picks its own best (included OR excluded)
        int excluded = Math.max(left[0], left[1]) + Math.max(right[0], right[1]);

        return new int[]{included, excluded};
    }

    static int maxIndependentSet(TreeNode root) {
        int[] result = solve(root);
        return Math.max(result[0], result[1]);
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(3);
        root.left = new TreeNode(2);
        root.right = new TreeNode(3);
        root.left.right = new TreeNode(3);
        root.right.right = new TreeNode(1);

        System.out.println(maxIndependentSet(root));
    }
}
// OUTPUT:
// 7`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why "Excluded" Takes max(child.included, child.excluded) But "Included" Forces child.excluded</h3>
This asymmetry is the crux of the problem: including the CURRENT node FORCES both children to be excluded (they're directly adjacent - can't both be selected). But excluding the current node imposes NO constraint on the children relative to each other - each child is free to independently be included OR excluded, whichever gives IT the better local result.`,
            codeExamples: [
                `package com.javaschoollab;

public class InclusionExclusionLogicDemo {
    public static void main(String[] args) {
        System.out.println("If node N is INCLUDED in the selected set:");
        System.out.println("  - N's children CANNOT also be included (adjacency violation)");
        System.out.println("  - So we MUST use left[EXCLUDED] and right[EXCLUDED]");
        System.out.println();
        System.out.println("If node N is EXCLUDED from the selected set:");
        System.out.println("  - N's children have NO constraint from N itself");
        System.out.println("  - Each child independently picks whichever of its own two options is BETTER");
        System.out.println("  - So we use max(left[INCLUDED], left[EXCLUDED]) and same for right");
    }
}
// OUTPUT:
// If node N is INCLUDED in the selected set:
// ...`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What's the time and space complexity?</td><td>O(n) time (one postorder pass), O(h) space for recursion - each node does O(1) work combining its children's results</td></tr>
<tr class='text-center'><td>How does this generalize the array-based House Robber?</td><td>Array House Robber's "adjacent" means consecutive INDEX; Tree Independent Set's "adjacent" means direct parent-child EDGE - the core include/exclude decision logic is conceptually identical, just applied to a tree structure instead of a linear array</td></tr>
<tr class='text-center'><td>Could this be solved with memoization on a HashMap<TreeNode, int[]> instead of returning tuples?</td><td>Yes - functionally equivalent, though returning a tuple directly (as shown) avoids the overhead of hashing tree node references and is generally the cleaner idiomatic solution for this specific problem</td></tr>
</table>`
        }
    ]
};
