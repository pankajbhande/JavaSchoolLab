import type { Topic } from '../../types';

export const setOperations: Topic = {
    id: 'python-collections-set-operations',
    name: 'Set Operations',
    beginner: [
        {
            content: `<h4>Mathematical Set Operations</h4>
Sets support the operations from school Venn diagrams, each available as an <b>operator</b> and as a <b>method</b>.
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Operation</th><th>Operator</th><th>Method</th><th>Result contains</th></tr>
<tr class='text-center'><td>Union</td><td><code>a | b</code></td><td><code>a.union(b)</code></td><td>Items in a <b>or</b> b</td></tr>
<tr class='text-center'><td>Intersection</td><td><code>a &amp; b</code></td><td><code>a.intersection(b)</code></td><td>Items in <b>both</b></td></tr>
<tr class='text-center'><td>Difference</td><td><code>a - b</code></td><td><code>a.difference(b)</code></td><td>Items in a but <b>not</b> in b</td></tr>
<tr class='text-center'><td>Symmetric difference</td><td><code>a ^ b</code></td><td><code>a.symmetric_difference(b)</code></td><td>Items in <b>exactly one</b> of them</td></tr>
</table>`
        },
        {
            content: `<h4>Seeing Them in Action</h4>`,
            codeExamples: [
                `a = {1, 2, 3, 4}
b = {3, 4, 5, 6}

print("union:       ", a | b)
print("intersection:", a & b)
print("a - b:       ", a - b)
print("b - a:       ", b - a)
print("symmetric:   ", a ^ b)

# OUTPUT:
# union:        {1, 2, 3, 4, 5, 6}
# intersection: {3, 4}
# a - b:        {1, 2}
# b - a:        {5, 6}
# symmetric:    {1, 2, 5, 6}`
            ]
        },
        {
            content: `<h4>A Real Example: Course Enrolment</h4>
<code>sorted()</code> is used so the output order is always the same.`,
            codeExamples: [
                `python_course = {"Abaji", "Raoji", "Moropant", "Kanhoji"}
java_course = {"Raoji", "Kanhoji", "Sheru"}

print("Both courses: ", sorted(python_course & java_course))
print("Python only:  ", sorted(python_course - java_course))
print("Everyone:     ", sorted(python_course | java_course))
print("Exactly one:  ", sorted(python_course ^ java_course))

# OUTPUT:
# Both courses:  ['Kanhoji', 'Raoji']
# Python only:   ['Abaji', 'Moropant']
# Everyone:      ['Abaji', 'Kanhoji', 'Moropant', 'Raoji', 'Sheru']
# Exactly one:   ['Abaji', 'Moropant', 'Sheru']`
            ]
        },
        {
            content: `<h4>Subsets, Supersets and Disjoint Sets</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Test</th><th>Operator</th><th>Method</th></tr>
<tr class='text-center'><td>Every item of a is in b</td><td><code>a &lt;= b</code></td><td><code>a.issubset(b)</code></td></tr>
<tr class='text-center'><td>Proper subset (subset and not equal)</td><td><code>a &lt; b</code></td><td>-</td></tr>
<tr class='text-center'><td>a contains every item of b</td><td><code>a &gt;= b</code></td><td><code>a.issuperset(b)</code></td></tr>
<tr class='text-center'><td>No items in common</td><td>-</td><td><code>a.isdisjoint(b)</code></td></tr>
</table>`,
            codeExamples: [
                `required = {"python", "sql"}
skills = {"python", "sql", "git"}

print(required <= skills)            # has all required skills?
print(required < skills, skills < skills)
print(skills >= {"git"})
print({"java"}.isdisjoint(skills))

# OUTPUT:
# True
# True False
# True
# True`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Operators Need Sets, Methods Accept Any Iterable</h3>
The operator forms require both sides to be sets (or frozensets). The method forms accept any iterable and even several at once.`,
            codeExamples: [
                `a = {1, 2}
print(a.union([3, 4], (5,)))
print(a.intersection(range(2, 10)))
print(a | [3])

# OUTPUT:
# {1, 2, 3, 4, 5}
# {2}
# TypeError: unsupported operand type(s) for |: 'set' and 'list'`
            ]
        },
        {
            content: `<h3>In-Place Updates</h3>
Each operation has an in-place version that modifies the left set instead of creating a new one.`,
            codeExamples: [
                `s = {1, 2, 3}
s |= {4}            # s.update({4})
s &= {1, 2, 4, 9}   # s.intersection_update(...)
s -= {1}            # s.difference_update(...)
s ^= {2, 7}         # s.symmetric_difference_update(...)
print(s)

# OUTPUT:
# {4, 7}`
            ]
        },
        {
            content: `<h3>Combining Many Sets</h3>
Unpack a list of sets into the method call.`,
            codeExamples: [
                `attendance = [
    {"abaji", "raoji", "moropant"},       # Monday
    {"abaji", "moropant", "kanhoji"},      # Tuesday
    {"moropant", "abaji", "sheru"},      # Wednesday
]

every_day = set.intersection(*attendance)
any_day = set.union(*attendance)
print(sorted(every_day))
print(len(any_day))

# OUTPUT:
# ['abaji', 'moropant']
# 5`
            ]
        },
        {
            content: `<h3>Set Operations on Dictionary Keys</h3>
<code>dict.keys()</code> and <code>dict.items()</code> views behave like sets, so you can compare dictionaries without converting them.`,
            codeExamples: [
                `old_prices = {"pen": 10, "book": 250, "bag": 900}
new_prices = {"pen": 12, "book": 250, "lamp": 450}

print("Added:   ", sorted(new_prices.keys() - old_prices.keys()))
print("Removed: ", sorted(old_prices.keys() - new_prices.keys()))
print("Changed: ", sorted(k for k in old_prices.keys() & new_prices.keys()
                          if old_prices[k] != new_prices[k]))
print("Same:    ", old_prices.items() & new_prices.items())

# OUTPUT:
# Added:    ['lamp']
# Removed:  ['bag']
# Changed:  ['pen']
# Same:     {('book', 250)}`
            ]
        },
        {
            content: `<h3>Complexity</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Operation</th><th>Average time</th></tr>
<tr class='text-center'><td><code>a | b</code></td><td>O(len(a) + len(b))</td></tr>
<tr class='text-center'><td><code>a &amp; b</code></td><td>O(min(len(a), len(b)))</td></tr>
<tr class='text-center'><td><code>a - b</code></td><td>O(len(a))</td></tr>
<tr class='text-center'><td><code>a ^ b</code></td><td>O(len(a) + len(b))</td></tr>
<tr class='text-center'><td><code>a &lt;= b</code></td><td>O(len(a))</td></tr>
</table>
Compare with nested loops over two lists, which take O(len(a) × len(b)) to find common items.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>How do you find common elements of two lists?</td><td><code>set(a) &amp; set(b)</code> - O(n + m) instead of O(n × m)</td></tr>
<tr class='text-center'><td>What is the symmetric difference?</td><td>Items in exactly one of the two sets: <code>a ^ b</code></td></tr>
<tr class='text-center'><td><code>a.union(b)</code> vs <code>a | b</code>?</td><td>Same result; the method accepts any iterable(s), the operator requires sets</td></tr>
<tr class='text-center'><td>Subset vs proper subset?</td><td><code>a &lt;= b</code> allows equality; <code>a &lt; b</code> requires b to have extra items</td></tr>
<tr class='text-center'><td>How do you find keys present in two dicts?</td><td><code>d1.keys() &amp; d2.keys()</code></td></tr>
</table>`
        }
    ]
};
