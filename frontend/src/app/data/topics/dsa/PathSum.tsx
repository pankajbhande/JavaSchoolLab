import { Topic } from '../../coreJava';

export const pathSum: Topic = {
    id: 'dsa-trees-path-sum',
    name: 'Path Sum',
    beginner: [
        {
            content: `<h4>Does a Root-to-Leaf Path Sum to a Target?</h4>
Classic recursive tree problem: at each node, subtract its value from the remaining target and recurse into children - a LEAF is a valid answer only if the remaining target becomes exactly 0 there.`,
            codeExamples: [
                `package com.javaschoollab;

public class PathSumDemo {

    static class TreeNode {
        int val;
        TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    static boolean hasPathSum(TreeNode node, int target) {
        if (node == null) return false;

        // A leaf: check if the remaining target is exactly used up
        if (node.left == null && node.right == null) {
            return target == node.val;
        }

        int remaining = target - node.val;
        return hasPathSum(node.left, remaining) || hasPathSum(node.right, remaining);
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(5);
        root.left = new TreeNode(4);
        root.right = new TreeNode(8);
        root.left.left = new TreeNode(11);
        root.left.left.left = new TreeNode(7);
        root.left.left.right = new TreeNode(2);

        System.out.println(hasPathSum(root, 22));   // 5+4+11+2 = 22
        System.out.println(hasPathSum(root, 100));
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
            content: `<h3>Finding ALL Root-to-Leaf Paths That Match - Backtracking</h3>
The follow-up asks to RETURN every matching path, not just say yes/no - this needs backtracking: add the current node to a running path before recursing, and REMOVE it after recursing (regardless of the outcome), so the same list can be reused across all branches without leaking state between them.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.ArrayList;
import java.util.List;

public class AllPathSumsDemo {

    static class TreeNode {
        int val;
        TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    static List<List<Integer>> findAllPaths(TreeNode root, int target) {
        List<List<Integer>> result = new ArrayList<>();
        backtrack(root, target, new ArrayList<>(), result);
        return result;
    }

    static void backtrack(TreeNode node, int remaining, List<Integer> path, List<List<Integer>> result) {
        if (node == null) return;

        path.add(node.val);   // choose: add this node to the current path

        if (node.left == null && node.right == null && remaining == node.val) {
            result.add(new ArrayList<>(path));   // COPY, since 'path' keeps mutating
        } else {
            backtrack(node.left, remaining - node.val, path, result);
            backtrack(node.right, remaining - node.val, path, result);
        }

        path.remove(path.size() - 1);   // un-choose: backtrack before returning to the parent
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(5);
        root.left = new TreeNode(4);
        root.right = new TreeNode(8);
        root.left.left = new TreeNode(11);
        root.left.left.left = new TreeNode(7);
        root.left.left.right = new TreeNode(2);

        System.out.println(findAllPaths(root, 22));
    }
}
// OUTPUT:
// [[5, 4, 11, 2]]`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why must path.remove() happen even when a match WAS found?</td><td>The path list is shared and mutated across the entire traversal - forgetting to remove would leave stale entries when the recursion returns to try a sibling branch, corrupting every subsequent path</td></tr>
<tr class='text-center'><td>Why copy the path (new ArrayList<>(path)) when adding it to the result?</td><td>The same 'path' list object keeps being mutated as the search continues; storing a reference to it directly would mean every result entry ends up pointing at the SAME final (wrong) state once backtracking finishes</td></tr>
<tr class='text-center'><td>How would "Path Sum III" (paths that don't need to start at the root) differ?</td><td>It needs prefix-sum + HashMap at every node (similar to Subarray Sum Equals K), tracking running sums along the root-to-current path and checking if (currentSum - target) was seen earlier ANYWHERE on that path</td></tr>
</table>`
        }
    ]
};
