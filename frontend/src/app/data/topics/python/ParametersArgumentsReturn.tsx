import type { Topic } from '../../types';

export const parametersArgumentsReturn: Topic = {
    id: 'python-functions-parameters-arguments-return-values',
    name: 'Parameters, Arguments & Return Values',
    beginner: [
        {
            content: `<h4>Parameters vs Arguments</h4>
• A <b>parameter</b> is the variable name listed in the function's definition.<br>
• An <b>argument</b> is the actual value passed in when the function is called.<br><br>
In <code>def add(a, b)</code>, <code>a</code> and <code>b</code> are parameters; in <code>add(2, 3)</code>, <code>2</code> and <code>3</code> are arguments. Each call binds the parameters to that call's arguments.`,
            codeExamples: [
                `def add(a, b):          # a, b are parameters
    return a + b

print(add(2, 3))        # 2, 3 are arguments
print(add(10, -4))
print(add("Py", "thon"))  # any types that support +

# OUTPUT:
# 5
# 6
# Python`
            ]
        },
        {
            content: `<h4>Returning a Value</h4>
<code>return</code> sends a result back to the caller. The call expression then <b>is</b> that value, so it can be stored, printed, or used inside a bigger expression.`,
            codeExamples: [
                `def percentage(obtained, total):
    return obtained * 100 / total

score = percentage(438, 500)
print(score)
print(f"{percentage(45, 60):.1f}%")
print(percentage(90, 100) > 80)

# OUTPUT:
# 87.6
# 75.0%
# True`
            ]
        },
        {
            content: `<h4>Returning Several Values</h4>
Separate values with commas and Python returns them as one <b>tuple</b>, which the caller can unpack.`,
            codeExamples: [
                `def divide(a, b):
    return a // b, a % b         # quotient and remainder

result = divide(17, 5)
print(result, type(result))

q, r = divide(17, 5)
print("quotient:", q, "remainder:", r)

# OUTPUT:
# (3, 2) <class 'tuple'>
# quotient: 3 remainder: 2`
            ]
        },
        {
            content: `<h4>return Ends the Function</h4>
As soon as <code>return</code> runs, the function stops - code after it in that path never executes. This lets you return early once the answer is known.`,
            codeExamples: [
                `def find_index(items, target):
    for i, item in enumerate(items):
        if item == target:
            return i              # stop as soon as it's found
    return -1                     # only reached if the loop finishes

print(find_index(["pen", "ink", "pad"], "ink"))
print(find_index(["pen", "ink", "pad"], "cap"))

# OUTPUT:
# 1
# -1`
            ]
        },
        {
            content: `<h4>Implicit None</h4>
A function returns <code>None</code> when it has no <code>return</code>, when <code>return</code> has no value, or when execution falls off the end of a path that has no return.`,
            codeExamples: [
                `def log(message):
    print("LOG:", message)

def check_age(age):
    if age >= 18:
        return "adult"
    # no return for younger ages

print(log("started"))
print(check_age(25), check_age(12))

# OUTPUT:
# LOG: started
# None
# adult None`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>How Arguments Are Passed: Call by Sharing</h3>
Python passes <b>references to objects</b> - often called "pass by object reference" or "call by sharing". The parameter becomes a new name for the caller's object. Two consequences:<br>
• <b>Mutating</b> the object (e.g. <code>list.append</code>) is visible to the caller - same object.<br>
• <b>Rebinding</b> the parameter (<code>param = something_else</code>) only changes the local name; the caller is unaffected.<br><br>
This is the same model as Java's object references (Java passes a copy of the reference), and like Java, Python has no way to make a function rebind the caller's variable.`,
            codeExamples: [
                `def add_item(cart):
    cart.append("pen")            # mutates the shared list

def reset(cart):
    cart = []                     # rebinds the local name only

def increment(n):
    n += 1                        # ints are immutable: rebinding again
    return n

items = ["book"]
add_item(items)
reset(items)
print(items)

count = 5
increment(count)
print(count, increment(count))

# OUTPUT:
# ['book', 'pen']
# 5 6`
            ]
        },
        {
            content: `<h3>Guard Clauses and a Single Exit Point</h3>
Some style guides insist on one <code>return</code> at the end. In Python, early returns for invalid input are idiomatic: they keep the main logic un-nested.`,
            codeExamples: [
                `def withdraw(balance, amount):
    if amount <= 0:
        return balance, "invalid amount"
    if amount > balance:
        return balance, "insufficient funds"
    return balance - amount, "ok"

print(withdraw(1000, 300))
print(withdraw(1000, 5000))

# OUTPUT:
# (700, 'ok')
# (1000, 'insufficient funds')`
            ]
        },
        {
            content: `<h3>Prefer Named Results over Long Tuples</h3>
<code>return a, b</code> is fine for two obvious values. Beyond that, callers must remember what position 3 means. Return a <code>NamedTuple</code>, a dataclass or a dict instead.`,
            codeExamples: [
                `from typing import NamedTuple

class Stats(NamedTuple):
    minimum: int
    maximum: int
    mean: float

def describe(values):
    return Stats(min(values), max(values), sum(values) / len(values))

s = describe([4, 9, 2, 5])
print(s)
print(s.maximum - s.minimum)
low, high, avg = s                # still unpacks like a tuple

# OUTPUT:
# Stats(minimum=2, maximum=9, mean=5.0)
# 7`
            ]
        },
        {
            content: `<h3>Returning Functions and Containers</h3>
A function can return any object - a list, a dict, even another function. A returned inner function remembers the variables of the call that created it (a <b>closure</b>, covered later).`,
            codeExamples: [
                `def make_multiplier(factor):
    def multiply(n):
        return n * factor
    return multiply

double = make_multiplier(2)
triple = make_multiplier(3)
print(double(10), triple(10))

def split_marks(marks):
    return {"pass": [m for m in marks if m >= 40],
            "fail": [m for m in marks if m < 40]}

print(split_marks([72, 35, 90, 18]))

# OUTPUT:
# 20 30
# {'pass': [72, 90], 'fail': [35, 18]}`
            ]
        },
        {
            content: `<h3>Type Hints Document, They Don't Enforce</h3>
Annotations describe the expected types for readers, editors and static checkers like mypy. CPython stores them but does not check them at runtime.`,
            codeExamples: [
                `def double(n: int) -> int:
    return n * 2

print(double(21))
print(double("ab"))          # runs fine - hints aren't checked
print(double.__annotations__)

# OUTPUT:
# 42
# abab
# {'n': <class 'int'>, 'return': <class 'int'>}`
            ]
        },
        {
            content: `<h3>Inspecting a Function's Signature</h3>
<code>inspect.signature()</code> shows a function's parameters, defaults and kinds - used by frameworks such as FastAPI and pytest to decide what to pass in.`,
            codeExamples: [
                `import inspect

def order(price, qty=1, *, discount=0.0):
    return price * qty * (1 - discount)

sig = inspect.signature(order)
print(sig)
for name, param in sig.parameters.items():
    print(name, param.kind.name, param.default)

# OUTPUT:
# (price, qty=1, *, discount=0.0)
# price POSITIONAL_OR_KEYWORD <class 'inspect._empty'>
# qty POSITIONAL_OR_KEYWORD 1
# discount KEYWORD_ONLY 0.0`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Parameter vs argument?</td><td>A parameter is the name in the definition; an argument is the value supplied in a call</td></tr>
<tr class='text-center'><td>Is Python pass-by-value or pass-by-reference?</td><td>Neither exactly - it passes object references ("call by sharing"): mutations are visible to the caller, rebinding is not</td></tr>
<tr class='text-center'><td>How do you return multiple values?</td><td>Return a tuple (<code>return a, b</code>) and unpack it, or return a NamedTuple/dataclass for clarity</td></tr>
<tr class='text-center'><td>What does a function return when it ends without return?</td><td>None</td></tr>
<tr class='text-center'><td>Can a function change the caller's int variable?</td><td>No - ints are immutable and rebinding a parameter is local; return the new value instead</td></tr>
<tr class='text-center'><td>Are type hints checked at runtime?</td><td>No - they are stored in <code>__annotations__</code> and used by tools like mypy</td></tr>
</table>`
        }
    ]
};
