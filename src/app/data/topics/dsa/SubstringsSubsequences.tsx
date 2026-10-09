import { Topic } from '../../coreJava';

export const substringsSubsequences: Topic = {
    id: 'dsa-strings-substrings-subsequences',
    name: 'Substrings / Subsequences',
    beginner: [
        {
            content: `<h4>Substring vs Subsequence</h4>
These two terms get confused constantly, and interviewers test the distinction directly:
<ul>
<li><b>Substring</b> - a CONTIGUOUS block of characters. "abc" has substrings "a", "ab", "abc", "b", "bc", "c" (n(n+1)/2 total).</li>
<li><b>Subsequence</b> - characters in the SAME relative order, but NOT necessarily contiguous (can skip characters). "abc" has subsequences "a", "b", "c", "ab", "ac", "bc", "abc", "" (2&#8319; total).</li>
</ul>
"ac" is a subsequence of "abc" (skip the b) but NOT a substring (not contiguous).`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.ArrayList;
import java.util.List;

public class SubstringVsSubsequenceDemo {

    // All CONTIGUOUS substrings - O(n^2) of them
    static List<String> allSubstrings(String s) {
        List<String> result = new ArrayList<>();
        for (int i = 0; i < s.length(); i++) {
            for (int j = i + 1; j <= s.length(); j++) {
                result.add(s.substring(i, j));
            }
        }
        return result;
    }

    // Checks if 'sub' is a subsequence of 's' (order preserved, gaps allowed)
    static boolean isSubsequence(String sub, String s) {
        int i = 0;
        for (int j = 0; j < s.length() && i < sub.length(); j++) {
            if (sub.charAt(i) == s.charAt(j)) {
                i++;
            }
        }
        return i == sub.length();
    }

    public static void main(String[] args) {
        System.out.println(allSubstrings("abc"));
        System.out.println("ac is subsequence of abc: " + isSubsequence("ac", "abc"));
        System.out.println("ac is substring: " + "abc".contains("ac"));
    }
}
// OUTPUT:
// [a, ab, abc, b, bc, c]
// ac is subsequence of abc: true
// ac is substring: false`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why Subsequence Problems Reach for Dynamic Programming</h3>
There are 2&#8319; possible subsequences of a length-n string - far too many to enumerate for problems like Longest Common Subsequence or Longest Increasing Subsequence. DP works by defining <code>dp[i][j]</code> as "the answer using only the first i characters of string A and first j of string B", building up from smaller subproblems instead of generating every subsequence explicitly.`,
            codeExamples: [
                `package com.javaschoollab;

// Longest Common Subsequence between two strings - classic 2D DP
public class LongestCommonSubsequenceDemo {

    static int lcs(String a, String b) {
        int n = a.length(), m = b.length();
        int[][] dp = new int[n + 1][m + 1];

        for (int i = 1; i <= n; i++) {
            for (int j = 1; j <= m; j++) {
                if (a.charAt(i - 1) == b.charAt(j - 1)) {
                    dp[i][j] = dp[i - 1][j - 1] + 1;      // characters match, extend
                } else {
                    dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]); // skip one character
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
// 3
// (the LCS is "ace")`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>How many substrings and how many subsequences does a length-n string have?</td><td>n(n+1)/2 substrings (contiguous), 2^n subsequences (each character independently included or not)</td></tr>
<tr class='text-center'><td>Is every substring also a subsequence?</td><td>Yes - contiguous is a special case of "order preserved, gaps allowed"; the reverse is not true</td></tr>
<tr class='text-center'><td>How do you check if one string is a subsequence of another in O(n)?</td><td>Two pointers: walk through the longer string once, advancing the shorter string's pointer only when characters match; if the shorter pointer reaches the end, it's a valid subsequence</td></tr>
</table>`
        }
    ]
};
