import { Topic } from '../coreJava';

export const treeAlgorithms: Topic = {
    id: 'tree-algorithms',
    name: 'Tree Algorithms',
    beginner: [
        {
            content: `A tree is a hierarchical data structure made of nodes, where each node has a value and links to child
nodes. A <strong>Binary Tree</strong> restricts each node to at most two children - "left" and "right". <br><br>
Traversal means visiting every node exactly once in some defined order. The three classic
<strong>Depth-First</strong> traversal orders for binary trees are: <br>
• <strong>Inorder</strong> (Left, Root, Right) <br>
• <strong>Preorder</strong> (Root, Left, Right) <br>
• <strong>Postorder</strong> (Left, Right, Root)`
        },
        {
            content: `<h3>1. Defining a Binary Tree Node</h3>`,
            codeExamples: [`public class TreeNode {
    int value;
    TreeNode left;
    TreeNode right;

    TreeNode(int value) {
        this.value = value;
    }

    public static void main(String[] args) {
        //        1
        //       / \\
        //      2   3
        TreeNode root = new TreeNode(1);
        root.left = new TreeNode(2);
        root.right = new TreeNode(3);

        System.out.println("Root: " + root.value);
        System.out.println("Left child: " + root.left.value);
        System.out.println("Right child: " + root.right.value);
    }
}
// OUTPUT:
// Root: 1
// Left child: 2
// Right child: 3`]
        },
        {
            content: `<h3>2. Inorder Traversal (Left, Root, Right)</h3>
For a Binary Search Tree, inorder traversal visits nodes in ascending sorted order.`,
            codeExamples: [`import java.util.ArrayList;
import java.util.List;

public class InorderTraversal {

    static class TreeNode {
        int value;
        TreeNode left, right;
        TreeNode(int value) { this.value = value; }
    }

    static void inorder(TreeNode node, List<Integer> result) {
        if (node == null) return;
        inorder(node.left, result);   // Left
        result.add(node.value);       // Root
        inorder(node.right, result);  // Right
    }

    public static void main(String[] args) {
        //        4
        //       / \\
        //      2   6
        //     / \\ / \\
        //    1  3 5  7
        TreeNode root = new TreeNode(4);
        root.left = new TreeNode(2);
        root.right = new TreeNode(6);
        root.left.left = new TreeNode(1);
        root.left.right = new TreeNode(3);
        root.right.left = new TreeNode(5);
        root.right.right = new TreeNode(7);

        List<Integer> result = new ArrayList<>();
        inorder(root, result);

        System.out.println("Inorder: " + result);
    }
}
// OUTPUT:
// Inorder: [1, 2, 3, 4, 5, 6, 7]`]
        },
        {
            content: `<h3>3. Preorder Traversal (Root, Left, Right)</h3>
Useful for creating a copy of the tree, or serializing its structure.`,
            codeExamples: [`import java.util.ArrayList;
import java.util.List;

public class PreorderTraversal {

    static class TreeNode {
        int value;
        TreeNode left, right;
        TreeNode(int value) { this.value = value; }
    }

    static void preorder(TreeNode node, List<Integer> result) {
        if (node == null) return;
        result.add(node.value);        // Root
        preorder(node.left, result);   // Left
        preorder(node.right, result);  // Right
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(4);
        root.left = new TreeNode(2);
        root.right = new TreeNode(6);
        root.left.left = new TreeNode(1);
        root.left.right = new TreeNode(3);

        List<Integer> result = new ArrayList<>();
        preorder(root, result);

        System.out.println("Preorder: " + result);
    }
}
// OUTPUT:
// Preorder: [4, 2, 1, 3, 6]`]
        },
        {
            content: `<h3>4. Postorder Traversal (Left, Right, Root)</h3>
Useful for safely deleting a tree (children before parent) or evaluating expression trees.`,
            codeExamples: [`import java.util.ArrayList;
import java.util.List;

public class PostorderTraversal {

    static class TreeNode {
        int value;
        TreeNode left, right;
        TreeNode(int value) { this.value = value; }
    }

    static void postorder(TreeNode node, List<Integer> result) {
        if (node == null) return;
        postorder(node.left, result);   // Left
        postorder(node.right, result);  // Right
        result.add(node.value);         // Root
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(4);
        root.left = new TreeNode(2);
        root.right = new TreeNode(6);
        root.left.left = new TreeNode(1);
        root.left.right = new TreeNode(3);

        List<Integer> result = new ArrayList<>();
        postorder(root, result);

        System.out.println("Postorder: " + result);
    }
}
// OUTPUT:
// Postorder: [1, 3, 2, 6, 4]`]
        }
    ],

    expert: [
        {
            content: `<h3>Level Order Traversal (Breadth-First, Using a Queue)</h3>
Unlike the three DFS-style traversals above, Level Order visits nodes level by level using a Queue -
the tree equivalent of Graph BFS.`,
            codeExamples: [`import java.util.*;

public class LevelOrderTraversal {

    static class TreeNode {
        int value;
        TreeNode left, right;
        TreeNode(int value) { this.value = value; }
    }

    static List<Integer> levelOrder(TreeNode root) {
        List<Integer> result = new ArrayList<>();
        if (root == null) return result;

        Queue<TreeNode> queue = new LinkedList<>();
        queue.add(root);

        while (!queue.isEmpty()) {
            TreeNode node = queue.poll();
            result.add(node.value);

            if (node.left != null) queue.add(node.left);
            if (node.right != null) queue.add(node.right);
        }
        return result;
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(4);
        root.left = new TreeNode(2);
        root.right = new TreeNode(6);
        root.left.left = new TreeNode(1);
        root.left.right = new TreeNode(3);
        root.right.left = new TreeNode(5);
        root.right.right = new TreeNode(7);

        System.out.println("Level order: " + levelOrder(root));
    }
}
// OUTPUT:
// Level order: [4, 2, 6, 1, 3, 5, 7]`]
        },
        {
            content: `<h3>Visualizing All Traversal Orders on One Tree</h3>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">          4
        /   \\
       2     6
      / \\   / \\
     1   3 5   7

Inorder   (L,Root,R): 1 2 3 4 5 6 7   <- sorted order for a BST
Preorder  (Root,L,R): 4 2 1 3 6 5 7   <- good for cloning/serializing
Postorder (L,R,Root): 1 3 2 5 7 6 4   <- good for safe deletion
Level Order (BFS):    4 2 6 1 3 5 7   <- good for level-by-level processing</pre>`
        },
        {
            content: `<h3>Computing Height (Max Depth) of a Binary Tree</h3>
A recursive tree algorithm: height of a node = 1 + max(height of left subtree, height of right subtree).`,
            codeExamples: [`public class TreeHeightDemo {

    static class TreeNode {
        int value;
        TreeNode left, right;
        TreeNode(int value) { this.value = value; }
    }

    static int height(TreeNode node) {
        if (node == null) return 0; // base case: empty tree has height 0
        return 1 + Math.max(height(node.left), height(node.right));
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(1);
        root.left = new TreeNode(2);
        root.right = new TreeNode(3);
        root.left.left = new TreeNode(4);
        root.left.left.left = new TreeNode(5);

        System.out.println("Height: " + height(root));
    }
}
// OUTPUT:
// Height: 4`]
        },
        {
            content: `<h3>Iterative Inorder Traversal (Using an Explicit Stack)</h3>
Recursive traversal is elegant but uses the call stack implicitly; production code sometimes needs an
iterative version to avoid deep-recursion stack overflow on very unbalanced trees.`,
            codeExamples: [`import java.util.*;

public class IterativeInorder {

    static class TreeNode {
        int value;
        TreeNode left, right;
        TreeNode(int value) { this.value = value; }
    }

    static List<Integer> inorder(TreeNode root) {
        List<Integer> result = new ArrayList<>();
        Deque<TreeNode> stack = new ArrayDeque<>();
        TreeNode current = root;

        while (current != null || !stack.isEmpty()) {
            while (current != null) {   // go as far left as possible
                stack.push(current);
                current = current.left;
            }
            current = stack.pop();      // visit
            result.add(current.value);
            current = current.right;    // then go right
        }
        return result;
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(4);
        root.left = new TreeNode(2);
        root.right = new TreeNode(6);
        root.left.left = new TreeNode(1);
        root.left.right = new TreeNode(3);

        System.out.println("Iterative Inorder: " + inorder(root));
    }
}
// OUTPUT:
// Iterative Inorder: [1, 2, 3, 4, 6]`]
        },
        {
            content: `<h3>Traversal Complexity Comparison</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Traversal</th><th>Order</th><th>Time</th><th>Space</th><th>Common Use</th></tr>
<tr class='text-center'><td>Inorder</td><td>Left, Root, Right</td><td>O(n)</td><td>O(h)</td><td>Sorted output of a BST</td></tr>
<tr class='text-center'><td>Preorder</td><td>Root, Left, Right</td><td>O(n)</td><td>O(h)</td><td>Cloning / serializing a tree</td></tr>
<tr class='text-center'><td>Postorder</td><td>Left, Right, Root</td><td>O(n)</td><td>O(h)</td><td>Deleting a tree, expression evaluation</td></tr>
<tr class='text-center'><td>Level Order</td><td>Level by level</td><td>O(n)</td><td>O(n)</td><td>Shortest path in unweighted tree, printing by level</td></tr>
</table>
n = number of nodes, h = height of the tree (recursion/stack depth).`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is the order of an inorder traversal?</td><td>Left subtree, then Root, then Right subtree</td></tr>
<tr><td>Why does inorder traversal of a BST give sorted output?</td><td>Because in a BST, every left subtree holds smaller values and every right subtree holds larger values than the root, and inorder visits left-root-right accordingly</td></tr>
<tr><td>Which traversal is best for safely deleting a tree?</td><td>Postorder - children are deleted before their parent</td></tr>
<tr><td>Which traversal is best for cloning/serializing a tree?</td><td>Preorder - root is recorded before its children, matching reconstruction order</td></tr>
<tr><td>What data structure powers Level Order traversal?</td><td>A Queue (FIFO), the same principle as BFS on a graph</td></tr>
<tr><td>What is the time and space complexity of any DFS-style tree traversal?</td><td>O(n) time, O(h) space where h is the tree height (worst case O(n) for a skewed tree)</td></tr>
<tr><td>How would you find the height of a binary tree?</td><td>Recursively: height(node) = 1 + max(height(left), height(right)), with height(null) = 0</td></tr>
<tr><td>How can you do inorder traversal without recursion?</td><td>Use an explicit Stack: push left children until null, pop and visit, then move to the right child</td></tr>
</table>`
        }
    ]
};
