import type { Topic } from '../../types';

export const memoryReferencesObjects: Topic = {
    id: 'python-memory-references-objects',
    name: 'References & Objects',
    beginner: [
        {
            content: `<h4>Introduction</h4>
In Python a variable is not a box that holds a value; it is a <b>name that refers to an object</b>. Every object has an <i>identity</i> (<code>id()</code>), a <i>type</i> and a <i>value</i>. <b>Assignment never copies</b> an object - it attaches another name to the same one, creating an <i>alias</i>. This matches Java's reference variables for objects, but in Python it applies to <b>every</b> value, and arguments are passed as references to objects ("pass by object reference").

<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:12px 0;">
<svg viewBox="0 0 331 195" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:331px;height:auto;font-family:monospace;display:block;margin:0 auto">
<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#6b7280"/></marker></defs>
<line x1="80.0" y1="31.0" x2="190.0" y2="48.1" stroke="#6b7280" marker-end="url(#ar)"/><line x1="80.0" y1="89.2" x2="190.0" y2="69.4" stroke="#6b7280" marker-end="url(#ar)"/><line x1="80.0" y1="164.2" x2="190.0" y2="160.3" stroke="#6b7280" marker-end="url(#ar)"/><rect x="10" y="10" width="70" height="31" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="45" y="29.5">a</tspan></text><rect x="10" y="80" width="70" height="31" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="45" y="99.5">b</tspan></text><rect x="10" y="150" width="70" height="31" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="45" y="169.5">c</tspan></text><rect x="190" y="35" width="126.2" height="46" rx="6" fill="#ecfdf5" stroke="#059669"/><text text-anchor="middle" font-size="12" fill="#065f46"><tspan x="253.1" y="54.5">list [1, 2, 3]</tspan><tspan x="253.1" y="69.5">(one object)</tspan></text><rect x="190" y="135" width="126.2" height="46" rx="6" fill="#fff7ed" stroke="#ea580c"/><text text-anchor="middle" font-size="12" fill="#9a3412"><tspan x="253.1" y="154.5">list [1, 2, 3]</tspan><tspan x="253.1" y="169.5">(a copy)</tspan></text>
</svg>
<div style="font-size:12px;color:#6b7280;text-align:center;margin-top:6px;">Figure: a and b are aliases of one list; c refers to a separate copy</div>
</div>`
        },
        {
            content: `<h4>Purpose / Need of This Topic</h4>
<b>The problem:</b> A beginner writes <code>b = a</code>, changes <code>b</code>, and is shocked that <code>a</code> changed too. Or passes a list to a function and cannot tell whether the caller will see the change.
<br><br>
<b>Why we need it:</b>
<ul>
<li>Predict when a change through one name is visible through another.</li>
<li>Tell <b>mutating</b> (changes the object) from <b>rebinding</b> (points the name elsewhere).</li>
<li>Know when to copy (<code>copy()</code>, slicing) and when aliasing is fine.</li>
<li>Understand how function arguments behave, a favourite interview topic.</li>
</ul>`
        },
        {
            content: `<h4>Complete Example: Aliasing, rebinding and function arguments</h4>
A complete, runnable program. Save it in a file and run it with python.`,
            codeExamples: [
                `def add_item(items):
    items.append("x")         # mutates the caller's list


def rebind(items):
    items = ["new"]           # rebinds the local name only
    return items


def main():
    a = [1, 2, 3]
    b = a                     # alias: same object, no copy
    print("same object:", a is b)

    b.append(4)               # mutation is visible through a
    print("a after mutate:", a)

    b = [9]                   # rebinding: b now refers elsewhere
    print("a after rebind:", a, "b:", b)

    add_item(a)
    rebind(a)
    print("after functions:", a)

    c = a.copy()              # a real copy
    print("copy:", c is a, c == a)


if __name__ == "__main__":
    main()

# OUTPUT:
# same object: True
# a after mutate: [1, 2, 3, 4]
# a after rebind: [1, 2, 3, 4] b: [9]
# after functions: [1, 2, 3, 4, 'x']
# copy: False True`
            ],
            codeExplanations: [
                `append() changes the one shared list, so a sees it. b = [9] only moves the name b. add_item() mutates the caller's list, while rebind() merely changes its own parameter name, so the caller's list is unchanged. copy() creates a new, equal object: "is" is False, "==" is True.`
            ]
        },
        {
            content: `<h4>Names Point to Objects</h4>
Every object has three things: an <b>identity</b> (its address, <code>id()</code>), a <b>type</b> and a <b>value</b>. A name such as <code>a</code> is just a label attached to an object. <b>Assignment never copies an object</b> - it makes the name refer to the same one. Two names for one object are called <b>aliases</b>.`,
            codeExamples: [
                `a = [1, 2, 3]
b = a                    # b is another name for the SAME list

b.append(4)
print(a)
print(a is b)
print(id(a) == id(b))

# OUTPUT:
# [1, 2, 3, 4]
# True
# True`
            ]
        },
        {
            content: `<h4>Mutating vs Rebinding</h4>
Two very different operations look similar:
<ul>
<li><b>Mutating</b> (<code>b.append(4)</code>) changes the object itself, so every alias sees it.</li>
<li><b>Rebinding</b> (<code>b = [9]</code>) points the name <code>b</code> at a <i>different</i> object; other names are unaffected.</li>
</ul>`,
            codeExamples: [
                `a = [1, 2, 3]
b = a

b = [9]                  # rebinding: b now refers to a new list
print(a)
print(b)

# OUTPUT:
# [1, 2, 3]
# [9]`
            ]
        },
        {
            content: `<h4>Function Arguments: Pass by Object Reference</h4>
Python passes <b>references</b> to objects (sometimes called "pass by assignment"). A function can <b>mutate</b> a mutable argument and the caller sees it, but <b>rebinding</b> the parameter inside the function does not affect the caller.`,
            codeExamples: [
                `def add_item(items):
    items.append("x")        # mutates the caller's list

def reassign(items):
    items = ["new"]          # rebinds the local name only

nums = [1]
add_item(nums)
reassign(nums)
print(nums)

# OUTPUT:
# [1, 'x']`
            ]
        },
        {
            content: `<h4>del Removes a Name, Not an Object</h4>
<code>del name</code> unbinds the name. The object is freed only when <b>no references remain</b>.`,
            codeExamples: [
                `a = [1]
b = a
del a

print(b)                 # the list is still alive through b
try:
    print(a)
except NameError as error:
    print("NameError:", error)

# OUTPUT:
# [1]
# NameError: name 'a' is not defined`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Aliasing Traps</h3>
Because assignment and multiplication copy <i>references</i>, nested mutable objects get shared when you did not intend it.`,
            codeExamples: [
                `grid = [[0] * 2] * 2            # two references to ONE inner list
grid[0][0] = 1
print(grid)

good = [[0] * 2 for _ in range(2)]   # a new inner list per row
good[0][0] = 1
print(good)

x = y = []                       # both names, one list
x.append(1)
print(y)

# OUTPUT:
# [[1, 0], [1, 0]]
# [[1, 0], [0, 0]]
# [1]`
            ]
        },
        {
            content: `<h3>The Mutable Default Argument</h3>
Default values are evaluated <b>once</b>, when the function is defined, and stored on the function object. A mutable default is therefore one shared object across all calls.`,
            codeExamples: [
                `def collect(item, bucket=[]):          # BUG: one shared list
    bucket.append(item)
    return bucket

print(collect(1))
print(collect(2))

def collect_safe(item, bucket=None):
    if bucket is None:
        bucket = []                    # a new list on every call
    bucket.append(item)
    return bucket

print(collect_safe(1))
print(collect_safe(2))

# OUTPUT:
# [1]
# [1, 2]
# [1]
# [2]`
            ]
        },
        {
            content: `<h3>+= Mutates, + Rebinds - and the Tuple Puzzle</h3>
For lists, <code>a += [x]</code> calls <code>__iadd__</code> and <b>extends in place</b>, while <code>a = a + [x]</code> builds a <b>new</b> list. For immutable types, <code>+=</code> must rebind. The famous puzzle: <code>t[0] += [2]</code> on a tuple first mutates the list inside (succeeds), then tries to assign back into the tuple (fails).`,
            codeExamples: [
                `a = [1]
before = id(a)
a += [2]
print(id(a) == before)          # same object, extended in place

a = a + [3]
print(id(a) == before)          # a brand-new list

t = ([1],)
try:
    t[0] += [2]
except TypeError as error:
    print("TypeError:", error)
print(t)                        # ...but the list inside WAS changed

# OUTPUT:
# True
# False
# TypeError: 'tuple' object does not support item assignment
# ([1, 2],)`
            ]
        },
        {
            content: `<h3>Immutability Is About the Object, Not the Name</h3>
A tuple's <i>references</i> cannot change, but the objects it refers to still can if they are mutable. That is why a tuple containing a list cannot be used as a dictionary key (it is unhashable), and why you need <code>copy.deepcopy</code> to duplicate nested structures. Use <code>is</code> only to test for identity (<code>x is None</code>); use <code>==</code> to compare values.`
        },
        {
            content: `<h3>Advantages and Disadvantages</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Advantages</th><th>Disadvantages</th></tr>
<tr><td>Passing a big object to a function copies nothing: fast</td><td>Unintended aliasing causes surprising changes in other places</td></tr>
<tr><td>Functions can update mutable arguments in place</td><td>Easy to confuse mutating with rebinding</td></tr>
<tr><td>One simple rule works for every type of value</td><td>Mutable default arguments and shared lists are classic traps</td></tr>
<tr><td>Aliases make sharing data between parts of a program easy</td><td>Copying properly needs care (shallow vs deep copy)</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Does <code>b = a</code> copy the object?</td><td>No - it makes b another name for the same object</td></tr>
<tr class='text-center'><td>Is Python pass-by-value or pass-by-reference?</td><td>Neither exactly: it passes object references by value ("pass by assignment"); mutation is visible, rebinding is not</td></tr>
<tr class='text-center'><td>Why is <code>def f(x, acc=[])</code> a bug?</td><td>The default list is created once and shared by every call</td></tr>
<tr class='text-center'><td>Why does <code>[[0]*2]*2</code> misbehave?</td><td>The outer list holds two references to the same inner list</td></tr>
<tr class='text-center'><td><code>is</code> vs <code>==</code>?</td><td><code>is</code> compares identity (same object); <code>==</code> compares values</td></tr>
</table>`
        }
    ]
};
