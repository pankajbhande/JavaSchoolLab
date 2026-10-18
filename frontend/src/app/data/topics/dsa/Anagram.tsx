import { Topic } from '../../coreJava';

export const anagram: Topic = {
    id: 'dsa-strings-anagram',
    name: 'Anagram',
    beginner: [
        {
            content: `<h4>What is an Anagram?</h4>
Two strings are anagrams if one can be rearranged into the other - same characters, same counts, different order. Two classic checks:
<ul>
<li><b>Sort both strings</b> and compare - O(n log n).</li>
<li><b>Compare frequency counts</b> - O(n), faster since it avoids sorting entirely.</li>
</ul>`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.Arrays;

public class AnagramCheckDemo {

    // O(n log n) - sort and compare
    static boolean isAnagramSort(String a, String b) {
        if (a.length() != b.length()) return false;
        char[] ca = a.toCharArray();
        char[] cb = b.toCharArray();
        Arrays.sort(ca);
        Arrays.sort(cb);
        return Arrays.equals(ca, cb);
    }

    // O(n) - frequency count, faster
    static boolean isAnagramCount(String a, String b) {
        if (a.length() != b.length()) return false;
        int[] freq = new int[26];
        for (int i = 0; i < a.length(); i++) {
            freq[a.charAt(i) - 'a']++;
            freq[b.charAt(i) - 'a']--;
        }
        for (int f : freq) {
            if (f != 0) return false;
        }
        return true;
    }

    public static void main(String[] args) {
        System.out.println(isAnagramSort("listen", "silent"));
        System.out.println(isAnagramCount("listen", "silent"));
        System.out.println(isAnagramCount("hello", "world"));
    }
}
// OUTPUT:
// true
// true
// false`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Grouping Anagrams Together</h3>
A common follow-up: given a list of strings, group all anagrams together. The trick is finding a <b>canonical key</b> shared by every anagram of the same word - the sorted string is the simplest such key, since all anagrams sort to the identical character sequence.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.*;

public class GroupAnagramsDemo {

    static List<List<String>> groupAnagrams(String[] words) {
        Map<String, List<String>> groups = new HashMap<>();

        for (String word : words) {
            char[] chars = word.toCharArray();
            Arrays.sort(chars);
            String key = new String(chars);   // canonical form: all anagrams share this key

            groups.computeIfAbsent(key, k -> new ArrayList<>()).add(word);
        }
        return new ArrayList<>(groups.values());
    }

    public static void main(String[] args) {
        String[] words = {"eat", "tea", "tan", "ate", "nat", "bat"};
        System.out.println(groupAnagrams(words));
    }
}
// OUTPUT:
// [[eat, tea, ate], [tan, nat], [bat]]
// (exact group order may vary since HashMap has no guaranteed iteration order)`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why is the frequency-count anagram check faster than sorting?</td><td>Sorting is O(n log n); counting each character once and comparing counts is O(n), with no comparison-based sort overhead</td></tr>
<tr class='text-center'><td>What key would you use to group anagrams without sorting each word?</td><td>A fixed-length count signature, e.g. a 26-length frequency array converted to a string like "2#0#0#1#...", avoiding the O(n log n) sort per word entirely and doing O(n) counting instead</td></tr>
<tr class='text-center'><td>Does the anagram check work for Unicode strings?</td><td>Not with a fixed int[26] array - use a HashMap<Character, Integer> instead, since Unicode has far more than 26 possible characters</td></tr>
</table>`
        }
    ]
};
