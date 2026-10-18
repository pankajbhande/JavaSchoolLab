import type { Topic } from '../../types';

export const shallowVsDeepCopy: Topic = {
    id: 'python-collections-shallow-copy-vs-deep-copy',
    name: 'Shallow Copy vs Deep Copy',
    beginner: [
        {
            content: `<h4>Three Levels of "Copying"</h4>
When a collection contains other mutable objects (lists inside a list, dicts inside a dict), there are three different things "copy" can mean:<br><br>
• <b>Assignment</b> (<code>b = a</code>) - no copy at all; <code>b</code> is another name for the same object.<br>
• <b>Shallow copy</b> (<code>copy.copy(a)</code>, <code>a.copy()</code>, <code>a[:]</code>) - a new <b>outer</b> object, but the items inside are the <b>same</b> objects.<br>
• <b>Deep copy</b> (<code>copy.deepcopy(a)</code>) - a new outer object <b>and</b> new copies of everything inside it, all the way down.`
        },
        {
            content: `<h4>Seeing the Difference</h4>
<code>is</code> tells us whether two names refer to the same object - checking the outer list and an inner list shows exactly what each kind of copy shares.`,
            codeExamples: [
                `import copy

original = [[1, 2], [3, 4]]
alias = original
shallow = copy.copy(original)
deep = copy.deepcopy(original)

print(alias is original, shallow is original, deep is original)
print(shallow[0] is original[0], deep[0] is original[0])

original[0].append(99)          # change an INNER list
print(alias)
print(shallow)
print(deep)

original.append([5])            # change the OUTER list
print(len(original), len(shallow), len(deep))

# OUTPUT:
# True False False
# True False
# [[1, 2, 99], [3, 4]]
# [[1, 2, 99], [3, 4]]
# [[1, 2], [3, 4]]
# 3 2 2`
            ]
        },
        {
            content: `<h4>Comparison</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>Assignment</th><th>Shallow copy</th><th>Deep copy</th></tr>
<tr class='text-center'><td>New outer object?</td><td>No</td><td>Yes</td><td>Yes</td></tr>
<tr class='text-center'><td>New inner objects?</td><td>No</td><td>No - shared</td><td>Yes</td></tr>
<tr class='text-center'><td>Adding/removing top-level items affects the original?</td><td>Yes</td><td>No</td><td>No</td></tr>
<tr class='text-center'><td>Changing a nested object affects the original?</td><td>Yes</td><td>Yes</td><td>No</td></tr>
<tr class='text-center'><td>How</td><td><code>b = a</code></td><td><code>copy.copy(a)</code>, <code>a.copy()</code>, <code>a[:]</code>, <code>list(a)</code>, <code>dict(d)</code></td><td><code>copy.deepcopy(a)</code></td></tr>
<tr class='text-center'><td>Cost</td><td>Free</td><td>O(n) for the top level</td><td>Visits every nested object - slowest</td></tr>
</table>`
        },
        {
            content: `<h4>dict.copy() Is Shallow Too</h4>
Replacing a top-level value in the copy is safe, but mutating a nested list or dict changes the original as well.`,
            codeExamples: [
                `student = {"name": "Abaji", "marks": [80, 90]}
backup = student.copy()

backup["name"] = "Raoji"          # top-level replace: independent
backup["marks"].append(70)       # nested mutation: shared!

print(student)
print(backup)

# OUTPUT:
# {'name': 'Abaji', 'marks': [80, 90, 70]}
# {'name': 'Raoji', 'marks': [80, 90, 70]}`
            ]
        },
        {
            content: `<h4>A Real Bug: Copying a Template</h4>
A common pattern is to start every new record from a "template" dict. With a shallow copy, the first record that edits a nested value silently corrupts the template - and every record created after it.`,
            codeExamples: [
                `TEMPLATE = {"course": "Python", "modules": ["Basics"], "progress": {"done": 0}}

abaji = TEMPLATE.copy()                 # shallow - BUG
abaji["modules"].append("OOP")
abaji["progress"]["done"] = 3

print(TEMPLATE)

# OUTPUT:
# {'course': 'Python', 'modules': ['Basics', 'OOP'], 'progress': {'done': 3}}`,
                `import copy

TEMPLATE = {"course": "Python", "modules": ["Basics"], "progress": {"done": 0}}

raoji = copy.deepcopy(TEMPLATE)         # fully independent
raoji["modules"].append("Django")
raoji["progress"]["done"] = 5

print(TEMPLATE)
print(raoji)

# OUTPUT:
# {'course': 'Python', 'modules': ['Basics'], 'progress': {'done': 0}}
# {'course': 'Python', 'modules': ['Basics', 'Django'], 'progress': {'done': 5}}`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>How deepcopy Works: Recursion Plus a Memo</h3>
<code>deepcopy</code> walks the object graph recursively. It keeps a <b>memo</b> dictionary mapping <code>id(original)</code> to its copy, so:<br>
• an object referenced twice is copied <b>once</b>, and both references in the copy point to that one new object (the shape of the data is preserved);<br>
• <b>cycles</b> (an object that contains itself) don't cause infinite recursion.`,
            codeExamples: [
                `import copy

shared = [0]
data = [shared, shared]
clone = copy.deepcopy(data)
print(clone[0] is clone[1], clone[0] is shared)

a = [1]
a.append(a)                 # a list that contains itself
print(a)
b = copy.deepcopy(a)
print(b[1] is b, b is a)

# OUTPUT:
# True False
# [1, [...]]
# True False`
            ]
        },
        {
            content: `<h3>Immutable Objects Are Not Copied</h3>
There is no point copying something that can never change, so both functions return immutable objects (numbers, strings, tuples of immutables, frozensets) as-is. A tuple that contains a mutable object, however, <b>is</b> rebuilt by <code>deepcopy</code> - its list must be copied, so a new tuple is needed to hold the new list.`,
            codeExamples: [
                `import copy

t = (1, 2)
print(copy.copy(t) is t, copy.deepcopy(t) is t)

s = "text"
print(copy.deepcopy(s) is s)

mixed = (1, [2, 3])
d = copy.deepcopy(mixed)
print(d is mixed, d[1] is mixed[1], copy.copy(mixed) is mixed)

# OUTPUT:
# True True
# True
# False False True`
            ]
        },
        {
            content: `<h3>Copying Your Own Objects</h3>
<code>copy.copy(obj)</code> creates a new instance and copies its attribute dictionary (<code>__dict__</code>) <b>shallowly</b>: rebinding an attribute on the copy is independent, but mutable attributes are shared.`,
            codeExamples: [
                `import copy

class Student:
    def __init__(self, name, marks):
        self.name = name
        self.marks = marks

s1 = Student("Abaji", [80, 90])
s2 = copy.copy(s1)

s2.name = "Raoji"              # rebinding: independent
s2.marks.append(70)           # mutating a shared list

print(s1.name, s1.marks)
print(s2 is s1, s2.marks is s1.marks)

s3 = copy.deepcopy(s1)
print(s3.marks is s1.marks)

# OUTPUT:
# Abaji [80, 90, 70]
# False True
# False`
            ]
        },
        {
            content: `<h3>Customising with __copy__ and __deepcopy__</h3>
Some attributes should <b>not</b> be duplicated - a database connection, a shared cache, a logger. Define <code>__deepcopy__(self, memo)</code> to decide what gets copied. Register the new object in <code>memo</code> before copying children (so cycles still work) and pass <code>memo</code> on to nested <code>deepcopy</code> calls. <code>__copy__(self)</code> customises <code>copy.copy</code> the same way.`,
            codeExamples: [
                `import copy

class Report:
    def __init__(self, rows, cache):
        self.rows = rows          # data - should be copied
        self.cache = cache        # shared resource - should NOT be copied

    def __copy__(self):
        return Report(self.rows, self.cache)

    def __deepcopy__(self, memo):
        new = Report.__new__(Report)
        memo[id(self)] = new                         # register first
        new.rows = copy.deepcopy(self.rows, memo)    # copy the data
        new.cache = self.cache                       # share the resource
        return new

cache = {"hits": 0}
r1 = Report([[1, 2]], cache)
r2 = copy.deepcopy(r1)
r3 = copy.copy(r1)

print(r2.rows is r1.rows, r2.rows[0] is r1.rows[0], r2.cache is r1.cache)
print(r3.rows is r1.rows)

# OUTPUT:
# False False True
# True`
            ]
        },
        {
            content: `<h3>Cost, Cheaper Alternatives and Limits</h3>
<code>deepcopy</code> is generic: it inspects every object, consults the memo and dispatches on type, so it is much slower than copying by hand. When you know the structure - say, a grid that is exactly one level deep - an explicit comprehension is clearer and faster.<br><br>
Not everything can be deep-copied: objects that wrap operating-system resources, such as locks, open files, sockets or database connections, generally raise a <code>TypeError</code>. Keep such resources out of the data you copy, or share them via <code>__deepcopy__</code> as shown above.`,
            codeExamples: [
                `grid = [[0] * 3 for _ in range(3)]

fast = [row[:] for row in grid]     # copies exactly one level of nesting
fast[0][0] = 9

print(grid[0], fast[0])
print(fast[1] is grid[1])

# OUTPUT:
# [0, 0, 0] [9, 0, 0]
# False`,
                `import copy
import threading

state = {"items": [1, 2], "lock": threading.Lock()}
copy.deepcopy(state)

# OUTPUT:
# TypeError: cannot pickle '_thread.lock' object
# (deepcopy falls back to the pickle protocol, and locks refuse to be pickled)`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Shallow vs deep copy?</td><td>A shallow copy creates a new container holding the same inner objects; a deep copy recursively copies the inner objects too</td></tr>
<tr class='text-center'><td>Is <code>list.copy()</code> / <code>dict.copy()</code> shallow or deep?</td><td>Shallow - as are slicing, <code>list()</code>, <code>dict()</code> and <code>copy.copy()</code></td></tr>
<tr class='text-center'><td>When does a shallow copy cause bugs?</td><td>When the collection contains mutable objects (nested lists/dicts) that are later mutated through the copy</td></tr>
<tr class='text-center'><td>How does deepcopy handle cycles and shared references?</td><td>It keeps a memo dict of already-copied objects keyed by id, reusing those copies instead of recursing again</td></tr>
<tr class='text-center'><td>Does deepcopy copy a tuple of ints?</td><td>No - immutable objects are returned as-is; a tuple containing a list is rebuilt</td></tr>
<tr class='text-center'><td>How do you control copying of your own class?</td><td>Implement <code>__copy__</code> and <code>__deepcopy__(self, memo)</code></td></tr>
<tr class='text-center'><td>Why not always use deepcopy?</td><td>It is slow, may duplicate resources that should be shared, and fails on uncopyable objects like locks or open files</td></tr>
</table>`
        }
    ]
};
