// Module 28 (Data Structures & Algorithms), part B: ordered structures, sorting and searching.
import { dd, r, type DeepDive } from './deepDive';

export const m28b: Record<string, DeepDive> = {
    'Binary Search Trees': dd(
        [`A <b>binary search tree (BST)</b> is a binary tree where every value in the left subtree is smaller than the node and every value in the right subtree is larger. That ordering lets you discard half the tree at each step, and an in-order walk returns the values sorted.`,
            r`class Node:
    def __init__(self, val):
        self.val, self.left, self.right = val, None, None

def insert(root, v):
    if root is None:
        return Node(v)
    if v < root.val:
        root.left = insert(root.left, v)       # smaller goes left
    elif v > root.val:
        root.right = insert(root.right, v)     # larger goes right
    return root

def inorder(n):
    return inorder(n.left) + [n.val] + inorder(n.right) if n else []

root = None
for v in [5, 3, 8, 1, 4]:
    root = insert(root, v)
print(inorder(root))          # in-order of a BST is always sorted

# OUTPUT:
# [1, 3, 4, 5, 8]`],
        [`A sorted list searches fast but inserts slowly (shifting); an unsorted list inserts fast but searches slowly. A BST keeps both search and insert near O(log n) when it is balanced.`,
            r`class Node:
    def __init__(self, val):
        self.val, self.left, self.right = val, None, None

def insert(root, v):
    if root is None: return Node(v)
    if v < root.val: root.left = insert(root.left, v)
    else:            root.right = insert(root.right, v)
    return root

def search(root, target):
    steps = 0
    while root:
        steps += 1
        if target == root.val:
            return steps
        root = root.left if target < root.val else root.right   # discard one half
    return None

root = None
for v in [50, 30, 70, 20, 40, 60, 80]:
    root = insert(root, v)
print("found 60 after", search(root, 60), "comparisons")
print("missing 65:", search(root, 65))

# OUTPUT:
# found 60 after 3 comparisons
# missing 65: 3`],
        [`Ordered maps and sets (leaderboards, schedulers, time-series indexes, database B-trees) rely on ordered tree structures. Because of the ordering you can answer range questions such as "all prices between 25 and 65" without scanning everything.`,
            r`class Node:
    def __init__(self, val):
        self.val, self.left, self.right = val, None, None

def insert(root, v):
    if root is None: return Node(v)
    if v < root.val: root.left = insert(root.left, v)
    else:            root.right = insert(root.right, v)
    return root

def in_range(n, lo, hi):
    if n is None: return []
    out = []
    if lo < n.val: out += in_range(n.left, lo, hi)     # left only if it can hold values >= lo
    if lo <= n.val <= hi: out.append(n.val)
    if n.val < hi: out += in_range(n.right, lo, hi)    # right only if it can hold values <= hi
    return out

root = None
for v in [50, 30, 70, 20, 40, 60, 80]:
    root = insert(root, v)
print(in_range(root, 25, 65))

# OUTPUT:
# [30, 40, 50, 60]`],
        [`<b>Advantages:</b> keeps data sorted automatically, O(log n) search/insert/delete when balanced, and supports min, max, successor and range queries.`,
            r`class Node:
    def __init__(self, val):
        self.val, self.left, self.right = val, None, None

def insert(root, v):
    if root is None: return Node(v)
    if v < root.val: root.left = insert(root.left, v)
    else:            root.right = insert(root.right, v)
    return root

root = None
for v in [50, 30, 70, 20, 40, 60, 80]:
    root = insert(root, v)

lo = hi = root
while lo.left:  lo = lo.left        # minimum = keep going left
while hi.right: hi = hi.right       # maximum = keep going right
print("min", lo.val, "max", hi.val)

# OUTPUT:
# min 20 max 80`],
        [`<b>Disadvantages:</b> shape depends on insertion order. Inserting already-sorted data builds a chain, so operations become O(n).`,
            r`class Node:
    def __init__(self, val):
        self.val, self.left, self.right = val, None, None

def insert(root, v):
    if root is None: return Node(v)
    if v < root.val: root.left = insert(root.left, v)
    else:            root.right = insert(root.right, v)
    return root

def height(n):
    return 0 if n is None else 1 + max(height(n.left), height(n.right))

def build(values):
    root = None
    for v in values:
        root = insert(root, v)
    return root

print("sorted input  :", height(build([1, 2, 3, 4, 5, 6, 7])))
print("balanced order:", height(build([4, 2, 6, 1, 3, 5, 7])))

# OUTPUT:
# sorted input  : 7
# balanced order: 3`],
        [`<b>Limitations:</b> a plain BST has no self-balancing and no standard duplicate policy; this version silently ignores duplicates. Production code uses AVL, red-black trees, B-trees, or Python's <code>bisect</code> on a list instead.`,
            r`class Node:
    def __init__(self, val):
        self.val, self.left, self.right = val, None, None

def insert(root, v):
    if root is None: return Node(v)
    if v < root.val: root.left = insert(root.left, v)
    elif v > root.val: root.right = insert(root.right, v)   # equal: ignored
    return root

def size(n):
    return 0 if n is None else 1 + size(n.left) + size(n.right)

root = None
for v in [5, 5, 5]:
    root = insert(root, v)
print("inserted 3 values, tree holds", size(root))

# OUTPUT:
# inserted 3 values, tree holds 1`],
        r`
              50
            /    \
          30      70        rule: left < node < right
         /  \    /  \
       20   40  60   80

   search 60:  50 -> go right -> 70 -> go left -> 60  (3 steps)
   balanced: O(log n)        skewed (sorted input): O(n)
`,
        `Do not hand-roll a BST in production; use the database index, <code>sortedcontainers.SortedList</code>, or <code>bisect</code> over a list. If you must build one, use a self-balancing variant and iterative operations. A hash table is better when you never need ordering or ranges.`
    ),

    'Heaps': dd(
        [`A <b>heap</b> is a tree stored in an array where each parent is smaller than (min-heap) or larger than (max-heap) its children, so the smallest item is always at index 0. Python's <code>heapq</code> module implements a min-heap on a plain list.`,
            r`import heapq

heap = []
for x in (5, 1, 3):
    heapq.heappush(heap, x)          # O(log n) insert
print(heapq.heappop(heap))           # O(log n): always the smallest
print(heap)                          # remaining items, still a valid heap

# OUTPUT:
# 1
# [3, 5]`],
        [`Sometimes you only need "the next most important item", not a full sort. A heap hands you the minimum in O(log n) while still accepting new items at any time, which re-sorting a list each time cannot do cheaply.`,
            r`import heapq

todo = []
heapq.heappush(todo, (2, "write report"))     # (priority, task): lower = more urgent
heapq.heappush(todo, (1, "fix prod bug"))
heapq.heappush(todo, (3, "lunch"))
while todo:
    prio, task = heapq.heappop(todo)
    print(prio, task)

# OUTPUT:
# 1 fix prod bug
# 2 write report
# 3 lunch`],
        [`Task schedulers, Dijkstra's shortest path, event simulations, merging sorted log files and "top K" analytics all use heaps. Here a size-3 min-heap tracks the 3 largest values of a stream using constant memory.`,
            r`import heapq

stream = [5, 1, 9, 3, 7, 8, 2]
top3 = []
for x in stream:
    if len(top3) < 3:
        heapq.heappush(top3, x)
    elif x > top3[0]:                      # beats the smallest of the current top 3
        heapq.heapreplace(top3, x)         # pop smallest, push x
print(sorted(top3))

# OUTPUT:
# [7, 8, 9]`],
        [`<b>Advantages:</b> O(1) peek of the minimum, O(log n) push/pop, and <code>heapify</code> builds a heap from an existing list in O(n).`,
            r`import heapq

nums = [9, 4, 7, 1]
heapq.heapify(nums)              # in place, O(n)
print(nums, "min =", nums[0])

# OUTPUT:
# [1, 4, 7, 9] min = 1`],
        [`<b>Disadvantages:</b> the list is only partially ordered: the root is the minimum but the rest is not sorted, so you cannot print or binary-search it directly.`,
            r`import heapq

heap = []
for x in (5, 4, 3, 2, 1):
    heapq.heappush(heap, x)
print(heap)                      # NOT sorted, only heap-ordered
print([heapq.heappop(heap) for _ in range(5)])   # popping everything gives sorted order

# OUTPUT:
# [1, 2, 4, 5, 3]
# [1, 2, 3, 4, 5]`],
        [`<b>Limitations:</b> <code>heapq</code> is min-heap only (negate numbers for a max-heap), and finding or removing an arbitrary item is O(n).`,
            r`import heapq

nums = [3, 1, 4]
maxheap = [-x for x in nums]         # negate to simulate a max-heap
heapq.heapify(maxheap)
print(-heapq.heappop(maxheap))       # largest item

print(4 in nums)                     # membership is still a linear scan

# OUTPUT:
# 4
# True`],
        r`
   array: [ 1, 3, 2, 7, 4 ]            tree view:
   index:   0  1  2  3  4                    1          <- min at root
                                           /   \
   parent(i)  = (i - 1) // 2              3     2
   children   = 2i+1 , 2i+2              / \
                                        7   4

   push: add at end, bubble UP      pop: swap root with last, bubble DOWN
`,
        `Use a heap for priority scheduling, top-K and k-way merges; use <code>heapq.nlargest</code> for small K. For priority queues across threads use <code>queue.PriorityQueue</code>; across services use a broker with priorities. If you need decrease-key or removal, add lazy deletion (mark entries stale) or a different structure.`
    ),

    'Tries': dd(
        [`A <b>trie</b> (prefix tree) stores strings character by character; words that share a prefix share the same path of nodes. A marker on a node says "a word ends here".`,
            r`def make():
    return {}

def insert(trie, word):
    node = trie
    for ch in word:
        node = node.setdefault(ch, {})     # create the child if missing
    node["#"] = True                        # mark end of a word

def walk(trie, text):
    node = trie
    for ch in text:
        if ch not in node:
            return None
        node = node[ch]
    return node

t = make()
for w in ("cat", "car", "dog"):
    insert(t, w)

print(walk(t, "car") is not None and "#" in walk(t, "car"))   # whole word?
print(walk(t, "ca") is not None and "#" in walk(t, "ca"))     # only a prefix
print(walk(t, "ca") is not None)                              # starts_with("ca")

# OUTPUT:
# True
# False
# True`],
        [`Questions like "which words start with these letters?" are slow on a list (scan everything) and awkward on a hash set (hashing needs the full word). A trie answers prefix questions by following one path.`,
            r`def insert(trie, word):
    node = trie
    for ch in word:
        node = node.setdefault(ch, {})
    node["#"] = True

def collect(node, prefix):
    out = []
    if "#" in node:
        out.append(prefix)
    for ch in sorted(k for k in node if k != "#"):
        out += collect(node[ch], prefix + ch)
    return out

t = {}
for w in ("car", "card", "care", "cat", "dog"):
    insert(t, w)

node = t
for ch in "car":                       # walk down the prefix once
    node = node[ch]
print(collect(node, "car"))

# OUTPUT:
# ['car', 'card', 'care']`],
        [`Search-box autocomplete, spell checkers, IP routing tables (longest prefix match), phone contact search and T9 keyboards all use tries.`,
            r`def insert(trie, word):
    node = trie
    for ch in word:
        node = node.setdefault(ch, {})
    node["#"] = True

def suggest(trie, prefix):
    node = trie
    for ch in prefix:
        if ch not in node:
            return []
        node = node[ch]
    out, stack = [], [(node, prefix)]
    while stack:
        n, p = stack.pop()
        if "#" in n:
            out.append(p)
        for ch, child in n.items():
            if ch != "#":
                stack.append((child, p + ch))
    return sorted(out)

t = {}
for w in ("apple", "app", "apply", "apt", "bat"):
    insert(t, w)
print(suggest(t, "app"))
print(suggest(t, "z"))

# OUTPUT:
# ['app', 'apple', 'apply']
# []`],
        [`<b>Advantages:</b> lookup time depends only on the word length, not on how many words are stored, and shared prefixes are stored once.`,
            r`def insert(trie, word):
    node = trie
    for ch in word:
        node = node.setdefault(ch, {})
    node["#"] = True

def count_nodes(node):
    return sum(1 + count_nodes(child) for ch, child in node.items() if ch != "#")

t = {}
words = ("car", "card", "care")
for w in words:
    insert(t, w)
print(sum(len(w) for w in words), "characters stored in", count_nodes(t), "nodes")

# OUTPUT:
# 11 characters stored in 5 nodes`],
        [`<b>Disadvantages:</b> each node is a dict, so memory is heavy when words share little; a plain <code>set</code> of strings is far smaller.`,
            r`def insert(trie, word):
    node = trie
    for ch in word:
        node = node.setdefault(ch, {})
    node["#"] = True

def count_nodes(node):
    return sum(1 + count_nodes(child) for ch, child in node.items() if ch != "#")

t = {}
words = ["alpha", "bravo", "charlie"]    # no shared prefixes
for w in words:
    insert(t, w)
print(len(words), "words ->", count_nodes(t), "dict nodes")

# OUTPUT:
# 3 words -> 17 dict nodes`],
        [`<b>Limitations:</b> it matches characters exactly, so case, accents and typos are not handled unless you normalise input first; it is also in-memory only.`,
            r`def insert(trie, word):
    node = trie
    for ch in word:
        node = node.setdefault(ch, {})
    node["#"] = True

def has_word(trie, word):
    node = trie
    for ch in word:
        if ch not in node:
            return False
        node = node[ch]
    return "#" in node

t = {}
insert(t, "car")
print(has_word(t, "Car"))                # exact characters only
print(has_word(t, "Car".lower()))        # normalise first

# OUTPUT:
# False
# True`],
        r`
   words: car, card, cat, dog

            (root)
           /      \
          c        d
          |        |
          a        o
         / \       |
        r   t*     g*          * = end of word
        |
        d*     "car" is a word AND the prefix of "card"
`,
        `Tries shine for prefix-heavy workloads on bounded vocabularies. For huge dictionaries use compressed variants (radix trees, DAWGs) or let a search engine (Elasticsearch, Redis) handle it. If you only need exact membership, a <code>set</code> is simpler, smaller and faster.`
    ),

    'Graphs': dd(
        [`A <b>graph</b> is a set of vertices (nodes) joined by edges. Edges may be directed or undirected and may carry weights. The most common Python representation is an adjacency list: a dict mapping each node to its neighbours.`,
            r`graph = {                      # directed graph as an adjacency list
    "A": ["B", "C"],
    "B": ["D"],
    "C": ["D"],
    "D": [],
}
print("neighbours of A:", graph["A"])
print("vertices:", len(graph), "edges:", sum(len(v) for v in graph.values()))

# OUTPUT:
# neighbours of A: ['B', 'C']
# vertices: 4 edges: 4`],
        [`Lists and trees cannot express arbitrary relationships such as friendships, road maps or dependencies, where many nodes connect to many others and cycles are allowed. Graphs can.`,
            r`from collections import defaultdict

friends = defaultdict(set)
def add_friendship(a, b):          # undirected: add both directions
    friends[a].add(b)
    friends[b].add(a)

add_friendship("Ann", "Baji")
add_friendship("Baji", "Cy")
add_friendship("Ann", "Di")

# friends of friends of Ann (excluding Ann and her direct friends)
direct = friends["Ann"]
fof = set().union(*(friends[f] for f in direct)) - direct - {"Ann"}
print(sorted(direct), sorted(fof))

# OUTPUT:
# ['Baji', 'Di'] ['Cy']`],
        [`Maps and GPS, social networks, recommendation engines, dependency managers, network topologies and fraud detection are graph problems. A basic real task is counting isolated groups (connected components).`,
            r`edges = [(1, 2), (2, 3), (4, 5)]
nodes = [1, 2, 3, 4, 5, 6]
adj = {n: [] for n in nodes}
for a, b in edges:
    adj[a].append(b)
    adj[b].append(a)

seen, components = set(), 0
for start in nodes:
    if start in seen:
        continue
    components += 1                    # new unexplored group found
    stack = [start]
    while stack:                       # DFS marks everything reachable
        n = stack.pop()
        if n in seen:
            continue
        seen.add(n)
        stack.extend(adj[n])
print("components:", components)

# OUTPUT:
# components: 3`],
        [`<b>Advantages:</b> models any relationship; an adjacency list uses O(V + E) memory and lists neighbours in O(1), which suits the sparse graphs found in real life.`,
            r`graph = {"A": ["B", "C"], "B": ["C"], "C": []}
total_edges = sum(len(n) for n in graph.values())
print("memory is proportional to V+E:", len(graph), "+", total_edges, "=", len(graph) + total_edges)

# OUTPUT:
# memory is proportional to V+E: 3 + 3 = 6`],
        [`<b>Disadvantages:</b> an adjacency matrix needs V x V cells even when almost empty, and checking "is there an edge A-B?" in an adjacency list costs O(degree).`,
            r`# Same 4-node path graph: 0-1, 1-2, 2-3
V = 4
matrix = [[0] * V for _ in range(V)]
for a, b in [(0, 1), (1, 2), (2, 3)]:
    matrix[a][b] = matrix[b][a] = 1
for row in matrix:
    print(row)
print("cells:", V * V, "but only 3 edges")

# OUTPUT:
# [0, 1, 0, 0]
# [1, 0, 1, 0]
# [0, 1, 0, 1]
# [0, 0, 1, 0]
# cells: 16 but only 3 edges`],
        [`<b>Limitations:</b> graphs may contain cycles, so any traversal must remember visited nodes or it loops forever. Python has no built-in graph type (use dicts, or libraries like networkx).`,
            r`graph = {"A": ["B"], "B": ["A"]}      # A and B point at each other (a cycle)

def walk_no_memory(start, limit=6):
    path, node = [], start
    while len(path) < limit:             # without 'limit' this would never stop
        path.append(node)
        node = graph[node][0]
    return path

print(walk_no_memory("A"))

def walk_with_visited(start):
    seen, order, stack = set(), [], [start]
    while stack:
        n = stack.pop()
        if n in seen: continue
        seen.add(n); order.append(n); stack.extend(graph[n])
    return order
print(walk_with_visited("A"))

# OUTPUT:
# ['A', 'B', 'A', 'B', 'A', 'B']
# ['A', 'B']`],
        r`
   Directed graph                 Adjacency list
        A ----> B                 A : [B, C]
        |       |                 B : [D]
        v       v                 C : [D]
        C ----> D                 D : []

   V = 4 vertices, E = 4 edges      memory O(V + E)
`,
        `Pick the representation by density: adjacency list for sparse graphs, matrix for dense ones or constant-time edge checks. For serious analytics use <code>networkx</code> or a graph database (Neo4j); at huge scale you need partitioned graph engines. Do not model plain hierarchies as graphs; trees are simpler.`
    ),

    'Sorting': dd(
        [`<b>Sorting</b> arranges items in a defined order. Python provides <code>sorted()</code> (returns a new list) and <code>list.sort()</code> (in place), both using Timsort, a stable O(n log n) algorithm. Understanding a classic like merge sort shows how it works.`,
            r`def merge_sort(a):
    if len(a) <= 1:
        return a
    mid = len(a) // 2
    left, right = merge_sort(a[:mid]), merge_sort(a[mid:])    # divide
    out, i, j = [], 0, 0
    while i < len(left) and j < len(right):                   # merge two sorted halves
        if left[i] <= right[j]:
            out.append(left[i]); i += 1
        else:
            out.append(right[j]); j += 1
    return out + left[i:] + right[j:]

data = [5, 2, 9, 1, 7, 3]
print(merge_sort(data))
print(sorted(data) == merge_sort(data))     # same as the built-in

# OUTPUT:
# [1, 2, 3, 5, 7, 9]
# True`],
        [`Sorted data enables binary search, easy duplicate detection, readable reports and merging. Python's <code>key=</code> argument lets you sort by any rule without writing a comparison function.`,
            r`words = ["pear", "fig", "apple", "kiwi"]
print(sorted(words, key=lambda w: (len(w), w)))   # by length, then alphabetically
print(sorted(words, reverse=True))

# OUTPUT:
# ['fig', 'kiwi', 'pear', 'apple']
# ['pear', 'kiwi', 'fig', 'apple']`],
        [`Leaderboards, product listings, log timelines and payroll reports all sort records on several fields. Negating a number sorts it descending inside a tuple key.`,
            r`staff = [("Ann", "IT", 90), ("Baji", "HR", 70), ("Cy", "IT", 95), ("Di", "HR", 80)]
# department A-Z, then salary high-to-low
for name, dept, pay in sorted(staff, key=lambda s: (s[1], -s[2])):
    print(dept, name, pay)

# OUTPUT:
# HR Di 80
# HR Baji 70
# IT Cy 95
# IT Ann 90`],
        [`<b>Advantages:</b> Timsort is stable (equal items keep their original order), adaptive (fast on nearly sorted data) and worst-case O(n log n). Stability allows multi-pass sorting.`,
            r`rows = [("Ann", "IT"), ("Baji", "HR"), ("Cy", "IT"), ("Di", "HR")]
by_dept = sorted(rows, key=lambda r: r[1])    # Baji stays before Di, Ann before Cy
print(by_dept)

# OUTPUT:
# [('Baji', 'HR'), ('Di', 'HR'), ('Ann', 'IT'), ('Cy', 'IT')]`],
        [`<b>Disadvantages:</b> comparison sorts cannot beat O(n log n), and naive algorithms such as bubble sort are O(n^2), which collapses on large inputs.`,
            r`def bubble_sort(a):
    comparisons = swaps = 0
    n = len(a)
    for i in range(n - 1):
        for j in range(n - 1 - i):
            comparisons += 1
            if a[j] > a[j + 1]:
                a[j], a[j + 1] = a[j + 1], a[j]
                swaps += 1
    return comparisons, swaps

print(bubble_sort(list(range(10, 0, -1))))   # worst case: reversed input

# OUTPUT:
# (45, 45)`],
        [`<b>Limitations:</b> items must be mutually comparable, and <code>list.sort()</code> returns <code>None</code> because it changes the list in place, a frequent source of bugs.`,
            r`try:
    sorted([3, "a"])
except TypeError as e:
    print("TypeError:", e)

nums = [3, 1, 2]
print(nums.sort())        # None! sort() works in place
print(nums)

# OUTPUT:
# TypeError: '<' not supported between instances of 'str' and 'int'
# None
# [1, 2, 3]`],
        r`
   [5 2 9 1 7 3]
        |  divide
   [5 2 9]   [1 7 3]
    |            |
   [2 5 9]   [1 3 7]       sort each half
        \      /
     merge (two pointers)
   [1 2 3 5 7 9]       O(n log n), stable
`,
        `Use the built-in <code>sorted</code>/<code>sort</code> with <code>key=</code> for almost everything; it is C-optimised and stable. Implement your own only to learn or for special needs (external sorting of data larger than RAM, counting sort for small integer ranges). For huge data push sorting into the database or a distributed engine.`
    ),

    'Searching & Binary Search': dd(
        [`<b>Searching</b> locates an item in a collection. Linear search checks each item (O(n)); <b>binary search</b> works on sorted data and halves the range every step (O(log n)).`,
            r`def binary_search(items, target):
    lo, hi = 0, len(items) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if items[mid] == target:
            return mid
        if items[mid] < target:
            lo = mid + 1          # target must be in the right half
        else:
            hi = mid - 1          # target must be in the left half
    return -1

data = [1, 3, 5, 7, 9, 11]
print(binary_search(data, 7))
print(binary_search(data, 4))

# OUTPUT:
# 3
# -1`],
        [`With a million sorted records a linear search may need a million checks, while binary search needs at most about twenty. Doubling the data adds only one extra step.`,
            r`import math
n = 1_000_000
print("linear worst case :", n)
print("binary worst case :", math.ceil(math.log2(n + 1)))

# OUTPUT:
# linear worst case : 1000000
# binary worst case : 20`],
        [`Database indexes, dictionary lookups, version bisecting (<code>git bisect</code>), and range tables such as grade boundaries or tax brackets all use binary search. The <code>bisect</code> module does it for you.`,
            r`from bisect import bisect

breakpoints = [60, 70, 80, 90]          # F < 60 <= D < 70 <= C < 80 <= B < 90 <= A
grades = "FDCBA"
scores = [59, 60, 85, 90, 100]
print("".join(grades[bisect(breakpoints, s)] for s in scores))

# OUTPUT:
# FDBAA`],
        [`<b>Advantages:</b> logarithmic speed, tiny memory, and <code>bisect</code> can keep a list sorted while inserting and find insertion points for ties.`,
            r`from bisect import bisect_left, bisect_right, insort

a = [1, 3, 3, 5]
print(bisect_left(a, 3), bisect_right(a, 3))   # first and one-past-last position of 3
insort(a, 4)                                   # insert while keeping order
print(a)

# OUTPUT:
# 1 3
# [1, 3, 3, 4, 5]`],
        [`<b>Disadvantages:</b> the data must already be sorted. On unsorted data binary search silently returns a wrong answer rather than an error.`,
            r`def binary_search(items, target):
    lo, hi = 0, len(items) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if items[mid] == target: return mid
        if items[mid] < target: lo = mid + 1
        else: hi = mid - 1
    return -1

unsorted = [5, 1, 9, 3, 7]
print(binary_search(unsorted, 3), "- but 3 really is at index", unsorted.index(3))

# OUTPUT:
# -1 - but 3 really is at index 3`],
        [`<b>Limitations:</b> it needs random access and is famously easy to get wrong with off-by-one boundaries. Using <code>lo &lt; hi</code> instead of <code>lo &lt;= hi</code> misses the last remaining candidate.`,
            r`def buggy(items, target):
    lo, hi = 0, len(items) - 1
    while lo < hi:                       # BUG: stops before checking lo == hi
        mid = (lo + hi) // 2
        if items[mid] == target: return mid
        if items[mid] < target: lo = mid + 1
        else: hi = mid - 1
    return -1

def correct(items, target):
    lo, hi = 0, len(items) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if items[mid] == target: return mid
        if items[mid] < target: lo = mid + 1
        else: hi = mid - 1
    return -1

print(buggy([7], 7), correct([7], 7))

# OUTPUT:
# -1 0`],
        r`
   find 7 in  [1 3 5 7 9 11 13]
               lo       mid        hi
   step 1:     1 3 5 [7] 9 11 13      7 == 7 -> found at index 3

   find 11:    step 1: mid = 7  < 11  -> keep right half [9 11 13]
               step 2: mid = 11 == 11 -> found
   each step discards half of the remaining range: O(log n)
`,
        `Sort once, search many times; if you search rarely, a linear scan or a set is cheaper than sorting. Binary search generalises to "search on the answer" for any monotonic condition (capacity planning, minimum speed). Prefer <code>bisect</code> over hand-written loops to avoid boundary bugs.`
    ),

    'Two Pointers': dd(
        [`The <b>two-pointer</b> technique uses two indexes that move through a sequence (often from both ends, or one fast and one slow) to solve problems in a single pass instead of nested loops.`,
            r`# Sorted two-sum: one pointer at each end, move toward the middle
nums = [1, 2, 4, 7, 11, 15]
target = 15
l, r = 0, len(nums) - 1
while l < r:
    s = nums[l] + nums[r]
    if s == target:
        print("indexes", (l, r), "values", (nums[l], nums[r]))
        break
    elif s < target:
        l += 1            # need a bigger sum
    else:
        r -= 1            # need a smaller sum

# OUTPUT:
# indexes (2, 4) values (4, 11)`],
        [`Brute force compares every pair (O(n^2)). When order gives you information, two pointers reduce it to O(n) with O(1) extra memory, for example removing duplicates from a sorted array in place.`,
            r`nums = [1, 1, 2, 2, 3]
write = 1                              # next slot for a unique value
for read in range(1, len(nums)):       # fast pointer scans, slow pointer writes
    if nums[read] != nums[read - 1]:
        nums[write] = nums[read]
        write += 1
print(nums[:write], "length", write)

# OUTPUT:
# [1, 2, 3] length 3`],
        [`Merging two sorted streams (merge step of merge sort, merging sorted log files), checking palindromes, and partitioning data all use this pattern.`,
            r`a, b = [1, 4, 7], [2, 3, 9]
i = j = 0
merged = []
while i < len(a) and j < len(b):       # always take the smaller front item
    if a[i] <= b[j]:
        merged.append(a[i]); i += 1
    else:
        merged.append(b[j]); j += 1
merged += a[i:] + b[j:]                # one list is exhausted; copy the rest
print(merged)

# OUTPUT:
# [1, 2, 3, 4, 7, 9]`],
        [`<b>Advantages:</b> O(n) time, O(1) extra space, and in-place updates, such as reversing a list without making a copy.`,
            r`items = [1, 2, 3, 4, 5]
l, r = 0, len(items) - 1
while l < r:
    items[l], items[r] = items[r], items[l]    # swap the ends, move inward
    l += 1
    r -= 1
print(items)

# OUTPUT:
# [5, 4, 3, 2, 1]`],
        [`<b>Disadvantages:</b> the shrinking logic depends on order. On unsorted data the pointers discard valid pairs and the answer is wrong.`,
            r`nums = [4, 1, 11, 2]            # NOT sorted
target = 15
l, r, found = 0, len(nums) - 1, None
while l < r:
    s = nums[l] + nums[r]
    if s == target:
        found = (nums[l], nums[r]); break
    elif s < target: l += 1
    else: r -= 1
print(found, "- but 4 + 11 = 15 exists")

# OUTPUT:
# None - but 4 + 11 = 15 exists`],
        [`<b>Limitations:</b> it fits pair or sequential problems; for triples you need an outer loop, so three-sum is O(n^2) overall (still better than O(n^3)). It also needs the data sorted first, an O(n log n) cost.`,
            r`def three_sum(nums):
    nums.sort()
    out = []
    for i in range(len(nums) - 2):
        if i > 0 and nums[i] == nums[i - 1]:
            continue                            # skip duplicate anchors
        l, r = i + 1, len(nums) - 1
        while l < r:
            s = nums[i] + nums[l] + nums[r]
            if s < 0: l += 1
            elif s > 0: r -= 1
            else:
                out.append([nums[i], nums[l], nums[r]])
                l += 1
                while l < r and nums[l] == nums[l - 1]:
                    l += 1
                r -= 1
    return out

print(three_sum([-1, 0, 1, 2, -1, -4]))

# OUTPUT:
# [[-1, -1, 2], [-1, 0, 1]]`],
        r`
   sorted: [ 1   2   4   7  11  15 ]   target 15
             ^                   ^
             l                   r      1 + 15 = 16 > 15 -> r moves left
             ^               ^
             l               r          1 + 11 = 12 < 15 -> l moves right
                 ^           ^
                 l           r          2 + 11 = 13 -> l moves right
                     ^       ^
                     l       r          4 + 11 = 15 -> found
`,
        `Two pointers (and sliding window) replace nested loops with a single pass whenever the data has monotonic structure. Check the precondition (sorted, or a monotonic property) explicitly; if it does not hold, a hash map is usually the right substitute at the cost of O(n) extra memory.`
    )
};
