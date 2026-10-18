import type { Topic } from '../../types';

export const tuplePackingUnpacking: Topic = {
    id: 'python-collections-tuple-packing-unpacking',
    name: 'Tuple Packing & Unpacking',
    beginner: [
        {
            content: `<h4>Packing</h4>
Writing several values separated by commas <b>packs</b> them into a tuple automatically.`,
            codeExamples: [
                `student = "Sheru", 22, "Pune"     # packing
print(student, type(student))

# OUTPUT:
# ('Sheru', 22, 'Pune') <class 'tuple'>`
            ]
        },
        {
            content: `<h4>Unpacking</h4>
<b>Unpacking</b> assigns each item of a tuple (or any iterable) to its own variable. The number of variables must match the number of items.`,
            codeExamples: [
                `student = ("Sheru", 22, "Pune")
name, age, city = student          # unpacking
print(name, age, city)

x, y = [3, 4]                      # works with lists too
first, second = "hi"               # and strings
print(x, y, first, second)

# OUTPUT:
# Sheru 22 Pune
# 3 4 h i`
            ]
        },
        {
            content: `<h4>Mismatched Counts Raise Errors</h4>`,
            codeExamples: [
                `a, b = (1, 2, 3)

# OUTPUT:
# ValueError: too many values to unpack (expected 2)`,
                `a, b, c = (1, 2)

# OUTPUT:
# ValueError: not enough values to unpack (expected 3, got 2)`
            ]
        },
        {
            content: `<h4>Swapping Variables</h4>
The right side is packed into a tuple first, then unpacked into the left side - so no temporary variable is needed.`,
            codeExamples: [
                `a, b = 5, 9
a, b = b, a
print(a, b)

# OUTPUT:
# 9 5`
            ]
        },
        {
            content: `<h4>Unpacking in Loops</h4>
Each item of the sequence is unpacked as the loop runs - this is what makes <code>enumerate</code> and <code>dict.items()</code> so convenient.`,
            codeExamples: [
                `results = [("Abaji", 91), ("Raoji", 78)]
for name, marks in results:
    print(f"{name}: {marks}")

for i, (name, marks) in enumerate(results, start=1):
    print(i, name, marks)

# OUTPUT:
# Abaji: 91
# Raoji: 78
# 1 Abaji 91
# 2 Raoji 78`
            ]
        },
        {
            content: `<h4>Ignoring Values with _</h4>
By convention <code>_</code> names a value you don't need.`,
            codeExamples: [
                `name, _, city = ("Pankaj", 28, "Udgir")
print(name, city)

for _ in range(2):
    print("Hello")

# OUTPUT:
# Pankaj Udgir
# Hello
# Hello`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Starred Unpacking</h3>
One starred name collects the leftover items into a <b>list</b> (possibly empty). Only one star is allowed per assignment.`,
            codeExamples: [
                `first, *rest = [10, 20, 30, 40]
*init, last = [10, 20, 30, 40]
head, *middle, tail = "python"
a, *b = [1]

print(first, rest)
print(init, last)
print(head, middle, tail)
print(a, b)

# OUTPUT:
# 10 [20, 30, 40]
# [10, 20, 30] 40
# p ['y', 't', 'h', 'o'] n
# 1 []`,
                `*a, *b = [1, 2, 3]

# OUTPUT:
# SyntaxError: multiple starred expressions in assignment`
            ]
        },
        {
            content: `<h3>Nested Unpacking</h3>
The left side can mirror the structure of the data.`,
            codeExamples: [
                `record = ("INV-42", ("Pune", 411001), [499, 250])
invoice, (city, pin), (item1, item2) = record
print(invoice, city, pin, item1 + item2)

points = [(1, (2, 3)), (4, (5, 6))]
for label, (x, y) in points:
    print(label, x * y)

# OUTPUT:
# INV-42 Pune 411001 749
# 1 6
# 4 30`
            ]
        },
        {
            content: `<h3>Unpacking into Function Calls and Literals</h3>
<code>*</code> spreads an iterable into positional arguments or into a new list/tuple/set; <code>**</code> does the same for dictionaries and keyword arguments.`,
            codeExamples: [
                `def volume(length, width, height):
    return length * width * height

dims = (2, 3, 4)
print(volume(*dims))

print(*[1, 2, 3], sep=" | ")
combined = [*range(3), *"ab", *(9,)]
print(combined)

# OUTPUT:
# 24
# 1 | 2 | 3
# [0, 1, 2, 'a', 'b', 9]`
            ]
        },
        {
            content: `<h3>Simultaneous Assignment Evaluates the Right Side First</h3>
<code>a, b = b, a + b</code> computes both new values from the <b>old</b> ones before assigning anything - which is why the Fibonacci update works in one line.`,
            codeExamples: [
                `a, b = 0, 1
for _ in range(8):
    print(a, end=" ")
    a, b = b, a + b
print()

# Doing it in two steps gives the wrong answer:
a, b = 0, 1
for _ in range(8):
    print(a, end=" ")
    a = b
    b = a + b            # uses the NEW a
print()

# OUTPUT:
# 0 1 1 2 3 5 8 13
# 0 1 2 4 8 16 32 64`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>How does <code>a, b = b, a</code> work?</td><td>The right side is evaluated into a tuple of the old values, then unpacked into a and b</td></tr>
<tr class='text-center'><td>What type does a starred target produce?</td><td>Always a list, even when unpacking a tuple or string</td></tr>
<tr class='text-center'><td>Can you unpack any iterable?</td><td>Yes - lists, tuples, strings, ranges, sets, generators; unpacking a dict gives its keys</td></tr>
<tr class='text-center'><td>What happens with too many values?</td><td>ValueError: too many values to unpack</td></tr>
<tr class='text-center'><td>What does <code>f(*args)</code> do?</td><td>Passes the iterable's items as separate positional arguments</td></tr>
</table>`
        }
    ]
};
