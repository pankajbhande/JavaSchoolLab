import { Topic } from '../../coreJava';

export const zAlgorithm: Topic = {
    id: 'dsa-strings-z-algorithm',
    name: 'Z Algorithm',
    beginner: [
        {
            content: `<h4>What is the Z Array?</h4>
For a string <code>s</code>, the Z array's entry <code>z[i]</code> is the length of the longest substring starting at <code>i</code> that matches a PREFIX of <code>s</code>. By definition <code>z[0]</code> is usually left undefined/0 (comparing the whole string to itself is trivial and unused).<br><br>
For pattern matching, build the Z array of <code>pattern + '#' + text</code> (a separator character not in either string) - any position in the "text" section where <code>z[i] == pattern.length()</code> marks a match.`,
            codeExamples: [
                `package com.javaschoollab;

public class ZArrayDemo {

    static int[] buildZArray(String s) {
        int n = s.length();
        int[] z = new int[n];
        int left = 0, right = 0;

        for (int i = 1; i < n; i++) {
            if (i < right) {
                z[i] = Math.min(right - i, z[i - left]);   // reuse previously computed work
            }
            while (i + z[i] < n && s.charAt(z[i]) == s.charAt(i + z[i])) {
                z[i]++;
            }
            if (i + z[i] > right) {
                left = i;
                right = i + z[i];
            }
        }
        return z;
    }

    public static void main(String[] args) {
        System.out.println(java.util.Arrays.toString(buildZArray("aabxaayaab")));
    }
}
// OUTPUT:
// [0, 1, 0, 0, 3, 1, 0, 2, 1, 0]`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Pattern Matching with the Z Array - and Why the [left, right) Window Matters</h3>
The <code>[left, right)</code> window tracks the rightmost Z-box found so far (a substring known to match the prefix). When computing <code>z[i]</code> for an <code>i</code> INSIDE that window, the answer is already partly known from <code>z[i - left]</code> (the mirrored position) - this reuse is what makes the whole algorithm O(n) instead of O(n&sup2;), exactly the same idea as KMP's LPS fallback but framed differently.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.ArrayList;
import java.util.List;

public class ZPatternMatchDemo {

    static int[] buildZArray(String s) {
        int n = s.length();
        int[] z = new int[n];
        int left = 0, right = 0;
        for (int i = 1; i < n; i++) {
            if (i < right) z[i] = Math.min(right - i, z[i - left]);
            while (i + z[i] < n && s.charAt(z[i]) == s.charAt(i + z[i])) z[i]++;
            if (i + z[i] > right) { left = i; right = i + z[i]; }
        }
        return z;
    }

    static List<Integer> search(String text, String pattern) {
        String combined = pattern + "#" + text;   // separator not present in either string
        int[] z = buildZArray(combined);
        List<Integer> matches = new ArrayList<>();

        for (int i = pattern.length() + 1; i < combined.length(); i++) {
            if (z[i] == pattern.length()) {
                matches.add(i - pattern.length() - 1);   // convert back to an index in 'text'
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
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>How does the Z Algorithm compare to KMP for pattern matching?</td><td>Both are O(n + m); Z is often considered more intuitive to derive (the array has a direct meaning: "match length with the prefix"), while KMP's LPS array requires more careful reasoning about what it represents</td></tr>
<tr class='text-center'><td>Why is a separator character needed between pattern and text?</td><td>Without it, a match that spans across the pattern/text boundary could produce a Z value larger than the pattern length, causing false positives</td></tr>
<tr class='text-center'><td>What is z[i - left] reused for when i falls inside the current Z-box?</td><td>Since s[left..right) is known to match s[0..right-left), position i inside it mirrors position i-left relative to the start - so z[i] can start from min(right-i, z[i-left]) instead of comparing from scratch</td></tr>
</table>`
        }
    ]
};
