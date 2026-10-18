import { Topic } from '../../coreJava';

export const autoComplete: Topic = {
    id: 'dsa-trie-auto-complete',
    name: 'Auto-complete',
    beginner: [
        {
            content: `<h4>Suggesting All Words That Complete a Prefix</h4>
Given a prefix typed so far, find ALL stored words starting with it - walk the Trie down to the prefix's node in O(prefix length), then DFS from there collecting every complete word found below it.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.*;

public class AutoCompleteDemo {

    static class TrieNode {
        Map<Character, TrieNode> children = new HashMap<>();
        boolean isEndOfWord = false;
    }

    static class Trie {
        private final TrieNode root = new TrieNode();

        void insert(String word) {
            TrieNode node = root;
            for (char c : word.toCharArray()) {
                node = node.children.computeIfAbsent(c, k -> new TrieNode());
            }
            node.isEndOfWord = true;
        }

        List<String> autocomplete(String prefix) {
            List<String> results = new ArrayList<>();
            TrieNode node = root;
            for (char c : prefix.toCharArray()) {
                node = node.children.get(c);
                if (node == null) return results;   // no word has this prefix
            }
            collectWords(node, new StringBuilder(prefix), results);
            return results;
        }

        void collectWords(TrieNode node, StringBuilder current, List<String> results) {
            if (node.isEndOfWord) results.add(current.toString());
            for (Map.Entry<Character, TrieNode> entry : node.children.entrySet()) {
                current.append(entry.getKey());
                collectWords(entry.getValue(), current, results);
                current.deleteCharAt(current.length() - 1);   // backtrack
            }
        }
    }

    public static void main(String[] args) {
        Trie trie = new Trie();
        for (String w : new String[]{"car", "card", "care", "cat", "dog"}) {
            trie.insert(w);
        }
        System.out.println(trie.autocomplete("car"));
    }
}
// OUTPUT:
// [car, card, care]`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Ranking Suggestions by Frequency - a Real Autocomplete Feature</h3>
Real autocomplete (search engines, IDEs) ranks suggestions by POPULARITY, not just alphabetically. Storing a frequency count at each word-ending node, then using a min-heap of size K during collection, gives the TOP-K most popular completions efficiently.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.*;

public class RankedAutoCompleteDemo {

    static class TrieNode {
        Map<Character, TrieNode> children = new HashMap<>();
        boolean isEndOfWord = false;
        int frequency = 0;
    }

    static class Trie {
        private final TrieNode root = new TrieNode();

        void insert(String word, int frequency) {
            TrieNode node = root;
            for (char c : word.toCharArray()) {
                node = node.children.computeIfAbsent(c, k -> new TrieNode());
            }
            node.isEndOfWord = true;
            node.frequency = frequency;
        }

        List<String> topKCompletions(String prefix, int k) {
            TrieNode node = root;
            for (char c : prefix.toCharArray()) {
                node = node.children.get(c);
                if (node == null) return new ArrayList<>();
            }

            PriorityQueue<String[]> minHeap = new PriorityQueue<>(
                (a, b) -> Integer.parseInt(a[1]) - Integer.parseInt(b[1]));

            collect(node, new StringBuilder(prefix), minHeap, k);

            List<String> result = new ArrayList<>();
            while (!minHeap.isEmpty()) result.add(minHeap.poll()[0]);
            Collections.reverse(result);   // highest frequency first
            return result;
        }

        void collect(TrieNode node, StringBuilder current, PriorityQueue<String[]> minHeap, int k) {
            if (node.isEndOfWord) {
                minHeap.offer(new String[]{current.toString(), String.valueOf(node.frequency)});
                if (minHeap.size() > k) minHeap.poll();
            }
            for (Map.Entry<Character, TrieNode> entry : node.children.entrySet()) {
                current.append(entry.getKey());
                collect(entry.getValue(), current, minHeap, k);
                current.deleteCharAt(current.length() - 1);
            }
        }
    }

    public static void main(String[] args) {
        Trie trie = new Trie();
        trie.insert("car", 50);
        trie.insert("card", 90);
        trie.insert("care", 20);

        System.out.println(trie.topKCompletions("car", 2));
    }
}
// OUTPUT:
// [card, car]`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What's the time complexity of basic autocomplete?</td><td>O(prefix length) to reach the prefix node, plus O(number of matching words) to collect them all via DFS</td></tr>
<tr class='text-center'><td>Why use a min-heap of size K instead of collecting all matches and sorting?</td><td>Same Top-K pattern as elsewhere: bounding the heap to K keeps memory and per-insertion cost small (O(log k)), avoiding the need to hold and fully sort every matching word when only the top K are needed</td></tr>
<tr class='text-center'><td>What real systems use Trie-based autocomplete with frequency ranking?</td><td>Search engine query suggestions, IDE code completion, and phone keyboard predictive text all use this exact pattern - a Trie for prefix lookup, frequency/recency data for ranking</td></tr>
</table>`
        }
    ]
};
