import type { Topic } from '../../types';

export const typeHintsCallable: Topic = {
    id: 'python-type-hints-callable',
    name: 'Callable',
    beginner: [
        {
            content: `<h4>Typing a Function That Takes a Function</h4>
Functions are values in Python, so parameters often receive functions: callbacks, key functions, strategies. <code>Callable[[ArgType1, ArgType2], ReturnType]</code> describes such a parameter - the list holds the argument types, the last item is the return type.<br><br>
Import it from <code>collections.abc</code> (preferred since Python 3.9; <code>typing.Callable</code> also works). It plays the role of Java's functional interfaces such as <code>BiFunction&lt;Integer, Integer, Integer&gt;</code>.`,
            codeExamples: [
                `from collections.abc import Callable

def apply(func: Callable[[int, int], int], a: int, b: int) -> int:
    return func(a, b)

def multiply(x: int, y: int) -> int:
    return x * y

print(apply(multiply, 6, 7))
print(apply(lambda x, y: x - y, 10, 4))

# OUTPUT:
# 42
# 6`
            ]
        },
        {
            content: `<h4>Common Shapes</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Hint</th><th>Meaning</th><th>Java equivalent</th></tr>
<tr class='text-center'><td><code>Callable[[], None]</code></td><td>No arguments, returns nothing</td><td><code>Runnable</code></td></tr>
<tr class='text-center'><td><code>Callable[[str], int]</code></td><td>Takes a str, returns an int</td><td><code>Function&lt;String, Integer&gt;</code></td></tr>
<tr class='text-center'><td><code>Callable[[int], bool]</code></td><td>A test on an int</td><td><code>Predicate&lt;Integer&gt;</code></td></tr>
<tr class='text-center'><td><code>Callable[[], float]</code></td><td>Produces a value</td><td><code>Supplier&lt;Double&gt;</code></td></tr>
<tr class='text-center'><td><code>Callable[..., str]</code></td><td>Any arguments, returns a str</td><td>-</td></tr>
</table>`
        },
        {
            content: `<h4>Callbacks and Strategies</h4>
A dictionary of strategy functions is a common Python replacement for a Java strategy interface with several implementing classes.`,
            codeExamples: [
                `from collections.abc import Callable

Discount = Callable[[float], float]

def festive(total: float) -> float:
    return total * 0.9

def clearance(total: float) -> float:
    return total * 0.5

STRATEGIES: dict[str, Discount] = {"festive": festive, "clearance": clearance}

def checkout(total: float, strategy: Discount) -> float:
    return round(strategy(total), 2)

print(checkout(1000, STRATEGIES["festive"]))
print(checkout(1000, STRATEGIES["clearance"]))

# OUTPUT:
# 900.0
# 500.0`
            ]
        },
        {
            content: `<h4>What the Type Checker Catches</h4>
Passing a function with the wrong signature runs into trouble at runtime only when it is called. The type checker reports it immediately.`,
            codeExamples: [
                `from collections.abc import Callable

def run_twice(task: Callable[[], None]) -> None:
    task()
    task()

def greet(name: str) -> None:
    print("Hello", name)

run_twice(greet)

# mypy reports (wording may vary by version):
# error: Argument 1 to "run_twice" has incompatible type "Callable[[str], None]"; expected "Callable[[], None]"
#
# At runtime:
# TypeError: greet() missing 1 required positional argument: 'name'`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Callable[..., T] - When Arguments Don't Matter</h3>
The ellipsis means "any parameters". It is useful for helpers that only care about the result, such as a timing or retry wrapper - but it switches off argument checking, so prefer a precise signature when you know it.`,
            codeExamples: [
                `import time
from collections.abc import Callable

def timed(func: Callable[..., int], *args: object) -> int:
    start = time.perf_counter()
    result = func(*args)
    print(f"{func.__name__} took {time.perf_counter() - start:.4f}s")
    return result

print(timed(sum, [1, 2, 3]))

# OUTPUT (time varies - e.g.):
# sum took 0.0000s
# 6`
            ]
        },
        {
            content: `<h3>ParamSpec: Decorators That Keep the Signature</h3>
A decorator typed as <code>Callable[..., Any]</code> loses the wrapped function's parameter types, so every call to the decorated function goes unchecked. <code>ParamSpec</code> captures the whole parameter list and passes it through, and a <code>TypeVar</code> carries the return type. Python 3.12 adds a shorter syntax: <code>def logged[**P, R](func: Callable[P, R]) -> Callable[P, R]</code>.`,
            codeExamples: [
                `import functools
from collections.abc import Callable
from typing import ParamSpec, TypeVar

P = ParamSpec("P")
R = TypeVar("R")

def logged(func: Callable[P, R]) -> Callable[P, R]:
    @functools.wraps(func)
    def wrapper(*args: P.args, **kwargs: P.kwargs) -> R:
        print("calling", func.__name__)
        return func(*args, **kwargs)
    return wrapper

@logged
def add(a: int, b: int) -> int:
    return a + b

print(add(2, 3))
add("2", 3)        # caught by the checker thanks to ParamSpec

# OUTPUT:
# calling add
# 5
# calling add
# TypeError: can only concatenate str (not "int") to str
#
# mypy reports (wording may vary by version):
# error: Argument 1 to "add" has incompatible type "str"; expected "int"`
            ]
        },
        {
            content: `<h3>Callback Protocols for Complex Signatures</h3>
<code>Callable[[...], ...]</code> can only express positional parameters. Keyword-only parameters, default values, overloads or <code>*args</code> need a <b>callback protocol</b>: a <code>Protocol</code> with a <code>__call__</code> method. Any function with a matching signature satisfies it.`,
            codeExamples: [
                `from typing import Protocol

class Formatter(Protocol):
    def __call__(self, value: float, *, decimals: int = 2) -> str: ...

def money(value: float, *, decimals: int = 2) -> str:
    return f"₹{value:,.{decimals}f}"

def report(totals: list[float], fmt: Formatter) -> None:
    for t in totals:
        print(fmt(t), fmt(t, decimals=0))

report([1234.5, 99.0], money)

# OUTPUT:
# ₹1,234.50 ₹1,234
# ₹99.00 ₹99`
            ]
        },
        {
            content: `<h3>Hints Are Not Runtime Checks</h3>
<code>Callable</code> annotations are ignored when the program runs. To check at runtime that something can be called, use <code>callable(obj)</code> - which is also true for classes and objects with <code>__call__</code>.`,
            codeExamples: [
                `class Doubler:
    def __call__(self, n: int) -> int:
        return n * 2

print(callable(len), callable(Doubler), callable(Doubler()), callable(42))

# OUTPUT:
# True True True False`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>How do you type a parameter that takes a function?</td><td><code>Callable[[ArgTypes...], ReturnType]</code> from collections.abc</td></tr>
<tr class='text-center'><td>What does <code>Callable[..., int]</code> mean?</td><td>A callable with any parameters that returns an int</td></tr>
<tr class='text-center'><td>Why use ParamSpec?</td><td>So a decorator's wrapper keeps the wrapped function's exact parameter types for the type checker</td></tr>
<tr class='text-center'><td>When is Callable not enough?</td><td>For keyword-only arguments, defaults or overloads - use a Protocol with __call__</td></tr>
<tr class='text-center'><td>Python equivalent of Java's Function/Predicate/Supplier?</td><td><code>Callable[[T], R]</code>, <code>Callable[[T], bool]</code>, <code>Callable[[], T]</code></td></tr>
</table>`
        }
    ]
};
