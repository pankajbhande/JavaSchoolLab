import { Topic } from '../../coreJava';

export const rabinKarpAlgorithm: Topic = {
    id: 'dsa-strings-rabin-karp-algorithm',
    name: 'Rabin-Karp Algorithm',
    beginner: [
        {
            content: `<h4>Rabin-Karp: Hashing for Pattern Matching</h4>
Rabin-Karp finds a pattern in a text by comparing <b>hashes</b> of each candidate window instead of characters, sliding the window with a rolling hash in O(1) per step. Average case O(n + m); relies on verifying real matches with a direct comparison to rule out hash collisions.`,
            codeExamples: [
                `package com.javaschoollab;

public class RabinKarpBasicDemo {

    static final int BASE = 256;
    static final int MOD = 101;   // small prime for demonstration

    static int firstMatch(String text, String pattern) {
        int n = text.length(), m = pattern.length();
        int patternHash = 0, windowHash = 0, h = 1;

        for (int i = 0; i < m - 1; i++) h = (h * BASE) % MOD;

        for (int i = 0; i < m; i++) {
            patternHash = (BASE * patternHash + pattern.charAt(i)) % MOD;
            windowHash = (BASE * windowHash + text.charAt(i)) % MOD;
        }

        for (int i = 0; i <= n - m; i++) {
            if (patternHash == windowHash && text.regionMatches(i, pattern, 0, m)) {
                return i;   // verified real match
            }
            if (i < n - m) {
                windowHash = (BASE * (windowHash - text.charAt(i) * h) + text.charAt(i + m)) % MOD;
                if (windowHash < 0) windowHash += MOD;
            }
        }
        return -1;
    }

    public static void main(String[] args) {
        System.out.println(firstMatch("ABABDABACDABABCABAB", "ABABCABAB"));
    }
}
// OUTPUT:
// 10`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Searching for Multiple Patterns Simultaneously</h3>
Rabin-Karp's real advantage over KMP shows up when searching for MANY patterns of the same length at once: hash every pattern into a HashSet, then slide one rolling-hash window across the text and check set membership - O(n + total pattern length) instead of running KMP once per pattern.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.HashSet;
import java.util.Set;
import java.util.ArrayList;
import java.util.List;

public class MultiPatternRabinKarpDemo {

    static final int BASE = 31;
    static final long MOD = 1_000_000_007L;

    static long hashOf(String s) {
        long h = 0;
        for (char c : s.toCharArray()) h = (h * BASE + c) % MOD;
        return h;
    }

    // All patterns must be the same length 'm' for a single rolling window to work
    static List<Integer> findAny(String text, String[] patterns) {
        int m = patterns[0].length();
        Set<Long> patternHashes = new HashSet<>();
        for (String p : patterns) patternHashes.add(hashOf(p));

        List<Integer> hits = new ArrayList<>();
        long pow = 1;
        for (int i = 0; i < m - 1; i++) pow = (pow * BASE) % MOD;

        long windowHash = 0;
        for (int i = 0; i < m; i++) windowHash = (windowHash * BASE + text.charAt(i)) % MOD;

        for (int i = 0; i <= text.length() - m; i++) {
            if (patternHashes.contains(windowHash)) {
                hits.add(i);   // (a production version would verify to rule out collisions)
            }
            if (i < text.length() - m) {
                windowHash = (windowHash - text.charAt(i) * pow % MOD + MOD) % MOD;
                windowHash = (windowHash * BASE + text.charAt(i + m)) % MOD;
            }
        }
        return hits;
    }

    public static void main(String[] args) {
        System.out.println(findAny("catbatratmat", new String[]{"bat", "rat", "dog"}));
    }
}
// OUTPUT:
// [3, 6]`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why is Rabin-Karp's worst case O(n*m) despite being O(n+m) on average?</td><td>An adversarial input causing many hash collisions forces the O(m) direct-comparison fallback on nearly every window - rare in practice with a good modulus, but possible</td></tr>
<tr class='text-center'><td>When is Rabin-Karp preferred over KMP?</td><td>Searching for multiple fixed-length patterns at once (hash them into a set, scan text once), or when a simple probabilistic solution is acceptable and easier to implement correctly under time pressure</td></tr>
<tr class='text-center'><td>What's the role of the modulus, and what happens if it's too small?</td><td>It bounds the hash value's range; too small a modulus (or a predictable one, as in the demo above) increases collision frequency and can be deliberately exploited by adversarial test data</td></tr>
</table>`
        }
    ]
};
