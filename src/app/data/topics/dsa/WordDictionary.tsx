import { Topic } from '../../coreJava';

export const wordDictionary: Topic = {
    id: 'dsa-trie-word-dictionary',
    name: 'Word Dictionary',
    beginner: [
        {
            content: `<h4>Search Supporting a Wildcard '.'</h4>
Design a dictionary supporting <code>addWord</code> and <code>search</code>, where <code>search</code> can include <code>.</code> as a wildcard matching ANY single character. A plain Trie traversal breaks on wildcards - the fix is to recursively try EVERY child when a <code>.</code> is encountered, instead of following one fixed path.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.HashMap;
import java.util.Map;

public class WordDictionaryDemo {

    static class TrieNode {
        Map<Character, TrieNode> children = new HashMap<>();
        boolean isEndOfWord = false;
    }

    static class WordDictionary {
        private final TrieNode root = new TrieNode();

        void addWord(String word) {
            TrieNode node = root;
            for (char c : word.toCharArray()) {
                node = node.children.computeIfAbsent(c, k -> new TrieNode());
            }
            node.isEndOfWord = true;
        }

        boolean search(String word) {
            return searchHelper(word, 0, root);
        }

        boolean searchHelper(String word, int index, TrieNode node) {
            if (index == word.length()) return node.isEndOfWord;

            char c = word.charAt(index);
            if (c == '.') {
                // Wildcard: try EVERY possible child
                for (TrieNode child : node.children.values()) {
                    if (searchHelper(word, index + 1, child)) return true;
                }
                return false;
            } else {
                TrieNode child = node.children.get(c);
                return child != null && searchHelper(word, index + 1, child);
            }
        }
    }

    public static void main(String[] args) {
        WordDictionary dict = new WordDictionary();
        dict.addWord("bad");
        dict.addWord("dad");
        dict.addWord("mad");

        System.out.println(dict.search("pad"));
        System.out.println(dict.search("bad"));
        System.out.println(dict.search(".ad"));
        System.out.println(dict.search("b.."));
    }
}
// OUTPUT:
// false
// true
// true
// true`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Worst-Case Complexity - When Wildcards Force Full Branching</h3>
A single <code>.</code> is cheap (branches into however many children exist at that position). But a pattern like <code>"...."</code> (ALL wildcards) forces the search to explore EVERY path in the Trie up to that length - worst case O(26&#8319;) for an n-character all-wildcard pattern, since every position branches into up to 26 possibilities.`,
            codeExamples: [
                `package com.javaschoollab;

public class WildcardWorstCaseDemo {
    public static void main(String[] args) {
        System.out.println("Pattern 'b..' with one wildcard:");
        System.out.println("  - Position 0: fixed 'b', ONE path");
        System.out.println("  - Position 1: wildcard, branches into EVERY child of 'b' node");
        System.out.println("  - Position 2: wildcard again, branches further from each of those");
        System.out.println();
        System.out.println("Pattern '....' with FOUR wildcards, no fixed characters at all:");
        System.out.println("  - Every position branches into up to 26 possibilities");
        System.out.println("  - Worst case: exploring up to 26^4 distinct paths");
        System.out.println();
        System.out.println("In practice, the ACTUAL Trie's branching factor (not the full alphabet)");
        System.out.println("bounds this, since a node with no matching children simply dead-ends early.");
    }
}
// OUTPUT:
// Pattern 'b..' with one wildcard:
// ...`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why can't a plain iterative Trie traversal handle the '.' wildcard?</td><td>Iterative traversal follows exactly ONE path per character; a wildcard needs to potentially follow MULTIPLE paths simultaneously, which naturally requires recursion (or an explicit stack/queue) to explore all branches</td></tr>
<tr class='text-center'><td>What's the best-case and worst-case time complexity of search()?</td><td>Best case O(word length) with no wildcards (same as plain Trie search); worst case O(alphabet_size^wildcard_count) when wildcards force full branching at multiple positions</td></tr>
<tr class='text-center'><td>How would you extend this to support a '*' wildcard matching ZERO OR MORE characters?</td><td>Significantly harder - it would need to try skipping the '*' entirely (zero match) AND consuming one more character while staying on the same '*' (one or more match) at each step, closer to full regex matching than simple Trie search</td></tr>
</table>`
        }
    ]
};
