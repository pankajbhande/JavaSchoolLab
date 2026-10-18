import { Topic } from '../../coreJava';

export const segmentTree: Topic = {
    id: 'dsa-advanced-data-structures-segment-tree',
    name: 'Segment Tree',
    beginner: [
        {
            content: `<h4>O(log n) Range Queries AND Point Updates</h4>
A Segment Tree is a binary tree where each node covers a RANGE of the array; leaves are single elements, and internal nodes combine their two children's ranges. Both range queries (sum, min, max over [l,r]) and point updates run in O(log n) - beating a plain array's O(n) range query or a prefix-sum array's O(n) update.`,
            codeExamples: [
                `package com.javaschoollab;

public class SegmentTreeSumDemo {

    int[] tree;
    int n;

    SegmentTreeSumDemo(int[] arr) {
        n = arr.length;
        tree = new int[4 * n];   // safe upper bound on required size
        build(arr, 1, 0, n - 1);
    }

    void build(int[] arr, int node, int start, int end) {
        if (start == end) {
            tree[node] = arr[start];
            return;
        }
        int mid = (start + end) / 2;
        build(arr, 2 * node, start, mid);
        build(arr, 2 * node + 1, mid + 1, end);
        tree[node] = tree[2 * node] + tree[2 * node + 1];   // combine children
    }

    int query(int node, int start, int end, int l, int r) {
        if (r < start || end < l) return 0;              // no overlap
        if (l <= start && end <= r) return tree[node];    // total overlap

        int mid = (start + end) / 2;
        return query(2 * node, start, mid, l, r) + query(2 * node + 1, mid + 1, end, l, r);
    }

    void update(int node, int start, int end, int index, int value) {
        if (start == end) {
            tree[node] = value;
            return;
        }
        int mid = (start + end) / 2;
        if (index <= mid) update(2 * node, start, mid, index, value);
        else update(2 * node + 1, mid + 1, end, index, value);
        tree[node] = tree[2 * node] + tree[2 * node + 1];   // recompute after update
    }

    public static void main(String[] args) {
        int[] arr = {1, 3, 5, 7, 9, 11};
        SegmentTreeSumDemo st = new SegmentTreeSumDemo(arr);

        System.out.println(st.query(1, 0, arr.length - 1, 1, 3));   // sum of arr[1..3]
        st.update(1, 0, arr.length - 1, 1, 10);                       // arr[1] = 10
        System.out.println(st.query(1, 0, arr.length - 1, 1, 3));
    }
}
// OUTPUT:
// 15
// 22`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why "No Overlap / Total Overlap / Partial Overlap" is the Whole Algorithm</h3>
Every query recursion boils down to exactly THREE cases at each node: the query range doesn't touch this node's range at all (return neutral value, e.g. 0 for sum), the query range FULLY contains this node's range (return the precomputed total directly, no need to go deeper), or PARTIAL overlap (recurse into both children and combine). This three-way split is what bounds the query to O(log n) - only O(log n) nodes ever have partial overlap at each level, and full/no-overlap nodes terminate immediately.`,
            codeExamples: [
                `package com.javaschoollab;

public class SegmentTreeCasesDemo {
    public static void main(String[] args) {
        System.out.println("Query case 1 - NO OVERLAP: [query range] and [node range] don't intersect");
        System.out.println("  -> return neutral element (0 for sum, +infinity for min, -infinity for max)");
        System.out.println();
        System.out.println("Query case 2 - TOTAL OVERLAP: [node range] is ENTIRELY within [query range]");
        System.out.println("  -> return tree[node] directly - the precomputed answer for this whole subtree");
        System.out.println();
        System.out.println("Query case 3 - PARTIAL OVERLAP: ranges overlap but neither contains the other");
        System.out.println("  -> recurse into BOTH children and combine their results");
        System.out.println();
        System.out.println("Only O(log n) nodes across the whole tree ever hit case 3 for any given query -");
        System.out.println("this is what bounds total query work to O(log n).");
    }
}
// OUTPUT:
// Query case 1 - NO OVERLAP: [query range] and [node range] don't intersect
// ...`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why allocate 4*n for the tree array instead of exactly 2n?</td><td>4n is a safe, simple upper bound that guarantees enough space for a non-perfectly-balanced tree's node indices (based on 1-indexed heap-style numbering) regardless of n's exact value - the precise tight bound is more complex to derive</td></tr>
<tr class='text-center'><td>What's the time complexity of build, query, and update?</td><td>build: O(n); query and update: O(log n) each - the tree's height bounds all per-operation work</td></tr>
<tr class='text-center'><td>When would you choose a Segment Tree over a Fenwick Tree?</td><td>When the combine operation isn't simple addition (min, max, GCD - anything without an easy "inverse" for subtraction-based tricks), or when RANGE updates (not just point updates) are needed - Segment Tree with lazy propagation handles that cleanly, while Fenwick Tree needs more specialized tricks</td></tr>
</table>`
        }
    ]
};
