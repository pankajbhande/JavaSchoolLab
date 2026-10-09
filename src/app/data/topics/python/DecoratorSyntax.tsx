import type { Topic } from '../../types';

export const decoratorSyntax: Topic = {
    id: 'python-decorators-the-decorator-syntax',
    name: 'The @decorator Syntax',
    beginner: [
        {
            content: `<h4>@ Is Shorthand</h4>
Writing <code>@decorator</code> on the line above a <code>def</code> is exactly the same as defining the function and then writing <code>func = decorator(func)</code>. The <code>@</code> form puts the decoration where readers see it first, and you can't forget to apply it.`,
            codeExamples: [
                `def shout(func):
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs).upper()
    return wrapper

# Manual form
def greet(name):
    return f"hello, {name}"
greet = shout(greet)

# @ form - identical effect
@shout
def welcome(name):
    return f"welcome, {name}"

print(greet("asha"))
print(welcome("ravi"))

# OUTPUT:
# HELLO, ASHA
# WELCOME, RAVI`
            ]
        },
        {
            content: `<h4>Stacking Decorators</h4>
Several decorators can be stacked. They are <b>applied bottom-up</b> (the one nearest the <code>def</code> wraps first), so the <b>top</b> decorator becomes the <b>outermost</b> layer:<br><br>
<code>@bold</code><br><code>@italic</code><br><code>def hi(): ...</code><br><br>
means <code>hi = bold(italic(hi))</code>.`,
            codeExamples: [
                `def bold(func):
    def wrapper():
        return "<b>" + func() + "</b>"
    return wrapper

def italic(func):
    def wrapper():
        return "<i>" + func() + "</i>"
    return wrapper

@bold
@italic
def hi():
    return "hi"

@italic
@bold
def bye():
    return "bye"

print(hi())
print(bye())

# OUTPUT:
# <b><i>hi</i></b>
# <i><b>bye</b></i>`
            ]
        },
        {
            content: `<h4>Tracing the Order Precisely</h4>
Applying happens bottom-up at definition time; at call time the outermost wrapper runs first and finishes last - like layers of an onion.`,
            codeExamples: [
                `def outer(func):
    print("applying outer")
    def wrapper():
        print("enter outer")
        func()
        print("exit outer")
    return wrapper

def inner(func):
    print("applying inner")
    def wrapper():
        print("enter inner")
        func()
        print("exit inner")
    return wrapper

@outer
@inner
def work():
    print("working")

print("--- calling ---")
work()

# OUTPUT:
# applying inner
# applying outer
# --- calling ---
# enter outer
# enter inner
# working
# exit inner
# exit outer`
            ]
        },
        {
            content: `<h4>Decorators You Will Meet Constantly</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Decorator</th><th>From</th><th>Purpose</th></tr>
<tr class='text-center'><td><code>@property</code></td><td>built-in</td><td>Turn a method into a read-only attribute (getter)</td></tr>
<tr class='text-center'><td><code>@staticmethod</code></td><td>built-in</td><td>Method that receives neither self nor cls</td></tr>
<tr class='text-center'><td><code>@classmethod</code></td><td>built-in</td><td>Method that receives the class (cls) - alternative constructors</td></tr>
<tr class='text-center'><td><code>@functools.cache</code> / <code>@lru_cache</code></td><td>functools</td><td>Memoise results</td></tr>
<tr class='text-center'><td><code>@functools.wraps</code></td><td>functools</td><td>Copy metadata onto a wrapper</td></tr>
<tr class='text-center'><td><code>@dataclass</code></td><td>dataclasses</td><td>Generate <code>__init__</code>, <code>__repr__</code>, <code>__eq__</code> for a class</td></tr>
<tr class='text-center'><td><code>@contextmanager</code></td><td>contextlib</td><td>Build a context manager from a generator</td></tr>
<tr class='text-center'><td><code>@abstractmethod</code></td><td>abc</td><td>Mark a method that subclasses must implement</td></tr>
</table>`,
            codeExamples: [
                `from dataclasses import dataclass
from functools import cache

@dataclass
class Point:
    x: int
    y: int

@cache
def square(n):
    print("computing", n)
    return n * n

print(Point(1, 2))
print(square(4), square(4))

# OUTPUT:
# Point(x=1, y=2)
# computing 4
# 16 16`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Any Expression After @ (PEP 614)</h3>
Before Python 3.9 the decorator had to be a dotted name, optionally followed by one call. Since 3.9 any expression is allowed - subscriptions, attribute chains, even a lambda.`,
            codeExamples: [
                `def loud(func):
    return lambda *args: func(*args).upper()

DECORATORS = {"loud": loud}

@DECORATORS["loud"]               # allowed since Python 3.9
def greet(name):
    return f"hi {name}"

@(lambda func: func)              # a do-nothing decorator expression
def plain():
    return "unchanged"

print(greet("asha"), plain())

# OUTPUT:
# HI ASHA unchanged`
            ]
        },
        {
            content: `<h3>Decorating Classes</h3>
A class decorator receives the <b>class</b> and returns it (usually modified) or a replacement. <code>@dataclass</code> is the famous example. Common uses: adding methods, validating definitions, and registering classes.`,
            codeExamples: [
                `PLUGINS = {}

def register(cls):
    PLUGINS[cls.__name__.lower()] = cls
    return cls

def add_repr(cls):
    def __repr__(self):
        return f"{cls.__name__}({self.__dict__})"
    cls.__repr__ = __repr__
    return cls

@register
@add_repr
class Upi:
    def __init__(self, vpa):
        self.vpa = vpa

print(sorted(PLUGINS))
print(PLUGINS["upi"]("asha@okbank"))

# OUTPUT:
# ['upi']
# Upi({'vpa': 'asha@okbank'})`
            ]
        },
        {
            content: `<h3>Java Annotations vs Python Decorators</h3>
They look alike but work differently:
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>Java annotation</th><th>Python decorator</th></tr>
<tr class='text-center'><td>What it is</td><td>Passive metadata</td><td>Executable code (a callable)</td></tr>
<tr class='text-center'><td>Effect on its own</td><td>None - something else (compiler, Spring, reflection) must read it</td><td>Replaces the function/class immediately</td></tr>
<tr class='text-center'><td>When it acts</td><td>Compile time or at runtime via reflection/proxies</td><td>When the def/class statement executes</td></tr>
<tr class='text-center'><td>Writing your own</td><td>Declare <code>@interface</code> plus a processor or aspect</td><td>Write a normal function</td></tr>
</table>
A Python decorator can <i>imitate</i> an annotation by just attaching an attribute and returning the function unchanged - as Flask's <code>@app.route</code> and pytest's markers do.`
        },
        {
            content: `<h3>Decorator Expressions Are Evaluated Top-Down</h3>
When decorators take arguments, the decorator <b>expressions</b> (<code>tag("A")</code>, <code>tag("B")</code>) are evaluated top to bottom first; only then are the resulting decorators applied bottom-up.`,
            codeExamples: [
                `def tag(name):
    print("creating", name)
    def decorator(func):
        print("applying", name)
        return func
    return decorator

@tag("A")
@tag("B")
def work():
    pass

# OUTPUT:
# creating A
# creating B
# applying B
# applying A`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What does <code>@deco</code> above a def mean?</td><td><code>func = deco(func)</code> right after the function is defined</td></tr>
<tr class='text-center'><td>In which order are stacked decorators applied?</td><td>Bottom-up: the one closest to def wraps first, so the top one is outermost and runs first at call time</td></tr>
<tr class='text-center'><td>Can you decorate a class?</td><td>Yes - the decorator receives the class and returns it or a replacement (e.g. @dataclass)</td></tr>
<tr class='text-center'><td>What did PEP 614 change?</td><td>Since 3.9 any expression may follow @, not just a dotted name and an optional call</td></tr>
<tr class='text-center'><td>Decorator vs Java annotation?</td><td>A decorator is code that runs and replaces the target; an annotation is metadata that other tools interpret</td></tr>
</table>`
        }
    ]
};
