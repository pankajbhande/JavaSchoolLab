import type { Topic } from '../../types';

export const instanceClassStaticMethods: Topic = {
    id: 'python-oop-instance-class-static-methods',
    name: 'Instance, Class & Static Methods',
    beginner: [
        {
            content: `<h4>Three Kinds of Methods</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Kind</th><th>Decorator</th><th>First parameter</th><th>Can use</th><th>Typical use</th></tr>
<tr class='text-center'><td>Instance method</td><td>none</td><td><code>self</code> (the object)</td><td>Instance and class data</td><td>Most methods - work on one object</td></tr>
<tr class='text-center'><td>Class method</td><td><code>@classmethod</code></td><td><code>cls</code> (the class)</td><td>Class data</td><td>Alternative constructors, class-wide settings</td></tr>
<tr class='text-center'><td>Static method</td><td><code>@staticmethod</code></td><td>none</td><td>Only its arguments</td><td>Helper functions that belong with the class</td></tr>
</table>`
        },
        {
            content: `<h4>All Three in One Class</h4>`,
            codeExamples: [
                `class Temperature:
    unit = "Celsius"                    # class variable

    def __init__(self, degrees):
        self.degrees = degrees

    def describe(self):                 # instance method
        return f"{self.degrees} {self.unit}"

    @classmethod
    def set_unit(cls, unit):            # class method
        cls.unit = unit

    @staticmethod
    def c_to_f(c):                      # static method
        return c * 9 / 5 + 32

t = Temperature(37)
print(t.describe())
print(Temperature.c_to_f(37))
Temperature.set_unit("deg C")
print(t.describe())

# OUTPUT:
# 37 Celsius
# 98.6
# 37 deg C`
            ]
        },
        {
            content: `<h4>Class Methods as Alternative Constructors</h4>
Python has only one <code>__init__</code> (no constructor overloading). A <code>@classmethod</code> gives you extra, clearly named ways to create objects - like Java's static factory methods (<code>LocalDate.of(...)</code>, <code>LocalDate.parse(...)</code>).`,
            codeExamples: [
                `class Date:
    def __init__(self, day, month, year):
        self.day = day
        self.month = month
        self.year = year

    @classmethod
    def from_string(cls, text):         # "04-10-2026"
        day, month, year = map(int, text.split("-"))
        return cls(day, month, year)

    def __repr__(self):
        return f"Date({self.day}, {self.month}, {self.year})"

print(Date(4, 10, 2026))
print(Date.from_string("15-08-1947"))

# OUTPUT:
# Date(4, 10, 2026)
# Date(15, 8, 1947)`
            ]
        },
        {
            content: `<h4>Static Methods as Helpers</h4>
A static method receives no <code>self</code> or <code>cls</code>. Use it for a utility that is logically part of the class but doesn't need any object or class data.`,
            codeExamples: [
                `class Password:
    @staticmethod
    def is_strong(pwd):
        return (len(pwd) >= 8
                and any(c.isdigit() for c in pwd)
                and any(c.isupper() for c in pwd))

print(Password.is_strong("python"), Password.is_strong("Pyth0nRocks"))

# OUTPUT:
# False True`
            ]
        },
        {
            content: `<h4>Which One Should I Use?</h4>
• Needs the object's data (<code>self.x</code>)? → <b>instance method</b>.<br>
• Needs the class (to create objects or change class-wide data)? → <b>class method</b>.<br>
• Needs neither? → <b>static method</b> - or simply a function in the module.`
        }
    ],

    expert: [
        {
            content: `<h3>How Binding Works</h3>
When you access a method through an object, Python creates a <b>bound method</b> that inserts the object as the first argument. <code>obj.method(x)</code> is really <code>Class.method(obj, x)</code>. A class method binds the class instead; a static method binds nothing.`,
            codeExamples: [
                `class Counter:
    def __init__(self):
        self.value = 0

    def increment(self, step=1):
        self.value += step
        return self.value

c = Counter()
print(c.increment())
print(Counter.increment(c, 5))      # the same call, written explicitly
Counter.increment()

# OUTPUT:
# 1
# 6
# TypeError: Counter.increment() missing 1 required positional argument: 'self'`
            ]
        },
        {
            content: `<h3>Class Methods and Inheritance</h3>
<code>cls</code> is the class the method was <b>called on</b> - including a subclass. So a factory written with <code>cls(...)</code> automatically returns subclass objects. A static method, or a hard-coded class name, would not.`,
            codeExamples: [
                `class Shape:
    def __init__(self, size):
        self.size = size

    @classmethod
    def unit(cls):
        return cls(1)                   # uses whichever class called it

    @staticmethod
    def unit_static():
        return Shape(1)                 # always a Shape

class Square(Shape):
    pass

print(type(Square.unit()).__name__)
print(type(Square.unit_static()).__name__)

# OUTPUT:
# Square
# Shape`
            ]
        },
        {
            content: `<h3>Static Method or Module Function?</h3>
Unlike Java, Python doesn't force every function into a class. A plain module-level function is often the better choice for a helper that doesn't relate to one class. Use a static method when the helper clearly belongs to the class's concept (so it's found with the class, and subclasses can override it).`,
            codeExamples: [
                `# utils.py style - a plain function, no class needed
def to_paise(rupees):
    return round(rupees * 100)

print(to_paise(12.5))

# OUTPUT:
# 1250`
            ]
        },
        {
            content: `<h3>Java vs Python</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Java</th><th>Python</th></tr>
<tr class='text-center'><td>Instance method, implicit <code>this</code></td><td>Instance method, explicit <code>self</code> parameter</td></tr>
<tr class='text-center'><td><code>static</code> method</td><td><code>@staticmethod</code> (or a module function)</td></tr>
<tr class='text-center'><td>No direct equivalent</td><td><code>@classmethod</code> - receives the class, works with subclasses</td></tr>
<tr class='text-center'><td>Constructor overloading</td><td>One <code>__init__</code> plus classmethod factories</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>@classmethod vs @staticmethod?</td><td>A class method receives the class as cls and can create instances or change class state; a static method receives nothing automatically</td></tr>
<tr class='text-center'><td>What is an alternative constructor?</td><td>A classmethod such as <code>Date.from_string()</code> that builds an object from different input</td></tr>
<tr class='text-center'><td>Why use cls(...) instead of the class name in a factory?</td><td>So subclasses calling it get instances of the subclass</td></tr>
<tr class='text-center'><td>What does <code>obj.method(x)</code> translate to?</td><td><code>type(obj).method(obj, x)</code> - the object is passed as self</td></tr>
<tr class='text-center'><td>When is a module function better than a static method?</td><td>When the helper isn't really part of the class's concept</td></tr>
</table>`
        }
    ]
};
