import type { Topic } from '../../types';

export const listsBasics: Topic = {
    id: 'python-collections-lists-creating-indexing-slicing',
    name: 'Lists: Creating, Indexing & Slicing',
    beginner: [
        {
            content: `<h4>What is a List?</h4>
A <b>list</b> is an <b>ordered</b>, <b>mutable</b> collection of items written in square brackets. It is Python's most-used data structure - roughly Java's <code>ArrayList</code>, but built in and able to hold any mix of types.<br><br>
• <b>Ordered</b> - items keep the position you put them in.<br>
• <b>Mutable</b> - you can add, remove and replace items.<br>
• <b>Allows duplicates</b> - the same value can appear many times.`,
            codeExamples: [
                `marks = [78, 92, 65, 92]
names = ["Pankaj", "Sheru", "Dheeraj"]
mixed = [1, "two", 3.0, True, None]
empty = []

print(marks, len(marks))
print(mixed)
print(type(names), len(empty))

# OUTPUT:
# [78, 92, 65, 92] 4
# [1, 'two', 3.0, True, None]
# <class 'list'> 0`
            ]
        },
        {
            content: `<h4>Other Ways to Create a List</h4>`,
            codeExamples: [
                `print(list("python"))           # from any iterable
print(list(range(1, 6)))
print([0] * 5)                   # repetition
print([n * n for n in range(5)]) # list comprehension
print("a,b,c".split(","))        # many functions return lists

# OUTPUT:
# ['p', 'y', 't', 'h', 'o', 'n']
# [1, 2, 3, 4, 5]
# [0, 0, 0, 0, 0]
# [0, 1, 4, 9, 16]
# ['a', 'b', 'c']`
            ]
        },
        {
            content: `<h4>Indexing</h4>
Indexes start at <code>0</code>; negative indexes count from the end. Because lists are mutable, you can also <b>assign</b> to an index.`,
            codeExamples: [
                `cities = ["Pune", "Mumbai", "Delhi", "Chennai"]

print(cities[0], cities[2])
print(cities[-1], cities[-2])

cities[1] = "Nagpur"            # replace an item
print(cities)

print(cities[10])

# OUTPUT:
# Pune Delhi
# Chennai Delhi
# ['Pune', 'Nagpur', 'Delhi', 'Chennai']
# IndexError: list index out of range`
            ]
        },
        {
            content: `<h4>Slicing</h4>
<code>list[start:stop:step]</code> returns a <b>new list</b> with the selected items - the stop index is excluded, exactly as with strings.`,
            codeExamples: [
                `nums = [10, 20, 30, 40, 50, 60]

print(nums[1:4])
print(nums[:3])
print(nums[3:])
print(nums[::2])
print(nums[::-1])
print(nums[-2:])

# OUTPUT:
# [20, 30, 40]
# [10, 20, 30]
# [40, 50, 60]
# [10, 30, 50]
# [60, 50, 40, 30, 20, 10]
# [50, 60]`
            ]
        },
        {
            content: `<h4>Nested Lists</h4>
A list can contain other lists - the usual way to represent a table or matrix. Use one index per level.`,
            codeExamples: [
                `matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
]

print(matrix[1])         # second row
print(matrix[1][2])      # row 1, column 2
print(matrix[-1][-1])
print(len(matrix), len(matrix[0]))

# OUTPUT:
# [4, 5, 6]
# 6
# 9
# 3 3`
            ]
        },
        {
            content: `<h4>Common Operations</h4>`,
            codeExamples: [
                `scores = [72, 88, 45, 91]

print(88 in scores, 100 not in scores)
print(len(scores), min(scores), max(scores), sum(scores))
print(scores + [60])
print([1, 2] * 3)

for s in scores:
    print(s, end=" ")
print()

# OUTPUT:
# True True
# 4 45 91 296
# [72, 88, 45, 91, 60]
# [1, 2, 1, 2, 1, 2]
# 72 88 45 91`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Slice Assignment</h3>
On the left of <code>=</code>, a slice <b>replaces</b> that part of the list - the new part may be longer or shorter. With a step (an "extended slice"), the lengths must match exactly.`,
            codeExamples: [
                `nums = [0, 1, 2, 3, 4, 5]

nums[1:3] = ["a", "b", "c"]     # replace 2 items with 3
print(nums)

nums[1:4] = []                  # delete by assigning an empty list
print(nums)

nums[1:1] = [99, 98]            # insert without removing
print(nums)

nums[::2] = [0, 0, 0]           # extended slice: same length required
print(nums)

nums[::2] = [7]

# OUTPUT:
# [0, 'a', 'b', 'c', 3, 4, 5]
# [0, 3, 4, 5]
# [0, 99, 98, 3, 4, 5]
# [0, 99, 0, 3, 0, 5]
# ValueError: attempt to assign sequence of size 1 to extended slice of size 3`
            ]
        },
        {
            content: `<h3>How Lists Are Stored</h3>
A CPython list is a <b>dynamic array of references</b> - each slot holds a pointer to an object living elsewhere. This explains its performance:<br>
• Indexing <code>a[i]</code> is O(1): jump straight to slot i.<br>
• <code>append</code> is amortised O(1): the array over-allocates spare slots, so it only occasionally has to grow and copy.<br>
• Inserting or deleting near the <b>front</b> is O(n): every later reference must shift.<br>
• Mixed types are possible because the list only stores references, not the objects themselves.`,
            codeExamples: [
                `import sys

items = []
last = sys.getsizeof(items)
for i in range(10):
    items.append(i)
    size = sys.getsizeof(items)
    if size != last:
        print(f"len={len(items):2}  grew to {size} bytes")
        last = size

# OUTPUT (64-bit CPython; exact sizes vary by version):
# len= 1  grew to 88 bytes
# len= 5  grew to 120 bytes
# len= 9  grew to 184 bytes
# -> the list grows in steps, not on every append`
            ]
        },
        {
            content: `<h3>Comparing Lists</h3>
<code>==</code> compares element by element. <code>&lt;</code> and <code>&gt;</code> compare <b>lexicographically</b>, like words in a dictionary: the first differing element decides.`,
            codeExamples: [
                `print([1, 2, 3] == [1, 2, 3])
print([1, 2, 3] < [1, 3])        # 2 < 3 decides
print([1, 2] < [1, 2, 0])        # a prefix is smaller
print(["b"] > ["a", "z"])

# OUTPUT:
# True
# True
# True
# True`
            ]
        },
        {
            content: `<h3>The Repetition Trap with Nested Lists</h3>
<code>[[0] * 3] * 3</code> creates <b>three references to one inner list</b>. Build each row separately with a comprehension.`,
            codeExamples: [
                `bad = [[0] * 3] * 3
bad[0][0] = 1
print(bad)

good = [[0] * 3 for _ in range(3)]
good[0][0] = 1
print(good)

# OUTPUT:
# [[1, 0, 0], [1, 0, 0], [1, 0, 0]]
# [[1, 0, 0], [0, 0, 0], [0, 0, 0]]`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What kind of data structure is a Python list?</td><td>A dynamic array of object references (like Java's ArrayList), not a linked list</td></tr>
<tr class='text-center'><td>Can a list hold different types?</td><td>Yes - it stores references, so any objects can be mixed</td></tr>
<tr class='text-center'><td>Does slicing a list copy it?</td><td>Yes - a slice is a new list (a shallow copy of that range)</td></tr>
<tr class='text-center'><td>Time complexity of <code>a[i]</code> and <code>x in a</code>?</td><td>O(1) and O(n)</td></tr>
<tr class='text-center'><td>Why is <code>[[0]*3]*3</code> a bug?</td><td>All three rows are the same list object; use <code>[[0]*3 for _ in range(3)]</code></td></tr>
<tr class='text-center'><td>How do you reverse a list without changing it?</td><td><code>a[::-1]</code> or <code>list(reversed(a))</code></td></tr>
</table>`
        }
    ]
};
