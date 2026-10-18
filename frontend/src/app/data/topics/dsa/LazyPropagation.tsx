import { Topic } from '../../coreJava';

export const lazyPropagation: Topic = {
    id: 'dsa-advanced-data-structures-lazy-propagation',
    name: 'Lazy Propagation',
    beginner: [
        {
            content: `<h4>O(log n) RANGE Updates, Not Just Point Updates</h4>
Plain Segment Tree updates ONE element in O(log n). Updating an entire RANGE naively means updating each element individually - O(range size &times; log n), far too slow for large ranges. Lazy propagation fixes this: mark a node's update as PENDING instead of immediately pushing it to all descendants, only propagating it down when that subtree is actually visited later.`,
            codeExamples: [
                `package com.javaschoollab;

public class LazyPropagationDemo {

    int[] tree, lazy;
    int n;

    LazyPropagationDemo(int size) {
        n = size;
        tree = new int[4 * n];
        lazy = new int[4 * n];
    }

    // Adds 'value' to every element in range [l, r]
    void updateRange(int node, int start, int end, int l, int r, int value) {
        if (lazy[node] != 0) {
            tree[node] += (end - start + 1) * lazy[node];   // apply this node's own pending update
            if (start != end) {
                lazy[2 * node] += lazy[node];       // defer to children - don't recurse yet
                lazy[2 * node + 1] += lazy[node];
            }
            lazy[node] = 0;
        }

        if (r < start || end < l) return;               // no overlap

        if (l <= start && end <= r) {                     // total overlap
            tree[node] += (end - start + 1) * value;
            if (start != end) {
                lazy[2 * node] += value;                    // defer to children
                lazy[2 * node + 1] += value;
            }
            return;
        }

        int mid = (start + end) / 2;
        updateRange(2 * node, start, mid, l, r, value);
        updateRange(2 * node + 1, mid + 1, end, l, r, value);
        tree[node] = tree[2 * node] + tree[2 * node + 1];
    }

    int queryRange(int node, int start, int end, int l, int r) {
        if (lazy[node] != 0) {
            tree[node] += (end - start + 1) * lazy[node];
            if (start != end) {
                lazy[2 * node] += lazy[node];
                lazy[2 * node + 1] += lazy[node];
            }
            lazy[node] = 0;
        }

        if (r < start || end < l) return 0;
        if (l <= start && end <= r) return tree[node];

        int mid = (start + end) / 2;
        return queryRange(2 * node, start, mid, l, r) + queryRange(2 * node + 1, mid + 1, end, l, r);
    }

    public static void main(String[] args) {
        LazyPropagationDemo st = new LazyPropagationDemo(6);
        st.updateRange(1, 0, 5, 1, 3, 5);   // add 5 to indices [1,3]
        System.out.println(st.queryRange(1, 0, 5, 0, 5));
    }
}
// OUTPUT:
// 15`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why "Push Down Only When Visited" Preserves O(log n)</h3>
The key insight: a pending lazy update only needs to be PUSHED DOWN to children the moment that subtree is actually touched again by a LATER query or update - not immediately when the update is first applied. This defers potentially O(range size) work into small O(1) pushes that happen naturally, one level at a time, exactly when and where needed - keeping every single operation bounded at O(log n) instead of O(range size).`,
            codeExamples: [
                `package com.javaschoollab;

public class LazyDeferredWorkDemo {
    public static void main(String[] args) {
        System.out.println("WITHOUT lazy propagation:");
        System.out.println("  Range update [l, r] must individually touch EVERY covered node,");
        System.out.println("  potentially O(range size) nodes - slow for large ranges.");
        System.out.println();
        System.out.println("WITH lazy propagation:");
        System.out.println("  A node whose range is ENTIRELY covered by [l, r] gets marked");
        System.out.println("  'pending update' and STOPS recursing further - O(log n) such nodes total.");
        System.out.println("  The pending mark is only pushed to children LATER, if and when");
        System.out.println("  a future operation actually needs to descend into that subtree.");
        System.out.println();
        System.out.println("This 'pay only when needed' deferral is what keeps EVERY operation O(log n).");
    }
}
// OUTPUT:
// WITHOUT lazy propagation:
// ...`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What's the time complexity of range update and range query with lazy propagation?</td><td>Both O(log n) - the same bound as plain Segment Tree's point operations, now extended to full ranges</td></tr>
<tr class='text-center'><td>Why must every query ALSO check and push down lazy[node], not just updates?</td><td>A pending update might affect the value a query is about to read - if the query doesn't apply/push the pending update first, it could return a STALE (pre-update) value</td></tr>
<tr class='text-center'><td>What real-world problems need range updates efficiently?</td><td>Range increment operations in competitive programming (add X to every element in [l,r]), interval-based scheduling/booking systems, and any scenario needing both efficient bulk updates AND efficient range queries simultaneously</td></tr>
</table>`
        }
    ]
};
