import type { Topic } from '../../types';

export const typeHintsTypeAlias: Topic = {
    id: 'python-type-hints-typealias',
    name: 'TypeAlias',
    beginner: [
        {
            content: `<h4>Naming a Type</h4>
Some type hints get long: <code>dict[str, list[tuple[int, float]]]</code>. A <b>type alias</b> gives such a type a short, meaningful name. The alias and the original type are completely <b>interchangeable</b> - the alias is only a label for readers. Java has no direct equivalent; there you would usually create a wrapper class.`,
            codeExamples: [
                `Vector = list[float]

def scale(v: Vector, k: float) -> Vector:
    return [x * k for x in v]

def length(v: Vector) -> float:
    return sum(x * x for x in v) ** 0.5

print(scale([1.0, 2.0], 3))
print(length([3.0, 4.0]))

# OUTPUT:
# [3.0, 6.0]
# 5.0`
            ]
        },
        {
            content: `<h4>Making the Intent Explicit: TypeAlias (3.10+)</h4>
<code>Vector = list[float]</code> looks like an ordinary variable assignment. Annotating it with <code>TypeAlias</code> tells both readers and type checkers that it is meant as a type, which matters for aliases that use forward references (strings).`,
            codeExamples: [
                `from typing import TypeAlias

Matrix: TypeAlias = list[list[float]]
Grades: TypeAlias = dict[str, list[int]]

def average_by_student(grades: Grades) -> dict[str, float]:
    return {name: sum(m) / len(m) for name, m in grades.items()}

print(average_by_student({"Abaji": [80, 90], "Raoji": [70, 75]}))

# OUTPUT:
# {'Abaji': 85.0, 'Raoji': 72.5}`
            ]
        },
        {
            content: `<h4>The type Statement (Python 3.12+)</h4>
Python 3.12 adds a dedicated <code>type</code> statement (PEP 695). It creates a real <code>TypeAliasType</code> object whose value is evaluated <b>lazily</b>, so an alias can refer to itself or to names defined later. Prefer it on 3.12+.`,
            codeExamples: [
                `type Vector = list[float]
type Point = tuple[float, float]

print(Vector, type(Vector).__name__)
print(Vector.__value__)

def midpoint(a: Point, b: Point) -> Point:
    return ((a[0] + b[0]) / 2, (a[1] + b[1]) / 2)

print(midpoint((0, 0), (4, 2)))

# OUTPUT:
# Vector TypeAliasType
# list[float]
# (2.0, 1.0)`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Recursive and Generic Aliases</h3>
Because the <code>type</code> statement is lazy, recursive types such as JSON become easy to write. Aliases can also take type parameters.`,
            codeExamples: [
                `type Json = dict[str, Json] | list[Json] | str | int | float | bool | None
type Pair[T] = tuple[T, T]

def count_leaves(data: Json) -> int:
    if isinstance(data, dict):
        return sum(count_leaves(v) for v in data.values())
    if isinstance(data, list):
        return sum(count_leaves(v) for v in data)
    return 1

def flip[T](p: Pair[T]) -> Pair[T]:
    return p[1], p[0]

print(count_leaves({"a": 1, "b": [2, 3, {"c": None}]}))
print(flip(("x", "y")))

# OUTPUT:
# 4
# ('y', 'x')`
            ]
        },
        {
            content: `<h3>A type-Statement Alias Is Not the Class Itself</h3>
An old-style alias (<code>Vector = list[float]</code>) <b>is</b> the generic type, so you can call it. A <code>type</code>-statement alias is a separate object: it can't be called or used with <code>isinstance</code>. Use the underlying type for runtime work.`,
            codeExamples: [
                `OldVector = list[float]
type NewVector = list[float]

print(OldVector([1.0, 2.0]))

try:
    NewVector([1.0, 2.0])
except TypeError as error:
    print("TypeError:", error)

# OUTPUT:
# [1.0, 2.0]
# TypeError: 'typing.TypeAliasType' object is not callable`
            ]
        },
        {
            content: `<h3>NewType: A Distinct Type for the Checker</h3>
An alias does <b>not</b> stop you mixing values: if <code>UserId</code> and <code>OrderId</code> are both aliases of <code>int</code>, the checker treats them as the same. <code>NewType</code> creates a <b>distinct</b> type that the checker keeps apart, while at runtime the value is still a plain <code>int</code> with no extra cost - similar to wrapping an id in a small Java <code>record UserId(long value)</code>, but free.`,
            codeExamples: [
                `from typing import NewType

UserId = NewType("UserId", int)
OrderId = NewType("OrderId", int)

def get_user_name(uid: UserId) -> str:
    return {42: "Abaji"}.get(uid, "unknown")

uid = UserId(42)
oid = OrderId(42)

print(get_user_name(uid), type(uid))
print(get_user_name(oid))        # runs, but the checker objects
print(get_user_name(42))         # runs, but the checker objects

# OUTPUT:
# Abaji <class 'int'>
# Abaji
# Abaji
#
# mypy reports (wording may vary by version):
# error: Argument 1 to "get_user_name" has incompatible type "OrderId"; expected "UserId"
# error: Argument 1 to "get_user_name" has incompatible type "int"; expected "UserId"`
            ]
        },
        {
            content: `<h3>Alias vs NewType</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>Type alias</th><th>NewType</th></tr>
<tr class='text-center'><td>Purpose</td><td>Shorter, readable name for a type</td><td>A distinct type to prevent mix-ups</td></tr>
<tr class='text-center'><td>Interchangeable with the original?</td><td>Yes, fully</td><td>Only in one direction: a UserId is an int, but an int is not a UserId</td></tr>
<tr class='text-center'><td>Creating a value</td><td>Use the original type</td><td><code>UserId(42)</code></td></tr>
<tr class='text-center'><td>Runtime cost</td><td>None</td><td>None - returns the int unchanged</td></tr>
<tr class='text-center'><td>Typical use</td><td>Long nested types, JSON, matrices</td><td>IDs, money in paise, validated strings</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is a type alias?</td><td>A name for an existing type; fully interchangeable with it</td></tr>
<tr class='text-center'><td>What does the 3.12 <code>type</code> statement add?</td><td>An explicit, lazily evaluated TypeAliasType - supports recursive and generic aliases</td></tr>
<tr class='text-center'><td>Alias vs NewType?</td><td>An alias is just another name; NewType creates a distinct type the checker won't confuse with the base type</td></tr>
<tr class='text-center'><td>What does <code>UserId(42)</code> return at runtime?</td><td>The plain int 42 - NewType has no runtime overhead</td></tr>
<tr class='text-center'><td>Can you call a type-statement alias?</td><td>No - it is a TypeAliasType object; use the underlying type for construction and isinstance</td></tr>
</table>`
        }
    ]
};
