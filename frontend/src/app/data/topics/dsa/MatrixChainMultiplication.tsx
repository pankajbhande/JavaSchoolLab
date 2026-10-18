import { Topic } from '../../coreJava';

export const matrixChainMultiplication: Topic = {
    id: 'dsa-dynamic-programming-matrix-chain-multiplication',
    name: 'Matrix Chain Multiplication',
    beginner: [
        {
            content: `<h4>Finding the Cheapest Order to Multiply a Chain of Matrices</h4>
Matrix multiplication is associative but NOT commutative in cost - the number of scalar multiplications needed depends heavily on the PARENTHESIZATION order. <code>dp[i][j]</code> = minimum cost to multiply matrices i through j, trying every possible SPLIT point k as the "last" multiplication.`,
            codeExamples: [
                `package com.javaschoollab;

public class MatrixChainMultiplicationDemo {

    // dims[i-1] x dims[i] is the size of matrix i (1-indexed matrices)
    static int matrixChainOrder(int[] dims) {
        int n = dims.length - 1;   // number of matrices
        int[][] dp = new int[n + 1][n + 1];

        // Fill by increasing CHAIN LENGTH - shorter chains must be solved first
        for (int len = 2; len <= n; len++) {
            for (int i = 1; i <= n - len + 1; i++) {
                int j = i + len - 1;
                dp[i][j] = Integer.MAX_VALUE;

                for (int k = i; k < j; k++) {
                    int cost = dp[i][k] + dp[k + 1][j] + dims[i - 1] * dims[k] * dims[j];
                    dp[i][j] = Math.min(dp[i][j], cost);
                }
            }
        }
        return dp[1][n];
    }

    public static void main(String[] args) {
        // Matrices: 10x30, 30x5, 5x60 -> dims = {10, 30, 5, 60}
        int[] dims = {10, 30, 5, 60};
        System.out.println(matrixChainOrder(dims));
    }
}
// OUTPUT:
// 4500`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why the Cost Formula is dims[i-1] * dims[k] * dims[j]</h3>
When splitting the chain at k, everything from i to k multiplies into ONE matrix of size <code>dims[i-1] &times; dims[k]</code>, and everything from k+1 to j multiplies into ONE matrix of size <code>dims[k] &times; dims[j]</code>. Multiplying those two RESULTING matrices together costs exactly <code>dims[i-1] &times; dims[k] &times; dims[j]</code> scalar multiplications (standard matrix multiplication cost formula) - this FINAL combining step's cost is added on top of whatever it cost to build each half (<code>dp[i][k] + dp[k+1][j]</code>).`,
            codeExamples: [
                `package com.javaschoollab;

public class MatrixChainReconstructionDemo {

    static int[][] split;

    static int matrixChainOrder(int[] dims) {
        int n = dims.length - 1;
        int[][] dp = new int[n + 1][n + 1];
        split = new int[n + 1][n + 1];

        for (int len = 2; len <= n; len++) {
            for (int i = 1; i <= n - len + 1; i++) {
                int j = i + len - 1;
                dp[i][j] = Integer.MAX_VALUE;
                for (int k = i; k < j; k++) {
                    int cost = dp[i][k] + dp[k + 1][j] + dims[i - 1] * dims[k] * dims[j];
                    if (cost < dp[i][j]) {
                        dp[i][j] = cost;
                        split[i][j] = k;   // remember the BEST split point
                    }
                }
            }
        }
        return dp[1][n];
    }

    static String buildOrder(int i, int j) {
        if (i == j) return "M" + i;
        int k = split[i][j];
        return "(" + buildOrder(i, k) + " x " + buildOrder(k + 1, j) + ")";
    }

    public static void main(String[] args) {
        int[] dims = {10, 30, 5, 60};
        int minCost = matrixChainOrder(dims);
        System.out.println("Min cost: " + minCost);
        System.out.println("Optimal order: " + buildOrder(1, dims.length - 1));
    }
}
// OUTPUT:
// Min cost: 4500
// Optimal order: (M1 x (M2 x M3))`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What's the time and space complexity of Matrix Chain Multiplication?</td><td>O(n^3) time (O(n^2) subproblems, each trying O(n) split points), O(n^2) space for the DP table</td></tr>
<tr class='text-center'><td>Why must the DP fill by increasing chain LENGTH rather than a simple nested row/column loop?</td><td>dp[i][j] depends on dp[i][k] and dp[k+1][j] for various k - both are SHORTER sub-chains strictly contained within [i,j], so they must already be computed, which increasing-length filling guarantees</td></tr>
<tr class='text-center'><td>What's the relationship between Matrix Chain Multiplication and Optimal BST / Burst Balloons?</td><td>All three share the "interval DP" template: dp[i][j] combines results from a split point k within the interval, trying every possible k - the specific cost function differs, but the fill-by-increasing-length structure is identical across all three</td></tr>
</table>`
        }
    ]
};
