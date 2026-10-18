import { Topic } from '../../coreJava';

export const characterFrequency: Topic = {
    id: 'dsa-strings-character-frequency',
    name: 'Character Frequency',
    beginner: [
        {
            content: `<h4>Counting Character Occurrences</h4>
A huge fraction of string problems (anagrams, first-unique-character, valid-anagram-window) start with a frequency count. For ASCII/lowercase-letter input, a fixed-size <code>int[26]</code> array is faster than a HashMap - no hashing/boxing overhead, direct index access via <code>c - 'a'</code>.`,
            codeExamples: [
                `package com.javaschoollab;

public class CharFrequencyDemo {

    static int[] countFrequency(String s) {
        int[] freq = new int[26];
        for (char c : s.toCharArray()) {
            freq[c - 'a']++;
        }
        return freq;
    }

    // First character that appears exactly once
    static char firstUniqueChar(String s) {
        int[] freq = countFrequency(s);
        for (char c : s.toCharArray()) {
            if (freq[c - 'a'] == 1) return c;
        }
        return '\\0';
    }

    public static void main(String[] args) {
        String s = "swiss";
        System.out.println("First unique: " + firstUniqueChar(s));
    }
}
// OUTPUT:
// First unique: w`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>int[26] vs HashMap&lt;Character, Integer&gt;</h3>
For the common case of lowercase English letters, <code>int[26]</code> beats a HashMap on every axis: O(1) guaranteed array access (no hash collisions), no autoboxing of <code>Character</code>/<code>Integer</code>, and a tiny fixed memory footprint. Reach for a HashMap only when the character set is unknown or large (full Unicode, arbitrary bytes) where a fixed array would waste memory or not cover the range.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.HashMap;
import java.util.Map;

public class FrequencyMapVsArrayDemo {

    // Works for ANY character set, at the cost of hashing overhead
    static Map<Character, Integer> countWithMap(String s) {
        Map<Character, Integer> freq = new HashMap<>();
        for (char c : s.toCharArray()) {
            freq.merge(c, 1, Integer::sum);
        }
        return freq;
    }

    // Only valid for lowercase a-z, but much faster in practice
    static int[] countWithArray(String s) {
        int[] freq = new int[26];
        for (char c : s.toCharArray()) {
            freq[c - 'a']++;
        }
        return freq;
    }

    public static void main(String[] args) {
        String s = "programming";
        System.out.println(countWithMap(s));
        System.out.println(java.util.Arrays.toString(countWithArray(s)));
    }
}
// OUTPUT:
// {a=1, g=2, i=1, m=2, n=1, o=1, p=1, r=2}
// [1, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 2, 1, 1, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0]`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why prefer int[26] over a HashMap for lowercase-letter problems?</td><td>Direct array indexing is faster than hashing and avoids Integer autoboxing overhead, and the fixed 26-slot size is a perfect match for the known alphabet</td></tr>
<tr class='text-center'><td>How do you check if two strings are permutations of each other using frequency counts?</td><td>Build a frequency array for each and compare them for equality - or increment for one string and decrement for the other, then check all counts are zero</td></tr>
<tr class='text-center'><td>What's the time and space complexity of a frequency-count solution?</td><td>O(n) time to build the count, O(k) space where k is the alphabet size (constant, e.g. 26) - so effectively O(1) space for a fixed alphabet</td></tr>
</table>`
        }
    ]
};
