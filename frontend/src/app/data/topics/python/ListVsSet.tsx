import type { Topic } from '../../types';

export const listVsSet: Topic = {
    id: 'python-collections-list-vs-set',
    name: 'List vs Set',
    beginner: [
        {
            content: `<h4>Side by Side</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>List</th><th>Set</th></tr>
<tr class='text-center'><td>Syntax</td><td><code>[1, 2, 3]</code></td><td><code>{1, 2, 3}</code> (empty: <code>set()</code>)</td></tr>
<tr class='text-center'><td>Order</td><td>Keeps insertion order</td><td>No guaranteed order</td></tr>
<tr class='text-center'><td>Duplicates</td><td>Allowed</td><td>Removed automatically</td></tr>
<tr class='text-center'><td>Indexing / slicing</td><td>Yes</td><td>No</td></tr>
<tr class='text-center'><td><code>x in c</code></td><td>O(n) - scans every item</td><td>O(1) on average - hash lookup</td></tr>
<tr class='text-center'><td>Allowed items</td><td>Anything</td><td>Hashable items only</td></tr>
<tr class='text-center'><td>Memory</td><td>Less</td><td>More (hash table with empty slots)</td></tr>
</table>`
        },
        {
            content: `<h4>The Same Data, Two Behaviours</h4>`,
            codeExamples: [
                `visits_list = [3, 1, 3, 2, 1]
visits_set = {3, 1, 3, 2, 1}

print(visits_list, len(visits_list))
print(sorted(visits_set), len(visits_set))
print(visits_list[0])
print(visits_set[0])

# OUTPUT:
# [3, 1, 3, 2, 1] 5
# [1, 2, 3] 3
# 3
# TypeError: 'set' object is not subscriptable`
            ]
        },
        {
            content: `<h4>Which One Should I Use?</h4>
• Use a <b>list</b> when <b>order matters</b>, duplicates are meaningful (e.g. every purchase), or you need positions and slicing.<br>
• Use a <b>set</b> when you mainly ask <b>"is this item present?"</b>, need unique values, or want union/intersection/difference.`,
            codeExamples: [
                `playlist = ["song A", "song B", "song A"]        # order + repeats matter
banned_words = {"spam", "scam", "fraud"}          # only membership matters

message = "this is not a scam"
print(any(word in banned_words for word in message.split()))

# OUTPUT:
# True`
            ]
        },
        {
            content: `<h4>Converting and Deduplicating</h4>
<code>set(list)</code> removes duplicates but <b>loses the order</b>. To remove duplicates while keeping the first-seen order, use <code>dict.fromkeys()</code>.`,
            codeExamples: [
                `cities = ["Pune", "Delhi", "Pune", "Agra", "Delhi"]

print(sorted(set(cities)))             # unique, sorted for display
print(list(dict.fromkeys(cities)))     # unique, original order kept
print(len(cities) != len(set(cities))) # quick "has duplicates?" test

# OUTPUT:
# ['Agra', 'Delhi', 'Pune']
# ['Pune', 'Delhi', 'Agra']
# True`
            ]
        },
        {
            content: `<h4>Membership Speed</h4>
Searching a large list checks items one by one; a set jumps straight to the right slot.`,
            codeExamples: [
                `import timeit

items_list = list(range(100_000))
items_set = set(items_list)

print(timeit.timeit(lambda: 99_999 in items_list, number=1_000))
print(timeit.timeit(lambda: 99_999 in items_set, number=1_000))

# OUTPUT (typical - exact times vary by machine):
# 0.45
# 0.00005`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Complexity of Common Operations</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Operation</th><th>List</th><th>Set</th></tr>
<tr class='text-center'><td><code>x in c</code></td><td>O(n)</td><td>O(1) average</td></tr>
<tr class='text-center'><td>Add an item</td><td><code>append</code> O(1) amortised</td><td><code>add</code> O(1) average</td></tr>
<tr class='text-center'><td>Remove by value</td><td><code>remove</code> O(n)</td><td><code>discard</code> O(1) average</td></tr>
<tr class='text-center'><td>Access by position</td><td>O(1)</td><td>Not supported</td></tr>
<tr class='text-center'><td>Common items of a and b</td><td>O(n × m) with nested loops</td><td><code>a &amp; b</code> O(min(n, m)) once both are sets (O(n + m) including conversion)</td></tr>
<tr class='text-center'><td>Build from n items</td><td>O(n)</td><td>O(n), with a larger constant (hashing)</td></tr>
</table>`
        },
        {
            content: `<h3>Building a Set Isn't Free</h3>
Converting a list to a set costs O(n) - hashing every item. For a <b>single</b> membership check, just search the list. The set pays off when you check membership <b>many times</b> against the same data.`,
            codeExamples: [
                `allowed = ["admin", "editor", "viewer"]

# One check: searching the list directly is simplest and cheapest
print("editor" in allowed)

# Many checks: build the set once, then each check is O(1)
allowed_set = set(allowed)
requests = ["viewer", "guest", "admin", "guest"]
print([role for role in requests if role in allowed_set])

# OUTPUT:
# True
# ['viewer', 'admin']`
            ]
        },
        {
            content: `<h3>Sets Need Hashable Items</h3>
A list of lists can't become a set, because lists are unhashable. Convert the inner lists to tuples first.`,
            codeExamples: [
                `pairs = [[1, 2], [3, 4], [1, 2]]

unique_pairs = {tuple(p) for p in pairs}
print(sorted(unique_pairs))
print(set(pairs))

# OUTPUT:
# [(1, 2), (3, 4)]
# TypeError: unhashable type: 'list'`
            ]
        },
        {
            content: `<h3>Memory and Display</h3>
A set keeps a hash table with empty slots so lookups stay fast, so it uses more memory than a list of the same items. Because set order is not guaranteed (and string hashes change between runs), always <code>sorted()</code> a set before showing or comparing its contents as text.`,
            codeExamples: [
                `import sys

nums = list(range(1000))
print(sys.getsizeof(set(nums)) > sys.getsizeof(nums))

tags = {"python", "sql", "git"}
print(", ".join(sorted(tags)))          # stable output every run

# OUTPUT:
# True
# git, python, sql`
            ]
        },
        {
            content: `<h3>frozenset: The Immutable Set</h3>
Like the list/tuple pair, sets have an immutable twin. A <code>frozenset</code> is hashable, so it can be a dictionary key or an item inside another set.`,
            codeExamples: [
                `team_sizes = {
    frozenset({"Abaji", "Raoji"}): 2,
}
print(team_sizes[frozenset({"Raoji", "Abaji"})])

frozen = frozenset([1, 2])
frozen.add(3)

# OUTPUT:
# 2
# AttributeError: 'frozenset' object has no attribute 'add'`
            ]
        },
        {
            content: `<h3>The "visited" Pattern</h3>
Graph and grid algorithms keep a <b>set</b> of visited nodes, because they check "have I been here?" at every step. With a list, that check would make the whole traversal O(n²).`,
            codeExamples: [
                `from collections import deque

graph = {
    "A": ["B", "C"],
    "B": ["D"],
    "C": ["D", "E"],
    "D": ["A"],
    "E": [],
}

def bfs(start):
    visited = {start}
    order = []
    queue = deque([start])
    while queue:
        node = queue.popleft()
        order.append(node)
        for neighbour in graph[node]:
            if neighbour not in visited:     # O(1) check
                visited.add(neighbour)
                queue.append(neighbour)
    return order

print(bfs("A"))

# OUTPUT:
# ['A', 'B', 'C', 'D', 'E']`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why is <code>x in set</code> faster than <code>x in list</code>?</td><td>A set is a hash table - it computes the slot from the hash (O(1) average); a list scans items one by one (O(n))</td></tr>
<tr class='text-center'><td>How do you remove duplicates but keep order?</td><td><code>list(dict.fromkeys(items))</code></td></tr>
<tr class='text-center'><td>Can a set contain lists?</td><td>No - convert them to tuples first</td></tr>
<tr class='text-center'><td>When is a list better than a set?</td><td>When you need order, duplicates, indexing or slicing, or only one membership check</td></tr>
<tr class='text-center'><td>Which uses more memory?</td><td>The set - its hash table keeps empty slots</td></tr>
<tr class='text-center'><td>Why use a set for "visited" in BFS/DFS?</td><td>Each visited check is O(1), keeping the traversal O(V + E)</td></tr>
</table>`
        }
    ]
};
