// Module 3 (Collections), part A: lists, tuples, sets.
import { dd, r, type DeepDive } from './deepDive';

export const m03a: Record<string, DeepDive> = {
    'Lists: Creating, Indexing & Slicing': dd(
        [`A <b>list</b> is an ordered, mutable sequence that can hold any mix of objects. Items are reached by index (0-based, negatives count from the end) and slices <code>lst[start:stop:step]</code> return a new list.`,
            r`nums = [10, 20, 30, 40, 50]
print(nums[0], nums[-1])          # first and last
print(nums[1:4])                  # index 1,2,3 (stop excluded)
print(nums[::2])                  # every second item
print(nums[::-1])                 # reversed copy
mixed = [1, "two", 3.0, [4, 5]]   # any types, even nested lists
print(mixed[3][1])

# OUTPUT:
# 10 50
# [20, 30, 40]
# [10, 30, 50]
# [50, 40, 30, 20, 10]
# 5`],
        [`Programs constantly handle "many of the same thing": orders, names, readings. A list keeps them in order, lets you grow and shrink the group, and gives O(1) access by position.`,
            r`scores = [88, 92, 79]
scores.append(95)                 # grows as data arrives
print("count:", len(scores))
print("average:", sum(scores) / len(scores))
print("best:", max(scores))

# OUTPUT:
# count: 4
# average: 88.5
# best: 95`],
        [`Lists hold rows from a database query, lines of a file, items in a cart, results of an API call, and the batch passed to a machine-learning model.`,
            r`# Real-time: pagination with slices
items = list(range(1, 11))        # 10 products
page, size = 2, 4
start = (page - 1) * size
print(items[start:start + size])  # page 2 of 4-per-page

# OUTPUT:
# [5, 6, 7, 8]`],
        [`<b>Advantages:</b> flexible, heterogeneous, fast indexing and append, rich methods, slicing never raises IndexError (it clips).`,
            r`# Advantage: slices clip silently, indexes do not
data = [1, 2, 3]
print(data[1:100])                # safe
try:
    data[100]
except IndexError as e:
    print("IndexError:", e)

# OUTPUT:
# [2, 3]
# IndexError: list index out of range`],
        [`<b>Disadvantages:</b> searching with <code>in</code> or <code>index</code> is O(n); inserting at the front is O(n); each element is a pointer to an object so memory per item is high.`,
            r`# Disadvantage: membership test scans the whole list
import time
big = list(range(2_000_000))
t = time.perf_counter()
print(1_999_999 in big)           # worst case: checks every element
print("scan took ms:", round((time.perf_counter() - t) * 1000) >= 0)

# OUTPUT:
# True
# scan took ms: True`],
        [`<b>Limitations:</b> lists are not hashable (cannot be dict keys or set members) and are not safe to share between threads without locks; typed numeric arrays need <code>array</code> or NumPy.`,
            r`# Limitation: a list cannot be a dict key
try:
    d = {[1, 2]: "pair"}
except TypeError as e:
    print("TypeError:", e)
d = {(1, 2): "pair"}              # a tuple can
print(d)

# OUTPUT:
# TypeError: unhashable type: 'list'
# {(1, 2): 'pair'}`],
        `
   index     0     1     2     3     4
           ┌─────┬─────┬─────┬─────┬─────┐
   nums =  │ 10  │ 20  │ 30  │ 40  │ 50  │
           └─────┴─────┴─────┴─────┴─────┘
   neg      -5    -4    -3    -2    -1
   nums[1:4]  ──►  [20, 30, 40]
`,
        `A list is a dynamic array of references: amortised O(1) append, O(n) insert/delete near the front. If you need fast both-ends operations use <code>collections.deque</code>; for membership use <code>set</code>; for big numeric data use NumPy arrays. Do not use lists as records: use dataclasses or tuples.`
    ),

    'Adding & Removing List Items': dd(
        [`Lists grow with <code>append</code> (one item at end), <code>insert</code> (at an index), <code>extend</code> (many items) and shrink with <code>remove</code> (by value), <code>pop</code> (by index, returns it), <code>del</code> and <code>clear</code>.`,
            r`fruits = ["apple", "banana"]
fruits.append("cherry")           # add at end
fruits.insert(1, "mango")         # add at index 1
fruits.extend(["kiwi", "fig"])    # add many
print(fruits)
fruits.remove("banana")           # remove first match by value
last = fruits.pop()               # remove and return last
del fruits[0]                     # remove by index
print(fruits, last)

# OUTPUT:
# ['apple', 'mango', 'banana', 'cherry', 'kiwi', 'fig']
# ['mango', 'cherry', 'kiwi'] fig`],
        [`Real collections change over time: a cart gains and loses items, a queue is consumed. Choosing the right method keeps code short and avoids bugs such as nesting a list by mistake.`,
            r`a = [1, 2]
a.append([3, 4])                  # appends ONE item (a list)
b = [1, 2]
b.extend([3, 4])                  # appends each element
print(a)
print(b)

# OUTPUT:
# [1, 2, [3, 4]]
# [1, 2, 3, 4]`],
        [`Stacks (undo history) use append/pop; to-do lists and shopping carts use append/remove; log buffers keep the latest N items by trimming.`,
            r`# Real-time: undo stack
history = []
for action in ["type A", "type B", "delete"]:
    history.append(action)        # push
print("undo:", history.pop())     # pop = most recent first
print("left:", history)

# OUTPUT:
# undo: delete
# left: ['type A', 'type B']`],
        [`<b>Advantages:</b> append and pop at the end are amortised O(1); <code>+=</code> and <code>extend</code> accept any iterable; <code>pop()</code> removes and returns in one step.`,
            r`# Advantage: extend takes any iterable
letters = ["a"]
letters.extend("bc")              # a string is iterable
letters += (x for x in "de")      # so is a generator
print(letters)

# OUTPUT:
# ['a', 'b', 'c', 'd', 'e']`],
        [`<b>Disadvantages:</b> <code>remove</code> raises ValueError when the item is missing, <code>pop</code> raises IndexError on empty lists, and removing from the front is O(n).`,
            r`# Disadvantage: errors for missing items
nums = [1, 2, 3]
try:
    nums.remove(99)
except ValueError as e:
    print("ValueError:", e)
try:
    [].pop()
except IndexError as e:
    print("IndexError:", e)

# OUTPUT:
# ValueError: list.remove(x): x not in list
# IndexError: pop from empty list`],
        [`<b>Limitations:</b> <code>remove</code> deletes only the first match; deleting while iterating skips elements; <code>append</code> returns None so it cannot be chained.`,
            r`# Limitation: remove() deletes only the FIRST match
vals = [1, 2, 1, 1]
vals.remove(1)
print(vals)
result = vals.append(5)
print(result)                     # None - methods mutate in place
vals = [v for v in vals if v != 1]    # remove ALL matches (new list)
print(vals)

# OUTPUT:
# [2, 1, 1]
# None
# [2, 5]`],
        `
   [a, b, c]
     append(d)      ──►  [a, b, c, d]      add at END   O(1)
     insert(0, z)   ──►  [z, a, b, c]      add at FRONT O(n) (shifts all)
     pop()          ──►  [a, b]  returns c remove END   O(1)
     pop(0)/remove  ──►  shift left         remove FRONT O(n)
`,
        `Appending/popping at the end is cheap, front operations are linear: for queues use <code>collections.deque</code>. Prefer building a new filtered list over deleting inside a loop, and avoid exposing mutable lists across module boundaries without copying.`
    ),

    'List Methods: sort(), reverse() & More': dd(
        [`Lists provide <code>sort()</code> (in place, stable), <code>reverse()</code>, <code>count()</code>, <code>index()</code>, <code>copy()</code>, plus the built-in <code>sorted()</code> that returns a new list. <code>key=</code> and <code>reverse=True</code> customise sorting.`,
            r`nums = [3, 1, 4, 1, 5]
nums.sort()                       # in place
print(nums, nums.count(1), nums.index(4))
nums.reverse()
print(nums)
words = ["pear", "fig", "banana"]
print(sorted(words, key=len))     # new list, sorted by length
print(sorted(words, reverse=True))

# OUTPUT:
# [1, 1, 3, 4, 5] 2 3
# [5, 4, 3, 1, 1]
# ['fig', 'pear', 'banana']
# ['pear', 'fig', 'banana']`],
        [`Ordering and searching data is everywhere (leaderboards, price lists, reports). Knowing in-place versus new-list behaviour avoids losing the original order by accident.`,
            r`data = [5, 2, 9]
ordered = sorted(data)            # data is unchanged
print(data, ordered)
print(data.sort())                # sort() returns None, mutates data
print(data)

# OUTPUT:
# [5, 2, 9] [2, 5, 9]
# None
# [2, 5, 9]`],
        [`Sort records by several fields (salary then name), keep the top-N, and report counts.`,
            r`# Real-time: sort employees by salary (desc), then name
emp = [("Raoji", 50000), ("Abaji", 60000), ("Moropant", 50000)]
emp.sort(key=lambda e: (-e[1], e[0]))
print(emp)

# OUTPUT:
# [('Abaji', 60000), ('Moropant', 50000), ('Raoji', 50000)]`],
        [`<b>Advantages:</b> Timsort is stable and fast (O(n log n), nearly O(n) on partially sorted data); <code>key</code> avoids comparing whole objects; stability allows multi-pass sorting.`,
            r`# Advantage: stability - equal keys keep their original order
people = [("Abaji", 30), ("Raoji", 25), ("Moropant", 30)]
people.sort(key=lambda p: p[1])
print(people)

# OUTPUT:
# [('Raoji', 25), ('Abaji', 30), ('Moropant', 30)]`],
        [`<b>Disadvantages:</b> sort() mutates and returns None (a common bug); <code>index()</code> and <code>count()</code> scan the whole list.`,
            r`# Disadvantage: classic bug - assigning the result of sort()
nums = [3, 1, 2]
nums = nums.sort()
print(nums)                       # the list is gone!

# OUTPUT:
# None`],
        [`<b>Limitations:</b> sorting mixed types raises TypeError; sorting needs comparable items (or a key); sort is not available on tuples (use <code>sorted</code>).`,
            r`# Limitation: cannot compare int with str
try:
    [3, "a", 1].sort()
except TypeError as e:
    print("TypeError:", e)
print(sorted((3, 1, 2)))          # tuples need sorted()

# OUTPUT:
# TypeError: '<' not supported between instances of 'str' and 'int'
# [1, 2, 3]`],
        `
   [5, 2, 9]
      │ sorted()            │ .sort()
      ▼                     ▼
   new list [2,5,9]    same list mutated -> [2,5,9]   returns None
   original kept        original lost
`,
        `Prefer <code>sorted()</code> for pure functions and <code>.sort()</code> when memory matters and the old order is not needed. For repeated insertion into a sorted sequence use <code>bisect</code> or <code>heapq</code>; for top-N use <code>heapq.nlargest</code> rather than a full sort.`
    ),

    'Copying Lists': dd(
        [`Assignment (<code>b = a</code>) does <b>not</b> copy a list: both names point to the same object. A real (shallow) copy is made with <code>a.copy()</code>, <code>a[:]</code> or <code>list(a)</code>.`,
            r`a = [1, 2, 3]
b = a                    # same object, two names
c = a.copy()             # new list, same items
b.append(4)
print("a:", a)           # changed through b!
print("c:", c)           # unaffected
print(a is b, a is c)

# OUTPUT:
# a: [1, 2, 3, 4]
# c: [1, 2, 3]
# True False`],
        [`Lists are mutable, so unintended sharing causes spooky bugs: a function that changes its argument changes the caller's data. Copying gives you an independent list.`,
            r`def add_tax(prices):
    prices = prices.copy()           # protect the caller's list
    for i in range(len(prices)):
        prices[i] = round(prices[i] * 1.18, 2)
    return prices

original = [100, 200]
print(add_tax(original))
print(original)

# OUTPUT:
# [118.0, 236.0]
# [100, 200]`],
        [`Undo snapshots, default-argument protection, sorting without disturbing the source, and handing out safe copies from a class all use list copies.`,
            r`# Real-time: snapshot for undo
doc = ["line1", "line2"]
snapshots = []
snapshots.append(doc[:])             # save state
doc.append("line3")
snapshots.append(doc[:])
print(snapshots)

# OUTPUT:
# [['line1', 'line2'], ['line1', 'line2', 'line3']]`],
        [`<b>Advantages:</b> shallow copying is fast (O(n)) and the three syntaxes work on any sequence; copies of lists of immutables (numbers, strings) are fully independent.`,
            r`# Advantage: list(x) works for any iterable and gives a fresh list
t = (1, 2, 3)
l = list(t)
l.append(4)
print(t, l)

# OUTPUT:
# (1, 2, 3) [1, 2, 3, 4]`],
        [`<b>Disadvantages:</b> a shallow copy shares nested mutable objects, so inner lists are still linked; people forget that and get surprising changes.`,
            r`# Disadvantage: inner lists are shared
a = [[1, 2], [3, 4]]
b = a.copy()
b[0].append(99)
print(a)                           # a changed too!

# OUTPUT:
# [[1, 2, 99], [3, 4]]`],
        [`<b>Limitations:</b> <code>copy()</code> never duplicates the objects inside; for independence use <code>copy.deepcopy</code>, which is slower and fails for objects that cannot be copied (open files, locks).`,
            r`import copy
a = [[1, 2], [3, 4]]
b = copy.deepcopy(a)               # full independent copy
b[0].append(99)
print(a)
print(b)

# OUTPUT:
# [[1, 2], [3, 4]]
# [[1, 2, 99], [3, 4]]`],
        `
   b = a            a.copy()
   a ─┐             a ──► [ ref1, ref2 ]      shallow copy
   b ─┴─► [1,2,3]   c ──► [ ref1, ref2 ]  (new list, same items)
   (one list)                 │     │
                              ▼     ▼
                           item1  item2  (shared)
`,
        `Treat shallow copy as the default and deepcopy as the exception: it is expensive and hides ownership problems. A cleaner design is immutability (tuples, frozen dataclasses) or returning new lists from functions so that copying is never needed.`
    ),

    'Tuples': dd(
        [`A <b>tuple</b> is an ordered, <b>immutable</b> sequence written with commas (parentheses are optional). It supports indexing, slicing, iteration, <code>count</code> and <code>index</code>, but items cannot be added, removed or replaced.`,
            r`point = (3, 4)
single = (5,)                      # the comma makes a tuple, not the brackets
empty = ()
print(point[0], point[-1], len(point))
print(type(single), type((5)))
print(point + (5,))                # concatenation creates a new tuple

# OUTPUT:
# 3 4 2
# <class 'tuple'> <class 'int'>
# (3, 4, 5)`],
        [`Some data must not change: coordinates, RGB colours, database rows, constants. A tuple guarantees that, and being immutable lets it be a dictionary key or set member.`,
            r`# Immutability protects data from accidental change
RED = (255, 0, 0)
try:
    RED[0] = 0
except TypeError as e:
    print("TypeError:", e)
palette = {RED: "red"}             # tuples are hashable => valid keys
print(palette[(255, 0, 0)])

# OUTPUT:
# TypeError: 'tuple' object does not support item assignment
# red`],
        [`Functions return several values as tuples, <code>dict.items()</code> yields tuples, DB cursors return row tuples, and <code>namedtuple</code> gives lightweight records.`,
            r`from collections import namedtuple
def min_max(values):
    return min(values), max(values)        # returns a tuple

lo, hi = min_max([4, 9, 1])
print(lo, hi)
User = namedtuple("User", "name age")
u = User("Abaji", 30)
print(u.name, u[1], u)

# OUTPUT:
# 1 9
# Abaji 30 User(name='Abaji', age=30)`],
        [`<b>Advantages:</b> smaller and faster than lists, hashable (if contents are), thread-safe by design, and communicate "this will not change".`,
            r`import sys
print(sys.getsizeof((1, 2, 3)), "<", sys.getsizeof([1, 2, 3]))

# OUTPUT (64-bit CPython 3.12, example):
# 64 < 88`],
        [`<b>Disadvantages:</b> cannot be changed in place, so "modifying" means building a new tuple; a one-element tuple needs the awkward trailing comma.`,
            r`# Disadvantage: "updating" a tuple means rebuilding it
t = (1, 2, 3)
t = t[:1] + (99,) + t[2:]          # replace index 1
print(t)
print(type((7)), type((7,)))       # missing comma gives an int

# OUTPUT:
# (1, 99, 3)
# <class 'int'> <class 'tuple'>`],
        [`<b>Limitations:</b> immutability is shallow: a tuple holding a list still lets that list change, and then the tuple is no longer hashable.`,
            r`# Limitation: mutable items inside remain mutable
t = (1, [2, 3])
t[1].append(4)
print(t)
try:
    hash(t)
except TypeError as e:
    print("TypeError:", e)

# OUTPUT:
# (1, [2, 3, 4])
# TypeError: unhashable type: 'list'`],
        `
   t = (1, 2, 3)         fixed size, fixed references
        │
        ├─ t[0] = 9   ──► TypeError   (immutable)
        ├─ t + (4,)   ──► NEW tuple (1, 2, 3, 4)
        └─ hash(t)    ──► OK  ──► usable as dict key
`,
        `Use tuples for fixed-shape records and heterogeneous returns, lists for homogeneous growing collections. Upgrade ad-hoc tuples to <code>NamedTuple</code> or frozen dataclasses once they have more than two or three fields: field names beat positions.`
    ),

    'Tuple Packing & Unpacking': dd(
        [`<b>Packing</b> collects values into a tuple (<code>t = 1, 2, 3</code>). <b>Unpacking</b> spreads a sequence into variables (<code>a, b, c = t</code>). A starred target <code>*rest</code> captures the leftover items as a list.`,
            r`packed = 10, 20, 30              # packing
x, y, z = packed                   # unpacking
print(x, y, z)
first, *middle, last = [1, 2, 3, 4, 5]
print(first, middle, last)         # star collects the extras
x, y = y, x                        # swap without a temp variable
print(x, y)

# OUTPUT:
# 10 20 30
# 1 [2, 3, 4] 5
# 20 10`],
        [`Returning multiple values, iterating pairs, and swapping all become one clear line. It removes index noise like <code>pair[0]</code> and <code>pair[1]</code>.`,
            r`students = [("Abaji", 90), ("Raoji", 75)]
for name, mark in students:        # unpack in the for header
    print(f"{name}: {mark}")

for i, (name, mark) in enumerate(students):   # nested unpacking
    print(i, name, mark)

# OUTPUT:
# Abaji: 90
# Raoji: 75
# 0 Abaji 90
# 1 Raoji 75`],
        [`Parsing CSV rows, splitting <code>head, *tail</code> of command lines, iterating <code>dict.items()</code>, and handling function results are everyday uses.`,
            r`# Real-time: parse a log line
line = "2024-05-01 ERROR disk full on /dev/sda1"
date, level, *message = line.split()
print(date, level)
print(" ".join(message))

# OUTPUT:
# 2024-05-01 ERROR
# disk full on /dev/sda1`],
        [`<b>Advantages:</b> concise, readable, no temp variables; works with any iterable; <code>_</code> conventionally ignores values.`,
            r`# Advantage: ignore parts you do not need with _
record = ("Abaji", 30, "Pune", "abaji@x.com")
name, _, city, _ = record
print(name, city)

# OUTPUT:
# Abaji Pune`],
        [`<b>Disadvantages:</b> the number of targets must match exactly (unless a star is used) or you get a ValueError; long unpackings are hard to read and positional.`,
            r`# Disadvantage: count mismatch
try:
    a, b = (1, 2, 3)
except ValueError as e:
    print("ValueError:", e)
try:
    a, b, c = (1, 2)
except ValueError as e:
    print("ValueError:", e)

# OUTPUT:
# ValueError: too many values to unpack (expected 2)
# ValueError: not enough values to unpack (expected 3, got 2)`],
        [`<b>Limitations:</b> only one starred target is allowed per assignment, the star always yields a list (even for tuples), and unpacking a large iterable materialises everything.`,
            r`# Limitation: star target gives a list, and only one is allowed
a, *rest = (1, 2, 3)
print(rest, type(rest).__name__)
try:
    compile("*a, *b = [1, 2, 3]", "d", "exec")
except SyntaxError as e:
    print("SyntaxError:", e.msg)

# OUTPUT:
# [2, 3] list
# SyntaxError: multiple starred expressions in assignment`],
        `
   ("Abaji", 30, "Pune")
        │      │     │
        ▼      ▼     ▼
   name,    age,  city  =  (...)      one name per slot

   [1, 2, 3, 4, 5]  ──►  first, *middle, last
                         1   [2, 3, 4]   5
`,
        `Unpacking is great at API boundaries but positional contracts are brittle: returning 5 values as a tuple invites bugs. Return a NamedTuple, dataclass or dict once data has more than ~3 fields, and keep unpacking for small, obvious shapes.`
    ),

    'Sets': dd(
        [`A <b>set</b> is an unordered collection of <b>unique, hashable</b> items. Duplicates vanish automatically. Create one with <code>{1, 2}</code> or <code>set(iterable)</code>; an empty set must be <code>set()</code> because <code>{}</code> is an empty dict.`,
            r`s = {3, 1, 2, 3, 1}              # duplicates removed
print(sorted(s), len(s))
empty = set()
print(type({}).__name__, type(empty).__name__)
s.add(10)
s.discard(99)                      # no error if absent
s.remove(1)                        # error if absent
print(sorted(s))

# OUTPUT:
# [1, 2, 3] 3
# dict set
# [2, 3, 10]`],
        [`Removing duplicates and testing "have I seen this?" are constant needs. A set does both in O(1) average time, while a list needs a scan for each test.`,
            r`emails = ["a@x.com", "b@x.com", "a@x.com", "c@x.com", "b@x.com"]
unique = set(emails)
print(len(emails), "->", len(unique))
seen = set()
dups = [e for e in emails if e in seen or seen.add(e)]   # first-seen wins
print(dups)

# OUTPUT:
# 5 -> 3
# ['a@x.com', 'b@x.com']`],
        [`Deduplicating IDs, tracking visited nodes in graph search, tag systems, permission sets, spell-check dictionaries and fast blacklist lookups.`,
            r`# Real-time: allow-list check
ALLOWED = {"admin", "editor", "viewer"}
def can_login(role):
    return role in ALLOWED                    # O(1) average

print(can_login("editor"), can_login("hacker"))

# OUTPUT:
# True False`],
        [`<b>Advantages:</b> O(1) average add/remove/membership, automatic uniqueness, and powerful set algebra operators.`,
            r`# Advantage: membership speed vs list
import timeit
lst = list(range(100_000))
st = set(lst)
t_list = timeit.timeit(lambda: 99_999 in lst, number=200)
t_set = timeit.timeit(lambda: 99_999 in st, number=200)
print("set is faster:", t_set < t_list)

# OUTPUT:
# set is faster: True`],
        [`<b>Disadvantages:</b> no ordering and no indexing; every set uses more memory than a list because of its hash table.`,
            r`s = {10, 20, 30}
try:
    s[0]
except TypeError as e:
    print("TypeError:", e)
import sys
print(sys.getsizeof(set(range(10))) > sys.getsizeof(list(range(10))))

# OUTPUT:
# TypeError: 'set' object is not subscriptable
# True`],
        [`<b>Limitations:</b> members must be hashable (no lists or dicts); sets themselves are mutable and unhashable (use <code>frozenset</code>); iteration order is not guaranteed.`,
            r`try:
    {[1, 2], 3}
except TypeError as e:
    print("TypeError:", e)
fs = frozenset([1, 2, 3])          # immutable and hashable
print({fs: "ok"}[frozenset([3, 2, 1])])

# OUTPUT:
# TypeError: unhashable type: 'list'
# ok`],
        `
   items ──► hash(item) ──► bucket
   {3,1,2}      │
                ▼
          ┌────┬────┬────┬────┐
          │ 1  │    │ 2  │ 3  │   lookup = hash + compare  (O(1) avg)
          └────┴────┴────┴────┘
          duplicate? same hash + equal => ignored
`,
        `Use a set whenever the question is "is x present?" or "which items are unique?". The cost is memory and the need for hashable, stable-hash items. If order of first appearance matters, use <code>dict.fromkeys(items)</code> to deduplicate while preserving order.`
    ),

    'Set Operations': dd(
        [`Sets support mathematical operations: union <code>|</code>, intersection <code>&amp;</code>, difference <code>-</code>, symmetric difference <code>^</code>, and tests <code>issubset</code>, <code>issuperset</code>, <code>isdisjoint</code>.`,
            r`a = {1, 2, 3, 4}
b = {3, 4, 5, 6}
print(a | b)                        # union
print(a & b)                        # intersection
print(a - b)                        # in a, not in b
print(a ^ b)                        # in exactly one
print({1, 2} <= a, a.isdisjoint({9}))

# OUTPUT:
# {1, 2, 3, 4, 5, 6}
# {3, 4}
# {1, 2}
# {1, 2, 5, 6}
# True True`],
        [`Comparing groups ("who is in both lists?", "what is missing?") by hand needs nested loops; set algebra does it in one line, fast and readable.`,
            r`enrolled = {"abaji", "raoji", "moropant"}
paid = {"abaji", "moropant", "kanhoji"}
print("paid and enrolled:", sorted(enrolled & paid))
print("enrolled, not paid:", sorted(enrolled - paid))
print("paid, not enrolled:", sorted(paid - enrolled))

# OUTPUT:
# paid and enrolled: ['abaji', 'moropant']
# enrolled, not paid: ['raoji']
# paid, not enrolled: ['kanhoji']`],
        [`Recommendation engines (common interests), access control (role overlap), data reconciliation between two systems, and finding added/removed files in a sync tool.`,
            r`# Real-time: reconcile yesterday's and today's file lists
yesterday = {"a.txt", "b.txt", "c.txt"}
today = {"b.txt", "c.txt", "d.txt"}
print("added  :", sorted(today - yesterday))
print("removed:", sorted(yesterday - today))
print("kept   :", sorted(today & yesterday))

# OUTPUT:
# added  : ['d.txt']
# removed: ['a.txt']
# kept   : ['b.txt', 'c.txt']`],
        [`<b>Advantages:</b> expressive, near-linear time (O(len of smaller) for intersection), and the operations have both operator and method forms; methods accept any iterable.`,
            r`# Advantage: methods accept any iterable (operators need sets)
a = {1, 2, 3}
print(a.union([3, 4], (5,)))            # lists and tuples are fine
print(a.intersection(range(2, 10)))
try:
    a | [4]
except TypeError as e:
    print("TypeError:", e)

# OUTPUT:
# {1, 2, 3, 4, 5}
# {2, 3}
# TypeError: unsupported operand type(s) for |: 'set' and 'list'`],
        [`<b>Disadvantages:</b> results are unordered and lose duplicates and counts; the operators create new sets (memory) unless you use the in-place forms.`,
            r`# Disadvantage: counts are lost
a, b = [1, 1, 2], [1, 2, 2]
print(sorted(set(a) & set(b)))     # multiplicity is gone
from collections import Counter
print(Counter(a) & Counter(b))     # multiset intersection keeps min counts

# OUTPUT:
# [1, 2]
# Counter({1: 1, 2: 1})`],
        [`<b>Limitations:</b> items must be hashable; in-place operators (<code>|=</code>, <code>&amp;=</code>, <code>-=</code>) change the set and cannot be used on frozensets without rebinding.`,
            r`a = {1, 2}
a |= {3}                           # in-place update
print(a)
f = frozenset({1, 2})
g = f | {3}                        # frozenset returns a NEW frozenset
print(type(g).__name__, sorted(g))

# OUTPUT:
# {1, 2, 3}
# frozenset [1, 2, 3]`],
        `
      A = {1,2,3,4}        B = {3,4,5,6}

       ┌─────────┬─────────┬─────────┐
       │  1  2   │  3  4   │  5  6   │
       └─────────┴─────────┴─────────┘
         A - B      A & B      B - A
       |<─────────────────>|            A
                 |<─────────────────>|  B
       |<───────────────────────────>|  A | B (union)
       A ^ B = (A - B) plus (B - A)
`,
        `Set algebra beats nested loops by orders of magnitude on large data. For multiplicities use <code>Counter</code>; for ordered results sort afterwards; for very large or disk-resident sets move the reconciliation into SQL (<code>INTERSECT</code>, <code>EXCEPT</code>) or a database index.`
    ),
};
