import { Topic } from '../../coreJava';

export const xorProblemsTrie: Topic = {
    id: 'dsa-trie-xor-problems-trie',
    name: 'XOR Problems (Trie)',
    beginner: [
        {
            content: `<h4>Maximum XOR of Two Numbers in an Array</h4>
Naive approach checks every pair - O(n&sup2;). Insert every number into a Binary Trie, then for EACH number, greedily walk the Trie preferring the OPPOSITE bit at every level (maximizing XOR contribution) - O(n &times; BITS), dramatically faster.`,
            codeExamples: [
                `package com.javaschoollab;

public class MaxXorPairDemo {

    static final int BITS = 32;

    static class TrieNode {
        TrieNode[] children = new TrieNode[2];
    }

    static TrieNode root = new TrieNode();

    static void insert(int num) {
        TrieNode node = root;
        for (int i = BITS - 1; i >= 0; i--) {
            int bit = (num >> i) & 1;
            if (node.children[bit] == null) node.children[bit] = new TrieNode();
            node = node.children[bit];
        }
    }

    static int maxXorWith(int num) {
        TrieNode node = root;
        int result = 0;
        for (int i = BITS - 1; i >= 0; i--) {
            int bit = (num >> i) & 1;
            int wantedBit = 1 - bit;   // opposite bit maximizes this position's XOR contribution

            if (node.children[wantedBit] != null) {
                result |= (1 << i);
                node = node.children[wantedBit];
            } else {
                node = node.children[bit];   // forced to settle for the same bit
            }
        }
        return result;
    }

    static int findMaxXor(int[] nums) {
        root = new TrieNode();
        for (int num : nums) insert(num);

        int maxXor = 0;
        for (int num : nums) {
            maxXor = Math.max(maxXor, maxXorWith(num));
        }
        return maxXor;
    }

    public static void main(String[] args) {
        int[] nums = {3, 10, 5, 25, 2, 8};
        System.out.println(findMaxXor(nums));
    }
}
// OUTPUT:
// 28`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Maximum XOR Subarray - Combining Binary Trie with Prefix XOR</h3>
XOR has a property just like sum: <code>xor(l, r) = prefixXor[r] XOR prefixXor[l-1]</code>. So maximizing a SUBARRAY's XOR reduces to: as you compute running prefix XORs left to right, insert each into a Binary Trie, and at each step find the maximum XOR against all PREVIOUSLY inserted prefixes - the same greedy Trie walk as the pair problem, applied to a running prefix XOR stream.`,
            codeExamples: [
                `package com.javaschoollab;

public class MaxXorSubarrayDemo {

    static final int BITS = 32;

    static class TrieNode {
        TrieNode[] children = new TrieNode[2];
    }

    static TrieNode root = new TrieNode();

    static void insert(int num) {
        TrieNode node = root;
        for (int i = BITS - 1; i >= 0; i--) {
            int bit = (num >> i) & 1;
            if (node.children[bit] == null) node.children[bit] = new TrieNode();
            node = node.children[bit];
        }
    }

    static int maxXorWith(int num) {
        TrieNode node = root;
        int result = 0;
        for (int i = BITS - 1; i >= 0; i--) {
            int bit = (num >> i) & 1;
            int wantedBit = 1 - bit;
            if (node.children[wantedBit] != null) {
                result |= (1 << i);
                node = node.children[wantedBit];
            } else {
                node = node.children[bit];
            }
        }
        return result;
    }

    static int maxXorSubarray(int[] arr) {
        root = new TrieNode();
        insert(0);   // seed with prefixXor of an EMPTY prefix

        int prefixXor = 0, maxXor = 0;
        for (int num : arr) {
            prefixXor ^= num;
            maxXor = Math.max(maxXor, maxXorWith(prefixXor));
            insert(prefixXor);
        }
        return maxXor;
    }

    public static void main(String[] args) {
        int[] arr = {1, 2, 3, 4};
        System.out.println(maxXorSubarray(arr));
    }
}
// OUTPUT:
// 7`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What's the time complexity of Maximum XOR Pair with a Binary Trie?</td><td>O(n * BITS) - n insertions plus n greedy walks, each O(BITS) - versus O(n^2) for the naive all-pairs comparison</td></tr>
<tr class='text-center'><td>Why must prefixXor(0) be seeded into the Trie before the main loop in Max XOR Subarray?</td><td>It represents the "empty prefix" case, allowing a subarray starting from index 0 to be correctly considered (its XOR is simply prefixXor[r] XOR 0)</td></tr>
<tr class='text-center'><td>Why does node = node.children[bit] as a fallback (not returning early) matter when the wanted bit is unavailable?</td><td>Even if the ideal (opposite) bit isn't available at this level, the search must still descend SOMEWHERE to continue evaluating lower bits correctly - falling back to the same-bit child is the only valid path forward in the Trie</td></tr>
</table>`
        }
    ]
};
