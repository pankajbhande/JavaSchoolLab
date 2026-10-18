import { Topic } from '../../coreJava';

export const palindromePartitioning: Topic = {
    id: 'dsa-dynamic-programming-palindrome-partitioning',
    name: 'Palindrome Partitioning',
    beginner: [
        {
            content: `<h4>Minimum Cuts to Split a String into All-Palindrome Pieces</h4>
Find the minimum number of cuts so every resulting piece is a palindrome. Two-phase DP: first precompute <code>isPalin[i][j]</code> for every substring (O(n&sup2;)), then <code>minCuts[i]</code> = fewest cuts for <code>s[0..i]</code>, trying every possible LAST palindrome piece ending at <code>i</code>.`,
            codeExamples: [
                `package com.javaschoollab;

public class PalindromePartitioningDemo {

    static int minCuts(String s) {
        int n = s.length();
        boolean[][] isPalin = new boolean[n][n];

        // Precompute: is s[i..j] a palindrome?
        for (int len = 1; len <= n; len++) {
            for (int i = 0; i + len - 1 < n; i++) {
                int j = i + len - 1;
                if (s.charAt(i) == s.charAt(j) && (len <= 2 || isPalin[i + 1][j - 1])) {
                    isPalin[i][j] = true;
                }
            }
        }

        int[] minCuts = new int[n];
        for (int i = 0; i < n; i++) {
            if (isPalin[0][i]) {
                minCuts[i] = 0;   // the whole prefix is already one palindrome - no cuts needed
                continue;
            }
            minCuts[i] = Integer.MAX_VALUE;
            for (int j = 0; j < i; j++) {
                if (isPalin[j + 1][i]) {
                    minCuts[i] = Math.min(minCuts[i], minCuts[j] + 1);
                }
            }
        }
        return minCuts[n - 1];
    }

    public static void main(String[] args) {
        System.out.println(minCuts("aab"));
    }
}
// OUTPUT:
// 1`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why Precomputing isPalin[][] First is Essential for Efficiency</h3>
Without precomputing, checking whether <code>s[j+1..i]</code> is a palindrome inside the inner loop would cost O(n) per check, making the overall algorithm O(n&sup3;). Precomputing the whole <code>isPalin[][]</code> table ONCE (itself O(n&sup2;)) turns every subsequent lookup into O(1), reducing the total complexity to O(n&sup2;) - a textbook example of "precompute once, query many times" paying off.`,
            codeExamples: [
                `package com.javaschoollab;

public class PrecomputeVsRecheckDemo {
    public static void main(String[] args) {
        System.out.println("WITHOUT precomputing isPalin[][]:");
        System.out.println("  Outer loop: O(n) positions");
        System.out.println("  Inner loop: O(n) candidate cut points");
        System.out.println("  Each candidate: O(n) to check if that substring is a palindrome");
        System.out.println("  Total: O(n^3)");
        System.out.println();
        System.out.println("WITH precomputing isPalin[][] first (itself O(n^2)):");
        System.out.println("  Outer loop: O(n) positions");
        System.out.println("  Inner loop: O(n) candidate cut points");
        System.out.println("  Each candidate: O(1) lookup in the precomputed table");
        System.out.println("  Total: O(n^2) + O(n^2) = O(n^2)");
    }
}
// OUTPUT:
// WITHOUT precomputing isPalin[][]:
//   ...
// WITH precomputing isPalin[][] first (itself O(n^2)):
//   ...`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What's the overall time and space complexity of minimum-cut palindrome partitioning?</td><td>O(n^2) time (precompute table + fill minCuts array), O(n^2) space for the isPalin table</td></tr>
<tr class='text-center'><td>How does this differ from "return ALL possible palindrome partitionings" (a different classic problem)?</td><td>That variant needs BACKTRACKING to enumerate every valid partition (potentially exponential output size), while this one only needs the MINIMUM cut count, solvable efficiently with pure DP without ever enumerating the actual partitions</td></tr>
<tr class='text-center'><td>Why does the isPalin[][] recurrence check "len <= 2 || isPalin[i+1][j-1]"?</td><td>A substring of length 1 or 2 is a palindrome iff its endpoints match (no inner substring to check); for length 3+, it additionally requires the INNER substring (excluding both endpoints) to already be a palindrome</td></tr>
</table>`
        }
    ]
};
