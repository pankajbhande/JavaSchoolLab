import { Topic } from '../../coreJava';

export const frequencyMapTopic: Topic = {
    id: 'dsa-hashing-frequency-map',
    name: 'Frequency Map',
    beginner: [
        {
            content: `<h4>The Frequency Map Pattern</h4>
Counting how often each element appears is one of the most common first steps in a DSA solution - "which element is most/least common", "are two collections the same multiset", "what's the majority element". <code>Map.merge()</code> is the cleanest way to build one in Java.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.HashMap;
import java.util.Map;

public class FrequencyMapDemo {

    static <T> Map<T, Integer> buildFrequencyMap(T[] items) {
        Map<T, Integer> freq = new HashMap<>();
        for (T item : items) {
            freq.merge(item, 1, Integer::sum);   // increments, or inserts 1 if absent
        }
        return freq;
    }

    public static void main(String[] args) {
        Integer[] arr = {4, 6, 4, 4, 2, 6, 8};
        Map<Integer, Integer> freq = buildFrequencyMap(arr);
        System.out.println(freq);

        int mostCommon = freq.entrySet().stream()
            .max(Map.Entry.comparingByValue())
            .get().getKey();
        System.out.println("Most common: " + mostCommon);
    }
}
// OUTPUT:
// {2=1, 4=3, 6=2, 8=1}
// Most common: 4`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Frequency Maps for Sliding Window Problems</h3>
A frequency map inside a sliding window turns "longest substring with at most K distinct characters" and similar problems into O(n): grow the window on the right (incrementing counts), shrink from the left (decrementing counts, removing a key at zero) whenever the window violates its constraint.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.HashMap;
import java.util.Map;

public class LongestSubstringKDistinctDemo {

    static int longestSubstringWithKDistinct(String s, int k) {
        Map<Character, Integer> freq = new HashMap<>();
        int left = 0, maxLen = 0;

        for (int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);
            freq.merge(c, 1, Integer::sum);

            while (freq.size() > k) {   // window has too many distinct characters
                char leftChar = s.charAt(left);
                freq.merge(leftChar, -1, Integer::sum);
                if (freq.get(leftChar) == 0) {
                    freq.remove(leftChar);
                }
                left++;
            }
            maxLen = Math.max(maxLen, right - left + 1);
        }
        return maxLen;
    }

    public static void main(String[] args) {
        System.out.println(longestSubstringWithKDistinct("araaci", 2));
    }
}
// OUTPUT:
// 4
// (substring "araa" has exactly 2 distinct characters: a, r)`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>How do you find the majority element (appearing more than n/2 times) without a frequency map?</td><td>Boyer-Moore Voting Algorithm - track a candidate and a count, incrementing on a match and decrementing otherwise; the candidate surviving to the end is the majority element, in O(n) time and O(1) space</td></tr>
<tr class='text-center'><td>What is Map.merge() doing under the hood?</td><td>If the key is absent, it inserts the given value; if present, it applies the remapping function (here Integer::sum) to combine the old and new values - equivalent to but cleaner than a manual getOrDefault + put</td></tr>
<tr class='text-center'><td>Why remove a key from the frequency map once its count hits zero?</td><td>So freq.size() accurately reflects the number of DISTINCT characters currently in the window - a stale zero-count entry would overcount distinct characters</td></tr>
</table>`
        }
    ]
};
