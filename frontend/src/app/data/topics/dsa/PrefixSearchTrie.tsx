import { Topic } from '../../coreJava';

export const prefixSearchTrie: Topic = {
    id: 'dsa-trie-prefix-search',
    name: 'Prefix Search',
    beginner: [
        {
            content: `<h4>Counting Words With a Given Prefix</h4>
Augment each Trie node with a counter tracking how many words pass through it - answering "how many words start with X" becomes an O(prefix length) lookup instead of scanning every stored word.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.HashMap;
import java.util.Map;

public class PrefixCountTrieDemo {

    static class TrieNode {
        Map<Character, TrieNode> children = new HashMap<>();
        int wordsWithThisPrefix = 0;
        boolean isEndOfWord = false;
    }

    static class Trie {
        private final TrieNode root = new TrieNode();

        void insert(String word) {
            TrieNode node = root;
            for (char c : word.toCharArray()) {
                node = node.children.computeIfAbsent(c, k -> new TrieNode());
                node.wordsWithThisPrefix++;   // every node ON THE PATH counts this word
            }
            node.isEndOfWord = true;
        }

        int countWordsWithPrefix(String prefix) {
            TrieNode node = root;
            for (char c : prefix.toCharArray()) {
                node = node.children.get(c);
                if (node == null) return 0;
            }
            return node.wordsWithThisPrefix;
        }
    }

    public static void main(String[] args) {
        Trie trie = new Trie();
        for (String w : new String[]{"apple", "app", "application", "apt"}) {
            trie.insert(w);
        }

        System.out.println(trie.countWordsWithPrefix("app"));
        System.out.println(trie.countWordsWithPrefix("apt"));
    }
}
// OUTPUT:
// 3
// 1`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Finding the Longest Common Prefix of All Stored Words</h3>
Walk down from the root as long as each node has EXACTLY ONE child and isn't itself a complete word - the moment the path branches (or a word ends), the longest shared prefix has been found.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.HashMap;
import java.util.Map;

public class LongestCommonPrefixTrieDemo {

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

        String longestCommonPrefix() {
            StringBuilder result = new StringBuilder();
            TrieNode node = root;

            while (node.children.size() == 1 && !node.isEndOfWord) {
                char onlyChar = node.children.keySet().iterator().next();
                result.append(onlyChar);
                node = node.children.get(onlyChar);
            }
            return result.toString();
        }
    }

    public static void main(String[] args) {
        Trie trie = new Trie();
        for (String w : new String[]{"flower", "flow", "flight"}) {
            trie.insert(w);
        }
        System.out.println(trie.longestCommonPrefix());
    }
}
// OUTPUT:
// fl`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why does incrementing wordsWithThisPrefix on EVERY node along the insert path work correctly?</td><td>Every node on a word's path is, by definition, a prefix of that word - incrementing all of them means each node's counter accurately reflects how many inserted words share that specific prefix</td></tr>
<tr class='text-center'><td>What's the time complexity of counting words with a prefix?</td><td>O(prefix length) - a direct walk down the Trie, no scanning of the actual word list needed</td></tr>
<tr class='text-center'><td>Why must the longest-common-prefix walk stop at a node marking isEndOfWord?</td><td>If a shorter word is ALSO a complete word stored in the Trie, extending the "common prefix" further would produce a prefix that isn't actually shared by that shorter word - the walk must respect word boundaries, not just branching</td></tr>
</table>`
        }
    ]
};
