import { Topic } from '../../coreJava';

export const disjointSetUnion: Topic = {
    id: 'dsa-graphs-disjoint-set-union-dsu',
    name: 'Disjoint Set Union - DSU',
    beginner: [
        {
            content: `<h4>Tracking Groups of Connected Elements</h4>
DSU (also called Union-Find) maintains a collection of disjoint (non-overlapping) sets, supporting two operations: <code>find(x)</code> - which set does x belong to (returns a representative "root"), and <code>union(a, b)</code> - merge a's and b's sets into one. Naive implementation without optimization: each element points to a parent, walking up to the root.`,
            codeExamples: [
                `package com.javaschoollab;

public class DsuBasicDemo {

    static int[] parent;

    static void makeSet(int n) {
        parent = new int[n];
        for (int i = 0; i < n; i++) parent[i] = i;   // everyone starts as their own root
    }

    static int find(int x) {
        while (parent[x] != x) {
            x = parent[x];   // walk up to the root
        }
        return x;
    }

    static void union(int a, int b) {
        int rootA = find(a), rootB = find(b);
        if (rootA != rootB) {
            parent[rootA] = rootB;   // attach one root under the other
        }
    }

    public static void main(String[] args) {
        makeSet(5);
        union(0, 1);
        union(1, 2);

        System.out.println("0 and 2 same set: " + (find(0) == find(2)));
        System.out.println("0 and 3 same set: " + (find(0) == find(3)));
    }
}
// OUTPUT:
// 0 and 2 same set: true
// 0 and 3 same set: false`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Path Compression + Union by Rank - Near O(1) Amortized</h3>
Two optimizations transform DSU from O(n) worst-case per operation to nearly O(1) amortized (technically O(&alpha;(n)), the inverse Ackermann function - effectively constant for any realistic n):
<ul>
<li><b>Path compression:</b> during <code>find</code>, repoint every visited node DIRECTLY to the root, flattening future lookups.</li>
<li><b>Union by rank:</b> always attach the SHORTER tree under the TALLER one's root, preventing chains from growing unnecessarily long.</li>
</ul>`,
            codeExamples: [
                `package com.javaschoollab;

public class OptimizedDsuDemo {

    static int[] parent, rank;

    static void makeSet(int n) {
        parent = new int[n];
        rank = new int[n];
        for (int i = 0; i < n; i++) parent[i] = i;
    }

    static int find(int x) {
        if (parent[x] != x) {
            parent[x] = find(parent[x]);   // PATH COMPRESSION: point directly to the root
        }
        return parent[x];
    }

    static void union(int a, int b) {
        int rootA = find(a), rootB = find(b);
        if (rootA == rootB) return;

        // UNION BY RANK: attach the shorter tree under the taller one
        if (rank[rootA] < rank[rootB]) {
            parent[rootA] = rootB;
        } else if (rank[rootA] > rank[rootB]) {
            parent[rootB] = rootA;
        } else {
            parent[rootB] = rootA;
            rank[rootA]++;
        }
    }

    public static void main(String[] args) {
        makeSet(6);
        union(0, 1);
        union(2, 3);
        union(1, 2);

        System.out.println("0 and 3 same set: " + (find(0) == find(3)));
        System.out.println("0 and 4 same set: " + (find(0) == find(4)));
    }
}
// OUTPUT:
// 0 and 3 same set: true
// 0 and 4 same set: false`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why is DSU's amortized complexity O(&alpha;(n)) rather than truly O(1)?</td><td>The inverse Ackermann function grows so slowly that it's less than 5 for any n up to astronomically large values - effectively constant in practice, but not a mathematically strict O(1) in the worst case</td></tr>
<tr class='text-center'><td>Why does path compression alone (without union by rank) still give good performance?</td><td>Path compression alone gives O(log n) amortized; combining BOTH optimizations together is what achieves the near-O(1) O(&alpha;(n)) bound - each optimization helps independently, but they're strongest combined</td></tr>
<tr class='text-center'><td>What class of problems is DSU the standard tool for?</td><td>Detecting cycles in an undirected graph, Kruskal's MST algorithm, counting/tracking connected components dynamically, and "redundant connection" style problems</td></tr>
</table>`
        }
    ]
};
