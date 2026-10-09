import { Topic } from '../../coreJava';

export const wordSearchBacktracking: Topic = {
    id: 'dsa-recursion-backtracking-word-search-backtracking',
    name: 'Word Search (Backtracking)',
    beginner: [
        {
            content: `<h4>Finding One Word in a Letter Grid</h4>
Given a grid of letters and a single target word, check if the word can be formed by a path of ADJACENT cells (no cell reused within one path). DFS from every starting cell, backtracking (temporarily marking cells visited, then un-marking) whenever a path doesn't pan out.`,
            codeExamples: [
                `package com.javaschoollab;

public class WordSearchDemo {

    static boolean exist(char[][] board, String word) {
        int rows = board.length, cols = board[0].length;

        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                if (dfs(board, word, r, c, 0)) {
                    return true;
                }
            }
        }
        return false;
    }

    static boolean dfs(char[][] board, String word, int r, int c, int index) {
        if (index == word.length()) return true;   // matched every character

        if (r < 0 || r >= board.length || c < 0 || c >= board[0].length
                || board[r][c] != word.charAt(index)) {
            return false;
        }

        char temp = board[r][c];
        board[r][c] = '#';   // mark visited (avoid reusing this cell in this path)

        boolean found = dfs(board, word, r + 1, c, index + 1)
                      || dfs(board, word, r - 1, c, index + 1)
                      || dfs(board, word, r, c + 1, index + 1)
                      || dfs(board, word, r, c - 1, index + 1);

        board[r][c] = temp;   // backtrack: restore the original letter

        return found;
    }

    public static void main(String[] args) {
        char[][] board = {
            {'A','B','C','E'},
            {'S','F','C','S'},
            {'A','D','E','E'}
        };

        System.out.println(exist(board, "ABCCED"));
        System.out.println(exist(board, "SEE"));
        System.out.println(exist(board, "ABCB"));
    }
}
// OUTPUT:
// true
// true
// false`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why '#' Marking Beats a Separate visited[][] Array Here</h3>
Instead of allocating a whole extra <code>boolean[][]</code> array, temporarily overwriting the cell with a sentinel character (like <code>'#'</code>, guaranteed not to match any real letter) achieves the same "don't revisit this cell" effect with ZERO extra space - the grid IS the visited-tracking structure, restored immediately after each failed attempt.`,
            codeExamples: [
                `package com.javaschoollab;

public class InPlaceMarkingDemo {
    public static void main(String[] args) {
        System.out.println("Two ways to track 'visited' cells during grid DFS:");
        System.out.println();
        System.out.println("1. Separate boolean[][] visited array:");
        System.out.println("   - O(rows * cols) extra space");
        System.out.println("   - Clear, explicit, easy to reason about");
        System.out.println();
        System.out.println("2. In-place sentinel marking (board[r][c] = '#'):");
        System.out.println("   - O(1) extra space - reuses the existing grid");
        System.out.println("   - MUST restore the original character before returning,");
        System.out.println("     or the grid is left corrupted for the NEXT starting cell's search");
    }
}
// OUTPUT:
// Two ways to track 'visited' cells during grid DFS:
//
// 1. Separate boolean[][] visited array:
//    - O(rows * cols) extra space
//    - Clear, explicit, easy to reason about
//
// 2. In-place sentinel marking (board[r][c] = '#'):
//    - O(1) extra space - reuses the existing grid
//    - MUST restore the original character before returning,
//      or the grid is left corrupted for the NEXT starting cell's search`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What's the time complexity of Word Search for a single word?</td><td>O(rows * cols * 4^L) where L is the word length - each of the rows*cols starting cells can trigger a DFS branching up to 4 ways at each of the L characters</td></tr>
<tr class='text-center'><td>Why must the sentinel character be restored even when a match IS found early in one branch?</td><td>The || short-circuit means later DFS calls in the same expression never execute, but the calling code (the loop over all starting cells) still needs a clean, unmodified board if this search fails and moves to the next starting cell - though once a match returns true all the way up, the restore doesn't matter for THAT search's outcome</td></tr>
<tr class='text-center'><td>How does searching for MULTIPLE words (Word Search II) improve on running this once per word?</td><td>Building a Trie of all target words first lets a single DFS pass share work across words with common prefixes and prune branches the moment no word continues down that path - see the dedicated Trie-based String Problems topic</td></tr>
</table>`
        }
    ]
};
