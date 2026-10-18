import { Topic } from '../../coreJava';

export const longestPalindromicSubsequence: Topic = {
    id: 'dsa-dynamic-programming-longest-palindromic-subsequence',
    name: 'Longest Palindromic Subsequence',
    beginner: [
        {
            content: `<h4>LCS of a String and Its Own Reverse</h4>
The cleanest way to see this problem: the Longest Palindromic Subsequence of a string equals the Longest Common Subsequence between that string and its REVERSE. Any common subsequence between a string and its reverse reads the same forward and backward - by definition, a palindrome.`,
            codeExamples: [
                `package com.javaschoollab;

public class LongestPalindromicSubsequenceDemo {

    static int longestPalinSubseq(String s) {
        String reversed = new StringBuilder(s).reverse().toString();
        return lcs(s, reversed);
    }

    static int lcs(String a, String b) {
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
        return dp[n][m];
    }

    public static void main(String[] args) {
        System.out.println(longestPalinSubseq("bbbab"));
    }
}
// OUTPUT:
// 4`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>The Direct Interval DP Formulation</h3>
An alternative (equivalent) formulation defines <code>dp[i][j]</code> directly as the longest palindromic subsequence within the substring <code>s[i..j]</code> - useful because it generalizes more naturally to related "interval" palindrome problems (like Palindrome Partitioning) that don't reduce as cleanly to plain LCS.`,
            codeExamples: [
                `package com.javaschoollab;

public class IntervalDpPalindromeDemo {

    static int longestPalinSubseq(String s) {
        int n = s.length();
        int[][] dp = new int[n][n];

        for (int i = 0; i < n; i++) dp[i][i] = 1;   // single character - palindrome of length 1

        // Fill by increasing SUBSTRING LENGTH - shorter intervals must be solved first
        for (int len = 2; len <= n; len++) {
            for (int i = 0; i <= n - len; i++) {
                int j = i + len - 1;
                if (s.charAt(i) == s.charAt(j)) {
                    dp[i][j] = (len == 2) ? 2 : dp[i + 1][j - 1] + 2;
                } else {
                    dp[i][j] = Math.max(dp[i + 1][j], dp[i][j - 1]);
                }
            }
        }
        return dp[0][n - 1];
    }

    public static void main(String[] args) {
        System.out.println(longestPalinSubseq("bbbab"));
    }
}
// OUTPUT:
// 4`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why must the interval-DP version fill by increasing LENGTH, not row by row?</td><td>dp[i][j] depends on dp[i+1][j-1], a SMALLER interval nested inside it - filling by increasing length guarantees that smaller interval is already computed by the time it's needed</td></tr>
<tr class='text-center'><td>Why does the LCS-with-reverse trick work here but NOT for Longest Palindromic Substring?</td><td>A subsequence allows gaps, so matching characters between s and reverse(s) at ANY positions still forms a valid palindromic subsequence; a substring requires contiguity, and a naive LCS-with-reverse can accidentally match characters that don't correspond to a genuine contiguous palindrome</td></tr>
<tr class='text-center'><td>How does this relate to "minimum insertions to make a string palindrome"?</td><td>Minimum insertions = string length - longest palindromic subsequence length - every character NOT part of the LPS needs a matching mirror character inserted</td></tr>
</table>`
        }
    ]
};
