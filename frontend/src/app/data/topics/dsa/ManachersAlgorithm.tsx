import { Topic } from '../../coreJava';

export const manachersAlgorithm: Topic = {
    id: "dsa-strings-manacher-s-algorithm",
    name: "Manacher's Algorithm",
    beginner: [
        {
            content: `<h4>Finding the Longest Palindromic Substring in O(n)</h4>
Expand-around-center finds the longest palindromic substring in O(n&sup2;). Manacher's Algorithm does the same job in O(n) by REUSING previously computed palindrome radii, the same "don't redo known work" idea behind KMP and the Z Algorithm.<br><br>
The trick that avoids handling odd/even length palindromes separately: insert a separator character (like <code>#</code>) between every character (and at both ends), so every palindrome in the transformed string has ODD length.`,
            codeExamples: [
                `package com.javaschoollab;

public class ManacherTransformDemo {

    // "abc" -> "^#a#b#c#$" (^ and $ are sentinels to avoid bounds checks)
    static String transform(String s) {
        StringBuilder sb = new StringBuilder("^");
        for (char c : s.toCharArray()) {
            sb.append('#').append(c);
        }
        sb.append("#$");
        return sb.toString();
    }

    public static void main(String[] args) {
        System.out.println(transform("abc"));
        System.out.println(transform("aba"));
    }
}
// OUTPUT:
// ^#a#b#c#$
// ^#a#b#a#$`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>The Full Manacher's Algorithm</h3>
Maintains a "rightmost palindrome boundary" (center C, right edge R), exactly mirroring the Z Algorithm's window reuse: for a position <code>i</code> inside the current rightmost palindrome, its radius can be seeded from its mirror position <code>2C - i</code> before expanding further, avoiding redundant character comparisons.`,
            codeExamples: [
                `package com.javaschoollab;

public class ManacherDemo {

    static String longestPalindrome(String s) {
        String t = transform(s);
        int n = t.length();
        int[] p = new int[n];   // p[i] = radius of palindrome centered at i in t
        int center = 0, right = 0;

        for (int i = 1; i < n - 1; i++) {
            int mirror = 2 * center - i;
            if (i < right) {
                p[i] = Math.min(right - i, p[mirror]);   // reuse mirrored work
            }
            while (t.charAt(i + p[i] + 1) == t.charAt(i - p[i] - 1)) {
                p[i]++;
            }
            if (i + p[i] > right) {
                center = i;
                right = i + p[i];
            }
        }

        int maxLen = 0, centerIndex = 0;
        for (int i = 1; i < n - 1; i++) {
            if (p[i] > maxLen) {
                maxLen = p[i];
                centerIndex = i;
            }
        }
        int start = (centerIndex - maxLen) / 2;   // map back to the original string
        return s.substring(start, start + maxLen);
    }

    static String transform(String s) {
        StringBuilder sb = new StringBuilder("^");
        for (char c : s.toCharArray()) sb.append('#').append(c);
        sb.append("#$");
        return sb.toString();
    }

    public static void main(String[] args) {
        System.out.println(longestPalindrome("babad"));
        System.out.println(longestPalindrome("forgeeksskeegfor"));
    }
}
// OUTPUT:
// bab
// geeksskeeg`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why insert separator characters before running Manacher's?</td><td>It normalizes every palindrome to odd length, so the algorithm handles even-length and odd-length palindromes with one uniform code path instead of two</td></tr>
<tr class='text-center'><td>What guarantees Manacher's O(n) time despite the nested while loop?</td><td>The right boundary R only ever moves forward across the whole run - each expansion of the while loop advances R, so total expansion work is bounded by O(n), same amortized argument as the Z Algorithm</td></tr>
<tr class='text-center'><td>When would you use Manacher's over expand-around-center?</td><td>When n is large enough that O(n^2) is too slow (competitive programming constraints, or n in the hundreds of thousands+) - for typical interview-sized inputs, expand-around-center is usually accepted and much simpler to write correctly</td></tr>
</table>`
        }
    ]
};
