import type { Topic } from '../../types';

export const initStrRepr: Topic = {
    id: 'python-data-model-init-str-repr',
    name: '__init__, __str__ & __repr__',
    beginner: [
        {
            content: `<h4>__init__: Setting Up a New Object</h4>
<code>__init__</code> runs automatically right after an object is created and fills in its attributes. Strictly speaking it is an <b>initialiser</b>, not a constructor: the object already exists (created by <code>__new__</code>) and arrives as <code>self</code>. <code>__init__</code> must return <code>None</code>.`,
            codeExamples: [
                `class Student:
    def __init__(self, name, marks):
        self.name = name
        self.marks = marks

s = Student("Abaji", 91)
print(s.name, s.marks)

# OUTPUT:
# Abaji 91`,
                `class Broken:
    def __init__(self):
        return 42

Broken()

# OUTPUT:
# TypeError: __init__() should return None, not 'int'`
            ]
        },
        {
            content: `<h4>The Default Representation Is Not Helpful</h4>
Without help, printing an object shows only its class and memory address.`,
            codeExamples: [
                `class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

p = Point(3, 4)
print(p)

# OUTPUT:
# <__main__.Point object at 0x...>   (the address varies)`
            ]
        },
        {
            content: `<h4>__repr__ for Developers, __str__ for Users</h4>
• <code>__repr__</code> - an <b>unambiguous</b> description for developers: debugging, logs, the REPL. Ideally it looks like the code that would recreate the object.<br>
• <code>__str__</code> - a <b>readable</b> description for end users. Used by <code>print()</code>, <code>str()</code> and f-strings.<br><br>
Together they play the role of Java's <code>toString()</code>.`,
            codeExamples: [
                `class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __repr__(self):
        return f"Point({self.x!r}, {self.y!r})"

    def __str__(self):
        return f"({self.x}, {self.y})"

p = Point(3, 4)
print(p)                     # __str__
print(str(p), f"{p}")        # __str__
print(repr(p))               # __repr__
print([p, Point(0, 0)])      # containers use __repr__ for their items

# OUTPUT:
# (3, 4)
# (3, 4) (3, 4)
# Point(3, 4)
# [Point(3, 4), Point(0, 0)]`
            ]
        },
        {
            content: `<h4>Where Each One Is Used</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Situation</th><th>Uses</th></tr>
<tr class='text-center'><td><code>print(x)</code>, <code>str(x)</code>, <code>f"{x}"</code></td><td><code>__str__</code></td></tr>
<tr class='text-center'><td><code>repr(x)</code>, <code>f"{x!r}"</code></td><td><code>__repr__</code></td></tr>
<tr class='text-center'><td>Typing <code>x</code> at the REPL prompt</td><td><code>__repr__</code></td></tr>
<tr class='text-center'><td>Items inside a printed list, dict, tuple</td><td><code>__repr__</code></td></tr>
<tr class='text-center'><td>Debuggers and most logs of objects</td><td><code>__repr__</code></td></tr>
</table>`
        },
        {
            content: `<h4>The Fallback Rule</h4>
If a class defines only <code>__repr__</code>, <code>str()</code> and <code>print()</code> use it too. The reverse is <b>not</b> true: defining only <code>__str__</code> leaves <code>repr()</code> with the unhelpful default. So <b>always write <code>__repr__</code> first</b>; add <code>__str__</code> only if users need a different, friendlier form.`,
            codeExamples: [
                `class OnlyRepr:
    def __repr__(self):
        return "OnlyRepr()"

class OnlyStr:
    def __str__(self):
        return "friendly text"

print(OnlyRepr(), str(OnlyRepr()))
print(OnlyStr())
print([OnlyStr()])

# OUTPUT:
# OnlyRepr() OnlyRepr()
# friendly text
# [<__main__.OnlyStr object at 0x...>]   (the address varies)`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Writing a Good __repr__</h3>
• Use <code>!r</code> for each field, so strings appear quoted and the types are clear: <code>Product('Pen', 10)</code>, not <code>Product(Pen, 10)</code>.<br>
• Use <code>type(self).__name__</code> so subclasses show their own name.<br>
• When practical, make <code>eval(repr(obj))</code> recreate an equal object.`,
            codeExamples: [
                `class Product:
    def __init__(self, name, price):
        self.name = name
        self.price = price

    def __repr__(self):
        return f"{type(self).__name__}({self.name!r}, {self.price!r})"

class DigitalProduct(Product):
    pass

p = Product("Pen", 10)
print(repr(p))
print(DigitalProduct("E-book", 199))

copy = eval(repr(p))
print(copy.name, copy.price)

# OUTPUT:
# Product('Pen', 10)
# DigitalProduct('E-book', 199)
# Pen 10`
            ]
        },
        {
            content: `<h3>__format__ for Custom Format Specs</h3>
The text after the colon in <code>f"{x:spec}"</code> is passed to <code>x.__format__(spec)</code>. You can support your own spec codes and delegate everything else to the normal number formatting.`,
            codeExamples: [
                `class Money:
    def __init__(self, amount):
        self.amount = amount

    def __format__(self, spec):
        if spec == "inr":
            return f"₹{self.amount:,.2f}"
        return format(self.amount, spec)

m = Money(1234567.5)
print(f"{m:inr}")
print(f"{m:.1f}")
print(f"Total: {m:inr}")

# OUTPUT:
# ₹1,234,567.50
# 1234567.5
# Total: ₹1,234,567.50`
            ]
        },
        {
            content: `<h3>Let dataclasses Write It for You</h3>
<code>@dataclass</code> generates <code>__init__</code>, <code>__repr__</code> and <code>__eq__</code> from the field list - a good default for classes that mainly hold data.`,
            codeExamples: [
                `from dataclasses import dataclass

@dataclass
class Product:
    name: str
    price: float
    qty: int = 1

item = Product("Pen", 10.5)
print(item)
print([item, Product("Book", 299.0, 2)])

# OUTPUT:
# Product(name='Pen', price=10.5, qty=1)
# [Product(name='Pen', price=10.5, qty=1), Product(name='Book', price=299.0, qty=2)]`
            ]
        },
        {
            content: `<h3>Keeping Long Reprs Short: reprlib</h3>
A <code>__repr__</code> that dumps thousands of items makes logs unreadable. <code>reprlib.repr()</code> abbreviates large containers.`,
            codeExamples: [
                `import reprlib

data = list(range(100))
print(reprlib.repr(data))
print(reprlib.repr("x" * 100))

class Dataset:
    def __init__(self, rows):
        self.rows = rows

    def __repr__(self):
        return f"Dataset({reprlib.repr(self.rows)})"

print(Dataset(list(range(1000))))

# OUTPUT:
# [0, 1, 2, 3, 4, 5, ...]
# 'xxxxxxxxxxxx...xxxxxxxxxxxxx'
# Dataset([0, 1, 2, 3, 4, 5, ...])`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>__str__ vs __repr__?</td><td>__repr__ is an unambiguous developer representation; __str__ is a readable user-facing one</td></tr>
<tr class='text-center'><td>Which does print() use?</td><td>__str__, falling back to __repr__ if __str__ is not defined</td></tr>
<tr class='text-center'><td>Which one do containers use for their items?</td><td>__repr__</td></tr>
<tr class='text-center'><td>If you implement only one, which?</td><td>__repr__ - str() falls back to it, but not the other way round</td></tr>
<tr class='text-center'><td>Is __init__ a constructor?</td><td>It is an initialiser: __new__ creates the object, __init__ sets it up and must return None</td></tr>
<tr class='text-center'><td>What does <code>!r</code> do in an f-string?</td><td>Formats the value with repr() instead of str()</td></tr>
</table>`
        }
    ]
};
