import type { Topic } from '../../types';

export const listVsTuple: Topic = {
    id: 'python-collections-list-vs-tuple',
    name: 'List vs Tuple',
    beginner: [
        {
            content: `<h4>Side by Side</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>List</th><th>Tuple</th></tr>
<tr class='text-center'><td>Syntax</td><td><code>[1, 2, 3]</code></td><td><code>(1, 2, 3)</code> or <code>1, 2, 3</code></td></tr>
<tr class='text-center'><td>Mutable?</td><td>Yes - add, remove, replace</td><td>No - fixed after creation</td></tr>
<tr class='text-center'><td>Methods</td><td>11 (append, sort, pop...)</td><td>2 (count, index)</td></tr>
<tr class='text-center'><td>Can be a dict key / set member?</td><td>No</td><td>Yes, if its items are hashable</td></tr>
<tr class='text-center'><td>Memory</td><td>More (keeps spare capacity)</td><td>Less (exact size)</td></tr>
<tr class='text-center'><td>Creation speed</td><td>Slower</td><td>Faster (constant tuples are pre-built)</td></tr>
<tr class='text-center'><td>Typical use</td><td>A growing collection of similar items</td><td>A fixed record whose positions have meaning</td></tr>
</table>`
        },
        {
            content: `<h4>Mutability in Practice</h4>`,
            codeExamples: [
                `marks = [70, 85]
marks.append(90)
marks[0] = 75
print(marks)

point = (3, 4)
point[0] = 10

# OUTPUT:
# [75, 85, 90]
# TypeError: 'tuple' object does not support item assignment`
            ]
        },
        {
            content: `<h4>Counting the Methods</h4>
A tuple has only the methods that don't change it.`,
            codeExamples: [
                `list_methods = [m for m in dir(list) if not m.startswith("_")]
tuple_methods = [m for m in dir(tuple) if not m.startswith("_")]

print(len(list_methods), list_methods)
print(len(tuple_methods), tuple_methods)

# OUTPUT:
# 11 ['append', 'clear', 'copy', 'count', 'extend', 'index', 'insert', 'pop', 'remove', 'reverse', 'sort']
# 2 ['count', 'index']`
            ]
        },
        {
            content: `<h4>Which One Should I Use?</h4>
• Use a <b>list</b> when the collection will <b>grow, shrink or be reordered</b>, and every item is the same kind of thing: a list of students, a list of prices.<br>
• Use a <b>tuple</b> for a <b>fixed group</b> of values that belong together: a coordinate <code>(x, y)</code>, an RGB colour, a date <code>(2026, 10, 4)</code>.<br>
• Use a <b>tuple</b> to return several values from a function.<br>
• Use a <b>tuple</b> when you need a dictionary key or set member made of several parts.<br>
• Use a <b>tuple</b> for constants that must never change, such as <code>WEEKDAYS</code>.`,
            codeExamples: [
                `WEEKDAYS = ("Mon", "Tue", "Wed", "Thu", "Fri")   # constant
cart = ["pen", "book"]                            # will change
cart.append("bag")

def divide(a, b):
    return a // b, a % b                          # a tuple of results

route_km = {("Pune", "Mumbai"): 150}              # tuple key

print(len(WEEKDAYS), cart, divide(17, 5), route_km[("Pune", "Mumbai")])

# OUTPUT:
# 5 ['pen', 'book', 'bag'] (3, 2) 150`
            ]
        },
        {
            content: `<h4>Converting Between Them</h4>
<code>list()</code> and <code>tuple()</code> convert in either direction - for example to "edit" a tuple, convert it to a list, change it and convert back.`,
            codeExamples: [
                `colours = ("red", "green")
temp = list(colours)
temp.append("blue")
colours = tuple(temp)
print(colours)

print(list((1, 2)), tuple([1, 2]))

# OUTPUT:
# ('red', 'green', 'blue')
# [1, 2] (1, 2)`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Memory: Tuples Are Smaller</h3>
A list over-allocates so that <code>append</code> is cheap; a tuple's size never changes, so it stores exactly its items. Exact byte counts depend on the Python version and platform, so compare rather than memorise them.`,
            codeExamples: [
                `import sys

data = list(range(100))
print(sys.getsizeof(tuple(data)) < sys.getsizeof(data))
print(sys.getsizeof(()) < sys.getsizeof([]))

# OUTPUT:
# True
# True`
            ]
        },
        {
            content: `<h3>Speed: Tuple Literals Are Built Once</h3>
The compiler stores a tuple of constants inside the function's code object (<b>constant folding</b>), so evaluating it is just a load. A list literal must build a brand-new list every time. <code>dis.dis()</code> shows the difference in bytecode; identity shows it directly.`,
            codeExamples: [
                `import timeit

def get_tuple():
    return (1, 2, 3)

def get_list():
    return [1, 2, 3]

print(get_tuple() is get_tuple())    # the same pre-built constant each call
print(get_list() is get_list())      # a new list each call

print(timeit.timeit("(1, 2, 3, 4, 5)", number=1_000_000))
print(timeit.timeit("[1, 2, 3, 4, 5]", number=1_000_000))

# OUTPUT (timings vary by machine - e.g.):
# True
# False
# 0.006
# 0.035`
            ]
        },
        {
            content: `<h3>Immutable Is Not Always Hashable</h3>
A tuple's immutability is <b>shallow</b>: it can't change which objects it holds, but those objects may themselves be mutable. A tuple is hashable - usable as a dict key - only if <b>every item</b> is hashable.`,
            codeExamples: [
                `ok = (1, "a", (2, 3))
print(hash(ok) == hash((1, "a", (2, 3))))

row = (1, [2])
row[1].append(3)              # the inner list can still change
print(row)
print(hash(row))

# OUTPUT:
# True
# (1, [2, 3])
# TypeError: unhashable type: 'list'`
            ]
        },
        {
            content: `<h3>Tuples Protect Data</h3>
Returning a list from a class lets callers modify its internals. Returning a tuple gives a read-only snapshot.`,
            codeExamples: [
                `class Classroom:
    def __init__(self):
        self._students = ["Abaji", "Raoji"]

    def students_list(self):
        return self._students              # exposes internal state

    def students_tuple(self):
        return tuple(self._students)       # safe snapshot

room = Classroom()
room.students_list().append("Intruder")
print(room.students_tuple())

try:
    room.students_tuple().append("X")
except AttributeError as error:
    print("Blocked:", error)

# OUTPUT:
# ('Abaji', 'Raoji', 'Intruder')
# Blocked: 'tuple' object has no attribute 'append'`
            ]
        },
        {
            content: `<h3>Tuples Are Records, Not Just Frozen Lists</h3>
Idiomatically, a list is a <b>homogeneous sequence</b> (many items of one kind, where length varies) and a tuple is a <b>heterogeneous record</b> (a fixed number of fields, where <b>position has meaning</b>: index 0 is the name, index 1 the age). When positions get hard to remember, switch to a <code>namedtuple</code> to keep tuple behaviour with readable field names.`,
            codeExamples: [
                `from collections import namedtuple

employee = ("Pankaj", 28, "Pune")           # what is employee[2]?
Employee = namedtuple("Employee", ["name", "age", "city"])
emp = Employee("Pankaj", 28, "Pune")

print(employee[2], emp.city)
print(emp == employee)                      # still a tuple underneath

# OUTPUT:
# Pune Pune
# True`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Main difference between list and tuple?</td><td>Lists are mutable; tuples are immutable</td></tr>
<tr class='text-center'><td>Why is a tuple faster to create?</td><td>Constant tuples are folded into the code object at compile time, and tuples need no spare capacity</td></tr>
<tr class='text-center'><td>Can a tuple be a dictionary key?</td><td>Yes, if all its elements are hashable - <code>(1, [2])</code> is not</td></tr>
<tr class='text-center'><td>When would you choose a tuple?</td><td>Fixed records, multiple return values, dict keys, and constants that must not change</td></tr>
<tr class='text-center'><td>How do you "modify" a tuple?</td><td>Build a new one - e.g. convert to a list, change it, convert back, or use concatenation</td></tr>
<tr class='text-center'><td>What is the idiomatic difference?</td><td>List: homogeneous, variable-length sequence. Tuple: heterogeneous record where position has meaning</td></tr>
</table>`
        }
    ]
};
