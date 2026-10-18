import { Topic } from '../../coreJava';

export const huffmanCoding: Topic = {
    id: 'dsa-greedy-huffman-coding',
    name: 'Huffman Coding',
    beginner: [
        {
            content: `<h4>Optimal Prefix-Free Compression</h4>
Huffman Coding assigns SHORTER binary codes to MORE FREQUENT characters, minimizing total encoded size. It builds a binary tree greedily: repeatedly take the TWO least-frequent nodes (using a min-heap), merge them into a new node (frequency = sum), and repeat until one tree remains. A character's code is the path of 0s/1s from root to its leaf.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.PriorityQueue;

public class HuffmanCodingDemo {

    static class Node {
        char ch;
        int freq;
        Node left, right;
        Node(char ch, int freq) { this.ch = ch; this.freq = freq; }
        Node(int freq, Node left, Node right) {
            this.freq = freq; this.left = left; this.right = right;
        }
    }

    static Node buildHuffmanTree(char[] chars, int[] freqs) {
        PriorityQueue<Node> minHeap = new PriorityQueue<>((a, b) -> a.freq - b.freq);
        for (int i = 0; i < chars.length; i++) {
            minHeap.offer(new Node(chars[i], freqs[i]));
        }

        while (minHeap.size() > 1) {
            Node left = minHeap.poll();    // two LEAST frequent nodes
            Node right = minHeap.poll();
            minHeap.offer(new Node(left.freq + right.freq, left, right));   // merge
        }
        return minHeap.poll();
    }

    static void printCodes(Node node, String code) {
        if (node == null) return;
        if (node.left == null && node.right == null) {
            System.out.println(node.ch + ": " + code);
            return;
        }
        printCodes(node.left, code + "0");
        printCodes(node.right, code + "1");
    }

    public static void main(String[] args) {
        char[] chars = {'a', 'b', 'c', 'd'};
        int[] freqs = {5, 9, 12, 13};

        Node root = buildHuffmanTree(chars, freqs);
        printCodes(root, "");
    }
}
// OUTPUT:
// c: 00
// a: 010
// b: 011
// d: 1`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why Merging the Two Least-Frequent Nodes is Optimal</h3>
The two rarest characters ending up DEEPEST in the tree (longest codes) minimizes their contribution to total size, since they occur least often - a classic greedy exchange argument: swapping any two leaves so a MORE frequent character got a LONGER code than a LESS frequent one would only increase the total encoded length, never decrease it. This guarantees Huffman's tree achieves the theoretical minimum total encoded size among all prefix-free codes.`,
            codeExamples: [
                `package com.javaschoollab;

public class HuffmanOptimalityDemo {
    public static void main(String[] args) {
        System.out.println("Exchange argument: suppose character X (frequency 5) got a SHORTER code");
        System.out.println("than character Y (frequency 20) in some encoding.");
        System.out.println();
        System.out.println("Swapping their codes would change total size by:");
        System.out.println("(freq_Y - freq_X) * (len_X - len_Y)");
        System.out.println();
        System.out.println("Since freq_Y > freq_X and len_X < len_Y (X's code was shorter),");
        System.out.println("this product is NEGATIVE - meaning the swap REDUCES total size,");
        System.out.println("contradicting the assumption that the original encoding was optimal.");
        System.out.println();
        System.out.println("So an optimal code must give MORE frequent characters SHORTER codes -");
        System.out.println("exactly what merging the two LEAST frequent nodes first achieves.");
    }
}
// OUTPUT:
// Exchange argument: suppose character X (frequency 5) got a SHORTER code
// than character Y (frequency 20) in some encoding.
//
// Swapping their codes would change total size by:
// (freq_Y - freq_X) * (len_X - len_Y)
//
// Since freq_Y > freq_X and len_X < len_Y (X's code was shorter),
// this product is NEGATIVE - meaning the swap REDUCES total size,
// contradicting the assumption that the original encoding was optimal.
//
// So an optimal code must give MORE frequent characters SHORTER codes -
// exactly what merging the two LEAST frequent nodes first achieves.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What's the time complexity of building a Huffman tree?</td><td>O(n log n) - n-1 merge operations, each doing two O(log n) heap extractions and one O(log n) insertion</td></tr>
<tr class='text-center'><td>Why is the resulting code "prefix-free" (no code is a prefix of another)?</td><td>Every character ends up at a LEAF of the tree, and no leaf can be an ancestor of another leaf in a binary tree - so no character's code path can be a prefix of another's</td></tr>
<tr class='text-center'><td>What real-world formats use Huffman Coding?</td><td>DEFLATE (used in ZIP, gzip, PNG) uses Huffman Coding as one of its compression stages, typically combined with LZ77-style dictionary matching first</td></tr>
</table>`
        }
    ]
};
