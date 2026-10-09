import type { Topic } from '../../types';

export const eqLt: Topic = {
    id: 'python-data-model-eq-lt',
    name: '__eq__ & __lt__',
    beginner: [
        {
            content: `<h4>Default Equality Is Identity</h4>
If a class doesn't define <code>__eq__</code>, <code>==</code> falls back to <b>identity</b>: two objects are equal only if they are the same object. This is exactly Java's default <code>Object.equals()</code>.`,
            codeExamples: [
                `class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

p1 = Point(1, 2)
p2 = Point(1, 2)

print(p1 == p2)          # different objects
print(p1 == p1)

# OUTPUT:
# False
# True`
            ]
        },
        {
            content: `<h4>Defining __eq__</h4>
<code>a == b</code> calls <code>a.__eq__(b)</code>. Compare the fields that define "sameness". If the other object is a type you don't know how to compare, return <code>NotImplemented</code> (not <code>False</code>) so Python can try other options. <code>!=</code> is derived automatically from <code>__eq__</code>.`,
            codeExamples: [
                `class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __eq__(self, other):
        if not isinstance(other, Point):
            return NotImplemented
        return (self.x, self.y) == (other.x, other.y)

p1 = Point(1, 2)
p2 = Point(1, 2)

print(p1 == p2)
print(p1 != p2)          # derived from __eq__
print(p1 == (1, 2))      # not a Point - falls back to identity

# OUTPUT:
# True
# False
# False`
            ]
        },
        {
            content: `<h4>__lt__ Makes Objects Sortable</h4>
<code>sorted()</code>, <code>list.sort()</code>, <code>min()</code> and <code>max()</code> compare items with <code>&lt;</code>, which calls <code>__lt__</code>. Without it, sorting your objects fails.`,
            codeExamples: [
                `class Student:
    def __init__(self, name, marks):
        self.name = name
        self.marks = marks

    def __repr__(self):
        return f"Student({self.name!r}, {self.marks})"

students = [Student("Asha", 91), Student("Ravi", 78)]
print(sorted(students))

# OUTPUT:
# TypeError: '<' not supported between instances of 'Student' and 'Student'`,
                `class Student:
    def __init__(self, name, marks):
        self.name = name
        self.marks = marks

    def __repr__(self):
        return f"Student({self.name!r}, {self.marks})"

    def __lt__(self, other):
        if not isinstance(other, Student):
            return NotImplemented
        return self.marks < other.marks

students = [Student("Asha", 91), Student("Ravi", 78), Student("Kiran", 85)]
print(sorted(students))
print(min(students), max(students))

# OUTPUT:
# [Student('Ravi', 78), Student('Kiran', 85), Student('Asha', 91)]
# Student('Ravi', 78) Student('Asha', 91)`
            ]
        },
        {
            content: `<h4>The Rich Comparison Methods</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Operator</th><th>Method</th><th>Reflected partner</th></tr>
<tr class='text-center'><td><code>a == b</code></td><td><code>__eq__</code></td><td><code>__eq__</code></td></tr>
<tr class='text-center'><td><code>a != b</code></td><td><code>__ne__</code> (derived from __eq__ by default)</td><td><code>__ne__</code></td></tr>
<tr class='text-center'><td><code>a &lt; b</code></td><td><code>__lt__</code></td><td><code>__gt__</code></td></tr>
<tr class='text-center'><td><code>a &lt;= b</code></td><td><code>__le__</code></td><td><code>__ge__</code></td></tr>
<tr class='text-center'><td><code>a &gt; b</code></td><td><code>__gt__</code></td><td><code>__lt__</code></td></tr>
<tr class='text-center'><td><code>a &gt;= b</code></td><td><code>__ge__</code></td><td><code>__le__</code></td></tr>
</table>
"Reflected" means: if <code>a.__gt__(b)</code> is missing or returns <code>NotImplemented</code>, Python tries <code>b.__lt__(a)</code>. That is why <code>max()</code> worked above with only <code>__lt__</code>.`
        },
        {
            content: `<h4>functools.total_ordering</h4>
Writing all four ordering methods is tedious. Define <code>__eq__</code> and one of them (usually <code>__lt__</code>), and <code>@total_ordering</code> fills in the rest.`,
            codeExamples: [
                `from functools import total_ordering

@total_ordering
class Money:
    def __init__(self, paise):
        self.paise = paise

    def __eq__(self, other):
        if not isinstance(other, Money):
            return NotImplemented
        return self.paise == other.paise

    def __lt__(self, other):
        if not isinstance(other, Money):
            return NotImplemented
        return self.paise < other.paise

a, b = Money(500), Money(750)
print(a < b, a <= b, a > b, a >= b, a == Money(500))

# OUTPUT:
# True True False False True`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Defining __eq__ Makes a Class Unhashable</h3>
The rule "equal objects must have equal hashes" would break if your new <code>__eq__</code> were paired with the inherited identity-based hash. So Python sets <code>__hash__ = None</code> when a class defines <code>__eq__</code> without <code>__hash__</code>. Define <code>__hash__</code> from the <b>same fields</b> as <code>__eq__</code> - and treat those fields as immutable.`,
            codeExamples: [
                `class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __eq__(self, other):
        if not isinstance(other, Point):
            return NotImplemented
        return (self.x, self.y) == (other.x, other.y)

print(Point.__hash__)
print({Point(1, 2)})

# OUTPUT:
# None
# TypeError: unhashable type: 'Point'`,
                `class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __eq__(self, other):
        if not isinstance(other, Point):
            return NotImplemented
        return (self.x, self.y) == (other.x, other.y)

    def __hash__(self):
        return hash((self.x, self.y))      # same fields as __eq__

visited = {Point(1, 2), Point(1, 2), Point(3, 4)}
print(len(visited), Point(1, 2) in visited)

# OUTPUT:
# 2 True`
            ]
        },
        {
            content: `<h3>Why NotImplemented and Not False</h3>
Returning <code>NotImplemented</code> tells Python "I don't know - ask the other object". Python then calls the <b>reflected</b> method on the right-hand operand. If you return <code>False</code>, the conversation ends and the other class never gets a chance. (If both sides return <code>NotImplemented</code>, <code>==</code> falls back to identity and <code>&lt;</code> raises <code>TypeError</code>.)`,
            codeExamples: [
                `class Meters:
    def __init__(self, value):
        self.value = value

    def __eq__(self, other):
        if isinstance(other, Meters):
            return self.value == other.value
        return NotImplemented              # let the other side decide

class Centimeters:
    def __init__(self, value):
        self.value = value

    def __eq__(self, other):
        if isinstance(other, Centimeters):
            return self.value == other.value
        if isinstance(other, Meters):
            return self.value == other.value * 100
        return NotImplemented

print(Meters(2) == Centimeters(200))   # Meters says NotImplemented -> Centimeters answers
print(Centimeters(200) == Meters(2))

# OUTPUT:
# True
# True`
            ]
        },
        {
            content: `<h3>Let dataclass Generate It</h3>
<code>@dataclass</code> generates <code>__eq__</code> comparing all fields in order; <code>order=True</code> adds <code>&lt;</code>, <code>&lt;=</code>, <code>&gt;</code>, <code>&gt;=</code> that compare the fields as a tuple. Add <code>frozen=True</code> to make instances immutable <b>and</b> hashable.`,
            codeExamples: [
                `from dataclasses import dataclass

@dataclass(order=True, frozen=True)
class Version:
    major: int
    minor: int
    patch: int

releases = [Version(1, 10, 0), Version(1, 2, 3), Version(0, 9, 9)]
print(sorted(releases))
print(Version(1, 2, 0) < Version(1, 10, 0))    # numeric, unlike comparing "1.2" < "1.10"
print(len({Version(1, 0, 0), Version(1, 0, 0)}))

# OUTPUT:
# [Version(major=0, minor=9, patch=9), Version(major=1, minor=2, patch=3), Version(major=1, minor=10, patch=0)]
# True
# 1`
            ]
        },
        {
            content: `<h3>Compared with Java</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Java</th><th>Python</th></tr>
<tr class='text-center'><td><code>a.equals(b)</code></td><td><code>a == b</code> → <code>__eq__</code></td></tr>
<tr class='text-center'><td><code>a == b</code> (reference check)</td><td><code>a is b</code></td></tr>
<tr class='text-center'><td><code>hashCode()</code></td><td><code>__hash__</code></td></tr>
<tr class='text-center'><td><code>Comparable.compareTo()</code> returning -1/0/1</td><td><code>__lt__</code> (+ <code>@total_ordering</code>) returning a bool</td></tr>
<tr class='text-center'><td><code>Comparator</code></td><td><code>key=</code> function in <code>sorted()</code></td></tr>
<tr class='text-center'><td>Overriding equals without hashCode compiles but breaks HashMap</td><td>Defining __eq__ without __hash__ makes the class unhashable - fails loudly</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What does <code>==</code> do for a class without __eq__?</td><td>Compares identity - True only for the same object</td></tr>
<tr class='text-center'><td>Why return NotImplemented instead of False?</td><td>So Python can try the reflected method on the other operand; False would end the comparison</td></tr>
<tr class='text-center'><td>Why does defining __eq__ make a class unhashable?</td><td>Python sets __hash__ to None to protect the rule that equal objects have equal hashes</td></tr>
<tr class='text-center'><td>Which method does sorted() need?</td><td><code>__lt__</code></td></tr>
<tr class='text-center'><td>What does @total_ordering do?</td><td>Given __eq__ and one ordering method, it generates the other three</td></tr>
<tr class='text-center'><td>How do you get comparisons with no boilerplate?</td><td><code>@dataclass(order=True)</code>, plus <code>frozen=True</code> for hashability</td></tr>
</table>`
        }
    ]
};
