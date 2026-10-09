import type { Topic } from '../../types';

export const oopInPython: Topic = {
    id: 'python-oop',
    name: 'Object-Oriented Programming in Python',
    beginner: [
        {
            content: `<h4>Classes and Objects</h4>
A <b>class</b> is a blueprint that describes what data an object holds (<b>attributes</b>) and what it can do (<b>methods</b>). An <b>object</b> (or <b>instance</b>) is one concrete thing built from that blueprint. One <code>Student</code> class can produce thousands of student objects, each with its own name and marks.`,
            codeExamples: [
                `class Student:
    def __init__(self, name, marks):
        self.name = name          # attributes - data stored on each object
        self.marks = marks

    def has_passed(self):         # method - behaviour
        return self.marks >= 40


s1 = Student("Pankaj", 85)        # two separate objects
s2 = Student("Sheru", 32)

print(s1.name, s1.has_passed())
print(s2.name, s2.has_passed())
print(type(s1))

# OUTPUT:
# Pankaj True
# Sheru False
# <class '__main__.Student'>`
            ]
        },
        {
            content: `<h4>The Four Pillars at a Glance</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Pillar</th><th>Idea</th><th>In Python</th></tr>
<tr class='text-center'><td>Encapsulation</td><td>Bundle data with the methods that use it; hide internals</td><td>Classes, plus naming conventions (<code>_internal</code>, <code>__private</code>)</td></tr>
<tr class='text-center'><td>Inheritance</td><td>A class reuses and extends another class</td><td><code>class Child(Parent):</code> - multiple parents allowed</td></tr>
<tr class='text-center'><td>Polymorphism</td><td>One interface, many implementations</td><td>Method overriding and duck typing</td></tr>
<tr class='text-center'><td>Abstraction</td><td>Expose what an object does, not how</td><td>Abstract base classes (<code>abc</code>) and protocols</td></tr>
</table>
Each pillar has its own topic in this module.`
        },
        {
            content: `<h4>A Complete Small Class</h4>
A bank account keeps its balance and the rules for changing it in one place. Callers use the methods instead of editing the balance directly.`,
            codeExamples: [
                `class BankAccount:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self.balance = balance

    def deposit(self, amount):
        if amount <= 0:
            raise ValueError("deposit must be positive")
        self.balance += amount

    def withdraw(self, amount):
        if amount > self.balance:
            raise ValueError("insufficient funds")
        self.balance -= amount

    def __str__(self):
        return f"{self.owner}: ₹{self.balance}"


acc = BankAccount("Asha", 1000)
acc.deposit(500)
acc.withdraw(200)
print(acc)

try:
    acc.withdraw(5000)
except ValueError as error:
    print("Error:", error)

# OUTPUT:
# Asha: ₹1300
# Error: insufficient funds`
            ]
        },
        {
            content: `<h4>Everything Is an Object</h4>
In Python, numbers, strings, functions, modules and even classes are objects - each has a type and can have attributes and methods. Java has primitives (<code>int</code>, <code>double</code>) that are not objects; Python does not.`,
            codeExamples: [
                `print(type(42), (42).bit_length())
print(type("hi"), "hi".upper())
print(type(len))
print(type(int))                 # a class is itself an object, of type 'type'
print(isinstance(42, object), isinstance(len, object))

# OUTPUT:
# <class 'int'> 6
# <class 'str'> HI
# <class 'builtin_function_or_method'>
# <class 'type'>
# True True`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>How Python OOP Differs from Java</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Feature</th><th>Java</th><th>Python</th></tr>
<tr class='text-center'><td>Access control</td><td><code>private</code>/<code>protected</code>/<code>public</code> enforced by the compiler</td><td>Conventions only: <code>_name</code> (internal), <code>__name</code> (name-mangled)</td></tr>
<tr class='text-center'><td>Method overloading</td><td>Several methods with the same name</td><td>No - the last <code>def</code> wins; use default and variable arguments</td></tr>
<tr class='text-center'><td>Typing</td><td>Nominal: must implement the interface</td><td>Duck typing: any object with the right methods works</td></tr>
<tr class='text-center'><td>Inheritance</td><td>Single class inheritance + interfaces</td><td>Multiple inheritance, resolved by the MRO</td></tr>
<tr class='text-center'><td>Classes at runtime</td><td>Mostly fixed after compilation</td><td>Classes are objects; attributes can be added to objects and classes at runtime</td></tr>
<tr class='text-center'><td><code>this</code></td><td>Implicit</td><td><code>self</code> is an explicit first parameter</td></tr>
<tr class='text-center'><td>Fields</td><td>Declared in the class body</td><td>Usually created by assignment in <code>__init__</code></td></tr>
</table>`
        },
        {
            content: `<h3>Duck Typing in Action</h3>
No shared base class or interface is needed - Python only cares that the object has the method being called.`,
            codeExamples: [
                `class Upi:
    def pay(self, amount):
        return f"Paid ₹{amount} via UPI"

class Card:
    def pay(self, amount):
        return f"Paid ₹{amount} by card"

def checkout(method, amount):          # no type declared
    print(method.pay(amount))

checkout(Upi(), 499)
checkout(Card(), 1200)

# OUTPUT:
# Paid ₹499 via UPI
# Paid ₹1200 by card`
            ]
        },
        {
            content: `<h3>Objects Are Open by Default</h3>
A normal Python object stores its attributes in a dictionary, so new attributes can be attached at runtime - even to a class. It is flexible, but a typo silently creates a new attribute instead of failing. Later topics show <code>__slots__</code>, <code>@property</code> and dataclasses for tighter control.`,
            codeExamples: [
                `class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

p = Point(1, 2)
p.colour = "red"            # added at runtime - legal
p.xx = 10                   # typo for x: also "legal"!
print(p.__dict__)

# OUTPUT:
# {'x': 1, 'y': 2, 'colour': 'red', 'xx': 10}`
            ]
        },
        {
            content: `<h3>Modern Shortcut: dataclasses</h3>
For classes that mainly hold data, <code>@dataclass</code> writes <code>__init__</code>, <code>__repr__</code> and <code>__eq__</code> for you - similar to Java records or Lombok.`,
            codeExamples: [
                `from dataclasses import dataclass

@dataclass
class Product:
    name: str
    price: float
    qty: int = 1

pen = Product("Pen", 12.5, 4)
print(pen)
print(pen == Product("Pen", 12.5, 4))

# OUTPUT:
# Product(name='Pen', price=12.5, qty=4)
# True`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Class vs object?</td><td>A class is the blueprint; an object is an instance created from it with its own data</td></tr>
<tr class='text-center'><td>What are the four pillars of OOP?</td><td>Encapsulation, inheritance, polymorphism and abstraction</td></tr>
<tr class='text-center'><td>Does Python have private members?</td><td>Not enforced - <code>_name</code> is a convention, <code>__name</code> triggers name mangling</td></tr>
<tr class='text-center'><td>Does Python support method overloading?</td><td>No - use default arguments, *args/**kwargs or functools.singledispatch</td></tr>
<tr class='text-center'><td>What is duck typing?</td><td>Using any object that provides the needed methods, regardless of its class</td></tr>
<tr class='text-center'><td>Is a class an object in Python?</td><td>Yes - classes are instances of <code>type</code></td></tr>
</table>`
        }
    ]
};
