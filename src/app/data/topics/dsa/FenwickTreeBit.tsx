import { Topic } from '../../coreJava';

export const fenwickTreeBit: Topic = {
    id: 'dsa-advanced-data-structures-fenwick-tree-bit',
    name: 'Fenwick Tree / BIT',
    beginner: [
        {
            content: `<h4>A Simpler O(log n) Structure for Prefix Sums</h4>
A Fenwick Tree (Binary Indexed Tree) supports point updates and PREFIX sum queries in O(log n), using a single array and clever bit manipulation - no explicit tree nodes or pointers needed, and far less code than a Segment Tree. The trick: index <code>i</code>'s value covers a range determined by <code>i</code>'s LOWEST SET BIT.`,
            codeExamples: [
                `package com.javaschoollab;

public class FenwickTreeDemo {

    int[] tree;
    int n;

    FenwickTreeDemo(int size) {
        n = size;
        tree = new int[n + 1];   // 1-indexed
    }

    // Adds 'delta' to the value at index i
    void update(int i, int delta) {
        for (; i <= n; i += i & (-i)) {   // i & (-i) isolates the lowest set bit
            tree[i] += delta;
        }
    }

    // Sum of arr[1..i]
    int prefixSum(int i) {
        int sum = 0;
        for (; i > 0; i -= i & (-i)) {
            sum += tree[i];
        }
        return sum;
    }

    int rangeSum(int l, int r) {
        return prefixSum(r) - prefixSum(l - 1);
    }

    public static void main(String[] args) {
        FenwickTreeDemo bit = new FenwickTreeDemo(6);
        int[] arr = {0, 4, 2, 7, 1, 9, 3};   // 1-indexed, index 0 unused

        for (int i = 1; i <= 6; i++) bit.update(i, arr[i]);

        System.out.println(bit.rangeSum(2, 4));
        bit.update(3, 5);   // arr[3] += 5
        System.out.println(bit.rangeSum(2, 4));
    }
}
// OUTPUT:
// 10
// 15`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why i & (-i) Isolates the Lowest Set Bit - and What It Means</h3>
In two's complement, <code>-i</code> is the bitwise NOT of i, plus 1. This flips every bit up to and including the lowest set bit, then adding 1 causes ALL those flipped bits to cancel except the original lowest set bit, which survives unchanged. The result: <code>i & (-i)</code> isolates JUST that one bit - which represents exactly how much RESPONSIBILITY index i has (how many array elements its stored value summarizes).`,
            codeExamples: [
                `package com.javaschoollab;

public class LowestSetBitDemo {
    public static void main(String[] args) {
        int[] values = {6, 8, 12, 7};
        for (int i : values) {
            int lowestBit = i & (-i);
            System.out.println(i + " (binary " + Integer.toBinaryString(i) + ")"
                + " -> lowest set bit = " + lowestBit
                + " -> covers " + lowestBit + " elements ending at index " + i);
        }
    }
}
// OUTPUT:
// 6 (binary 110) -> lowest set bit = 2 -> covers 2 elements ending at index 6
// 8 (binary 1000) -> lowest set bit = 8 -> covers 8 elements ending at index 8
// 12 (binary 1100) -> lowest set bit = 4 -> covers 4 elements ending at index 12
// 7 (binary 111) -> lowest set bit = 1 -> covers 1 elements ending at index 7`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why does update() move FORWARD (i += lowestBit) but prefixSum() moves BACKWARD (i -= lowestBit)?</td><td>update() must touch every ancestor whose range INCLUDES index i - moving forward via the parent-in-the-tree relationship; prefixSum() must sum up disjoint ranges that TOGETHER cover [1, i] - moving backward decomposes i into those ranges</td></tr>
<tr class='text-center'><td>Why is Fenwick Tree usually preferred over Segment Tree for simple prefix/range SUM problems?</td><td>Far less code (single array, no recursion needed), better constant factors (simpler bit operations vs tree traversal), and easier to implement correctly under interview time pressure - though it's less flexible for non-sum operations (min/max don't have the needed "inverse" for range subtraction)</td></tr>
<tr class='text-center'><td>Can a Fenwick Tree support RANGE updates with point queries, or range updates with range queries?</td><td>Yes, with a trick: maintaining TWO Fenwick Trees together can support range updates and range sum queries simultaneously, using a mathematical transformation similar in spirit to how difference arrays extend plain prefix sums</td></tr>
</table>`
        }
    ]
};
