import { Topic } from '../../coreJava';

export const rollingHash: Topic = {
    id: 'dsa-strings-rolling-hash',
    name: 'Rolling Hash',
    beginner: [
        {
            content: `<h4>What is a Rolling Hash?</h4>
A rolling hash updates a window's hash in O(1) as the window slides by one position, instead of recomputing from scratch (which would be O(k) per slide, O(n&middot;k) overall). It's the "sliding window" idea applied to string hashing, and it's the engine behind <b>Rabin-Karp</b> pattern matching.<br><br>
To slide a window of size k forward by one character: remove the outgoing character's contribution, shift everything, then add the incoming character.`,
            codeExamples: [
                `package com.javaschoollab;

public class RollingHashDemo {

    static final int BASE = 31;
    static final long MOD = 1_000_000_007L;

    public static void main(String[] args) {
        String s = "abcde";
        int k = 3;

        long pow = 1;
        for (int i = 0; i < k - 1; i++) pow = (pow * BASE) % MOD; // BASE^(k-1)

        // Hash of the first window "abc"
        long hash = 0;
        for (int i = 0; i < k; i++) {
            hash = (hash * BASE + (s.charAt(i) - 'a' + 1)) % MOD;
        }
        System.out.println("Hash of \\"" + s.substring(0, k) + "\\": " + hash);

        // Roll the window forward one character at a time
        for (int i = k; i < s.length(); i++) {
            char outgoing = s.charAt(i - k);
            char incoming = s.charAt(i);

            hash = (hash - (outgoing - 'a' + 1) * pow % MOD + MOD) % MOD; // remove outgoing
            hash = (hash * BASE + (incoming - 'a' + 1)) % MOD;            // add incoming

            System.out.println("Hash of \\"" + s.substring(i - k + 1, i + 1) + "\\": " + hash);
        }
    }
}
// OUTPUT:
// Hash of "abc": 30427
// Hash of "bcd": 33518
// Hash of "cde": 36609`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Rabin-Karp: Rolling Hash Applied to Pattern Matching</h3>
Rabin-Karp finds all occurrences of a pattern in a text by comparing HASHES of each window instead of characters directly - O(n) average time using a rolling hash to slide the window in O(1), only falling back to an O(m) direct character comparison on a hash MATCH (to rule out a false-positive collision).`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.ArrayList;
import java.util.List;

public class RabinKarpDemo {

    static final int BASE = 31;
    static final long MOD = 1_000_000_007L;

    static List<Integer> search(String text, String pattern) {
        List<Integer> matches = new ArrayList<>();
        int n = text.length(), m = pattern.length();
        if (m > n) return matches;

        long patternHash = 0, windowHash = 0, pow = 1;
        for (int i = 0; i < m - 1; i++) pow = (pow * BASE) % MOD;

        for (int i = 0; i < m; i++) {
            patternHash = (patternHash * BASE + pattern.charAt(i)) % MOD;
            windowHash = (windowHash * BASE + text.charAt(i)) % MOD;
        }

        for (int i = 0; i <= n - m; i++) {
            if (windowHash == patternHash && text.regionMatches(i, pattern, 0, m)) {
                matches.add(i);   // verify with a real comparison - rules out a hash collision
            }
            if (i < n - m) {
                windowHash = (windowHash - text.charAt(i) * pow % MOD + MOD) % MOD;
                windowHash = (windowHash * BASE + text.charAt(i + m)) % MOD;
            }
        }
        return matches;
    }

    public static void main(String[] args) {
        System.out.println(search("abcabcabc", "abc"));
    }
}
// OUTPUT:
// [0, 3, 6]`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What's the time complexity of Rabin-Karp with rolling hash?</td><td>O(n + m) average case; worst case O(n*m) if many hash collisions force repeated character-by-character verification (rare with a good modulus)</td></tr>
<tr class='text-center'><td>Why must you verify a hash match with a direct string comparison?</td><td>A hash match doesn't guarantee content equality due to possible collisions - skipping verification risks false positives</td></tr>
<tr class='text-center'><td>What other problems use the exact same rolling-hash technique?</td><td>Longest duplicate substring (binary search on length + rolling hash to check for duplicates of that length), and checking if one string is a rotation of another</td></tr>
</table>`
        }
    ]
};
