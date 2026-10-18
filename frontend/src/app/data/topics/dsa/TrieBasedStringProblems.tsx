import { Topic } from '../../coreJava';

export const trieBasedStringProblems: Topic = {
    id: 'dsa-strings-trie-based-string-problems',
    name: 'Trie-based String Problems',
    beginner: [
        {
            content: `<h4>Why a Trie for String Problems?</h4>
A Trie (prefix tree) stores strings character by character down a tree, so all words sharing a prefix share the same path from the root. This makes prefix-based operations - "does any word start with X?", "insert", "search" - O(word length) instead of scanning every word in the dictionary.`,
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
        trie.insert("apple");

        System.out.println(trie.search("apple"));      // exact word inserted
        System.out.println(trie.search("app"));         // not inserted as a full word
        System.out.println(trie.startsWith("app"));      // but "app" IS a prefix
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
            content: `<h3>Word Search II - Trie + DFS Backtracking on a Grid</h3>
A classic hard interview problem: given a grid of letters and a dictionary of words, find every dictionary word that can be formed by a path of adjacent cells. Building a Trie of all dictionary words FIRST lets the DFS prune a search branch the moment no word shares that prefix - dramatically faster than checking each word independently against the whole grid.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.*;

public class WordSearchTrieDemo {

    static class TrieNode {
        Map<Character, TrieNode> children = new HashMap<>();
        String word = null;   // set at the node where a full word ends
    }

    static TrieNode buildTrie(String[] words) {
        TrieNode root = new TrieNode();
        for (String w : words) {
            TrieNode node = root;
            for (char c : w.toCharArray()) {
                node = node.children.computeIfAbsent(c, k -> new TrieNode());
            }
            node.word = w;
        }
        return root;
    }

    static void dfs(char[][] board, int r, int c, TrieNode node, Set<String> found) {
        char ch = board[r][c];
        TrieNode next = node.children.get(ch);
        if (next == null) return;   // prune: no dictionary word continues with this letter

        if (next.word != null) {
            found.add(next.word);
        }

        board[r][c] = '#';   // mark visited
        int[] dr = {-1, 1, 0, 0}, dc = {0, 0, -1, 1};
        for (int d = 0; d < 4; d++) {
            int nr = r + dr[d], nc = c + dc[d];
            if (nr >= 0 && nr < board.length && nc >= 0 && nc < board[0].length && board[nr][nc] != '#') {
                dfs(board, nr, nc, next, found);
            }
        }
        board[r][c] = ch;   // backtrack: restore for other search paths
    }

    static List<String> findWords(char[][] board, String[] words) {
        TrieNode root = buildTrie(words);
        Set<String> found = new HashSet<>();
        for (int r = 0; r < board.length; r++) {
            for (int c = 0; c < board[0].length; c++) {
                dfs(board, r, c, root, found);
            }
        }
        return new ArrayList<>(found);
    }

    public static void main(String[] args) {
        char[][] board = {
            {'o','a','a','n'},
            {'e','t','a','e'},
            {'i','h','k','r'},
            {'i','f','l','v'}
        };
        System.out.println(findWords(board, new String[]{"oath", "pea", "eat", "rain"}));
    }
}
// OUTPUT:
// [eat, oath]`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What's the time complexity of insert/search in a Trie?</td><td>O(L) where L is the word's length - independent of how many other words are stored, unlike scanning a list of words</td></tr>
<tr class='text-center'><td>Why build a Trie for Word Search II instead of checking each word separately against the grid?</td><td>The Trie lets the DFS share work across words with a common prefix and prune branches early the moment no dictionary word continues down that path - checking words independently repeats the same grid exploration for every word</td></tr>
<tr class='text-center'><td>What's the space trade-off of a Trie vs a HashSet of words?</td><td>A Trie can use MORE memory when words share few prefixes (each node has overhead), but a HashSet can't answer "does any word start with X?" in better than O(number of words) - the Trie trades some memory for fast prefix queries</td></tr>
</table>`
        }
    ]
};
