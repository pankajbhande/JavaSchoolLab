import type { Topic } from '../../types';

export const typeHintsLiteralFinal: Topic = {
    id: 'python-type-hints-literal-final',
    name: 'Literal & Final',
    beginner: [
        {
            content: `<h4>Literal: Only These Exact Values</h4>
Sometimes a parameter is a <code>str</code>, but only a few specific strings make sense - a file mode, a sort direction, a log level. <code>Literal[...]</code> lists the allowed values so the checker can reject typos.`,
            codeExamples: [
                `from typing import Literal

def open_report(path: str, mode: Literal["r", "w"]) -> str:
    return f"opening {path} in mode {mode}"

def sort_marks(marks: list[int], order: Literal["asc", "desc"] = "asc") -> list[int]:
    return sorted(marks, reverse=(order == "desc"))

print(open_report("report.txt", "r"))
print(sort_marks([70, 90, 80], "desc"))
print(open_report("report.txt", "x"))     # runs - but the checker flags it

# mypy reports (wording may vary by version):
# error: Argument 2 to "open_report" has incompatible type "Literal['x']"; expected "Literal['r', 'w']"  [arg-type]
#
# OUTPUT:
# opening report.txt in mode r
# [90, 80, 70]
# opening report.txt in mode x`
            ]
        },
        {
            content: `<h4>Final: A Constant That Must Not Be Reassigned</h4>
Python has no <code>final</code> keyword like Java. The UPPER_CASE naming convention signals a constant; <code>Final</code> makes the checker enforce it.`,
            codeExamples: [
                `from typing import Final

MAX_RETRIES: Final = 3
GST_RATE: Final[float] = 0.18

MAX_RETRIES = 5          # Python allows it at runtime...
print(MAX_RETRIES)

# mypy reports (wording may vary by version):
# error: Cannot assign to final name "MAX_RETRIES"  [misc]
#
# OUTPUT:
# 5`
            ]
        },
        {
            content: `<h4>Literal vs Final vs Java</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Python</th><th>Purpose</th><th>Java</th></tr>
<tr class='text-center'><td><code>Literal["asc", "desc"]</code></td><td>Restrict a value to a fixed set</td><td>An <code>enum</code></td></tr>
<tr class='text-center'><td><code>X: Final = 3</code></td><td>Never reassign this name</td><td><code>static final int X = 3;</code></td></tr>
<tr class='text-center'><td><code>@final</code> on a class</td><td>No subclasses</td><td><code>final class</code></td></tr>
<tr class='text-center'><td><code>@final</code> on a method</td><td>No overriding</td><td><code>final</code> method</td></tr>
</table>
In every case Python's version is checked only by tools - the interpreter never blocks it.`
        }
    ],

    expert: [
        {
            content: `<h3>@final Classes and Methods</h3>
<code>typing.final</code> marks a class that must not be subclassed, or a method that must not be overridden. At runtime the decorator does almost nothing (since 3.11 it sets a <code>__final__</code> attribute where it can).`,
            codeExamples: [
                `from typing import final

@final
class Config:
    pass

class Base:
    @final
    def checksum(self) -> int:
        return 42

class MyConfig(Config):          # runs, but flagged
    pass

class Child(Base):
    def checksum(self) -> int:   # runs, but flagged
        return 0

print(Child().checksum(), Config.__final__)

# mypy reports (wording may vary by version):
# error: Cannot inherit from final class "Config"  [misc]
# error: Cannot override final attribute "checksum" (previously declared in base class "Base")  [misc]
#
# OUTPUT:
# 0 True`
            ]
        },
        {
            content: `<h3>Final Is About the Name, Not the Object</h3>
<code>Final</code> stops <b>rebinding</b>, not mutation - exactly like Java's <code>final</code> reference. A <code>Final</code> list can still be appended to. For truly immutable constants, use a tuple or <code>frozenset</code>.`,
            codeExamples: [
                `from typing import Final

ALLOWED_ROLES: Final = ["admin", "editor"]
ALLOWED_ROLES.append("hacker")          # mutation is allowed (by Python and mypy)
print(ALLOWED_ROLES)

SAFE_ROLES: Final = ("admin", "editor")  # immutable value as well as final name
print("hacker" in SAFE_ROLES)

# OUTPUT:
# ['admin', 'editor', 'hacker']
# False`
            ]
        },
        {
            content: `<h3>Literal vs Enum</h3>
Both restrict a value to a fixed set. <code>Literal</code> keeps plain strings (easy for JSON and configuration, nothing to import at call sites). An <code>Enum</code> is a real runtime type: values are validated when converted, it can carry methods, and it is iterable. Choose an enum when the set of values is a concept of its own in your program.`,
            codeExamples: [
                `from enum import Enum
from typing import Literal, get_args

Direction = Literal["asc", "desc"]
print(get_args(Direction))

class Order(Enum):
    ASC = "asc"
    DESC = "desc"

print(Order("desc"), [o.value for o in Order])
Order("sideways")

# OUTPUT:
# ('asc', 'desc')
# Order.DESC ['asc', 'desc']
# ValueError: 'sideways' is not a valid Order`
            ]
        },
        {
            content: `<h3>Literal Values Are Not Checked at Runtime</h3>
Like every hint, <code>Literal</code> is ignored by Python. When the value comes from outside (user input, an API), validate it yourself - <code>get_args()</code> lets you reuse the same list of allowed values.`,
            codeExamples: [
                `from typing import Literal, get_args

Level = Literal["debug", "info", "error"]

def set_level(level: str) -> Level:
    if level not in get_args(Level):
        raise ValueError(f"invalid level: {level!r}")
    return level            # type: ignore[return-value]  (checker can't see the narrowing)

print(set_level("info"))
set_level("loud")

# OUTPUT:
# info
# ValueError: invalid level: 'loud'`
            ]
        },
        {
            content: `<h3>LiteralString (3.11+)</h3>
<code>typing.LiteralString</code> accepts only strings written as literals in the source code (or built from them), not strings that came from user input. Database and shell libraries use it to let checkers flag SQL or command injection: a query built from a literal passes, a query built with an f-string from user data is rejected by the checker.`,
            codeExamples: [
                `from typing import LiteralString

def run_query(sql: LiteralString) -> str:
    return f"executing: {sql}"

print(run_query("SELECT * FROM users WHERE id = ?"))   # literal - accepted

user_input = input("id: ")
run_query(f"SELECT * FROM users WHERE id = {user_input}")   # flagged by the checker

# mypy / Pyright report that a plain "str" is not a "LiteralString"
# (support and wording vary by tool and version)`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What does <code>Literal["r", "w"]</code> mean?</td><td>The value must be exactly "r" or "w" - checked by type checkers only</td></tr>
<tr class='text-center'><td>Does <code>Final</code> make a constant immutable?</td><td>No - it forbids rebinding the name; the object itself can still be mutated</td></tr>
<tr class='text-center'><td>How do you prevent subclassing in Python?</td><td>Decorate the class with <code>typing.final</code> - enforced by type checkers, not at runtime</td></tr>
<tr class='text-center'><td>Literal vs Enum?</td><td>Literal restricts plain values for the checker; Enum is a runtime type with validation and methods</td></tr>
<tr class='text-center'><td>How do you read the values of a Literal at runtime?</td><td><code>typing.get_args(MyLiteral)</code></td></tr>
<tr class='text-center'><td>What is LiteralString for?</td><td>Letting checkers flag injection by accepting only strings built from source-code literals</td></tr>
</table>`
        }
    ]
};
