import type { Topic } from '../../types';

export const typeHintsTypeVarGenerics: Topic = {
    id: 'python-type-hints-typevar-generics',
    name: 'TypeVar & Generics',
    beginner: [
        {
            content: `<h4>The Problem: Losing the Type</h4>
A function that returns the first item of a list works for lists of anything. Typing it with <code>Any</code> (or <code>object</code>) loses information: the checker no longer knows that <code>first([1, 2])</code> is an <code>int</code>. A <b>type variable</b> links the input type to the output type - exactly what Java's <code>&lt;T&gt; T first(List&lt;T&gt; items)</code> does.`,
            codeExamples: [
                `from typing import TypeVar

T = TypeVar("T")

def first(items: list[T]) -> T:
    return items[0]

n = first([10, 20, 30])          # checker knows: int
s = first(["a", "b"])            # checker knows: str
print(n + 1, s.upper())

# OUTPUT:
# 11 A`
            ]
        },
        {
            content: `<h4>Python 3.12 Syntax (PEP 695)</h4>
Python 3.12 lets you declare type parameters in square brackets, just like Java's angle brackets - no separate <code>TypeVar</code> line needed. Both styles mean the same thing; use the new one on 3.12+.`,
            codeExamples: [
                `def first[T](items: list[T]) -> T:
    return items[0]

def swap[A, B](pair: tuple[A, B]) -> tuple[B, A]:
    return pair[1], pair[0]

print(first([3.5, 1.0]))
print(swap(("id", 7)))

# OUTPUT:
# 3.5
# (7, 'id')`
            ]
        },
        {
            content: `<h4>A Generic Class: Stack[T]</h4>
A generic class is parameterised by a type, so <code>Stack[int]</code> and <code>Stack[str]</code> are checked separately - like <code>Stack&lt;Integer&gt;</code> in Java. The classic spelling inherits from <code>Generic[T]</code>; Python 3.12 allows <code>class Stack[T]:</code>.`,
            codeExamples: [
                `class Stack[T]:
    def __init__(self) -> None:
        self._items: list[T] = []

    def push(self, item: T) -> None:
        self._items.append(item)

    def pop(self) -> T:
        return self._items.pop()

    def __len__(self) -> int:
        return len(self._items)

s = Stack[int]()
s.push(1)
s.push(2)
print(s.pop(), len(s))

s.push("three")          # runs, but the checker objects

# OUTPUT:
# 2 1
#
# mypy reports (wording may vary by version):
# error: Argument 1 to "push" of "Stack" has incompatible type "str"; expected "int"`,
                `# The same class before Python 3.12
from typing import Generic, TypeVar

T = TypeVar("T")

class Stack(Generic[T]):
    def __init__(self) -> None:
        self._items: list[T] = []

    def push(self, item: T) -> None:
        self._items.append(item)

    def pop(self) -> T:
        return self._items.pop()`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Bounded Type Variables</h3>
<code>TypeVar("A", bound=Animal)</code> means "any subclass of Animal" - the equivalent of Java's <code>&lt;A extends Animal&gt;</code>. Unlike a plain <code>Animal</code> parameter, the function returns the <b>same</b> subtype it received. In 3.12 syntax: <code>def loudest[A: Animal](...)</code>.`,
            codeExamples: [
                `class Animal:
    def __init__(self, name: str, volume: int) -> None:
        self.name = name
        self.volume = volume

class Dog(Animal):
    def fetch(self) -> str:
        return f"{self.name} fetches the ball"

def loudest[A: Animal](animals: list[A]) -> A:
    return max(animals, key=lambda a: a.volume)

dogs = [Dog("Tommy", 7), Dog("Sheru", 9)]
winner = loudest(dogs)           # checker knows: Dog, not just Animal
print(winner.fetch())

# OUTPUT:
# Sheru fetches the ball`
            ]
        },
        {
            content: `<h3>Constrained Type Variables</h3>
<code>TypeVar("N", int, float)</code> (3.12: <code>[N: (int, float)]</code>) means "exactly one of these types". Both arguments must then be the same type, and the result has that type too.`,
            codeExamples: [
                `def add_all[N: (int, float)](a: N, b: N) -> N:
    return a + b

print(add_all(2, 3))
print(add_all(1.5, 2.5))
add_all("a", "b")

# OUTPUT:
# 5
# 4.0
#
# mypy reports (wording may vary by version) for the last line:
# error: Value of type variable "N" of "add_all" cannot be "str"`
            ]
        },
        {
            content: `<h3>Variance: Why list[int] Is Not a list[float]</h3>
Lists are <b>invariant</b>: a function taking <code>list[float]</code> could append a float to your <code>list[int]</code>, so the checker refuses. Read-only types such as <code>Sequence</code> are <b>covariant</b> and accept the narrower type - the same reasoning as Java's <code>List&lt;? extends Number&gt;</code>.`,
            codeExamples: [
                `from collections.abc import Sequence

def total_list(values: list[float]) -> float:
    return sum(values)

def total_seq(values: Sequence[float]) -> float:
    return sum(values)

ints: list[int] = [1, 2, 3]
print(total_seq(ints))       # fine
print(total_list(ints))      # runs, but the checker objects

# OUTPUT:
# 6
# 6
#
# mypy reports (wording may vary by version):
# error: Argument 1 to "total_list" has incompatible type "list[int]"; expected "list[float]"`
            ]
        },
        {
            content: `<h3>Python Generics vs Java Generics</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Concept</th><th>Java</th><th>Python</th></tr>
<tr class='text-center'><td>Generic method</td><td><code>&lt;T&gt; T first(List&lt;T&gt; xs)</code></td><td><code>def first[T](xs: list[T]) -&gt; T</code></td></tr>
<tr class='text-center'><td>Generic class</td><td><code>class Stack&lt;T&gt;</code></td><td><code>class Stack[T]:</code></td></tr>
<tr class='text-center'><td>Upper bound</td><td><code>&lt;T extends Animal&gt;</code></td><td><code>[T: Animal]</code> / <code>bound=Animal</code></td></tr>
<tr class='text-center'><td>Who checks</td><td>The compiler - code won't compile</td><td>External tools (mypy, Pyright) - the interpreter ignores hints</td></tr>
<tr class='text-center'><td>Wrong type at runtime</td><td>Prevented at compile time</td><td>Runs unless a tool stops it</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is a TypeVar for?</td><td>To link types across a signature, e.g. the return type equals the element type of the argument</td></tr>
<tr class='text-center'><td>Bound vs constrained TypeVar?</td><td>Bound accepts any subtype of one type; constrained accepts exactly one of a listed set of types</td></tr>
<tr class='text-center'><td>What does PEP 695 add?</td><td>Python 3.12 syntax for type parameters: <code>def f[T](...)</code>, <code>class C[T]:</code>, <code>[T: Bound]</code></td></tr>
<tr class='text-center'><td>Why is list invariant?</td><td>Because it is mutable - accepting list[int] as list[float] would allow inserting floats into an int list</td></tr>
<tr class='text-center'><td>Are generics enforced at runtime?</td><td>No - they are hints for type checkers; Stack[int]() happily stores a str at runtime</td></tr>
</table>`
        }
    ]
};
