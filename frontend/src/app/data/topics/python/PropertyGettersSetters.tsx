import type { Topic } from '../../types';

export const propertyGettersSetters: Topic = {
    id: 'python-oop-property-getters-setters',
    name: '@property, Getters & Setters',
    beginner: [
        {
            content: `<h4>Java-Style Getters and Setters Aren't Pythonic</h4>
In Java, fields are private and you write <code>getBalance()</code> / <code>setBalance()</code> "just in case" you need logic later. In Python you start with a <b>plain public attribute</b>. If you later need logic, you turn it into a <b>property</b> - and callers keep writing <code>obj.balance</code>, unchanged.`,
            codeExamples: [
                `# Java style - works, but verbose in Python
class AccountJavaStyle:
    def __init__(self, balance):
        self._balance = balance

    def get_balance(self):
        return self._balance

    def set_balance(self, value):
        self._balance = value

# Pythonic - a plain attribute
class Account:
    def __init__(self, balance):
        self.balance = balance

a = Account(500)
a.balance += 100
print(a.balance, AccountJavaStyle(500).get_balance())

# OUTPUT:
# 600 500`
            ]
        },
        {
            content: `<h4>@property: A Method Read Like an Attribute</h4>
<code>@property</code> turns a method into a <b>computed attribute</b>: you access it without parentheses, and its value is calculated each time.`,
            codeExamples: [
                `class Rectangle:
    def __init__(self, width, height):
        self.width = width
        self.height = height

    @property
    def area(self):
        return self.width * self.height

r = Rectangle(3, 4)
print(r.area)                 # no ()
r.width = 10
print(r.area)                 # always up to date

# OUTPUT:
# 12
# 40`
            ]
        },
        {
            content: `<h4>Setters with Validation</h4>
Add <code>@name.setter</code> to run code when the attribute is assigned. The value is stored in a "private" attribute with a leading underscore.`,
            codeExamples: [
                `class Student:
    def __init__(self, name, marks):
        self.name = name
        self.marks = marks            # goes through the setter too

    @property
    def marks(self):
        return self._marks

    @marks.setter
    def marks(self, value):
        if not 0 <= value <= 100:
            raise ValueError("marks must be between 0 and 100")
        self._marks = value

s = Student("Abaji", 88)
s.marks = 95
print(s.marks)
s.marks = 120

# OUTPUT:
# 95
# ValueError: marks must be between 0 and 100`
            ]
        },
        {
            content: `<h4>Read-Only Properties</h4>
A property with no setter can be read but not assigned.`,
            codeExamples: [
                `class Circle:
    def __init__(self, radius):
        self.radius = radius

    @property
    def diameter(self):
        return self.radius * 2

c = Circle(5)
print(c.diameter)
c.diameter = 20

# OUTPUT:
# 10
# AttributeError: property 'diameter' of 'Circle' object has no setter`
            ]
        },
        {
            content: `<h4>Deleters</h4>
<code>@name.deleter</code> runs on <code>del obj.name</code> - rarely needed, but useful for clearing cached or sensitive data.`,
            codeExamples: [
                `class Session:
    def __init__(self, token):
        self._token = token

    @property
    def token(self):
        return self._token

    @token.deleter
    def token(self):
        print("logging out")
        self._token = None

s = Session("abc123")
del s.token
print(s.token)

# OUTPUT:
# logging out
# None`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Upgrading an Attribute Without Breaking Callers</h3>
This is the real reason Python doesn't need defensive getters/setters: the access syntax is the same for a plain attribute and a property. You can add validation years later, and every <code>obj.price = ...</code> in the codebase automatically goes through it.`,
            codeExamples: [
                `# Version 1: a plain attribute
class Product:
    def __init__(self, price):
        self.price = price

# Version 2: same public name, now validated - callers unchanged
class Product:
    def __init__(self, price):
        self.price = price

    @property
    def price(self):
        return self._price

    @price.setter
    def price(self, value):
        if value < 0:
            raise ValueError("price cannot be negative")
        self._price = value

p = Product(499)
p.price = 450                       # same caller code as version 1
print(p.price)

# OUTPUT:
# 450`
            ]
        },
        {
            content: `<h3>cached_property for Expensive Values</h3>
A property recomputes on every access. <code>functools.cached_property</code> computes once per object and then stores the result in the instance - good for expensive values that don't change.`,
            codeExamples: [
                `from functools import cached_property

class Report:
    def __init__(self, rows):
        self.rows = rows
        self.computations = 0

    @cached_property
    def total(self):
        self.computations += 1
        return sum(self.rows)

r = Report([10, 20, 30])
print(r.total, r.total, r.total)
print("computed", r.computations, "time(s)")

# OUTPUT:
# 60 60 60
# computed 1 time(s)`
            ]
        },
        {
            content: `<h3>Keep Properties Cheap</h3>
Readers assume <code>obj.x</code> is fast and has no side effects. If something is slow (a database query, a network call) or changes state, make it a <b>method</b> with a verb name (<code>fetch_orders()</code>) so the cost is visible at the call site. Name properties as nouns or adjectives (<code>area</code>, <code>is_empty</code>).`
        },
        {
            content: `<h3>Under the Hood: property Is a Descriptor</h3>
<code>@property</code> is shorthand for creating a <code>property</code> object - a <b>descriptor</b> with <code>__get__</code>, <code>__set__</code> and <code>__delete__</code> methods - stored on the class. That is why it lives on the class but intercepts access on instances. The <i>Advanced Python</i> module covers descriptors in depth.`,
            codeExamples: [
                `class Rectangle:
    def __init__(self, w, h):
        self.w = w
        self.h = h

    def _get_area(self):
        return self.w * self.h

    area = property(_get_area)       # the same as using @property

r = Rectangle(2, 5)
print(r.area, type(Rectangle.__dict__["area"]).__name__)

# OUTPUT:
# 10 property`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why don't Python classes need getX/setX methods?</td><td>A plain attribute can later become a property without changing how callers access it</td></tr>
<tr class='text-center'><td>What does @property do?</td><td>Turns a method into an attribute-style accessor computed on each access</td></tr>
<tr class='text-center'><td>How do you make an attribute read-only?</td><td>Define a property without a setter; assignment raises AttributeError</td></tr>
<tr class='text-center'><td>Where does a property store its value?</td><td>Usually in an underscore attribute such as <code>self._marks</code></td></tr>
<tr class='text-center'><td>property vs cached_property?</td><td>property recomputes every access; cached_property computes once per instance and caches the result</td></tr>
<tr class='text-center'><td>What is a property under the hood?</td><td>A descriptor object stored on the class</td></tr>
</table>`
        }
    ]
};
