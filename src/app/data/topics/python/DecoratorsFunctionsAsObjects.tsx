import type { Topic } from '../../types';

export const functionsAsObjects: Topic = {
    id: 'python-decorators-functions-as-objects',
    name: 'Functions as Objects',
    beginner: [
        {
            content: `<h4>Why Start Here?</h4>
A decorator is a function that <b>takes a function</b> and <b>returns a function</b>. That only works because Python functions are ordinary objects. Before writing decorators, make sure these four abilities feel natural:<br><br>
• <b>assign</b> a function to another name,<br>
• <b>pass</b> a function as an argument,<br>
• <b>return</b> a function from another function,<br>
• <b>store</b> functions in lists and dictionaries.<br><br>
The key detail: <code>shout</code> is the function object; <code>shout()</code> <b>calls</b> it.`
        },
        {
            content: `<h4>Assigning a Function to a Name</h4>
Assignment never copies a function - both names refer to the same object, which still remembers its original name and docstring.`,
            codeExamples: [
                `def shout(text):
    """Return text in upper case."""
    return text.upper()

yell = shout                     # no parentheses: the function itself
print(yell("hi"))
print(yell is shout, yell.__name__)
print(yell.__doc__)

# OUTPUT:
# HI
# True shout
# Return text in upper case.`
            ]
        },
        {
            content: `<h4>Passing a Function as an Argument</h4>`,
            codeExamples: [
                `def apply(func, value):
    return func(value)

def shout(text):
    return text.upper()

print(apply(shout, "ok"))
print(apply(len, "four"))
print(apply(str.title, "hello world"))

# OUTPUT:
# OK
# 4
# Hello World`
            ]
        },
        {
            content: `<h4>Returning a Function</h4>
A function can choose - or build - another function and hand it back. This is exactly what a decorator does.`,
            codeExamples: [
                `def get_formatter(style):
    def upper(text):
        return text.upper()

    def title(text):
        return text.title()

    return upper if style == "upper" else title

fmt = get_formatter("title")
print(fmt("hello world"), fmt.__name__)

# OUTPUT:
# Hello World title`
            ]
        },
        {
            content: `<h4>Storing Functions in a Dictionary</h4>`,
            codeExamples: [
                `def add(a, b):
    return a + b

def sub(a, b):
    return a - b

OPERATIONS = {"+": add, "-": sub}

for symbol in ("+", "-"):
    print(symbol, OPERATIONS[symbol](10, 4))

# OUTPUT:
# + 14
# - 6`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Functions Are Instances of a Class</h3>
Every <code>def</code> creates an instance of <code>types.FunctionType</code> (shown as <code>function</code>). Built-ins written in C, such as <code>len</code>, are a different type - but both are <b>callable</b>, and that is all a decorator needs.`,
            codeExamples: [
                `import types

def greet():
    return "hi"

print(type(greet), isinstance(greet, types.FunctionType))
print(type(len), isinstance(len, types.FunctionType))
print(callable(greet), callable(len), callable("text"))

# OUTPUT:
# <class 'function'> True
# <class 'builtin_function_or_method'> False
# True True False`
            ]
        },
        {
            content: `<h3>Useful Function Attributes</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Attribute</th><th>Holds</th></tr>
<tr class='text-center'><td><code>__name__</code></td><td>The name used in <code>def</code></td></tr>
<tr class='text-center'><td><code>__qualname__</code></td><td>The qualified name, e.g. <code>Account.deposit</code></td></tr>
<tr class='text-center'><td><code>__doc__</code></td><td>The docstring (or None)</td></tr>
<tr class='text-center'><td><code>__module__</code></td><td>The module where it was defined</td></tr>
<tr class='text-center'><td><code>__defaults__</code></td><td>Default argument values</td></tr>
<tr class='text-center'><td><code>__dict__</code></td><td>Custom attributes you attach</td></tr>
<tr class='text-center'><td><code>__wrapped__</code></td><td>Set by <code>functools.wraps</code>: the original function behind a decorator</td></tr>
</table>`,
            codeExamples: [
                `def price(amount, gst=0.18):
    """Return amount including GST."""
    return amount * (1 + gst)

print(price.__name__, price.__qualname__, price.__module__)
print(price.__defaults__, price.__doc__)

# OUTPUT:
# price price __main__
# (0.18,) Return amount including GST.`
            ]
        },
        {
            content: `<h3>Attaching Your Own Attributes</h3>
Functions have a <code>__dict__</code>, so you can attach data to them. Frameworks use this to store metadata such as a URL route or a call counter - a lightweight cousin of Java annotations.`,
            codeExamples: [
                `def home():
    return "Welcome"

home.route = "/home"
home.calls = 0

print(home.route, home.__dict__)

# OUTPUT:
# /home {'route': '/home', 'calls': 0}`
            ]
        },
        {
            content: `<h3>Wrapping Changes Identity</h3>
When a decorator returns a new function, the name now points to the <b>wrapper</b>, not the original. Without extra care the wrapper even reports its own name - the problem <code>functools.wraps</code> solves (see its topic).`,
            codeExamples: [
                `def deco(func):
    def wrapper():
        return func()
    return wrapper

def hello():
    return "hello"

original = hello
hello = deco(hello)

print(hello is original)
print(hello.__name__)
print(hello(), original())

# OUTPUT:
# False
# wrapper
# hello hello`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What does "functions are first-class objects" mean?</td><td>They can be assigned, passed as arguments, returned and stored like any other value</td></tr>
<tr class='text-center'><td><code>f</code> vs <code>f()</code>?</td><td><code>f</code> is the function object; <code>f()</code> calls it and gives its return value</td></tr>
<tr class='text-center'><td>What type is a function defined with def?</td><td><code>types.FunctionType</code> (displayed as <code>function</code>)</td></tr>
<tr class='text-center'><td>Can you add attributes to a function?</td><td>Yes - they are stored in its <code>__dict__</code></td></tr>
<tr class='text-center'><td>Why does a decorated function sometimes report the name "wrapper"?</td><td>The name now refers to the wrapper function; use functools.wraps to copy the original metadata</td></tr>
</table>`
        }
    ]
};
