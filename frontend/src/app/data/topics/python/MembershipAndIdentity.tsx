import type { Topic } from '../../types';

export const membershipAndIdentity: Topic = {
    id: 'python-basics-membership-identity-operators',
    name: 'Membership & Identity Operators',
    beginner: [
        {
            content: `<h4>Membership Operators: <code>in</code> and <code>not in</code></h4>
<code>in</code> checks whether a value is contained in a collection. It works with strings, lists, tuples, sets, dictionaries and ranges.`,
            codeExamples: [
                `fruits = ["apple", "mango", "banana"]
print("mango" in fruits)
print("grape" not in fruits)

print("Lab" in "JavaSchoolLab")        # substring check
print(5 in range(1, 10))

# OUTPUT:
# True
# True
# True
# True`
            ]
        },
        {
            content: `<h4><code>in</code> with Dictionaries</h4>
For a dictionary, <code>in</code> checks the <b>keys</b>, not the values.`,
            codeExamples: [
                `stock = {"pen": 10, "book": 0}

print("pen" in stock)
print(10 in stock)                  # 10 is a value, not a key
print(10 in stock.values())

# OUTPUT:
# True
# False
# True`
            ]
        },
        {
            content: `<h4>Identity Operators: <code>is</code> and <code>is not</code></h4>
<code>is</code> checks whether two names refer to <b>the same object</b> - not whether the values are equal. Its main everyday use is checking for <code>None</code>.`,
            codeExamples: [
                `a = [1, 2]
b = [1, 2]
c = a

print(a == b)       # equal values
print(a is b)       # different objects
print(a is c)       # same object

result = None
print(result is None)

# OUTPUT:
# True
# False
# True
# True`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Performance: <code>in</code> Depends on the Container</h3>
Membership in a list or tuple scans every element - O(n). In a set or dict it is a hash lookup - O(1) on average. If you test membership repeatedly against a large collection, convert it to a set first.
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Container</th><th>Cost of <code>x in c</code></th></tr>
<tr class='text-center'><td>list, tuple, str</td><td>O(n) linear scan (str: substring search)</td></tr>
<tr class='text-center'><td>set, frozenset, dict</td><td>O(1) average, via hashing</td></tr>
<tr class='text-center'><td>range</td><td>O(1) for ints - computed arithmetically</td></tr>
</table>`,
            codeExamples: [
                `import time

ids_list = list(range(1_000_000))
ids_set = set(ids_list)

start = time.perf_counter()
for _ in range(100):
    999_999 in ids_list
print("list:", round(time.perf_counter() - start, 3), "s")

start = time.perf_counter()
for _ in range(100):
    999_999 in ids_set
print("set: ", round(time.perf_counter() - start, 6), "s")

# OUTPUT (typical - exact times depend on the machine):
# list: 0.9 s
# set:  0.00001 s`
            ]
        },
        {
            content: `<h3>How <code>in</code> Works for Your Own Classes</h3>
<code>x in obj</code> calls <code>obj.__contains__(x)</code>. If that method is missing, Python falls back to iterating the object (<code>__iter__</code>) and comparing each item with <code>==</code>.`,
            codeExamples: [
                `class Classroom:
    def __init__(self, students):
        self.students = students

    def __contains__(self, name):
        return name.lower() in (s.lower() for s in self.students)

room = Classroom(["Pankaj", "Sheru"])
print("sheru" in room)
print("Dheeraj" in room)

# OUTPUT:
# True
# False`
            ]
        },
        {
            content: `<h3><code>in</code> Uses Identity First, Then Equality</h3>
For lists and tuples, <code>x in seq</code> is <code>any(item is x or item == x for item in seq)</code>. The identity shortcut is why a NaN object can be "found" even though NaN is never equal to itself.`,
            codeExamples: [
                `nan = float("nan")
values = [1.0, nan]

print(nan == nan)
print(nan in values)                   # found by identity
print(float("nan") in values)          # a different NaN object

# OUTPUT:
# False
# True
# False`
            ]
        },
        {
            content: `<h3>Never Use <code>is</code> for Value Comparison</h3>
<code>is</code> on numbers or strings may appear to work because of caching and interning, then fail on other values. Python 3.8+ even warns about it: <code>SyntaxWarning: "is" with 'int' literal. Did you mean "=="?</code>`,
            codeExamples: [
                `code = int("1000")
print(code == 1000)
print(code is 1000)       # SyntaxWarning, and False here

# OUTPUT:
# SyntaxWarning: "is" with 'int' literal. Did you mean "=="?
# True
# False`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What does <code>in</code> check on a dict?</td><td>Keys only - use <code>.values()</code> or <code>.items()</code> for values or pairs</td></tr>
<tr class='text-center'><td>Time complexity of <code>x in list</code> vs <code>x in set</code>?</td><td>O(n) for a list, O(1) average for a set</td></tr>
<tr class='text-center'><td>Which dunder method powers <code>in</code>?</td><td><code>__contains__</code>, falling back to <code>__iter__</code></td></tr>
<tr class='text-center'><td><code>is</code> vs <code>==</code>?</td><td><code>is</code> compares object identity; <code>==</code> compares values</td></tr>
<tr class='text-center'><td>When is <code>is</code> the right choice?</td><td>For singletons such as None and for sentinel objects</td></tr>
</table>`
        }
    ]
};
