import { Topic } from '../../coreJava';

export const serializeDeserializeTree: Topic = {
    id: 'dsa-trees-serialize-deserialize-a-tree',
    name: 'Serialize / Deserialize a Tree',
    beginner: [
        {
            content: `<h4>Converting a Tree to a String and Back</h4>
Serialization turns a tree into a string (for storage/network transfer); deserialization rebuilds the exact same tree from that string. Preorder traversal, with an explicit marker for <code>null</code> children, makes this straightforward - the null markers preserve the tree's exact shape, not just its values.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.*;

public class SerializeDeserializeDemo {

    static class TreeNode {
        int val;
        TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    static void serializeHelper(TreeNode node, StringBuilder sb) {
        if (node == null) {
            sb.append("null,");
            return;
        }
        sb.append(node.val).append(",");
        serializeHelper(node.left, sb);
        serializeHelper(node.right, sb);
    }

    static String serialize(TreeNode root) {
        StringBuilder sb = new StringBuilder();
        serializeHelper(root, sb);
        return sb.toString();
    }

    static TreeNode deserializeHelper(Deque<String> tokens) {
        String token = tokens.poll();
        if (token.equals("null")) return null;

        TreeNode node = new TreeNode(Integer.parseInt(token));
        node.left = deserializeHelper(tokens);    // rebuild left FIRST (preorder shape)
        node.right = deserializeHelper(tokens);
        return node;
    }

    static TreeNode deserialize(String data) {
        Deque<String> tokens = new ArrayDeque<>(Arrays.asList(data.split(",")));
        return deserializeHelper(tokens);
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(1);
        root.left = new TreeNode(2);
        root.right = new TreeNode(3);
        root.right.left = new TreeNode(4);
        root.right.right = new TreeNode(5);

        String data = serialize(root);
        System.out.println("Serialized: " + data);

        TreeNode rebuilt = deserialize(data);
        System.out.println("Rebuilt root: " + rebuilt.val + ", right.left: " + rebuilt.right.left.val);
    }
}
// OUTPUT:
// Serialized: 1,2,null,null,3,4,null,null,5,null,null,
// Rebuilt root: 1, right.left: 4`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why Preorder + Null Markers Preserve the EXACT Shape</h3>
Preorder ALONE (without null markers) is ambiguous - multiple different tree shapes can share the same preorder sequence. Adding explicit <code>null</code> tokens removes that ambiguity: deserialization always knows exactly when a subtree ends, since a null token is an unambiguous "stop" signal, letting the recursive rebuild consume tokens in lockstep with how they were written.`,
            codeExamples: [
                `package com.javaschoollab;

public class WhyNullMarkersMatterDemo {
    public static void main(String[] args) {
        // Two DIFFERENT trees can share the same plain preorder sequence [1, 2, 3]:
        //   Tree A: 1 -> left=2 -> left=3           (a left-skewed chain)
        //   Tree B: 1 -> left=2, right=3             (a balanced-looking shape)
        // Both produce preorder "1, 2, 3" WITHOUT null markers - ambiguous!
        //
        // WITH null markers:
        //   Tree A: 1,2,3,null,null,null,null
        //   Tree B: 1,2,null,null,3,null,null
        // Completely different strings - unambiguous reconstruction.
        System.out.println("Plain preorder alone cannot distinguish all tree shapes.");
        System.out.println("Null markers make the serialization a bijection: one string <-> one exact tree.");
    }
}
// OUTPUT:
// Plain preorder alone cannot distinguish all tree shapes.
// Null markers make the serialization a bijection: one string <-> one exact tree.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why is plain preorder (without null markers) ambiguous for reconstruction?</td><td>Without explicit "no child here" markers, the same value sequence can correspond to multiple different tree shapes - there's no way to tell where one subtree ends and another begins</td></tr>
<tr class='text-center'><td>Could level-order (BFS) be used instead of preorder for serialization?</td><td>Yes - BFS with null markers works equally well (this is what LeetCode's "Codec" problem commonly uses), as long as nulls are still explicitly recorded to preserve shape</td></tr>
<tr class='text-center'><td>What's the time and space complexity of serialize/deserialize?</td><td>O(n) time for both directions (every node/null visited once), O(n) space for the resulting string and the token queue during deserialization</td></tr>
</table>`
        }
    ]
};
