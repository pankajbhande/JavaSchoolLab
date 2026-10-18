import { Topic } from '../../coreJava';

export const minimumPathSum: Topic = {
    id: 'dsa-dynamic-programming-minimum-path-sum',
    name: 'Minimum Path Sum',
    beginner: [
        {
            content: `<h4>Minimizing the Sum Along a Path</h4>
Same grid-DP framework as Unique Paths, with the combine operation changed from SUM to MIN: <code>dp[r][c] = grid[r][c] + min(dp[r-1][c], dp[r][c-1])</code> - each cell picks whichever of "from above" or "from left" gives the cheaper running total.`,
            codeExamples: [
                `package com.javaschoollab;

public class MinimumPathSumDemo {

    static int minPathSum(int[][] grid) {
        int rows = grid.length, cols = grid[0].length;
        int[][] dp = new int[rows][cols];

        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                if (r == 0 && c == 0) {
                    dp[r][c] = grid[r][c];
                } else if (r == 0) {
                    dp[r][c] = dp[r][c - 1] + grid[r][c];   // only option: from the left
                } else if (c == 0) {
                    dp[r][c] = dp[r - 1][c] + grid[r][c];   // only option: from above
                } else {
                    dp[r][c] = grid[r][c] + Math.min(dp[r - 1][c], dp[r][c - 1]);
                }
            }
        }
        return dp[rows - 1][cols - 1];
    }

    public static void main(String[] args) {
        int[][] grid = {
            {1, 3, 1},
            {1, 5, 1},
            {4, 2, 1}
        };
        System.out.println(minPathSum(grid));
    }
}
// OUTPUT:
// 7`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Reconstructing the Actual Minimum Path, Not Just Its Sum</h3>
To recover the actual PATH (not just its total cost), trace BACKWARD from the bottom-right: at each cell, check which neighbor (above or left) the DP value came from, and follow that trail back to the start.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class MinimumPathReconstructionDemo {

    static List<String> minPathWithTrace(int[][] grid) {
        int rows = grid.length, cols = grid[0].length;
        int[][] dp = new int[rows][cols];

        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                if (r == 0 && c == 0) dp[r][c] = grid[r][c];
                else if (r == 0) dp[r][c] = dp[r][c - 1] + grid[r][c];
                else if (c == 0) dp[r][c] = dp[r - 1][c] + grid[r][c];
                else dp[r][c] = grid[r][c] + Math.min(dp[r - 1][c], dp[r][c - 1]);
            }
        }

        // Trace backward from bottom-right to reconstruct the path
        List<String> path = new ArrayList<>();
        int r = rows - 1, c = cols - 1;
        while (r > 0 || c > 0) {
            path.add("(" + r + "," + c + ")");
            if (r == 0) c--;
            else if (c == 0) r--;
            else if (dp[r - 1][c] < dp[r][c - 1]) r--;
            else c--;
        }
        path.add("(0,0)");
        Collections.reverse(path);
        return path;
    }

    public static void main(String[] args) {
        int[][] grid = {
            {1, 3, 1},
            {1, 5, 1},
            {4, 2, 1}
        };
        System.out.println(minPathWithTrace(grid));
    }
}
// OUTPUT:
// [(0,0), (1,0), (2,0), (2,1), (2,2)]`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What's the space-optimized time/space complexity for Minimum Path Sum?</td><td>O(rows*cols) time, O(cols) space with a rolling 1D array - the same optimization applicable to Unique Paths transfers directly here</td></tr>
<tr class='text-center'><td>Why can path reconstruction only trace BACKWARD, not forward from the start?</td><td>Each dp[r][c] value doesn't record WHICH neighbor it came from during the forward pass; re-deriving that choice requires comparing dp[r-1][c] vs dp[r][c-1] again during a backward trace - or maintaining an explicit "came from" pointer array during the forward pass instead</td></tr>
<tr class='text-center'><td>How would this problem change if diagonal movement were also allowed?</td><td>The recurrence would need a third term: dp[r][c] = grid[r][c] + min(dp[r-1][c], dp[r][c-1], dp[r-1][c-1]) - same framework, one more neighbor to consider</td></tr>
</table>`
        }
    ]
};
