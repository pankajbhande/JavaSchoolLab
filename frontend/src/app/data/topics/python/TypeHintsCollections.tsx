import type { Topic } from '../../types';

export const typeHintsCollections: Topic = {
    id: 'python-type-hints-collection-types-list-dict-tuple',
    name: 'Collection Types: list, dict & tuple',
    beginner: [
        {
            content: `<h4>Saying What's Inside a Collection</h4>
<code>list</code> alone says "some list". Square brackets say what it contains - like Java generics (<code>List&lt;Integer&gt;</code>). Since Python 3.9 the built-in types can be used directly.
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Hint</th><th>Meaning</th><th>Java equivalent</th></tr>
<tr class='text-center'><td><code>list[int]</code></td><td>A list of ints</td><td><code>List&lt;Integer&gt;</code></td></tr>
<tr class='text-center'><td><code>set[str]</code></td><td>A set of strings</td><td><code>Set&lt;String&gt;</code></td></tr>
<tr class='text-center'><td><code>dict[str, float]</code></td><td>str keys, float values</td><td><code>Map&lt;String, Double&gt;</code></td></tr>
<tr class='text-center'><td><code>tuple[str, int]</code></td><td>Exactly two items: a str then an int</td><td>A record / pair class</td></tr>
<tr class='text-center'><td><code>tuple[int, ...]</code></td><td>Any number of ints</td><td><code>int[]</code> (read-only)</td></tr>
</table>`
        },
        {
            content: `<h4>Using Them</h4>`,
            codeExamples: [
                `def average(marks: list[int]) -> float:
    return sum(marks) / len(marks)

def price_list(prices: dict[str, float]) -> list[str]:
    return [f"{item}: {price}" for item, price in prices.items()]

def min_max(values: list[int]) -> tuple[int, int]:
    return min(values), max(values)

print(average([70, 80, 90]))
print(price_list({"pen": 10.0, "book": 250.5}))
print(min_max([4, 9, 2]))

# OUTPUT:
# 80.0
# ['pen: 10.0', 'book: 250.5']
# (2, 9)`
            ]
        },
        {
            content: `<h4>Fixed-Length vs Variable-Length Tuples</h4>
A tuple hint lists the type of <b>each position</b>. To mean "a tuple of any length, all the same type", add <code>...</code>.`,
            codeExamples: [
                `student: tuple[str, int, float] = ("Abaji", 21, 8.7)    # exactly 3 items
rgb: tuple[int, int, int] = (255, 128, 0)
marks: tuple[int, ...] = (70, 85, 90, 65)               # any number of ints

print(student[0], rgb, len(marks))

# OUTPUT:
# Abaji (255, 128, 0) 4`
            ]
        },
        {
            content: `<h4>Nested Types</h4>
Types nest just like the data does.`,
            codeExamples: [
                `class_marks: dict[str, list[int]] = {
    "Abaji": [91, 85],
    "Raoji": [72, 68],
}
matrix: list[list[float]] = [[1.0, 2.0], [3.0, 4.0]]
edges: list[tuple[str, str]] = [("A", "B"), ("B", "C")]

print(class_marks["Abaji"][1], matrix[1][0], edges[0])

# OUTPUT:
# 85 3.0 ('A', 'B')`
            ]
        },
        {
            content: `<h4>What the Checker Catches</h4>`,
            codeExamples: [
                `scores: list[int] = [70, 80]
scores.append("ninety")

ages: dict[str, int] = {"Abaji": 21}
ages[42] = "Raoji"

# The code runs (lists and dicts accept anything), but:
# mypy reports (wording may vary by version):
# error: Argument 1 to "append" of "list" has incompatible type "str"; expected "int"  [arg-type]
# error: Invalid index type "int" for "dict[str, int]"; expected type "str"  [index]
# error: Incompatible types in assignment (expression has type "str", target has type "int")  [assignment]`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Older Code: typing.List, typing.Dict...</h3>
Before Python 3.9 you had to import capitalised aliases from <code>typing</code>. They still work but are <b>deprecated</b> - use the built-in names in new code.
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Old (3.5-3.8)</th><th>Modern (3.9+)</th></tr>
<tr class='text-center'><td><code>from typing import List</code> → <code>List[int]</code></td><td><code>list[int]</code></td></tr>
<tr class='text-center'><td><code>Dict[str, int]</code></td><td><code>dict[str, int]</code></td></tr>
<tr class='text-center'><td><code>Tuple[int, str]</code></td><td><code>tuple[int, str]</code></td></tr>
<tr class='text-center'><td><code>Set[str]</code></td><td><code>set[str]</code></td></tr>
</table>`
        },
        {
            content: `<h3>Accept General, Return Specific</h3>
For <b>parameters</b>, ask only for what the function actually uses. A function that just loops over its input should take <code>Iterable[int]</code>, so callers can pass a list, tuple, set, range or generator. For <b>return values</b>, be specific (<code>list[int]</code>) so callers know exactly what they get. These abstract types live in <code>collections.abc</code> - the same idea as declaring a Java parameter as <code>Collection&lt;T&gt;</code> instead of <code>ArrayList&lt;T&gt;</code>.
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Type</th><th>Promises</th></tr>
<tr class='text-center'><td><code>Iterable[T]</code></td><td>Can be looped over</td></tr>
<tr class='text-center'><td><code>Sequence[T]</code></td><td>Plus <code>len()</code> and indexing (list, tuple, str, range) - read-only</td></tr>
<tr class='text-center'><td><code>Mapping[K, V]</code></td><td>Read-only dict-like access</td></tr>
<tr class='text-center'><td><code>MutableSequence[T]</code> / <code>MutableMapping[K, V]</code></td><td>Also allows modification</td></tr>
</table>`,
            codeExamples: [
                `from collections.abc import Iterable, Mapping, Sequence

def total(values: Iterable[int]) -> int:
    return sum(values)

def first_and_last(items: Sequence[str]) -> tuple[str, str]:
    return items[0], items[-1]

def report(stock: Mapping[str, int]) -> list[str]:
    return sorted(name for name, qty in stock.items() if qty == 0)

print(total([1, 2]), total((3, 4)), total(range(5)), total(n * n for n in range(3)))
print(first_and_last(("a", "b", "c")), first_and_last("xyz"))
print(report({"pen": 0, "book": 4, "bag": 0}))

# OUTPUT:
# 3 7 10 5
# ('a', 'c') ('x', 'z')
# ['bag', 'pen']`
            ]
        },
        {
            content: `<h3>Why list[int] Isn't list[float] (Invariance)</h3>
A <code>list[int]</code> is <b>not</b> accepted where <code>list[float]</code> is expected, because the function could append a float into your list of ints. Read-only types such as <code>Sequence[float]</code> are <b>covariant</b> and accept it - another reason to use the abstract types for parameters. Java generics behave the same way (<code>List&lt;Integer&gt;</code> is not a <code>List&lt;Number&gt;</code>).`,
            codeExamples: [
                `from collections.abc import Sequence

def mean_list(values: list[float]) -> float:
    return sum(values) / len(values)

def mean_seq(values: Sequence[float]) -> float:
    return sum(values) / len(values)

ints: list[int] = [1, 2, 3]
print(mean_list(ints), mean_seq(ints))       # both run fine at runtime

# mypy reports (wording may vary by version):
# error: Argument 1 to "mean_list" has incompatible type "list[int]"; expected "list[float]"  [arg-type]
# (mean_seq(ints) is accepted)
#
# OUTPUT:
# 2.0 2.0`
            ]
        },
        {
            content: `<h3>Generic Aliases at Runtime</h3>
<code>list[int]</code> creates a <code>types.GenericAlias</code> object. Calling it still builds a plain list - the element type is not stored or checked - and <code>isinstance</code> refuses parameterised generics.`,
            codeExamples: [
                `alias = list[int]
print(alias, type(alias))
print(alias("abc"))                 # no checking: still just list("abc")
print(isinstance([1, 2], list))
print(isinstance([1, 2], list[int]))

# OUTPUT:
# list[int] <class 'types.GenericAlias'>
# ['a', 'b', 'c']
# True
# TypeError: isinstance() argument 2 cannot be a parameterized generic`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>How do you hint a list of strings?</td><td><code>list[str]</code> (3.9+); <code>typing.List[str]</code> in older code</td></tr>
<tr class='text-center'><td><code>tuple[int, str]</code> vs <code>tuple[int, ...]</code>?</td><td>The first is exactly two items (int then str); the second is any number of ints</td></tr>
<tr class='text-center'><td>Why use Iterable or Sequence for parameters?</td><td>They accept any suitable container (list, tuple, generator...), making the function more reusable</td></tr>
<tr class='text-center'><td>Is <code>list[int]</code> compatible with <code>list[float]</code>?</td><td>No - list is invariant because it is mutable; <code>Sequence[float]</code> accepts it</td></tr>
<tr class='text-center'><td>Are element types checked at runtime?</td><td>No - <code>list[int]("abc")</code> happily builds a list of strings</td></tr>
</table>`
        }
    ]
};
