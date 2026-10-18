import type { Topic } from '../../types';

export const recursion: Topic = {
    id: 'python-functions-recursion',
    name: 'Recursion',
    beginner: [
        {
            content: `<h4>What is Recursion?</h4>
A <b>recursive function</b> is a function that calls itself to solve a smaller version of the same problem. Every recursive function needs two parts:<br><br>
• a <b>base case</b> - a simple input answered directly, which stops the recursion;<br>
• a <b>recursive case</b> - the function calls itself with an input that is <b>closer to the base case</b>.<br><br>
Without a reachable base case the function would call itself forever.`,
            codeExamples: [
                `def countdown(n):
    if n == 0:                 # base case
        print("Liftoff!")
        return
    print(n)
    countdown(n - 1)           # recursive case - a smaller problem

countdown(3)

# OUTPUT:
# 3
# 2
# 1
# Liftoff!`
            ]
        },
        {
            content: `<h4>Factorial</h4>
<code>n! = n × (n-1)!</code>, and <code>1! = 1</code>. The mathematical definition translates directly into code.`,
            codeExamples: [
                `def factorial(n):
    if n <= 1:                 # base case
        return 1
    return n * factorial(n - 1)

print(factorial(5))
print(factorial(1))

# OUTPUT:
# 120
# 1`
            ]
        },
        {
            content: `<h4>Sum of a List</h4>
"The sum of a list is its first item plus the sum of the rest." An empty list sums to 0 - that is the base case.`,
            codeExamples: [
                `def total(items):
    if not items:              # base case: empty list
        return 0
    return items[0] + total(items[1:])

print(total([1, 2, 3, 4]))
print(total([]))

# OUTPUT:
# 10
# 0`
            ]
        },
        {
            content: `<h4>Tracing the Call Stack</h4>
Each call waits for the call it made to return. The calls pile up on the <b>call stack</b> until the base case is reached, then the results flow back up. Indenting by depth makes this visible.`,
            codeExamples: [
                `def factorial(n, depth=0):
    indent = "  " * depth
    print(f"{indent}factorial({n})")
    if n <= 1:
        print(f"{indent}-> 1")
        return 1
    result = n * factorial(n - 1, depth + 1)
    print(f"{indent}-> {result}")
    return result

factorial(4)

# OUTPUT:
# factorial(4)
#   factorial(3)
#     factorial(2)
#       factorial(1)
#       -> 1
#     -> 2
#   -> 6
# -> 24`
            ]
        },
        {
            content: `<h4>Fibonacci</h4>
Each Fibonacci number is the sum of the two before it: <code>fib(n) = fib(n-1) + fib(n-2)</code>, with <code>fib(0) = 0</code> and <code>fib(1) = 1</code>. This function makes <b>two</b> recursive calls - see the Expert tab for why that is a problem.`,
            codeExamples: [
                `def fib(n):
    if n < 2:                  # base cases: fib(0) = 0, fib(1) = 1
        return n
    return fib(n - 1) + fib(n - 2)

print([fib(i) for i in range(10)])

# OUTPUT:
# [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>The Recursion Limit</h3>
Every call uses a stack frame. To protect the interpreter, CPython stops recursion at a depth limit - <b>1000</b> by default - and raises <code>RecursionError</code>. A missing or unreachable base case hits it quickly.`,
            codeExamples: [
                `import sys

print(sys.getrecursionlimit())

def forever(n):
    return forever(n + 1)       # no base case

try:
    forever(0)
except RecursionError as error:
    print("RecursionError:", error)

# OUTPUT:
# 1000
# RecursionError: maximum recursion depth exceeded`
            ]
        },
        {
            content: `<h3>No Tail-Call Optimisation</h3>
Some languages reuse the current stack frame when a recursive call is the very last action (a "tail call"). Python deliberately does <b>not</b> - Guido van Rossum preferred complete tracebacks. So even a tail-recursive function over 10,000 items fails, while a simple loop handles any size.`,
            codeExamples: [
                `def sum_to(n, acc=0):
    if n == 0:
        return acc
    return sum_to(n - 1, acc + n)     # tail call - still a new frame

print(sum_to(100))

try:
    sum_to(10_000)
except RecursionError:
    print("too deep for recursion")

print(sum(range(10_001)))              # the loop/builtin way

# OUTPUT:
# 5050
# too deep for recursion
# 50005000`
            ]
        },
        {
            content: `<h3>Naive Fibonacci Is Exponential - Memoise It</h3>
<code>fib(n)</code> recomputes the same values again and again: the number of calls grows roughly like 1.6<sup>n</sup>. Caching each result (<b>memoisation</b>) means every value is computed once - linear time. <code>functools.cache</code> (3.9+) or <code>lru_cache</code> adds this with one line.`,
            codeExamples: [
                `from functools import cache

calls = 0
def fib(n):
    global calls
    calls += 1
    return n if n < 2 else fib(n - 1) + fib(n - 2)

print(fib(20), "computed with", calls, "calls")

memo_calls = 0
@cache
def fib_memo(n):
    global memo_calls
    memo_calls += 1
    return n if n < 2 else fib_memo(n - 1) + fib_memo(n - 2)

print(fib_memo(20), "computed with", memo_calls, "calls")
print(fib_memo(100))

# OUTPUT:
# 6765 computed with 21891 calls
# 6765 computed with 21 calls
# 354224848179261915075`
            ]
        },
        {
            content: `<h3>Converting Recursion to Iteration</h3>
Any recursion can be rewritten with a loop and an <b>explicit stack</b> (a list). The program then keeps its own "to do" list on the heap instead of using the call stack, so depth is no longer limited.`,
            codeExamples: [
                `def flatten_recursive(items):
    result = []
    for item in items:
        if isinstance(item, list):
            result.extend(flatten_recursive(item))
        else:
            result.append(item)
    return result

def flatten_iterative(items):
    result = []
    stack = [items]
    while stack:
        current = stack.pop()
        if isinstance(current, list):
            stack.extend(reversed(current))   # reversed keeps the original order
        else:
            result.append(current)
    return result

nested = [1, [2, [3, 4]], 5, [[6]]]
print(flatten_recursive(nested))
print(flatten_iterative(nested))

# OUTPUT:
# [1, 2, 3, 4, 5, 6]
# [1, 2, 3, 4, 5, 6]`
            ]
        },
        {
            content: `<h3>Problems That Are Naturally Recursive</h3>
Recursion shines when the data itself is recursive (trees, nested structures, folders inside folders) or the problem splits into smaller copies of itself.`,
            codeExamples: [
                `def permutations(s):
    if len(s) <= 1:
        return [s]
    result = []
    for i, ch in enumerate(s):
        for rest in permutations(s[:i] + s[i + 1:]):
            result.append(ch + rest)
    return result

def binary_search(items, target, low=0, high=None):
    if high is None:
        high = len(items) - 1
    if low > high:
        return -1                         # base case: not found
    mid = (low + high) // 2
    if items[mid] == target:
        return mid
    if items[mid] < target:
        return binary_search(items, target, mid + 1, high)
    return binary_search(items, target, low, mid - 1)

print(permutations("abc"))
print(binary_search([3, 8, 15, 21, 42, 57], 42))
print(binary_search([3, 8, 15, 21, 42, 57], 5))

# OUTPUT:
# ['abc', 'acb', 'bac', 'bca', 'cab', 'cba']
# 4
# -1`,
                `from pathlib import Path

def show_tree(folder, depth=0):
    print("  " * depth + folder.name + "/")
    for entry in sorted(folder.iterdir()):
        if entry.is_dir():
            show_tree(entry, depth + 1)      # a folder contains folders
        else:
            print("  " * (depth + 1) + entry.name)

show_tree(Path("project"))

# OUTPUT (depends on your folders - e.g.):
# project/
#   README.md
#   src/
#     app.py
#     utils/
#       helpers.py`
            ]
        },
        {
            content: `<h3>Raising the Limit - Carefully</h3>
<code>sys.setrecursionlimit(n)</code> raises the depth limit, but the limit exists to protect the real C stack of the interpreter. Set it too high and a deep recursion can <b>crash the whole process</b> instead of raising a catchable <code>RecursionError</code>. For deep data, prefer an iterative version.`,
            codeExamples: [
                `import sys

sys.setrecursionlimit(5000)     # acceptable for moderately deep recursion
print(sys.getrecursionlimit())

# OUTPUT:
# 5000`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What two parts does every recursive function need?</td><td>A base case that stops the recursion and a recursive case that moves toward it</td></tr>
<tr class='text-center'><td>What is Python's default recursion limit?</td><td>1000, readable with <code>sys.getrecursionlimit()</code></td></tr>
<tr class='text-center'><td>Does Python optimise tail calls?</td><td>No - every call gets a new frame, so deep tail recursion still raises RecursionError</td></tr>
<tr class='text-center'><td>Why is naive recursive Fibonacci slow?</td><td>It recomputes the same subproblems, giving exponential calls; memoisation makes it linear</td></tr>
<tr class='text-center'><td>How do you memoise a function?</td><td>Decorate it with <code>functools.cache</code> or <code>functools.lru_cache(maxsize=...)</code></td></tr>
<tr class='text-center'><td>How do you avoid the recursion limit?</td><td>Rewrite with a loop and an explicit stack (or queue)</td></tr>
<tr class='text-center'><td>Recursion vs iteration in Python?</td><td>Use recursion when the problem is naturally recursive and shallow; iteration is faster and has no depth limit</td></tr>
</table>`
        }
    ]
};
