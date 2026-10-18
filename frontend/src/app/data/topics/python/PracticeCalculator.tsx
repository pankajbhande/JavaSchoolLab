import type { Topic } from '../../types';

export const practiceCalculator: Topic = {
    id: 'python-control-flow-practice-calculator',
    name: 'Practice: Calculator',
    beginner: [
        {
            content: `<h4>The Task</h4>
Build a command-line calculator that:<br>
1. asks for two numbers and an operator (<code>+ - * / % **</code>),<br>
2. prints the result,<br>
3. handles bad input and division by zero without crashing,<br>
4. keeps running until the user types <code>q</code>.<br><br>
<b>Concepts practised:</b> <code>input()</code>, type conversion, <code>if/elif/else</code> (or <code>match</code>), <code>while True</code> with <code>break</code>, and basic error handling.`
        },
        {
            content: `<h4>Step 1: One Calculation</h4>
Start with the core: read, convert, choose the operation, print.`,
            codeExamples: [
                `a = float(input("First number: "))
op = input("Operator (+ - * /): ")
b = float(input("Second number: "))

if op == "+":
    result = a + b
elif op == "-":
    result = a - b
elif op == "*":
    result = a * b
elif op == "/":
    result = a / b
else:
    result = None
    print("Unknown operator")

if result is not None:
    print("Result:", result)

# SAMPLE RUN:
# First number: 12
# Operator (+ - * /): *
# Second number: 4
# Result: 48.0`
            ]
        },
        {
            content: `<h4>Step 2: Move the Logic into a Function</h4>
A function that only <b>calculates</b> (no input or printing) is easy to reuse and to test. It raises an error for problems instead of printing them.`,
            codeExamples: [
                `def calculate(a, op, b):
    match op:
        case "+":
            return a + b
        case "-":
            return a - b
        case "*":
            return a * b
        case "/":
            if b == 0:
                raise ZeroDivisionError("cannot divide by zero")
            return a / b
        case "%":
            return a % b
        case "**":
            return a ** b
        case _:
            raise ValueError(f"unknown operator {op!r}")

print(calculate(7, "+", 3), calculate(2, "**", 8), calculate(10, "/", 4))

# OUTPUT:
# 10 256 2.5`
            ]
        },
        {
            content: `<h4>Step 3: The Complete Program</h4>
Wrap everything in a loop and catch the two errors the user can cause. <code>:g</code> formatting prints <code>12.0</code> as <code>12</code> but keeps real decimals.`,
            codeExamples: [
                `def calculate(a, op, b):
    match op:
        case "+":
            return a + b
        case "-":
            return a - b
        case "*":
            return a * b
        case "/":
            if b == 0:
                raise ZeroDivisionError("cannot divide by zero")
            return a / b
        case "%":
            return a % b
        case "**":
            return a ** b
        case _:
            raise ValueError(f"unknown operator {op!r}")


print("Simple Calculator - type q to quit")
while True:
    first = input("\\nFirst number: ").strip()
    if first.lower() == "q":
        print("Goodbye!")
        break
    op = input("Operator (+ - * / % **): ").strip()
    second = input("Second number: ").strip()

    try:
        a = float(first)
        b = float(second)
        result = calculate(a, op, b)
    except (ValueError, ZeroDivisionError) as error:
        print("Error:", error)
    else:
        print(f"{a:g} {op} {b:g} = {result:g}")

# SAMPLE RUN:
# Simple Calculator - type q to quit
#
# First number: 12
# Operator (+ - * / % **): /
# Second number: 5
# 12 / 5 = 2.4
#
# First number: 9
# Operator (+ - * / % **): /
# Second number: 0
# Error: cannot divide by zero
#
# First number: ten
# Operator (+ - * / % **): +
# Second number: 2
# Error: could not convert string to float: 'ten'
#
# First number: q
# Goodbye!`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Dictionary Dispatch with the operator Module</h3>
Instead of one branch per operator, map each symbol to a function. Adding an operator becomes a one-line change, and the list of valid operators comes from the data itself.`,
            codeExamples: [
                `import operator

OPERATIONS = {
    "+": operator.add,
    "-": operator.sub,
    "*": operator.mul,
    "/": operator.truediv,
    "//": operator.floordiv,
    "%": operator.mod,
    "**": operator.pow,
}

def calculate(a, op, b):
    try:
        func = OPERATIONS[op]
    except KeyError:
        valid = " ".join(OPERATIONS)
        raise ValueError(f"unknown operator {op!r}; use one of: {valid}") from None
    return func(a, b)

print(calculate(17, "//", 5))
print(calculate(1, "^", 2))

# OUTPUT:
# 3
# ValueError: unknown operator '^'; use one of: + - * / // % **`
            ]
        },
        {
            content: `<h3>Why Not Just Use eval()?</h3>
It is tempting to write <code>print(eval(input()))</code> - a one-line calculator. But <code>eval</code> runs <b>any</b> Python code the user types, including code that deletes files. Never pass user input to <code>eval</code>. If you want full expressions like <code>2 + 3 * (4 - 1)</code>, parse them safely with the <code>ast</code> module and allow only arithmetic nodes.`,
            codeExamples: [
                `import ast
import operator

ALLOWED = {
    ast.Add: operator.add, ast.Sub: operator.sub,
    ast.Mult: operator.mul, ast.Div: operator.truediv,
    ast.Pow: operator.pow, ast.USub: operator.neg,
}

def safe_eval(expression):
    def walk(node):
        if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
            return node.value
        if isinstance(node, ast.BinOp) and type(node.op) in ALLOWED:
            return ALLOWED[type(node.op)](walk(node.left), walk(node.right))
        if isinstance(node, ast.UnaryOp) and type(node.op) in ALLOWED:
            return ALLOWED[type(node.op)](walk(node.operand))
        raise ValueError("unsupported expression")
    return walk(ast.parse(expression, mode="eval").body)

print(safe_eval("2 + 3 * (4 - 1)"))
print(safe_eval("-2 ** 2"))
print(safe_eval("__import__('os').getcwd()"))

# OUTPUT:
# 11
# -4
# ValueError: unsupported expression`
            ]
        },
        {
            content: `<h3>Testing the Calculator</h3>
Because <code>calculate()</code> does no input or output, it can be tested automatically. With <b>pytest</b>, any function named <code>test_...</code> containing <code>assert</code> statements is a test.`,
            codeExamples: [
                `# test_calculator.py   (run with: pytest)
import pytest
from calculator import calculate

def test_basic_operations():
    assert calculate(2, "+", 3) == 5
    assert calculate(2, "**", 10) == 1024
    assert calculate(7, "/", 2) == 3.5

def test_division_by_zero():
    with pytest.raises(ZeroDivisionError):
        calculate(1, "/", 0)

def test_unknown_operator():
    with pytest.raises(ValueError):
        calculate(1, "^", 2)`
            ]
        },
        {
            content: `<h3>Extend It</h3>
1. Keep a <b>history</b> list and add an <code>h</code> command that prints previous calculations.<br>
2. Let the user type the whole calculation on one line: <code>12 * 4</code> (hint: <code>split()</code>).<br>
3. Add <code>ans</code> as a special input meaning "the previous result".<br>
4. Add a <code>sqrt</code> command using <code>math.sqrt</code>, with a clear error for negative numbers.<br>
5. Use <code>decimal.Decimal</code> so <code>0.1 + 0.2</code> prints <code>0.3</code>.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why separate calculate() from input/print?</td><td>Pure logic is reusable (CLI, GUI, web) and can be unit-tested without simulating a user</td></tr>
<tr class='text-center'><td>What is dictionary dispatch?</td><td>Mapping keys to functions and calling <code>table[key](...)</code> instead of writing an if/elif branch per key</td></tr>
<tr class='text-center'><td>Why is <code>eval(input())</code> dangerous?</td><td>It executes arbitrary code typed by the user</td></tr>
<tr class='text-center'><td>What does <code>raise ... from None</code> do?</td><td>Hides the original exception (here the KeyError) so the user sees only the clearer error</td></tr>
<tr class='text-center'><td>What does the <code>else</code> of a try block do?</td><td>Runs only when no exception was raised in the try block</td></tr>
</table>`
        }
    ]
};
