import type { Topic } from '../../types';

export const objectIdentity: Topic = {
    id: 'python-basics-object-identity-id',
    name: 'Object Identity & id()',
    beginner: [
        {
            content: `<h4>Every Object Has Three Things</h4>
• <b>Identity</b> - which object it is. It never changes during the object's lifetime.<br>
• <b>Type</b> - what kind of object it is (<code>type(obj)</code>).<br>
• <b>Value</b> - the data it holds.<br><br>
<code>id(obj)</code> returns an integer that is unique to that object while it is alive. In CPython it is the object's memory address.`,
            codeExamples: [
                `fruits = ["apple", "mango"]
print(id(fruits))
print(type(fruits))
print(fruits)

# OUTPUT (the id number differs on every run):
# 2154782012608
# <class 'list'>
# ['apple', 'mango']`
            ]
        },
        {
            content: `<h4>Same Value vs Same Object</h4>
• <code>==</code> asks: do these objects have <b>equal values</b>?<br>
• <code>is</code> asks: are these <b>the very same object</b>? It is equivalent to <code>id(a) == id(b)</code>.`,
            codeExamples: [
                `a = [1, 2, 3]
b = [1, 2, 3]          # a different list with equal contents
c = a                  # another name for the same list

print(a == b, a is b)
print(a == c, a is c)
print(id(a) == id(c))

# OUTPUT:
# True False
# True True
# True`
            ]
        },
        {
            content: `<h4>Assignment Never Copies</h4>
Assigning, passing to a function or putting an object in a list all share the <b>same</b> object - the id stays the same.`,
            codeExamples: [
                `def show_id(obj):
    print("inside: ", id(obj))

scores = [90, 80]
print("outside:", id(scores))
show_id(scores)

# OUTPUT (example ids - both lines always match):
# outside: 1876543210112
# inside:  1876543210112`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Small Integer Caching</h3>
CPython pre-creates the integers from <b>-5 to 256</b> and reuses them everywhere, because they are used constantly. Bigger integers created at runtime are separate objects. That is why <code>is</code> sometimes "works" on numbers and sometimes doesn't - <b>never use <code>is</code> to compare numbers or strings</b>.`,
            codeExamples: [
                `a = int("256")
b = int("256")
print(a is b)          # both come from the small-int cache

x = int("257")
y = int("257")
print(x is y)          # two separate objects
print(x == y)          # values are equal - use ==

# OUTPUT:
# True
# False
# True`
            ]
        },
        {
            content: `<h3>String Interning</h3>
CPython also <b>interns</b> (reuses) some strings - typically short ones that look like identifiers, such as names used in code. Strings built at runtime usually aren't interned. <code>sys.intern()</code> interns a string explicitly, which can save memory and speed up comparisons when the same strings repeat millions of times.`,
            codeExamples: [
                `import sys

s1 = "hello"
s2 = "hello"
print(s1 is s2)                 # literal identifiers: interned

s3 = "".join(["hel", "lo"])     # built at runtime
print(s3 == s1, s3 is s1)

s4 = sys.intern(s3)
print(s4 is s1)

# OUTPUT:
# True
# True False
# True`
            ]
        },
        {
            content: `<h3>ids Can Be Reused</h3>
An id is unique only among objects <b>alive at the same time</b>. Once an object is freed, a new object may get the same address. Storing ids to recognise objects later is therefore unreliable.`,
            codeExamples: [
                `print(id([1, 2]) == id([3, 4]))

# OUTPUT (typical in CPython):
# True
# The first list is destroyed right after id() returns,
# so the second list can be allocated at the same address.`
            ]
        },
        {
            content: `<h3>Identity and Immutability Together</h3>
For immutable objects identity rarely matters - nobody can change them, so sharing is safe. That is exactly what lets CPython cache small ints, intern strings, and reuse the empty tuple. For mutable objects identity is everything: it determines who sees a change.`,
            codeExamples: [
                `print(tuple() is tuple())          # the empty tuple is a singleton
print(None is None, True is True)  # None, True, False are singletons

grid = [[0] * 3] * 3              # three references to ONE inner list
grid[0][0] = 9
print(grid)
print(id(grid[0]) == id(grid[1]))

grid = [[0] * 3 for _ in range(3)] # three distinct lists
grid[0][0] = 9
print(grid)

# OUTPUT:
# True
# True True
# [[9, 0, 0], [9, 0, 0], [9, 0, 0]]
# True
# [[9, 0, 0], [0, 0, 0], [0, 0, 0]]`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td><code>is</code> vs <code>==</code>?</td><td><code>is</code> checks identity (same object); <code>==</code> checks value equality via <code>__eq__</code></td></tr>
<tr class='text-center'><td>What does <code>id()</code> return?</td><td>A unique integer for the object during its lifetime - its memory address in CPython</td></tr>
<tr class='text-center'><td>Why is <code>256 is 256</code> True but two runtime 257s are not the same object?</td><td>CPython caches integers from -5 to 256; larger ints are created fresh each time</td></tr>
<tr class='text-center'><td>Why does Python sometimes reuse the same object?</td><td>Immutable objects can be shared safely, so CPython caches small ints, interns strings and keeps singletons like None, True, False and ()</td></tr>
<tr class='text-center'><td>When should you use <code>is</code>?</td><td>Only for singletons: <code>is None</code>, <code>is True/False</code> in rare cases, and sentinel objects</td></tr>
<tr class='text-center'><td>Why does <code>[[0]*3]*3</code> misbehave?</td><td>It creates three references to the same inner list, so changing one row changes all of them</td></tr>
</table>`
        }
    ]
};
