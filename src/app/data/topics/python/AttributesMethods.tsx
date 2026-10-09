import type { Topic } from '../../types';

export const attributesMethods: Topic = {
    id: 'python-oop-attributes-methods',
    name: 'Attributes & Methods',
    beginner: [
        {
            content: `<h4>Instance Attributes</h4>
An <b>instance attribute</b> is a variable that belongs to one object. It is created by assigning to <code>self.name</code>, usually in <code>__init__</code>. Each object has its own copy - changing one object never changes another. They play the role of Java's instance fields, but are not declared in advance.`,
            codeExamples: [
                `class Course:
    def __init__(self, title, fee):
        self.title = title
        self.fee = fee

java = Course("Core Java", 4999)
python = Course("Python", 3999)

python.fee = 2999                 # change one object only
print(java.title, java.fee)
print(python.title, python.fee)

# OUTPUT:
# Core Java 4999
# Python 2999`
            ]
        },
        {
            content: `<h4>Methods and self</h4>
A <b>method</b> is a function defined inside a class. Its first parameter, by convention named <code>self</code>, receives the object the method was called on - so the method can read and change that object's attributes.`,
            codeExamples: [
                `class Cart:
    def __init__(self):
        self.items = []

    def add(self, item, price):
        self.items.append((item, price))

    def total(self):
        return sum(price for _, price in self.items)

cart = Cart()
cart.add("Pen", 10)
cart.add("Notebook", 45)
print(cart.items)
print(cart.total())

# OUTPUT:
# [('Pen', 10), ('Notebook', 45)]
# 55`
            ]
        },
        {
            content: `<h4>Missing Attributes</h4>
Reading an attribute that doesn't exist raises <code>AttributeError</code>.`,
            codeExamples: [
                `class Course:
    def __init__(self, title):
        self.title = title

c = Course("Python")
print(c.title)
print(c.duration)

# OUTPUT:
# Python
# AttributeError: 'Course' object has no attribute 'duration'`
            ]
        },
        {
            content: `<h4>Attributes Can Be Added Later - But Shouldn't Be</h4>
Python lets you attach a new attribute to an object at any time. It works, but only that one object gets it, and readers of the class can't see it exists. Create every attribute in <code>__init__</code> (use <code>None</code> if there is no value yet).`,
            codeExamples: [
                `class Course:
    def __init__(self, title):
        self.title = title
        self.mentor = None          # declared up front, even if unknown

a = Course("Python")
b = Course("Java")
a.discount = 10                 # only a has this

print(a.discount)
print(hasattr(b, "discount"))

# OUTPUT:
# 10
# False`
            ]
        },
        {
            content: `<h4>__dict__ and the Attribute Functions</h4>
An object's attributes live in a dictionary, <code>obj.__dict__</code>. The built-ins <code>getattr</code>, <code>setattr</code>, <code>hasattr</code> and <code>delattr</code> work with attribute names given as <b>strings</b> - handy when the name comes from data.`,
            codeExamples: [
                `class Student:
    def __init__(self, name, city):
        self.name = name
        self.city = city

s = Student("Asha", "Pune")
print(s.__dict__)

field = "city"
print(getattr(s, field))
setattr(s, "marks", 91)
print(hasattr(s, "marks"), getattr(s, "email", "not set"))
delattr(s, "city")
print(s.__dict__)

# OUTPUT:
# {'name': 'Asha', 'city': 'Pune'}
# Pune
# True not set
# {'name': 'Asha', 'marks': 91}`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>obj.method() Is Class.method(obj)</h3>
When you look up a method on an instance, Python returns a <b>bound method</b>: the function with the instance already filled in as <code>self</code>. Calling <code>obj.method(x)</code> is exactly <code>Class.method(obj, x)</code>. That is why <code>self</code> must be written explicitly in the definition - it really is just the first argument.`,
            codeExamples: [
                `class Greeter:
    def __init__(self, name):
        self.name = name

    def greet(self, other):
        return f"{self.name} greets {other}"

g = Greeter("Asha")
print(g.greet("Ravi"))
print(Greeter.greet(g, "Ravi"))      # identical call

bound = g.greet                      # a bound method object
print(bound("Kiran"))
print(bound.__self__ is g, bound.__func__ is Greeter.greet)

# OUTPUT:
# Asha greets Ravi
# Asha greets Ravi
# Asha greets Kiran
# True True`
            ]
        },
        {
            content: `<h3>Attribute Lookup Order</h3>
For <code>obj.x</code>, Python checks the <b>instance</b> (<code>obj.__dict__</code>) first, then the <b>class</b>, then the <b>base classes</b> in MRO order (a simplification - data descriptors such as properties take priority, covered later). Methods are found on the class, which is why every instance shares one copy of each method.`,
            codeExamples: [
                `class Base:
    level = "base"

class Child(Base):
    kind = "child-class"

c = Child()
print(c.level, c.kind)       # found on Base and Child
c.kind = "instance"          # instance attribute now shadows the class one
print(c.kind, Child.kind)
print("greet" in c.__dict__, "kind" in c.__dict__)

# OUTPUT:
# base child-class
# instance child-class
# False True`
            ]
        },
        {
            content: `<h3>Preview: __slots__</h3>
Declaring <code>__slots__</code> replaces the per-instance <code>__dict__</code> with fixed storage for the listed names. Objects use less memory and typos fail loudly instead of creating new attributes. It is covered in depth in the Advanced Python module.`,
            codeExamples: [
                `class Point:
    __slots__ = ("x", "y")

    def __init__(self, x, y):
        self.x = x
        self.y = y

p = Point(1, 2)
p.x = 10
print(p.x, hasattr(p, "__dict__"))
p.z = 3

# OUTPUT:
# 10 False
# AttributeError: 'Point' object has no attribute 'z'`
            ]
        },
        {
            content: `<h3>Methods vs Attributes: Forgetting the Parentheses</h3>
<code>obj.method</code> without <code>()</code> is the bound method object itself, which is always truthy - a classic bug in conditions.`,
            codeExamples: [
                `class Order:
    def __init__(self, paid):
        self.paid = paid

    def is_paid(self):
        return self.paid

order = Order(False)
if order.is_paid:                 # BUG: no call - always true
    print("shipping (wrong!)")
if order.is_paid():
    print("shipping")
else:
    print("waiting for payment")

# OUTPUT:
# shipping (wrong!)
# waiting for payment`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Where are instance attributes stored?</td><td>In the object's <code>__dict__</code> (unless the class uses <code>__slots__</code>)</td></tr>
<tr class='text-center'><td>What is self?</td><td>The instance the method is called on, passed automatically as the first argument</td></tr>
<tr class='text-center'><td>What does <code>obj.method(x)</code> translate to?</td><td><code>type(obj).method(obj, x)</code> - via a bound method</td></tr>
<tr class='text-center'><td>How do you read an attribute whose name is in a string?</td><td><code>getattr(obj, name, default)</code></td></tr>
<tr class='text-center'><td>In what order is an attribute looked up?</td><td>Instance, then class, then base classes along the MRO (data descriptors first)</td></tr>
<tr class='text-center'><td>Why not add attributes outside __init__?</td><td>Objects end up with different shapes, the class no longer documents its data, and typos go unnoticed</td></tr>
</table>`
        }
    ]
};
