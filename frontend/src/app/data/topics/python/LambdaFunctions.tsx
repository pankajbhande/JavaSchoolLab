import type { Topic } from '../../types';

export const lambdaFunctions: Topic = {
    id: 'python-functions-lambda-functions',
    name: 'Lambda Functions',
    beginner: [
        {
            content: `<h4>What is a Lambda?</h4>
A <b>lambda</b> is a small, <b>anonymous</b> (unnamed) function written in a single expression:<br><br>
<code>lambda parameters: expression</code><br><br>
The expression's value is returned automatically - there is no <code>return</code> keyword. Lambdas are meant for short functions you pass to another function and use only once.`,
            codeExamples: [
                `def square(x):
    return x * x

square_lambda = lambda x: x * x      # the same function as an expression

print(square(6), square_lambda(6))
print((lambda a, b: a + b)(2, 3))    # defined and called immediately

# OUTPUT:
# 36 36
# 5`
            ]
        },
        {
            content: `<h4>Python vs Java Lambdas</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th></th><th>Java</th><th>Python</th></tr>
<tr class='text-center'><td>Syntax</td><td><code>(a, b) -&gt; a + b</code></td><td><code>lambda a, b: a + b</code></td></tr>
<tr class='text-center'><td>Body</td><td>Expression or a <code>{ }</code> block of statements</td><td>One expression only</td></tr>
<tr class='text-center'><td>Type</td><td>Needs a functional interface</td><td>An ordinary function object</td></tr>
</table>`
        },
        {
            content: `<h4>The Main Use: key= Functions</h4>
<code>sorted()</code>, <code>min()</code> and <code>max()</code> accept a <code>key</code> function that says <b>what to compare</b>. A lambda is the natural way to write it inline.`,
            codeExamples: [
                `students = [("Pankaj", 88), ("Sheru", 74), ("Abaji", 95)]

print(sorted(students, key=lambda s: s[1]))           # by marks
print(max(students, key=lambda s: s[1]))              # topper
print(min(students, key=lambda s: len(s[0])))         # shortest name

products = [{"name": "Pen", "price": 10}, {"name": "Bag", "price": 900}]
print(sorted(products, key=lambda p: p["price"], reverse=True)[0]["name"])

# OUTPUT:
# [('Sheru', 74), ('Pankaj', 88), ('Abaji', 95)]
# ('Abaji', 95)
# ('Sheru', 74)
# Bag`
            ]
        },
        {
            content: `<h4>With map() and filter()</h4>
<code>map</code> applies a function to every item; <code>filter</code> keeps the items for which a function returns true. Both are covered in detail in their own topic.`,
            codeExamples: [
                `prices = [100, 250, 40]

print(list(map(lambda p: p * 1.18, prices)))
print(list(filter(lambda n: n % 2 == 0, range(10))))

# OUTPUT:
# [118.0, 295.0, 47.199999999999996]
# [0, 2, 4, 6, 8]`
            ]
        },
        {
            content: `<h4>Defaults, *args and Conditional Expressions</h4>
Lambdas accept the same parameter forms as <code>def</code>. A conditional expression lets them choose between two values.`,
            codeExamples: [
                `greet = lambda name, greeting="Hello": f"{greeting}, {name}!"
total = lambda *nums: sum(nums)
parity = lambda n: "even" if n % 2 == 0 else "odd"

print(greet("Abaji"), greet("Raoji", "Hi"))
print(total(1, 2, 3))
print([parity(n) for n in range(4)])

# OUTPUT:
# Hello, Abaji! Hi, Raoji!
# 6
# ['even', 'odd', 'even', 'odd']`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>What a Lambda Cannot Do</h3>
The body must be a single <b>expression</b>, so a lambda cannot contain statements: no <code>return</code>, assignments (except <code>:=</code>), <code>if</code> blocks, loops, <code>try</code>, or <code>raise</code>. It also can't have type annotations or a docstring. If you need any of these, write a <code>def</code>.`,
            codeExamples: [
                `# lambda x: return x * 2          -> SyntaxError: invalid syntax
# lambda x: y = x * 2              -> SyntaxError
# lambda x: (y := x * 2) + y       -> allowed (walrus is an expression)

double_plus = lambda x: (y := x * 2) + y
print(double_plus(5))

# OUTPUT:
# 20`
            ]
        },
        {
            content: `<h3>Don't Assign Lambdas to Names</h3>
PEP 8 says: use <code>def</code> instead of <code>name = lambda ...</code>. A <code>def</code> function has a real name, which shows up in tracebacks, logs and debuggers; every lambda is just called <code>&lt;lambda&gt;</code>. The <code>def</code> is no longer, and it can have a docstring and annotations.`,
            codeExamples: [
                `tax = lambda amount: amount * 0.18

def tax_def(amount):
    return amount * 0.18

print(tax.__name__, tax_def.__name__)

# Traceback for an error inside each one:
#   File "app.py", line 1, in <lambda>     <- which lambda?
#   File "app.py", line 4, in tax_def      <- clear

# OUTPUT:
# <lambda> tax_def`
            ]
        },
        {
            content: `<h3>The Late-Binding Trap in Loops</h3>
A lambda doesn't copy the value of a variable it uses - it looks the variable up <b>when it is called</b>. Lambdas created in a loop therefore all see the loop variable's <b>final</b> value. Binding the current value as a default argument fixes it, because defaults are evaluated when the lambda is created.`,
            codeExamples: [
                `funcs = [lambda: i for i in range(3)]
print([f() for f in funcs])

fixed = [lambda i=i: i for i in range(3)]
print([f() for f in fixed])

# OUTPUT:
# [2, 2, 2]
# [0, 1, 2]`
            ]
        },
        {
            content: `<h3>The operator Module: Ready-Made Lambdas</h3>
<code>itemgetter</code>, <code>attrgetter</code> and <code>methodcaller</code> replace the most common lambdas. They are faster, can fetch several fields at once, and have a readable repr.`,
            codeExamples: [
                `from operator import itemgetter, attrgetter, methodcaller
from collections import namedtuple

rows = [("Pune", 300), ("Agra", 120), ("Delhi", 300)]
print(sorted(rows, key=itemgetter(1, 0)))      # same as lambda r: (r[1], r[0])

City = namedtuple("City", ["name", "pop"])
cities = [City("Pune", 7), City("Agra", 2)]
print(min(cities, key=attrgetter("pop")).name) # same as lambda c: c.pop

print(list(map(methodcaller("upper"), ["a", "b"])))   # same as lambda s: s.upper()

# OUTPUT:
# [('Agra', 120), ('Delhi', 300), ('Pune', 300)]
# Agra
# ['A', 'B']`
            ]
        },
        {
            content: `<h3>A Dictionary of Lambdas for Dispatch</h3>
Small lambdas stored in a dict replace an <code>if/elif</code> chain - a common pattern for calculators, command handlers and unit converters.`,
            codeExamples: [
                `convert = {
    "km_to_miles": lambda v: v * 0.621371,
    "c_to_f": lambda v: v * 9 / 5 + 32,
    "kg_to_lb": lambda v: v * 2.20462,
}

print(round(convert["km_to_miles"](10), 2))
print(convert["c_to_f"](37))

# OUTPUT:
# 6.21
# 98.6`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Lambda vs def?</td><td>A lambda is an anonymous single-expression function; def creates a named function with any statements, a docstring and annotations</td></tr>
<tr class='text-center'><td>Can a lambda have multiple statements?</td><td>No - only one expression (a conditional expression or walrus is allowed)</td></tr>
<tr class='text-center'><td>Why does <code>[lambda: i for i in range(3)]</code> return 2 three times?</td><td>Late binding: i is looked up when the lambda runs, after the loop ended; fix with <code>lambda i=i: i</code></td></tr>
<tr class='text-center'><td>Should you write <code>f = lambda x: ...</code>?</td><td>PEP 8 says no - use def so the function has a real name</td></tr>
<tr class='text-center'><td>Where are lambdas most useful?</td><td>As short key functions and callbacks passed to sorted, min, max, map, filter and similar</td></tr>
<tr class='text-center'><td>What can replace <code>lambda r: r[1]</code>?</td><td><code>operator.itemgetter(1)</code></td></tr>
</table>`
        }
    ]
};
