import type { Topic } from '../../types';

export const typeHintsProtocol: Topic = {
    id: 'python-type-hints-protocol',
    name: 'Protocol',
    beginner: [
        {
            content: `<h4>Static Duck Typing</h4>
Python code usually relies on <b>duck typing</b>: "if it has a <code>close()</code> method, I can close it". <code>typing.Protocol</code> lets the type checker understand that idea. A protocol lists the methods (and attributes) a type must have; <b>any</b> class that has them matches - no inheritance or <code>implements</code> needed. This is called <b>structural</b> typing.<br><br>
Java interfaces are <b>nominal</b>: a class satisfies <code>Closeable</code> only if it declares <code>implements Closeable</code>. (The OOP module's <i>Interfaces with Protocols</i> topic introduces the idea; this topic covers the typing side in more depth.)`,
            codeExamples: [
                `from typing import Protocol

class SupportsClose(Protocol):
    def close(self) -> None: ...

class DatabaseConnection:
    def close(self) -> None:
        print("database closed")

class LogFile:
    def close(self) -> None:
        print("log file closed")

def shutdown(resources: list[SupportsClose]) -> None:
    for r in resources:
        r.close()

shutdown([DatabaseConnection(), LogFile()])   # neither class mentions SupportsClose

# OUTPUT:
# database closed
# log file closed`
            ]
        },
        {
            content: `<h4>What the Checker Enforces</h4>
A class that lacks a required method, or has it with an incompatible signature, is rejected by the type checker. The interpreter still runs the code until the missing method is actually called.`,
            codeExamples: [
                `from typing import Protocol

class Shape(Protocol):
    def area(self) -> float: ...

class Square:
    def __init__(self, side: float) -> None:
        self.side = side

    def area(self) -> float:
        return self.side ** 2

class Label:
    text = "hello"                 # no area() method

def total_area(shapes: list[Shape]) -> float:
    return sum(s.area() for s in shapes)

print(total_area([Square(2), Square(3)]))
total_area([Square(2), Label()])

# OUTPUT:
# 13
# AttributeError: 'Label' object has no attribute 'area'
#
# mypy reports (wording may vary by version) for the last line:
# error: List item 1 has incompatible type "Label"; expected "Shape"`
            ]
        },
        {
            content: `<h4>Protocols You Already Use</h4>
The standard library defines many protocols. Prefer them over concrete types in parameters so callers can pass any suitable object.
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Protocol</th><th>Requires</th><th>Satisfied by</th></tr>
<tr class='text-center'><td><code>collections.abc.Iterable[T]</code></td><td><code>__iter__</code></td><td>list, tuple, set, dict, str, generators, files</td></tr>
<tr class='text-center'><td><code>collections.abc.Sized</code></td><td><code>__len__</code></td><td>Anything that works with <code>len()</code></td></tr>
<tr class='text-center'><td><code>collections.abc.Sequence[T]</code></td><td>Indexing and <code>len()</code></td><td>list, tuple, str, range</td></tr>
<tr class='text-center'><td><code>typing.SupportsInt</code> / <code>SupportsAbs</code></td><td><code>__int__</code> / <code>__abs__</code></td><td>Numbers and custom numeric types</td></tr>
</table>`
        }
    ],

    expert: [
        {
            content: `<h3>Generic Protocols</h3>
A protocol can have type parameters, describing families such as "something with a <code>get()</code> that returns a T". With the Python 3.12 syntax the checker infers the variance; with the older <code>TypeVar</code> style, a type variable used only in return positions must be declared covariant.`,
            codeExamples: [
                `from typing import Protocol

class Source[T](Protocol):
    def get(self) -> T: ...

class Counter:
    def __init__(self) -> None:
        self.n = 0

    def get(self) -> int:
        self.n += 1
        return self.n

class Greeting:
    def get(self) -> str:
        return "hello"

def read_twice[T](src: Source[T]) -> list[T]:
    return [src.get(), src.get()]

print(read_twice(Counter()))      # list[int]
print(read_twice(Greeting()))     # list[str]

# OUTPUT:
# [1, 2]
# ['hello', 'hello']`,
                `# Before Python 3.12
from typing import Protocol, TypeVar

T_co = TypeVar("T_co", covariant=True)

class Source(Protocol[T_co]):
    def get(self) -> T_co: ...`
            ]
        },
        {
            content: `<h3>Callback Protocols</h3>
A protocol with only a <code>__call__</code> method describes a function signature in full detail - keyword-only parameters, defaults, names - things <code>Callable[[...], ...]</code> can't express. Plain functions match it structurally.`,
            codeExamples: [
                `from typing import Protocol

class Validator(Protocol):
    def __call__(self, value: str, *, strict: bool = False) -> bool: ...

def is_pin(value: str, *, strict: bool = False) -> bool:
    ok = value.isdigit() and len(value) == 6
    return ok and value[0] != "0" if strict else ok

def check(values: list[str], rule: Validator) -> list[bool]:
    return [rule(v, strict=True) for v in values]

print(check(["411001", "011001", "abc"], is_pin))

# OUTPUT:
# [True, False, False]`
            ]
        },
        {
            content: `<h3>runtime_checkable: Useful but Shallow</h3>
Protocols are for the type checker; <code>isinstance(obj, Proto)</code> raises <code>TypeError</code> unless the protocol is decorated with <code>@runtime_checkable</code>. Even then the runtime check only verifies that the <b>names exist</b> - not their signatures or return types.`,
            codeExamples: [
                `from typing import Protocol, runtime_checkable

@runtime_checkable
class Greeter(Protocol):
    def greet(self, name: str) -> str: ...

class Robot:
    def greet(self):               # wrong signature - no name parameter
        return "beep"

class Rock:
    pass

print(isinstance(Robot(), Greeter))   # only the method name is checked
print(isinstance(Rock(), Greeter))

# OUTPUT:
# True
# False`
            ]
        },
        {
            content: `<h3>Protocol or ABC?</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>Protocol</th><th>ABC (abc.ABC)</th></tr>
<tr class='text-center'><td>Typing style</td><td>Structural - matching methods are enough</td><td>Nominal - must inherit (or register)</td></tr>
<tr class='text-center'><td>Works with third-party classes you can't edit</td><td>Yes</td><td>No (except via <code>register</code>)</td></tr>
<tr class='text-center'><td>Enforced when</td><td>By the type checker, before running</td><td>At runtime, when instantiating a subclass</td></tr>
<tr class='text-center'><td>Shared implementation</td><td>Not intended</td><td>Yes - concrete helper methods</td></tr>
<tr class='text-center'><td>Closest Java concept</td><td>None (Go interfaces are similar)</td><td>Abstract class</td></tr>
</table>
Rule of thumb: use a <b>Protocol</b> to describe what a function <i>needs</i> from its arguments; use an <b>ABC</b> when you own a class hierarchy and want to share code and force subclasses to implement methods.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is structural typing?</td><td>A type matches if it has the required members, regardless of inheritance</td></tr>
<tr class='text-center'><td>Does a class need to inherit from a Protocol?</td><td>No - having matching methods is enough for the type checker</td></tr>
<tr class='text-center'><td>What does @runtime_checkable allow, and what are its limits?</td><td>isinstance/issubclass checks; they only test that the member names exist, not signatures</td></tr>
<tr class='text-center'><td>What is a callback protocol?</td><td>A Protocol defining __call__, used to type callables with keyword-only args, defaults or overloads</td></tr>
<tr class='text-center'><td>How is a Python Protocol different from a Java interface?</td><td>Java interfaces are nominal (implements required); Protocols are structural</td></tr>
</table>`
        }
    ]
};
