import { Topic } from '../../coreJava';

export const longestCommonSubsequence: Topic = {
    id: 'dsa-dynamic-programming-longest-common-subsequence-lcs',
    name: 'Longest Common Subsequence - LCS',
    beginner: [
        {
            content: `<h4>The Classic Two-String DP</h4>
<code>dp[i][j]</code> = length of the LCS between the first <code>i</code> characters of A and first <code>j</code> characters of B. If the characters match, extend the diagonal; otherwise, take the best of dropping a character from either string.`,
            codeExamples: [
                `package com.javaschoollab;

public class LcsDemo {

    static int lcs(String a, String b) {
        int n = a.length(), m = b.length();
        int[][] dp = new int[n + 1][m + 1];

        for (int i = 1; i <= n; i++) {
            for (int j = 1; j <= m; j++) {
                if (a.charAt(i - 1) == b.charAt(j - 1)) {
                    dp[i][j] = dp[i - 1][j - 1] + 1;             // characters match - extend
                } else {
                    dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);   // drop one character
                }
            }
        }
        return dp[n][m];
    }

    public static void main(String[] args) {
        System.out.println(lcs("abcde", "ace"));
    }
}
// OUTPUT:
// 3`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Reconstructing the Actual LCS String</h3>
Trace BACKWARD from <code>dp[n][m]</code>: if characters match, that character is part of the LCS, move diagonally; otherwise, move toward whichever neighbor (up or left) has the larger value - the same DP table doubles as a path to reconstruct the answer, not just its length.`,
            codeExamples: [
                `package com.javaschoollab;

public class LcsReconstructionDemo {

    static String lcsString(String a, String b) {
        int n = a.length(), m = b.length();
        int[][] dp = new int[n + 1][m + 1];

        for (int i = 1; i <= n; i++) {
            for (int j = 1; j <= m; j++) {
                if (a.charAt(i - 1) == b.charAt(j - 1)) {
                    dp[i][j] = dp[i - 1][j - 1] + 1;
                } else {
                    dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
                }
            }
        }

        StringBuilder result = new StringBuilder();
        int i = n, j = m;
        while (i > 0 && j > 0) {
            if (a.charAt(i - 1) == b.charAt(j - 1)) {
                result.append(a.charAt(i - 1));   // part of the LCS
                i--; j--;
            } else if (dp[i - 1][j] > dp[i][j - 1]) {
                i--;
            } else {
                j--;
            }
        }
        return result.reverse().toString();   // built backward, so reverse at the end
    }

    public static void main(String[] args) {
        System.out.println(lcsString("abcde", "ace"));
    }
}
// OUTPUT:
// ace`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What's the time and space complexity of LCS?</td><td>O(n*m) time and space; space reduces to O(min(n,m)) with a rolling 2-row array, since each row only depends on the previous row</td></tr>
<tr class='text-center'><td>How does LCS differ from Longest Common Substring?</td><td>LCS allows GAPS (non-contiguous matching, order preserved); substring requires CONTIGUOUS matching - the DP recurrence differs specifically in what happens on a mismatch (LCS takes max of two options, substring resets to 0)</td></tr>
<tr class='text-center'><td>What other well-known problems build directly on LCS?</td><td>Shortest Common Supersequence (length = n + m - LCS length), and the "minimum deletions to make two strings equal" problem (deletions = n + m - 2*LCS length)</td></tr>
</table>`
        }
    ]
};
