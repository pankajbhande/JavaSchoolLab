import type { Topic } from '../../types';

export const tuples: Topic = {
    id: 'python-collections-tuples',
    name: 'Tuples',
    beginner: [
        {
            content: `<h4>What is a Tuple?</h4>
A <b>tuple</b> is an <b>ordered</b>, <b>immutable</b> collection written with parentheses. Once created, its items can't be added, removed or replaced. Use tuples for fixed groups of related values: coordinates, RGB colours, a date, a database row.`,
            codeExamples: [
                `point = (10, 20)
rgb = (255, 128, 0)
student = ("Pankaj", 21, "CSE")

print(point[0], rgb[-1], student[1:])
print(len(student), type(student))

# OUTPUT:
# 10 0 (21, 'CSE')
# 3 <class 'tuple'>`
            ]
        },
        {
            content: `<h4>Creating Tuples</h4>
It is the <b>comma</b> that makes a tuple, not the parentheses. A one-item tuple therefore needs a trailing comma.`,
            codeExamples: [
                `a = (1, 2, 3)
b = 1, 2, 3              # parentheses are optional
single = (5,)            # one-item tuple
not_a_tuple = (5)        # just the int 5 in brackets
empty = ()

print(type(b), type(single), type(not_a_tuple))
print(tuple([1, 2]), tuple("hi"))

# OUTPUT:
# <class 'tuple'> <class 'tuple'> <class 'int'>
# (1, 2) ('h', 'i')`
            ]
        },
        {
            content: `<h4>Tuples Are Read-Only</h4>
You can index, slice, loop and search - but not modify.`,
            codeExamples: [
                `days = ("Mon", "Tue", "Wed", "Tue")

print(days.count("Tue"), days.index("Wed"))
print("Sun" in days)
for d in days[:2]:
    print(d)

days[0] = "Sun"

# OUTPUT:
# 2 2
# False
# Mon
# Tue
# TypeError: 'tuple' object does not support item assignment`
            ]
        },
        {
            content: `<h4>Returning Several Values</h4>
A function that "returns several values" actually returns one tuple, which the caller usually unpacks.`,
            codeExamples: [
                `def min_max(values):
    return min(values), max(values)

result = min_max([4, 9, 1, 7])
print(result, type(result))

low, high = min_max([4, 9, 1, 7])
print(low, high)

# OUTPUT:
# (1, 9) <class 'tuple'>
# 1 9`
            ]
        },
        {
            content: `<h4>Tuples as Dictionary Keys</h4>
Because tuples are immutable (and hashable when their items are), they can be dictionary keys and set members - lists cannot.`,
            codeExamples: [
                `distance = {
    ("Pune", "Mumbai"): 150,
    ("Pune", "Nashik"): 210,
}
print(distance[("Pune", "Mumbai")])

seats = {(1, "A"), (1, "B"), (2, "A")}
print((1, "B") in seats)

# OUTPUT:
# 150
# True`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>namedtuple: Tuples with Field Names</h3>
<code>point[0]</code> says nothing about meaning. <code>collections.namedtuple</code> creates a tuple subclass whose fields can also be read by name - still immutable, still as light as a tuple.`,
            codeExamples: [
                `from collections import namedtuple

Point = namedtuple("Point", ["x", "y"])
p = Point(3, 4)

print(p, p.x, p[1])
print(p._asdict())
moved = p._replace(x=10)          # "modify" by creating a new tuple
print(moved, p)
x, y = p                          # still unpacks like a tuple
print(x + y)

# OUTPUT:
# Point(x=3, y=4) 3 4
# {'x': 3, 'y': 4}
# Point(x=10, y=4) Point(x=3, y=4)
# 7`
            ]
        },
        {
            content: `<h3>typing.NamedTuple: With Types and Defaults</h3>
The class syntax is more readable, supports type hints, default values and methods.`,
            codeExamples: [
                `from typing import NamedTuple

class Product(NamedTuple):
    name: str
    price: float
    qty: int = 1

    def total(self):
        return self.price * self.qty

pen = Product("Pen", 12.5, 4)
book = Product("Book", 299.0)
print(pen.total(), book)

# OUTPUT:
# 50.0 Product(name='Book', price=299.0, qty=1)`
            ]
        },
        {
            content: `<h3>"Modifying" a Tuple Creates a New One</h3>
<code>+=</code> on a tuple builds a brand-new tuple and rebinds the name; any other reference keeps the old one. Immutability is also <b>shallow</b>: a list inside a tuple can still change.`,
            codeExamples: [
                `t = (1, 2)
other = t
t += (3,)
print(t, other, t is other)

row = ("Asha", [80, 90])
row[1].append(70)
print(row)

# OUTPUT:
# (1, 2, 3) (1, 2) False
# ('Asha', [80, 90, 70])`
            ]
        },
        {
            content: `<h3>Why Tuples Are Cheaper</h3>
A tuple's size is fixed, so CPython allocates exactly the space needed (lists keep spare capacity for growth). Tuples of constants are built once at compile time, and the empty tuple is a shared singleton.`,
            codeExamples: [
                `import sys
import dis

print(sys.getsizeof((1, 2, 3)) < sys.getsizeof([1, 2, 3]))

dis.dis(compile("(1, 2, 3)", "", "eval"))   # one constant load
dis.dis(compile("[1, 2, 3]", "", "eval"))   # build a list at runtime

# OUTPUT (Python 3.12; opcodes vary by version):
# True
#   RESUME         0
#   RETURN_CONST   0 ((1, 2, 3))
#
#   RESUME         0
#   BUILD_LIST     0
#   LOAD_CONST     0 ((1, 2, 3))
#   LIST_EXTEND    1
#   RETURN_VALUE`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>How do you create a one-element tuple?</td><td>With a trailing comma: <code>(5,)</code> - <code>(5)</code> is just 5</td></tr>
<tr class='text-center'><td>What makes a tuple: parentheses or commas?</td><td>Commas - parentheses are only needed for the empty tuple and to avoid ambiguity</td></tr>
<tr class='text-center'><td>Which methods does a tuple have?</td><td>Only count() and index()</td></tr>
<tr class='text-center'><td>Can a tuple be a dict key?</td><td>Yes, if all its items are hashable</td></tr>
<tr class='text-center'><td>What is a namedtuple?</td><td>A tuple subclass with named fields, created by collections.namedtuple or typing.NamedTuple</td></tr>
<tr class='text-center'><td>Is a tuple completely immutable?</td><td>Its slots are; mutable objects inside it can still change</td></tr>
</table>`
        }
    ]
};
