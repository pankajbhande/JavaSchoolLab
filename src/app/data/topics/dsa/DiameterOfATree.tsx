import { Topic } from '../../coreJava';

export const diameterOfATree: Topic = {
    id: 'dsa-trees-diameter-of-a-tree',
    name: 'Diameter of a Tree',
    beginner: [
        {
            content: `<h4>What is the Diameter?</h4>
The diameter is the length (number of edges) of the LONGEST path between any two nodes - and crucially, this path does NOT have to pass through the root. For any given node, the longest path THROUGH it equals <code>leftHeight + rightHeight</code>; the answer is the maximum of this value across every node.`,
            codeExamples: [
                `package com.javaschoollab;

public class DiameterOfTreeDemo {

    static class TreeNode {
        int val;
        TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    static int diameter = 0;

    static int height(TreeNode node) {
        if (node == null) return 0;

        int leftHeight = height(node.left);
        int rightHeight = height(node.right);

        // The longest path THROUGH this node - update the global answer if bigger
        diameter = Math.max(diameter, leftHeight + rightHeight);

        return 1 + Math.max(leftHeight, rightHeight);
    }

    static int diameterOfTree(TreeNode root) {
        diameter = 0;
        height(root);   // side effect: updates 'diameter' while computing height
        return diameter;
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(1);
        root.left = new TreeNode(2);
        root.right = new TreeNode(3);
        root.left.left = new TreeNode(4);
        root.left.right = new TreeNode(5);
        root.left.left.left = new TreeNode(6);

        System.out.println(diameterOfTree(root));
    }
}
// OUTPUT:
// 4`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why a Single Postorder Pass Solves It in O(n), Not O(n&sup2;)</h3>
A naive approach computes height separately at every node to check "leftHeight + rightHeight" - recomputing overlapping subtree heights repeatedly, O(n&sup2;). The trick shown above PIGGYBACKS the diameter check onto the height computation itself: since height() ALREADY visits every node exactly once bottom-up (postorder), updating a shared "best diameter seen so far" variable during that same pass costs nothing extra - O(n) total, one traversal doing two jobs.`,
            codeExamples: [
                `package com.javaschoollab;

public class DiameterReturningPathDemo {

    static class TreeNode {
        int val;
        TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    static int maxDiameter = 0;

    // A cleaner style: return height, but ALSO capture the diameter as a side effect -
    // no need for a separate helper class or array, a static field works fine here.
    static int heightAndUpdateDiameter(TreeNode node) {
        if (node == null) return 0;

        int left = heightAndUpdateDiameter(node.left);
        int right = heightAndUpdateDiameter(node.right);

        maxDiameter = Math.max(maxDiameter, left + right);

        return 1 + Math.max(left, right);
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(1);
        root.left = new TreeNode(2);
        root.left.left = new TreeNode(3);
        root.left.left.left = new TreeNode(4);

        maxDiameter = 0;
        heightAndUpdateDiameter(root);
        System.out.println("Diameter: " + maxDiameter);
    }
}
// OUTPUT:
// Diameter: 3`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why doesn't the diameter necessarily pass through the root?</td><td>The longest path could be entirely within one subtree, spanning two deep leaves that never touch the root - the algorithm must check EVERY node as a potential "peak" of the path, not just the root</td></tr>
<tr class='text-center'><td>What's the general technique this problem demonstrates?</td><td>"Compute X while also tracking a global answer Y as a side effect" - a very common tree pattern (also used for max path sum, and similar "best value anywhere in the tree" problems)</td></tr>
<tr class='text-center'><td>Is diameter measured in nodes or edges?</td><td>Conventionally edges (as in the code above) - though some problem statements define it in nodes (edges + 1); always confirm the exact definition expected in an interview</td></tr>
</table>`
        }
    ]
};
