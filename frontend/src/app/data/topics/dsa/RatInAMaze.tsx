import { Topic } from '../../coreJava';

export const ratInAMaze: Topic = {
    id: 'dsa-recursion-backtracking-rat-in-a-maze',
    name: 'Rat in a Maze',
    beginner: [
        {
            content: `<h4>Finding a Path Through a Grid</h4>
A rat starts at the top-left of a grid maze and must reach the bottom-right, moving only through open cells (marked 1, blocked cells marked 0). Backtracking tries each direction from the current cell, marking it visited, recursing, and UN-marking it if that direction leads to a dead end - the un-marking is essential so other paths can still use that cell.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.ArrayList;
import java.util.List;

public class RatInMazeDemo {

    static void findPath(int[][] maze, int row, int col, boolean[][] visited,
                          StringBuilder path, List<String> result) {
        int n = maze.length;

        if (row == n - 1 && col == n - 1) {
            result.add(path.toString());
            return;
        }

        int[] dr = {1, 0, 0, -1};   // Down, Left, Right, Up (conventional order: D L R U)
        int[] dc = {0, -1, 1, 0};
        char[] moveChar = {'D', 'L', 'R', 'U'};

        for (int d = 0; d < 4; d++) {
            int nr = row + dr[d], nc = col + dc[d];
            if (nr >= 0 && nr < n && nc >= 0 && nc < n
                    && maze[nr][nc] == 1 && !visited[nr][nc]) {

                visited[nr][nc] = true;
                path.append(moveChar[d]);

                findPath(maze, nr, nc, visited, path, result);

                path.deleteCharAt(path.length() - 1);   // backtrack: undo the move
                visited[nr][nc] = false;                  // backtrack: unmark visited
            }
        }
    }

    public static void main(String[] args) {
        int[][] maze = {
            {1, 0, 0, 0},
            {1, 1, 0, 1},
            {1, 1, 0, 0},
            {0, 1, 1, 1}
        };

        boolean[][] visited = new boolean[4][4];
        visited[0][0] = true;
        List<String> result = new ArrayList<>();
        findPath(maze, 0, 0, visited, new StringBuilder(), result);

        System.out.println(result);
    }
}
// OUTPUT:
// [DDRDRR]`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why the visited[] Reset is the Single Most Important Line</h3>
Forgetting <code>visited[nr][nc] = false</code> after backtracking is THE classic bug in maze/grid backtracking problems: without it, a cell that was part of one failed attempt stays permanently "blocked" for every OTHER path the search tries afterward - silently causing the algorithm to miss valid solutions, often with no error, just wrong (incomplete) output.`,
            codeExamples: [
                `package com.javaschoollab;

public class VisitedResetBugDemo {
    public static void main(String[] args) {
        System.out.println("WITHOUT resetting visited[nr][nc] = false after backtracking:");
        System.out.println("- A cell explored down a dead-end path stays marked 'visited' forever");
        System.out.println("- Every OTHER path that also needs to pass through that cell");
        System.out.println("  will incorrectly treat it as blocked, even though it's actually open");
        System.out.println("- The search silently returns FEWER (or zero) valid paths than truly exist");
        System.out.println();
        System.out.println("This is why 'unmark on the way back up' is non-negotiable in backtracking -");
        System.out.println("the visited set must reflect ONLY the current path being explored,");
        System.out.println("not the union of every path ever tried.");
    }
}
// OUTPUT:
// WITHOUT resetting visited[nr][nc] = false after backtracking:
// - A cell explored down a dead-end path stays marked 'visited' forever
// - Every OTHER path that also needs to pass through that cell
//   will incorrectly treat it as blocked, even though it's actually open
// - The search silently returns FEWER (or zero) valid paths than truly exist
//
// This is why 'unmark on the way back up' is non-negotiable in backtracking -
// the visited set must reflect ONLY the current path being explored,
// not the union of every path ever tried.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What's the worst-case time complexity of Rat in a Maze?</td><td>O(4^(n*n)) in the worst case - at each cell, up to 4 directions can be tried, though the visited check and boundary checks prune most invalid branches in practice</td></tr>
<tr class='text-center'><td>How would you find just ONE valid path instead of ALL paths?</td><td>Return a boolean from the recursive function, and stop exploring/return true immediately once a path is found - same early-termination principle as "find one matching subsequence"</td></tr>
<tr class='text-center'><td>How does this problem relate to DFS on a graph?</td><td>It's literally DFS where each grid cell is a node and adjacent open cells are edges - the visited-and-backtrack pattern here is identical to how DFS avoids revisiting nodes, adapted to also UNDO the visited marking since multiple distinct paths need independent exploration</td></tr>
</table>`
        }
    ]
};
