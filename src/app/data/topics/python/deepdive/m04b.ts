// Module 4 (Functions), part B: recursion, lambdas, functional tools.
import { dd, r, type DeepDive } from './deepDive';

export const m04b: Record<string, DeepDive> = {
    'Recursion': dd(
        [`<b>Recursion</b> is a function calling itself on a smaller version of the problem. Every recursive function needs a <b>base case</b> (stops the recursion) and a <b>recursive case</b> (moves toward the base case).`,
            r`def factorial(n):
    if n <= 1:                     # base case
        return 1
    return n * factorial(n - 1)    # recursive case: smaller problem

print(factorial(5))
print([factorial(i) for i in range(6)])

# OUTPUT:
# 120
# [1, 1, 2, 6, 24, 120]`],
        [`Some problems are naturally self-similar: trees, folders, nested JSON, divide-and-conquer algorithms, permutations. Recursion mirrors their definition and is often shorter than a manual stack with loops.`,
            r`# Flatten arbitrarily nested lists - hard with plain loops
def flatten(items):
    out = []
    for x in items:
        if isinstance(x, list):
            out.extend(flatten(x))       # recurse into sub-lists
        else:
            out.append(x)
    return out

print(flatten([1, [2, [3, [4]], 5]]))

# OUTPUT:
# [1, 2, 3, 4, 5]`],
        [`File-system walks, JSON/XML tree processing, parsers, game AI (minimax), sorting (merge/quick sort), and graph search (DFS).`,
            r`# Real-time: total size of a folder tree (modelled as nested dicts)
tree = {"a.txt": 10, "docs": {"b.txt": 20, "img": {"c.png": 70}}}
def total_size(node):
    if isinstance(node, int):
        return node                      # base: a file
    return sum(total_size(child) for child in node.values())
print(total_size(tree))

# OUTPUT:
# 100`],
        [`<b>Advantages:</b> elegant, mirrors mathematical and tree definitions, and combines well with memoization for dynamic programming.`,
            r`# Advantage: naive Fibonacci is exponential, one decorator makes it linear
from functools import lru_cache

@lru_cache(maxsize=None)
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)

print(fib(50))
print(fib.cache_info().misses)

# OUTPUT:
# 12586269025
# 51`],
        [`<b>Disadvantages:</b> each call uses stack memory and time; naive recursion can repeat work exponentially; harder to debug than loops.`,
            r`# Disadvantage: naive fib recomputes the same values
calls = 0
def fib(n):
    global calls
    calls += 1
    return n if n < 2 else fib(n - 1) + fib(n - 2)

print(fib(20), "calls:", calls)

# OUTPUT:
# 6765 calls: 21891`],
        [`<b>Limitations:</b> CPython limits recursion depth (default 1000) and does not optimise tail calls, so deep recursion raises RecursionError.`,
            r`import sys
print("limit:", sys.getrecursionlimit())

def depth(n):
    return depth(n + 1)              # no base case

try:
    depth(0)
except RecursionError as e:
    print("RecursionError:", str(e)[:40])

# OUTPUT:
# limit: 1000
# RecursionError: maximum recursion depth exceeded`],
        `
   factorial(3)
     └─► 3 * factorial(2)
              └─► 2 * factorial(1)
                       └─► 1          (base case)
              ◄── 2 * 1 = 2
     ◄── 3 * 2 = 6

   call stack grows down, then unwinds back up
`,
        `Use recursion for trees and divide-and-conquer where depth is logarithmic or bounded; convert to iteration with an explicit stack when depth can be large (user-supplied data). Memoize overlapping subproblems, and never raise <code>setrecursionlimit</code> blindly: you risk crashing the interpreter.`
    ),

    'Lambda Functions': dd(
        [`A <b>lambda</b> is a small anonymous function written as one expression: <code>lambda params: expression</code>. It returns the expression value automatically and is usually passed straight to another function.`,
            r`square = lambda x: x * x
add = lambda a, b=10: a + b
print(square(6), add(1), add(1, 2))
print((lambda s: s.upper())("hi"))     # defined and called immediately

# OUTPUT:
# 36 11 3
# HI`],
        [`Many functions take a function argument (<code>sorted(key=)</code>, <code>max(key=)</code>, GUI callbacks). Writing a full <code>def</code> for a one-line rule is noisy; a lambda keeps it inline.`,
            r`people = [("Abaji", 30), ("Raoji", 25), ("Moropant", 35)]
print(sorted(people, key=lambda p: p[1]))        # by age
print(max(people, key=lambda p: p[1])[0])        # oldest

# OUTPUT:
# [('Raoji', 25), ('Abaji', 30), ('Moropant', 35)]
# Moropant`],
        [`Sorting keys, button callbacks, pandas <code>apply</code>, quick filters, and dispatch tables.`,
            r`# Real-time: dispatch table of tiny strategies
discount = {
    "none":    lambda p: p,
    "student": lambda p: p * 0.8,
    "vip":     lambda p: p * 0.7,
}
print(discount["student"](200), discount["vip"](200))

# OUTPUT:
# 160.0 140.0`],
        [`<b>Advantages:</b> concise, no name pollution, and can capture surrounding values (closures).`,
            r`# Advantage: build specialised functions on the fly
def power(n):
    return lambda x: x ** n

cube = power(3)
print(cube(4))

# OUTPUT:
# 64`],
        [`<b>Disadvantages:</b> hard to read when complex, anonymous in tracebacks, and a classic late-binding trap in loops.`,
            r`# Disadvantage: lambdas look up the variable when CALLED, not when defined
funcs = [lambda: i for i in range(3)]
print([f() for f in funcs])               # all see the final i

fixed = [lambda i=i: i for i in range(3)] # bind the value as a default
print([f() for f in fixed])

# OUTPUT:
# [2, 2, 2]
# [0, 1, 2]`],
        [`<b>Limitations:</b> only a single expression: no statements, no assignment, no annotations, no docstring.`,
            r`try:
    compile("f = lambda x: return x", "d", "exec")
except SyntaxError:
    print("SyntaxError: no statements in a lambda")
print((lambda x: (print("side effect"), x * 2)[1])(4))   # workaround, but ugly

# OUTPUT:
# SyntaxError: no statements in a lambda
# side effect
# 8`],
        `
   def  square(x):          lambda x: x * x
        return x * x             │      └── expression = return value
                                 └── parameters
   named, statements ok     anonymous, one expression only
`,
        `Use lambdas for short keys and callbacks; as soon as logic needs a name, a comment or a test, write a <code>def</code>. Prefer <code>operator.itemgetter</code>/<code>attrgetter</code> over <code>lambda x: x[1]</code> for speed and clarity, and never assign a lambda to a name (PEP 8 E731).`
    ),

    'Higher-Order Functions': dd(
        [`A <b>higher-order function</b> takes functions as arguments, returns a function, or both. Because Python functions are first-class objects, this works with no special syntax. Decorators are the best-known example.`,
            r`def apply_twice(func, value):
    return func(func(value))              # takes a function

def make_adder(n):
    return lambda x: x + n                # returns a function

print(apply_twice(make_adder(5), 10))
print(apply_twice(str.upper, "ab"))

# OUTPUT:
# 20
# AB`],
        [`They let you separate <b>what varies</b> (the operation) from <b>what stays the same</b> (the loop, retry, logging), so common patterns are written once and reused.`,
            r`def retry(times, func):
    for attempt in range(1, times + 1):
        try:
            return func()
        except ValueError:
            print("attempt", attempt, "failed")
    return None

state = {"n": 0}
def flaky():
    state["n"] += 1
    if state["n"] < 3:
        raise ValueError
    return "success"

print(retry(5, flaky))

# OUTPUT:
# attempt 1 failed
# attempt 2 failed
# success`],
        [`Decorators for logging, auth, caching and timing; event callbacks; strategy selection; <code>sorted(key=)</code>, <code>map</code>, <code>filter</code>; middleware chains in web frameworks.`,
            r`# Real-time: a timing decorator
import time
def timed(func):
    def wrapper(*a, **kw):
        t = time.perf_counter()
        result = func(*a, **kw)
        print(f"{func.__name__} done")
        return result
    return wrapper

@timed
def work(n): return sum(range(n))
print(work(1000))

# OUTPUT:
# work done
# 499500`],
        [`<b>Advantages:</b> eliminate duplicated control logic, make behaviour configurable, and compose small pieces into larger ones.`,
            r`# Advantage: composition
def compose(f, g):
    return lambda x: f(g(x))

inc = lambda x: x + 1
dbl = lambda x: x * 2
print(compose(dbl, inc)(5))     # dbl(inc(5))

# OUTPUT:
# 12`],
        [`<b>Disadvantages:</b> indirection makes control flow harder to trace; stack traces show wrapper frames; wrappers lose the original name and docstring unless <code>functools.wraps</code> is used.`,
            r`from functools import wraps
def plain(f):
    def w(*a, **k): return f(*a, **k)
    return w
def good(f):
    @wraps(f)
    def w(*a, **k): return f(*a, **k)
    return w

@plain
def one(): "doc one"
@good
def two(): "doc two"
print(one.__name__, "|", two.__name__)

# OUTPUT:
# w | two`],
        [`<b>Limitations:</b> Python is not purely functional: no tail-call optimisation, no cheap immutable persistent structures, and lambdas are limited to one expression.`,
            r`# Limitation: a function-composition chain this deep fails at the recursion limit
f = lambda x: x
for _ in range(2000):
    prev = f
    f = (lambda p: lambda x: p(x) + 1)(prev)   # nest 2000 levels
try:
    f(0)
except RecursionError:
    print("RecursionError at 2000 nested calls")

# OUTPUT:
# RecursionError at 2000 nested calls`],
        `
   data ──► [ higher-order function ] ──► result
                 ▲          ▲
        behaviour│          │config
        passed in│ (func)   │(args)

   @decorator
   def f(): ...    ≡    f = decorator(f)
`,
        `Higher-order functions are the backbone of decorators, middleware and strategy patterns. Keep wrappers thin, always use <code>functools.wraps</code>, and for stateful behaviour prefer a small class with <code>__call__</code>: it is easier to debug, test and type than nested closures.`
    ),

    'map(), filter() & reduce()': dd(
        [`<code>map(f, it)</code> applies f to each item; <code>filter(f, it)</code> keeps items where f is true; <code>functools.reduce(f, it, init)</code> folds the items into one value. <code>map</code> and <code>filter</code> are lazy iterators.`,
            r`from functools import reduce
nums = [1, 2, 3, 4, 5]
print(list(map(lambda x: x * x, nums)))
print(list(filter(lambda x: x % 2 == 0, nums)))
print(reduce(lambda acc, x: acc + x, nums, 0))
print(list(map(str.upper, ["a", "b"])))

# OUTPUT:
# [1, 4, 9, 16, 25]
# [2, 4]
# 15
# ['A', 'B']`],
        [`Transform-filter-aggregate is the core of data processing. These three tools express each stage as one named operation without writing a loop and a temporary list.`,
            r`from functools import reduce
prices = [100, 250, 40, 300]
big = filter(lambda p: p >= 100, prices)
taxed = map(lambda p: p * 1.1, big)
total = reduce(lambda a, b: a + b, taxed)
print(round(total, 2))

# OUTPUT:
# 715.0`],
        [`ETL pipelines, cleaning input rows, applying a function over parallel iterables, and finding a running max or product.`,
            r`# Real-time: map with multiple iterables
a = [1, 2, 3]
b = [10, 20, 30]
print(list(map(lambda x, y: x + y, a, b)))
print(list(map(int, "123")))          # convert each character

# OUTPUT:
# [11, 22, 33]
# [1, 2, 3]`],
        [`<b>Advantages:</b> lazy (low memory), can chain without temporary lists, and work with any iterable including generators.`,
            r`# Advantage: laziness - nothing runs until you consume the result
def noisy(x):
    print("processing", x)
    return x * 2

m = map(noisy, [1, 2, 3])
print("map created, nothing printed yet")
print(next(m))

# OUTPUT:
# map created, nothing printed yet
# processing 1
# 2`],
        [`<b>Disadvantages:</b> a comprehension is usually more readable; <code>reduce</code> is often cryptic; a lazy iterator can be consumed only once.`,
            r`m = map(lambda x: x + 1, [1, 2, 3])
print(list(m))
print(list(m))                        # exhausted: empty the second time

# OUTPUT:
# [2, 3, 4]
# []`],
        [`<b>Limitations:</b> <code>reduce</code> needs an import and fails on empty input without an initial value; <code>map</code> stops at the shortest iterable.`,
            r`from functools import reduce
try:
    reduce(lambda a, b: a + b, [])
except TypeError as e:
    print("TypeError:", e)
print(reduce(lambda a, b: a + b, [], 0))      # supply an initial value
print(list(map(lambda x, y: x + y, [1, 2, 3], [10, 20])))

# OUTPUT:
# TypeError: reduce() of empty iterable with no initial value
# 0
# [11, 22]`],
        `
   [1, 2, 3, 4]
        │ map(x*x)       each item transformed
        ▼
   [1, 4, 9, 16]
        │ filter(even)   items kept or dropped
        ▼
   [4, 16]
        │ reduce(+)      folded to ONE value
        ▼
   20
`,
        `Prefer comprehensions and generator expressions for map/filter, and built-ins (<code>sum</code>, <code>max</code>, <code>math.prod</code>, <code>any</code>) over <code>reduce</code>. Keep <code>map(func, ...)</code> when func is already a named function. For large numeric work use NumPy or pandas vector operations.`
    ),

    'zip() & enumerate()': dd(
        [`<code>zip(a, b, ...)</code> pairs up items from several iterables. <code>enumerate(it, start=0)</code> yields (index, item) pairs. Both are lazy and are normally used in <code>for</code> loops.`,
            r`names = ["Abaji", "Raoji", "Moropant"]
marks = [90, 75, 82]
for name, mark in zip(names, marks):
    print(name, mark)
for i, name in enumerate(names, start=1):
    print(i, name)
print(dict(zip(names, marks)))

# OUTPUT:
# Abaji 90
# Raoji 75
# Moropant 82
# 1 Abaji
# 2 Raoji
# 3 Moropant
# {'Abaji': 90, 'Raoji': 75, 'Moropant': 82}`],
        [`Parallel lists and "I need the position too" come up constantly. <code>range(len(x))</code> loops and manual counters are error-prone and unreadable by comparison.`,
            r`# Unpythonic vs Pythonic
items = ["a", "b", "c"]
for i in range(len(items)):                  # clumsy
    print(i, items[i], end="; ")
print()
for i, x in enumerate(items):                # clear
    print(i, x, end="; ")
print()

# OUTPUT:
# 0 a; 1 b; 2 c;
# 0 a; 1 b; 2 c; `],
        [`Building dicts from two columns, comparing consecutive items, numbering output lines, transposing a matrix, and iterating CSV columns together.`,
            r`# Real-time: transpose a table and compare neighbours
rows = [(1, 2, 3), (4, 5, 6)]
print(list(zip(*rows)))                      # transpose
vals = [3, 7, 12]
print([b - a for a, b in zip(vals, vals[1:])])   # differences

# OUTPUT:
# [(1, 4), (2, 5), (3, 6)]
# [4, 5]`],
        [`<b>Advantages:</b> lazy, memory-light, readable, and <code>zip(strict=True)</code> (3.10+) checks that lengths match.`,
            r`# Advantage: strict=True catches mismatched data
a, b = [1, 2, 3], ["x", "y"]
try:
    list(zip(a, b, strict=True))
except ValueError as e:
    print("ValueError:", e)

# OUTPUT:
# ValueError: zip() argument 2 is shorter than argument 1`],
        [`<b>Disadvantages:</b> plain <code>zip</code> silently truncates to the shortest input, which can hide data loss; the result is a one-shot iterator.`,
            r`print(list(zip([1, 2, 3], ["a", "b"])))   # the 3 is silently dropped
z = zip([1], [2])
print(list(z), list(z))                     # second pass is empty

# OUTPUT:
# [(1, 'a'), (2, 'b')]
# [(1, 2)] []`],
        [`<b>Limitations:</b> they work on iterables only (not random access), <code>zip_longest</code> lives in <code>itertools</code>, and unzipping a huge zip with <code>*</code> loads it all into memory.`,
            r`from itertools import zip_longest
print(list(zip_longest([1, 2, 3], ["a"], fillvalue="-")))

# OUTPUT:
# [(1, 'a'), (2, '-'), (3, '-')]`],
        `
   names  = [Abaji, Raoji, Moropant]        enumerate(names, 1)
   marks  = [ 90,   75,   82 ]          (1, Abaji)
              │     │     │             (2, Raoji)
              ▼     ▼     ▼             (3, Moropant)
   zip ──► (Abaji,90) (Raoji,75) (Moropant,82)
`,
        `Use <code>zip(strict=True)</code> by default in new code to surface length bugs. Prefer iterating over objects (dataclasses) to juggling parallel lists; parallel arrays are a sign that a record type is missing.`
    ),

    'any(), all() & sorted()': dd(
        [`<code>any(it)</code> is True if at least one item is truthy; <code>all(it)</code> is True if every item is truthy (and True for an empty input). <code>sorted(it, key=, reverse=)</code> returns a new sorted list. Both <code>any</code> and <code>all</code> short-circuit.`,
            r`nums = [3, 8, 12]
print(any(n > 10 for n in nums))       # at least one > 10
print(all(n > 0 for n in nums))        # every one positive
print(any([]), all([]))                # empty: any False, all True
print(sorted([3, 1, 2]), sorted("cab"), sorted({3: "a", 1: "b"}))

# OUTPUT:
# True
# True
# False True
# [1, 2, 3] ['a', 'b', 'c'] [1, 3]`],
        [`Validating a whole collection and ordering results are daily tasks. These built-ins express them in one readable line and stop early when the answer is known.`,
            r`passwords = ["abc12345", "secret", "Zx9!pass"]
strong = [p for p in passwords if len(p) >= 8 and any(c.isdigit() for c in p)]
print(strong)
print(sorted(passwords, key=len, reverse=True))

# OUTPUT:
# ['abc12345', 'Zx9!pass']
# ['abc12345', 'Zx9!pass', 'secret']`],
        [`Form validation (all fields filled), permission checks (any role matches), data quality gates, leaderboards, and report ordering.`,
            r`# Real-time: validate every record, find the first bad one
orders = [{"id": 1, "qty": 2}, {"id": 2, "qty": 0}, {"id": 3, "qty": 5}]
print("all valid:", all(o["qty"] > 0 for o in orders))
bad = next((o["id"] for o in orders if o["qty"] <= 0), None)
print("first bad id:", bad)
ranked = sorted(orders, key=lambda o: o["qty"], reverse=True)
print([o["id"] for o in ranked])

# OUTPUT:
# all valid: False
# first bad id: 2
# [3, 1, 2]`],
        [`<b>Advantages:</b> short-circuiting saves work on big or lazy inputs; <code>sorted</code> is stable and accepts any iterable and a <code>key</code> function.`,
            r`# Advantage: short-circuit - stops at the first True
def check(x):
    print("checking", x)
    return x > 1

print(any(check(x) for x in [1, 2, 3, 4]))

# OUTPUT:
# checking 1
# checking 2
# True`],
        [`<b>Disadvantages:</b> <code>all([])</code> being True surprises people; passing a list instead of a generator evaluates every item first; <code>sorted</code> always builds a full new list.`,
            r`# Disadvantage: a list comprehension defeats short-circuiting
def check(x):
    print("checking", x)
    return x > 1

print(any([check(x) for x in [1, 2, 3]]))    # checks ALL three first
print(all([]))                               # vacuous truth

# OUTPUT:
# checking 1
# checking 2
# checking 3
# True
# True`],
        [`<b>Limitations:</b> <code>sorted</code> needs comparable items (mixed types raise TypeError) and is O(n log n); <code>any</code>/<code>all</code> test truthiness, so 0 and "" count as False.`,
            r`print(any([0, "", None]), all([1, "x", 0]))
try:
    sorted([2, "a"])
except TypeError as e:
    print("TypeError:", e)

# OUTPUT:
# False False
# TypeError: '<' not supported between instances of 'str' and 'int'`],
        `
   any( [F, F, T, ...] ) ──► stops at first T   ──► True
   all( [T, T, F, ...] ) ──► stops at first F   ──► False

   sorted(data, key=f)
      data ─► compute f(item) once per item ─► stable sort ─► NEW list
`,
        `Feed <code>any</code>/<code>all</code> a generator, not a list, to keep the short-circuit. For top-N use <code>heapq.nsmallest/nlargest</code>; for repeated sorted insertion use <code>bisect</code>; for huge data sort in the database or with NumPy/pandas rather than Python objects.`
    ),
};
