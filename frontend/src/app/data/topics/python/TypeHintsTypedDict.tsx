import type { Topic } from '../../types';

export const typeHintsTypedDict: Topic = {
    id: 'python-type-hints-typeddict',
    name: 'TypedDict',
    beginner: [
        {
            content: `<h4>Dictionaries with a Known Shape</h4>
A lot of real data arrives as dictionaries with a <b>fixed set of keys</b>: JSON from an API, a row from a database, a config file. <code>dict[str, object]</code> says nothing useful about it. A <code>TypedDict</code> describes each key and the type of its value, so editors can autocomplete keys and type checkers (mypy, Pyright) can catch typos and wrong types.<br><br>
In Java you would write a class or a <code>record</code> for this. A <code>TypedDict</code> describes the data <b>without</b> changing it: at runtime the object is still an ordinary <code>dict</code>.`,
            codeExamples: [
                `from typing import TypedDict

class Student(TypedDict):
    name: str
    age: int
    marks: list[int]

s: Student = {"name": "Abaji", "age": 21, "marks": [80, 90]}

print(s["name"], sum(s["marks"]))
print(type(s))

# OUTPUT:
# Abaji 170
# <class 'dict'>`
            ]
        },
        {
            content: `<h4>What the Type Checker Catches</h4>
Python itself runs every line below. A type checker reports the mistakes before the program runs - exactly the kind of bug that otherwise surfaces as a <code>KeyError</code> deep inside a web request.`,
            codeExamples: [
                `from typing import TypedDict

class Student(TypedDict):
    name: str
    age: int
    marks: list[int]

a: Student = {"name": "Raoji", "age": 22}                    # missing "marks"
b: Student = {"name": "Kanhoji", "age": "22", "marks": []}    # age is a str
print(a["nmae"])                                            # typo in the key

# mypy reports (wording may vary by version):
# error: Missing key "marks" for TypedDict "Student"
# error: Incompatible types (expression has type "str", TypedDict item "age" has type "int")
# error: TypedDict "Student" has no key "nmae"`
            ]
        },
        {
            content: `<h4>Optional Keys: total=False</h4>
By default every key is required. <code>total=False</code> makes all keys of that class optional - useful for "settings that may or may not be present". Read optional keys with <code>.get()</code>.`,
            codeExamples: [
                `from typing import TypedDict

class Options(TypedDict, total=False):
    debug: bool
    port: int

defaults: Options = {}
custom: Options = {"port": 8080}

print(custom.get("port", 80), custom.get("debug", False))
print(sorted(Options.__optional_keys__))

# OUTPUT:
# 8080 False
# ['debug', 'port']`
            ]
        },
        {
            content: `<h4>Mixing Required and Optional: Required / NotRequired</h4>
Since Python 3.11, <code>NotRequired[...]</code> marks a single key as optional (and <code>Required[...]</code> does the reverse inside a <code>total=False</code> class).`,
            codeExamples: [
                `from typing import NotRequired, TypedDict

class User(TypedDict):
    id: int
    email: str
    phone: NotRequired[str]          # may be missing

u1: User = {"id": 1, "email": "abaji@example.com"}
u2: User = {"id": 2, "email": "raoji@example.com", "phone": "98765 43210"}

print(sorted(User.__required_keys__), sorted(User.__optional_keys__))
print(u1.get("phone", "not given"), u2.get("phone"))

# OUTPUT:
# ['email', 'id'] ['phone']
# not given 98765 43210`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>At Runtime It Is Only a dict</h3>
A <code>TypedDict</code> performs <b>no validation</b>. Calling the class just builds a plain dict, and <code>isinstance</code> checks are not allowed, because there is no real class behind the data.`,
            codeExamples: [
                `from typing import TypedDict

class Student(TypedDict):
    name: str
    age: int

s = Student(name="Raoji", age="not a number")    # accepted at runtime
print(s, type(s))

try:
    isinstance(s, Student)
except TypeError as error:
    print("TypeError:", error)

# OUTPUT:
# {'name': 'Raoji', 'age': 'not a number'} <class 'dict'>
# TypeError: TypedDict does not support instance and class checks`
            ]
        },
        {
            content: `<h3>Typing JSON from an API</h3>
<code>json.loads()</code> returns <code>Any</code>, so the checker trusts whatever you assign it to. A <code>TypedDict</code> then documents the expected shape for the rest of the code - but it does not prove the data really has that shape. When the data comes from outside your program, validate it (by hand, or with a library such as <b>pydantic</b>) at the boundary.`,
            codeExamples: [
                `import json
from typing import TypedDict

class Order(TypedDict):
    id: int
    total: float
    items: list[str]

def parse_order(text: str) -> Order:
    data = json.loads(text)
    if not isinstance(data.get("id"), int):
        raise ValueError("order id must be an int")
    return data

order = parse_order('{"id": 7, "total": 499.0, "items": ["pen", "book"]}')
print(order["id"], len(order["items"]))

# OUTPUT:
# 7 2`
            ]
        },
        {
            content: `<h3>The Functional Syntax</h3>
Keys that are not valid Python identifiers (hyphens, keywords such as <code>class</code>) can't be written as class attributes. The functional form accepts any string keys.`,
            codeExamples: [
                `from typing import TypedDict

Headers = TypedDict("Headers", {"content-type": str, "x-request-id": str})

h: Headers = {"content-type": "application/json", "x-request-id": "abc123"}
print(h["content-type"])

# OUTPUT:
# application/json`
            ]
        },
        {
            content: `<h3>TypedDict vs dataclass vs NamedTuple</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>TypedDict</th><th>dataclass</th><th>NamedTuple</th></tr>
<tr class='text-center'><td>Runtime object</td><td>Plain <code>dict</code></td><td>Instance of your class</td><td>A tuple subclass</td></tr>
<tr class='text-center'><td>Access</td><td><code>d["name"]</code></td><td><code>obj.name</code></td><td><code>t.name</code> or <code>t[0]</code></td></tr>
<tr class='text-center'><td>Mutable</td><td>Yes</td><td>Yes (unless <code>frozen=True</code>)</td><td>No</td></tr>
<tr class='text-center'><td>Methods / validation</td><td>No</td><td>Yes (<code>__post_init__</code>)</td><td>Methods, no validation</td></tr>
<tr class='text-center'><td>JSON round trip</td><td>Direct - it already is a dict</td><td>Needs conversion (<code>asdict</code>)</td><td>Needs conversion (<code>_asdict</code>)</td></tr>
<tr class='text-center'><td>Best for</td><td>Describing existing dict data (JSON, kwargs)</td><td>Your own domain objects</td><td>Small immutable records</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is a TypedDict?</td><td>A type hint describing a dict with specific keys and value types, checked by static type checkers</td></tr>
<tr class='text-center'><td>What type is a TypedDict value at runtime?</td><td>A plain dict - there is no validation and isinstance checks raise TypeError</td></tr>
<tr class='text-center'><td>How do you make keys optional?</td><td><code>total=False</code> for the whole class, or <code>NotRequired[...]</code> per key (3.11+)</td></tr>
<tr class='text-center'><td>TypedDict vs dataclass?</td><td>TypedDict types existing dict-shaped data; a dataclass creates a real class with attributes and methods</td></tr>
<tr class='text-center'><td>Does annotating JSON with a TypedDict validate it?</td><td>No - it only informs the type checker; validate external data explicitly or with a library such as pydantic</td></tr>
</table>`
        }
    ]
};
