import type { Topic } from '../../types';

export const dictionaries: Topic = {
    id: 'python-collections-dictionaries',
    name: 'Dictionaries',
    beginner: [
        {
            content: `<h4>What is a Dictionary?</h4>
A <b>dictionary</b> (<code>dict</code>) stores <b>key-value pairs</b>. You look values up by their key instead of by position - like a real dictionary, where you find a definition by its word. It is Python's version of Java's <code>HashMap</code>.<br><br>
• Keys are <b>unique</b> and must be <b>hashable</b> (strings, numbers, tuples).<br>
• Values can be anything, including lists and other dicts.<br>
• Since Python 3.7, dictionaries <b>remember insertion order</b>.`,
            codeExamples: [
                `student = {
    "name": "Pankaj",
    "age": 21,
    "skills": ["Java", "Python"],
}

print(student["name"])
print(student["skills"][1])
print(len(student), type(student))

# OUTPUT:
# Pankaj
# Python
# 3 <class 'dict'>`
            ]
        },
        {
            content: `<h4>Creating Dictionaries</h4>`,
            codeExamples: [
                `empty = {}
d1 = dict(name="Sheru", city="Pune")          # keyword arguments
d2 = dict([("a", 1), ("b", 2)])               # from pairs
d3 = dict(zip(["x", "y"], [10, 20]))          # from two lists
d4 = {n: n * n for n in range(4)}             # comprehension

print(d1)
print(d2, d3)
print(d4)

# OUTPUT:
# {'name': 'Sheru', 'city': 'Pune'}
# {'a': 1, 'b': 2} {'x': 10, 'y': 20}
# {0: 0, 1: 1, 2: 4, 3: 9}`
            ]
        },
        {
            content: `<h4>Reading Values Safely</h4>
<code>d[key]</code> raises <code>KeyError</code> if the key is missing. <code>d.get(key, default)</code> returns a default instead. Use <code>in</code> to check whether a key exists.`,
            codeExamples: [
                `stock = {"pen": 10, "book": 4}

print(stock.get("pen"))
print(stock.get("pencil"))          # None
print(stock.get("pencil", 0))       # default
print("book" in stock, "pencil" in stock)
print(stock["pencil"])

# OUTPUT:
# 10
# None
# 0
# True False
# KeyError: 'pencil'`
            ]
        },
        {
            content: `<h4>Adding, Updating and Deleting</h4>
Assigning to a key adds it if it is new and replaces the value if it exists.`,
            codeExamples: [
                `marks = {"Abaji": 80}

marks["Raoji"] = 72           # add
marks["Abaji"] = 85           # update
print(marks)

removed = marks.pop("Raoji")  # remove and return the value
print(removed, marks)

marks["Kanhoji"] = 90
del marks["Abaji"]            # remove without returning
print(marks)

# OUTPUT:
# {'Abaji': 85, 'Raoji': 72}
# 72 {'Abaji': 85}
# {'Kanhoji': 90}`
            ]
        },
        {
            content: `<h4>Looping over a Dictionary</h4>
Looping over a dict gives its <b>keys</b>. Use <code>.values()</code> for values and <code>.items()</code> for both.`,
            codeExamples: [
                `prices = {"pen": 10, "book": 250, "bag": 900}

for item in prices:
    print(item, end=" ")
print()

print(sum(prices.values()))

for item, price in prices.items():
    print(f"{item:<5} ₹{price}")

# OUTPUT:
# pen book bag
# 1160
# pen   ₹10
# book  ₹250
# bag   ₹900`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Counting and Grouping Patterns</h3>
Two jobs you'll do constantly: counting occurrences and grouping items by a key.`,
            codeExamples: [
                `words = "to be or not to be".split()

counts = {}
for w in words:
    counts[w] = counts.get(w, 0) + 1
print(counts)

students = [("Abaji", "CSE"), ("Raoji", "ECE"), ("Kanhoji", "CSE")]
by_branch = {}
for name, branch in students:
    by_branch.setdefault(branch, []).append(name)
print(by_branch)

# OUTPUT:
# {'to': 2, 'be': 2, 'or': 1, 'not': 1}
# {'CSE': ['Abaji', 'Kanhoji'], 'ECE': ['Raoji']}`
            ]
        },
        {
            content: `<h3>collections: Counter and defaultdict</h3>
The standard library has specialised dicts for those two patterns.`,
            codeExamples: [
                `from collections import Counter, defaultdict

votes = ["red", "blue", "red", "green", "red", "blue"]
tally = Counter(votes)
print(tally)
print(tally.most_common(1))

graph = defaultdict(list)        # missing keys start as []
graph["A"].append("B")
graph["A"].append("C")
print(dict(graph), graph["Z"])

# OUTPUT:
# Counter({'red': 3, 'blue': 2, 'green': 1})
# [('red', 3)]
# {'A': ['B', 'C']} []`
            ]
        },
        {
            content: `<h3>Equality Ignores Order</h3>
Two dicts are equal if they have the same key-value pairs, regardless of insertion order.`,
            codeExamples: [
                `a = {"x": 1, "y": 2}
b = {"y": 2, "x": 1}
print(a == b, list(a) == list(b))

# OUTPUT:
# True False`
            ]
        },
        {
            content: `<h3>Don't Change Size While Iterating</h3>
Adding or removing keys while looping over a dict raises an error. Loop over a snapshot (<code>list(d)</code>) or build a new dict.`,
            codeExamples: [
                `stock = {"pen": 0, "book": 4, "bag": 0}

for item in list(stock):            # snapshot of the keys
    if stock[item] == 0:
        del stock[item]
print(stock)

stock = {"pen": 0, "book": 4}
for item in stock:
    if stock[item] == 0:
        del stock[item]

# OUTPUT:
# {'book': 4}
# RuntimeError: dictionary changed size during iteration`
            ]
        },
        {
            content: `<h3>Nested Dictionaries (JSON-Shaped Data)</h3>
APIs and config files are mostly nested dicts and lists. Chain <code>.get()</code> with empty-dict defaults to read deep values safely.`,
            codeExamples: [
                `order = {
    "id": 42,
    "customer": {"name": "Abaji", "address": {"city": "Pune"}},
    "items": [{"sku": "PEN", "qty": 3}, {"sku": "BOOK", "qty": 1}],
}

print(order["customer"]["address"]["city"])
print(order.get("shipping", {}).get("courier", "not assigned"))
print(sum(item["qty"] for item in order["items"]))

# OUTPUT:
# Pune
# not assigned
# 4`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td><code>d[k]</code> vs <code>d.get(k)</code>?</td><td>d[k] raises KeyError if k is missing; get returns None or the given default</td></tr>
<tr class='text-center'><td>Are dictionaries ordered?</td><td>Yes - insertion order is guaranteed since Python 3.7</td></tr>
<tr class='text-center'><td>What can be a dict key?</td><td>Any hashable object: str, int, float, tuple of hashables, frozenset - not list, dict or set</td></tr>
<tr class='text-center'><td>Time complexity of lookup, insert, delete?</td><td>O(1) on average</td></tr>
<tr class='text-center'><td>How do you count word frequencies?</td><td><code>collections.Counter(words)</code></td></tr>
<tr class='text-center'><td>Why does deleting keys inside a for loop fail?</td><td>The dict's size changes during iteration; iterate over <code>list(d)</code> instead</td></tr>
</table>`
        }
    ]
};
