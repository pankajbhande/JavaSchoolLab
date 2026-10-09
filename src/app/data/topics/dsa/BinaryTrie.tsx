import { Topic } from '../../coreJava';

export const binaryTrie: Topic = {
    id: 'dsa-trie-binary-trie',
    name: 'Binary Trie',
    beginner: [
        {
            content: `<h4>A Trie Over Bits Instead of Characters</h4>
A Binary Trie stores integers bit by bit (usually from the MOST significant bit down), instead of characters. Each node has at most TWO children (0 or 1) - a fixed alphabet of size 2, which is what makes it so useful for numeric problems, especially involving XOR.`,
            codeExamples: [
                `package com.javaschoollab;

public class BinaryTrieDemo {

    static final int BITS = 8;   // using 8-bit numbers for a compact demo

    static class TrieNode {
        TrieNode[] children = new TrieNode[2];   // only 0 or 1
    }

    static class BinaryTrie {
        private final TrieNode root = new TrieNode();

        void insert(int num) {
            TrieNode node = root;
            for (int i = BITS - 1; i >= 0; i--) {
                int bit = (num >> i) & 1;
                if (node.children[bit] == null) {
                    node.children[bit] = new TrieNode();
                }
                node = node.children[bit];
            }
        }

        boolean contains(int num) {
            TrieNode node = root;
            for (int i = BITS - 1; i >= 0; i--) {
                int bit = (num >> i) & 1;
                if (node.children[bit] == null) return false;
                node = node.children[bit];
            }
            return true;
        }
    }

    public static void main(String[] args) {
        BinaryTrie trie = new BinaryTrie();
        trie.insert(5);    // 00000101
        trie.insert(12);   // 00001100

        System.out.println(trie.contains(5));
        System.out.println(trie.contains(7));
    }
}
// OUTPUT:
// true
// false`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why MSB-First Ordering is Essential for XOR-Related Queries</h3>
Inserting bits from the MOST significant bit down means that at EVERY point during a Trie search, the path taken so far represents the LARGEST-magnitude portion of the number already decided - which is exactly what makes greedy bit-by-bit decisions (like "maximize XOR") correct: getting the highest bit right matters more than any combination of lower bits ever could.`,
            codeExamples: [
                `package com.javaschoollab;

public class MsbFirstReasoningDemo {
    public static void main(String[] args) {
        System.out.println("Why MSB-first matters for XOR maximization:");
        System.out.println();
        System.out.println("A single flipped HIGH bit contributes MORE to the XOR result");
        System.out.println("than flipping EVERY lower bit combined (since bit i contributes 2^i).");
        System.out.println();
        System.out.println("So at each Trie level (highest bit to lowest), the greedy choice is:");
        System.out.println("'prefer the child bit OPPOSITE to the current query bit' (maximizes that");
        System.out.println("bit position's contribution to XOR) - a decision that's provably never");
        System.out.println("worth reversing later, because no combination of lower bits can outweigh it.");
        System.out.println();
        System.out.println("This greedy-safe property ONLY holds because we process MSB first.");
    }
}
// OUTPUT:
// Why MSB-first matters for XOR maximization:
// ...`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why is a Binary Trie's depth always fixed (e.g. 32 for a 32-bit int)?</td><td>Every number is represented with the SAME fixed number of bits, so every insertion path has identical depth - unlike a character Trie where word lengths vary</td></tr>
<tr class='text-center'><td>What's the space complexity of a Binary Trie storing n numbers?</td><td>O(n * BITS) in the worst case (no shared prefixes at the bit level), though shared high-order bits (common for numbers of similar magnitude) reduce this in practice</td></tr>
<tr class='text-center'><td>What class of problems is Binary Trie the standard tool for?</td><td>Maximum/minimum XOR pair or triplet problems, and maximum XOR subarray (combined with prefix XOR) - anywhere the goal involves optimizing an XOR relationship between numbers</td></tr>
</table>`
        }
    ]
};
