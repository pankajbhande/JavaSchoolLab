import { Topic } from '../../coreJava';

export const unionFindApplications: Topic = {
    id: 'dsa-graphs-union-find',
    name: 'Union-Find',
    beginner: [
        {
            content: `<h4>Redundant Connection - Finding the Edge That Creates a Cycle</h4>
Given a graph that was originally a tree (n vertices, n-1 edges) with ONE extra edge added, find that extra edge. Process edges in order, union-ing their endpoints - the FIRST edge whose endpoints are ALREADY in the same set is the redundant one (adding it would create a cycle).`,
            codeExamples: [
                `package com.javaschoollab;

public class RedundantConnectionDemo {

    static int[] parent;

    static int find(int x) {
        if (parent[x] != x) parent[x] = find(parent[x]);
        return parent[x];
    }

    static boolean union(int a, int b) {
        int rootA = find(a), rootB = find(b);
        if (rootA == rootB) return false;   // already connected - this edge is REDUNDANT
        parent[rootA] = rootB;
        return true;
    }

    static int[] findRedundantConnection(int[][] edges) {
        int n = edges.length;
        parent = new int[n + 1];
        for (int i = 0; i <= n; i++) parent[i] = i;

        for (int[] edge : edges) {
            if (!union(edge[0], edge[1])) {
                return edge;   // this edge's endpoints were ALREADY connected
            }
        }
        return new int[]{};
    }

    public static void main(String[] args) {
        int[][] edges = {{1, 2}, {1, 3}, {2, 3}};
        System.out.println(java.util.Arrays.toString(findRedundantConnection(edges)));
    }
}
// OUTPUT:
// [2, 3]`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Number of Provinces - Union-Find on a Connectivity Matrix</h3>
Given an <code>n &times; n</code> matrix where <code>isConnected[i][j] = 1</code> means cities i and j are directly connected, find the number of PROVINCES (groups of indirectly connected cities). Union every direct connection, then count DISTINCT roots remaining - a clean application of tracking connected components dynamically.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.HashSet;
import java.util.Set;

public class NumberOfProvincesDemo {

    static int[] parent;

    static int find(int x) {
        if (parent[x] != x) parent[x] = find(parent[x]);
        return parent[x];
    }

    static void union(int a, int b) {
        int rootA = find(a), rootB = find(b);
        if (rootA != rootB) parent[rootA] = rootB;
    }

    static int findProvinces(int[][] isConnected) {
        int n = isConnected.length;
        parent = new int[n];
        for (int i = 0; i < n; i++) parent[i] = i;

        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                if (isConnected[i][j] == 1) {
                    union(i, j);
                }
            }
        }

        Set<Integer> distinctRoots = new HashSet<>();
        for (int i = 0; i < n; i++) {
            distinctRoots.add(find(i));
        }
        return distinctRoots.size();
    }

    public static void main(String[] args) {
        int[][] isConnected = {
            {1, 1, 0},
            {1, 1, 0},
            {0, 0, 1}
        };
        System.out.println(findProvinces(isConnected));
    }
}
// OUTPUT:
// 2`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why does the FIRST edge causing a same-root union() call in Redundant Connection have to be THE answer?</td><td>The problem guarantees exactly ONE extra edge beyond a valid tree structure - processing edges in given order, the first time two already-connected vertices are unioned again is necessarily that one redundant edge, since everything before it formed a valid tree</td></tr>
<tr class='text-center'><td>What's the time complexity of both applications shown?</td><td>Both are O(n * &alpha;(n)) (or O(n^2 * &alpha;(n)) for Number of Provinces' matrix scan) - near-linear thanks to DSU's path compression and union by rank</td></tr>
<tr class='text-center'><td>Could Number of Provinces be solved with plain DFS/BFS instead of Union-Find?</td><td>Yes - it's equally a standard connected-components problem; Union-Find is preferred here mainly for its incremental nature and simplicity when connections are given as a flat edge list or matrix rather than an adjacency structure</td></tr>
</table>`
        }
    ]
};
