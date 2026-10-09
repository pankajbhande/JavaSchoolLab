import { Topic } from '../../coreJava';

export const kmpAlgorithm: Topic = {
    id: 'dsa-strings-kmp-algorithm',
    name: 'KMP Algorithm',
    beginner: [
        {
            content: `<h4>Knuth-Morris-Pratt (KMP) Pattern Matching</h4>
KMP finds all occurrences of a pattern in a text in O(n + m) time - guaranteed, no bad worst case like the naive O(n&middot;m) approach. The key idea: precompute an <b>LPS array</b> (Longest Proper Prefix which is also a Suffix) for the pattern, so that on a mismatch, the algorithm knows exactly how far it can safely skip WITHOUT re-checking characters it already knows match.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.ArrayList;
import java.util.List;

public class KmpDemo {

    static int[] buildLps(String pattern) {
        int m = pattern.length();
        int[] lps = new int[m];
        int len = 0, i = 1;
        while (i < m) {
            if (pattern.charAt(i) == pattern.charAt(len)) {
                lps[i++] = ++len;
            } else if (len != 0) {
                len = lps[len - 1];
            } else {
                lps[i++] = 0;
            }
        }
        return lps;
    }

    static List<Integer> search(String text, String pattern) {
        List<Integer> matches = new ArrayList<>();
        int[] lps = buildLps(pattern);
        int i = 0, j = 0;   // i = text pointer, j = pattern pointer

        while (i < text.length()) {
            if (text.charAt(i) == pattern.charAt(j)) {
                i++;
                j++;
                if (j == pattern.length()) {
                    matches.add(i - j);      // full match found
                    j = lps[j - 1];          // continue searching for overlapping matches
                }
            } else if (j != 0) {
                j = lps[j - 1];              // fall back using the LPS array, i does NOT move
            } else {
                i++;
            }
        }
        return matches;
    }

    public static void main(String[] args) {
        System.out.println(search("ababcababcababc", "abc"));
    }
}
// OUTPUT:
// [2, 7, 12]`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why the Text Pointer i Never Moves Backward</h3>
This is what guarantees KMP's O(n + m) bound: <code>i</code> only ever increases, so the text is scanned at most once. All the "backtracking" happens on the PATTERN pointer <code>j</code>, which jumps using the LPS table instead of restarting from 0. Total work across the whole run is bounded by 2n comparisons (each advance of i does at most one comparison; each LPS fallback of j is amortized against earlier progress) plus the O(m) LPS precomputation.`,
            codeExamples: [
                `package com.javaschoollab;

// Trace showing WHY the LPS fallback is safe: after a mismatch,
// the LPS value tells us the longest prefix of the pattern that is
// ALREADY known to match, so we don't need to re-verify it.
public class KmpTraceDemo {

    public static void main(String[] args) {
        String pattern = "ababaca";
        int[] lps = {0, 0, 1, 2, 3, 0, 1};

        // Suppose we matched "ababa" (5 chars, j=5) and then hit a mismatch.
        // Instead of restarting the pattern from index 0, KMP jumps j to lps[4] = 3.
        int j = 5;
        System.out.println("Matched so far    : " + pattern.substring(0, j));
        System.out.println("Fallback to j =    : " + lps[j - 1]);
        System.out.println("Which means resume : " + pattern.substring(0, lps[j - 1])
            + " is ALREADY confirmed matching - no need to recheck it");
    }
}
// OUTPUT:
// Matched so far    : ababa
// Fallback to j =    : 3
// Which means resume : aba is ALREADY confirmed matching - no need to recheck it`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is the time complexity of KMP, and why is it guaranteed (not just average-case)?</td><td>O(n + m) - the text pointer only ever moves forward, and the LPS fallback on the pattern pointer is bounded by amortized analysis, unlike Rabin-Karp's average-case bound which assumes few hash collisions</td></tr>
<tr class='text-center'><td>What does lps[i] represent exactly?</td><td>The length of the longest PROPER prefix of pattern[0..i] that is also a suffix of pattern[0..i] - "proper" meaning it excludes the whole substring itself</td></tr>
<tr class='text-center'><td>How do you find OVERLAPPING matches with KMP?</td><td>After recording a full match, don't reset j to 0 - set j = lps[j-1] instead, which continues the search from the longest known-matching suffix, allowing overlapping occurrences to be found</td></tr>
</table>`
        }
    ]
};
