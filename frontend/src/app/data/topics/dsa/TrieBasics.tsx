import { Topic } from '../../coreJava';

export const trieBasics: Topic = {
    id: 'dsa-trie-trie',
    name: 'Trie',
    beginner: [
        {
            content: `<h4>The Prefix Tree Data Structure</h4>
A Trie stores strings character by character down a tree - every node represents one character, and words sharing a prefix share the same path from the root. This is what gives O(word length) insert/search, independent of how many total words are stored.

<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:12px 0;">
<svg viewBox="0 0 260 130" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:260px;height:auto;font-family:monospace">
  <circle cx="30" cy="20" r="13" fill="#f3f4f6" stroke="#9ca3af"/><text x="30" y="24" text-anchor="middle" font-size="10" fill="#6b7280">root</text>
  <circle cx="30" cy="65" r="13" fill="#fff7ed" stroke="#ea580c"/><text x="30" y="69" text-anchor="middle" font-size="11" fill="#9a3412">c</text>
  <circle cx="30" cy="110" r="13" fill="#fff7ed" stroke="#ea580c"/><text x="30" y="114" text-anchor="middle" font-size="11" fill="#9a3412">a</text>
  <circle cx="90" cy="110" r="13" fill="#ecfdf5" stroke="#059669"/><text x="90" y="114" text-anchor="middle" font-size="11" fill="#065f46">t*</text>
  <circle cx="150" cy="110" r="13" fill="#ecfdf5" stroke="#059669"/><text x="150" y="114" text-anchor="middle" font-size="11" fill="#065f46">r*</text>
  <line x1="30" y1="33" x2="30" y2="52" stroke="#6b7280"/>
  <line x1="30" y1="78" x2="30" y2="97" stroke="#6b7280"/>
  <line x1="43" y1="110" x2="77" y2="110" stroke="#6b7280"/>
  <line x1="43" y1="105" x2="137" y2="110" stroke="#6b7280"/>
</svg>
</div>
<span style="font-size:12px;color:#6b7280">* marks the end of a complete word ("cat", "car")</span>`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.HashMap;
import java.util.Map;

public class TrieDemo {

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

        boolean search(String word) {
            TrieNode node = traverse(word);
            return node != null && node.isEndOfWord;
        }

        boolean startsWith(String prefix) {
            return traverse(prefix) != null;
        }

        private TrieNode traverse(String s) {
            TrieNode node = root;
            for (char c : s.toCharArray()) {
                node = node.children.get(c);
                if (node == null) return null;
            }
            return node;
        }
    }

    public static void main(String[] args) {
        Trie trie = new Trie();
        trie.insert("cat");
        trie.insert("car");

        System.out.println(trie.search("cat"));
        System.out.println(trie.search("ca"));
        System.out.println(trie.startsWith("ca"));
    }
}
// OUTPUT:
// true
// false
// true`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Array-Based Children Instead of a HashMap</h3>
For a fixed, small alphabet (lowercase a-z), using a <code>TrieNode[26]</code> array instead of a <code>HashMap&lt;Character, TrieNode&gt;</code> avoids hashing overhead entirely - direct index access via <code>c - 'a'</code>, matching the same optimization used for frequency counting.`,
            codeExamples: [
                `package com.javaschoollab;

public class ArrayBasedTrieDemo {

    static class TrieNode {
        TrieNode[] children = new TrieNode[26];
        boolean isEndOfWord = false;
    }

    static class Trie {
        private final TrieNode root = new TrieNode();

        void insert(String word) {
            TrieNode node = root;
            for (char c : word.toCharArray()) {
                int index = c - 'a';
                if (node.children[index] == null) {
                    node.children[index] = new TrieNode();
                }
                node = node.children[index];
            }
            node.isEndOfWord = true;
        }

        boolean search(String word) {
            TrieNode node = traverse(word);
            return node != null && node.isEndOfWord;
        }

        private TrieNode traverse(String s) {
            TrieNode node = root;
            for (char c : s.toCharArray()) {
                node = node.children[c - 'a'];
                if (node == null) return null;
            }
            return node;
        }
    }

    public static void main(String[] args) {
        Trie trie = new Trie();
        trie.insert("dog");
        System.out.println(trie.search("dog"));
    }
}
// OUTPUT:
// true`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What's the time complexity of insert/search/startsWith?</td><td>O(L) where L is the string's length - independent of how many other words are already stored</td></tr>
<tr class='text-center'><td>What's the space complexity of a Trie?</td><td>O(total characters across all inserted words) in the worst case (no shared prefixes), but often much less in practice due to prefix sharing</td></tr>
<tr class='text-center'><td>Array-based children vs HashMap - what's the trade-off?</td><td>Array is faster (no hashing) but wastes memory for a large/sparse alphabet (26 pointers per node even if only 1-2 are used); HashMap uses memory proportional to actual children, at the cost of hashing overhead per lookup</td></tr>
</table>`
        }
    ]
};
