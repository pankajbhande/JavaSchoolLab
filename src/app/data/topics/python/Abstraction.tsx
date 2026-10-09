import type { Topic } from '../../types';

export const abstraction: Topic = {
    id: 'python-oop-abstraction',
    name: 'Abstraction',
    beginner: [
        {
            content: `<h4>What is Abstraction?</h4>
<b>Abstraction</b> means exposing <b>what</b> an object does through a simple interface while hiding <b>how</b> it does it. You drive a car with a steering wheel and pedals without knowing how the engine works. In code, callers use a few clear methods; the messy details stay inside.`
        },
        {
            content: `<h4>Designing a Simple API</h4>
The caller only needs <code>pay(amount)</code>. Validation, fees and talking to the bank are hidden behind it - and can change without affecting callers.`,
            codeExamples: [
                `class PaymentGateway:
    FEE_RATE = 0.02

    def pay(self, amount):
        """Charge the customer. The only method callers need."""
        self._validate(amount)
        total = amount + self._fee(amount)
        return self._send_to_bank(total)

    def _validate(self, amount):          # leading _ : internal detail
        if amount <= 0:
            raise ValueError("amount must be positive")

    def _fee(self, amount):
        return round(amount * self.FEE_RATE, 2)

    def _send_to_bank(self, total):
        return f"Charged {total}"

gateway = PaymentGateway()
print(gateway.pay(500))

# OUTPUT:
# Charged 510.0`
            ]
        },
        {
            content: `<h4>Abstraction at Every Level</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Level</th><th>What it hides</th><th>Example</th></tr>
<tr class='text-center'><td>Function</td><td>A sequence of steps</td><td><code>calculate_gst(amount)</code></td></tr>
<tr class='text-center'><td>Class</td><td>Data plus the rules for changing it</td><td><code>account.withdraw(500)</code></td></tr>
<tr class='text-center'><td>Module</td><td>A whole feature</td><td><code>json.dumps(data)</code></td></tr>
<tr class='text-center'><td>Package / library</td><td>A subsystem</td><td><code>requests.get(url)</code></td></tr>
</table>`,
            codeExamples: [
                `import json

# You never see how json builds the string - just call the abstraction
print(json.dumps({"course": "Python", "modules": 40}))
print(sorted([3, 1, 2]))          # which sorting algorithm? you don't need to know

# OUTPUT:
# {"course": "Python", "modules": 40}
# [1, 2, 3]`
            ]
        },
        {
            content: `<h4>Abstraction vs Encapsulation</h4>
They work together but are not the same: <b>abstraction</b> is about the <i>design</i> of a simple interface; <b>encapsulation</b> (its own topic) is about <i>protecting</i> the internal data behind that interface.`
        }
    ],

    expert: [
        {
            content: `<h3>A Base Class as a Contract</h3>
A base class can define the operations every implementation must provide. The simplest version raises <code>NotImplementedError</code> - but that is only detected when the method is <b>called</b>. An incomplete subclass can still be created.`,
            codeExamples: [
                `class Storage:
    def save(self, key, data):
        raise NotImplementedError("subclasses must implement save()")

class DiskStorage(Storage):
    pass                                  # forgot to implement save()

s = DiskStorage()                         # no error yet!
print("created", type(s).__name__)
s.save("a", 1)

# OUTPUT:
# created DiskStorage
# NotImplementedError: subclasses must implement save()`
            ]
        },
        {
            content: `<h3>Enforcing It with an Abstract Base Class</h3>
With <code>abc.ABC</code> and <code>@abstractmethod</code>, Python refuses to <b>create</b> an object of a class that hasn't implemented every abstract method - the error appears early, like Java's compile-time check. The <i>Abstract Classes &amp; ABC</i> topic covers this fully.`,
            codeExamples: [
                `from abc import ABC, abstractmethod

class Storage(ABC):
    @abstractmethod
    def save(self, key, data):
        ...

class DiskStorage(Storage):
    pass

DiskStorage()

# OUTPUT:
# TypeError: Can't instantiate abstract class DiskStorage without an implementation for abstract method 'save'`
            ]
        },
        {
            content: `<h3>Leaky Abstractions</h3>
An abstraction "leaks" when callers must know about the hidden details to use it correctly - for example a method that returns a raw database row, or raises a low-level <code>KeyError</code> from an internal dict. Good abstractions return domain values and raise domain exceptions.`,
            codeExamples: [
                `class UserNotFound(Exception):
    pass

class UserRepository:
    def __init__(self):
        self._rows = {1: ("Asha", "asha@mail.com")}

    def get_leaky(self, user_id):
        return self._rows[user_id]            # caller sees a tuple and a KeyError

    def get_name(self, user_id):
        try:
            return self._rows[user_id][0]
        except KeyError:
            raise UserNotFound(f"no user {user_id}") from None

repo = UserRepository()
print(repo.get_leaky(1))
print(repo.get_name(1))
repo.get_name(2)

# OUTPUT:
# ('Asha', 'asha@mail.com')
# Asha
# UserNotFound: no user 2`
            ]
        },
        {
            content: `<h3>Java vs Python</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Java</th><th>Python</th></tr>
<tr class='text-center'><td><code>abstract class</code></td><td>A class inheriting <code>ABC</code> with <code>@abstractmethod</code>s</td></tr>
<tr class='text-center'><td><code>interface</code></td><td>An ABC with only abstract methods, or a <code>typing.Protocol</code></td></tr>
<tr class='text-center'><td><code>private</code> helpers</td><td>Names starting with <code>_</code> (by convention)</td></tr>
<tr class='text-center'><td>Missing implementation caught at compile time</td><td>Caught when instantiating (ABC) or calling (NotImplementedError)</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is abstraction?</td><td>Exposing a simple interface for what an object does while hiding how it does it</td></tr>
<tr class='text-center'><td>Abstraction vs encapsulation?</td><td>Abstraction designs the simple interface; encapsulation protects the internal state behind it</td></tr>
<tr class='text-center'><td>NotImplementedError vs @abstractmethod?</td><td>NotImplementedError fails only when the method is called; an ABC refuses to instantiate an incomplete subclass</td></tr>
<tr class='text-center'><td>How is abstraction achieved in Python?</td><td>Functions, classes with small public APIs, modules, ABCs and Protocols</td></tr>
<tr class='text-center'><td>What is a leaky abstraction?</td><td>One that forces callers to know its internal details, e.g. by returning raw internal data or low-level exceptions</td></tr>
</table>`
        }
    ]
};
