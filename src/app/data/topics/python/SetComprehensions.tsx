import type { Topic } from '../../types';

export const setComprehensions: Topic = {
    id: 'python-comprehensions-set-comprehensions',
    name: 'Set Comprehensions',
    beginner: [
        {
            content: `<h4>What is a Set Comprehension?</h4>
A <b>set comprehension</b> looks like a list comprehension written with curly braces:<br><br>
<code>{expr for item in iterable}</code><br><br>
Because the result is a set, <b>duplicates are removed automatically</b>. It is the Python counterpart of Java's <code>stream().map(...).collect(Collectors.toSet())</code>.<br><br>
Sets have no guaranteed order, so the examples below print them through <code>sorted()</code> to give the same output on every run.`,
            codeExamples: [
                `words = ["apple", "kiwi", "mango", "fig", "plum"]

lengths = {len(w) for w in words}
print(sorted(lengths))           # 5 words, only 3 distinct lengths

# OUTPUT:
# [3, 4, 5]`
            ]
        },
        {
            content: `<h4>Collecting Unique Values</h4>`,
            codeExamples: [
                `emails = ["asha@gmail.com", "ravi@yahoo.com", "meena@gmail.com", "kiran@outlook.com"]

domains = {e.split("@")[1] for e in emails}
print(len(domains), sorted(domains))

names = ["Asha", "Ajay", "Ravi", "Rohit", "Meena"]
initials = {name[0] for name in names}
print(sorted(initials))

# OUTPUT:
# 3 ['gmail.com', 'outlook.com', 'yahoo.com']
# ['A', 'M', 'R']`
            ]
        },
        {
            content: `<h4>Adding a Filter</h4>
An <code>if</code> at the end keeps only the items that pass the test.`,
            codeExamples: [
                `nums = [12, 25, 32, 47, 55, 60]

last_digits = {n % 10 for n in nums if n > 20}
print(sorted(last_digits))

# OUTPUT:
# [0, 2, 5, 7]`
            ]
        },
        {
            content: `<h4>Braces: Set or Dict?</h4>
Curly braces make a <b>set</b> when there is no colon, and a <b>dict</b> when there are <code>key: value</code> pairs. Empty braces <code>{}</code> are always an empty <b>dict</b> - use <code>set()</code> for an empty set.`,
            codeExamples: [
                `print(type({n for n in range(3)}))
print(type({n: n for n in range(3)}))
print(type({}))
print(type(set()))

# OUTPUT:
# <class 'set'>
# <class 'dict'>
# <class 'dict'>
# <class 'set'>`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Elements Must Be Hashable</h3>
Every value the expression produces is stored in a hash table, so it must be hashable. Lists are not - convert them to tuples (order matters) or frozensets (order doesn't matter).`,
            codeExamples: [
                `pairs = [[1, 2], [2, 1], [1, 2]]

as_tuples = {tuple(p) for p in pairs}
print(sorted(as_tuples))                 # (1, 2) and (2, 1) are different

as_frozensets = {frozenset(p) for p in pairs}
print(len(as_frozensets))                # {1, 2} == {2, 1}

bad = {p for p in pairs}

# OUTPUT:
# [(1, 2), (2, 1)]
# 1
# TypeError: unhashable type: 'list'`
            ]
        },
        {
            content: `<h3>Never Rely on Set Order</h3>
String hashes are randomised per process, so a set of strings can print in a different order each run. Even small integers can come out unsorted when their hashes collide in the table. Sort before displaying, comparing as text, or writing to a file.`,
            codeExamples: [
                `tags = {t.lower() for t in ["Python", "SQL", "python", "Git"]}

print(tags)                      # order may differ between runs
print(sorted(tags))              # always the same

# OUTPUT (first line varies):
# {'git', 'sql', 'python'}
# ['git', 'python', 'sql']`
            ]
        },
        {
            content: `<h3>Comprehension vs set(generator) vs set(map(...))</h3>
All three build the same set. The comprehension is usually the most readable; <code>set(map(func, items))</code> is concise when you already have a named function.`,
            codeExamples: [
                `words = ["Apple", "apple", "BANANA", "banana", "Cherry"]

s1 = {w.lower() for w in words}
s2 = set(w.lower() for w in words)
s3 = set(map(str.lower, words))

print(s1 == s2 == s3, sorted(s1))

# OUTPUT:
# True ['apple', 'banana', 'cherry']`
            ]
        },
        {
            content: `<h3>Precomputing a Fast Lookup</h3>
A common pattern: build a set once from one collection, then filter another collection against it. Each <code>in</code> check on the set is O(1) on average, so the whole filter is O(n + m) instead of O(n × m) with a list.`,
            codeExamples: [
                `banned = [{"id": 7, "reason": "spam"}, {"id": 9, "reason": "fraud"}]
orders = [
    {"order": 1, "user": 3},
    {"order": 2, "user": 7},
    {"order": 3, "user": 5},
    {"order": 4, "user": 9},
]

banned_ids = {b["id"] for b in banned}                  # build once
valid = [o["order"] for o in orders if o["user"] not in banned_ids]
print(valid)

# OUTPUT:
# [1, 3]`
            ]
        },
        {
            content: `<h3>frozenset Results</h3>
A set comprehension always produces a mutable <code>set</code>. When you need an immutable, hashable result - for a dict key or a constant - wrap a generator in <code>frozenset()</code>.`,
            codeExamples: [
                `VOWELS = frozenset(ch for ch in "aeiouAEIOU")

def count_vowels(text):
    return sum(1 for ch in text if ch in VOWELS)

print(count_vowels("JavaSchoolLab"))

groups = [["asha", "ravi"], ["ravi", "asha"], ["meena"]]
unique_groups = {frozenset(g) for g in groups}
print(len(unique_groups))

# OUTPUT:
# 5
# 2`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is the syntax of a set comprehension?</td><td><code>{expr for item in iterable if condition}</code> - braces with no colon</td></tr>
<tr class='text-center'><td>What does <code>{}</code> create?</td><td>An empty dict; use <code>set()</code> for an empty set</td></tr>
<tr class='text-center'><td>Why can't a set comprehension produce lists?</td><td>Set elements must be hashable; convert to tuples or frozensets</td></tr>
<tr class='text-center'><td>Is the result ordered?</td><td>No - sort it whenever order matters</td></tr>
<tr class='text-center'><td>When is a set comprehension better than a list comprehension?</td><td>When you need unique values or will do repeated membership checks</td></tr>
<tr class='text-center'><td>How do you get an immutable set from a comprehension-style expression?</td><td><code>frozenset(expr for item in iterable)</code></td></tr>
</table>`
        }
    ]
};
