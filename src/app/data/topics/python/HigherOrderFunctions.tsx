import type { Topic } from '../../types';

export const higherOrderFunctions: Topic = {
    id: 'python-functions-higher-order-functions',
    name: 'Higher-Order Functions',
    beginner: [
        {
            content: `<h4>Functions Are Objects</h4>
In Python, a function is an ordinary object - <b>first-class</b>, just like a number or a list. You can:<br><br>
• assign it to another variable,<br>
• store it in a list or dictionary,<br>
• pass it as an argument to another function,<br>
• return it from a function.<br><br>
Note the difference: <code>greet</code> is the function object; <code>greet()</code> <b>calls</b> it.`,
            codeExamples: [
                `def greet(name):
    return f"Hello, {name}!"

say = greet                    # no parentheses: the function itself
print(say("Asha"))
print(say is greet, say.__name__)
print(type(greet))

# OUTPUT:
# Hello, Asha!
# True greet
# <class 'function'>`
            ]
        },
        {
            content: `<h4>Storing Functions in Collections</h4>`,
            codeExamples: [
                `operations = [abs, round, int]
for op in operations:
    print(op.__name__, op(-2.7))

actions = {"upper": str.upper, "lower": str.lower, "title": str.title}
print(actions["title"]("python for everyone"))

# OUTPUT:
# abs 2.7
# round -3
# int -2
# Python For Everyone`
            ]
        },
        {
            content: `<h4>What is a Higher-Order Function?</h4>
A <b>higher-order function</b> is a function that <b>takes a function as an argument</b>, <b>returns a function</b>, or both. It lets you write the general "shape" of an algorithm once and plug in the specific behaviour.`,
            codeExamples: [
                `def apply_twice(func, value):
    return func(func(value))

def add_three(x):
    return x + 3

print(apply_twice(add_three, 10))
print(apply_twice(lambda s: s + "!", "Hi"))
print(apply_twice(str.upper, "python"))

# OUTPUT:
# 16
# Hi!!
# PYTHON`
            ]
        },
        {
            content: `<h4>Plugging in Behaviour: Discount Strategies</h4>
The checkout logic stays the same; only the discount function changes.`,
            codeExamples: [
                `def no_discount(total):
    return total

def festive(total):
    return total * 0.9            # 10% off

def clearance(total):
    return total * 0.5            # 50% off

def checkout(total, discount=no_discount):
    return round(discount(total), 2)

print(checkout(1000))
print(checkout(1000, festive))
print(checkout(1000, clearance))

# OUTPUT:
# 1000
# 900.0
# 500.0`
            ]
        },
        {
            content: `<h4>Built-in Higher-Order Functions</h4>
You already use several:
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Function</th><th>Takes a function to...</th></tr>
<tr class='text-center'><td><code>sorted(it, key=f)</code>, <code>min</code>, <code>max</code></td><td>decide what to compare</td></tr>
<tr class='text-center'><td><code>map(f, it)</code></td><td>transform every item</td></tr>
<tr class='text-center'><td><code>filter(f, it)</code></td><td>decide which items to keep</td></tr>
<tr class='text-center'><td><code>functools.reduce(f, it)</code></td><td>combine items into one value</td></tr>
</table>
<code>map</code>, <code>filter</code> and <code>reduce</code> each get their own topic next.`,
            codeExamples: [
                `words = ["banana", "kiwi", "apple"]
print(sorted(words, key=len))
print(max(words, key=len))
print(list(map(len, words)))

# OUTPUT:
# ['kiwi', 'apple', 'banana']
# banana
# [6, 4, 5]`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Functions That Return Functions</h3>
A function can build and return a new, customised function. The inner function remembers the values from the call that created it - this is a <b>closure</b>, covered in depth in its own module.`,
            codeExamples: [
                `def make_multiplier(factor):
    def multiply(x):
        return x * factor
    return multiply

double = make_multiplier(2)
triple = make_multiplier(3)

print(double(10), triple(10))
print(make_multiplier(5)(4))
print(double.__name__)

# OUTPUT:
# 20 30
# 20
# multiply`
            ]
        },
        {
            content: `<h3>Composing Functions into a Pipeline</h3>`,
            codeExamples: [
                `def compose(*funcs):
    def pipeline(value):
        for func in funcs:
            value = func(value)
        return value
    return pipeline

clean_name = compose(str.strip, str.lower, str.title)
print(clean_name("   hELLO wORLD  "))

slugify = compose(str.strip, str.lower, lambda s: s.replace(" ", "-"))
print(slugify("  Python Functions Guide "))

# OUTPUT:
# Hello World
# python-functions-guide`
            ]
        },
        {
            content: `<h3>functools.partial: Pre-Filling Arguments</h3>
<code>partial(func, *args, **kwargs)</code> returns a new callable with some arguments already fixed - a quick way to create specialised versions of a general function without writing a wrapper.`,
            codeExamples: [
                `from functools import partial

def power(base, exp):
    return base ** exp

square = partial(power, exp=2)
cube = partial(power, exp=3)
print(square(7), cube(2))

parse_binary = partial(int, base=2)
print(parse_binary("1010"))

print_csv = partial(print, sep=",")
print_csv("id", "name", "marks")

# OUTPUT:
# 49 8
# 10
# id,name,marks`
            ]
        },
        {
            content: `<h3>Functions Replace Small Class Hierarchies</h3>
In Java, the Strategy pattern needs an interface and one class per strategy. In Python, when a strategy is just one operation, a plain function (or a dict of functions) does the same job with far less code.`,
            codeExamples: [
                `def by_price(p):
    return p["price"]

def by_rating(p):
    return -p["rating"]           # highest rating first

SORTERS = {"price": by_price, "rating": by_rating}

products = [
    {"name": "Mouse", "price": 450, "rating": 4.1},
    {"name": "Keyboard", "price": 900, "rating": 4.6},
    {"name": "Cable", "price": 150, "rating": 3.9},
]

for choice in ("price", "rating"):
    ordered = sorted(products, key=SORTERS[choice])
    print(choice, [p["name"] for p in ordered])

# OUTPUT:
# price ['Cable', 'Mouse', 'Keyboard']
# rating ['Keyboard', 'Mouse', 'Cable']`
            ]
        },
        {
            content: `<h3>Function Attributes and callable()</h3>
Function objects carry metadata such as <code>__name__</code>, <code>__doc__</code> and <code>__defaults__</code>. <code>callable(obj)</code> tells you whether something can be called - which includes classes and any object whose class defines <code>__call__</code>.`,
            codeExamples: [
                `def area(width, height=1):
    """Return the area of a rectangle."""
    return width * height

print(area.__name__, area.__doc__, area.__defaults__)

class Multiplier:
    def __init__(self, factor):
        self.factor = factor

    def __call__(self, x):        # instances can be called like functions
        return x * self.factor

times4 = Multiplier(4)
print(times4(5), callable(times4), callable(area), callable(Multiplier), callable(42))

# OUTPUT:
# area Return the area of a rectangle. (1,)
# 20 True True True False`
            ]
        },
        {
            content: `<h3>Decorators Are Higher-Order Functions</h3>
A <b>decorator</b> takes a function and returns a new function that wraps it. The <code>@name</code> line is shorthand for <code>func = name(func)</code>. The Decorators module covers them fully; here is the idea.`,
            codeExamples: [
                `def log_calls(func):
    def wrapper(*args):
        print(f"calling {func.__name__}{args}")
        return func(*args)
    return wrapper

@log_calls                        # same as: add = log_calls(add)
def add(a, b):
    return a + b

print(add(2, 3))

# OUTPUT:
# calling add(2, 3)
# 5`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What does "functions are first-class objects" mean?</td><td>Functions can be assigned to variables, stored in data structures, passed as arguments and returned from other functions</td></tr>
<tr class='text-center'><td>What is a higher-order function?</td><td>A function that takes a function as an argument and/or returns a function</td></tr>
<tr class='text-center'><td>Name some built-in higher-order functions</td><td>sorted, min, max (with key), map, filter, functools.reduce</td></tr>
<tr class='text-center'><td>What does functools.partial do?</td><td>Creates a new callable with some arguments of an existing function pre-filled</td></tr>
<tr class='text-center'><td>How can an object be called like a function?</td><td>Its class defines <code>__call__</code></td></tr>
<tr class='text-center'><td>How are decorators related to higher-order functions?</td><td>A decorator is a higher-order function that takes a function and returns a wrapped replacement</td></tr>
</table>`
        }
    ]
};
