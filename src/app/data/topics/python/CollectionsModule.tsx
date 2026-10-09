import type { Topic } from '../../types';

export const collectionsModule: Topic = {
    id: 'python-modules-packages-collections-module',
    name: 'collections Module',
    beginner: [
        {
            content: `<h4>Specialised Containers</h4>
The <code>collections</code> module adds container types for jobs the built-in <code>list</code>, <code>dict</code>, <code>set</code> and <code>tuple</code> handle clumsily.
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Type</th><th>What it is</th><th>Typical use</th></tr>
<tr class='text-center'><td><code>Counter</code></td><td>A dict that counts things</td><td>Word frequencies, votes, stock levels</td></tr>
<tr class='text-center'><td><code>defaultdict</code></td><td>A dict that creates missing values automatically</td><td>Grouping, counting, building graphs</td></tr>
<tr class='text-center'><td><code>deque</code></td><td>A double-ended queue, fast at both ends</td><td>Queues, BFS, "last N items"</td></tr>
<tr class='text-center'><td><code>namedtuple</code></td><td>A tuple with named fields</td><td>Lightweight read-only records</td></tr>
<tr class='text-center'><td><code>OrderedDict</code></td><td>A dict with order-aware extras</td><td>LRU caches, reordering keys</td></tr>
<tr class='text-center'><td><code>ChainMap</code></td><td>Several dicts searched as one</td><td>Layered settings</td></tr>
<tr class='text-center'><td><code>UserDict</code>, <code>UserList</code>, <code>UserString</code></td><td>Base classes for custom containers</td><td>Safely customising dict/list behaviour</td></tr>
</table>`
        },
        {
            content: `<h4>Counter</h4>
A <code>Counter</code> maps each item to how many times it occurs. Missing items count as <code>0</code> instead of raising <code>KeyError</code>.`,
            codeExamples: [
                `from collections import Counter

letters = Counter("mississippi")
print(letters)
print(letters.most_common(2))
print(letters["s"], letters["z"])          # missing -> 0

# OUTPUT:
# Counter({'i': 4, 's': 4, 'p': 2, 'm': 1})
# [('i', 4), ('s', 4)]
# 4 0`,
                `from collections import Counter

stock = Counter(pen=3, book=1)
sold = Counter(pen=1, book=2)

print(stock + sold)                  # add counts
print(stock - sold)                  # subtract, dropping zero/negative results

stock.update(["pen", "bag"])         # count more items
print(stock)
print(list(Counter(a=2, b=1).elements()))

# OUTPUT:
# Counter({'pen': 4, 'book': 3})
# Counter({'pen': 2})
# Counter({'pen': 4, 'book': 1, 'bag': 1})
# ['a', 'a', 'b']`
            ]
        },
        {
            content: `<h4>defaultdict</h4>
<code>defaultdict(factory)</code> calls <code>factory()</code> to create a value the first time a missing key is accessed: <code>list</code> gives <code>[]</code>, <code>int</code> gives <code>0</code>, <code>set</code> gives <code>set()</code>.`,
            codeExamples: [
                `from collections import defaultdict

words = ["apple", "avocado", "banana", "blueberry", "cherry"]
by_letter = defaultdict(list)
for w in words:
    by_letter[w[0]].append(w)          # no "if key not in" check needed
print(dict(by_letter))

counts = defaultdict(int)
for ch in "hello":
    counts[ch] += 1
print(dict(counts))

tags = defaultdict(set)
tags["post1"].add("python")
tags["post1"].add("python")             # sets ignore duplicates
tags["post2"].add("java")
print({post: sorted(t) for post, t in tags.items()})

# OUTPUT:
# {'a': ['apple', 'avocado'], 'b': ['banana', 'blueberry'], 'c': ['cherry']}
# {'h': 1, 'e': 1, 'l': 2, 'o': 1}
# {'post1': ['python'], 'post2': ['java']}`
            ]
        },
        {
            content: `<h4>deque</h4>
A <code>deque</code> ("deck") adds and removes items at <b>both</b> ends in O(1). With <code>maxlen</code> it keeps only the newest items - old ones fall off the other end automatically.`,
            codeExamples: [
                `from collections import deque

q = deque([1, 2, 3])
q.append(4)
q.appendleft(0)
print(q)
print(q.pop(), q.popleft())
print(q)

q.rotate(1)                   # move the last item to the front
print(q)

recent = deque(maxlen=3)
for page in ["home", "cart", "pay", "done"]:
    recent.append(page)
print(recent)

# OUTPUT:
# deque([0, 1, 2, 3, 4])
# 4 0
# deque([1, 2, 3])
# deque([3, 1, 2])
# deque(['cart', 'pay', 'done'], maxlen=3)`
            ]
        },
        {
            content: `<h4>namedtuple</h4>
A tuple whose fields also have names - covered fully in <i>Tuples</i>.`,
            codeExamples: [
                `from collections import namedtuple

Point = namedtuple("Point", "x y")
p = Point(2, 3)
print(p, p.x + p.y, p[0])

# OUTPUT:
# Point(x=2, y=3) 5 2`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>OrderedDict Today</h3>
Plain dicts keep insertion order since Python 3.7, so <code>OrderedDict</code> is no longer needed just for ordering. It still has extras a dict lacks:<br>
• <code>move_to_end(key, last=True)</code> - move a key to either end in O(1).<br>
• <code>popitem(last=False)</code> - remove the <b>oldest</b> entry (FIFO).<br>
• Equality between two OrderedDicts is <b>order-sensitive</b> (comparison with a plain dict is not).`,
            codeExamples: [
                `from collections import OrderedDict

od = OrderedDict(a=1, b=2, c=3)
od.move_to_end("a")
print(list(od))
od.move_to_end("c", last=False)
print(list(od))
print(od.popitem(last=False))

print(OrderedDict(a=1, b=2) == OrderedDict(b=2, a=1))
print(dict(a=1, b=2) == dict(b=2, a=1))
print(OrderedDict(a=1, b=2) == dict(b=2, a=1))

# OUTPUT:
# ['b', 'c', 'a']
# ['c', 'b', 'a']
# ('c', 3)
# False
# True
# True`
            ]
        },
        {
            content: `<h3>An LRU Cache Sketch</h3>
A Least-Recently-Used cache keeps the newest entries and evicts the one untouched for longest. <code>move_to_end</code> marks an entry as recently used; <code>popitem(last=False)</code> evicts the oldest. (For caching function results, <code>functools.lru_cache</code> already does this for you.)`,
            codeExamples: [
                `from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.data = OrderedDict()

    def get(self, key):
        if key not in self.data:
            return None
        self.data.move_to_end(key)           # mark as recently used
        return self.data[key]

    def put(self, key, value):
        self.data[key] = value
        self.data.move_to_end(key)
        if len(self.data) > self.capacity:
            self.data.popitem(last=False)    # evict the least recently used

cache = LRUCache(2)
cache.put("a", 1)
cache.put("b", 2)
cache.get("a")                               # "a" is now the most recent
cache.put("c", 3)                            # evicts "b"
print(list(cache.data), cache.get("b"))

# OUTPUT:
# ['a', 'c'] None`
            ]
        },
        {
            content: `<h3>Subclass UserDict, Not dict</h3>
The built-in <code>dict</code> is implemented in C, and methods like <code>update()</code> and the constructor do <b>not</b> call your overridden <code>__setitem__</code>. <code>UserDict</code> is written in Python on top of <code>MutableMapping</code>, so every write goes through your method. (<code>ChainMap</code>, the other mapping in this module, is covered in <i>Dictionary Unpacking</i>.)`,
            codeExamples: [
                `from collections import UserDict

class UpperDict(dict):
    def __setitem__(self, key, value):
        super().__setitem__(key.upper(), value)

d = UpperDict()
d["a"] = 1
d.update({"b": 2})                 # bypasses __setitem__!
print(d)

class UpperUserDict(UserDict):
    def __setitem__(self, key, value):
        super().__setitem__(key.upper(), value)

u = UpperUserDict()
u["a"] = 1
u.update({"b": 2})                 # goes through __setitem__
print(u)

# OUTPUT:
# {'A': 1, 'b': 2}
# {'A': 1, 'B': 2}`
            ]
        },
        {
            content: `<h3>collections.abc for Type Checks</h3>
<code>collections.abc</code> defines abstract base classes such as <code>Iterable</code>, <code>Sequence</code>, <code>MutableSequence</code> and <code>Mapping</code>. Check against these to accept <i>any</i> suitable container, not only one concrete class.`,
            codeExamples: [
                `from collections import UserDict
from collections.abc import Mapping, MutableSequence, Iterable

print(isinstance({}, Mapping), isinstance(UserDict(), Mapping))
print(isinstance([], MutableSequence), isinstance((), MutableSequence))
print(isinstance("abc", Iterable), isinstance(42, Iterable))

# OUTPUT:
# True True
# True False
# True False`
            ]
        },
        {
            content: `<h3>Complexity: deque vs list</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Operation</th><th>list</th><th>deque</th></tr>
<tr class='text-center'><td>Add/remove at the end</td><td>O(1)</td><td>O(1)</td></tr>
<tr class='text-center'><td>Add/remove at the front</td><td>O(n) - <code>insert(0, x)</code>, <code>pop(0)</code></td><td>O(1) - <code>appendleft</code>, <code>popleft</code></td></tr>
<tr class='text-center'><td>Index in the middle</td><td>O(1)</td><td>O(n)</td></tr>
<tr class='text-center'><td>Slicing</td><td>Supported</td><td>Not supported</td></tr>
</table>
Use a list for random access, a deque for queues.`
        },
        {
            content: `<h3>Java Equivalents</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Python</th><th>Java</th></tr>
<tr class='text-center'><td><code>deque</code></td><td><code>ArrayDeque</code></td></tr>
<tr class='text-center'><td><code>defaultdict(list)</code></td><td><code>map.computeIfAbsent(key, k -&gt; new ArrayList&lt;&gt;()).add(x)</code></td></tr>
<tr class='text-center'><td><code>Counter</code></td><td><code>map.merge(key, 1, Integer::sum)</code> or <code>Collectors.groupingBy(..., counting())</code></td></tr>
<tr class='text-center'><td><code>OrderedDict</code> / LRU</td><td><code>LinkedHashMap</code> with access order and <code>removeEldestEntry</code></td></tr>
<tr class='text-center'><td><code>namedtuple</code></td><td>A <code>record</code></td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>How do you count word frequencies?</td><td><code>Counter(words)</code>, then <code>most_common(n)</code> for the top n</td></tr>
<tr class='text-center'><td>defaultdict vs dict.get / setdefault?</td><td>defaultdict creates the missing value automatically on access; get only reads with a fallback; setdefault inserts on a per-call basis</td></tr>
<tr class='text-center'><td>Why use deque for a queue?</td><td>popleft/appendleft are O(1); list.pop(0) and insert(0, x) are O(n)</td></tr>
<tr class='text-center'><td>Is OrderedDict still useful?</td><td>Yes for move_to_end, popitem(last=False) and order-sensitive equality - e.g. LRU caches</td></tr>
<tr class='text-center'><td>Why subclass UserDict instead of dict?</td><td>dict's C methods (update, constructor) skip overridden __setitem__; UserDict routes every write through it</td></tr>
<tr class='text-center'><td>What does <code>deque(maxlen=3)</code> do?</td><td>Keeps only the 3 most recent items; older items are discarded automatically</td></tr>
</table>`
        }
    ]
};
