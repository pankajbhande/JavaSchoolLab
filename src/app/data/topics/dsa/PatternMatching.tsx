import { Topic } from '../../coreJava';

export const patternMatching: Topic = {
    id: 'dsa-strings-pattern-matching',
    name: 'Pattern Matching',
    beginner: [
        {
            content: `<h4>The Naive Pattern Matching Approach</h4>
Given a text of length n and a pattern of length m, find every position where the pattern occurs. The naive approach tries every starting position and compares character by character - O(n&middot;m) worst case (e.g. text "aaaa...a", pattern "aaa...b").`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.ArrayList;
import java.util.List;

public class NaivePatternMatchDemo {

    static List<Integer> search(String text, String pattern) {
        List<Integer> matches = new ArrayList<>();
        int n = text.length(), m = pattern.length();

        for (int i = 0; i <= n - m; i++) {
            int j = 0;
            while (j < m && text.charAt(i + j) == pattern.charAt(j)) {
                j++;
            }
            if (j == m) {
                matches.add(i);   // full match at position i
            }
        }
        return matches;
    }

    public static void main(String[] args) {
        System.out.println(search("abababab", "aba"));
    }
}
// OUTPUT:
// [0, 2, 4]`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why Naive Matching is O(n&middot;m) and What Beats It</h3>
The naive approach's worst case comes from repeatedly re-examining characters it already matched, right before a mismatch forces it to restart from the very next position - throwing away all that earlier work. Three algorithms fix this in different ways:
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Algorithm</th><th>Idea</th><th>Time</th></tr>
<tr class='text-center'><td>KMP</td><td>Precomputes a prefix-suffix table so a mismatch skips ahead without re-checking known-matching characters</td><td>O(n + m)</td></tr>
<tr class='text-center'><td>Rabin-Karp</td><td>Rolling hash compares window hashes in O(1), only verifying character-by-character on a hash match</td><td>O(n + m) average</td></tr>
<tr class='text-center'><td>Z Algorithm</td><td>Builds a Z-array of "longest match with the prefix" for every position of pattern+text combined</td><td>O(n + m)</td></tr>
</table>`,
            codeExamples: [
                `package com.javaschoollab;

// Using Java's built-in indexOf, which internally uses an efficient algorithm -
// but knowing WHY it beats the naive O(n*m) approach is what interviews test.
public class BuiltinIndexOfDemo {
    public static void main(String[] args) {
        String text = "ababcababcabc";
        String pattern = "abc";

        int index = text.indexOf(pattern);
        System.out.println("First match at: " + index);

        // Finding ALL matches by repeatedly searching from the last match + 1
        int from = 0;
        while ((index = text.indexOf(pattern, from)) != -1) {
            System.out.println("Match at: " + index);
            from = index + 1;
        }
    }
}
// OUTPUT:
// First match at: 2
// Match at: 2
// Match at: 7
// Match at: 10`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What input causes naive pattern matching's worst-case O(n*m)?</td><td>Highly repetitive text where many characters match before a late mismatch, e.g. text = "aaaa...a", pattern = "aaa...b" - every starting position does nearly a full comparison</td></tr>
<tr class='text-center'><td>How does KMP avoid re-examining already-matched characters?</td><td>It never moves the text pointer backward; on a mismatch, it uses the precomputed LPS array to jump the pattern pointer forward to the next possible match position, skipping known-good comparisons</td></tr>
<tr class='text-center'><td>When would you pick Rabin-Karp over KMP?</td><td>When searching for MULTIPLE patterns at once (hash each pattern, then check every window's hash against the set) - Rabin-Karp generalizes to this naturally, while KMP is built for a single pattern</td></tr>
</table>`
        }
    ]
};
