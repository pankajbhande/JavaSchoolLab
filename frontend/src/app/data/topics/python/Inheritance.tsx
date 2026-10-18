import type { Topic } from '../../types';

export const inheritance: Topic = {
    id: 'python-oop-inheritance',
    name: 'Inheritance',
    beginner: [
        {
            content: `<h4>What is Inheritance?</h4>
<b>Inheritance</b> lets a new class (the <b>child</b> or subclass) reuse the attributes and methods of an existing class (the <b>parent</b> or base class), then add or change what it needs. It models an <b>"is-a"</b> relationship: a <code>Car</code> <i>is a</i> <code>Vehicle</code>. Python writes the parent in parentheses where Java writes <code>extends</code>.`,
            codeExamples: [
                `class Vehicle:
    def __init__(self, brand):
        self.brand = brand

    def start(self):
        return f"{self.brand} is starting"

class Car(Vehicle):              # Java: class Car extends Vehicle
    pass

c = Car("Tata")
print(c.start())                 # inherited method
print(c.brand)                   # inherited attribute

# OUTPUT:
# Tata is starting
# Tata`
            ]
        },
        {
            content: `<h4>Extending the Parent</h4>
A child can add new methods and attributes. To keep the parent's set-up, call its <code>__init__</code> with <code>super().__init__(...)</code> (the <i>super()</i> topic covers it in detail).`,
            codeExamples: [
                `class Vehicle:
    def __init__(self, brand):
        self.brand = brand

    def start(self):
        return f"{self.brand} is starting"

class Car(Vehicle):
    def __init__(self, brand, seats):
        super().__init__(brand)          # let Vehicle set brand
        self.seats = seats               # Car's own attribute

    def describe(self):                  # new method
        return f"{self.brand} car with {self.seats} seats"

c = Car("Mahindra", 7)
print(c.start())
print(c.describe())

# OUTPUT:
# Mahindra is starting
# Mahindra car with 7 seats`
            ]
        },
        {
            content: `<h4>Overriding a Method</h4>
Defining a method with the same name in the child replaces the parent's version for child objects (the <i>Method Overriding</i> topic goes deeper).`,
            codeExamples: [
                `class Employee:
    def __init__(self, name, salary):
        self.name = name
        self.salary = salary

    def bonus(self):
        return self.salary * 0.10

class Manager(Employee):
    def bonus(self):                     # overrides Employee.bonus
        return self.salary * 0.20

for person in [Employee("Raoji", 50000), Manager("Abaji", 80000)]:
    print(person.name, person.bonus())

# OUTPUT:
# Raoji 5000.0
# Abaji 16000.0`
            ]
        },
        {
            content: `<h4>isinstance() and issubclass()</h4>
A child object is also an instance of every parent class. Every class ultimately inherits from <code>object</code>, just as every Java class extends <code>Object</code>.`,
            codeExamples: [
                `class Animal:
    pass

class Dog(Animal):
    pass

d = Dog()
print(isinstance(d, Dog), isinstance(d, Animal), isinstance(d, object))
print(issubclass(Dog, Animal), issubclass(Animal, Dog))
print(Dog.__bases__, Animal.__bases__)

# OUTPUT:
# True True True
# True False
# (<class '__main__.Animal'>,) (<class 'object'>,)`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Inheritance vs Composition</h3>
Inheritance means "is-a"; <b>composition</b> means "has-a" - an object holds other objects and delegates to them. Composition is usually more flexible: parts can be swapped, and you don't inherit methods you don't want. Prefer it unless the child truly is a specialised kind of the parent.`,
            codeExamples: [
                `class Engine:
    def __init__(self, hp):
        self.hp = hp

    def start(self):
        return f"{self.hp} hp engine started"

class ElectricMotor:
    def start(self):
        return "silent motor started"

class Car:                                 # a car HAS an engine
    def __init__(self, brand, engine):
        self.brand = brand
        self.engine = engine

    def start(self):
        return f"{self.brand}: {self.engine.start()}"

print(Car("Tata", Engine(110)).start())
print(Car("Tata EV", ElectricMotor()).start())   # swap the part, same Car class

# OUTPUT:
# Tata: 110 hp engine started
# Tata EV: silent motor started`
            ]
        },
        {
            content: `<h3>Signs of a Bad Hierarchy</h3>
• <b>Deep chains</b> (5+ levels): behaviour is scattered and hard to trace.<br>
• <b>Refused bequest</b>: a child overrides a parent method just to raise an error, because it isn't really that kind of thing.<br>
• <b>Inheritance only to reuse code</b>, with no real is-a relationship - use composition or a helper function.<br>
• <b>Fragile base class</b>: a small change in the parent silently breaks children.`
        },
        {
            content: `<h3>Inheriting from Built-in Types</h3>
You can subclass <code>list</code>, <code>dict</code> or <code>str</code>, but the built-ins are implemented in C and their methods don't call each other through your overrides. Overriding <code>__setitem__</code> on a <code>dict</code> subclass is ignored by <code>update()</code> and the constructor. <code>collections.UserDict</code> / <code>UserList</code> are written in Python and respect overrides.`,
            codeExamples: [
                `from collections import UserDict

class UpperDict(dict):
    def __setitem__(self, key, value):
        super().__setitem__(key.upper(), value)

class UpperUserDict(UserDict):
    def __setitem__(self, key, value):
        super().__setitem__(key.upper(), value)

d1 = UpperDict(a=1)
d1["b"] = 2
d1.update(c=3)
print(d1)                          # constructor and update() bypassed the override

d2 = UpperUserDict(a=1)
d2["b"] = 2
d2.update(c=3)
print(d2)

# OUTPUT:
# {'a': 1, 'B': 2, 'c': 3}
# {'A': 1, 'B': 2, 'C': 3}`
            ]
        },
        {
            content: `<h3>Python vs Java Inheritance</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>Java</th><th>Python</th></tr>
<tr class='text-center'><td>Syntax</td><td><code>class B extends A</code></td><td><code>class B(A):</code></td></tr>
<tr class='text-center'><td>Multiple inheritance</td><td>Classes: no (interfaces: yes)</td><td>Yes - <code>class C(A, B):</code>, ordered by the MRO</td></tr>
<tr class='text-center'><td>Root class</td><td><code>Object</code></td><td><code>object</code></td></tr>
<tr class='text-center'><td>Preventing inheritance</td><td><code>final class</code></td><td>No keyword; <code>typing.final</code> is a hint for type checkers</td></tr>
<tr class='text-center'><td>Parent constructor</td><td><code>super(...)</code> must be first</td><td><code>super().__init__(...)</code> - optional, anywhere, but usually first</td></tr>
<tr class='text-center'><td>Overriding check</td><td><code>@Override</code></td><td><code>typing.override</code> (3.12+), for type checkers</td></tr>
</table>
Multiple inheritance and method resolution order have their own topic.`
        },
        {
            content: `<h3>Forgetting to Call the Parent __init__</h3>
If the child defines <code>__init__</code> and doesn't call <code>super().__init__()</code>, the parent's attributes are never created - an <code>AttributeError</code> appears later, far from the cause.`,
            codeExamples: [
                `class Vehicle:
    def __init__(self, brand):
        self.brand = brand

class Bike(Vehicle):
    def __init__(self, brand, gears):
        self.gears = gears                 # forgot super().__init__(brand)

b = Bike("Hero", 21)
print(b.gears)
print(b.brand)

# OUTPUT:
# 21
# AttributeError: 'Bike' object has no attribute 'brand'`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>How do you inherit in Python?</td><td>Put the parent class in parentheses: <code>class Child(Parent):</code></td></tr>
<tr class='text-center'><td>Does Python support multiple inheritance?</td><td>Yes - the MRO (C3 linearisation) decides lookup order</td></tr>
<tr class='text-center'><td>What does every class inherit from?</td><td><code>object</code></td></tr>
<tr class='text-center'><td>Inheritance vs composition?</td><td>Inheritance models is-a and shares implementation; composition models has-a and delegates - usually more flexible</td></tr>
<tr class='text-center'><td>Why subclass UserDict instead of dict?</td><td>dict's C methods (update, constructor) bypass overridden methods; UserDict respects them</td></tr>
<tr class='text-center'><td>What happens if a child __init__ doesn't call super().__init__()?</td><td>The parent's initialisation is skipped, so its attributes are missing</td></tr>
</table>`
        }
    ]
};
