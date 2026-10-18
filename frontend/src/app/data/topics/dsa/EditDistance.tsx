import { Topic } from '../../coreJava';

export const editDistance: Topic = {
    id: 'dsa-dynamic-programming-edit-distance',
    name: 'Edit Distance',
    beginner: [
        {
            content: `<h4>Minimum Insert/Delete/Replace Operations to Transform One String into Another</h4>
<code>dp[i][j]</code> = minimum edits to transform the first <code>i</code> characters of A into the first <code>j</code> characters of B. If characters match, no edit needed there; otherwise, take the best of insert, delete, or replace - each corresponding to a specific neighbor in the DP table.`,
            codeExamples: [
                `package com.javaschoollab;

public class EditDistanceDemo {

    static int editDistance(String a, String b) {
        int n = a.length(), m = b.length();
        int[][] dp = new int[n + 1][m + 1];

        for (int i = 0; i <= n; i++) dp[i][0] = i;   // delete all of A's first i chars
        for (int j = 0; j <= m; j++) dp[0][j] = j;   // insert all of B's first j chars

        for (int i = 1; i <= n; i++) {
            for (int j = 1; j <= m; j++) {
                if (a.charAt(i - 1) == b.charAt(j - 1)) {
                    dp[i][j] = dp[i - 1][j - 1];   // characters match - no edit needed
                } else {
                    int insert = dp[i][j - 1];
                    int delete = dp[i - 1][j];
                    int replace = dp[i - 1][j - 1];
                    dp[i][j] = 1 + Math.min(insert, Math.min(delete, replace));
                }
            }
        }
        return dp[n][m];
    }

    public static void main(String[] args) {
        System.out.println(editDistance("horse", "ros"));
    }
}
// OUTPUT:
// 3`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why Each Operation Maps to a Specific DP Neighbor</h3>
<ul>
<li><b>Insert</b> a character into A (to match B's next char): comes from <code>dp[i][j-1]</code> - A's length stays effectively the same, B's "consumed" pointer advances.</li>
<li><b>Delete</b> a character from A: comes from <code>dp[i-1][j]</code> - A's pointer advances without consuming any of B.</li>
<li><b>Replace</b> a character in A: comes from <code>dp[i-1][j-1]</code> - both pointers advance together.</li>
</ul>
Understanding WHY each operation maps to that specific neighbor (not just memorizing the formula) is what lets you adapt Edit Distance to variants with different allowed operations or costs.`,
            codeExamples: [
                `package com.javaschoollab;

public class WeightedEditDistanceDemo {

    // A variant: insert/delete/replace can have DIFFERENT costs
    static int weightedEditDistance(String a, String b, int insertCost, int deleteCost, int replaceCost) {
        int n = a.length(), m = b.length();
        int[][] dp = new int[n + 1][m + 1];

        for (int i = 0; i <= n; i++) dp[i][0] = i * deleteCost;
        for (int j = 0; j <= m; j++) dp[0][j] = j * insertCost;

        for (int i = 1; i <= n; i++) {
            for (int j = 1; j <= m; j++) {
                if (a.charAt(i - 1) == b.charAt(j - 1)) {
                    dp[i][j] = dp[i - 1][j - 1];
                } else {
                    int insert = dp[i][j - 1] + insertCost;
                    int delete = dp[i - 1][j] + deleteCost;
                    int replace = dp[i - 1][j - 1] + replaceCost;
                    dp[i][j] = Math.min(insert, Math.min(delete, replace));
                }
            }
        }
        return dp[n][m];
    }

    public static void main(String[] args) {
        // Replace is expensive (cost 5), insert/delete are cheap (cost 1)
        System.out.println(weightedEditDistance("horse", "ros", 1, 1, 5));
    }
}
// OUTPUT:
// 5`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What's the time and space complexity of Edit Distance?</td><td>O(n*m) time and space; space reduces to O(min(n,m)) with a rolling 2-row array</td></tr>
<tr class='text-center'><td>What real-world systems use Edit Distance (or variants of it)?</td><td>Spell checkers (suggesting corrections within a small edit distance), DNA sequence alignment in bioinformatics, and Git's diff algorithms all build on this core idea</td></tr>
<tr class='text-center'><td>How would you restrict Edit Distance to allow only DELETIONS (no insert/replace)?</td><td>This becomes a direct application of LCS: minimum deletions to transform A into a subsequence of B (or vice versa) equals (length of A) - (LCS length) - a simpler, related problem</td></tr>
</table>`
        }
    ]
};
