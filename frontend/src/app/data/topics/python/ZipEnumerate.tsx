import type { Topic } from '../../types';

export const zipEnumerate: Topic = {
    id: 'python-functions-zip-enumerate',
    name: 'zip() & enumerate()',
    beginner: [
        {
            content: `<h4>enumerate() - Position and Item Together</h4>
<code>enumerate(iterable, start=0)</code> produces <code>(index, item)</code> pairs. It replaces the <code>range(len(...))</code> pattern carried over from Java and C.`,
            codeExamples: [
                `fruits = ["apple", "mango", "kiwi"]

# Old habit - works, but not Pythonic
for i in range(len(fruits)):
    print(i, fruits[i])

# Pythonic
for i, fruit in enumerate(fruits):
    print(i, fruit)

print(list(enumerate(fruits, start=1)))

# OUTPUT:
# 0 apple
# 1 mango
# 2 kiwi
# 0 apple
# 1 mango
# 2 kiwi
# [(1, 'apple'), (2, 'mango'), (3, 'kiwi')]`
            ]
        },
        {
            content: `<h4>Finding Positions</h4>
enumerate is handy whenever you need to know <b>where</b> something is.`,
            codeExamples: [
                `marks = [72, 35, 88, 19]

failed_positions = [i for i, m in enumerate(marks) if m < 40]
print(failed_positions)

names = ["Abaji", "Raoji", "Kanhoji"]
position = {name: i for i, name in enumerate(names)}
print(position)

# OUTPUT:
# [1, 3]
# {'Abaji': 0, 'Raoji': 1, 'Kanhoji': 2}`
            ]
        },
        {
            content: `<h4>zip() - Pairing Items from Several Iterables</h4>
<code>zip(a, b, ...)</code> takes the first item of each, then the second of each, and so on, producing tuples. It <b>stops at the shortest</b> iterable.`,
            codeExamples: [
                `names = ["Abaji", "Raoji", "Kanhoji"]
marks = [91, 78, 85]
cities = ["Pune", "Latur", "Udgir"]

print(list(zip(names, marks)))
print(list(zip(names, marks, cities))[0])
print(list(zip([1, 2, 3], ["a", "b"])))     # the extra 3 is dropped

# OUTPUT:
# [('Abaji', 91), ('Raoji', 78), ('Kanhoji', 85)]
# ('Abaji', 91, 'Pune')
# [(1, 'a'), (2, 'b')]`
            ]
        },
        {
            content: `<h4>Looping over Lists in Parallel</h4>`,
            codeExamples: [
                `items = ["Pen", "Notebook", "Bag"]
prices = [10, 45, 900]
qtys = [3, 2, 1]

total = 0
for item, price, qty in zip(items, prices, qtys):
    line = price * qty
    total += line
    print(f"{item:<10}{qty} x {price} = {line}")
print("Total:", total)

# OUTPUT:
# Pen       3 x 10 = 30
# Notebook  2 x 45 = 90
# Bag       1 x 900 = 900
# Total: 1020`
            ]
        },
        {
            content: `<h4>Building a Dictionary with zip()</h4>`,
            codeExamples: [
                `keys = ["name", "age", "city"]
values = ["Abaji", 21, "Pune"]

student = dict(zip(keys, values))
print(student)

# OUTPUT:
# {'name': 'Abaji', 'age': 21, 'city': 'Pune'}`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Both Are Lazy, Single-Use Iterators</h3>
<code>zip</code> and <code>enumerate</code> produce pairs on demand and can be consumed only once.`,
            codeExamples: [
                `pairs = zip([1, 2], [3, 4])
print(pairs)                 # an iterator object
print(list(pairs))
print(list(pairs))           # already exhausted

# OUTPUT:
# <zip object at 0x...>      (the address varies)
# [(1, 3), (2, 4)]
# []`
            ]
        },
        {
            content: `<h3>Unequal Lengths: strict=True and zip_longest</h3>
Silently dropping extra items can hide bugs. Since Python 3.10, <code>strict=True</code> raises an error on unequal lengths. When the extra items matter, <code>itertools.zip_longest</code> pads the shorter iterables with a <code>fillvalue</code>.`,
            codeExamples: [
                `from itertools import zip_longest

print(list(zip_longest([1, 2, 3], ["a"], fillvalue="-")))
print(list(zip([1, 2, 3], ["a", "b"], strict=True)))

# OUTPUT:
# [(1, 'a'), (2, '-'), (3, '-')]
# ValueError: zip() argument 2 is shorter than argument 1`
            ]
        },
        {
            content: `<h3>Unzipping and Transposing with zip(*...)</h3>
<code>*</code> spreads a list of tuples into separate arguments, so <code>zip</code> regroups them: pairs become columns. The same trick transposes a matrix.`,
            codeExamples: [
                `pairs = [("Abaji", 91), ("Raoji", 78), ("Kanhoji", 85)]
names, marks = zip(*pairs)
print(names)
print(marks)

matrix = [[1, 2, 3],
          [4, 5, 6]]
print(list(zip(*matrix)))
print([list(col) for col in zip(*matrix)])

# OUTPUT:
# ('Abaji', 'Raoji', 'Kanhoji')
# (91, 78, 85)
# [(1, 4), (2, 5), (3, 6)]
# [[1, 4], [2, 5], [3, 6]]`
            ]
        },
        {
            content: `<h3>Neighbouring Pairs</h3>
Zipping a list with itself shifted by one gives each item and its successor - useful for differences, trends and validation. <code>itertools.pairwise</code> (3.10+) does the same without slicing.`,
            codeExamples: [
                `from itertools import pairwise

prices = [100, 120, 90, 150]

changes = [b - a for a, b in zip(prices, prices[1:])]
print(changes)
print(list(pairwise(prices)))
print(all(a <= b for a, b in pairwise([1, 3, 3, 7])))   # sorted?

# OUTPUT:
# [20, -30, 60]
# [(100, 120), (120, 90), (90, 150)]
# True`
            ]
        },
        {
            content: `<h3>enumerate with Other Iterables</h3>
enumerate works on anything iterable: sorted dictionary items (for rankings) or the lines of a file (for line numbers). <code>io.StringIO</code> stands in for a real file here.`,
            codeExamples: [
                `import io

scores = {"Abaji": 91, "Raoji": 78, "Kanhoji": 85}
ranking = sorted(scores.items(), key=lambda kv: kv[1], reverse=True)
for rank, (name, score) in enumerate(ranking, start=1):
    print(rank, name, score)

log = io.StringIO("start\\nERROR disk full\\nok\\nERROR timeout\\n")
for line_no, line in enumerate(log, start=1):
    if "ERROR" in line:
        print(f"line {line_no}: {line.rstrip()}")

# OUTPUT:
# 1 Abaji 91
# 2 Kanhoji 85
# 3 Raoji 78
# line 2: ERROR disk full
# line 4: ERROR timeout`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why prefer enumerate over range(len(x))?</td><td>It is clearer, works on any iterable (not just indexable sequences) and avoids index mistakes</td></tr>
<tr class='text-center'><td>What does zip do with unequal lengths?</td><td>Stops at the shortest; use strict=True (3.10+) to raise an error or zip_longest to pad</td></tr>
<tr class='text-center'><td>How do you unzip a list of pairs?</td><td><code>a, b = zip(*pairs)</code> - the results are tuples</td></tr>
<tr class='text-center'><td>How do you transpose a matrix?</td><td><code>list(zip(*matrix))</code></td></tr>
<tr class='text-center'><td>How do you build a dict from two lists?</td><td><code>dict(zip(keys, values))</code></td></tr>
<tr class='text-center'><td>Can you start enumerate at 1?</td><td>Yes - <code>enumerate(items, start=1)</code></td></tr>
</table>`
        }
    ]
};
