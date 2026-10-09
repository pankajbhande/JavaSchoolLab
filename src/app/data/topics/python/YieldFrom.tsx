import type { Topic } from '../../types';

export const yieldFrom: Topic = {
    id: 'python-iterators-generators-yield-from',
    name: 'yield from',
    beginner: [
        {
            content: `<h4>Delegating to Another Iterable</h4>
<code>yield from iterable</code> yields every item of <code>iterable</code>, one by one, as if the generator yielded them itself. It replaces the loop <code>for x in iterable: yield x</code>.`,
            codeExamples: [
                `def letters():
    yield "a"
    yield "b"

def combined():
    yield from letters()     # another generator
    yield from range(2)      # any iterable works
    yield from "xy"

print(list(combined()))

# OUTPUT:
# ['a', 'b', 0, 1, 'x', 'y']`
            ]
        },
        {
            content: `<h4>Same Result, Shorter Code</h4>`,
            codeExamples: [
                `def all_students_loop(classes):
    for students in classes:
        for name in students:
            yield name

def all_students(classes):
    for students in classes:
        yield from students

classes = [["Asha", "Ravi"], ["Kiran"], ["Meena", "Sheru"]]
print(list(all_students_loop(classes)))
print(list(all_students(classes)))

# OUTPUT:
# ['Asha', 'Ravi', 'Kiran', 'Meena', 'Sheru']
# ['Asha', 'Ravi', 'Kiran', 'Meena', 'Sheru']`
            ]
        },
        {
            content: `<h4>Recursive Flattening</h4>
<code>yield from</code> shines in recursive generators: a generator can delegate to <b>another call of itself</b>, so nested data of any depth comes out as one flat stream.`,
            codeExamples: [
                `def flatten(items):
    for item in items:
        if isinstance(item, list):
            yield from flatten(item)      # recurse into the sub-list
        else:
            yield item

print(list(flatten([1, [2, [3, [4]], 5], [[6]]])))

# OUTPUT:
# [1, 2, 3, 4, 5, 6]`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Capturing the Sub-Generator's Return Value</h3>
<code>yield from</code> is also an <b>expression</b>: its value is whatever the sub-generator <code>return</code>s. A plain <code>for</code> loop can't get at that value.`,
            codeExamples: [
                `def read_batch(rows):
    count = 0
    for row in rows:
        yield row
        count += 1
    return count                      # becomes the value of yield from

def read_all(batches):
    total = 0
    for batch in batches:
        total += yield from read_batch(batch)
    print("rows read:", total)

print(list(read_all([["a", "b"], ["c"]])))

# OUTPUT:
# rows read: 3
# ['a', 'b', 'c']`
            ]
        },
        {
            content: `<h3>More Than a Loop: send() and throw() Are Forwarded</h3>
For simple iteration, <code>yield from sub</code> and <code>for x in sub: yield x</code> behave the same. The difference appears with <code>send()</code>, <code>throw()</code> and <code>close()</code>: <code>yield from</code> passes them straight through to the sub-generator, while the loop version swallows them.`,
            codeExamples: [
                `def echo():
    while True:
        received = yield
        print("sub got", received)

def delegating():
    yield from echo()

def looping():
    for value in echo():
        yield value

d = delegating()
next(d)
d.send("hello")              # reaches echo()

l = looping()
next(l)
l.send("hello")              # stops at looping's own yield

# OUTPUT:
# sub got hello
# sub got None`
            ]
        },
        {
            content: `<h3>Walking a Tree</h3>
Folders, menus, org charts and JSON documents are trees. A recursive generator with <code>yield from</code> walks them lazily, producing one node at a time.`,
            codeExamples: [
                `tree = {"name": "project", "children": [
    {"name": "src", "children": [
        {"name": "app.py", "children": []},
        {"name": "utils.py", "children": []},
    ]},
    {"name": "README.md", "children": []},
]}

def walk(node, depth=0):
    yield "  " * depth + node["name"]
    for child in node["children"]:
        yield from walk(child, depth + 1)

for line in walk(tree):
    print(line)

print(sum(1 for _ in walk(tree)), "nodes")

# OUTPUT:
# project
#   src
#     app.py
#     utils.py
#   README.md
# 5 nodes`
            ]
        },
        {
            content: `<h3>yield from vs itertools.chain</h3>
To simply concatenate iterables, <code>itertools.chain(a, b, c)</code> (or <code>chain.from_iterable</code>) needs no generator function at all. Use <code>yield from</code> when there is logic around the delegation - conditions, recursion, or a return value to collect.`,
            codeExamples: [
                `from itertools import chain

print(list(chain([1, 2], (3,), "ab")))
print(list(chain.from_iterable([[1, 2], [3], [4, 5]])))

# OUTPUT:
# [1, 2, 3, 'a', 'b']
# [1, 2, 3, 4, 5]`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What does <code>yield from x</code> do?</td><td>Yields every item of the iterable x, delegating to it until it is exhausted</td></tr>
<tr class='text-center'><td>Is it the same as <code>for i in x: yield i</code>?</td><td>For plain iteration yes; but yield from also forwards send/throw/close and returns the sub-generator's return value</td></tr>
<tr class='text-center'><td>What is the value of a yield from expression?</td><td>The value the sub-generator returns (StopIteration.value)</td></tr>
<tr class='text-center'><td>Typical use cases?</td><td>Recursive generators (flattening, tree traversal) and splitting a big generator into smaller ones</td></tr>
<tr class='text-center'><td>When is itertools.chain better?</td><td>When you only need to concatenate iterables without extra logic</td></tr>
</table>`
        }
    ]
};
