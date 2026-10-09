import type { Topic } from '../../types';

export const whatAreExceptions: Topic = {
    id: 'python-exceptions-what-are-exceptions',
    name: 'What are Exceptions?',
    beginner: [
        {
            content: `<h4>Errors vs Exceptions</h4>
Things can go wrong in two very different moments:<br><br>
• <b>Syntax errors</b> - the code is not valid Python. Python finds them while <b>reading</b> the file, before a single line runs.<br>
• <b>Exceptions</b> - the code is valid, but something goes wrong <b>while it runs</b>: dividing by zero, opening a missing file, converting <code>"abc"</code> to a number. An exception stops the program unless your code handles it.`,
            codeExamples: [
                `print("start")
if True
    print("hi")

# OUTPUT:
# SyntaxError: expected ':'
#
# "start" is never printed - the file is rejected before it runs.`,
                `print("start")
print(10 / 0)
print("end")

# OUTPUT:
# start
# ZeroDivisionError: division by zero
#
# The first line ran; the program stopped at the exception, so "end" never printed.`
            ]
        },
        {
            content: `<h4>Reading a Traceback</h4>
When an exception is not handled, Python prints a <b>traceback</b>:<br>
• the <b>last line</b> is the most important: the exception type and its message;<br>
• the lines above show the <b>chain of calls</b> that led there, from the outermost call (top) to the line that actually failed (bottom).<br><br>
Read it bottom-up: what went wrong, then where, then how the program got there.`,
            codeExamples: [
                `# stats.py
def divide(a, b):
    return a / b

def average(values):
    return divide(sum(values), len(values))

print(average([]))

# OUTPUT (newer Pythons also add ^^^ markers under the failing code):
# Traceback (most recent call last):
#   File "stats.py", line 8, in <module>
#     print(average([]))
#   File "stats.py", line 6, in average
#     return divide(sum(values), len(values))
#   File "stats.py", line 3, in divide
#     return a / b
# ZeroDivisionError: division by zero`
            ]
        },
        {
            content: `<h4>Common Built-in Exceptions</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Exception</th><th>Raised when...</th><th>Example trigger</th></tr>
<tr class='text-center'><td><code>ValueError</code></td><td>The type is right but the value is wrong</td><td><code>int("abc")</code></td></tr>
<tr class='text-center'><td><code>TypeError</code></td><td>An operation gets the wrong type</td><td><code>"5" + 5</code></td></tr>
<tr class='text-center'><td><code>KeyError</code></td><td>A dict key doesn't exist</td><td><code>{"a": 1}["b"]</code></td></tr>
<tr class='text-center'><td><code>IndexError</code></td><td>A sequence index is out of range</td><td><code>[1, 2][5]</code></td></tr>
<tr class='text-center'><td><code>ZeroDivisionError</code></td><td>Dividing by zero</td><td><code>1 / 0</code></td></tr>
<tr class='text-center'><td><code>FileNotFoundError</code></td><td>Opening a file that doesn't exist</td><td><code>open("missing.txt")</code></td></tr>
<tr class='text-center'><td><code>AttributeError</code></td><td>An object has no such attribute or method</td><td><code>"abc".push("d")</code></td></tr>
<tr class='text-center'><td><code>NameError</code></td><td>A variable name isn't defined</td><td><code>print(undefined_name)</code></td></tr>
<tr class='text-center'><td><code>ModuleNotFoundError</code> (an <code>ImportError</code>)</td><td>An import can't find the module</td><td><code>import numpyy</code></td></tr>
</table>`
        },
        {
            content: `<h4>The Messages You Will See</h4>`,
            codeExamples: [
                `int("abc")
# ValueError: invalid literal for int() with base 10: 'abc'

"5" + 5
# TypeError: can only concatenate str (not "int") to str

{"a": 1}["b"]
# KeyError: 'b'

[1, 2][5]
# IndexError: list index out of range

open("missing.txt")
# FileNotFoundError: [Errno 2] No such file or directory: 'missing.txt'

"abc".push("d")
# AttributeError: 'str' object has no attribute 'push'

import numpyy
# ModuleNotFoundError: No module named 'numpyy'`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Exceptions Are Objects</h3>
An exception is an instance of a class. When you catch it with <code>as</code>, you can inspect its type, its arguments and its message.`,
            codeExamples: [
                `try:
    int("abc")
except ValueError as e:
    print(type(e))
    print(type(e).__name__)
    print(e.args)
    print(str(e))
    print(repr(e))

# OUTPUT:
# <class 'ValueError'>
# ValueError
# ("invalid literal for int() with base 10: 'abc'",)
# invalid literal for int() with base 10: 'abc'
# ValueError("invalid literal for int() with base 10: 'abc'")`
            ]
        },
        {
            content: `<h3>Exceptions Propagate Up the Call Stack</h3>
If a function doesn't handle an exception, it travels up to the caller, then the caller's caller, and so on - until some <code>try</code> catches it or it reaches the top and stops the program. You handle errors where you can do something useful about them, not necessarily where they happen.`,
            codeExamples: [
                `def read_quantity():
    return int("x")                 # fails here...

def build_order():
    return {"qty": read_quantity()} # ...passes through here...

def checkout():
    try:
        return build_order()
    except ValueError as e:         # ...and is handled here
        return f"caught in checkout: {e}"

print(checkout())

# OUTPUT:
# caught in checkout: invalid literal for int() with base 10: 'x'`
            ]
        },
        {
            content: `<h3>Python vs Java Exceptions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>Java</th><th>Python</th></tr>
<tr class='text-center'><td>Handle</td><td><code>try / catch / finally</code></td><td><code>try / except / else / finally</code></td></tr>
<tr class='text-center'><td>Raise</td><td><code>throw new X(...)</code></td><td><code>raise X(...)</code></td></tr>
<tr class='text-center'><td>Checked exceptions</td><td>Yes - must be caught or declared with <code>throws</code></td><td>No - every exception is "unchecked"</td></tr>
<tr class='text-center'><td>Root class</td><td><code>Throwable</code> (<code>Exception</code>, <code>Error</code>)</td><td><code>BaseException</code> (<code>Exception</code> for normal errors)</td></tr>
<tr class='text-center'><td>Typical style</td><td>Validate first, throw rarely</td><td>EAFP - try it and handle the exception</td></tr>
</table>
Because nothing forces you to declare exceptions, good docstrings should say which exceptions a function can raise.`
        },
        {
            content: `<h3>EAFP vs LBYL</h3>
<b>LBYL</b> ("Look Before You Leap") checks every condition first. <b>EAFP</b> ("Easier to Ask Forgiveness than Permission") just tries the operation and handles the failure. EAFP is idiomatic Python: it avoids duplicated checks and race conditions, such as a file being deleted between the "does it exist?" check and the open.`,
            codeExamples: [
                `stock = {"pen": 10}

# LBYL
if "pencil" in stock:
    qty = stock["pencil"]
else:
    qty = 0

# EAFP
try:
    qty = stock["pencil"]
except KeyError:
    qty = 0

print(qty)

# OUTPUT:
# 0`
            ]
        },
        {
            content: `<h3>Cost of Exceptions</h3>
Entering a <code>try</code> block costs essentially nothing in modern CPython (3.11+ uses "zero-cost" exception handling). <b>Raising and catching</b> an exception is much more expensive than an <code>if</code> check. So: use exceptions freely for situations that are genuinely exceptional, but if a "failure" happens on most iterations of a hot loop, an <code>if</code> or <code>dict.get()</code> is faster.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Syntax error vs exception?</td><td>A syntax error stops the file from being compiled at all; an exception happens while valid code is running</td></tr>
<tr class='text-center'><td>How do you read a traceback?</td><td>Start at the last line (type and message), then go up through the frames to see where and how the code got there</td></tr>
<tr class='text-center'><td>Does Python have checked exceptions?</td><td>No - any function can raise any exception without declaring it</td></tr>
<tr class='text-center'><td>ValueError vs TypeError?</td><td>TypeError: wrong type of object; ValueError: right type but an unacceptable value</td></tr>
<tr class='text-center'><td>What happens to an uncaught exception?</td><td>It propagates up the call stack; if nothing catches it, Python prints a traceback and exits</td></tr>
<tr class='text-center'><td>What is EAFP?</td><td>Trying an operation and handling the exception instead of checking conditions first - the preferred Python style</td></tr>
</table>`
        }
    ]
};
