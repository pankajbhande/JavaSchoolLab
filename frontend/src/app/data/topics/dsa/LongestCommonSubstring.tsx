import { Topic } from '../../coreJava';

export const longestCommonSubstring: Topic = {
    id: 'dsa-dynamic-programming-longest-common-substring',
    name: 'Longest Common Substring',
    beginner: [
        {
            content: `<h4>The One Key Difference from LCS</h4>
Longest Common Substring requires CONTIGUOUS matching characters. The DP recurrence is almost identical to LCS, but on a mismatch, <code>dp[i][j]</code> RESETS to 0 (instead of taking the max of neighbors) - a broken match must start completely over, since a substring can't have gaps.`,
            codeExamples: [
                `package com.javaschoollab;

public class LongestCommonSubstringDemo {

    static int longestCommonSubstring(String a, String b) {
        int n = a.length(), m = b.length();
        int[][] dp = new int[n + 1][m + 1];
        int maxLength = 0;

        for (int i = 1; i <= n; i++) {
            for (int j = 1; j <= m; j++) {
                if (a.charAt(i - 1) == b.charAt(j - 1)) {
                    dp[i][j] = dp[i - 1][j - 1] + 1;
                    maxLength = Math.max(maxLength, dp[i][j]);
                } else {
                    dp[i][j] = 0;   // RESET - contiguous match broken, unlike LCS
                }
            }
        }
        return maxLength;
    }

    public static void main(String[] args) {
        System.out.println(longestCommonSubstring("abcdxyz", "xyzabcd"));
    }
}
// OUTPUT:
// 4`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Suffix-Based O(n+m) Alternative - Generalized Suffix Trees/Arrays</h3>
The O(n&middot;m) DP approach is fine for typical inputs, but for VERY large strings, building a generalized suffix tree (or suffix array with LCP array) over both strings combined finds the longest common substring in O(n+m) - the longest common prefix between any two suffixes from DIFFERENT source strings gives the answer directly.`,
            codeExamples: [
                `package com.javaschoollab;

public class SuffixApproachIdeaDemo {
    public static void main(String[] args) {
        System.out.println("Suffix array approach (conceptual):");
        System.out.println("1. Concatenate: s = stringA + '#' + stringB + '$' (unique separators)");
        System.out.println("2. Build the suffix array of s (sorted list of all suffix start positions)");
        System.out.println("3. Build the LCP (Longest Common Prefix) array between adjacent suffixes");
        System.out.println("4. Scan the LCP array: the maximum LCP value between two ADJACENT suffixes");
        System.out.println("   that originate from DIFFERENT source strings (A vs B) is the answer");
        System.out.println();
        System.out.println("This achieves O(n+m) after suffix array construction (itself O((n+m) log(n+m))");
        System.out.println("or O(n+m) with advanced algorithms like SA-IS) - overkill for small strings,");
        System.out.println("essential for very large ones where O(n*m) DP is too slow.");
    }
}
// OUTPUT:
// Suffix array approach (conceptual):
// ...`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why does the answer come from tracking a maxLength variable, not just dp[n][m]?</td><td>Unlike LCS (where the final answer is always at the bottom-right corner), the longest common SUBSTRING can end anywhere in the middle of either string - the maximum dp[i][j] value across the ENTIRE table is the answer, not necessarily the last cell</td></tr>
<tr class='text-center'><td>Can the space be optimized to O(min(n,m))?</td><td>Yes - each row only depends on the previous row (and the diagonal, which needs care), so a rolling 2-row array works, similar to LCS's space optimization</td></tr>
<tr class='text-center'><td>What's the relationship to Longest Palindromic Substring?</td><td>Longest Palindromic Substring can be found by computing the Longest Common Substring between the string and its REVERSE - though extra care is needed to ensure the matched substring doesn't span across the "middle" in a way that isn't a true palindrome</td></tr>
</table>`
        }
    ]
};
