import type { Topic } from '../../types';

export const pythonFunctions: Topic = {
    id: 'python-functions',
    name: 'Functions',
    beginner: [
        {
            content: `<h4>What is a Function?</h4>
A <b>function</b> is a named, reusable block of code that performs one task. You define it once with <code>def</code> and run it as many times as you like by <b>calling</b> it. Functions let you avoid repeating code, give a meaningful name to a piece of logic, and break a big program into small parts you can test separately.`,
            codeExamples: [
                `def greet(name):
    return f"Hello, {name}!"

print(greet("Pankaj"))
print(greet("Sheru"))

# OUTPUT:
# Hello, Pankaj!
# Hello, Sheru!`
            ]
        },
        {
            content: `<h4>Anatomy of a Function</h4>
• <code>def</code> starts the definition, followed by the function's name and its <b>parameters</b> in parentheses.<br>
• A colon ends the header; the indented block below is the <b>body</b>.<br>
• An optional <b>docstring</b> - a string on the first line of the body - documents what it does.<br>
• <code>return</code> sends a value back to the caller and ends the function.`,
            codeExamples: [
                `def area_of_rectangle(length, width):
    """Return the area of a rectangle."""
    return length * width

print(area_of_rectangle(4, 5))
print(area_of_rectangle.__doc__)

# OUTPUT:
# 20
# Return the area of a rectangle.`
            ]
        },
        {
            content: `<h4>return vs print</h4>
<code>print()</code> only shows a value on the screen. <code>return</code> hands the value back so the rest of the program can <b>use</b> it. A function without a <code>return</code> statement returns <code>None</code>.`,
            codeExamples: [
                `def show_total(a, b):
    print(a + b)            # displays, returns nothing

def get_total(a, b):
    return a + b            # gives the value back

x = show_total(2, 3)
y = get_total(2, 3)
print("x is", x)
print("y is", y, "and y * 10 is", y * 10)

# OUTPUT:
# 5
# x is None
# y is 5 and y * 10 is 50`
            ]
        },
        {
            content: `<h4>Define Before You Call</h4>
Python runs a file from top to bottom. A <code>def</code> statement creates the function when it executes, so calling a function before its <code>def</code> line has run is an error.`,
            codeExamples: [
                `print(square(4))

def square(n):
    return n * n

# OUTPUT:
# NameError: name 'square' is not defined`
            ]
        },
        {
            content: `<h4>A Small Realistic Example</h4>
Each function does one job; the last one combines them.`,
            codeExamples: [
                `GST_RATE = 0.18

def subtotal(prices):
    return sum(prices)

def gst(amount):
    return round(amount * GST_RATE, 2)

def bill(prices):
    base = subtotal(prices)
    tax = gst(base)
    return round(base + tax, 2)

print(bill([499, 250, 99]))

# OUTPUT:
# 1000.64`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Python Functions vs Java Methods</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>Java method</th><th>Python function</th></tr>
<tr class='text-center'><td>Where it lives</td><td>Always inside a class</td><td>Anywhere - module level, inside a class, inside another function</td></tr>
<tr class='text-center'><td>Types</td><td>Declared parameter and return types, checked at compile time</td><td>None required; optional type hints are not enforced</td></tr>
<tr class='text-center'><td>Overloading</td><td>Several methods may share a name</td><td>No - a later <code>def</code> with the same name replaces the earlier one</td></tr>
<tr class='text-center'><td>Access control</td><td><code>public</code>, <code>private</code>...</td><td>Convention only: a leading <code>_</code> means "internal"</td></tr>
<tr class='text-center'><td>Default values</td><td>Not supported (use overloads)</td><td>Built in: <code>def f(x, y=0)</code></td></tr>
<tr class='text-center'><td>Multiple return values</td><td>Return an object or array</td><td>Return a tuple and unpack it</td></tr>
<tr class='text-center'><td>Is it an object?</td><td>Not directly (method references since Java 8)</td><td>Yes - functions are ordinary objects</td></tr>
</table>`
        },
        {
            content: `<h3>No Overloading: The Last def Wins</h3>
A <code>def</code> is just an assignment of a function object to a name. Defining the same name twice rebinds it, so only the last version exists. Default values and optional arguments cover most overloading use cases.`,
            codeExamples: [
                `def area(radius):
    return 3.14159 * radius ** 2

def area(length, width):        # replaces the first area()
    return length * width

print(area(4, 5))
print(area(5))

# OUTPUT:
# 20
# TypeError: area() missing 1 required positional argument: 'width'`
            ]
        },
        {
            content: `<h3>Pure Functions vs Side Effects</h3>
A <b>pure</b> function's result depends only on its arguments, and it changes nothing outside itself. Pure functions are easy to test and reason about. Functions with <b>side effects</b> (printing, writing files, modifying global state or their arguments) are necessary, but keep them few and obvious.`,
            codeExamples: [
                `total_sales = 0

def record_sale(amount):              # side effect: modifies a global
    global total_sales
    total_sales += amount

def with_discount(price, percent):    # pure: same input -> same output
    return price * (1 - percent / 100)

record_sale(500)
record_sale(300)
print(total_sales)
print(with_discount(1000, 10), with_discount(1000, 10))

# OUTPUT:
# 800
# 900.0 900.0`
            ]
        },
        {
            content: `<h3>Functions Are Objects</h3>
A function can be stored in a variable, put in a list or dict, passed to another function and returned from one. This is what makes decorators, callbacks and <code>sorted(key=...)</code> possible - the <i>Higher-Order Functions</i> topic covers it in depth.`,
            codeExamples: [
                `def shout(text):
    return text.upper() + "!"

speak = shout                       # no parentheses: the function itself
print(speak("hi"), speak is shout)
print(type(shout), shout.__name__)

print(sorted(["banana", "Apple", "cherry"], key=str.lower))

# OUTPUT:
# HI! True
# <class 'function'> shout
# ['Apple', 'banana', 'cherry']`
            ]
        },
        {
            content: `<h3>Writing Good Functions</h3>
• <b>One job per function.</b> If you need "and" to describe it, split it.<br>
• <b>Name it with a verb</b>: <code>calculate_gst</code>, <code>send_email</code>, <code>is_valid</code> (prefix booleans with <code>is_</code>/<code>has_</code>).<br>
• <b>Return values instead of printing</b>, so callers decide what to do with the result.<br>
• <b>Keep it short</b> - a function that doesn't fit on one screen is usually doing too much.<br>
• <b>Add type hints and a docstring</b> to public functions - editors and tools such as mypy use them.`,
            codeExamples: [
                `def calculate_gst(amount: float, rate: float = 0.18) -> float:
    """Return the GST payable on amount, rounded to 2 decimals."""
    return round(amount * rate, 2)

print(calculate_gst(1500))
print(calculate_gst.__annotations__)

# OUTPUT:
# 270.0
# {'amount': <class 'float'>, 'rate': <class 'float'>, 'return': <class 'float'>}`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What does a function return if it has no return statement?</td><td>None</td></tr>
<tr class='text-center'><td>return vs print?</td><td>return hands a value back to the caller; print only writes text to the output</td></tr>
<tr class='text-center'><td>Does Python support method overloading?</td><td>No - a second def with the same name replaces the first; use default or variable arguments instead</td></tr>
<tr class='text-center'><td>What is a docstring?</td><td>A string literal as the first statement of a function, stored in <code>__doc__</code> and shown by help()</td></tr>
<tr class='text-center'><td>What is a pure function?</td><td>One whose output depends only on its inputs and that has no side effects</td></tr>
<tr class='text-center'><td>What does "functions are first-class objects" mean?</td><td>They can be assigned to variables, stored in data structures, passed as arguments and returned from other functions</td></tr>
</table>`
        }
    ]
};
