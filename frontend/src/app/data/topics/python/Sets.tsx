import type { Topic } from '../../types';

export const sets: Topic = {
    id: 'python-collections-sets',
    name: 'Sets',
    beginner: [
        {
            content: `<h4>What is a Set?</h4>
A <b>set</b> is an <b>unordered</b> collection of <b>unique</b> items, written with curly braces. It is like Java's <code>HashSet</code>.<br><br>
• <b>No duplicates</b> - adding an existing item does nothing.<br>
• <b>No order and no indexing</b> - <code>s[0]</code> is an error.<br>
• <b>Fast membership tests</b> - <code>x in s</code> is O(1) on average.<br>
• Items must be <b>hashable</b> (immutable): numbers, strings, tuples - not lists or dicts.`,
            codeExamples: [
                `ids = {101, 102, 103, 102, 101}
print(ids, len(ids))

empty = set()           # NOT {} - that is an empty dict
print(type(empty), type({}))

# OUTPUT:
# {101, 102, 103} 3
# <class 'set'> <class 'dict'>`
            ]
        },
        {
            content: `<h4>Removing Duplicates</h4>
Converting a list to a set is the quickest way to drop duplicates. Sets don't keep order, so sort the result if you need a predictable order.`,
            codeExamples: [
                `emails = ["a@x.com", "b@x.com", "a@x.com", "c@x.com", "b@x.com"]

unique = set(emails)
print(len(emails), "->", len(unique))
print(sorted(unique))

# OUTPUT:
# 5 -> 3
# ['a@x.com', 'b@x.com', 'c@x.com']`
            ]
        },
        {
            content: `<h4>Adding and Removing</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Method</th><th>Effect</th></tr>
<tr class='text-center'><td><code>add(x)</code></td><td>Add one item</td></tr>
<tr class='text-center'><td><code>update(iterable)</code></td><td>Add many items</td></tr>
<tr class='text-center'><td><code>remove(x)</code></td><td>Remove x - <b>KeyError</b> if missing</td></tr>
<tr class='text-center'><td><code>discard(x)</code></td><td>Remove x if present - never fails</td></tr>
<tr class='text-center'><td><code>pop()</code></td><td>Remove and return an arbitrary item</td></tr>
<tr class='text-center'><td><code>clear()</code></td><td>Remove everything</td></tr>
</table>`,
            codeExamples: [
                `tags = {1, 2}
tags.add(3)
tags.add(2)                 # already present - no change
tags.update([4, 5, 4])
print(tags)

tags.discard(99)            # silently ignored
tags.remove(1)
print(tags)

tags.remove(99)

# OUTPUT:
# {1, 2, 3, 4, 5}
# {2, 3, 4, 5}
# KeyError: 99`
            ]
        },
        {
            content: `<h4>Fast Membership Checks</h4>
Use a set whenever the main question is "have I seen this before?" or "is this allowed?".`,
            codeExamples: [
                `blocked_users = {"spam_bot", "troll42"}

for user in ["abaji", "troll42", "raoji"]:
    if user in blocked_users:
        print(user, "is blocked")

seen = set()
for n in [3, 7, 3, 9, 7]:
    if n in seen:
        print("duplicate:", n)
    seen.add(n)

# OUTPUT:
# troll42 is blocked
# duplicate: 3
# duplicate: 7`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Sets Are Hash Tables</h3>
Each item is placed in a slot chosen by its <code>hash()</code>. Lookups jump straight to that slot, which is why membership is O(1) on average and why items must be hashable. Values that compare equal and hash equal are the <b>same element</b> - including <code>1</code>, <code>1.0</code> and <code>True</code>.`,
            codeExamples: [
                `print({1, 1.0, True})
print(hash(1) == hash(1.0) == hash(True))

print({[1, 2]})

# OUTPUT:
# {1}
# True
# TypeError: unhashable type: 'list'`
            ]
        },
        {
            content: `<h3>Order Is Not Guaranteed</h3>
Small integers often <i>appear</i> sorted because of how their hashes map to slots, but that is an accident. String hashes are randomised per process (to defend against hash-flooding attacks), so a set of strings can print in a different order on every run. Never rely on set order - sort when order matters.`,
            codeExamples: [
                `langs = {"python", "java", "go"}
print(langs)               # order may differ between runs
print(sorted(langs))       # always the same

# OUTPUT (first line varies):
# {'go', 'python', 'java'}
# ['go', 'java', 'python']`
            ]
        },
        {
            content: `<h3>Removing Duplicates While Keeping Order</h3>
<code>set()</code> loses the original order. Dictionaries keep insertion order, so <code>dict.fromkeys()</code> dedupes in order in one line.`,
            codeExamples: [
                `visits = ["home", "cart", "home", "pay", "cart"]
print(list(dict.fromkeys(visits)))

# OUTPUT:
# ['home', 'cart', 'pay']`
            ]
        },
        {
            content: `<h3>frozenset and Set Comprehensions</h3>
<code>frozenset</code> is the immutable, hashable version of a set - usable as a dict key or inside another set. Set comprehensions build sets like list comprehensions.`,
            codeExamples: [
                `squares = {n * n for n in range(-3, 4)}
print(sorted(squares), len(squares))     # 7 inputs, 4 unique squares

team_a = frozenset({"abaji", "raoji"})
team_b = frozenset({"raoji", "abaji"})
scores = {team_a: 42}
print(scores[team_b])           # equal frozensets -> same key

# OUTPUT:
# [0, 1, 4, 9] 4
# 42`
            ]
        },
        {
            content: `<h3>Don't Change a Set While Iterating</h3>`,
            codeExamples: [
                `nums = {1, 2, 3, 4}
for n in nums:
    if n % 2 == 0:
        nums.discard(n)

# OUTPUT:
# RuntimeError: Set changed size during iteration
#
# Fix: nums = {n for n in nums if n % 2 != 0}`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>How do you create an empty set?</td><td><code>set()</code> - <code>{}</code> creates an empty dict</td></tr>
<tr class='text-center'><td>remove() vs discard()?</td><td>remove raises KeyError for a missing item; discard does nothing</td></tr>
<tr class='text-center'><td>Why can't a set contain a list?</td><td>Set items must be hashable; lists are mutable and unhashable</td></tr>
<tr class='text-center'><td>Time complexity of <code>x in set</code>?</td><td>O(1) average, O(n) worst case with many hash collisions</td></tr>
<tr class='text-center'><td>How do you dedupe a list but keep order?</td><td><code>list(dict.fromkeys(items))</code></td></tr>
<tr class='text-center'><td>What is <code>len({1, 1.0, True})</code>?</td><td>1 - they are equal and have equal hashes</td></tr>
</table>`
        }
    ]
};
