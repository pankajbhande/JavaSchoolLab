import type { Topic } from '../../types';

export const forLoopsAndRange: Topic = {
    id: 'python-control-flow-for-loops-range',
    name: 'for Loops & range()',
    beginner: [
        {
            content: `<h4>The for Loop</h4>
Python's <code>for</code> loop goes through the items of any <b>iterable</b> - a list, string, tuple, dictionary, file, and more - one at a time. It works like Java's enhanced for loop (<code>for (String s : list)</code>); there is no C-style <code>for (i = 0; i &lt; n; i++)</code>.`,
            codeExamples: [
                `languages = ["Java", "Python", "SQL"]
for lang in languages:
    print("I am learning", lang)

for ch in "Hi!":
    print(ch)

# OUTPUT:
# I am learning Java
# I am learning Python
# I am learning SQL
# H
# i
# !`
            ]
        },
        {
            content: `<h4>range() - Looping a Number of Times</h4>
<code>range()</code> produces a sequence of integers:
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Call</th><th>Produces</th></tr>
<tr class='text-center'><td><code>range(5)</code></td><td>0, 1, 2, 3, 4</td></tr>
<tr class='text-center'><td><code>range(2, 6)</code></td><td>2, 3, 4, 5</td></tr>
<tr class='text-center'><td><code>range(1, 10, 3)</code></td><td>1, 4, 7</td></tr>
<tr class='text-center'><td><code>range(10, 0, -2)</code></td><td>10, 8, 6, 4, 2</td></tr>
</table>
Like slicing, the <b>stop value is not included</b>.`,
            codeExamples: [
                `for i in range(3):
    print("Hello", i)

for n in range(10, 0, -2):
    print(n, end=" ")
print()

# OUTPUT:
# Hello 0
# Hello 1
# Hello 2
# 10 8 6 4 2`
            ]
        },
        {
            content: `<h4>Accumulating Results</h4>
A loop often builds up a total, a count or a new list.`,
            codeExamples: [
                `prices = [120, 45, 300, 80]

total = 0
expensive = []
for p in prices:
    total += p
    if p > 100:
        expensive.append(p)

print("Total:", total)
print("Expensive items:", expensive)

n = 5
factorial = 1
for i in range(1, n + 1):
    factorial *= i
print(f"{n}! = {factorial}")

# OUTPUT:
# Total: 545
# Expensive items: [120, 300]
# 5! = 120`
            ]
        },
        {
            content: `<h4>enumerate() - Index and Value Together</h4>
When you need the position too, use <code>enumerate()</code> instead of <code>range(len(...))</code>.`,
            codeExamples: [
                `students = ["Pankaj", "Sheru", "Dheeraj"]

for rank, name in enumerate(students, start=1):
    print(rank, name)

# OUTPUT:
# 1 Pankaj
# 2 Sheru
# 3 Dheeraj`
            ]
        },
        {
            content: `<h4>Looping over Dictionaries and Pairs</h4>
<code>dict.items()</code> gives key-value pairs; <code>zip()</code> walks several sequences in step.`,
            codeExamples: [
                `stock = {"pen": 10, "book": 4}
for item, qty in stock.items():
    print(f"{item}: {qty}")

names = ["Asha", "Ravi"]
marks = [91, 84]
for name, mark in zip(names, marks):
    print(name, "scored", mark)

# OUTPUT:
# pen: 10
# book: 4
# Asha scored 91
# Ravi scored 84`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>range Is a Lazy Sequence</h3>
<code>range</code> does not build a list in memory - it computes values on demand, so <code>range(10**12)</code> costs the same memory as <code>range(5)</code>. It still supports <code>len()</code>, indexing, slicing and a fast O(1) <code>in</code> test.`,
            codeExamples: [
                `import sys

r = range(0, 100, 7)
print(len(r), r[3], r[-1], 49 in r, 50 in r)
print(r[2:5])
print(sys.getsizeof(range(10**12)), sys.getsizeof(list(range(1000))))

# OUTPUT (sizes in bytes, 64-bit CPython):
# 15 21 98 True False
# range(14, 35, 7)
# 48 8056`
            ]
        },
        {
            content: `<h3>Don't Modify a List While Looping over It</h3>
Removing items shifts the remaining ones left, so the loop skips the element right after each removal. Loop over a copy, or better, build a new list.`,
            codeExamples: [
                `nums = [1, 2, 2, 3]
for n in nums:
    if n == 2:
        nums.remove(n)
print(nums)                         # one 2 survived!

nums = [1, 2, 2, 3]
nums = [n for n in nums if n != 2]  # build a new list instead
print(nums)

# OUTPUT:
# [1, 2, 3]
# [1, 3]`
            ]
        },
        {
            content: `<h3>Pythonic Looping Toolkit</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Instead of</th><th>Write</th></tr>
<tr class='text-center'><td><code>for i in range(len(items)): items[i]</code></td><td><code>for item in items:</code></td></tr>
<tr class='text-center'><td>a manual counter</td><td><code>for i, item in enumerate(items):</code></td></tr>
<tr class='text-center'><td>indexing two lists by i</td><td><code>for a, b in zip(xs, ys):</code></td></tr>
<tr class='text-center'><td><code>range(len(x) - 1, -1, -1)</code></td><td><code>for item in reversed(x):</code></td></tr>
<tr class='text-center'><td>sorting a copy first</td><td><code>for item in sorted(x):</code></td></tr>
<tr class='text-center'><td>a loop that only sums / tests</td><td><code>sum(...)</code>, <code>any(...)</code>, <code>all(...)</code></td></tr>
</table>`,
            codeExamples: [
                `marks = [72, 35, 88]
print(sum(marks), any(m < 40 for m in marks), all(m >= 30 for m in marks))

for m in reversed(marks):
    print(m, end=" ")
print()

# zip stops at the shortest input; strict=True (3.10+) raises instead
print(list(zip([1, 2, 3], ["a", "b"])))

# OUTPUT:
# 195 True True
# 88 35 72
# [(1, 'a'), (2, 'b')]`
            ]
        },
        {
            content: `<h3>The Loop Variable Outlives the Loop</h3>
Unlike Java, a <code>for</code> loop does not create its own scope. The loop variable still exists after the loop, holding the last value - and doesn't exist at all if the loop never ran.`,
            codeExamples: [
                `for i in range(3):
    pass
print(i)

for j in []:
    pass
print(j)

# OUTPUT:
# 2
# NameError: name 'j' is not defined`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What can a for loop iterate over?</td><td>Any iterable: sequences, dicts, sets, files, generators and objects implementing <code>__iter__</code></td></tr>
<tr class='text-center'><td>Is the stop value of range() included?</td><td>No - <code>range(1, 5)</code> gives 1, 2, 3, 4</td></tr>
<tr class='text-center'><td>Does range() create a list?</td><td>No - it is a lazy, immutable sequence object with O(1) memory</td></tr>
<tr class='text-center'><td>How do you get the index while looping?</td><td><code>enumerate(iterable, start=0)</code></td></tr>
<tr class='text-center'><td>Why not remove items from a list while iterating over it?</td><td>Indices shift and elements get skipped; iterate over a copy or build a new list</td></tr>
<tr class='text-center'><td>What does zip() do with unequal lengths?</td><td>Stops at the shortest; use <code>itertools.zip_longest</code> or <code>strict=True</code></td></tr>
</table>`
        }
    ]
};
