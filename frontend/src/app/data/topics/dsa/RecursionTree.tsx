import { Topic } from '../../coreJava';

export const recursionTree: Topic = {
    id: 'dsa-recursion-backtracking-recursion-tree',
    name: 'Recursion Tree',
    beginner: [
        {
            content: `<h4>Visualizing Recursive Calls as a Tree</h4>
Every recursive function's execution can be drawn as a TREE: the root is the initial call, and each node's children are the recursive calls IT makes. This "recursion tree" is exactly how to reason about time complexity - count the total number of nodes, or the work done at each node summed across the tree.

<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:12px 0;">
<svg viewBox="0 0 300 140" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:300px;height:auto;font-family:monospace">
  <text x="150" y="20" text-anchor="middle" font-size="12" fill="#9a3412">fib(4)</text>
  <text x="80" y="60" text-anchor="middle" font-size="12" fill="#065f46">fib(3)</text>
  <text x="220" y="60" text-anchor="middle" font-size="12" fill="#065f46">fib(2)</text>
  <text x="40" y="100" text-anchor="middle" font-size="11" fill="#6b7280">fib(2)</text>
  <text x="120" y="100" text-anchor="middle" font-size="11" fill="#6b7280">fib(1)</text>
  <text x="180" y="100" text-anchor="middle" font-size="11" fill="#6b7280">fib(1)</text>
  <text x="240" y="100" text-anchor="middle" font-size="11" fill="#6b7280">fib(0)</text>
  <line x1="140" y1="10" x2="90" y2="50" stroke="#9ca3af"/>
  <line x1="160" y1="10" x2="215" y2="50" stroke="#9ca3af"/>
  <line x1="75" y1="50" x2="45" y2="90" stroke="#9ca3af"/>
  <line x1="85" y1="50" x2="120" y2="90" stroke="#9ca3af"/>
  <line x1="215" y1="50" x2="180" y2="90" stroke="#9ca3af"/>
  <line x1="225" y1="50" x2="240" y2="90" stroke="#9ca3af"/>
</svg>
</div>`,
            codeExamples: [
                `package com.javaschoollab;

public class RecursionTreeDemo {

    static int callCount = 0;

    static int fib(int n) {
        callCount++;
        if (n <= 1) return n;
        return fib(n - 1) + fib(n - 2);   // TWO recursive calls -> branches in the tree
    }

    public static void main(String[] args) {
        callCount = 0;
        int result = fib(5);
        System.out.println("fib(5) = " + result);
        System.out.println("Total calls (tree nodes): " + callCount);
    }
}
// OUTPUT:
// fib(5) = 5
// Total calls (tree nodes): 15`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Using the Recursion Tree to Derive Time Complexity</h3>
Naive Fibonacci's recursion tree has TWO children per node, and the tree's height is n - a tree with branching factor 2 and height n has roughly 2&#8319; nodes, matching the well-known O(2&#8319;) complexity. This "draw the tree, count the nodes/work" method is the standard way to derive - or verify - a recursive algorithm's Big-O without needing the Master Theorem for simple cases.`,
            codeExamples: [
                `package com.javaschoollab;

public class RecursionTreeAnalysisDemo {
    public static void main(String[] args) {
        // Comparing call counts across different n confirms the exponential growth
        for (int n = 1; n <= 10; n++) {
            callCount = 0;
            fib(n);
            System.out.println("fib(" + n + ") makes " + callCount + " calls, roughly 2^" + n + " = " + (int) Math.pow(2, n));
        }
    }

    static int callCount = 0;

    static int fib(int n) {
        callCount++;
        if (n <= 1) return n;
        return fib(n - 1) + fib(n - 2);
    }
}
// OUTPUT (call counts, showing exponential growth):
// fib(1) makes 1 calls, roughly 2^1 = 2
// fib(2) makes 3 calls, roughly 2^2 = 4
// fib(3) makes 5 calls, roughly 2^3 = 8
// fib(4) makes 9 calls, roughly 2^4 = 16
// fib(5) makes 15 calls, roughly 2^5 = 32
// ... (actual counts are smaller than 2^n but grow at the same exponential RATE)`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>How does a recursion tree explain why memoized Fibonacci is O(n)?</td><td>Memoization prunes the tree drastically - once a subproblem's result is cached, its entire subtree of further recursive calls is skipped on subsequent encounters, collapsing the tree from exponential to linear size</td></tr>
<tr class='text-center'><td>What's the recursion tree's shape for a divide-and-conquer algorithm like Merge Sort?</td><td>A tree with branching factor 2, height log n, but with the WORK done at each level (not just node count) being what matters - O(n) work summed at every one of the log n levels gives O(n log n) total</td></tr>
<tr class='text-center'><td>How does the recursion tree relate to the call stack's space usage?</td><td>The call stack's maximum depth at any point corresponds to the recursion tree's HEIGHT along the current path being explored, not the tree's total node count - this is why space complexity is O(h), while time complexity relates to total nodes/work</td></tr>
</table>`
        }
    ]
};
