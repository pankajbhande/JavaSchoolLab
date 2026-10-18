import { Topic } from '../../coreJava';

export const uniquePaths: Topic = {
    id: 'dsa-dynamic-programming-unique-paths',
    name: 'Unique Paths',
    beginner: [
        {
            content: `<h4>Space-Optimized Unique Paths - O(cols) Instead of O(rows &times; cols)</h4>
Since each row's DP values only depend on the PREVIOUS row (and the current row being built left to right), a single 1D array can be reused and updated in place - no need to store the whole 2D grid.`,
            codeExamples: [
                `package com.javaschoollab;

public class UniquePathsSpaceOptimizedDemo {

    static int uniquePaths(int rows, int cols) {
        int[] dp = new int[cols];
        java.util.Arrays.fill(dp, 1);   // first row: all 1s (only one way to reach each cell)

        for (int r = 1; r < rows; r++) {
            for (int c = 1; c < cols; c++) {
                dp[c] += dp[c - 1];   // dp[c] currently holds "from above"; add "from left"
            }
        }
        return dp[cols - 1];
    }

    public static void main(String[] args) {
        System.out.println(uniquePaths(3, 7));
    }
}
// OUTPUT:
// 28`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>The Closed-Form Combinatorial Solution - O(1) (Ignoring Factorial Cost)</h3>
Unique Paths has a direct combinatorial answer: reaching the bottom-right requires exactly <code>(rows-1)</code> "down" moves and <code>(cols-1)</code> "right" moves, in ANY order - the count is the binomial coefficient <code>C(rows+cols-2, rows-1)</code>. This avoids DP entirely for this specific (no-obstacle) variant.`,
            codeExamples: [
                `package com.javaschoollab;

public class UniquePathsCombinatoricsDemo {

    static long uniquePathsFormula(int rows, int cols) {
        // C(rows + cols - 2, rows - 1) computed iteratively to avoid overflow
        long result = 1;
        int totalMoves = rows + cols - 2;
        int downMoves = rows - 1;

        for (int i = 1; i <= downMoves; i++) {
            result = result * (totalMoves - downMoves + i) / i;
        }
        return result;
    }

    public static void main(String[] args) {
        System.out.println(uniquePathsFormula(3, 7));
    }
}
// OUTPUT:
// 28`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why does the space-optimized version reuse the SAME array for every row?</td><td>Before dp[c] is updated in the current row, it still holds the PREVIOUS row's value at that column - exactly "from above"; adding dp[c-1] (already updated for the current row) supplies "from left", so one array serves both roles correctly</td></tr>
<tr class='text-center'><td>Why doesn't the combinatorial formula work once obstacles are introduced?</td><td>Obstacles break the clean "any arrangement of R downs and C rights" symmetry - specific paths become invalid in ways that don't reduce to a simple binomial coefficient, forcing a return to DP</td></tr>
<tr class='text-center'><td>What's the risk of computing C(n, k) via factorials directly (n! / (k! * (n-k)!))?</td><td>Intermediate factorial values can overflow long very quickly for even moderately sized n - the iterative multiply-then-divide approach shown avoids this by keeping intermediate values smaller</td></tr>
</table>`
        }
    ]
};
