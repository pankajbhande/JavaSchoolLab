import type { Topic } from '../../types';

export const superFunction: Topic = {
    id: 'python-oop-super',
    name: 'super()',
    beginner: [
        {
            content: `<h4>What Does super() Do?</h4>
<code>super()</code> gives you access to methods of the <b>parent class</b> from inside a child class. Its most common job is calling the parent's <code>__init__</code> so the parent can set up its own attributes - just like <code>super(...)</code> as the first line of a Java constructor. Python does <b>not</b> call the parent constructor automatically.`,
            codeExamples: [
                `class Vehicle:
    def __init__(self, brand, wheels):
        self.brand = brand
        self.wheels = wheels

class Car(Vehicle):
    def __init__(self, brand, model):
        super().__init__(brand, 4)       # let Vehicle set brand and wheels
        self.model = model               # then add Car's own attribute

c = Car("Tata", "Nexon")
print(c.brand, c.model, c.wheels)

# OUTPUT:
# Tata Nexon 4`
            ]
        },
        {
            content: `<h4>Forgetting to Call the Parent __init__</h4>
If the child defines its own <code>__init__</code> and never calls the parent's, the parent's attributes are simply never created.`,
            codeExamples: [
                `class Vehicle:
    def __init__(self, brand):
        self.brand = brand

class Bike(Vehicle):
    def __init__(self, brand, gears):
        self.gears = gears               # forgot super().__init__(brand)

b = Bike("Hero", 21)
print(b.gears)
print(b.brand)

# OUTPUT:
# 21
# AttributeError: 'Bike' object has no attribute 'brand'`
            ]
        },
        {
            content: `<h4>Calling Other Parent Methods</h4>
<code>super()</code> works for any method, not just <code>__init__</code>. Use it to extend a parent method instead of copying its code.`,
            codeExamples: [
                `class Notification:
    def format(self, text):
        return text.strip()

class UrgentNotification(Notification):
    def format(self, text):
        return "URGENT: " + super().format(text).upper()

print(UrgentNotification().format("  server down  "))

# OUTPUT:
# URGENT: SERVER DOWN`
            ]
        },
        {
            content: `<h4>super() vs Parent.__init__(self)</h4>
You can also call the parent explicitly by name: <code>Vehicle.__init__(self, brand, 4)</code>. It works for simple single inheritance, but:<br>
• it hard-codes the parent's name - rename or re-parent the class and every call must change;<br>
• with multiple inheritance it can run a shared base class twice (see the Expert tab).<br><br>
In Python 3, write <code>super().method(...)</code> with no arguments. The old two-argument form <code>super(Car, self)</code> still works and is mainly seen in Python 2 era code.`
        }
    ],

    expert: [
        {
            content: `<h3>super() Follows the MRO, Not "the Parent"</h3>
<code>super()</code> returns a proxy that searches the <b>Method Resolution Order of the current object</b>, starting just <b>after</b> the class in which the call is written. With single inheritance that is the parent. With multiple inheritance it may be a <b>sibling</b> class.`,
            codeExamples: [
                `class Base:
    def __init__(self):
        print("Base.__init__")

class Left(Base):
    def __init__(self):
        print("Left start")
        super().__init__()
        print("Left end")

class Right(Base):
    def __init__(self):
        print("Right start")
        super().__init__()
        print("Right end")

class Child(Left, Right):
    def __init__(self):
        print("Child start")
        super().__init__()
        print("Child end")

print([c.__name__ for c in Child.__mro__])
Child()

# OUTPUT:
# ['Child', 'Left', 'Right', 'Base', 'object']
# Child start
# Left start
# Right start
# Base.__init__
# Right end
# Left end
# Child end`
            ],
            codeExplanations: [
                `Left's own parent is Base, yet the super().__init__() inside Left calls Right.__init__, because Right is the next class after Left in Child's MRO. Each __init__ runs exactly once and Base, shared by both branches, runs only once at the very end of the chain. The "end" lines print in reverse as each call returns.`
            ]
        },
        {
            content: `<h3>What Goes Wrong with Explicit Parent Calls</h3>
The same diamond written with <code>Parent.__init__(self)</code> calls runs <code>Base.__init__</code> twice - a real bug if it opens a connection, registers the object or resets state.`,
            codeExamples: [
                `class Base:
    def __init__(self):
        print("Base.__init__")

class Left(Base):
    def __init__(self):
        print("Left")
        Base.__init__(self)

class Right(Base):
    def __init__(self):
        print("Right")
        Base.__init__(self)

class Child(Left, Right):
    def __init__(self):
        Left.__init__(self)
        Right.__init__(self)

Child()

# OUTPUT:
# Left
# Base.__init__
# Right
# Base.__init__`
            ]
        },
        {
            content: `<h3>Cooperative Arguments with **kwargs</h3>
In a cooperative hierarchy each class doesn't know who comes next in the MRO, so it can't know that class's parameters. The pattern: each <code>__init__</code> takes the keyword arguments it needs, and passes the rest on with <code>**kwargs</code>. By the time the chain reaches <code>object.__init__</code>, nothing is left over.`,
            codeExamples: [
                `class Named:
    def __init__(self, name, **kwargs):
        super().__init__(**kwargs)
        self.name = name

class Priced:
    def __init__(self, price, **kwargs):
        super().__init__(**kwargs)
        self.price = price

class Product(Named, Priced):
    pass

p = Product(name="Pen", price=10)
print(p.name, p.price)

# OUTPUT:
# Pen 10`
            ],
            codeExplanations: [
                `Product's MRO is Product, Named, Priced, object. Named.__init__ receives name="Pen" plus price=10 in kwargs, and forwards price=10 to the next class, Priced, which uses it and forwards an empty kwargs to object.__init__. Always pass these arguments by keyword - positional arguments can't be routed safely through a chain whose order depends on the final class.`
            ]
        },
        {
            content: `<h3>super() in Class Methods</h3>
Inside a <code>@classmethod</code>, <code>super()</code> calls the parent's class method while keeping <code>cls</code> bound to the class that was actually used - so alternative constructors keep returning the right subclass.`,
            codeExamples: [
                `class Base:
    @classmethod
    def describe(cls):
        return f"Base.describe for {cls.__name__}"

class Child(Base):
    @classmethod
    def describe(cls):
        return "Child + " + super().describe()

print(Child.describe())

# OUTPUT:
# Child + Base.describe for Child`
            ]
        },
        {
            content: `<h3>How Zero-Argument super() Works</h3>
<code>super()</code> with no arguments is shorthand for <code>super(CurrentClass, first_argument)</code>. The compiler gives every method that uses <code>super</code> (or <code>__class__</code>) a hidden <b>__class__ cell</b> pointing at the class where the method was defined; at runtime <code>super()</code> reads that cell plus the method's first argument (<code>self</code> or <code>cls</code>). Consequences:<br>
• it only works inside a function defined in a class body;<br>
• a method copied onto a different class still uses the class where it was written.`,
            codeExamples: [
                `def helper():
    return super().__init__()

helper()

# OUTPUT:
# RuntimeError: super(): no arguments`
            ]
        },
        {
            content: `<h3>Java vs Python</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th></th><th>Java</th><th>Python</th></tr>
<tr class='text-center'><td>Parent constructor call</td><td><code>super(args)</code>, must be the first statement; inserted automatically if omitted</td><td><code>super().__init__(args)</code>, anywhere in __init__; never automatic</td></tr>
<tr class='text-center'><td>Parent method call</td><td><code>super.method()</code></td><td><code>super().method()</code></td></tr>
<tr class='text-center'><td>What "super" refers to</td><td>Always the direct superclass</td><td>The next class in the object's MRO</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Does Python call the parent's __init__ automatically?</td><td>No - only if the child doesn't define __init__; otherwise call <code>super().__init__(...)</code> yourself</td></tr>
<tr class='text-center'><td>super() vs Parent.__init__(self)?</td><td>super() follows the MRO and runs each class once in a diamond; explicit calls hard-code the parent and can run a base twice</td></tr>
<tr class='text-center'><td>Does super() always mean the parent class?</td><td>No - it means the next class after the current one in the object's MRO, which may be a sibling</td></tr>
<tr class='text-center'><td>Why pass **kwargs in cooperative __init__ methods?</td><td>Each class takes its own arguments and forwards the rest, because it can't know which class comes next</td></tr>
<tr class='text-center'><td>How does zero-argument super() know the class?</td><td>Through a hidden __class__ cell created by the compiler, plus the method's first argument</td></tr>
</table>`
        }
    ]
};
