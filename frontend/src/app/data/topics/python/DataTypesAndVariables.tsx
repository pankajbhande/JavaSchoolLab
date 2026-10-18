import type { Topic } from '../../types';

export const pythonDataTypes: Topic = {
    id: 'python-datatypes',
    name: 'Data Types & Variables',
    beginner: [
        {
            content: `<h4>What is a Variable?</h4>
A <b>variable</b> is a name that refers to a value. You create one simply by assigning to it with <code>=</code> - there is no declaration keyword and no type to write.`,
            codeExamples: [
                `student_name = "Pankaj"
age = 21
cgpa = 8.7
is_enrolled = True

print(student_name, age, cgpa, is_enrolled)

# OUTPUT:
# Pankaj 21 8.7 True`
            ]
        },
        {
            content: `<h4>Naming Rules</h4>
• Names may contain letters, digits and underscores, but <b>cannot start with a digit</b>.<br>
• Names are <b>case-sensitive</b>: <code>age</code>, <code>Age</code> and <code>AGE</code> are three different variables.<br>
• You cannot use <b>keywords</b> such as <code>if</code>, <code>for</code>, <code>class</code>, <code>True</code> as names.<br>
• Convention (PEP 8): <code>snake_case</code> for variables, <code>UPPER_CASE</code> for constants.`,
            codeExamples: [
                `total_marks = 450       # valid
_count = 0              # valid
marks2 = 90             # valid
# 2marks = 90           # SyntaxError: invalid decimal literal
# class = "A"           # SyntaxError: invalid syntax

import keyword
print(len(keyword.kwlist), keyword.kwlist[:5])

# OUTPUT:
# 35 ['False', 'None', 'True', 'and', 'as']`
            ]
        },
        {
            content: `<h4>Built-in Data Types</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Category</th><th>Type</th><th>Example</th><th>Mutable?</th></tr>
<tr class='text-center'><td>Numeric</td><td><code>int</code>, <code>float</code>, <code>complex</code></td><td><code>42</code>, <code>3.14</code>, <code>2+3j</code></td><td>No</td></tr>
<tr class='text-center'><td>Boolean</td><td><code>bool</code></td><td><code>True</code>, <code>False</code></td><td>No</td></tr>
<tr class='text-center'><td>Text</td><td><code>str</code></td><td><code>"hello"</code></td><td>No</td></tr>
<tr class='text-center'><td>Nothing</td><td><code>NoneType</code></td><td><code>None</code></td><td>No</td></tr>
<tr class='text-center'><td>Sequence</td><td><code>list</code>, <code>tuple</code>, <code>range</code></td><td><code>[1, 2]</code>, <code>(1, 2)</code>, <code>range(5)</code></td><td>list: yes, others: no</td></tr>
<tr class='text-center'><td>Mapping</td><td><code>dict</code></td><td><code>{"a": 1}</code></td><td>Yes</td></tr>
<tr class='text-center'><td>Set</td><td><code>set</code>, <code>frozenset</code></td><td><code>{1, 2}</code></td><td>set: yes, frozenset: no</td></tr>
<tr class='text-center'><td>Binary</td><td><code>bytes</code>, <code>bytearray</code></td><td><code>b"hi"</code></td><td>bytearray only</td></tr>
</table>`
        },
        {
            content: `<h4>Checking a Value's Type</h4>
<code>type()</code> tells you the type of any value.`,
            codeExamples: [
                `numbers = [1, 2, 3, 4]                 # list - mutable
coordinates = (10, 20)                 # tuple - immutable
person = {"name": "Sheru", "age": 24}  # dict
unique_ids = {1, 2, 2, 3}              # set - duplicates removed

print(type(numbers), type(coordinates))
print(type(person), type(unique_ids))
print(unique_ids)
print(type(None))

# OUTPUT:
# <class 'list'> <class 'tuple'>
# <class 'dict'> <class 'set'>
# {1, 2, 3}
# <class 'NoneType'>`
            ]
        },
        {
            content: `<h4>Multiple Assignment and Swapping</h4>
Python can assign several variables in one line, and swap two values without a temporary variable.`,
            codeExamples: [
                `x, y, z = 10, 20, 30
print(x, y, z)

a = b = c = 0          # chained assignment - all three refer to 0
print(a, b, c)

x, y = y, x            # swap
print(x, y)

# OUTPUT:
# 10 20 30
# 0 0 0
# 20 10`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Variables Are Names, Not Boxes</h3>
In Java, <code>int x = 5;</code> puts the value 5 inside a memory slot named x. In Python, <b>every value is an object</b> living on the heap, and a variable is just a <b>name bound to (pointing at) an object</b>. Assignment never copies an object - it makes another name point at the same one.`,
            codeExamples: [
                `marks = [70, 80]
backup = marks          # NOT a copy - a second name for the same list

backup.append(90)
print(marks)            # changed through the other name!
print(marks is backup)  # same object?

real_copy = marks.copy()
real_copy.append(100)
print(marks)            # unaffected

# OUTPUT:
# [70, 80, 90]
# True
# [70, 80, 90]`
            ]
        },
        {
            content: `<h3>The Chained-Assignment Trap</h3>
<code>a = b = []</code> binds both names to <b>one</b> list. With immutable values like numbers this never matters, but with mutable ones it is a classic bug.`,
            codeExamples: [
                `row_a = row_b = []
row_a.append("x")
print(row_b)

# Correct: two separate lists
row_a, row_b = [], []
row_a.append("x")
print(row_b)

# OUTPUT:
# ['x']
# []`
            ]
        },
        {
            content: `<h3>Extended Unpacking</h3>
A starred name collects "everything else" into a list. This works anywhere you unpack, including <code>for</code> loops.`,
            codeExamples: [
                `first, *middle, last = [10, 20, 30, 40, 50]
print(first, middle, last)

head, *tail = "python"
print(head, tail)

name, (city, pin) = ("Udgir", ("Latur", 413517))
print(name, city, pin)

# OUTPUT:
# 10 [20, 30, 40] 50
# p ['y', 't', 'h', 'o', 'n']
# Udgir Latur 413517`
            ]
        },
        {
            content: `<h3>Deleting a Name</h3>
<code>del x</code> removes the <b>name</b>, not necessarily the object. The object is freed only when no names or containers refer to it any more.`,
            codeExamples: [
                `data = [1, 2, 3]
alias = data
del data
print(alias)       # the list is still alive through alias
# print(data)      # NameError: name 'data' is not defined

# OUTPUT:
# [1, 2, 3]`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>How are variables different in Python and Java?</td><td>Python variables are names bound to objects and carry no type; Java variables are typed storage locations</td></tr>
<tr class='text-center'><td>Does <code>b = a</code> copy a list?</td><td>No - both names refer to the same list; use <code>a.copy()</code>, <code>list(a)</code> or <code>a[:]</code> for a shallow copy</td></tr>
<tr class='text-center'><td>What does <code>a = b = []</code> create?</td><td>One list with two names - mutating through either name is visible through both</td></tr>
<tr class='text-center'><td>Name the immutable built-in types</td><td>int, float, complex, bool, str, tuple, frozenset, bytes, NoneType</td></tr>
<tr class='text-center'><td>How do you swap two variables?</td><td><code>a, b = b, a</code> - the right side builds a tuple first, then it is unpacked</td></tr>
<tr class='text-center'><td>What does <code>del x</code> do?</td><td>Removes the name x; the object is destroyed only when its reference count drops to zero</td></tr>
</table>`
        }
    ]
};
