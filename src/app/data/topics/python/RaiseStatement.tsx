import type { Topic } from '../../types';

export const raiseStatement: Topic = {
    id: 'python-exceptions-raise',
    name: 'raise',
    beginner: [
        {
            content: `<h4>Raising Your Own Errors</h4>
Python raises exceptions automatically when something goes wrong (dividing by zero, a missing key...). With <code>raise</code> <b>you</b> can signal an error too - typically when a function receives input it cannot work with. It is Python's version of Java's <code>throw</code>.<br><br>
<code>raise ExceptionType("message explaining what went wrong")</code>`,
            codeExamples: [
                `def set_age(age):
    if age < 0:
        raise ValueError(f"age cannot be negative: {age}")
    return age

print(set_age(25))
set_age(-5)

# OUTPUT:
# 25
# ValueError: age cannot be negative: -5`
            ]
        },
        {
            content: `<h4>Rejecting Bad Input - and Handling It</h4>
The function that detects the problem <b>raises</b>; the code that knows what to do about it <b>catches</b>. Execution stops at the <code>raise</code> line - nothing after it in that function runs.`,
            codeExamples: [
                `def withdraw(balance, amount):
    if amount <= 0:
        raise ValueError("amount must be positive")
    if amount > balance:
        raise ValueError(f"insufficient funds: balance {balance}, requested {amount}")
    return balance - amount

try:
    withdraw(1000, 5000)
except ValueError as e:
    print("Error:", e)

print(withdraw(1000, 300))

# OUTPUT:
# Error: insufficient funds: balance 1000, requested 5000
# 700`
            ]
        },
        {
            content: `<h4>Raising a Class vs an Instance</h4>
<code>raise ValueError</code> (the class) is shorthand for <code>raise ValueError()</code> - Python creates an instance with no message. Always prefer passing a clear message: it is the first thing anyone reading the error sees.`,
            codeExamples: [
                `try:
    raise ValueError                  # same as raise ValueError()
except ValueError as e:
    print(repr(e), "|", str(e), "|")

try:
    raise ValueError("price must be a number")
except ValueError as e:
    print(repr(e), "|", str(e), "|")

# OUTPUT:
# ValueError() |  |
# ValueError('price must be a number') | price must be a number |`
            ]
        },
        {
            content: `<h4>Re-raising with a Bare raise</h4>
Inside an <code>except</code> block, <code>raise</code> on its own re-raises the exception currently being handled, unchanged. Use it when you want to do something (log, clean up) but still let the caller deal with the error.`,
            codeExamples: [
                `def parse_price(text):
    try:
        return float(text)
    except ValueError:
        print(f"log: bad price {text!r}")
        raise                           # pass the same error on

try:
    parse_price("abc")
except ValueError as e:
    print("caller got:", e)

# OUTPUT:
# log: bad price 'abc'
# caller got: could not convert string to float: 'abc'`
            ]
        },
        {
            content: `<h4>NotImplementedError for Unfinished Methods</h4>
A base class can declare a method that every subclass must provide by raising <code>NotImplementedError</code>. Calling it on a class that forgot to override it fails loudly instead of silently doing nothing.`,
            codeExamples: [
                `class Shape:
    def area(self):
        raise NotImplementedError("subclasses must implement area()")

class Square(Shape):
    def __init__(self, side):
        self.side = side

    def area(self):
        return self.side ** 2

print(Square(4).area())
Shape().area()

# OUTPUT:
# 16
# NotImplementedError: subclasses must implement area()`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Choosing the Right Exception Type</h3>
Callers catch exceptions by type, so the type is part of your function's contract. Pick the built-in that matches the problem:
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Exception</th><th>Raise it when</th></tr>
<tr class='text-center'><td><code>TypeError</code></td><td>The argument has the wrong <b>type</b> (a str where an int is needed)</td></tr>
<tr class='text-center'><td><code>ValueError</code></td><td>The type is right but the <b>value</b> is not acceptable (negative age)</td></tr>
<tr class='text-center'><td><code>KeyError</code> / <code>IndexError</code></td><td>A requested key or position does not exist</td></tr>
<tr class='text-center'><td><code>FileNotFoundError</code>, <code>PermissionError</code></td><td>File-system problems</td></tr>
<tr class='text-center'><td><code>RuntimeError</code></td><td>An error that fits no other category (use sparingly)</td></tr>
<tr class='text-center'><td><code>NotImplementedError</code></td><td>A method that subclasses must override</td></tr>
</table>`,
            codeExamples: [
                `def set_quantity(qty):
    if not isinstance(qty, int):
        raise TypeError(f"quantity must be an int, not {type(qty).__name__}")
    if qty < 1:
        raise ValueError("quantity must be at least 1")
    return qty

for value in (3, "3", 0):
    try:
        print(set_quantity(value))
    except (TypeError, ValueError) as e:
        print(type(e).__name__, "-", e)

# OUTPUT:
# 3
# TypeError - quantity must be an int, not str
# ValueError - quantity must be at least 1`
            ]
        },
        {
            content: `<h3>Fail Fast</h3>
Validate inputs at the <b>start</b> of a function with guard clauses and raise immediately. An error raised close to its cause, with a precise message, is far easier to debug than a strange result - or a crash - three functions later.`
        },
        {
            content: `<h3>assert Is Not Input Validation</h3>
<code>assert condition, "message"</code> raises <code>AssertionError</code> when the condition is false - but Python <b>removes every assert</b> when run with the <code>-O</code> (optimise) flag. Use <code>assert</code> only for internal "this can never happen" checks during development; validate user or external input with <code>if ...: raise</code>.`,
            codeExamples: [
                `# app.py
def apply_discount(price, percent):
    assert 0 <= percent <= 100, "percent out of range"
    return price * (1 - percent / 100)

print(apply_discount(1000, 150))

# $ python app.py
# AssertionError: percent out of range
#
# $ python -O app.py          (asserts stripped)
# -500.0                      <- a negative price slips through!`
            ]
        },
        {
            content: `<h3>Raising in __init__</h3>
If <code>__init__</code> raises, the object is never handed back to the caller - the assignment doesn't happen. This guarantees no half-built, invalid object exists.`,
            codeExamples: [
                `class Account:
    def __init__(self, owner, balance):
        if balance < 0:
            raise ValueError("opening balance cannot be negative")
        self.owner = owner
        self.balance = balance

try:
    acc = Account("Asha", -100)
except ValueError as e:
    print("Not created:", e)

print("acc" in globals())

# OUTPUT:
# Not created: opening balance cannot be negative
# False`
            ]
        },
        {
            content: `<h3>Compared with Java</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Java</th><th>Python</th></tr>
<tr class='text-center'><td><code>throw new IllegalArgumentException("msg");</code></td><td><code>raise ValueError("msg")</code></td></tr>
<tr class='text-center'><td><code>throws IOException</code> in the method signature</td><td>No equivalent - Python has no checked exceptions; document raised exceptions in the docstring</td></tr>
<tr class='text-center'><td><code>throw e;</code> inside catch</td><td><code>raise</code> (bare) inside except</td></tr>
<tr class='text-center'><td><code>UnsupportedOperationException</code></td><td><code>NotImplementedError</code></td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What does a bare <code>raise</code> do?</td><td>Inside an except block, it re-raises the exception currently being handled, with its original traceback</td></tr>
<tr class='text-center'><td>ValueError vs TypeError?</td><td>TypeError: wrong type of argument; ValueError: right type but an unacceptable value</td></tr>
<tr class='text-center'><td>Why not validate input with assert?</td><td>Asserts are removed when Python runs with -O, so the check silently disappears</td></tr>
<tr class='text-center'><td>Does Python have checked exceptions?</td><td>No - there is no throws clause; any function may raise any exception</td></tr>
<tr class='text-center'><td>What is NotImplementedError for?</td><td>Marking methods that subclasses must override</td></tr>
<tr class='text-center'><td>Is <code>raise ValueError</code> valid without parentheses?</td><td>Yes - Python instantiates the class with no arguments</td></tr>
</table>`
        }
    ]
};
