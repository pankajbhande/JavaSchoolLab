import { Topic } from '../../coreJava';

export const prefixSuffixString: Topic = {
    id: 'dsa-strings-prefix-suffix',
    name: 'Prefix / Suffix',
    beginner: [
        {
            content: `<h4>Prefixes and Suffixes of a String</h4>
A <b>prefix</b> is a substring starting at index 0; a <b>suffix</b> is a substring ending at the last index. A length-n string has exactly n non-empty prefixes and n non-empty suffixes.
<ul>
<li><code>s.startsWith(p)</code> checks if p is a prefix.</li>
<li><code>s.endsWith(suf)</code> checks if suf is a suffix.</li>
</ul>
These are the building blocks of pattern-matching algorithms like KMP, which precomputes "the longest prefix that is also a suffix" for every position of the pattern.`,
            codeExamples: [
                `package com.javaschoollab;

public class PrefixSuffixBasicsDemo {

    public static void main(String[] args) {
        String s = "unhappiness";

        System.out.println(s.startsWith("un"));      // prefix check
        System.out.println(s.endsWith("ness"));       // suffix check

        // All prefixes
        for (int i = 1; i <= s.length(); i++) {
            System.out.print(s.substring(0, i) + " | ");
        }
    }
}
// OUTPUT:
// true
// true
// u | un | unh | unha | unhap | unhapp | unhappi | unhappin | unhappine | unhappines | unhappiness |`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>The Longest Prefix-Suffix (LPS) Array - the Engine Behind KMP</h3>
For each prefix of a pattern, <code>lps[i]</code> stores the length of the longest proper prefix of <code>pattern[0..i]</code> that is ALSO a suffix of it. This precomputed array is exactly what lets KMP pattern matching skip re-examining characters after a mismatch, achieving O(n + m) instead of the naive O(n&middot;m).`,
            codeExamples: [
                `package com.javaschoollab;

public class LpsArrayDemo {

    // Builds the "longest proper prefix which is also a suffix" array for KMP
    static int[] buildLps(String pattern) {
        int m = pattern.length();
        int[] lps = new int[m];
        int len = 0;   // length of the previous longest prefix-suffix
        int i = 1;

        while (i < m) {
            if (pattern.charAt(i) == pattern.charAt(len)) {
                len++;
                lps[i] = len;
                i++;
            } else if (len != 0) {
                len = lps[len - 1];   // fall back, don't advance i - reuse prior work
            } else {
                lps[i] = 0;
                i++;
            }
        }
        return lps;
    }

    public static void main(String[] args) {
        System.out.println(java.util.Arrays.toString(buildLps("ababaca")));
    }
}
// OUTPUT:
// [0, 0, 1, 2, 3, 0, 1]
// (at index 4, "ababa"'s longest prefix that is also its suffix is "aba", length 3)`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is the Longest Common Prefix of a list of strings, and how do you find it in O(n*m)?</td><td>The longest string that is a prefix of every string in the list; compare characters column by column across all strings, stopping at the first mismatch or shortest string</td></tr>
<tr class='text-center'><td>Why must a prefix-suffix in the LPS array be "proper"?</td><td>A proper prefix/suffix excludes the whole string itself - otherwise every string trivially has itself as both its own prefix and suffix, making the array useless for skipping comparisons</td></tr>
<tr class='text-center'><td>What real algorithm is built directly on top of the LPS array?</td><td>The KMP (Knuth-Morris-Pratt) pattern matching algorithm, which uses it to avoid re-scanning characters already known to match after a mismatch</td></tr>
</table>`
        }
    ]
};
