// Module 16 (Type Hints), part A: annotations, collections, Optional/Union, Literal/Final, TypedDict.
import { dd, r, type DeepDive } from './deepDive';

export const m16a: Record<string, DeepDive> = {
    'Variable & Function Annotations': dd(
        [`<b>Type hints</b> annotate what types variables, parameters and return values are meant to hold: <code>x: int = 5</code> and <code>def f(a: int) -> str:</code>. Python itself does <b>not enforce</b> them; tools such as mypy, pyright and IDEs check them.`,
            r`def greet(name: str, times: int = 1) -> str:
    return ("Hello, " + name + "! ") * times

age: int = 30                 # variable annotation
print(greet("Ann", 2))
print(greet.__annotations__)

# OUTPUT:
# Hello, Ann! Hello, Ann!
# {'name': <class 'str'>, 'times': <class 'int'>, 'return': <class 'str'>}`],
        [`In a dynamic language, a function's expected inputs live only in the author's head. Annotations document them in code, enable auto-complete and catch mismatches before the program runs.`,
            r`def double(n: int) -> int:
    return n * 2

# A checker (mypy) flags the next line BEFORE running:
#   error: Argument 1 to "double" has incompatible type "str"; expected "int"
print(double("ab"))        # Python runs it anyway: str * 2 works

# OUTPUT:
# abab`],
        [`Large codebases, public libraries and APIs (FastAPI, Pydantic and dataclasses read annotations at runtime), and CI pipelines that run mypy or pyright as a gate.`,
            r`from dataclasses import dataclass

@dataclass
class User:
    id: int
    name: str
    active: bool = True       # annotations define the fields

print(User(1, "Ann"))

# OUTPUT:
# User(id=1, name='Ann', active=True)`],
        [`<b>Advantages:</b> self-documenting signatures, better IDE help, early bug detection, safer refactoring, and gradual adoption: annotate only what you want.`,
            r`import inspect
def area(w: float, h: float = 1.0) -> float:
    return w * h

print(inspect.signature(area))        # tools read the same metadata

# OUTPUT:
# (w: float, h: float = 1.0) -> float`],
        [`<b>Disadvantages:</b> extra typing effort, more verbose signatures, and a false sense of safety because wrong values still run at runtime.`,
            r`def square(n: int) -> int:
    return n * n

print(square(2.5))          # annotation is a promise, not a check

# OUTPUT:
# 6.25`],
        [`<b>Limitations:</b> annotations do not enforce anything and do not change speed; they only describe intent. Variables annotated without a value are not even created.`,
            r`x: int                     # annotation only: no variable is created
try:
    print(x)
except NameError as e:
    print("NameError:", e)
print(__annotations__)

# OUTPUT:
# NameError: name 'x' is not defined
# {'x': <class 'int'>}`],
        `
   source ──► Python runs it (ignores hints)
      │
      └──► mypy / pyright / IDE ──► reports: wrong type passed, missing return
   hints are read by:  type checkers | IDEs | Pydantic | FastAPI | dataclasses
`,
        `Adopt types incrementally: public APIs first, then core domain code, with <code>mypy --strict</code> on new modules. Types are documentation that is verified; they do not replace tests or runtime validation of external input (use Pydantic at boundaries).`
    ),

    'Collection Types: list, dict & tuple': dd(
        [`Annotate containers with their element types using the built-in generics (Python 3.9+): <code>list[int]</code>, <code>dict[str, float]</code>, <code>tuple[int, str]</code> (fixed shape), <code>tuple[int, ...]</code> (any length), <code>set[str]</code>.`,
            r`prices: dict[str, float] = {"apple": 1.2, "pear": 0.8}
ids: list[int] = [1, 2, 3]
point: tuple[float, float] = (1.5, 2.5)        # exactly two floats
vals: tuple[int, ...] = (1, 2, 3, 4)           # any number of ints
print(prices, ids, point, vals)

# OUTPUT:
# {'apple': 1.2, 'pear': 0.8} [1, 2, 3] (1.5, 2.5) (1, 2, 3, 4)`],
        [`A bare <code>list</code> says nothing about what is inside. Element types let a checker flag <code>list_of_ints.append("x")</code> and give the IDE enough information to complete methods on items.`,
            r`def total(values: list[float]) -> float:
    return sum(values)

def first_word(words: list[str]) -> str:
    return words[0].upper()          # IDE knows words[0] is a str

print(total([1.5, 2.5]), first_word(["hi", "yo"]))

# OUTPUT:
# 4.0 HI`],
        [`Function signatures for data processing, configuration dictionaries, JSON-like structures and return types of repository or service methods.`,
            r`def group_by_len(words: list[str]) -> dict[int, list[str]]:
    out: dict[int, list[str]] = {}
    for w in words:
        out.setdefault(len(w), []).append(w)
    return out

print(group_by_len(["a", "bb", "c", "dd", "eee"]))

# OUTPUT:
# {1: ['a', 'c'], 2: ['bb', 'dd'], 3: ['eee']}`],
        [`<b>Advantages:</b> precise contracts, checker catches wrong element types, and read-only abstractions (<code>Sequence</code>, <code>Mapping</code>) accept more inputs.`,
            r`from collections.abc import Sequence, Mapping

def head(items: Sequence[int]) -> int:      # accepts list, tuple, range ...
    return items[0]

def keys(m: Mapping[str, int]) -> list[str]:
    return sorted(m)

print(head([7, 8]), head((9, 1)), head(range(3, 6)), keys({"b": 1, "a": 2}))

# OUTPUT:
# 7 9 3 ['a', 'b']`],
        [`<b>Disadvantages:</b> verbose for deep structures, and <code>list</code> is invariant: a <code>list[int]</code> is not accepted where <code>list[float]</code> is expected.`,
            r`def avg(xs: list[float]) -> float:
    return sum(xs) / len(xs)

ints: list[int] = [1, 2, 3]
print(avg(ints))      # runs fine; mypy rejects it: list is invariant
                      # fix: use Sequence[float] (covariant) in the signature

# OUTPUT:
# 2.0`],
        [`<b>Limitations:</b> generics are erased at runtime: <code>list[int]</code> does not check contents, <code>isinstance(x, list[int])</code> is an error, and a tuple's fixed shape is not enforced by Python.`,
            r`x: list[int] = ["not", "ints"]      # runs without complaint
print(x)
try:
    isinstance(x, list[int])
except TypeError as e:
    print("TypeError:", e)

# OUTPUT:
# ['not', 'ints']
# TypeError: isinstance() argument 2 cannot be a parameterized generic`],
        `
   list[int]            homogeneous, any length      [1, 2, 3]
   tuple[int, str]      fixed positions and types    (1, "a")
   tuple[int, ...]      homogeneous, any length      (1, 2, 3, 4)
   dict[str, float]     key type -> value type       {"a": 1.0}
   Sequence / Mapping   read-only abstract types (prefer for parameters)
`,
        `Accept the most general abstract type (<code>Iterable</code>, <code>Sequence</code>, <code>Mapping</code>) in parameters and return the most specific concrete one. Use <code>tuple</code> for records only when positions are obvious, otherwise a dataclass or NamedTuple.`
    ),

    'Optional & Union': dd(
        [`<code>Union[int, str]</code> (or <code>int | str</code> in 3.10+) means "one of these types". <code>Optional[int]</code> is exactly <code>int | None</code>: the value may be missing.`,
            r`from typing import Optional

def find(name: str, users: dict[str, int]) -> Optional[int]:    # int | None
    return users.get(name)

def show(v: int | str) -> str:           # 3.10+ union syntax
    return f"value={v}"

print(find("ann", {"ann": 1}), find("baji", {"ann": 1}))
print(show(5), show("x"))

# OUTPUT:
# 1 None
# value=5 value=x`],
        [`Real functions sometimes return nothing (lookup misses) or accept several input forms. Stating this explicitly forces callers to handle <code>None</code>, preventing the most common runtime error: <code>AttributeError: 'NoneType'</code>.`,
            r`def first_even(nums: list[int]) -> int | None:
    for n in nums:
        if n % 2 == 0:
            return n
    return None

r1 = first_even([1, 3])
if r1 is not None:                # narrowing: checker knows r1 is int inside
    print(r1 + 1)
else:
    print("no even number")

# OUTPUT:
# no even number`],
        [`Database lookups, optional config values, function arguments with defaults of <code>None</code>, API fields that may be absent, and parsers returning either a value or an error type.`,
            r`def parse_port(raw: str | None, default: int = 8080) -> int:
    if raw is None:
        return default
    return int(raw)

print(parse_port(None), parse_port("5432"))

# OUTPUT:
# 8080 5432`],
        [`<b>Advantages:</b> makes absence visible in the signature; type narrowing with <code>isinstance</code> or <code>is None</code> keeps code safe; unions model sum types.`,
            r`def describe(v: int | str | list[int]) -> str:
    if isinstance(v, int):
        return "int " + str(v + 1)
    if isinstance(v, str):
        return "str " + v.upper()
    return "list " + str(sum(v))          # checker knows it is list[int] here

print(describe(1), describe("a"), describe([1, 2]))

# OUTPUT:
# int 2 str A list 3`],
        [`<b>Disadvantages:</b> every caller must handle <code>None</code>, which spreads checks through the code, and big unions force many isinstance branches.`,
            r`from typing import Optional
def get_name(u: Optional[dict]) -> str:
    return u["name"]            # checker: Value of type "dict | None" is not indexable

try:
    get_name(None)
except TypeError as e:
    print("TypeError:", e)

# OUTPUT:
# TypeError: 'NoneType' object is not subscriptable`],
        [`<b>Limitations:</b> <code>Optional[int]</code> means "may be None", not "argument may be omitted"; a parameter still needs a default to be optional. <code>X | Y</code> syntax needs Python 3.10+ at runtime (use <code>from __future__ import annotations</code> for older).`,
            r`from typing import Optional
def f(x: Optional[int]):          # no default: x is still REQUIRED
    return x

try:
    f()
except TypeError as e:
    print("TypeError:", e)

# OUTPUT:
# TypeError: f() missing 1 required positional argument: 'x'`],
        `
   Optional[int]  ==  int | None
                 ┌── int ──► use as int
   value ────────┤
                 └── None ─► must be handled   (if v is None: ...)
   narrowing:  if v is not None:  # checker treats v as int here
`,
        `Avoid returning <code>None</code> for errors in core logic: raise exceptions, or use a result type, or the null-object pattern. Reserve Optional for genuine absence, and keep unions small; if you branch on type often, consider polymorphism or a tagged union.`
    ),

    'Literal & Final': dd(
        [`<code>Literal["a", "b"]</code> restricts a value to specific constants. <code>Final</code> marks a name as a constant that must not be reassigned. Both are checked by type checkers, not by Python at runtime.`,
            r`from typing import Literal, Final

Mode = Literal["r", "w", "a"]
MAX_USERS: Final = 100

def open_file(path: str, mode: Mode) -> str:
    return f"{path} opened with {mode}"

print(open_file("x.txt", "w"))
print(MAX_USERS)

# OUTPUT:
# x.txt opened with w
# 100`],
        [`A plain <code>str</code> accepts typos like <code>"wirte"</code>. Literal limits input to the allowed values, and Final stops accidental changes to configuration constants.`,
            r`from typing import Literal
Direction = Literal["up", "down"]

def move(d: Direction) -> int:
    return 1 if d == "up" else -1

print(move("up"))
# move("left")   # checker: Argument 1 has incompatible type "Literal['left']"
print(move("left"))   # Python does not stop it at runtime

# OUTPUT:
# 1
# -1`],
        [`Function options (modes, log levels, HTTP methods), state names in state machines, discriminated unions, and constants such as limits, versions and defaults.`,
            r`from typing import Literal, get_args
Level = Literal["debug", "info", "error"]

def log(level: Level, msg: str) -> str:
    return f"[{level.upper()}] {msg}"

print(log("info", "started"))
print(get_args(Level))            # allowed values are available at runtime

# OUTPUT:
# [INFO] started
# ('debug', 'info', 'error')`],
        [`<b>Advantages:</b> precise, self-documenting APIs; IDE auto-completes the allowed values; checkers verify exhaustive <code>if/match</code> over a Literal.`,
            r`from typing import Literal
Shape = Literal["circle", "square"]

def area(shape: Shape, size: float) -> float:
    if shape == "circle":
        return round(3.14159 * size ** 2, 2)
    return size * size            # checker knows only "square" remains

print(area("circle", 2), area("square", 3))

# OUTPUT:
# 12.57 9.0`],
        [`<b>Disadvantages:</b> values must be written literally, so variables of type <code>str</code> are rejected, and long lists of choices belong in an Enum instead.`,
            r`from enum import Enum
class Color(Enum):          # better than Literal for many reusable choices
    RED = "red"
    GREEN = "green"

print(Color("red"), [c.value for c in Color])

# OUTPUT:
# Color.RED ['red', 'green']`],
        [`<b>Limitations:</b> <code>Final</code> is not enforced at runtime (only by checkers), and a Final list or dict can still be mutated; <code>Literal</code> does not check values at runtime either.`,
            r`from typing import Final
LIMIT: Final = 10
LIMIT = 99                    # checker error; Python allows it
ITEMS: Final = [1, 2]
ITEMS.append(3)               # Final does not make it immutable
print(LIMIT, ITEMS)

# OUTPUT:
# 99 [1, 2, 3]`],
        `
   x: str                 any string at all
   x: Literal["r","w"]    only these exact values  ──► typo caught by checker
   LIMIT: Final = 10      checker: no reassignment   (runtime: not enforced)
   Enum                   runtime-enforced set of named constants
`,
        `Use Literal for small closed sets at API boundaries and Enum when values need behaviour or runtime validation. Combine Final with immutable types (tuple, frozenset, <code>MappingProxyType</code>) if you truly need immutability.`
    ),

    'TypedDict': dd(
        [`<code>TypedDict</code> describes the exact keys and value types of a dictionary. At runtime it is still a plain <code>dict</code>; type checkers verify the keys and types.`,
            r`from typing import TypedDict

class Movie(TypedDict):
    title: str
    year: int

m: Movie = {"title": "Dune", "year": 2021}
print(m["title"], type(m).__name__)

# OUTPUT:
# Dune dict`],
        [`JSON payloads and configs are dicts, and a plain <code>dict[str, Any]</code> hides which keys exist. TypedDict gives fields names and types without changing the data format, and without defining a class instance.`,
            r`from typing import TypedDict

class User(TypedDict):
    id: int
    name: str

def label(u: User) -> str:
    return f"#{u['id']} {u['name']}"       # checker verifies these keys exist

print(label({"id": 7, "name": "Ann"}))

# OUTPUT:
# #7 Ann`],
        [`Typed JSON responses from APIs, config dictionaries, rows from database drivers and kwargs bundles (<code>Unpack[...]</code>).`,
            r`import json
from typing import TypedDict, NotRequired

class Address(TypedDict):
    city: str
    zip: NotRequired[str]                  # optional key (3.11+)

class Customer(TypedDict):
    name: str
    address: Address

c: Customer = json.loads('{"name": "Ann", "address": {"city": "Pune"}}')
print(c["address"]["city"], c["address"].get("zip", "n/a"))

# OUTPUT:
# Pune n/a`],
        [`<b>Advantages:</b> zero runtime cost, works directly with <code>json</code>, supports required and optional keys, inheritance, and nesting.`,
            r`from typing import TypedDict

class Base(TypedDict):
    id: int
class Item(Base, total=False):             # extra keys optional
    note: str

i: Item = {"id": 1}
print(i, Item.__required_keys__, Item.__optional_keys__)

# OUTPUT:
# {'id': 1} frozenset({'id'}) frozenset({'note'})`],
        [`<b>Disadvantages:</b> no validation at runtime and no methods or defaults; wrong data passes silently, and values are accessed with <code>["key"]</code> rather than attributes.`,
            r`from typing import TypedDict
class Movie(TypedDict):
    title: str
    year: int

bad: Movie = {"title": 123}          # wrong type and missing key; no runtime error
print(bad)

# OUTPUT:
# {'title': 123}`],
        [`<b>Limitations:</b> <code>isinstance(x, Movie)</code> is not allowed, structural typing means any dict with those keys matches, and keys must be strings that are valid as identifiers (unless using the functional syntax).`,
            r`from typing import TypedDict
class Movie(TypedDict):
    title: str

try:
    isinstance({"title": "x"}, Movie)
except TypeError as e:
    print("TypeError:", e)

# OUTPUT:
# TypeError: TypedDict does not support instance and class checks`],
        `
   JSON text ──json.loads──► dict (plain)  ──annotated as──► Movie(TypedDict)
                                                  │
                      type checker verifies:  keys exist, value types match
   runtime:  still just a dict  (no validation, no cost)
`,
        `Use TypedDict to type data you do not own (JSON, third-party dicts) and dataclasses or Pydantic models for domain objects and validated input. When a payload crosses a trust boundary, validate it at runtime; the hint alone proves nothing.`
    ),
};
