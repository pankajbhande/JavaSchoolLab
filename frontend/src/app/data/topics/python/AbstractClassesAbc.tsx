import type { Topic } from '../../types';

export const abstractClassesAbc: Topic = {
    id: 'python-oop-abstract-classes-abc',
    name: 'Abstract Classes & ABC',
    beginner: [
        {
            content: `<h4>What is an Abstract Class?</h4>
An <b>abstract class</b> defines a common interface for a family of classes but is incomplete itself: some methods are declared without a real implementation, and every concrete subclass must provide them. You can't create objects of the abstract class directly.<br><br>
Python has no <code>abstract</code> keyword. Instead, inherit from <code>abc.ABC</code> and mark methods with the <code>@abstractmethod</code> decorator.`,
            codeExamples: [
                `from abc import ABC, abstractmethod

class Shape(ABC):
    @abstractmethod
    def area(self):
        """Return the area of the shape."""

class Rectangle(Shape):
    def __init__(self, w, h):
        self.w = w
        self.h = h

    def area(self):
        return self.w * self.h

class Circle(Shape):
    def __init__(self, r):
        self.r = r

    def area(self):
        return round(3.14159 * self.r ** 2, 2)

for shape in [Rectangle(4, 5), Circle(1)]:
    print(type(shape).__name__, shape.area())

# OUTPUT:
# Rectangle 20
# Circle 3.14`
            ]
        },
        {
            content: `<h4>You Can't Instantiate an Abstract Class</h4>
The check happens when an object is created. A subclass that doesn't implement every abstract method is still abstract and can't be instantiated either.`,
            codeExamples: [
                `from abc import ABC, abstractmethod

class Shape(ABC):
    @abstractmethod
    def area(self):
        pass

Shape()

# OUTPUT (Python 3.12):
# TypeError: Can't instantiate abstract class Shape without an implementation for abstract method 'area'`,
                `from abc import ABC, abstractmethod

class Shape(ABC):
    @abstractmethod
    def area(self):
        pass

class Square(Shape):
    def __init__(self, side):
        self.side = side
    # forgot to implement area()

Square(3)

# OUTPUT (Python 3.12):
# TypeError: Can't instantiate abstract class Square without an implementation for abstract method 'area'`
            ]
        },
        {
            content: `<h4>Concrete Methods in an Abstract Class</h4>
An abstract class can also contain normal methods that use the abstract ones. Subclasses get them for free - this is the <b>template method pattern</b>: the base class fixes the overall algorithm, subclasses fill in the steps.`,
            codeExamples: [
                `from abc import ABC, abstractmethod

class Report(ABC):
    def generate(self):                      # concrete template method
        return " | ".join([self.header(), self.body(), "end of report"])

    @abstractmethod
    def header(self): ...

    @abstractmethod
    def body(self): ...

class SalesReport(Report):
    def header(self):
        return "SALES"

    def body(self):
        return "total: 1,20,000"

print(SalesReport().generate())

# OUTPUT:
# SALES | total: 1,20,000 | end of report`
            ]
        },
        {
            content: `<h4>Abstract Properties</h4>
Stack <code>@property</code> on top of <code>@abstractmethod</code> to require subclasses to provide a property.`,
            codeExamples: [
                `from abc import ABC, abstractmethod

class PaymentMethod(ABC):
    @property
    @abstractmethod
    def fee_percent(self):
        ...

    def total(self, amount):
        return amount + amount * self.fee_percent / 100

class Upi(PaymentMethod):
    @property
    def fee_percent(self):
        return 0

class CreditCard(PaymentMethod):
    @property
    def fee_percent(self):
        return 2

print(Upi().total(1000), CreditCard().total(1000))

# OUTPUT:
# 1000.0 1020.0`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Abstract Methods Can Have a Body</h3>
Unlike Java, a Python abstract method may contain real code. Subclasses must still override it, but they can call the base version with <code>super()</code> to reuse a default part.`,
            codeExamples: [
                `from abc import ABC, abstractmethod

class Validator(ABC):
    @abstractmethod
    def validate(self, value):
        if value is None:
            raise ValueError("value is required")
        return value

class EmailValidator(Validator):
    def validate(self, value):
        value = super().validate(value)          # reuse the shared check
        if "@" not in value:
            raise ValueError("invalid email")
        return value.lower()

print(EmailValidator().validate("Abaji@Mail.com"))

# OUTPUT:
# abaji@mail.com`
            ]
        },
        {
            content: `<h3>collections.abc: Implement a Little, Get a Lot</h3>
The standard library's abstract base classes give you <b>mixin methods</b> for free. Subclass <code>collections.abc.Sequence</code>, implement just <code>__getitem__</code> and <code>__len__</code>, and you also get <code>in</code>, iteration, <code>reversed()</code>, <code>index()</code> and <code>count()</code>.`,
            codeExamples: [
                `from collections.abc import Sequence

class Deck(Sequence):
    def __init__(self, cards):
        self._cards = list(cards)

    def __getitem__(self, index):
        return self._cards[index]

    def __len__(self):
        return len(self._cards)

deck = Deck(["A", "K", "Q", "A"])
print(len(deck), deck[1], "Q" in deck)
print(list(reversed(deck)), deck.index("Q"), deck.count("A"))
print(isinstance(deck, Sequence))

# OUTPUT:
# 4 K True
# ['A', 'Q', 'K', 'A'] 2 2
# True`
            ]
        },
        {
            content: `<h3>Virtual Subclasses with register()</h3>
<code>SomeABC.register(OtherClass)</code> declares that an existing class counts as a subclass for <code>isinstance</code>/<code>issubclass</code> checks, without changing it - handy for third-party classes you can't modify. Python does <b>not</b> verify that the registered class actually implements the abstract methods, and it inherits none of the ABC's methods.`,
            codeExamples: [
                `from abc import ABC, abstractmethod

class Exporter(ABC):
    @abstractmethod
    def export(self, data): ...

class LegacyCsvWriter:                 # existing class, not ours to change
    def export(self, data):
        return ",".join(data)

Exporter.register(LegacyCsvWriter)

w = LegacyCsvWriter()
print(isinstance(w, Exporter), issubclass(LegacyCsvWriter, Exporter))
print(w.export(["a", "b"]))

# OUTPUT:
# True True
# a,b`
            ]
        },
        {
            content: `<h3>ABC vs Protocol</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th></th><th>ABC</th><th>Protocol (see next topic)</th></tr>
<tr class='text-center'><td>Relationship</td><td>Nominal - a class must inherit from (or register with) the ABC</td><td>Structural - any class with matching methods qualifies</td></tr>
<tr class='text-center'><td>Enforced</td><td>At runtime, when instantiating</td><td>By static type checkers (runtime only with @runtime_checkable)</td></tr>
<tr class='text-center'><td>Shared code</td><td>Yes - concrete and mixin methods are inherited</td><td>Usually just the interface</td></tr>
<tr class='text-center'><td>Best for</td><td>Class families you control, template methods</td><td>Describing what a function needs from its arguments, third-party types</td></tr>
</table>`
        },
        {
            content: `<h3>Java Abstract Classes vs Python ABCs</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th></th><th>Java</th><th>Python</th></tr>
<tr class='text-center'><td>Declaration</td><td><code>abstract class Shape</code></td><td><code>class Shape(ABC)</code></td></tr>
<tr class='text-center'><td>Abstract method</td><td><code>abstract double area();</code> - no body allowed</td><td><code>@abstractmethod def area(self)</code> - body allowed</td></tr>
<tr class='text-center'><td>When the error appears</td><td>Compile time</td><td>Runtime, when you try to create an object</td></tr>
<tr class='text-center'><td>Multiple abstract bases</td><td>Only one abstract class (plus interfaces)</td><td>Any number</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>How do you create an abstract class in Python?</td><td>Inherit from <code>abc.ABC</code> (or use <code>metaclass=ABCMeta</code>) and decorate methods with <code>@abstractmethod</code></td></tr>
<tr class='text-center'><td>When is the "can't instantiate" error raised?</td><td>At runtime, when creating an instance of a class that still has unimplemented abstract methods</td></tr>
<tr class='text-center'><td>Can an abstract method have an implementation?</td><td>Yes - subclasses must still override it but may call it via super()</td></tr>
<tr class='text-center'><td>What does <code>ABC.register()</code> do?</td><td>Makes a class a virtual subclass for isinstance/issubclass checks without inheritance or verification</td></tr>
<tr class='text-center'><td>What do you get from subclassing <code>collections.abc.Sequence</code>?</td><td>Free mixin methods - __contains__, __iter__, __reversed__, index and count - once you implement __getitem__ and __len__</td></tr>
<tr class='text-center'><td>Is a class with @abstractmethod but without ABC abstract?</td><td>No - the check only works when the metaclass is ABCMeta (inheriting from ABC provides it)</td></tr>
</table>`
        }
    ]
};
