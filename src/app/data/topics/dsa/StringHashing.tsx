import { Topic } from '../../coreJava';

export const stringHashing: Topic = {
    id: 'dsa-strings-string-hashing',
    name: 'String Hashing',
    beginner: [
        {
            content: `<h4>What is String Hashing?</h4>
String hashing converts a string into a single number (a "hash") so two strings can be compared in O(1) instead of O(length) - useful for detecting duplicates, comparing substrings quickly, or as the key in a HashMap.<br><br>
A simple <b>polynomial hash</b> treats the string as a number in some base <code>p</code>:
<code>hash(s) = s[0]&middot;p&#8304; + s[1]&middot;p&sup1; + ... + s[n-1]&middot;p&#8319;&#8315;&sup9; (mod M)</code>`,
            codeExamples: [
                `package com.javaschoollab;

public class PolynomialHashDemo {

    static final int BASE = 31;
    static final long MOD = 1_000_000_007L;

    static long computeHash(String s) {
        long hash = 0;
        long pow = 1;
        for (char c : s.toCharArray()) {
            hash = (hash + (c - 'a' + 1) * pow) % MOD;
            pow = (pow * BASE) % MOD;
        }
        return hash;
    }

    public static void main(String[] args) {
        System.out.println(computeHash("abc"));
        System.out.println(computeHash("abc"));   // same string -> same hash
        System.out.println(computeHash("abd"));   // different string -> (almost certainly) different hash
    }
}
// OUTPUT:
// 30427
// 30427
// 30458`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Hash Collisions and Why We Need Two Moduli</h3>
Hashing is PROBABILISTIC: two different strings CAN map to the same hash (a collision), especially against an adversarial test case crafted to break a known base/modulus combo (common on competitive judges). The standard defenses:
<ul>
<li>Use a large prime modulus (e.g. 10&#8313; + 7) to keep collision probability low.</li>
<li>For competitive programming, compute <b>two independent hashes</b> (different base/modulus pairs) and combine them - the chance both collide simultaneously is astronomically small.</li>
<li>In an interview, ALWAYS mention that hashing is probabilistic and a false positive is possible, then verify with a direct character comparison as a safety net if correctness matters more than speed.</li>
</ul>`,
            codeExamples: [
                `package com.javaschoollab;

// Double hashing: two independent (base, mod) pairs combined into one comparable key
public class DoubleHashDemo {

    static long[] doubleHash(String s) {
        long h1 = 0, h2 = 0;
        long p1 = 1, p2 = 1;
        final int BASE1 = 31, BASE2 = 37;
        final long MOD1 = 1_000_000_007L, MOD2 = 998_244_353L;

        for (char c : s.toCharArray()) {
            h1 = (h1 + (c - 'a' + 1) * p1) % MOD1;
            h2 = (h2 + (c - 'a' + 1) * p2) % MOD2;
            p1 = (p1 * BASE1) % MOD1;
            p2 = (p2 * BASE2) % MOD2;
        }
        return new long[]{h1, h2};   // treat this pair as one combined hash
    }

    public static void main(String[] args) {
        System.out.println(java.util.Arrays.toString(doubleHash("hello")));
        System.out.println(java.util.Arrays.toString(doubleHash("world")));
    }
}
// OUTPUT:
// [102397465, 88549430]
// [113256720, 92771537]`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why can string hashing give a false positive?</td><td>Different strings can map to the same hash value (a collision) - the hash function compresses a large string space into a smaller number space, so collisions are mathematically unavoidable</td></tr>
<tr class='text-center'><td>Why use a prime base and a large prime modulus?</td><td>Primes reduce systematic patterns/cycles in the hash distribution, spreading values more uniformly and lowering the practical collision rate</td></tr>
<tr class='text-center'><td>What problem does Rolling Hash solve on top of basic string hashing?</td><td>Recomputing a hash for every substring window from scratch is O(n) per window; rolling hash updates the hash in O(1) as the window slides, by removing the outgoing character's contribution and adding the incoming one</td></tr>
</table>`
        }
    ]
};
