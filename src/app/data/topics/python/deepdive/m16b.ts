// Module 16 (Type Hints), part B: Callable, generics, Protocol, TypeAlias.
import { dd, r, type DeepDive } from './deepDive';

export const m16b: Record<string, DeepDive> = {
    'Callable': dd(
        [`<code>Callable[[ArgTypes], ReturnType]</code> annotates anything callable: functions, lambdas, methods, classes. <code>Callable[[int, int], int]</code> is "takes two ints, returns an int". <code>Callable[..., T]</code> accepts any arguments.`,
            r`from collections.abc import Callable

def apply(fn: Callable[[int, int], int], a: int, b: int) -> int:
    return fn(a, b)

print(apply(lambda x, y: x + y, 2, 3))
print(apply(max, 7, 4))

# OUTPUT:
# 5
# 7`],
        [`Passing functions around is common (callbacks, key functions, strategies). Without a Callable hint the signature says nothing about what shape the function must have, so wrong callbacks fail only at runtime.`,
            r`from collections.abc import Callable

def run_twice(task: Callable[[], str]) -> list[str]:
    return [task(), task()]

print(run_twice(lambda: "ping"))
# run_twice(len)   # checker: len needs 1 argument, Callable[[], str] gives none

# OUTPUT:
# ['ping', 'ping']`],
        [`Event handlers, retry and cache decorators, dispatch tables, dependency injection, middleware chains and sort keys.`,
            r`from collections.abc import Callable

Handler = Callable[[str], str]
routes: dict[str, Handler] = {
    "/hi":  lambda name: f"Hello {name}",
    "/bye": lambda name: f"Bye {name}",
}
def dispatch(path: str, arg: str) -> str:
    return routes[path](arg)

print(dispatch("/hi", "Ann"), "|", dispatch("/bye", "Bob"))

# OUTPUT:
# Hello Ann | Bye Bob`],
        [`<b>Advantages:</b> documents callback contracts, enables checking of arguments and return values, and works with generics to type higher-order functions and decorators.`,
            r`from collections.abc import Callable
from typing import TypeVar

T = TypeVar("T")
def retry(fn: Callable[[], T], times: int = 3) -> T:      # returns what fn returns
    for _ in range(times - 1):
        try:
            return fn()
        except ValueError:
            pass
    return fn()

print(retry(lambda: 42))

# OUTPUT:
# 42`],
        [`<b>Disadvantages:</b> it cannot express keyword-only or named arguments, optional parameters or overloads; for those you need a Protocol with <code>__call__</code>.`,
            r`from typing import Protocol

class Formatter(Protocol):
    def __call__(self, text: str, *, upper: bool = False) -> str: ...

def shout(text: str, *, upper: bool = False) -> str:
    return text.upper() if upper else text

def use(f: Formatter) -> str:
    return f("hi", upper=True)     # keyword usage typed precisely

print(use(shout))

# OUTPUT:
# HI`],
        [`<b>Limitations:</b> nothing is checked at runtime; a Callable is only a promise. Decorators that preserve the wrapped signature need <code>ParamSpec</code>.`,
            r`from collections.abc import Callable

def call(fn: Callable[[int], int]) -> int:
    return fn(1)

try:
    call(lambda a, b: a + b)       # wrong arity: checker rejects, Python only fails at call time
except TypeError as e:
    print("TypeError:", e)

# OUTPUT:
# TypeError: <lambda>() missing 1 required positional argument: 'b'`],
        `
   Callable[[int, str], bool]
             └─params──┘  └return┘
   accepts:  def f(a: int, b: str) -> bool     lambda a, b: True
             SomeClass.method (bound)          class with __call__
   Callable[..., Any]  = "any callable at all"
`,
        `Use Callable for simple callbacks and a Protocol with <code>__call__</code> when parameter names, keywords or defaults matter. In decorators use <code>ParamSpec</code> + <code>TypeVar</code> so wrapped signatures remain visible to tooling.`
    ),

    'TypeVar & Generics': dd(
        [`A <b>TypeVar</b> is a placeholder type that links input and output types: <code>def first(xs: list[T]) -> T</code> means "returns the same type that the list holds". <code>Generic[T]</code> (or the 3.12 syntax <code>class Box[T]</code>) makes a class parameterised over a type.`,
            r`from typing import TypeVar, Generic

T = TypeVar("T")

def first(items: list[T]) -> T:
    return items[0]

class Box(Generic[T]):
    def __init__(self, item: T) -> None:
        self.item = item
    def get(self) -> T:
        return self.item

print(first([10, 20]), first(["a", "b"]))
print(Box("hello").get(), Box(3.5).get())

# OUTPUT:
# 10 a
# hello 3.5`],
        [`Without generics you must choose between <code>Any</code> (no checking) and a separate function per type. A TypeVar keeps one implementation while the checker still knows exactly what comes out.`,
            r`from typing import TypeVar
T = TypeVar("T")

def pick(a: T, b: T, flag: bool) -> T:
    return a if flag else b

x = pick(1, 2, True)             # checker infers int
y = pick("a", "b", False)        # checker infers str
print(x, y)

# OUTPUT:
# 1 a`],
        [`Typed containers (Stack, Repository, Cache, Result), utility functions (<code>first</code>, <code>chunk</code>, <code>merge</code>), and framework base classes such as <code>Repository[User]</code>.`,
            r`from typing import TypeVar, Generic

T = TypeVar("T")
class Stack(Generic[T]):
    def __init__(self) -> None:
        self._items: list[T] = []
    def push(self, x: T) -> None:
        self._items.append(x)
    def pop(self) -> T:
        return self._items.pop()

s = Stack[int]()                 # a stack of ints
s.push(1); s.push(2)
print(s.pop(), s.pop())

# OUTPUT:
# 2 1`],
        [`<b>Advantages:</b> reusable and type-safe at once; bounds and constraints restrict allowed types; the call site gets precise inference.`,
            r`from typing import TypeVar

Number = TypeVar("Number", int, float)            # constrained: only int or float
def add(a: Number, b: Number) -> Number:
    return a + b

class HasLen:
    def __len__(self): return 3
S = TypeVar("S", bound=HasLen)                    # bound: must be a HasLen (or subclass)
def longest(a: S, b: S) -> S:
    return a if len(a) >= len(b) else b

print(add(1, 2), add(1.5, 2.5), type(longest(HasLen(), HasLen())).__name__)

# OUTPUT:
# 3 4.0 HasLen`],
        [`<b>Disadvantages:</b> variance (covariant, contravariant, invariant) is hard to learn, and generic signatures can become hard to read.`,
            r`from typing import TypeVar, Generic

T_co = TypeVar("T_co", covariant=True)       # read-only containers can be covariant
class ReadOnlyBox(Generic[T_co]):
    def __init__(self, item: T_co) -> None:
        self._item = item
    def get(self) -> T_co:
        return self._item

b: ReadOnlyBox[float] = ReadOnlyBox[int](5)  # OK because covariant (a list[int] -> list[float] is not)
print(b.get())

# OUTPUT:
# 5`],
        [`<b>Limitations:</b> type arguments are erased at runtime (<code>Box[int]</code> and <code>Box[str]</code> are the same class), and you cannot create instances of <code>T</code> or check <code>isinstance(x, T)</code>.`,
            r`from typing import TypeVar, Generic
T = TypeVar("T")
class Box(Generic[T]):
    pass

print(type(Box[int]()) is type(Box[str]()))
try:
    isinstance(1, T)
except TypeError as e:
    print("TypeError:", e)

# OUTPUT:
# True
# TypeError: isinstance() arg 2 must be a type, a tuple of types, or a union`],
        `
   def first(xs: list[T]) -> T
                  │         ▲
        list[int] ─┘         └─ checker binds T = int  ──► returns int
        list[str] ──────────────────────────  T = str  ──► returns str
   Box[T] : one class definition, many checked specialisations (erased at runtime)
`,
        `Use generics for containers and algorithms where input and output types are linked; do not over-generalise business code. Prefer <code>Protocol</code> bounds to nominal ones, and learn variance before writing public generic libraries. In 3.12+ prefer the new <code>def f[T](x: T)</code> syntax.`
    ),

    'Protocol': dd(
        [`A <b>Protocol</b> defines a type by its <i>shape</i> (methods and attributes) instead of its inheritance. Any class with the right methods satisfies it, with no base class: this is static "duck typing".`,
            r`from typing import Protocol

class Speaker(Protocol):
    def speak(self) -> str: ...

class Dog:                         # does NOT inherit Speaker
    def speak(self) -> str: return "Woof"
class Robot:
    def speak(self) -> str: return "Beep"

def announce(s: Speaker) -> None:
    print(s.speak())

announce(Dog()); announce(Robot())

# OUTPUT:
# Woof
# Beep`],
        [`Inheritance couples classes to a base you may not control (third-party code). A Protocol lets your function accept anything that behaves correctly while a checker still verifies the methods exist.`,
            r`from typing import Protocol

class Closeable(Protocol):
    def close(self) -> None: ...

def shutdown(*resources: Closeable) -> None:
    for r_ in resources:
        r_.close()

import io
shutdown(io.StringIO(), io.BytesIO())      # stdlib classes match without inheriting
print("closed all")

# OUTPUT:
# closed all`],
        [`Dependency injection and test doubles, plug-in interfaces, repository and gateway abstractions in clean architecture, and typing for libraries that accept "file-like" objects.`,
            r`from typing import Protocol

class Notifier(Protocol):
    def send(self, to: str, msg: str) -> bool: ...

class FakeNotifier:                         # test double: no base class needed
    def __init__(self): self.sent = []
    def send(self, to: str, msg: str) -> bool:
        self.sent.append((to, msg)); return True

def welcome(n: Notifier, user: str) -> bool:
    return n.send(user, "Welcome!")

fake = FakeNotifier()
print(welcome(fake, "ann"), fake.sent)

# OUTPUT:
# True [('ann', 'Welcome!')]`],
        [`<b>Advantages:</b> decoupled design, no inheritance needed, ideal for tests and third-party types, and <code>@runtime_checkable</code> allows isinstance checks of method presence.`,
            r`from typing import Protocol, runtime_checkable

@runtime_checkable
class Sized2(Protocol):
    def __len__(self) -> int: ...

print(isinstance([1, 2], Sized2), isinstance(5, Sized2))

# OUTPUT:
# True False`],
        [`<b>Disadvantages:</b> structural matching can accept a class that has the right method names but different meaning, and error messages from checkers on protocol mismatches can be long.`,
            r`from typing import Protocol

class Stoppable(Protocol):
    def stop(self) -> None: ...

class Bus:
    def stop(self) -> None:                 # same name, unrelated meaning
        print("bus stops at the station")

def halt(x: Stoppable) -> None:
    x.stop()

halt(Bus())            # type-checks: structurally compatible

# OUTPUT:
# bus stops at the station`],
        [`<b>Limitations:</b> Protocols are not enforced at runtime; <code>runtime_checkable</code> checks only that attribute names exist (not signatures), and non-method protocols cannot be used with <code>issubclass</code>.`,
            r`from typing import Protocol, runtime_checkable

@runtime_checkable
class Adder(Protocol):
    def add(self, a: int, b: int) -> int: ...

class Wrong:
    def add(self) -> str:            # different signature, same name
        return "?"

print(isinstance(Wrong(), Adder))    # True: only the name is checked

# OUTPUT:
# True`],
        `
   nominal (ABC):    class Dog(Animal)    ──► must inherit
   structural:       class Dog:           ──► has speak() -> str ✓
                                              │
   Protocol Speaker { speak() -> str } ◄──────┘ matches by SHAPE
   checker: "Dog is a Speaker"  (no base class, no registration)
`,
        `Define Protocols at the consumer side (small, role-based interfaces: Interface Segregation) and keep them narrow. Use ABCs when you need shared implementation or runtime enforcement. Protocols make hexagonal architectures and unit tests cheap.`
    ),

    'TypeAlias': dd(
        [`A <b>type alias</b> gives a complex type a short, meaningful name. <code>UserId = int</code> or, explicitly, <code>UserId: TypeAlias = int</code>; Python 3.12 adds the <code>type</code> statement: <code>type Point = tuple[float, float]</code>.`,
            r`from typing import TypeAlias

Point: TypeAlias = tuple[float, float]
Polygon: TypeAlias = list[Point]
JSON: TypeAlias = dict[str, "JSON"] | list["JSON"] | str | int | float | bool | None

def perimeter_points(poly: Polygon) -> int:
    return len(poly)

print(perimeter_points([(0.0, 0.0), (1.0, 0.0), (0.0, 1.0)]))

# OUTPUT:
# 3`],
        [`Long signatures such as <code>dict[str, list[tuple[int, float]]]</code> are unreadable. An alias names the idea, documents intent, and lets you change the definition in one place.`,
            r`from typing import TypeAlias

Matrix: TypeAlias = list[list[float]]
Row: TypeAlias = list[float]

def transpose(m: Matrix) -> Matrix:
    return [list(col) for col in zip(*m)]

print(transpose([[1.0, 2.0], [3.0, 4.0]]))

# OUTPUT:
# [[1.0, 3.0], [2.0, 4.0]]`],
        [`Domain vocabulary in APIs (<code>Headers</code>, <code>Json</code>, <code>Callback</code>), shared definitions across modules, and recursive types such as JSON or tree nodes.`,
            r`from collections.abc import Callable
from typing import TypeAlias

Headers: TypeAlias = dict[str, str]
Middleware: TypeAlias = Callable[[Headers], Headers]

def add_auth(h: Headers) -> Headers:
    return {**h, "Authorization": "Bearer x"}

def run(chain: list[Middleware], h: Headers) -> Headers:
    for mw in chain:
        h = mw(h)
    return h

print(run([add_auth], {"Accept": "json"}))

# OUTPUT:
# {'Accept': 'json', 'Authorization': 'Bearer x'}`],
        [`<b>Advantages:</b> readability, one definition to maintain, easier refactoring, and recursive aliases (via string forward references or the 3.12 <code>type</code> statement).`,
            r`from typing import TypeAlias
Pair: TypeAlias = tuple[str, int]
pairs: list[Pair] = [("a", 1), ("b", 2)]
print(Pair, pairs)           # an alias is just the type object itself

# OUTPUT:
# tuple[str, int] [('a', 1), ('b', 2)]`],
        [`<b>Disadvantages:</b> an alias hides structure (readers must look it up), and it does not create a new type, so mixing meanings such as user IDs and order IDs is not caught.`,
            r`from typing import TypeAlias
UserId: TypeAlias = int
OrderId: TypeAlias = int

def cancel(order: OrderId) -> str:
    return f"cancelled {order}"

uid: UserId = 5
print(cancel(uid))           # accepted: aliases are interchangeable (use NewType to separate)

# OUTPUT:
# cancelled 5`],
        [`<b>Limitations:</b> plain aliases do not give distinct types (use <code>NewType</code> for that), the <code>type</code> statement needs Python 3.12+, and aliases are erased at runtime so they cannot be used in <code>isinstance</code>.`,
            r`from typing import NewType, TypeAlias
UserId = NewType("UserId", int)       # a distinct type for the checker
Alias: TypeAlias = int

print(UserId(7) + 1, isinstance(3, Alias))
# cancel_user(7)   # checker: expected UserId, got int

# OUTPUT:
# 8 True`],
        `
   dict[str, list[tuple[int, float]]]      ◄── hard to read
        │  name it
        ▼
   Series: TypeAlias = list[tuple[int, float]]
   Dataset: TypeAlias = dict[str, Series]  ◄── intent is clear
   alias = another NAME for the type (not a new type); NewType = a new type
`,
        `Alias shared shapes at module boundaries and keep names domain-oriented. When values with the same representation must not be mixed (IDs, currencies), use <code>NewType</code> or small dataclasses. Prefer the 3.12 <code>type</code> statement for new projects needing lazy and recursive aliases.`
    ),
};
