import { Topic } from '../../coreJava';

export const sudokuSolver: Topic = {
    id: 'dsa-recursion-backtracking-sudoku-solver',
    name: 'Sudoku Solver',
    beginner: [
        {
            content: `<h4>Filling a 9&times;9 Grid with Constraint-Checked Backtracking</h4>
For each empty cell, try digits 1-9; a digit is valid only if it doesn't already appear in the same ROW, COLUMN, or 3&times;3 BOX. Place a valid digit, recurse to the next empty cell, and backtrack (undo) if that path leads to a dead end.`,
            codeExamples: [
                `package com.javaschoollab;

public class SudokuSolverDemo {

    static boolean isValid(char[][] board, int row, int col, char digit) {
        for (int i = 0; i < 9; i++) {
            if (board[row][i] == digit) return false;                                    // row
            if (board[i][col] == digit) return false;                                    // column
            int boxRow = 3 * (row / 3) + i / 3, boxCol = 3 * (col / 3) + i % 3;
            if (board[boxRow][boxCol] == digit) return false;                             // 3x3 box
        }
        return true;
    }

    static boolean solve(char[][] board) {
        for (int row = 0; row < 9; row++) {
            for (int col = 0; col < 9; col++) {
                if (board[row][col] != '.') continue;   // already filled

                for (char digit = '1'; digit <= '9'; digit++) {
                    if (isValid(board, row, col, digit)) {
                        board[row][col] = digit;

                        if (solve(board)) return true;   // continue with the rest of the board

                        board[row][col] = '.';   // backtrack - this digit didn't lead to a solution
                    }
                }
                return false;   // no digit 1-9 works here - dead end, backtrack further up
            }
        }
        return true;   // no empty cells left - solved!
    }

    public static void main(String[] args) {
        char[][] board = {
            {'5','3','.','.','7','.','.','.','.'},
            {'6','.','.','1','9','5','.','.','.'},
            {'.','9','8','.','.','.','.','6','.'},
            {'8','.','.','.','6','.','.','.','3'},
            {'4','.','.','8','.','3','.','.','1'},
            {'7','.','.','.','2','.','.','.','6'},
            {'.','6','.','.','.','.','2','8','.'},
            {'.','.','.','4','1','9','.','.','5'},
            {'.','.','.','.','8','.','.','7','9'}
        };
        solve(board);
        System.out.println(board[0][2] + " " + board[0][3]);   // two of the previously '.' cells
    }
}
// OUTPUT:
// 4 6`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Design Is What Makes Backtracking Correct Here</h3>
The critical detail: after trying a digit and recursing, if the recursive call returns <code>false</code> (couldn't complete the board), the cell is RESET to <code>'.'</code> before trying the next digit. Skipping this reset would leave stale state polluting later attempts. Equally important: <code>return false</code> at the END of the digit loop (no valid digit worked) is what SIGNALS the failure back up to the CALLER, triggering that caller's own backtrack - this is the mechanism that lets failure propagate correctly through many levels of recursion.`,
            codeExamples: [
                `package com.javaschoollab;

public class BacktrackFailurePropagationDemo {
    public static void main(String[] args) {
        System.out.println("Backtracking failure propagation, step by step:");
        System.out.println("1. Cell A tries digit 5, recurses deeper.");
        System.out.println("2. Several cells later, cell Z finds NO valid digit works - returns false.");
        System.out.println("3. That false bubbles back up through every intermediate recursive call.");
        System.out.println("4. Each intermediate cell, upon seeing false, resets ITS digit and tries the next one.");
        System.out.println("5. Eventually cell A itself may need to try digit 6 instead of 5, and so on.");
        System.out.println();
        System.out.println("Without resetting board[row][col] = '.' on failure, stale digits would");
        System.out.println("incorrectly block otherwise-valid future placements.");
    }
}
// OUTPUT:
// Backtracking failure propagation, step by step:
// 1. Cell A tries digit 5, recurses deeper.
// 2. Several cells later, cell Z finds NO valid digit works - returns false.
// 3. That false bubbles back up through every intermediate recursive call.
// 4. Each intermediate cell, upon seeing false, resets ITS digit and tries the next one.
// 5. Eventually cell A itself may need to try digit 6 instead of 5, and so on.
//
// Without resetting board[row][col] = '.' on failure, stale digits would
// incorrectly block otherwise-valid future placements.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why is isValid() checked O(9) times per digit attempt instead of maintained incrementally?</td><td>The simple version re-scans row/column/box each time for clarity; a faster implementation maintains boolean[9][9] arrays for rows, columns, and boxes, updated incrementally, turning each check into O(1)</td></tr>
<tr class='text-center'><td>What makes Sudoku solving exponential in the worst case, despite the constraints?</td><td>With few pre-filled cells, many digits remain individually "valid" at each step, so the search tree still branches significantly before constraints eliminate most paths - though in practice, constraint propagation prunes the search dramatically faster than a naive worst-case bound suggests</td></tr>
<tr class='text-center'><td>How could you speed up the search with a smarter cell-selection heuristic?</td><td>Instead of always scanning row-by-row, choose the EMPTY cell with the FEWEST valid candidate digits first (minimum remaining values heuristic) - this fails faster on bad branches and succeeds faster on good ones</td></tr>
</table>`
        }
    ]
};
