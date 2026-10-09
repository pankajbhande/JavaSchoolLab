import type { Topic } from '../../types';

export const nestedComprehensions: Topic = {
    id: 'python-comprehensions-nested-comprehensions',
    name: 'Nested Comprehensions',
    beginner: [
        {
            content: `<h4>Two Kinds of "Nested"</h4>
A comprehension can be nested in two different ways, and they produce different shapes:<br><br>
• <b>Several <code>for</code> clauses in one comprehension</b> - produces a <b>flat</b> list, like two nested loops appending to one list.<br>
• <b>A comprehension inside another comprehension</b> - produces a <b>list of lists</b>, like an outer loop that builds a new inner list on every pass.`,
            codeExamples: [
                `flat = [(r, c) for r in range(2) for c in range(3)]
grid = [[(r, c) for c in range(3)] for r in range(2)]

print(len(flat), flat)
print(len(grid), grid)

# OUTPUT:
# 6 [(0, 0), (0, 1), (0, 2), (1, 0), (1, 1), (1, 2)]
# 2 [[(0, 0), (0, 1), (0, 2)], [(1, 0), (1, 1), (1, 2)]]`
            ]
        },
        {
            content: `<h4>Multiple for Clauses: Flattening</h4>
The <code>for</code> clauses are written in the <b>same order</b> as the equivalent nested loops - outer loop first. Read it as: "for each row in matrix, for each n in row, keep n".`,
            codeExamples: [
                `matrix = [[1, 2, 3], [4, 5], [6]]

# Loop version
flat = []
for row in matrix:
    for n in row:
        flat.append(n)
print(flat)

# Comprehension version - same order of for clauses
flat = [n for row in matrix for n in row]
print(flat)

# OUTPUT:
# [1, 2, 3, 4, 5, 6]
# [1, 2, 3, 4, 5, 6]`
            ]
        },
        {
            content: `<h4>Multiple for Clauses: All Combinations</h4>
Two <code>for</code> clauses over different lists give every combination (the <b>Cartesian product</b>). The <b>last</b> clause changes fastest, just like the inner loop.`,
            codeExamples: [
                `colours = ["red", "blue"]
sizes = ["S", "M"]

variants = [(colour, size) for colour in colours for size in sizes]
print(variants)

labels = [f"{colour}-{size}" for colour in colours for size in sizes]
print(labels)

# OUTPUT:
# [('red', 'S'), ('red', 'M'), ('blue', 'S'), ('blue', 'M')]
# ['red-S', 'red-M', 'blue-S', 'blue-M']`
            ]
        },
        {
            content: `<h4>A Comprehension Inside a Comprehension: Grids</h4>
The <b>outer</b> comprehension makes the rows; the <b>inner</b> one builds each row. This is the correct way to create a 2D grid - <code>[[0] * 3] * 3</code> would repeat <b>one</b> row object three times, so changing one cell would change every row.`,
            codeExamples: [
                `grid = [[0 for c in range(3)] for r in range(2)]
grid[0][0] = 9
print(grid)                       # only one cell changed

numbers = [[r * 3 + c for c in range(3)] for r in range(3)]
print(numbers)

table = [[i * j for j in range(1, 4)] for i in range(1, 4)]
for row in table:
    print(row)

# OUTPUT:
# [[9, 0, 0], [0, 0, 0]]
# [[0, 1, 2], [3, 4, 5], [6, 7, 8]]
# [1, 2, 3]
# [2, 4, 6]
# [3, 6, 9]`
            ]
        },
        {
            content: `<h4>Filtering in Nested Comprehensions</h4>
An <code>if</code> can follow any <code>for</code> clause, and a later clause can use variables from earlier ones.`,
            codeExamples: [
                `# Each pair once, no element paired with itself (i < j)
pairs = [(i, j) for i in range(4) for j in range(i + 1, 4)]
print(pairs)

# Grid coordinates off the diagonal
off_diagonal = [(x, y) for x in range(3) for y in range(3) if x != y]
print(off_diagonal)

# Keep only even numbers inside each row, and skip empty rows
data = [[1, 2, 3, 4], [], [5, 6]]
evens = [[n for n in row if n % 2 == 0] for row in data if row]
print(evens)

# OUTPUT:
# [(0, 1), (0, 2), (0, 3), (1, 2), (1, 3), (2, 3)]
# [(0, 1), (0, 2), (1, 0), (1, 2), (2, 0), (2, 1)]
# [[2, 4], [6]]`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Transposing a Matrix</h3>
Turning rows into columns is the classic nested comprehension. <code>zip(*m)</code> does the same job: <code>*m</code> passes each row as a separate argument, and <code>zip</code> groups the first items, then the second items, and so on - as tuples.`,
            codeExamples: [
                `m = [[1, 2, 3],
     [4, 5, 6]]

cols = len(m[0])
t1 = [[row[i] for row in m] for i in range(cols)]
print(t1)

t2 = [list(col) for col in zip(*m)]
print(t2)
print(list(zip(*m)))              # tuples, if that is fine

# OUTPUT:
# [[1, 4], [2, 5], [3, 6]]
# [[1, 4], [2, 5], [3, 6]]
# [(1, 4), (2, 5), (3, 6)]`
            ]
        },
        {
            content: `<h3>Flattening: One Level vs Any Depth</h3>
<code>[x for sub in data for x in sub]</code> removes exactly <b>one</b> level of nesting, and every item must itself be iterable. <code>itertools.chain.from_iterable</code> does the same lazily. For irregular or deeper nesting there is no fixed number of <code>for</code> clauses that works - use recursion.`,
            codeExamples: [
                `from itertools import chain

data = [[1, 2], [3], [4, 5]]
print(list(chain.from_iterable(data)))

def flatten(items):
    result = []
    for item in items:
        if isinstance(item, list):
            result.extend(flatten(item))
        else:
            result.append(item)
    return result

print(flatten([1, [2, [3, [4]]], 5]))

# OUTPUT:
# [1, 2, 3, 4, 5]
# [1, 2, 3, 4, 5]`
            ]
        },
        {
            content: `<h3>itertools.product: The Readable Alternative</h3>
<code>product(a, b)</code> yields every combination, exactly like <code>for x in a for y in b</code>, but it says what it means and scales to many inputs without stacking clauses. <code>repeat=n</code> combines an iterable with itself n times.`,
            codeExamples: [
                `from itertools import product

print(list(product("ab", [1, 2])))
print([x + y for x, y in product([10, 20], [1, 2])])

bits = ["".join(p) for p in product("01", repeat=3)]
print(len(bits), bits)

# OUTPUT:
# [('a', 1), ('a', 2), ('b', 1), ('b', 2)]
# [11, 12, 21, 22]
# 8 ['000', '001', '010', '011', '100', '101', '110', '111']`
            ]
        },
        {
            content: `<h3>Know When to Stop</h3>
A comprehension should read in one breath. A good rule of thumb: <b>more than two <code>for</code> clauses, or nesting combined with several conditions, belongs in ordinary loops or a helper function</b>.`,
            codeExamples: [
                `orders = [
    {"customer": "Asha", "items": [{"sku": "PEN", "qty": 2}, {"sku": "BAG", "qty": 0}]},
    {"customer": "Ravi", "items": [{"sku": "INK", "qty": 1}]},
]

# Hard to read
lines = [f"{o['customer']}:{i['sku']}" for o in orders for i in o["items"] if i["qty"] > 0]

# Clearer: name the inner step
def shipped_items(order):
    return [item for item in order["items"] if item["qty"] > 0]

lines = [f"{o['customer']}:{i['sku']}" for o in orders for i in shipped_items(o)]
print(lines)

# OUTPUT:
# ['Asha:PEN', 'Ravi:INK']`
            ]
        },
        {
            content: `<h3>Scope Gotcha in Class Bodies</h3>
A comprehension has its own scope. The <b>first</b> iterable (the one after the first <code>in</code>) is evaluated in the surrounding scope; everything else runs inside the comprehension. Functions can see their enclosing variables, but a <b>class body is not an enclosing scope</b> - so class attributes are visible only in that first iterable.`,
            codeExamples: [
                `class Board:
    size = 3
    row_ids = [r for r in range(size)]            # fine - first iterable
    cells = [[0] * size for _ in range(size)]     # size used inside the body

# OUTPUT:
# NameError: name 'size' is not defined`,
                `SIZE = 3

class Board:
    cells = [[0] * SIZE for _ in range(SIZE)]     # module-level name: visible

print(Board.cells)

# OUTPUT:
# [[0, 0, 0], [0, 0, 0], [0, 0, 0]]`
            ]
        },
        {
            content: `<h3>Complexity</h3>
Nested comprehensions are loops in disguise: two <code>for</code> clauses over n and m items do n × m steps and, for list comprehensions, build a list of that size in memory. A 1,000 × 1,000 product is a million tuples. When you only iterate once, use a <b>generator expression</b> (round brackets) or <code>itertools.product</code> to avoid materialising everything.`,
            codeExamples: [
                `n = 1000
total = sum(i * j for i in range(n) for j in range(n))   # no list is built
print(total)

# OUTPUT:
# 249500250000`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>How do you flatten a list of lists?</td><td><code>[x for sub in data for x in sub]</code> or <code>list(itertools.chain.from_iterable(data))</code></td></tr>
<tr class='text-center'><td>In what order are multiple for clauses written?</td><td>The same order as the equivalent nested loops - outer first</td></tr>
<tr class='text-center'><td>Multiple for clauses vs a nested comprehension?</td><td>Multiple clauses give a flat list; a comprehension inside a comprehension gives a list of lists</td></tr>
<tr class='text-center'><td>How do you transpose a matrix?</td><td><code>[list(col) for col in zip(*m)]</code></td></tr>
<tr class='text-center'><td>Why not <code>[[0] * 3] * 3</code>?</td><td>All rows are the same list object; use <code>[[0] * 3 for _ in range(3)]</code></td></tr>
<tr class='text-center'><td>Why does a comprehension in a class body fail to see a class attribute?</td><td>Class bodies are not enclosing scopes; only the first iterable is evaluated in the class scope</td></tr>
<tr class='text-center'><td>When should you avoid a nested comprehension?</td><td>When it needs more than two for clauses or several conditions - use loops or helper functions</td></tr>
</table>`
        }
    ]
};
