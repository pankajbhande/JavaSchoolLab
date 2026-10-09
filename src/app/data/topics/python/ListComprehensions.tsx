import type { Topic } from '../../types';

export const listComprehensions: Topic = {
    id: 'python-comprehensions-list-comprehensions',
    name: 'List Comprehensions',
    beginner: [
        {
            content: `<h4>What is a List Comprehension?</h4>
A <b>list comprehension</b> builds a new list from an existing iterable in a single, readable expression:<br><br>
<code>[expression for item in iterable]</code><br><br>
Read it as: "make a list of <i>expression</i>, for each <i>item</i> in <i>iterable</i>". It replaces the common pattern of creating an empty list and calling <code>append()</code> in a loop.`,
            codeExamples: [
                `squares = [n * n for n in range(5)]
print(squares)

# OUTPUT:
# [0, 1, 4, 9, 16]`
            ]
        },
        {
            content: `<h4>From Loop to Comprehension</h4>
Every simple "build a list" loop translates directly: the expression inside <code>append()</code> moves to the front, and the <code>for</code> clause follows it.`,
            codeExamples: [
                `prices = [100, 250, 500]

# Loop version
with_gst = []
for p in prices:
    with_gst.append(p * 1.18)

# Comprehension version - same result
with_gst = [p * 1.18 for p in prices]
print(with_gst)

# OUTPUT:
# [118.0, 295.0, 590.0]`
            ]
        },
        {
            content: `<h4>Transforming Items</h4>
The expression can be anything that produces a value: arithmetic, a method call, a function call, an f-string.`,
            codeExamples: [
                `names = ["asha", "ravi", "kiran"]
print([name.upper() for name in names])
print([len(name) for name in names])
print([f"Hello, {name.title()}!" for name in names])

# OUTPUT:
# ['ASHA', 'RAVI', 'KIRAN']
# [4, 4, 5]
# ['Hello, Asha!', 'Hello, Ravi!', 'Hello, Kiran!']`
            ]
        },
        {
            content: `<h4>Parsing Text</h4>
Comprehensions are perfect for turning raw text into usable values - for example numbers typed on one line, or "name,marks" records.`,
            codeExamples: [
                `line = "10 20 30 40"                 # e.g. from input()
numbers = [int(x) for x in line.split()]
print(numbers, sum(numbers))

records = ["Asha,91", "Ravi,78", "Kiran,85"]
pairs = [r.split(",") for r in records]
print(pairs)
marks = [int(r.split(",")[1]) for r in records]
print(marks)

# OUTPUT:
# [10, 20, 30, 40] 100
# [['Asha', '91'], ['Ravi', '78'], ['Kiran', '85']]
# [91, 78, 85]`
            ]
        },
        {
            content: `<h4>Any Iterable Works</h4>
Strings, ranges, tuples, sets, files and dictionaries can all be the source.`,
            codeExamples: [
                `print([ch for ch in "abc"])
print([n * 10 for n in range(1, 4)])

stock = {"pen": 10, "book": 4}
print([f"{item}={qty}" for item, qty in stock.items()])
print([item for item in stock])           # iterating a dict gives keys

# OUTPUT:
# ['a', 'b', 'c']
# [10, 20, 30]
# ['pen=10', 'book=4']
# ['pen', 'book']`
            ]
        },
        {
            content: `<h4>Compared with Java Streams</h4>
The Java equivalent of a simple list comprehension is a stream with <code>map</code> and <code>collect</code>.`,
            codeExamples: [
                `nums = [1, 2, 3]
doubled = [n * 2 for n in nums]
print(doubled)

# Java:
#   List<Integer> doubled = nums.stream()
#       .map(n -> n * 2)
#       .collect(Collectors.toList());
#
# OUTPUT:
# [2, 4, 6]`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Comprehensions Have Their Own Scope</h3>
In Python 3 the loop variable of a comprehension is local to it - it does not overwrite a variable of the same name outside. A normal <code>for</code> loop does leak its variable.`,
            codeExamples: [
                `x = "outer"
squares = [x * x for x in range(3)]
print(x)                     # unchanged

for x in range(3):
    pass
print(x)                     # the for loop rebound x

# OUTPUT:
# outer
# 2`
            ]
        },
        {
            content: `<h3>Why Comprehensions Are Faster</h3>
An append loop looks up <code>result.append</code> and makes a method call on every iteration. A comprehension compiles to a dedicated <code>LIST_APPEND</code> bytecode instruction instead. Since Python 3.12 (PEP 709), list, dict and set comprehensions are also <b>inlined</b> into the surrounding function rather than run as a hidden nested function, removing that call overhead too - while still keeping the loop variable isolated. The speed-up is real but modest; choose comprehensions mainly for readability.`,
            codeExamples: [
                `import timeit

loop = """
result = []
for n in range(1000):
    result.append(n * n)
"""
comp = "result = [n * n for n in range(1000)]"

print(timeit.timeit(loop, number=10_000))
print(timeit.timeit(comp, number=10_000))

# OUTPUT (timings vary by machine - e.g.):
# 0.62
# 0.38`
            ]
        },
        {
            content: `<h3>When NOT to Use a Comprehension</h3>
• <b>For side effects</b>: <code>[print(x) for x in items]</code> builds a useless list of <code>None</code> values. Use a plain loop when you are <i>doing</i> something rather than <i>building</i> a list.<br>
• <b>For complex logic</b>: if it needs several conditions, nested loops and function calls, a loop with good variable names - or a helper function - is easier to read and debug.<br>
• <b>When you don't need the list</b>: to sum, count or test values, pass a generator expression straight to <code>sum()</code>, <code>any()</code>, <code>max()</code>.`,
            codeExamples: [
                `items = ["pen", "book"]

result = [print(i) for i in items]       # anti-pattern
print(result)

for i in items:                          # just use a loop
    print(i)

# OUTPUT:
# pen
# book
# [None, None]
# pen
# book`
            ]
        },
        {
            content: `<h3>Preview: Generator Expressions</h3>
Swap the square brackets for parentheses and you get a <b>generator expression</b>: it produces values one at a time, lazily, instead of building the whole list in memory. When it is the only argument of a function, the extra parentheses can be dropped. The Iterators &amp; Generators module covers them in depth.`,
            codeExamples: [
                `import sys

squares_list = [n * n for n in range(1_000_000)]
squares_gen = (n * n for n in range(1_000_000))

print(sys.getsizeof(squares_gen) < sys.getsizeof(squares_list))
print(sum(n * n for n in range(10)))     # no brackets needed

# OUTPUT:
# True
# 285`
            ]
        },
        {
            content: `<h3>The Walrus Operator Inside a Comprehension</h3>
<code>:=</code> lets you compute a value once and use it twice in the same item. Note one quirk: a name bound by <code>:=</code> inside a comprehension is assigned in the <b>enclosing</b> scope, so it is still visible afterwards - unlike the loop variable.`,
            codeExamples: [
                `def slow_price(item):
    return len(item) * 100

items = ["pen", "book"]
rows = [(item, (p := slow_price(item)), p * 1.18) for item in items]
print(rows)
print(p)                  # the walrus target leaked out

# OUTPUT:
# [('pen', 300, 354.0), ('book', 400, 472.0)]
# 400`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is a list comprehension?</td><td>An expression that builds a new list: <code>[expr for item in iterable]</code></td></tr>
<tr class='text-center'><td>Does the loop variable leak out?</td><td>No - in Python 3 comprehensions have their own scope (a walrus target, however, is bound in the enclosing scope)</td></tr>
<tr class='text-center'><td>Why is a comprehension faster than an append loop?</td><td>It uses the LIST_APPEND bytecode instead of a method lookup and call each time, and since 3.12 it is inlined</td></tr>
<tr class='text-center'><td>When should you avoid one?</td><td>For side effects (use a loop) and when the logic becomes hard to read</td></tr>
<tr class='text-center'><td>List comprehension vs generator expression?</td><td>Square brackets build the whole list now; parentheses produce items lazily, using constant memory</td></tr>
</table>`
        }
    ]
};
