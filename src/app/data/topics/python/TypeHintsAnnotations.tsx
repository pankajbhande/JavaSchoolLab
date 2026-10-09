import type { Topic } from '../../types';

export const typeHintsAnnotations: Topic = {
    id: 'python-type-hints-variable-function-annotations',
    name: 'Variable & Function Annotations',
    beginner: [
        {
            content: `<h4>What Are Type Hints?</h4>
Python is dynamically typed, but since Python 3.5 you can <b>annotate</b> code with the types you expect. These <b>type hints</b> document intent for humans, power editor auto-completion, and let tools like <b>mypy</b> and <b>Pyright</b> catch type bugs before the program runs.<br><br>
Unlike Java, the interpreter <b>does not enforce</b> them - they are optional metadata.`
        },
        {
            content: `<h4>Annotating Function Parameters and Return Values</h4>
Write <code>name: type</code> for each parameter and <code>-&gt; type</code> before the colon for the return value.`,
            codeExamples: [
                `def greet(name: str, times: int = 1) -> str:
    return ("Hello, " + name + "! ") * times

def log(message: str) -> None:        # returns nothing
    print("LOG:", message)

print(greet("Asha", 2))
log("started")

# OUTPUT:
# Hello, Asha! Hello, Asha!
# LOG: started`
            ]
        },
        {
            content: `<h4>Annotating Variables</h4>
Use <code>name: type = value</code>. Most of the time you don't need it - tools infer the type from the value - but it helps for empty containers and values that start as <code>None</code>.`,
            codeExamples: [
                `count: int = 0
price: float = 99.5
city: str = "Pune"
active: bool = True
scores: list[int] = []          # without the hint, tools can't tell what goes inside

print(count, price, city, active, scores)

# OUTPUT:
# 0 99.5 Pune True []`
            ]
        },
        {
            content: `<h4>Hints Are Not Checked at Runtime</h4>
Python runs code with wrong types exactly as it would without hints. The error, if any, only appears when an operation actually fails.`,
            codeExamples: [
                `def double(n: int) -> int:
    return n * 2

print(double(21))
print(double("ab"))         # wrong type - Python runs it anyway

# OUTPUT:
# 42
# abab`
            ]
        },
        {
            content: `<h4>Checking with mypy</h4>
Install a type checker and run it over your files. It reads the hints and reports mistakes without executing the code.`,
            codeExamples: [
                `# shop.py
def total(price: float, qty: int) -> float:
    return price * qty

total(99.5, "3")

# $ pip install mypy
# $ mypy shop.py
# mypy reports (wording may vary by version):
# shop.py:4: error: Argument 2 to "total" has incompatible type "str"; expected "int"  [arg-type]
# Found 1 error in 1 file (checked 1 source file)`
            ]
        },
        {
            content: `<h4>Python vs Java Typing</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th></th><th>Java</th><th>Python with hints</th></tr>
<tr class='text-center'><td>Declaration</td><td><code>int count = 0;</code></td><td><code>count: int = 0</code></td></tr>
<tr class='text-center'><td>Method signature</td><td><code>String greet(String name)</code></td><td><code>def greet(name: str) -&gt; str:</code></td></tr>
<tr class='text-center'><td>No return value</td><td><code>void</code></td><td><code>-&gt; None</code></td></tr>
<tr class='text-center'><td>Who checks</td><td>The compiler - always</td><td>An external tool (mypy, Pyright, your IDE) - optional</td></tr>
<tr class='text-center'><td>At runtime</td><td>Types enforced</td><td>Hints ignored</td></tr>
</table>`
        }
    ],

    expert: [
        {
            content: `<h3>Where Hints Are Stored: __annotations__</h3>
Annotations are evaluated and stored in an <code>__annotations__</code> dict on the function (and on the module or class for variable annotations). Libraries such as dataclasses, Pydantic and FastAPI read them at runtime to generate code, validation and API docs. <code>typing.get_type_hints()</code> is the robust way to read them.`,
            codeExamples: [
                `import typing

def register(name: str, age: int = 18) -> bool:
    return True

print(register.__annotations__)
print(typing.get_type_hints(register))

# OUTPUT:
# {'name': <class 'str'>, 'age': <class 'int'>, 'return': <class 'bool'>}
# {'name': <class 'str'>, 'age': <class 'int'>, 'return': <class 'bool'>}`
            ]
        },
        {
            content: `<h3>An Annotation Alone Creates No Variable</h3>
<code>x: int</code> without a value only records the type; the name is not bound. Reading it is still a <code>NameError</code>.`,
            codeExamples: [
                `total: int          # annotation only
print(__annotations__)
print(total)

# OUTPUT:
# {'total': <class 'int'>}
# NameError: name 'total' is not defined`
            ]
        },
        {
            content: `<h3>Gradual Typing and Any</h3>
You don't have to annotate a whole project at once. Unannotated functions are treated as returning and accepting <code>Any</code>, which mypy never complains about. <code>Any</code> is compatible with every type in both directions - an escape hatch that also switches checking off, so use it sparingly. Prefer <code>object</code> when you mean "any value, but I won't assume anything about it".`,
            codeExamples: [
                `from typing import Any

def parse(raw: Any) -> int:
    return raw.whatever()          # mypy allows anything on Any

def describe(value: object) -> str:
    return value.upper()           # mypy rejects: object has no upper()

# mypy reports (wording may vary by version):
# error: "object" has no attribute "upper"  [attr-defined]`
            ]
        },
        {
            content: `<h3>Return Types Catch Missing Returns</h3>
A declared return type lets the checker spot paths that forget to return - a bug Python itself turns into a silent <code>None</code>.`,
            codeExamples: [
                `def grade(marks: int) -> str:
    if marks >= 40:
        return "pass"
    # forgot the fail case

print(grade(30))

# OUTPUT:
# None
#
# mypy reports (wording may vary by version):
# error: Missing return statement  [return]`
            ]
        },
        {
            content: `<h3>Forward References and Postponed Evaluation</h3>
A class can't be named in its own body before it exists. Quote the annotation (<code>"Node"</code>), or add <code>from __future__ import annotations</code> so annotations are stored as strings and not evaluated at definition time. Since 3.11, <code>typing.Self</code> expresses "an instance of this class".`,
            codeExamples: [
                `from __future__ import annotations

class Node:
    def __init__(self, value: int, next: Node | None = None) -> None:
        self.value = value
        self.next = next

head = Node(1, Node(2))
print(head.next.value)
print(Node.__init__.__annotations__["next"])

# OUTPUT:
# 2
# Node | None`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Does Python enforce type hints?</td><td>No - CPython ignores them at runtime; tools like mypy, Pyright and IDEs check them</td></tr>
<tr class='text-center'><td>Where are annotations stored?</td><td>In <code>__annotations__</code> on functions, classes and modules; read them with <code>typing.get_type_hints()</code></td></tr>
<tr class='text-center'><td>How do you annotate a function that returns nothing?</td><td><code>-&gt; None</code></td></tr>
<tr class='text-center'><td>Any vs object?</td><td>Any disables checking in both directions; object accepts anything but only allows operations every object supports</td></tr>
<tr class='text-center'><td>What is gradual typing?</td><td>Adding hints incrementally - unannotated code is treated as Any, so typed and untyped code coexist</td></tr>
<tr class='text-center'><td>Why use hints if they aren't enforced?</td><td>Earlier bug detection, better editor completion, self-documenting code, and runtime use by frameworks like FastAPI and Pydantic</td></tr>
</table>`
        }
    ]
};
