import { Topic } from '../../coreJava';

export const heightDepth: Topic = {
    id: 'dsa-trees-height-depth',
    name: 'Height / Depth',
    beginner: [
        {
            content: `<h4>Height vs Depth - Commonly Confused Terms</h4>
<ul>
<li><b>Depth of a node</b> - the number of edges from the ROOT down to that node. The root has depth 0.</li>
<li><b>Height of a node</b> - the number of edges on the LONGEST path from that node DOWN to a leaf. A leaf has height 0.</li>
<li><b>Height of the tree</b> - the height of the root, i.e. the longest root-to-leaf path.</li>
</ul>`,
            codeExamples: [
                `package com.javaschoollab;

public class HeightDepthDemo {

    static class TreeNode {
        int val;
        TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    // Height: longest path DOWN to a leaf (bottom-up)
    static int height(TreeNode node) {
        if (node == null) return -1;   // convention: empty tree has height -1, single node has height 0
        return 1 + Math.max(height(node.left), height(node.right));
    }

    // Depth of a SPECIFIC target node: distance FROM the root (top-down)
    static int depth(TreeNode node, int target, int currentDepth) {
        if (node == null) return -1;
        if (node.val == target) return currentDepth;
        int leftResult = depth(node.left, target, currentDepth + 1);
        if (leftResult != -1) return leftResult;
        return depth(node.right, target, currentDepth + 1);
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(1);
        root.left = new TreeNode(2);
        root.left.left = new TreeNode(4);

        System.out.println("Tree height  : " + height(root));
        System.out.println("Depth of 4   : " + depth(root, 4, 0));
    }
}
// OUTPUT:
// Tree height  : 2
// Depth of 4   : 2`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why Height is Computed Bottom-Up but Depth is Computed Top-Down</h3>
Height of a node fundamentally depends on information from BELOW it (how far down its subtrees extend) - so it's naturally computed via POSTORDER recursion (process children first, combine at the parent). Depth depends on information from ABOVE (how far the root is) - so it's naturally computed via PREORDER recursion, passing an accumulating distance DOWN as a parameter.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.HashMap;
import java.util.Map;

public class DepthMapDemo {

    static class TreeNode {
        int val;
        TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    // Records EVERY node's depth in one pass - useful for problems needing
    // repeated depth lookups (e.g. LCA via depth comparison)
    static void recordDepths(TreeNode node, int depth, Map<TreeNode, Integer> depths) {
        if (node == null) return;
        depths.put(node, depth);              // top-down: depth is passed IN as a parameter
        recordDepths(node.left, depth + 1, depths);
        recordDepths(node.right, depth + 1, depths);
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(1);
        root.left = new TreeNode(2);
        root.right = new TreeNode(3);
        root.left.left = new TreeNode(4);

        Map<TreeNode, Integer> depths = new HashMap<>();
        recordDepths(root, 0, depths);

        System.out.println("Root depth       : " + depths.get(root));
        System.out.println("root.left depth  : " + depths.get(root.left));
        System.out.println("Deepest node     : " + depths.get(root.left.left));
    }
}
// OUTPUT:
// Root depth       : 0
// root.left depth  : 1
// Deepest node     : 2`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What's the height of an empty tree, and of a single-node tree?</td><td>By the edge-counting convention: empty tree has height -1, a single node (a leaf, no edges to descend) has height 0</td></tr>
<tr class='text-center'><td>Why does computing depth of a specific target require a parameter, while height doesn't?</td><td>Depth needs to know "how far have I traveled from the root so far", which only makes sense as information flowing DOWN through recursive calls; height is purely a property of the subtree rooted at each node, computable bottom-up without external context</td></tr>
<tr class='text-center'><td>How does "height" relate to the O(log n) vs O(n) BST operation complexity discussion?</td><td>BST operation cost is literally bounded by the tree's HEIGHT - this is why balanced-tree height (O(log n)) vs skewed-tree height (O(n)) directly determines search/insert/delete performance</td></tr>
</table>`
        }
    ]
};
