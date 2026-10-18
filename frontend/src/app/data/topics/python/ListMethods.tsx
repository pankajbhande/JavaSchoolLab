import type { Topic } from '../../types';

export const listMethods: Topic = {
    id: 'python-collections-list-methods-sort-reverse-more',
    name: 'List Methods: sort(), reverse() & More',
    beginner: [
        {
            content: `<h4>All List Methods</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Method</th><th>Purpose</th></tr>
<tr class='text-center'><td><code>append</code>, <code>extend</code>, <code>insert</code></td><td>Add items</td></tr>
<tr class='text-center'><td><code>remove</code>, <code>pop</code>, <code>clear</code></td><td>Remove items</td></tr>
<tr class='text-center'><td><code>sort(key=None, reverse=False)</code></td><td>Sort in place</td></tr>
<tr class='text-center'><td><code>reverse()</code></td><td>Reverse in place</td></tr>
<tr class='text-center'><td><code>index(x)</code></td><td>Position of the first x</td></tr>
<tr class='text-center'><td><code>count(x)</code></td><td>How many times x appears</td></tr>
<tr class='text-center'><td><code>copy()</code></td><td>Shallow copy</td></tr>
</table>`
        },
        {
            content: `<h4>sort() - Sorting in Place</h4>
<code>sort()</code> rearranges the list itself and returns <code>None</code>. Pass <code>reverse=True</code> for descending order.`,
            codeExamples: [
                `marks = [72, 45, 91, 60, 88]

marks.sort()
print(marks)

marks.sort(reverse=True)
print(marks)

names = ["sheru", "Pankaj", "dheeraj"]
names.sort()
print(names)                     # uppercase sorts before lowercase

# OUTPUT:
# [45, 60, 72, 88, 91]
# [91, 88, 72, 60, 45]
# ['Pankaj', 'dheeraj', 'sheru']`
            ]
        },
        {
            content: `<h4>sorted() - A New Sorted List</h4>
The built-in <code>sorted()</code> works on <b>any</b> iterable and returns a new list, leaving the original untouched.`,
            codeExamples: [
                `prices = [499, 99, 1299, 250]

cheap_first = sorted(prices)
print(cheap_first)
print(prices)                    # unchanged

print(sorted("python"))
print(sorted((3, 1, 2), reverse=True))

# OUTPUT:
# [99, 250, 499, 1299]
# [499, 99, 1299, 250]
# ['h', 'n', 'o', 'p', 't', 'y']
# [3, 2, 1]`
            ]
        },
        {
            content: `<h4>Sorting with key=</h4>
<code>key</code> is a function applied to each item; items are sorted by its result.`,
            codeExamples: [
                `names = ["sheru", "Pankaj", "dheeraj", "Abaji"]
print(sorted(names, key=str.lower))      # case-insensitive
print(sorted(names, key=len))            # shortest first

students = [("Pankaj", 88), ("Sheru", 74), ("Abaji", 95)]
print(sorted(students, key=lambda s: s[1], reverse=True))

# OUTPUT:
# ['Abaji', 'dheeraj', 'Pankaj', 'sheru']
# ['sheru', 'Abaji', 'Pankaj', 'dheeraj']
# [('Abaji', 95), ('Pankaj', 88), ('Sheru', 74)]`
            ]
        },
        {
            content: `<h4>reverse(), index() and count()</h4>`,
            codeExamples: [
                `steps = ["wake", "code", "eat", "code", "sleep"]

print(steps.count("code"))
print(steps.index("code"))           # first occurrence
print(steps.index("code", 2))        # search from index 2

steps.reverse()
print(steps)

# OUTPUT:
# 2
# 1
# 3
# ['sleep', 'code', 'eat', 'code', 'wake']`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>The <code>x = x.sort()</code> Bug</h3>
In-place methods (<code>sort</code>, <code>reverse</code>, <code>append</code>, <code>extend</code>...) return <code>None</code>, by design - so you can't mistake them for functions that return a new list. Assigning their result throws your list away.`,
            codeExamples: [
                `nums = [3, 1, 2]
nums = nums.sort()
print(nums)

nums = [3, 1, 2]
nums.sort()                      # call it, don't assign it
print(nums)

# OUTPUT:
# None
# [1, 2, 3]`
            ]
        },
        {
            content: `<h3>Sorting by Several Keys</h3>
Return a <b>tuple</b> from the key function: tuples compare element by element. To sort one numeric field descending and another ascending, negate the number. <code>operator.itemgetter</code> / <code>attrgetter</code> are faster, readable alternatives to lambdas.`,
            codeExamples: [
                `from operator import itemgetter

students = [
    {"name": "Sheru", "marks": 88},
    {"name": "Abaji", "marks": 95},
    {"name": "Pankaj", "marks": 88},
]

# highest marks first; ties broken alphabetically by name
ranked = sorted(students, key=lambda s: (-s["marks"], s["name"]))
print([s["name"] for s in ranked])

by_name = sorted(students, key=itemgetter("name"))
print([s["name"] for s in by_name])

# OUTPUT:
# ['Abaji', 'Pankaj', 'Sheru']
# ['Abaji', 'Pankaj', 'Sheru']`
            ]
        },
        {
            content: `<h3>Sorting Is Stable (Timsort)</h3>
Python uses <b>Timsort</b>: O(n log n) in the worst case, close to O(n) on data that is already partly sorted, and <b>stable</b> - items with equal keys keep their original order. Stability lets you sort by several keys in passes, least important key first.`,
            codeExamples: [
                `orders = [("Pune", 300), ("Delhi", 120), ("Pune", 120), ("Delhi", 300)]

orders.sort(key=lambda o: o[1])      # secondary key first
orders.sort(key=lambda o: o[0])      # primary key - ties keep the amount order
print(orders)

# OUTPUT:
# [('Delhi', 120), ('Delhi', 300), ('Pune', 120), ('Pune', 300)]`
            ]
        },
        {
            content: `<h3>Mixed Types Can't Be Sorted</h3>
Python 3 refuses to order values that have no natural ordering between them. Supply a <code>key</code> that makes them comparable.`,
            codeExamples: [
                `data = [10, "9", 8]
print(sorted(data, key=int))
print(sorted(data))

# OUTPUT:
# [8, '9', 10]
# TypeError: '<' not supported between instances of 'str' and 'int'`
            ]
        },
        {
            content: `<h3>reverse() vs reversed() vs [::-1]</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Form</th><th>Result</th><th>Memory</th></tr>
<tr class='text-center'><td><code>a.reverse()</code></td><td>Reverses <code>a</code> itself, returns None</td><td>No copy</td></tr>
<tr class='text-center'><td><code>reversed(a)</code></td><td>A lazy iterator - good for looping</td><td>No copy</td></tr>
<tr class='text-center'><td><code>a[::-1]</code></td><td>A new reversed list</td><td>Full copy</td></tr>
</table>`,
            codeExamples: [
                `a = [1, 2, 3]
r = reversed(a)
print(r)                 # an iterator object, not a list
print(list(r), a[::-1], a)

# OUTPUT:
# <list_reverseiterator object at 0x7f3a2c1b8e50>
# [3, 2, 1] [3, 2, 1] [1, 2, 3]`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>sort() vs sorted()?</td><td>sort() is a list method that sorts in place and returns None; sorted() takes any iterable and returns a new list</td></tr>
<tr class='text-center'><td>Which algorithm does Python use?</td><td>Timsort - stable, O(n log n) worst case, adaptive to existing order (Powersort since 3.11, a refinement of its merge policy)</td></tr>
<tr class='text-center'><td>What does stable sorting mean?</td><td>Equal keys keep their relative input order</td></tr>
<tr class='text-center'><td>How do you sort by two fields, one descending?</td><td>A tuple key with the numeric field negated: <code>key=lambda s: (-s.marks, s.name)</code></td></tr>
<tr class='text-center'><td>What does <code>index()</code> do if the item is missing?</td><td>Raises ValueError</td></tr>
</table>`
        }
    ]
};
