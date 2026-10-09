// Module 5 (Comprehensions): list, conditional, dict, set and nested comprehensions.
import { dd, r, type DeepDive } from './deepDive';

export const m05a: Record<string, DeepDive> = {
    'List Comprehensions': dd(
        [`A <b>list comprehension</b> builds a new list from an iterable in one expression: <code>[expression for item in iterable]</code>. It is the compact, idiomatic replacement for the "create empty list, loop, append" pattern.`,
            r`nums = [1, 2, 3, 4, 5]
squares = [n * n for n in nums]            # transform every item
print(squares)

# The equivalent loop:
squares2 = []
for n in nums:
    squares2.append(n * n)
print(squares == squares2)
print([ch.upper() for ch in "abc"])

# OUTPUT:
# [1, 4, 9, 16, 25]
# True
# ['A', 'B', 'C']`],
        [`Transforming every item of a collection is the most common data operation. Comprehensions say "what the result looks like" in one line, run faster than an append loop, and do not leave a half-built list or a leaked loop variable behind.`,
            r`prices = [100, 250, 40]
with_tax = [round(p * 1.18, 2) for p in prices]
print(with_tax)
names = ["  asha ", "RAVI", " Meena"]
print([n.strip().title() for n in names])

# OUTPUT:
# [118.0, 295.0, 47.2]
# ['Asha', 'Ravi', 'Meena']`],
        [`Cleaning rows, extracting a column, converting types, building URLs or SQL parameter lists, and flattening results are comprehension jobs in almost every Python codebase.`,
            r`# Real-time: parse lines of "name,score" into records
lines = ["asha,90", "ravi,75", "meena,82"]
records = [(n, int(s)) for n, s in (line.split(",") for line in lines)]
print(records)
scores = [s for _, s in records]
print(scores, sum(scores) / len(scores))

# OUTPUT:
# [('asha', 90), ('ravi', 75), ('meena', 82)]
# [90, 75, 82] 82.33333333333333`],
        [`<b>Advantages:</b> concise and declarative, usually faster than <code>append</code> in a loop, and the loop variable stays local to the comprehension.`,
            r`import timeit
loop = """
out = []
for i in range(1000):
    out.append(i * 2)
"""
comp = "out = [i * 2 for i in range(1000)]"
print("comprehension faster:", timeit.timeit(comp, number=2000) < timeit.timeit(loop, number=2000))
x = 99
_ = [x for x in range(3)]
print("x is still", x)             # no leak (Python 3)

# OUTPUT (typical):
# comprehension faster: True
# x is still 99`],
        [`<b>Disadvantages:</b> long or multi-step comprehensions are hard to read, they build the whole list in memory, and they are poor for side effects.`,
            r`# Disadvantage: the whole list is built even if you only need one item
import sys
big = [i for i in range(1_000_000)]
lazy = (i for i in range(1_000_000))       # generator expression
print(sys.getsizeof(big) > 1_000_000, sys.getsizeof(lazy) < 300)
print(next(lazy))

# OUTPUT:
# True True
# 0`],
        [`<b>Limitations:</b> one expression only (no statements, no <code>try/except</code>, no <code>break</code>); you cannot stop early; and walrus-assigned names behave in a special way.`,
            r`# Limitation: cannot handle an exception inside; use a helper function
def to_int(s):
    try:
        return int(s)
    except ValueError:
        return None

print([to_int(s) for s in ["1", "x", "3"]])
# [int(s) for s in ["1", "x"]] would raise ValueError for the whole list

# OUTPUT:
# [1, None, 3]`],
        `
   [  n * n     for n in nums     ]
      │          │      │
      │          │      └── source iterable
      │          └── loop variable
      └── expression: becomes ONE item of the new list

   nums = [1, 2, 3]  ─► apply to each ─►  [1, 4, 9]
`,
        `Use comprehensions for simple one-pass transformations; switch to a generator expression when the result is consumed once (<code>sum</code>, <code>any</code>, <code>join</code>), and to a named function or loop as soon as there is error handling, branching logic or side effects. Readability wins over cleverness.`
    ),

    'Conditional Comprehensions': dd(
        [`A comprehension can <b>filter</b> with a trailing <code>if</code> (<code>[x for x in it if cond]</code>) or <b>choose a value</b> with a conditional expression in front (<code>[a if cond else b for x in it]</code>). The position of the <code>if</code> is the key difference.`,
            r`nums = range(1, 11)
evens = [n for n in nums if n % 2 == 0]                  # filter: drops items
labels = ["even" if n % 2 == 0 else "odd" for n in nums] # choose: keeps all
print(evens)
print(labels[:4])
print([n for n in nums if n % 2 == 0 if n > 4])          # two ifs = and

# OUTPUT:
# [2, 4, 6, 8, 10]
# ['odd', 'even', 'odd', 'even']
# [6, 8, 10]`],
        [`Real data is messy: you need only valid rows, or you need to replace bad values rather than drop them. Both are one-liners here, but they must not be confused.`,
            r`temps = [22, -999, 25, -999, 30]            # -999 means sensor error
valid = [t for t in temps if t != -999]          # drop errors
fixed = [t if t != -999 else 0 for t in temps]   # replace errors
print(valid)
print(fixed)

# OUTPUT:
# [22, 25, 30]
# [22, 0, 25, 0, 30]`],
        [`Filtering log lines, removing nulls, keeping active users, clamping outliers, and building classification labels for reports.`,
            r`# Real-time: filter and transform in one pass
logs = ["INFO ok", "ERROR disk", "INFO ok", "ERROR net"]
errors = [line.split()[1] for line in logs if line.startswith("ERROR")]
print(errors)
scores = [45, 82, 67, 91]
print(["pass" if s >= 50 else "fail" for s in scores])

# OUTPUT:
# ['disk', 'net']
# ['fail', 'pass', 'pass', 'pass']`],
        [`<b>Advantages:</b> filter and map in a single readable pass; avoids temporary lists; multiple <code>if</code> clauses combine like <code>and</code>.`,
            r`# Advantage: filter + transform + compute once with the walrus operator
data = ["3", "x", "7", "", "10"]
nums = [n for s in data if s.isdigit() and (n := int(s)) > 5]
print(nums)

# OUTPUT:
# [7, 10]`],
        [`<b>Disadvantages:</b> mixing a filter and a ternary in one comprehension gets confusing, and a misplaced <code>if</code> is a SyntaxError or a logic bug.`,
            r`# Disadvantage: 'if' with 'else' is a conditional EXPRESSION, so it goes in front
try:
    compile("[x for x in range(5) if x > 2 else 0]", "d", "exec")
except SyntaxError:
    print("SyntaxError: else cannot follow a filter if")
print([x if x > 2 else 0 for x in range(5)])    # correct form

# OUTPUT:
# SyntaxError: else cannot follow a filter if
# [0, 0, 0, 3, 4]`],
        [`<b>Limitations:</b> no <code>elif</code> (nest conditional expressions or call a function), and expensive conditions run once per item without caching.`,
            r`# Limitation: multi-way logic needs nesting or a helper
def grade(m):
    return "A" if m >= 90 else "B" if m >= 75 else "C"   # nested ternary

print([grade(m) for m in [95, 80, 60]])

# OUTPUT:
# ['A', 'B', 'C']`],
        `
   [ VALUE_IF_TRUE  if COND else VALUE_IF_FALSE   for x in data ]
        │ choose a value, every item kept
   [ x   for x in data   if COND ]
        │ keep only items where COND is True

   data ──► if COND? ──No──► skipped
                  │Yes
                  ▼
              expression ──► result list
`,
        `Keep conditional comprehensions to one condition and one transformation. When the rule has several branches or reusable meaning, name it: <code>[grade(m) for m in marks if is_valid(m)]</code>. That keeps the comprehension a pipeline and puts the logic where tests can reach it.`
    ),

    'Dictionary Comprehensions': dd(
        [`A <b>dict comprehension</b> builds a dictionary with <code>{key_expr: value_expr for item in iterable if cond}</code>. If two items produce the same key the later one wins.`,
            r`names = ["asha", "ravi", "meena"]
lengths = {n: len(n) for n in names}
print(lengths)
squares = {n: n * n for n in range(1, 5) if n != 3}
print(squares)
print({v: k for k, v in lengths.items()})      # invert a dict

# OUTPUT:
# {'asha': 4, 'ravi': 4, 'meena': 5}
# {1: 1, 2: 4, 4: 16}
# {4: 'ravi', 5: 'meena'}`],
        [`Lookups need dictionaries; raw data arrives as lists or pairs. A dict comprehension builds an index, a mapping or an inverted table in one readable line.`,
            r`# Build an index so lookups are O(1) instead of a list scan
users = [{"id": 7, "name": "Asha"}, {"id": 9, "name": "Ravi"}]
by_id = {u["id"]: u for u in users}
print(by_id[9]["name"])

# OUTPUT:
# Ravi`],
        [`Indexing records by id, filtering configuration, converting types of values, inverting mappings, and counting occurrences.`,
            r`# Real-time: filter and convert environment-style settings
env = {"PORT": "8080", "DEBUG": "true", "TIMEOUT": "30", "NAME": "api"}
numeric = {k.lower(): int(v) for k, v in env.items() if v.isdigit()}
print(numeric)
prices = {"pen": 10, "book": 250, "bag": 700}
print({k: round(v * 0.9, 1) for k, v in prices.items()})   # 10% off

# OUTPUT:
# {'port': 8080, 'timeout': 30}
# {'pen': 9.0, 'book': 225.0, 'bag': 630.0}`],
        [`<b>Advantages:</b> one-line build, filter and transform; <code>zip</code> turns two lists into a dict; the result is a plain, ordered dict.`,
            r`keys = ["a", "b", "c"]
vals = [1, 2, 3]
print({k: v for k, v in zip(keys, vals)})
print(dict(zip(keys, vals)))               # same, when no transform is needed
text = "hello"
print({ch: text.count(ch) for ch in text})  # duplicates collapse

# OUTPUT:
# {'a': 1, 'b': 2, 'c': 3}
# {'a': 1, 'b': 2, 'c': 3}
# {'h': 1, 'e': 1, 'l': 2, 'o': 1}`],
        [`<b>Disadvantages:</b> duplicate keys silently overwrite earlier ones, so data can be lost; complex ones are hard to read.`,
            r`# Disadvantage: inverting a dict with duplicate values loses entries
grades = {"asha": "A", "ravi": "B", "meena": "A"}
inverted = {g: n for n, g in grades.items()}
print(inverted)                            # 'asha' was overwritten by 'meena'

# OUTPUT:
# {'A': 'meena', 'B': 'ravi'}`],
        [`<b>Limitations:</b> keys must be hashable; you cannot group several values under one key without a helper (use <code>defaultdict</code>); order of evaluation is key before value.`,
            r`# Limitation: unhashable key
try:
    {[1, 2]: "x" for _ in range(1)}
except TypeError as e:
    print("TypeError:", e)

# Grouping needs defaultdict, not a comprehension
from collections import defaultdict
grades = {"asha": "A", "ravi": "B", "meena": "A"}
groups = defaultdict(list)
for n, g in grades.items():
    groups[g].append(n)
print(dict(groups))

# OUTPUT:
# TypeError: unhashable type: 'list'
# {'A': ['asha', 'meena'], 'B': ['ravi']}`],
        `
   {  k.lower()  :  int(v)   for k, v in env.items()   if v.isdigit() }
      └─ key ──┘   └ value ┘  └──────── source ───────┘ └── filter ──┘

   env.items() ─► (k, v) ─► if ok ─► key: value ─► new dict
`,
        `Great for indexes and lookup tables built once. Watch for key collisions (assert uniqueness when it matters), and for grouping or counting use <code>defaultdict</code> or <code>Counter</code>. Do not build giant dicts only to read one key: that wastes memory.`
    ),

    'Set Comprehensions': dd(
        [`A <b>set comprehension</b> uses braces without a colon: <code>{expression for item in iterable if cond}</code>. It builds a set of unique values; duplicates are removed automatically and the order is not defined.`,
            r`words = ["apple", "Apple", "BANANA", "banana", "cherry"]
unique_lower = {w.lower() for w in words}
print(sorted(unique_lower))
print(sorted({n % 3 for n in range(10)}))
print(type({x for x in []}).__name__, type({}).__name__)

# OUTPUT:
# ['apple', 'banana', 'cherry']
# [0, 1, 2]
# set dict`],
        [`When you only care about which distinct values exist (not how often or in what order), a set comprehension removes duplicates and normalises values in one pass, and makes later membership tests O(1).`,
            r`emails = ["A@x.com", "a@x.com", "b@x.com"]
normalised = {e.lower() for e in emails}
print(len(emails), "->", len(normalised))
print("b@x.com" in normalised)

# OUTPUT:
# 3 -> 2
# True`],
        [`Collecting distinct file extensions, unique visitor ids, distinct tags, visited coordinates, and building fast lookup sets for validation.`,
            r`# Real-time: distinct file extensions in a folder listing
files = ["a.py", "b.txt", "c.py", "d.md", "e.TXT"]
exts = {f.rsplit(".", 1)[1].lower() for f in files}
print(sorted(exts))
ALLOWED = {code for code in range(200, 300)}      # fast status check
print(204 in ALLOWED, 404 in ALLOWED)

# OUTPUT:
# ['md', 'py', 'txt']
# True False`],
        [`<b>Advantages:</b> de-duplicates while transforming; the result supports set algebra and fast membership.`,
            r`# Advantage: combine with set operators
a = {x for x in range(1, 8) if x % 2}       # odds
b = {x for x in range(1, 8) if x % 3 == 0}  # multiples of 3
print(sorted(a), sorted(b), sorted(a & b))

# OUTPUT:
# [1, 3, 5, 7] [3, 6] [3]`],
        [`<b>Disadvantages:</b> the order is lost, counts are lost, and an empty <code>{}</code> is a dict, which confuses beginners.`,
            r`vals = [3, 1, 3, 2, 3]
s = {v for v in vals}
print(len(vals), len(s))                    # occurrences are lost
print(type({}), type(set()))

# OUTPUT:
# 5 3
# <class 'dict'> <class 'set'>`],
        [`<b>Limitations:</b> items must be hashable; a set cannot hold lists, so convert them to tuples; no indexing or slicing.`,
            r`rows = [[1, 2], [1, 2], [3, 4]]
try:
    {r_ for r_ in rows}
except TypeError as e:
    print("TypeError:", e)
print({tuple(r_) for r_ in rows} == {(1, 2), (3, 4)})   # tuples are hashable

# OUTPUT:
# TypeError: unhashable type: 'list'
# True`],
        `
   data  = [3, 1, 3, 2, 3]
              │  { x for x in data }
              ▼
   hash each ─► bucket ─► duplicate? skip
              ▼
   {1, 2, 3}      unique, unordered, O(1) membership
`,
        `Choose a set comprehension for "distinct values" and lookup tables. If you must keep first-seen order use <code>dict.fromkeys</code>; if counts matter use <code>Counter</code>. Beware sets of mutable or float values (NaN) where equality is subtle.`
    ),

    'Nested Comprehensions': dd(
        [`<b>Nested comprehensions</b> either contain several <code>for</code> clauses in one comprehension (read left to right, like nested loops) or build a list of lists by putting a comprehension inside another.`,
            r`# Two for-clauses: same order as nested loops
pairs = [(x, y) for x in range(3) for y in range(2)]
print(pairs)

# Comprehension inside a comprehension: a 3x3 multiplication table
table = [[r_ * c for c in range(1, 4)] for r_ in range(1, 4)]
print(table)

# Flatten a matrix
flat = [v for row in table for v in row]
print(flat)

# OUTPUT:
# [(0, 0), (0, 1), (1, 0), (1, 1), (2, 0), (2, 1)]
# [[1, 2, 3], [2, 4, 6], [3, 6, 9]]
# [1, 2, 3, 2, 4, 6, 3, 6, 9]`],
        [`Two-dimensional data (matrices, grids, tables of rows) is everywhere. Nested comprehensions create, transform, flatten and transpose them without index juggling or temporary variables.`,
            r`matrix = [[1, 2, 3],
          [4, 5, 6]]
transposed = [[row[i] for row in matrix] for i in range(3)]
print(transposed)
doubled = [[v * 2 for v in row] for row in matrix]
print(doubled)

# OUTPUT:
# [[1, 4], [2, 5], [3, 6]]
# [[2, 4, 6], [8, 10, 12]]`],
        [`Image and board processing, flattening JSON arrays, generating test-data combinations, and building grids for games and simulations.`,
            r`# Real-time: a tic-tac-toe board and its winning column check
board = [["X", "O", "X"],
         ["O", "X", "O"],
         ["X", "O", "O"]]
empty = [["." for _ in range(3)] for _ in range(3)]
print(["".join(row) for row in board])
print(empty[0])
col0 = [row[0] for row in board]
print(col0, all(c == "X" for c in col0))

# OUTPUT:
# ['XOX', 'OXO', 'XOO']
# ['.', '.', '.']
# ['X', 'O', 'X'] False`],
        [`<b>Advantages:</b> compact for matrices and cartesian products; building each inner list in a comprehension avoids the shared-row bug of <code>[[0]*3]*3</code>.`,
            r`bad = [[0] * 3] * 2                          # same row object twice
good = [[0] * 3 for _ in range(2)]            # independent rows
bad[0][0] = 1
good[0][0] = 1
print(bad)
print(good)

# OUTPUT:
# [[1, 0, 0], [1, 0, 0]]
# [[1, 0, 0], [0, 0, 0]]`],
        [`<b>Disadvantages:</b> readability drops sharply beyond two levels, and the double-<code>for</code> order is a common source of mistakes.`,
            r`# Disadvantage: which order? The clauses read like nested loops
nested = [[1, 2], [3, 4]]
right = [v for row in nested for v in row]      # outer loop first
print(right)
try:
    wrong = [v for v in row for row in nested]   # 'row' used before defined
except NameError as e:
    print("NameError:", e)

# OUTPUT:
# [1, 2, 3, 4]
# NameError: name 'row' is not defined`],
        [`<b>Limitations:</b> work grows as outer x inner (can be huge, such as 1000 x 1000 = one million items), the full result is held in memory, and you cannot break out of the loops.`,
            r`# Limitation: size explodes with nesting
combos = [(a, b, c) for a in range(50) for b in range(50) for c in range(50)]
print(len(combos))
# Use a generator expression or itertools.product to avoid holding them all
total = sum(1 for a in range(50) for b in range(50) for c in range(50))
print(total)

# OUTPUT:
# 125000
# 125000`],
        `
   [ (x, y)  for x in range(3)  for y in range(2) ]
                 └─ outer loop ─┘ └─ inner loop ─┘

   equals:   for x in range(3):
                 for y in range(2):
                     result.append((x, y))

   [[r*c for c in cols] for r in rows]  ──►  list of lists (rows)
`,
        `Limit nesting to two levels and favour clarity: three <code>for</code> clauses should become a loop, a generator function or <code>itertools.product</code>. For numeric matrices use NumPy; for lazy pipelines use generator expressions so intermediate lists never exist.`
    ),
};
