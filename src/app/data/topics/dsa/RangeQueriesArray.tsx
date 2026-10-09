import { Topic } from '../../coreJava';

export const rangeQueriesArray: Topic = {
    id: 'dsa-arrays-range-queries',
    name: 'Range Queries',
    beginner: [
        {
            content: `<h4>What is a Range Query?</h4>
A range query asks a question about a sub-range <code>[l, r]</code> of an array - "what's the sum?", "what's the minimum?", "how many elements are &ge; x?" - and it usually needs to be answered MANY times over the same array. The right data structure depends on whether the array changes between queries:
<ul>
<li><b>Static array, many sum queries:</b> Prefix Sum - O(n) build, O(1) per query.</li>
<li><b>Array updated between queries, sum/min/max queries:</b> Segment Tree or Fenwick Tree - O(log n) per update AND per query.</li>
<li><b>Static array, many min/max queries (no updates):</b> Sparse Table - O(n log n) build, O(1) per query.</li>
</ul>`,
            codeExamples: [
                `package com.javaschoollab;

public class StaticRangeSumDemo {

    static int[] buildPrefix(int[] arr) {
        int[] pre = new int[arr.length + 1];  // pre[i] = sum of arr[0..i-1]
        for (int i = 0; i < arr.length; i++) {
            pre[i + 1] = pre[i] + arr[i];
        }
        return pre;
    }

    static int rangeSum(int[] pre, int l, int r) {   // inclusive [l, r]
        return pre[r + 1] - pre[l];
    }

    public static void main(String[] args) {
        int[] arr = {4, 2, 7, 1, 9, 3};
        int[] pre = buildPrefix(arr);

        System.out.println(rangeSum(pre, 1, 4)); // 2+7+1+9
        System.out.println(rangeSum(pre, 0, 5)); // whole array
    }
}
// OUTPUT:
// 19
// 26`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Choosing the Right Structure - the Decision Table</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Situation</th><th>Structure</th><th>Build</th><th>Query</th><th>Update</th></tr>
<tr class='text-center'><td>No updates, sum queries</td><td>Prefix Sum</td><td>O(n)</td><td>O(1)</td><td>-</td></tr>
<tr class='text-center'><td>No updates, min/max queries</td><td>Sparse Table</td><td>O(n log n)</td><td>O(1)</td><td>-</td></tr>
<tr class='text-center'><td>Point updates, sum queries</td><td>Fenwick Tree (BIT)</td><td>O(n log n)</td><td>O(log n)</td><td>O(log n)</td></tr>
<tr class='text-center'><td>Point/range updates, min/max/sum</td><td>Segment Tree</td><td>O(n)</td><td>O(log n)</td><td>O(log n) point, O(log n) range with lazy propagation</td></tr>
<tr class='text-center'><td>Many range updates, one final read</td><td>Difference Array</td><td>O(n)</td><td>O(n) at the end</td><td>O(1) per update</td></tr>
</table>
Interviewers care most about WHY you'd pick one over another - a Sparse Table beats a Segment Tree for static min/max queries because it never needs to support updates, trading that flexibility for O(1) query time instead of O(log n).`,
            codeExamples: [
                `package com.javaschoollab;

// Fenwick Tree (Binary Indexed Tree): point updates + prefix-sum queries, both O(log n)
public class FenwickTreeDemo {

    int[] tree;
    int n;

    FenwickTreeDemo(int n) {
        this.n = n;
        this.tree = new int[n + 1];   // 1-indexed internally
    }

    // Adds 'delta' to the value at index i (1-indexed)
    void update(int i, int delta) {
        for (; i <= n; i += i & (-i)) {
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

        System.out.println("Sum(2,4): " + bit.rangeSum(2, 4));
        bit.update(3, 5);   // arr[3] += 5, e.g. 7 -> 12
        System.out.println("Sum(2,4) after update: " + bit.rangeSum(2, 4));
    }
}
// OUTPUT:
// Sum(2,4): 10
// Sum(2,4) after update: 15`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why can't prefix sum handle updates efficiently?</td><td>A single update at index i invalidates every prefix sum from i onward, requiring an O(n) rebuild - a Fenwick or Segment Tree localizes the update cost to O(log n)</td></tr>
<tr class='text-center'><td>Why does a Sparse Table achieve O(1) min/max queries but not O(1) updates?</td><td>It precomputes the answer for every power-of-two-length range; a range query is answered by combining two overlapping precomputed ranges (min/max tolerate overlap, unlike sum), but any update would invalidate many precomputed ranges</td></tr>
<tr class='text-center'><td>What does "lazy propagation" add to a Segment Tree?</td><td>The ability to apply an update to an entire RANGE in O(log n) instead of O(n) - by marking a "pending update" at a node and only pushing it down to children when that subtree is actually visited</td></tr>
</table>`
        }
    ]
};
