import type { Topic } from '../../types';

export const dictComprehensions: Topic = {
    id: 'python-comprehensions-dictionary-comprehensions',
    name: 'Dictionary Comprehensions',
    beginner: [
        {
            content: `<h4>What is a Dictionary Comprehension?</h4>
A <b>dictionary comprehension</b> builds a new dict in one expression, the same way a list comprehension builds a list. The difference is the <code>key: value</code> pair before the <code>for</code>:<br><br>
<code>{key_expr: value_expr for item in iterable}</code><br><br>
It replaces the pattern "create an empty dict, loop, assign <code>d[key] = value</code>". In Java you would reach for <code>stream().collect(Collectors.toMap(...))</code>.`,
            codeExamples: [
                `names = ["Abaji", "Raoji", "Moropant"]

# Loop version
lengths = {}
for name in names:
    lengths[name] = len(name)
print(lengths)

# Comprehension version - same result
lengths = {name: len(name) for name in names}
print(lengths)

# OUTPUT:
# {'Abaji': 5, 'Raoji': 5, 'Moropant': 8}
# {'Abaji': 5, 'Raoji': 5, 'Moropant': 8}`
            ]
        },
        {
            content: `<h4>Building a Dict from Two Lists</h4>
<code>zip()</code> pairs up keys and values; the comprehension turns each pair into an entry. (<code>dict(zip(keys, values))</code> does the same when you don't need to transform anything.)`,
            codeExamples: [
                `subjects = ["Maths", "Physics", "Chemistry"]
marks = [88, 72, 95]

report = {subject: mark for subject, mark in zip(subjects, marks)}
print(report)

percent = {subject: f"{mark}%" for subject, mark in zip(subjects, marks)}
print(percent)

# OUTPUT:
# {'Maths': 88, 'Physics': 72, 'Chemistry': 95}
# {'Maths': '88%', 'Physics': '72%', 'Chemistry': '95%'}`
            ]
        },
        {
            content: `<h4>Transforming an Existing Dictionary</h4>
Loop over <code>.items()</code> to get each key and value, then change either side.`,
            codeExamples: [
                `prices = {"pen": 10, "book": 250, "bag": 900}

with_gst = {item: round(price * 1.18, 2) for item, price in prices.items()}
print(with_gst)

upper_keys = {item.upper(): price for item, price in prices.items()}
print(upper_keys)

# OUTPUT:
# {'pen': 11.8, 'book': 295.0, 'bag': 1062.0}
# {'PEN': 10, 'BOOK': 250, 'BAG': 900}`
            ]
        },
        {
            content: `<h4>Filtering Entries</h4>
Add an <code>if</code> at the end to keep only some entries.`,
            codeExamples: [
                `marks = {"Abaji": 91, "Raoji": 35, "Moropant": 78, "Kanhoji": 28}

passed = {name: mark for name, mark in marks.items() if mark >= 40}
print(passed)

expensive = {k: v for k, v in {"pen": 10, "bag": 900}.items() if v > 100}
print(expensive)

# OUTPUT:
# {'Abaji': 91, 'Moropant': 78}
# {'bag': 900}`
            ]
        },
        {
            content: `<h4>Inverting a Dictionary</h4>
Swap keys and values to look things up in the other direction.`,
            codeExamples: [
                `country_codes = {"IN": "India", "JP": "Japan", "FR": "France"}

code_for = {country: code for code, country in country_codes.items()}
print(code_for)
print(code_for["Japan"])

# OUTPUT:
# {'India': 'IN', 'Japan': 'JP', 'France': 'FR'}
# JP`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Duplicate Keys: the Last Value Silently Wins</h3>
If the key expression produces the same key twice, the later entry overwrites the earlier one - no error, no warning. Inverting a dict whose values are <b>not unique</b> therefore loses data. Java's <code>Collectors.toMap</code> throws <code>IllegalStateException</code> on a duplicate key; Python does not. When several items share a key, <b>group</b> them into lists instead.`,
            codeExamples: [
                `grades = {"Abaji": "A", "Raoji": "B", "Moropant": "A"}

inverted = {grade: name for name, grade in grades.items()}
print(inverted)                      # Abaji has disappeared!

by_grade = {}
for name, grade in grades.items():
    by_grade.setdefault(grade, []).append(name)
print(by_grade)

# OUTPUT:
# {'A': 'Moropant', 'B': 'Raoji'}
# {'A': ['Abaji', 'Moropant'], 'B': ['Raoji']}`,
                `from collections import defaultdict

grades = {"Abaji": "A", "Raoji": "B", "Moropant": "A"}

by_grade = defaultdict(list)
for name, grade in grades.items():
    by_grade[grade].append(name)
print(dict(by_grade))

# OUTPUT:
# {'A': ['Abaji', 'Moropant'], 'B': ['Raoji']}`
            ]
        },
        {
            content: `<h3>Conditional Values</h3>
An <code>if</code> at the <b>end</b> filters entries out. A conditional expression in the <b>value</b> keeps every entry but chooses its value.`,
            codeExamples: [
                `marks = {"Abaji": 91, "Raoji": 35, "Moropant": 78, "Kanhoji": 28}

result = {name: ("pass" if mark >= 40 else "fail") for name, mark in marks.items()}
print(result)

# OUTPUT:
# {'Abaji': 'pass', 'Raoji': 'fail', 'Moropant': 'pass', 'Kanhoji': 'fail'}`
            ]
        },
        {
            content: `<h3>Nested Dictionary Comprehensions</h3>
The value can itself be a comprehension, producing a dict of dicts - for example a lookup table. Keep nesting to two levels; beyond that, a loop with named steps is easier to read.`,
            codeExamples: [
                `table = {i: {j: i * j for j in range(1, 4)} for i in range(1, 4)}

print(table)
print(table[2][3])

# OUTPUT:
# {1: {1: 1, 2: 2, 3: 3}, 2: {1: 2, 2: 4, 3: 6}, 3: {1: 3, 2: 6, 3: 9}}
# 6`
            ]
        },
        {
            content: `<h3>fromkeys() vs a Comprehension</h3>
<code>dict.fromkeys(keys, value)</code> reuses <b>one</b> value object for every key, which is a trap when the value is mutable (see <i>Dictionary Methods</i>). A comprehension evaluates the value expression once per key, so each key gets its own list.`,
            codeExamples: [
                `shared = dict.fromkeys(["a", "b"], [])
separate = {key: [] for key in ["a", "b"]}

shared["a"].append(1)
separate["a"].append(1)

print(shared)
print(separate)

# OUTPUT:
# {'a': [1], 'b': [1]}
# {'a': [1], 'b': []}`
            ]
        },
        {
            content: `<h3>Counting: Use Counter, Not a Comprehension</h3>
<code>{w: words.count(w) for w in words}</code> works, but it rescans the whole list for every word - O(n²). <code>collections.Counter</code> counts in a single O(n) pass.`,
            codeExamples: [
                `from collections import Counter

words = "to be or not to be".split()

slow = {w: words.count(w) for w in words}      # O(n^2)
print(slow)

fast = Counter(words)                          # O(n)
print(fast)

# OUTPUT:
# {'to': 2, 'be': 2, 'or': 1, 'not': 1}
# Counter({'to': 2, 'be': 2, 'or': 1, 'not': 1})`
            ]
        },
        {
            content: `<h3>Order Follows the Source</h3>
A dict keeps insertion order, and a comprehension inserts keys in the order it iterates. If the source has no reliable order (a set of strings), sort the source first to get a predictable dict. Like all comprehensions, the loop variable does not leak out afterwards.`,
            codeExamples: [
                `squares = {n: n * n for n in [3, 1, 2]}
print(squares)

langs = {"python", "go", "java"}               # set - no reliable order
lengths = {lang: len(lang) for lang in sorted(langs)}
print(lengths)

print("n" in dir())                             # the loop variable didn't leak

# OUTPUT:
# {3: 9, 1: 1, 2: 4}
# {'go': 2, 'java': 4, 'python': 6}
# False`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is the syntax of a dict comprehension?</td><td><code>{key: value for item in iterable if condition}</code></td></tr>
<tr class='text-center'><td>What happens with duplicate keys?</td><td>The last value silently overwrites earlier ones - unlike Java's toMap, which throws</td></tr>
<tr class='text-center'><td>How do you invert a dict whose values repeat?</td><td>Group into lists with setdefault or defaultdict(list) instead of a plain comprehension</td></tr>
<tr class='text-center'><td>Filter vs conditional value?</td><td><code>... if cond</code> at the end drops entries; <code>a if cond else b</code> in the value keeps every entry</td></tr>
<tr class='text-center'><td>Comprehension vs <code>dict.fromkeys</code>?</td><td>fromkeys shares one value object across keys; a comprehension creates a value per key</td></tr>
<tr class='text-center'><td>Best way to count items?</td><td><code>collections.Counter</code> - one pass, instead of calling count() for every item</td></tr>
</table>`
        }
    ]
};
