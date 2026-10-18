import { Topic } from '../../coreJava';

export const array2DMatrix: Topic = {
    id: 'dsa-arrays-2d-matrix',
    name: '2D / Matrix',
    beginner: [
        {
            content: `<h4>What is a 2D Array?</h4>
A 2D array is "an array of arrays" - <code>grid[i]</code> is itself an array (a row), so <code>grid[i][j]</code> means "column j of row i".
<ul>
<li><b>Rectangular</b> (rows all the same length) is the common case, but Java allows <b>jagged</b> arrays where each row has a different length.</li>
<li><code>grid.length</code> = number of rows; <code>grid[0].length</code> = number of columns in row 0.</li>
<li>Traversal is almost always a nested loop: outer loop over rows, inner loop over columns.</li>
</ul>`,
            codeExamples: [
                `package com.javaschoollab;

public class MatrixBasicsDemo {
    public static void main(String[] args) {
        int[][] grid = {
            {1, 2, 3},
            {4, 5, 6},
            {7, 8, 9}
        };

        System.out.println("Rows    : " + grid.length);
        System.out.println("Columns : " + grid[0].length);
        System.out.println("grid[1][2] = " + grid[1][2]); // row 1, column 2

        for (int r = 0; r < grid.length; r++) {
            for (int c = 0; c < grid[r].length; c++) {
                System.out.print(grid[r][c] + " ");
            }
            System.out.println();
        }
    }
}
// OUTPUT:
// Rows    : 3
// Columns : 3
// grid[1][2] = 6
// 1 2 3
// 4 5 6
// 7 8 9`
            ]
        },
        {
            content: `<h4>Jagged Arrays</h4>
Each row can be a different length because <code>grid[i]</code> is an independent array object - only allocating <code>new int[3][]</code> creates the rows as <code>null</code> until you assign each one.`,
            codeExamples: [
                `package com.javaschoollab;

public class JaggedArrayDemo {
    public static void main(String[] args) {
        int[][] jagged = new int[3][];
        jagged[0] = new int[]{1};
        jagged[1] = new int[]{1, 2};
        jagged[2] = new int[]{1, 2, 3};

        for (int[] row : jagged) {
            for (int val : row) {
                System.out.print(val + " ");
            }
            System.out.println();
        }
    }
}
// OUTPUT:
// 1
// 1 2
// 1 2 3`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Common Matrix Techniques</h3>
<ul>
<li><b>Transpose:</b> swap <code>grid[i][j]</code> with <code>grid[j][i]</code> - only meaningful for square matrices in-place.</li>
<li><b>Rotate 90&deg; clockwise:</b> transpose, then reverse each row.</li>
<li><b>Spiral traversal:</b> shrink four boundaries (top, bottom, left, right) inward after each pass.</li>
<li><b>Row-major vs column-major:</b> Java stores arrays row-major, so iterating row-by-row is cache-friendlier than column-by-column for large matrices.</li>
</ul>`,
            codeExamples: [
                `package com.javaschoollab;

public class MatrixRotateDemo {

    // Rotates an n x n matrix 90 degrees clockwise, in place
    static void rotate(int[][] m) {
        int n = m.length;

        // Step 1: transpose (swap m[i][j] with m[j][i])
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                int temp = m[i][j];
                m[i][j] = m[j][i];
                m[j][i] = temp;
            }
        }

        // Step 2: reverse each row
        for (int[] row : m) {
            for (int l = 0, r = row.length - 1; l < r; l++, r--) {
                int temp = row[l];
                row[l] = row[r];
                row[r] = temp;
            }
        }
    }

    public static void main(String[] args) {
        int[][] m = {
            {1, 2, 3},
            {4, 5, 6},
            {7, 8, 9}
        };
        rotate(m);
        for (int[] row : m) {
            System.out.println(java.util.Arrays.toString(row));
        }
    }
}
// OUTPUT:
// [7, 4, 1]
// [8, 5, 2]
// [9, 6, 3]`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>How do you rotate a matrix 90 degrees without extra space?</td><td>Transpose the matrix, then reverse each row - both are in-place O(1) extra space operations</td></tr>
<tr class='text-center'><td>What is a jagged array?</td><td>A 2D array whose rows are independently-sized 1D arrays, so different rows can have different lengths</td></tr>
<tr class='text-center'><td>Why is row-major traversal faster than column-major for a large matrix?</td><td>Java stores each row contiguously in memory; iterating row-by-row hits sequential memory addresses (cache-friendly), while column-by-column jumps across rows (cache misses)</td></tr>
</table>`
        }
    ]
};
