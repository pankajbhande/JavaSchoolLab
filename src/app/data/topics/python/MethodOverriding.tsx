import type { Topic } from '../../types';

export const methodOverriding: Topic = {
    id: 'python-oop-method-overriding',
    name: 'Method Overriding',
    beginner: [
        {
            content: `<h4>What is Method Overriding?</h4>
When a child class defines a method with the <b>same name</b> as a method in its parent, the child's version <b>overrides</b> the parent's. Calls on a child object use the child's method - even calls made from code inside the parent class. This is how one interface gets different behaviour per class (runtime polymorphism), exactly as in Java.`,
            codeExamples: [
                `class Animal:
    def speak(self):
        return "..."

class Dog(Animal):
    def speak(self):                 # overrides Animal.speak
        return "Woof"

class Cat(Animal):
    def speak(self):
        return "Meow"

for animal in [Animal(), Dog(), Cat()]:
    print(type(animal).__name__, animal.speak())

# OUTPUT:
# Animal ...
# Dog Woof
# Cat Meow`
            ]
        },
        {
            content: `<h4>Replacing vs Extending</h4>
An override can <b>replace</b> the parent's behaviour completely, or <b>extend</b> it by calling the parent version with <code>super()</code> and adding to the result.`,
            codeExamples: [
                `class Employee:
    def __init__(self, name, salary):
        self.name = name
        self.salary = salary

    def annual_pay(self):
        return self.salary * 12

    def describe(self):
        return f"{self.name} earns {self.annual_pay()}"   # calls the overridden version too

class Manager(Employee):
    def annual_pay(self):
        return super().annual_pay() + 50000    # extend: parent result + bonus

print(Employee("Abaji", 40000).describe())
print(Manager("Raoji", 60000).describe())

# OUTPUT:
# Abaji earns 480000
# Raoji earns 770000`
            ],
            codeExplanations: [
                `describe() is defined only in Employee, but inside it self.annual_pay() is looked up on the actual object. For the Manager object that finds Manager.annual_pay, which first calls the parent's version through super() (60000 * 12 = 720000) and then adds the 50000 bonus. This is the same dynamic dispatch Java uses for non-static, non-final methods.`
            ]
        },
        {
            content: `<h4>Overriding Methods Inherited from object</h4>
Every class inherits from <code>object</code>, which supplies default <code>__str__</code>, <code>__repr__</code> and <code>__eq__</code>. The default string shows a memory address and the default equality compares identity - override them to give your objects meaningful behaviour, like <code>toString()</code> and <code>equals()</code> in Java.`,
            codeExamples: [
                `class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

p = Point(1, 2)
print(p)
print(p == Point(1, 2))

# OUTPUT (the address varies):
# <__main__.Point object at 0x...>
# False`,
                `class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __str__(self):                       # like toString()
        return f"({self.x}, {self.y})"

    def __eq__(self, other):                 # like equals()
        if not isinstance(other, Point):
            return NotImplemented
        return (self.x, self.y) == (other.x, other.y)

print(Point(1, 2))
print(Point(1, 2) == Point(1, 2), Point(1, 2) == "text")

# OUTPUT:
# (1, 2)
# True False`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>No @Override - but typing.override (3.12+)</h3>
Java's <code>@Override</code> makes the compiler reject a method that doesn't actually override anything - catching typos. Python has no such check at runtime: a misspelled method is simply a new method. Python 3.12 added <code>typing.override</code>; it does nothing at runtime except mark the function, but type checkers such as mypy and Pyright report an error when a marked method has no matching parent method.`,
            codeExamples: [
                `from typing import override

class Report:
    def render(self):
        return "plain report"

class HtmlReport(Report):
    @override
    def render(self):
        return "<h1>report</h1>"

    @override
    def rendr(self):                  # typo: a type checker flags this line
        return "oops"

print(HtmlReport().render())
print(HtmlReport.render.__override__)

# OUTPUT:
# <h1>report</h1>
# True
#
# Python itself runs this without complaint; mypy/Pyright report that
# "rendr" is marked as an override but no base method has that name.`
            ]
        },
        {
            content: `<h3>Overriding vs Overloading</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th></th><th>Overriding</th><th>Overloading</th></tr>
<tr class='text-center'><td>Meaning</td><td>Child redefines a parent method with the same name</td><td>Several methods with the same name but different parameters</td></tr>
<tr class='text-center'><td>Java</td><td>Supported (<code>@Override</code>)</td><td>Supported, resolved at compile time</td></tr>
<tr class='text-center'><td>Python</td><td>Supported</td><td>Not supported - a later <code>def</code> replaces the earlier one; use default arguments, <code>*args</code> or <code>functools.singledispatchmethod</code></td></tr>
</table>
<code>typing.overload</code> exists, but only describes alternative signatures to type checkers - it does not create real overloads.`
        },
        {
            content: `<h3>Keep Overrides Compatible (Liskov Substitution)</h3>
Code written for the parent must keep working with any child. An override that changes the parameters - or raises errors the parent never did - breaks every caller that treats the objects uniformly.`,
            codeExamples: [
                `class Shape:
    def area(self):
        return 0

class Square(Shape):
    def __init__(self, side):
        self.side = side

    def area(self, unit):                 # BAD: extra required parameter
        return f"{self.side ** 2} {unit}"

shapes = [Shape(), Square(3)]
for s in shapes:
    print(s.area())

# OUTPUT:
# 0
# TypeError: Square.area() missing 1 required positional argument: 'unit'`
            ],
            codeExplanations: [
                `The loop is written against the Shape interface: area() with no arguments. Square changed that contract by requiring a unit, so the very first polymorphic call on a Square fails. Keep the same parameters in overrides; if a child needs extra options, make them optional (e.g. unit="sq cm") so the parent-style call still works.`
            ]
        },
        {
            content: `<h3>Overriding Class Attributes</h3>
Overriding isn't limited to methods. A child can redefine a <b>class attribute</b>, and inherited methods that read it through <code>self</code> pick up the child's value - a light-weight way to customise behaviour without rewriting methods.`,
            codeExamples: [
                `class Account:
    interest_rate = 0.03

    def interest(self, balance):
        return round(balance * self.interest_rate, 2)

class SavingsAccount(Account):
    interest_rate = 0.05                 # only the data changes

print(Account().interest(1000))
print(SavingsAccount().interest(1000))

# OUTPUT:
# 30.0
# 50.0`
            ]
        },
        {
            content: `<h3>Java vs Python Overriding Rules</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Rule</th><th>Java</th><th>Python</th></tr>
<tr class='text-center'><td>Check that a method really overrides</td><td><code>@Override</code>, enforced by the compiler</td><td><code>@typing.override</code>, enforced only by type checkers</td></tr>
<tr class='text-center'><td>Prevent overriding</td><td><code>final</code> method</td><td><code>@typing.final</code> - again only for type checkers</td></tr>
<tr class='text-center'><td>Static/class methods</td><td>Static methods are hidden, not overridden</td><td>Class methods and static methods can be overridden like any attribute</td></tr>
<tr class='text-center'><td>Access level</td><td>Cannot reduce visibility</td><td>No access modifiers</td></tr>
<tr class='text-center'><td>Calling the parent version</td><td><code>super.method()</code></td><td><code>super().method()</code></td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is method overriding?</td><td>A child class redefining a method inherited from its parent; calls on child objects use the child's version</td></tr>
<tr class='text-center'><td>How do you call the parent's version from an override?</td><td><code>super().method_name(...)</code></td></tr>
<tr class='text-center'><td>Does Python support method overloading?</td><td>No - the last definition wins; use default or variable arguments instead</td></tr>
<tr class='text-center'><td>What is Python's equivalent of @Override?</td><td><code>typing.override</code> (3.12+), checked by static type checkers, not at runtime</td></tr>
<tr class='text-center'><td>Which object methods are commonly overridden?</td><td><code>__str__</code>, <code>__repr__</code>, <code>__eq__</code> (with <code>__hash__</code>), and comparison methods</td></tr>
<tr class='text-center'><td>Why keep an override's signature compatible?</td><td>So code written against the parent works with every child (Liskov Substitution Principle)</td></tr>
</table>`
        }
    ]
};
