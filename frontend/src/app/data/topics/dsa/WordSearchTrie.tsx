import { Topic } from '../../coreJava';

export const wordSearchTrie: Topic = {
    id: 'dsa-trie-word-search',
    name: 'Word Search',
    beginner: [
        {
            content: `<h4>Why Trie + DFS Beats Checking Each Word Separately</h4>
Searching a letter grid for MULTIPLE dictionary words at once is much faster with a Trie than running a separate DFS per word: the Trie lets DFS paths SHARE work across words with common prefixes, and prune a branch the instant no remaining word continues down that path.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.*;

public class BoggleStyleSearchDemo {

    static class TrieNode {
        Map<Character, TrieNode> children = new HashMap<>();
        String word = null;
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

    static void dfs(char[][] grid, int r, int c, TrieNode node, Set<String> found) {
        if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length || grid[r][c] == '#') return;

        TrieNode next = node.children.get(grid[r][c]);
        if (next == null) return;   // PRUNE: no dictionary word continues this way

        if (next.word != null) found.add(next.word);

        char temp = grid[r][c];
        grid[r][c] = '#';
        int[] dr = {-1, 1, 0, 0}, dc = {0, 0, -1, 1};
        for (int d = 0; d < 4; d++) {
            dfs(grid, r + dr[d], c + dc[d], next, found);
        }
        grid[r][c] = temp;
    }

    public static void main(String[] args) {
        char[][] grid = {
            {'o', 'a', 't'},
            {'e', 'a', 'h'},
            {'k', 'r', 's'}
        };
        TrieNode root = buildTrie(new String[]{"oat", "ear", "eat"});
        Set<String> found = new HashSet<>();

        for (int r = 0; r < grid.length; r++) {
            for (int c = 0; c < grid[0].length; c++) {
                dfs(grid, r, c, root, found);
            }
        }
        System.out.println(found);
    }
}
// OUTPUT:
// [oat, ear, eat]`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Trie Pruning for Cleanup - Removing Found Words</h3>
A further optimization: once a word is found and its leaf node has NO children of its own, remove it from the Trie (and prune any now-empty ancestor nodes). This shrinks the search space for SUBSEQUENT DFS starts, avoiding wasted work re-discovering words already found.`,
            codeExamples: [
                `package com.javaschoollab;

public class TriePruningIdeaDemo {
    public static void main(String[] args) {
        System.out.println("After finding a word at a Trie leaf with no children:");
        System.out.println("1. Clear that leaf's 'word' marker (it's already been reported)");
        System.out.println("2. If the leaf now has zero children AND no word marker,");
        System.out.println("   it's dead weight - remove it from its parent's children map");
        System.out.println("3. Repeat check on the parent - it may now ALSO be prunable");
        System.out.println();
        System.out.println("This keeps the Trie shrinking as words are found, so later DFS");
        System.out.println("starts from OTHER grid cells don't waste time re-exploring paths");
        System.out.println("that can no longer lead to any remaining unfound word.");
    }
}
// OUTPUT:
// After finding a word at a Trie leaf with no children:
// ...`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What's the time complexity of Trie-based multi-word grid search?</td><td>O(rows * cols * 4^maxWordLength) in the worst case, but pruning (both the grid-level "no such prefix" check and Trie node removal) makes it far faster in practice than running independent DFS per word</td></tr>
<tr class='text-center'><td>Why is building the Trie worth the upfront cost for K words?</td><td>Building costs O(sum of word lengths) once; without it, K separate DFS searches would repeatedly re-explore the SAME grid paths for words sharing common prefixes, doing redundant work proportional to K</td></tr>
<tr class='text-center'><td>How does the '#' sentinel marking compare to a separate visited[][] array here?</td><td>Same trade-off as single-word Word Search: O(1) extra space by reusing the grid itself, at the cost of needing to carefully restore the original character after each DFS branch returns</td></tr>
</table>`
        }
    ]
};
