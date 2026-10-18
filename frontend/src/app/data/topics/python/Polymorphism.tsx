import type { Topic } from '../../types';

export const polymorphism: Topic = {
    id: 'python-oop-polymorphism',
    name: 'Polymorphism',
    beginner: [
        {
            content: `<h4>What is Polymorphism?</h4>
<b>Polymorphism</b> ("many forms") means one interface, many behaviours: code calls the same method on different objects, and each object responds in its own way. The caller doesn't need to know the exact class.`,
            codeExamples: [
                `class Circle:
    def __init__(self, r):
        self.r = r

    def area(self):
        return round(3.14159 * self.r ** 2, 2)

class Rectangle:
    def __init__(self, w, h):
        self.w = w
        self.h = h

    def area(self):
        return self.w * self.h

shapes = [Circle(1), Rectangle(3, 4), Circle(2)]
for s in shapes:
    print(type(s).__name__, s.area())     # same call, different behaviour

# OUTPUT:
# Circle 3.14
# Rectangle 12
# Circle 12.57`
            ]
        },
        {
            content: `<h4>Polymorphism Through Inheritance</h4>
As in Java, subclasses override a method of a common base class, and code written against the base class works with every subclass.`,
            codeExamples: [
                `class Employee:
    def __init__(self, name, salary):
        self.name = name
        self.salary = salary

    def bonus(self):
        return self.salary * 0.05

class Manager(Employee):
    def bonus(self):                      # overrides
        return self.salary * 0.15

class Intern(Employee):
    def bonus(self):
        return 1000

staff = [Employee("Abaji", 50000), Manager("Raoji", 90000), Intern("Kanhoji", 15000)]
for person in staff:
    print(f"{person.name}: {person.bonus()}")

# OUTPUT:
# Abaji: 2500.0
# Raoji: 13500.0
# Kanhoji: 1000`
            ]
        },
        {
            content: `<h4>Duck Typing: No Common Base Class Needed</h4>
Java needs a shared interface or superclass before two classes can be used interchangeably. Python only needs the <b>method to exist</b>: "if it walks like a duck and quacks like a duck, it's a duck".`,
            codeExamples: [
                `class EmailNotifier:
    def send(self, msg):
        return f"Email: {msg}"

class SmsNotifier:
    def send(self, msg):
        return f"SMS: {msg}"

class PushNotifier:
    def send(self, msg):
        return f"Push: {msg}"

def notify_all(notifiers, msg):
    for n in notifiers:                   # any object with .send() works
        print(n.send(msg))

notify_all([EmailNotifier(), SmsNotifier(), PushNotifier()], "Order shipped")

# OUTPUT:
# Email: Order shipped
# SMS: Order shipped
# Push: Order shipped`
            ]
        },
        {
            content: `<h4>Built-in Polymorphism</h4>
You have been using polymorphism all along: <code>len()</code>, <code>+</code> and <code>for</code> work on many different types.`,
            codeExamples: [
                `print(len("hello"), len([1, 2, 3]), len({"a": 1}))
print(1 + 2, "ab" + "cd", [1] + [2])

for item in ("x", "y"):
    print(item, end=" ")
for ch in "hi":
    print(ch, end=" ")
print()

# OUTPUT:
# 5 3 1
# 3 abcd [1, 2]
# x y h i`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>No Method Overloading</h3>
Java resolves overloads at compile time by parameter types. Python has no overloading: a second <code>def</code> with the same name replaces the first. Use default values, <code>*args</code>, or <code>functools.singledispatch</code> (dispatch on the type of the first argument).`,
            codeExamples: [
                `from functools import singledispatch

class Printer:
    def show(self, x):
        return f"one: {x}"

    def show(self, x, y):                 # replaces the first show()
        return f"two: {x}, {y}"

p = Printer()
print(p.show(1, 2))

@singledispatch
def describe(value):
    return f"something: {value}"

@describe.register
def _(value: int):
    return f"an int: {value}"

@describe.register
def _(value: list):
    return f"a list of {len(value)} items"

print(describe(7), "|", describe([1, 2]), "|", describe(2.5))
p.show(1)

# OUTPUT:
# two: 1, 2
# an int: 7 | a list of 2 items | something: 2.5
# TypeError: Printer.show() missing 1 required positional argument: 'y'`
            ]
        },
        {
            content: `<h3>Operator Overloading Is Polymorphism Too</h3>
Defining special methods such as <code>__add__</code>, <code>__eq__</code> or <code>__len__</code> lets your objects respond to operators and built-ins. The <i>Python Data Model</i> module covers this in depth.`,
            codeExamples: [
                `class Money:
    def __init__(self, amount):
        self.amount = amount

    def __add__(self, other):
        return Money(self.amount + other.amount)

    def __repr__(self):
        return f"Money({self.amount})"

print(Money(100) + Money(250))

# OUTPUT:
# Money(350)`
            ]
        },
        {
            content: `<h3>Making Duck Typing Checkable: Protocols</h3>
Duck typing is checked only at runtime - a missing method fails when it is called. <code>typing.Protocol</code> (see <i>Interfaces using Protocols</i>) describes the required methods so tools like mypy can check them before running, still without inheritance.`,
            codeExamples: [
                `class BrokenNotifier:
    def deliver(self, msg):               # wrong method name
        return msg

def notify(n, msg):
    return n.send(msg)

notify(BrokenNotifier(), "hi")

# OUTPUT:
# AttributeError: 'BrokenNotifier' object has no attribute 'send'`
            ]
        },
        {
            content: `<h3>Java vs Python Polymorphism</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>Java</th><th>Python</th></tr>
<tr class='text-center'><td>Compile-time (overloading)</td><td>Yes - chosen by parameter types</td><td>No - use defaults, *args or singledispatch</td></tr>
<tr class='text-center'><td>Runtime (overriding)</td><td>Yes - virtual methods</td><td>Yes - every method is "virtual"</td></tr>
<tr class='text-center'><td>Requirement to be interchangeable</td><td>Common interface/superclass</td><td>Just the right methods (duck typing)</td></tr>
<tr class='text-center'><td>Operator overloading</td><td>Not for user classes</td><td>Yes, via special methods</td></tr>
<tr class='text-center'><td>When errors appear</td><td>Compile time</td><td>Runtime (or with a type checker)</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is polymorphism?</td><td>The ability to call the same method on different objects and get type-specific behaviour</td></tr>
<tr class='text-center'><td>Does Python support method overloading?</td><td>No - the last definition wins; use default arguments, *args or functools.singledispatch</td></tr>
<tr class='text-center'><td>What is duck typing?</td><td>Using an object by the methods it has, not by its class or base class</td></tr>
<tr class='text-center'><td>Are Python methods virtual?</td><td>Yes - the method is looked up on the actual object's class at call time</td></tr>
<tr class='text-center'><td>Give examples of built-in polymorphism</td><td><code>len()</code> on str/list/dict, <code>+</code> on numbers/strings/lists, iteration over any iterable</td></tr>
</table>`
        }
    ]
};
