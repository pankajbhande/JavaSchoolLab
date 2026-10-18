import type { Topic } from '../../types';

export const encapsulation: Topic = {
    id: 'python-oop-encapsulation',
    name: 'Encapsulation',
    beginner: [
        {
            content: `<h4>What is Encapsulation?</h4>
<b>Encapsulation</b> means keeping an object's data together with the methods that work on it, and letting outside code use the object through those methods rather than poking at its internals. The object can then enforce its own rules - a balance never goes negative, marks stay between 0 and 100.<br><br>
Java enforces this with <code>private</code> fields and getters/setters. Python has <b>no access modifiers</b>; it relies on <b>naming conventions</b> instead.`
        },
        {
            content: `<h4>Three Levels by Convention</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Name</th><th>Meaning</th><th>Enforced?</th></tr>
<tr class='text-center'><td><code>balance</code></td><td>Public - part of the API</td><td>-</td></tr>
<tr class='text-center'><td><code>_balance</code></td><td>Internal - "please don't use this from outside" (like protected)</td><td>No, convention only</td></tr>
<tr class='text-center'><td><code>__balance</code></td><td>Name-mangled - renamed to <code>_ClassName__balance</code></td><td>Makes accidental access harder, not impossible</td></tr>
</table>`
        },
        {
            content: `<h4>Protecting Data Through Methods</h4>`,
            codeExamples: [
                `class Account:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self._balance = balance            # internal by convention

    def deposit(self, amount):
        if amount <= 0:
            raise ValueError("amount must be positive")
        self._balance += amount

    def withdraw(self, amount):
        if amount > self._balance:
            raise ValueError("insufficient funds")
        self._balance -= amount

    def get_balance(self):
        return self._balance

acc = Account("Abaji", 1000)
acc.deposit(500)
acc.withdraw(300)
print(acc.get_balance())

# OUTPUT:
# 1200`
            ]
        },
        {
            content: `<h4>Double Underscore: Name Mangling</h4>
An attribute named <code>__pin</code> inside class <code>Account</code> is stored as <code>_Account__pin</code>. The plain name doesn't work from outside the class.`,
            codeExamples: [
                `class Account:
    def __init__(self, pin):
        self.__pin = pin

    def check_pin(self, pin):
        return pin == self.__pin          # inside the class the short name works

acc = Account("4321")
print(acc.check_pin("4321"))
print(acc.__dict__)
print(acc._Account__pin)                  # still reachable - not real security
print(acc.__pin)

# OUTPUT:
# True
# {'_Account__pin': '4321'}
# 4321
# AttributeError: 'Account' object has no attribute '__pin'`
            ]
        },
        {
            content: `<h4>"We Are All Consenting Adults"</h4>
Python's philosophy is to trust developers: a leading underscore clearly says "internal", and anyone who uses it anyway accepts the risk that it may change. This keeps the language simple and makes debugging and testing easier. Expose <b>behaviour</b> (methods like <code>deposit</code>) rather than raw data, and the convention works well in practice.`
        }
    ],

    expert: [
        {
            content: `<h3>What Name Mangling Is Really For</h3>
Mangling exists to avoid <b>name clashes in subclasses</b>, not to hide data. If a parent and a child both use <code>__id</code>, each gets its own mangled attribute, so the child can't accidentally overwrite the parent's internal state.`,
            codeExamples: [
                `class Base:
    def __init__(self):
        self.__id = "base-id"

    def base_id(self):
        return self.__id

class Child(Base):
    def __init__(self):
        super().__init__()
        self.__id = "child-id"            # becomes _Child__id - no clash

c = Child()
print(c.base_id())
print(sorted(c.__dict__))

# OUTPUT:
# base-id
# ['_Base__id', '_Child__id']`
            ]
        },
        {
            content: `<h3>Properties Instead of Getters and Setters</h3>
Java code starts with private fields plus <code>getX()</code>/<code>setX()</code> "just in case". Python starts with a <b>public attribute</b>; if validation is needed later, <code>@property</code> turns attribute access into method calls <b>without changing callers</b>. It has its own topic - here is the idea, including a read-only attribute.`,
            codeExamples: [
                `class Student:
    def __init__(self, name, marks):
        self._name = name
        self.marks = marks                # goes through the setter below

    @property
    def name(self):                       # read-only: no setter defined
        return self._name

    @property
    def marks(self):
        return self._marks

    @marks.setter
    def marks(self, value):
        if not 0 <= value <= 100:
            raise ValueError("marks must be 0-100")
        self._marks = value

s = Student("Abaji", 80)
s.marks = 95                              # looks like a field, runs validation
print(s.name, s.marks)
s.name = "Raoji"

# OUTPUT:
# Abaji 95
# AttributeError: property 'name' of 'Student' object has no setter`
            ]
        },
        {
            content: `<h3>Immutable Objects</h3>
The strongest encapsulation is data that can't change. <code>@dataclass(frozen=True)</code> blocks assignment after creation (and makes instances hashable). "Changes" create a new object with <code>dataclasses.replace</code>.`,
            codeExamples: [
                `from dataclasses import dataclass, replace, FrozenInstanceError

@dataclass(frozen=True)
class Money:
    amount: int
    currency: str = "INR"

price = Money(500)
try:
    price.amount = 0
except FrozenInstanceError:
    print("cannot modify a frozen object")

discounted = replace(price, amount=450)
print(price, discounted)

# OUTPUT:
# cannot modify a frozen object
# Money(amount=500, currency='INR') Money(amount=450, currency='INR')`
            ]
        },
        {
            content: `<h3>Don't Leak Mutable Internals</h3>
Returning an internal list lets callers modify the object behind its back. Return a copy or a tuple.`,
            codeExamples: [
                `class Course:
    def __init__(self):
        self._students = []

    def enrol(self, name):
        self._students.append(name)

    @property
    def students(self):
        return tuple(self._students)     # read-only snapshot

c = Course()
c.enrol("Abaji")
print(c.students)
c.students.append("Hacker")

# OUTPUT:
# ('Abaji',)
# AttributeError: 'tuple' object has no attribute 'append'`
            ]
        },
        {
            content: `<h3>Python vs Java</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Java</th><th>Python</th></tr>
<tr class='text-center'><td><code>public</code> field</td><td>Plain attribute</td></tr>
<tr class='text-center'><td><code>protected</code></td><td><code>_name</code> (convention)</td></tr>
<tr class='text-center'><td><code>private</code></td><td><code>__name</code> (mangling) or <code>_name</code></td></tr>
<tr class='text-center'><td>Getter/setter methods</td><td><code>@property</code> when needed</td></tr>
<tr class='text-center'><td><code>final</code> field</td><td>Read-only property, frozen dataclass, <code>typing.Final</code> hint</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Does Python have private variables?</td><td>No enforced ones - <code>_x</code> is a convention, <code>__x</code> is name-mangled to <code>_Class__x</code></td></tr>
<tr class='text-center'><td>What is name mangling for?</td><td>Avoiding accidental attribute clashes between a class and its subclasses</td></tr>
<tr class='text-center'><td>Should you write getters and setters?</td><td>Not by default - use public attributes and switch to @property when logic is needed</td></tr>
<tr class='text-center'><td>How do you make a read-only attribute?</td><td>A @property without a setter, or a frozen dataclass</td></tr>
<tr class='text-center'><td>What does "consenting adults" mean?</td><td>Python trusts developers to respect underscore conventions instead of enforcing access rules</td></tr>
</table>`
        }
    ]
};
