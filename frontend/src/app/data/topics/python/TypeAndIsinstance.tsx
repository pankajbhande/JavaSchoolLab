import type { Topic } from '../../types';

export const typeAndIsinstance: Topic = {
    id: 'python-basics-type-isinstance',
    name: 'type() & isinstance()',
    beginner: [
        {
            content: `<h4>type() - What Is This Object?</h4>
<code>type(obj)</code> returns the class of an object. It is the quickest way to find out what you are dealing with while learning or debugging.`,
            codeExamples: [
                `print(type(10))
print(type(10.0))
print(type("10"))
print(type([10]))
print(type(None))

# OUTPUT:
# <class 'int'>
# <class 'float'>
# <class 'str'>
# <class 'list'>
# <class 'NoneType'>`
            ]
        },
        {
            content: `<h4>isinstance() - Is This Object a Kind of X?</h4>
<code>isinstance(obj, cls)</code> returns <code>True</code> if the object is an instance of that class <b>or any of its subclasses</b>. You can pass a tuple of classes to accept several types.`,
            codeExamples: [
                `marks = 87.5

print(isinstance(marks, float))
print(isinstance(marks, int))
print(isinstance(marks, (int, float)))      # either one

# OUTPUT:
# True
# False
# True`
            ]
        },
        {
            content: `<h4>A Practical Example</h4>
Validating arguments before using them:`,
            codeExamples: [
                `def average(values):
    if not isinstance(values, (list, tuple)):
        raise TypeError("values must be a list or tuple")
    return sum(values) / len(values)

print(average([80, 90, 100]))
print(average("809"))

# OUTPUT:
# 90.0
# TypeError: values must be a list or tuple`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>type() == X vs isinstance()</h3>
<code>type(obj) == X</code> is an <b>exact</b> match and ignores inheritance; <code>isinstance</code> respects it. Prefer <code>isinstance</code> - otherwise subclasses (which should be usable anywhere their parent is) get rejected. This is the Liskov Substitution Principle in practice.`,
            codeExamples: [
                `class Employee:
    pass

class Manager(Employee):
    pass

m = Manager()
print(type(m) == Employee)
print(isinstance(m, Employee))
print(type(m) is Manager)

# OUTPUT:
# False
# True
# True`
            ]
        },
        {
            content: `<h3>The bool Gotcha</h3>
Because <code>bool</code> subclasses <code>int</code>, <code>isinstance(True, int)</code> is True. When a bool must not be accepted as a number, exclude it explicitly.`,
            codeExamples: [
                `def set_quantity(qty):
    if isinstance(qty, bool) or not isinstance(qty, int):
        raise TypeError("quantity must be an int")
    print("Quantity set to", qty)

print(isinstance(True, int))
set_quantity(3)
set_quantity(True)

# OUTPUT:
# True
# Quantity set to 3
# TypeError: quantity must be an int`
            ]
        },
        {
            content: `<h3>Checking Against Abstract Base Classes</h3>
Often you care about <b>behaviour</b> ("can I iterate it?"), not a concrete class. The <code>collections.abc</code> module defines abstract types such as <code>Iterable</code>, <code>Sequence</code> and <code>Mapping</code> that many unrelated classes satisfy. Since Python 3.10 you can also write unions with <code>|</code>.`,
            codeExamples: [
                `from collections.abc import Iterable, Mapping, Sequence

print(isinstance([1, 2], Sequence))
print(isinstance("abc", Iterable))
print(isinstance({"a": 1}, Mapping))
print(isinstance({1, 2}, Sequence))       # sets have no order/indexing
print(isinstance(3.5, int | float))       # Python 3.10+

# OUTPUT:
# True
# True
# True
# False
# True`
            ]
        },
        {
            content: `<h3>type Is Itself a Class</h3>
Every class is an object, and the class of a class is <code>type</code>. Called with three arguments, <code>type(name, bases, namespace)</code> creates a brand-new class at runtime - this is the foundation of metaclasses.`,
            codeExamples: [
                `print(type(int), type(str), type(type))

Point = type("Point", (), {"x": 0, "y": 0})
p = Point()
print(Point.__name__, p.x, p.y)
print(issubclass(bool, int), issubclass(int, object))

# OUTPUT:
# <class 'type'> <class 'type'> <class 'type'>
# Point 0 0
# True True`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>type() vs isinstance()?</td><td>type() returns the exact class; isinstance() also returns True for subclasses, so it works with inheritance</td></tr>
<tr class='text-center'><td>How do you check for several types at once?</td><td>Pass a tuple: <code>isinstance(x, (int, float))</code>, or in 3.10+ <code>isinstance(x, int | float)</code></td></tr>
<tr class='text-center'><td>What is <code>isinstance(True, int)</code>?</td><td>True, because bool is a subclass of int</td></tr>
<tr class='text-center'><td>What is <code>type(type)</code>?</td><td><code>type</code> - it is its own metaclass</td></tr>
<tr class='text-center'><td>Is type checking Pythonic?</td><td>Use it sparingly - duck typing and ABC checks are preferred over checking concrete classes</td></tr>
</table>`
        }
    ]
};
