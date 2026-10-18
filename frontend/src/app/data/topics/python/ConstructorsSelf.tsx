import type { Topic } from '../../types';

export const constructorsSelf: Topic = {
    id: 'python-oop-constructors-self',
    name: 'Constructors & self',
    beginner: [
        {
            content: `<h4>__init__: Setting Up a New Object</h4>
<code>__init__</code> runs automatically every time you create an object with <code>ClassName(...)</code>. It receives the arguments you passed and stores them as attributes. It plays the role of a Java constructor - strictly it is an <b>initialiser</b>: the object already exists when <code>__init__</code> runs, it just fills it in.`,
            codeExamples: [
                `class Employee:
    def __init__(self, name, salary):
        print("__init__ running for", name)
        self.name = name
        self.salary = salary

e = Employee("Raoji", 45000)
print(e.name, e.salary)

# OUTPUT:
# __init__ running for Raoji
# Raoji 45000`
            ]
        },
        {
            content: `<h4>What Is self?</h4>
<code>self</code> is the object being created or used. In Java the current object is available implicitly as <code>this</code>; Python makes it an <b>explicit first parameter</b> of every instance method. You never pass it yourself - Python does.<br><br>
• <code>self.name = name</code> - the left side is an attribute of the object, the right side is the local parameter.<br>
• Forgetting <code>self.</code> creates a local variable that disappears when <code>__init__</code> ends.`,
            codeExamples: [
                `class Employee:
    def __init__(self, name):
        name = name.title()        # local variable only - lost after __init__
        self.name = name           # stored on the object

e = Employee("raoji kumar")
print(e.name)

# Java equivalent:
#   public Employee(String name) { this.name = name; }
# OUTPUT:
# Raoji Kumar`
            ]
        },
        {
            content: `<h4>Default Values Instead of Constructor Overloading</h4>
Java often provides several constructors. Python has only one <code>__init__</code>; default parameter values cover the same cases.`,
            codeExamples: [
                `class Ticket:
    def __init__(self, passenger, seat="any", meal="veg"):
        self.passenger = passenger
        self.seat = seat
        self.meal = meal

    def __str__(self):
        return f"{self.passenger} | {self.seat} | {self.meal}"

print(Ticket("Abaji"))
print(Ticket("Raoji", "12A"))
print(Ticket("Kanhoji", meal="jain"))

# OUTPUT:
# Abaji   | any | veg
# Raoji   | 12A | veg
# Kanhoji | any | jain`
            ]
        },
        {
            content: `<h4>Validating in __init__</h4>
The initialiser is the right place to reject bad data, so an invalid object can never exist.`,
            codeExamples: [
                `class Student:
    def __init__(self, name, marks):
        if not name.strip():
            raise ValueError("name is required")
        if not 0 <= marks <= 100:
            raise ValueError(f"marks must be 0-100, got {marks}")
        self.name = name.strip()
        self.marks = marks

s = Student("Abaji", 91)
print(s.name, s.marks)
Student("Raoji", 120)

# OUTPUT:
# Abaji 91
# ValueError: marks must be 0-100, got 120`
            ]
        },
        {
            content: `<h4>Calling the Wrong Number of Arguments</h4>
The error counts only the arguments you pass - <code>self</code> is supplied automatically.`,
            codeExamples: [
                `class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

Point(1)

# OUTPUT:
# TypeError: Point.__init__() missing 1 required positional argument: 'y'`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>How an Object Is Created</h3>
<code>ClassName(args)</code> does two steps:<br>
1. <code>__new__(cls, ...)</code> <b>creates</b> the empty object (inherited from <code>object</code>; you rarely override it).<br>
2. <code>__init__(self, ...)</code> <b>initialises</b> it, if <code>__new__</code> returned an instance of the class.<br><br>
Override <code>__new__</code> only for special cases: subclassing immutable types like <code>int</code>/<code>str</code>/<code>tuple</code>, caching instances, or singletons.`,
            codeExamples: [
                `class Traced:
    def __new__(cls, *args):
        print("1. __new__ creates the object")
        return super().__new__(cls)

    def __init__(self, value):
        print("2. __init__ fills it in")
        self.value = value

t = Traced(42)
print(t.value)

# OUTPUT:
# 1. __new__ creates the object
# 2. __init__ fills it in
# 42`
            ]
        },
        {
            content: `<h3>__new__ for Immutable Types</h3>
An immutable object's value must be set when it is created, so subclasses of <code>str</code>, <code>int</code> or <code>tuple</code> customise <code>__new__</code>, not <code>__init__</code>.`,
            codeExamples: [
                `class UpperStr(str):
    def __new__(cls, value):
        return super().__new__(cls, value.upper())

code = UpperStr("inr")
print(code, isinstance(code, str), len(code))

# OUTPUT:
# INR True 3`
            ]
        },
        {
            content: `<h3>__init__ Must Return None</h3>
<code>__init__</code> cannot return the object or any other value - Python raises <code>TypeError</code> if it does.`,
            codeExamples: [
                `class Bad:
    def __init__(self):
        return 5

Bad()

# OUTPUT:
# TypeError: __init__() should return None, not 'int'`
            ]
        },
        {
            content: `<h3>Alternative Constructors with @classmethod</h3>
Instead of overloaded constructors, Python uses named factory methods decorated with <code>@classmethod</code> - like <code>dict.fromkeys</code> or <code>datetime.fromisoformat</code>. Class and static methods have their own topic; here is the pattern.`,
            codeExamples: [
                `class Employee:
    def __init__(self, name, salary):
        self.name = name
        self.salary = salary

    @classmethod
    def from_csv(cls, line):
        name, salary = line.split(",")
        return cls(name, int(salary))

e = Employee.from_csv("Abaji,52000")
print(e.name, e.salary)

# OUTPUT:
# Abaji 52000`
            ]
        },
        {
            content: `<h3>Keep __init__ Simple</h3>
• Assign every attribute in <code>__init__</code> so the object's shape is clear.<br>
• Avoid slow work (network calls, file reads) - pass dependencies in or use a factory method.<br>
• Don't call methods that subclasses may override before all attributes are set.<br>
• For plain data holders, let <code>@dataclass</code> generate <code>__init__</code> and add checks in <code>__post_init__</code>.`,
            codeExamples: [
                `from dataclasses import dataclass

@dataclass
class Product:
    name: str
    price: float

    def __post_init__(self):
        if self.price < 0:
            raise ValueError("price cannot be negative")

print(Product("Pen", 10.0))
Product("Pen", -1)

# OUTPUT:
# Product(name='Pen', price=10.0)
# ValueError: price cannot be negative`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Is __init__ a constructor?</td><td>It is an initialiser - __new__ creates the object, __init__ sets it up</td></tr>
<tr class='text-center'><td>Why is self explicit in Python?</td><td>A method is a plain function; self is just its first argument, filled in when called through an instance</td></tr>
<tr class='text-center'><td>How do you get multiple constructors?</td><td>Default arguments, or alternative constructors with @classmethod</td></tr>
<tr class='text-center'><td>When would you override __new__?</td><td>Subclassing immutable types, instance caching or singletons</td></tr>
<tr class='text-center'><td>What may __init__ return?</td><td>Only None - anything else raises TypeError</td></tr>
<tr class='text-center'><td>Is self a keyword?</td><td>No - it is a convention, but always follow it</td></tr>
</table>`
        }
    ]
};
