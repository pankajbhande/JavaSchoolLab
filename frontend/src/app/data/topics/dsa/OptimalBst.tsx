import { Topic } from '../../coreJava';

export const optimalBst: Topic = {
    id: 'dsa-dynamic-programming-optimal-bst',
    name: 'Optimal BST',
    beginner: [
        {
            content: `<h4>Building a BST That Minimizes Expected Search Cost</h4>
Given keys with KNOWN search frequencies, arrange them into a BST minimizing total weighted search cost (frequency &times; depth, summed over all keys) - keys searched more often should sit CLOSER to the root. Interval DP: try every key as the ROOT of a range, recursively optimizing the left and right subtrees.`,
            codeExamples: [
                `package com.javaschoollab;

public class OptimalBstDemo {

    static int optimalBST(int[] keys, int[] freq) {
        int n = keys.length;
        int[][] cost = new int[n][n];

        for (int i = 0; i < n; i++) cost[i][i] = freq[i];

        for (int len = 2; len <= n; len++) {
            for (int i = 0; i <= n - len; i++) {
                int j = i + len - 1;
                cost[i][j] = Integer.MAX_VALUE;

                int freqSum = sum(freq, i, j);   // every key in this range gets +1 depth from choosing ANY root

                for (int r = i; r <= j; r++) {
                    int leftCost = (r > i) ? cost[i][r - 1] : 0;
                    int rightCost = (r < j) ? cost[r + 1][j] : 0;
                    int totalCost = leftCost + rightCost + freqSum;
                    cost[i][j] = Math.min(cost[i][j], totalCost);
                }
            }
        }
        return cost[0][n - 1];
    }

    static int sum(int[] freq, int i, int j) {
        int total = 0;
        for (int k = i; k <= j; k++) total += freq[k];
        return total;
    }

    public static void main(String[] args) {
        int[] keys = {10, 12, 20};
        int[] freq = {34, 8, 50};
        System.out.println(optimalBST(keys, freq));
    }
}
// OUTPUT:
// 142`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why "+ freqSum" Correctly Accounts for the Depth Increase</h3>
Choosing ANY key <code>r</code> as the root of range <code>[i, j]</code> pushes EVERY OTHER key in that range one level DEEPER than it was within its own subtree's local optimum - adding the sum of ALL frequencies in the range (not just the root's) captures this uniform "+1 depth for everyone" effect in one term, without needing to individually track and re-add depth for every key separately.`,
            codeExamples: [
                `package com.javaschoollab;

public class WhyFreqSumWorksDemo {
    public static void main(String[] args) {
        System.out.println("cost[i][r-1] and cost[r+1][j] already represent the OPTIMAL cost");
        System.out.println("of the left and right subtrees AS IF THEY WERE STANDALONE TREES");
        System.out.println("(i.e., their own roots at depth 0 relative to themselves).");
        System.out.println();
        System.out.println("But once attached as children of root r, EVERY node in both");
        System.out.println("subtrees is actually ONE level deeper than that local optimum assumed.");
        System.out.println();
        System.out.println("Since cost = frequency * depth, and every key's depth increases by exactly 1,");
        System.out.println("total cost increases by exactly (sum of all frequencies in the range) -");
        System.out.println("which is precisely the freqSum term added once per candidate root choice.");
    }
}
// OUTPUT:
// cost[i][r-1] and cost[r+1][j] already represent the OPTIMAL cost
// of the left and right subtrees AS IF THEY WERE STANDALONE TREES
// ...`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What's the time complexity of Optimal BST?</td><td>O(n^3) naively (O(n^2) subproblems, each trying O(n) root choices, plus O(n) to sum frequencies each time) - improvable to O(n^2) by precomputing prefix sums of frequencies</td></tr>
<tr class='text-center'><td>How does Optimal BST relate to Huffman Coding?</td><td>Both minimize a weighted-depth objective (frequency times depth), but Huffman builds the tree BOTTOM-UP greedily with no ordering constraint, while Optimal BST must respect the KEYS' SORTED ORDER (it's a valid search tree), which is exactly why Optimal BST needs DP instead of a simple greedy merge</td></tr>
<tr class='text-center'><td>What real system design problem resembles Optimal BST?</td><td>Designing a decision tree or lookup structure where some keys are queried far more often than others - placing hot keys near the root minimizes average lookup cost, the same principle as caching frequently-accessed data closer to fast storage</td></tr>
</table>`
        }
    ]
};
