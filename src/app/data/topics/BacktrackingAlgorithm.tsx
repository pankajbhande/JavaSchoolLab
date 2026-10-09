import { Topic } from '../coreJava';

export const backtrackingAlgorithm: Topic = {
    id: 'backtracking',
    name: 'Backtracking',
    beginner: [
        {
            content: `Backtracking is a technique for solving problems by trying out possible options one at a time, and
<strong>undoing (backtracking)</strong> a choice as soon as it is discovered to be wrong, then trying the
next option. <br><br>
Think of it as exploring a maze: you walk forward, and if you hit a dead end, you step back to the last
junction and try a different path - instead of restarting from scratch. <br><br>
It is commonly used for: <br>
• Generating all subsets/permutations <br>
• The N-Queens puzzle <br>
• Sudoku solvers <br>
• Maze solving`
        },
        {
            content: `<h3>1. Generating All Subsets of a Set</h3>
For each element, we make two choices: include it, or don't. Backtracking explores both branches and
undoes the choice after exploring it.`,
            codeExamples: [`import java.util.ArrayList;
import java.util.List;

public class SubsetsDemo {

    static void generateSubsets(int[] nums, int index, List<Integer> current, List<List<Integer>> result) {
        if (index == nums.length) {
            result.add(new ArrayList<>(current)); // record a complete subset
            return;
        }

        // Choice 1: exclude nums[index]
        generateSubsets(nums, index + 1, current, result);

        // Choice 2: include nums[index]
        current.add(nums[index]);
        generateSubsets(nums, index + 1, current, result);
        current.remove(current.size() - 1); // BACKTRACK: undo the choice
    }

    public static void main(String[] args) {
        int[] nums = {1, 2, 3};
        List<List<Integer>> result = new ArrayList<>();
        generateSubsets(nums, 0, new ArrayList<>(), result);

        System.out.println(result);
    }
}
// OUTPUT:
// [[], [3], [2], [2, 3], [1], [1, 3], [1, 2], [1, 2, 3]]`]
        },
        {
            content: `<h3>2. The Core Backtracking Pattern</h3>
Every backtracking solution follows this shape: <br><br>
1. <strong>Choose</strong> - make a choice (add to current path). <br>
2. <strong>Explore</strong> - recurse with that choice in place. <br>
3. <strong>Un-choose (backtrack)</strong> - remove the choice before trying the next option. <br><br>
This "choose, explore, un-choose" pattern is exactly what you saw with <code>current.add(...)</code> and
<code>current.remove(...)</code> in the subsets example above.`
        }
    ],

    expert: [
        {
            content: `<h3>The N-Queens Problem</h3>
Place N queens on an N x N chessboard so that no two queens attack each other (no shared row, column, or
diagonal). Backtracking places queens column by column, and backtracks whenever a placement is unsafe.`,
            codeExamples: [`public class NQueensDemo {

    static int count = 0;

    static boolean isSafe(int[] board, int row, int col) {
        for (int i = 0; i < col; i++) {
            int placedRow = board[i];
            if (placedRow == row || Math.abs(placedRow - row) == Math.abs(i - col)) {
                return false; // same row or same diagonal
            }
        }
        return true;
    }

    static void solve(int[] board, int col, int n) {
        if (col == n) {
            count++; // found one valid full placement
            return;
        }

        for (int row = 0; row < n; row++) {
            if (isSafe(board, row, col)) {
                board[col] = row;        // CHOOSE
                solve(board, col + 1, n); // EXPLORE
                // board[col] gets overwritten next iteration - implicit UN-CHOOSE
            }
        }
    }

    public static void main(String[] args) {
        int n = 4;
        int[] board = new int[n];
        solve(board, 0, n);

        System.out.println("Total solutions for " + n + "-Queens: " + count);
    }
}
// OUTPUT:
// Total solutions for 4-Queens: 2`]
        },
        {
            content: `<h3>Visualizing the Backtracking Search Tree (N=4, first 2 columns)</h3>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">col=0: try row 0 -----> col=1: row 0 UNSAFE (same row)
                                       row 1 UNSAFE (diagonal)
                                       row 2 SAFE -> continue to col=2 ...
                                       row 3 SAFE -> continue to col=2 ...

col=0: try row 1 -----> col=1: row 0 UNSAFE (diagonal)
                                       ... (backtrack further down)

Whenever no row is safe at a column, we backtrack to the previous
column and try its next candidate row.</pre>`
        },
        {
            content: `<h3>Printing One N-Queens Solution as a Board</h3>`,
            codeExamples: [`public class NQueensPrintSolution {

    static boolean isSafe(int[] board, int row, int col) {
        for (int i = 0; i < col; i++) {
            if (board[i] == row || Math.abs(board[i] - row) == Math.abs(i - col)) {
                return false;
            }
        }
        return true;
    }

    static boolean solve(int[] board, int col, int n) {
        if (col == n) return true;

        for (int row = 0; row < n; row++) {
            if (isSafe(board, row, col)) {
                board[col] = row;
                if (solve(board, col + 1, n)) {
                    return true; // stop at first solution found
                }
                // implicit backtrack: loop continues to next row
            }
        }
        return false;
    }

    public static void main(String[] args) {
        int n = 4;
        int[] board = new int[n];
        solve(board, 0, n);

        for (int col = 0; col < n; col++) {
            for (int row = 0; row < n; row++) {
                System.out.print(board[col] == row ? "Q " : ". ");
            }
            System.out.println();
        }
    }
}
// OUTPUT:   (the search returns the FIRST solution, board = [1,3,0,2])
// . Q . .
// . . . Q
// Q . . .
// . . Q .`]
        },
        {
            content: `<h3>Backtracking Complexity</h3>
Backtracking is fundamentally exhaustive search with early pruning - it explores a decision tree but
cuts off (prunes) branches that cannot lead to a valid solution, which is far better than brute force but
still exponential in the worst case.<br><br>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Problem</th><th>Naive Brute Force</th><th>With Backtracking Pruning</th></tr>
<tr class='text-center'><td>N-Queens</td><td>O(N^N)</td><td>Much smaller in practice due to isSafe() pruning</td></tr>
<tr class='text-center'><td>Subsets of n elements</td><td>O(2^n)</td><td>O(2^n) (all subsets are valid, no pruning possible)</td></tr>
<tr class='text-center'><td>Sudoku (9x9)</td><td>9^81 (astronomical)</td><td>Feasible in milliseconds with constraint pruning</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is backtracking?</td><td>A systematic trial-and-undo search technique that explores choices and abandons ("backtracks" from) any that cannot lead to a valid solution</td></tr>
<tr><td>How is backtracking different from plain recursion?</td><td>Backtracking explicitly undoes a choice (state change) after exploring it, so the same shared state can be reused for the next branch</td></tr>
<tr><td>What is "pruning" in backtracking?</td><td>Skipping branches early once you know they cannot possibly succeed (e.g., isSafe() check in N-Queens)</td></tr>
<tr><td>Name three classic backtracking problems.</td><td>N-Queens, Sudoku solver, subset/permutation generation, maze/path-finding</td></tr>
<tr><td>What is the time complexity of generating all subsets of n elements?</td><td>O(2^n) - every element is either included or excluded</td></tr>
<tr><td>Why does the N-Queens solution overwrite board[col] instead of removing it explicitly?</td><td>Because the array slot is simply reassigned in the next loop iteration - that reassignment itself acts as the "un-choose" step</td></tr>
<tr><td>Is backtracking the same as Dynamic Programming?</td><td>No - DP reuses overlapping sub-problem results, while backtracking explores and discards paths without memoizing results</td></tr>
</table>`
        }
    ]
};
