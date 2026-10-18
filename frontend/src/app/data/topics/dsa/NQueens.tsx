import { Topic } from '../../coreJava';

export const nQueens: Topic = {
    id: 'dsa-recursion-backtracking-n-queens',
    name: 'N-Queens',
    beginner: [
        {
            content: `<h4>Placing N Queens So None Attack Each Other</h4>
Place N queens on an N&times;N board with no two sharing a row, column, or diagonal. Since each ROW must have exactly one queen, the recursion places one queen per row, checking column and diagonal safety before committing - a textbook backtracking problem.`,
            codeExamples: [
                `package com.javaschoollab;

public class NQueensDemo {

    static int count = 0;

    static boolean isSafe(int[] queens, int row, int col) {
        for (int prevRow = 0; prevRow < row; prevRow++) {
            int prevCol = queens[prevRow];
            if (prevCol == col) return false;                            // same column
            if (Math.abs(prevCol - col) == Math.abs(prevRow - row)) return false;   // same diagonal
        }
        return true;
    }

    static void solve(int[] queens, int row, int n) {
        if (row == n) {
            count++;
            return;
        }
        for (int col = 0; col < n; col++) {
            if (isSafe(queens, row, col)) {
                queens[row] = col;
                solve(queens, row + 1, n);   // move to the NEXT row
                // no explicit undo needed - queens[row] gets overwritten next iteration
            }
        }
    }

    public static void main(String[] args) {
        int n = 8;
        count = 0;
        solve(new int[n], 0, n);
        System.out.println("Total solutions for " + n + "-Queens: " + count);
    }
}
// OUTPUT:
// Total solutions for 8-Queens: 92`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>O(1) Diagonal/Column Checks with Bitmasks</h3>
Checking "is this column/diagonal already used" with a loop over previous rows is O(n) per check, O(n) per row, O(n&sup2;) per solution attempt. Using THREE bitmasks (columns, "/" diagonals, "\\" diagonals) makes each safety check O(1) - a huge speedup for larger N, turning an already-exponential search into a much faster one.`,
            codeExamples: [
                `package com.javaschoollab;

public class NQueensBitmaskDemo {

    static int count = 0;

    // cols, diag1 ("\\" direction), diag2 ("/" direction) track occupied lines as bits
    static void solve(int row, int n, int cols, int diag1, int diag2) {
        if (row == n) {
            count++;
            return;
        }

        // Bits that are safe to place a queen at, in this row
        int availablePositions = ((1 << n) - 1) & ~(cols | diag1 | diag2);

        while (availablePositions != 0) {
            int position = availablePositions & (-availablePositions);   // isolate the lowest set bit
            availablePositions -= position;                              // remove it from options

            solve(row + 1, n,
                  cols | position,
                  (diag1 | position) << 1,
                  (diag2 | position) >> 1);
        }
    }

    public static void main(String[] args) {
        int n = 8;
        count = 0;
        solve(0, n, 0, 0, 0);
        System.out.println("Total solutions for " + n + "-Queens: " + count);
    }
}
// OUTPUT:
// Total solutions for 8-Queens: 92`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why is placing one queen per ROW guaranteed to work, without checking rows for conflicts?</td><td>The problem structure itself (one queen per row, row index used as the recursion depth) makes row conflicts impossible by construction - only column and diagonal conflicts need explicit checking</td></tr>
<tr class='text-center'><td>Why do the two diagonal bitmasks shift LEFT and RIGHT respectively as row increases?</td><td>A "\\" diagonal's column index increases by 1 each row down (shift left), while a "/" diagonal's column index decreases by 1 each row down (shift right) - the bitmask shift mirrors that column drift</td></tr>
<tr class='text-center'><td>What's N-Queens' time complexity, and can backtracking with pruning improve on brute force?</td><td>Brute force checking all N^N placements is far worse than backtracking's effective search, which prunes invalid branches immediately - still exponential in the worst case (no known polynomial solution), but pruning makes it tractable for reasonably sized boards</td></tr>
</table>`
        }
    ]
};
