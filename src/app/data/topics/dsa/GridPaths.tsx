import { Topic } from '../../coreJava';

export const gridPaths: Topic = {
    id: 'dsa-dynamic-programming-grid-paths',
    name: 'Grid Paths',
    beginner: [
        {
            content: `<h4>The General 2D DP Grid Pattern</h4>
Many grid problems (unique paths, min path sum, max path sum, obstacle paths) share ONE shape: <code>dp[r][c]</code> depends only on <code>dp[r-1][c]</code> (from above) and <code>dp[r][c-1]</code> (from the left) - since movement is restricted to right/down. Fill the grid row by row, left to right, and each cell's answer is ready by the time you need it.`,
            codeExamples: [
                `package com.javaschoollab;

public class GridPathsFrameworkDemo {

    // Counts paths from top-left to bottom-right, moving only right or down
    static int countPaths(int rows, int cols) {
        int[][] dp = new int[rows][cols];

        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                if (r == 0 || c == 0) {
                    dp[r][c] = 1;   // only ONE way to reach the first row/column: go straight
                } else {
                    dp[r][c] = dp[r - 1][c] + dp[r][c - 1];   // combine paths from above and left
                }
            }
        }
        return dp[rows - 1][cols - 1];
    }

    public static void main(String[] args) {
        System.out.println(countPaths(3, 7));
    }
}
// OUTPUT:
// 28`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Grid Paths With Obstacles</h3>
A blocked cell simply has ZERO paths reaching it - it doesn't contribute to any cell that depends on it. This single change (checking for an obstacle and setting <code>dp[r][c] = 0</code>) adapts the same framework to a whole new variant without restructuring anything.`,
            codeExamples: [
                `package com.javaschoollab;

public class GridPathsWithObstaclesDemo {

    static int countPathsWithObstacles(int[][] grid) {
        int rows = grid.length, cols = grid[0].length;
        int[][] dp = new int[rows][cols];

        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                if (grid[r][c] == 1) {
                    dp[r][c] = 0;   // obstacle - unreachable
                    continue;
                }
                if (r == 0 && c == 0) {
                    dp[r][c] = 1;
                } else {
                    int fromAbove = (r > 0) ? dp[r - 1][c] : 0;
                    int fromLeft = (c > 0) ? dp[r][c - 1] : 0;
                    dp[r][c] = fromAbove + fromLeft;
                }
            }
        }
        return dp[rows - 1][cols - 1];
    }

    public static void main(String[] args) {
        int[][] grid = {
            {0, 0, 0},
            {0, 1, 0},   // obstacle in the middle
            {0, 0, 0}
        };
        System.out.println(countPathsWithObstacles(grid));
    }
}
// OUTPUT:
// 2`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why can dp[r][c] be computed knowing only dp[r-1][c] and dp[r][c-1]?</td><td>Movement is restricted to right/down only, so every path to (r,c) must arrive from EITHER directly above or directly to the left - no other cell can contribute</td></tr>
<tr class='text-center'><td>What's the time and space complexity, and how can space be reduced?</td><td>O(rows*cols) time and space naively; space reduces to O(cols) since each row only needs the PREVIOUS row's values - a 1D rolling array suffices</td></tr>
<tr class='text-center'><td>How would you adapt this framework to MAXIMIZE collected value along the path instead of counting paths?</td><td>Replace the sum (dp[r-1][c] + dp[r][c-1]) with a max (Math.max(dp[r-1][c], dp[r][c-1]) + grid[r][c]) - same framework, different combining operation, exactly the shift shown between Grid Paths and Minimum/Maximum Path Sum</td></tr>
</table>`
        }
    ]
};
